import test from 'node:test';
import assert from 'node:assert/strict';
import { harness, deferred, settle } from './harness.mjs';

function setup(t) {
  const h = harness('<table><tbody><tr id="row"><td><a href="/torrents/1">Release</a></td></tr></tbody></table>');
  t.after(() => h.window.close());
  const row = h.document.querySelector('#row'), link = row.querySelector('a');
  return { ...h, row, link, click: options => link.dispatchEvent(new h.window.MouseEvent('click', { bubbles: true, cancelable: true, ...options })) };
}

test('dropdown close and reopen ignores old requests and enriches only the current row', async t => {
  const h = setup(t), requests = [deferred(), deferred()]; let calls = 0, renders = 0;
  const module = h.createTorrentDropdowns({ render(data) { renders++; const node = h.document.createElement('div'); node.textContent = `${data.name}: ${data.trumpable_reason}`; return node; } });
  const options = { row: h.row, link: h.link, load: () => requests[calls++].promise, colSpan: () => 7, getTrumpableReason: () => 'better source' };
  module.attach(options); module.attach(options);
  h.click(); assert.equal(h.row.nextElementSibling.firstElementChild.colSpan, 7);
  h.click(); assert.equal(h.row.nextElementSibling, null);
  h.click(); requests[0].resolve({ name: 'stale' }); await settle();
  assert.equal(renders, 0);
  requests[1].resolve({ name: 'current' }); await settle();
  assert.equal(renders, 1); assert.equal(h.row.nextElementSibling.textContent, 'current: better source');
});

test('removing the source row prevents rendering and detach removes pending behavior', async t => {
  const h = setup(t), request = deferred(); let renders = 0;
  const module = h.createTorrentDropdowns({ render() { renders++; return h.document.createElement('div'); } });
  const detach = module.attach({ row: h.row, link: h.link, load: () => request.promise, colSpan: () => 6 });
  h.click(); h.row.remove(); request.resolve({}); await settle(); assert.equal(renders, 0);
  detach(); assert.equal(h.document.querySelector('.gz-dropdown-row'), null);
});

test('errors are literal text and retry succeeds; modifier navigation is left to the browser', async t => {
  const h = setup(t); let calls = 0;
  const module = h.createTorrentDropdowns({ render: () => h.document.createElement('section') });
  module.attach({ row: h.row, link: h.link, colSpan: () => 6, load: async () => { if (++calls === 1) throw Error('<img src=x>'); return {}; } });
  // Prevent jsdom navigation after observing whether the module canceled it.
  const prevented = [];
  h.link.addEventListener('click', event => { prevented.push(event.defaultPrevented); event.preventDefault(); });
  for (const options of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }]) h.click(options);
  assert.deepEqual(prevented, [false, false, false, false, false]); assert.equal(calls, 0);
  h.click(); await settle();
  assert.match(h.row.nextElementSibling.textContent, /<img src=x>/); assert.equal(h.row.nextElementSibling.querySelector('img'), null);
  h.click(); h.click(); await settle();
  assert.equal(calls, 2); assert.ok(h.row.nextElementSibling.querySelector('section'));
});
