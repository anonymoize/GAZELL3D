  // Preserve the original host DOM while projecting icons into the visible layout.
  const createLiveTorrentIcons = () => {
    const projections = new Map();
    let lifetimeObserver = null;
    const seadexMarker = (node) => node.nodeType === 1
      ? (node.matches('[data-seadex]') ? node : node.querySelector('[data-seadex]')) : null;
    const keep = (node, removeIcons) => {
      if (node.nodeType !== 1) return false;
      if (seadexMarker(node)) return true;
      if (node.matches('.fa-comment-alt-plus, .torrent-icons__comments')) return false;
      return !removeIcons || node.matches('.torrent-icons__torrent-trump, .torrent-icons__personal-release, .torrent-icons__internal');
    };
    const filter = (source, removeIcons = true) => {
      Array.from(source.childNodes).forEach((node) => {
        if (!keep(node, removeIcons)) node.remove();
      });
    };
    const project = ({ sourceRoot, targetRoot, entries, kind = 'icons', removeIcons = true }) => {
      if (projections.has(targetRoot)) return projections.get(targetRoot);
      const clones = new Map();
      const sync = (entry) => {
        let copied = clones.get(entry);
        if (!copied) {
          copied = new Map();
          clones.set(entry, copied);
          entry.target.replaceChildren();
        }
        // Ordinary icons stay in the source; Seadex nodes move with their handlers.
        for (const [original, clone] of copied) {
          if (original.parentNode !== entry.source || (kind === 'icons' && !keep(original, removeIcons))) {
            clone.remove();
            copied.delete(original);
          }
        }
        Array.from(entry.source.children).forEach((node) => {
          if (kind === 'icons' && !keep(node, removeIcons)) return;
          if (seadexMarker(node)) {
            copied.get(node)?.remove();
            copied.delete(node);
            entry.target.appendChild(node);
          } else {
            const copy = node.cloneNode(true);
            if (copied.has(node)) copied.get(node).replaceWith(copy);
            else entry.target.appendChild(copy);
            copied.set(node, copy);
          }
        });
      };
      entries.forEach(sync);
      const observer = new MutationObserver((mutations) => {
        entries.forEach((entry) => {
          if (mutations.some((mutation) => entry.source === mutation.target || entry.source.contains(mutation.target))) sync(entry);
        });
      });
      observer.observe(sourceRoot, { childList: true, subtree: true, attributes: true, characterData: true });
      const dispose = () => {
        observer.disconnect();
        projections.delete(targetRoot);
        if (!projections.size && lifetimeObserver) {
          lifetimeObserver.disconnect();
          lifetimeObserver = null;
        }
      };
      projections.set(targetRoot, dispose);
      if (!lifetimeObserver) {
        lifetimeObserver = new MutationObserver(() => {
          for (const [target, disconnect] of projections) {
            if (!target.isConnected) disconnect();
          }
        });
        lifetimeObserver.observe(document.body, { childList: true, subtree: true });
      }
      return dispose;
    };
    return Object.freeze({ filter, project });
  };

  const liveTorrentIcons = createLiveTorrentIcons();
