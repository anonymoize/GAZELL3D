import test from 'node:test';
import assert from 'node:assert/strict';
import { harness, settle } from './harness.mjs';

function setup(t) {
  const h = harness('<article><ul id="source"><li class="torrent-icons__internal">Internal</li><li class="torrent-icons__comments">Comment</li><li class="other">Other</li></ul><ul id="visible"></ul></article>');
  t.after(() => h.window.close());
  return { ...h, source: h.document.querySelector('#source'), target: h.document.querySelector('#visible'), root: h.document.querySelector('article') };
}

test('initial and late nested Seadex icons move with event identity and ordinary icons remain cloned', async t => {
  const h = setup(t), module = h.createLiveTorrentIcons(); let clicks = 0;
  const initial = h.document.createElement('li'); initial.dataset.seadex = 'initial'; initial.addEventListener('click', () => clicks++); h.source.append(initial);
  const options = { sourceRoot: h.root, targetRoot: h.target, entries: [{ source: h.source, target: h.target }] };
  const dispose = module.project(options);
  assert.equal(h.target.querySelector('[data-seadex]'), initial); initial.click(); assert.equal(clicks, 1);
  assert.ok(h.source.querySelector('.torrent-icons__internal'));
  assert.notEqual(h.source.querySelector('.torrent-icons__internal'), h.target.querySelector('.torrent-icons__internal'));
  assert.equal(h.target.querySelector('.torrent-icons__comments'), null); assert.equal(h.target.querySelector('.other'), null);
  assert.equal(module.project(options), dispose); assert.equal(h.target.querySelector('[data-seadex]'), initial);
  const late = h.document.createElement('li'); late.innerHTML = '<span data-seadex="late">Late</span>'; late.addEventListener('click', () => clicks++); h.source.append(late);
  await settle(); assert.equal(late.parentNode, h.target); late.click(); assert.equal(clicks, 2);
  assert.equal(h.target.querySelectorAll('[data-seadex]').length, 2);
  h.source.querySelector('.torrent-icons__internal').textContent = 'Changed'; await settle();
  assert.equal(h.target.querySelector('.torrent-icons__internal').textContent, 'Changed');
  assert.equal(h.target.querySelectorAll('.torrent-icons__internal').length, 1);
  dispose();
});

test('detail tags retain hidden source location and move wrapped nodes without duplicate projections', async t => {
  const h = setup(t), module = h.createLiveTorrentIcons();
  h.source.style.display = 'none';
  module.project({ sourceRoot: h.root, targetRoot: h.target, entries: [{ source: h.source, target: h.target }], kind: 'tags' });
  assert.equal(h.source.parentElement, h.root); assert.equal(h.target.children.length, 3);
  const late = h.document.createElement('li'); late.innerHTML = '<span><b data-seadex="late">Recommendation</b></span>'; h.source.append(late);
  await settle(); assert.equal(late.parentNode, h.target); assert.equal(h.source.style.display, 'none');
  h.target.remove(); await settle();
  const after = h.document.createElement('li'); after.dataset.seadex = 'after'; h.source.append(after); await settle();
  assert.equal(after.parentNode, h.source);
});

test('filter and projection share nested preservation and comment exclusion rules', async t => {
  const h = setup(t), module = h.createLiveTorrentIcons();
  const nested = h.document.createElement('li'); nested.innerHTML = '<span data-seadex="yes"></span>'; h.source.append(nested);
  module.filter(h.source);
  assert.equal(h.source.contains(nested), true); assert.equal(h.source.children.length, 2);
  module.project({ sourceRoot: h.root, targetRoot: h.target, entries: [{ source: h.source, target: h.target }], removeIcons: false });
  const other = h.document.createElement('li'); other.className = 'other'; h.source.append(other);
  const comment = h.document.createElement('li'); comment.className = 'torrent-icons__comments'; h.source.append(comment);
  await settle(); assert.ok(h.target.querySelector('.other')); assert.equal(h.target.querySelector('.torrent-icons__comments'), null);
});
