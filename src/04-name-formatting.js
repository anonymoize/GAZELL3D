  // Immutable naming context: callers supply page presentation choices explicitly.
  const createTorrentNaming = ({ catalog = {}, sequence = [] } = {}) => {
    const VIDEO_CODEC_PATTERNS = [
      { regex: /\bHEVC\b|\bH\.?265\b|\bH265\b|\bx265\b/i, value: 'H.265' },
      { regex: /\bAVC\b|\bH\.?264\b|\bH264\b|\bx264\b/i, value: 'H.264' },
      { regex: /\bVVC\b|\bH\.?266\b|\bH266\b|\bx266\b/i, value: 'H.266' },
      { regex: /\bMVC\b/i, value: 'H.264/MVC' },
      { regex: /\bAV1\b/i, value: 'AV1' },
      { regex: /\bVC-?1\b/i, value: 'VC-1' },
      { regex: /\bMPEG-?2\b/i, value: 'MPEG-2' },
      { regex: /\bMPEG-?1\b/i, value: 'MPEG-1' },
      { regex: /\bMPEG\b/i, value: 'MPEG' },
      { regex: /\bXvid\b/i, value: 'Xvid' },
      { regex: /\bDivX\b/i, value: 'DivX' },
      { regex: /\bJPEG2000\b/i, value: 'JPEG2000' },
    ];

    const RESOLUTIONS = [...(catalog.RESOLUTIONS || [])];

    const SOURCE_PATTERNS = [
      { regex: /\bUHD[\s-]*Blu-?ray\b/i, value: 'UHD BluRay' },
      { regex: /\b(?:3D[\s\.-]*Blu-?ray|Blu-?ray[\s\.-]*3D|3D)\b/i, value: '3D BluRay' },
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



    const tokenizeWords = (text) =>
      (text || '')
        .split(/[^A-Za-z0-9]+/)
        .map((token) => token.trim().toUpperCase())
        .filter(Boolean);
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
    const SCENE_RELEASE_GROUPS = new Set((catalog.SCENE_RELEASE_GROUPS || []).map(normalizeSceneGroupName));
    const SERVICE_TOKENS = [...(catalog.SERVICE_TOKENS || [])];
    const COUNTRY_MAP = { ...(catalog.COUNTRY_MAP || {}) };
    const LANGUAGE_MAP = { ...(catalog.LANGUAGE_MAP || {}) };
    const sequenceOrder = [...sequence];
    const initReleaseGroupBlockTokens = () => {
      const tokens = new Set();
      const addTokens = (values) => {
        values.forEach((value) => tokenizeWords(value).forEach((token) => tokens.add(token)));
      };
      addTokens(catalog.EXTRA_RELEASE_GROUP_BLOCK_TOKENS || []);
      addTokens(RESOLUTIONS);
      addTokens(SERVICE_TOKENS);
      addTokens(SOURCE_PATTERNS.map((pattern) => pattern.value));
      addTokens(VIDEO_CODEC_PATTERNS.map((pattern) => pattern.value));
      addTokens(AUDIO_CODEC_PATTERNS.map((pattern) => pattern.value));
      addTokens(HDR_PATTERNS.map((pattern) => pattern.value));
      addTokens(CUT_PATTERNS.map((pattern) => pattern.value));
      return tokens;
    };

    const RELEASE_GROUP_BLOCK_TOKENS = initReleaseGroupBlockTokens();

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

    const formatTorrentName = (name, { typeLabel, hideSeasonEpisode = false } = {}) => {
      if (!name) return [];
      const normalized = name.replace(/\s+/g, ' ').trim();
      if (!normalized) return [];

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
        isWebSource && SERVICE_TOKENS.length
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
        (isFullDisc || hasDiscContext) && Object.keys(COUNTRY_MAP).length
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
        if (!Object.keys(LANGUAGE_MAP).length) return '';
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
      const hdr = getMatchFromPatterns(HDR_PATTERNS, baseTitle);
      const hybrid = /\bHybrid\b/i.test(baseTitle) ? 'Hybrid' : '';
      const remux = /\bRemux\b/i.test(baseTitle) ? 'Remux' : '';
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
        remux,
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

      return sequenceOrder
        .filter((key) => !(hideSeasonEpisode && key === 'seasonEpisode'))
        .map((key) => ({ category: key, value: partValues[key] }))
        .filter((part) => Boolean(part.value));
    };

    const buildSearchDisplay = (text) => {
      const normalized = normalizeText(text);
      if (!normalized) return { heading: '', subtitle: [] };
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
    return Object.freeze({ format: formatTorrentName, searchDisplay: buildSearchDisplay });
  };

  let torrentNaming = createTorrentNaming({ sequence: GAZELLIFY_SEQUENCE });
