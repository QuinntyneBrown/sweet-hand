# Contributing to Sweet Hand

Thank you for wanting to help Caribbean home cooks in Toronto and the GTA get
found. This guide explains how to propose a change and what a pull request
needs before it can be merged.

By taking part you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Table of contents

- [Ways to contribute](#ways-to-contribute)
- [Before you start](#before-you-start)
- [Development setup](#development-setup)
- [How we build: requirement first, test first](#how-we-build-requirement-first-test-first)
- [Coding conventions](#coding-conventions)
- [Testing](#testing)
- [Commit messages](#commit-messages)
- [Pull requests](#pull-requests)
- [Reporting bugs and requesting features](#reporting-bugs-and-requesting-features)
- [Security issues](#security-issues)
- [License](#license)

## Ways to contribute

- Report a bug or suggest an improvement in
  [GitHub Issues](https://github.com/QuinntyneBrown/sweet-hand/issues).
- Improve requirements, designs, mocks or documentation.
- Pick up an open issue, or an item in [`docs/technical-debt/`](docs/technical-debt/).
- Review open pull requests.

If you know the communities and cuisines well, corrections to dish names,
island traditions and dietary terms are especially welcome.

## Before you start

- **Read [`AGENTS.md`](AGENTS.md).** It is the working agreement for everyone
  who changes this repository, people and coding agents alike: the domain
  rules, architecture and conventions live there.
- **Open or find an issue first** for anything larger than a typo, so the
  approach can be agreed before you invest time in it.
- **Read the relevant ADRs** in [`docs/adr/`](docs/adr/) before changing the
  areas they cover. If you want to change a decision, propose a new ADR.

## Development setup

You need Node.js 22.18 or newer. PostgreSQL is optional; development and all
tests run on an in-memory database.

```sh
git clone https://github.com/<your-username>/sweet-hand.git
cd sweet-hand
npm install --prefix backend
npm install --prefix frontend

cd frontend
npm start   # API on :4300 and the app on :4200
```

See [`backend/README.md`](backend/README.md) and
[`frontend/README.md`](frontend/README.md) for every command and setting.

## How we build: requirement first, test first

Every change to production behaviour, including a change to how an existing
page behaves, follows the same path:

1. **Requirement.** Add or update the L1/L2 requirement in
   [`docs/specs/`](docs/specs/), with acceptance criteria. UI components also
   get a component requirements document in `docs/specs/components/`.
2. **Detailed design** in [`docs/detailed-designs/`](docs/detailed-designs/).
3. **Mock** in [`docs/mocks/`](docs/mocks/) for every page, dialog and
   notification the change touches, in every state.
4. **Implement incrementally with acceptance tests first (ATDD).** Plan small,
   reviewable slices. For each slice: write Given-When-Then criteria, write the
   acceptance test, run it and see it fail for the expected reason, then write
   only the code that makes it pass. Refactor with the tests green and run the
   regression checks before the next slice.

Documentation-only, design-system-only, mock-only and test-only changes do not
need this path. Mocks and the design system are design artifacts and do not
get tests.

The project skills in `.claude/skills/` describe each step in detail
(`engineering-requirements`, `writing-software-design-documents`,
`writing-html-mocks`, `implementing-incrementally` and others). They are
mirrored in `.agents/skills/`; keep the two copies identical.

## Coding conventions

The full list is in [`AGENTS.md`](AGENTS.md) and
[`frontend/README.md`](frontend/README.md). The ones reviewers check most:

**Domain**

- Never show a maker's exact home address publicly.
- Never expose one maker's private data or one eater's data to another user.
- Keep Caribbean traditions distinct and spell dishes as their communities do.
- Model allergens and dietary tags as structured data, not free text.
- Default to `en-CA`, CAD and the `America/Toronto` time zone.
- Seed data is fictional and idempotent.

**Backend**

- Business rules live in use cases and domain functions, never in controllers.
- Every route declares an endpoint policy with `@UsePolicy`; anonymous access
  is an explicit choice.
- Migrations run only through `npm run migrate`, never on startup.

**Frontend**

- Pages inject the abstract service classes from `@sweet-hand/api`, never the
  `Http…` implementations.
- One type per file, in a kebab-case file.
- Every component keeps its template and styles in separate files.
- No inline forms in pages: editing opens a dialog or a separate screen.
- Mark all user-facing text for Angular i18n; lint fails otherwise.
- Use design tokens by role, never by hex value; product code adds no global CSS.
- Mobile first, and WCAG 2.2 AA.

## Testing

```sh
cd backend
npm test            # acceptance tests against the API, in-memory database
npm run typecheck

cd ../frontend
npm run e2e         # Playwright, Chromium only, against the backend in test mode
npm run lint
npm run typecheck
```

- **Backend:** acceptance tests drive the API over HTTP with the NestJS app
  in-process on the in-memory database. No test starts PostgreSQL.
- **Frontend:** Playwright with the Page Object Model, one page object per
  screen. Tests state intent; page objects own the selectors. Never put a
  selector in a test.
- Run frontend tests in Chromium only.
- Do not write architecture tests (structure, naming, banned-API scans or
  specification parsing). Tests prove behaviour.
- Never skip, disable or weaken a test to get a green build.

## Commit messages

Write a short summary line in the imperative mood that says what changes for
the people who use Sweet Hand, for example:

```
Send operators to sign in after they sign out
```

Add a body when the reason is not obvious from the summary. Reference the
issue or requirement it addresses (for example `Fixes #12` or `L2-065`).

## Pull requests

1. Fork the repository and create a branch from `main`.
2. Make your change following the path above, keeping each pull request to one
   reviewable change.
3. Run the tests and checks for every part of the stack you touched.
4. Update documentation, including `AGENTS.md` if you change the repository
   layout or an architectural rule.
5. Open the pull request and fill in the template: what a user sees before and
   after, and how you tested it. Include screenshots at phone width for
   visible changes.

A pull request is ready to merge when CI is green, review comments are
resolved and a maintainer has approved it. Maintainers may ask for changes or
close pull requests that do not fit the project's direction; opening an issue
first avoids that.

## Reporting bugs and requesting features

Use the issue templates:

- **Bug report:** what happened, what you expected, steps to reproduce, and
  your browser, device and screen width.
- **Feature request:** the problem from a maker's or eater's point of view
  before the solution.

Search existing issues first, and never include real people's personal
information in an issue.

## Security issues

Do not report security vulnerabilities in public issues. Follow
[SECURITY.md](SECURITY.md).

## License

By contributing, you agree that your contributions are licensed under the
[MIT License](LICENSE) that covers this project.
