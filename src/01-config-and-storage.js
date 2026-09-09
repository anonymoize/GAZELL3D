  // Default configuration - will be overridden by user storage
  const DEFAULT_CONFIG = Object.freeze({
    removeTorrentIcons: true,
    enableGazellifySimilar: true,
    enableGazellifyDetail: false,
    enableGazellifySearch: false,
    enableOriginalTitleTooltip: true,
    showEditButton: true,
    enableSideLayout: true,
    enableGazelleButtons: true,
    enableGazelleTorrentLayout: true,
    enableTorrentDropdowns: true,
    enableComponentColors: true,
    baseFontSize: 100,
    componentColors: {
      videoCodec: '#e6e6e6',
      bitDepth: '#e6e6e6',
      resolution: '#00bcd4',
      country: '#e6e6e6',
      service: '#00a3d9',
      source: '#b266ff',
      remux: '#B8860B',
      seasonEpisode: '#e6e6e6',
      language: '#e6e6e6',
      audio: '#1976D2',
      atmos: '#1976D2',
      hdr: '#388E3C',
      hybrid: '#e6e6e6',
      cut: '#e6e6e6',
      repack: '#e6e6e6',
      scene: '#C2185B',
      group: '#e6e6e6',
    },
  });

  // Load user config from storage, falling back to defaults
  const loadUserConfig = () => {
    try {
      const stored = GM_getValue('gz_config', null);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          componentColors: {
            ...DEFAULT_CONFIG.componentColors,
            ...(parsed.componentColors || {})
          }
        };
      }
    } catch (e) {
      console.warn('GAZELL3D: Failed to load config from storage', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  };

  // Save user config to storage
  const saveUserConfig = (config) => {
    try {
      GM_setValue('gz_config', JSON.stringify(config));
      return true;
    } catch (e) {
      console.error('GAZELL3D: Failed to save config to storage', e);
      return false;
    }
  };

  // Load API key from storage
  const loadApiKey = () => {
    try {
      return GM_getValue('gz_api_key', '') || '';
    } catch (e) {
      return '';
    }
  };

  // Save API key to storage
  const saveApiKey = (key) => {
    try {
      GM_setValue('gz_api_key', key || '');
      return true;
    } catch (e) {
      console.error('GAZELL3D: Failed to save API key to storage', e);
      return false;
    }
  };

  // Active config - loaded from storage at runtime
  let CONFIG = loadUserConfig();
  let AITHER_API_KEY = loadApiKey();


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

  // Utility for fetching raw HTML/text
  const gmFetchText = (url, opts = {}, method = 'GET', timeout = 15000) => {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method,
        timeout,
        ...opts,
        url: url.toString(),
        ontimeout: () => reject(new Error(`Request timed out after ${timeout}ms`)),
        onerror: (err) => reject(err || new Error('Failed to fetch')),
        onload: (response) => {
          if (response.status >= 200 && response.status < 300) {
            resolve(response.responseText);
          } else {
            reject(new Error(`HTTP Error ${response.status}`));
          }
        }
      });
    });
  };

  // Default sequence order - can be customized by user
  const DEFAULT_GAZELLIFY_SEQUENCE = Object.freeze([
    'videoCodec',
    'bitDepth',
    'resolution',
    'country',
    'service',
    'source',
    'remux',
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

  // Human-readable labels for sequence items
  const SEQUENCE_LABELS = Object.freeze({
    videoCodec: 'Video Codec',
    bitDepth: 'Bit Depth',
    resolution: 'Resolution',
    country: 'Country',
    service: 'Streaming Service',
    source: 'Source',
    remux: 'Remux',
    seasonEpisode: 'Season/Episode',
    language: 'Language',
    audio: 'Audio Codec',
    atmos: 'Atmos',
    hdr: 'HDR',
    hybrid: 'Hybrid',
    cut: 'Cut (DC, Extended, etc.)',
    repack: 'Repack/Proper',
    scene: 'Scene',
    group: 'Release Group',
  });

  // Load sequence config from storage (order + disabled items)
  const loadGazellifySequence = () => {
    try {
      const stored = GM_getValue('gz_sequence_v2', null);
      if (stored) {
        const parsed = JSON.parse(stored);
        const order = parsed.order || [];
        const disabled = new Set(parsed.disabled || []);

        // Validate that all default items are present in order
        const parsedSet = new Set(order);
        if (order.length === DEFAULT_GAZELLIFY_SEQUENCE.length &&
          DEFAULT_GAZELLIFY_SEQUENCE.every(item => parsedSet.has(item))) {
          return { order, disabled };
        }
      }
    } catch (e) {
      console.warn('GAZELL3D: Failed to load sequence from storage', e);
    }
    return { order: [...DEFAULT_GAZELLIFY_SEQUENCE], disabled: new Set() };
  };

  // Save sequence config to storage
  const saveGazellifySequence = (order, disabled) => {
    try {
      const data = {
        order,
        disabled: [...disabled] // Convert Set to array for JSON
      };
      GM_setValue('gz_sequence_v2', JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('GAZELL3D: Failed to save sequence to storage', e);
      return false;
    }
  };

  // Active sequence config - loaded from storage at runtime
  const SEQUENCE_CONFIG = loadGazellifySequence();
  let GAZELLIFY_SEQUENCE = SEQUENCE_CONFIG.order.filter(key => !SEQUENCE_CONFIG.disabled.has(key));

  const SELECTORS = Object.freeze({
    similarArticle: 'main.page__torrent-similar--index article',
    torrentArticle: 'main.page__torrent--show article',
    torrentSearchPage: 'main.page__torrent--index',
    groupRequirementsPage: 'main.page__stats--group-requirements',
    torrentGroup: 'section.panelV2[x-data="torrentGroup"]',
    metaSection: 'section.meta',
    torrentButtons: 'menu.torrent__buttons',
    tagBar: '.torrent__tags',
    searchBox: 'search',
    layout: '.gz-similar-layout',
    torrentTable: '.similar-torrents__torrents',
    searchResults: '.torrent-search--list__name',
  });
