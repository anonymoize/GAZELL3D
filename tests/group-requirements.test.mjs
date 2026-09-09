import test from 'node:test';
import assert from 'node:assert/strict';
import { harness } from './harness.mjs';

const group = title => `<div class="group-requirements__group-wrapper"><header class="group-requirements__group--header"><h3><span>${title}</span></h3></header></div>`;
const section = (name, titles) => `<section class="group-requirements__path-wrapper"><h3>${name}</h3>${titles.map(group).join('')}</section>`;

test('class paths stay separate, shared entry classes appear once, and static groups remain outside paths', t => {
  const h = harness(`<main><article>${section('Main path', ['Phobos', 'Harmonia', 'Zeus'])}${section('Uploader path', ['Phobos', 'Harmonia', 'Selene'])}${section('Static groups', ['Contributor'])}</article></main>`);
  t.after(() => h.window.close());
  const page = h.document.querySelector('main');
  assert.equal(h.buildGroupRequirementsLayout(page), true);
  const paths = [...page.querySelectorAll('.gz-req-v2-path')];
  const titles = node => [...node.querySelectorAll('.gz-req-v2-rank__title')].map(e => e.textContent);
  assert.equal(paths.length, 2);
  assert.deepEqual(titles(paths[0]), ['Phobos', 'Harmonia', 'Zeus']);
  assert.deepEqual(titles(paths[1]), ['Selene']);
  assert.deepEqual(titles(page.querySelector('.gz-req-v2-group-section')), ['Contributor']);
  assert.equal(page.querySelector('.gz-req-v2-summary').textContent, '5 classes / 3 sections');
  const original = page.querySelector('.gz-req-v2');
  h.buildGroupRequirementsLayout(page);
  assert.equal(page.querySelector('.gz-req-v2'), original);
});

test('collapsed and expanded perks are shown as text under Additional Perks', t => {
  const perks = `<div class="group-requirements__group--perks-wrapper is-collapsed">
    <div class="group-requirements__perk" title="DL slots: 4"><i class="fas fa-download"></i><span style="display:none">DL slots: 4</span></div>
    <div class="group-requirements__perk" title="Upload Torrents"><i class="fas fa-upload"></i></div>
    <div class="group-requirements__perk-extended" title="Send invite">Send invite</div>
    <div class="group-requirements__perk group-requirements__perk-extended" title="Forum access">Forum access</div>
    <div class="group-requirements__perk" title="&lt;img src=x onerror=alert(1)&gt;"></div>
  </div>`;
  const markup = group('Phobos').replace('</header>', `</header>${perks}`);
  const h = harness(`<main><article><section class="group-requirements__path-wrapper"><h3>Main path</h3>${markup}</section></article></main>`);
  t.after(() => h.window.close());
  h.buildGroupRequirementsLayout(h.document.querySelector('main'));
  const panel = h.document.querySelector('.gz-req-v2-panel--perks');
  assert.deepEqual([...panel.querySelectorAll('.gz-req-v2-perk')].map(e => e.textContent),
    ['DL slots: 4', 'Upload Torrents', 'Send invite', 'Forum access', '<img src=x onerror=alert(1)>']);
  assert.equal(panel.querySelector('img'), null);
  assert.equal(panel.querySelector('.gz-req-v2-empty'), null);
});
