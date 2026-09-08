# Schema (`tengrids-schema`)

One object literal produces columns, cells, edits, filter fields, and `InferRow`.

```tsx
import { DataEditor } from "tengrids";
import { createSchema, col, type InferRow, useSchemaGrid } from "tengrids-schema";
import "tengrids/dist/index.css";

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

function Grid({ rows, setRows }: { rows: readonly Row[]; setRows: (r: readonly Row[]) => void }) {
    const grid = useSchemaGrid(schema, rows, { onRowsChange: setRows });
    return <DataEditor {...grid} />;
}
```

Factories: `col.text`, `col.number`, `col.boolean`, `col.date`, `col.enum`, `col.uri`, `col.image`, `col.markdown`, `col.custom`.

`schema.print()` emits TypeScript source of the schema (used by the MCP `scaffold` tool). It throws if a column has a function option (`accessor`, `toCell`, `fromCell`).

`schema.toCell` / `schema.onEdited` plug into `tengrids-source`'s `useAsyncDataSource` with no adapters.
