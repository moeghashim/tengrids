import * as React from "react";
import { DataEditor, type DataEditorRef } from "tengrids";
import "tengrids/dist/index.css";
import { useAsyncDataSource } from "tengrids-source";
import { col, createSchema, useSchemaGrid, type InferRow } from "../index.js";

export default {
    title: "Extra Packages/Schema",
    parameters: { layout: "fullscreen" },
};

const schema = createSchema({
    name: col.text({ title: "Name", width: 160 }),
    cost: col.number({ title: "Cost", format: "currency", currency: "USD", width: 110 }),
    status: col.enum({ title: "Status", values: ["draft", "active", "closed"] as const, width: 110 }),
    due: col.date({ title: "Due", width: 140 }),
    paid: col.boolean({ title: "Paid", width: 80 }),
    site: col.uri({ title: "Website", width: 200 }),
    notes: col.markdown({ title: "Notes", readonly: true, width: 220 }),
});

type Row = InferRow<typeof schema>;

const STATUSES = ["draft", "active", "closed"] as const;
const NAMES = ["Ada", "Grace", "Linus", "Mia", "Noor", "Ken", "Sara", "Yuki", "Omar", "Lea"];

function makeRows(n: number): Row[] {
    return Array.from({ length: n }, (_, i) => ({
        name: `${NAMES[i % NAMES.length]} ${i}`,
        cost: Math.round((10 + ((i * 17) % 990)) * 100) / 100,
        status: STATUSES[i % STATUSES.length],
        due: i % 7 === 0 ? undefined : new Date(2026, i % 12, (i % 28) + 1),
        paid: i % 3 === 0,
        site: `https://example.com/${i}`,
        notes: i % 5 === 0 ? "_starred_" : "ok",
    }));
}

const Frame: React.FC<{ title: string; blurb: string; children: React.ReactNode }> = ({ title, blurb, children }) => (
    <div
        style={{
            padding: 24,
            fontFamily: "Inter, system-ui, sans-serif",
            color: "#1a1a1a",
            background: "#f6f7fb",
            minHeight: "100vh",
            boxSizing: "border-box",
        }}
    >
        <h2 style={{ margin: "0 0 4px" }}>{title}</h2>
        <p style={{ margin: "0 0 12px", color: "#555", maxWidth: 720 }}>{blurb}</p>
        <div
            style={{
                width: "100%",
                height: 460,
                background: "white",
                borderRadius: 8,
                overflow: "hidden",
                boxShadow: "0 1px 4px rgba(0,0,0,.12)",
            }}
        >
            {children}
        </div>
    </div>
);

export const InMemory: React.FC = () => {
    const [rows, setRows] = React.useState<readonly Row[]>(() => makeRows(1000));
    const grid = useSchemaGrid(schema, rows, { onRowsChange: setRows });
    return (
        <Frame
            title="useSchemaGrid · 1,000 rows"
            blurb="The §5.2 schema: one object literal plus useSchemaGrid. Edit cost, paid, status, or due — invalid values (letters in Cost, a status not in the list, a garbage date) are rejected."
        >
            <DataEditor {...grid} />
        </Frame>
    );
};

export const AsyncSource: React.FC = () => {
    const allRows = React.useMemo(() => makeRows(1000), []);
    const dataRef = React.useRef(allRows);
    dataRef.current = allRows;
    const gridRef = React.useRef<DataEditorRef | null>(null);
    const getRowData = React.useCallback(async (range: readonly [number, number]) => {
        await new Promise<void>(resolve => {
            window.setTimeout(resolve, 15);
        });
        return dataRef.current.slice(range[0], range[1]);
    }, []);
    const source = useAsyncDataSource(50, 2, getRowData, schema.toCell, schema.onEdited, gridRef);
    return (
        <Frame
            title="schema.toCell + useAsyncDataSource"
            blurb="schema.toCell and schema.onEdited plug into useAsyncDataSource with no adapters. Pages of 50 rows load as you scroll."
        >
            <DataEditor ref={gridRef} columns={schema.columns()} rows={allRows.length} {...source} />
        </Frame>
    );
};
