  // Cache and pending work are private to a credential-scoped repository.
  const createTorrentRepository = ({ request, getApiKey }) => {
    let credential = null;
    let cache = new Map();
    let pending = new Map();
    const session = () => {
      const key = getApiKey();
      if (key !== credential) {
        credential = key;
        cache = new Map();
        pending = new Map();
      }
      if (!key || key === 'YOUR_API_KEY_HERE') throw new Error('Aither API key not configured.');
      return { key, cache, pending };
    };
    const fetchJson = (state, path, payload) => request(
      `https://aither.cc/api/${path}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${state.key}`,
        },
        ...(payload === undefined ? {} : { data: JSON.stringify(payload) }),
      },
      payload === undefined ? 'GET' : 'POST',
      payload === undefined ? 15000 : 30000
    );
    const lookup = async (key, load) => {
      const state = session();
      if (state.cache.has(key)) return state.cache.get(key);
      if (state.pending.has(key)) return state.pending.get(key);
      // Defer load so pending is registered even for a synchronous adapter.
      const promise = Promise.resolve().then(() => load(state)).then((result) => {
        if (state.pending.get(key) === promise) state.cache.set(key, result);
        return result;
      }).finally(() => {
        if (state.pending.get(key) === promise) state.pending.delete(key);
      });
      state.pending.set(key, promise);
      return promise;
    };
    const resource = (value, fallbackId) => {
      if (!value?.attributes || typeof value.attributes !== 'object') {
        throw new Error(value?.message || 'Empty torrent response.');
      }
      return { ...value.attributes, id: value.attributes.id ?? value.id ?? fallbackId };
    };
    const reportItems = (response) => {
      const payload = response?.data ?? response;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      if (payload && typeof payload === 'object' && (
        payload.id || payload.title || payload.solved !== undefined ||
        payload.reported_torrents || payload.trumping_torrent
      )) return [payload];
      if (response?.message) throw new Error(response.message);
      return [];
    };
    return Object.freeze({
      byId: (torrentId) => {
        const id = String(torrentId ?? '').trim();
        if (!id) return Promise.reject(new Error('Torrent ID is required.'));
        return lookup(`torrent:${id}`, async (state) => {
          const response = await fetchJson(state, `torrents/${encodeURIComponent(id)}`);
          return resource(response?.data?.attributes ? response.data : response, id);
        });
      },
      byTmdb: (tmdbId) => {
        const id = String(tmdbId ?? '').trim();
        if (!id) return Promise.reject(new Error('Could not detect TMDB ID'));
        return lookup(`tmdb:${id}`, async (state) => {
          const torrents = new Map();
          for (let page = 1; page <= 20; page++) {
            const query = new URLSearchParams({ perPage: '100', page: String(page), tmdbId: id });
            const response = await fetchJson(state, `torrents/filter?${query}`);
            if (!Array.isArray(response?.data)) throw new Error(response?.message || 'Empty torrent response.');
            response.data.forEach((torrent) => torrents.set(String(torrent.id), resource(torrent, torrent.id)));
            if (response.data.length < 100) return torrents;
          }
          // Never cache a partial group as a complete result.
          throw new Error('Torrent group exceeds the 20-page limit.');
        });
      },
      reportsFor: (torrentId) => {
        const id = String(torrentId ?? '').trim();
        if (!id) return Promise.resolve([]);
        return lookup(`reports:${id}`, async (state) => {
          const reports = new Map();
          for (let page = 1; page <= 20; page++) {
            const query = new URLSearchParams({ reported_torrent_id: id, page: String(page) });
            const response = await fetchJson(state, `trumping-reports/filter?${query}`);
            reportItems(response).filter(Boolean).forEach((report) => {
              reports.set(report.id ?? JSON.stringify(report), report);
            });
            const lastPage = Number(response?.meta?.last_page || 0);
            const hasMore = lastPage ? page < lastPage : Boolean(response?.links?.next);
            if (!hasMore) return Array.from(reports.values());
          }
          throw new Error('Trump reports exceed the 20-page limit.');
        });
      },
      submitReport: async (payload) => {
        const state = session();
        const response = await fetchJson(state, 'trumping-reports/create', payload);
        if (response?.success) {
          const key = `reports:${payload.reported_torrent_id}`;
          state.cache.delete(key);
          state.pending.delete(key);
        }
        return response;
      },
    });
  };

  const torrentRepository = createTorrentRepository({ request: gmFetchJson, getApiKey: () => AITHER_API_KEY });

  // Extract TMDB ID from the page
  const getTmdbIdFromPage = () => {
    const tmdbLink = document.querySelector('li.meta__tmdb > a.meta-id-tag');
    if (tmdbLink && tmdbLink.title) {
      const match = tmdbLink.title.match(/:\s*(\d+)/);
      if (match) return parseInt(match[1], 10);
    }
    return null;
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

  const sanitizeUrl = (url, isImage) => {
    let sanitized = url;
    if (sanitized.startsWith('/')) {
      sanitized = 'https://aither.cc' + sanitized;
    } else if (!/^https?:\/\/|^irc:\/\/|^ftp:\/\/|^sftp:\/\/|^magnet:/i.test(sanitized)) {
      sanitized = 'https://' + sanitized;
    }
    if (/^javascript:/i.test(sanitized) || /^data:/i.test(sanitized) || /^vbscript:/i.test(sanitized)) {
      return 'Broken link';
    }
    return sanitized;
  };
