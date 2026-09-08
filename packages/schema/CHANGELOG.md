# tengrids-schema changelog

## Unreleased

- Initial release: `createSchema`, `col.*` factories (`text`, `number`, `boolean`, `date`, `enum`, `uri`, `image`, `markdown`, `custom`), `InferRow`, generators (`keys`, `columns`, `cell`, `toCell`, `applyEdit`, `onEdited`, `filterFields`, `print`), and `useSchemaGrid`.
- `FilterSpec` (`FilterOp`, `FilterClause`, `evaluateFilter`, `matchesClause`, `findColumnIndex`, `specColumns`) moved here from `tengrids-ai`; `tengrids-ai` re-exports every moved name.
