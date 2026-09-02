# AGENTS.md — working on tengrids

tengrids is a fork of [glideapps/glide-data-grid](https://github.com/glideapps/glide-data-grid) (forked at v6.0.4-alpha25): a canvas-rendered React data grid for millions of rows. This file is the fastest path to being productive in the codebase.

## Environment

- **Node 20.10+** (pinned in `.nvmrc`; newer versions work — the suite passes on Node 24). That is the only prerequisite: all build/version/test-matrix tooling is a Node CLI at `scripts/cli.mjs` (no bash, no jq, works on Windows).
- `packages/cells` and `packages/source` tests import core's **built** `dist/` — build core first (`npm run build -w packages/core`) or their suites fail to resolve `tengrids`.
- The devcontainer config is stale (Node 14) — don't trust it; use `.nvmrc`.

## Commands

All from the repo root unless noted:

| Task | Command | Notes |
| --- | --- | --- |
| Install | `npm install` | npm workspaces monorepo |
| Core tests | `npm test` | 28 files / ~390 tests, ~10 s. Runs vitest in `packages/core` |
| Single test file | `cd packages/core && npx vitest run test/copy-paste.test.ts` | |
| Cells / source tests | `npm run test-cells` / `npm run test-source` | |
| React matrix | `npm run test-18` / `test-19` / `test-latest` | Swaps the installed React, runs core tests, then restores package.json + reinstalls (skipped in CI; `--no-restore` keeps the swap) |
| Lint + cycle check | `npm run lint -w packages/core` | eslint + `ts-helper -c` dependency-cycle check |
| Build all | `npm run build` | tsc ESM+CJS in parallel, linaria CSS extraction, `dist/index.css` — then lint. Per package: `npm run build -w packages/core` |
| Version bump | `npm run cli -- version 6.1.0` | Sets the version in root + all packages and pins the workspace dep on core |
| Consumer projects | `npm run test-projects` | `npm ci` in `test-projects/*` and symlinks core into them |
| Any CLI command | `npm run cli -- <build\|version\|test\|bootstrap>` | `node scripts/cli.mjs help` lists them |
| Storybook | `npm start` | Port 9009; ~60 examples double as the docs and manual test surface |
| Visual regression | `npx storybook build -o storybook-build && npm run visual:docker` | Screenshots 6 stories inside the Playwright Docker image and diffs them against `visual/__snapshots__` (see gotcha 4) |

CI gates on (`node.js.yml`): build, core tests with coverage, source tests, cells tests, downstream consumer projects (`test-projects/` — CRA5 and Next, which depend on core via `file:` links), and the full suite re-run against React 18, 19, and latest. `visual.yml` runs the screenshot job; `storybook.js.yml` deploys Storybook plus `API.md`, `llms.txt`, and `llms-full.txt` to GitHub Pages (https://moeghashim.github.io/tengrids/). Keep all of these green.

## Repo layout

- `packages/core` — the grid (`tengrids`, ~32k lines). Everything below is about this package.
- `packages/cells` — 13 optional `CustomRenderer` cells built on the public API. New cell types go here, not in core.
- `packages/source` — hooks returning partial `DataEditorProps`: `useAsyncDataSource`, `useColumnSort`, `useUndoRedo`, `useCollapsingGroups`, `useMoveableColumns`.

## Architecture map (packages/core/src)

The component stack, top to bottom — each layer adds exactly one concern:

```
data-editor-all.tsx            bundles all cell renderers + sprites (public DataEditor)
data-editor/data-editor.tsx    ALL stateful logic: selection, editing, clipboard,
                               keyboard, row markers (4,300+ lines — the monolith)
internal/
  data-editor-container/       sizing + clipping box
  data-grid-search/            search overlay + incremental rAF search loop
  scrolling-data-grid/         scrolling-data-grid.tsx: pixel→cell visible-region math
                               infinite-scroller.tsx: native scrollbars via transparent
                               scroller + padder divs over a fixed canvas underlay
  data-grid-dnd/               column resize / column & row reorder state machine
  data-grid/                   data-grid.tsx: the <canvas> host, hit-testing, events,
                               damage API, hidden a11y <table>
  data-grid/render/            the draw pipeline (see below)
  data-grid-overlay-editor/    lazy-loaded portal editor
```

Rendering pipeline (`internal/data-grid/render/`): `data-grid-render.ts` orchestrates; on scroll the previous frame is **blitted** (`data-grid-render.blit.ts`) and only exposed strips repaint; cell updates go through a **damage** `CellSet` and repaint only those cells; double-buffered via two hidden canvases plus a separate header canvas. `data-grid-lib.ts` holds text measurement caches and bounds math.

Cell system: cells are data objects (`GridCellKind.*` in `internal/data-grid/data-grid-types.ts`); renderers implement the interface in `src/cells/cell-types.ts` (`draw`, `measure`, `onPaste`, `provideEditor`, `getAccessibilityString`, …); built-ins live in `src/cells/`, dispatched by kind, with `Custom` cells matched via `isMatch`.

## Gotchas that will bite you

1. **Index mangling.** `data-editor.tsx` injects a row-marker column and trailing blank row internally; every coordinate is shifted by `rowMarkerOffset` between user space and internal space. When editing DataEditor code, always check which space an `Item` is in.
2. **Deliberately ugly perf code.** The cell draw loop uses module-level reused objects and de-idiomatized code on purpose (see the candid comments in `render/data-grid-render.cells.ts` around the "dumb versions" note, and the damage hack in `data-grid.tsx` near `lastArgsRef`). Do not "clean up" these patterns — they exist to avoid GC pressure and blit-diffing bugs.
3. **Blit invalidation.** `computeCanBlit` diffs consecutive frame args; anything that changes visual output must be part of that diff (or force a damage/full redraw), otherwise scrolling will show stale pixels. If you add a prop that affects rendering, trace it through `DrawGridArg` and `computeCanBlit`.
4. **Unit tests can't see pixels.** They run against a canvas *mock* (`vitest-canvas-mock` + jsdom) and verify logic only. Pixels are covered by the Playwright screenshot job (`visual/stories.spec.ts`, six deterministic stories, `.github/workflows/visual.yml`). Baselines in `visual/__snapshots__` are **Linux renders from the official Playwright image** — regenerate them only with `npm run visual:docker -- --update-snapshots` (or the workflow's `update_snapshots` input), never from a host-OS run, or fonts will differ. After any rendering change run `npm run visual:docker`; for stories outside the six, verify in Storybook (`npm start`, port 9009).
5. **Theme identity matters.** The theme object's identity is part of blit diffing and the per-cell merge fast path. Don't create fresh theme objects per render.
6. **Fake timers in tests** are configured to cover `performance` and `requestAnimationFrame` (see `vitest.config.ts`) — animation/blit paths are deterministic under test. Use the existing patterns in `test/data-editor.test.tsx`.
7. **React 16–19 compatibility.** No `useId`, `useSyncExternalStore`, `createRoot`, or other modern-only APIs in `packages/core/src`. IDs come from module-level counters; resize detection is hand-rolled in `common/resize-detector.ts`. CI enforces this via the 18/19 matrix.
8. **Overlay editors need `#portal`.** Editing flows portal into `document.getElementById("portal")` — tests and examples must provide it.
9. **DOM styling goes through theme variables.** The canvas can't be styled with CSS; DOM overlays (editors, search) read `--gdg-*` custom properties emitted by `makeCSSStyle` in `common/styles.ts`. Keep the canvas theme and CSS variables in sync when adding theme keys.

## Conventions

- Prettier: 4-space indent, 120 print width, double quotes (`.prettierrc`).
- ESLint is strict-ish (sonarjs, unicorn, react-hooks, `no-floating-promises` as error) and `tsconfig.json` is fully `strict` with `noUnusedLocals`/`noUnusedParameters` — expect the compiler to complain about dead code.
- Import cycles fail the lint (`ts-helper -c`).
- New cell renderers with heavy dependencies belong in `packages/cells`, code-split via `React.lazy` where possible (per upstream CONTRIBUTING.md).

## Fork notes

- Packages are published on npm as `tengrids` (core), `tengrids-cells`, and `tengrids-source` — renamed from upstream's `@glideapps/glide-data-grid*`. `cells` and `source` pin the exact core version, so bump all three together with `npm run cli -- version <v>` and publish core first.
- The MIT license and Glide's copyright notice in `LICENSE` must be retained.
