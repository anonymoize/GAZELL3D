# GAZELL3D Userscript

GAZELL3D is a Tampermonkey/Greasemonkey userscript that reimagines UNIT3D-based torrent pages for readability. It adds a two-column layout, richer metadata presentation, cleaner torrent naming, and minor quality-of-life tweaks.

## Installation

1. Install a userscript manager such as Tampermonkey (Chrome/Edge) or Violentmonkey (Firefox).
2. Create a new userscript and paste the contents of `GAZELL3D.js`.
3. Save and enable the script. It runs automatically on `https://{UNIT3D SITE}/torrents/*` and `https://{UNIT3D SITE}/torrents/*`.

## Features

### Layout & Styling

- Injects a comprehensive stylesheet that builds a responsive `.gz-similar-layout` with left/right columns and a “meta card” presentation on both the “similar torrents” and single torrent pages.
- Moves the entire metadata block (`section.meta`) into the right column, reordering poster, tags, IDs, buttons, description, and chip sections (Cast, Crew, Extra Information) into a clean card with dividers.
- Converts torrent action buttons (`menu.torrent__buttons`) into inline button rows with consistent spacing and placement beneath the tags list when present.
- Removes the redundant search box from the similar torrents page to reduce clutter.

### Smarter Similar-Torrent Lists

- Builds a grouped left-column stack containing the torrent group table plus optional “Requests”, “Playlists”, “Collection”, and “Also downloaded” panels (when available).
- Optionally removes noisy icon columns from the similar torrent tables via a MutationObserver (`CONFIG.removeTorrentIcons`).
- Adds `gazellify()`, a torrent renaming pass that rewrites grouped torrent names using parsed components (resolution, source, service, codec, bit-depth, HDR, Atmos, cut info, season/episode, language, scene group, etc.). Toggle this via `CONFIG.enableGazellify`.
- The rename order is explicit: `{Video Codec} / [Bit Depth] / {Resolution} / [Country] / [Service] / {Source} / [S##E##] / [Language|Dual-Audio|Dubbed] / {Audio Codec + Channels} / [Atmos] / [HDR|SDR] / [Hybrid] / [Cut] / [REPACK#/PROPER#] / {Release Group}`. Optional brackets only render when detected so scene tags remain compact but informative, and DVD sources include specific multi-disc or region info (e.g., `NTSC 3xDVD9 / 5xDVD5`).
- Includes robust parsing helpers for codecs (video/audio), HDR variants, scene groups, streaming service tags, languages, and country codes to normalize the formatted titles.

### Torrent Detail Page Enhancements

- Rebuilds the individual torrent page into the same two-column layout, keeping the torrent body content on the left and moving a refined meta card to the right.
- Collapses the torrent button list into inline buttons, preserving only the `.form__group` entries so tag sections and other markup remain untouched.

### General Utilities

- Provides lightweight DOM helpers (`$`, `$$`, `create`, `appendAll`, `removeNode`) and normalized text utilities to keep DOM mutations consistent.
- Uses a shared mutation observer to wait for dynamic page loads and to re-run once the target structure is rendered.
- Exposes concise configuration at the top of the script so future tweaks (e.g., disabling gazellify or icon stripping) only require flipping a boolean.

## Configuration

At the top of `GAZELL3D.js`, adjust the `CONFIG` object:

```js
const CONFIG = Object.freeze({
  removeTorrentIcons: true, // strip the “torrent-icons” column from similar lists
  enableGazellify: true,    // reformat torrent names with parsed metadata
});
```

Set either flag to `false` to disable the associated feature without editing the rest of the code.

## Compatibility Notes

- The script targets UNIT3D markup (class names such as `.torrent__tags`, `.panelV2`, `.meta__chip-container`). Significant theme changes on the tracker may require selector updates in `SELECTORS`.
- It uses `GM_addStyle` when available, falling back to injecting a `<style>` tag otherwise, so no additional dependencies are required.
