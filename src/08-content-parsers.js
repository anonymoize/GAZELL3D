  const handleBlockElementSpacing = (sourceObj, tagStartIndex, tagStopIndex) => {
    let source = sourceObj.source;
    let index = sourceObj.index;

    // Remove up to 2 line breaks AFTER the tag
    for (let i = 0; i < 2; i++) {
      let maxIdx = source.length - 1;
      if (tagStopIndex + 2 <= maxIdx && source.substring(tagStopIndex + 1, tagStopIndex + 3) === "\r\n") {
        source = source.substring(0, tagStopIndex + 1) + source.substring(tagStopIndex + 3);
      } else if (tagStopIndex + 1 <= maxIdx && source.charAt(tagStopIndex + 1) === "\n") {
        source = source.substring(0, tagStopIndex + 1) + source.substring(tagStopIndex + 2);
      }
    }

    // Remove up to 2 line breaks BEFORE the tag
    if (tagStartIndex >= 2 && source.substring(tagStartIndex - 2, tagStartIndex) === "\r\n") {
      source = source.substring(0, tagStartIndex - 2) + source.substring(tagStartIndex);
      index -= 2;
    } else if (tagStartIndex >= 1 && source.charAt(tagStartIndex - 1) === "\n") {
      source = source.substring(0, tagStartIndex - 1) + source.substring(tagStartIndex);
      index -= 1;
    }

    sourceObj.source = source;
    sourceObj.index = index;
  };

  const parseBBCode = (text) => {
    if (!text) return '';
    let source = text;

    // Escape HTML first
    source = source.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    // Void elements
    source = source.replace(/\[\*\]/g, '<li>');
    source = source.replace(/\[hr\]/gi, '<hr>');

    // Links & Images
    source = source.replace(/\[url](.*?)\[\/url]/gi, (m, p1) => `<a href="${sanitizeUrl(p1)}">${sanitizeUrl(p1)}</a>`);
    source = source.replace(/\[url=(.*?)](.*?)\[\/url]/gi, (m, p1, p2) => `<a href="${sanitizeUrl(p1)}">${p2}</a>`);
    source = source.replace(/\[img](.*?)\[\/img]/gi, (m, p1) => `<img src="${sanitizeUrl(p1)}" loading="lazy" class="img-responsive" style="display: inline !important;">`);
    source = source.replace(/\[img width=(\d+)](.*?)\[\/img]/gi, (m, p1, p2) => `<img src="${sanitizeUrl(p2)}" loading="lazy" width="${p1}px">`);
    source = source.replace(/\[img=(\d+)(?:x\d+)?](.*?)\[\/img]/gi, (m, p1, p2) => `<img src="${sanitizeUrl(p2)}" loading="lazy" width="${p1}px">`);

    // Youtube & Video
    const videoIframe = (m, p1) => `<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/${p1}?rel=0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    source = source.replace(/\[youtube]([a-z0-9_-]{11})\[\/youtube]/gi, videoIframe);
    source = source.replace(/\[video]([a-z0-9_-]{11})\[\/video]/gi, videoIframe);
    source = source.replace(/\[video=&quot;youtube&quot;]([a-z0-9_-]{11})\[\/video]/gi, videoIframe);

    // Comparisons (Basic fallback for JS)
    source = source.replace(/\[comparison=(.*?)]\s*(.*?)\s*\[\/comparison]/gis, (m, p1, p2) => {
      const comparates = p1.split(/\s*,\s*/).filter(c => c.trim().length > 0);
      const urls = p2.split(/\s*(?:,|\s)\s*/).filter(u => u.trim().length > 0);

      if (comparates.length === 0 || urls.length === 0) return 'Broken comparison';
      const validatedUrls = urls.map(u => sanitizeUrl(u, true));

      const chunkedUrls = [];
      for (let i = 0; i < validatedUrls.length; i += comparates.length) {
        chunkedUrls.push(validatedUrls.slice(i, i + comparates.length));
      }

      let html = `<div class="comparison" x-data="{ show: false }">`;
      html += `<div class="comparison__text">`;
      comparates.forEach((comp, idx) => {
        html += (idx === comparates.length - 1) ? `${comp}:` : `${comp} <span class="comparison__divider">vs</span> `;
      });
      html += ` <button class="comparison__button" x-on:click.prevent="show = true; $nextTick(() => $refs.screenshots.focus())" x-on:keydown.escape.window="show = false">Show</button>`;
      html += `</div>`;

      html += `<ul class="comparison__screenshots" tabindex="-1" x-ref="screenshots" x-show="show" x-cloak `;
      html += `x-on:click="show = false" `;
      html += `x-on:keydown.down.window="if (show) { $event.preventDefault(); $event.stopPropagation(); $el.scrollBy(0, $el.getElementsByTagName('li')[0].offsetHeight); }" `;
      html += `x-on:keydown.up.window="if (show) { $event.preventDefault(); $event.stopPropagation(); $el.scrollBy(0, -1 * $el.getElementsByTagName('li')[0].offsetHeight); }">`;

      chunkedUrls.forEach((row, rowIdx) => {
        html += `<li>`;
        html += `<ul class="comparison__row" x-data="{ screen: 1 }" `;
        html += `x-on:keydown.window="if (isFinite($event.key) && 1 <= $event.key && $event.key <= ${comparates.length}) { screen = $event.key; }" `;
        html += `x-on:keydown.left.window="if (show) { $event.preventDefault(); $event.stopPropagation(); screen = screen == 1 ? ${comparates.length} : screen - 1; }" `;
        html += `x-on:keydown.right.window="if (show) { $event.preventDefault(); $event.stopPropagation(); screen = screen == ${comparates.length} ? 1 : screen + 1; }" `;
        html += `x-on:mousemove.window="screen = Math.ceil(($event.clientX * ${comparates.length}) / window.innerWidth)">`;

        row.forEach((url, urlIdx) => {
          const iteration = urlIdx + 1;
          html += `<li class="comparison__image-container" x-bind:class="screen != ${iteration} && 'comparison__image-container--hidden'">`;
          html += `<figure class="comparison__figure">`;
          if (rowIdx === 0) { // first row gets figcaption
            html += `<figcaption class="comparison__figcaption">${comparates[urlIdx]}</figcaption>`;
          }
          html += `<img class="comparison__image" src="${url}" loading="lazy" x-bind:class="screen != ${iteration} && 'comparison__image--hidden'" />`;
          html += `</figure></li>`;
        });
        html += `</ul></li>`;
      });
      html += `</ul></div>`;
      return html;
    });

    const parsers = {
      h1: { open: /^\[h1\]/i, close: '[/h1]', openHtml: '<h1>', closeHtml: '</h1>', block: true },
      h2: { open: /^\[h2\]/i, close: '[/h2]', openHtml: '<h2>', closeHtml: '</h2>', block: true },
      h3: { open: /^\[h3\]/i, close: '[/h3]', openHtml: '<h3>', closeHtml: '</h3>', block: true },
      h4: { open: /^\[h4\]/i, close: '[/h4]', openHtml: '<h4>', closeHtml: '</h4>', block: true },
      h5: { open: /^\[h5\]/i, close: '[/h5]', openHtml: '<h5>', closeHtml: '</h5>', block: true },
      h6: { open: /^\[h6\]/i, close: '[/h6]', openHtml: '<h6>', closeHtml: '</h6>', block: true },
      bold: { open: /^\[b\]/i, close: '[/b]', openHtml: '<b>', closeHtml: '</b>', block: false },
      italic: { open: /^\[i\]/i, close: '[/i]', openHtml: '<i>', closeHtml: '</i>', block: false },
      underline: { open: /^\[u\]/i, close: '[/u]', openHtml: '<u>', closeHtml: '</u>', block: false },
      linethrough: { open: /^\[s\]/i, close: '[/s]', openHtml: '<s>', closeHtml: '</s>', block: false },
      size: {
        open: /^\[size=(\d+)\]/i, close: '[/size]', openHtml: '', closeHtml: '</span>', block: false,
        handler: (m) => `<span style="font-size: clamp(10px, ${m[1]}px, 100px);">`
      },
      font: {
        open: /^\[font=([a-z0-9 ]+)\]/i, close: '[/font]', openHtml: '', closeHtml: '</span>', block: false,
        handler: (m) => `<span style="font-family: ${m[1]};">`
      },
      color: {
        open: /^\[color=(\#[a-f0-9]{3,4}|\#[a-f0-9]{6}|\#[a-f0-9]{8}|[a-z]+)\]/i, close: '[/color]', openHtml: '', closeHtml: '</span>', block: false,
        handler: (m) => `<span style="color: ${m[1]};">`
      },
      center: { open: /^\[center\]/i, close: '[/center]', openHtml: '<div class="bbcode-rendered__center" style="text-align: center;">', closeHtml: '</div>', block: true },
      left: { open: /^\[left\]/i, close: '[/left]', openHtml: '<div class="bbcode-rendered__left" style="text-align: left;">', closeHtml: '</div>', block: true },
      right: { open: /^\[right\]/i, close: '[/right]', openHtml: '<div class="bbcode-rendered__right" style="text-align: right;">', closeHtml: '</div>', block: true },
      quote: { open: /^\[quote\]/i, close: '[/quote]', openHtml: '<blockquote>', closeHtml: '</blockquote>', block: true },
      namedquote: {
        open: /^\[quote=(.*?)\]/i, close: '[/quote]', openHtml: '', closeHtml: '</p></blockquote>', block: true,
        handler: (m) => `<blockquote><i class="fas fa-quote-left"></i> <cite>Quoting ${m[1]}:</cite><p>`
      },
      orderedlistnumerical: { open: /^\[list=1\]/i, close: '[/list]', openHtml: '<ol>', closeHtml: '</ol>', block: true },
      orderedlistalpha: { open: /^\[list=a\]/i, close: '[/list]', openHtml: '<ol type="a">', closeHtml: '</ol>', block: true },
      unorderedlist: { open: /^\[list\]/i, close: '[/list]', openHtml: '<ul>', closeHtml: '</ul>', block: true },
      code: { open: /^\[code\]/i, close: '[/code]', openHtml: '<div class="bbcode-rendered__clipboard" x-data="clipboardButton"><pre><code>', closeHtml: '</code></pre><div class="bbcode-rendered__clipboard-container"><button class="bbcode-rendered__clipboard-button" x-bind="button" title="Copy"><i class="fa fa-clone"></i></button></div></div>', block: true },
      pre: { open: /^\[pre\]/i, close: '[/pre]', openHtml: '<code>', closeHtml: '</code>', block: false },
      alert: { open: /^\[alert\]/i, close: '[/alert]', openHtml: '<div class="bbcode-rendered__alert">', closeHtml: '</div>', block: true },
      note: { open: /^\[note\]/i, close: '[/note]', openHtml: '<div class="bbcode-rendered__note">', closeHtml: '</div>', block: true },
      sub: { open: /^\[sub\]/i, close: '[/sub]', openHtml: '<sub>', closeHtml: '</sub>', block: false },
      sup: { open: /^\[sup\]/i, close: '[/sup]', openHtml: '<sup>', closeHtml: '</sup>', block: false },
      small: { open: /^\[small\]/i, close: '[/small]', openHtml: '<small>', closeHtml: '</small>', block: false },
      table: { open: /^\[table\]/i, close: '[/table]', openHtml: '<table>', closeHtml: '</table>', block: true },
      tablerow: { open: /^\[tr\]/i, close: '[/tr]', openHtml: '<tr>', closeHtml: '</tr>', block: true },
      tableheader: { open: /^\[th\]/i, close: '[/th]', openHtml: '<th>', closeHtml: '</th>', block: true },
      tabledata: { open: /^\[td\]/i, close: '[/td]', openHtml: '<td>', closeHtml: '</td>', block: true },
      spoiler: { open: /^\[spoiler\]/i, close: '[/spoiler]', openHtml: '<details><summary>Spoiler</summary><div style="text-align:left;">', closeHtml: '</div></details>', block: false },
      namedspoiler: {
        open: /^\[spoiler=(.*?)\]/i, close: '[/spoiler]', openHtml: '', closeHtml: '</div></details>', block: false,
        handler: (m) => `<details><summary>${m[1]}</summary><div style="text-align:left;">`
      }
    };

    let openedElements = [];
    let state = { source, index: 0 };

    while (state.index < state.source.length) {
      state.index = state.source.indexOf('[', state.index);
      if (state.index === -1) break;
      if (state.index + 1 >= state.source.length) break;

      if (state.source[state.index + 1] === '/' && openedElements.length > 0) {
        let name = openedElements[openedElements.length - 1];
        let el = parsers[name];
        let tag = state.source.substring(state.index, state.index + el.close.length);

        if (tag.toLowerCase() === el.close.toLowerCase()) {
          openedElements.pop();
          state.source = state.source.substring(0, state.index) + el.closeHtml + state.source.substring(state.index + el.close.length);

          if (el.block) {
            handleBlockElementSpacing(state, state.index, state.index + el.closeHtml.length - 1);
          }
        } else {
          openedElements.push(name);
        }
      } else {
        let remainingText = state.source.substring(state.index);
        let matched = false;

        for (const [name, el] of Object.entries(parsers)) {
          const match = remainingText.match(el.open);
          if (match) {
            let replacement = el.handler ? el.handler(match) : el.openHtml;
            state.source = state.source.substring(0, state.index) + replacement + state.source.substring(state.index + match[0].length);

            if (el.block) {
              handleBlockElementSpacing(state, state.index, state.index + replacement.length - 1);
            }

            openedElements.push(name);
            matched = true;
            break;
          }
        }

        if (!matched) {
          state.index++;
        }
      }
    }

    while (openedElements.length > 0) {
      let name = openedElements.pop();
      state.source += parsers[name].closeHtml;
    }

    state.source = state.source.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>');

    return `<div class="bbcode-rendered">${state.source}</div>`;
  };

  // MediaInfo parser - extracts key info into a summary
  const parseMediaInfo = (raw) => {
    if (!raw) return { summary: null, raw: '' };

    const lines = raw.split('\n');
    const info = {
      completeName: '',
      format: '',
      duration: '',
      fileSize: '',
      overallBitrate: '',
      video: [],
      audio: [],
      subtitles: [],
      encodingSettings: ''
    };

    let currentSection = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Detect section headers (handle both "Video" and "Video #1" formats)
      if (/^General$/i.test(trimmed) || /^General\s/i.test(trimmed)) {
        currentSection = 'general';
      } else if (/^Video(?:\s|$)/i.test(trimmed)) {
        currentSection = 'video';
        info.video.push({});
      } else if (/^Audio(?:\s|$)/i.test(trimmed)) {
        currentSection = 'audio';
        info.audio.push({});
      } else if (/^Text(?:\s|$)/i.test(trimmed)) {
        currentSection = 'text';
        info.subtitles.push({});
      } else if (/^Menu(?:\s|$)/i.test(trimmed)) {
        currentSection = 'menu';
      } else if (trimmed.includes(':')) {
        // Parse key: value pairs, accounting for multi-colon values
        const colonIdx = trimmed.indexOf(':');
        const key = trimmed.substring(0, colonIdx).trim();
        const value = trimmed.substring(colonIdx + 1).trim();
        const keyLower = key.toLowerCase();

        if (currentSection === 'general') {
          if (keyLower === 'complete name') info.completeName = value;
          if (keyLower === 'format') info.format = value;
          if (keyLower === 'duration') info.duration = value;
          if (keyLower === 'file size') info.fileSize = value;
          if (keyLower === 'overall bit rate') info.overallBitrate = value;
        } else if (currentSection === 'video' && info.video.length > 0) {
          const v = info.video[info.video.length - 1];
          if (keyLower === 'format') v.format = value;
          if (keyLower === 'width') v.width = value;
          if (keyLower === 'height') v.height = value;
          if (keyLower === 'display aspect ratio') v.aspectRatio = value;
          if (keyLower === 'bit depth') v.bitDepth = value;
          if (keyLower === 'frame rate') v.frameRate = value;
          if (keyLower === 'bit rate') v.bitrate = value;
          if (keyLower === 'hdr format') v.hdr = value;
          if (keyLower === 'encoding settings') {
            v.encodingSettings = value;
            info.encodingSettings = value;
          }
        } else if (currentSection === 'audio' && info.audio.length > 0) {
          const a = info.audio[info.audio.length - 1];
          if (keyLower === 'format') a.format = value;
          if (keyLower === 'commercial name') a.name = value;
          if (keyLower === 'channel(s)') a.channels = value;
          if (keyLower === 'language') a.language = value;
          if (keyLower === 'bit rate') a.bitrate = value;
          if (keyLower === 'title') a.title = value;
        } else if (currentSection === 'text' && info.subtitles.length > 0) {
          const s = info.subtitles[info.subtitles.length - 1];
          if (keyLower === 'format') s.format = value;
          if (keyLower === 'language') s.language = value;
          if (keyLower === 'title') s.title = value;
          if (keyLower === 'forced') s.forced = value.toLowerCase() === 'yes';
          if (keyLower === 'default') s.default = value.toLowerCase() === 'yes';
        }
      }
    }

    return { summary: info, raw };
  };


  // BDInfo parser - handles BDInfo format which is different from MediaInfo
  const parseBDInfo = (raw) => {
    if (!raw) return { summary: null, raw: '' };

    const lines = raw.split('\n');
    const info = {
      discTitle: '',
      discLabel: '',
      discSize: '',
      length: '',
      totalBitrate: '',
      video: [],
      audio: [],
      subtitles: []
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Parse key: value lines
      if (trimmed.includes(':')) {
        const colonIdx = trimmed.indexOf(':');
        const key = trimmed.substring(0, colonIdx).trim().toLowerCase();
        const value = trimmed.substring(colonIdx + 1).trim();

        if (key === 'disc title') info.discTitle = value;
        else if (key === 'disc label') info.discLabel = value;
        else if (key === 'disc size') info.discSize = value;
        else if (key === 'length') info.length = value;
        else if (key === 'total bitrate') info.totalBitrate = value;
        else if (key === 'video') {
          // Video: MPEG-4 AVC Video / 35949 kbps / 1080p / 23.976 fps / 16:9 / High Profile 4.1
          const parts = value.split('/').map(p => p.trim());
          info.video.push({
            format: parts[0] || '',
            bitrate: parts[1] || '',
            resolution: parts[2] || '',
            frameRate: parts[3] || '',
            aspectRatio: parts[4] || '',
            profile: parts[5] || ''
          });
        } else if (key === 'audio') {
          // Audio: Japanese / LPCM Audio / 2.0 / 48 kHz / 2304 kbps / 24-bit
          const parts = value.split('/').map(p => p.trim());
          info.audio.push({
            language: parts[0] || '',
            format: parts[1] || '',
            channels: parts[2] || '',
            sampleRate: parts[3] || '',
            bitrate: parts[4] || '',
            bitDepth: parts[5] || ''
          });
        } else if (key === 'subtitle') {
          // Subtitle: English / 50.053 kbps
          const parts = value.split('/').map(p => p.trim());
          info.subtitles.push({
            language: parts[0] || '',
            bitrate: parts[1] || ''
          });
        }
      }
    }

    return { summary: info, raw };
  };

  // Render BDInfo summary as HTML (matches MediaInfo styling)
  const renderBDInfoSummary = (info, rawContent = '') => {
    const container = create('div', 'gz-mediainfo-summary');

    // Disc title/label header (clickable to show/hide raw content)
    const titleStr = info.discTitle || info.discLabel || 'BDInfo';

    const title = create('div', 'gz-mediainfo-filename');
    title.textContent = titleStr;
    container.appendChild(title);

    // Raw content section (hidden by default, appears between header and summary)
    const rawSection = create('div', 'gz-mediainfo-raw-inline');
    const rawPre = create('pre');
    rawPre.textContent = rawContent;
    rawSection.appendChild(rawPre);
    container.appendChild(rawSection);

    // Click handler to toggle raw content visibility
    title.addEventListener('click', () => {
      title.classList.toggle('expanded');
      rawSection.classList.toggle('visible');
    });

    // Summary content wrapper
    const summaryContent = create('div', 'gz-mediainfo-summary-content');

    // Columns container (Disc Info + Video side by side)
    const hasGeneral = info.discSize || info.length || info.totalBitrate;
    const hasVideo = info.video.length > 0;

    if (hasGeneral || hasVideo) {
      const columns = create('div', 'gz-mediainfo-columns');

      // Disc Info column (like General in MediaInfo)
      if (hasGeneral) {
        const discCol = create('div', 'gz-mediainfo-column');
        discCol.innerHTML = `<div class="gz-mediainfo-column-title">Disc Info</div>`;

        if (info.discSize) {
          discCol.innerHTML += `
            <div class="gz-mediainfo-row">
              <span class="gz-mediainfo-row-label">Size</span>
              <span class="gz-mediainfo-row-value">${info.discSize}</span>
            </div>`;
        }
        if (info.length) {
          discCol.innerHTML += `
            <div class="gz-mediainfo-row">
              <span class="gz-mediainfo-row-label">Length</span>
              <span class="gz-mediainfo-row-value">${info.length}</span>
            </div>`;
        }
        if (info.totalBitrate) {
          discCol.innerHTML += `
            <div class="gz-mediainfo-row">
              <span class="gz-mediainfo-row-label">Bitrate</span>
              <span class="gz-mediainfo-row-value">${info.totalBitrate}</span>
            </div>`;
        }
        columns.appendChild(discCol);
      }

      // Video column
      if (hasVideo) {
        const v = info.video[0]; // Use first video track
        const videoCol = create('div', 'gz-mediainfo-column');
        videoCol.innerHTML = `<div class="gz-mediainfo-column-title">Video</div>`;

        if (v.format) {
          videoCol.innerHTML += `
            <div class="gz-mediainfo-row">
              <span class="gz-mediainfo-row-label">Format</span>
              <span class="gz-mediainfo-row-value">${v.format}</span>
            </div>`;
        }
        if (v.resolution) {
          videoCol.innerHTML += `
            <div class="gz-mediainfo-row">
              <span class="gz-mediainfo-row-label">Resolution</span>
              <span class="gz-mediainfo-row-value">${v.resolution}</span>
            </div>`;
        }
        if (v.aspectRatio) {
          videoCol.innerHTML += `
            <div class="gz-mediainfo-row">
              <span class="gz-mediainfo-row-label">Aspect ratio</span>
              <span class="gz-mediainfo-row-value">${v.aspectRatio}</span>
            </div>`;
        }
        if (v.frameRate) {
          videoCol.innerHTML += `
            <div class="gz-mediainfo-row">
              <span class="gz-mediainfo-row-label">Frame rate</span>
              <span class="gz-mediainfo-row-value">${v.frameRate}</span>
            </div>`;
        }
        if (v.bitrate) {
          videoCol.innerHTML += `
            <div class="gz-mediainfo-row">
              <span class="gz-mediainfo-row-label">Bit rate</span>
              <span class="gz-mediainfo-row-value">${v.bitrate}</span>
            </div>`;
        }
        if (v.profile) {
          videoCol.innerHTML += `
            <div class="gz-mediainfo-row">
              <span class="gz-mediainfo-row-label">Profile</span>
              <span class="gz-mediainfo-row-value">${v.profile}</span>
            </div>`;
        }

        columns.appendChild(videoCol);
      }

      summaryContent.appendChild(columns);
    }

    // Audio section (numbered tracks like MediaInfo)
    if (info.audio.length > 0) {
      const audioSection = create('div', 'gz-mediainfo-audio-section');
      audioSection.innerHTML = `<div class="gz-mediainfo-section-title">Audio</div>`;

      const audioList = create('div', 'gz-mediainfo-audio-list');
      info.audio.forEach((a, i) => {
        const audioItem = create('div', 'gz-mediainfo-audio-item');
        const num = `${i + 1}.`;
        const lang = a.language || 'Unknown';
        const format = a.format || 'Unknown';

        // Parse channels to a cleaner format
        let channels = a.channels || '';
        const channelMatch = channels.match(/(\d+(?:\.\d+)?)/);
        if (channelMatch) {
          channels = `${channelMatch[1]}ch`;
        }

        // Format bitrate (remove 'kbps' redundancy if needed)
        const bitrate = a.bitrate || '';
        const sampleRate = a.sampleRate || '';
        const bitDepth = a.bitDepth || '';

        // Build the detail string
        const detailParts = [lang, format, channels, bitrate].filter(Boolean);

        // Add extended info if available
        const extendedParts = [sampleRate, bitDepth].filter(Boolean);
        const extendedInfo = extendedParts.length > 0 ? ` (${extendedParts.join(' / ')})` : '';

        audioItem.innerHTML = `
          <span class="gz-mediainfo-audio-num">${num}</span>
          <span class="gz-mediainfo-audio-details">${detailParts.join(' / ')}<span class="gz-mediainfo-audio-title">${extendedInfo}</span></span>
        `;
        audioList.appendChild(audioItem);
      });

      audioSection.appendChild(audioList);
      summaryContent.appendChild(audioSection);
    }

    // Subtitles section
    if (info.subtitles.length > 0) {
      const subSection = create('div', 'gz-mediainfo-subtitles-section');
      subSection.innerHTML = `<div class="gz-mediainfo-section-title">Subtitles</div>`;

      const subList = create('div', 'gz-mediainfo-subtitles-list');

      // Group subtitles by language
      const subtitleMap = new Map();
      info.subtitles.forEach(s => {
        const lang = s.language || 'Unknown';
        const key = lang.toLowerCase();
        if (!subtitleMap.has(key)) {
          subtitleMap.set(key, { language: lang, count: 0 });
        }
        subtitleMap.get(key).count++;
      });

      // Render each unique language
      const uniqueLanguages = Array.from(subtitleMap.values());
      uniqueLanguages.forEach((sub, index) => {
        const item = create('span', 'gz-mediainfo-subtitle-item');
        let text = sub.language;

        // Add count if more than 1
        if (sub.count > 1) {
          text += ` (${sub.count})`;
        }

        // Add separator except for last item
        if (index < uniqueLanguages.length - 1) {
          text += ',';
        }

        item.innerHTML = text;
        subList.appendChild(item);
      });

      subSection.appendChild(subList);
      summaryContent.appendChild(subSection);
    }

    container.appendChild(summaryContent);
    return container;
  };

  // Render parsed MediaInfo as HTML
  const renderMediaInfoSummary = (info, rawContent = '') => {
    const container = create('div', 'gz-mediainfo-summary');

    // Filename header (clickable to show/hide raw content)
    const filenameStr = info.completeName
      ? (info.completeName.split(/[/\\]/).pop() || info.completeName)
      : 'MediaInfo';

    const filename = create('div', 'gz-mediainfo-filename');
    filename.textContent = filenameStr;
    container.appendChild(filename);

    // Raw content section (hidden by default, appears between header and summary)
    const rawSection = create('div', 'gz-mediainfo-raw-inline');
    const rawPre = create('pre');
    rawPre.textContent = rawContent;
    rawSection.appendChild(rawPre);
    container.appendChild(rawSection);

    // Click handler to toggle raw content visibility
    filename.addEventListener('click', () => {
      filename.classList.toggle('expanded');
      rawSection.classList.toggle('visible');
    });

    // Summary content wrapper
    const summaryContent = create('div', 'gz-mediainfo-summary-content');

    // Columns container (General + Video side by side)
    const hasGeneral = info.format || info.duration || info.overallBitrate || info.fileSize;
    const hasVideo = info.video.length > 0;

    if (hasGeneral || hasVideo) {
      const columns = create('div', 'gz-mediainfo-columns');

      // General column
      if (hasGeneral) {
        const generalCol = create('div', 'gz-mediainfo-column');
        generalCol.innerHTML = `<div class="gz-mediainfo-column-title">General</div>`;

        if (info.format) {
          generalCol.innerHTML += `
            <div class="gz-mediainfo-row">
              <span class="gz-mediainfo-row-label">Format</span>
              <span class="gz-mediainfo-row-value">${info.format}</span>
            </div>`;
        }
        if (info.duration) {
          generalCol.innerHTML += `
            <div class="gz-mediainfo-row">
              <span class="gz-mediainfo-row-label">Duration</span>
              <span class="gz-mediainfo-row-value">${info.duration}</span>
            </div>`;
        }
        if (info.overallBitrate) {
          generalCol.innerHTML += `
            <div class="gz-mediainfo-row">
              <span class="gz-mediainfo-row-label">Bitrate</span>
              <span class="gz-mediainfo-row-value">${info.overallBitrate}</span>
            </div>`;
        }
        if (info.fileSize) {
          generalCol.innerHTML += `
            <div class="gz-mediainfo-row">
              <span class="gz-mediainfo-row-label">Size</span>
              <span class="gz-mediainfo-row-value">${info.fileSize}</span>
            </div>`;
        }
        columns.appendChild(generalCol);
      }

      // Video column
      if (hasVideo) {
        const v = info.video[0]; // Use first video track
        const videoCol = create('div', 'gz-mediainfo-column');
        videoCol.innerHTML = `<div class="gz-mediainfo-column-title">Video</div>`;

        const formatStr = v.format ? `${v.format}${v.bitDepth ? ` (${v.bitDepth})` : ''}` : '';
        if (formatStr) {
          videoCol.innerHTML += `
            <div class="gz-mediainfo-row">
              <span class="gz-mediainfo-row-label">Format</span>
              <span class="gz-mediainfo-row-value">${formatStr}</span>
            </div>`;
        }

        const resolution = v.width && v.height ? `${v.width} × ${v.height}` : '';
        if (resolution) {
          videoCol.innerHTML += `
            <div class="gz-mediainfo-row">
              <span class="gz-mediainfo-row-label">Resolution</span>
              <span class="gz-mediainfo-row-value">${resolution}</span>
            </div>`;
        }

        if (v.aspectRatio) {
          videoCol.innerHTML += `
            <div class="gz-mediainfo-row">
              <span class="gz-mediainfo-row-label">Aspect ratio</span>
              <span class="gz-mediainfo-row-value">${v.aspectRatio}</span>
            </div>`;
        }

        if (v.frameRate) {
          videoCol.innerHTML += `
            <div class="gz-mediainfo-row">
              <span class="gz-mediainfo-row-label">Frame rate</span>
              <span class="gz-mediainfo-row-value">${v.frameRate}</span>
            </div>`;
        }

        if (v.bitrate) {
          videoCol.innerHTML += `
            <div class="gz-mediainfo-row">
              <span class="gz-mediainfo-row-label">Bit rate</span>
              <span class="gz-mediainfo-row-value">${v.bitrate}</span>
            </div>`;
        }

        if (v.hdr) {
          videoCol.innerHTML += `
            <div class="gz-mediainfo-row">
              <span class="gz-mediainfo-row-label">HDR</span>
              <span class="gz-mediainfo-row-value">${v.hdr}</span>
            </div>`;
        }

        columns.appendChild(videoCol);
      }

      summaryContent.appendChild(columns);
    }

    // Audio section
    if (info.audio.length > 0) {
      const audioSection = create('div', 'gz-mediainfo-audio-section');
      audioSection.innerHTML = `<div class="gz-mediainfo-section-title">Audio</div>`;

      const audioList = create('div', 'gz-mediainfo-audio-list');
      info.audio.forEach((a, i) => {
        const audioItem = create('div', 'gz-mediainfo-audio-item');
        const num = `${i + 1}.`;
        const lang = a.language || 'Unknown';
        const format = a.name || a.format || 'Unknown';

        // Parse channels to a cleaner format (e.g., "8 channels" -> "8ch")
        let channels = a.channels || '';
        const channelMatch = channels.match(/(\d+)\s*channel/i);
        if (channelMatch) {
          const numChannels = parseInt(channelMatch[1], 10);
          // Map common channel counts to standard formats
          const channelMap = { 1: '1.0ch', 2: '2.0ch', 3: '2.1ch', 6: '5.1ch', 7: '6.1ch', 8: '7.1ch' };
          channels = channelMap[numChannels] || `${numChannels}ch`;
        }

        // Format bitrate (e.g., "1 536 kb/s" -> "1536kb/s")
        const bitrate = a.bitrate ? a.bitrate.replace(/\s+/g, '') : '';

        // Build the detail string: Language / Format / Channels / Bitrate
        const detailParts = [lang, format, channels, bitrate].filter(Boolean);

        // Title/Description (for commentary tracks, etc.)
        const title = a.title ? ` / ${a.title}` : '';

        audioItem.innerHTML = `
          <span class="gz-mediainfo-audio-num">${num}</span>
          <span class="gz-mediainfo-audio-details">${detailParts.join(' / ')}<span class="gz-mediainfo-audio-title">${title}</span></span>
        `;
        audioList.appendChild(audioItem);
      });

      audioSection.appendChild(audioList);
      summaryContent.appendChild(audioSection);
    }

    // Subtitles section - show each track individually with details
    if (info.subtitles.length > 0) {
      const subSection = create('div', 'gz-mediainfo-subtitles-section');
      subSection.innerHTML = `<div class="gz-mediainfo-section-title">Subtitles</div>`;

      const subList = create('div', 'gz-mediainfo-subtitles-list gz-mediainfo-subtitles-list--detailed');

      // Render each subtitle track individually
      info.subtitles.forEach((s, index) => {
        const item = create('div', 'gz-mediainfo-subtitle-item gz-mediainfo-subtitle-item--detailed');

        const trackNum = `#${index + 1}:`;
        const lang = s.language || 'Unknown';
        const format = s.format || '';
        const title = s.title || '';

        // Build flags array
        const flags = [];
        if (s.forced) flags.push('forced');
        if (s.default) flags.push('default');

        // Build the display text
        let text = `<span class="gz-mediainfo-subtitle-num">${trackNum}</span>`;
        text += `<span class="gz-mediainfo-subtitle-details">`;
        text += `${lang}`;
        if (format) text += ` ${format}`;
        if (title) text += ` <span class="gz-mediainfo-subtitle-title">[${title}]</span>`;
        if (flags.length > 0) {
          text += ` <span class="gz-mediainfo-subtitle-flags">(${flags.join(', ')})</span>`;
        }
        text += `</span>`;

        item.innerHTML = text;
        subList.appendChild(item);
      });

      subSection.appendChild(subList);
      summaryContent.appendChild(subSection);
    }

    // Encode Settings section
    if (info.encodingSettings) {
      const encodeSection = create('div', 'gz-mediainfo-encode-section');
      encodeSection.innerHTML = `<div class="gz-mediainfo-section-title">Encode Settings</div>`;

      const settingsBlock = create('div', 'gz-mediainfo-encode-settings');
      settingsBlock.textContent = info.encodingSettings;
      encodeSection.appendChild(settingsBlock);
      summaryContent.appendChild(encodeSection);
    }

    container.appendChild(summaryContent);
    return container;
  };
