import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { settle } from './harness.mjs';

const bundle = fs.readFileSync(new URL('../GAZELL3D.user.js', import.meta.url), 'utf8');
const footer = '<footer><section class="footer__section"><p>Torrenting - Modernized</p></section></footer>';
const sourceRow = '<tr><td class="similar-torrents__type">WEB-DL</td><td><span class="torrent-search--grouped__name"><a href="/torrents/7">Example 2024 1080p WEB-DL H264-Group</a></span><ul class="torrent-icons"><li class="torrent-icons__internal">Internal</li></ul></td></tr>';
const grouped = `<main class="page__torrent-similar--index"><article><ul><li class="meta__tmdb"><a class="meta-id-tag" title="TMDB: 10"></a></li></ul><section class="panelV2" x-data="torrentGroup"><header class="panel__header"></header><div class="data-table-wrapper"><table class="similar-torrents__torrents"><tbody>${sourceRow}</tbody></table></div></section></article></main>`;
const search = '<main class="page__torrent--index"><table><tbody><tr class="torrent-search--list__row"><td><a class="torrent-search--list__name" href="/torrents/7">Example 2024 1080p WEB-DL H264-Group</a></td></tr></tbody></table></main>';
async function boot(t, markup, config = {}) {
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
    if (options.url.includes('trumping-reports/filter')) { options.onload({ status: 200, responseText: '{"data":[]}' }); return; }
    const data = options.url.includes('/torrents/filter') ? { data: [torrent] } : { data: torrent };
    options.onload({ status: 200, responseText: JSON.stringify(data) });
  };
  window.eval(bundle); await settle(); await settle();
  return { window, document: window.document, requests, errors, media };
}

test('built userscript boots search with bundled catalog without requests and opens a complete dropdown', async t => {
  const h = await boot(t, search.replace('WEB-DL H264-Group', 'AMZN WEB-DL H264-NTb'), { enableGazellifySearch: true });
  assert.deepEqual(h.requests, []);
  assert.match(h.document.querySelector('.gz-search-title__subheading').textContent, /AMZN/);
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

const mediahubRow = (id, type = '') => `<tr>${type}<td class="torrent-search--grouped__overview"><h3 class="torrent-search--grouped__name"><a href="/torrents/${id}">S00E53 1080p DSNP WEB-DL Dual-Audio DD+ 5.1 H.264-LADYBUG</a></h3><ul class="torrent-icons"><li data-seadex="yes">Seadex</li></ul></td><td>1 GiB</td></tr>`;
const mediahub = `<main class="page__torrent--index"><article class="torrent-search--grouped__result"><details open><summary>Specials</summary><table class="torrent-search--grouped__torrents"><tbody>${mediahubRow(7, '<th class="torrent-search--grouped__type" rowspan="2">WEB-DL</th>')}${mediahubRow(8)}</tbody></table></details></article></main>`;

test('Mediahub formats grouped releases and keeps spanning types aligned through concurrent dropdowns', async t => {
  const h = await boot(t, mediahub, { enableGazellifySearch: true });
  const links = [...h.document.querySelectorAll('.torrent-search--grouped__name > a')];
  const type = h.document.querySelector('.torrent-search--grouped__type');
  assert.deepEqual(h.requests, []);
  assert.match(links[0].querySelector('.gz-search-title__subheading').textContent, /S00E53/);
  assert.match(links[0].querySelector('.gz-hidden-original').textContent, /LADYBUG/);
  links[0].click(); links[1].click(); await settle(); await settle();
  assert.equal(type.rowSpan, 4);
  assert.deepEqual([...h.document.querySelectorAll('.gz-dropdown-row td')].map(cell => cell.colSpan), [2, 2]);
  links[0].click(); assert.equal(type.rowSpan, 3);
  links[1].closest('tr').remove(); await settle();
  assert.equal(type.rowSpan, 2);
  assert.equal(h.document.querySelectorAll('.gz-dropdown-row').length, 0);
  const tbody = h.document.querySelector('tbody');
  tbody.insertAdjacentHTML('beforeend', mediahubRow(9)); await settle();
  const late = tbody.querySelector('a[href="/torrents/9"]');
  assert.ok(late.querySelector('.gz-search-title'));
  assert.equal(late.dataset.gzSearchDropdown, '1');
  assert.deepEqual(h.errors, []);
});

test('Mediahub dropdowns work with naming disabled and naming works with dropdowns disabled', async t => {
  const dropdowns = await boot(t, mediahub, { enableGazellifySearch: false });
  assert.equal(dropdowns.document.querySelectorAll('.gz-search-title').length, 0);
  dropdowns.document.querySelector('.torrent-search--grouped__name > a').click(); await settle();
  assert.ok(dropdowns.document.querySelector('.gz-dropdown-container'));
  const names = await boot(t, mediahub, { enableGazellifySearch: true, enableTorrentDropdowns: false });
  assert.equal(names.document.querySelectorAll('.gz-search-title').length, 2);
  assert.equal(names.document.querySelectorAll('.gz-clickable').length, 0);
});

test('Mediahub layout flattens nested groups, limits long lists and preserves live controls', async t => {
  const groups = Array.from({ length: 18 }, (_, i) => `<details class="torrent-search--grouped__dropdown"><summary>Episode ${i + 1}</summary><table class="torrent-search--grouped__torrents"><tbody>${mediahubRow(i + 7)}</tbody></table></details>`).join('');
  const markup = `<main class="page__torrent--index"><article class="torrent-search--grouped__result"><header class="torrent-search--grouped__header">Example</header><section><details class="torrent-search--grouped__dropdown"><summary>Season 1</summary>${groups}</details></section></article></main>`;
  const h = await boot(t, markup, { enableSideLayout: true, enableGazellifySearch: false, enableTorrentDropdowns: false });
  const article = h.document.querySelector('.gz-mediahub');
  assert.ok(article.classList.contains('gz-mediahub--poster'));
  assert.equal(article.querySelectorAll('details:not([open])').length, 0);
  assert.equal(article.querySelectorAll('table:not(.gz-mediahub-hidden)').length, 15);
  const original = article.querySelector('.torrent-icons li');
  let clicks = 0; original.addEventListener('click', () => clicks++);
  const button = article.querySelector('.gz-mediahub-more');
  button.click(); await settle();
  assert.equal(article.querySelectorAll('table:not(.gz-mediahub-hidden)').length, 18);
  assert.equal(button.getAttribute('aria-expanded'), 'true');
  assert.equal(article.querySelector('.torrent-icons li'), original); original.click(); assert.equal(clicks, 1);
  button.click(); await settle();
  assert.equal(article.querySelectorAll('table:not(.gz-mediahub-hidden)').length, 15);
  assert.equal(article.querySelectorAll('.gz-mediahub-more').length, 1);
  article.querySelector('section').insertAdjacentHTML('beforeend', '<details class="torrent-search--grouped__dropdown"><summary>Complete pack</summary><table class="torrent-search--grouped__torrents"><tbody>' + mediahubRow(99) + '</tbody></table></details>');
  await settle(); assert.match(button.textContent, /19/);
  assert.deepEqual(h.errors, []);
});

test('Mediahub layout respects the table setting independently of naming', async t => {
  const h = await boot(t, mediahub, { enableGazelleTorrentLayout: false, enableGazellifySearch: true });
  assert.equal(h.document.querySelector('.gz-mediahub'), null);
  assert.ok(h.document.querySelector('.gz-search-title'));
});
