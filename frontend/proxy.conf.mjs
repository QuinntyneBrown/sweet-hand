// Dev server proxy to the fake backend (ADR 0004). E2E_API_PORT lets parallel checkouts use their own ports.
const target = `http://localhost:${process.env.E2E_API_PORT ?? 4300}`;
export default {
  '/api': { target, secure: false },
  '/media': { target, secure: false },
};
