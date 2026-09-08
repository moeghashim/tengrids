# tengrids-schema changelog

## Unreleased

- Faceted filters: `useGridFilters`, `FilterField` ops table, `memoryStore` / `urlStore` / `FilterStore`, readable URL codec (`toSearchParams` / `fromSearchParams`), `FilterRail` + headless `useFilterRailState`.
- Package now depends on `@linaria/react` and emits `dist/index.css` (side-effectful CSS), matching `tengrids-cells`.

- Initial release: `createSchema`, `col.*` factories (`text`, `number`, `boolean`, `date`, `enum`, `uri`, `image`, `markdown`, `custom`), `InferRow`, generators (`keys`, `columns`, `cell`, `toCell`, `applyEdit`, `onEdited`, `filterFields`, `print`), and `useSchemaGrid`.
- `FilterSpec` (`FilterOp`, `FilterClause`, `evaluateFilter`, `matchesClause`, `findColumnIndex`, `specColumns`) moved here from `tengrids-ai`; `tengrids-ai` re-exports every moved name.
