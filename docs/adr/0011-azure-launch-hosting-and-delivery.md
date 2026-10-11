# ADR 0011: Azure launch hosting and delivery

## Status

Accepted — 2026-10-11

## Context

The prerendered launch application and launch-list API require a public production home, Canadian data residency, transactional email, bot protection and repeatable delivery. The API also runs scheduled outbox work, so a scale-to-zero backend would delay email.

## Decision

Azure subscription `Pay-As-You-Go` (`4a1b5113-89f9-4d27-acfe-581493385536`) hosts the production resource group in Canada Central. Azure Static Web Apps Standard serves the launch build and links `/api` to an Azure Container App. The Container App runs one minimum replica and connects privately to PostgreSQL Flexible Server. PostgreSQL retains 35 days of point-in-time backups and geo-redundant backup in Canada East.

Azure Communication Services Email sends from `hello@sweethand.ca` through managed identity. Cloudflare Turnstile supplies the managed bot challenge and loads only after a locally valid form submission. Namecheap remains authoritative for DNS and inbound email forwarding.

Bicep defines Azure resources. Azure CLI applies Bicep. GitHub Actions authenticates with workload identity federation, validates every change, and deploys every successful `main` commit without path filters. A migration job succeeds before traffic changes. Production runs in pre-launch mode, which conceals every API route outside the launch-list surface.

## Consequences

- The static application and API share `sweethand.ca`, preserving cookie and CSRF behavior.
- The API keeps one replica until background work moves to a separately scaled worker.
- Turnstile is a disclosed third-party processor, but it is absent from the first page load.
- The lean database tier accepts a temporary regional recovery-point exception of up to one hour. Local point-in-time recovery retains the 15-minute target.
- Namecheap and Cloudflare each require one-time account-side configuration outside Azure CLI.
