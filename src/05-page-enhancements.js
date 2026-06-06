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
    if (!subtitle || subtitle.length === 0) return;

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
      if (!heading || !subtitle || subtitle.length === 0) return;

      link.textContent = '';
      const wrapper = create('div', 'gz-search-title');
      const headingEl = create('div', 'gz-search-title__heading');
      headingEl.textContent = heading;
      const subEl = create('div', 'gz-search-title__subheading');
      applyUnknownHighlight(subEl, subtitle);
      wrapper.append(headingEl, subEl);

      // Add a visually-hidden span with the original release name for Seadex compatibility
      // Seadex's getReleaseByReleaseName reads innerText to match release groups
      const hiddenOriginal = create('span', 'gz-hidden-original');
      hiddenOriginal.textContent = raw;
      hiddenOriginal.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
      hiddenOriginal.setAttribute('aria-hidden', 'true');

      link.appendChild(wrapper);
      link.appendChild(hiddenOriginal);
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
      if (formatted && formatted.length > 0) {
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
