# Progress log

## Goal

Make tengrids a dependable, agent-ready fork of Glide Data Grid: current React baseline, reproducible Node-only tooling that works on any machine without shell prerequisites, fast verifiable feedback loops (tests, lint, types, CI), and the component library synced to claude.ai/design so designs are built from the real grid. Every step is recorded here so anyone — human or agent — can pick up where the last session left off.

Running log of work on tengrids. Newest entries at the bottom; each entry is appended when the work happens.

## 2026-09-01

### Fork setup
- Cloned glideapps/glide-data-grid (v6.0.4-alpha25), analyzed architecture (canvas render pipeline, blit/damage model, cell system, native-scroll virtualization).
- Rebranded as **tengrids**: rewrote README with attribution to Glide, added AGENTS.md (env prereqs, commands, architecture map, gotchas) with CLAUDE.md symlinked to it, renamed root package. Commit `bdec072`.
- Created public repo github.com/moeghashim/tengrids with full upstream history; `upstream` remote removed at user's request. Repo moved to `/Users/moeghashim/tengrids` (top level).

### React upgrade
- Bumped dev baseline React 19.1.1 → 19.2.8 (latest stable per npm dist-tags).
- Migrated 11 test files off deprecated `@testing-library/react-hooks` to RTL `renderHook`; rewrote 3 render-count tests that used `result.all`. Dropped `react-test-renderer`, fixed `act` import, set `IS_REACT_ACT_ENVIRONMENT` in all vitest setups.
- Fixed `setup-react-18-test.sh` (had drifted to `@latest`), added `test-latest` script + `test-react-latest` CI job.
- Verified: core 387/387 on React 19.2.8 and 18.3.1; source 7/7; cells 64/64. Commit `6e64447`.
- Installed Homebrew bash 5.3 so the bash-4-only build works locally.

