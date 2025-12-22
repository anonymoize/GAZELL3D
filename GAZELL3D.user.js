// ==UserScript==
// @name         GAZELL3D
// @namespace    https://github.com/anonymoize/GAZELL3D/
// @version      1.6.0
// @description  Reimagine UNIT3D-based torrent pages for readability with a two-column layout, richer metadata presentation, cleaner torrent naming, and minor quality-of-life tweaks.
// @match        https://aither.cc/torrents/*
// @match        https://aither.cc/torrents*
// @updateURL    https://github.com/anonymoize/GAZELL3D/raw/refs/heads/main/GAZELL3D.js
// @downloadURL  https://github.com/anonymoize/GAZELL3D/raw/refs/heads/main/GAZELL3D.js
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @connect      aither.cc
// ==/UserScript==

(function () {
  'use strict';

  const CONFIG = Object.freeze({
    removeTorrentIcons: true,
    enableGazellifySimilar: true,
    enableGazellifyDetail: false,
    enableGazellifySearch: true,
    enableOriginalTitleTooltip: true,
    showEditButton: true,
    enableSideLayout: true,
    enableGazelleButtons: true,
    enableGazelleTorrentLayout: true,
    enableTorrentDropdowns: false,
  });

  // API key for Aither (required for dropdown feature)
  const AITHER_API_KEY = 'YOUR_API_KEY_HERE';

  // Utility for making authenticated API calls
  const gmFetchJson = (url, opts = {}, method = 'GET', timeout = 15000) => {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method,
        timeout,
        ...opts,
        url: url.toString(),
        ontimeout: () => reject(new Error(`Request timed out after ${timeout}ms`)),
        onerror: (err) => reject(err || new Error('Failed to fetch')),
        onload: (response) => {
          try {
            resolve(JSON.parse(response.responseText));
          } catch (e) {
            reject(new Error('Failed to parse JSON response'));
          }
        }
      });
    });
  };

  const GAZELLIFY_SEQUENCE = Object.freeze([
    'videoCodec',
    'bitDepth',
    'resolution',
    'country',
    'service',
    'source',
    'seasonEpisode',
    'language',
    'audio',
    'atmos',
    'hdr',
    'hybrid',
    'cut',
    'repack',
    'scene',
    'group',
  ]);

  const SELECTORS = Object.freeze({
    similarArticle: 'main.page__torrent-similar--index article',
    torrentArticle: 'main.page__torrent--show article',
    torrentSearchPage: 'main.page__torrent--index',
    torrentGroup: 'section.panelV2[x-data="torrentGroup"]',
    metaSection: 'section.meta',
    torrentButtons: 'menu.torrent__buttons',
    tagBar: '.torrent__tags',
    searchBox: 'search',
    layout: '.gz-similar-layout',
    torrentTable: '.similar-torrents__torrents',
    searchResults: '.torrent-search--list__name',
  });

  const STYLE = `
    .gz-similar-layout {
      display: flex;
      gap: 1.5rem;
      width: 100%;
      margin-top: 1.5rem;
      align-items: flex-start;
    }

    .gz-similar-layout__column {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      min-width: 0;
    }

    .gz-similar-layout__column--left {
      flex: 1 1 auto;
    }

    .gz-similar-layout__column--right {
      flex: 0 0 360px;
      max-width: 360px;
      width: 100%;
    }

    .gz-meta-card {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      width: 100%;
    }

    .gz-meta-card .meta__backdrop {
      display: none;
    }

    .gz-meta-card .meta__title-link {
      text-align: center;
    }

    .gz-detail-title {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.45rem;
    }

    .gz-detail-title__heading {
      font-size: 1.6em;
      font-weight: 700;
      text-align: center;
      color: inherit;
    }

    .gz-detail-title__subheading {
      font-size: 1em;
      text-align: center;
      color: inherit;
      opacity: 0.75;
    }

    .gz-meta-card .meta__poster-link {
      width: 100%;
      display: block;
      align-self: stretch;
      float: none !important;
    }

    .gz-meta-card .meta__poster {
      width: 100%;
      height: auto;
      border-radius: 0.75rem;
      float: none !important;
    }

    .gz-meta-card .work__tags,
    .gz-meta-card .meta__ids,
    .gz-inline-buttons {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0;
      margin: 0;
      font-size: 1.25rem;
    }

    .gz-meta-card .meta__ids li,
    .gz-meta-card .work__tags li,
    .gz-inline-buttons li {
      list-style: none;
      white-space: normal;
      flex: 1 1 140px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .gz-meta-card .meta__ids img {
      height: 18px;
      width: auto;
    }

    .gz-inline-buttons .form__group {
      display: flex;
      flex: 1;
      min-width: 0;
    }

    .gz-inline-buttons .form__button {
      flex: 1;
      white-space: nowrap;
      padding: 0.35rem 0.6rem;
      justify-content: center;
    }

    .gz-meta-card .meta__description {
      margin: 0;
      padding: 0.85rem 1rem;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 0.75rem;
      background: rgba(255, 255, 255, 0.02);
    }

    @media (max-width: 1100px) {
      .gz-meta-card .work__tags {
        flex-wrap: wrap;
      }
    }

    .gz-meta-card .meta__chip-container {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      width: 100%;
      padding: 1rem;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 0.75rem;
      background: rgba(255, 255, 255, 0.02);
    }

    .gz-meta-card .meta-chip-wrapper {
      width: 100%;
    }

    .gz-meta-card .meta__chip-container .meta-chip__value {
      white-space: normal;
    }

    .gz-meta-card .work__tags,
    .gz-meta-card .meta__ids,
    .gz-inline-buttons {
      padding: 0.6rem 0.8rem;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 0.75rem;
      background: rgba(255, 255, 255, 0.02);
    }

    .gz-meta-card .gz-meta-divider {
      border: none;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
      margin: 0.5rem 0 0.75rem;
    }

    .gz-meta-card .gz-chip-heading {
      text-align: center;
      letter-spacing: 0.08em;
      margin: 0 0 0.4rem;
    }

    .gz-inline-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      justify-content: flex-start;
      width: 100%;
    }

    .gz-inline-buttons .form__group {
      flex: 1 1 160px;
      min-width: 140px;
    }

    .gz-inline-buttons .form__button {
      width: 100%;
      padding: 0.35rem 0.6rem;
      justify-content: center;
      white-space: nowrap;
    }

    .gz-meta-card .work__tags li::after {
      content: none !important;
    }

    .gz-search-title {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      line-height: 1.2;
    }

    .gz-search-title__heading {
      font-size: 1.10em;
      font-weight: 600;
      color: inherit;
      transition: opacity 0.15s ease;
    }

    .gz-search-title__subheading {
      font-size: 0.75em;
      color: inherit;
      opacity: 0.7;
      margin-top: 0.30rem;
      transition: opacity 0.15s ease;
    }

    .torrent-search--list__name:hover .gz-search-title__heading,
    .torrent-search--list__name:hover .gz-search-title__subheading {
      opacity: 1;
    }

    .gz-tooltip {
      position: fixed;
      z-index: 9999;
      pointer-events: none;
      background: var(--gz-tooltip-bg, rgba(0, 0, 0, 0.85));
      color: var(--gz-tooltip-color, #fff);
      border: 1px solid var(--gz-tooltip-border, rgba(255, 255, 255, 0.15));
      padding: 0.4rem 0.75rem;
      border-radius: 0.45rem;
      font-size: 1.25rem;
      line-height: 1.35;
      opacity: 0;
      transform: translateY(4px);
      transition: opacity 0.1s ease, transform 0.1s ease;
      max-width: 600px;
      word-break: break-word;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
    }

    .gz-tooltip--visible {
      opacity: 1;
      transform: translateY(0);
    }

    .gz-label--unknown {
      color: #ffd95e;
      font-weight: 600;
    }

    @media (max-width: 1100px) {
      .gz-similar-layout {
        flex-direction: column;
      }

      .gz-similar-layout__column--right {
        max-width: none;
        flex: 1 1 auto;
      }
    }

    .gz-actions-cell {
      white-space: nowrap;
      text-align: center;
      font-size: 0.9em;
      font-weight: normal;
    }
    
    .gz-actions-cell a, .gz-actions-cell button {
      display: inline-block;
      cursor: pointer;
      color: inherit;
      text-decoration: none;
      border: none;
      background: none;
      padding: 0;
      font: inherit;
    }

    .gz-actions-cell a:hover, .gz-actions-cell button:hover {
      text-decoration: underline;
    }

    .gz-torrent-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9em;
      margin-top: 1rem;
    }

    .gz-torrent-table th {
      text-align: left;
      padding: 10px 12px;
      border-bottom: 2px solid rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.7);
      font-weight: 600;
      white-space: nowrap;
    }

    .gz-torrent-table td {
      padding: 8px 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      vertical-align: middle;
    }

    .gz-torrent-table .gz-col-ep {
      width: 60px;
      white-space: nowrap;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 600;
    }

    .gz-torrent-table .gz-col-type {
      width: 80px;
      white-space: nowrap;
    }

    .gz-torrent-table .gz-col-name {
      /* Takes remaining space */
    }

    .gz-torrent-table .gz-col-actions {
      width: 100px;
      white-space: nowrap;
    }
    
    .gz-torrent-table .gz-col-size {
      width: 80px;
      white-space: nowrap;
      text-align: right;
    }
    
    .gz-torrent-table .gz-col-stat {
      width: 50px;
      white-space: nowrap;
      text-align: center;
    }

    .gz-torrent-table .ep-hidden {
      color: transparent;
    }
    
    .gz-torrent-table .torrent-name-link {
        font-weight: 600;
        text-decoration: none;
        color: inherit;
        font-size: 1.05em;
    }
    
    .gz-torrent-table .gz-torrent-icons {
        display: inline-flex;
        gap: 6px;
        margin-right: 8px;
        vertical-align: middle;
        float: right;
        margin-top: 5px;
    }
    
    .gz-torrent-table .gz-torrent-icons i {
        font-size: 0.9em;
        opacity: 0.8;
    }

    .gz-season-header {
       background: rgba(255, 255, 255, 0.06);
    }
    
    .gz-season-header td {
        font-weight: 700;
        font-size: 1.1em;
        padding: 12px;
        color: rgba(255, 255, 255, 0.95);
    }

    .gz-group-header {
       background: rgba(255, 255, 255, 0.03);
       border-bottom: 2px solid rgba(255, 255, 255, 0.05);
    }

    .gz-group-header td {
        font-weight: 700;
        padding: 8px 12px;
        font-size: 0.95em;
        color: rgba(255, 255, 255, 0.85);
        text-align: left;
    }

    /* Torrent Info Dropdown Styles */
    .gz-dropdown-row {
      background: rgba(0, 0, 0, 0.15);
    }

    .gz-dropdown-row td {
      padding: 0 !important;
    }

    .gz-dropdown-container {
      padding: 12px 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      /* Prevent layout shift */
      width: 100%;
      box-sizing: border-box;
      contain: layout style;
    }

    /* Ensure gazelle table doesn't shift when dropdown opens */
    .gz-torrent-table {
      table-layout: fixed;
      width: 100%;
    }

    .gz-dropdown-header {
      font-size: 0.85em;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .gz-dropdown-header a {
      color: inherit;
      text-decoration: none;
    }

    .gz-dropdown-header a:hover {
      text-decoration: underline;
    }

    .gz-dropdown-tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 0;
    }

    .gz-dropdown-tab {
      padding: 8px 16px;
      cursor: pointer;
      font-size: 0.9em;
      color: rgba(255, 255, 255, 0.7);
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      transition: all 0.15s ease;
      margin-bottom: -1px;
    }

    .gz-dropdown-tab:hover {
      color: rgba(255, 255, 255, 0.9);
      background: rgba(255, 255, 255, 0.03);
    }

    .gz-dropdown-tab.active {
      color: #76dba6;
      border-bottom-color: #76dba6;
    }

    .gz-dropdown-panel {
      display: none;
    }

    .gz-dropdown-panel.active {
      display: block;
    }

    .gz-dropdown-description {
      font-size: 0.9em;
      line-height: 1.5;
      color: rgba(255, 255, 255, 0.85);
      max-height: 500px;
      overflow-y: auto;
    }

    .gz-dropdown-description:empty::after {
      content: 'No description available.';
      color: rgba(255, 255, 255, 0.5);
      font-style: italic;
    }

    .gz-dropdown-filelist {
      max-height: 500px;
      overflow-y: auto;
    }

    .gz-dropdown-filelist table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85em;
    }

    .gz-dropdown-filelist th,
    .gz-dropdown-filelist td {
      padding: 6px 10px;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .gz-dropdown-filelist th {
      color: rgba(255, 255, 255, 0.6);
      font-weight: 600;
    }

    .gz-dropdown-filelist td:last-child {
      text-align: right;
      white-space: nowrap;
    }

    .gz-dropdown-mediainfo {
      max-height: 600px;
      overflow: auto;
    }

    .gz-dropdown-mediainfo pre {
      margin: 0;
      padding: 12px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 6px;
      font-size: 0.8em;
      font-family: 'Monaco', 'Consolas', monospace;
      line-height: 1.4;
      white-space: pre-wrap;
      word-break: break-word;
      color: rgba(255, 255, 255, 0.85);
    }

    .gz-dropdown-loading {
      text-align: center;
      padding: 20px;
      color: rgba(255, 255, 255, 0.6);
    }

    .gz-dropdown-error {
      text-align: center;
      padding: 20px;
      color: #db7676;
    }

    .gz-torrent-table .torrent-name-link.gz-clickable {
      cursor: pointer;
    }

    .gz-torrent-table .torrent-name-link.gz-clickable:hover {
      text-decoration: underline;
    }

    /* BBCode Styles */
    .gz-bbcode-img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin: 4px 0;
    }

    .gz-bbcode-quote {
      margin: 8px 0;
      padding: 10px 14px;
      border-left: 3px solid rgba(118, 219, 166, 0.6);
      background: rgba(255, 255, 255, 0.03);
      border-radius: 0 4px 4px 0;
    }

    .gz-bbcode-quote cite {
      display: block;
      font-weight: 600;
      margin-bottom: 6px;
      color: rgba(255, 255, 255, 0.7);
    }

    .gz-bbcode-code {
      margin: 8px 0;
      padding: 10px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 4px;
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 0.85em;
      overflow-x: auto;
    }

    .gz-bbcode-spoiler,
    .gz-bbcode-comparison {
      margin: 8px 0;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }

    .gz-bbcode-spoiler summary,
    .gz-bbcode-comparison summary {
      padding: 8px 12px;
      cursor: pointer;
      background: rgba(255, 255, 255, 0.03);
      font-weight: 500;
    }

    .gz-bbcode-spoiler[open] summary,
    .gz-bbcode-comparison[open] summary {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .gz-bbcode-spoiler-content {
      padding: 10px 12px;
    }

    .gz-bbcode-note {
      margin: 10px 0;
      padding: 12px 16px;
      background: rgba(118, 219, 166, 0.08);
      border: 1px solid rgba(118, 219, 166, 0.3);
      border-radius: 6px;
      color: rgba(255, 255, 255, 0.9);
    }

    .gz-bbcode-alert {
      margin: 10px 0;
      padding: 12px 16px;
      background: rgba(219, 118, 118, 0.08);
      border: 1px solid rgba(219, 118, 118, 0.3);
      border-radius: 6px;
      color: rgba(255, 255, 255, 0.9);
    }

    .gz-bbcode-list {
      margin: 8px 0;
      padding-left: 24px;
      list-style-type: disc;
    }

    .gz-bbcode-list li {
      margin: 4px 0;
      padding-left: 4px;
    }

    /* File List Tree Styles */
    .gz-filelist-root-info {
      margin-bottom: 10px;
      padding: 8px 12px;
      background: rgba(118, 219, 166, 0.06);
      border-radius: 4px;
      font-size: 0.9em;
      color: rgba(255, 255, 255, 0.8);
    }

    .gz-filelist-root-info strong {
      color: rgba(118, 219, 166, 0.9);
    }

    .gz-filelist-folder-row {
      cursor: pointer;
    }

    .gz-filelist-folder-row:hover {
      background: rgba(255, 255, 255, 0.03);
    }

    .gz-folder-toggle {
      display: inline-block;
      width: 12px;
      margin-right: 4px;
      font-size: 0.8em;
      color: rgba(255, 255, 255, 0.6);
      transition: transform 0.15s ease;
    }

    .gz-folder-icon {
      margin-right: 6px;
    }

    .gz-folder-name {
      font-weight: 600;
      color: rgba(255, 255, 255, 0.95);
    }

    .gz-folder-count {
      font-weight: 400;
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.9em;
      margin-left: 6px;
    }

    .gz-filelist-file-row td:first-child {
      color: rgba(255, 255, 255, 0.85);
    }

    .gz-tree-indent {
      display: inline-block !important;
      flex-shrink: 0;
      height: 1em;
      vertical-align: middle;
    }

    /* MediaInfo Summary Styles */
    .gz-mediainfo-summary {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 6px;
      margin-bottom: 12px;
    }

    .gz-mediainfo-section {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .gz-mediainfo-label {
      font-weight: 600;
      color: rgba(255, 255, 255, 0.7);
      min-width: 80px;
      flex-shrink: 0;
    }

    .gz-mediainfo-value {
      color: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .gz-mediainfo-raw-container {
      margin-top: 8px;
    }

    .gz-mediainfo-raw-container summary {
      cursor: pointer;
      color: rgba(118, 219, 166, 0.9);
      font-size: 0.85em;
      padding: 6px 0;
    }

    .gz-mediainfo-raw-container summary:hover {
      text-decoration: underline;
    }

    .gz-mediainfo-raw {
      margin-top: 8px;
      max-height: 300px;
      overflow: auto;
    }
  `;

  const READY_STATES = ['complete', 'interactive'];

  const $ = (selector, scope = document) => (scope ? scope.querySelector(selector) : null);
  const $$ = (selector, scope = document) => (scope ? Array.from(scope.querySelectorAll(selector)) : []);
  const normalizeText = (value = '') => String(value).replace(/\s+/g, ' ').trim();
  const getText = (node) => normalizeText(node?.textContent || '');
  const create = (tag, className = '') => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    return element;
  };
  const appendAll = (parent, nodes = []) => nodes.filter(Boolean).forEach((node) => parent.appendChild(node));
  const removeNode = (node) => {
    if (node) node.remove();
  };
  const tokenizeWords = (text) =>
    (text || '')
      .split(/[^A-Za-z0-9]+/)
      .map((token) => token.trim().toUpperCase())
      .filter(Boolean);
  const setOriginalTitle = (element, originalText) => {
    if (!element || element.dataset.gzOriginal) return;
    const source = originalText ?? element.textContent ?? '';
    const value = normalizeText(source);
    if (value) element.dataset.gzOriginal = value;
  };
  const applyUnknownHighlight = (element, text = '') => {
    if (!element) return;
    const value = text || '';
    if (!/unknown/i.test(value)) {
      element.textContent = value;
      return;
    }
    element.textContent = '';
    const regex = /unknown/gi;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(value))) {
      if (match.index > lastIndex) {
        element.appendChild(document.createTextNode(value.slice(lastIndex, match.index)));
      }
      const span = create('span', 'gz-label--unknown');
      span.textContent = match[0];
      element.appendChild(span);
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < value.length) {
      element.appendChild(document.createTextNode(value.slice(lastIndex)));
    }
  };
  const findMetadataStartIndex = (text = '') => {
    // 1. TV Shows: Priority on Season/Episode patterns.
    // This allows unique title modifiers (like "AKA Title") to exist between Year and Season.
    const tvPattern = /\b(?:S\d{1,3}(?:E\d{1,3})?|E\d{1,3}|Season\s*\d+|Complete(?:\s*Series)?|OVA|OAD|NCED|NCOP)\b/i;
    const tvMatch = text.match(tvPattern);
    if (tvMatch) {
      return tvMatch.index;
    }

    // 2. Movies: Priority on Year.
    // If a Year is present, we assume everything after it is metadata.
    // This handles cases like "Movie Title 1999 Language 1080p..."
    const yearMatch = text.match(/\b(?:19|20)\d{2}\b/);
    if (yearMatch) {
      return yearMatch.index + yearMatch[0].length;
    }

    // 3. Fallback: If no Season or Year, look for the start of common technical tags.
    const patterns = [
      /\b(?:2160p|4320p|1080p|720p|576p|480p|1080i|720i|576i|480i|360p|240p|144p|8K|4K|2K|SD)\b/i,
      /\b(?:Blu-?ray|WEB(?:-?DL|Rip)?|HDTV|UHD|DVD(?:\d|R)?|BD|BRRip|BDRip|DVDRip|NTSC|PAL|SECAM|LaserDisc|VHS|PPV|VOD|REMUX|ISO)\b/i,
      /\b(?:H\.?26[45]|HEVC|AVC|x265|x264|MPEG-?2|MPEG-?4|VP9|AV1|VC-?1|XviD|DivX)\b/i,
      /\b(?:DTS(?::?X|-?HD)?|TrueHD|Atmos|DD(?:\+|P|-?EX)?|Dolby(?:[\s\.]?Digital)?|FLAC|AAC|AC-?3|E-?AC-?3|PCM|LPCM|Opus|Vorbis|WMA|MP3)\b/i,
      /\b(?:HDR10\+?|DV|HLG|SDR|10.?bit)\b/i,
      /\b(?:JAPANESE|ENGLISH|KOREAN|FRENCH|GERMAN|SPANISH|ITALIAN|RUSSIAN|HINDI|THAI|CHINESE|MANDARIN|CANTONESE|PORTUGUESE|POLISH|FINNISH|SWEDISH|NORWEGIAN|DANISH|DUTCH|TURKISH|LATINO|MULTI(?:-?AUDIO)?|DUAL(?:-?AUDIO)?)\b/i,
      /\b(?:MKV|MP4|AVI|WMV|M4V|TS)\b/i,
    ];

    let startIndex = Number.POSITIVE_INFINITY;
    for (const pattern of patterns) {
      const match = pattern.exec(text);
      if (match && match.index < startIndex) {
        startIndex = match.index;
      }
    }

    if (!Number.isFinite(startIndex)) return 0;
    return startIndex;
  };
  const normalizeSceneGroupName = (value = '') =>
    String(value)
      .replace(/[^A-Za-z0-9]+/g, '')
      .toUpperCase();
  const CONFIG_URL = 'https://raw.githubusercontent.com/anonymoize/GAZELL3D/main/config.json';
  const CACHE_KEY = 'GAZELL3D_CONFIG';
  const CACHE_EXPIRY = 24 * 60 * 60 * 1000;

  let SCENE_RELEASE_GROUPS = new Set();
  let SERVICE_TOKENS = [];
  let COUNTRY_MAP = {};
  let LANGUAGE_MAP = {};
  let RELEASE_GROUP_BLOCK_TOKENS = new Set();

  const loadConfig = async () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          console.log('GAZELL3D: Loaded config from cache');
          return data;
        }
      }
    } catch (e) {
      console.warn('GAZELL3D: Cache read error', e);
    }

    console.log('GAZELL3D: Fetching config...');
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'GET',
        url: CONFIG_URL,
        onload: (response) => {
          if (response.status >= 200 && response.status < 300) {
            try {
              const data = JSON.parse(response.responseText);
              try {
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                  timestamp: Date.now(),
                  data
                }));
              } catch (e) {
                console.warn('GAZELL3D: Cache write error', e);
              }
              resolve(data);
            } catch (e) {
              reject(new Error('Config parse failed: ' + e.message));
            }
          } else {
            reject(new Error('Config fetch failed with status: ' + response.status));
          }
        },
        onerror: (err) => reject(new Error('Config fetch error: ' + err))
      });
    });
  };

  const initReleaseGroupBlockTokens = () => {
    const tokens = new Set([
      'WEB', 'DL', 'DUAL', 'AUDIO', 'SUBBED', 'DUBBED', 'MULTI', 'MULTISUB',
      'REMUX', 'REPACK', 'PROPER', 'LIMITED', 'COMPLETE', 'UNCENSORED',
      'UNRATED', 'THEATRICAL', 'EXTENDED', 'PACK', 'COLLECTION', 'SAMPLE',
      'HDR', 'SDR', 'ATMOS', 'DOLBY', 'TRUEHD', 'COMMENTARY',
    ]);
    const addTokens = (values) => {
      values.forEach((value) => tokenizeWords(value).forEach((token) => tokens.add(token)));
    };
    addTokens(RESOLUTIONS);
    addTokens(SERVICE_TOKENS);
    addTokens(SOURCE_PATTERNS.map((pattern) => pattern.value));
    addTokens(VIDEO_CODEC_PATTERNS.map((pattern) => pattern.value));
    addTokens(AUDIO_CODEC_PATTERNS.map((pattern) => pattern.value));
    addTokens(HDR_PATTERNS.map((pattern) => pattern.value));
    addTokens(CUT_PATTERNS.map((pattern) => pattern.value));
    return tokens;
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const parseColorString = (value) => {
    if (!value) return null;
    const rgbMatch = value.match(/rgba?\(([^)]+)\)/i);
    if (rgbMatch) {
      const parts = rgbMatch[1].split(',').map((part) => part.trim());
      if (parts.length >= 3) {
        const [r, g, b] = parts.slice(0, 3).map((part) => clamp(parseInt(part, 10) || 0, 0, 255));
        const a = parts[3] !== undefined ? clamp(parseFloat(parts[3]) || 0, 0, 1) : 1;
        return { r, g, b, a };
      }
    }
    return null;
  };
  const getRelativeLuminance = (color) => {
    if (!color) return 0;
    const toLinear = (component) => {
      const channel = component / 255;
      return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * toLinear(color.r) + 0.7152 * toLinear(color.g) + 0.0722 * toLinear(color.b);
  };
  const getEffectiveBackgroundColor = () => {
    const nodes = [document.body, document.documentElement];
    for (const node of nodes) {
      if (!node) continue;
      const value = window.getComputedStyle(node).backgroundColor;
      const color = parseColorString(value);
      if (color && color.a > 0) return color;
    }
    return { r: 17, g: 17, b: 17, a: 1 };
  };
  let cachedTooltipTheme;
  const getTooltipTheme = () => {
    if (cachedTooltipTheme) return cachedTooltipTheme;
    const bgColor = getEffectiveBackgroundColor();
    const isLightBackground = getRelativeLuminance(bgColor) > 0.5;
    cachedTooltipTheme = isLightBackground
      ? {
        bg: 'rgba(0, 0, 0, 0.82)',
        color: 'rgba(255, 255, 255, 0.95)',
        border: 'rgba(0, 0, 0, 0.25)',
      }
      : {
        bg: 'rgba(255, 255, 255, 0.96)',
        color: 'rgba(8, 11, 25, 0.95)',
        border: 'rgba(255, 255, 255, 0.35)',
      };
    return cachedTooltipTheme;
  };
  const applyTooltipTheme = (element) => {
    if (!element) return;
    const theme = getTooltipTheme();
    element.style.setProperty('--gz-tooltip-bg', theme.bg);
    element.style.setProperty('--gz-tooltip-color', theme.color);
    element.style.setProperty('--gz-tooltip-border', theme.border);
  };

  let tooltipElement;
  let tooltipTarget = null;
  let tooltipInitialized = false;

  const ensureTooltipElement = () => {
    if (tooltipElement) return tooltipElement;
    tooltipElement = create('div', 'gz-tooltip');
    applyTooltipTheme(tooltipElement);
    document.body.appendChild(tooltipElement);
    return tooltipElement;
  };

  const hideTooltip = () => {
    if (!tooltipElement) return;
    tooltipElement.classList.remove('gz-tooltip--visible');
  };

  const positionTooltip = (event) => {
    if (!tooltipElement) return;
    const offset = 16;
    const tooltipRect = tooltipElement.getBoundingClientRect();
    const maxX = window.innerWidth - tooltipRect.width - 12;
    const maxY = window.innerHeight - tooltipRect.height - 12;
    const nextX = Math.min(Math.max(event.clientX + offset, 12), Math.max(12, maxX));
    const nextY = Math.min(Math.max(event.clientY + offset, 12), Math.max(12, maxY));
    tooltipElement.style.left = `${nextX}px`;
    tooltipElement.style.top = `${nextY}px`;
  };

  const showTooltip = (text) => {
    if (!text) return;
    const element = ensureTooltipElement();
    element.textContent = text;
    element.classList.add('gz-tooltip--visible');
  };

  const getTooltipTarget = (node) => (node instanceof Element ? node.closest('[data-gz-original]') : null);

  const handleTooltipEnter = (event) => {
    const target = getTooltipTarget(event.target);
    if (!target) return;
    const text = target.dataset.gzOriginal;
    if (!text) return;
    tooltipTarget = target;
    showTooltip(text);
    positionTooltip(event);
  };

  const handleTooltipLeave = (event) => {
    if (!tooltipTarget) return;
    const current = getTooltipTarget(event.target);
    if (current !== tooltipTarget) return;
    const next = getTooltipTarget(event.relatedTarget);
    if (next === tooltipTarget) return;
    tooltipTarget = null;
    hideTooltip();
  };

  const handleTooltipMove = (event) => {
    if (!tooltipTarget || !tooltipElement || !tooltipElement.classList.contains('gz-tooltip--visible')) return;
    positionTooltip(event);
  };

  const initTooltip = () => {
    if (tooltipInitialized) return;
    tooltipInitialized = true;
    document.addEventListener('mouseover', handleTooltipEnter);
    document.addEventListener('mouseout', handleTooltipLeave);
    document.addEventListener('mousemove', handleTooltipMove);
  };


  const ready = (cb) => {
    if (READY_STATES.includes(document.readyState)) {
      cb();
    } else {
      document.addEventListener('DOMContentLoaded', cb, { once: true });
    }
  };

  const injectStyles = (css) => {
    if (typeof GM_addStyle === 'function') {
      GM_addStyle(css);
    } else {
      const tag = document.createElement('style');
      tag.textContent = css;
      document.head.appendChild(tag);
    }
  };

  const findPanelByHeading = (text) => {
    if (!text) return null;
    const target = normalizeText(text).toLowerCase();
    return $$('section.panelV2').find((panel) => getText(panel.querySelector('.panel__heading')).toLowerCase() === target);
  };

  const VIDEO_CODEC_PATTERNS = [
    { regex: /\bHEVC\b|\bH\.?265\b|\bH265\b|\bx265\b/i, value: 'H.265' },
    { regex: /\bAVC\b|\bH\.?264\b|\bH264\b|\bx264\b/i, value: 'H.264' },
    { regex: /\bVVC\b|\bH\.?266\b|\bH266\b|\bx266\b/i, value: 'H.266' },
    { regex: /\bAV1\b/i, value: 'AV1' },
    { regex: /\bVC-?1\b/i, value: 'VC-1' },
    { regex: /\bMPEG-?2\b/i, value: 'MPEG-2' },
    { regex: /\bMPEG-?1\b/i, value: 'MPEG-1' },
    { regex: /\bMPEG\b/i, value: 'MPEG' },
    { regex: /\bXvid\b/i, value: 'Xvid' },
    { regex: /\bDivX\b/i, value: 'DivX' },
    { regex: /\bJPEG2000\b/i, value: 'JPEG2000' },
  ];

  const RESOLUTIONS = ['4320p', '2160p', '1080p', '1080i', '720p', '576p', '576i', '540p', '480p', '480i', "360p", '240p', '144p'];

  const SOURCE_PATTERNS = [
    { regex: /\bUHD[\s-]*Blu-?ray\b/i, value: 'UHD BluRay' },
    { regex: /\bBlu-?ray\b/i, value: 'BluRay' },
    { regex: /\bWEB[-\s]?DL\b/i, value: 'WEB-DL' },
    { regex: /\bWEBRip\b/i, value: 'WEBRip' },
    { regex: /\bDVD(?:Rip)?\b|\bNTSC DVD[59]\b|\bPAL DVD[59]\b|\bDVD[59]\b/i, value: 'DVD' },
    { regex: /\bHD-?DVD\b|\bHDDVD\b/i, value: 'HD DVD' },
    { regex: /\bHDTV\b/i, value: 'HDTV' },
    { regex: /\bLaserDisc\b/i, value: 'LaserDisc' },
    { regex: /\bVHS\b/i, value: 'VHS' },
    { regex: /\bTV[-\s]?Rip\b|\bTV\b/i, value: 'TV' },
    { regex: /\bDCP\b/i, value: 'DCP' },
  ];

  const AUDIO_CHANNEL_PATTERN = /\b(?:1\.0|2\.0|2\.1|3\.0|3\.1|4\.0|4\.1|5\.0|5\.1|6\.1|7\.1)\b/i;

  const AUDIO_CODEC_PATTERNS = [
    { regex: /\bDTS-?HD\s*MA\b/i, value: 'DTS-HD MA' },
    { regex: /\bDTS-?HD\s*HRA\b/i, value: 'DTS-HD HRA' },
    { regex: /\bDTS-?HD\b/i, value: 'DTS-HD' },
    { regex: /\bDTS:?X\b/i, value: 'DTS:X' },
    { regex: /\bDTS-?ES\b/i, value: 'DTS-ES' },
    { regex: /\bDTS\b/i, value: 'DTS' },
    { regex: /\bTrueHD\b/i, value: 'TrueHD' },
    { regex: /\bDolby\s+Digital\s+EX\b|\bDD-?EX\b/i, value: 'DD-EX' },
    { regex: /DD\+|DDP|\bE-?AC-?3\b/i, value: 'DD+' },
    { regex: /\bDD\b|\bDolby Digital\b/i, value: 'DD' },
    { regex: /\bAAC\b/i, value: 'AAC' },
    { regex: /\bOpus\b/i, value: 'Opus' },
    { regex: /\bFLAC\b/i, value: 'FLAC' },
    { regex: /\bVorbis\b/i, value: 'Vorbis' },
    { regex: /\bLPCM\b|\bPCM\b/i, value: 'LPCM' },
    { regex: /\bMP3\b/i, value: 'MP3' },
    { regex: /\bMP2\b/i, value: 'MP2' }
  ];

  const HDR_PATTERNS = [
    { regex: /\bDV\s+HDR10\+/i, value: 'DV HDR10+' },
    { regex: /\bDV\s+HDR\b/i, value: 'DV HDR' },
    { regex: /\bHDR10\+/i, value: 'HDR10+' },
    { regex: /\bHLG\b/i, value: 'HLG' },
    { regex: /\bDV\b/i, value: 'DV' },
    { regex: /\bHDR\b/i, value: 'HDR' },
  ];

  const CUT_PATTERNS = [
    { regex: /Director'?s\s+Cut/i, value: "Director's Cut" },
    { regex: /\bTheatrical\b/i, value: 'Theatrical' },
    { regex: /\bExtended\b/i, value: 'Extended' },
    { regex: /\bUnrated\b/i, value: 'Unrated' },
    { regex: /\bRegraded\b/i, value: 'Regraded' },
    { regex: /\bRedux\b/i, value: 'Redux' },
    { regex: /\bSpecial\s+Edition\b/i, value: 'Special Edition' },
    { regex: /\bSuper\s+Duper\s+Cut\b/i, value: 'Super Duper Cut' },
    { regex: /\bOpen\s+Matte\b/i, value: 'Open Matte' },
    { regex: /\bUncensored\b/i, value: 'Uncensored' },
    { regex: /\bUncut\b/i, value: 'Uncut' },
    { regex: /\bRemastered\b/i, value: 'Remastered' },
    { regex: /\bRestored\b/i, value: 'Restored' },
    { regex: /\bAnniversary\s+Edition\b/i, value: 'Anniversary Edition' },
    { regex: /\bUltimate\s+Edition\b/i, value: 'Ultimate Edition' },
    { regex: /\bCollector'?s\s+Edition\b/i, value: "Collector's Edition" },
    { regex: /\bFinal\s+Cut\b/i, value: 'Final Cut' },
    { regex: /\bIMAX\b/i, value: 'IMAX' },
    { regex: /\bWorkprint\b/i, value: 'Workprint' },
  ];



  const isBlockedReleaseToken = (token) => {
    const value = token ? token.toUpperCase() : '';
    if (!value) return false;
    if (RELEASE_GROUP_BLOCK_TOKENS.has(value)) return true;
    if (/^\d{1,4}$/.test(value)) return true;
    if (/^(?:S|E)\d{1,3}$/i.test(value)) return true;
    return false;
  };

  const getReleaseGroupTokens = (candidate) => {
    const tokens = tokenizeWords(candidate);
    if (!tokens.length) return null;
    return tokens.some((token) => isBlockedReleaseToken(token)) ? null : tokens;
  };

  const extractReleaseGroup = (normalized) => {
    let best = null;
    let index = normalized.indexOf('-');
    while (index !== -1) {
      const candidate = normalized.slice(index + 1).trim();
      const tokens = candidate && /\w/.test(candidate) ? getReleaseGroupTokens(candidate) : null;
      if (tokens) {
        const score = tokens.length * 100 + candidate.length;
        if (!best || score > best.score) {
          best = { score, value: candidate, index };
        }
      }
      index = normalized.indexOf('-', index + 1);
    }
    if (best) {
      return {
        group: best.value,
        baseTitle: normalized.slice(0, best.index).trim(),
      };
    }
    return { group: 'NOGRP', baseTitle: normalized };
  };

  const formatTorrentName = (name, { typeLabel } = {}) => {
    if (!name) return '';
    const normalized = name.replace(/\s+/g, ' ').trim();
    if (!normalized) return '';

    const { group, baseTitle } = extractReleaseGroup(normalized);

    const getMatchFromPatterns = (patterns, text) => {
      const found = patterns.find((pattern) => pattern.regex.test(text));
      return found ? found.value : '';
    };

    const videoCodec = getMatchFromPatterns(VIDEO_CODEC_PATTERNS, baseTitle) || 'UNKNOWN';
    const bitDepth =
      /\bHi10P\b.*\bx264\b/i.test(baseTitle) ? 'Hi10P' : '';
    const resolution =
      RESOLUTIONS.find((res) => new RegExp(`\\b${res}\\b`, 'i').test(baseTitle)) || 'UNKNOWN';
    const source = (() => {
      const discPattern = /\b(?:(NTSC|PAL)\s*)?(?:([1-9]\d*)x)?DVD([59])\b/gi;
      const discMatches = Array.from(baseTitle.matchAll(discPattern));
      if (discMatches.length) {
        const parts = discMatches.map(([, region, count, size]) =>
          region ? `${region} ${count ? `${count}x` : ''}DVD${size}` : `${count ? `${count}x` : ''}DVD${size}`
        );
        const uniqueParts = parts.filter((value, index, arr) => arr.indexOf(value) === index);
        return uniqueParts.join(' / ');
      }
      return getMatchFromPatterns(SOURCE_PATTERNS, baseTitle) || 'UNKNOWN';
    })();

    const isWebSource = /\bWEB(?:[-\s]?DL|Rip)\b/i.test(baseTitle);
    const metadataStart = findMetadataStartIndex(baseTitle);
    const metadataSlice = metadataStart ? baseTitle.slice(metadataStart) : baseTitle;
    const service =
      isWebSource
        ? (() => {
          const serviceRegex = new RegExp(
            `\\b(${SERVICE_TOKENS.join('|')})\\b(?=[^\\n]*\\bWEB(?:-?DL|Rip)\\b)`,
            'i'
          );
          const fallbackRegex = new RegExp(`\\b(${SERVICE_TOKENS.join('|')})\\b`, 'i');
          const match = serviceRegex.exec(metadataSlice) || fallbackRegex.exec(metadataSlice);
          if (!match) return '';
          const token = match[1];
          return SERVICE_TOKENS.find((candidate) => candidate.toLowerCase() === token.toLowerCase()) || token;
        })()
        : '';

    const isFullDisc =
      typeof typeLabel === 'string' && typeLabel.trim().toLowerCase().includes('full disc');
    const hasDiscContext = /\b(?:PAL|NTSC|SECAM|DVD\d?|Blu-ray|BD|UHD)\b/i.test(baseTitle);
    const country =
      isFullDisc || hasDiscContext
        ? (() => {
          const countryRegex = new RegExp(
            `\\b(${Object.keys(COUNTRY_MAP).join('|')})\\b`,
            'i'
          );
          const match = countryRegex.exec(baseTitle);
          if (!match) return '';
          const token = match[1].toUpperCase();
          return COUNTRY_MAP[token] || token;
        })()
        : '';

    const seasonEpisode = (() => {
      const patterns = [
        /S\d{2}E\d{2}(?:E\d{2})+/i,
        /S\d{2}E\d{2}-E\d{2}/i,
        /S\d{2}E\d{2}/i,
        /S\d{2}-S\d{2}/i,
        /S\d{2}/i,
      ];
      const matchPattern = patterns.find((pattern) => pattern.test(baseTitle));
      return matchPattern ? baseTitle.match(matchPattern)[0].toUpperCase() : '';
    })();

    const language = (() => {
      if (/Dual[-\s]?Audio/i.test(baseTitle)) {
        return 'Dual-Audio';
      }
      if (/\bDubbed\b/i.test(baseTitle)) {
        return 'Dubbed';
      }
      const languageRegex = new RegExp(
        `\\b(${Object.keys(LANGUAGE_MAP).join('|')})\\b`,
        'i'
      );
      const match = languageRegex.exec(metadataSlice);
      if (!match) return '';
      const key = match[1].toUpperCase();
      if (service && key === service) {
        return '';
      }
      return LANGUAGE_MAP[key] || match[1];
    })();

    const audioCodec = getMatchFromPatterns(AUDIO_CODEC_PATTERNS, baseTitle) || 'UNKNOWN';
    const audioChannels = (() => {
      const match = AUDIO_CHANNEL_PATTERN.exec(baseTitle);
      return match ? match[0].toUpperCase() : '';
    })();
    const audioCodecWithChannels = [audioCodec, audioChannels].filter(Boolean).join(' ');
    const atmos = /\bAtmos\b/i.test(baseTitle) ? 'Atmos' : '';
    const hdr = getMatchFromPatterns(HDR_PATTERNS, baseTitle) || 'SDR';
    const hybrid = /\bHybrid\b/i.test(baseTitle) ? 'Hybrid' : '';
    const repackProper = (() => {
      const match = /\b(REPACK(?:\d+)?|PROPER(?:\d+)?)\b/i.exec(baseTitle);
      return match ? match[1].toUpperCase() : '';
    })();
    const cut = getMatchFromPatterns(CUT_PATTERNS, baseTitle);
    const scene = (() => {
      if (!group || group === 'NOGRP') return '';
      const normalizedGroupName = normalizeSceneGroupName(group);
      if (!normalizedGroupName) return '';
      return SCENE_RELEASE_GROUPS.has(normalizedGroupName) ? 'Scene' : '';
    })();

    const partValues = {
      videoCodec,
      bitDepth,
      resolution,
      country,
      service,
      source,
      seasonEpisode,
      language,
      audio: audioCodecWithChannels,
      atmos,
      hdr,
      hybrid,
      cut,
      repack: repackProper,
      scene,
      group: group || 'NOGRP',
    };

    const isSimilarPage = window.location.pathname.includes('/similar');
    const shouldHideSeasonEpisode = CONFIG.enableGazelleTorrentLayout && isSimilarPage;

    return GAZELLIFY_SEQUENCE
      .filter((key) => !(shouldHideSeasonEpisode && key === 'seasonEpisode'))
      .map((key) => partValues[key])
      .filter(Boolean)
      .join(' / ');
  };

  const buildSearchDisplay = (text) => {
    const normalized = normalizeText(text);
    if (!normalized) return { heading: '', subtitle: '' };
    const yearMatch = normalized.match(/\b(19|20)\d{2}\b/);
    let headingTitle = normalized;
    let yearText = '';
    if (yearMatch) {
      yearText = yearMatch[0];
      headingTitle = normalized.slice(0, yearMatch.index).replace(/[-–_.]+$/g, '').trim();
    }
    if (!headingTitle) headingTitle = normalized;

    const heading = yearText ? `${headingTitle} (${yearText})` : headingTitle;
    const subtitle = formatTorrentName(normalized);
    return { heading, subtitle };
  };

  const updateDetailTitle = () => {
    if (!CONFIG.enableGazellifyDetail) return;
    const headline = document.querySelector('.torrent__name');
    if (!headline || headline.dataset.gzDetail === '1') return;
    setOriginalTitle(headline);
    const metaTitle = document.querySelector('.meta__title');
    if (!metaTitle) return;
    const titleText = getText(metaTitle.childNodes[0] || '');
    if (!titleText) return;
    const yearNode = metaTitle.querySelector('span');
    const yearText = yearNode ? yearNode.textContent.replace(/[()]/g, '').trim() : '';
    const heading = yearText ? `${titleText} (${yearText})` : titleText;
    const originalHeadline = headline.dataset.gzOriginal || headline.textContent || '';
    const subtitle = formatTorrentName(originalHeadline);
    if (!subtitle) return;

    const wrapper = create('div', 'gz-detail-title');
    const headingEl = create('div', 'gz-detail-title__heading');
    headingEl.textContent = heading;
    const subEl = create('div', 'gz-detail-title__subheading');
    applyUnknownHighlight(subEl, subtitle);
    wrapper.append(subEl);

    headline.textContent = '';
    headline.appendChild(wrapper);
    headline.dataset.gzDetail = '1';
  };

  const gazellifySearchResults = () => {
    if (!CONFIG.enableGazellifySearch) return;
    $$(SELECTORS.searchResults).forEach((link) => {
      if (!link || link.dataset.gzSearch === '1') return;
      setOriginalTitle(link);
      const container = link.closest('.torrent-search--list__overview')?.closest('tr');
      const popupTitle = container?.querySelector('.meta__poster-popup-title');
      const popupYear = container?.querySelector('.meta__poster-popup-year');
      const popupHeading = popupTitle ? popupTitle.childNodes[0]?.textContent.trim() : '';
      const popupYearText = popupYear ? popupYear.textContent.replace(/[()]/g, '').trim() : '';
      const raw = normalizeText(link.dataset.gzOriginal || link.textContent || '');
      if (!raw) return;
      const { heading, subtitle } = popupHeading
        ? {
          heading: popupYearText ? `${popupHeading} (${popupYearText})` : popupHeading,
          subtitle: formatTorrentName(raw),
        }
        : buildSearchDisplay(raw);
      if (!heading || !subtitle) return;

      link.textContent = '';
      const wrapper = create('div', 'gz-search-title');
      const headingEl = create('div', 'gz-search-title__heading');
      headingEl.textContent = heading;
      const subEl = create('div', 'gz-search-title__subheading');
      applyUnknownHighlight(subEl, subtitle);
      wrapper.append(headingEl, subEl);
      link.appendChild(wrapper);
      link.dataset.gzSearch = '1';
    });
  };

  const watchSearchResults = () => {
    if (!CONFIG.enableGazellifySearch) return;
    if (searchResultsObserver) {
      searchResultsObserver.disconnect();
      searchResultsObserver = null;
    }
    const searchPage = $(SELECTORS.torrentSearchPage);
    if (!searchPage) return;
    searchResultsObserver = new MutationObserver(() => gazellifySearchResults());
    searchResultsObserver.observe(searchPage, { childList: true, subtree: true });
  };

  const findTorrentTypeForHeading = (heading) => {
    const row = heading.closest('tr');
    if (!row) return '';
    let current = row;
    while (current) {
      const typeCell = current.querySelector('.similar-torrents__type');
      if (typeCell) return typeCell.textContent.replace(/\s+/g, ' ').trim();
      current = current.previousElementSibling;
    }
    return '';
  };

  const gazellify = () => {
    if (!CONFIG.enableGazellifySimilar) return;
    const panel = $(SELECTORS.torrentGroup);
    if (!panel) return;
    $$('.torrent-search--grouped__name', panel).forEach((heading) => {
      const link = $('a', heading);
      if (!link) return;
      setOriginalTitle(link);
      const sourceText = link.dataset.gzOriginal || link.textContent || '';
      const formatted = formatTorrentName(sourceText, {
        typeLabel: findTorrentTypeForHeading(heading),
      });
      if (formatted) {
        applyUnknownHighlight(link, formatted);
      }
    });
  };

  let torrentIconObserver;
  let torrentIconTarget;
  let searchResultsObserver;

  const stripTorrentDecorations = () => {
    $$('.torrent-icons').forEach((node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (
          child.nodeType === 1 &&
          (child.hasAttribute('data-seadex') ||
            child.classList.contains('torrent-icons__torrent-trump') ||
            child.classList.contains('torrent-icons__personal-release') ||
            child.classList.contains('torrent-icons__internal'))
        ) {
          return;
        }
        child.remove();
      });
    });

    if (!CONFIG.showEditButton) {
      $$('.torrent-search--grouped__edit a[title="Edit"]').forEach((node) => node.remove());
    }
  };

  const applyGazelleButtons = () => {
    if (!CONFIG.enableGazelleButtons) return;

    const tables = $$(SELECTORS.torrentTable);
    if (!tables.length) return;

    tables.forEach((table) => {
      // Check/Update Header
      const actionsHeader = table.querySelector('.similar-torrents__actions-header');
      if (actionsHeader && actionsHeader.getAttribute('colspan') !== '1') {
        actionsHeader.setAttribute('colspan', '1');
      }

      // Update Rows
      $$('tbody tr', table).forEach((row) => {
        // Check if already processed
        if (row.querySelector('.gz-actions-cell')) return;

        const editCell = row.querySelector('.torrent-search--grouped__edit');
        const bookmarkCell = row.querySelector('.torrent-search--grouped__bookmark');
        const downloadCell = row.querySelector('.torrent-search--grouped__download');

        if (!editCell && !bookmarkCell && !downloadCell) return;

        const newCell = create('td', 'gz-actions-cell');
        const parts = [];

        // Edit Button
        if (editCell) {
          if (CONFIG.showEditButton) {
            const link = $('a', editCell);
            if (link) {
              link.textContent = 'ED';
              link.removeAttribute('title');
              parts.push(link);
            }
          }
          editCell.remove();
        }

        // Bookmark Button
        if (bookmarkCell) {
          const btn = $('button', bookmarkCell);
          if (btn) {
            // Preserve the button but replace content
            btn.textContent = 'BM';
            parts.push(btn);
          }
          bookmarkCell.remove();
        }

        // Download Button
        if (downloadCell) {
          const link = $('a', downloadCell);
          if (link) {
            link.textContent = 'DL';
            parts.push(link);
          }
          downloadCell.remove();
        }

        // Assemble: [ ED | BM | DL ]
        newCell.appendChild(document.createTextNode('[ '));
        parts.forEach((part, index) => {
          if (index > 0) {
            newCell.appendChild(document.createTextNode(' | '));
          }
          newCell.appendChild(part);
        });
        newCell.appendChild(document.createTextNode(' ]'));

        // Insert new cell where the others were.
        const overview = row.querySelector('.torrent-search--grouped__overview');
        if (overview) {
          overview.insertAdjacentElement('afterend', newCell);
        } else {
          // Fallback
          const size = row.querySelector('.torrent-search--grouped__size');
          if (size) {
            size.insertAdjacentElement('beforebegin', newCell);
          }
        }
      });
    });
  };

  const watchTorrentDecorations = () => {
    if (!CONFIG.removeTorrentIcons && !CONFIG.enableGazelleButtons) return;

    const runTransforms = () => {
      if (CONFIG.removeTorrentIcons) stripTorrentDecorations();
      if (CONFIG.enableGazelleButtons) applyGazelleButtons();
    };

    runTransforms();

    // Observe the main torrent container group to catch changes (pagination, filters, expanding seasons)
    const targetNode = $(SELECTORS.torrentGroup);

    if (!targetNode) {
      // Fallback to table if group not found, though group is safer for multi-table pages
      const table = $(SELECTORS.torrentTable);
      if (!table) {
        if (torrentIconObserver) {
          torrentIconObserver.disconnect();
          torrentIconObserver = null;
          torrentIconTarget = null;
        }
        return;
      }
      if (torrentIconTarget === table) return;
      if (torrentIconObserver) torrentIconObserver.disconnect();
      torrentIconObserver = new MutationObserver(runTransforms);
      torrentIconObserver.observe(table, { childList: true, subtree: true });
      torrentIconTarget = table;
      return;
    }

    if (torrentIconTarget === targetNode) return;

    if (torrentIconObserver) {
      torrentIconObserver.disconnect();
    }

    torrentIconObserver = new MutationObserver(runTransforms);
    torrentIconObserver.observe(targetNode, { childList: true, subtree: true });
    torrentIconTarget = targetNode;
  };

  const createLayoutContainer = (article, referenceNode = null) => {
    const layout = create('div', 'gz-similar-layout');
    const left = create('div', 'gz-similar-layout__column gz-similar-layout__column--left');
    const right = create('div', 'gz-similar-layout__column gz-similar-layout__column--right');

    layout.append(left, right);

    const insertBefore = referenceNode || article.firstElementChild || null;
    if (insertBefore) {
      article.insertBefore(layout, insertBefore);
    } else {
      article.appendChild(layout);
    }

    return { layout, left, right };
  };

  const createMetaCard = (meta) => {
    if (!meta) return null;

    const card = create('section', 'gz-meta-card');

    const moveNode = (selector) => {
      const node = $(selector, meta);
      if (node) card.appendChild(node);
    };

    const addDivider = () => {
      card.appendChild(create('hr', 'gz-meta-divider'));
    };

    const moveChipSection = (label, title, addDividerAfter = true) => {
      const match = $$('.meta__chip-container', meta).find(
        (section) => getText(section.querySelector('.meta__heading')).toLowerCase() === label
      );
      if (!match) return;

      const heading = create('h2', 'gz-chip-heading');
      heading.textContent = title;
      card.appendChild(heading);

      const sectionHeading = match.querySelector('.meta__heading');
      if (sectionHeading) sectionHeading.remove();

      card.appendChild(match);
      if (addDividerAfter) addDivider();
    };

    [
      '.meta__title-link',
      '.meta__poster-link',
      '.work__tags',
      '.meta__ids',
      '.torrent__buttons',
      '.meta__description',
    ].forEach(moveNode);

    addDivider();
    moveChipSection('cast', 'CAST');
    moveChipSection('crew', 'CREW');
    moveChipSection('extra information', 'EXTRA INFORMATION', false);

    meta.remove();
    return card;
  };

  const expandAllTorrentGroups = () => {
    const section = $(SELECTORS.torrentGroup);
    if (!section) return;
    $$('.torrent-search--grouped__dropdown', section).forEach((dropdown) => {
      dropdown.setAttribute('open', '');
    });
  };

  // =====================
  // Torrent Dropdown Feature
  // =====================

  // Cache for fetched torrent data
  let torrentDataCache = null;
  let torrentDataPromise = null;

  // Extract TMDB ID from the page
  const getTmdbIdFromPage = () => {
    const tmdbLink = document.querySelector('li.meta__tmdb > a.meta-id-tag');
    if (tmdbLink && tmdbLink.title) {
      const match = tmdbLink.title.match(/:\s*(\d+)/);
      if (match) return parseInt(match[1], 10);
    }
    return null;
  };

  // Fetch all torrents for a given TMDB ID
  const fetchTorrentsByTmdb = async (tmdbId) => {
    if (torrentDataCache) return torrentDataCache;
    if (torrentDataPromise) return torrentDataPromise;

    if (!AITHER_API_KEY || AITHER_API_KEY === 'YOUR_API_KEY_HERE') {
      console.warn('GAZELL3D: Aither API key not configured');
      return null;
    }

    torrentDataPromise = (async () => {
      try {
        const response = await gmFetchJson(
          `https://aither.cc/api/torrents/filter?perPage=100&tmdbId=${tmdbId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${AITHER_API_KEY}`
            }
          }
        );

        if (!response || !response.data) {
          console.warn('GAZELL3D: Empty API response');
          return null;
        }

        // Build a map of torrent ID -> torrent data
        const dataMap = new Map();
        response.data.forEach(torrent => {
          dataMap.set(torrent.id, torrent.attributes);
        });
        torrentDataCache = dataMap;
        return dataMap;
      } catch (err) {
        console.error('GAZELL3D: Failed to fetch torrent data', err);
        return null;
      }
    })();

    return torrentDataPromise;
  };

  // Format bytes to human readable
  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Format date string
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  // BBCode parser - converts common BBCode to HTML
  const parseBBCode = (text) => {
    if (!text) return '';
    let html = text;

    // Escape HTML first to prevent XSS
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Process tags multiple times to handle nesting
    const processTags = (input) => {
      let result = input;
      let prevResult;

      // Keep processing until no more changes (handles nested tags)
      do {
        prevResult = result;

        // Images with size: [img=width]url[/img]
        result = result.replace(/\[img=(\d+)\](.*?)\[\/img\]/gi, '<img src="$2" class="gz-bbcode-img" style="max-width: $1px;" loading="lazy" alt="Screenshot" />');

        // Images: [img]url[/img]
        result = result.replace(/\[img\](.*?)\[\/img\]/gi, '<img src="$1" class="gz-bbcode-img" loading="lazy" alt="Screenshot" />');

        // URLs with images inside: [url=link][img...]...[/img][/url]
        result = result.replace(/\[url=([^\]]*)\](<img[^>]*>)\[\/url\]/gi, '<a href="$1" target="_blank" rel="noopener">$2</a>');

        // URLs: [url=link]text[/url]
        result = result.replace(/\[url=([^\]]*)\]([\s\S]*?)\[\/url\]/gi, '<a href="$1" target="_blank" rel="noopener">$2</a>');

        // URLs: [url]link[/url]
        result = result.replace(/\[url\](.*?)\[\/url\]/gi, '<a href="$1" target="_blank" rel="noopener">$1</a>');

        // Bold, italic, underline, strikethrough
        result = result.replace(/\[b\]([\s\S]*?)\[\/b\]/gi, '<strong>$1</strong>');
        result = result.replace(/\[i\]([\s\S]*?)\[\/i\]/gi, '<em>$1</em>');
        result = result.replace(/\[u\]([\s\S]*?)\[\/u\]/gi, '<u>$1</u>');
        result = result.replace(/\[s\]([\s\S]*?)\[\/s\]/gi, '<s>$1</s>');

        // Size: [size=N]text[/size]
        result = result.replace(/\[size=(\d+)\]([\s\S]*?)\[\/size\]/gi, '<span style="font-size: $1px;">$2</span>');

        // Color: [color=X]text[/color]
        result = result.replace(/\[color=([#\w]+)\]([\s\S]*?)\[\/color\]/gi, '<span style="color: $1;">$2</span>');

        // Center, left, right alignment
        result = result.replace(/\[center\]([\s\S]*?)\[\/center\]/gi, '<div style="text-align: center;">$1</div>');
        result = result.replace(/\[left\]([\s\S]*?)\[\/left\]/gi, '<div style="text-align: left;">$1</div>');
        result = result.replace(/\[right\]([\s\S]*?)\[\/right\]/gi, '<div style="text-align: right;">$1</div>');

        // Note: [note]text[/note]
        result = result.replace(/\[note\]([\s\S]*?)\[\/note\]/gi, '<div class="gz-bbcode-note">$1</div>');

        // Alert: [alert]text[/alert]
        result = result.replace(/\[alert\]([\s\S]*?)\[\/alert\]/gi, '<div class="gz-bbcode-alert">$1</div>');

        // Quote: [quote=author]text[/quote] and [quote]text[/quote]
        result = result.replace(/\[quote=([^\]]*)\]([\s\S]*?)\[\/quote\]/gi, '<blockquote class="gz-bbcode-quote"><cite>$1</cite>$2</blockquote>');
        result = result.replace(/\[quote\]([\s\S]*?)\[\/quote\]/gi, '<blockquote class="gz-bbcode-quote">$1</blockquote>');

        // Code: [code]text[/code]
        result = result.replace(/\[code\]([\s\S]*?)\[\/code\]/gi, '<pre class="gz-bbcode-code">$1</pre>');

        // Spoiler: [spoiler=title]text[/spoiler] and [spoiler]text[/spoiler]
        result = result.replace(/\[spoiler=([^\]]*)\]([\s\S]*?)\[\/spoiler\]/gi, '<details class="gz-bbcode-spoiler"><summary>$1</summary><div class="gz-bbcode-spoiler-content">$2</div></details>');
        result = result.replace(/\[spoiler\]([\s\S]*?)\[\/spoiler\]/gi, '<details class="gz-bbcode-spoiler"><summary>Spoiler</summary><div class="gz-bbcode-spoiler-content">$1</div></details>');

        // Hide: [hide]text[/hide]
        result = result.replace(/\[hide\]([\s\S]*?)\[\/hide\]/gi, '<details class="gz-bbcode-spoiler"><summary>Hidden Content</summary><div class="gz-bbcode-spoiler-content">$1</div></details>');

        // Comparison: [comparison=title]...[/comparison]
        result = result.replace(/\[comparison=([^\]]*)\]([\s\S]*?)\[\/comparison\]/gi, '<details class="gz-bbcode-comparison"><summary>$1</summary><div class="gz-bbcode-spoiler-content">$2</div></details>');

      } while (result !== prevResult);

      return result;
    };

    html = processTags(html);

    // Lists: [list] and [*] - handle after other tags
    // First convert [*] items
    html = html.replace(/\[\*\]\s*/g, '<li>');
    // Then wrap [list]...[/list] content
    html = html.replace(/\[list\]([\s\S]*?)\[\/list\]/gi, '<ul class="gz-bbcode-list">$1</ul>');
    // Close unclosed <li> tags (simple approach - add closing before next <li> or </ul>)
    html = html.replace(/<li>([\s\S]*?)(?=<li>|<\/ul>)/gi, '<li>$1</li>');

    // Line breaks - but not inside pre/code blocks
    // Simple approach: convert \n to <br> 
    html = html.replace(/\n/g, '<br>');

    // Clean up excessive <br> after block elements
    html = html.replace(/(<\/div>)<br>/gi, '$1');
    html = html.replace(/(<\/ul>)<br>/gi, '$1');
    html = html.replace(/(<\/li>)<br>/gi, '$1');
    html = html.replace(/(<\/details>)<br>/gi, '$1');
    html = html.replace(/(<\/blockquote>)<br>/gi, '$1');
    html = html.replace(/<br>(<\/)/gi, '$1');

    return html;
  };

  // MediaInfo parser - extracts key info into a summary
  const parseMediaInfo = (raw) => {
    if (!raw) return { summary: null, raw: '' };

    const lines = raw.split('\n');
    const info = {
      format: '',
      duration: '',
      fileSize: '',
      video: [],
      audio: [],
      subtitles: []
    };

    let currentSection = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Detect section headers
      if (trimmed === 'General' || trimmed.startsWith('General')) {
        currentSection = 'general';
      } else if (trimmed === 'Video' || trimmed.startsWith('Video')) {
        currentSection = 'video';
        info.video.push({});
      } else if (trimmed === 'Audio' || trimmed.startsWith('Audio')) {
        currentSection = 'audio';
        info.audio.push({});
      } else if (trimmed === 'Text' || trimmed.startsWith('Text')) {
        currentSection = 'text';
        info.subtitles.push({});
      } else if (trimmed.includes(':')) {
        const [key, ...valueParts] = trimmed.split(':');
        const value = valueParts.join(':').trim();
        const keyLower = key.trim().toLowerCase();

        if (currentSection === 'general') {
          if (keyLower === 'format') info.format = value;
          if (keyLower === 'duration') info.duration = value;
          if (keyLower === 'file size') info.fileSize = value;
        } else if (currentSection === 'video' && info.video.length > 0) {
          const v = info.video[info.video.length - 1];
          if (keyLower === 'format') v.format = value;
          if (keyLower === 'width') v.width = value;
          if (keyLower === 'height') v.height = value;
          if (keyLower === 'bit depth') v.bitDepth = value;
          if (keyLower === 'frame rate') v.frameRate = value;
          if (keyLower === 'hdr format') v.hdr = value;
        } else if (currentSection === 'audio' && info.audio.length > 0) {
          const a = info.audio[info.audio.length - 1];
          if (keyLower === 'format') a.format = value;
          if (keyLower === 'commercial name') a.name = value;
          if (keyLower === 'channel(s)') a.channels = value;
          if (keyLower === 'language') a.language = value;
          if (keyLower === 'bit rate') a.bitrate = value;
        } else if (currentSection === 'text' && info.subtitles.length > 0) {
          const s = info.subtitles[info.subtitles.length - 1];
          if (keyLower === 'format') s.format = value;
          if (keyLower === 'language') s.language = value;
          if (keyLower === 'title') s.title = value;
        }
      }
    }

    return { summary: info, raw };
  };

  // BDInfo parser - handles BDInfo format which is different from MediaInfo
  const parseBDInfo = (raw) => {
    if (!raw) return { summary: null, raw: '' };

    const lines = raw.split('\n');
    const info = {
      discTitle: '',
      discLabel: '',
      discSize: '',
      length: '',
      totalBitrate: '',
      video: [],
      audio: [],
      subtitles: []
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Parse key: value lines
      if (trimmed.includes(':')) {
        const colonIdx = trimmed.indexOf(':');
        const key = trimmed.substring(0, colonIdx).trim().toLowerCase();
        const value = trimmed.substring(colonIdx + 1).trim();

        if (key === 'disc title') info.discTitle = value;
        else if (key === 'disc label') info.discLabel = value;
        else if (key === 'disc size') info.discSize = value;
        else if (key === 'length') info.length = value;
        else if (key === 'total bitrate') info.totalBitrate = value;
        else if (key === 'video') {
          // Video: MPEG-4 AVC Video / 35949 kbps / 1080p / 23.976 fps / 16:9 / High Profile 4.1
          const parts = value.split('/').map(p => p.trim());
          info.video.push({
            format: parts[0] || '',
            bitrate: parts[1] || '',
            resolution: parts[2] || '',
            frameRate: parts[3] || '',
            aspectRatio: parts[4] || '',
            profile: parts[5] || ''
          });
        } else if (key === 'audio') {
          // Audio: Japanese / LPCM Audio / 2.0 / 48 kHz / 2304 kbps / 24-bit
          const parts = value.split('/').map(p => p.trim());
          info.audio.push({
            language: parts[0] || '',
            format: parts[1] || '',
            channels: parts[2] || '',
            sampleRate: parts[3] || '',
            bitrate: parts[4] || '',
            bitDepth: parts[5] || ''
          });
        } else if (key === 'subtitle') {
          // Subtitle: English / 50.053 kbps
          const parts = value.split('/').map(p => p.trim());
          info.subtitles.push({
            language: parts[0] || '',
            bitrate: parts[1] || ''
          });
        }
      }
    }

    return { summary: info, raw };
  };

  // Render BDInfo summary as HTML
  const renderBDInfoSummary = (info) => {
    const container = create('div', 'gz-mediainfo-summary');

    // General info
    if (info.discTitle || info.length || info.totalBitrate) {
      const general = create('div', 'gz-mediainfo-section');
      let details = [];
      if (info.discTitle) details.push(info.discTitle);
      if (info.length) details.push(info.length);
      if (info.totalBitrate) details.push(info.totalBitrate);
      general.innerHTML = `
        <div class="gz-mediainfo-label">Disc</div>
        <div class="gz-mediainfo-value">${details.join(' • ')}</div>
      `;
      container.appendChild(general);
    }

    // Video
    if (info.video.length > 0) {
      info.video.forEach((v, i) => {
        const videoDiv = create('div', 'gz-mediainfo-section');
        const details = [v.format, v.resolution, v.frameRate, v.bitrate].filter(Boolean).join(' • ');
        videoDiv.innerHTML = `
          <div class="gz-mediainfo-label">Video${info.video.length > 1 ? ` #${i + 1}` : ''}</div>
          <div class="gz-mediainfo-value">${details || 'Unknown'}</div>
        `;
        container.appendChild(videoDiv);
      });
    }

    // Audio
    if (info.audio.length > 0) {
      info.audio.forEach((a, i) => {
        const audioDiv = create('div', 'gz-mediainfo-section');
        const details = [a.language, a.format, a.channels, a.bitrate].filter(Boolean).join(' • ');
        audioDiv.innerHTML = `
          <div class="gz-mediainfo-label">Audio${info.audio.length > 1 ? ` #${i + 1}` : ''}</div>
          <div class="gz-mediainfo-value">${details || 'Unknown'}</div>
        `;
        container.appendChild(audioDiv);
      });
    }

    // Subtitles
    if (info.subtitles.length > 0) {
      const subDiv = create('div', 'gz-mediainfo-section');
      const subList = info.subtitles.map(s => s.language || 'Unknown').join(', ');
      subDiv.innerHTML = `
        <div class="gz-mediainfo-label">Subtitles (${info.subtitles.length})</div>
        <div class="gz-mediainfo-value">${subList}</div>
      `;
      container.appendChild(subDiv);
    }

    return container;
  };

  // Render parsed MediaInfo as HTML
  const renderMediaInfoSummary = (info) => {
    const container = create('div', 'gz-mediainfo-summary');

    // General info
    if (info.format || info.duration || info.fileSize) {
      const general = create('div', 'gz-mediainfo-section');
      general.innerHTML = `
        <div class="gz-mediainfo-label">General</div>
        <div class="gz-mediainfo-value">
          ${info.format ? `<span>${info.format}</span>` : ''}
          ${info.duration ? `<span>• ${info.duration}</span>` : ''}
          ${info.fileSize ? `<span>• ${info.fileSize}</span>` : ''}
        </div>
      `;
      container.appendChild(general);
    }

    // Video
    if (info.video.length > 0) {
      info.video.forEach((v, i) => {
        const videoDiv = create('div', 'gz-mediainfo-section');
        const res = v.width && v.height ? `${v.width} × ${v.height}` : '';
        const details = [v.format, res, v.bitDepth, v.frameRate, v.hdr].filter(Boolean).join(' • ');
        videoDiv.innerHTML = `
          <div class="gz-mediainfo-label">Video${info.video.length > 1 ? ` #${i + 1}` : ''}</div>
          <div class="gz-mediainfo-value">${details || 'Unknown'}</div>
        `;
        container.appendChild(videoDiv);
      });
    }

    // Audio
    if (info.audio.length > 0) {
      info.audio.forEach((a, i) => {
        const audioDiv = create('div', 'gz-mediainfo-section');
        const name = a.name || a.format || 'Unknown';
        const details = [name, a.channels, a.language, a.bitrate].filter(Boolean).join(' • ');
        audioDiv.innerHTML = `
          <div class="gz-mediainfo-label">Audio${info.audio.length > 1 ? ` #${i + 1}` : ''}</div>
          <div class="gz-mediainfo-value">${details}</div>
        `;
        container.appendChild(audioDiv);
      });
    }

    // Subtitles
    if (info.subtitles.length > 0) {
      const subDiv = create('div', 'gz-mediainfo-section');
      const subList = info.subtitles.map(s => {
        const parts = [s.language, s.title, s.format].filter(Boolean);
        return parts.length > 0 ? parts.join(' ') : 'Unknown';
      }).join(', ');
      subDiv.innerHTML = `
        <div class="gz-mediainfo-label">Subtitles (${info.subtitles.length})</div>
        <div class="gz-mediainfo-value">${subList}</div>
      `;
      container.appendChild(subDiv);
    }

    return container;
  };

  // Render the dropdown content for a torrent
  const renderTorrentDropdown = (torrentData, colSpan) => {
    const container = create('div', 'gz-dropdown-container');

    // Header: Uploaded by X on Date
    const header = create('div', 'gz-dropdown-header');
    const uploader = torrentData.uploader || 'Anonymous';
    const uploadDate = formatDate(torrentData.created_at);
    header.innerHTML = `Uploaded by <strong>${uploader}</strong> on <span>${uploadDate}</span>`;
    container.appendChild(header);

    // Tabs
    const tabs = create('div', 'gz-dropdown-tabs');
    const panels = create('div', 'gz-dropdown-panels');

    // Determine which tabs to show
    const tabsConfig = [
      { id: 'description', label: 'Description', hasContent: true },
      { id: 'filelist', label: 'File List', hasContent: torrentData.files && torrentData.files.length > 0 }
    ];

    // Mediainfo / Bdinfo - show whichever is not empty, prefer mediainfo if both exist
    const hasMediainfo = torrentData.media_info && torrentData.media_info.trim();
    const hasBdinfo = torrentData.bd_info && torrentData.bd_info.trim();
    if (hasMediainfo) {
      tabsConfig.push({ id: 'mediainfo', label: 'Mediainfo', hasContent: true, content: torrentData.media_info });
    } else if (hasBdinfo) {
      tabsConfig.push({ id: 'bdinfo', label: 'Bdinfo', hasContent: true, content: torrentData.bd_info });
    }

    // Create tabs and panels
    tabsConfig.forEach((config, index) => {
      if (!config.hasContent && config.id !== 'description') return;

      const tab = create('button', 'gz-dropdown-tab');
      tab.textContent = config.label;
      tab.dataset.tab = config.id;
      if (index === 0) tab.classList.add('active');

      const panel = create('div', 'gz-dropdown-panel');
      panel.dataset.panel = config.id;
      if (index === 0) panel.classList.add('active');

      // Populate panel content
      if (config.id === 'description') {
        panel.classList.add('gz-dropdown-description');
        panel.innerHTML = parseBBCode(torrentData.description || '');
      } else if (config.id === 'filelist') {
        panel.classList.add('gz-dropdown-filelist');

        // Show root folder name if available
        if (torrentData.folder) {
          const folderInfo = create('div', 'gz-filelist-root-info');
          folderInfo.innerHTML = `<strong>Folder:</strong> ${torrentData.folder}`;
          panel.appendChild(folderInfo);
        }

        // Natural sort function
        const naturalSort = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

        // Build a nested tree structure
        const buildTree = (files) => {
          const root = { folders: {}, files: [] };

          files.forEach(file => {
            const filePath = file.name || file;
            const parts = filePath.split('/');
            let current = root;

            // Navigate/create folder structure
            for (let i = 0; i < parts.length - 1; i++) {
              const folderName = parts[i];
              if (!current.folders[folderName]) {
                current.folders[folderName] = { folders: {}, files: [] };
              }
              current = current.folders[folderName];
            }

            // Add file to the deepest folder
            current.files.push({
              name: parts[parts.length - 1],
              size: file.size
            });
          });

          return root;
        };

        // Count all files recursively in a folder
        const countFiles = (node) => {
          let count = node.files.length;
          Object.values(node.folders).forEach(subfolder => {
            count += countFiles(subfolder);
          });
          return count;
        };

        // Recursively render the tree
        let folderIdCounter = 0;
        const renderTree = (node, depth = 0, parentId = null) => {
          const rows = [];
          const indentPx = depth * 28; // Indentation in pixels (bigger for visibility)

          // Get sorted folder names and file names
          const folderNames = Object.keys(node.folders).sort(naturalSort);
          const sortedFiles = [...node.files].sort((a, b) => naturalSort(a.name, b.name));

          // Render folders first
          folderNames.forEach(folderName => {
            const folder = node.folders[folderName];
            const fileCount = countFiles(folder);
            const folderId = `f${++folderIdCounter}`;
            const isHidden = parentId !== null;

            // Folder row (clickable)
            rows.push(`
              <tr class="gz-filelist-folder-row" data-folder-id="${folderId}" ${parentId ? `data-parent="${parentId}"` : ''} data-depth="${depth}" ${isHidden ? 'style="display:none;"' : ''}>
                <td>
                  <span class="gz-tree-indent" style="display:inline-block; width:${indentPx}px; min-width:${indentPx}px;"></span>
                  <span class="gz-folder-toggle">▶</span>
                  <span class="gz-folder-icon">📁</span>
                  <span class="gz-folder-name">${folderName}</span>
                  <span class="gz-folder-count">(${fileCount} files)</span>
                </td>
                <td></td>
              </tr>
            `);

            // Nested content (all have this folder as parent)
            const nestedRows = renderTree(folder, depth + 1, folderId);
            rows.push(...nestedRows);
          });

          // Render files
          sortedFiles.forEach(file => {
            const isHidden = parentId !== null;

            rows.push(`
              <tr class="gz-filelist-file-row" ${parentId ? `data-parent="${parentId}"` : ''} data-depth="${depth}" ${isHidden ? 'style="display:none;"' : ''}>
                <td>
                  <span class="gz-tree-indent" style="display:inline-block; width:${indentPx}px; min-width:${indentPx}px;"></span>
                  ${file.name}
                </td>
                <td>${file.size ? formatBytes(file.size) : ''}</td>
              </tr>
            `);
          });

          return rows;
        };

        const files = torrentData.files || [];
        const tree = buildTree(files);
        const treeRows = renderTree(tree);

        const table = create('table');
        table.innerHTML = `
          <thead>
            <tr>
              <th>File Name</th>
              <th>Size</th>
            </tr>
          </thead>
          <tbody>
            ${treeRows.join('')}
          </tbody>
        `;

        // Add click handlers for folder expansion
        table.addEventListener('click', (e) => {
          const folderRow = e.target.closest('.gz-filelist-folder-row');
          if (!folderRow) return;

          e.stopPropagation();

          const folderId = folderRow.dataset.folderId;
          const toggle = folderRow.querySelector('.gz-folder-toggle');
          const isExpanded = toggle.textContent === '▼';

          if (isExpanded) {
            // Collapse: hide all nested rows recursively
            const hideRecursive = (parentId) => {
              table.querySelectorAll(`tr[data-parent="${parentId}"]`).forEach(row => {
                row.style.display = 'none';
                // Also collapse any expanded subfolders
                if (row.classList.contains('gz-filelist-folder-row')) {
                  const nestedToggle = row.querySelector('.gz-folder-toggle');
                  if (nestedToggle) nestedToggle.textContent = '▶';
                  hideRecursive(row.dataset.folderId);
                }
              });
            };
            hideRecursive(folderId);
            toggle.textContent = '▶';
          } else {
            // Expand: show direct children only
            table.querySelectorAll(`tr[data-parent="${folderId}"]`).forEach(row => {
              row.style.display = '';
            });
            toggle.textContent = '▼';
          }
        });

        // Debug: Log tree structure
        const allRows = table.querySelectorAll('tbody tr');
        const hiddenRows = Array.from(allRows).filter(r => r.style.display === 'none');
        console.log('GAZELL3D: File tree rendered. Total rows:', allRows.length, 'Hidden:', hiddenRows.length);

        panel.appendChild(table);
      } else if (config.id === 'mediainfo' || config.id === 'bdinfo') {
        panel.classList.add('gz-dropdown-mediainfo');

        // Parse and display summary based on type
        if (config.id === 'bdinfo') {
          const parsed = parseBDInfo(config.content);
          if (parsed.summary) {
            panel.appendChild(renderBDInfoSummary(parsed.summary));
          }
        } else {
          const parsed = parseMediaInfo(config.content);
          if (parsed.summary) {
            panel.appendChild(renderMediaInfoSummary(parsed.summary));
          }
        }

        // Add expandable raw content
        const details = create('details', 'gz-mediainfo-raw-container');
        const summary = create('summary');
        summary.textContent = config.id === 'bdinfo' ? 'Show Full BDInfo' : 'Show Full MediaInfo';
        details.appendChild(summary);

        const pre = create('pre', 'gz-mediainfo-raw');
        pre.textContent = config.content;
        details.appendChild(pre);

        panel.appendChild(details);
      }

      tab.addEventListener('click', () => {
        // Remove active from all tabs and panels
        tabs.querySelectorAll('.gz-dropdown-tab').forEach(t => t.classList.remove('active'));
        panels.querySelectorAll('.gz-dropdown-panel').forEach(p => p.classList.remove('active'));
        // Add active to clicked tab and corresponding panel
        tab.classList.add('active');
        panel.classList.add('active');
      });

      tabs.appendChild(tab);
      panels.appendChild(panel);
    });

    container.appendChild(tabs);
    container.appendChild(panels);

    return container;
  };

  // Create a loading dropdown row
  const createLoadingDropdownRow = (colSpan) => {
    const dropdownRow = create('tr', 'gz-dropdown-row');
    const td = create('td');
    td.setAttribute('colspan', colSpan);
    td.innerHTML = '<div class="gz-dropdown-loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
    dropdownRow.appendChild(td);
    return dropdownRow;
  };

  // Create an error dropdown row
  const createErrorDropdownRow = (colSpan, message) => {
    const dropdownRow = create('tr', 'gz-dropdown-row');
    const td = create('td');
    td.setAttribute('colspan', colSpan);
    td.innerHTML = `<div class="gz-dropdown-error">${message}</div>`;
    dropdownRow.appendChild(td);
    return dropdownRow;
  };

  const gazellifyTorrentLayout = (article) => {
    const section = $(SELECTORS.torrentGroup, article);
    if (!section) return;

    // 1. Detect Mode
    // TV Mode: Has 'summary[x-bind="season"]' or 'summary[x-bind="specials"]' inside details
    const seasonDetails = Array.from(section.querySelectorAll('summary[x-bind="season"], summary[x-bind="specials"]'))
      .map(summary => summary.closest('details'))
      .filter(Boolean);

    const isSeasonLayout = seasonDetails.length > 0;

    // Movie Mode: If no seasons, look for the main torrent table rows directly
    let movieRows = [];
    if (!isSeasonLayout) {
      // Use querySelectorAll to get rows from ALL tbodys (essential for movies with multiple types)
      // Flatten NodeList to Array
      const tableRows = section.querySelectorAll('.similar-torrents__torrents tbody tr, .data-table-wrapper table tbody tr');
      if (tableRows.length > 0) {
        movieRows = Array.from(tableRows);
      } else {
        return; // Nothing to process
      }
    }

    const newTable = create('table', 'gz-torrent-table');

    const thead = create('thead');
    // Conditionally include Actions header
    const actionsHeader = CONFIG.enableGazelleButtons ? '<th class="gz-col-actions">Actions</th>' : '';
    // NOTE: Episode/Season header removed; using mini-headers instead.

    thead.innerHTML = `
        <tr>
            <th class="gz-col-type">Type</th>
            <th class="gz-col-name">Release</th>
            ${actionsHeader}
            <th class="gz-col-size">Size</th>
            <th class="gz-col-stat" title="Snatched"><i class="fas fa-save"></i></th>
            <th class="gz-col-stat" title="Seeders"><i class="fas fa-arrow-up"></i></th>
            <th class="gz-col-stat" title="Leechers"><i class="fas fa-arrow-down"></i></th>
        </tr>
    `;
    newTable.appendChild(thead);

    const tbody = create('tbody');
    let rowIdCounter = 0;

    // Shared row processing logic
    const processRows = (rows, episodeId) => {
      // Insert Group Header (Mini-header) if Season Layout
      // This replaces the Episode/Season column
      if (isSeasonLayout && episodeId) {
        const groupRow = create('tr', 'gz-group-header');
        // Colspan: Type(1) + Rel(1) + Act?(1) + Size(1) + Snatch(1) + Seed(1) + Leech(1) = 6 or 7
        const colSpan = CONFIG.enableGazelleButtons ? 7 : 6;
        groupRow.innerHTML = `<td colspan="${colSpan}">${episodeId}</td>`;
        tbody.appendChild(groupRow);
      }

      let currentType = '';
      let lastPrintedType = null;
      let firstInGroup = true;

      rows.forEach(row => {
        // Extract Type if present (rowspan header)
        const typeHeader = row.querySelector('.similar-torrents__type');
        if (typeHeader) {
          currentType = normalizeText(typeHeader.textContent);
        }

        const nameLink = row.querySelector('.torrent-search--grouped__name a');
        if (!nameLink) return;

        // Assign Sync ID
        const syncId = `gz-sync-${++rowIdCounter}`;
        row.dataset.gzSyncId = syncId;

        const newRow = create('tr');
        newRow.dataset.gzSyncId = syncId;

        // 1. Episode/Season Column -> REMOVED (Replaced by header)

        // 2. Type Column
        const tdType = create('td', 'gz-col-type');
        if (currentType !== lastPrintedType) {
          tdType.textContent = currentType;
          lastPrintedType = currentType;
        }
        newRow.appendChild(tdType);

        // 3. Release Column (Name + Icons)
        const tdName = create('td', 'gz-col-name');
        const iconSpan = create('span', 'gz-torrent-icons');

        const updateIcons = () => {
          iconSpan.innerHTML = '';
          const originalIcons = row.querySelector('.torrent-icons');
          if (originalIcons) {
            Array.from(originalIcons.children).forEach(icon => {
              // Filter text nodes but keep elements
              if (icon.nodeType !== 1) return;

              // Apply filtering logic
              const isKeep = icon.hasAttribute('data-seadex') ||
                icon.classList.contains('torrent-icons__torrent-trump') ||
                icon.classList.contains('torrent-icons__personal-release') ||
                icon.classList.contains('torrent-icons__internal');

              if (CONFIG.removeTorrentIcons && !isKeep) {
                return;
              }

              // Skip comment icon always
              if (icon.classList.contains('fa-comment-alt-plus') || icon.classList.contains('torrent-icons__comments')) return;

              iconSpan.appendChild(icon.cloneNode(true));
            });
          }
        };
        updateIcons(); // Initial population

        const newLink = nameLink.cloneNode(true);
        newLink.className = 'torrent-name-link';

        // Extract torrent ID from URL for dropdown feature
        const torrentUrl = nameLink.href || '';
        const torrentIdMatch = torrentUrl.match(/\/torrents\/(\d+)/);
        const torrentId = torrentIdMatch ? torrentIdMatch[1] : null;

        // Add dropdown functionality if enabled
        if (CONFIG.enableTorrentDropdowns && torrentId) {
          newLink.classList.add('gz-clickable');
          newLink.dataset.torrentId = torrentId;

          newLink.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const colSpan = CONFIG.enableGazelleButtons ? 7 : 6;
            const existingDropdown = newRow.nextElementSibling;

            // Toggle existing dropdown
            if (existingDropdown && existingDropdown.classList.contains('gz-dropdown-row')) {
              existingDropdown.remove();
              return;
            }

            // Create loading state
            const loadingRow = createLoadingDropdownRow(colSpan);
            newRow.insertAdjacentElement('afterend', loadingRow);

            // Fetch torrent data
            const tmdbId = getTmdbIdFromPage();
            if (!tmdbId) {
              loadingRow.replaceWith(createErrorDropdownRow(colSpan, 'Could not detect TMDB ID'));
              return;
            }

            const torrentDataMap = await fetchTorrentsByTmdb(tmdbId);
            if (!torrentDataMap) {
              loadingRow.replaceWith(createErrorDropdownRow(colSpan, 'Failed to fetch torrent data. Check API key.'));
              return;
            }

            const torrentData = torrentDataMap.get(torrentId);
            if (!torrentData) {
              loadingRow.replaceWith(createErrorDropdownRow(colSpan, 'Torrent data not found in API response'));
              return;
            }

            // Render dropdown
            const dropdownRow = create('tr', 'gz-dropdown-row');
            const td = create('td');
            td.setAttribute('colspan', colSpan);
            td.appendChild(renderTorrentDropdown(torrentData, colSpan));
            dropdownRow.appendChild(td);

            loadingRow.replaceWith(dropdownRow);
          });
        }

        // Appending Order: Name then Icons (Icons on the right)
        tdName.appendChild(newLink);
        tdName.appendChild(iconSpan);
        newRow.appendChild(tdName);

        // 4. Actions Column [ ED | BM | DL ] - Only if Enabled
        if (CONFIG.enableGazelleButtons) {
          const tdActions = create('td', 'gz-actions-cell');
          const actions = [];

          // Edit
          if (CONFIG.showEditButton) {
            const editLink = row.querySelector('.torrent-search--grouped__edit a');
            if (editLink) {
              const el = create('a');
              el.href = editLink.href;
              el.textContent = 'ED';
              el.title = 'Edit';
              actions.push(el);
            }
          }

          // Bookmark or Torrent Page link (depending on dropdown mode)
          if (CONFIG.enableTorrentDropdowns && torrentUrl) {
            // When dropdowns are enabled, show TP (Torrent Page) link instead of bookmark
            const tp = create('a');
            tp.href = torrentUrl;
            tp.textContent = 'TP';
            tp.title = 'Torrent Page';
            tp.target = '_blank';
            tp.rel = 'noopener';
            actions.push(tp);
          } else {
            // Normal bookmark button
            const bookmarkBtn = row.querySelector('.torrent-search--grouped__bookmark button');
            if (bookmarkBtn) {
              const bmClone = bookmarkBtn.cloneNode(true);
              bmClone.textContent = 'BM';
              bmClone.title = 'Bookmark';
              bmClone.classList.remove('form__button');
              bmClone.style.background = 'none';
              bmClone.style.border = 'none';
              bmClone.style.cursor = 'pointer';
              bmClone.style.padding = '0';
              bmClone.style.color = 'inherit';
              actions.push(bmClone);
            }
          }

          // Download
          const dlLink = row.querySelector('.torrent-search--grouped__download a');
          if (dlLink) {
            const dl = create('a');
            dl.href = dlLink.href;
            dl.textContent = 'DL';
            dl.title = 'Download';
            actions.push(dl);
          }

          actions.forEach((act, idx) => {
            tdActions.appendChild(act);
            if (idx < actions.length - 1) {
              tdActions.appendChild(document.createTextNode(' | '));
            }
          });

          if (actions.length > 0) {
            tdActions.prepend(document.createTextNode('[ '));
            tdActions.appendChild(document.createTextNode(' ]'));
          }
          newRow.appendChild(tdActions);
        }

        // 5. Size
        const tdSize = create('td', 'gz-col-size');
        const sizeCell = row.querySelector('.torrent-search--grouped__size');
        tdSize.textContent = getText(sizeCell);
        newRow.appendChild(tdSize);

        // 6. Snatched
        const tdSnatched = create('td', 'gz-col-stat');
        const snatchedCell = row.querySelector('.torrent-search--grouped__completed, .torrent__times-completed-count');
        const snatchedLink = snatchedCell ? (snatchedCell.tagName === 'A' ? snatchedCell : snatchedCell.querySelector('a')) : null;
        if (snatchedLink) {
          const link = create('a');
          link.href = snatchedLink.href;
          link.textContent = getText(snatchedCell);
          link.style.color = 'inherit';
          link.style.textDecoration = 'none';
          tdSnatched.appendChild(link);
        } else {
          tdSnatched.textContent = getText(snatchedCell);
        }
        if (snatchedCell) {
          if (snatchedCell.classList) {
            snatchedCell.classList.forEach(cls => {
              if (cls.startsWith('torrent-activity-indicator--')) {
                tdSnatched.classList.add(cls);
              }
            });
          }
          if (snatchedCell.title) tdSnatched.title = snatchedCell.title;
        }
        newRow.appendChild(tdSnatched);

        // 7. Seeders
        const tdSeeders = create('td', 'gz-col-stat');
        const seedersCell = row.querySelector('.torrent-search--grouped__seeders, .torrent__seeder-count');
        const seedersLink = seedersCell ? (seedersCell.tagName === 'A' ? seedersCell : seedersCell.querySelector('a')) : null;
        if (seedersLink) {
          const link = create('a');
          link.href = seedersLink.href;
          link.textContent = getText(seedersCell);
          link.style.color = 'inherit';
          link.style.textDecoration = 'none';
          tdSeeders.appendChild(link);
        } else {
          tdSeeders.textContent = getText(seedersCell);
        }
        tdSeeders.style.color = '#76dba6';
        if (seedersCell) {
          if (seedersCell.classList) {
            seedersCell.classList.forEach(cls => {
              if (cls.startsWith('torrent-activity-indicator--')) {
                tdSeeders.classList.add(cls);
              }
            });
          }
          if (seedersCell.title) tdSeeders.title = seedersCell.title;
        }
        newRow.appendChild(tdSeeders);

        // 8. Leechers
        const tdLeechers = create('td', 'gz-col-stat');
        const leechersCell = row.querySelector('.torrent-search--grouped__leechers, .torrent__leecher-count');
        const leechersLink = leechersCell ? (leechersCell.tagName === 'A' ? leechersCell : leechersCell.querySelector('a')) : null;
        if (leechersLink) {
          const link = create('a');
          link.href = leechersLink.href;
          link.textContent = getText(leechersCell);
          link.style.color = 'inherit';
          link.style.textDecoration = 'none';
          tdLeechers.appendChild(link);
        } else {
          tdLeechers.textContent = getText(leechersCell);
        }
        tdLeechers.style.color = '#db7676';
        if (leechersCell) {
          if (leechersCell.classList) {
            leechersCell.classList.forEach(cls => {
              if (cls.startsWith('torrent-activity-indicator--')) {
                tdLeechers.classList.add(cls);
              }
            });
          }
          if (leechersCell.title) tdLeechers.title = leechersCell.title;
        }
        newRow.appendChild(tdLeechers);

        tbody.appendChild(newRow);
      });
    };

    if (isSeasonLayout) {
      // Sort seasons: Regular seasons first (numeric descending), then Specials (last)
      seasonDetails.sort((a, b) => {
        const ta = normalizeText(getText(a.querySelector('summary')));
        const tb = normalizeText(getText(b.querySelector('summary')));

        // Check for Specials
        const isSpecA = ta.toLowerCase().includes('special');
        const isSpecB = tb.toLowerCase().includes('special');
        if (isSpecA && !isSpecB) return 1;
        if (!isSpecA && isSpecB) return -1;
        if (isSpecA && isSpecB) return 0;

        // Sort by Season Number (Descending)
        const na = parseInt((ta.match(/\d+/) || ['0'])[0]);
        const nb = parseInt((tb.match(/\d+/) || ['0'])[0]);
        return nb - na;
      });

      seasonDetails.forEach(season => {
        const seasonSummary = normalizeText(getText(season.querySelector('summary')));

        // Determine prefix (S01 or S00 for Specials)
        const isSpecials = seasonSummary.toLowerCase().includes('special');
        let seasonPrefix = 'S??';
        if (isSpecials) {
          seasonPrefix = 'S00';
        } else {
          const seasonNumMatch = seasonSummary.match(/(\d+)/);
          if (seasonNumMatch) {
            seasonPrefix = `S${seasonNumMatch[0].padStart(2, '0')}`;
          }
        }

        // Header Row (Main Season Header)
        // Colspan: 6 (base) or 7 (with actions)
        const colSpan = CONFIG.enableGazelleButtons ? 7 : 6;
        const seasonRow = create('tr', 'gz-season-header');
        seasonRow.innerHTML = `<td colspan="${colSpan}">${seasonSummary}</td>`;
        tbody.appendChild(seasonRow);

        // 1. Check for Season Packs (mixed content)
        const packSummaries = Array.from(season.querySelectorAll('summary[x-bind="pack"]'));
        // Include both Episode and Special inner items
        const episodeSummaries = Array.from(season.querySelectorAll('summary[x-bind="episode"], summary[x-bind="special"]'));
        const hasEpisodes = episodeSummaries.length > 0;

        if (packSummaries.length > 0) {
          packSummaries.forEach(packSummary => {
            const packDetails = packSummary.closest('details');
            const table = packDetails.querySelector('table');
            // If episodes exist, use "S01" to distinguish packs from episodes.
            // If NO episodes exist, the main Season header is enough; hide the mini-header.
            const label = hasEpisodes ? seasonPrefix : '';
            if (table) processRows($$('tbody tr', table), label);
          });
        }

        // 2. Check for nested episodes
        if (hasEpisodes) {
          // Handle Episodic/Special content
          episodeSummaries.forEach(epSummary => {
            const epDetails = epSummary.closest('details');
            const epText = normalizeText(getText(epSummary));
            // Match "Episode 1" or "Special 1" or simple numbers
            const epNumMatch = epText.match(/(?:Episode|Special)\s*(\d+)/i) || epText.match(/(\d+)/);
            const epNum = epNumMatch ? epNumMatch[1].padStart(2, '0') : '??';
            const epId = `${seasonPrefix}E${epNum}`;

            const table = epDetails.querySelector('table');
            if (table) processRows($$('tbody tr', table), epId);
          });
        }

        // 3. Fallback: Direct table if NO packs and NO episodes
        if (packSummaries.length === 0 && !hasEpisodes) {
          // Handle Direct content (no nested structure found)
          const table = season.querySelector('table');
          if (table) {
            // Pass empty string to avoid duplicating the Season header
            processRows($$('tbody tr', table), '');
          }
        }
      });
    } else {
      // Movie Layout (Flat)
      processRows(movieRows, '');
    }

    newTable.appendChild(tbody);

    const wrapper = section.querySelector('.data-table-wrapper') || section;

    // Hide original content locally instead of removing it from DOM
    // This allows other scripts (like Seadex) to find the original rows and modify them
    Array.from(wrapper.children).forEach(child => {
      if (!child.classList.contains('gz-torrent-table')) {
        child.style.display = 'none';
      }
    });

    wrapper.appendChild(newTable);

    // Observe the original hidden wrapper for changes (like Async Seadex icons)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          // Check if the mutation happened inside a .torrent-icons span
          const target = mutation.target;
          if (target.matches && (target.matches('.torrent-icons') || target.closest('.torrent-icons'))) {
            const row = target.closest('tr');
            const syncId = row ? row.dataset.gzSyncId : null;
            if (syncId) {
              const newRow = newTable.querySelector(`tr[data-gz-sync-id="${syncId}"]`);
              // Trigger icon update on the new row
              if (newRow) {
                // We need to re-run the exact icon-copy logic.
                // Since 'updateIcons' is scoped, we duplicate the logic here or make it accessible.
                const iconSpan = newRow.querySelector('.gz-torrent-icons');
                if (iconSpan) {
                  iconSpan.innerHTML = ''; // Rebuild
                  const originalIcons = row.querySelector('.torrent-icons');
                  if (originalIcons) {
                    Array.from(originalIcons.children).forEach(icon => {
                      if (icon.nodeType !== 1) return;
                      const isKeep = icon.hasAttribute('data-seadex') ||
                        icon.classList.contains('torrent-icons__torrent-trump') ||
                        icon.classList.contains('torrent-icons__personal-release') ||
                        icon.classList.contains('torrent-icons__internal');
                      if (CONFIG.removeTorrentIcons && !isKeep) return;
                      if (icon.classList.contains('fa-comment-alt-plus') || icon.classList.contains('torrent-icons__comments')) return;
                      iconSpan.appendChild(icon.cloneNode(true));
                    });
                  }
                }
              }
            }
          }
        }
      });
    });

    observer.observe(wrapper, { childList: true, subtree: true });

    // Remove "Expand all" button
    const expandBtn = section.querySelector('.panel__actions button[x-bind="all"]');
    if (expandBtn) expandBtn.parentElement.remove();
  };

  const buildSimilarLayout = (article = $(SELECTORS.similarArticle)) => {
    if (!article) return false;

    gazellify();

    if (CONFIG.enableGazelleTorrentLayout) {
      gazellifyTorrentLayout(article);
      const filters = article.querySelector('.compact-search.similar-torrents__filters');
      if (filters) filters.remove();
    } else {
      expandAllTorrentGroups();
      watchTorrentDecorations();
    }

    if (article.querySelector(':scope > .gz-similar-layout')) return true;
    if (!CONFIG.enableSideLayout) return true;

    const meta = $(SELECTORS.metaSection, article);
    const torrents = $(SELECTORS.torrentGroup, article);
    if (!meta || !torrents) return false;

    const extraPanels = ['requests', 'playlists', 'collection', 'Also downloaded']
      .map((label) => findPanelByHeading(label))
      .filter(Boolean);

    removeNode($(SELECTORS.searchBox, article));

    const { left, right } = createLayoutContainer(article, article.firstElementChild);

    appendAll(left, [torrents, ...extraPanels]);

    const card = createMetaCard(meta);
    if (!card) return false;
    right.appendChild(card);

    return true;
  };

  const buildTorrentLayout = (article = $(SELECTORS.torrentArticle)) => {
    if (!article) return false;

    updateDetailTitle();

    if (article.querySelector(':scope > .gz-similar-layout')) return true;
    if (!CONFIG.enableSideLayout) return true;

    const meta = $(SELECTORS.metaSection, article);
    if (!meta) return false;

    const torrentButtons = $(SELECTORS.torrentButtons, article);

    const fragment = document.createDocumentFragment();
    Array.from(article.children).forEach((child) => {
      if (child === meta || child === torrentButtons) return;
      fragment.appendChild(child);
    });

    const { left, right } = createLayoutContainer(article, meta);
    left.appendChild(fragment);

    if (torrentButtons) {
      const inline = create('div', 'gz-inline-buttons');
      Array.from(torrentButtons.children)
        .filter((node) => node.matches && node.matches('.form__group'))
        .forEach((node) => inline.appendChild(node));
      torrentButtons.remove();

      const buttonsWrapper = create('div', 'torrent__buttons');
      buttonsWrapper.appendChild(inline);

      const tagBar = $(SELECTORS.tagBar, left);
      if (tagBar) {
        tagBar.insertAdjacentElement('afterend', buttonsWrapper);
      } else {
        left.insertBefore(buttonsWrapper, left.firstElementChild || null);
      }
    }

    const card = createMetaCard(meta);
    if (!card) return false;
    right.appendChild(card);

    return true;
  };

  const initPage = () => {
    if ($(SELECTORS.layout)) return true;

    const similarArticle = $(SELECTORS.similarArticle);
    if (similarArticle) {
      return buildSimilarLayout(similarArticle);
    }

    const torrentArticle = $(SELECTORS.torrentArticle);
    if (torrentArticle) {
      return buildTorrentLayout(torrentArticle);
    }

    const searchPage = $(SELECTORS.torrentSearchPage);
    if (searchPage) {
      if (CONFIG.enableGazellifySearch) {
        gazellifySearchResults();
        watchSearchResults();
      }
      return true;
    }

    return false;
  };

  const initApp = async () => {
    try {
      const config = await loadConfig();
      SCENE_RELEASE_GROUPS = new Set((config.SCENE_RELEASE_GROUPS || []).map(normalizeSceneGroupName));
      SERVICE_TOKENS = config.SERVICE_TOKENS || [];
      COUNTRY_MAP = config.COUNTRY_MAP || {};
      LANGUAGE_MAP = config.LANGUAGE_MAP || {};

      // Initialize dependent sets
      RELEASE_GROUP_BLOCK_TOKENS = initReleaseGroupBlockTokens();

      injectStyles(STYLE);
      if (CONFIG.enableOriginalTitleTooltip) {
        initTooltip();
      }

      if (initPage()) return;

      const observer = new MutationObserver(() => {
        if (initPage()) observer.disconnect();
      });

      observer.observe(document.body, { childList: true, subtree: true });

    } catch (e) {
      console.error('GAZELL3D: Initialization failed', e);
    }
  };

  ready(initApp);
})();
