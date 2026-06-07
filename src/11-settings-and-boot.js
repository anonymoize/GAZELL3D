  const initPage = () => {
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

  // Create and show config modal
  const showConfigModal = () => {
    // Remove any existing modal
    const existing = document.querySelector('.gz-config-overlay');
    if (existing) existing.remove();

    const overlay = create('div', 'gz-config-overlay');
    const modal = create('div', 'gz-config-modal');

    // Header
    const header = create('div', 'gz-config-header');
    const title = create('h3', 'gz-config-title');
    title.textContent = '⚙️ GAZELL3D Settings';
    const closeBtn = create('button', 'gz-config-close');
    closeBtn.textContent = '×';
    closeBtn.onclick = () => overlay.remove();
    header.appendChild(title);
    header.appendChild(closeBtn);
    modal.appendChild(header);

    // API Key Section
    const apiSection = create('div', 'gz-config-section');
    const apiTitle = create('div', 'gz-config-section-title');
    apiTitle.textContent = 'API Key';
    apiSection.appendChild(apiTitle);

    const apiField = create('div', 'gz-config-input-field');
    const apiLabel = create('label', 'gz-config-input-label');
    apiLabel.textContent = 'Aither API Key (required for dropdowns)';
    apiLabel.setAttribute('for', 'gz-api-key-input');
    const apiInput = create('input', 'gz-config-input');
    apiInput.type = 'password';
    apiInput.id = 'gz-api-key-input';
    apiInput.placeholder = 'Enter your API key...';
    apiInput.value = AITHER_API_KEY || '';
    apiField.appendChild(apiLabel);
    apiField.appendChild(apiInput);
    apiSection.appendChild(apiField);
    modal.appendChild(apiSection);

    // Options Section
    const optionsSection = create('div', 'gz-config-section');
    const optionsTitle = create('div', 'gz-config-section-title');
    optionsTitle.textContent = 'Options';
    optionsSection.appendChild(optionsTitle);

    const inputs = {};
    CONFIG_OPTIONS.forEach(opt => {
      const field = create('div', 'gz-config-field');
      const label = create('label', 'gz-config-label');

      if (opt.type === 'number') {
        const input = create('input');
        input.type = 'number';
        input.min = opt.min || 0;
        input.max = opt.max || 1000;
        input.value = CONFIG[opt.key] ?? DEFAULT_CONFIG[opt.key];
        input.style.width = '60px';
        input.style.marginRight = '8px';
        inputs[opt.key] = input;

        label.appendChild(input);
        label.appendChild(document.createTextNode(opt.label));
      } else {
        const checkbox = create('input');
        checkbox.type = 'checkbox';
        checkbox.checked = CONFIG[opt.key] ?? DEFAULT_CONFIG[opt.key];
        inputs[opt.key] = checkbox;

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(opt.label));
      }

      field.appendChild(label);
      optionsSection.appendChild(field);
    });
    modal.appendChild(optionsSection);

    // Colors Section
    const colorsSection = create('div', 'gz-config-section');
    const colorsTitle = create('div', 'gz-config-section-title');
    colorsTitle.textContent = 'Component Colors';
    colorsSection.appendChild(colorsTitle);

    const colorsGrid = create('div');
    colorsGrid.style.display = 'grid';
    colorsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    colorsGrid.style.gap = '8px';

    const colorInputs = {};
    Object.keys(DEFAULT_CONFIG.componentColors).forEach(key => {
      const field = create('div', 'gz-config-field');
      const label = create('label', 'gz-config-label');
      label.style.display = 'flex';
      label.style.alignItems = 'center';

      const input = create('input');
      input.type = 'color';
      input.value = CONFIG.componentColors[key] || DEFAULT_CONFIG.componentColors[key];
      input.style.marginRight = '8px';
      input.style.cursor = 'pointer';

      colorInputs[key] = input;

      label.appendChild(input);
      label.appendChild(document.createTextNode(SEQUENCE_LABELS[key] || key));
      field.appendChild(label);
      colorsGrid.appendChild(field);
    });

    colorsSection.appendChild(colorsGrid);
    modal.appendChild(colorsSection);

    // Sequence Order Section
    const sequenceSection = create('div', 'gz-config-section');
    const sequenceTitle = create('div', 'gz-config-section-title');
    sequenceTitle.textContent = 'Torrent Name Sequence Order';
    sequenceSection.appendChild(sequenceTitle);

    const sequenceDesc = create('div', 'gz-config-input-label');
    sequenceDesc.textContent = 'Drag to reorder, toggle checkbox to enable/disable:';
    sequenceDesc.style.marginBottom = '10px';
    sequenceSection.appendChild(sequenceDesc);

    const sequenceList = create('div', 'gz-sequence-list');
    let currentSequence = [...SEQUENCE_CONFIG.order];
    let disabledItems = new Set(SEQUENCE_CONFIG.disabled);

    const createSequenceItem = (key) => {
      const isDisabled = disabledItems.has(key);
      const item = create('div', 'gz-sequence-item' + (isDisabled ? ' disabled' : ''));
      item.draggable = true;
      item.dataset.key = key;

      // Toggle checkbox
      const toggle = create('input', 'gz-sequence-toggle');
      toggle.type = 'checkbox';
      toggle.checked = !isDisabled;
      toggle.title = isDisabled ? 'Enable this component' : 'Disable this component';
      toggle.onclick = (e) => {
        e.stopPropagation();
        if (toggle.checked) {
          disabledItems.delete(key);
        } else {
          disabledItems.add(key);
        }
        renderSequenceList();
      };

      const handle = create('span', 'gz-sequence-handle');
      const label = create('span', 'gz-sequence-label');
      label.textContent = SEQUENCE_LABELS[key] || key;
      const keySpan = create('span', 'gz-sequence-key');
      keySpan.textContent = key;

      item.appendChild(toggle);
      item.appendChild(handle);
      item.appendChild(label);
      item.appendChild(keySpan);

      // Drag events
      item.addEventListener('dragstart', (e) => {
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', key);
      });

      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        document.querySelectorAll('.gz-sequence-item').forEach(el => el.classList.remove('drag-over'));
      });

      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const dragging = document.querySelector('.gz-sequence-item.dragging');
        if (dragging && dragging !== item) {
          item.classList.add('drag-over');
        }
      });

      item.addEventListener('dragleave', () => {
        item.classList.remove('drag-over');
      });

      item.addEventListener('drop', (e) => {
        e.preventDefault();
        item.classList.remove('drag-over');
        const draggedKey = e.dataTransfer.getData('text/plain');
        const targetKey = item.dataset.key;

        if (draggedKey && draggedKey !== targetKey) {
          const draggedIndex = currentSequence.indexOf(draggedKey);
          const targetIndex = currentSequence.indexOf(targetKey);

          if (draggedIndex !== -1 && targetIndex !== -1) {
            // Remove from old position
            currentSequence.splice(draggedIndex, 1);
            // Insert at new position
            currentSequence.splice(targetIndex, 0, draggedKey);

            // Re-render list
            renderSequenceList();
          }
        }
      });

      return item;
    };

    const renderSequenceList = () => {
      sequenceList.innerHTML = '';
      currentSequence.forEach(key => {
        sequenceList.appendChild(createSequenceItem(key));
      });
    };

    renderSequenceList();
    sequenceSection.appendChild(sequenceList);

    // Reset button
    const resetBtn = create('button', 'gz-sequence-reset');
    resetBtn.textContent = '↺ Reset to Default';
    resetBtn.onclick = () => {
      currentSequence = [...DEFAULT_GAZELLIFY_SEQUENCE];
      disabledItems = new Set();
      renderSequenceList();
    };
    sequenceSection.appendChild(resetBtn);

    modal.appendChild(sequenceSection);

    // Buttons
    const buttons = create('div', 'gz-config-buttons');
    const cancelBtn = create('button', 'gz-config-btn gz-config-btn--cancel');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => overlay.remove();

    const saveBtn = create('button', 'gz-config-btn gz-config-btn--save');
    saveBtn.textContent = 'Save & Reload';
    saveBtn.onclick = () => {
      // Save API key
      const newApiKey = apiInput.value.trim();
      saveApiKey(newApiKey);

      // Save config options
      const newConfig = {};
      CONFIG_OPTIONS.forEach(opt => {
        if (opt.type === 'number') {
          newConfig[opt.key] = parseInt(inputs[opt.key].value, 10) || DEFAULT_CONFIG[opt.key];
        } else {
          newConfig[opt.key] = inputs[opt.key].checked;
        }
      });

      newConfig.componentColors = {};
      Object.keys(DEFAULT_CONFIG.componentColors).forEach(key => {
        newConfig.componentColors[key] = colorInputs[key].value;
      });

      saveUserConfig(newConfig);

      // Save sequence order and disabled items
      saveGazellifySequence(currentSequence, disabledItems);

      // Reload to apply changes
      overlay.remove();
      window.location.reload();
    };

    buttons.appendChild(cancelBtn);
    buttons.appendChild(saveBtn);
    modal.appendChild(buttons);

    overlay.appendChild(modal);
    overlay.onclick = (e) => {
      if (e.target === overlay) overlay.remove();
    };

    document.body.appendChild(overlay);
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

    const configLink = create('span', 'gz-config-link');
    configLink.textContent = '⚙️ GAZELL3D Config';
    configLink.onclick = showConfigModal;
    targetSection.appendChild(configLink);
  };

  const initApp = async () => {
    try {
      const config = await loadConfig();
      SCENE_RELEASE_GROUPS = new Set((config.SCENE_RELEASE_GROUPS || []).map(normalizeSceneGroupName));
      SERVICE_TOKENS = config.SERVICE_TOKENS || [];
      COUNTRY_MAP = config.COUNTRY_MAP || {};
      LANGUAGE_MAP = config.LANGUAGE_MAP || {};
      TAG_STYLES = config.TAG_STYLES || {};

      // Initialize dependent sets
      RELEASE_GROUP_BLOCK_TOKENS = initReleaseGroupBlockTokens();

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
