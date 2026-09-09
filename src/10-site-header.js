  const enhanceSiteHeader = (header) => {
    const labels = { uploaded: 'Up', downloaded: 'Down', ratio: 'Ratio', seeding: 'Seeding',
      leeching: 'Leeching', slots: 'Slots', buffer: 'Buffer', points: 'Bonus', tokens: 'Tokens', invites: 'Invites' };
    Object.entries(labels).forEach(([key, label]) => {
      const item = header.querySelector(`.ratio-bar__${key}`);
      if (!item || item.querySelector('.gz-header-stat-label')) return;
      const text = document.createElement('span');
      text.className = 'gz-header-stat-label';
      text.textContent = `${label}: `;
      (item.querySelector('a') || item).prepend(text);
    });
    if (header.querySelector('.gz-header-actions')) return;
    const actions = document.createElement('ul');
    actions.className = 'gz-header-actions';
    actions.setAttribute('aria-label', 'Quick links');
    // Copy only navigation destinations, never host scopes, handlers, or account forms.
    const links = [...header.querySelectorAll('.top-nav__main-menus a[href]')];
    ['Upload', 'Requests', 'Forums', 'Donate'].forEach(label => {
      const source = links.find(link => link.textContent.trim() === label);
      if (!source) return;
      const url = new URL(source.getAttribute('href'), location.href);
      if (url.origin !== location.origin || !['http:', 'https:'].includes(url.protocol)) return;
      const link = document.createElement('a');
      link.href = url.href;
      link.textContent = label;
      const item = document.createElement('li');
      item.append(link);
      actions.append(item);
    });
    // Keep live values and original account links for Bonus and Invites.
    ['points', 'invites'].forEach(key => {
      const item = header.querySelector(`.top-nav__ratio-bar .ratio-bar__${key}`);
      if (item) actions.append(item);
    });
    if (actions.childElementCount) header.append(actions);
  };

  // CSS rearranges the existing header without moving Alpine scopes or cloning controls.
  // Root scoping also covers headers rendered after boot, without a body observer.
  const initSiteHeader = () => {
    const layout = ['compact', 'spacious'].includes(CONFIG.topBarLayout) ? CONFIG.topBarLayout : 'default';
    if (layout === 'default') {
      delete document.documentElement.dataset.gzTopBar;
      return;
    }
    document.documentElement.dataset.gzTopBar = layout;
    const header = document.querySelector('.top-nav');
    if (header) {
      enhanceSiteHeader(header);
      const headerObserver = new MutationObserver(() => enhanceSiteHeader(header));
      headerObserver.observe(header, { childList: true, subtree: true });
    }

    // Custom themes can override body background without updating --body-bg.
    // Resolve the painted color instead, keeping the sticky header opaque.
    const syncBackground = () => {
      const color = [document.body, document.documentElement]
        .map(node => getComputedStyle(node).backgroundColor)
        .find(value => /^rgb\(/.test(value));
      const rootStyle = document.documentElement.style;
      if (color && rootStyle.getPropertyValue('--gz-header-bg') !== color) {
        rootStyle.setProperty('--gz-header-bg', color);
      } else if (!color && rootStyle.getPropertyValue('--gz-header-bg')) {
        rootStyle.removeProperty('--gz-header-bg');
      }
    };
    syncBackground();
    // Also cover stylesheets that finish loading after userscript initialization.
    window.addEventListener('load', syncBackground, { once: true });
    document.head?.addEventListener('load', syncBackground, true);
    // Watch theme switches and custom stylesheet edits, not page-content mutations.
    const themeObserver = new MutationObserver(syncBackground);
    const themeAttributes = { attributes: true, attributeFilter: ['class', 'style', 'data-theme', 'data-bs-theme'] };
    themeObserver.observe(document.documentElement, themeAttributes);
    themeObserver.observe(document.body, themeAttributes);
    if (document.head) themeObserver.observe(document.head, {
      childList: true, subtree: true, characterData: true, attributes: true,
      attributeFilter: ['href', 'media', 'disabled'],
    });
    window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', syncBackground);
  };
