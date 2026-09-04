# tengrids-ai changelog

## 6.0.4-alpha26

- `useAiCells`: new `onCellsEdited` option — every finished AI cell is emitted once as a normal edit (`status: "done"`, result in `data.result`/`copyData`) so apps can persist generated values like user edits.
- `useAiCells`: persisted results are trusted — a cell returned from `getCellContent` with a `done` result is served as-is and primes the scheduler cache (a saved sheet reloads with zero model calls); a hand-edited result wins over the cache.
- `useAiCells`: `regenerate()` overrides a stale persisted value with the fresh result until the app persists it.
- Storybook demo persists results into state; README documents the flow.

## 6.0.4-alpha25

- Initial release: `AiProvider` seam + `createMockProvider`, `AiScheduler`, AI cells (`AiCellRenderer`, `aiCell`, `useAiCells`), natural-language search and filter (`useNaturalLanguageSearch`, `useNaturalLanguageFilter`, query → `FilterSpec` compiler), `useAgentDataSource`, smart paste (`useSmartPaste`, `coerceValue`), and bulk edit with preview (`useBulkEdit`).
