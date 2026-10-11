/** Ports for the web app and backend; override per checkout to run suites side by side. */
export const WEB_PORT = Number(process.env['E2E_WEB_PORT'] ?? 4200);
export const API_PORT = Number(process.env['E2E_API_PORT'] ?? 4300);
export const WEB_URL = `http://localhost:${WEB_PORT}`;
export const API_URL = `http://localhost:${API_PORT}`;
export const LAUNCH_PORT = Number(process.env['E2E_LAUNCH_PORT'] ?? 4201);
export const LAUNCH_URL = `http://localhost:${LAUNCH_PORT}`;
