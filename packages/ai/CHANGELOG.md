# tengrids-ai changelog

## 6.0.4-alpha26

- Provider adapters via each vendor's official SDK (optional peers, loaded lazily): `createAnthropicProvider` (Claude; `difficulty` → effort; server-side refusal fallbacks), `createOpenAiProvider` / `createCodexProvider` (Responses API), `createGrokProvider`, `createOpenRouterProvider`, and `createOpenAiCompatibleProvider`. Keys accept a string or an async token getter.
- `createRoutingProvider`: route by `difficulty` tier and by explicit `model`; `FEATURE_DIFFICULTY` defaults (search/paste low, bulk edit high, cells medium).
- `AiRequest` gains `model` and `difficulty`; `AiCellData` gains `model` and `difficulty` (editable in the overlay, part of the cache key); `useAiCells` gains `defaultDifficulty`.
- Storybook "Live Providers" harness: connect a real vendor with your own key; worked example of a cost × factor column computed in a new cell by a chosen model.

- `useAiCells`: new `onCellsEdited` option — every finished AI cell is emitted once as a normal edit (`status: "done"`, result in `data.result`/`copyData`) so apps can persist generated values like user edits.
- `useAiCells`: persisted results are trusted — a cell returned from `getCellContent` with a `done` result is served as-is and primes the scheduler cache (a saved sheet reloads with zero model calls); a hand-edited result wins over the cache.
- `useAiCells`: `regenerate()` overrides a stale persisted value with the fresh result until the app persists it.
- Storybook demo persists results into state; README documents the flow.

## 6.0.4-alpha25

- Initial release: `AiProvider` seam + `createMockProvider`, `AiScheduler`, AI cells (`AiCellRenderer`, `aiCell`, `useAiCells`), natural-language search and filter (`useNaturalLanguageSearch`, `useNaturalLanguageFilter`, query → `FilterSpec` compiler), `useAgentDataSource`, smart paste (`useSmartPaste`, `coerceValue`), and bulk edit with preview (`useBulkEdit`).
