import * as React from "react";
import { DataEditor } from "tengrids";
import "tengrids/dist/index.css";
import "tengrids-schema/dist/index.css";
import {
    col,
    createSchema,
    FilterRail,
    memoryStore,
    useGridFilters,
    useSchemaGrid,
    type InferRow,
} from "tengrids-schema";
import { createMockProvider, useNaturalLanguageFilter } from "../index.js";

export default {
    title: "Extra Packages/Filters",
    parameters: { layout: "fullscreen" },
};

const schema = createSchema({
    name: col.text({ title: "Name", width: 160 }),
    dept: col.enum({ title: "Dept", values: ["Engineering", "Sales", "Ops"] as const, width: 140 }),
    status: col.enum({ title: "Status", values: ["draft", "active", "closed"] as const, width: 110 }),
    age: col.number({ title: "Age", width: 80 }),
});

type Row = InferRow<typeof schema>;
const FIRST = ["Ada", "Grace", "Linus", "Mia", "Noor", "Ken"];
const DEPTS = ["Engineering", "Sales", "Ops"] as const;
const STATUSES = ["draft", "active", "closed"] as const;

function makeRows(n: number): Row[] {
    return Array.from({ length: n }, (_, i) => ({
        name: `${FIRST[i % FIRST.length]} ${i}`,
        dept: DEPTS[i % DEPTS.length],
        status: STATUSES[i % STATUSES.length],
        age: 22 + ((i * 13) % 40),
    }));
}

const COMPILED = JSON.stringify({
    conjunction: "and",
    clauses: [{ column: "status", op: "in", value: ["active"] }],
});

export const AiFilterToChips: React.FC = () => {
    const rows = React.useMemo(() => makeRows(60), []);
    const store = React.useMemo(() => memoryStore(), []);
    const grid = useSchemaGrid(schema, rows);
    const filters = useGridFilters({
        fields: schema.filterFields(),
        columns: grid.columns,
        rows: grid.rows,
        getCellContent: grid.getCellContent,
        store,
    });
    const provider = React.useMemo(() => createMockProvider(() => COMPILED), []);
    const [query, setQuery] = React.useState("");
    useNaturalLanguageFilter({
        provider,
        columns: grid.columns,
        rows: grid.rows,
        getCellContent: grid.getCellContent,
        query,
        debounceMs: 0,
        onSpec: filters.setSpec,
    });
    return (
        <div
            style={{
                padding: 24,
                fontFamily: "Inter, system-ui, sans-serif",
                background: "#f6f7fb",
                minHeight: "100vh",
            }}
        >
            <h2 style={{ margin: "0 0 4px" }}>AI filter → chips</h2>
            <p style={{ margin: "0 0 12px", color: "#555", maxWidth: 720 }}>
                Type a query (the mock always compiles to Status is active). Chips appear via onSpec. Editing a chip
                changes the rows without another model call. Calls: {provider.calls.length}
            </p>
            <input
                aria-label="Natural language filter"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder='e.g. "active rows"'
                style={{ marginBottom: 12, padding: "6px 8px", width: 280 }}
            />
            <FilterRail filters={filters} />
            <div style={{ width: "100%", height: 460, background: "white", borderRadius: 8, overflow: "hidden" }}>
                <DataEditor {...grid} rows={filters.rows} getCellContent={filters.getCellContent} />
            </div>
        </div>
    );
};
