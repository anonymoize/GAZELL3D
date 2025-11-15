// ==UserScript==
// @name         GAZELL3D
// @namespace    https://github.com/anonymoize/GAZELL3D/
// @version      1.0.0
// @description  Reimagine UNIT3D-based torrent pages for readability with a two-column layout, richer metadata presentation, cleaner torrent naming, and minor quality-of-life tweaks.
// @match        https://aither.cc/torrents/*
// @match        https://blutopia.cc/torrents/*
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  'use strict';

  const CONFIG = Object.freeze({
    removeTorrentIcons: true,
    enableGazellify: true,
  });

  const GAZELLIFY_SEQUENCE = Object.freeze([
    'videoCodec',
    'resolution',
    'country',
    'service',
    'source',
    'seasonEpisode',
    'language',
    'audio',
    'atmos',
    'bitDepth',
    'hdr',
    'hybrid',
    'cut',
    'repack',
    'group',
  ]);

  const SELECTORS = Object.freeze({
    similarArticle: 'main.page__torrent-similar--index article',
    torrentArticle: 'main.page__torrent--show article',
    torrentGroup: 'section.panelV2[x-data="torrentGroup"]',
    metaSection: 'section.meta',
    torrentButtons: 'menu.torrent__buttons',
    tagBar: '.torrent__tags',
    searchBox: 'search',
    layout: '.gz-similar-layout',
    torrentTable: '.similar-torrents__torrents',
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
  ];

  const RESOLUTIONS = ['4320p', '2160p', '1080p', '1080i', '720p', '576p', '576i', '480p', '480i', "360p", '240p', '144p'];

  const SOURCE_PATTERNS = [
    { regex: /\bUHD[\s-]*Blu-?ray\b/i, value: 'UHD BluRay' },
    { regex: /\bBlu-?ray\b/i, value: 'BluRay' },
    { regex: /\bWEB[-\s]?DL\b|\bWEBRip\b/i, value: 'Web' },
    { regex: /\bDVD(?:Rip)?\b|\bNTSC DVD[59]\b|\bPAL DVD[59]\b|\bDVD[59]\b/i, value: 'DVD' },
    { regex: /\bHD-?DVD\b|\bHDDVD\b/i, value: 'HD DVD' },
    { regex: /\bHDTV\b/i, value: 'HDTV' },
    { regex: /\bLaserDisc\b/i, value: 'LaserDisc' },
    { regex: /\bVHS\b/i, value: 'VHS' },
    { regex: /\bTV\b/i, value: 'TV' },
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
    'CTHP'
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
  ];

  const HDR_PATTERNS = [
    { regex: /\bDV\s+HDR10\+\b/i, value: 'DV HDR10+' },
    { regex: /\bDV\s+HDR\b/i, value: 'DV HDR' },
    { regex: /\bHDR10\+\b/i, value: 'HDR10+' },
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

    const service =
      source === 'WEB'
        ? (() => {
            const serviceRegex = new RegExp(
              `\\b(${SERVICE_TOKENS.join('|')})\\b(?=[^\\n]*\\bWEB(?:-?DL|Rip)\\b)`,
              'i'
            );
            const match = serviceRegex.exec(baseTitle);
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
    if (!CONFIG.enableGazellify) return;
    const panel = $(SELECTORS.torrentGroup);
    if (!panel) return;
    $$('.torrent-search--grouped__name', panel).forEach((heading) => {
      const link = $('a', heading);
      if (!link) return;
      const formatted = formatTorrentName(link.textContent, {
        typeLabel: findTorrentTypeForHeading(heading),
      });
      if (formatted) {
        link.textContent = formatted;
      }
    });
  };

  let torrentIconObserver;
  let torrentIconTarget;

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

    return false;
  };

  ready(() => {
    injectStyles(STYLE);

    if (initPage()) return;

    const observer = new MutationObserver(() => {
      if (initPage()) observer.disconnect();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
