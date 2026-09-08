import * as React from "react";
import { DataEditor, getDefaultTheme, type DataEditorRef, type Theme } from "tengrids";
import "tengrids/dist/index.css";
import { useAsyncDataSource, useColumnSort } from "tengrids-source";
import { col, createSchema, evaluateFilter, useSchemaGrid, type FilterSpec, type InferRow } from "../index.js";
import { FilterRail, memoryStore, urlStore, useGridFilters } from "../index.js";

export default {
    title: "Extra Packages/Filters",
    parameters: { layout: "fullscreen" },
};

const schema = createSchema({
    name: col.text({ title: "Name", width: 160 }),
    cost: col.number({ title: "Cost", format: "currency", currency: "USD", width: 110 }),
    status: col.enum({ title: "Status", values: ["draft", "active", "closed"] as const, width: 110 }),
    due: col.date({ title: "Due", width: 140 }),
    paid: col.boolean({ title: "Paid", width: 80 }),
    site: col.uri({ title: "Website", width: 200 }),
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
    }));
}

const SEED_SPEC: FilterSpec = {
    clauses: [
        { column: "status", op: "in", value: ["active", "draft"] },
        { column: "cost", op: "gte", value: 100 },
    ],
};

const darkTheme: Partial<Theme> = {
    accentColor: "#8c96ff",
    accentFg: "#000000",
    textDark: "#ffffff",
    textMedium: "#b8b8b8",
    bgCell: "#16161b",
    bgHeader: "#212121",
    borderColor: "rgba(225,225,225,0.2)",
    fontFamily: getDefaultTheme().fontFamily,
    roundingRadius: 4,
};

const highContrastTheme: Partial<Theme> = {
    accentColor: "#ffff00",
    accentFg: "#000000",
    textDark: "#ffffff",
    textMedium: "#ffffff",
    bgCell: "#000000",
    bgHeader: "#000000",
    borderColor: "#ffffff",
    fontFamily: getDefaultTheme().fontFamily,
    roundingRadius: 4,
};

function cssVars(theme: Partial<Theme>): React.CSSProperties {
    const base = getDefaultTheme();
    const t = { ...base, ...theme };
    return {
        ["--gdg-accent-color"]: t.accentColor,
        ["--gdg-accent-fg"]: t.accentFg,
        ["--gdg-text-dark"]: t.textDark,
        ["--gdg-text-medium"]: t.textMedium,
        ["--gdg-bg-cell"]: t.bgCell,
        ["--gdg-bg-header"]: t.bgHeader,
        ["--gdg-border-color"]: t.borderColor,
        ["--gdg-font-family"]: t.fontFamily,
        ["--gdg-rounding-radius"]: `${t.roundingRadius ?? 4}px`,
        background: t.bgCell,
        color: t.textDark,
        fontFamily: t.fontFamily,
    } as React.CSSProperties;
}

const Frame: React.FC<{
    title: string;
    blurb: string;
    theme?: Partial<Theme>;
    children: React.ReactNode;
}> = ({ title, blurb, theme, children }) => (
    <div
        style={{
            padding: 24,
            minHeight: "100vh",
            boxSizing: "border-box",
            ...cssVars(theme ?? {}),
        }}
    >
        <h2 style={{ margin: "0 0 4px" }}>{title}</h2>
        <p style={{ margin: "0 0 12px", maxWidth: 720, color: "var(--gdg-text-medium)" }}>{blurb}</p>
        {children}
    </div>
);

const GridBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ width: "100%", height: 460, overflow: "hidden", borderRadius: 8 }}>{children}</div>
);

function FilteredGrid(props: { rows: readonly Row[]; store?: ReturnType<typeof memoryStore>; theme?: Partial<Theme> }) {
    const grid = useSchemaGrid(schema, props.rows);
    const filters = useGridFilters({
        fields: schema.filterFields(),
        columns: grid.columns,
        rows: grid.rows,
        getCellContent: grid.getCellContent,
        store: props.store,
        maxRows: 100_000,
    });
    return (
        <>
            <FilterRail filters={filters} />
            <GridBox>
                <DataEditor {...grid} rows={filters.rows} getCellContent={filters.getCellContent} theme={props.theme} />
            </GridBox>
        </>
    );
}

export const InMemory100k: React.FC = () => {
    const rows = React.useMemo(() => makeRows(100_000), []);
    const store = React.useMemo(() => memoryStore(), []);
    return (
        <Frame
            title="100,000 rows in memory"
            blurb="useGridFilters evaluates a clause change in one pass. Open Status or Cost and change a chip."
        >
            <FilteredGrid rows={rows} store={store} />
        </Frame>
    );
};

