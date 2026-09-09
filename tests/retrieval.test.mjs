import test from 'node:test';
import assert from 'node:assert/strict';
import { harness, deferred, settle } from './harness.mjs';

const resource = id => ({ id, attributes: { name: `Torrent ${id}` } });
function setup(t) { const h = harness(); t.after(() => h.window.close()); return h; }

test('JSON transport rejects HTTP failures, malformed JSON and timeouts', async t => {
  const { createJsonRequest } = setup(t);
  for (const [status, responseText, expected] of [[401, '{"message":"Denied"}', /Denied/], [500, '<html>error</html>', /HTTP Error 500/], [200, 'invalid', /parse JSON/]]) {
    await assert.rejects(createJsonRequest(options => options.onload({ status, responseText }))('/fixture'), expected);
  }
  await assert.rejects(createJsonRequest(options => options.ontimeout())('/fixture'), /timed out/);
  assert.equal((await createJsonRequest(options => options.onload({ status: 200, responseText: '{"ok":true}' }))('/fixture')).ok, true);
});

test('group requests deduplicate, retry failures and cache by TMDB identity', async t => {
  const { createTorrentRepository } = setup(t);
  let calls = 0;
  const wait = deferred();
  const repository = createTorrentRepository({ getApiKey: () => 'fixture', request: () => { calls++; return calls === 1 ? wait.promise : Promise.resolve({ data: [resource(calls)] }); } });
  const first = repository.byTmdb(1), second = repository.byTmdb(1);
  await settle(); assert.equal(calls, 1);
  wait.reject(Error('offline'));
  await assert.rejects(first, /offline/); await assert.rejects(second, /offline/);
  assert.equal((await repository.byTmdb(1)).get('2').name, 'Torrent 2');
  await repository.byTmdb(1); assert.equal(calls, 2);
  await repository.byTmdb(2); assert.equal(calls, 3);
});

test('group pagination collects pages and refuses to cache truncated groups', async t => {
  const { createTorrentRepository } = setup(t);
  let calls = 0;
  const full = Array.from({ length: 100 }, (_, i) => resource(i));
  const repository = createTorrentRepository({ getApiKey: () => 'fixture', request: async url => {
    calls++; return { data: new URL(url).searchParams.get('page') === '1' ? full : [resource(100)] };
  } });
  assert.equal((await repository.byTmdb(1)).size, 101); assert.equal(calls, 2);
  let limitedCalls = 0;
  const limited = createTorrentRepository({ getApiKey: () => 'fixture', request: async () => { limitedCalls++; return { data: full }; } });
  await assert.rejects(limited.byTmdb(1), /20-page/);
  await assert.rejects(limited.byTmdb(1), /20-page/);
  assert.equal(limitedCalls, 40);
});

test('credentials isolate completed and pending results; missing credentials fail consistently', async t => {
  const { createTorrentRepository } = setup(t);
  let key = 'first';
  const old = deferred();
  const repository = createTorrentRepository({ getApiKey: () => key, request: async (url, options) => {
    if (options.headers.Authorization === 'Bearer first') return old.promise;
    return { data: resource('new') };
  } });
  const previous = repository.byId(1); await settle(); key = 'second';
  assert.equal((await repository.byId(1)).id, 'new');
  old.resolve({ data: resource('old') }); await previous;
  assert.equal((await repository.byId(1)).id, 'new');
  key = '';
  for (const method of ['byId', 'byTmdb', 'reportsFor']) await assert.rejects(repository[method](1), /not configured/);
});

test('single torrent errors are retryable and response IDs are normalized', async t => {
  const { createTorrentRepository } = setup(t); let calls = 0;
  const repository = createTorrentRepository({ getApiKey: () => 'fixture', request: async () => ++calls === 1 ? { message: 'Missing' } : { attributes: { name: 'Recovered' } } });
  await assert.rejects(repository.byId(8), /Missing/);
  assert.equal((await repository.byId(8)).id, '8'); assert.equal(calls, 2);
});

test('report pagination accepts supported shapes, deduplicates and invalidates on successful submission', async t => {
  const { createTorrentRepository } = setup(t); let calls = 0;
  const repository = createTorrentRepository({ getApiKey: () => 'fixture', request: async (url, options, method, timeout) => {
    if (method === 'POST') { assert.equal(timeout, 30000); assert.equal(JSON.parse(options.data).reported_torrent_id, 9); return { success: true }; }
    calls++;
    return new URL(url).searchParams.get('page') === '1' ? { data: [{ id: 1 }], links: { next: 'next' } } : { data: { data: [{ id: 1 }, { id: 2 }] } };
  } });
  assert.equal((await repository.reportsFor(9)).length, 2);
  await repository.reportsFor(9); assert.equal(calls, 2);
  await repository.submitReport({ reported_torrent_id: 9 });
  await repository.reportsFor(9); assert.equal(calls, 4);
});

test('successful report submission prevents an older pending read from recaching stale reports', async t => {
  const { createTorrentRepository } = setup(t); const old = deferred(); let calls = 0;
  const repository = createTorrentRepository({ getApiKey: () => 'fixture', request: async (url, options, method) => {
    if (method === 'POST') return { success: true };
    return ++calls === 1 ? old.promise : { data: [{ id: 2 }] };
  } });
  const previous = repository.reportsFor(9); await settle();
  await repository.submitReport({ reported_torrent_id: 9 });
  old.resolve({ data: [{ id: 1 }] }); await previous;
  assert.equal((await repository.reportsFor(9))[0].id, 2);
});
