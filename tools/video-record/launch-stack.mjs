#!/usr/bin/env node
// The real launch stack for recording demos: the Sweet Hand API on PostgreSQL
// (migrated and seeded through its own commands) and the production launch
// build served the way the static host serves it (serve-launch.mjs).
//
//   node tools/video-record/launch-stack.mjs up       start the API and the site
//   node tools/video-record/launch-stack.mjs down     stop both
//   node tools/video-record/launch-stack.mjs api-stop | api-start
//   node tools/video-record/launch-stack.mjs reset    empty the launch list, its emails, the launch record and the rate-limit counters
//
// DATABASE_URL (default postgres://sweethand:sweethand@localhost:5432/sweethand)
// must name a database you can migrate. Run `npm run build:launch` in frontend/ first.
// Only for local demos: it deletes launch list rows on reset.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../..');
const state = join(repo, '.cache', 'launch-stack');
mkdirSync(state, { recursive: true });

export const DATABASE_URL = process.env.DATABASE_URL ?? 'postgres://sweethand:sweethand@localhost:5432/sweethand';
export const API_PORT = Number(process.env.DEMO_API_PORT ?? 4300);
export const SITE_PORT = Number(process.env.DEMO_SITE_PORT ?? 4201);
export const SITE_URL = `http://localhost:${SITE_PORT}`;

const apiEnv = {
  ...process.env,
  DATABASE_URL,
  PORT: String(API_PORT),
  ALLOWED_ORIGINS: SITE_URL,
  IP_HASH_SECRET: process.env.IP_HASH_SECRET ?? 'local-demo-only',
  SECURE_COOKIES: '0',
  SITE_URL,
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const up = async (url) => {
  try {
    return (await fetch(url)).ok;
  } catch {
    return false;
  }
};
async function waitFor(url, want = true) {
  for (let i = 0; i < 80; i++) {
    if ((await up(url)) === want) return;
    await sleep(250);
  }
  throw new Error(`${url} did not ${want ? 'start' : 'stop'}`);
}

function startProcess(name, command, args, cwd, env) {
  const log = openSync(join(state, `${name}.log`), 'a');
  const child = spawn(command, args, { cwd, env, detached: true, stdio: ['ignore', log, log] });
  child.unref();
  writeFileSync(join(state, `${name}.pid`), String(child.pid));
}

function stopProcess(name) {
  const file = join(state, `${name}.pid`);
  if (!existsSync(file)) return;
  try {
    process.kill(Number(readFileSync(file, 'utf8')), 'SIGTERM');
  } catch {
    /* already gone */
  }
  rmSync(file);
}

const health = `http://localhost:${API_PORT}/api/public/launch-list`;

export async function apiStart() {
  startProcess('api', process.execPath, ['--import', '@swc-node/register/esm-register', 'src/main.ts'], join(repo, 'backend'), apiEnv);
  await waitFor(health, true);
}

export async function apiStop() {
  stopProcess('api');
  await waitFor(health, false);
}

/** `npm run launch-email`: the operator's launch-day command (L2-101.1). Returns its output. */
export function runLaunchEmail() {
  const r = spawnSync('npm', ['run', '-s', 'launch-email'], { cwd: join(repo, 'backend'), env: apiEnv, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr);
  return r.stdout.trim();
}

async function client() {
  const require = (await import('node:module')).createRequire(join(repo, 'backend', 'package.json'));
  const pg = require('pg');
  const c = new pg.Client(DATABASE_URL);
  await c.connect();
  return c;
}

export async function reset() {
  const c = await client();
  await c.query(`delete from documents where collection in ('launchList', 'launchListTokens', 'launchState', 'throttles') or (collection = 'outbox' and data->>'kind' like 'launch%')`);
  await c.end();
}

/**
 * The newest launch list email queued for an address, read from the outbox
 * before the dispatcher sends it (sent emails drop their links). Waits briefly
 * for it to appear.
 */
export async function latestEmail(to, kind = 'launch-confirm') {
  const c = await client();
  try {
    for (let i = 0; i < 40; i++) {
      const { rows } = await c.query(
        `select data from documents where collection = 'outbox' and lower(data->>'to') = lower($1) and data->>'kind' = $2 order by (data->>'seq')::bigint desc limit 1`,
        [to, kind],
      );
      const email = rows[0]?.data;
      if (email?.removalLink) return email;
      if (email && email.status !== 'queued') throw new Error(`the ${kind} email to ${to} was already sent; record the clip again`);
      await sleep(100);
    }
    throw new Error(`no ${kind} email to ${to}`);
  } finally {
    await c.end();
  }
}

/** Database rows for an address, to show what is (and is not) stored. */
export async function launchListRow(email) {
  const c = await client();
  const { rows } = await c.query(`select data from documents where collection = 'launchList' and data->>'emailKey' = lower($1)`, [email]);
  await c.end();
  return rows[0]?.data;
}

async function main(command) {
  switch (command) {
    case 'up': {
      for (const step of [['run', '-s', 'migrate'], ['run', '-s', 'seed']]) {
        const r = spawnSync('npm', step, { cwd: join(repo, 'backend'), env: apiEnv, stdio: 'inherit' });
        if (r.status !== 0) process.exit(r.status ?? 1);
      }
      if (!existsSync(join(repo, 'frontend', 'dist', 'launch', 'browser', 'index.html'))) throw new Error('Run `npm run build:launch` in frontend/ first');
      await apiStart();
      startProcess('site', process.execPath, [join(here, 'serve-launch.mjs'), '--port', String(SITE_PORT), '--api', `http://localhost:${API_PORT}`], repo, process.env);
      await waitFor(SITE_URL);
      console.log(`API on http://localhost:${API_PORT} (PostgreSQL), launch site on ${SITE_URL}`);
      break;
    }
    case 'down':
      stopProcess('site');
      await apiStop();
      break;
    case 'api-stop':
      await apiStop();
      break;
    case 'api-start':
      await apiStart();
      break;
    case 'reset':
      await reset();
      break;
    default:
      console.error('usage: launch-stack.mjs up | down | api-stop | api-start | reset');
      process.exit(2);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv[2]).catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
