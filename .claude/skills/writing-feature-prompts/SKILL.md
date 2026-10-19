---
name: writing-feature-prompts
description: Write a ready-to-run implementation prompt for a feature request or a bug fix in any repository that uses the documentation skills (engineering-requirements, writing-html-mocks, extracting-design-systems, writing-component-requirements-documents, writing-software-design-documents, estimating-designs, implementing-incrementally), save it outside the repo and hand it back in full. Works the same on macOS, Windows, Linux and in a cloud session with no desktop. A feature prompt runs mocks, design system, component requirements, requirements, detailed design, estimate update and incremental ATDD implementation end to end, without stopping. A bug-fix prompt runs reproduce, root cause, fix and doc alignment. Use whenever the user asks to "create a prompt", "write a prompt for this feature" or "for this bug", wants a "prompt to build X" or "prompt to fix Y", or says "open it in notepad", "open it in an editor" or "give me the prompt".
---

# Writing feature prompts

Turn a feature request or a bug report into one prompt that another agent can run from start to finish. The
prompt directs the work. Do not design the solution here.

The prompt is built from the repository's skills, not from any fixed layout. Each phase names a skill; the
skill decides where its output lives. Everything else about the repository (its stack, folders, component
library, test runner, branch rules) comes from the repository's own `AGENTS.md` or `CLAUDE.md` and from
reading the code, and is written into the prompt as real paths.

## Steps

1. **Gather context (read-only, quick).**
   - Read the repository's `AGENTS.md` / `CLAUDE.md` for its layout, conventions, rules and the skills it
     requires. Note which of the documentation skills it has (`ls .claude/skills .agents/skills`) and what
     each one says about where it writes: requirements, mocks, design system, component requirements
     documents (CRDs), detailed designs, estimates, ADRs.
   - Grep for what the request touches: the screens, components, services, API routes, existing requirement
     IDs (and the next free ID), mocks and the matching detailed-design folder.
   - Find how the repository runs and tests code: the unit, API and end-to-end commands, the page-object
     folder for e2e tests, the runtime version, and the branch and PR rules.
   - Name real paths in the prompt, for example "the label comes from `initial()` in
     `<path-to>/top-bar.html`". The finished prompt contains the actual path.
2. **Choose the template:** Feature or Bug fix (below).
3. **Write the prompt** to `<scratchpad>/<kebab-slug>-prompt.md`. Use the session's scratchpad directory if it
   has one, otherwise the OS temp directory. Never write it into the repository.
4. **Hand it back in a way that works everywhere.** The session may be on macOS, Windows or Linux, or in a
   cloud sandbox with no desktop and no editor. So:
   - Always paste the complete prompt into the reply, in one fenced code block, so the user can copy it from
     anywhere. The saved file is a convenience, not the only copy.
   - Give the file's full absolute path.
   - Open an editor only if the user asked for one by name or said "open it", and only if a desktop is
     reachable. Use the platform's own opener (`notepad.exe` on Windows, `open -e` on macOS, `xdg-open` on
     Linux). If the opener is missing or fails, say so in one line and rely on the pasted copy. Do not retry
     or install anything.
5. **Reply** with a brief summary of what the prompt covers, above the pasted prompt.

## Writing rules

- Fill in real paths, component names, commands and requirement IDs from this repository. Leave no
  `<placeholders>` in the finished prompt.
- Name only the skills the repository actually has. Drop a phase whose skill is missing, and say so in the
  reply. Keep the order of the phases that remain.
- Keep to what the user asked for. Put anything nearby under "deferred", not into the scope.
- List states and slices as suggestions the implementer can adjust.
- Write in plain, short sentences.

## Shared sections (use in both templates, verbatim apart from the noun and the filled-in details)

```markdown
## Finish the whole <feature|fix> in one run. Do not stop. (CRITICAL)

- You are authorised to take this <feature|fix> all the way: <the phases>, green tests and a PR. Go through
  every phase and every slice in one continuous run. Do not pause between phases to report, ask for approval,
  or wait for "continue".
- Do not end your turn until the "Done means" list at the bottom is fully true. A partial result, a plan, or
  "the next steps would be..." is not done.
- Where `AGENTS.md` / `CLAUDE.md` says "stop and ask", treat this prompt as the confirmation in advance for
  everything in scope here. Choose the simplest option that fits the existing architecture, record it (an ADR
  or the detailed design's open-questions section), and keep going.
- If the component library lacks something, that is not a reason to stop. Update the design, the CRD and the
  library first, as the rules require, then go on.
- When a test, build or command fails, find the root cause and fix it, then go on. Never weaken a test to make
  it pass, and never skip a step quietly.
- Only stop for a real blocker you cannot resolve yourself, such as missing credentials, or an action outside
  this repo that can't be undone, such as production deploys or data changes. If that happens, finish
  everything else first, then report the blocker clearly.
- Keep track of progress (a todo list), so that nothing gets left out after context is summarised.

## Rules (read first, binding)

- Follow `AGENTS.md` / `CLAUDE.md` exactly, especially:
  - **Scope lock and zero-waste engineering.** Build only what is described here. If something seems to need
    more scope, leave it out, note it as deferred, and continue. Do not stop.
  - **The component library is mandatory.** Build all UI from the repository's design-system components
    (<library and prefix, e.g. `@scope/components`, `xx-*`>), each built to its CRD.
  - **ATDD in small slices** with acceptance tests in the repository's test runner and page objects
    (<e2e folder>), the browsers the repository allows (<e.g. Chromium only>), and no architecture tests.
  - <Any other binding conventions from `AGENTS.md`, e.g. file-per-type, no single-file components, i18n.>
- Work through the phases below **in order**, using the skill each phase names.
- Copy the house style of each folder. Read the existing neighbours before you write anything new.
```

