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
    const subtitle = torrentNaming.format(originalHeadline);
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
      const groupedRow = link.closest('.torrent-search--grouped__torrents tr');
      const { heading, subtitle } = groupedRow
        ? { heading: raw, subtitle: torrentNaming.format(raw, { typeLabel: getSearchGroupTypeCell(groupedRow)?.textContent.trim(), hideSeasonEpisode: false }) }
        : popupHeading
        ? {
          heading: popupYearText ? `${popupHeading} (${popupYearText})` : popupHeading,
          subtitle: torrentNaming.format(raw),
        }
        : torrentNaming.searchDisplay(raw);
      if (!heading || !subtitle || subtitle.length === 0) return;

      link.textContent = '';
      const wrapper = create('div', 'gz-search-title');
      const headingEl = create('div', 'gz-search-title__heading');
      headingEl.textContent = heading;
      const subEl = create('div', 'gz-search-title__subheading');
      applyUnknownHighlight(subEl, subtitle);
      if (!groupedRow) wrapper.appendChild(headingEl);
      wrapper.appendChild(subEl);

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

const parseRequirementRow = (row) => {
  const cells = Array.from(row.children);
  const labelCell = cells.find((cell) => !cell.classList.contains('group-requirements__group--requirement-row-to-advance') && !cell.classList.contains('group-requirements__group--requirement-row-dropdown') && !cell.classList.contains('group-requirements__group--requirement-row-extended'));
  const valueCell = cells.find((cell) => cell !== labelCell && !cell.classList.contains('group-requirements__group--requirement-row-to-advance') && !cell.classList.contains('group-requirements__group--requirement-row-dropdown') && !cell.classList.contains('group-requirements__group--requirement-row-extended'));
  const statusCell = row.querySelector('.group-requirements__group--requirement-row-to-advance');
  const labelIcon = labelCell?.querySelector('i')?.cloneNode(true) || null;
  const label = getText(labelCell).replace(/\s+/g, ' ');
  const currentValue = getText(valueCell);
  const statusIcon = statusCell?.querySelector('i');
  const isPassed = !!statusIcon && (statusIcon.classList.contains('fa-check') || statusIcon.classList.contains('text-green'));
  const isFailed = !!statusIcon && (statusIcon.classList.contains('fa-x') || statusIcon.classList.contains('text-red'));
  const detailCells = Array.from(row.querySelectorAll('.group-requirements__group--requirement-row-extended tbody tr:last-child td'));
  const requiredValue = detailCells[0] ? getText(detailCells[0]) : '';
  const toAdvance = detailCells[1] ? getText(detailCells[1]) : '';

  return {
    label,
    labelIcon,
    currentValue,
    requiredValue,
    toAdvance,
    isPassed,
    isFailed,
  };
};

const parseGroupRequirementsData = (page) => {
  return $$('.group-requirements__path-wrapper', page).flatMap((section) => {
    const sectionName = getText(section.querySelector(':scope > h3')) || 'Group';

    return $$('.group-requirements__group-wrapper', section).map((group) => {
      const titleNode = group.querySelector('.group-requirements__group--header h3 span');
      const titleIcon = titleNode?.querySelector('i')?.cloneNode(true) || null;
      const title = getText(titleNode);
      const color = titleNode?.style?.color || '';
      const description = getText(group.querySelector('.group-requirements__group--description'));
      const separators = $$('.group-requirements__group--separator', group).map((node) => getText(node));
      const requirements = $$('.group-requirements__group--requirement-row', group).map(parseRequirementRow).filter((item) => item.label);
      const perks = $$('.group-requirements__perk-extended', group).map((node) => ({
        icon: node.querySelector('i')?.cloneNode(true) || null,
        text: getText(node),
      })).filter((item) => item.text);

      return {
        sectionName,
        title,
        titleIcon,
        color,
        description,
        separators,
        requirements,
        perks,
      };
    });
  }).filter((group) => group.title);
};

const arrangeGroupRequirements = (groups) => {
  const byTitle = new Map();
  groups.forEach((group) => {
    const key = normalizeText(group.title).toLowerCase();
    if (!key) return;
    if (!byTitle.has(key)) byTitle.set(key, { count: 0, sections: new Set() });
    const entry = byTitle.get(key);
    entry.count += 1;
    entry.sections.add(group.sectionName);
  });

  const sharedKeys = new Set(
    Array.from(byTitle.entries())
      .filter(([, entry]) => entry.count > 1 && entry.sections.size > 1)
      .map(([key]) => key)
  );
  const addedShared = new Set();
  const shared = [];
  const sectioned = [];

  groups.forEach((group) => {
    const key = normalizeText(group.title).toLowerCase();
    if (sharedKeys.has(key)) {
      if (!addedShared.has(key)) {
        shared.push({ ...group, sectionName: 'Shared Classes' });
        addedShared.add(key);
      }
      return;
    }
    sectioned.push(group);
  });

  return [...shared, ...sectioned];
};

