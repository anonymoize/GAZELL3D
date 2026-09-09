import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { settle } from './harness.mjs';

const bundle = fs.readFileSync(new URL('../GAZELL3D.user.js', import.meta.url), 'utf8');
async function openSettings(t, stored = {}) {
  const dom = new JSDOM('<!doctype html><html><body><footer><section class="footer__section"><p>Torrenting - Modernized</p></section></footer></body></html>', { url: 'https://aither.cc', runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  const w = dom.window, d = w.document, writes = [];
  w.GM_getValue = (key, fallback) => stored[key] ?? fallback;
  w.GM_setValue = (key, value) => writes.push([key, value]);
  w.GM_addStyle = () => {};
  w.eval(bundle); await settle();
  const opener = d.querySelector('.gz-config-link'); opener.focus(); opener.click();
  const click = text => [...d.querySelectorAll('.gz-config-modal button')].find(b => b.textContent === text).click();
  return { w, d, writes, click, opener };
}

test('settings cancel isolates draft changes, restores focus and background state', async t => {
  const h = await openSettings(t);
  assert.equal(h.d.querySelector('[role="dialog"]').getAttribute('aria-modal'), 'true');
  assert.equal(h.d.querySelector('footer').inert, true);
  assert.equal(h.d.body.style.overflow, 'hidden');
  h.d.querySelector('#gz-option-enableSideLayout').click();
  h.click('Torrent names');
  h.d.querySelector('[aria-label="Move Video Codec down"]').click();
  h.click('Cancel');
  assert.equal(h.d.querySelector('.gz-config-overlay'), null);
  assert.deepEqual(h.writes, []);
  assert.equal(h.d.activeElement, h.opener);
  assert.equal(h.d.body.style.overflow, '');
  h.opener.click();
  assert.equal(h.d.querySelector('#gz-option-enableSideLayout').checked, true);
  assert.equal(h.d.querySelector('.gz-sequence-item').dataset.key, 'videoCodec');
  h.w.document.dispatchEvent(new h.w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal(h.d.querySelector('.gz-config-overlay'), null);
});

test('settings preview reflects colors, component visibility and accessible reordering', async t => {
  const h = await openSettings(t);
  h.click('Torrent names');
  h.d.querySelector('[aria-label="Move Video Codec down"]').click();
  assert.equal(h.d.querySelector('.gz-sequence-item').dataset.key, 'bitDepth');
  assert.equal(h.d.activeElement.getAttribute('aria-label'), 'Move Video Codec down');
  assert.match(h.d.querySelector('.gz-config-preview-name').textContent, /^10-bitH.265/);
  h.d.querySelector('[data-key="videoCodec"] input').click();
  assert.doesNotMatch(h.d.querySelector('.gz-config-preview-name').textContent, /H.265/);
  h.click('Component colors');
  const swatch = h.d.querySelector('.gz-config-color input');
  swatch.value = '#ff0000'; swatch.dispatchEvent(new h.w.Event('input', { bubbles: true }));
  h.click('Torrent names'); h.click('Reset component order');
  assert.equal(h.d.querySelector('.gz-config-preview-name span').style.color, 'rgb(255, 0, 0)');
  h.click('Component colors'); h.d.querySelector('#gz-option-enableComponentColors').click();
  assert.equal(h.d.querySelector('.gz-config-preview-name span').style.color, '');
});

test('settings validate before writing and preserve unrelated saved config', async t => {
  const h = await openSettings(t, { gz_config: JSON.stringify({ futureOption: 'preserve', baseFontSize: 87 }), gz_api_key: 'existing-key' });
  const font = h.d.querySelector('#gz-option-baseFontSize');
  font.value = '201'; h.click('Save & reload');
  assert.deepEqual(h.writes, []);
  assert.equal(h.d.activeElement, font);
  font.value = '95';
  h.click('API connection');
  assert.equal(h.d.querySelector('#gz-api-key-input').type, 'password');
  h.click('Show'); assert.equal(h.d.querySelector('#gz-api-key-input').type, 'text');
  h.d.querySelector('#gz-api-key-input').value = ' new-key ';
  h.click('Torrent names');
  h.d.querySelector('[aria-label="Move Video Codec down"]').click();
  h.d.querySelector('[data-key="hdr"] input').click();
  h.click('Save & reload');
  const values = Object.fromEntries(h.writes);
  assert.equal(JSON.parse(values.gz_config).baseFontSize, 95);
  assert.equal(JSON.parse(values.gz_config).futureOption, 'preserve');
  assert.equal(values.gz_api_key, 'new-key');
  assert.equal(JSON.parse(values.gz_sequence_v2).order[0], 'bitDepth');
  assert.deepEqual(JSON.parse(values.gz_sequence_v2).disabled, ['hdr']);
  assert.equal(h.d.querySelector('.gz-config-overlay'), null);
});

test('settings retain the draft on storage failure and contain keyboard focus', async t => {
  const h = await openSettings(t);
  const close = h.d.querySelector('.gz-config-close');
  close.focus();
  close.dispatchEvent(new h.w.KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }));
  assert.equal(h.d.activeElement.textContent, 'Save & reload');
  h.d.activeElement.dispatchEvent(new h.w.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
  assert.equal(h.d.activeElement, close);
  h.w.console.error = () => {};
  h.w.GM_setValue = () => { throw new Error('storage unavailable'); };
  h.click('Save & reload');
  assert.ok(h.d.querySelector('.gz-config-overlay'));
  assert.match(h.d.querySelector('[role="status"]').textContent, /Could not save/);
});

test('top bar selection stays in the draft and saves with existing preferences', async t => {
  const h = await openSettings(t);
  const selector = () => h.d.querySelector('#gz-option-topBarLayout');
  assert.equal(selector().value, 'default');
  selector().value = 'compact';
  h.click('Cancel');
  assert.deepEqual(h.writes, []);
  h.opener.click();
  assert.equal(selector().value, 'default');
  selector().value = 'spacious';
  h.click('Save & reload');
  assert.equal(JSON.parse(Object.fromEntries(h.writes).gz_config).topBarLayout, 'spacious');
});
