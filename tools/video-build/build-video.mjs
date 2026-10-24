#!/usr/bin/env node
// Builds a video folder's MP4 (creating-videos skill): slides.html rendered to
// 1920×1080 PNGs, each shown from its data-cue in the narration, screen
// recordings (data-clip) overlaid on their slides, captions burned in, and the
// narration MP3 from tools/video-audio/generate-audio.mjs.
//
//   node tools/video-build/build-video.mjs docs/videos/NN-topic --check
//   node tools/video-build/build-video.mjs docs/videos/NN-topic --slides-only
//   node tools/video-build/build-video.mjs docs/videos/NN-topic [--no-captions]
//
// --no-captions leaves the captions out of the picture (the brand video, 07).
// <body data-music="../assets/music/x.mp3"> lays that track under the narration:
// looped if it is shorter, at data-music-db (default -10.8 dB), faded in over
// 1.5 s; the last slide holds 3 s after the narration so the music fades out.
// Needs Chromium (Playwright's, or EDGE_PATH) and ffmpeg with libx264 and libass
// (FFMPEG_PATH overrides).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { normalize, parseScript, words } from '../video-audio/script.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../..');
const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const FFMPEG = process.env.FFMPEG_PATH ?? 'ffmpeg';
const FFPROBE = process.env.FFPROBE_PATH ?? 'ffprobe';
const FPS = 30;
const W = 1920;
const H = 1080;
/** The builder speeds a clip up to fit its slide; above this it warns. */
const MAX_SPEED = 1.6;
const MUSIC_DB = -10.8;
const MUSIC_FADE_IN = 1.5;
const MUSIC_FADE_OUT = 2;
const MUSIC_TAIL = 3;

const folder = resolve(args.find((a) => !a.startsWith('--')) ?? '');
const name = basename(folder);
const cache = join(repo, '.cache', 'videos', name);
const duration = (file) => Number(execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim());
const ff = (...a) => execFileSync(FFMPEG, ['-y', '-v', 'error', ...a], { stdio: ['ignore', 'inherit', 'inherit'] });
const mmss = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;

function chromium() {
  const require = createRequire(join(repo, 'frontend', 'package.json'));
  return require('playwright').chromium;
}

async function readSlides() {
  const browser = await chromium().launch(process.env.EDGE_PATH ? { executablePath: process.env.EDGE_PATH } : {});
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  const url = pathToFileURL(join(folder, 'slides.html')).href;
  await page.goto(`${url}?render=1&slide=1`);
  const slides = await page.evaluate(() =>
    Array.from(document.querySelectorAll('body > section')).map((s, i) => ({
      index: i + 1,
      id: s.id,
      cue: s.dataset.cue ?? null,
      clip: s.dataset.clip ?? null,
      clipDelay: Number(s.dataset.clipDelay ?? 0),
    })),
  );
  const music = await page.evaluate(() => ({ src: document.body.dataset.music ?? null, db: document.body.dataset.musicDb ?? null }));
  if (music.src) {
    music.file = join(folder, music.src);
    if (!existsSync(music.file)) throw new Error(`data-music: ${music.src} not found`);
    music.db = Number(music.db ?? MUSIC_DB);
  }
  return { browser, page, url, slides, music: music.src ? music : null };
}

/** Each cue's time: section headings are exact, phrases inside a paragraph are placed by word count. */
function schedule(slides, script, timing) {
  const paragraphs = timing.sections.flatMap((s, si) => s.paragraphs.map((p) => ({ ...p, section: si, norm: normalize(p.text) })));
  const errors = [];
  const times = slides.map((slide, i) => {
    if (i === 0) return 0;
    if (!slide.cue) {
      errors.push(`slide ${slide.index} (${slide.id}) has no data-cue`);
      return null;
    }
    const cue = normalize(slide.cue);
    const headings = timing.sections.filter((s) => normalize(s.title) === cue);
    const hits = [];
    for (const p of paragraphs) {
      let at = p.norm.indexOf(cue);
      while (at >= 0) {
        hits.push({ p, at });
        at = p.norm.indexOf(cue, at + 1);
      }
    }
    if (headings.length + hits.length !== 1) {
      errors.push(`slide ${slide.index} (${slide.id}): cue "${slide.cue}" found ${headings.length + hits.length} times in script.md`);
      return null;
    }
    if (headings.length) return headings[0].start;
    const { p, at } = hits[0];
    const before = p.norm.slice(0, at).split(' ').filter(Boolean).length;
    const total = p.norm.split(' ').filter(Boolean).length;
    return p.start + (before / total) * (p.end - p.start);
  });
  times.forEach((t, i) => {
    if (i > 0 && t !== null && times[i - 1] !== null && t <= times[i - 1]) errors.push(`slide ${slides[i].index} (${slides[i].id}) is cued before the slide ahead of it`);
  });
  return { times, errors };
}