const getGroupRequirementSummary = (groups) => {
  const sectionCount = new Set(groups.map((group) => group.sectionName)).size;
  return `${groups.length} classes / ${sectionCount} sections`;
};

const makeRequirementItem = (requirement) => {
  const item = create('div', 'gz-req-v2-criterion');
  const label = create('div', 'gz-req-v2-criterion__label');
  label.appendChild(document.createTextNode(requirement.label));

  const values = create('div', 'gz-req-v2-criterion__values');
  const primaryValue = requirement.requiredValue || requirement.currentValue || '-';
  const primary = create('span', 'gz-req-v2-criterion__value');
  primary.textContent = primaryValue;
  if (requirement.toAdvance && requirement.toAdvance !== primaryValue) {
    const advanceText = requirement.isPassed ? requirement.toAdvance : `Need ${requirement.toAdvance}`;
    primary.title = advanceText;
    primary.setAttribute('aria-label', `${primaryValue} (${advanceText})`);
    primary.classList.add('gz-req-v2-criterion__value--tooltip');
  }
  values.appendChild(primary);

  const status = create('span', requirement.isPassed ? 'gz-req-v2-status gz-req-v2-status--pass' : 'gz-req-v2-status gz-req-v2-status--fail');
  const statusIcon = create('i', requirement.isPassed ? 'fas fa-check' : requirement.isFailed ? 'fas fa-x' : 'fas fa-minus');
  status.appendChild(statusIcon);

  item.appendChild(label);
  item.appendChild(values);
  item.appendChild(status);
  return item;
};

const makePerkItem = (perk) => {
  const item = create('div', 'gz-req-v2-perk');
  const text = create('span');
  text.textContent = perk.text;
  item.appendChild(text);
  return item;
};

const appendRequirementItems = (panel, group) => {
  const used = new Set();
  const choiceSeparator = group.separators.find((separator) => /satisfy one of:/i.test(separator));
  const choiceLabels = choiceSeparator
    ? choiceSeparator
        .replace(/satisfy one of:/i, '')
        .replace(/[✓✔✕×]/g, '')
        .split(/\s+OR\s+/i)
        .map((label) => normalizeText(label).toLowerCase())
        .filter(Boolean)
    : [];
  let appendedChoice = false;

  if (choiceLabels.length > 1) {
    const choice = create('div', 'gz-req-v2-choice');
    const choiceTitle = create('div', 'gz-req-v2-choice__title');
    choiceTitle.textContent = 'Satisfy one of';
    const choiceItems = create('div', 'gz-req-v2-choice__items');

    choiceLabels.forEach((choiceLabel) => {
      const requirement = group.requirements.find((item, index) => !used.has(index) && normalizeText(item.label).toLowerCase() === choiceLabel);
      if (!requirement) return;
      const index = group.requirements.indexOf(requirement);
      used.add(index);
      choiceItems.appendChild(makeRequirementItem(requirement));
    });

    if (choiceItems.children.length) {
      choice.appendChild(choiceTitle);
      choice.appendChild(choiceItems);
      panel.appendChild(choice);
      appendedChoice = true;
    }
  }

  group.separators
    .filter((separator) => !appendedChoice || separator !== choiceSeparator)
    .forEach((separator) => {
      const note = create('div', 'gz-req-v2-rule-note');
      note.textContent = separator;
      panel.appendChild(note);
    });

  group.requirements.forEach((requirement, index) => {
    if (!used.has(index)) panel.appendChild(makeRequirementItem(requirement));
  });
};

const buildGroupRequirementsLayout = (page = $(SELECTORS.groupRequirementsPage)) => {
  if (!page || page.dataset.gzRequirementsLayout === '1') return !!page;
  const groups = parseGroupRequirementsData(page);
  if (!groups.length) return false;
  const displayGroups = arrangeGroupRequirements(groups);

  const article = page.querySelector('article') || page;
  const shell = create('section', 'gz-req-v2');
  const header = create('div', 'gz-req-v2-header');
  const title = create('h1', 'gz-req-v2-title');
  title.textContent = 'User Groups';
  const summary = create('div', 'gz-req-v2-summary');
  summary.textContent = getGroupRequirementSummary(displayGroups);
  header.appendChild(title);
  header.appendChild(summary);
  shell.appendChild(header);

  let lastSection = '';
  displayGroups.forEach((group) => {
    if (group.sectionName !== lastSection) {
      const section = create('div', 'gz-req-v2-section');
      section.textContent = group.sectionName;
      shell.appendChild(section);
      lastSection = group.sectionName;
    }

    const row = create('article', 'gz-req-v2-row');
    const identity = create('section', 'gz-req-v2-rank');
    const rankTitle = create('h2', 'gz-req-v2-rank__title');
    rankTitle.textContent = group.title;
    const rankIcon = create('div', 'gz-req-v2-rank__icon');
    if (group.titleIcon) rankIcon.appendChild(group.titleIcon);
    const desc = create('p', 'gz-req-v2-rank__description');
    desc.textContent = group.description || 'No description available';
    identity.appendChild(rankTitle);
    identity.appendChild(rankIcon);
    identity.appendChild(desc);

    const reqPanel = create('section', 'gz-req-v2-panel');
    const reqHeading = create('h3', 'gz-req-v2-panel__heading');
    reqHeading.textContent = 'Requirements / Restrictions';
    reqPanel.appendChild(reqHeading);
    if (group.requirements.length) {
      appendRequirementItems(reqPanel, group);
    } else {
      const empty = create('div', 'gz-req-v2-empty');
      empty.textContent = 'No requirements';
      reqPanel.appendChild(empty);
    }

    const perksPanel = create('section', 'gz-req-v2-panel gz-req-v2-panel--perks');
    const perksHeading = create('h3', 'gz-req-v2-panel__heading');
    perksHeading.textContent = 'Additional Perks';
    perksPanel.appendChild(perksHeading);
    if (group.perks.length) {
      group.perks.forEach((perk) => perksPanel.appendChild(makePerkItem(perk)));
    } else {
      const empty = create('div', 'gz-req-v2-empty');
      empty.textContent = 'No additional perks';
      perksPanel.appendChild(empty);
    }

    row.appendChild(identity);
    row.appendChild(reqPanel);
    row.appendChild(perksPanel);
    shell.appendChild(row);
  });

  article.textContent = '';
  article.appendChild(shell);
  page.classList.add('gz-req-v2-page');
  page.dataset.gzRequirementsLayout = '1';
  return true;
};