## Feature template

```markdown
# Feature: <title>

## Goal

<What the user sees and can do, who can do it (the roles), where it appears today (real files), and what
stays unchanged.>

<Shared sections>

## Phase 1: Mocks (`writing-html-mocks`)
- Update or add mocks for every state, light and dark, at phone, tablet and desktop widths, where the skill
  keeps them (<mocks folder>). <List the screens and states: default, empty, busy, success, invalid, failed...>
- Update the mocks' index and coverage matrix as the skill requires.

## Phase 2: Design system (`extracting-design-systems`)
- Update the design-system page for each component this touches (<design-system folder>) <with what>. Update
  tokens only if this needs new values.

## Phase 3: Component requirements (`writing-component-requirements-documents`)
- Add or update the CRD (`.md` and `.html`) for every design-system component that is new or changes, so the
  component can be built without later API changes. Trace each criterion to its requirement from Phase 4.

## Phase 4: Requirements (`engineering-requirements`)
- Add an L1 entry if needed, and new L2 requirements (next free ID after <L2-nnn>) with Given/When/Then
  acceptance criteria covering: <the behaviours, the validation, and the security and privacy concerns>.
- Cross-reference the requirements that already exist (<L2-xxx...>) instead of copying them.

## Phase 5: Detailed design (`writing-software-design-documents`)
- Add `<detailed-designs folder>/<subsystem>/<feature>/` with a README and diagrams in the house style. Cover
  the API, migrations, the frontend libraries and <the key decisions>. Record real decisions as an ADR where
  the repository keeps them (<ADR folder>).
- Update the existing designs this touches (<list>) only where needed.

## Phase 6: Estimate update (`estimating-designs`)
- Add the design to the estimates (the subsystem table and the root README total, percent complete and
  roadmap) at 0%, and update it again when the work is done.

## Phase 7: Incremental implementation (`implementing-incrementally`, ATDD)
- Plan thin vertical slices, for example:
  1. <slice>
  2. <slice>
- For each slice:
  - Write the Given-When-Then criteria.
  - Write the acceptance test (<e2e folder> with a `Traces to: L2-xxx` header and the page objects in
    <page-objects folder>, or API tests in <API test folder>).
  - Run it and show that it fails for the expected reason.
  - Implement the minimum that makes it pass, and refactor while the tests are green.
  - Run the regression checks (<commands>), then commit.
- Use <runtime and version> locally.
- When all slices are green, update the estimate to its true percent complete and keep the mocks, design
  system, CRDs and designs aligned with what was built.

## Done means
- <The behaviour, stated end to end.>
- All the new and existing API, unit and end-to-end tests pass (<commands>).
- The docs (mocks, design system, CRDs, L1/L2, detailed design, ADR, estimates) agree with the code.
- The work is on a branch with a PR to <default branch>, and the checks are green. Fetch and rebase onto
  <default branch> first, because another session may have pushed to it.
- Only then end the run, with a short summary of what was built, the decisions made along the way, and
  anything deferred.
```

## Bug-fix template

```markdown
# Bug fix: <title>

## Bug

<What happens, what should happen, how to reproduce it, and where it lives (real files). The requirement it
breaks: L2-<nnn>.>

<Shared sections>

## Phase 1: Reproduce
- Write a failing test that shows the bug: an end-to-end acceptance test (with a `Traces to: L2-<nnn>` header
  and page objects in <page-objects folder>) for visible behaviour, or an API test in <API test folder>. Run
  it and show that it fails for the bug's reason.

## Phase 2: Root cause
- Find and state the cause, not the symptom. Check for the same cause elsewhere.

## Phase 3: Fix
- Make the smallest change that turns the test green. Refactor while it is green, run the regression checks
  (<commands>), then commit.

## Phase 4: Align the docs (only if the behaviour or the spec was wrong or silent)
- Update the L2 criteria, the detailed design, the CRD or the mocks to match, using the skill that owns each.
- Update the estimates (`estimating-designs`) only if a design's percent complete changes.

## Done means
- The bug is gone, and the new test proves it.
- All the existing API, unit and end-to-end tests pass (<commands>).
- The work is on a branch with a PR to <default branch>, and the checks are green. Fetch and rebase onto
  <default branch> first.
- Only then end the run, with a short summary of the cause, the fix and anything deferred.
```
