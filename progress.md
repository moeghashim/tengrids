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
- Note: the branch push only publishes if GitHub Pages is enabled for the repo (source: `gh-pages` branch, `/docs` folder) — see the check below.
