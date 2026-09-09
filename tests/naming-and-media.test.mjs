import test from 'node:test';
import assert from 'node:assert/strict';
import { harness, catalog } from './harness.mjs';

function setup(t) { const h = harness(); t.after(() => h.window.close()); return h; }
const sequence = ['videoCodec', 'resolution', 'country', 'service', 'source', 'seasonEpisode', 'language', 'audio', 'scene', 'group'];

test('naming context is independent of browser pathname and selectively hides seasons', t => {
  const h = setup(t), naming = h.createTorrentNaming({ catalog, sequence });
  const release = 'Example 2024 S01E02 1080p NF WEB-DL DDP 5.1 H.264-ExampleGroup';
  const parts = naming.format(release);
  assert.equal(parts.find(x => x.category === 'seasonEpisode').value, 'S01E02');
  assert.equal(parts.find(x => x.category === 'service').value, 'NF');
  assert.equal(parts.find(x => x.category === 'group').value, 'ExampleGroup');
  const hidden = naming.format(release, { hideSeasonEpisode: true });
  assert.equal(hidden.some(x => x.category === 'seasonEpisode'), false);
  assert.equal(hidden.length, parts.length - 1);
  h.dom.reconfigure({ url: 'https://aither.cc/torrents' });
  assert.equal(JSON.stringify(naming.format(release)), JSON.stringify(parts));
});

test('naming owns catalog and sequence snapshots, retains unknowns and handles no catalog', t => {
  const { createTorrentNaming } = setup(t);
  const localCatalog = { SERVICE_TOKENS: ['NF'], SCENE_RELEASE_GROUPS: ['ExampleGroup'] };
  const order = ['group', 'scene', 'resolution', 'videoCodec', 'service'];
  const naming = createTorrentNaming({ catalog: localCatalog, sequence: order });
  order.pop(); localCatalog.SERVICE_TOKENS.length = 0;
  const parts = naming.format('Example 2024 NF WEB-DL-ExampleGroup');
  assert.equal(parts.map(x => x.category).join(','), 'group,scene,resolution,videoCodec,service');
  assert.equal(parts.find(x => x.category === 'scene').value, 'Scene');
  assert.equal(parts.find(x => x.category === 'resolution').value, 'UNKNOWN');
  const fallback = createTorrentNaming({ sequence });
  assert.equal(fallback.format('').length, 0);
  assert.ok(fallback.format('Example 2024 1080p WEB-DL H264-Group').length);
});

test('naming preserves full-disc country interpretation and release-group blocking', t => {
  const { createTorrentNaming } = setup(t);
  const naming = createTorrentNaming({ catalog: { COUNTRY_MAP: { USA: 'USA' }, SERVICE_TOKENS: ['NF'] }, sequence });
  assert.equal(naming.format('Example 2024 USA 1080p H264-Group', { typeLabel: 'Full Disc' }).find(x => x.category === 'country').value, 'USA');
  assert.equal(naming.format('Example 2024 USA 1080p H264-Group').some(x => x.category === 'country'), false);
  assert.equal(naming.format('Example 2024 1080p WEB-DL H264').find(x => x.category === 'group').value, 'NOGRP');
});

const media = 'General\r\nComplete name : C:\\video\\Example.mkv\r\nFormat : Matroska\r\nVideo\r\nFormat : AVC\r\nWidth : 1920 pixels\r\nHeight : 1080 pixels\r\nEncoding settings : test=1\r\nAudio\r\nFormat : DTS\r\nChannel(s) : 6 channels\r\nLanguage : English\r\nText\r\nFormat : UTF-8\r\nLanguage : English\r\nTitle : <img src=x>\r\nForced : Yes\r\nDefault : Yes\r\n';
const disc = 'DISC TITLE: Example Disc\nDISC SIZE: 40 GiB\nVIDEO: AVC / 35 Mbps / 1080p / 24 fps / 16:9 / High Profile\nAUDIO: Japanese / LPCM / 2.0 / 48 kHz / 2304 kbps / 24-bit\nSUBTITLE: English / 50 kbps\nSUBTITLE: English / 60 kbps';

test('media summary prefers MediaInfo, retains exact raw text and renders literal track text', t => {
  const h = setup(t), result = h.renderMediaSummary({ media_info: media, bd_info: disc });
  assert.equal(result.id, 'mediainfo'); assert.equal(result.label, 'MediaInfo');
  assert.equal(result.rawContent, media); assert.equal(result.element.querySelector('pre').textContent, media);
  assert.equal(result.element.querySelector('.gz-mediainfo-filename').textContent, 'Example.mkv');
  assert.match(result.element.textContent, /5\.1ch/); assert.match(result.element.textContent, /forced, default/);
  assert.match(result.element.textContent, /<img src=x>/); assert.equal(result.element.querySelector('img'), null);
  result.element.querySelector('.gz-mediainfo-filename').click();
  assert.ok(result.element.querySelector('.gz-mediainfo-raw-inline').classList.contains('visible'));
  assert.match(result.element.querySelector('.gz-mediainfo-encode-settings').textContent, /test=1/);
});

test('BDInfo summary keeps disc-specific fields, audio depth and grouped subtitles', t => {
  const { renderMediaSummary } = setup(t), result = renderMediaSummary({ media_info: '  ', bd_info: disc });
  assert.equal(result.id, 'bdinfo'); assert.equal(result.rawContent, disc);
  assert.match(result.element.querySelector('.gz-mediainfo-summary-content').textContent, /High Profile/);
  assert.match(result.element.querySelector('.gz-mediainfo-audio-details').textContent, /48 kHz \/ 24-bit/);
  assert.equal(result.element.querySelector('.gz-mediainfo-subtitle-item').textContent, 'English (2)');
  assert.equal(renderMediaSummary({}), null);
  assert.ok(renderMediaSummary({ media_info: 'General\nFormat : Matroska' }).element);
});
