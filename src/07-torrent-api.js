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
            dataMap.set(torrent.id, torrent.attributes);
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
