  // =====================
  // Torrent Dropdown Feature
  // =====================

  // Cache for fetched torrent data
  let torrentDataCache = null;
  let torrentDataPromise = null;
  const torrentByIdCache = new Map();
  const torrentByIdPromises = new Map();
  const trumpReportsByTorrentCache = new Map();
  const trumpReportsByTorrentPromises = new Map();

  // Extract TMDB ID from the page
  const getTmdbIdFromPage = () => {
    const tmdbLink = document.querySelector('li.meta__tmdb > a.meta-id-tag');
    if (tmdbLink && tmdbLink.title) {
      const match = tmdbLink.title.match(/:\s*(\d+)/);
      if (match) return parseInt(match[1], 10);
    }
    return null;
  };

  // Fetch all torrents for a given TMDB ID (with pagination support)
  const fetchTorrentsByTmdb = async (tmdbId) => {
    if (torrentDataCache) return torrentDataCache;
    if (torrentDataPromise) return torrentDataPromise;

    if (!AITHER_API_KEY || AITHER_API_KEY === 'YOUR_API_KEY_HERE') {
      console.warn('GAZELL3D: Aither API key not configured');
      return null;
    }

    torrentDataPromise = (async () => {
      try {
        const dataMap = new Map();
        let currentPage = 1;
        let hasMorePages = true;
        const perPage = 100;

        while (hasMorePages) {
          const response = await gmFetchJson(
            `https://aither.cc/api/torrents/filter?perPage=${perPage}&page=${currentPage}&tmdbId=${tmdbId}`,
            {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${AITHER_API_KEY}`
              }
            }
          );

          if (!response || !response.data) {
            if (currentPage === 1) {
              console.warn('GAZELL3D: Empty API response');
              return null;
            }
            // No more data on subsequent page, we're done
            break;
          }

          // Add torrents from this page to the map
          response.data.forEach(torrent => {
            const attributes = torrent.attributes || {};
            dataMap.set(String(torrent.id), {
              ...attributes,
              id: attributes.id ?? torrent.id
            });
          });

          // Check if there are more pages to fetch
          // If we got fewer results than perPage, we've reached the last page
          if (response.data.length < perPage) {
            hasMorePages = false;
          } else {
            currentPage++;
            // Safety limit to prevent infinite loops (max 20 pages = 2000 torrents)
            if (currentPage > 20) {
              console.warn('GAZELL3D: Reached maximum page limit (20 pages)');
              hasMorePages = false;
            }
          }
        }

        if (dataMap.size > 0) {
          console.log(`GAZELL3D: Fetched ${dataMap.size} torrents across ${currentPage} page(s)`);
        }

        torrentDataCache = dataMap;
        return dataMap;
      } catch (err) {
        console.error('GAZELL3D: Failed to fetch torrent data', err);
        return null;
      }
    })();

    return torrentDataPromise;
  };

  // Fetch one torrent's full detail payload by ID
  const fetchTorrentById = async (torrentId) => {
    const id = String(torrentId || '').trim();
    if (!id) return null;
    if (torrentByIdCache.has(id)) return torrentByIdCache.get(id);
    if (torrentByIdPromises.has(id)) return torrentByIdPromises.get(id);

    if (!AITHER_API_KEY || AITHER_API_KEY === 'YOUR_API_KEY_HERE') {
      console.warn('GAZELL3D: Aither API key not configured');
      throw new Error('Aither API key not configured.');
    }

    const promise = (async () => {
      try {
        const response = await gmFetchJson(
          `https://aither.cc/api/torrents/${encodeURIComponent(id)}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${AITHER_API_KEY}`
            }
          }
        );

        const torrentResource = response?.data?.attributes ? response.data : response;
        const torrentData = torrentResource?.attributes || null;
        if (!torrentData) {
          const message = response?.message || 'Empty torrent API response.';
          throw new Error(message);
        }

        const normalizedTorrentData = {
          ...torrentData,
          id: torrentData.id ?? torrentResource.id ?? id
        };
        torrentByIdCache.set(id, normalizedTorrentData);
        return normalizedTorrentData;
      } finally {
        torrentByIdPromises.delete(id);
      }
    })();

    torrentByIdPromises.set(id, promise);
    return promise;
  };

  const normalizeTrumpReportData = (response) => {
    const payload = response?.data ?? response;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (payload && typeof payload === 'object' && (
      payload.id ||
      payload.title ||
      payload.solved !== undefined ||
      payload.reported_torrents ||
      payload.trumping_torrent
    )) {
      return [payload];
    }
    return [];
  };

  // Fetch existing trump reports filed against a torrent.
  const fetchTrumpReportsForTorrent = async (torrentId) => {
    const id = String(torrentId || '').trim();
    if (!id) return [];
    if (trumpReportsByTorrentCache.has(id)) return trumpReportsByTorrentCache.get(id);
    if (trumpReportsByTorrentPromises.has(id)) return trumpReportsByTorrentPromises.get(id);

    if (!AITHER_API_KEY || AITHER_API_KEY === 'YOUR_API_KEY_HERE') {
      console.warn('GAZELL3D: Aither API key not configured');
      throw new Error('Aither API key not configured.');
    }

    const promise = (async () => {
      try {
        const reports = [];
        const seenReportIds = new Set();
        let currentPage = 1;
        let hasMorePages = true;

        while (hasMorePages) {
          const url = new URL('https://aither.cc/api/trumping-reports/filter');
          url.searchParams.set('reported_torrent_id', id);
          url.searchParams.set('page', String(currentPage));

          const response = await gmFetchJson(
            url,
            {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${AITHER_API_KEY}`
              }
            }
          );

          if (response?.message && response.data === undefined) {
            throw new Error(response.message);
          }

          normalizeTrumpReportData(response).forEach((report) => {
            const reportId = report?.id ?? JSON.stringify(report);
            if (seenReportIds.has(reportId)) return;
            seenReportIds.add(reportId);
            reports.push(report);
          });

          const lastPage = Number(response?.meta?.last_page || 0);
          if (lastPage) {
            hasMorePages = currentPage < lastPage;
          } else {
            hasMorePages = Boolean(response?.links?.next);
          }

          currentPage++;
          if (currentPage > 20) {
            console.warn('GAZELL3D: Reached maximum trump report page limit (20 pages)');
            hasMorePages = false;
          }
        }

        trumpReportsByTorrentCache.set(id, reports);
        return reports;
      } finally {
        trumpReportsByTorrentPromises.delete(id);
      }
    })();

    trumpReportsByTorrentPromises.set(id, promise);
    return promise;
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
