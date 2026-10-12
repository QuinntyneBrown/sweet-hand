# ADR 0012: Environments and release promotion

## Status

Accepted — 2026-10-12. Supersedes the delivery trigger in [ADR 0011](0011-azure-launch-hosting-and-delivery.md).

## Context

ADR 0011 deploys every successful `main` commit straight to production. That leaves nowhere
to see a change on Azure before visitors do, nowhere stable for acceptance testing, and no
way to ship an urgent fix while `main` holds unfinished work. The launch list holds real
personal information, so a pre-production environment must not share production's data or
secrets.

## Decision

Sweet Hand runs four environments: development (local and CI), staging, UAT and production.
`docs/operations/environments.md` is the process; L2-109 holds its acceptance criteria.

- Staging (`staging.sweethand.ca`) and UAT (`uat.sweethand.ca`) are full copies of production,
  built from the same `infra/main.bicep` with an `envName` parameter, each in its own resource
  group in the same subscription with its own database, Key Vault, identities, registry and
  GitHub deployer. They use local-only 7-day backups, an Azure-managed email sender and a
  Static Web Apps password.
- Trunk-based development on `main`. Every green `main` commit deploys to staging.
- A tag `vX.Y.Z-rc.N` deploys its commit to UAT when CI passed on it. A tag `vX.Y.Z` deploys
  to production only if that exact commit deployed successfully to UAT, and only after a
  required reviewer approves the `production` GitHub environment.
- Hotfixes branch from the production tag as `release/vX.Y`, go through CI, UAT and approval,
  and are merged back into `main`.
- One reusable workflow (`deliver.yml`) performs every delivery, so staging and UAT exercise
  exactly the steps production runs.

## Consequences

- Production no longer changes on merge; a release is a deliberate tag and approval.
- Staging and UAT roughly triple the Azure bill before launch (about CAD 70–110 a month each).
  UAT may be created later, but production cannot be released until it exists.
- Each environment builds its own API image from the same commit rather than promoting one
  image digest across registries. Locked dependencies keep the builds equivalent; sharing a
  registry is a possible later improvement.
- Migrations reach staging, UAT and production in order and must stay backward compatible
  with the image they replace.
- GitHub environment variables and secrets must be set per environment, not on the repository.
