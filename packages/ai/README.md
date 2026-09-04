# tengrids-ai

AI features for [tengrids](https://github.com/moeghashim/tengrids), the canvas data grid — **bring your own model**. Nothing here depends on a vendor SDK: every feature talks to a model through one small `AiProvider` interface, so you can plug in Claude, OpenAI, a local model, or a test double.

```shell
npm i tengrids tengrids-ai
```

## The provider seam

```ts
import type { AiProvider } from "tengrids-ai";

// Example: Claude through your own backend endpoint (never ship API keys to the browser)
const provider: AiProvider = {
    async complete({ prompt, system }, { signal }) {
        const res = await fetch("/api/ai", { method: "POST", body: JSON.stringify({ prompt, system }), signal });
        return (await res.json()).text; // or return an AsyncIterable<string> to stream
    },
};
```

For tests, Storybook, and offline demos: `createMockProvider(input => "answer", { delayMs })` — it records every call and can stream chunks.

## Features

| Feature | Hook / export | What it does |
| --- | --- | --- |
| **AI cells** | `useAiCells`, `aiCell`, `AiCellRenderer` | A cell whose prompt references the row (`"Summarize {Notes} for {Name}"`) — the spreadsheet `=AI()` formula. Generates only for visible rows, cancels on scroll, caches by prompt, streams text, editable via the overlay. |
| **Natural-language search** | `useNaturalLanguageSearch` | Drives the built-in search box: instant literal matches, then the model compiles the query into a structured filter evaluated locally. |
| **Natural-language filter** | `useNaturalLanguageFilter` | Same compiler, applied as a row permutation (like `useColumnSort`) so non-matching rows disappear. |
| **Agent-fed data source** | `useAgentDataSource` | Rows stream in from an async iterable (an agent, a parser, a crawl) with batched re-renders; edits flow back through `onEdited`. |
| **Smart paste** | `useSmartPaste`, `coerceValue` | Deterministic coercion of pasted text into the target column's kind (`"$1,200"`, `"twelve"`, `"yes"`, `"example.com"`); what it can't parse goes to the model in one batched call and is corrected afterwards. |
| **Bulk edit** | `useBulkEdit` | "Mark the selected rows as shipped" → the model proposes edits, the grid previews them as highlights, nothing is written until `apply()`. |

Shared plumbing: `AiScheduler` (dedupe, cache, concurrency cap, cancellation by key or predicate) and `collectCompletion` (normalizes promise-or-stream answers).

## Quick start: AI cells

```tsx
import { DataEditor, GridCellKind } from "tengrids";
import { aiCell, useAiCells } from "tengrids-ai";

const columns = [{ title: "Name", id: "name", width: 160 }, { title: "Notes", id: "notes", width: 240 }, { title: "Summary", id: "summary", width: 320 }];
const getCellContent = ([col, row]) =>
    col === 2
        ? aiCell("One-sentence summary of {Notes} for {Name}")
        : { kind: GridCellKind.Text, data: data[row][col], displayData: data[row][col], allowOverlay: true };

function Grid() {
    const gridRef = React.useRef(null);
    const ai = useAiCells({ provider, columns, getCellContent, gridRef });
    return (
        <DataEditor
            ref={gridRef}
            columns={columns}
            rows={data.length}
            getCellContent={ai.getCellContent}
            customRenderers={ai.customRenderers}
            onVisibleRegionChanged={ai.onVisibleRegionChanged}
        />
    );
}
```

### Persisting generated values

Pass `onCellsEdited` to `useAiCells` and every finished cell arrives as a normal edit — `{ location, value }` with `status: "done"` and the text in `data.result` / `copyData` — so your existing handler stores it like a user edit (and `useUndoRedo` sees it). When `getCellContent` later returns an AI cell that already carries a `done` result, the hook trusts it and never regenerates: a saved sheet reloads for free, and a result a person edited by hand wins over the cache. `regenerate([col, row])` bypasses the stored value until the fresh one is persisted.

```tsx
const ai = useAiCells({ provider, columns, getCellContent, gridRef, onCellsEdited: saveToDatabase });
```

## Natural-language search

```tsx
const search = useNaturalLanguageSearch({ provider, columns, rows, getCellContent });
<DataEditor {...gridProps} searchValue={search.searchValue} onSearchValueChange={search.onSearchValueChange}
    searchResults={search.searchResults} showSearch={search.showSearch} onSearchClose={search.onSearchClose} />
```

`search.status` moves `literal → compiling → compiled`; `search.spec` is the structured filter the model produced. The model receives column names and up to three sample values per column — never the table.

## Agent-fed data source

```tsx
const agent = useAgentDataSource({
    source: async function* (signal) { for await (const row of myAgent.stream({ signal })) yield row; },
    toCell: (row, col) => ({ kind: GridCellKind.Text, data: row[col], displayData: row[col], allowOverlay: true }),
    onEdited: (row, col, value) => ({ ...row, [col]: value.data }),
});
<DataEditor columns={columns} rows={agent.rows} getCellContent={agent.getCellContent} onCellsEdited={agent.onCellsEdited} />
```

## Smart paste and bulk edit

```tsx
const paste = useSmartPaste({ provider, columns, getCellContent, onCellsEdited });
<DataEditor {...gridProps} coercePasteValue={paste.coercePasteValue} onPaste={paste.onPaste} />

const bulk = useBulkEdit({ provider, columns, rows, getCellContent, onCellsEdited });
await bulk.propose("mark them as shipped", gridSelection); // then bulk.apply() or bulk.discard()
<DataEditor {...gridProps} highlightRegions={bulk.highlightRegions} />
```

## Privacy and cost

Every feature sends cell contents to your provider — make it opt-in per grid, and route through a backend you control. Cost control is built in: the scheduler generates AI cells only for rows on screen and cancels the rest, deduplicates identical prompts, and caps concurrency; search compiles a query once and evaluates it locally; smart paste batches; bulk edit refuses more than `maxRows` (default 200).

MIT. Part of tengrids, a fork of Glide Data Grid by Glide.
