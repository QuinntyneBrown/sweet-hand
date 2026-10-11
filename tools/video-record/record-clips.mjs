#!/usr/bin/env node
// Screen recordings of the real UI for a video folder (creating-videos skill).
// Runs each clip in <folder>/clips/clips.mjs in Chromium and writes
// <folder>/clips/<name>.mp4 at 1408×792 (desktop) or 390×844 (phone).
//
//   node tools/video-record/record-clips.mjs docs/videos/NN-topic [--base http://localhost:4201] [--only name]
//
// The app runs inside a browser-like frame (an address bar and an iframe on the
// app's own origin), so viewers see the address change: token links arriving
// and being cleared. A drawn cursor follows every click, and key presses show
// as badges.
//
// clips.mjs exports default [{ name, phone?, colorScheme?, javaScript?, run: async (demo) => {} }].
// `demo` has: go(path), app() (the app's Frame), click(locator), type(locator, text),
// press(key), pause(ms), note(text), mark(), page, base, and showEmail(email).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../..');
const args = process.argv.slice(2);
const option = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const folder = resolve(args.find((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--')) ?? '');
const base = option('base', process.env.DEMO_BASE_URL ?? 'http://localhost:4201');
const only = option('only');
const FFMPEG = process.env.FFMPEG_PATH ?? 'ffmpeg';
const require = createRequire(join(repo, 'frontend', 'package.json'));
const { chromium } = require('playwright');

const sizes = { desktop: { width: 1408, height: 792 }, phone: { width: 390, height: 844 } };
const BAR = { desktop: 52, phone: 48 };

const frameHtml = (phone) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  html, body { margin: 0; height: 100%; background: #e8e4dd; font: 15px/1.2 "DejaVu Sans", system-ui, sans-serif; overflow: hidden; }
  .bar { height: ${phone ? BAR.phone : BAR.desktop}px; display: flex; align-items: center; gap: 10px; padding: 0 ${phone ? 10 : 16}px; background: #f1eee9; border-bottom: 1px solid #d6d1c8; box-sizing: border-box; }
  .dots { display: ${phone ? 'none' : 'flex'}; gap: 7px; } .dots i { width: 12px; height: 12px; border-radius: 50%; background: #d3cec5; display: block; }
  .url { flex: 1; min-width: 0; height: ${phone ? 34 : 34}px; border-radius: 17px; background: #fff; border: 1px solid #d6d1c8; display: flex; align-items: center; padding: 0 14px; color: #3d3a36; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: ${phone ? 13 : 15}px; }
  .url b { font-weight: normal; color: #8a8378; } .url .q { color: #b5381f; }
  .note { flex: none; max-width: 46%; background: #b5381f; color: #fff; border-radius: 17px; padding: 8px 14px; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: none; }
  .note.on { display: block; }
  iframe { display: block; width: 100%; height: calc(100% - ${phone ? BAR.phone : BAR.desktop}px); border: 0; background: #fff; }
  #cursor { position: fixed; left: 0; top: 0; width: 22px; height: 22px; margin: -3px 0 0 -3px; z-index: 10; pointer-events: none; transition: none; }
  #cursor svg { filter: drop-shadow(0 1px 2px rgba(0,0,0,.4)); }
  #cursor.down::after { content: ""; position: absolute; left: -11px; top: -11px; width: 30px; height: 30px; border-radius: 50%; background: rgba(181,56,31,.35); }
  #keys { position: fixed; right: 18px; bottom: 18px; z-index: 10; display: flex; gap: 8px; pointer-events: none; }
  #keys span { background: #141312; color: #fff; border-radius: 10px; padding: 10px 16px; font-size: 20px; box-shadow: 0 4px 12px rgba(0,0,0,.3); }
  #mail { position: fixed; z-index: 9; inset: ${phone ? '58px 8px auto 8px' : '70px 70px auto auto'}; width: ${phone ? 'auto' : '560px'}; background: #fff; border: 1px solid #d6d1c8; border-radius: 16px; box-shadow: 0 18px 50px rgba(0,0,0,.25); padding: 20px 22px; display: none; color: #141312; }
  #mail.on { display: block; }
  #mail .tag { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: #8a8378; margin-bottom: 10px; }
  #mail dl { display: grid; grid-template-columns: 92px 1fr; gap: 6px 10px; margin: 0 0 14px; font-size: 14px; }
  #mail dt { color: #8a8378; } #mail dd { margin: 0; word-break: break-all; }
  #mail .body { font-size: 15px; line-height: 1.45; display: grid; gap: 10px; }
  #mail a { color: #b5381f; word-break: break-all; }
  #mail .foot { margin-top: 14px; padding-top: 12px; border-top: 1px solid #ebe7e1; font-size: 12.5px; color: #6b655c; display: grid; gap: 4px; }
</style></head>
<body>
  <div class="bar"><span class="dots"><i></i><i></i><i></i></span><div class="url" id="url"></div><div class="note" id="note"></div></div>
  <iframe name="app" id="app" title="Sweet Hand"></iframe>
  <div id="mail"></div>
  <div id="keys"></div>
  <div id="cursor"><svg width="22" height="22" viewBox="0 0 22 22"><path d="M3 2 L3 18 L7.5 13.8 L10.6 20.4 L13.4 19.1 L10.4 12.6 L16.6 12.6 Z" fill="#141312" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg></div>
  <script>
    const url = document.getElementById('url');
    const app = document.getElementById('app');
    let last = '';
    setInterval(() => {
      let href = '';
      try { href = app.contentWindow.location.href; } catch { href = app.src; }
      if (!href || href === 'about:blank' || href === last) return;
      last = href;
      const u = new URL(href);
      url.innerHTML = '';
      const host = document.createElement('b'); host.textContent = u.host; url.append(host);
      url.append(document.createTextNode(u.pathname === '/' && !u.search && !u.hash ? '/' : u.pathname));
      if (u.search) { const q = document.createElement('span'); q.className = 'q'; q.textContent = u.search; url.append(q); }
      if (u.hash) url.append(document.createTextNode(u.hash));
    }, 50);
  </script>
</body></html>`;

/** Trims the page load before mark() and converts to H.264. */
function encode(webm, mp4, offsetSeconds) {
  execFileSync(FFMPEG, ['-y', '-v', 'error', '-ss', Math.max(0, offsetSeconds).toFixed(3), '-i', webm, '-an', '-r', '30', '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4]);
}

async function record(browser, clip, outDir) {
  const kind = clip.phone ? 'phone' : 'desktop';
  const size = sizes[kind];
  const tmp = join(repo, '.cache', 'videos', 'recordings', `${basename(folder)}-${clip.name}`);
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  const context = await browser.newContext({
    viewport: size,
    recordVideo: { dir: tmp, size },
    colorScheme: clip.colorScheme ?? 'light',
    reducedMotion: clip.reducedMotion ?? 'no-preference',
    javaScriptEnabled: clip.javaScript ?? true,
    locale: 'en-CA',
    timezoneId: 'America/Toronto',
  });
  const page = await context.newPage();
  const startedAt = Date.now();
  let markedAt = null;
  await page.route(`${base}/__frame`, (route) => route.fulfill({ contentType: 'text/html', body: frameHtml(clip.phone) }));
  await page.goto(`${base}/__frame`);

  let cursor = { x: size.width * 0.6, y: size.height * 0.6 };
  const setCursor = (x, y, down = false) =>
    page.evaluate(([x, y, down]) => {
      const c = document.getElementById('cursor');
      c.style.transform = `translate(${x}px, ${y}px)`;
      c.classList.toggle('down', down);
    }, [x, y, down]);
  await setCursor(cursor.x, cursor.y);
  const app = () => page.frame({ name: 'app' });
  const pause = (ms) => page.waitForTimeout(ms);

  const demo = {
    page,
    base,
    app,
    pause,
    /** Starts the clip here; what came before (the first page load) is cut. */
    mark: () => {
      markedAt ??= Date.now();
    },
    async go(path, { ready = clip.javaScript !== false } = {}) {
      await app().goto(new URL(path, base).href);
      // The address bar follows the frame by itself, except when JavaScript is off.
      if (clip.javaScript === false) await page.evaluate((href) => (document.getElementById('url').textContent = href.replace(/^https?:\/\//, '')), new URL(path, base).href);
      if (ready) await app().locator('html[data-ready]').waitFor({ state: 'attached' });
      await pause(300);
    },
    async moveTo(locator) {
      await locator.scrollIntoViewIfNeeded();
      await pause(250);
      const box = await locator.boundingBox();
      if (!box) throw new Error(`no box for ${locator}`);
      const target = { x: box.x + Math.min(box.width / 2, 60), y: box.y + box.height / 2 };
      const steps = 18;
      for (let i = 1; i <= steps; i++) {
        const e = 1 - (1 - i / steps) ** 3;
        await setCursor(cursor.x + (target.x - cursor.x) * e, cursor.y + (target.y - cursor.y) * e);
        await page.mouse.move(cursor.x + (target.x - cursor.x) * e, cursor.y + (target.y - cursor.y) * e);
        await pause(16);
      }
      cursor = target;
    },
    async click(locator, options = {}) {
      await demo.moveTo(locator);
      await pause(150);
      await setCursor(cursor.x, cursor.y, true);
      await locator.click(options);
      await pause(180);
      await setCursor(cursor.x, cursor.y, false);
      await pause(350);
    },
    async type(locator, text) {
      await demo.click(locator);
      await locator.pressSequentially(text, { delay: 55 });
      await pause(400);
    },
    async press(key, label = key) {
      await page.evaluate((label) => {
        const span = document.createElement('span');
        span.textContent = label;
        document.getElementById('keys').append(span);
        setTimeout(() => span.remove(), 900);
      }, label);
      await page.keyboard.press(key);
      await pause(650);
    },
    async note(text) {
      await page.evaluate((text) => {
        const n = document.getElementById('note');
        n.textContent = text || '';
        n.classList.toggle('on', !!text);
      }, text);
    },
    /** Shows a queued launch list email as its outbox record (there is no email provider or template yet): its fields and links, no invented copy. */
    async showEmail(email) {
      await page.evaluate((email) => {
        const mail = document.getElementById('mail');
        const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
        const link = email.link ? `<a id="mail-link" href="${esc(email.link)}">${esc(email.link)}</a>` : '';
        mail.innerHTML = `
          <div class="tag">Queued email · outbox record (no email provider chosen yet)</div>
          <dl><dt>From</dt><dd>${esc(email.senderName)}</dd><dt>To</dt><dd>${esc(email.to)}</dd><dt>Kind</dt><dd>${esc(email.kind)}</dd>
          ${email.mentionsFoodHandlerCertificate ? `<dt>Mentions</dt><dd>the food handler certificate</dd>` : ''}
          ${email.expiresInHours ? `<dt>Expires</dt><dd>in ${esc(email.expiresInHours)} hours</dd>` : ''}
          ${email.headers ? `<dt>Headers</dt><dd>List-Unsubscribe-Post: ${esc(email.headers['List-Unsubscribe-Post'])}</dd>` : ''}</dl>
          <div class="body">${link}</div>
          <div class="foot"><span>You asked for this on ${esc(email.askedOn)}. ${esc(email.mailingAddress)} · ${esc(email.contactEmail)}</span>
          <span>Remove me: <a id="mail-remove" href="${esc(email.removalLink)}">${esc(email.removalLink)}</a></span></div>`;
        mail.classList.add('on');
      }, email);
      await pause(400);
    },
    async hideEmail() {
      await page.evaluate(() => document.getElementById('mail').classList.remove('on'));
    },
    /** Follows a link in the email panel: the cursor clicks it and the app frame opens the address. */
    async openEmailLink(which = 'link') {
      const id = which === 'link' ? '#mail-link' : '#mail-remove';
      const anchor = page.locator(id);
      const href = await anchor.getAttribute('href');
      await demo.moveTo(anchor);
      await setCursor(cursor.x, cursor.y, true);
      await pause(200);
      await setCursor(cursor.x, cursor.y, false);
      await demo.hideEmail();
      await demo.go(href);
    },
  };

  await clip.run(demo);
  await pause(clip.tail ?? 1200);
  const offset = ((markedAt ?? startedAt) - startedAt) / 1000;
  const video = page.video();
  await context.close();
  const webm = await video.path();
  const mp4 = join(outDir, `${clip.name}.mp4`);
  encode(webm, mp4, offset);
  rmSync(tmp, { recursive: true, force: true });
  return mp4;
}

async function main() {
  const file = join(folder, 'clips', 'clips.mjs');
  if (!existsSync(file)) throw new Error(`${file} not found`);
  const clips = (await import(pathToFileURL(file).href)).default.filter((c) => !only || c.name === only);
  const browser = await chromium.launch(process.env.EDGE_PATH ? { executablePath: process.env.EDGE_PATH } : {});
  for (const clip of clips) {
    process.stdout.write(`recording ${clip.name}… `);
    const out = await record(browser, clip, join(folder, 'clips'));
    console.log(out);
  }
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
