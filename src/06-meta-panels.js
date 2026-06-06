  const createLayoutContainer = (article, referenceNode = null) => {
    const layout = create('div', 'gz-similar-layout');
    const left = create('div', 'gz-similar-layout__column gz-similar-layout__column--left');
    const right = create('div', 'gz-similar-layout__column gz-similar-layout__column--right');

    layout.append(left, right);

    const insertBefore = referenceNode || article.firstElementChild || null;
    if (insertBefore) {
      article.insertBefore(layout, insertBefore);
    } else {
      article.appendChild(layout);
    }

    return { layout, left, right };
  };

  const createMetaPanels = (meta, isSimilarPage = false) => {
    if (!meta) return { panels: [], leftPanels: [] };

    const panels = [];
    const leftPanels = [];

    const createPanel = (title) => {
      const panel = create('section', 'panelV2 gz-panel');
      if (title) {
        const header = create('header', 'panel__header');
        const heading = create('h2', 'panel__heading');
        heading.textContent = title;
        header.appendChild(heading);
        panel.appendChild(header);
      }
      const content = create('div', 'panel__body');
      panel.appendChild(content);
      return { panel, content };
    };

    // 1. Cover Panel
    const poster = $('.meta__poster-link', meta);
    const buttons = $('.torrent__buttons', meta);
    if (poster || buttons) {
      const { panel, content } = createPanel('Cover');
      if (poster && !buttons) {
        content.style.padding = '0'; // If it's just the image, remove padding for a cleaner look
      }
      if (poster) content.appendChild(poster);
      if (buttons) content.appendChild(buttons);
      panels.push(panel);
    }

    // 2. Tags Panel
    const tags = $('.work__tags', meta);
    if (tags) {
      const { panel, content } = createPanel('Tags');
      content.appendChild(tags);
      panels.push(panel);
    }

    // 3. Links Panel
    const metaIds = $('.meta__ids', meta);
    if (metaIds) {
      const { panel, content } = createPanel('Links');
      content.appendChild(metaIds);
      panels.push(panel);
    }

    // 4. Synopsis Panel (similar page only)
    const description = $('.meta__description', meta);
    if (description && isSimilarPage) {
      const synopsisSection = create('section', 'panelV2 gz-left-panel');
      const synopsisHeader = create('header', 'panel__header');
      const synopsisHeading = create('h2', 'panel__heading');
      synopsisHeading.textContent = 'Synopsis';
      synopsisHeader.appendChild(synopsisHeading);
      synopsisSection.appendChild(synopsisHeader);
      const synopsisBody = create('div', 'panel__body');
      synopsisBody.style.padding = '1rem';
      description.style.margin = '0';
      description.style.padding = '0';
      description.style.border = 'none';
      description.style.background = 'transparent';
      description.style.fontSize = '0.9em';
      description.style.lineHeight = '1.6';
      synopsisBody.appendChild(description);
      synopsisSection.appendChild(synopsisBody);
      leftPanels.push(synopsisSection);
    }

    // 5. Movie Info Panel
    const infoSections = [];
    const processChipSection = (label, displayTitle) => {
      const match = $$('.meta__chip-container', meta).find(
        (section) => getText(section.querySelector('.meta__heading')).toLowerCase() === label
      );
      if (!match) return false;

      const chips = $$('.meta-chip', match);
      if (chips.length > 0) {

        const appendItems = (items, heading) => {
          if (!items.length) return false;
          const row = create('div', 'gz-movie-info-group');
          const hr = create('h3', 'gz-chip-heading');
          hr.textContent = heading;
          row.appendChild(hr);

          const content = create('div', 'gz-movie-info-content');
          items.forEach((item, idx) => {
            if (item.url) {
              const a = create('a', '');
              a.href = item.url;
              a.textContent = item.name;
              content.appendChild(a);
            } else {
              content.appendChild(document.createTextNode(item.name));
            }
            if (idx < items.length - 1) {
              content.appendChild(document.createTextNode(', '));
            }
          });
          row.appendChild(content);
          infoSections.push(row);
          return true;
        };

        if (label === 'cast' && isSimilarPage) {
          const actors = chips.map(chip => {
            const nameEl = chip.querySelector('.meta-chip__name'); // Actor
            const charEl = chip.querySelector('.meta-chip__value'); // Character
            const url = chip.tagName === 'A' ? chip.href : (chip.querySelector('a') ? chip.querySelector('a').href : '');
            return {
              name: nameEl ? getText(nameEl) : '',
              char: charEl ? getText(charEl) : '',
              url
            };
          }).filter(a => a.name);

          if (actors.length) {
            const castSection = create('section', 'panelV2 gz-left-panel');
            const castHeader = create('header', 'panel__header');
            const castHeading = create('h2', 'panel__heading');
            castHeading.textContent = displayTitle;
            castHeader.appendChild(castHeading);

            // Add show all / show less toggle
            const CAST_DEFAULT_COUNT = 6;
            if (actors.length > CAST_DEFAULT_COUNT) {
              const toggleActions = create('div', 'panel__actions');
              const toggleBtn = create('a', 'gz-cast-toggle-btn');
              toggleBtn.textContent = 'Show All';
              toggleBtn.href = '#';
              toggleActions.appendChild(toggleBtn);
              castHeader.appendChild(toggleActions);
            }

            castSection.appendChild(castHeader);
            const castBody = create('div', 'panel__body gz-cast-grid');

            actors.forEach((actor, idx) => {
              const row = create('div', 'gz-cast-row');
              if (idx >= CAST_DEFAULT_COUNT) {
                row.style.display = 'none';
                row.classList.add('gz-cast-hidden');
              }
              const actorName = create('div', 'gz-cast-actor');
              if (actor.url) {
                const a = create('a', '');
                a.href = actor.url;
                a.textContent = actor.name;
                actorName.appendChild(a);
              } else {
                actorName.textContent = actor.name;
              }
              const charName = create('div', 'gz-cast-character');
              charName.textContent = actor.char;
              row.appendChild(actorName);
              row.appendChild(charName);
              castBody.appendChild(row);
            });
            castSection.appendChild(castBody);

            // Wire up toggle
            if (actors.length > CAST_DEFAULT_COUNT) {
              const toggleBtn = castSection.querySelector('.gz-cast-toggle-btn');
              let expanded = false;
              toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                expanded = !expanded;
                castBody.querySelectorAll('.gz-cast-hidden').forEach(row => {
                  row.style.display = expanded ? '' : 'none';
                });
                toggleBtn.textContent = expanded ? 'Show Less' : 'Show All';
              });
            }

            leftPanels.push(castSection);
          }
          return true;
        } else if (label === 'cast') {
          // On torrent page, skip cast entirely
          return true;
        } else if (label === 'crew' || label === 'extra information') {
          const grouped = {};
          chips.forEach(chip => {
            const nameEl = chip.querySelector('.meta-chip__name'); // Role / Company
            const valEl = chip.querySelector('.meta-chip__value'); // Person / Genre
            const url = chip.tagName === 'A' ? chip.href : (chip.querySelector('a') ? chip.querySelector('a').href : '');

            const roleText = nameEl ? getText(nameEl) : 'Other';
            let valText = valEl ? getText(valEl) : '';
            if (!valText && nameEl) valText = getText(nameEl);

            if (valText && roleText) {
              if (!grouped[roleText]) grouped[roleText] = [];
              const cleanVal = valText.replace(/\\s+/g, ' ').trim();
              if (cleanVal && !grouped[roleText].find(i => i.name === cleanVal)) {
                grouped[roleText].push({ name: cleanVal, url });
              }
            }
          });

          let added = false;
          for (const [role, items] of Object.entries(grouped)) {
            let roleLabel = role;
            if (items.length > 1 && !role.toLowerCase().endsWith('s')) roleLabel += 's';
            appendItems(items, roleLabel);
            added = true;
          }
          return added;
        } else {
          const items = chips.map(chip => {
            const valEl = chip.querySelector('.meta-chip__value');
            const url = chip.tagName === 'A' ? chip.href : (chip.querySelector('a') ? chip.querySelector('a').href : '');
            const name = valEl ? getText(valEl) : (chip.querySelector('.meta-chip__name') ? getText(chip.querySelector('.meta-chip__name')) : '');
            return { name, url };
          }).filter(i => i.name);
          appendItems(items, displayTitle);
          return true;
        }
      }
      return false;
    };

    // Convert multiple specific roles typically found on Unit3D pages
    processChipSection('directors', 'Directors');
    processChipSection('writers', 'Writers');
    processChipSection('producers', 'Producers');
    processChipSection('composers', 'Composers');
    processChipSection('cinematographers', 'Cinematographers');
    // Fallback for general cast/crew chips
    processChipSection('cast', 'Cast');
    processChipSection('crew', 'Crew');
    processChipSection('extra information', 'Extra Information');

    if (infoSections.length > 0) {
      const { panel, content } = createPanel('Movie Info');
      infoSections.forEach((section, idx) => {
        content.appendChild(section);
      });
      panels.push(panel);
    }

    meta.remove();
    return { panels, leftPanels };
  };

  const expandAllTorrentGroups = () => {
    const section = $(SELECTORS.torrentGroup);
    if (!section) return;
    $$('.torrent-search--grouped__dropdown', section).forEach((dropdown) => {
      dropdown.setAttribute('open', '');
    });
  };
