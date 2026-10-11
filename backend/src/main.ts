/**
 * Composition root. `npm start` serves the API on PORT (default 4300):
 * PostgreSQL when DATABASE_URL is set (run `npm run migrate` first), otherwise
 * an in-memory database for local development.
 */
import type { Server } from 'node:http';
import { createApiApp } from './api-app.ts';
import { useSecureCookies } from './identity/sessions.ts';
import { seedDatabase } from './seed/index.ts';
import { TestEnvironments, testControl } from './testing/control.ts';
import { logGateway } from './platform/email-dispatch.ts';
import { azureEmailGateway } from './platform/azure-email.ts';
import { startBackgroundWork } from './maintenance/scheduler.ts';
import { loadConfig } from './platform/config.ts';
import { systemClock } from './platform/clock.ts';
import { MemoryDatabase } from './platform/memory-database.ts';
import { PostgresDatabase } from './platform/postgres-database.ts';
import { MemoryMediaStore, PostgresMediaStore } from './platform/media.ts';
import type { Environment } from './environment.ts';
import { PassThroughImageProcessing } from './platform/image-processing.ts';
import { SignatureScanner } from './platform/malware-scanner.ts';
import { createChallengeVerifier } from './platform/bot-challenge.ts';

const config = loadConfig();
const db = config.databaseUrl ? new PostgresDatabase(config.databaseUrl) : new MemoryDatabase();
const env: Environment = {
  db,
  clock: systemClock,
  media: db instanceof PostgresDatabase ? new PostgresMediaStore(db.connection) : new MemoryMediaStore(),
  // No image provider yet (L2-041.4–6 not implemented): uploads pass through unchanged.
  images: new PassThroughImageProcessing(),
  // No scanning provider yet: the stand-in flags only the EICAR test file.
  scanner: new SignatureScanner(),
  challenges: createChallengeVerifier(config),
};
if (config.databaseUrl && config.botChallenge === 'off') console.warn('Bot protection is OFF (BOT_CHALLENGE=off): sign-ups accept local stand-in tokens until Turnstile is configured (L2-104.9)');

useSecureCookies(config.secureCookies);
// Local development without a database starts from the fictional cast.
if (!config.databaseUrl && !config.testControl) await seedDatabase(env.db);

// Test mode (ADR 0009): one isolated, seeded environment per x-test-session header.
const testEnvs = config.testControl ? new TestEnvironments() : undefined;
const app = await createApiApp({
  environments: testEnvs ?? { resolve: () => env },
  control: testEnvs && testControl(testEnvs),
  config,
});
const server = app.getHttpServer() as Server;
// Outlive the idle timeout of clients and load balancers that reuse connections,
// so a reused socket is never closed under a request (Node's default is 5 s).
server.keepAliveTimeout = 65_000;
server.headersTimeout = 66_000;

// The background work: emails (L2-030), waiting photos (L2-091.2) and the daily
// maintenance job. In test mode it stays off so specs control time and read queued emails.
const emailGateway = config.databaseUrl
  ? azureEmailGateway(config.communicationEmailEndpoint!, config.communicationEmailSender!)
  : logGateway;
const stopBackgroundWork = testEnvs ? undefined : startBackgroundWork(env, emailGateway);
await app.listen(config.port);
console.log(`Sweet Hand API on http://localhost:${config.port}${config.databaseUrl ? '' : config.testControl ? ' (test mode)' : ' (in-memory database)'}`);

const stop = () => {
  stopBackgroundWork?.();
  void app.close().then(() => env.db.close()).then(() => process.exit(0));
};
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
