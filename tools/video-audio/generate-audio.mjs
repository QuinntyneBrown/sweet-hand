#!/usr/bin/env node
// Narration for a video folder (creating-videos skill): script.md → <folder>.mp3
// plus a timing manifest in .cache/videos/<folder>/timing.json.
//
//   node tools/video-audio/generate-audio.mjs docs/videos/NN-topic --dry-run
//   node tools/video-audio/generate-audio.mjs docs/videos/NN-topic [--engine edge|piper]
//   node tools/video-audio/generate-audio.mjs --say "Sweet Hand" --out .cache/pronunciation-test.wav
//
// Engines: edge (default; the free edge-tts package, needs internet) and piper
// (offline; PIPER_MODEL names the .onnx voice, PIPER_MODEL_2 the second voice).
// PYTHON names the interpreter that has the engine installed. EDGE_VOICE and
// EDGE_VOICE_2 override the edge voices.
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseScript, plain, words } from './script.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../..');
const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const PYTHON = process.env.PYTHON ?? 'python3';
const FFMPEG = process.env.FFMPEG_PATH ?? 'ffmpeg';
const FFPROBE = process.env.FFPROBE_PATH ?? 'ffprobe';
const engine = option('engine', process.env.TTS_ENGINE ?? 'edge');
const WORDS_PER_MINUTE = 150;
const RATE = 24_000;
/** Silence after each paragraph and before each new section, in seconds. */
const GAP = 0.45;
const SECTION_GAP = 0.9;
const LEAD_IN = 0.6;
const TAIL = 1.5;

const voices = {
  edge: { 1: process.env.EDGE_VOICE ?? 'en-US-AndrewMultilingualNeural', 2: process.env.EDGE_VOICE_2 ?? 'en-US-AvaMultilingualNeural' },
  piper: { 1: process.env.PIPER_MODEL, 2: process.env.PIPER_MODEL_2 ?? process.env.PIPER_MODEL },
};

function lexicon(folder) {
  const read = (file) => (existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {});
  return { ...read(join(here, 'pronunciations.json')), ...(folder ? read(join(folder, 'pronunciations.json')) : {}) };
}

/** The text the engine speaks: markdown removed, lexicon entries replaced as whole words. */
export function spoken(text, lex) {
  let out = plain(text);
  for (const [term, say] of Object.entries(lex).sort((a, b) => b[0].length - a[0].length)) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(`(?<![\\w/.-])${escaped}(?![\\w-]|\\.\\w)`, 'g'), say);
  }
  return out;
}

const duration = (file) => Number(execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim());

function synthesize(text, speaker, out) {
  const voice = voices[engine]?.[speaker];
  if (engine === 'edge') {
    const raw = `${out}.mp3`;
    const proxy = process.env.HTTPS_PROXY ? ['--proxy', process.env.HTTPS_PROXY] : [];
    const r = spawnSync(PYTHON, ['-m', 'edge_tts', ...proxy, '--voice', voice, '--text', text, '--write-media', raw], { stdio: ['ignore', 'ignore', 'pipe'] });
    if (r.status !== 0) throw new Error(`edge-tts failed: ${r.stderr.toString().trim().split('\n').at(-1)}`);
    normalizeAudio(raw, out);
  } else if (engine === 'piper') {
    if (!voice) throw new Error('PIPER_MODEL is not set (path to a Piper .onnx voice)');
    const raw = `${out}.raw.wav`;
    const r = spawnSync(PYTHON, ['-m', 'piper', '-m', voice, '-f', raw], { input: text, stdio: ['pipe', 'ignore', 'pipe'] });
    if (r.status !== 0) throw new Error(`piper failed: ${r.stderr.toString().trim().split('\n').at(-1)}`);
    normalizeAudio(raw, out);
  } else {
    throw new Error(`Unknown engine "${engine}" (edge or piper)`);
  }
}

/** Every clip in one format, so concatenation is exact. */
function normalizeAudio(input, output) {
  execFileSync(FFMPEG, ['-y', '-v', 'error', '-i', input, '-ar', String(RATE), '-ac', '1', '-c:a', 'pcm_s16le', output]);
}

