<h1 align="center">
  <b>tengrids</b>
</h1>
<p align="center">A canvas-based data grid, supporting <b>millions</b> of rows, <b>rapid</b> updating, and <b>native scrolling</b>.</p>

<p align="center">A fork of <a href="https://github.com/glideapps/glide-data-grid" target="_blank">Glide Data Grid</a> by <a href="https://www.glideapps.com" target="_blank">Glide</a>.</p>

# 🙏 Credit

tengrids is a fork of [Glide Data Grid](https://github.com/glideapps/glide-data-grid), built by the team at [Glide](https://www.glideapps.com) as the basis for their [Data Editor](https://www.glideapps.com/data-editor). The architecture, rendering engine, and the overwhelming majority of the code in this repository are their work, released under the [MIT license](LICENSE), which this fork retains along with their copyright notice.

If you're looking for the original project, its home is the upstream repo, with docs at [docs.grid.glideapps.com](https://docs.grid.glideapps.com/) and live examples in their [Storybook](https://glideapps.github.io/glide-data-grid). Consider supporting the upstream project — it's an exceptional piece of engineering.

This fork tracks upstream v6.0.4-alpha25.

## Features

-   **It scales to millions of rows**. Cells are rendered lazily on demand for memory efficiency.
-   **Scrolling is extremely fast**. Native scrolling keeps everything buttery smooth.
-   **Supports multiple types of cells**. Numbers, text, markdown, bubble, image, drilldown, uri
-   **Fully Free & Open Source**. [MIT licensed](LICENSE), so you can use it in commercial projects.
-   **Editing is built in**.
-   **Resizable and movable columns**.
-   **Variable sized rows**.
-   **Merged cells**.
-   **Single and multi-select rows, cells, and columns**.
-   **Cell rendering can be fully customized**.

# 📦 Packages

This is an npm-workspaces monorepo publishing four packages to npm:

| Package | Directory | What it is |
| --- | --- | --- |
| `tengrids` | [`packages/core`](packages/core) | The grid itself |
| `tengrids-cells` | [`packages/cells`](packages/cells) | Extra cell renderers (dropdown, sparkline, tags, date picker, …) |
| `tengrids-source` | [`packages/source`](packages/source) | Data-source hooks (async loading, sorting, undo/redo, …) |
| `tengrids-ai` | [`packages/ai`](packages/ai) | AI features, bring your own model: AI formula cells, natural-language search/filter, agent-fed data source, smart paste, bulk edit |

# ⚡ Quick Start

Make sure you are using React 16 or greater (React 17, 18, and 19 are all supported). Install the grid, plus its peer dependencies if you don't already have them:

```shell
npm i tengrids
```

```shell
npm i lodash marked react-responsive-carousel
```

Create a new `DataEditor` wherever you need to display lots and lots of data:

```tsx
<DataEditor getCellContent={getData} columns={columns} rows={numRows} />
```

Don't forget to import the mandatory CSS:

```ts
import "tengrids/dist/index.css";
```

Making your columns is easy:

```ts
// Grid columns may also provide icon, overlayIcon, menu, style, and theme overrides
const columns: GridColumn[] = [
    { title: "First Name", width: 100 },
    { title: "Last Name", width: 100 },
];
```

Last, provide data to the grid:

```ts
// If fetching data is slow you can use the DataEditor ref to send updates for cells
// once data is loaded.
function getData([col, row]: Item): GridCell {
    const person = data[row];

    if (col === 0) {
        return {
            kind: GridCellKind.Text,
            data: person.firstName,
            allowOverlay: false,
            displayData: person.firstName,
        };
    } else if (col === 1) {
        return {
            kind: GridCellKind.Text,
            data: person.lastName,
            allowOverlay: false,
            displayData: person.lastName,
        };
    } else {
        throw new Error();
    }
}
```

The grid also requires a `<div id="portal" />` near the end of your document body for its overlay editors — see the Prerequisites section of [API.md](packages/core/API.md).

## Full API documentation

The API documentation lives in [packages/core/API.md](packages/core/API.md). The upstream project also hosts a rendered version at [docs.grid.glideapps.com](https://docs.grid.glideapps.com/).

# 🤖 AI features (`tengrids-ai`)

`tengrids-ai` adds five model-powered capabilities on top of the grid without putting any vendor SDK in it — you implement one `AiProvider` interface (a `complete(prompt, { signal })` function that returns a string or streams chunks) and every feature routes through it. A `createMockProvider` ships for tests, Storybook, and offline demos.

| Feature | Hook | In one sentence |
| --- | --- | --- |
| AI cells | `useAiCells` + `aiCell()` | The spreadsheet `=AI()` formula: a cell's prompt references its row (`"Summarize {Notes} for {Name}"`), generates only when visible, streams, caches, and is editable in the overlay. |
| Natural-language search | `useNaturalLanguageSearch` | Drives the built-in search box — literal matches instantly, then the model compiles the query into a structured filter that runs locally over every row. |
| Natural-language filter | `useNaturalLanguageFilter` | The same compiler applied as a row permutation, so non-matching rows disappear. |
| Agent-fed data source | `useAgentDataSource` | Rows stream in from an async iterable (an agent, a parser, a crawl) with batched re-renders; edits flow back to the agent. |
| Smart paste | `useSmartPaste` | Pasted text is coerced into the column's kind deterministically (`"$1.2k"`, `"twelve"`, `"yes"`, `"example.com"`); the rest goes to the model in one batched call. |
| Bulk edit | `useBulkEdit` | "Mark the selected rows as shipped" → proposed edits are previewed as highlights and only written on `apply()`. |

```shell
npm i tengrids tengrids-ai
```

Cost and privacy are designed in: the scheduler deduplicates and caches prompts, caps concurrency, and cancels work for rows that scroll away; search sends the model column names and a few sample values, never the table; bulk edit refuses oversized selections. See [packages/ai/README.md](packages/ai/README.md) for the provider contract and per-feature examples, and the live demos under **Extra Packages → AI** in the [Storybook](https://moeghashim.github.io/tengrids/).

# 🛠️ Development

Requirements: Node 20.10+ (see [.nvmrc](.nvmrc)) — nothing else. All tooling runs through a Node CLI at [scripts/cli.mjs](scripts/cli.mjs), so there are no shell prerequisites on any platform.

```shell
npm install
```

Build every package (ESM + CJS + extracted CSS into `dist/`):

```shell
npm run build
```

Run the Storybook dev environment (the fastest way to see changes live):

```shell
npm start
```

A published build of this fork's Storybook is deployed automatically from `main` at **https://moeghashim.github.io/tengrids/**.

Run the tests:

```shell
npm test
```

## Developer CLI

All repository tooling is a single Node script, [scripts/cli.mjs](scripts/cli.mjs) — there is no bash, `jq`, or other shell dependency, and it works on macOS, Linux, and Windows. Invoke it through npm:

```shell
npm run cli -- help
```

| Command | What it does |
| --- | --- |
| `npm run cli -- build core cells source` (or `--all`) | Compiles ESM + CJS with `tsc`, extracts linaria CSS, and writes each package's `dist/` (core is built first; the others in parallel) |
| `npm run cli -- version 6.1.0` | Sets the version in the root and every workspace package and pins the workspace dependency on core (also runs as the npm `version` lifecycle hook) |
| `npm run cli -- test` | Runs the core test suite once (`vitest run`; extra args pass through) |
| `npm run cli -- test --react 18` | Temporarily installs another React (`18`, `19`, or `latest`), runs the suite, then restores `package.json` and the lockfile. Add `--no-restore` to keep the swap; restore is skipped automatically in CI |
| `npm run cli -- bootstrap` | Installs the downstream consumer projects in `test-projects/` and links core into them |

The familiar npm scripts (`npm run build`, `npm run test-18`, `npm run test-19`, `npm run test-latest`, `npm run test-projects`) delegate to these commands, so CI and existing habits keep working.

See [AGENTS.md](AGENTS.md) for a full map of the codebase, all build/test commands, and the gotchas that matter when making changes.

# 📒 FAQ

**Nothing shows up!**

Please read the [Prerequisites section in the docs](packages/core/API.md).

**It crashes when I try to edit a cell!**

Please read the [Prerequisites section in the docs](packages/core/API.md).

**Does it work with screen readers and other a11y tools?**

Yes. The grid maintains a hidden accessibility DOM tree mirroring the visible cells. Bug reports welcome!

**Does it support my data source?**

Yes.

The grid is agnostic about the way you load/store/generate/mutate your data. What it requires is that you tell it which columns you have, how many rows, and give it a function it can call to get the data for a cell in a specific row and column.

**Does it do sorting, searching, and filtering?**

Search is included — you provide the trigger, the grid does the search. Sorting is available via the `useColumnSort` hook in the source package. Filtering is something you would implement in your data source, where it can usually be done more efficiently (e.g. via a database query).

**Can it do frozen columns?**

Yes!

**Can I render my own cells?**

Yes, but the renderer has to use HTML Canvas. See the custom-cell examples in the Storybook (`npm start`).

**Why does it use HTML Canvas?**

The upstream team originally implemented the grid with virtualized DOM rendering ([react-virtualized](https://github.com/bvaughn/react-virtualized)). The problem is scrolling performance: once you need to load/unload hundreds of DOM elements per frame, nothing can save you. Canvas rendering sidesteps the DOM entirely while a transparent native scroller keeps scrolling feeling native.

**I want to use this with Next.js / Vercel, but I'm getting weird errors**

The easiest way is to wrap your grid in a component and import it as a dynamic with `ssr: false`:

```tsx
import dynamic from "next/dynamic";

const Grid = dynamic(() => import("../components/Grid"), { ssr: false });
```

# 📄 License

[MIT](LICENSE) — original work copyright Glide, retained by this fork as the license requires.
