# How the sprint board is deployed

What was done to publish the founder's sprint board (`frontend/projects/board/`,
ADR 0013) as a public static website, how it works, and what to do when it fails.
ADR 0014 records the decision.

## What was done

- **A workflow, `.github/workflows/deploy-board.yml`.** It runs on every push to
  `main` and on request (**Actions → Deploy board → Run workflow**). It:
  1. regenerates `backlog.json` from that commit's `docs/plans/launch-backlog.md`
     and builds the board (`npm run build:board`);
  2. signs in to Azure as the staging deployer, the identity that already deploys
     staging on every push to `main` (the `staging` GitHub environment, Contributor
     on `rg-sweethand-staging`);
  3. creates a Free-tier Azure Static Web App, `swa-sweethand-board`, in
     `rg-sweethand-staging` the first time, and reuses it afterwards;
  4. reads the app's deployment token from Azure and uploads `dist/board/browser`;
  5. prints the board's address.
- **Nothing to set up by hand.** No new secret, no new Azure identity, no Bicep. The
  product's templates (`infra/main.bicep`) and environments are untouched.
- **No security on the board.** It is public at the app's default hostname, with no
  password, no sign-in and no custom domain. The board holds no personal data: the
  backlog is public in this repository and each board's state stays in that
  browser's `localStorage`.
- **Documentation.** ADR 0014 (amending ADR 0013, which said the board is never
  deployed), `AGENTS.md`, `frontend/README.md` and `environments.md`.

## What merging does

Merging a pull request pushes to `main`, which runs **Deploy board**. A few minutes
later the board serves the backlog as it is on that commit. The run's last line is
the URL, which looks like `https://<random-words>.<n>.azurestaticapps.net/`.

Merging to `main` still deploys staging as before; the board run is separate and
does not wait for CI.

## Why the first run failed

Azure allows ten Free-tier static sites per subscription, and the Sweet Hand
subscription already had ten, so creating the board's app was refused:

```
ERROR: (BadRequest) Sku is invalid. This subscription has too many static sites with SKU: Free.
```

None of the ten is a Sweet Hand product site; `swa-sweethand-launch-prod`,
`-staging` and `-uat` are Standard.

## What to do

Delete one Free static site, then merge or re-run the workflow:

```sh
az staticwebapp list --query "[?sku.name=='Free'].{name:name, resourceGroup:resourceGroup}" -o table
az staticwebapp delete --name <name> --resource-group <resourceGroup> --yes
```

The create step checks whether `swa-sweethand-board` exists before creating it, so
an app created by hand with that name in `rg-sweethand-staging` is used as is.

If paying is preferable to deleting, change `--sku Free` to `--sku Standard` in the
workflow (about USD 9 a month); Standard has no such limit.
