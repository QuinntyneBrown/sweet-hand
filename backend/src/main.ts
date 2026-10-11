/**
 * Composition root. `npm start` serves the API on PORT (default 4300):
 * PostgreSQL when DATABASE_URL is set (run `npm run migrate` first), otherwise
 * an in-memory database for local development.
 */
import { createServer } from 'node:http';
import { createApp } from './app.ts';
import { productAreas } from './areas.ts';
import { loadConfig } from './platform/config.ts';
import { systemClock } from './platform/clock.ts';
import { MemoryDatabase } from './platform/memory-database.ts';
import { PostgresDatabase } from './platform/postgres-database.ts';
import type { Environment } from './environment.ts';

const config = loadConfig();
const env: Environment = {
  db: config.databaseUrl ? new PostgresDatabase(config.databaseUrl) : new MemoryDatabase(),
  clock: systemClock,
};

const app = createApp({ environments: { resolve: () => env }, areas: productAreas, config });
const server = createServer(app);
server.listen(config.port, () => console.log(`Sweet Hand API on http://localhost:${config.port}${config.databaseUrl ? '' : ' (in-memory database)'}`));

const stop = () => server.close(() => void env.db.close().then(() => process.exit(0)));
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
