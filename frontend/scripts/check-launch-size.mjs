// Checks the launch site's first load against L2-105.2 and L2-105.3 after `ng build launch`:
// initial JavaScript at most 100 KB gzipped, everything the first load of `/` transfers at most
// 350 KB, and no photo over 25 KB. Angular's own budgets measure raw bytes, so this runs beside them.
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const root = new URL('../dist/launch/browser/', import.meta.url).pathname;
const html = readFileSync(join(root, 'index.html'), 'utf8');
const gz = (file) => gzipSync(readFileSync(join(root, file)), { level: 9 }).length;
const refs = (pattern) => [...html.matchAll(pattern)].map((m) => m[1]).filter((f) => !/^(https?:|data:|\/\/)/.test(f));

const scripts = [...new Set(refs(/<script[^>]+src="([^"]+)"/g).concat(refs(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g)))];
const styles = refs(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g);
const images = [...new Set(refs(/<img[^>]+src="([^"]+)"/g))];

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
const js = scripts.reduce((sum, f) => sum + gz(f), 0);
const total = gzipSync(html).length + js + styles.reduce((sum, f) => sum + gz(f), 0) + images.reduce((sum, f) => sum + statSync(join(root, f)).size, 0);
const failures = [];
if (js > 100 * 1024) failures.push(`initial JavaScript is ${kb(js)} gzipped (limit 100 KB)`);
if (total > 350 * 1024) failures.push(`the first load transfers ${kb(total)} (limit 350 KB)`);
for (const f of images) if (statSync(join(root, f)).size > 25 * 1024) failures.push(`${f} is ${kb(statSync(join(root, f)).size)} (limit 25 KB)`);

console.log(`launch: initial JavaScript ${kb(js)} gzipped, first load ${kb(total)}, ${images.length} photos`);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
