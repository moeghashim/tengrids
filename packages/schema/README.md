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

| Option          | Default        | Meaning                                                                                                                                                                                                             |
| --------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`         | the object key | Header text                                                                                                                                                                                                         |
| `id`            | the object key | Column id (always set on `schema.columns()`)                                                                                                                                                                        |
| `width`         | unset          | When set, the column is a `SizedGridColumn`                                                                                                                                                                         |
| `grow`          | unset          | Flex grow                                                                                                                                                                                                           |
| `group`         | unset          | Column group header                                                                                                                                                                                                 |
| `icon`          | unset          | Header icon                                                                                                                                                                                                         |
| `readonly`      | `false`        | Overlay disabled; `applyEdit` returns `undefined`                                                                                                                                                                   |
| `hasMenu`       | unset          | Header menu affordance                                                                                                                                                                                              |
| `themeOverride` | unset          | Per-column theme                                                                                                                                                                                                    |
| `sortable`      | `true`         | Exposed on `schema.flags(key).sortable` (filter/sort layer in PR2)                                                                                                                                                  |
| `filterable`    | `true`         | When `false`, omitted from `filterFields()`; also on `schema.flags(key)`                                                                                                                                            |
| `accessor`      | unset          | `(row) => value` for nested reads; edits still write `{ ...row, [key]: value }`. The row passed to callbacks is untyped — annotate the parameter yourself (`(r: { address: { city: string } }) => r.address.city`). |

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

Grid cell: whatever `toCell` returns (any `GridCell`, so a custom column can reuse a built-in kind; §5.2 says Custom). Shared `readonly` is applied to the generated cell. Options: `toCell(rowValue, row)`, `fromCell(cell, row)` (return `undefined` to reject), `filter?: FilterKind` for `filterFields()`. Like `accessor`, the `row` argument is untyped; annotate it at the call site.

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
- `schema.print()` — TypeScript source of this schema (used by the scaffold tool). Non-identifier keys are quoted. Throws if any column has a function option (`accessor`, `toCell`, `fromCell`); the scaffold consumes JSON schemas without callbacks.

`useSchemaGrid(schema, rows, { onRowsChange, onRowChange, readonly })` composes the above for in-memory arrays.

## FilterSpec

`FilterOp`, `FilterClause`, `FilterSpec`, `evaluateFilter`, `matchesClause`, `findColumnIndex`, and `specColumns` live here. `tengrids-ai` re-exports every name, so existing imports keep working.

## Faceted filters

```tsx
import { useGridFilters, memoryStore, urlStore, FilterRail } from "tengrids-schema";
import "tengrids-schema/dist/index.css";

const filters = useGridFilters({
    fields: schema.filterFields(),
    columns: grid.columns,          // maps field keys onto getCellContent indices
    rows: grid.rows,
    getCellContent: grid.getCellContent,
    store: urlStore({ param: "f" }), // default: memoryStore()
    maxRows: 50_000,
});

<FilterRail filters={filters} />
<DataEditor {...grid} rows={filters.rows} getCellContent={filters.getCellContent} />
```

`useGridFilters` returns `spec`, `setSpec` (`undefined` clears, so `onSpec: filters.setSpec` type-checks), `setClause(key, clause | clause[] | undefined)`, `clear()`, remapped `rows` / `getCellContent` / `getOriginalIndex` (same contract as `useColumnSort`), `facets`, `status` (`idle` | `filtering` after a non-empty spec is applied), `matched`, `truncated` (true whenever evaluation was capped at `maxRows`, including an empty spec), and `toSearchParams` / `fromSearchParams`. Evaluation is one synchronous pass over `min(rows, maxRows)`, memoized on `(spec, rows, getCellContent)`. Facet counts apply every clause except the field's own. Number/date From+To together require AND (under OR only one bound is applied).

`setClause` with a disallowed op throws `RangeError` when `process.env.NODE_ENV !== "production"`, otherwise no-ops.

### Field kinds and ops

| Kind         | Allowed ops                                                                    |
| ------------ | ------------------------------------------------------------------------------ |
| text, uri    | `contains`, `notContains`, `startsWith`, `endsWith`, `eq`, `empty`, `notEmpty` |
| number, date | `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `empty`, `notEmpty`                     |
| boolean      | `eq`, `empty`                                                                  |
| enum         | `in`, `neq`, `empty`, `notEmpty`                                               |

`FilterField`: `{ key, title, kind, values?, labels?, multiple? }`. Enum `multiple` defaults to true in the rail (checkboxes).

### Stores

`FilterStore` is `{ get(): FilterSpec; set(spec): void; subscribe(listener): () => void }`. Subscription in the hook is `useState` + `useEffect` (React 16–19; no `useSyncExternalStore`).

- `memoryStore(initial?)` — default, ephemeral.
- `urlStore({ param = "filter", history = "replace" | "push" })` — History API. The `popstate` listener attaches on first `subscribe` and detaches after the last unsubscribe. Conjunction is stored as `${param}x=or`. `useGridFilters` pins the first `store` instance, so `store: urlStore({ param: "f" })` inline in render is safe; remount to switch stores.

Neither zustand nor nuqs is a dependency. Adapters:

```ts
// zustand
function zustandStore(useStore: {
    getState: () => { spec: FilterSpec };
    setState: (p: { spec: FilterSpec }) => void;
    subscribe: (l: () => void) => () => void;
}): FilterStore {
    return {
        get: () => useStore.getState().spec,
        set: spec => useStore.setState({ spec }),
        subscribe: listener => useStore.subscribe(listener),
    };
}

// nuqs (serialize with toSearchParams / fromSearchParams)
function nuqsStore(get: () => URLSearchParams, set: (p: URLSearchParams) => void): FilterStore {
    const listeners = new Set<() => void>();
    return {
        get: () => fromSearchParams(get()),
        set: spec => {
            set(toSearchParams(spec));
            listeners.forEach(l => l());
        },
        subscribe: l => {
            listeners.add(l);
            return () => listeners.delete(l);
        },
    };
}
```

### URL codec

One readable param per clause, values percent-encoded. Enum values containing `,` or `:` use `%2C` / `%3A`. `decode` ignores unknown keys and invalid ops.

```
?f=status:in:draft,active&f=cost:gte:100&f=name:contains:acme&fx=or
```

`toQueryString(spec, param?)` emits that readable form (urlStore writes it). `fromQueryString` parses the raw search so `%2C` in atoms survives. `toSearchParams` / `fromSearchParams` wrap `URLSearchParams` for programmatic use.

### FilterRail

DOM chips + popovers, styled only with `--gdg-*` (`bg-cell`, `bg-header`, `text-dark`, `text-medium`, `accent-color`, `accent-fg`, `border-color`, `font-family`, `rounding-radius`). Popovers portal into `#portal` when present.

Props: `filters: UseGridFiltersResult`, optional `renderField(field, { close, filters })` to replace one field's control. Keyboard: Tab, Enter/Space, Escape, arrows in lists.

Headless: `useFilterRailState(filters)` returns `openKey`, `open`/`close`/`toggle`, `summary`, `isActive`, `clearField`, `clearAll`, `hasActive`, `truncated`.

MIT. Part of tengrids, a fork of Glide Data Grid by Glide.
