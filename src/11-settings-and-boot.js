  const initPage = () => {
    // Profile assembly preserves complete host controls and dialog scopes.
    const userProfile = $('main.page__user-profile--show');
    if (userProfile) {
      return buildUserProfileLayout(userProfile);
    }
    // Other /users routes share the install match, but need no page observer.
    if (location.pathname.startsWith('/users/')) return true;
    if ($(SELECTORS.layout)) return true;

    const similarArticle = $(SELECTORS.similarArticle);
    if (similarArticle) {
      return buildSimilarLayout(similarArticle);
    }

    const torrentArticle = $(SELECTORS.torrentArticle);
    if (torrentArticle) {
      return buildTorrentLayout(torrentArticle);
    }

  const searchPage = $(SELECTORS.torrentSearchPage);
  if (searchPage) {
    refreshSearchResults();
    watchSearchResults();
    return true;
  }

  const groupRequirementsPage = $(SELECTORS.groupRequirementsPage);
  if (groupRequirementsPage) {
    return buildGroupRequirementsLayout(groupRequirementsPage);
  }

  return false;
};

  // Config option definitions for the modal
  const CONFIG_OPTIONS = [
    { key: 'removeTorrentIcons', label: 'Remove torrent icons' },
    { key: 'enableGazellifySimilar', label: 'Gazellify similar page titles' },
    { key: 'enableGazellifyDetail', label: 'Gazellify detail page titles' },
    { key: 'enableGazellifySearch', label: 'Gazellify search page titles' },
    { key: 'enableOriginalTitleTooltip', label: 'Show original title tooltip' },
    { key: 'showEditButton', label: 'Show edit button' },
    { key: 'enableSideLayout', label: 'Enable side layout' },
    { key: 'enableGazelleButtons', label: 'Enable Gazelle-style buttons' },
    { key: 'enableGazelleTorrentLayout', label: 'Enable Gazelle torrent table layout' },
    { key: 'enableTorrentDropdowns', label: 'Enable torrent dropdowns (requires API key)' },
    { key: 'enableComponentColors', label: 'Enable component colors in Gazellify names' },
    { key: 'baseFontSize', label: 'Base Font Size (%)', type: 'number', min: 50, max: 200 },
  ];

  // Each opening edits an isolated draft; only Save writes to userscript storage.
  const showConfigModal = () => {
    if (document.querySelector('.gz-config-overlay')) return;
    const previousFocus = document.activeElement;
    const overlay = create('div', 'gz-config-overlay');
    const modal = create('div', 'gz-config-modal');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'gz-config-title');
    const el = (tag, className, text) => {
      const node = create(tag, className);
      if (text !== undefined) node.textContent = text;
      return node;
    };
    const button = (text, action, className = 'gz-config-btn') => {
      const node = el('button', className, text);
      node.type = 'button';
      node.onclick = action;
      return node;
    };
    const background = [...document.body.children].map(node => [node, node.inert]);
    const previousOverflow = document.body.style.overflow;
    const close = () => {
      document.removeEventListener('keydown', onKeydown, true);
      overlay.remove();
      background.forEach(([node, inert]) => { node.inert = inert; });
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
    const onKeydown = event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
      if (event.key !== 'Tab') return;
      const focusable = [...modal.querySelectorAll('button, input, [tabindex="0"]')]
        .filter(node => !node.disabled && !node.closest('[hidden]'));
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !modal.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    };

    const header = el('header', 'gz-config-header');
    const heading = el('div');
    const title = el('h2', 'gz-config-title', 'GAZELL3D Settings');
    title.id = 'gz-config-title';
    heading.append(title);
    const closeBtn = button('×', close, 'gz-config-btn gz-config-close');
    closeBtn.setAttribute('aria-label', 'Close settings');
    header.append(heading, closeBtn);
    const workspace = el('div', 'gz-config-workspace');
    const nav = el('nav', 'gz-config-nav');
    nav.setAttribute('aria-label', 'Settings sections');
    const body = el('div', 'gz-config-body');
    const panels = {}, navButtons = {};
    const activate = key => {
      Object.keys(panels).forEach(id => {
        panels[id].hidden = id !== key;
        if (id === key) navButtons[id].setAttribute('aria-current', 'page');
        else navButtons[id].removeAttribute('aria-current');
      });
      preview.hidden = key !== 'names' && key !== 'colors';
      body.scrollTop = 0;
    };
    const section = (key, name, description) => {
      const panel = el('section', 'gz-config-section');
      panel.id = `gz-settings-${key}`;
      panel.append(el('h3', 'gz-config-section-title', name), el('p', 'gz-config-description', description));
      const link = button(name, () => activate(key), 'gz-config-nav-button');
      link.setAttribute('aria-controls', panel.id);
      panels[key] = panel; navButtons[key] = link;
      nav.append(link); body.append(panel);
      return panel;
    };
    const general = section('general', 'Layout & display', 'Fine-tune the way torrent pages look and behave.');
    const names = section('names', 'Torrent names', 'Choose where to simplify release names and how their components appear.');
    const colors = section('colors', 'Component colors', 'Give each part of a release name its own color.');
    const connection = section('connection', 'API connection', 'Connect your Aither API key to load expanded torrent details.');
    const inputs = {}, colorInputs = {};
    const namingKeys = new Set(['enableGazellifySimilar', 'enableGazellifyDetail', 'enableGazellifySearch', 'enableOriginalTitleTooltip']);
    const descriptions = {
      removeTorrentIcons: 'Hide standard torrent icons for a cleaner listing.',
      enableGazellifySimilar: 'Simplify names in grouped torrent listings.',
      enableGazellifyDetail: 'Simplify the title on individual torrent pages.',
      enableGazellifySearch: 'Simplify release names in search results.',
      enableOriginalTitleTooltip: 'Keep the full release name available on hover.',
      showEditButton: 'Show the edit action on torrent pages.',
      enableSideLayout: 'Place torrent information in a side column.',
      enableGazelleButtons: 'Use compact Gazelle-style torrent actions.',
      enableGazelleTorrentLayout: 'Arrange grouped releases in a Gazelle-style table.',
      enableTorrentDropdowns: 'Expand details inline. An API key is required.',
      enableComponentColors: 'Apply the palette below to simplified names.',
      baseFontSize: 'Scale similar and detail page content. Default: 100%.',
    };
    CONFIG_OPTIONS.forEach(opt => {
      const label = el('label', 'gz-config-field');
      const copy = el('span', 'gz-config-field-copy');
      copy.append(el('span', 'gz-config-label', opt.label), el('span', 'gz-config-help', descriptions[opt.key]));
      const input = el('input', opt.type === 'number' ? 'gz-config-input gz-config-number' : 'gz-config-toggle');
      input.id = `gz-option-${opt.key}`;
      input.type = opt.type || 'checkbox';
      if (opt.type === 'number') {
        input.min = opt.min; input.max = opt.max; input.step = 1; input.required = true;
        input.value = CONFIG[opt.key] ?? DEFAULT_CONFIG[opt.key];
      } else input.checked = CONFIG[opt.key] ?? DEFAULT_CONFIG[opt.key];
      inputs[opt.key] = input;
      label.append(copy, input);
      const target = namingKeys.has(opt.key) ? names : opt.key === 'enableComponentColors' ? colors : opt.key === 'enableTorrentDropdowns' ? connection : general;
      target.append(label);
    });

    const apiLabel = el('label', 'gz-config-input-label', 'Aither API key');
    apiLabel.htmlFor = 'gz-api-key-input';
    const apiRow = el('div', 'gz-config-api-row');
    const apiInput = el('input', 'gz-config-input');
    apiInput.type = 'password'; apiInput.id = 'gz-api-key-input';
    apiInput.autocomplete = 'off'; apiInput.spellcheck = false;
    apiInput.placeholder = 'Paste your API key'; apiInput.value = AITHER_API_KEY || '';
    const reveal = button('Show', () => {
      const showing = apiInput.type === 'password';
      apiInput.type = showing ? 'text' : 'password';
      reveal.textContent = showing ? 'Hide' : 'Show';
      reveal.setAttribute('aria-pressed', String(showing));
    });
    reveal.setAttribute('aria-label', 'Show or hide API key');
    reveal.setAttribute('aria-pressed', 'false');
    apiRow.append(apiInput, reveal);
    const apiStatus = el('p', 'gz-config-notice');
    apiStatus.id = 'gz-api-status'; apiStatus.setAttribute('aria-live', 'polite');
    apiInput.setAttribute('aria-describedby', apiStatus.id);
    connection.append(apiLabel, apiRow, apiStatus, el('p', 'gz-config-help', 'Saved in your userscript manager. The key is used for requests to Aither; it is not checked when you save.'));
    const updateApiStatus = () => {
      apiStatus.textContent = apiInput.value.trim() ? 'Key entered · connection not verified' : inputs.enableTorrentDropdowns.checked ? 'Add a key to use torrent dropdowns. Other settings work without one.' : 'No key entered · torrent dropdowns are off';
    };
    apiInput.addEventListener('input', updateApiStatus);
    inputs.enableTorrentDropdowns.addEventListener('change', updateApiStatus);
    updateApiStatus();

    let currentSequence = [...SEQUENCE_CONFIG.order];
    let disabledItems = new Set(SEQUENCE_CONFIG.disabled);
    const sample = { videoCodec: 'H.265', bitDepth: '10-bit', resolution: '2160p', country: 'USA', service: 'AMZN', source: 'WEB-DL', remux: 'Remux', seasonEpisode: 'S01E02', language: 'English', audio: 'DD+ 5.1', atmos: 'Atmos', hdr: 'HDR10', hybrid: 'Hybrid', cut: 'Extended', repack: 'REPACK', scene: 'Scene', group: 'Group' };
    const preview = el('div', 'gz-config-preview');
    preview.append(el('div', 'gz-config-eyebrow', 'NAME PREVIEW · SAMPLE COMPONENTS'));
    const previewName = el('div', 'gz-config-preview-name');
    preview.append(previewName);
    const updatePreview = () => {
      previewName.replaceChildren();
      currentSequence.filter(key => !disabledItems.has(key)).forEach(key => {
        const part = el('span', '', sample[key]);
        if (inputs.enableComponentColors.checked) part.style.color = colorInputs[key].value;
        previewName.append(part);
      });
      if (!previewName.childElementCount) previewName.textContent = 'All components are hidden.';
      colorsGrid.classList.toggle('is-muted', !inputs.enableComponentColors.checked);
    };
    const colorsGrid = el('div', 'gz-config-colors');
    Object.keys(DEFAULT_CONFIG.componentColors).forEach(key => {
      const label = el('label', 'gz-config-color');
      const input = el('input'); input.type = 'color';
      input.value = CONFIG.componentColors[key] || DEFAULT_CONFIG.componentColors[key];
      colorInputs[key] = input;
      label.append(input, el('span', '', SEQUENCE_LABELS[key]));
      colorsGrid.append(label);
      input.addEventListener('input', updatePreview);
    });
    colors.append(colorsGrid, button('Reset colors', () => {
      Object.keys(colorInputs).forEach(key => { colorInputs[key].value = DEFAULT_CONFIG.componentColors[key]; });
      updatePreview(); markDirty();
    }));
    inputs.enableComponentColors.addEventListener('change', updatePreview);

    names.append(el('h4', 'gz-config-subtitle', 'Component order'), el('p', 'gz-config-help', 'Drag to reorder, or use the arrow buttons. Uncheck a component to hide it.'));
    const sequenceList = el('div', 'gz-sequence-list');
    const sequenceStatus = el('span', 'gz-config-sr-only');
    sequenceStatus.setAttribute('aria-live', 'polite');
    const move = (key, targetIndex) => {
      const index = currentSequence.indexOf(key);
      if (index < 0 || targetIndex < 0 || targetIndex >= currentSequence.length || index === targetIndex) return;
      currentSequence.splice(index, 1); currentSequence.splice(targetIndex, 0, key);
      renderSequenceList(); updatePreview(); markDirty();
      sequenceStatus.textContent = `${SEQUENCE_LABELS[key]} moved to position ${targetIndex + 1}.`;
    };
    const renderSequenceList = () => {
      sequenceList.replaceChildren();
      currentSequence.forEach((key, index) => {
        const item = el('div', 'gz-sequence-item');
        item.dataset.key = key; item.draggable = true;
        item.classList.toggle('disabled', disabledItems.has(key));
        const label = el('label', 'gz-sequence-label');
        const toggle = el('input', 'gz-sequence-toggle');
        toggle.type = 'checkbox'; toggle.checked = !disabledItems.has(key);
        toggle.onchange = () => {
          if (toggle.checked) disabledItems.delete(key); else disabledItems.add(key);
          item.classList.toggle('disabled', !toggle.checked);
          updatePreview(); markDirty();
        };
        label.append(toggle, el('span', '', SEQUENCE_LABELS[key]));
        const handle = el('span', 'gz-sequence-handle', '⠿'); handle.setAttribute('aria-hidden', 'true');
        item.append(handle, label);
        [-1, 1].forEach(direction => {
          const arrow = button(direction === -1 ? '↑' : '↓', () => {
            move(key, index + direction);
            const moved = sequenceList.querySelector(`[data-key="${key}"]`);
            const preferred = moved.querySelector(`[data-direction="${direction}"]`);
            (preferred.disabled ? moved.querySelector('input') : preferred).focus();
          }, 'gz-config-btn gz-sequence-arrow');
          arrow.dataset.direction = direction;
          arrow.setAttribute('aria-label', `Move ${SEQUENCE_LABELS[key]} ${direction === -1 ? 'up' : 'down'}`);
          arrow.disabled = index + direction < 0 || index + direction >= currentSequence.length;
          item.append(arrow);
        });
        item.ondragstart = event => {
          event.dataTransfer.setData('text/plain', key); event.dataTransfer.effectAllowed = 'move';
          item.classList.add('dragging');
        };
        item.ondragend = () => sequenceList.querySelectorAll('.gz-sequence-item').forEach(node => node.classList.remove('dragging', 'drag-over'));
        item.ondragover = event => { event.preventDefault(); item.classList.add('drag-over'); };
        item.ondragleave = () => item.classList.remove('drag-over');
        item.ondrop = event => {
          event.preventDefault(); item.classList.remove('drag-over');
          move(event.dataTransfer.getData('text/plain'), currentSequence.indexOf(key));
        };
        sequenceList.append(item);
      });
    };
    names.append(sequenceList, sequenceStatus, button('Reset component order', () => {
      currentSequence = [...DEFAULT_GAZELLIFY_SEQUENCE]; disabledItems = new Set();
      renderSequenceList(); updatePreview(); markDirty();
    }));
    renderSequenceList(); updatePreview();

    const footer = el('footer', 'gz-config-buttons');
    const status = el('span', 'gz-config-save-status', 'Changes apply after reload');
    status.setAttribute('role', 'status');
    const markDirty = () => { status.textContent = 'Unsaved changes'; status.classList.remove('is-error'); };
    modal.addEventListener('input', markDirty);
    modal.addEventListener('change', markDirty);
    const save = button('Save & reload', () => {
      const font = inputs.baseFontSize;
      if (!font.checkValidity()) {
        activate('general'); font.focus(); font.reportValidity();
        status.textContent = 'Enter a font size from 50 to 200%.'; status.classList.add('is-error'); return;
      }
      const newConfig = { ...CONFIG, componentColors: {} };
      CONFIG_OPTIONS.forEach(opt => { newConfig[opt.key] = opt.type === 'number' ? Number(inputs[opt.key].value) : inputs[opt.key].checked; });
      Object.keys(colorInputs).forEach(key => { newConfig.componentColors[key] = colorInputs[key].value; });
      if (!saveUserConfig(newConfig) || !saveGazellifySequence(currentSequence, disabledItems) || !saveApiKey(apiInput.value.trim())) {
        status.textContent = 'Could not save all settings. Please retry.'; status.classList.add('is-error'); return;
      }
      close(); window.location.reload();
    }, 'gz-config-btn gz-config-btn--save');
    footer.append(status, button('Cancel', close), save);
    workspace.append(nav, body);
    modal.append(header, workspace, preview, footer);
    overlay.append(modal);
    overlay.onclick = event => { if (event.target === overlay) close(); };
    activate('general');
    background.forEach(([node]) => { node.inert = true; });
    document.body.style.overflow = 'hidden';
    document.body.append(overlay);
    document.addEventListener('keydown', onKeydown, true);
    closeBtn.focus();
  };

  // Inject config button into footer
  const injectConfigButton = () => {
    // Find the footer section with "Torrenting - Modernized"
    const footerSections = document.querySelectorAll('.footer__section');
    let targetSection = null;

    for (const section of footerSections) {
      const p = section.querySelector('p');
      if (p && p.textContent.includes('Torrenting')) {
        targetSection = section;
        break;
      }
    }

    if (!targetSection) return;

    // Check if already injected
    if (targetSection.querySelector('.gz-config-link')) return;

    const configLink = create('button', 'gz-config-link');
    configLink.type = 'button';
    configLink.textContent = '⚙ GAZELL3D Settings';
    configLink.onclick = showConfigModal;
    targetSection.appendChild(configLink);
  };

  const initApp = () => {
    try {
      torrentNaming = createTorrentNaming({ catalog: NAMING_CATALOG, sequence: GAZELLIFY_SEQUENCE });

      const baseZoom = (CONFIG.baseFontSize || 100) / 100;
      const dynamicStyles = baseZoom !== 1 ? `
        main.page__torrent-similar--index article,
        main.page__torrent--show article {
          zoom: ${baseZoom};
        }
        .comparison__screenshots {
          zoom: ${1 / baseZoom};
        }
      ` : '';

      injectStyles(STYLE + dynamicStyles);
      if (CONFIG.enableOriginalTitleTooltip) {
        initTooltip();
      }

      // Inject config button into footer
      injectConfigButton();

      if (initPage()) return;

      const observer = new MutationObserver(() => {
        if (initPage()) observer.disconnect();
      });

      observer.observe(document.body, { childList: true, subtree: true });

    } catch (e) {
      console.error('GAZELL3D: Initialization failed', e);
    }
  };

  ready(initApp);
