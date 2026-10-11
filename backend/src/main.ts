/**
 * Composition root. `npm start` serves the API on PORT (default 4300):
 * PostgreSQL when DATABASE_URL is set (run `npm run migrate` first), otherwise
 * an in-memory database for local development.
 */
import { createServer } from 'node:http';
import { createApp } from './app.ts';
import { productOptions } from './product.ts';
import { useSecureCookies } from './identity/sessions.ts';
import { seedDatabase } from './seed/index.ts';
import { TestEnvironments, testControl } from './testing/control.ts';
import { loadConfig } from './platform/config.ts';
import { systemClock } from './platform/clock.ts';
import { MemoryDatabase } from './platform/memory-database.ts';
import { PostgresDatabase } from './platform/postgres-database.ts';
import { MemoryMediaStore, PostgresMediaStore } from './platform/media.ts';
import type { Environment } from './environment.ts';

const config = loadConfig();
const db = config.databaseUrl ? new PostgresDatabase(config.databaseUrl) : new MemoryDatabase();
const env: Environment = {
  db,
  clock: systemClock,
  media: db instanceof PostgresDatabase ? new PostgresMediaStore(db.connection) : new MemoryMediaStore(),
};

useSecureCookies(config.secureCookies);
// Local development without a database starts from the fictional cast.
if (!config.databaseUrl && !config.testControl) await seedDatabase(env.db);

// Test mode (ADR 0008): one isolated, seeded environment per x-test-session header.
const testEnvs = config.testControl ? new TestEnvironments() : undefined;
const app = createApp({
  environments: testEnvs ?? { resolve: () => env },
  control: testEnvs && testControl(testEnvs),
  ...productOptions(),
  config,
});
const server = createServer(app);
server.listen(config.port, () => console.log(`Sweet Hand API on http://localhost:${config.port}${config.databaseUrl ? '' : config.testControl ? ' (test mode)' : ' (in-memory database)'}`));

const stop = () => server.close(() => void env.db.close().then(() => process.exit(0)));
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
