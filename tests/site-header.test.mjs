import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { settle } from './harness.mjs';

const bundle = fs.readFileSync(new URL('../GAZELL3D.user.js', import.meta.url), 'utf8');
for (const layout of [undefined, 'default', 'compact', 'spacious', 'invalid']) {
  test(`site header on forums preserves host controls with ${layout}`, async t => {
    const dom = new JSDOM('<header><nav class="top-nav" x-data="{ expanded: false }"><div class="top-nav__left"><input value="existing search"></div><a href="/forums">Forums</a></nav><nav class="secondary-nav">Topics</nav></header><main class="page__forum--index"></main><footer><section class="footer__section"><p>Torrenting - Modernized</p></section></footer>', { url: 'https://aither.cc/forums', runScripts: 'outside-only' });
    t.after(() => dom.window.close());
    const w = dom.window, d = w.document;
    w.GM_getValue = (key, fallback) => key === 'gz_config' ? JSON.stringify({ topBarLayout: layout }) : fallback;
    w.GM_addStyle = () => {};
    w.GM_xmlhttpRequest = () => assert.fail('Header must not request API data');
    const header = d.querySelector('header'), markup = header.innerHTML, link = header.querySelector('a');
    let clicked = false;
    link.addEventListener('click', e => { clicked = true; e.preventDefault(); });
    w.eval(bundle); await settle();
    assert.equal(d.documentElement.dataset.gzTopBar, ['compact', 'spacious'].includes(layout) ? layout : undefined);
    assert.equal(header.innerHTML, markup);
    assert.equal(header.querySelector('a'), link);
    link.click(); assert.equal(clicked, true);
    assert.equal(header.querySelector('input').value, 'existing search');
    d.querySelector('.gz-config-link').click();
    assert.equal(d.querySelector('#gz-option-topBarLayout').value, ['compact', 'spacious'].includes(layout) ? layout : 'default');
  });
}

test('custom headers use the rendered page color when the theme variable is stale', async t => {
  const dom = new JSDOM('<style>:root { --body-bg: #232323; } body { background: #1a1e2a; }</style><body></body>', { url: 'https://aither.cc/forums', runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  const w = dom.window;
  w.GM_getValue = (key, fallback) => key === 'gz_config' ? JSON.stringify({ topBarLayout: 'compact' }) : fallback;
  w.GM_addStyle = () => {};
  w.eval(bundle); await settle();
  assert.equal(w.document.documentElement.style.getPropertyValue('--gz-header-bg'), 'rgb(26, 30, 42)');
  w.document.body.style.backgroundColor = '#f5f5f5';
  await settle();
  assert.equal(w.document.documentElement.style.getPropertyValue('--gz-header-bg'), 'rgb(245, 245, 245)');
});

test('header labels retain stat values and quick links use native safe destinations', async t => {
  const dom = new JSDOM(`<nav class="top-nav"><ul class="top-nav__ratio-bar"><li class="ratio-bar__uploaded"><a href="/users/member/uploads"><i></i>2 TiB</a></li></ul><ul class="top-nav__main-menus"><li><a href="/torrents/create">Upload</a><a href="/requests">Requests</a><a href="https://example.com">Forums</a></li></ul></nav>`, { url: 'https://aither.cc/forums', runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  const w = dom.window, d = w.document;
  w.GM_getValue = (key, fallback) => key === 'gz_config' ? JSON.stringify({ topBarLayout: 'spacious' }) : fallback;
  w.GM_addStyle = () => {};
  const stat = d.querySelector('.ratio-bar__uploaded a');
  w.eval(bundle); await settle();
  assert.equal(d.querySelector('.ratio-bar__uploaded a'), stat);
  assert.equal(stat.textContent, 'Up: 2 TiB');
  assert.equal(d.querySelector('.gz-header-actions a').href, 'https://aither.cc/torrents/create');
  assert.equal(d.querySelectorAll('.gz-header-actions a').length, 2);
  const late = d.createElement('li'); late.className = 'ratio-bar__seeding'; late.textContent = '42';
  d.querySelector('.top-nav__ratio-bar').append(late); await settle();
  assert.equal(late.textContent, 'Seeding: 42');
  assert.equal(d.querySelectorAll('.gz-header-actions').length, 1);
  assert.equal(stat.querySelectorAll('.gz-header-stat-label').length, 1);
});