/** Caption lines of at most ~12 words, broken at punctuation where possible, timed by length within each paragraph. */
function captions(timing) {
  const cues = [];
  for (const section of timing.sections) {
    for (const p of section.paragraphs) {
      const all = p.text.split(/\s+/).filter(Boolean);
      const chunks = [];
      let current = [];
      for (const word of all) {
        current.push(word);
        const soft = /[,;:—]$/.test(word) && current.length >= 6;
        const hard = /[.?!]$/.test(word) && current.length >= 3;
        if (current.length >= 12 || hard || soft) {
          chunks.push(current);
          current = [];
        }
      }
      if (current.length) {
        if (current.length < 3 && chunks.length) chunks.at(-1).push(...current);
        else chunks.push(current);
      }
      const chars = chunks.reduce((n, c) => n + c.join(' ').length, 0);
      let t = p.start;
      for (const chunk of chunks) {
        const text = chunk.join(' ');
        const d = ((p.end - p.start) * text.length) / chars;
        cues.push({ start: t, end: t + d, text });
        t += d;
      }
    }
  }
  return cues;
}

function assFile(cues, file) {
  const ts = (t) => {
    const cs = Math.round(t * 100);
    const h = Math.floor(cs / 360000);
    const m = Math.floor((cs % 360000) / 6000);
    const s = Math.floor((cs % 6000) / 100);
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs % 100).padStart(2, '0')}`;
  };
  const escape = (s) => s.replace(/\\/g, '\\\\').replace(/{/g, '\\{').replace(/}/g, '\\}');
  writeFileSync(
    file,
    [
      '[Script Info]',
      'ScriptType: v4.00+',
      `PlayResX: ${W}`,
      `PlayResY: ${H}`,
      'WrapStyle: 0',
      '',
      '[V4+ Styles]',
      'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
      'Style: Default,DejaVu Sans,40,&H00FFFFFF,&H00FFFFFF,&H00141312,&H28141312,0,0,0,0,100,100,0,0,3,14,0,2,200,200,34,1',
      '',
      '[Events]',
      'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
      ...cues.map((c) => `Dialogue: 0,${ts(c.start)},${ts(c.end)},Default,,0,0,0,,${escape(c.text)}`),
      '',
    ].join('\n'),
  );
}

async function main() {
  const scriptFile = join(folder, 'script.md');
  const script = parseScript(readFileSync(scriptFile, 'utf8'), scriptFile);
  if (script.errors.length) throw new Error(script.errors.join('\n'));
  const timingFile = join(cache, 'timing.json');
  if (!existsSync(timingFile)) throw new Error(`${timingFile} is missing: run tools/video-audio/generate-audio.mjs ${folder} first`);
  const timing = JSON.parse(readFileSync(timingFile, 'utf8'));
  const mp3 = join(folder, `${name}.mp3`);
  const total = duration(mp3);

  const { browser, page, url, slides, music } = await readSlides();
  const { times, errors } = schedule(slides, script, timing);
  if (errors.length) {
    await browser.close();
    throw new Error(errors.join('\n'));
  }
  const spans = slides.map((s, i) => ({ ...s, start: times[i], end: i + 1 < slides.length ? times[i + 1] : total }));
  let warnings = 0;
  for (const s of spans) {
    const d = s.end - s.start;
    let note = '';
    if (d < 4 && s.index > 1) note = '  ← shorter than 4 s';
    if (d > 90) note = '  ← longer than 90 s';
    if (s.clip) {
      const file = join(folder, s.clip);
      if (!existsSync(file)) note += `  ← clip ${s.clip} is missing`;
      else {
        const speed = duration(file) / Math.max(0.1, d - s.clipDelay - 0.3);
        note += `  clip ${s.clip} ×${Math.max(1, speed).toFixed(2)}`;
        if (speed > MAX_SPEED) note += ` ← faster than ×${MAX_SPEED}: give it more narration`;
      }
    }
    if (note.includes('←')) warnings++;
    console.log(`${String(s.index).padStart(3)}  ${mmss(s.start).padStart(7)}  ${d.toFixed(1).padStart(5)} s  ${s.id}${note}`);
  }
  if (music) console.log(`music: ${basename(music.file)} at ${music.db} dB under the narration, ${MUSIC_TAIL} s tail`);
  console.log(`${slides.length} slides, ${mmss(total)} total, ${warnings} warning(s)`);
  if (flag('check')) {
    await browser.close();
    return;
  }

  const shots = join(cache, 'slides');
  rmSync(shots, { recursive: true, force: true });
  mkdirSync(shots, { recursive: true });
  for (const s of spans) {
    await page.goto(`${url}?render=1&slide=${s.index}`);
    await page.evaluate(() => document.fonts.ready);
    if (s.clip) {
      s.box = await page.evaluate(() => {
        const r = document.querySelector('section.active .clip').getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) & ~1, h: Math.round(r.height) & ~1 };
      });
    }
    s.png = join(shots, `${String(s.index).padStart(3, '0')}-${s.id || 'slide'}.png`);
    await page.locator('section.active').screenshot({ path: s.png });
  }
  await browser.close();
  console.log(`slides rendered to ${shots}`);
  if (flag('slides-only')) return;

  const segments = join(cache, 'segments');
  rmSync(segments, { recursive: true, force: true });
  mkdirSync(segments, { recursive: true });
  const list = [];
  // With music the last slide holds for a tail after the narration, so the track fades out
  // instead of being cut with the last word.
  const tail = music ? MUSIC_TAIL : 0;
  for (const s of spans) {
    const last = s === spans.at(-1);
    const frames = Math.round((s.end + (last ? tail : 0)) * FPS) - Math.round(s.start * FPS);
    const d = frames / FPS;
    const out = join(segments, `${String(s.index).padStart(3, '0')}.mp4`);
    const encode = ['-r', String(FPS), '-frames:v', String(frames), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-an', out];
    if (s.clip) {
      const clip = join(folder, s.clip);
      const speed = Math.max(1, duration(clip) / Math.max(0.1, d - s.clipDelay - 0.3));
      const { x, y, w, h } = s.box;
      const filter =
        `[1:v]setpts=(PTS-STARTPTS)/${speed.toFixed(4)},fps=${FPS},scale=${w}:${h}:force_original_aspect_ratio=decrease:force_divisible_by=2,` +
        `pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:color=0xe8e4dd,` +
        `tpad=start_duration=${s.clipDelay}:start_mode=clone:stop_mode=clone:stop_duration=${Math.ceil(d + 1)}[c];` +
        `[0:v][c]overlay=${x}:${y}:eof_action=repeat,format=yuv420p[v]`;
      ff('-loop', '1', '-framerate', String(FPS), '-i', s.png, '-i', clip, '-filter_complex', filter, '-map', '[v]', ...encode);
    } else {
      ff('-loop', '1', '-framerate', String(FPS), '-i', s.png, ...encode);
    }
    list.push(`file '${out}'`);
    process.stdout.write(`  segment ${s.index}/${spans.length}\r`);
  }
  const concat = join(cache, 'segments.txt');
  writeFileSync(concat, list.join('\n'));
  const silent = join(cache, 'video.mp4');
  ff('-f', 'concat', '-safe', '0', '-i', concat, '-c', 'copy', silent);

  const ass = join(cache, 'captions.ass');
  assFile(captions(timing), ass);
  const mp4 = join(folder, `${name}.mp4`);
  const assArg = ass.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "\\'");
  const video = flag('no-captions') ? '[0:v]null[v]' : `[0:v]ass='${assArg}'[v]`;
  // The music is looped so it outlasts the narration; the narration is padded with the tail's
  // silence and the mix keeps that length, so -shortest still ends the file after the tail.
  const audio = music
    ? [
        `[2:a]volume=${music.db}dB,afade=t=in:d=${MUSIC_FADE_IN},afade=t=out:st=${Math.max(0, total + tail - MUSIC_FADE_OUT).toFixed(3)}:d=${MUSIC_FADE_OUT}[m]`,
        `[1:a]apad=pad_dur=${tail}[n]`,
        '[n][m]amix=inputs=2:duration=first:normalize=0[a]',
      ]
    : ['[1:a]anull[a]'];
  const inputs = ['-i', silent, '-i', mp3, ...(music ? ['-stream_loop', '-1', '-i', music.file] : [])];
  ff(...inputs, '-filter_complex', [video, ...audio].join(';'), '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '26', '-tune', 'stillimage', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', '-shortest', mp4);
  console.log(`\n${mp4} (${duration(mp4).toFixed(1)} s; narration ${total.toFixed(1)} s)`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
