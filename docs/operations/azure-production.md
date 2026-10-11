# Azure production runbook

## Account and resource boundary

| Setting | Selected value |
|---|---|
| Subscription | Pay-As-You-Go |
| Subscription ID | `4a1b5113-89f9-4d27-acfe-581493385536` |
| Tenant ID | `c68758f6-70fb-41fe-8fb3-b3e35624a2a3` |
| Production resource group | `rg-sweethand-prod` |
| Primary region | Canada Central |
| Geo-backup region | Canada East |
| Public domain | `sweethand.ca` |
| Operational notifications | `quinntyne@hotmail.com` |

`infra/main.bicep` is the source of truth. `infra/deploy.ps1` is the interactive Azure CLI bootstrap. GitHub Actions applies the same template through workload identity federation after each successful `main` build.

## Services and data location

- Azure Static Web Apps Standard uses the East US 2 control plane, serves only prerendered public files globally and links `/api` to the Canadian Container App. Azure does not offer a Canada Central Static Web Apps control-plane location on this subscription.
- Azure Container Apps runs one 0.5-vCPU, 1-GiB API replica. Maximum replicas remain one while the scheduler runs inside the API process.
- PostgreSQL Flexible Server B1ms stores launch-list and outbox data on a private subnet. It retains 35 days of point-in-time backups and a geo-redundant backup in Canada East.
- Key Vault stores the database URL, IP-hash key and Turnstile secret. The API reads versioned references through its managed identity.
- Azure Communication Services Email uses Canada data location. The verified custom domain sends as `Sweet Hand <hello@sweethand.ca>`.
- Log Analytics and Application Insights retain redacted operational telemetry for 30 days.
- Container Registry Standard stores commit-tagged API images. Azure rejected the Basic tier for this subscription in Canada Central during deployment.

Static public files use Azure's global edge. Cloudflare processes only the bot challenge after local form validation. Personal launch-list records, backups and Azure email processing remain in Canada.

## External configuration

Namecheap remains authoritative. Preserve all Namecheap forwarding MX records. Replace the parking A and `www` records with the Static Web Apps validation records, add Azure Communication Services domain-verification and DKIM records, merge the Azure SPF include into the existing single SPF record, and add `_dmarc` with `v=DMARC1; p=none; rua=mailto:hello@sweethand.ca`.

Azure Communication Services cannot send from `hello@sweethand.ca` until the domain is linked. After the DNS records publish, run `az communication email domain initiate-verification` for `Domain`, `SPF`, `DKIM` and `DKIM2`; once `az communication email domain show` reports each as `Verified`, the next Deploy production run links the domain (`linkEmailDomain=true`). Until then delivery warns and leaves it unlinked, so a foundation run cannot fail on an unverified domain.

Namecheap forwarding shall keep `hello@sweethand.ca` delivering to the monitored inbox. Cloudflare Turnstile shall use a managed widget restricted to `sweethand.ca` and `www.sweethand.ca`. Store the public site key as GitHub environment variable `TURNSTILE_SITE_KEY` and its secret as `TURNSTILE_SECRET`.

The email footer uses this runtime configuration and does not expose a maker address:

`309–2091 Hurontario Street, Mississauga, Ontario L5A 4E6`

## Deployment and rollback

1. CI validates locked installs, tests, lint, types, builds, i18n catalogues, Chromium acceptance behavior, secrets and the production image.
2. Delivery authenticates with GitHub OIDC and asserts the subscription ID.
3. Bicep applies the foundation. ACR builds the immutable `sweet-hand-api:<commit>` image.
4. The Container Apps migration job runs `npm run migrate`. A failed job stops the release.
5. Bicep updates the API only after migration. Container Apps readiness gates the single active revision.
6. Static Web Apps receives the prerendered launch files. Smoke checks cover `/`, `/privacy`, the public launch-list status and a concealed product endpoint.

Delivery stops before touching Azure when `TURNSTILE_SITE_KEY` or `TURNSTILE_SECRET` is missing from the `production` environment.

If any step after promotion fails, the workflow redeploys the API image that was serving before the run (`az containerapp update --image <previous>`), which creates a new revision from the known-good image; the app runs in single-revision mode, so a traffic split is not available. To roll back by hand, read the image of an earlier revision with `az containerapp revision list -g rg-sweethand-prod -n ca-swh-api -o table` and apply it the same way. Re-run smoke checks. For a static rollback, rerun the last successful Deploy production workflow for the known commit. Database migrations shall remain backward compatible with the preceding image.

## Recovery

Use point-in-time restore for operator error or local database failure and record the achieved recovery point and duration. Use geo-restore for a Canada Central regional loss. During launch, geo-backup may lag by up to one hour; this is an explicit temporary exception to the 15-minute local recovery-point target. Remove the exception before claiming a 15-minute cross-region RPO.

## Estimated monthly cost

Estimate dated 2026-10-11, in CAD before tax:

| Service | Monthly estimate |
|---|---:|
| Static Web Apps Standard | $13 |
| PostgreSQL B1ms, 32 GiB and backups | $25–35 |
| Container Apps, one lean available replica | $12–30 |
| Container Registry Standard | $27–30 |
| Log Analytics and Application Insights | $0–8 |
| Key Vault, Communication Services Email and minor network use | $1–5 |
| Cloudflare Turnstile | $0 |
| **Expected total** | **$78–121** |

The estimate excludes Namecheap fees, tax, support, unusual egress and a future cross-region database replica. The registry tier makes the upper estimate exceed the original CAD 100 target under sustained Container Apps or log usage. `infra/main.bicep` declares the resource-group-scoped CAD 100 monthly budget (`budget-swh-prod`): it sends actual-cost notices at 50%, 80% and 100% and a forecast notice at 100%.
