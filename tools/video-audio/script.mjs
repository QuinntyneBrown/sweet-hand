// Parses a video's script.md (creating-videos skill) strictly into sections and
// spoken items. Shared by the audio generator and the video builder.
//
//   # NN · Title
//   ## Section            groups narration
//   paragraph / - item    spoken by the narrator
//   **Name:** paragraph   spoken by the second voice
//   [pause 5s]            silence
//
// Tables, fenced code, links and HTML are refused: the script must make sense
// with eyes closed.

/** Markdown inline formatting removed, for speech and captions. */
export function plain(text) {
  return text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export const words = (text) => plain(text).split(/\s+/).filter(Boolean);

/** Lower-cased words without punctuation, for matching slide cues to the script. */
export const normalize = (text) => plain(text).toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[^\p{L}\p{N}'@.\s-]/gu, ' ').replace(/\s+/g, ' ').trim();

export function parseScript(source, file = 'script.md') {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const errors = [];
  const fail = (n, message) => errors.push(`${file}:${n + 1}: ${message}`);
  if (!/^# \d{2} · .+/.test(lines[0] ?? '')) fail(0, 'the first line must be "# NN · Title"');
  const title = (lines[0] ?? '').replace(/^# /, '');
  const sections = [{ title: '', items: [] }];
  let buffer = [];
  let bufferStart = 0;
  const flush = () => {
    if (!buffer.length) return;
    let text = buffer.join(' ').trim();
    let speaker = 1;
    const named = /^\*\*([^*]+):\*\*\s*(.*)$/.exec(text);
    if (named) {
      speaker = 2;
      text = named[2];
    }
    sections.at(-1).items.push({ kind: 'speech', text, speaker, line: bufferStart + 1 });
    buffer = [];
  };
  let inFence = false;
  for (let n = 1; n < lines.length; n++) {
    const line = lines[n];
    if (/^```/.test(line)) {
      inFence = !inFence;
      fail(n, 'fenced code blocks are not allowed');
      continue;
    }
    if (inFence) continue;
    if (/^\s*$/.test(line)) {
      flush();
      continue;
    }
    if (/^## /.test(line)) {
      flush();
      sections.push({ title: line.slice(3).trim(), items: [], line: n + 1 });
      continue;
    }
    if (/^#/.test(line)) fail(n, 'only one "#" title and "##" sections are allowed');
    if (/^\|/.test(line)) fail(n, 'tables are not allowed');
    if (/\[[^\]]+\]\([^)]+\)/.test(line)) fail(n, 'links are not allowed');
    if (/<\/?[a-z][^>]*>/i.test(line.replace(/`[^`]*`/g, ''))) fail(n, 'HTML is not allowed');
    const pause = /^\[pause (\d+(?:\.\d+)?)s\]$/.exec(line.trim());
    if (pause) {
      flush();
      sections.at(-1).items.push({ kind: 'pause', seconds: Number(pause[1]), line: n + 1 });
      continue;
    }
    if (/^\s*-\s+/.test(line)) {
      flush();
      bufferStart = n;
      buffer.push(line.replace(/^\s*-\s+/, ''));
      flush();
      continue;
    }
    if (!buffer.length) bufferStart = n;
    buffer.push(line.trim());
  }
  flush();
  if (!sections[0].items.length) sections.shift();
  return { title, sections, errors };
}

/** Speech items in narration order, each with its section index. */
export function speechItems(script) {
  const out = [];
  script.sections.forEach((section, s) => section.items.forEach((item) => item.kind === 'speech' && out.push({ ...item, section: s })));
  return out;
}
