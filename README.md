## Development

`GAZELL3D.user.js` is generated from the smaller source files in `src/`.

After editing any source file, rebuild the installable userscript:

```bash
node scripts/build-userscript.mjs
```

Install the test dependencies with `npm ci`, then run `npm test`. Tests rebuild
the userscript and exercise its modules and page boot behavior in a local DOM;
they do not make live requests. The test dependency requires Node 22.22.2+ on
the 22.x line, 24.15.0+ on the 24.x line, or Node 26+.

## Module ownership

The build still concatenates numbered source files into one userscript. These
modules keep their state and supporting functions private:

| Module | Location | Owns |
| --- | --- | --- |
| Torrent dropdown | `src/09-dropdowns-and-reporting.js` | Click handling, pending rows, close/reopen, errors and final replacement; search and grouped layouts supply acquisition and row geometry. |
| Torrent retrieval | `src/07-torrent-api.js` | Credential-scoped cache identity, concurrent requests, retries, endpoint pagination and report submission/invalidation. |
| Torrent naming | `src/04-name-formatting.js` | Catalog snapshots, derived release rules, sequence and formatting; callers explicitly choose whether to hide season/episode text. |
| Live torrent icons | `src/03-live-torrent-icons.js` | Shared filtering, source-to-visible projection, Seadex node identity and observer disposal. Hidden host markup remains in place. |
| Media summary | `src/08-media-summaries.js` | MediaInfo/BDInfo selection, private parsers, shared display and unchanged raw text. |

Failed retrievals can retry. Credential changes isolate cached data, and a
successful trump report invalidates the affected report cache. Retrieval rejects
responses that would exceed the existing 20-page limit rather than caching a
partial result. A remote naming catalog outage falls back to built-in naming
rules while leaving page enhancements and settings available.

Tests cover request outcomes, stale dropdown loads, naming context, media text,
late Seadex icons and representative search/grouped/detail pages. They do not
replace a visual check in a userscript manager on the live site.
