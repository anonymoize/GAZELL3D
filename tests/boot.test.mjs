import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { settle, catalog } from './harness.mjs';

const bundle = fs.readFileSync(new URL('../GAZELL3D.user.js', import.meta.url), 'utf8');
const footer = '<footer><section class="footer__section"><p>Torrenting - Modernized</p></section></footer>';
const sourceRow = '<tr><td class="similar-torrents__type">WEB-DL</td><td><span class="torrent-search--grouped__name"><a href="/torrents/7">Example 2024 1080p WEB-DL H264-Group</a></span><ul class="torrent-icons"><li class="torrent-icons__internal">Internal</li></ul></td></tr>';
const grouped = `<main class="page__torrent-similar--index"><article><ul><li class="meta__tmdb"><a class="meta-id-tag" title="TMDB: 10"></a></li></ul><section class="panelV2" x-data="torrentGroup"><header class="panel__header"></header><div class="data-table-wrapper"><table class="similar-torrents__torrents"><tbody>${sourceRow}</tbody></table></div></section></article></main>`;
const search = '<main class="page__torrent--index"><table><tbody><tr class="torrent-search--list__row"><td><a class="torrent-search--list__name" href="/torrents/7">Example 2024 1080p WEB-DL H264-Group</a></td></tr></tbody></table></main>';
async function boot(t, markup, config = {}, catalogFailure = false) {
  const dom = new JSDOM(`<!doctype html><html><body>${markup}${footer}</body></html>`, { url: 'https://aither.cc/torrents/7/similar', runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  const { window } = dom;
  const requests = [], errors = [];
  window.console = { ...console, log() {}, warn() {}, error: (...args) => errors.push(args.join(' ')) };
  window.GM_getValue = (key, fallback) => key === 'gz_config' ? JSON.stringify({ enableSideLayout: false, ...config }) : key === 'gz_api_key' ? 'fixture' : fallback;
  window.GM_setValue = () => {};
  window.GM_addStyle = css => { const style = window.document.createElement('style'); style.textContent = css; window.document.head.append(style); };
  const media = 'General\nComplete name : Example.mkv\nFormat : Matroska';
  const torrent = { id: 7, attributes: { id: 7, name: 'Example', description: '[b]Description[/b]', media_info: media, uploader: 'Anonymous' } };
  window.GM_xmlhttpRequest = options => {
    requests.push(options.url);
    if (options.url.includes('raw.githubusercontent')) {
      if (catalogFailure) { options.onerror(); return; }
      options.onload({ status: 200, responseText: JSON.stringify(catalog) }); return;
    }
    if (options.url.includes('trumping-reports/filter')) { options.onload({ status: 200, responseText: '{"data":[]}' }); return; }
    const data = options.url.includes('/torrents/filter') ? { data: [torrent] } : { data: torrent };
    options.onload({ status: 200, responseText: JSON.stringify(data) });
  };
  window.eval(bundle); await settle(); await settle();
  return { window, document: window.document, requests, errors, media };
}

test('built userscript boots search during a catalog outage and opens a complete dropdown', async t => {
  const h = await boot(t, search, { enableGazellifySearch: true }, true);
  assert.ok(h.document.querySelector('.gz-config-link'));
  const link = h.document.querySelector('.torrent-search--list__name');
  assert.ok(link.querySelector('.gz-search-title')); assert.ok(link.querySelector('.gz-hidden-original'));
  link.click(); await settle(); await settle();
  assert.ok(h.document.querySelector('.gz-dropdown-container'));
  const mediaTab = h.document.querySelector('[data-tab="mediainfo"]'); assert.ok(mediaTab); mediaTab.click();
  assert.equal(h.document.querySelector('.gz-dropdown-panel.active').dataset.rawContent, h.media);
  assert.equal(h.requests.filter(url => url.includes('/api/torrents/7')).length, 1);
  assert.deepEqual(h.errors, []);
});

test('built userscript boots grouped rows, preserves late icons and uses group retrieval', async t => {
  const h = await boot(t, grouped);
  assert.equal(h.document.querySelectorAll('.gz-torrent-table').length, 1);
  const original = h.document.querySelector('.similar-torrents__torrents .torrent-icons');
  const late = h.document.createElement('li'); late.dataset.seadex = 'yes'; let clicks = 0; late.addEventListener('click', () => clicks++); original.append(late);
  await settle(); assert.equal(late.parentNode.className, 'gz-torrent-icons'); late.click(); assert.equal(clicks, 1);
  h.document.querySelector('.torrent-name-link').click(); await settle(); await settle();
  assert.ok(h.document.querySelector('.gz-dropdown-container'));
  assert.equal(h.requests.filter(url => url.includes('/api/torrents/filter')).length, 1);
  assert.equal(h.document.querySelector('.gz-dropdown-row td').colSpan, 7);
  assert.deepEqual(h.errors, []);
});

test('built userscript keeps detail tags as hidden direct children and preserves Seadex identity', async t => {
  const detail = '<main class="page__torrent--show"><article><ul class="torrent__tags"><li>Tag</li></ul><section class="meta"><div class="meta__description">Synopsis</div></section></article></main>';
  const h = await boot(t, detail, { enableSideLayout: true });
  const original = h.document.querySelector('article > .torrent__tags');
  assert.ok(original); assert.equal(original.style.display, 'none');
  const icon = h.document.createElement('li'); icon.innerHTML = '<span data-seadex="detail">Seadex</span>'; original.append(icon);
  await settle(); assert.ok(icon.parentNode.classList.contains('gz-visible-tags'));
  assert.deepEqual(h.errors, []);
});
