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
