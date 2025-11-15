// ==UserScript==
// @name         GAZELL3D
// @namespace    https://github.com/anonymoize/GAZELL3D/
// @version      1.1.3
// @description  Reimagine UNIT3D-based torrent pages for readability with a two-column layout, richer metadata presentation, cleaner torrent naming, and minor quality-of-life tweaks.
// @match        https://aither.cc/torrents/*
// @match        https://aither.cc/torrents*
// @match        https://blutopia.cc/torrents/*
// @match        https://blutopia.cc/torrents*
// @updateURL    https://github.com/anonymoize/GAZELL3D/raw/refs/heads/main/GAZELL3D.js
// @downloadURL  https://github.com/anonymoize/GAZELL3D/raw/refs/heads/main/GAZELL3D.js
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  'use strict';

  const CONFIG = Object.freeze({
    removeTorrentIcons: true,
    enableGazellifySimilar: true,
    enableGazellifyDetail: true,
    enableGazellifySearch: true,
    enableOriginalTitleTooltip: true,
  });

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
    { regex: /\bHEVC\b|\bH\.?265\b|\bH265\b|\bx265\b/i, value: 'H265' },
    { regex: /\bAVC\b|\bH\.?264\b|\bH264\b|\bx264\b/i, value: 'H264' },
    { regex: /\bVVC\b|\bH\.?266\b|\bH266\b|\bx266\b/i, value: 'H266' },
    { regex: /\bAV1\b/i, value: 'AV1' },
    { regex: /\bVC-?1\b/i, value: 'VC-1' },
    { regex: /\bMPEG-?2\b/i, value: 'MPEG-2' },
    { regex: /\bMPEG-?1\b/i, value: 'MPEG-1' },
    { regex: /\bMPEG\b/i, value: 'MPEG' },
    { regex: /\bXvid\b/i, value: 'Xvid' },
    { regex: /\bDivX\b/i, value: 'DivX' },
  ];

  const RESOLUTIONS = ['4320p', '2160p', '1080p', '1080i', '720p', '576p', '576i', '480p', '480i', "360p", '240p', '144p'];

  const SOURCE_PATTERNS = [
    { regex: /\bUHD[\s-]*Blu-?ray\b/i, value: 'UHD BluRay' },
    { regex: /\bBlu-?ray\b/i, value: 'BluRay' },
    { regex: /\bWEB[-\s]?DL\b|\bWEBRip\b/i, value: 'WEB' },
    { regex: /\bDVD(?:Rip)?\b|\bNTSC DVD[59]\b|\bPAL DVD[59]\b|\bDVD[59]\b/i, value: 'DVD' },
    { regex: /\bHD-?DVD\b|\bHDDVD\b/i, value: 'HD DVD' },
    { regex: /\bHDTV\b/i, value: 'HDTV' },
    { regex: /\bLaserDisc\b/i, value: 'LaserDisc' },
    { regex: /\bVHS\b/i, value: 'VHS' },
    { regex: /\bTV[-\s]?Rip\b|\bTV\b/i, value: 'TV' },
  ];

  const SERVICE_TOKENS = [
    '9NOW',
    'AE',
    'AUBC',
    'AMBC',
    'AS',
    'AJAZ',
    'ALL4',
    'AMZN',
    'AMC',
    'ATK',
    'ANPL',
    'ANLB',
    'AOL',
    'ATV',
    'ATVP',
    'ARD',
    'iP',
    'BNGE',
    'BKPL',
    'BOOM',
    'BCORE',
    'BRAV',
    'CMOR',
    'CNLP',
    'CN',
    'CBC',
    'CBS',
    'CHGD',
    'CMAX',
    'CLBI',
    'CNBC',
    'CCGC',
    'CC',
    'COOK',
    'CMT',
    'CRKL',
    'CRAV',
    'CRIT',
    'CR',
    'CSPN',
    'CTV',
    'CUR',
    'CRZN',
    'CW',
    'CWS',
    'DSKI',
    'DCU',
    'DHF',
    'DEST',
    'DDY',
    'DTV',
    'DISC',
    'DSCP',
    'DSNY',
    'DSNP',
    'DIY',
    'DOCC',
    'DPLY',
    'DF',
    'DRPO',
    'ETV',
    'ETTV',
    'EPIX',
    'ESPN',
    'ESQ',
    'FAM',
    'FJR',
    'FOOD',
    'FOX',
    'FXTL',
    'FPT',
    'FTV',
    'FREE',
    'FUNI',
    'FYI',
    'GLBL',
    'GLOB',
    'GO90',
    'PLAY',
    'HLMK',
    'HBO',
    'HMAX',
    'HGTV',
    'HIDIVE',
    'HIDI',
    'HIST',
    'HTSR',
    'HULU',
    'TOU',
    'IFC',
    'ID',
    'IT',
    'ITV',
    'iQIYI',
    'KNPY',
    'KAYO',
    'KCW',
    'KNOW',
    'LIFE',
    'LN',
    'MAX',
    'MBC',
    'MTOD',
    'MA',
    'MMAX',
    'MNBC',
    'MTV',
    'NATG',
    'NBA',
    'NBC',
    'NBLA',
    'NF',
    'NFL',
    'NFLN',
    'GC',
    'NICK',
    'NRK',
    'NOW',
    'ODK',
    'OXGN',
    'PMNT',
    'PMTP',
    'PBS',
    'PBSK',
    'PCOK',
    'PSN',
    'PLUZ',
    'POGO',
    'PA',
    'PUHU',
    'QIBI',
    'RKTN',
    'ROKU',
    'RSTR',
    'RTE',
    'SBS',
    'SESO',
    'SHMI',
    'SHO',
    'SHDR',
    'SKST',
    'SPIK',
    'SNET',
    'SPRT',
    'STAN',
    'STRP',
    'STZ',
    'SVT',
    'SWER',
    'SYFY',
    'TBS',
    'TEN',
    'TFOU',
    'TIMV',
    'TLC',
    'TRVL',
    'TUBI',
    'TV3',
    'TV4',
    'TVING',
    'TVL',
    'UFC',
    'UKTV',
    'UNIV',
    'USAN',
    'VLCT',
    'VTRN',
    'VH1',
    'VIAP',
    'VICE',
    'VIKI',
    'VMEO',
    'VIU',
    'VRV',
    'WNET',
    'WME',
    'WWEN',
    'XBOX',
    'YHOO',
    'YOUKU',
    'YT',
    'RED',
    'ZDF',
    'CTHP',
    'KLASSIKI'
  ];

  const AUDIO_CHANNEL_PATTERN = /\b(?:1\.0|2\.0|2\.1|3\.0|3\.1|4\.0|4\.1|5\.0|5\.1|6\.1|7\.1)\b/i;

  const COUNTRY_MAP = {
    US: 'USA',
    USA: 'USA',
    UK: 'UK',
    GBR: 'GBR',
    GB: 'GBR',
    GER: 'GER',
    DE: 'GER',
    DEU: 'GER',
    FRA: 'FRA',
    FR: 'FRA',
    ESP: 'ESP',
    ES: 'ESP',
    ITA: 'ITA',
    IT: 'ITA',
    AUS: 'AUS',
    AU: 'AUS',
    CAN: 'CAN',
    CA: 'CAN',
    KOR: 'KOR',
    KOREA: 'KOR',
    JPN: 'JPN',
    JP: 'JPN',
    CHN: 'CHN',
    CN: 'CHN',
    RUS: 'RUS',
    RU: 'RUS',
    BRA: 'BRA',
    BR: 'BRA',
    NZ: 'NZ',
    NLD: 'NLD',
    NL: 'NLD',
    SWE: 'SWE',
    NOR: 'NOR',
    DEN: 'DEN',
    DNK: 'DEN',
    EUR: 'EUR',
  };

  const LANGUAGE_MAP = {
    ENGLISH: 'English',
    JAPANESE: 'Japanese',
    JAP: 'Japanese',
    JAPAN: 'Japanese',
    GERMAN: 'German',
    DEUTSCH: 'German',
    FRENCH: 'French',
    FRANCAIS: 'French',
    SPANISH: 'Spanish',
    ESPANOL: 'Spanish',
    ITALIAN: 'Italian',
    RUSSIAN: 'Russian',
    POLISH: 'Polish',
    PORTUGUESE: 'Portuguese',
    BRAZILIAN: 'Portuguese',
    MANDARIN: 'Mandarin',
    CANTONESE: 'Cantonese',
    KOREAN: 'Korean',
    KOREA: 'Korean',
    HINDI: 'Hindi',
    VIETNAMESE: 'Vietnamese',
    THAI: 'Thai',
    CHINESE: 'Chinese',
    TAGALOG: 'Tagalog',
    FILIPINO: 'Tagalog',
    TURKISH: 'Turkish',
    TURK: 'Turkish',
    SWEDISH: 'Swedish',
    NORWEGIAN: 'Norwegian',
    DANISH: 'Danish',
    DUTCH: 'Dutch',
    NETHERLANDS: 'Dutch',
    FINNISH: 'Finnish',
    HUNGARIAN: 'Hungarian',
    ROMANIAN: 'Romanian',
    CZECH: 'Czech',
    SLOVAK: 'Slovak',
    UKRAINIAN: 'Ukrainian',
    ARABIC: 'Arabic',
    HEBREW: 'Hebrew',
    GREEK: 'Greek',
    PERSIAN: 'Persian',
    FARSI: 'Persian',
    INDONESIAN: 'Indonesian',
    MALAY: 'Malay',
    MALAYSIAN: 'Malay',
    TAMIL: 'Tamil',
    TELUGU: 'Telugu',
    BENGALI: 'Bengali',
    MALAYALAM: 'Malayalam',
    SWAHILI: 'Swahili',
    LATIN: 'Latin',
    ICELANDIC: 'Icelandic',
    SERBIAN: 'Serbian',
    CROATIAN: 'Croatian',
    BOSNIAN: 'Bosnian',
    BULGARIAN: 'Bulgarian',
    CATALAN: 'Catalan',
    GALICIAN: 'Galician',
    AFRIKAANS: 'Afrikaans',
    HINDUSTANI: 'Hindi',
    URDU: 'Urdu',
    AR: 'Arabic',
    ZH: 'Chinese',
    RU: 'Russian',
    ES: 'Spanish',
    PT: 'Portuguese',
    FR: 'French',
    IT: 'Italian',
    DE: 'German',
    PL: 'Polish',
    JP: 'Japanese',
    CN: 'Chinese',
    KO: 'Korean',
  };

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

  const RELEASE_GROUP_BLOCK_TOKENS = (() => {
    const tokens = new Set([
      'WEB',
      'DL',
      'DUAL',
      'AUDIO',
      'SUBBED',
      'DUBBED',
      'MULTI',
      'MULTISUB',
      'REMUX',
      'REPACK',
      'PROPER',
      'LIMITED',
      'COMPLETE',
      'UNCENSORED',
      'UNRATED',
      'THEATRICAL',
      'EXTENDED',
      'PACK',
      'COLLECTION',
      'SAMPLE',
      'HDR',
      'SDR',
      'ATMOS',
      'DOLBY',
      'TRUEHD',
      'COMMENTARY',
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
  })();

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
    const service =
      isWebSource
        ? (() => {
            const serviceRegex = new RegExp(
              `\\b(${SERVICE_TOKENS.join('|')})\\b(?=[^\\n]*\\bWEB(?:-?DL|Rip)\\b)`,
              'i'
            );
            const fallbackRegex = new RegExp(`\\b(${SERVICE_TOKENS.join('|')})\\b`, 'i');
            const match = serviceRegex.exec(baseTitle) || fallbackRegex.exec(baseTitle);
            if (!match) return '';
            const token = match[1];
            return SERVICE_TOKENS.find((candidate) => candidate.toLowerCase() === token.toLowerCase()) || token;
          })()
        : '';

    const isFullDisc =
      typeof typeLabel === 'string' && typeLabel.trim().toLowerCase().includes('full disc');
    const country = isFullDisc
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
    const match = languageRegex.exec(baseTitle);
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
      group: group || 'NOGRP',
    };

    return GAZELLIFY_SEQUENCE.map((key) => partValues[key]).filter(Boolean).join(' / ');
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
    wrapper.append(headingEl, subEl);

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
      } else {
        link.textContent = '';
      }
    });
  };

  let torrentIconObserver;
  let torrentIconTarget;
  let searchResultsObserver;

  const stripTorrentDecorations = () => {
    $$('.torrent-icons').forEach((node) => node.remove());
  };

  const watchTorrentDecorations = () => {
    if (!CONFIG.removeTorrentIcons) return;

    stripTorrentDecorations();
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

    if (torrentIconObserver) {
      torrentIconObserver.disconnect();
    }

    torrentIconObserver = new MutationObserver(stripTorrentDecorations);
    torrentIconObserver.observe(table, { childList: true, subtree: true });
    torrentIconTarget = table;
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

  const buildSimilarLayout = (article = $(SELECTORS.similarArticle)) => {
    if (!article || article.querySelector(':scope > .gz-similar-layout')) return !!article;

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

    watchTorrentDecorations();
    gazellify();
    expandAllTorrentGroups();

    return true;
  };

  const buildTorrentLayout = (article = $(SELECTORS.torrentArticle)) => {
    if (!article || article.querySelector(':scope > .gz-similar-layout')) return !!article;

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

    updateDetailTitle();

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

  ready(() => {
    injectStyles(STYLE);
    if (CONFIG.enableOriginalTitleTooltip) {
      initTooltip();
    }

    if (initPage()) return;

    const observer = new MutationObserver(() => {
      if (initPage()) observer.disconnect();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
