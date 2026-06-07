  const formatDropdownDetailValue = (value) => {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value === null || value === undefined || value === '') return 'N/A';
    return String(value);
  };

  const isFreeleechActive = (value) => {
    const normalized = String(value ?? '').trim().toLowerCase();
    return normalized && !['0', '0%', 'false', 'no', 'none', 'n/a'].includes(normalized);
  };

  const formatImdbTitleId = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const raw = String(value).trim();
    if (/^tt\d+$/i.test(raw)) return `tt${raw.replace(/^tt/i, '').padStart(7, '0')}`;
    const digits = raw.replace(/\D/g, '');
    if (!digits) return null;
    return `tt${digits.padStart(7, '0')}`;
  };

  const getTmdbMetaType = (torrentData) => {
    const category = String(torrentData.category || '').toLowerCase();
    return category.includes('tv') ? 'tv' : 'movie';
  };

  const buildMetaIdLink = (source, value, torrentData) => {
    if (value === null || value === undefined || value === '') return null;

    if (source === 'tmdb') {
      return `https://www.themoviedb.org/${getTmdbMetaType(torrentData)}/${value}`;
    }
    if (source === 'imdb') {
      const imdbId = formatImdbTitleId(value);
      return imdbId ? `https://www.imdb.com/title/${imdbId}/` : null;
    }
    if (source === 'tvdb') {
      return `https://thetvdb.com/dereferrer/series/${value}`;
    }
    if (source === 'mal') {
      return `https://myanimelist.net/anime/${value}`;
    }

    return null;
  };

  const normalizeTrumpableReason = (value) => {
    const text = normalizeText(value || '');
    if (!text) return null;

    const prefix = 'This torrent is trumpable for the following reason:';
    const reason = text.toLowerCase().startsWith(prefix.toLowerCase())
      ? text.slice(prefix.length).trim()
      : text;

    return reason || null;
  };

  const extractTrumpableReasonFromElement = (scope) => {
    if (!scope?.querySelectorAll) return null;
    const candidates = Array.from(scope.querySelectorAll('.torrent-icons__torrent-trump[title], [title] .torrent-icons__torrent-trump'));
    for (const candidate of candidates) {
      const titleNode = candidate.matches?.('[title]')
        ? candidate
        : candidate.closest?.('[title]');
      const title = titleNode?.getAttribute('title') || '';
      if (!/trumpable/i.test(title)) continue;
      const reason = normalizeTrumpableReason(title);
      if (reason) return reason;
    }
    return null;
  };

  const getTorrentTrumpableReason = (torrentData) => {
    const fields = [
      torrentData?.trumpable_reason,
      torrentData?.trumpableReason,
      torrentData?.trump_reason,
      torrentData?.trumpReason
    ];
    for (const field of fields) {
      const reason = normalizeTrumpableReason(field);
      if (reason) return reason;
    }
    return null;
  };

  const getTorrentDataId = (torrentData) => {
    const directId = torrentData?.id ?? torrentData?.torrent_id;
    if (directId !== null && directId !== undefined && directId !== '') return String(directId);

    const idSources = [
      torrentData?.details_link,
      torrentData?.download_link,
      torrentData?.magnet_link
    ];
    for (const source of idSources) {
      const match = String(source || '').match(/\/(?:torrents|download)\/(\d+)/);
      if (match) return match[1];
    }

    return null;
  };

  const normalizeTrumpReportTorrentList = (value) => {
    if (!value) return [];
    return Array.isArray(value) ? value.filter(Boolean) : [value];
  };

  const formatReportTorrentName = (torrent) => {
    if (!torrent) return 'Unknown torrent';
    const name = torrent.name || torrent.title || torrent.release_name || 'Unknown torrent';
    return torrent.id ? `${name} (#${torrent.id})` : name;
  };

  const formatTrumpReportStatus = (report) => {
    if (report?.solved === true) return 'Solved';
    if (report?.solved === false) return 'Open';
    return 'Status unknown';
  };

  const formatTrumpReportDate = (dateStr) => {
    const formatted = formatDate(dateStr);
    return formatted === 'Unknown' ? null : formatted;
  };

  const renderTrumpReportAlert = (host, reports) => {
    host.textContent = '';
    const validReports = Array.isArray(reports) ? reports.filter(Boolean) : [];
    if (!validReports.length) {
      host.hidden = true;
      return '';
    }

    host.hidden = false;
    const alert = create('div', 'gz-trump-report-alert');
    const header = create('div', 'gz-trump-report-alert__header');
    const title = create('div', 'gz-trump-report-alert__title');
    const countLabel = validReports.length === 1 ? 'Existing Trump Report' : `${validReports.length} Existing Trump Reports`;
    title.textContent = countLabel;
    const badge = create('span', 'gz-trump-report-alert__badge');
    badge.textContent = 'Action needed';
    appendAll(header, [title, badge]);
    alert.appendChild(header);

    const list = create('div', 'gz-trump-report-alert__list');
    const rawLines = [countLabel + ':'];

    validReports.forEach((report, index) => {
      const item = create('article', 'gz-trump-report-alert__item');
      const reportTitle = report.title || report.message || `Trump report #${report.id || index + 1}`;
      const metaParts = [
        report.id ? `#${report.id}` : null,
        formatTrumpReportStatus(report),
        formatTrumpReportDate(report.created_at)
      ].filter(Boolean);

      const itemTitle = create('div', 'gz-trump-report-alert__item-title');
      itemTitle.textContent = reportTitle;
      const meta = create('div', 'gz-trump-report-alert__meta');
      meta.textContent = metaParts.join(' - ');
      appendAll(item, [itemTitle, meta]);

      rawLines.push('');
      rawLines.push(`${index + 1}. ${reportTitle}`);
      if (metaParts.length) rawLines.push(`Status: ${metaParts.join(' - ')}`);

      const reportedTorrents = normalizeTrumpReportTorrentList(report.reported_torrents);
      if (reportedTorrents.length) {
        const row = create('div', 'gz-trump-report-alert__row');
        const label = create('span', 'gz-trump-report-alert__label');
        label.textContent = 'Reported';
        const value = create('span', 'gz-trump-report-alert__value');
        value.textContent = reportedTorrents.map(formatReportTorrentName).join(' | ');
        appendAll(row, [label, value]);
        item.appendChild(row);
        rawLines.push(`Reported: ${value.textContent}`);
      }

      const trumpingTorrents = normalizeTrumpReportTorrentList(report.trumping_torrent);
      if (trumpingTorrents.length) {
        const row = create('div', 'gz-trump-report-alert__row');
        const label = create('span', 'gz-trump-report-alert__label');
        label.textContent = 'Trumping';
        const value = create('span', 'gz-trump-report-alert__value');
        value.textContent = trumpingTorrents.map(formatReportTorrentName).join(' | ');
        appendAll(row, [label, value]);
        item.appendChild(row);
        rawLines.push(`Trumping: ${value.textContent}`);
      }

      list.appendChild(item);
    });

    alert.appendChild(list);
    host.appendChild(alert);
    return rawLines.join('\n');
  };

  const renderTrumpableReasonNotice = (reason) => {
    const notice = create('div', 'gz-trumpable-reason');
    const heading = create('div', 'gz-trumpable-reason__heading');
    heading.textContent = 'Trumpable Reason';
    const body = create('div', 'gz-trumpable-reason__body');
    body.textContent = reason;
    appendAll(notice, [heading, body]);
    return notice;
  };

  const renderTorrentDetailsContent = (torrentData) => {
    const content = create('div', 'gz-dropdown-details');
    const rawLines = [];
    const torrentId = getTorrentDataId(torrentData);
    const trumpReportHost = create('div', 'gz-trump-report-alert-host');
    trumpReportHost.hidden = true;
    if (torrentId) content.appendChild(trumpReportHost);
    const trumpableReason = torrentData.trumpable === true ? getTorrentTrumpableReason(torrentData) : null;
    if (trumpableReason) {
      content.appendChild(renderTrumpableReasonNotice(trumpableReason));
      rawLines.push('Trumpable Reason:');
      rawLines.push(trumpableReason);
      rawLines.push('');
    }
    const sections = [
      {
        heading: 'Torrent',
        rows: [
          { label: 'Category', value: torrentData.category },
          { label: 'Type', value: torrentData.type },
          { label: 'File Count', value: torrentData.num_file }
        ]
      },
      {
        heading: 'Flags',
        rows: [
          { label: 'Double Upload', value: torrentData.double_upload, kind: 'flag' },
          { label: 'Freeleech', value: torrentData.freeleech, kind: 'freeleech' },
          { label: 'Internal', value: torrentData.internal, kind: 'flag' },
          { label: 'Featured', value: torrentData.featured, kind: 'flag' },
          { label: 'Personal Release', value: torrentData.personal_release, kind: 'flag' },
          { label: 'Exclusive', value: torrentData.exclusive, kind: 'flag' },
          { label: 'Trumpable', value: torrentData.trumpable, kind: 'flag' }
        ]
      },
      {
        heading: 'Meta IDs',
        rows: [
          { label: 'TMDB ID', value: torrentData.tmdb_id, href: buildMetaIdLink('tmdb', torrentData.tmdb_id, torrentData) },
          { label: 'IMDb ID', value: torrentData.imdb_id, displayValue: formatImdbTitleId(torrentData.imdb_id), href: buildMetaIdLink('imdb', torrentData.imdb_id, torrentData) },
          { label: 'TVDB ID', value: torrentData.tvdb_id, href: buildMetaIdLink('tvdb', torrentData.tvdb_id, torrentData) },
          { label: 'MAL ID', value: torrentData.mal_id, href: buildMetaIdLink('mal', torrentData.mal_id, torrentData) }
        ]
      }
    ];

    sections.forEach((sectionConfig, sectionIndex) => {
      if (sectionIndex > 0) rawLines.push('');
      rawLines.push(`${sectionConfig.heading}:`);

      const section = create('section', 'gz-details-section');
      const heading = create('h3', 'gz-details-heading');
      heading.textContent = sectionConfig.heading;
      section.appendChild(heading);

      const grid = create('dl', 'gz-details-grid');
      sectionConfig.rows.forEach(({ label, value, displayValue, href, kind }) => {
        const formattedValue = formatDropdownDetailValue(displayValue ?? value);
        rawLines.push(`${label}: ${formattedValue}`);

        const row = create('div', 'gz-details-row');
        const term = create('dt', 'gz-details-label');
        const detail = create('dd', 'gz-details-value');

        term.textContent = label;
        if (href && formattedValue !== 'N/A') {
          const link = create('a', 'gz-details-link');
          link.href = href;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.textContent = formattedValue;
          detail.appendChild(link);
        } else {
          detail.textContent = formattedValue;
        }

        if (kind === 'flag' || kind === 'freeleech') {
          const isActive = kind === 'flag' ? value === true : isFreeleechActive(value);
          detail.classList.add('gz-details-value--flag', isActive ? 'gz-details-value--active' : 'gz-details-value--inactive');
        }

        row.appendChild(term);
        row.appendChild(detail);
        grid.appendChild(row);
      });

      section.appendChild(grid);
      content.appendChild(section);
    });

    return { element: content, rawContent: rawLines.join('\n'), torrentId, trumpReportHost };
  };

  // Render the dropdown content for a torrent
  const renderTorrentDropdown = (torrentData, colSpan) => {
    const container = create('div', 'gz-dropdown-container');

    // Header: Uploaded by X on Date
    const header = create('div', 'gz-dropdown-header');
    const uploader = torrentData.uploader || 'Anonymous';
    const uploadDate = formatDate(torrentData.created_at);
    const uploaderDisplay = uploader === 'Anonymous'
      ? `<strong>${uploader}</strong>`
      : `<a href="https://aither.cc/users/${uploader}" target="_blank" rel="noopener"><strong>${uploader}</strong></a>`;
    header.innerHTML = `Uploaded by ${uploaderDisplay} on <span>${uploadDate}</span>`;
    container.appendChild(header);

    // Tabs
    const tabs = create('div', 'gz-dropdown-tabs');
    const panels = create('div', 'gz-dropdown-panels');

    // Determine which tabs to show
    const tabsConfig = [
      { id: 'details', label: 'Details', hasContent: true },
      { id: 'description', label: 'Description', hasContent: true },
      { id: 'filelist', label: 'Files', hasContent: torrentData.files && torrentData.files.length > 0 }
    ];

    // Mediainfo / Bdinfo - show whichever is not empty, prefer mediainfo if both exist
    const hasMediainfo = torrentData.media_info && torrentData.media_info.trim();
    const hasBdinfo = torrentData.bd_info && torrentData.bd_info.trim();
    if (hasMediainfo) {
      tabsConfig.push({ id: 'mediainfo', label: 'MediaInfo', hasContent: true, content: torrentData.media_info });
    } else if (hasBdinfo) {
      tabsConfig.push({ id: 'bdinfo', label: 'BDInfo', hasContent: true, content: torrentData.bd_info });
    }

    // Create tabs and panels
    tabsConfig.forEach((config, index) => {
      if (!config.hasContent && config.id !== 'description') return;

      const tab = create('button', 'gz-dropdown-tab');
      tab.textContent = config.label;
      tab.dataset.tab = config.id;
      if (index === 0) tab.classList.add('active');

      const panel = create('div', 'gz-dropdown-panel');
      panel.dataset.panel = config.id;
      if (index === 0) panel.classList.add('active');

      // Store raw content for copying
      let rawCopyContent = '';

      // Populate panel content
      if (config.id === 'details') {
        panel.classList.add('gz-dropdown-details-panel');
        const details = renderTorrentDetailsContent(torrentData);
        rawCopyContent = details.rawContent;
        panel.appendChild(details.element);
        if (details.torrentId && details.trumpReportHost) {
          fetchTrumpReportsForTorrent(details.torrentId)
            .then((reports) => {
              const rawReportContent = renderTrumpReportAlert(details.trumpReportHost, reports);
              panel.dataset.rawContent = [details.rawContent, rawReportContent].filter(Boolean).join('\n\n');
            })
            .catch((err) => {
              console.warn(`GAZELL3D: Failed to fetch trump reports for torrent ${details.torrentId}`, err);
              details.trumpReportHost.hidden = true;
            });
        }
      } else if (config.id === 'description') {
        panel.classList.add('gz-dropdown-description');
        rawCopyContent = torrentData.description || '';
        panel.innerHTML = parseBBCode(rawCopyContent);
      } else if (config.id === 'filelist') {
        panel.classList.add('gz-dropdown-filelist');

        // Build raw file list content for copying
        const fileLines = [];
        if (torrentData.folder) {
          fileLines.push(`Folder: ${torrentData.folder}`);
          fileLines.push('');
        }
        if (torrentData.files) {
          torrentData.files.forEach(file => {
            const fileName = file.name || file;
            const fileSize = file.size ? ` (${formatBytes(file.size)})` : '';
            fileLines.push(`${fileName}${fileSize}`);
          });
        }
        rawCopyContent = fileLines.join('\n');

        // Show root folder name if available
        if (torrentData.folder) {
          const folderInfo = create('div', 'gz-filelist-root-info');
          folderInfo.innerHTML = `<strong>Folder:</strong> ${torrentData.folder}`;
          panel.appendChild(folderInfo);
        }

        // Natural sort function
        const naturalSort = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

        // Build a nested tree structure
        const buildTree = (files) => {
          const root = { folders: {}, files: [] };

          files.forEach(file => {
            const filePath = file.name || file;
            const parts = filePath.split('/');
            let current = root;

            // Navigate/create folder structure
            for (let i = 0; i < parts.length - 1; i++) {
              const folderName = parts[i];
              if (!current.folders[folderName]) {
                current.folders[folderName] = { folders: {}, files: [] };
              }
              current = current.folders[folderName];
            }

            // Add file to the deepest folder
            current.files.push({
              name: parts[parts.length - 1],
              size: file.size
            });
          });

          return root;
        };

        // Count all files recursively in a folder
        const countFiles = (node) => {
          let count = node.files.length;
          Object.values(node.folders).forEach(subfolder => {
            count += countFiles(subfolder);
          });
          return count;
        };

        // Recursively render the tree
        let folderIdCounter = 0;
        const renderTree = (node, depth = 0, parentId = null) => {
          const rows = [];
          const indentPx = depth * 28; // Indentation in pixels (bigger for visibility)

          // Get sorted folder names and file names
          const folderNames = Object.keys(node.folders).sort(naturalSort);
          const sortedFiles = [...node.files].sort((a, b) => naturalSort(a.name, b.name));

          // Render folders first
          folderNames.forEach(folderName => {
            const folder = node.folders[folderName];
            const fileCount = countFiles(folder);
            const folderId = `f${++folderIdCounter}`;
            const isHidden = parentId !== null;

            // Folder row (clickable)
            rows.push(`
              <tr class="gz-filelist-folder-row" data-folder-id="${folderId}" ${parentId ? `data-parent="${parentId}"` : ''} data-depth="${depth}" ${isHidden ? 'style="display:none;"' : ''}>
                <td>
                  <span class="gz-tree-indent" style="display:inline-block; width:${indentPx}px; min-width:${indentPx}px;"></span>
                  <span class="gz-folder-toggle">▶</span>
                  <span class="gz-folder-icon">📁</span>
                  <span class="gz-folder-name">${folderName}</span>
                  <span class="gz-folder-count">(${fileCount} files)</span>
                </td>
                <td></td>
              </tr>
            `);

            // Recursively render subfolders and files
            rows.push(...renderTree(folder, depth + 1, folderId));
          });

          // Render files
          // Files at root level (depth 0) should have no indent
          // Files inside folders are already shown after expanding parent, so they use same indent as folder
          const fileIndentPx = indentPx;
          sortedFiles.forEach(file => {
            const isHidden = parentId !== null;
            rows.push(`
              <tr class="gz-filelist-file-row" ${parentId ? `data-parent="${parentId}"` : ''} data-depth="${depth}" ${isHidden ? 'style="display:none;"' : ''}>
                <td>
                  <span class="gz-tree-indent" style="display:inline-block; width:${fileIndentPx}px; min-width:${fileIndentPx}px;"></span>
                  ${file.name}
                </td>
                <td>${formatBytes(file.size)}</td>
              </tr>
            `);
          });

          return rows;
        };

        // Create table
        const table = create('table');
        table.innerHTML = `
          <thead>
            <tr>
              <th>Name</th>
              <th style="text-align: right; width: 100px;">Size</th>
            </tr>
          </thead>
          <tbody>
            ${torrentData.files ? renderTree(buildTree(torrentData.files)).join('') : '<tr><td colspan="2">No files found</td></tr>'}
          </tbody>
        `;

        // Add click handlers for folder expansion
        table.querySelectorAll('.gz-filelist-folder-row').forEach(folderRow => {
          folderRow.addEventListener('click', () => {
            const folderId = folderRow.dataset.folderId;
            const toggle = folderRow.querySelector('.gz-folder-toggle');
            const isExpanded = toggle.textContent === '▼';

            if (isExpanded) {
              // Collapse: hide all nested rows recursively
              const hideRecursive = (parentId) => {
                table.querySelectorAll(`tr[data-parent="${parentId}"]`).forEach(row => {
                  row.style.display = 'none';
                  // Also collapse any expanded subfolders
                  if (row.classList.contains('gz-filelist-folder-row')) {
                    const nestedToggle = row.querySelector('.gz-folder-toggle');
                    if (nestedToggle) nestedToggle.textContent = '▶';
                    hideRecursive(row.dataset.folderId);
                  }
                });
              };
              hideRecursive(folderId);
              toggle.textContent = '▶';
            } else {
              // Expand: show direct children only
              table.querySelectorAll(`tr[data-parent="${folderId}"]`).forEach(row => {
                row.style.display = '';
              });
              toggle.textContent = '▼';
            }
          });
        });

        // Debug: Log tree structure
        const allRows = table.querySelectorAll('tbody tr');
        const hiddenRows = Array.from(allRows).filter(r => r.style.display === 'none');
        console.log('GAZELL3D: File tree rendered. Total rows:', allRows.length, 'Hidden:', hiddenRows.length);

        panel.appendChild(table);
      } else if (config.id === 'mediainfo' || config.id === 'bdinfo') {
        panel.classList.add('gz-dropdown-mediainfo');
        rawCopyContent = config.content;

        // Parse and display summary based on type
        if (config.id === 'bdinfo') {
          const parsed = parseBDInfo(config.content);
          if (parsed.summary) {
            panel.appendChild(renderBDInfoSummary(parsed.summary, config.content));
          }
        } else {
          const parsed = parseMediaInfo(config.content);
          if (parsed.summary) {
            panel.appendChild(renderMediaInfoSummary(parsed.summary, config.content));
          }
        }
      }

      // Store raw content on the panel for later
      panel.dataset.rawContent = rawCopyContent || '';

      tab.addEventListener('click', () => {
        // Remove active from all tabs and panels
        tabs.querySelectorAll('.gz-dropdown-tab').forEach(t => t.classList.remove('active'));
        panels.querySelectorAll('.gz-dropdown-panel').forEach(p => p.classList.remove('active'));
        // Add active to clicked tab and corresponding panel
        tab.classList.add('active');
        panel.classList.add('active');
      });

      tabs.appendChild(tab);
      panels.appendChild(panel);
    });

    // Add single copy button to tabs row
    const copyBtn = create('button', 'gz-panel-copy-btn');
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const activePanel = panels.querySelector('.gz-dropdown-panel.active');
      const rawContent = activePanel?.dataset.rawContent || '';
      if (!rawContent) return;

      try {
        await navigator.clipboard.writeText(rawContent);
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.classList.remove('copied');
        }, 2000);
      } catch (err) {
        console.error('GAZELL3D: Failed to copy:', err);
        copyBtn.textContent = 'Failed';
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
        }, 2000);
      }
    });
    tabs.appendChild(copyBtn);

    container.appendChild(tabs);
    container.appendChild(panels);

    return container;
  };

  // Create a loading dropdown row
  const createLoadingDropdownRow = (colSpan) => {
    const dropdownRow = create('tr', 'gz-dropdown-row');
    const td = create('td');
    td.setAttribute('colspan', colSpan);
    td.innerHTML = '<div class="gz-dropdown-loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
    dropdownRow.appendChild(td);
    return dropdownRow;
  };

  // Create an error dropdown row
  const createErrorDropdownRow = (colSpan, message) => {
    const dropdownRow = create('tr', 'gz-dropdown-row');
    const td = create('td');
    td.setAttribute('colspan', colSpan);
    td.innerHTML = `<div class="gz-dropdown-error">${message}</div>`;
    dropdownRow.appendChild(td);
    return dropdownRow;
  };

  // ============================================
  // Trump Report Feature
  // ============================================

  // Global registry to track all torrents on the page with their season groups
  const trumpTorrentRegistry = {
    torrents: new Map(), // Map<torrentId, { name, seasonGroup }>
    clear() {
      this.torrents.clear();
    },
    register(torrentId, name, seasonGroup = null) {
      this.torrents.set(torrentId, { name, seasonGroup });
    },
    getEligibleTorrents(reportedTorrentId, seasonGroup, isTV) {
      const eligible = [];
      this.torrents.forEach((data, id) => {
        if (id === reportedTorrentId) return; // Exclude self
        // For TV shows, only include torrents from the same season
        if (isTV && seasonGroup && data.seasonGroup !== seasonGroup) return;
        eligible.push({ id, name: data.name });
      });
      return eligible;
    }
  };

  // Show a toast notification
  const showToast = (message, type = 'info', duration = 5000) => {
    // Remove any existing toast
    const existing = document.querySelector('.gz-toast');
    if (existing) existing.remove();

    const toast = create('div', `gz-toast gz-toast--${type}`);
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'gz-toast-slide-in 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  // Submit Trump Report to API
  const submitTrumpReport = async (payload) => {
    const url = 'https://aither.cc/api/trumping-reports/create';

    try {
      const response = await gmFetchJson(
        url,
        {
          headers: {
            'Authorization': `Bearer ${AITHER_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          data: JSON.stringify(payload)
        },
        'POST',
        30000
      );

      return response;
    } catch (error) {
      console.error('GAZELL3D: Trump report submission failed:', error);
      throw error;
    }
  };

  // Show Trump Report Modal
  const showTrumpReportModal = (reportedTorrentId, reportedTorrentName, seasonGroup, isTV) => {
    // Get eligible torrents for the dropdown
    const eligibleTorrents = trumpTorrentRegistry.getEligibleTorrents(reportedTorrentId, seasonGroup, isTV);

    if (eligibleTorrents.length === 0) {
      showToast('No other torrents available in this season group to trump with.', 'error');
      return;
    }

    // Create overlay
    const overlay = create('div', 'gz-trump-overlay');

    // Create modal
    const modal = create('div', 'gz-trump-modal');
    modal.innerHTML = `
      <div class="gz-trump-header">
        <h3>Submit Trump Report</h3>
        <button class="gz-trump-close" type="button">&times;</button>
      </div>
      <form class="gz-trump-form">
        <div class="gz-trump-field">
          <label>Reported Torrent (to be trumped)</label>
          <div class="reported-torrent">${reportedTorrentName}</div>
        </div>
        <div class="gz-trump-field">
          <label for="gz-trump-torrent">Trumping Torrent (superior release)</label>
          <select id="gz-trump-torrent" class="gz-trump-select" required>
            <option value="">Select a torrent...</option>
            ${eligibleTorrents.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
          </select>
        </div>
        <div class="gz-trump-field">
          <label for="gz-trump-message">Reason for Trump Report</label>
          <textarea id="gz-trump-message" class="gz-trump-textarea" required placeholder="Explain why the reported torrent should be trumped by the selected torrent..."></textarea>
        </div>
        <div class="gz-trump-field">
          <label for="gz-trump-screenshots-reported">Screenshots of Reported Torrent (optional)</label>
          <input id="gz-trump-screenshots-reported" class="gz-trump-input" type="url" placeholder="https://example.com/screenshot.png" />
        </div>
        <div class="gz-trump-field">
          <label for="gz-trump-screenshots-trumping">Screenshots of Trumping Torrent (optional)</label>
          <input id="gz-trump-screenshots-trumping" class="gz-trump-input" type="url" placeholder="https://example.com/screenshot.png" />
        </div>
        <div class="gz-trump-buttons">
          <button type="button" class="gz-trump-btn gz-trump-btn--cancel">Cancel</button>
          <button type="submit" class="gz-trump-btn gz-trump-btn--submit">Submit Report</button>
        </div>
      </form>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Close handlers
    const closeModal = () => overlay.remove();

    overlay.querySelector('.gz-trump-close').addEventListener('click', closeModal);
    overlay.querySelector('.gz-trump-btn--cancel').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    // Escape key closes modal
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    // Form submission
    const form = modal.querySelector('.gz-trump-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const trumpingTorrentId = document.getElementById('gz-trump-torrent').value;
      const message = document.getElementById('gz-trump-message').value.trim();
      const screenshotsReported = document.getElementById('gz-trump-screenshots-reported').value.trim();
      const screenshotsTrumping = document.getElementById('gz-trump-screenshots-trumping').value.trim();

      if (!trumpingTorrentId || !message) {
        showToast('Please select a torrent and provide a reason.', 'error');
        return;
      }

      const submitBtn = modal.querySelector('.gz-trump-btn--submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      try {
        const payload = {
          reported_torrent_id: parseInt(reportedTorrentId, 10),
          trumping_torrent_id: parseInt(trumpingTorrentId, 10),
          message: message
        };

        // Add optional screenshot fields if provided
        if (screenshotsReported) {
          payload.screenshots_reported_torrent = screenshotsReported;
        }
        if (screenshotsTrumping) {
          payload.screenshots_trumping_torrent = screenshotsTrumping;
        }

        const response = await submitTrumpReport(payload);

        closeModal();

        if (response.success) {
          showToast(`Trump report submitted successfully! ${response.message || ''}`, 'success', 7000);
        } else {
          showToast(`Error: ${response.message || 'Unknown error occurred'}`, 'error', 7000);
        }
      } catch (error) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Report';
        showToast(`Failed to submit report: ${error.message || 'Network error'}`, 'error', 7000);
      }
    });

    // Focus the select element
    setTimeout(() => document.getElementById('gz-trump-torrent')?.focus(), 100);
  };
