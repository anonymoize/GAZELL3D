  // Move complete host components so forms, listeners and Alpine dialog scopes survive.
  const buildUserProfileLayout = (page) => {
    if (page.classList.contains('gz-user-profile')) return true;
    const article = page.querySelector(':scope > article');
    const banner = article?.querySelector('.user-profile-card__banner');
    const profilePanel = banner?.closest('.panelV2');
    const identity = banner?.querySelector('.user-profile-card__username');
    if (!article || !profilePanel || !identity) return false;

    const el = (tag, className) => {
      const node = document.createElement(tag);
      node.className = className;
      return node;
    };
    const originalSections = [...article.children];
    const header = el('header', 'gz-profile-header');
    const heading = el('h1', 'gz-profile-heading');
    heading.append(identity);
    const title = banner.querySelector('.user-profile-card__title');
    if (title) heading.append(title);
    header.append(heading);
    const buttons = banner.querySelector('.user-profile-card__buttons');
    if (buttons) header.append(buttons);

    const layout = el('div', 'gz-profile-layout');
    const content = el('div', 'gz-profile-content');
    const sidebar = el('aside', 'gz-profile-sidebar');
    sidebar.setAttribute('aria-label', 'Member information');
    sidebar.append(profilePanel);
    for (const section of originalSections) {
      if (section === profilePanel) continue;
      // Keep each host section whole, including any Livewire/Alpine scope.
      const isAccountStats = section.matches('.user-profile__section') &&
        section.querySelector('.user-profile__column--traffic, .user-profile__column--bon');
      (isAccountStats ? sidebar : content).append(section);
    }
    layout.append(content, sidebar);
    article.append(header, layout);
    page.classList.add('gz-user-profile');
    return true;
  };