const getSearchResultTorrentId = (row, link) => {
    const rowId = row?.dataset?.torrentId;
    if (rowId) return rowId;
    const torrentUrl = link?.href || '';
    const torrentIdMatch = torrentUrl.match(/\/torrents\/(\d+)/);
    return torrentIdMatch ? torrentIdMatch[1] : null;
  };

  // Grouped search type headings span release rows, including an open dropdown.
  const getSearchGroupTypeCell = (row) => {
    if (!row.closest('.torrent-search--grouped__torrents')) return null;
    let current = row;
    while (current) {
      const cell = current.querySelector('.torrent-search--grouped__type');
      if (cell) return cell;
      current = current.previousElementSibling;
    }
    return null;
  };

  const getSearchDropdownColSpan = (row) => {
    const rowCells = Array.from(row?.cells || []).reduce((total, cell) =>
      total + (cell.matches('.torrent-search--grouped__type') ? 0 : cell.colSpan), 0);
    if (rowCells > 0) return rowCells;
    const headerCells = row?.closest('table')?.querySelectorAll('thead th').length || 0;
    return headerCells > 0 ? headerCells : 1;
  };

  const searchDropdownAttachments = new Map();

  const enhanceSearchTorrentDropdowns = () => {
    for (const [link, attachment] of searchDropdownAttachments) {
      if (!link.isConnected || !attachment.row.contains(link)) {
        attachment.detach();
        delete link.dataset.gzSearchDropdown;
        searchDropdownAttachments.delete(link);
      }
    }
    if (!CONFIG.enableTorrentDropdowns) return;

    $$(SELECTORS.searchResults).forEach((link) => {
      const row = link.closest('tr');
      if (!row) return;
      if (!link || link.dataset.gzSearchDropdown === '1') return;

      const torrentId = getSearchResultTorrentId(row, link);
      if (!torrentId) return;

      link.dataset.torrentId = torrentId;
      link.dataset.gzSearchDropdown = '1';
      const detach = torrentDropdowns.attach({
        row,
        link,
        load: () => torrentRepository.byId(torrentId),
        colSpan: () => getSearchDropdownColSpan(row),
        onOpen: () => {
          const typeCell = getSearchGroupTypeCell(row);
          if (!typeCell || typeCell.rowSpan === 0) return;
          typeCell.rowSpan += 1;
          return () => { typeCell.rowSpan -= 1; };
        },
        getTrumpableReason: () => extractTrumpableReasonFromElement(row),
      });
      searchDropdownAttachments.set(link, { row, detach });
    });
  };

  const refreshSearchResults = () => {
    buildMediahubLayouts();
    if (CONFIG.enableGazellifySearch) {
      gazellifySearchResults();
    }
    if (CONFIG.enableTorrentDropdowns) {
      enhanceSearchTorrentDropdowns();
    }
  };

  const watchSearchResults = () => {
    if (!CONFIG.enableGazellifySearch && !CONFIG.enableTorrentDropdowns && !CONFIG.enableGazelleTorrentLayout) return;
    if (searchResultsObserver) {
      searchResultsObserver.disconnect();
      searchResultsObserver = null;
    }
    const searchPage = $(SELECTORS.torrentSearchPage);
    if (!searchPage) return;
    searchResultsObserver = new MutationObserver(() => refreshSearchResults());
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
      const formatted = torrentNaming.format(sourceText, {
        typeLabel: findTorrentTypeForHeading(heading),
        hideSeasonEpisode: CONFIG.enableGazelleTorrentLayout,
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
    $$('.torrent-icons').forEach((node) => liveTorrentIcons.filter(node));

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
