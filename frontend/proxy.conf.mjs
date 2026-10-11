// Dev server proxy to the backend (ADRs 0006, 0008). E2E_API_PORT lets parallel checkouts use their own ports.
const target = `http://localhost:${process.env.E2E_API_PORT ?? 4300}`;
export default {
  '/api': { target, secure: false },
  '/media': { target, secure: false },
};
