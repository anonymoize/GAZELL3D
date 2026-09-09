import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const source = fs.readdirSync(new URL('../src/', import.meta.url))
  .filter(file => /^\d{2}-.*\.js$/.test(file) && !file.startsWith('11-'))
  .sort().map(file => fs.readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8')).join('\n');

export function harness(markup = '', config = {}) {
  const dom = new JSDOM(`<!doctype html><html><body>${markup}</body></html>`, {
    url: 'https://aither.cc/torrents/1/similar', runScripts: 'outside-only',
  });
  dom.window.GM_getValue = (key, fallback) => key === 'gz_config' ? JSON.stringify(config) : fallback;
  dom.window.GM_setValue = () => {};
  dom.window.GM_xmlhttpRequest = () => { throw Error('Unexpected network access'); };
  const modules = dom.window.eval(`${source}\n({ buildUserProfileLayout, buildGroupRequirementsLayout, createJsonRequest, createTorrentRepository, createTorrentNaming, createTorrentDropdowns, createLiveTorrentIcons, renderMediaSummary, renderTorrentDropdown, enhanceSearchTorrentDropdowns, gazellifyTorrentLayout })`);
  return { dom, window: dom.window, document: dom.window.document, ...modules };
}
export const settle = () => new Promise(resolve => setTimeout(resolve, 0));
export function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
export const catalog = JSON.parse(fs.readFileSync(new URL('../config.json', import.meta.url), 'utf8'));
