# Releasing to sweethand.ca

The short version of how a change on `main` reaches the live site. The full process,
hotfixes and rollback are in [`environments.md`](environments.md).

## The one-minute picture

```
main  ──automatic──▶  staging  ──tag v1.2.3-rc.1──▶  UAT  ──tag v1.2.3──▶  production
```

- **Merging to `main` does not change sweethand.ca.** It only deploys staging.
- Production deploys only from a release tag, and only if that exact commit already
  deployed successfully to UAT.
- Tags are never moved or reused. A second attempt is `-rc.2`.

## Step by step

### 1. Merge and wait for staging

Merge the pull request. CI runs on `main`, then *Deploy staging* runs automatically.
Wait for it to be green under **Actions → Deploy staging**. If it is red, fix `main`
and go back to this step.

### 2. Pick the version

Semantic versions, `vMAJOR.MINOR.PATCH`:

| Change | Bump |
|---|---|
| Hotfix, no new behaviour | PATCH (`v0.1.0` → `v0.1.1`) |
| New behaviour | MINOR (`v0.1.0` → `v0.2.0`) |
| The product opens and pre-launch mode ends | MAJOR (`v1.0.0`) |

List existing tags with `git tag --sort=-creatordate`.

### 3. Tag the release candidate (deploys UAT)

Tag the commit that staging just served. `origin/main` is that commit when nothing
has merged since; otherwise use the commit's SHA.

```bash
git fetch origin && git tag -a v0.2.0-rc.1 -m "Release candidate 0.2.0-rc.1" origin/main && git push origin v0.2.0-rc.1
```

*Deploy UAT* starts within a minute and takes about 15 minutes. Wait for it to be
green under **Actions → Deploy UAT**. Check the change on UAT if it matters.

If UAT finds a problem: fix it on `main`, wait for staging, then tag `-rc.2`.

### 4. Tag the release (deploys production)

Tag the **same commit** the candidate points to:

```bash
git tag -a v0.2.0 -m "Release 0.2.0" v0.2.0-rc.1^{commit} && git push origin v0.2.0
```

*Deploy production* checks that this commit passed UAT, then deploys. If the
`production` GitHub environment has a required reviewer, approve the run under
**Actions → Deploy production**; otherwise it deploys straight away. It takes about
15 minutes.

### 5. Check the live site

Open https://sweethand.ca/ and hard-refresh (Ctrl+Shift+R). Browsers cache favicons
hard; if an icon still looks old, open https://sweethand.ca/favicon.ico directly.

## Rollback

Run **Actions → Deploy production → Run workflow** and choose the earlier release tag
under *Use workflow from*. The database is not rolled back.

## Why staging and UAT smoke checks look different

Staging and UAT sit behind a site password, and the API linked to Static Web Apps
accepts calls only from Static Web Apps. Their smoke checks therefore confirm the API
revision is `Healthy` and that the site redirects to its sign-in page. Production
checks the real pages and API paths.
