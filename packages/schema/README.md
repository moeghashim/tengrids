# tengrids-schema

Declarative column schema for [tengrids](https://github.com/moeghashim/tengrids). One object literal produces grid columns, cell mapping, edit writing, filter fields, and TypeScript row types.

```shell
npm i tengrids tengrids-schema
```

Peer deps: `react` / `react-dom` `^16.12.0 || 17.x || 18.x || 19.x`. Runtime dependency: `tengrids` at the same version.

## Worked example

```tsx
import { DataEditor } from "tengrids";
import { createSchema, col, type InferRow, useSchemaGrid } from "tengrids-schema";

const schema = createSchema({
    name: col.text({ title: "Name", width: 160 }),
    cost: col.number({ title: "Cost", format: "currency", currency: "USD", width: 110 }),
    status: col.enum({ title: "Status", values: ["draft", "active", "closed"] as const }),
    due: col.date({ title: "Due" }),
    paid: col.boolean({ title: "Paid" }),
    site: col.uri({ title: "Website" }),
    notes: col.markdown({ title: "Notes", readonly: true }),
});

type Row = InferRow<typeof schema>;
// { name: string; cost: number; status: "draft" | "active" | "closed"; due: Date | undefined; paid: boolean; site: string; notes: string }

function Grid({ rows, setRows }: { rows: readonly Row[]; setRows: (r: readonly Row[]) => void }) {
    const grid = useSchemaGrid(schema, rows, { onRowsChange: setRows });
    return <DataEditor {...grid} />;
    // grid = { columns, rows, getCellContent, onCellEdited, getCellsForSelection }
}
```

`schema.toCell` and `schema.onEdited` match `tengrids-source`'s `RowToCell` / `RowEditedCallback`, so they plug into `useAsyncDataSource` with no adapters.

## Column factories

Every factory returns a `ColumnDef`. Shared options (all optional):

| Option          | Default        | Meaning                                                                                    |
| --------------- | -------------- | ------------------------------------------------------------------------------------------ |
| `title`         | the object key | Header text                                                                                |
| `id`            | the object key | Column id (always set on `schema.columns()`)                                               |
| `width`         | unset          | When set, the column is a `SizedGridColumn`                                                |
| `grow`          | unset          | Flex grow                                                                                  |
| `group`         | unset          | Column group header                                                                        |
| `icon`          | unset          | Header icon                                                                                |
| `readonly`      | `false`        | Overlay disabled; `applyEdit` returns `undefined`                                          |
| `hasMenu`       | unset          | Header menu affordance                                                                     |
| `themeOverride` | unset          | Per-column theme                                                                           |
| `sortable`      | `true`         | Exposed on `schema.flags(key).sortable` (filter/sort layer in PR2)                         |
| `filterable`    | `true`         | When `false`, omitted from `filterFields()`; also on `schema.flags(key)`                   |
| `accessor`      | unset          | `(row: SourceRow) => value` for nested reads; edits still write `{ ...row, [key]: value }` |

### `col.text`

Grid cell: `Text`. Options: `multiline` (`allowWrapping`), `maxLength`. Edit coercion: trim; reject when longer than `maxLength`.

### `col.number`

Grid cell: `Number`. Options: `format: "plain" \| "currency" \| "percent" \| "integer"`, `currency` (ISO code, default `"USD"`), `min`, `max`, `decimals`. Percent values are ratios (`0.15` displays as 15%). Edit coercion: parse a number; reject `NaN` and values outside `min`/`max`.

### `col.boolean`

Grid cell: `Boolean`. Options: `allowIndeterminate`. Edit coercion: boolean; indeterminate is allowed only when that option is set.

### `col.date`

Grid cell: `Text` with a formatted `displayData` (ISO in `data`). A custom date renderer from `tengrids-cells` is not a dependency of this package (PRD: Text unless cells is present). Options: `format: "date" \| "datetime" \| "relative"`, `timeZone`. Inferred value: `Date \| undefined`. Edit coercion: parse ISO (`YYYY-MM-DD`, calendar-validated) or `Date.parse`; empty → `undefined`; reject invalid (including `2026-02-30`).

### `col.enum`

Grid cell: `Text` with `displayData` from `labels`; `Bubble` when `multiple: true`. Options: `values` (readonly tuple — pass `as const` for a union), `labels`, `multiple`. Edit coercion: must be in `values`.

### `col.uri`

Grid cell: `Uri`. Options: `hoverEffect`, `displayAsLink` (sets `hoverEffect` when `hoverEffect` is omitted; an explicit `hoverEffect: false` wins). Edit coercion: allow-list `http`/`https`/`mailto`/`tel`, add `https://` to bare domains, `mailto:` to emails; reject other schemes (`javascript:`, `data:`, …). Empty string is allowed.

### `col.image`

Grid cell: `Image`. Options: `allowAdd` (default allowed; `false` rejects edits that grow the url list), `rounding`. Inferred value: `readonly string[]`. Edit coercion: array of urls.

### `col.markdown`

Grid cell: `Markdown`. Edit coercion: string.

### `col.custom`

Grid cell: whatever `toCell` returns (any `GridCell`, so a custom column can reuse a built-in kind; §5.2 says Custom). Shared `readonly` is applied to the generated cell. Options: `toCell(rowValue, row)`, `fromCell(cell, row)` (return `undefined` to reject), `filter?: FilterKind` for `filterFields()`.

## Generators

All pure and memoized once per schema:

- `schema.keys` — readonly ordered keys
- `schema.columns()` — readonly `GridColumn[]` (`id` always set; `width` when provided; frozen so the memoized result cannot be mutated)
- `schema.cell(row, key)` — `GridCell` for one field
- `schema.toCell(row, colIndex)` — `RowToCell` shape
- `schema.applyEdit(row, key, cell)` — new row, or `undefined` when rejected; never mutates
- `schema.onEdited` — `RowEditedCallback` shape
- `schema.filterFields()` — readonly `FilterField[]` derived from kind / `values` (image columns and `filterable: false` are omitted)
- `schema.flags(key)` — `{ sortable, filterable, readonly }` with defaults `true` / `true` / `false`
- `schema.print()` — TypeScript source of this schema (used by the scaffold tool). Functions (`accessor`, `toCell`, `fromCell`) become commented stubs so the output still parses; non-identifier keys are quoted.

`useSchemaGrid(schema, rows, { onRowsChange, onRowChange, readonly })` composes the above for in-memory arrays.

## FilterSpec

`FilterOp`, `FilterClause`, `FilterSpec`, `evaluateFilter`, `matchesClause`, `findColumnIndex`, and `specColumns` live here. `tengrids-ai` re-exports every name, so existing imports keep working.

MIT. Part of tengrids, a fork of Glide Data Grid by Glide.
