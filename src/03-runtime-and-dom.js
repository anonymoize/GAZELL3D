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
  const applyUnknownHighlight = (element, items = '') => {
    if (!element) return;
    element.textContent = '';

    let parsedItems = Array.isArray(items) ? items : [];
    if (!Array.isArray(items)) {
      const str = items || '';
      parsedItems = str.split(' / ').map(p => ({ category: 'unknown', value: p }));
    }

    parsedItems.forEach((item, index) => {
      const { category, value } = item;

      if (/unknown/i.test(value)) {
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
      } else {
        const span = create('span');
        span.textContent = value;
        if (CONFIG.enableComponentColors !== false) {
          const color = CONFIG.componentColors?.[category];
          if (color && color !== '#ffffff' && color !== '#e6e6e6') {
            span.style.color = color;
          }
          if (['resolution', 'source', 'remux', 'service', 'audio', 'atmos', 'hdr', 'scene'].includes(category)) {
            span.style.fontWeight = 'bold';
          }
        }
        element.appendChild(span);
      }

      if (index < parsedItems.length - 1) {
        const separator = create('span');
        separator.textContent = ' / ';
        separator.style.opacity = '0.65';
        element.appendChild(separator);
      }
    });
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
      /\b(?:Blu-?ray|WEB(?:-?DL|Rip)?|HDTV|UHD|DVD(?:\d|R)?|BD|BRRip|BDRip|DVDRip|NTSC|PAL|SECAM|LaserDisc|VHS|PPV|VOD|REMUX|ISO|3D)\b/i,
      /\b(?:H\.?26[45]|HEVC|AVC|MVC|x265|x264|MPEG-?2|MPEG-?4|VP9|AV1|VC-?1|XviD|DivX)\b/i,
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
  const CACHE_KEY = typeof GM_info !== 'undefined' ? 'GAZELL3D_CONFIG_' + GM_info.script.version : 'GAZELL3D_CONFIG_V2';
  const CACHE_EXPIRY = 24 * 60 * 60 * 1000;

  let SCENE_RELEASE_GROUPS = new Set();
  let SERVICE_TOKENS = [];
  let COUNTRY_MAP = {};
  let LANGUAGE_MAP = {};
  let TAG_STYLES = {};
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
      'HDR', 'SDR', 'ATMOS', 'DOLBY', 'TRUEHD', 'COMMENTARY', '3D', 'MVC',
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
