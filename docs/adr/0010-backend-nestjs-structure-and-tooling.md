# 0010 — NestJS application structure and tooling

- Status: Accepted (refines ADR 0006, which chooses NestJS)
- Date: 2026-10-11

## Context

ADR 0006 chooses NestJS on Node.js 22. The backend was first built on
`node:http` with a router of our own, run by Node's type stripping, and then
moved to NestJS area by area. NestJS relies on decorators and their type
metadata, which Node's type stripping cannot run.

## Decision

- The HTTP layer is NestJS 11 on its Express adapter. Each feature area has a
  controller (`src/<area>/<area>.controller.ts`) whose methods only map a
  route to the area's use case; business rules stay in the use cases and
  domain functions, unchanged.
- Endpoint policies (authorise-requests design) are a `@Policy(...)`
  decorator read by a global guard: `anonymous` (explicit), `roles(...)`,
  `signedIn`, `admins`. A route without a policy is refused.
- The request pipeline is Nest middleware, guards, an interceptor and an
  exception filter: the environment and correlation ID, security headers,
  the CSRF cookie and check, body limits and control-character removal, the
  public read rate limit, authentication and the endpoint policy, and one
  database transaction around each handler. Use cases keep returning a
  `Reply` (status, body, headers); the interceptor writes it.
- The persistence port, adapters, seed, test mode and the HTTP-level
  acceptance tests (ADRs 0008, 0009) do not change. Areas do not use NestJS
  providers for their use cases yet; ADR 0007's repository ports as
  injectable abstract classes are not adopted (see ADR 0008).
- TypeScript runs through SWC (`node --import @swc-node/register/esm-register`)
  in development, tests and production, with `experimentalDecorators` and
  `emitDecoratorMetadata`. There is still no separate build output, so
  migrations, seed files and the cast's photos are read from the source tree.
  `tsc --noEmit` checks types.

## Consequences

- Controllers, providers and modules follow the NestJS conventions newcomers
  expect; cross-cutting concerns use NestJS primitives.
- Use cases depend on our `Request` context, not on Express or NestJS, so the
  rules stay framework-free and testable through the API.
- The SWC loader adds about a second to process start.
