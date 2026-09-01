# design-sync notes — tengrids

## Re-sync risks

- **Story-fixture randomness**: several demo stories generate cell values with unseeded randomness (Boolean cells, loading-skeleton widths in Built In Search / All Cell Kinds). Pixels differ on every capture on BOTH panels; component chrome is what was graded. A future recapture of these stories will again show value-level deltas — expected, not regressions.
- **picsum.photos images**: mock data uses picsum URLs; loads are flaky/rate-limited during capture, so `[ASSETS_BLOCKED]` prints even with working egress (verified reachable via curl). Avatars/images load partially on both panels. Don't chase unless images fail on ONE panel only.
- **Story cap**: DataEditor graded at `--max-stories 12` of 75 stories. The 63 tail stories are verified-by-upload only. Raise the cap if a specific tail demo (search overlays, million-row perf, custom cells) needs individual verification.
- **linaria stub fork** (`.design-sync/overrides/story-imports.mjs`): reimplements `styled`/`css` at runtime. If upstream story helpers start using linaria APIs beyond those (e.g. `keyframes`, class-component wrapping), the stub needs extending.
- Build assumes Node 20+, bash 4+ (`/opt/homebrew/bin/bash`), `jq`, and the `cleancss` flatten step in `buildCmd` (regenerates `dist/index.flat.css` — cssEntry breaks if the build ran without it).

- Repo is a canvas data-grid library: the public storied component is `DataEditor` (title "DataEditor Demos", ~60 stories). All other storybook titles are excluded via `titleMap: null`:
  - `Docs` — prose documentation pages wrapping the same DataEditor demos; redundant with DataEditorDemos.
  - `DataGrid`, `ScrollingDataGrid` — internal subcomponents, not package exports.
  - `TestCases`, `Bugs` — regression-test stories, not design surface.
  - `Cells` — lives in the separate `@glideapps/glide-data-grid-cells` package (not in the core bundle). Candidate for a future sync enhancement via `extraEntries` + cells dist build.
  - `Source` — hooks demos from `@glideapps/glide-data-grid-source`, non-visual.
- [GENERAL] Core dist CSS is an `@import`-tree stub (`packages/core/dist/index.css`); converter needs a flat file → `buildCmd` appends a `cleancss` flatten step (repo's own devDependency) producing `packages/core/dist/index.flat.css`, wired via `cfg.cssEntry`.
- [GENERAL] Build requires bash 4+ (`/opt/homebrew/bin/bash`) and `jq`; stock macOS bash 3.2 fails with "Bash 4 or higher is required".
- `.storybook/preview.ts` has no decorators — no `cfg.provider` needed.
- [GENERAL] Story helper modules (`data-editor/stories/utils.tsx`, `stories/story-utils.tsx`, `docs/doc-wrapper.tsx`) use `@linaria/react` `styled` / `@linaria/core` `css`, which need a build-time transform — previews crashed with "Using the styled tag in runtime is not supported". Fixed via `.design-sync/overrides/story-imports.mjs` fork adding a `linaria-stub` esbuild plugin: a runtime `styled`/`css`/`cx` implementation (generated class per template injected as native nested CSS; function interpolations become CSS vars set from props via inline style). Declared in `cfg.libOverrides`.
- [TRIAGED] `[TOKENS_MISSING]` warns about ~11 CSS custom properties (`--r17m35ur-0`, `--wmyidgi-*`, …): these are linaria-compiled runtime vars the core package sets via inline styles at render time — expected to be absent from static stylesheets. Renders verify clean; do not chase.
- DataEditor overlay editors portal into `document.getElementById("portal")` — storybook provides it via `.storybook/preview-body.html`. Static preview cards don't open overlays, but design-agent guidance must mention the portal div (conventions header).
