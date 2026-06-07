  const gazellifyTorrentLayout = (article) => {
    const section = $(SELECTORS.torrentGroup, article);
    if (!section) return;

    // Clear the trump torrent registry for fresh population
    trumpTorrentRegistry.clear();

    // Hide the panel header ("Torrents" label) to reduce vertical gap
    const panelHeader = section.querySelector('header.panel__header');
    if (panelHeader) {
      panelHeader.style.display = 'none';
    }

    // 1. Detect Mode
    // TV Mode: Has 'summary[x-bind="season"]' or 'summary[x-bind="specials"]' inside details
    const seasonDetails = Array.from(section.querySelectorAll('summary[x-bind="season"], summary[x-bind="specials"], summary[x-bind="complete"]'))
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
            <th class="gz-col-stat" title="Seeders"><i class="fas fa-arrow-up"></i></th>
            <th class="gz-col-stat" title="Leechers"><i class="fas fa-arrow-down"></i></th>
            <th class="gz-col-stat" title="Snatched"><i class="fas fa-save"></i></th>
        </tr>
    `;
    newTable.appendChild(thead);

    const tbody = create('tbody');
    let rowIdCounter = 0;

    // Shared row processing logic
    // seasonGroup: identifier for the season (e.g., 'S01', 'S02') used for trump report filtering
    const processRows = (rows, episodeId, seasonGroup = null) => {
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
            // Create a copy of children array since we may modify the original
            const iconsToProcess = Array.from(originalIcons.children);
            iconsToProcess.forEach(icon => {
              // Filter text nodes but keep elements
              if (icon.nodeType !== 1) return;

              // Check if this is a Seadex icon - these need special handling
              const isSeadex = icon.hasAttribute('data-seadex');

              // Apply filtering logic
              const isKeep = isSeadex ||
                icon.classList.contains('torrent-icons__torrent-trump') ||
                icon.classList.contains('torrent-icons__personal-release') ||
                icon.classList.contains('torrent-icons__internal');

              if (CONFIG.removeTorrentIcons && !isKeep) {
                return;
              }

              // Skip comment icon always
              if (icon.classList.contains('fa-comment-alt-plus') || icon.classList.contains('torrent-icons__comments')) return;

              // For Seadex icons: MOVE them instead of cloning to preserve event listeners
              // The original table is hidden anyway, so this is safe
              if (isSeadex) {
                iconSpan.appendChild(icon);
              } else {
                iconSpan.appendChild(icon.cloneNode(true));
              }
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
        const torrentName = getText(nameLink);
        // Build display name with episode ID and type for better identification
        // Format: "S01E01 [WEB-DL] Release Name" or "[WEB-DL] Release Name" for movies
        const typePart = currentType ? `[${currentType}]` : '';
        const episodePart = episodeId ? `${episodeId} ` : '';
        const torrentDisplayName = `${episodePart}${typePart} ${torrentName}`.trim();
        const trumpableReason = extractTrumpableReasonFromElement(row);

        // Register torrent in the trump report registry for season-aware filtering
        if (torrentId) {
          trumpTorrentRegistry.register(torrentId, torrentDisplayName, seasonGroup);
        }

        // Add dropdown functionality if enabled
        if (CONFIG.enableTorrentDropdowns && torrentId) {
          newLink.classList.add('gz-clickable');
          newLink.dataset.torrentId = torrentId;

          newLink.addEventListener('click', async (e) => {
            // Ctrl+click or Cmd+click: let the browser handle it natively
            // (the browser already opens <a> links in a new tab on Ctrl/Cmd+click)
            if (e.ctrlKey || e.metaKey) {
              return;
            }

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
            const dropdownTorrentData = trumpableReason
              ? { ...torrentData, trumpable_reason: trumpableReason }
              : torrentData;
            td.appendChild(renderTorrentDropdown(dropdownTorrentData, colSpan));
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

          // Trump Report Button
          if (torrentId) {
            const tr = create('button');
            tr.textContent = 'TR';
            tr.title = 'Trump Report';
            tr.style.background = 'none';
            tr.style.border = 'none';
            tr.style.cursor = 'pointer';
            tr.style.padding = '0';
            tr.style.color = 'inherit';
            tr.style.font = 'inherit';
            tr.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              showTrumpReportModal(torrentId, torrentDisplayName, seasonGroup, isSeasonLayout);
            });
            actions.push(tr);
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

        // 6. Seeders
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

        // 7. Leechers
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

        // 8. Snatched
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

        tbody.appendChild(newRow);
      });
    };

    if (isSeasonLayout) {
      // Find "Complete pack" section to merge into "Specials"
      const completePackSection = seasonDetails.find(s => {
        const summary = s.querySelector('summary');
        return summary && summary.getAttribute('x-bind') === 'complete';
      });

      // Filter out "Complete pack" from normal processing - it will be merged into "Specials"
      const filteredSeasonDetails = seasonDetails.filter(s => {
        const summary = s.querySelector('summary');
        return !(summary && summary.getAttribute('x-bind') === 'complete');
      });

      // Sort seasons: Regular seasons first (numeric descending), then Specials (last)
      filteredSeasonDetails.sort((a, b) => {
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

      filteredSeasonDetails.forEach(season => {
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

        // If this is "Specials", also process "Complete pack" rows first with S00 label
        if (isSpecials && completePackSection) {
          const completeTable = completePackSection.querySelector('table');
          if (completeTable) {
            processRows($$('tbody tr', completeTable), 'S00', 'S00');
          }
        }

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
            if (table) processRows($$('tbody tr', table), label, seasonPrefix);
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
            if (table) processRows($$('tbody tr', table), epId, seasonPrefix);
          });
        }

        // 3. Fallback: Direct table if NO packs and NO episodes
        if (packSummaries.length === 0 && !hasEpisodes) {
          // Handle Direct content (no nested structure found)
          const table = season.querySelector('table');
          if (table) {
            // Pass empty string to avoid duplicating the Season header
            processRows($$('tbody tr', table), '', seasonPrefix);
          }
        }
      });

      // Handle edge case: If there's a "Complete pack" but no "Specials" section,
      // create a "Specials" header and process the complete pack under it
      if (completePackSection && !filteredSeasonDetails.some(s => {
        const summary = normalizeText(getText(s.querySelector('summary')));
        return summary.toLowerCase().includes('special');
      })) {
        const colSpan = CONFIG.enableGazelleButtons ? 7 : 6;
        const seasonRow = create('tr', 'gz-season-header');
        seasonRow.innerHTML = `<td colspan="${colSpan}">Specials</td>`;
        tbody.appendChild(seasonRow);

        const completeTable = completePackSection.querySelector('table');
        if (completeTable) {
          processRows($$('tbody tr', completeTable), 'S00', 'S00');
        }
      }
    } else {
      // Movie Layout (Flat)
      processRows(movieRows, '', null);
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
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Only process when nodes are ADDED, not removed
          // This prevents race conditions when we move icons (which triggers remove mutations)
          const target = mutation.target;
          if (target.matches && (target.matches('.torrent-icons') || target.closest('.torrent-icons'))) {
            const row = target.closest('tr');
            const syncId = row ? row.dataset.gzSyncId : null;
            if (syncId) {
              const newRow = newTable.querySelector(`tr[data-gz-sync-id="${syncId}"]`);
              if (newRow) {
                const iconSpan = newRow.querySelector('.gz-torrent-icons');
                if (iconSpan) {
                  // Process only the newly added nodes, don't rebuild everything
                  mutation.addedNodes.forEach(node => {
                    if (node.nodeType !== 1) return;

                    // Check if this is a Seadex icon (or contains one)
                    const isSeadexDirect = node.hasAttribute && node.hasAttribute('data-seadex');
                    const containsSeadex = node.querySelector && node.querySelector('[data-seadex]');
                    const seadexElement = isSeadexDirect ? node : containsSeadex;

                    if (seadexElement) {
                      // For Seadex icons: MOVE them to preserve event listeners
                      // Find the containing li if wrapped, otherwise move the element directly
                      const elementToMove = seadexElement.closest('li') || seadexElement;
                      iconSpan.appendChild(elementToMove);
                    } else {
                      // Check if it's another "keep" icon
                      const isKeep = node.classList && (
                        node.classList.contains('torrent-icons__torrent-trump') ||
                        node.classList.contains('torrent-icons__personal-release') ||
                        node.classList.contains('torrent-icons__internal')
                      );

                      if (!CONFIG.removeTorrentIcons || isKeep) {
                        // Skip comment icons
                        if (node.classList && (node.classList.contains('fa-comment-alt-plus') || node.classList.contains('torrent-icons__comments'))) return;
                        iconSpan.appendChild(node.cloneNode(true));
                      }
                    }
                  });
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

    // Create the page header with title and action links
    const createPageHeader = () => {
      const header = create('div', 'gz-page-header');

      // Extract and clone the title
      const titleLink = meta.querySelector('.meta__title-link');
      if (titleLink) {
        const titleEl = create('h1', 'gz-page-header__title');
        const titleAnchor = titleLink.cloneNode(true);
        titleAnchor.className = '';
        titleEl.appendChild(titleAnchor);
        header.appendChild(titleEl);
      }

      // Extract action links from the dropdown menu
      const dropdown = meta.querySelector('.meta__dropdown');
      if (dropdown) {
        const actionsEl = create('div', 'gz-page-header__actions');
        const items = dropdown.querySelectorAll('li');

        items.forEach((item, index) => {
          const link = item.querySelector('a');
          const form = item.querySelector('form');

          if (link) {
            const newLink = link.cloneNode(true);
            newLink.className = '';
            actionsEl.appendChild(newLink);
          } else if (form) {
            // Clone the entire form to preserve functionality
            const newForm = form.cloneNode(true);
            newForm.style.display = 'inline';
            actionsEl.appendChild(newForm);
          }

          // Add separator between items
          if (index < items.length - 1) {
            const sep = create('span', 'gz-separator');
            sep.textContent = '|';
            actionsEl.appendChild(sep);
          }
        });

        if (actionsEl.children.length > 0) {
          header.appendChild(actionsEl);
        }
      }

      // Remove the original dropdown and title from meta (since they're now in header)
      const actionsDiv = meta.querySelector('.meta__actions');
      if (actionsDiv) actionsDiv.remove();

      return header;
    };

    const extraPanels = ['requests', 'playlists', 'collection', 'Also downloaded']
      .map((label) => findPanelByHeading(label))
      .filter(Boolean);

    removeNode($(SELECTORS.searchBox, article));

    // Create and insert the page header before the layout
    const pageHeader = createPageHeader();

    const { layout, left, right } = createLayoutContainer(article, article.firstElementChild);

    // Insert header before the layout
    if (pageHeader.children.length > 0) {
      layout.parentNode.insertBefore(pageHeader, layout);
    }

    // Wrap torrent table in a panelV2 with a 'Torrents' heading
    const torrentsPanel = create('section', 'panelV2');
    const torrentsHeader = create('header', 'panel__header');
    const torrentsHeading = create('h2', 'panel__heading');
    torrentsHeading.textContent = 'Torrents';
    torrentsHeader.appendChild(torrentsHeading);
    torrentsPanel.appendChild(torrentsHeader);
    torrentsPanel.appendChild(torrents);
    appendAll(left, [torrentsPanel]);

    const { panels, leftPanels } = createMetaPanels(meta, true);
    if (!panels.length && !leftPanels.length) return false;

    // Insert left panels (Synopsis, Cast) right after torrents, before extra panels
    leftPanels.forEach(panel => left.appendChild(panel));
    appendAll(left, extraPanels);

    panels.forEach(panel => right.appendChild(panel));

    return true;
  };

  const buildTorrentLayout = (article = $(SELECTORS.torrentArticle)) => {
    if (!article) return false;

    updateDetailTitle();

    if (article.querySelector(':scope > .gz-similar-layout')) return true;
    if (!CONFIG.enableSideLayout) return true;

    const meta = $(SELECTORS.metaSection, article);
    if (!meta) return false;

    // Create the page header with title and action links (same as similar page)
    const createPageHeader = () => {
      const header = create('div', 'gz-page-header');

      // Extract and clone the title
      const titleLink = meta.querySelector('.meta__title-link');
      if (titleLink) {
        const titleEl = create('h1', 'gz-page-header__title');
        const titleAnchor = titleLink.cloneNode(true);
        titleAnchor.className = '';
        titleEl.appendChild(titleAnchor);
        header.appendChild(titleEl);
      }

      // Extract action links from the dropdown menu
      const dropdown = meta.querySelector('.meta__dropdown');
      if (dropdown) {
        const actionsEl = create('div', 'gz-page-header__actions');
        const items = dropdown.querySelectorAll('li');

        items.forEach((item, index) => {
          const link = item.querySelector('a');
          const form = item.querySelector('form');

          if (link) {
            const newLink = link.cloneNode(true);
            newLink.className = '';
            actionsEl.appendChild(newLink);
          } else if (form) {
            // Clone the entire form to preserve functionality
            const newForm = form.cloneNode(true);
            newForm.style.display = 'inline';
            actionsEl.appendChild(newForm);
          }

          // Add separator between items
          if (index < items.length - 1) {
            const sep = create('span', 'gz-separator');
            sep.textContent = '|';
            actionsEl.appendChild(sep);
          }
        });

        if (actionsEl.children.length > 0) {
          header.appendChild(actionsEl);
        }
      }

      // Remove the original dropdown from meta (since it's now in header)
      const actionsDiv = meta.querySelector('.meta__actions');
      if (actionsDiv) actionsDiv.remove();

      return header;
    };

    const torrentButtons = $(SELECTORS.torrentButtons, article);

    // Keep .torrent__tags as a direct child of article for Seadex compatibility
    // Seadex uses 'article > ul.torrent__tags' selector which requires direct child
    const torrentTags = article.querySelector(':scope > ul.torrent__tags');

    const fragment = document.createDocumentFragment();
    Array.from(article.children).forEach((child) => {
      if (child === meta || child === torrentButtons) return;
      // Skip torrent tags - we'll handle it specially for Seadex compatibility
      if (child === torrentTags) return;
      fragment.appendChild(child);
    });

    // Create and insert the page header before the layout
    const pageHeader = createPageHeader();

    const { layout, left, right } = createLayoutContainer(article, meta);

    // Insert header before the layout
    if (pageHeader.children.length > 0) {
      layout.parentNode.insertBefore(pageHeader, layout);
    }

    left.appendChild(fragment);

    // Keep torrent buttons in their original form (don't convert to inline buttons)
    if (torrentButtons) {
      left.insertBefore(torrentButtons, left.firstElementChild || null);
    }

    // For Seadex compatibility: Keep the original .torrent__tags as a hidden direct child of article
    // Seadex will add its icon there. We'll observe it and sync any Seadex icons to our visible layout.
    if (torrentTags) {
      // Clone the tags to display in the layout
      const visibleTags = torrentTags.cloneNode(true);
      visibleTags.classList.add('gz-visible-tags');

      // Insert visible tags at the beginning of the left column (or wherever appropriate)
      left.insertBefore(visibleTags, left.firstElementChild || null);

      // Hide the original but keep it for Seadex to find
      torrentTags.style.display = 'none';

      // Observe the hidden original for Seadex icons
      const tagsObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
              // Check if a Seadex icon was added (it has data-seadex attribute)
              if (node.nodeType === 1) {
                const seadexIcon = node.querySelector ?
                  (node.hasAttribute('data-seadex') ? node : node.querySelector('[data-seadex]')) :
                  null;
                if (seadexIcon || (node.hasAttribute && node.hasAttribute('data-seadex'))) {
                  // Move the Seadex element to visible tags (preserves click handlers)
                  const elementToMove = seadexIcon || node;
                  // Find the corresponding li in visible tags, or append to visible tags
                  visibleTags.appendChild(elementToMove.closest('li') || elementToMove);
                }
              }
            });
          }
        });
      });

      tagsObserver.observe(torrentTags, { childList: true, subtree: true });
    }

    const { panels } = createMetaPanels(meta, false);
    if (!panels.length) return false;
    panels.forEach(panel => right.appendChild(panel));

    return true;
  };
