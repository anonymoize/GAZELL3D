  const STYLE = `
    /* Reduce outer padding on the article when using side layout */
    main.page__torrent-similar--index article {
      padding-left: 0.75rem !important;
      padding-right: 0.75rem !important;
    }

    .gz-similar-layout {
      display: flex;
      gap: 1.25rem;
      width: 100%;
      margin-top: 0.5rem;
      align-items: flex-start;
    }

    .gz-similar-layout__column {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      min-width: 0;
    }

    .gz-similar-layout__column--left {
      flex: 1 1 auto;
    }

    .gz-similar-layout__column--right {
      flex: 0 0 18.75em;
      max-width: 18.75em;
      width: 100%;
    }

    .gz-panel {
      display: flex;
      flex-direction: column;
      width: 100%;
      margin-bottom: 1rem;
      overflow: hidden;
    }

    .gz-panel .panel__body {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .gz-panel .meta__backdrop {
      display: none;
    }

    .gz-panel .meta__title-link {
      text-align: center;
      text-decoration: none;
      color: inherit;
      transition: opacity 0.15s ease;
    }

    .gz-panel .meta__title-link:hover {
      opacity: 0.85;
    }

    .gz-panel .meta__title {
      font-size: 1.15em;
      font-weight: 600;
      line-height: 1.3;
      margin: 0;
    }

    .gz-detail-title {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
    }

    .gz-detail-title__heading {
      font-size: 1.4em;
      font-weight: 700;
      text-align: center;
      color: inherit;
      line-height: 1.25;
    }

    .gz-detail-title__subheading {
      font-size: 0.9em;
      text-align: center;
      color: inherit;
      opacity: 0.65;
    }

    .gz-panel .meta__poster-link {
      width: 100%;
      display: block;
      align-self: stretch;
      float: none !important;
      border-radius: 0; /* Cover fills panel */
      overflow: hidden;
      box-shadow: none;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .gz-panel .meta__poster-link:hover {
      box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.4);
    }

    .gz-panel .meta__poster {
      width: 100%;
      height: auto;
      display: block;
      border-radius: 0;
      float: none !important;
    }

    .gz-panel .work__tags,
    .gz-panel .meta__ids {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      padding: 0;
      margin: 0;
      font-size: 0.85em;
    }

    .gz-panel .meta__ids li,
    .gz-panel .work__tags li {
      list-style: none;
      white-space: nowrap;
      flex: 0 0 auto;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .gz-panel .meta__ids img {
      height: 16px;
      width: auto;
      opacity: 0.8;
      transition: opacity 0.15s ease;
    }

    .gz-panel .meta__ids a:hover img {
      opacity: 1;
    }

    .gz-inline-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      justify-content: center;
      width: 100%;
    }

    .gz-inline-buttons .form__group {
      display: flex;
      flex: 1 1 calc(50% - 0.2rem);
      min-width: 0;
    }

    .gz-inline-buttons .form__button {
      flex: 1;
      white-space: nowrap;
      padding: 0.4rem 0.5rem;
      justify-content: center;
      font-size: 0.8em;
      border-radius: 0.5rem;
    }

    .gz-panel .meta__description {
      margin: 0;
      padding: 0;
      border: none;
      background: transparent;
      font-size: 0.85em;
      line-height: 1.5;
      color: rgba(255, 255, 255, 0.8);
    }

    /* Redesigned movie info layout (like Tron Legacy screenshot) */
    .gz-movie-info-group {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 0.25rem;
      align-items: baseline;
      font-size: 0.85em;
      line-height: 1.4;
    }
    
    .gz-movie-info-group .gz-chip-heading {
      color: rgba(255, 255, 255, 0.9);
      font-weight: 700;
      margin: 0;
      margin-right: 0.25rem;
      font-size: 1em;
      text-transform: none;
      letter-spacing: normal;
      flex: 0 0 auto;
    }

    .gz-movie-info-group .gz-chip-heading::after {
      content: ':';
    }

    .gz-movie-info-content {
      color: rgba(255, 255, 255, 0.7);
      flex: 1 1 auto;
      word-wrap: break-word;
    }

    .gz-movie-info-content a {
      color: inherit;
      text-decoration: none;
    }

    .gz-movie-info-content a:hover {
      text-decoration: underline;
    }

    .gz-left-panel {
      margin-top: 0;
    }

    .gz-left-panel .panel__header {
      cursor: default;
    }

    .gz-cast-grid {
      display: flex;
      flex-direction: column;
      gap: 0;
      padding: 0 !important;
    }

    .gz-cast-row {
      display: flex;
      padding: 0.6rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.03);
      font-size: 0.85em;
      transition: background 0.1s;
    }

    .gz-cast-row:hover {
      background: rgba(255, 255, 255, 0.02);
    }

    .gz-cast-row:last-child {
      border-bottom: none;
    }

    .gz-cast-actor {
      flex: 0 0 45%;
      text-align: right;
      padding-right: 1.5rem;
      color: rgba(255, 255, 255, 0.7);
    }

    .gz-cast-character {
      flex: 1;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
    }

    .gz-cast-actor a {
      color: inherit;
      text-decoration: none;
    }

    .gz-cast-actor a:hover {
      text-decoration: underline;
      color: #fff;
    }

    .gz-cast-toggle {
      display: flex;
      justify-content: flex-end;
      padding: 0.5rem 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .gz-cast-toggle-btn {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.6);
      cursor: pointer;
      font-size: 0.8em;
      padding: 0.2rem 0;
      transition: color 0.15s;
    }

    .gz-cast-toggle-btn:hover {
      color: #fff;
      text-decoration: underline;
    }

    .gz-panel .gz-meta-divider {
      border: none;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      margin: 0.25rem 0;
    }

    .gz-panel .work__tags li::after {
      content: none !important;
    }

    .gz-panel .work__tags li {
      padding: 0.15rem 0.3rem;
      background: none;
      border: none;
      border-radius: 0;
      font-size: 0.85em;
      color: rgba(255, 255, 255, 0.8);
    }

    .gz-panel .work__tags li a {
      color: inherit !important;
      text-decoration: none !important;
      display: inline-block;
    }

    .gz-panel .work__tags li a:hover {
      color: rgba(255, 255, 255, 1);
      text-decoration: none;
    }

    .gz-panel .work__tags li span {
      color: inherit;
    }

    /* Header section with centered title and action links (ANT-style) */
    .gz-page-header {
      text-align: center;
      margin-bottom: 1.25rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .gz-page-header__title {
      font-size: 1.6em;
      font-weight: 600;
      margin: 0 0 0.75rem;
      color: inherit;
    }

    .gz-page-header__title a {
      color: inherit;
      text-decoration: none;
    }

    .gz-page-header__title a:hover {
      text-decoration: underline;
    }

    .gz-page-header__actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.25rem 0.5rem;
      font-size: 0.9em;
    }

    .gz-page-header__actions a,
    .gz-page-header__actions button {
      color: rgba(255, 255, 255, 0.75);
      text-decoration: none;
      background: none;
      border: none;
      padding: 0;
      font: inherit;
      cursor: pointer;
      transition: color 0.15s ease;
    }

    .gz-page-header__actions a:hover,
    .gz-page-header__actions button:hover {
      color: rgba(255, 255, 255, 1);
      text-decoration: underline;
    }

  .gz-page-header__actions .gz-separator {
    color: rgba(255, 255, 255, 0.3);
    user-select: none;
  }

  /* Group requirements page */
  main.page__stats--group-requirements {
    --gz-req-bg: #11151c;
    --gz-req-panel: rgba(24, 30, 40, 0.94);
    --gz-req-panel-soft: rgba(255, 255, 255, 0.045);
    --gz-req-border: rgba(255, 255, 255, 0.1);
    --gz-req-border-strong: rgba(255, 255, 255, 0.16);
    --gz-req-text: rgba(247, 250, 252, 0.94);
    --gz-req-muted: rgba(226, 232, 240, 0.66);
    --gz-req-accent: #69d3b0;
    --gz-req-accent-2: #78a6ff;
    padding: 1.25rem clamp(0.75rem, 2.5vw, 2rem) 2.5rem;
    background:
      radial-gradient(circle at top left, rgba(105, 211, 176, 0.14), transparent 32rem),
      linear-gradient(180deg, rgba(255, 255, 255, 0.025), transparent 18rem);
  }

  main.page__stats--group-requirements > article {
    width: min(1500px, 100%);
    margin: 0 auto;
  }

  main.page__stats--group-requirements .panelV2 {
    background: transparent;
    border: 0;
    box-shadow: none;
  }

  main.page__stats--group-requirements .panel__heading {
    margin: 0 0 1.15rem;
    padding: 0;
    color: var(--gz-req-text);
    font-size: clamp(1.55rem, 2vw, 2.25rem);
    font-weight: 800;
    letter-spacing: 0;
    line-height: 1.1;
  }

  main.page__stats--group-requirements .group-requirements__wrapper {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 24rem), 1fr));
    gap: 1rem;
    align-items: start;
  }

  main.page__stats--group-requirements .group-requirements__path-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    min-width: 0;
  }

  main.page__stats--group-requirements .group-requirements__path-wrapper > h3 {
    position: sticky;
    top: 0;
    z-index: 2;
    margin: 0;
    padding: 0.7rem 0.85rem;
    color: var(--gz-req-text);
    background: rgba(17, 21, 28, 0.92);
    border: 1px solid var(--gz-req-border);
    border-radius: 8px;
    backdrop-filter: blur(10px);
    font-size: 0.9rem;
    font-weight: 800;
    text-align: left !important;
    text-transform: uppercase;
  }

  main.page__stats--group-requirements .group-requirements__group-wrapper {
    position: relative;
    overflow: hidden;
    min-width: 0;
    background: var(--gz-req-panel);
    border: 1px solid var(--gz-req-border);
    border-radius: 8px;
    box-shadow: 0 14px 34px rgba(0, 0, 0, 0.22);
    transition: border-color 0.16s ease, transform 0.16s ease, box-shadow 0.16s ease;
  }

  main.page__stats--group-requirements .group-requirements__group-wrapper::before {
    content: "";
    position: absolute;
    inset: 0 auto 0 0;
    width: 3px;
    background: linear-gradient(180deg, var(--gz-req-accent), var(--gz-req-accent-2));
    opacity: 0.85;
  }

  main.page__stats--group-requirements .group-requirements__group-wrapper:hover {
    transform: translateY(-1px);
    border-color: var(--gz-req-border-strong);
    box-shadow: 0 18px 42px rgba(0, 0, 0, 0.28);
  }

  main.page__stats--group-requirements .group-requirements__group--header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.9rem 1rem 0.75rem 1.15rem;
    cursor: pointer;
  }

  main.page__stats--group-requirements .group-requirements__group--header h3 {
    min-width: 0;
    margin: 0;
    font-size: 1.02rem;
    font-weight: 800;
    line-height: 1.25;
  }

  main.page__stats--group-requirements .group-requirements__group--header h3 span {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    max-width: 100%;
  }

  main.page__stats--group-requirements .group-requirements__group--header h3 i {
    width: 1.15rem;
    text-align: center;
    opacity: 0.95;
  }

  main.page__stats--group-requirements .group-requirements__group--requirement-row-dropdown {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    min-width: 1.9rem;
    height: 1.9rem;
    color: rgba(255, 255, 255, 0.78);
    background: rgba(255, 255, 255, 0.055);
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 999px;
  }

  main.page__stats--group-requirements .group-requirements__group--requirement-row-dropdown .fa-pull-right {
    float: none;
    margin: 0;
  }

  main.page__stats--group-requirements .group-requirements__group--description {
    margin: 0 1rem 0.9rem 1.15rem;
    color: var(--gz-req-muted);
    font-size: 0.88rem;
    line-height: 1.45;
  }

  main.page__stats--group-requirements .group-requirements__group--description i {
    font-style: normal;
  }

  main.page__stats--group-requirements .group-requirements__group--requirement-wrapper,
  main.page__stats--group-requirements .group-requirements__group--requirement-multirow {
    display: grid;
    gap: 0.5rem;
    padding: 0 1rem 0.9rem 1.15rem;
  }

  main.page__stats--group-requirements .group-requirements__group-wrapper p.text-center {
    margin: 0.35rem 1rem 0.55rem 1.15rem;
    color: var(--gz-req-muted);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-align: left !important;
    text-transform: uppercase;
  }

  main.page__stats--group-requirements .group-requirements__group--separator {
    padding: 0.55rem 0.7rem;
    color: rgba(255, 255, 255, 0.78);
    background: rgba(120, 166, 255, 0.09);
    border: 1px solid rgba(120, 166, 255, 0.18);
    border-radius: 7px;
    font-size: 0.82rem;
    font-weight: 700;
    line-height: 1.35;
  }

  main.page__stats--group-requirements .group-requirements__group--requirement-row {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.9fr) auto auto;
    gap: 0.55rem;
    align-items: center;
    min-width: 0;
    padding: 0.62rem 0.7rem;
    color: rgba(255, 255, 255, 0.88);
    background: var(--gz-req-panel-soft);
    border: 1px solid rgba(255, 255, 255, 0.075);
    border-radius: 7px;
    font-size: 0.86rem;
    line-height: 1.35;
    cursor: pointer;
  }

  main.page__stats--group-requirements .group-requirements__group--requirement-row:hover {
    background: rgba(255, 255, 255, 0.065);
  }

  main.page__stats--group-requirements .group-requirements__group--requirement-row-extended {
    display: block;
    min-width: 0;
    padding: 0.55rem 0.7rem;
    color: rgba(255, 255, 255, 0.88);
    background: rgba(255, 255, 255, 0.035);
    border: 1px solid rgba(255, 255, 255, 0.065);
    border-radius: 7px;
    font-size: 0.86rem;
    line-height: 1.35;
  }

  main.page__stats--group-requirements .group-requirements__group--requirement-row > div,
  main.page__stats--group-requirements .group-requirements__group--requirement-row-extended > div {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  main.page__stats--group-requirements .group-requirements__group--requirement-row-to-advance {
    color: rgba(255, 255, 255, 0.72);
    font-variant-numeric: tabular-nums;
    text-align: right;
    white-space: nowrap;
  }

  main.page__stats--group-requirements .stats__requirements-table {
    width: 100%;
    margin: 0.35rem 0 0;
    border-collapse: collapse;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.16);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 7px;
    font-size: 0.82rem;
  }

  main.page__stats--group-requirements .stats__requirements-table th,
  main.page__stats--group-requirements .stats__requirements-table td {
    padding: 0.5rem 0.6rem;
    border-color: rgba(255, 255, 255, 0.075) !important;
  }

  main.page__stats--group-requirements .stats__requirements-table th {
    color: rgba(255, 255, 255, 0.7);
    background: rgba(255, 255, 255, 0.045);
    font-weight: 800;
  }

  main.page__stats--group-requirements .group-requirements__group--perks-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
    padding: 0 1rem 1rem 1.15rem;
  }

  main.page__stats--group-requirements .group-requirements__perk,
  main.page__stats--group-requirements .group-requirements__perk-extended {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    min-height: 2rem;
    padding: 0.42rem 0.6rem;
    color: rgba(255, 255, 255, 0.86);
    background: rgba(255, 255, 255, 0.055);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 700;
    line-height: 1.2;
  }

  main.page__stats--group-requirements .group-requirements__perk {
    width: 2rem;
    padding: 0;
  }

  main.page__stats--group-requirements .group-requirements__perk--blue {
    background: rgba(93, 173, 226, 0.14);
    border-color: rgba(93, 173, 226, 0.28);
  }

  main.page__stats--group-requirements .group-requirements__perk--green {
    background: rgba(0, 188, 140, 0.14);
    border-color: rgba(0, 188, 140, 0.28);
  }

  main.page__stats--group-requirements .group-requirements__perk--yellow {
    background: rgba(246, 194, 62, 0.15);
    border-color: rgba(246, 194, 62, 0.3);
  }

  main.page__stats--group-requirements .group-requirements__perk--red {
    background: rgba(231, 76, 60, 0.16);
    border-color: rgba(231, 76, 60, 0.32);
  }

  main.page__stats--group-requirements .group-requirements__perk--magenta,
  main.page__stats--group-requirements .group-requirements__perk--comments-fg {
    background: rgba(190, 120, 255, 0.14);
    border-color: rgba(190, 120, 255, 0.28);
  }

  @media (max-width: 760px) {
    main.page__stats--group-requirements {
      padding-inline: 0.7rem;
    }

    main.page__stats--group-requirements .group-requirements__wrapper {
      grid-template-columns: 1fr;
    }

    main.page__stats--group-requirements .group-requirements__group--requirement-row {
      grid-template-columns: minmax(0, 1fr) auto;
    }
  }

  /* Compact class directory; keep all responsive rules together. */
  main.page__stats--group-requirements.gz-req-v2-page {
    padding: 20px 12px 48px;
    background: transparent;
  }

  main.page__stats--group-requirements.gz-req-v2-page > article {
    width: 100%;
    max-width: 1500px;
    margin: 0 auto;
    padding: 0;
  }

  .gz-req-v2 {
    --gz-req-v2-text: var(--text-color, #b9bcc5);
    --gz-req-v2-line: color-mix(in srgb, var(--gz-req-v2-text) 14%, transparent);
    --gz-req-v2-muted: color-mix(in srgb, var(--gz-req-v2-text) 75%, transparent);
    padding: 18px 16px 28px;
    border: 1px solid var(--gz-req-v2-line);
    color: var(--gz-req-v2-text);
    font-size: 13px;
    font-weight: 400;
    line-height: 1.4;
  }

  .gz-req-v2, .gz-req-v2 * { box-sizing: border-box; }

  .gz-req-v2-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 6px 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--gz-req-v2-line);
  }

  .gz-req-v2-title {
    margin: 0;
    color: inherit;
    font-size: 18px;
    font-weight: 500;
    line-height: 1.3;
  }

  .gz-req-v2-summary { color: var(--gz-req-v2-muted); font-size: 12px; }

  .gz-req-v2-section {
    margin: 22px 0 4px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--gz-req-v2-line);
    color: var(--gz-req-v2-muted);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .gz-req-v2-row {
    display: grid;
    grid-template-columns: minmax(0, 0.55fr) minmax(0, 1fr) minmax(0, 1.2fr);
    align-items: start;
    gap: 28px;
    margin: 0;
    padding: 16px 0 20px;
  }

  .gz-req-v2-rank { min-width: 0; text-align: center; }
  .gz-req-v2-panel { min-width: 0; }

  .gz-req-v2-rank__title, .gz-req-v2-panel__heading {
    margin: 0 0 6px;
    padding: 0 0 5px;
    border-bottom: 1px solid var(--gz-req-v2-line);
    color: inherit;
    font-size: 12px;
    font-weight: 400;
    line-height: 1.4;
    text-transform: uppercase;
  }

  .gz-req-v2-rank__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 66px;
    padding: 10px 0;
    color: var(--gz-req-v2-muted);
    border-bottom: 1px solid var(--gz-req-v2-line);
  }

  .gz-req-v2-rank__icon > i, .gz-req-v2-rank__icon > svg {
    width: 36px;
    height: 36px;
    font-size: 36px;
    line-height: 1;
  }

  .gz-req-v2-rank__icon > i::before { display: inline-block; width: 36px; height: 36px; font-size: inherit; }

  .gz-req-v2-rank__description {
    margin: 0;
    padding-top: 6px;
    color: var(--gz-req-v2-muted);
    font-size: 11px;
    line-height: 1.4;
    overflow-wrap: anywhere;
  }

  .gz-req-v2-rule-note, .gz-req-v2-choice {
    margin: 0 0 6px;
    padding: 0 0 6px;
    border-bottom: 1px solid var(--gz-req-v2-line);
  }

  .gz-req-v2-choice__title {
    margin-bottom: 3px;
    color: var(--gz-req-v2-muted);
    font-size: 11px;
  }

  .gz-req-v2-criterion {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto 12px;
    align-items: baseline;
    gap: 6px;
    padding: 1px 0;
    font-size: 13px;
    line-height: 1.35;
  }

  .gz-req-v2-criterion__label { min-width: 0; overflow-wrap: anywhere; }
  .gz-req-v2-criterion__values { min-width: 0; text-align: right; }
  .gz-req-v2-criterion__value { font-variant-numeric: tabular-nums; }
  .gz-req-v2-criterion__value--tooltip { border-bottom: 1px dotted var(--gz-req-v2-muted); cursor: help; }
  .gz-req-v2-status { font-size: 12px; line-height: 1; text-align: center; }
  .gz-req-v2-status--pass { color: var(--color-green, #48b58a); }
  .gz-req-v2-status--fail { color: var(--color-light-red, #ef5f83); }
  .gz-req-v2-status svg { width: 12px; height: 12px; }

  .gz-req-v2-perk {
    padding: 5px 0;
    border-bottom: 1px solid var(--gz-req-v2-line);
    overflow-wrap: anywhere;
  }

  .gz-req-v2-perk:first-of-type { padding-top: 0; }
  .gz-req-v2-empty { color: var(--gz-req-v2-muted); }

  @media (max-width: 900px) {
    .gz-req-v2-row { grid-template-columns: 150px minmax(0, 1fr); gap: 12px 24px; }
    .gz-req-v2-rank { grid-row: span 2; }
    .gz-req-v2-panel--perks { grid-column: 2; }
  }

  @media (max-width: 540px) {
    .gz-req-v2 { padding: 14px 12px; }
    .gz-req-v2-row { grid-template-columns: minmax(0, 1fr); gap: 16px; padding: 18px 0; }
    .gz-req-v2-rank { grid-row: auto; }
    .gz-req-v2-panel--perks { grid-column: auto; }
    .gz-req-v2-rank__icon { min-height: 54px; }
  }

  .gz-req-v2-paths {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 36px;
  }

  .gz-req-v2-path { min-width: 0; }
  .gz-req-v2-path > .gz-req-v2-section { font-size: 14px; }

  .gz-req-v2-path .gz-req-v2-row {
    grid-template-columns: 86px minmax(0, 1.25fr) minmax(0, 1fr);
    gap: 18px;
    padding: 18px 0 22px;
    border-bottom: 1px solid var(--gz-req-v2-line);
  }

  .gz-req-v2-path .gz-req-v2-rank { grid-row: auto; }
  .gz-req-v2-path .gz-req-v2-rank__description { font-size: 10px; }
  .gz-req-v2-path .gz-req-v2-panel--perks { grid-column: auto; }
  .gz-req-v2-path .gz-req-v2-rank__icon { min-height: 58px; border-bottom: 0; }
  .gz-req-v2-path .gz-req-v2-criterion { font-size: 12px; gap: 4px; }
  .gz-req-v2-path .gz-req-v2-perk { font-size: 12px; padding: 4px 0; }

  @media (max-width: 1150px) {
    .gz-req-v2-paths { grid-template-columns: minmax(0, 1fr); gap: 0; }
  }

  @media (max-width: 620px) {
    .gz-req-v2-path .gz-req-v2-row { grid-template-columns: 86px minmax(0, 1fr); gap: 12px 18px; }
    .gz-req-v2-path .gz-req-v2-rank { grid-row: span 2; }
    .gz-req-v2-path .gz-req-v2-panel--perks { grid-column: 2; }
  }

  @media (max-width: 420px) {
    .gz-req-v2-path .gz-req-v2-row { grid-template-columns: minmax(0, 1fr); }
    .gz-req-v2-path .gz-req-v2-rank { grid-row: auto; }
    .gz-req-v2-path .gz-req-v2-panel--perks { grid-column: auto; }
  }

  .gz-search-title {
    display: flex;
    flex-direction: column;
      gap: 0.2rem;
      line-height: 1.2;
    }

    .gz-search-title__heading {
      font-size: 1.10em;
      font-weight: 600;
      color: inherit;
      transition: opacity 0.15s ease;
    }

    .gz-search-title__subheading {
      font-size: 0.75em;
      color: inherit;
      opacity: 0.7;
      margin-top: 0.30rem;
      transition: opacity 0.15s ease;
    }

    .torrent-search--grouped__name > a:hover .gz-search-title__subheading,
    .torrent-search--list__name:hover .gz-search-title__heading,
    .torrent-search--list__name:hover .gz-search-title__subheading {
      opacity: 1;
    }

    .torrent-search--grouped__name .gz-search-title__subheading {
      font-size: 1em;
      margin-top: 0;
      opacity: 1;
      overflow-wrap: anywhere;
    }

    @media (max-width: 900px) {
      .torrent-search--grouped__torrents > tbody > .gz-dropdown-row {
        display: block;
      }
      .torrent-search--grouped__torrents > tbody > .gz-dropdown-row > td {
        display: block;
        width: 100%;
        min-width: 0;
      }
    }

    /* Position context for the hidden original text span (for Seadex compatibility) */
    .torrent-search--grouped__name > a[data-gz-search],
    .torrent-search--list__name {
      position: relative;
    }

    .gz-tooltip {
      position: fixed;
      z-index: 9999;
      pointer-events: none;
      background: var(--gz-tooltip-bg, rgba(0, 0, 0, 0.85));
      color: var(--gz-tooltip-color, #fff);
      border: 1px solid var(--gz-tooltip-border, rgba(255, 255, 255, 0.15));
      padding: 0.4rem 0.75rem;
      border-radius: 0.45rem;
      font-size: 1.25rem;
      line-height: 1.35;
      opacity: 0;
      transform: translateY(4px);
      transition: opacity 0.1s ease, transform 0.1s ease;
      max-width: 600px;
      word-break: break-word;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
    }

    .gz-tooltip--visible {
      opacity: 1;
      transform: translateY(0);
    }

    .gz-label--unknown {
      color: #ffd95e;
      font-weight: 600;
    }

    @media (max-width: 1100px) {
      .gz-similar-layout {
        flex-direction: column;
      }

      .gz-similar-layout__column--right {
        max-width: none;
        flex: 1 1 auto;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .gz-panel {
        margin-bottom: 0;
        flex: 1 1 calc(50% - 0.5rem);
      }
    }

    @media (max-width: 700px) {
      .gz-similar-layout__column--right {
        flex-direction: column;
      }
      .gz-panel {
        flex: 1 1 100%;
      }
    }

    .gz-actions-cell {
      white-space: nowrap;
      text-align: center;
      font-size: 0.9em;
      font-weight: normal;
    }
    
    .gz-actions-cell a, .gz-actions-cell button {
      display: inline-block;
      cursor: pointer;
      color: inherit;
      text-decoration: none;
      border: none;
      background: none;
      padding: 0;
      font: inherit;
    }

    .gz-actions-cell a:hover, .gz-actions-cell button:hover {
      text-decoration: underline;
    }

    .gz-torrent-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9em;
      margin-top: 0;
    }

    .gz-torrent-table th {
      text-align: left;
      padding: 10px 12px;
      border-bottom: 2px solid rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.7);
      font-weight: 600;
      white-space: nowrap;
    }

    .gz-torrent-table td {
      padding: 8px 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      vertical-align: middle;
    }

    .gz-torrent-table .gz-col-ep {
      width: 60px;
      white-space: nowrap;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 600;
    }

    .gz-torrent-table .gz-col-type {
      width: 80px;
      white-space: nowrap;
    }

    .gz-torrent-table .gz-col-name {
      /* Takes remaining space */
    }

    .gz-torrent-table .gz-col-actions {
      width: 150px;
      white-space: nowrap;
      padding-left: 8px !important;
    }
    
    .gz-torrent-table .gz-col-size {
      width: 80px;
      white-space: nowrap;
      text-align: right;
    }
    
    .gz-torrent-table .gz-col-stat {
      width: 50px;
      white-space: nowrap;
      text-align: center;
    }

    .gz-torrent-table .ep-hidden {
      color: transparent;
    }
    
    .gz-torrent-table .torrent-name-link {
        font-weight: 600;
        text-decoration: none;
        color: inherit;
        font-size: 1.05em;
    }
    
    .gz-torrent-table .gz-torrent-icons {
        display: inline-flex;
        gap: 6px;
        margin-left: 12px;
        vertical-align: middle;
    }
    
    .gz-torrent-table .gz-torrent-icons i {
        font-size: 0.9em;
        opacity: 0.8;
    }

    .gz-season-header {
       background: rgba(255, 255, 255, 0.06);
    }
    
    .gz-season-header td {
        font-weight: 700;
        font-size: 1.1em;
        padding: 12px;
        color: rgba(255, 255, 255, 0.95);
    }

    .gz-group-header {
       background: rgba(255, 255, 255, 0.03);
       border-bottom: 2px solid rgba(255, 255, 255, 0.05);
    }

    .gz-group-header td {
        font-weight: 700;
        padding: 8px 12px;
        font-size: 0.95em;
        color: rgba(255, 255, 255, 0.85);
        text-align: left;
    }

    /* Torrent Info Dropdown Styles */
    .gz-dropdown-row {
      background: rgba(0, 0, 0, 0.15);
    }

    .gz-dropdown-row td {
      padding: 0 !important;
    }

    .gz-dropdown-container {
      padding: 12px 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      /* Prevent layout shift */
      width: 100%;
      box-sizing: border-box;
    }

    /* Ensure gazelle table doesn't shift when dropdown opens */
    .gz-torrent-table {
      table-layout: fixed;
      width: 100%;
    }

    .gz-dropdown-header {
      font-size: 0.85em;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .gz-dropdown-header a {
      color: inherit;
      text-decoration: none;
    }

    .gz-dropdown-header a:hover {
      text-decoration: underline;
    }

    .gz-dropdown-tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 0;
      align-items: center;
    }

    .gz-dropdown-tab {
      padding: 8px 16px;
      cursor: pointer;
      font-size: 0.9em;
      color: rgba(255, 255, 255, 0.7);
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      transition: all 0.15s ease;
      margin-bottom: -1px;
    }

    .gz-dropdown-tab:hover {
      color: rgba(255, 255, 255, 0.9);
      background: rgba(255, 255, 255, 0.03);
    }

    .gz-dropdown-tab.active {
      color: #eaeeecff;
      border-bottom-color: #eaeeecff;
    }

    .gz-dropdown-panel {
      display: none;
      position: relative;
    }

    .gz-dropdown-panel.active {
      display: block;
    }

    .gz-panel-copy-btn {
      margin-left: auto;
      padding: 4px 12px;
      font-size: 0.85em;
      background: transparent;
      border: none;
      border-radius: 4px;
      color: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .gz-panel-copy-btn:hover {
      color: rgba(255, 255, 255, 0.9);
      background: rgba(255, 255, 255, 0.05);
    }

    .gz-panel-copy-btn.copied {
      color: #eaeeecff;
    }

    .gz-dropdown-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
      gap: 12px;
      padding: 4px 0;
      line-height: 1.5;
      font-size: 0.9em;
      color: rgba(255, 255, 255, 0.85);
    }

    .gz-details-section {
      min-width: 0;
      padding: 16px;
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.025);
    }

    .gz-details-section--flags .gz-details-grid {
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 145px), 1fr));
      gap: 6px 16px;
    }

    .gz-details-section--flags .gz-details-row {
      border-bottom: 0;
      padding: 6px 0;
    }

    .gz-trump-report-alert-host {
      grid-column: 1 / -1;
      min-width: 0;
    }

    .gz-trump-report-alert-host[hidden] {
      display: none !important;
    }

    .gz-trumpable-reason {
      grid-column: 1 / -1;
      display: grid;
      gap: 5px;
      min-width: 0;
      padding: 10px 12px;
      background: rgba(170, 36, 36, 0.14);
      border: 1px solid rgba(255, 90, 90, 0.32);
      border-left: 4px solid rgba(255, 88, 88, 0.75);
      border-radius: 6px;
      color: rgba(255, 238, 238, 0.94);
    }

    .gz-trumpable-reason__heading {
      font-size: 0.78em;
      font-weight: 800;
      text-transform: uppercase;
      color: rgb(255, 205, 205);
    }

    .gz-trumpable-reason__body {
      min-width: 0;
      overflow-wrap: anywhere;
      line-height: 1.35;
    }

    .gz-trump-report-alert {
      display: grid;
      gap: 10px;
      padding: 12px 14px;
      background: rgba(170, 36, 36, 0.2);
      border: 1px solid rgba(255, 90, 90, 0.42);
      border-left: 4px solid rgba(255, 88, 88, 0.9);
      border-radius: 6px;
      color: rgba(255, 238, 238, 0.96);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
    }

    .gz-trump-report-alert__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      min-width: 0;
    }

    .gz-trump-report-alert__title {
      min-width: 0;
      font-weight: 800;
      font-size: 0.96em;
      overflow-wrap: anywhere;
    }

    .gz-trump-report-alert__badge {
      flex: 0 0 auto;
      padding: 2px 8px;
      border-radius: 4px;
      background: rgba(255, 88, 88, 0.18);
      color: rgb(255, 205, 205);
      font-size: 0.78em;
      font-weight: 700;
      text-transform: uppercase;
    }

    .gz-trump-report-alert__list {
      display: grid;
      gap: 10px;
    }

    .gz-trump-report-alert__item {
      display: grid;
      gap: 6px;
      min-width: 0;
      padding-top: 10px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .gz-trump-report-alert__item:first-child {
      padding-top: 0;
      border-top: none;
    }

    .gz-trump-report-alert__item-title {
      min-width: 0;
      font-weight: 700;
      line-height: 1.35;
      overflow-wrap: anywhere;
    }

    .gz-trump-report-alert__meta {
      color: rgba(255, 226, 226, 0.72);
      font-size: 0.82em;
    }

    .gz-trump-report-alert__row {
      display: grid;
      grid-template-columns: 76px minmax(0, 1fr);
      gap: 10px;
      align-items: baseline;
      min-width: 0;
      font-size: 0.86em;
    }

    .gz-trump-report-alert__label {
      color: rgba(255, 226, 226, 0.68);
      font-weight: 700;
    }

    .gz-trump-report-alert__value {
      min-width: 0;
      overflow-wrap: anywhere;
      color: rgba(255, 255, 255, 0.92);
    }

    .gz-details-heading {
      margin: 0 0 12px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      font-size: 0.75em;
      line-height: 1.3;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.6);
      font-weight: 600;
    }

    .gz-details-grid {
      display: grid;
      margin: 0;
    }

    .gz-details-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 12px;
      align-items: center;
      min-width: 0;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.045);
    }

    .gz-details-row:last-child {
      border-bottom: 0;
    }

    .gz-details-label {
      color: rgba(255, 255, 255, 0.6);
      font-weight: 400;
      min-width: 0;
      overflow-wrap: anywhere;
    }

    .gz-details-value {
      margin: 0;
      min-width: 0;
      max-width: 20ch;
      text-align: right;
      overflow-wrap: anywhere;
      font-variant-numeric: tabular-nums;
      color: rgba(255, 255, 255, 0.9);
    }

    .gz-details-link {
      color: #b7d6e7;
      text-decoration: none;
      border-radius: 3px;
    }

    .gz-details-link::after {
      content: ' ↗';
      font-size: 0.85em;
      opacity: 0.55;
    }

    .gz-details-link:hover {
      color: #d9eef9;
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    .gz-details-link:focus-visible {
      outline: 2px solid #b7d6e7;
      outline-offset: 4px;
    }

    .gz-details-value--flag {
      justify-self: end;
      padding: 1px 7px;
      border-radius: 5px;
      font-weight: 500;
      font-size: 0.85em;
    }

    .gz-details-value--active {
      color: #b6edcc;
      background: rgba(70, 160, 105, 0.18);
    }

    .gz-details-value--inactive {
      color: rgba(255, 255, 255, 0.5);
      background: rgba(255, 255, 255, 0.035);
    }

    .gz-dropdown-description {
      font-size: 0.9em;
      line-height: 1.35;
      color: rgba(255, 255, 255, 0.85);
    }

    /* Collapse multiple consecutive br tags to reduce excessive blank lines */
    .gz-dropdown-description br + br {
      display: block;
      content: '';
      margin-top: 0.5em;
    }

    .gz-dropdown-description:empty::after {
      content: 'No description available.';
      color: rgba(255, 255, 255, 0.5);
      font-style: italic;
    }

    .gz-dropdown-filelist {
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 10px;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.02);
    }

    .gz-dropdown-filelist table {
      width: 100%;
      margin: 0;
      table-layout: fixed;
      border-collapse: collapse;
      font-size: 0.85em;
      line-height: 1.5;
    }

    .gz-dropdown-filelist table th,
    .gz-dropdown-filelist table td {
      padding: 9px 14px !important;
      text-align: left;
      vertical-align: middle;
      border-bottom: 1px solid rgba(255, 255, 255, 0.045);
    }

    .gz-dropdown-filelist table th {
      padding-top: 12px !important;
      padding-bottom: 12px !important;
      color: rgba(255, 255, 255, 0.5);
      background: rgba(255, 255, 255, 0.025);
      font-size: 0.82em;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      font-weight: 600;
    }

    .gz-dropdown-filelist table .gz-file-size-heading {
      width: 100px;
      text-align: right;
    }

    .gz-dropdown-filelist table td:last-child:not([colspan]) {
      text-align: right;
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
      color: rgba(255, 255, 255, 0.6);
    }

    .gz-dropdown-filelist tbody tr:hover {
      background: rgba(255, 255, 255, 0.035);
    }

    .gz-dropdown-mediainfo pre {
      margin: 0;
      padding: 12px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 6px;
      font-size: 0.8em;
      font-family: 'Monaco', 'Consolas', monospace;
      line-height: 1.4;
      white-space: pre-wrap;
      word-break: break-word;
      color: rgba(255, 255, 255, 0.85);
    }

    .gz-dropdown-loading {
      text-align: center;
      padding: 20px;
      color: rgba(255, 255, 255, 0.6);
    }

    .gz-dropdown-error {
      text-align: center;
      padding: 20px;
      color: #db7676;
    }

    .gz-torrent-table .torrent-name-link.gz-clickable {
      cursor: pointer;
    }

    .gz-torrent-table .torrent-name-link.gz-clickable:hover {
      text-decoration: underline;
    }

    /* BBCode Styles */
    .gz-bbcode-img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin: 4px 0;
    }

    .gz-bbcode-quote {
      margin: 4px 0;
      padding: 8px 12px;
      border-left: 3px solid rgba(118, 219, 166, 0.6);
      background: rgba(255, 255, 255, 0.03);
      border-radius: 0 4px 4px 0;
    }

    .gz-bbcode-quote cite {
      display: block;
      font-weight: 600;
      margin-bottom: 6px;
      color: rgba(255, 255, 255, 0.7);
    }

    .gz-bbcode-code {
      margin: 4px 0;
      padding: 8px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 4px;
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 0.85em;
      overflow-x: auto;
    }

    .gz-bbcode-spoiler,
    .gz-bbcode-comparison {
      margin: 4px 0;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }

    .gz-bbcode-spoiler summary,
    .gz-bbcode-comparison summary {
      padding: 6px 10px;
      cursor: pointer;
      background: rgba(255, 255, 255, 0.03);
      font-weight: 500;
    }

    .gz-bbcode-spoiler[open] summary,
    .gz-bbcode-comparison[open] summary {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .gz-bbcode-spoiler-content {
      padding: 8px 10px;
    }

    .gz-bbcode-note {
      margin: 4px 0;
      padding: 8px 12px;
      background: rgba(118, 219, 166, 0.08);
      border: 1px solid rgba(118, 219, 166, 0.3);
      border-radius: 6px;
      color: rgba(255, 255, 255, 0.9);
    }

    .gz-bbcode-alert {
      margin: 4px 0;
      padding: 8px 12px;
      background: rgba(219, 118, 118, 0.08);
      border: 1px solid rgba(219, 118, 118, 0.3);
      border-radius: 6px;
      color: rgba(255, 255, 255, 0.9);
    }

    .gz-bbcode-list {
      margin: 4px 0;
      padding-left: 20px;
      list-style-type: disc;
    }

    .gz-bbcode-list li {
      margin: 2px 0;
      padding-left: 4px;
    }

    /* BBCode Heading Styles */
    .gz-bbcode-heading {
      font-weight: 700;
      color: rgba(255, 255, 255, 0.95);
      margin: 6px 0 4px;
      line-height: 1.25;
    }

    .gz-bbcode-h1 {
      font-size: 1.5em;
    }

    .gz-bbcode-h2 {
      font-size: 1.35em;
    }

    .gz-bbcode-h3 {
      font-size: 1.2em;
    }

    .gz-bbcode-h4 {
      font-size: 1.1em;
    }

    .gz-bbcode-h5 {
      font-size: 1em;
    }

    .gz-bbcode-h6 {
      font-size: 0.9em;
    }

    /* BBCode Table Styles */
    .gz-bbcode-table {
      width: auto !important;
      border-collapse: separate !important;
      border-spacing: 0 !important;
      margin: 10px 0 !important;
      background: rgba(0, 0, 0, 0.25) !important;
      border: 1px solid rgba(255, 255, 255, 0.12) !important;
      border-radius: 6px !important;
      overflow: hidden !important;
    }

    .gz-bbcode-table tr {
      border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
    }

    .gz-bbcode-table tr:last-child {
      border-bottom: none !important;
    }

    .gz-bbcode-table td {
      padding: 12px 16px !important;
      vertical-align: middle !important;
      line-height: 1.5 !important;
    }

    .gz-bbcode-table td:first-child {
      font-weight: 500 !important;
      color: rgba(255, 255, 255, 0.75) !important;
      white-space: nowrap !important;
      padding-right: 48px !important;
      border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
    }

    .gz-bbcode-table td:last-child {
      padding-left: 24px !important;
    }

    .gz-bbcode-table th {
      padding: 12px 16px !important;
      text-align: left !important;
      font-weight: 600 !important;
      background: rgba(255, 255, 255, 0.04) !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12) !important;
      color: rgba(255, 255, 255, 0.9) !important;
    }

    /* BBCode Horizontal Rule */
    .gz-bbcode-hr {
      border: none;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      margin: 16px 0;
    }

    /* File List Tree Styles */
    .gz-filelist-root-info {
      padding: 12px 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      font-size: 0.85em;
      overflow-wrap: anywhere;
      color: rgba(255, 255, 255, 0.7);
    }

    .gz-filelist-root-info strong {
      font-weight: 500;
      color: #b7d6e7;
    }

    .gz-filelist-folder-row {
      cursor: pointer;
      background: rgba(255, 255, 255, 0.025);
    }

    .gz-folder-button {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      border: 0;
      padding: 0;
      background: transparent;
      color: inherit;
      font: inherit;
      text-align: left;
      cursor: pointer;
    }

    .gz-folder-button:focus-visible {
      outline: 2px solid #b7d6e7;
      outline-offset: 4px;
      border-radius: 3px;
    }

    .gz-folder-toggle {
      flex: 0 0 12px;
      text-align: center;
      font-size: 1.3em;
      line-height: 1;
      color: rgba(255, 255, 255, 0.5);
    }

    .gz-folder-button[aria-expanded="true"] .gz-folder-toggle {
      transform: rotate(90deg);
    }

    .gz-folder-icon,
    .gz-file-icon {
      width: 17px;
      height: 17px;
      flex: 0 0 17px;
      color: #9bb9cb;
    }

    .gz-folder-name {
      font-weight: 500;
      color: rgba(255, 255, 255, 0.9);
      overflow-wrap: anywhere;
      min-width: 0;
    }

    .gz-folder-count {
      font-weight: 400;
      color: rgba(255, 255, 255, 0.45);
      font-size: 0.85em;
      white-space: nowrap;
      margin-left: auto;
    }

    .gz-file-name {
      display: flex;
      align-items: baseline;
      gap: 8px;
      color: rgba(255, 255, 255, 0.8);
    }

    .gz-file-name > span {
      min-width: 0;
      overflow-wrap: anywhere;
    }

    .gz-file-icon {
      align-self: flex-start;
      margin-top: 2px;
      color: rgba(255, 255, 255, 0.3);
    }

    /* MediaInfo Summary Styles */
    .gz-mediainfo-summary {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      margin-bottom: 12px;
      font-size: 0.9em;
    }

    .gz-mediainfo-filename {
      font-weight: 700;
      font-size: 1.05em;
      color: rgba(255, 255, 255, 0.6);
      word-break: break-all;
      padding: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      cursor: pointer;
      transition: background 0.15s ease;
      margin: -16px -16px 0 -16px;
      border-radius: 8px 8px 0 0;
    }

    .gz-mediainfo-filename:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .gz-mediainfo-filename::before {
      content: 'Show ';
      font-weight: 400;
      color: rgba(255, 255, 255, 0.6);
    }

    .gz-mediainfo-filename.expanded::before {
      content: 'Hide ';
    }

    .gz-mediainfo-raw-inline {
      display: none;
      margin: 12px -16px;
      padding: 12px 16px;
      background: rgba(0, 0, 0, 0.25);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      max-height: 400px;
      overflow: auto;
    }

    .gz-mediainfo-raw-inline.visible {
      display: block;
    }

    .gz-mediainfo-raw-inline pre {
      margin: 0;
      font-size: 0.8em;
      font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
      line-height: 1.4;
      white-space: pre-wrap;
      word-break: break-word;
      color: rgba(255, 255, 255, 0.85);
    }

    .gz-mediainfo-summary-content {
      padding-top: 16px;
    }

    .gz-mediainfo-columns {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
    }

    .gz-mediainfo-column {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .gz-mediainfo-column-title {
      font-weight: 700;
      font-size: 0.85em;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 4px;
    }

    .gz-mediainfo-row {
      display: flex;
      gap: 8px;
      line-height: 1.5;
    }

    .gz-mediainfo-row-label {
      color: rgba(255, 255, 255, 0.6);
      min-width: 70px;
      flex-shrink: 0;
    }

    .gz-mediainfo-row-value {
      color: rgba(255, 255, 255, 0.95);
    }

    .gz-mediainfo-section-title {
      font-weight: 700;
      font-size: 0.85em;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: rgba(255, 255, 255, 0.5);
      margin-top: 16px;
      margin-bottom: 8px;
    }

    .gz-mediainfo-audio-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .gz-mediainfo-audio-item {
      display: flex;
      gap: 8px;
      line-height: 1.5;
    }

    .gz-mediainfo-audio-num {
      color: rgba(255, 255, 255, 0.5);
      min-width: 20px;
      flex-shrink: 0;
    }

    .gz-mediainfo-audio-details {
      color: rgba(255, 255, 255, 0.9);
    }

    .gz-mediainfo-audio-title {
      color: rgba(255, 255, 255, 0.6);
    }

    .gz-mediainfo-subtitles-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px 12px;
      color: rgba(255, 255, 255, 0.85);
      line-height: 1.6;
    }

    .gz-mediainfo-subtitles-list--detailed {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .gz-mediainfo-subtitle-item {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .gz-mediainfo-subtitle-item--detailed {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }

    .gz-mediainfo-subtitle-num {
      color: rgba(255, 255, 255, 0.5);
      font-weight: 600;
      min-width: 28px;
    }

    .gz-mediainfo-subtitle-details {
      color: rgba(255, 255, 255, 0.85);
    }

    .gz-mediainfo-subtitle-title {
      color: rgba(255, 255, 255, 0.6);
    }

    .gz-mediainfo-subtitle-flags {
      color: rgba(219, 166, 118, 0.9);
      font-size: 0.9em;
    }

    .gz-mediainfo-subtitle-forced {
      color: rgba(219, 166, 118, 0.9);
      font-size: 0.85em;
      font-weight: 600;
    }

    .gz-mediainfo-encode-settings {
      background: rgba(0, 0, 0, 0.3);
      border-radius: 6px;
      padding: 12px;
      font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
      font-size: 0.8em;
      line-height: 1.5;
      color: rgba(255, 255, 255, 0.8);
      word-break: break-all;
      white-space: pre-wrap;
      max-height: 200px;
      overflow-y: auto;
    }

    /* Legacy section styles for backwards compatibility */
    .gz-mediainfo-section {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .gz-mediainfo-label {
      font-weight: 600;
      color: rgba(255, 255, 255, 0.7);
      min-width: 80px;
      flex-shrink: 0;
    }

    .gz-mediainfo-value {
      color: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .gz-mediainfo-raw-container {
      margin-top: 8px;
    }

    .gz-mediainfo-raw-container summary {
      cursor: pointer;
      color: rgba(118, 219, 166, 0.9);
      font-size: 0.85em;
      padding: 6px 0;
    }

    .gz-mediainfo-raw-container summary:hover {
      text-decoration: underline;
    }

    .gz-mediainfo-raw {
      margin-top: 8px;
      max-height: 300px;
      overflow: auto;
    }

    /* Trump Report Modal Styles */
    .gz-trump-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    }

    .gz-trump-modal {
      background: rgba(30, 30, 35, 0.95);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      padding: 24px;
      width: 90%;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }

    .gz-trump-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .gz-trump-header h3 {
      margin: 0;
      font-size: 1.2em;
      color: #fff;
    }

    .gz-trump-close {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.6);
      font-size: 1.5em;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      transition: color 0.15s ease;
    }

    .gz-trump-close:hover {
      color: #fff;
    }

    .gz-trump-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .gz-trump-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .gz-trump-field label {
      font-size: 0.85em;
      color: rgba(255, 255, 255, 0.7);
      font-weight: 500;
    }

    .gz-trump-field .reported-torrent {
      padding: 10px 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      color: rgba(255, 255, 255, 0.9);
      font-size: 0.9em;
      word-break: break-word;
    }

    .gz-trump-select,
    .gz-trump-input,
    .gz-trump-textarea {
      padding: 10px 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 6px;
      color: #fff;
      font-size: 0.9em;
      font-family: inherit;
      transition: border-color 0.15s ease, background 0.15s ease;
    }

    .gz-trump-select:focus,
    .gz-trump-input:focus,
    .gz-trump-textarea:focus {
      outline: none;
      border-color: rgba(118, 219, 166, 0.6);
      background: rgba(255, 255, 255, 0.08);
    }

    .gz-trump-select option {
      background: rgb(30, 30, 35);
      color: #fff;
    }

    .gz-trump-textarea {
      min-height: 100px;
      resize: vertical;
    }

    .gz-trump-buttons {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 8px;
    }

    .gz-trump-btn {
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 0.9em;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      border: none;
    }

    .gz-trump-btn--cancel {
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.8);
    }

    .gz-trump-btn--cancel:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
    }

    .gz-trump-btn--submit {
      background: rgba(118, 219, 166, 0.85);
      color: rgb(20, 20, 25);
    }

    .gz-trump-btn--submit:hover {
      background: rgba(118, 219, 166, 1);
    }

    .gz-trump-btn--submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Toast Notification Styles */
    .gz-toast {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 14px 20px;
      border-radius: 8px;
      font-size: 0.9em;
      z-index: 10001;
      max-width: 400px;
      word-break: break-word;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
      animation: gz-toast-slide-in 0.3s ease;
    }

    @keyframes gz-toast-slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .gz-toast--success {
      background: rgba(118, 219, 166, 0.95);
      color: rgb(20, 20, 25);
    }

    .gz-toast--error {
      background: rgba(219, 118, 118, 0.95);
      color: #fff;
    }

    .gz-toast--info {
      background: rgba(118, 166, 219, 0.95);
      color: #fff;
    }

    /* Settings inherit the active UNIT3D theme, with Starry Night fallbacks. */
    .gz-config-link { display: inline-block; margin-top: 8px; padding: 0; border: 0; background: none; color: inherit; font: inherit; cursor: pointer; }
    .gz-config-link:hover { text-decoration: underline; }
    .gz-config-overlay {
      --gz-settings-bg: var(--dialog-bg, #1e2433);
      --gz-settings-fg: var(--dialog-fg, var(--text-color, #ccc));
      --gz-settings-head: var(--dialog-head-bg, #0e111d);
      --gz-settings-row: var(--data-table-tr-even-bg, #272d3d);
      --gz-settings-border: color-mix(in srgb, var(--gz-settings-fg) 18%, transparent);
      --gz-settings-accent: var(--button-filled-bg, #586379);
      position: fixed; inset: 0; z-index: 10000; padding: 24px;
      display: flex; align-items: center; justify-content: center;
      background: #0009; backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);
      color: var(--gz-settings-fg); font: 14px/1.5 system-ui, sans-serif; text-align: left;
    }
    .gz-config-overlay *, .gz-config-overlay *::before, .gz-config-overlay *::after { box-sizing: border-box; }
    .gz-config-modal {
      display: flex; flex-direction: column; width: 920px; max-width: 100%;
      height: 790px; max-height: calc(100dvh - 48px); min-height: 0;
      background: var(--gz-settings-bg); border: 1px solid var(--gz-settings-border);
      border-radius: 12px; overflow: hidden; box-shadow: 0 24px 90px #0008;
    }
    .gz-config-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 22px 26px; background: var(--gz-settings-head); border-bottom: 1px solid var(--gz-settings-border); }
    .gz-config-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: .12em; opacity: .75; }
    .gz-config-modal .gz-config-title { font-size: 23px; font-weight: 600; color: var(--dialog-head-fg, #fff); margin: 0; line-height: 1.3; }
    .gz-config-workspace { display: flex; flex: 1; min-height: 0; }
    .gz-config-nav { flex: 0 0 195px; padding: 20px 12px; border-right: 1px solid var(--gz-settings-border); background: var(--gz-settings-head); }
    .gz-config-nav-button { display: block; width: 100%; text-align: left; padding: 11px 12px; margin: 0 0 5px; border: 1px solid transparent; border-radius: 6px; background: transparent; color: inherit; font: inherit; cursor: pointer; }
    .gz-config-nav-button[aria-current] { background: var(--gz-settings-row); border-color: var(--gz-settings-border); color: var(--dialog-head-fg, #fff); box-shadow: inset 3px 0 var(--gz-settings-accent); }
    .gz-config-nav-button:hover { background: var(--gz-settings-row); }
    .gz-config-body { flex: 1; min-width: 0; overflow-y: auto; overscroll-behavior: contain; padding: 24px 28px; scrollbar-width: thin; }
    .gz-config-section[hidden] { display: none !important; }
    .gz-config-modal .gz-config-section-title { font-size: 19px; line-height: 1.3; margin: 0 0 8px; color: inherit; font-weight: 600; }
    .gz-config-description { margin: 0 0 22px; opacity: .75; font-size: 13px; }
    .gz-config-field { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 14px 0; margin: 0; border-bottom: 1px solid var(--gz-settings-border); cursor: pointer; }
    .gz-config-field-copy { min-width: 0; }
    .gz-config-label { display: block; color: inherit; font-size: 14px; font-weight: 500; }
    .gz-config-help { display: block; margin: 4px 0 0; font-size: 12px; opacity: .72; line-height: 1.5; }
    .gz-config-toggle { appearance: none; -webkit-appearance: none; flex: 0 0 36px; width: 36px; height: 21px; margin: 0; padding: 2px; border: 1px solid var(--gz-settings-border); border-radius: 20px; background: var(--gz-settings-head); cursor: pointer; }
    .gz-config-toggle::before { content: ''; display: block; width: 15px; height: 15px; border-radius: 50%; background: var(--gz-settings-fg); transition: transform .15s; }
    .gz-config-toggle:checked { background: var(--gz-settings-accent); }
    .gz-config-toggle:checked::before { transform: translateX(15px); background: var(--button-filled-fg, #fff); }
    .gz-config-input { width: 100%; min-width: 0; padding: 10px 12px; background: var(--gz-settings-head); border: 1px solid var(--gz-settings-border); border-radius: 6px; color: inherit; font: inherit; }
    .gz-config-input::placeholder { color: inherit; opacity: .5; }
    .gz-config-number { flex: 0 0 80px; width: 80px; }
    .gz-config-input-label { display: block; margin: 22px 0 8px; font-size: 13px; }
    .gz-config-api-row { display: flex; gap: 8px; }
    .gz-config-notice { margin: 16px 0 10px; padding: 12px; border: 1px solid var(--gz-settings-border); border-radius: 6px; background: var(--gz-settings-row); font-size: 12px; }
    .gz-config-colors { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin: 18px 0; }
    .gz-config-colors.is-muted { opacity: .55; }
    .gz-config-color { display: flex; align-items: center; gap: 10px; min-width: 0; padding: 10px; margin: 0; border: 1px solid var(--gz-settings-border); border-radius: 6px; background: var(--gz-settings-row); font-size: 12px; cursor: pointer; }
    .gz-config-color input { appearance: none; -webkit-appearance: none; width: 28px; height: 28px; flex: 0 0 28px; padding: 0; border: 1px solid var(--gz-settings-border); border-radius: 5px; overflow: hidden; background: none; cursor: pointer; }
    .gz-config-color input::-webkit-color-swatch-wrapper { padding: 0; }
    .gz-config-color input::-webkit-color-swatch { border: 0; border-radius: 3px; }
    .gz-config-color input::-moz-color-swatch { border: 0; }
    .gz-config-modal .gz-config-subtitle { margin: 24px 0 4px; font-size: 15px; color: inherit; }
    .gz-sequence-list { display: flex; flex-direction: column; gap: 5px; margin: 14px 0; }
    .gz-sequence-item { display: flex; align-items: center; gap: 8px; padding: 7px 10px; border: 1px solid var(--gz-settings-border); border-radius: 6px; background: var(--gz-settings-row); }
    .gz-sequence-label { display: flex; align-items: center; gap: 10px; flex: 1; margin: 0; font-size: 13px; cursor: pointer; }
    .gz-sequence-toggle { width: 16px; height: 16px; margin: 0; flex-shrink: 0; accent-color: var(--gz-settings-accent); }
    .gz-sequence-handle { cursor: grab; opacity: .5; font-size: 18px; }
    .gz-sequence-item.disabled .gz-sequence-label span { opacity: .5; text-decoration: line-through; }
    .gz-sequence-item.dragging { opacity: .4; }
    .gz-sequence-item.drag-over { outline: 2px solid var(--gz-settings-accent); }
    .gz-config-preview { flex-shrink: 0; padding: 14px 26px; border-top: 1px solid var(--gz-settings-border); background: var(--gz-settings-head); }
    .gz-config-preview-name { display: flex; flex-wrap: wrap; gap: 4px 10px; margin-top: 7px; font: 12px/1.5 ui-monospace, monospace; max-height: 80px; overflow-y: auto; }
    .gz-config-buttons { display: flex; flex-shrink: 0; align-items: center; gap: 10px; padding: 16px 26px; border-top: 1px solid var(--gz-settings-border); }
    .gz-config-save-status { flex: 1; font-size: 12px; opacity: .75; }
    .gz-config-save-status.is-error { opacity: 1; color: var(--color-light-red, #ec8b99); }
    .gz-config-btn { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; padding: 9px 14px; border: 1px solid var(--gz-settings-border); border-radius: 6px; background: var(--gz-settings-row); color: inherit; font: 500 13px/1.4 system-ui, sans-serif; cursor: pointer; text-decoration: none; }
    .gz-config-btn:hover { filter: brightness(1.15); }
    .gz-config-btn--save { background: var(--gz-settings-accent); color: var(--button-filled-fg, #fff); }
    .gz-config-close { width: 34px; height: 34px; padding: 0; font-size: 24px; background: transparent; }
    .gz-sequence-arrow { padding: 4px; width: 28px; height: 28px; }
    .gz-config-btn:disabled { opacity: .3; cursor: default; }
    .gz-config-overlay :focus-visible, .gz-config-link:focus-visible { outline: 2px solid var(--color-light-blue, #8ab4e8); outline-offset: 3px; }
    .gz-config-sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
    @media (max-width: 640px) {
      .gz-config-overlay { padding: 8px; }
      .gz-config-modal { max-height: calc(100dvh - 16px); height: 850px; }
      .gz-config-header { padding: 16px; }
      .gz-config-modal .gz-config-title { font-size: 20px; }
      .gz-config-workspace { flex-direction: column; }
      .gz-config-nav { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); flex: 0 0 auto; padding: 8px; border-right: 0; border-bottom: 1px solid var(--gz-settings-border); }
      .gz-config-nav-button { margin: 0; padding: 8px; font-size: 12px; }
      .gz-config-body { padding: 18px 16px; }
      .gz-config-field { gap: 12px; }
      .gz-config-preview { padding: 12px 16px; }
      .gz-config-buttons { padding: 12px 16px; flex-wrap: wrap; }
      .gz-config-save-status { flex-basis: 100%; }
      .gz-config-buttons > button { flex: 1; }
    }
    @media (max-width: 380px) { .gz-config-colors { grid-template-columns: 1fr; } }
    @media (prefers-reduced-motion: reduce) { .gz-config-toggle::before { transition: none; } }

    /* Native UNIT3D BBCode rendered styles */
    .bbcode-rendered { font-size: 15px; line-height: 1.5; word-wrap: break-word; color: rgba(255, 255, 255, 0.85); margin: 0; }
    .bbcode-rendered b, .bbcode-rendered strong { font-weight: 600; }
    .bbcode-rendered a { background-color: transparent; color: #5dade2; text-decoration: none; }
    .bbcode-rendered a:hover { text-decoration: underline; }
    .bbcode-rendered hr { border-bottom: 1px solid rgba(255,255,255,0.1); height: 1px; margin: 24px 0; border: 0; background-color: rgba(255,255,255,0.1); }
    .bbcode-rendered details { padding: 0 6px; margin-bottom: 2px; display: inline-block; max-width: 100%; border-left: 2px solid rgba(255,255,255,0.1); }
    .bbcode-rendered details summary { cursor: pointer; display: list-item; padding: 4px; font-weight: 600; }
    .bbcode-rendered details:not([open]) > *:not(summary) { display: none !important; }
    .bbcode-rendered h1, .bbcode-rendered h2, .bbcode-rendered h3, .bbcode-rendered h4, .bbcode-rendered h5, .bbcode-rendered h6 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25; }
    .bbcode-rendered h1 { margin: 0.67em 0; padding-bottom: 0.3em; font-size: 30px; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .bbcode-rendered h2 { padding-bottom: 0.3em; font-size: 23px; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .bbcode-rendered h3 { font-size: 19px; }
    .bbcode-rendered h4 { font-size: 15px; }
    .bbcode-rendered h5 { font-size: 13px; }
    .bbcode-rendered h6 { font-size: 13px; color: rgba(255,255,255,0.5); }
    .bbcode-rendered blockquote {
        margin: 12px 2px; padding: 0.25em 0.25em 0.25em 1em; color: rgba(255,255,255,0.6);
        border-left: 0.25em solid rgba(255,255,255,0.2); font-size: 15px; background-color: rgba(0,0,0,0.2);
        border-radius: 3px 6px 6px 3px / 8px 6px 6px 8px;
    }
    .bbcode-rendered blockquote > cite { font-size: 12px; font-weight: bold; }
    .bbcode-rendered p, .bbcode-rendered blockquote, .bbcode-rendered ul, .bbcode-rendered ol, .bbcode-rendered dl, .bbcode-rendered table,
    .bbcode-rendered .bbcode-rendered__center, .bbcode-rendered .bbcode-rendered__left, .bbcode-rendered .bbcode-rendered__right,
    .bbcode-rendered .bbcode-rendered__alert, .bbcode-rendered .bbcode-rendered__note, .bbcode-rendered .bbcode-rendered__clipboard {
        margin-top: 12px; margin-bottom: 12px;
    }
    .bbcode-rendered ul, .bbcode-rendered ol { padding-left: 2em; }
    .bbcode-rendered ol { list-style-type: decimal; }
    .bbcode-rendered ol[type='a'] { list-style-type: lower-alpha; }
    .bbcode-rendered ol[type='i'] { list-style-type: lower-roman; }
    .bbcode-rendered li > p { margin-top: 16px; }
    .bbcode-rendered li + li { margin-top: 0.25em; }
    .bbcode-rendered > li, .bbcode-rendered :not(ul):not(ol) > li { list-style-position: inside; list-style-type: circle; }
    .bbcode-rendered table { border-collapse: collapse; display: block; width: max-content; max-width: 100%; overflow: auto; }
    .bbcode-rendered th { font-weight: 600; }
    .bbcode-rendered th, .bbcode-rendered td { padding: 6px 13px; border: 1px solid rgba(255,255,255,0.1) !important; background-color: rgba(255,255,255,0.02); }
    .bbcode-rendered tr { border-top: 1px solid rgba(255,255,255,0.1); }
    .bbcode-rendered tr:nth-child(2n), .bbcode-rendered tr:nth-child(2n) td { background-color: rgba(255,255,255,0.05); }
    .bbcode-rendered img { max-width: 100%; }
    .bbcode-rendered code, .bbcode-rendered kbd, .bbcode-rendered pre { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace; }
    .bbcode-rendered pre { font-size: 12px; word-wrap: normal; overflow: auto; word-break: break-word; white-space: pre-wrap; margin: 0; padding: 12px; border-radius: 6px; flex: 1; min-width: 0; }
    .bbcode-rendered code { padding: 0.2em 0.4em; margin: 0; font-size: 13px; background-color: rgba(255,255,255,0.05); border-radius: 6px; }
    .bbcode-rendered pre code { display: inline; padding: 0; background-color: transparent; }
    .bbcode-rendered .bbcode-rendered__clipboard { display: flex; justify-content: space-between; background-color: rgba(0,0,0,0.25); border-radius: 6px; position: relative; overflow: auto; }
    .bbcode-rendered__clipboard-button { display: block; background: transparent; border: none; margin: 6px; color: rgba(255,255,255,0.5); cursor: pointer; font-size: 1.1em; padding: 4px; }
    .bbcode-rendered__clipboard-button:hover, .bbcode-rendered__clipboard-button:focus { color: rgba(255,255,255,0.9); }
    .bbcode-rendered__alert { border-radius: 5px; padding: 8px; border: 2px solid #e74c3c; }
    .bbcode-rendered__alert::before { content: 'Alert: '; color: #e74c3c; display: inline-block; padding-right: 1ch; }
    .bbcode-rendered__note { border-radius: 4px; padding: 8px; border: 2px solid #f39c12; }
    .bbcode-rendered__note::before { content: 'Note: '; color: #f39c12; display: inline-block; padding-right: 1ch; }

    /* Comparison Block */
    .comparison__screenshots { display: flex; flex-direction: column; align-items: center; position: fixed; left: 0; top: 0; width: 100vw; height: 100vh; overflow-y: auto; z-index: 10000; background-color: rgba(0,0,0,0.95); list-style-type: none; margin: 0 !important; padding: 0 !important; }
    .comparison__row { display: flex; flex-direction: row; align-items: center; list-style-type: none; margin: 0; padding: unset !important; margin-left: max(0px, 50% - 50vw); }
    .comparison__image-container { margin: unset !important; }
    .comparison__image--hidden, .comparison__image-container--hidden { visibility: hidden; width: 0px; }
    .comparison__figure { margin: unset !important; }
    .comparison__image { image-rendering: crisp-edges; max-width: max-content !important; max-height: max-content !important; }
    .comparison__figcaption { position: fixed; width: 100%; text-align: center; top: 4px; left: calc(50vw - 50%); text-shadow: -2px 0 black, 0 2px black, 2px 0 black, 0 -2px black; color: white; font-size: 18px; z-index: 10001; }
    .comparison__text { font-weight: 700; margin-bottom: 8px; }
    .comparison__divider { font-weight: 300; color: rgba(255,255,255,0.4); }
    .comparison__button { font-weight: 300; background-color: transparent; color: #5dade2; border: none; cursor: pointer; text-decoration: underline; padding: 0 4px; }

    /* Mediahub: compact poster rail and flat, native release tables. */
    .gz-mediahub {
      position: relative;
      margin: 0 0 16px;
      padding: 12px;
      border: 1px solid var(--panel-border, #444);
      border-radius: 3px;
      background: var(--torrent-group-table-stripe-odd, #252525);
      min-width: 0;
    }
    .gz-mediahub.gz-mediahub--poster { padding-left: 140px; min-height: 190px; }
    .gz-mediahub .torrent-search--grouped__header {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 6px 12px;
      height: auto;
      min-height: 0;
      padding: 0 0 10px;
      background: transparent;
    }
    .gz-mediahub--poster .torrent-search--grouped__poster {
      position: absolute;
      top: 12px;
      left: 12px;
      width: 112px;
    }
    .gz-mediahub .torrent-search--grouped__poster img {
      width: 112px;
      height: auto;
      max-height: 170px;
      object-fit: cover;
      border-radius: 2px;
    }
    .gz-mediahub .torrent-search--grouped__title-name {
      font-size: 16px;
      margin: 0;
      flex: 1 1 auto;
    }
    .gz-mediahub .torrent-search--grouped__directors { font-size: 12px; }
    .gz-mediahub .torrent-search--grouped__genres {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: flex-start;
      gap: 10px;
      width: 100%;
    }
    .gz-mediahub .torrent-search--grouped__genre {
      border: 0;
      padding: 0;
      font-size: 12px;
      background: transparent;
    }
    .gz-mediahub .torrent-search--grouped__plot {
      width: 100%;
      margin: 0;
      font-size: 12px;
      line-height: 1.4;
    }
    .gz-mediahub > section { overflow-x: auto; }
    .gz-mediahub .torrent-search--grouped__dropdown { margin: 0; padding: 0; border: 0; }
    .gz-mediahub .torrent-search--grouped__dropdown > summary {
      padding: 6px 8px;
      font-size: 12px;
      font-weight: 600;
      background: var(--torrent-group-header-bg, #333);
      border-bottom: 1px solid var(--panel-border, #444);
    }
    .gz-mediahub .torrent-search--grouped__dropdown .torrent-search--grouped__dropdown > summary { display: none; }
    .gz-mediahub .torrent-search--grouped__torrents {
      display: table;
      table-layout: auto;
      border-collapse: collapse;
      width: 100%;
      min-width: 760px;
      border: 0;
    }
    .gz-mediahub .torrent-search--grouped__torrents > tbody { display: table-row-group; }
    .gz-mediahub .torrent-search--grouped__torrents > tbody > tr { display: table-row; }
    .gz-mediahub .torrent-search--grouped__torrents > tbody > tr > :is(td, th) {
      display: table-cell;
      width: auto;
      height: auto;
      padding: 8px 6px;
      font-size: 12px;
      border-bottom: 1px solid var(--panel-border, #444);
      vertical-align: middle;
      white-space: nowrap;
    }
    .gz-mediahub .torrent-search--grouped__torrents > tbody > tr > .torrent-search--grouped__overview {
      width: 100%;
      white-space: normal;
    }
    .gz-mediahub .torrent-search--grouped__overview > div { display: block; }
    .gz-mediahub .torrent-search--grouped__name { display: inline; font-size: inherit; }
    .gz-mediahub .torrent-search--grouped__name > a { display: inline; padding: 0; font-weight: 400; }
    .gz-mediahub .gz-search-title { display: inline; }
    .gz-mediahub .gz-search-title__subheading { display: inline; line-height: 1.5; }
    .gz-mediahub .torrent-icons { display: inline-flex; vertical-align: middle; margin: 0 0 0 8px; }
    .gz-mediahub .gz-dropdown-row > td { white-space: normal !important; }
    .gz-mediahub .gz-mediahub-hidden { display: none !important; }
    .gz-mediahub-more {
      display: block;
      margin: 10px auto 0;
      padding: 6px 12px;
      border: 1px solid var(--panel-border, #555);
      border-radius: 3px;
      background: var(--torrent-group-header-bg, #333);
      color: inherit;
      cursor: pointer;
    }
    .gz-mediahub :is(a, button, summary):focus-visible { outline: 2px solid var(--link-color, #55bbee); outline-offset: 2px; }
    @media (max-width: 700px) {
      .gz-mediahub.gz-mediahub--poster { padding: 10px; }
      .gz-mediahub--poster .torrent-search--grouped__header { padding-left: 76px; min-height: 100px; align-content: start; }
      .gz-mediahub--poster .torrent-search--grouped__poster { width: 64px; top: 10px; left: 10px; }
      .gz-mediahub .torrent-search--grouped__poster img { width: 64px; max-height: 96px; }
      .gz-mediahub .torrent-search--grouped__plot { line-height: 1.3; }
    }
    /* Gazelle-style member pages: content on the left, compact facts on the right. */
    .gz-user-profile {
      --gz-profile-bg: var(--panel-bg, #202534);
      --gz-profile-fg: var(--text-color, #ccc);
      --gz-profile-line: color-mix(in srgb, var(--gz-profile-fg) 14%, transparent);
      --gz-profile-muted: color-mix(in srgb, var(--gz-profile-fg) 76%, var(--gz-profile-bg));
      --key-value-odd-bg: transparent;
      --key-value-even-bg: transparent;
      color: var(--gz-profile-fg);
    }
    .gz-user-profile > article {
      width: 100%; max-width: 1440px; margin-inline: auto; padding: 24px;
    }
    .gz-profile-header { margin-bottom: 22px; }
    .gz-profile-heading {
      display: flex; align-items: baseline; flex-wrap: wrap; gap: 8px 16px;
      margin: 0; padding: 0; font-size: 22px; font-weight: 400;
    }
    .gz-user-profile .user-profile-card__username {
      display: inline-flex; align-items: center; flex-wrap: wrap; gap: 4px;
      padding: 0; font-size: inherit; overflow-wrap: anywhere;
    }
    .gz-user-profile .user-profile-card__title {
      text-align: left; font-size: 14px; font-weight: 400; overflow-wrap: anywhere;
    }
    .gz-user-profile .user-profile-card__buttons {
      display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 8px 16px;
      margin-top: 28px;
    }
    .gz-user-profile .user-profile-card__buttons:not(:has(a, button)) { display: none; }
    .gz-user-profile .user-profile-card__user-buttons,
    .gz-user-profile .user-profile-card__staff-buttons {
      display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 8px 16px;
      min-width: 0;
    }
    .gz-user-profile :is(.user-profile-card__user-buttons, .user-profile-card__staff-buttons):empty { display: none; }
    .gz-user-profile .user-profile-card__section-button--info {
      margin: 0; padding: 4px 0; border: 0; border-radius: 0; box-shadow: none;
      background: transparent; color: var(--gz-profile-fg); backdrop-filter: none;
      font-size: 14px; font-weight: 400; line-height: 1.5;
    }
    .gz-user-profile .user-profile-card__section-button--info:hover {
      background: transparent; text-decoration: underline; text-underline-offset: 3px;
    }
    .gz-profile-layout { display: grid; grid-template-columns: minmax(0, 1fr) 290px; gap: 24px; align-items: start; }
    .gz-profile-content, .gz-profile-sidebar { min-width: 0; display: flex; flex-direction: column; gap: 22px; }
    .gz-user-profile .user-profile__section { display: flex; flex-direction: column; gap: 22px; margin: 0; }
    .gz-user-profile .panelV2 { margin: 0; border: 0; border-radius: 0; box-shadow: none; }
    .gz-profile-content > .panelV2,
    .gz-profile-content .user-profile__section > div { background: transparent; min-width: 0; }
    .gz-user-profile .panel__heading,
    .gz-user-profile .user-profile-card__meta-title {
      display: block; margin: 0; padding: 0 0 7px; border: 0;
      border-bottom: 1px solid var(--gz-profile-line); border-radius: 0;
      background: transparent; color: var(--gz-profile-fg); font-size: 13px; font-weight: 500;
    }
    .gz-user-profile .panel__body { padding: 12px 0; font-size: 13px; line-height: 1.6; }
    .gz-profile-content .panel__body { background: transparent; border-radius: 0; }
    .gz-profile-sidebar { gap: 16px; }
    .gz-profile-sidebar > .panelV2 { background: transparent; }
    .gz-user-profile .user-profile-card__banner {
      display: flex; flex-direction: column; align-items: stretch; gap: 16px;
      padding: 0; background: none !important;
    }
    .gz-user-profile .user-profile-card__left-block,
    .gz-user-profile .user-profile-card__meta,
    .gz-profile-sidebar .user-profile__section > div {
      display: block; min-width: 0; padding: 14px; margin: 0;
      border: 1px solid var(--gz-profile-line); border-radius: 0;
      background: var(--gz-profile-bg) !important;
      backdrop-filter: none; -webkit-backdrop-filter: none; font-size: 12px;
    }
    .gz-user-profile .user-profile-card__avater-username {
      display: flex; flex-direction: column; align-items: center; gap: 10px;
    }
    .gz-user-profile .user-profile-card__avatar {
      width: auto; height: auto; max-width: 160px; max-height: 180px; border-radius: 0; object-fit: contain;
    }
    .gz-user-profile .user-profile-card__avater-username > .user-profile-card { color: var(--gz-profile-muted); font-size: 12px; }
    .gz-user-profile .user-profile-card__internal:empty { display: none; }
    .gz-user-profile .user-profile-card__right-block { display: flex; flex-direction: column; gap: 16px; }
    .gz-user-profile .user-profile-card__meta:has(.user-profile-card__meta-item-subrow:nth-child(3)) { order: -1; }
    .gz-user-profile .user-profile-card__meta-title { margin-bottom: 8px; color: var(--color-light-blue, #64b5f6); }
    .gz-user-profile .user-profile-card__meta-title::before { display: none; }
    .gz-user-profile .user-profile-card__meta-title > i { display: none; }
    .gz-user-profile .user-profile-card__meta-list,
    .gz-user-profile .user-profile-card__meta-list-rows,
    .gz-user-profile .user-profile-card__meta-item-subrow {
      display: block; width: 100%; padding: 0; margin: 0; border: 0;
    }
    .gz-user-profile .user-profile-card__meta-item-subrow + .user-profile-card__meta-item-subrow {
      margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--gz-profile-line);
    }
    .gz-user-profile .user-profile-card__meta-item {
      display: block; padding: 2px 0; text-align: left; color: var(--gz-profile-fg);
      font-size: 12px; line-height: 1.5; overflow-wrap: anywhere;
    }
    .gz-user-profile .user-profile-card__meta-item-title { color: var(--gz-profile-muted); font-weight: 400; }
    .gz-user-profile .user-profile-card__meta-item-title::after { content: ": "; }
    .gz-user-profile .user-profile-card__meta-item-title > i { display: none; }
    .gz-user-profile .user-profile-card__meta-item-value { font-weight: 400; font-variant-numeric: tabular-nums; }
    .gz-user-profile .user-profile-card__meta-item-value :is(sup, sub) { font-size: 9px; }
    .gz-user-profile .user-profile-card__meta-item-value:has(>a):hover { transform: none; }
    .gz-profile-sidebar .user-profile__section { gap: 16px; }
    .gz-profile-sidebar .panel__heading { color: var(--color-light-blue, #64b5f6); }
    .gz-user-profile .key-value { padding: 8px 0 0; margin: 0; background: transparent; }
    .gz-user-profile .key-value__group { display: block; padding: 2px 0; }
    .gz-user-profile .key-value :is(dt, dd) { display: inline; font-size: 12px; line-height: 1.5; font-weight: 400; }
    .gz-user-profile .key-value dt { color: var(--gz-profile-muted); }
    .gz-user-profile .key-value dt::after { content: ": "; }
    .gz-user-profile .key-value dd { margin: 0; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
    .gz-user-profile :is(.user-profile__column--badges, .user-profile__column--achievements, .user-profile__column--followers) .panel__body {
      display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding-block: 18px;
    }
    .gz-user-profile .user-profile__column--badges .panel__body img { height: 64px; width: auto; max-width: 100%; object-fit: contain; }
    .gz-user-profile .user-profile__column--achievements .panel__body img { height: 48px; width: auto; max-width: 100%; object-fit: contain; }
    .gz-user-profile .user-profile__column--followers .panel__body img { width: 40px; height: 40px; object-fit: cover; border-radius: 2px; }
    .gz-profile-content .data-table-wrapper { max-width: 100%; overflow-x: auto; }
    .gz-profile-content .data-table { font-size: 12px; }
    .gz-user-profile :is(a, button):focus-visible { outline: 2px solid var(--color-light-blue, #64b5f6); outline-offset: 3px; }
    @media (max-width: 900px) {
      .gz-user-profile > article { padding: 18px 12px; }
      .gz-profile-layout { grid-template-columns: minmax(0, 1fr) 250px; gap: 18px; }
    }
    @media (max-width: 650px) {
      .gz-profile-layout { display: flex; flex-direction: column; gap: 24px; }
      .gz-profile-content, .gz-profile-sidebar { width: 100%; }
      .gz-profile-heading { font-size: 20px; }
    }
  `;