export const UrlStore: React.FC = () => {
    const rows = React.useMemo(() => makeRows(200), []);
    const store = React.useMemo(() => urlStore({ param: "f", history: "push" }), []);
    const grid = useSchemaGrid(schema, rows);
    const filters = useGridFilters({
        fields: schema.filterFields(),
        columns: grid.columns,
        rows: grid.rows,
        getCellContent: grid.getCellContent,
        store,
    });
    return (
        <Frame
            title="urlStore"
            blurb="Filters live in ?f=… (push history). Reload, back, and forward keep the spec. Open Status and pick a value."
        >
            <FilterRail filters={filters} />
            <GridBox>
                <DataEditor {...grid} rows={filters.rows} getCellContent={filters.getCellContent} />
            </GridBox>
        </Frame>
    );
};

function RailThemeStory(props: { title: string; blurb: string; theme?: Partial<Theme> }) {
    const rows = React.useMemo(() => makeRows(40), []);
    const store = React.useMemo(() => memoryStore(SEED_SPEC), []);
    return (
        <Frame title={props.title} blurb={props.blurb} theme={props.theme}>
            <FilteredGrid rows={rows} store={store} theme={props.theme} />
        </Frame>
    );
}

export const RailDefault: React.FC = () => (
    <RailThemeStory
        title="FilterRail · default theme"
        blurb="Active chips for Status and Cost ≥ 100, styled only with --gdg-* variables."
    />
);

export const RailDark: React.FC = () => (
    <RailThemeStory
        title="FilterRail · dark"
        blurb="Same rail and spec under a dark --gdg-* theme."
        theme={darkTheme}
    />
);

export const RailHighContrast: React.FC = () => (
    <RailThemeStory
        title="FilterRail · high contrast"
        blurb="Yellow accent, white-on-black. Deterministic data, no relative dates, no timers."
        theme={highContrastTheme}
    />
);

export const FilterAndSort: React.FC = () => {
    const rows = React.useMemo(() => makeRows(200), []);
    const store = React.useMemo(() => memoryStore(SEED_SPEC), []);
    const grid = useSchemaGrid(schema, rows);
    const filters = useGridFilters({
        fields: schema.filterFields(),
        columns: grid.columns,
        rows: grid.rows,
        getCellContent: grid.getCellContent,
        store,
    });
    const sorted = useColumnSort({
        columns: grid.columns,
        rows: filters.rows,
        getCellContent: filters.getCellContent,
        sort: { column: grid.columns[1], direction: "desc" },
    });
    return (
        <Frame
            title="Filter + sort"
            blurb="useGridFilters then useColumnSort. getOriginalIndex chains: filter.getOriginalIndex(sort.getOriginalIndex(i))."
        >
            <FilterRail filters={filters} />
            <GridBox>
                <DataEditor {...grid} rows={filters.rows} getCellContent={sorted.getCellContent} />
            </GridBox>
        </Frame>
    );
};

function AsyncFiltered(props: { spec: FilterSpec; allRows: readonly Row[] }) {
    const gridRef = React.useRef<DataEditorRef | null>(null);
    const columns = React.useMemo(() => schema.columns(), []);
    const filtered = React.useMemo(() => {
        if (props.spec.clauses.length === 0) return props.allRows;
        return props.allRows.filter(row => {
            const cells = columns.map((_, col) => schema.toCell(row, col));
            return evaluateFilter(props.spec, columns, cells);
        });
    }, [props.allRows, props.spec, columns]);
    const getRowData = React.useCallback(
        async (range: readonly [number, number]) => {
            await new Promise<void>(resolve => {
                window.setTimeout(resolve, 8);
            });
            return filtered.slice(range[0], range[1]);
        },
        [filtered]
    );
    const source = useAsyncDataSource(40, 2, getRowData, schema.toCell, schema.onEdited, gridRef);
    return <DataEditor ref={gridRef} columns={columns} rows={filtered.length} {...source} />;
}

export const AsyncServer: React.FC = () => {
    const allRows = React.useMemo(() => makeRows(500), []);
    const store = React.useMemo(() => memoryStore(), []);
    const grid = useSchemaGrid(schema, allRows);
    const filters = useGridFilters({
        fields: schema.filterFields(),
        columns: grid.columns,
        rows: grid.rows,
        getCellContent: grid.getCellContent,
        store,
    });
    const specKey = filters.toSearchParams().toString();
    return (
        <Frame
            title="Server-side filters + useAsyncDataSource"
            blurb="The mock server receives the current FilterSpec and returns the matching page. Changing a chip remounts the source."
        >
            <FilterRail filters={filters} />
            <GridBox>
                <AsyncFiltered key={specKey} spec={filters.spec} allRows={allRows} />
            </GridBox>
        </Frame>
    );
};