### Design sync (claude.ai/design)
- Synced to Claude Design project `83bf1f56-58a8-4aa4-b190-b3b6baf9a446` (https://claude.ai/design/p/83bf1f56-58a8-4aa4-b190-b3b6baf9a446).
- `DataEditor` verified against reference Storybook: 12/12 graded stories `match`; validate clean.
- Forked converter `story-imports.mjs` to stub linaria `styled`/`css` at runtime (story helpers use linaria). Conventions header authored for the design agent. Commit `b359363`.

### Dev CLI (replacing shell scripts) — IN PROGRESS
- [x] Wrote `scripts/cli.mjs` (`build`, `version`, `test --react`, `bootstrap`) — Node only, removes bash 4 + jq requirement.
- [x] Rewired npm scripts (root `version`/`test-18`/`test-19`/`test-latest`/`test-projects`; package `build`/`watch`) to the CLI; CI command names unchanged.
- [x] Parity check `build core` vs shell build: 550 files, all JS/maps/CSS byte-identical. Two benign diffs: `.d.ts` files now keep their `sourceMappingURL` trailer (shell build lost it to a concurrent-tsc race); `index.css` imports sorted instead of filesystem order.
- [x] Built cells + source via CLI (parallel after core); all suites green against CLI output: core 387/387, source 7/7, cells 64/64.
- [x] `version` round-trip (→ 9.9.9-cli-test → back): all 4 package versions + both workspace deps on core set and restored; git diff clean apart from script rewiring.
- [x] Deleted the 9 shell scripts + `config/build-util.sh`; grep confirms no remaining `.sh` references in package.json files, CI workflows, or design-sync config.
- [x] README Development section and AGENTS.md (Environment + Commands table) updated: Node is the only prerequisite; CLI commands documented. `.design-sync/NOTES.md` bash-4 bullets updated.
- [x] `test --react latest`: swapped install ran 387/387, then package.json/package-lock restored and React back to 19.2.8 (fixes the old scripts' permanent-rewrite footgun; restore is skipped when `CI` is set).
- [x] Committed + pushed as "Replace shell scripts with a Node developer CLI". Storybook dev server restarted so its watcher uses the CLI.

### Dev CLI — DONE
Result: 194 lines of bash across 9 files replaced by one ~220-line Node CLI. Only prerequisite is Node. Build output byte-identical to the shell build for all JS/CSS/maps; `.d.ts` files gained their (previously lost) sourcemap trailers.

## 2026-09-02

### CI: Storybook Build and Deploy failing
- Reported failing on `e0d6816`. Diagnosis: the main `Build` workflow passed (CLI works in CI); the Storybook job built fine but its Deploy step got `403 Permission denied to github-actions[bot]` pushing `gh-pages`. Inherited workflow never declared `contents: write`, and new repos default `GITHUB_TOKEN` to read-only. Same failure on `6e64447` — predates the CLI.
- Fix: added `permissions: contents: write` to `.github/workflows/storybook.js.yml` and moved `JamesIves/github-pages-deploy-action` from 3.6.2 (2020) to v4 (lowercase inputs, token defaults to `GITHUB_TOKEN`).
- Also added `workflow_dispatch` and made the workflow trigger on edits to itself. Committed as `132d7ce`; the triggered run **succeeded** and created the `gh-pages` branch with the built Storybook under `docs/`.
- GitHub Pages enabled via API at user's request (source `gh-pages` branch, `/docs` folder) → Storybook published at https://moeghashim.github.io/tengrids/. Verified live (HTTP 200, stories render in the browser). Only console noise: a 404 for `/vite-inject-mocker-entry.js`, Storybook 9's mocking shim requested at the domain root instead of the subpath — harmless, same as upstream's deployment.

### README: Developer CLI section
- Added a "Developer CLI" section to README.md documenting `npm run cli -- <build|version|test|bootstrap>` with a command table, the no-shell-prerequisites guarantee, and which npm scripts delegate to it. Added the published Storybook URL.

### AI-first follow-ups: package rename + publish, API.md/llms.txt on Pages, Playwright visual job — IN PROGRESS
- [x] Renamed packages: `@glideapps/glide-data-grid` → `tengrids`, `-cells` → `tengrids-cells`, `-source` → `tengrids-source` (all three names free on npm). Bulk sed across src/tests/READMEs/package.json/test-projects/CLI; repo/homepage/bugs URLs point at moeghashim/tengrids and the Pages site. CHANGELOG left as historical record.
- [x] Wrote root `llms.txt` (llmstxt.org format); Pages workflow now copies `API.md`, `llms.txt`, and a generated `llms-full.txt` (README + API + AGENTS) into the site root, and triggers on edits to those docs.
- [x] Replaced `packages/core/README.md` (the npm page) with a fork README; prepended a fork/install note to cells + source READMEs.
- [x] First rename attempt silently no-op'd (zsh doesn't word-split unquoted `$FILES`); redone with a `while read` loop. Root lock regenerated: 0 old-name refs, `node_modules/tengrids{,-cells,-source}` link to the workspaces, `require("tengrids")` loads 59 exports.
- [x] Built all packages via CLI; suites green after rename: core 387/387, source 7/7, cells 64/64. Static Storybook builds (12 MB).
- [x] `test-projects/*` now depend on core via `file:../../packages/core` (their locks regenerated, `npm ci` links `node_modules/tengrids -> ../../../packages/core`) — no dependence on the registry, and the CLI `bootstrap` symlink target is now computed rather than hardcoded to the old scoped path depth.
- [x] Playwright visual job: `playwright.config.ts` (platform-agnostic snapshot names, Storybook served from `storybook-build/` via http-server), `visual/stories.spec.ts` (6 faker-seeded stories; picsum avatars blocked for stable pixels), `.github/workflows/visual.yml` (runs in `mcr.microsoft.com/playwright:v1.62.1-noble`; `update_snapshots` dispatch input regenerates + commits baselines), npm scripts `visual`, `visual:update`, `visual:docker`. AGENTS.md gotcha 4 rewritten accordingly.
- [x] Baselines generated inside `mcr.microsoft.com/playwright:v1.62.1-noble` (Docker Desktop had to be started first): 6 PNGs in `visual/__snapshots__`. Second run against them: 6/6 pass — rendering is deterministic.
- [x] `npm pack --dry-run` reviewed: core ships API.md, CHANGELOG, LICENSE, README, dist/ (no src/tests); cells/source ship LICENSE, README, dist/. Lint clean across workspaces (0 errors).
- [x] Committed + pushed rename, docs, llms.txt, Pages additions, test-project links, Playwright job + baselines.
- [x] CI on `8c68173`: Build ✓ (consumer projects on `file:` links, React matrix), Visual regression ✓ (Docker baselines matched CI renders), Storybook deploy ✓.
- [x] Pages site verified serving the agent docs: `llms.txt` (2.9 KB), `API.md` (81.6 KB), `llms-full.txt` (98.5 KB) — all HTTP 200 at https://moeghashim.github.io/tengrids/.
- [x] **Published to npm** (by the user from an interactive terminal — publishing needed a browser OTP): `tengrids@6.0.4-alpha25`, `tengrids-cells@6.0.4-alpha25`, `tengrids-source@6.0.4-alpha25`, all under `dist-tag latest` (`--tag latest` is mandatory for prerelease versions on npm 11). Clean-room `npm i tengrids tengrids-cells tengrids-source` in a scratch project: `DataEditor` loads, 59 exports, 13 `allCells` renderers, 5 source hooks, `dist/index.css` + ESM + types present.

### AI-first follow-ups — DONE
Result: agents can `npm i tengrids`; `llms.txt`/`API.md`/`llms-full.txt` are served from the Pages site; a Playwright job guards pixels on six stories with Linux-rendered baselines identical between local Docker and CI. Remaining follow-up: re-run `/design-sync` so the Claude Design bundle global moves from `GlideappsGlideDataGrid` to `Tengrids`.
- [ ] Re-sync claude.ai/design (bundle global changes with the package name) — follow-up.
- [ ] Re-sync claude.ai/design (bundle global changes with the package name) — follow-up.

### Design-sync re-run after the npm rename + Docker cleanup
- Quit Docker Desktop (started earlier only to render the Playwright baselines).
- Re-sync of Claude Design project `83bf1f56-58a8-4aa4-b190-b3b6baf9a446` via the `resync.mjs` driver with the remote anchor: build → diff → validate → capture all green; DataEditor carried forward with a `[SPOT_CHECK]` (pipeline churn + bundle change) whose fresh sheet matched the recorded 12 `match` grades. Bundle global moved `GlideappsGlideDataGrid` → `Tengrids`; `conventions.md` updated to `window.Tengrids` (all cited names re-validated against the build). Component group derives from the story title, so paths stayed `components/glide-data-grid/DataEditor/` — no remote deletes.
- Atomic upload (plan approved, deletes = none): sentinel → 11 content files → sentinel re-arm → `_ds_sync.json` last. Reference storybook refreshed by copying `storybook-build/` (same config) instead of rebuilding — noted in `.design-sync/NOTES.md`.

## 2026-09-03

### tengrids-ai — five AI product features — IN PROGRESS
- [x] New workspace `packages/ai` (`tengrids-ai`, pins core exact version; no vendor SDKs, no linaria). Wired into root workspaces, CLI `build ai`, `npm run test-ai`, and the CI Build job.
- [x] Provider seam (`AiProvider`, `collectCompletion`, `createMockProvider` with streaming + fake-timer delays) and `AiScheduler` (dedupe in flight, LRU cache, concurrency cap, priority, cancel by key/predicate, `prime`, `clearKey`).
- [x] Feature 1 — AI cells: `AiCellRenderer` (idle formula / animated pending / streaming / done / error states, overlay editor with Regenerate, paste sets prompt, delete clears), `useAiCells` (row-template resolution `{Column}`, visible-region-only generation with cancellation, cache by resolved prompt, damage-API repaint, `run`/`regenerate`).
- [x] Feature 2 — NL search/filter: `nl-query.ts` query→`FilterSpec` compiler contract (13 ops, aliases, numeric/date compare, and/or), `useCompiledQuery` (instant literal path, debounced compile, spec cache, abort on supersede, literal fallback on failure), `useNaturalLanguageSearch` (spreads onto the built-in search box) and `useNaturalLanguageFilter` (row permutation like `useColumnSort`).
- [x] Feature 3 — `useAgentDataSource`: async-iterable rows with batched flushes, start/stop/reset/appendRows, sync + async `onEdited` round-trips.
- [x] Feature 4 — smart paste: deterministic `coerceValue` (`parseNumber` handles "1,234.5", "$1.2k", "(500)", "12%", "3 million", word numbers; `parseBoolean`; `normalizeUri`) + `useSmartPaste` (sync coercion via `coercePasteValue`, unresolved cells batched to the model through the `onPaste` prop and corrected via `onCellsEdited`).
- [x] Feature 5 — `useBulkEdit`: selection → scope (rows/ranges/whole columns), capped prompt with row JSON, model edits validated (scope, column, coercion, unchanged skipped), `highlightRegions` preview, `apply`/`discard`.
- [x] Tests: 11 files / 106 tests, all green with fake timers and mock providers; strict `tsc` build clean; eslint clean after fixing 3 findings.
- [x] Storybook demos (Extra Packages → AI): AiCells, NaturalLanguageSearch, NaturalLanguageFilter, AgentDataSource, SmartPaste, BulkEdit — all driven by mock providers. Package README written; root README gained an "AI features" section; AGENTS.md/llms.txt updated; design-sync titleMap excludes the new `AI` title with a note.
- [x] Full `npm run build` (all four workspaces + lint) green locally; committed and pushed as "Add tengrids-ai: five bring-your-own-model AI features".
- [ ] CI green on the push.
- [ ] Publish `tengrids-ai` (needs the user's npm OTP).
