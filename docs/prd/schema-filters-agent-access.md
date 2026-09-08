# PRD: Declarative schema, faceted filters, and agent access for tengrids

|                         |                                                                                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Status                  | Draft for execution                                                                                                                 |
| Owner                   | Moe Ghashim (`moeghashim`) — final say on scope, merges, and publishing                                                             |
| Executor                | Grok (xAI)                                                                                                                          |
| Reviewer 1              | GPT Astra (OpenAI)                                                                                                                  |
| Reviewer 2 and sign-off | Claude Fable 5.1 (Anthropic)                                                                                                        |
| Repository              | https://github.com/moeghashim/tengrids                                                                                              |
| Target version          | `6.0.4-alpha27` (all packages move together; see §8)                                                                                |
| Written                 | 2026-09-08                                                                                                                          |
| Inspiration             | [openstatusHQ/data-table-filters](https://github.com/openstatusHQ/data-table-filters) (MIT). Ideas are borrowed; no code is copied. |

## 1. Summary

tengrids is a canvas grid engine: it renders and edits millions of rows but leaves everything around the table to the app. Every consumer today hand-writes `columns`, a `getCellContent` switch, an `onCellEdited` writer, and any filtering UI. data-table-filters solved exactly that layer for DOM tables. This PRD brings three of its ideas to tengrids, in a form that fits a canvas grid published as npm packages:

1. **A declarative schema** (`tengrids-schema`): one definition per column produces grid columns, cell mapping, edit writing, and filter fields.
2. **Faceted filters with pluggable state** (same package): a `useGridFilters` hook, a `FilterRail` component styled by the grid theme, memory and URL stores, and a store interface for zustand/nuqs. The natural-language filter in `tengrids-ai` writes into the same state, so an AI-inferred filter shows up as editable chips.
3. **Agent access** (`tengrids-mcp` + a repo skill): the docs served as an MCP server over stdio via `npx tengrids-mcp`, and an installable agent skill that scaffolds a grid from a schema.

## 2. Problem

- **Boilerplate.** A typical tengrids integration is 150–300 lines of column definitions and cell switches before the first row renders. The Storybook has ~90 examples and nearly all of them repeat this.
- **No filter layer.** Core ships a literal search box; `tengrids-source` ships sorting; `tengrids-ai` ships a query→`FilterSpec` compiler and evaluator. There is no way to build "status is one of X, cost ≥ 100, due in September" as UI, share it as a URL, or count how many rows each facet value has.
- **Agents read, they cannot act.** `llms.txt`, `API.md`, and AGENTS.md exist, but an agent in Claude Code, Cursor, or Codex has no tool to query them, no skill that encodes setup gotchas (`#portal`, CSS import, `ssr: false`), and no scaffold. data-table-filters ships all three.

## 3. Goals and non-goals

Goals:

- G1. A schema-defined grid needs one object literal plus one hook call. Types are inferred from the schema (`InferRow<typeof schema>`).
- G2. Filters are a serializable `FilterSpec`, evaluated locally in one pass per change, with facet counts, and persisted through a store the app chooses.
- G3. The AI natural-language filter and the manual filter rail share one state; each can edit what the other produced.
- G4. An agent can install tengrids, discover the API, and scaffold a working grid without reading the repository, using the MCP server and the skill.
- G5. Nothing in `packages/core` changes except where a bug blocks the above. Core's React 16–19 contract stays.

Non-goals (explicitly out of scope for this PRD; may be later PRDs):

- A command palette, filter history, or row-detail sheet.
- Server-side query helpers for any ORM. The filter state is plain JSON; apps send it to their server themselves. One story shows the pattern with `useAsyncDataSource`.
- A hosted (Streamable HTTP) MCP endpoint. The stdio server is designed so `--http <port>` can be added later.
- Tailwind, shadcn, or any new styling system. The rail uses the existing `--gdg-*` CSS variables through `@linaria/react`, like `packages/cells`.
- Changing the ArticleCell or any existing cell renderer.

## 4. Users

- **App developers** integrating tengrids into a product (React 16–19, any framework).
- **Coding agents** asked by those developers to add or modify a grid.
- **Repo maintainers** (Moe and the three agents in §9) who must keep the new packages green in CI and published in lockstep.

## 5. Feature A — `tengrids-schema`: schema and generators

### 5.1 Package

- New workspace `packages/schema`, published as `tengrids-schema`, version pinned to core like the other packages. Depends on `tengrids` (exact version). No other runtime dependencies. Peer `react`/`react-dom` `^16.12.0 || 17.x || 18.x || 19.x`.
- Build, lint, and test wiring identical to `packages/ai` (tsc ESM+CJS through `scripts/cli.mjs`, ESLint, Vitest 4 with the shared config shape). It contains `@linaria/react` styles for the rail (§6), so its build emits `dist/index.css` like `packages/cells`.

### 5.2 API sketch

```ts
import { createSchema, col, type InferRow, useSchemaGrid } from "tengrids-schema";

const schema = createSchema({
    name:   col.text({ title: "Name", width: 160 }),
    cost:   col.number({ title: "Cost", format: "currency", currency: "USD", width: 110 }),
    status: col.enum({ title: "Status", values: ["draft", "active", "closed"] as const }),
    due:    col.date({ title: "Due" }),
    paid:   col.boolean({ title: "Paid" }),
    site:   col.uri({ title: "Website" }),
    notes:  col.markdown({ title: "Notes", readonly: true }),
});

type Row = InferRow<typeof schema>;
// { name: string; cost: number; status: "draft" | "active" | "closed"; due: Date | undefined; paid: boolean; site: string; notes: string }

function Grid({ rows, setRows }: { rows: readonly Row[]; setRows: (r: readonly Row[]) => void }) {
    const grid = useSchemaGrid(schema, rows, { onRowsChange: setRows });
    return <DataEditor {...grid} />;
    // grid = { columns, rows, getCellContent, onCellEdited, getCellsForSelection }
}
```

Column factories (each returns a `ColumnDef` with `kind`, options, and a phantom type for inference):

| Factory        | Grid cell kind                                                                             | Options beyond the shared ones                                                                  | Edit coercion                            |
| -------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `col.text`     | Text                                                                                       | `multiline`, `maxLength`                                                                        | trim                                     |
| `col.number`   | Number                                                                                     | `format: "plain" \| "currency" \| "percent" \| "integer"`, `currency`, `min`, `max`, `decimals` | parse number; reject NaN                 |
| `col.boolean`  | Boolean                                                                                    | `allowIndeterminate`                                                                            | boolean                                  |
| `col.date`     | Text (formatted) via a custom renderer only if `tengrids-cells` is present; otherwise Text | `format: "date" \| "datetime" \| "relative"`, `timeZone`                                        | parse ISO or locale date; reject invalid |
| `col.enum`     | Text with `displayData`; Bubble when `multiple: true`                                      | `values` (readonly tuple), `labels`, `multiple`                                                 | must be in `values`                      |
| `col.uri`      | Uri                                                                                        | `hoverEffect`, `displayAsLink`                                                                  | normalize scheme                         |
| `col.image`    | Image                                                                                      | `allowAdd`, `rounding`                                                                          | array of urls                            |
| `col.markdown` | Markdown                                                                                   | —                                                                                               | string                                   |
| `col.custom`   | Custom                                                                                     | `toCell(rowValue, row)`, `fromCell(cell, row)`, `filter?: FilterKind`                           | delegated                                |

Shared options: `title` (defaults to the key), `id` (defaults to the key), `width`, `grow`, `group`, `icon`, `readonly`, `hasMenu`, `themeOverride`, `sortable` (default true), `filterable` (default true), `accessor?: (row) => value` for nested data.

Generators on the schema object (all pure, memoized once per schema):

- `schema.keys`: readonly ordered keys.
- `schema.columns()`: `GridColumn[]` (a `SizedGridColumn` when `width` is set; `id` always set).
- `schema.cell(row, key)`: `GridCell` for one field.
- `schema.toCell`: `(row, colIndex) => GridCell`, shaped to plug straight into `useAsyncDataSource`'s `RowToCell`.
- `schema.applyEdit(row, key, cell)`: returns a new row or `undefined` when the value is rejected; never mutates.
- `schema.onEdited`: `RowEditedCallback` shape for `useAsyncDataSource`.
- `schema.filterFields()`: `FilterField[]` (see §6.2), derived from each column's kind and `values`.
- `schema.print()`: TypeScript source of this schema (used by the scaffold tool in §7).

`useSchemaGrid(schema, rows, options)` composes the above for in-memory arrays and returns `Pick<DataEditorProps, "columns" | "rows" | "getCellContent" | "onCellEdited" | "getCellsForSelection">`. Options: `onRowsChange`, `onRowChange(index, row)`, `readonly`.

### 5.3 FilterSpec ownership moves

`FilterOp`, `FilterClause`, `FilterSpec`, `evaluateFilter`, `matchesClause`, `findColumnIndex`, and `specColumns` currently live in `packages/ai/src/nl-query.ts`. They move to `tengrids-schema` (`src/filter-spec.ts`) unchanged in shape. `tengrids-ai` adds `tengrids-schema` as a dependency and re-exports every moved name so no consumer import breaks. `parseFilterSpec`, `buildQueryPrompt`, and `literalMatches` stay in `tengrids-ai` (they are model-facing).

### 5.4 Acceptance criteria

- A1. The example in §5.2 compiles under the repo's strict `tsconfig` and `InferRow` produces the documented type; a type-level test asserts it.
- A2. `useSchemaGrid` over a 1,000-row array renders in a story and editing a number, boolean, enum, and date cell round-trips through `applyEdit` into `onRowsChange`.
- A3. Invalid edits (letters into a number, a value outside `enum.values`, an invalid date) are rejected: the row is unchanged and `onCellEdited` returns without calling `onRowsChange`.
- A4. `schema.toCell` and `schema.onEdited` plug into `useAsyncDataSource` without adapters; a story demonstrates it.
- A5. All FilterSpec re-exports from `tengrids-ai` keep their names; the existing 126 AI tests pass unmodified apart from import paths inside the package.
- A6. ≥ 40 unit tests in `packages/schema/test` covering every factory, coercion path, generator, and `InferRow`.
- A7. `packages/schema/README.md` documents every factory and option with one worked example; `API.md` is not modified (it documents core only).

## 6. Feature B — faceted filters, stores, and the rail

### 6.1 Hook

```ts
import { useGridFilters, memoryStore, urlStore, FilterRail } from "tengrids-schema";

const filters = useGridFilters({
    fields: schema.filterFields(),          // or any FilterField[]
    rows: grid.rows,
    getCellContent: grid.getCellContent,
    store: urlStore({ param: "f" }),        // default: memoryStore()
    maxRows: 50_000,
});

<FilterRail filters={filters} />
<DataEditor {...grid} rows={filters.rows} getCellContent={filters.getCellContent} />
```

Returns `UseGridFiltersResult`:

- `spec: FilterSpec`, `setSpec(spec)`, `setClause(key, clause | undefined)`, `clear()`.
- `rows`, `getCellContent`, `getOriginalIndex(row)` — the same remapping contract `useColumnSort` and `useNaturalLanguageFilter` already use, so the three compose in any order.
- `facets: ReadonlyMap<key, Facet>` where `Facet` is `{ kind: "values", values: { value, count }[] }` for enum/boolean/text-with-few-values, or `{ kind: "range", min, max }` for number/date. Counts respect every clause except the field's own (the data-table-filters behaviour), so a user sees what selecting a value would leave.
- `status: "idle" | "filtering"` and `matched: number`.
- `toSearchParams(): URLSearchParams` and `fromSearchParams(p)` helpers using the codec in §6.3.

Evaluation runs synchronously in one pass over `min(rows, maxRows)` using `evaluateFilter` from §5.3, memoized on `(spec, rows, getCellContent)`. When `rows > maxRows` the hook evaluates the first `maxRows` and exposes `truncated: true`; the rail shows it.

### 6.2 Filter fields

```ts
interface FilterField {
    readonly key: string; // column id
    readonly title: string;
    readonly kind: "text" | "number" | "boolean" | "date" | "enum" | "uri";
    readonly values?: readonly string[]; // enum
    readonly labels?: Readonly<Record<string, string>>;
    readonly multiple?: boolean; // enum: default true
}
```

Field kind → allowed ops: text/uri: `contains`, `notContains`, `startsWith`, `endsWith`, `eq`, `empty`, `notEmpty`; number/date: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `empty`, `notEmpty`; boolean: `eq`, `empty`; enum: `in`, `neq`, `empty`, `notEmpty`. The rail only offers the allowed ops; `setClause` rejects others with a thrown `RangeError` in development and a silent no-op in production builds.

### 6.3 Stores and URL codec

```ts
interface FilterStore {
    get(): FilterSpec;
    set(spec: FilterSpec): void;
    subscribe(listener: () => void): () => void;
}
```

- `memoryStore(initial?)`: the default; ephemeral.
- `urlStore({ param = "filter", history = "replace" | "push" })`: reads and writes `window.location.search` through the History API, listens to `popstate`; framework-neutral, no `nuqs` dependency. Safe under SSR (no-ops without `window`).
- `FilterStore` is documented as the extension point; the README shows a 15-line zustand adapter and a nuqs adapter. Neither library is added to the repo.

Codec (one readable param per clause, stable ordering, all values percent-encoded):

```
?f=status:in:draft,active&f=cost:gte:100&f=name:contains:acme&fx=or
```

`fx=or` sets the conjunction (default `and`). Enum values containing `,` or `:` are escaped with `%2C`/`%3A`. `decode` ignores unknown keys and invalid ops rather than throwing, so a tampered URL yields a partial filter, never an error. Round-trip is property-tested (encode ∘ decode = identity for any valid spec).

### 6.4 `FilterRail`

A DOM component, rendered by the app above or beside the grid. Requirements:

- One chip per `FilterField`; inactive chips show the title, active chips show a summary (`Status: draft, active`, `Cost ≥ 100`) and a clear button.
- Clicking a chip opens a popover with the control for its kind: enum → checkbox list with facet counts and a search box when > 8 values; number/date → min/max (from/to) inputs prefilled from the range facet; text/uri → op select + input; boolean → true/false/any.
- "Clear all" when any clause is active; a truncated-evaluation notice when `truncated` is set.
- Keyboard: Tab between chips, Enter/Space opens, Escape closes, arrow keys inside lists. ARIA: chips are `button`s with `aria-expanded`, popovers are `role="dialog"` labelled by the chip, lists use native checkboxes.
- Styling only through `--gdg-*` variables (`bg-cell`, `bg-header`, `text-dark`, `text-medium`, `accent-color`, `accent-fg`, `border-color`, `font-family`, `rounding-radius`) via `@linaria/react`, so it follows any grid theme with zero extra CSS. Popovers portal into `document.getElementById("portal")` when present, else render inline.
- No `innerHTML`, no `dangerouslySetInnerHTML`; every value is rendered as text.
- Optional `renderField` prop to replace a single field's control, and a headless export (`useFilterRailState`) for apps that bring their own UI.

### 6.5 Integrations

- `useNaturalLanguageFilter` (in `tengrids-ai`) gains `onSpec?: (spec: FilterSpec | undefined) => void`, called whenever the compiled spec changes. Wiring `onSpec: filters.setSpec` makes the AI result appear as chips; the user can then edit them. No dependency on the store type.
- `useColumnSort` composes before or after (`getOriginalIndex` chains). A story shows filter + sort + AI filter together.
- `useAsyncDataSource` story: the `getRowData` callback receives the current `spec` from the store and filters server-side (a mock server in the story). This is the documented pattern in place of ORM helpers.

### 6.6 Acceptance criteria

- B1. A story with 100,000 in-memory rows and six fields re-evaluates a changed clause in under 100 ms on the CI runner (measured with `performance.now()` in a test, threshold 250 ms to allow for slow runners) and facet counts match a brute-force computation in a unit test.
- B2. The URL codec round-trips every op and every value type, including commas, colons, unicode, and empty strings (property test with ≥ 500 generated specs).
- B3. `urlStore` survives reload and back/forward in a Storybook story (verified manually in review and by a Playwright test in `visual/`).
- B4. The rail renders correctly in the default, dark, and a high-contrast theme; the three states are added to the visual regression job with Linux baselines generated through `npm run visual:docker -- --update-snapshots` only.
- B5. Keyboard-only operation of the whole rail is demonstrated in a test using `@testing-library/user-event`.
- B6. The AI filter story shows a typed query becoming chips, and editing a chip changes the rows without another model call.
- B7. ≥ 60 unit tests for the hook, stores, codec, facets, and rail; cells/source/ai suites stay green.

## 7. Feature C — agent access: MCP server and skill

### 7.1 `tengrids-mcp`

- New workspace `packages/mcp`, published as `tengrids-mcp`, `bin: { "tengrids-mcp": "dist/cli.js" }`, `engines.node >= 20.10`. Dependencies: `@modelcontextprotocol/sdk` and `zod` (the SDK's own peer). Nothing else.
- Transport: stdio. Install line for users: `claude mcp add tengrids -- npx -y tengrids-mcp` (equivalents for Cursor/Codex in the README).
- Docs are **bundled at build time** by `scripts/cli.mjs` (a new `docs-bundle` step copies `packages/core/API.md`, every package README, `AGENTS.md`, `llms.txt`, `llms-full.txt`, and the source of every `*.stories.tsx` into `packages/mcp/docs/` as JSON with ids and headings). `--refresh` fetches the same files from `https://moeghashim.github.io/tengrids/` and the raw GitHub URLs at startup instead, falling back to the bundle on any failure.
- Tools (inputs validated with zod; outputs are text):
    - `list_docs()` → ids, titles, sizes.
    - `get_doc({ id, heading? })` → a whole document or one section.
    - `search_docs({ query, limit = 10 })` → lexical search over sections (BM25 or simpler TF-IDF; no external index), returning id, heading, score, and a 300-character excerpt.
    - `get_example({ query })` → the source of the best-matching story, plus its title and Pages URL.
    - `scaffold({ schema, filters?: boolean, ai?: boolean, framework?: "react" | "next" })` → a complete TypeScript snippet: a `createSchema` call built from the JSON schema (via `schema.print()`), the `DataEditor`, optional `useGridFilters` + `FilterRail`, optional `useAiCells`, the CSS import, and the `#portal` element (with the `ssr: false` wrapper for Next).
    - `check_setup({ packageJson, appSource? })` → a checklist result: peer dependencies present, CSS imported, `#portal` present, React version supported.
- Resources: `tengrids://docs/<id>` mirrors `get_doc` for clients that prefer resources.
- Version reported by the server equals the package version.

### 7.2 Skill

- `skills/tengrids/SKILL.md` with frontmatter (`name: tengrids`, one-line `description`) following the Agent Skills format, plus `skills/tengrids/reference/` files: `setup.md` (install, peers, CSS, `#portal`, `ssr: false`, React 16–19), `schema.md`, `filters.md`, `ai.md`, `troubleshooting.md` ("nothing shows up", "crash on edit", theme variables).
- Installable with `npx skills add https://github.com/moeghashim/tengrids --skill tengrids`; the executor verifies the command works against the pushed branch and records the output in the PR.
- The skill instructs an agent to prefer the MCP tools when available and to fall back to `llms.txt` otherwise.

### 7.3 Docs plumbing

- `llms.txt` gains a "Tools for agents" section (MCP install line, skill install line, `tengrids-schema` README). `llms-full.txt` includes the schema and mcp READMEs. The Storybook deploy workflow already copies these files; `docs-bundle` must run before `storybook build` there.
- Root `README.md`: a "Schema and filters" section (10 lines, one example) and an "Agents" section (install lines). `AGENTS.md`: repo layout gains `packages/schema` and `packages/mcp`, the commands table gains `test-schema`, `test-mcp`, and `docs-bundle`.

### 7.4 Acceptance criteria

- C1. From a clean machine with Node 20.10, `npx -y tengrids-mcp` starts and answers `list_docs`, `search_docs("frozen columns")`, and `scaffold` with the §5.2 schema, verified with the MCP Inspector or a 20-line stdio client committed as a test.
- C2. `scaffold` output for the §5.2 schema compiles in the `test-projects/next-gdg` consumer project (a CI step pastes it into a scratch page and runs `tsc --noEmit`).
- C3. `search_docs` returns the `API.md` "Prerequisites" section in the top 3 for "nothing shows up" and the theme section in the top 3 for "dark mode".
- C4. `--refresh` against the live Pages site succeeds and a network failure falls back to the bundle (test with a bad URL).
- C5. The skill installs with the `skills` CLI and Claude Code lists it; the PR contains the transcript.
- C6. ≥ 30 unit tests: bundle loading, search ranking on fixtures, every tool's zod validation and error path, scaffold output snapshot per option combination.

## 8. Cross-cutting requirements

- X1. **Wiring.** `scripts/cli.mjs` `PACKAGES` adds `schema` and `mcp`; root `package.json` gains `test-schema`, `test-mcp`, `docs-bundle`; `.github/workflows/node.js.yml` runs both suites after `test-ai`; `storybook.js.yml` runs `docs-bundle`; `.design-sync/config.json` `titleMap` excludes the new story groups (`Schema: null`) like the others. Story titles: `Extra Packages/Schema`, `Extra Packages/Filters`.
- X2. **Compatibility.** New packages follow AGENTS.md gotcha 7: no `useId`, `useSyncExternalStore`, or other React 18+-only APIs; the store subscription uses `useState` + `useEffect`. The React 18/19/latest matrix must pass.
- X3. **Quality gates.** Strict TypeScript, ESLint including the cycle check, Prettier (4 spaces, 120 columns, double quotes), Vitest 4 patterns (fake timers as configured; function-implemented mocks), no `any` in public types.
- X4. **Security.** No HTML injection anywhere in the rail; URL codec tolerates hostile input; MCP tools validate every input and never read files outside the bundled docs directory; `--refresh` only fetches from the two fixed origins.
- X5. **Docs and logs.** Every PR updates the relevant README, `llms.txt` if surface changed, `packages/*/CHANGELOG.md` (new files for schema and mcp), and appends to `progress.md` under the current date, as the repo convention requires.
- X6. **Versioning and release.** After PR3 merges, PR4 runs `npm run cli -- version 6.0.4-alpha27`, updates changelogs, regenerates the consumer-project locks, and passes CI. Moe publishes core first, then cells, source, ai, schema, mcp (`npm publish --tag latest -w packages/<pkg>`). No agent publishes.
- X7. **Commits.** Authored as Moe Ghashim `<mohanadgh@gmail.com>` with a `Co-Authored-By:` trailer naming the agent (existing repo convention). One logical change per commit; no force-pushes to a branch under review.

## 9. Execution workflow: Grok → GPT Astra → Claude Fable 5.1 → Moe

### 9.1 Milestones and branches

| PR  | Branch            | Scope                                                                | Depends on                                         |
| --- | ----------------- | -------------------------------------------------------------------- | -------------------------------------------------- |
| PR1 | `feat/schema`     | §5 in full, §5.3 move with re-exports, X1 wiring for `schema`        | —                                                  |
| PR2 | `feat/filters`    | §6 in full, `onSpec` in `tengrids-ai`, visual baselines for the rail | PR1 merged                                         |
| PR3 | `feat/mcp`        | §7 in full, X1 wiring for `mcp`, docs plumbing                       | PR1 merged (PR2 for `scaffold({ filters: true })`) |
| PR4 | `release/alpha27` | X6                                                                   | PR1–PR3 merged                                     |

Each PR is reviewable on its own; each must leave `main` green and publishable. If a milestone turns out too large, the executor proposes a split in the PR description before opening the second half; reviewers do not review PRs over ~2,500 changed lines excluding lockfiles, snapshots, and bundled docs.

### 9.2 Executor (Grok)

For each PR:

1. Read this PRD, AGENTS.md, and the package READMEs first; ask Moe in the PR description if a requirement is ambiguous rather than guessing. Ambiguity resolved by the reviewers' interpretation counts only once Moe agrees.
2. Implement to the acceptance criteria. Every criterion gets a test or a documented manual check.
3. Run locally and paste real output for: `npm run build`, `npm test`, the new package suites, `npm run test-ai`, `npm run test-cells`, `npm run test-source`, and for PR2 `npm run visual:docker`.
4. Open the PR with this description template:

```
## What
## Why (link the PRD section)
## Acceptance criteria — status
- [ ] A1 … (how verified)
## Evidence
<pasted command output>
## Risks / follow-ups
## Out of scope (explicitly)
```

5. Address every numbered review finding with a commit reference or a one-line reason for disagreement. Never resolve a reviewer's thread yourself.

### 9.3 Reviewer 1 (GPT Astra)

Reviews first, within the PR, and posts one review with numbered findings and a verdict (`approve` / `request changes`). Checklist:

- API matches the PRD (names, shapes, defaults); deviations are called out and either justified or fixed.
- Correctness: coercion edge cases, facet counting excluding the field's own clause, codec escaping, `getOriginalIndex` chaining, store subscription leaks.
- Tests actually exercise the criteria (no tautologies, no skipped tests); the numbers in §5.4/§6.6/§7.4 are met.
- Performance caps (`maxRows`, memoization) are real; no O(rows × fields) work on every render.
- Types: inference works at the call site; no `any` leaks into public signatures.

Astra does not review repo conventions, docs completeness, or security; those are Reviewer 2's.

### 9.4 Reviewer 2 and sign-off (Claude Fable 5.1)

Reviews after Astra's `approve`, re-reads the diff independently, and runs the suites and stories locally. Checklist:

- AGENTS.md conventions: React 16–19 rule, no core changes without justification, lint/cycle check, Prettier, fake-timer patterns, Linux-only visual baselines.
- Security items in X4, plus anything Astra's findings changed.
- Docs, changelogs, `llms.txt`, `progress.md`, CI wiring (X1, X5), design-sync titleMap.
- CI: Build (with the React matrix), Visual regression, and Storybook deploy green on the final commit.
- Cross-checks Astra's findings were actually addressed.

Verdict is `request changes` or a sign-off comment in this exact form, which is the merge gate:

```
Signed off by Claude Fable 5.1 on <commit sha>.
Criteria verified: A1–A7 (commands: …). CI: Build ✓ Visual ✓ Storybook ✓.
Deviations from the PRD accepted: <list or "none">.
```

### 9.5 Rules for everyone

- Reviewers comment; they do not push to the executor's branch. If a reviewer wants to demonstrate a fix, it goes in a comment or a separate branch.
- Two approvals (Astra `approve` + Fable sign-off) are required. Moe merges (squash or merge, Moe's choice) and is the only one who publishes.
- Disagreements between executor and reviewers, or between reviewers, escalate to Moe with both positions stated in two sentences each. Moe's decision is recorded in the PR and, if it changes scope, in this PRD via a follow-up commit to this file.
- Scope changes go through this document first. A PR that implements something not in the PRD gets `request changes` regardless of quality.
- Every agent identifies itself in its comments and commit trailers by its own name.

## 10. Definition of done

The PRD is complete when PR1–PR4 are merged, `main` is green on all three workflows, `6.0.4-alpha27` for all six packages is on npm, `npx -y tengrids-mcp` answers `scaffold` for the §5.2 schema from a clean machine, the skill installs from the repository URL, and `progress.md` records the CI results for each PR.

## 11. Risks and mitigations

| Risk                                             | Mitigation                                                                     |
| ------------------------------------------------ | ------------------------------------------------------------------------------ |
| Moving FilterSpec breaks `tengrids-ai` consumers | Re-export every moved name; A5 keeps the AI suite unmodified                   |
| Facet computation too slow on large tables       | `maxRows` cap, memoization, `truncated` flag, B1 threshold in CI               |
| Rail styling looks foreign next to the canvas    | Only `--gdg-*` variables; three-theme visual baselines (B4)                    |
| Long or hostile URLs                             | Readable codec with escaping, tolerant decode, B2 property test                |
| MCP SDK API churn                                | Pin an exact SDK version; the server surface is five tools, easy to re-target  |
| `skills` CLI conventions change                  | The skill is a plain `SKILL.md` folder; C5 verifies install at review time     |
| Scope creep toward a command palette or sheet    | §3 non-goals; §9.5 rule on out-of-PRD work                                     |
| Node floor                                       | New packages declare `engines.node >= 20.10`; no Vite 7+ or wyw 2 dependencies |

## 12. Open questions for Moe (answer before PR1 starts)

1. **Package split.** This PRD puts schema, filters, and the rail in one package, `tengrids-schema`, so filters can consume schema types without a third package. Alternative: `tengrids-filters` separately. Recommendation: one package.
2. **Codec style.** Readable per-clause params (§6.3) versus one compact base64url JSON param. Recommendation: readable; it is what data-table-filters users expect from URLs.
3. **Hosted MCP later.** If you want a hosted endpoint, it needs a host (Vercel or a Cloudflare Worker); the stdio server is designed so `--http` can be added without changing tools.
4. **Version.** `6.0.4-alpha27` keeps the alpha line; a first `6.1.0-beta.1` would signal the fork's own surface. Recommendation: alpha27 now, beta after PR4 proves the packages together.
