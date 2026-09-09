  // Parsing and format-specific presentation stay private to the media summary.
  const renderMediaSummary = (() => {
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


    const textNode = (tag, className, text) => {
      const node = create(tag, className);
      node.textContent = text;
      return node;
    };
    const mediaView = (info) => ({
      title: info.completeName ? info.completeName.split(/[/\\]/).pop() || info.completeName : 'MediaInfo',
      generalTitle: 'General',
      general: [['Format', info.format], ['Duration', info.duration], ['Size', info.fileSize], ['Bit rate', info.overallBitrate]],
      video: info.video.length ? [
        ['Format', [info.video[0].format, info.video[0].bitDepth ? `(${info.video[0].bitDepth})` : ''].filter(Boolean).join(' ')],
        ['Resolution', info.video[0].width && info.video[0].height ? `${info.video[0].width} × ${info.video[0].height}` : ''],
        ['Aspect ratio', info.video[0].aspectRatio], ['Frame rate', info.video[0].frameRate],
        ['Bit rate', info.video[0].bitrate], ['HDR', info.video[0].hdr],
      ] : [],
      audio: info.audio.map((track) => {
        let channels = track.channels || '';
        const match = channels.match(/(\d+)\s*channel/i);
        if (match) {
          const count = Number(match[1]);
          channels = ({ 1: '1.0ch', 2: '2.0ch', 3: '2.1ch', 6: '5.1ch', 7: '6.1ch', 8: '7.1ch' })[count] || `${count}ch`;
        }
        return {
          text: [track.language || 'Unknown', track.name || track.format || 'Unknown', channels, (track.bitrate || '').replace(/\s+/g, '')].filter(Boolean).join(' / '),
          extra: track.title ? ` / ${track.title}` : '',
        };
      }),
      subtitles: info.subtitles,
      detailedSubtitles: true,
      encodingSettings: info.encodingSettings,
    });
    const discView = (info) => {
      const subtitles = new Map();
      info.subtitles.forEach((track) => {
        const language = track.language || 'Unknown';
        const key = language.toLowerCase();
        const entry = subtitles.get(key) || { language, count: 0 };
        entry.count++;
        subtitles.set(key, entry);
      });
      return {
        title: info.discTitle || info.discLabel || 'BDInfo',
        generalTitle: 'Disc Info',
        general: [['Size', info.discSize], ['Length', info.length], ['Bitrate', info.totalBitrate]],
        video: info.video.length ? [
          ['Format', info.video[0].format], ['Resolution', info.video[0].resolution],
          ['Aspect ratio', info.video[0].aspectRatio], ['Frame rate', info.video[0].frameRate],
          ['Bit rate', info.video[0].bitrate], ['Profile', info.video[0].profile],
        ] : [],
        audio: info.audio.map((track) => {
          const match = (track.channels || '').match(/(\d+(?:\.\d+)?)/);
          const channels = match ? `${match[1]}ch` : track.channels;
          const extended = [track.sampleRate, track.bitDepth].filter(Boolean);
          return {
            text: [track.language || 'Unknown', track.format || 'Unknown', channels, track.bitrate].filter(Boolean).join(' / '),
            extra: extended.length ? ` (${extended.join(' / ')})` : '',
          };
        }),
        subtitles: Array.from(subtitles.values()),
        detailedSubtitles: false,
      };
    };
    const formats = [
      { id: 'mediainfo', label: 'MediaInfo', field: 'media_info', parse: parseMediaInfo, view: mediaView },
      { id: 'bdinfo', label: 'BDInfo', field: 'bd_info', parse: parseBDInfo, view: discView },
    ];
    return (torrent) => {
      const format = formats.find(({ field }) => typeof torrent[field] === 'string' && torrent[field].trim());
      if (!format) return null;
      const rawContent = torrent[format.field];
      const view = format.view(format.parse(rawContent).summary);
      const element = create('div', 'gz-mediainfo-summary');
      const title = textNode('div', 'gz-mediainfo-filename', view.title);
      const raw = create('div', 'gz-mediainfo-raw-inline');
      raw.appendChild(textNode('pre', '', rawContent));
      title.addEventListener('click', () => {
        title.classList.toggle('expanded');
        raw.classList.toggle('visible');
      });
      element.append(title, raw);
      const summary = create('div', 'gz-mediainfo-summary-content');
      const columns = create('div', 'gz-mediainfo-columns');
      [[view.generalTitle, view.general], ['Video', view.video]].forEach(([heading, fields]) => {
        const values = fields.filter(([, value]) => value);
        if (!values.length) return;
        const column = create('div', 'gz-mediainfo-column');
        column.appendChild(textNode('div', 'gz-mediainfo-column-title', heading));
        values.forEach(([label, value]) => {
          const row = create('div', 'gz-mediainfo-row');
          row.append(textNode('span', 'gz-mediainfo-row-label', label), textNode('span', 'gz-mediainfo-row-value', value));
          column.appendChild(row);
        });
        columns.appendChild(column);
      });
      if (columns.children.length) summary.appendChild(columns);
      if (view.audio.length) {
        const section = create('div', 'gz-mediainfo-audio-section');
        section.appendChild(textNode('div', 'gz-mediainfo-section-title', 'Audio'));
        const list = create('div', 'gz-mediainfo-audio-list');
        view.audio.forEach((track, index) => {
          const item = create('div', 'gz-mediainfo-audio-item');
          const details = textNode('span', 'gz-mediainfo-audio-details', track.text);
          details.appendChild(textNode('span', 'gz-mediainfo-audio-title', track.extra));
          item.append(textNode('span', 'gz-mediainfo-audio-num', `${index + 1}.`), details);
          list.appendChild(item);
        });
        section.appendChild(list);
        summary.appendChild(section);
      }
      if (view.subtitles.length) {
        const section = create('div', 'gz-mediainfo-subtitles-section');
        section.appendChild(textNode('div', 'gz-mediainfo-section-title', 'Subtitles'));
        const list = create('div', 'gz-mediainfo-subtitles-list');
        if (view.detailedSubtitles) list.classList.add('gz-mediainfo-subtitles-list--detailed');
        view.subtitles.forEach((track, index) => {
          const item = create(view.detailedSubtitles ? 'div' : 'span', 'gz-mediainfo-subtitle-item');
          if (view.detailedSubtitles) {
            item.classList.add('gz-mediainfo-subtitle-item--detailed');
            const details = textNode('span', 'gz-mediainfo-subtitle-details', [track.language || 'Unknown', track.format].filter(Boolean).join(' '));
            if (track.title) details.appendChild(textNode('span', 'gz-mediainfo-subtitle-title', ` [${track.title}]`));
            const flags = [track.forced && 'forced', track.default && 'default'].filter(Boolean);
            if (flags.length) details.appendChild(textNode('span', 'gz-mediainfo-subtitle-flags', ` (${flags.join(', ')})`));
            item.append(textNode('span', 'gz-mediainfo-subtitle-num', `#${index + 1}:`), details);
          } else {
            item.textContent = track.language + (track.count > 1 ? ` (${track.count})` : '') + (index < view.subtitles.length - 1 ? ',' : '');
          }
          list.appendChild(item);
        });
        section.appendChild(list);
        summary.appendChild(section);
      }
      if (view.encodingSettings) {
        const section = create('div', 'gz-mediainfo-encode-section');
        section.append(textNode('div', 'gz-mediainfo-section-title', 'Encode Settings'), textNode('div', 'gz-mediainfo-encode-settings', view.encodingSettings));
        summary.appendChild(section);
      }
      element.appendChild(summary);
      return { id: format.id, label: format.label, element, rawContent };
    };
  })();
