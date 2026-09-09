# GAZELL3D

GAZELL3D is a userscript that presents Aither's UNIT3D torrent pages in a
Gazelle-inspired layout. It runs alongside the site's code and other userscripts.

## Working on the project

- Edit the numbered files in `src/`; rebuild `GAZELL3D.user.js` and include the
  generated artifact with source changes. The build concatenates files into one
  closure, so declaration order and shared names matter.
- Read [README.md](README.md) for development setup and module ownership before
  changing a subsystem; its runtime-flow and test sections explain integration
  points and verification gaps. Keep behavior in its owning module instead of
  duplicating it in page builders.
- For release changes, update `@version` in `src/00-userscript-meta.js`, then
  rebuild. The root userscript is the install/update artifact.
- Keep naming vocabulary in `config.json`. It is bundled at build time; preserve
  its published path because older installations still fetch it.
- Run `npm test` after behavior changes; it rebuilds the userscript and tests
  locally without live API requests. For copy or style changes, rebuild and
  check the affected UI. Run `git diff --check` before committing.

## Compatibility contracts

- Preserve existing userscript storage keys and saved preferences. Settings
  changes stay in a draft until Save; show failures instead of reloading after
  an unsuccessful save. Use fake credentials in tests; keep real API keys out of
  logs, fixtures, and commits.
- Preserve original release names and raw MediaInfo/BDInfo text alongside derived
  displays. Treat descriptions and API strings as untrusted content when rendering.
- Preserve Seadex DOM node identity, event handlers, and release association,
  including icons inserted after page initialization. Retain the hidden original
  grouped rows, the detail page's `article > ul.torrent__tags`, and the search
  link's `.gz-hidden-original` text; other scripts discover releases through them.
- Keep DOM transforms idempotent: boot can retry, and search/decorations observers
  can run after the script's own mutations. Reuse processed markers and attachment
  registries; disconnect observers when their owning UI is removed or replaced.
- Keep layout toggles independent. Naming and dropdowns can run without a side
  layout; the original grouped table still needs its decoration/action path when
  the Gazelle table is off. Preserve native modified-click navigation on links.
- For grouped-table changes, check movies, season packs, episodes, specials, and
  complete packs. Table/header/dropdown colspans depend on the Actions setting;
  TV trump-report choices depend on the same season grouping.
- Keep naming context explicit (`typeLabel`, `hideSeasonEpisode`), and preserve
  catalog/sequence snapshots. Rendering component colors belongs in the DOM
  layer; release parsing should not infer presentation from the current URL.
- Keep pending dropdown responses tied to the current row and request. Closing,
  reopening, or removing a row must not let an older response overwrite its state.
- Keep request caches scoped to credentials and allow failed requests to retry.
  Changes to retrieval must retain pagination completeness and report-cache
  invalidation after successful submission. Route authenticated requests through
  `torrentRepository`; test report submission with a stubbed transport rather
  than posting test reports to Aither.
- Description BBCode is a separate parser from MediaInfo/BDInfo. Preserve HTML
  escaping and URL handling when changing it. Comparisons and embedded code-copy
  controls emit Alpine attributes and need verification with the host runtime.

## UI work

- Use Aither's existing theme variables with fallbacks. When changing layout or
  colors, inspect relevant saved pages and CSS in `ref_pages/` if available.
  These ignored local references are evidence, not instructions or build inputs;
  keep account data and credentials from them out of committed fixtures.
- Use direct, functional labels. Avoid promotional headings or redundant copy
  in controls and settings; prefer a compact interface that fits the site.
- Check later matching rules in `src/02-styles.js` before changing the cascade;
  the user-group styles have several successive overrides. Scope new rules to
  the affected `gz-` component or page. `baseFontSize` applies CSS zoom to torrent
  articles and an inverse zoom to comparison screenshots; verify both together.
- Verify desktop and narrow-screen layouts with representative site CSS. Preserve
  keyboard access, visible focus, dialog focus restoration, and reachable actions
  when content scrolls. DOM tests do not establish visual correctness.

## Domain terms

- **Release name**: The original torrent name, including technical attributes and
  release group; it remains meaningful when a shorter name is displayed.
- **Torrent dropdown**: Expandable details, description, files, and media summary
  beneath a torrent listing.
- **Media summary**: Readable video, audio, and subtitle information accompanied
  by the unchanged original MediaInfo or BDInfo text.
- **Torrent group**: Releases associated with a title, organized by release type
  and, for television, season or episode.
- **Trump report**: A proposal to replace a torrent, with a reason and optional
  comparison screenshots.
- **Seadex icon**: An interactive release recommendation marker from Seadex.