function silence(seconds, output) {
  execFileSync(FFMPEG, ['-y', '-v', 'error', '-f', 'lavfi', '-i', `anullsrc=r=${RATE}:cl=mono`, '-t', seconds.toFixed(3), '-c:a', 'pcm_s16le', output]);
}

function validate(folder) {
  const file = join(folder, 'script.md');
  if (!existsSync(file)) throw new Error(`${file} not found`);
  const script = parseScript(readFileSync(file, 'utf8'), file);
  if (script.errors.length) {
    console.error(script.errors.join('\n'));
    process.exit(1);
  }
  return script;
}

function report(script) {
  let total = 0;
  let pauses = 0;
  for (const s of script.sections) {
    const n = s.items.filter((i) => i.kind === 'speech').reduce((sum, i) => sum + words(i.text).length, 0);
    const p = s.items.filter((i) => i.kind === 'pause').reduce((sum, i) => sum + i.seconds, 0);
    total += n;
    pauses += p;
    const minutes = n / WORDS_PER_MINUTE;
    console.log(`  ${(s.title || '(intro)').padEnd(44)} ${String(n).padStart(5)} words  ~${minutes.toFixed(1)} min`);
    if (minutes > 9) console.warn(`  warning: "${s.title}" is over 9 minutes of speech`);
  }
  const seconds = (total / WORDS_PER_MINUTE) * 60 + pauses;
  console.log(`${script.title}: ${total} words, ~${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, '0')} estimated`);
}

function main() {
  if (flag('say')) {
    const out = resolve(option('out', join(repo, '.cache', 'pronunciation-test.wav')));
    mkdirSync(dirname(out), { recursive: true });
    synthesize(spoken(option('say', ''), lexicon()), 1, out);
    console.log(`${out} (${duration(out).toFixed(2)} s)`);
    return;
  }
  const folder = resolve(args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--engine') ?? '');
  const name = basename(folder);
  const script = validate(folder);
  report(script);
  if (flag('dry-run')) return;

  const lex = lexicon(folder);
  const cache = join(repo, '.cache', 'videos', name);
  const clips = join(repo, '.cache', 'videos', 'clips');
  mkdirSync(cache, { recursive: true });
  mkdirSync(clips, { recursive: true });
  const parts = [];
  let t = 0;
  const add = (file) => {
    parts.push(file);
    t += duration(file);
  };
  const gap = (seconds) => {
    const file = join(clips, `silence-${seconds.toFixed(3)}.wav`);
    if (!existsSync(file)) silence(seconds, file);
    add(file);
  };
  const manifest = { title: script.title, engine, sections: [] };
  gap(LEAD_IN);
  script.sections.forEach((section, s) => {
    if (s > 0) gap(SECTION_GAP - GAP);
    const entry = { title: section.title, start: t, paragraphs: [] };
    for (const item of section.items) {
      if (item.kind === 'pause') {
        gap(item.seconds);
        continue;
      }
      const text = spoken(item.text, lex);
      const voice = voices[engine]?.[item.speaker] ?? '';
      const key = createHash('sha256').update(`${engine}|${voice}|${text}`).digest('hex').slice(0, 20);
      const file = join(clips, `${key}.wav`);
      if (!existsSync(file)) {
        process.stdout.write(`  synthesizing ${file.slice(-28)} "${text.slice(0, 50)}…"\n`);
        synthesize(text, item.speaker, file);
      }
      const start = t;
      add(file);
      entry.paragraphs.push({ text: plain(item.text), speaker: item.speaker, start, end: t, line: item.line });
      gap(GAP);
    }
    entry.end = t;
    manifest.sections.push(entry);
  });
  gap(TAIL);
  manifest.duration = t;

  const list = join(cache, 'concat.txt');
  writeFileSync(list, parts.map((p) => `file '${p}'`).join('\n'));
  const mp3 = join(folder, `${name}.mp3`);
  execFileSync(FFMPEG, ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c:a', 'libmp3lame', '-b:a', '96k', mp3]);
  writeFileSync(join(cache, 'timing.json'), JSON.stringify(manifest, null, 2));
  console.log(`${mp3} (${duration(mp3).toFixed(1)} s), timing in ${join(cache, 'timing.json')}`);
}

try {
  main();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
