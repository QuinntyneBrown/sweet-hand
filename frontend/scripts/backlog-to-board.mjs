// Turns docs/plans/launch-backlog.md into the sprint board's data (ADR 0013).
// Usage: node scripts/backlog-to-board.mjs [backlog.md] [backlog.json]
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const input = resolve(process.argv[2] ?? resolve(here, '../../docs/plans/launch-backlog.md'));
const output = resolve(process.argv[3] ?? resolve(here, '../projects/board/public/backlog.json'));

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const lines = readFileSync(input, 'utf8').split(/\r?\n/);

function fail(message) {
  console.error(`backlog-to-board: ${message} (${input})`);
  process.exit(1);
}

const year = Number(lines.find((l) => l.startsWith('**Status:**'))?.match(/\b(20\d\d)\b/)?.[1]);
if (!year) fail('no year in the Status line');

/** "Mon 12 Oct" → "2026-10-12"; a month before the first sprint's falls in the next year. */
function isoDate(text, firstMonth) {
  const m = text.trim().match(/(\d{1,2}) ([A-Z][a-z]{2})/);
  if (!m) fail(`unreadable date "${text}"`);
  const month = MONTHS.indexOf(m[2]);
  const y = firstMonth !== undefined && month < firstMonth ? year + 1 : year;
  return `${y}-${String(month + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}

const cells = (line) => line.split('|').slice(1, -1).map((c) => c.trim());
const isRow = (line) => line.startsWith('|') && !/^\|\s*-/.test(line);

/** Bullet lines from `start` until the next blank line, as { depth, text }. */
function bullets(start) {
  const items = [];
  for (let i = start; i < lines.length && lines[i].trim() !== ''; i++) {
    const m = lines[i].match(/^(\s*)- (?:\[[ xX]\] )?(.*)$/);
    if (m) items.push({ depth: Math.floor(m[1].length / 2), text: m[2].trim() });
  }
  return items;
}

/** The line index after `marker`, skipping blank lines. */
function after(from, to, marker) {
  for (let i = from; i < to; i++) {
    if (lines[i].trim() === marker) {
      let j = i + 1;
      while (j < to && lines[j].trim() === '') j++;
      return j;
    }
  }
  return -1;
}

// Sprints: dates and names from the working-agreement table.
const sprints = [];
const sprintTable = after(0, lines.length, '### Sprints');
let firstMonth;
for (let i = sprintTable; sprintTable >= 0 && i < lines.length && !lines[i].startsWith('#'); i++) {
  if (!isRow(lines[i])) continue;
  const [number, dates, name] = cells(lines[i]);
  if (!/^\d+$/.test(number)) continue;
  const [from, to] = dates.split('–');
  const start = isoDate(from, firstMonth);
  firstMonth ??= Number(start.slice(5, 7)) - 1;
  sprints.push({ number: Number(number), name, start, end: isoDate(to, firstMonth), goal: [], demo: [], stories: [] });
}
if (!sprints.length) fail('no sprints table under "### Sprints"');

// Each lane's Definition of Done.
const laneDod = {};
for (const lane of ['Engineering', 'Business']) {
  const at = after(0, lines.length, `**${lane}, every story:**`);
  if (at < 0) fail(`no Definition of Done for ${lane}`);
  laneDod[lane] = bullets(at).map((b) => b.text);
}

// Sprint sections: goal, ordered stories, review demo.
const headings = lines.map((l, i) => ({ l, i })).filter(({ l }) => /^#{2,4} /.test(l));
const sectionEnd = (i) => headings.find((h) => h.i > i)?.i ?? lines.length;
for (const { l, i } of headings) {
  const m = l.match(/^### Sprint (\d+) ·/);
  if (!m) continue;
  const sprint = sprints.find((s) => s.number === Number(m[1]));
  if (!sprint) fail(`Sprint ${m[1]} has a section but no row in the sprints table`);
  const end = sectionEnd(i);
  sprint.goal = bullets(after(i, end, '**Goal:**')).map((b) => b.text);
  sprint.demo = bullets(after(i, end, '**Review demo:**')).map((b) => b.text);
  for (let j = i; j < end; j++) {
    const id = isRow(lines[j]) ? cells(lines[j])[1]?.match(/^SH-\d+/)?.[0] : undefined;
    if (id) sprint.stories.push(id);
  }
}

// Stories, with the initiative and epic they sit under.
const stories = [];
let initiative = '';
let epic = '';
for (const { l, i } of headings) {
  if (/^## I\d+ /.test(l)) initiative = l.slice(3).trim();
  else if (/^### E\d+\.\d+ /.test(l)) epic = l.slice(4).trim();
  const m = l.match(/^#### (SH-\d+) · (.+)$/);
  if (!m) continue;
  const end = sectionEnd(i);
  let j = i + 1;
  while (lines[j].trim() === '') j++;
  const metaParts = lines[j].split(' · ');
  const lane = metaParts[0].trim();
  const points = Number(lines[j].match(/\*\*(\d+) points?\*\*/)?.[1]);
  if (!laneDod[lane] || !points) fail(`${m[1]} has no lane or points on its first line`);
  const meta = metaParts.slice(2).join(' · ').trim();
  const description = [];
  for (j++; j < end && !lines[j].startsWith('**Definition of done**'); j++) {
    if (lines[j].trim()) description.push(lines[j].trim());
  }
  const dodAt = after(i, end, '**Definition of done**');
  const tasksAt = after(i, end, '**Tasks**');
  stories.push({
    id: m[1],
    title: m[2].trim(),
    lane,
    points,
    meta,
    initiative,
    epic,
    description: description.join(' '),
    dod: dodAt < 0 ? [] : bullets(dodAt),
    tasks: tasksAt < 0 ? [] : bullets(tasksAt).map((b) => b.text),
  });
}

for (const sprint of sprints) {
  for (const id of sprint.stories) {
    if (!stories.some((s) => s.id === id)) fail(`${id} is in Sprint ${sprint.number} but has no "#### ${id} ·" section`);
  }
}

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, JSON.stringify({ sprints, laneDod, stories }, null, 2) + '\n');
console.log(`backlog-to-board: ${sprints.length} sprints, ${stories.length} stories → ${output}`);
