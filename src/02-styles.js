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

    .torrent-search--list__name:hover .gz-search-title__heading,
    .torrent-search--list__name:hover .gz-search-title__subheading {
      opacity: 1;
    }

    /* Position context for the hidden original text span (for Seadex compatibility) */
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
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      font-size: 0.9em;
      color: rgba(255, 255, 255, 0.85);
    }

    .gz-details-section {
      min-width: 0;
    }

    .gz-trump-report-alert-host {
      grid-column: 1 / -1;
      min-width: 0;
    }

    .gz-trump-report-alert-host[hidden] {
      display: none !important;
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
      margin: 0 0 8px;
      font-size: 0.78em;
      line-height: 1.2;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.52);
      font-weight: 700;
    }

    .gz-details-grid {
      display: grid;
      gap: 6px;
      margin: 0;
    }

    .gz-details-row {
      display: grid;
      grid-template-columns: minmax(92px, 0.8fr) minmax(0, 1fr);
      gap: 10px;
      align-items: baseline;
      min-width: 0;
    }

    .gz-details-label {
      color: rgba(255, 255, 255, 0.55);
      font-weight: 600;
      min-width: 0;
    }

    .gz-details-value {
      margin: 0;
      min-width: 0;
      overflow-wrap: anywhere;
      color: rgba(255, 255, 255, 0.9);
    }

    .gz-details-link {
      color: #eaeeecff;
      text-decoration: none;
    }

    .gz-details-link:hover {
      text-decoration: underline;
    }

    .gz-details-value--flag {
      justify-self: start;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 0.9em;
    }

    .gz-details-value--active {
      color: #dff7e8;
      background: rgba(70, 160, 105, 0.22);
    }

    .gz-details-value--inactive {
      color: rgba(255, 255, 255, 0.58);
      background: rgba(255, 255, 255, 0.06);
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
    }

    .gz-dropdown-mediainfo {
    }

    .gz-dropdown-filelist table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85em;
    }

    .gz-dropdown-filelist th,
    .gz-dropdown-filelist td {
      padding: 6px 10px;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .gz-dropdown-filelist th {
      color: rgba(255, 255, 255, 0.6);
      font-weight: 600;
    }

    .gz-dropdown-filelist td:last-child {
      text-align: right;
      white-space: nowrap;
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
      margin-bottom: 10px;
      padding: 8px 12px;
      background: rgba(118, 219, 166, 0.06);
      border-radius: 4px;
      font-size: 0.9em;
      color: rgba(255, 255, 255, 0.8);
    }

    .gz-filelist-root-info strong {
      color: rgba(118, 219, 166, 0.9);
    }

    .gz-filelist-folder-row {
      cursor: pointer;
    }

    .gz-filelist-folder-row:hover {
      background: rgba(255, 255, 255, 0.03);
    }

    .gz-folder-toggle {
      display: inline-block;
      width: 12px;
      margin-right: 4px;
      font-size: 0.8em;
      color: rgba(255, 255, 255, 0.6);
      transition: transform 0.15s ease;
    }

    .gz-folder-icon {
      margin-right: 6px;
    }

    .gz-folder-name {
      font-weight: 600;
      color: rgba(255, 255, 255, 0.95);
    }

    .gz-folder-count {
      font-weight: 400;
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.9em;
      margin-left: 6px;
    }

    .gz-filelist-file-row td:first-child {
      color: rgba(255, 255, 255, 0.85);
    }

    .gz-tree-indent {
      display: inline-block !important;
      flex-shrink: 0;
      height: 1em;
      vertical-align: middle;
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

    /* Config Button (Footer) */
    .gz-config-link {
      cursor: pointer;
      color: inherit;
      opacity: 0.8;
      transition: opacity 0.15s ease;
      font-size: 0.9em;
      margin-top: 8px;
      display: inline-block;
    }

    .gz-config-link:hover {
      opacity: 1;
      text-decoration: underline;
    }

    /* Config Modal Styles */
    .gz-config-overlay {
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

    .gz-config-modal {
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

    .gz-config-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .gz-config-title {
      font-size: 1.15em;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }

    .gz-config-close {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.6);
      font-size: 1.5em;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      transition: color 0.15s ease;
    }

    .gz-config-close:hover {
      color: #fff;
    }

    .gz-config-section {
      margin-bottom: 20px;
    }

    .gz-config-section-title {
      font-size: 0.85em;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 12px;
    }

    .gz-config-field {
      margin-bottom: 14px;
    }

    .gz-config-field:last-child {
      margin-bottom: 0;
    }

    .gz-config-label {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      color: rgba(255, 255, 255, 0.9);
      font-size: 0.9em;
    }

    .gz-config-label input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: rgba(118, 219, 166, 0.9);
    }

    .gz-config-input-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .gz-config-input-label {
      color: rgba(255, 255, 255, 0.9);
      font-size: 0.9em;
    }

    .gz-config-input {
      padding: 10px 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 6px;
      color: #fff;
      font-size: 0.9em;
      font-family: inherit;
      transition: border-color 0.15s ease, background 0.15s ease;
    }

    .gz-config-input:focus {
      outline: none;
      border-color: rgba(118, 219, 166, 0.6);
      background: rgba(255, 255, 255, 0.08);
    }

    .gz-config-input::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }

    .gz-config-buttons {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .gz-config-btn {
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 0.9em;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      border: none;
    }

    .gz-config-btn--cancel {
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.8);
    }

    .gz-config-btn--cancel:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
    }

    .gz-config-btn--save {
      background: rgba(118, 219, 166, 0.85);
      color: rgb(20, 20, 25);
    }

    .gz-config-btn--save:hover {
      background: rgba(118, 219, 166, 1);
    }

    /* Sequence Ordering (Drag & Drop) */
    .gz-sequence-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 8px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      max-height: 280px;
      overflow-y: auto;
    }

    .gz-sequence-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      cursor: grab;
      transition: all 0.15s ease;
      user-select: none;
    }

    .gz-sequence-item:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.15);
    }

    .gz-sequence-item:active {
      cursor: grabbing;
    }

    .gz-sequence-item.dragging {
      opacity: 0.5;
      background: rgba(118, 219, 166, 0.1);
      border-color: rgba(118, 219, 166, 0.3);
    }

    .gz-sequence-item.drag-over {
      border-color: rgba(118, 219, 166, 0.6);
      background: rgba(118, 219, 166, 0.15);
    }

    .gz-sequence-handle {
      display: flex;
      flex-direction: column;
      gap: 2px;
      opacity: 0.5;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.8em;
    }

    .gz-sequence-handle::before {
      content: '⋮⋮';
      letter-spacing: -2px;
    }

    .gz-sequence-label {
      flex: 1;
      font-size: 0.9em;
      color: rgba(255, 255, 255, 0.9);
    }

    .gz-sequence-key {
      font-size: 0.75em;
      color: rgba(255, 255, 255, 0.4);
      font-family: monospace;
    }

    .gz-sequence-reset {
      margin-top: 8px;
      padding: 6px 12px;
      font-size: 0.8em;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      color: rgba(255, 255, 255, 0.6);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .gz-sequence-reset:hover {
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.9);
    }

    .gz-sequence-toggle {
      width: 16px;
      height: 16px;
      accent-color: rgba(118, 219, 166, 0.9);
      cursor: pointer;
      flex-shrink: 0;
    }

    .gz-sequence-item.disabled {
      opacity: 0.5;
      background: rgba(255, 255, 255, 0.02);
    }

    .gz-sequence-item.disabled .gz-sequence-label {
      text-decoration: line-through;
      color: rgba(255, 255, 255, 0.5);
    }

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
  `;
