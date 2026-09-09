## Settings

Open **GAZELL3D Settings** in the site footer. The menu follows the active
Aither theme and groups preferences into layout, torrent names, component colors,
and API connection. Name and color changes update a sample preview; components
can be reordered by dragging or with the arrow buttons.

**Save & reload** applies your changes. Cancel, Escape, or clicking outside the
menu discards the draft. Color and component-order resets affect only the draft
until saved. Existing stored preferences remain compatible. Font size accepts
whole percentages from 50 to 200. API keys stay masked until you choose Show;
saving a key does not verify the connection.

## Development

`GAZELL3D.user.js` is generated from the smaller source files in `src/`.

The build embeds the naming catalog from `config.json` into the userscript.
Keep `config.json` published at its existing path for older installations that
still fetch it remotely. Catalog changes ship with userscript updates.

After editing any source file or `config.json`, rebuild the installable userscript:

```bash
node scripts/build-userscript.mjs
```

Install the test dependencies with `npm ci`, then run `npm test`. Tests rebuild
the userscript and exercise its modules and page boot behavior in a local DOM;
they do not make live requests. The test dependency requires Node 22.22.2+ on
the 22.x line, 24.15.0+ on the 24.x line, or Node 26+.

## Module ownership

The numbered source files share one userscript closure rather than ES-module
imports. Factories provide private state for naming, retrieval, live icons, and
dropdown attachments; page builders connect those interfaces to the host DOM.

| Location | Owns |
| --- | --- |
| `src/00-userscript-meta.js` | Installation metadata, supported URL patterns, version, userscript grants, update URLs. |
| `src/01-config-and-storage.js` | Stored preferences/API key/sequence, defaults, page selectors, GM JSON transport. |
| `src/02-styles.js` | Injected stylesheet: layouts, user groups, names/tooltips, dropdowns, media, reports, settings, BBCode/comparisons. |
| `src/03-live-torrent-icons.js` | Filtering and source-to-visible projection, Seadex node identity, observer disposal. |
| `src/03-runtime-and-dom.js` | DOM/text helpers, original-title preservation, component coloring, tooltip theme and events, readiness/style injection. |
| `src/04-name-formatting.js` | Naming catalog snapshots, release parsing, ordered components, search heading/subtitle derivation. |
| `src/05-page-enhancements.js` | Detail/search naming, search dropdown wiring and observers, user-group requirements, original-table decorations/actions. |
| `src/06-meta-panels.js` | Two-column shell and metadata panels; moves poster, links, synopsis, cast and crew into their destinations. |
| `src/07-torrent-api.js` | Credential-scoped cache and pending requests, torrent/report acquisition, pagination, report submission; shared URL/date/size helpers. |
| `src/08-content-parsers.js` | Escaped BBCode rendering, links/images/video, comparisons, nested tags and block spacing. |
| `src/08-media-summaries.js` | MediaInfo/BDInfo selection, parsing, summary rendering and unchanged raw text. |
| `src/09-dropdowns-and-reporting.js` | Dropdown lifecycle and tabs, details/report alerts, file tree, active-panel copying, report registry/form and toasts. |
| `src/10-page-layouts.js` | Similar/detail page assembly, movie and TV table grouping, actions, grouped dropdown wiring and icon projection. |
| `src/11-settings-and-boot.js` | Settings draft/dialog, footer entry point, naming initialization, zoom and page dispatch. |

## Runtime flow

The build injects `config.json` as `NAMING_CATALOG` before the sorted source files.
Configuration loads through synchronous `GM_getValue` during script evaluation.
`ready(initApp)` initializes naming with the bundled catalog, injects styles and
optional tooltips, installs the settings entry point, then calls `initPage`.
If page setup is not ready, a body observer retries until it succeeds.

Page dispatch uses the selectors in `01-config-and-storage.js`:

- **Similar/grouped torrents:** format names, then either build the Gazelle table
  or expand and enhance the original tables; optionally move metadata into columns.
  Grouped dropdowns acquire a TMDB group and select the clicked torrent from it.
- **Torrent detail:** optionally format the release title, then assemble columns
  while keeping the original torrent tags discoverable by Seadex.
- **Torrent search (including Mediahub grouped view):** enhance each release in
  place and observe later results. The Gazelle table setting gives Mediahub compact
  season tables and a short initial release list; the side layout setting adds a
  poster rail. Original rows, controls and group associations remain intact.
  Dropdowns fetch individual torrents by ID; this path retains the individual-torrent retrieval flow.
- **User-group requirements:** parse the site's class/requirement/perk markup,
  consolidate shared entry classes into Main Path, and render Main Path and
  Uploader Path side by side, with other groups outside the path columns.

Dropdown rendering adds existing-report information asynchronously. Description
comparisons and embedded code-copy controls emit attributes for Aither's Alpine
runtime; jsdom does not execute those components. The dropdown's own Copy button
uses the browser clipboard API and the active panel's stored raw content.

Failed retrievals can retry. Credential changes isolate cached data, and a
successful trump report invalidates the affected report cache. Retrieval rejects
responses that would exceed the existing 20-page limit rather than caching a
partial result. The naming catalog is bundled at build time, so page initialization does not
wait for a remote catalog request.

## Verification

`tests/harness.mjs` evaluates the sorted source files without the boot module,
exposes selected factory interfaces, and rejects unexpected network access.
Use it for focused module behavior and deferred-promise race tests. The boot and
settings tests evaluate the generated userscript with stubbed GM APIs, exercising
build integration as well as behavior. Close each jsdom window during test cleanup
so observers and timers do not outlive the test.

| Test file | Covers |
| --- | --- |
| `tests/retrieval.test.mjs` | Transport errors, request deduplication, credential changes, pagination, cache invalidation. |
| `tests/dropdowns.test.mjs` | Open/close/reopen races, removed rows, detach, errors/retry and modified clicks. |
| `tests/icons.test.mjs` | Initial/late Seadex identity, ordinary-icon cloning/filtering and observer disposal. |
| `tests/naming-and-media.test.mjs` | Explicit naming context, catalog snapshots, release-group rules, raw media preservation and text rendering. |
| `tests/boot.test.mjs` | Built-script search/grouped/detail integration and late icon handling. |
| `tests/settings.test.mjs` | Draft isolation, focus, preview/reordering, validation, persistence and storage failure. |
| `tests/group-requirements.test.mjs` | Split path ownership, shared-class deduplication, static groups, collapsed/expanded perks, safe text rendering, and idempotent rendering. |

There are no dedicated tests yet for full TV table grouping, BBCode interactions, file-tree interactions, or the report
form UI. Add focused regression coverage when changing those behaviors. Existing
DOM tests do not replace browser checks for CSS, Alpine interactions, clipboard
permissions, or integration with the live site and other userscripts.
