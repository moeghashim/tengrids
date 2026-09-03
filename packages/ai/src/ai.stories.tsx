import * as React from "react";
import { DataEditor, GridCellKind, type DataEditorRef, type GridCell, type GridColumn, type GridSelection, type Item, CompactSelection } from "tengrids";
import "tengrids/dist/index.css";
import { aiCell, createMockProvider, type AiRequest, useAgentDataSource, useAiCells, useBulkEdit, useNaturalLanguageFilter, useNaturalLanguageSearch, useSmartPaste } from "./index.js";

export default {
    title: "Extra Packages/AI",
    parameters: { layout: "fullscreen" },
};

// ---------------------------------------------------------------- fixtures

const DEPTS = ["Engineering", "Sales", "Ops", "Design"];
const FIRST = ["Ada", "Grace", "Linus", "Mia", "Noor", "Ken", "Sara", "Yuki", "Omar", "Lea"];
const LAST = ["Lovelace", "Hopper", "Torvalds", "Chen", "Haddad", "Sato", "Okafor", "Ruiz", "Novak", "Berg"];

interface Person {
    name: string;
    dept: string;
    age: number;
    notes: string;
}
function makePeople(n: number): Person[] {
    return Array.from({ length: n }, (_, i) => ({
        name: `${FIRST[i % FIRST.length]} ${LAST[(i * 7) % LAST.length]}`,
        dept: DEPTS[(i * 3) % DEPTS.length],
        age: 22 + ((i * 13) % 40),
        notes: ["Ships weekly", "Owns the roadmap", "Mentors juniors", "Runs on-call", "Leads hiring"][i % 5],
    }));
}
const text = (s: string): GridCell => ({ kind: GridCellKind.Text, data: s, displayData: s, allowOverlay: true });
const num = (n: number): GridCell => ({ kind: GridCellKind.Number, data: n, displayData: String(n), allowOverlay: true });

const Frame: React.FC<{ title: string; blurb: string; children: React.ReactNode; aside?: React.ReactNode }> = ({ title, blurb, children, aside }) => (
    <div style={{ padding: 24, fontFamily: "Inter, system-ui, sans-serif", color: "#1a1a1a", background: "#f6f7fb", minHeight: "100vh", boxSizing: "border-box" }}>
        <h2 style={{ margin: "0 0 4px" }}>{title}</h2>
        <p style={{ margin: "0 0 12px", color: "#555", maxWidth: 720 }}>{blurb}</p>
        {aside !== undefined && <div style={{ margin: "0 0 12px", fontSize: 13 }}>{aside}</div>}
        <div style={{ width: "100%", height: 460, background: "white", borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.12)" }}>{children}</div>
    </div>
);

// ------------------------------------------------------------- 1. AI cells

export const AiCells: React.FC = () => {
    const people = React.useMemo(() => makePeople(40), []);
    const columns = React.useMemo<GridColumn[]>(
        () => [
            { title: "Name", id: "name", width: 160 },
            { title: "Dept", id: "dept", width: 120 },
            { title: "Notes", id: "notes", width: 180 },
            { title: "Intro (AI)", id: "intro", width: 420 },
        ],
        []
    );
    const provider = React.useMemo(
        () =>
            createMockProvider(
                (i: AiRequest) => {
                    const name = /for (.+?):/.exec(i.prompt)?.[1] ?? "them";
                    const words = `${name} is a ${/in ([A-Za-z]+)/.exec(i.prompt)?.[1] ?? "team"} teammate who ${/who (.+)$/.exec(i.prompt)?.[1]?.toLowerCase() ?? "does great work"}.`;
                    return words.split(" ").map((w, k) => (k === 0 ? w : ` ${w}`));
                },
                { delayMs: 60 }
            ),
        []
    );
    const baseGetCellContent = React.useCallback(
        ([col, row]: Item): GridCell => {
            const p = people[row];
            if (col === 0) return text(p.name);
            if (col === 1) return text(p.dept);
            if (col === 2) return text(p.notes);
            return aiCell("Write one friendly sentence for {Name}: they work in {Dept} and are someone who {Notes}");
        },
        [people]
    );
    const gridRef = React.useRef<DataEditorRef | null>(null);
    const ai = useAiCells({ provider, columns, getCellContent: baseGetCellContent, gridRef, concurrency: 3 });
    // The grid repaints finished cells through the damage API without re-rendering this component,
    // so poll the counters for the caption.
    const [, tick] = React.useReducer((x: number) => x + 1, 0);
    React.useEffect(() => {
        const t = setInterval(tick, 500);
        return () => clearInterval(t);
    }, []);
    return (
        <Frame
            title="AI cells — =AI() formulas"
            blurb="The last column is an AI cell whose prompt references the row's other cells. Cells generate as they scroll into view, stream their text, cache by prompt, and cancel when scrolled away. Double-click one to edit the prompt or regenerate."
            aside={<span>provider calls so far: <b>{provider.calls.length}</b> · scheduler cache hits: <b>{ai.scheduler.stats.hits}</b></span>}>
            <DataEditor
                ref={gridRef}
                columns={columns}
                rows={people.length}
                getCellContent={ai.getCellContent}
                customRenderers={ai.customRenderers}
                onVisibleRegionChanged={ai.onVisibleRegionChanged}
                rowMarkers="number"
                smoothScrollY
            />
        </Frame>
    );
};

// ------------------------------------------ 2. natural-language search/filter

function compileMock(i: AiRequest): string {
    const q = /Query: "(.+?)"/.exec(i.prompt)?.[1]?.toLowerCase() ?? "";
    const clauses: unknown[] = [];
    for (const d of DEPTS) if (q.includes(d.toLowerCase().slice(0, 5))) clauses.push({ column: "Dept", op: "eq", value: d });
    const over = /(?:over|above|older than) (\d+)/.exec(q);
    if (over) clauses.push({ column: "Age", op: "gt", value: Number(over[1]) });
    const under = /(?:under|below|younger than) (\d+)/.exec(q);
    if (under) clauses.push({ column: "Age", op: "lt", value: Number(under[1]) });
    if (q.includes("mentor")) clauses.push({ column: "Notes", op: "contains", value: "mentor" });
    if (clauses.length === 0) clauses.push({ column: "Name", op: "contains", value: q.split(" ")[0] ?? q });
    return JSON.stringify({ conjunction: "and", clauses });
}

const peopleColumns: GridColumn[] = [
    { title: "Name", width: 180 },
    { title: "Dept", width: 130 },
    { title: "Age", width: 80 },
    { title: "Notes", width: 200 },
];
const peopleCell = (people: Person[]) => ([col, row]: Item): GridCell => {
    const p = people[row];
    return col === 0 ? text(p.name) : col === 1 ? text(p.dept) : col === 2 ? num(p.age) : text(p.notes);
};

export const NaturalLanguageSearch: React.FC = () => {
    const people = React.useMemo(() => makePeople(300), []);
    const getCellContent = React.useMemo(() => peopleCell(people), [people]);
    const provider = React.useMemo(() => createMockProvider(compileMock, { delayMs: 400 }), []);
    const search = useNaturalLanguageSearch({ provider, columns: peopleColumns, rows: people.length, getCellContent });
    return (
        <Frame
            title="Natural-language search"
            blurb='Type into the box (or press Ctrl/⌘+F in the grid): literal matches highlight instantly, then the model compiles the query into a filter — try "engineers over 40" or "sales who mentor". The model only sees column names and a few sample values, never the table.'
            aside={
                <span>
                    <input value={search.searchValue ?? ""} onChange={e => search.setSearchValue(e.target.value)} placeholder='e.g. "engineers over 40"' style={{ padding: 6, width: 280, marginRight: 12 }} />
                    status: <b>{search.status}</b> · matches: <b>{search.matchedRows.length}</b>
                    {search.spec !== undefined && <code style={{ marginLeft: 12, fontSize: 12 }}>{JSON.stringify(search.spec.clauses)}</code>}
                </span>
            }>
            <DataEditor
                columns={peopleColumns}
                rows={people.length}
                getCellContent={getCellContent}
                searchValue={search.searchValue}
                onSearchValueChange={search.onSearchValueChange}
                searchResults={search.searchResults}
                showSearch={search.showSearch}
                onSearchClose={search.onSearchClose}
                getCellsForSelection={true}
                rowMarkers="number"
            />
        </Frame>
    );
};

export const NaturalLanguageFilter: React.FC = () => {
    const people = React.useMemo(() => makePeople(300), []);
    const getCellContent = React.useMemo(() => peopleCell(people), [people]);
    const provider = React.useMemo(() => createMockProvider(compileMock, { delayMs: 400 }), []);
    const [query, setQuery] = React.useState("");
    const filtered = useNaturalLanguageFilter({ provider, columns: peopleColumns, rows: people.length, getCellContent, query });
    return (
        <Frame
            title="Natural-language filter"
            blurb='Rows that do not match the query are hidden — the same compiled filter as search, applied as a row permutation like useColumnSort. Try "design under 30".'
            aside={
                <span>
                    <input value={query} onChange={e => setQuery(e.target.value)} placeholder="filter rows…" style={{ padding: 6, width: 280, marginRight: 12 }} />
                    status: <b>{filtered.status}</b> · showing <b>{filtered.rows}</b> of {people.length}
                </span>
            }>
            <DataEditor columns={peopleColumns} rows={filtered.rows} getCellContent={filtered.getCellContent} rowMarkers="number" />
        </Frame>
    );
};

// -------------------------------------------------- 3. agent-fed data source

interface Finding {
    company: string;
    signal: string;
    confidence: number;
}
async function* researchAgent(signal: AbortSignal): AsyncIterable<Finding> {
    const companies = ["Acme", "Globex", "Initech", "Umbrella", "Hooli", "Stark", "Wayne", "Wonka", "Tyrell", "Cyberdyne", "Aperture", "Vandelay"];
    const signals = ["Hiring a VP Sales", "Raised Series B", "Launched pricing page", "Opened EU office", "Sponsoring a conference"];
    for (let i = 0; i < companies.length; i++) {
        await new Promise(r => setTimeout(r, 350));
        if (signal.aborted) return;
        yield { company: companies[i], signal: signals[i % signals.length], confidence: 60 + ((i * 17) % 40) };
    }
}

export const AgentDataSource: React.FC = () => {
    const columns = React.useMemo<GridColumn[]>(() => [{ title: "Company", width: 160 }, { title: "Signal", width: 260 }, { title: "Confidence", width: 120 }], []);
    const toCell = React.useCallback((f: Finding, col: number): GridCell => (col === 0 ? text(f.company) : col === 1 ? text(f.signal) : num(f.confidence)), []);
    const agent = useAgentDataSource<Finding>({
        source: researchAgent,
        toCell,
        onEdited: (row, col, v) => (col === 2 && v.kind === GridCellKind.Number ? { ...row, confidence: v.data ?? row.confidence } : col === 1 && v.kind === GridCellKind.Text ? { ...row, signal: v.data } : undefined),
    });
    return (
        <Frame
            title="Agent-fed data source"
            blurb="The grid is the agent's output surface: rows stream in as a (simulated) research agent finds them, the grid stays fully interactive, and your edits flow back through onEdited so the agent can react."
            aside={
                <span>
                    status: <b>{agent.status}</b> · rows: <b>{agent.rows}</b>
                    <button onClick={agent.start} style={{ marginLeft: 12 }}>Restart</button>
                    <button onClick={agent.stop} style={{ marginLeft: 6 }}>Stop</button>
                    {agent.error !== undefined && <span style={{ color: "crimson", marginLeft: 12 }}>{agent.error}</span>}
                </span>
            }>
            <DataEditor columns={columns} rows={agent.rows} getCellContent={agent.getCellContent} onCellsEdited={agent.onCellsEdited} rowMarkers="number" />
        </Frame>
    );
};

// ---------------------------------------------------------- 4. smart paste

const WORDS: Record<string, string> = { ten: "10", "a dozen": "12", "half a hundred": "50", yep: "true", nope: "false", affirmative: "true", negative: "false", "next tuesday": "2026-09-08" };

export const SmartPaste: React.FC = () => {
    const columns = React.useMemo<GridColumn[]>(() => [{ title: "Item", width: 160 }, { title: "Qty", width: 100 }, { title: "In stock", width: 100 }, { title: "Link", width: 260 }], []);
    const [rows, setRows] = React.useState(() => Array.from({ length: 12 }, (_, i) => ({ item: `SKU-${100 + i}`, qty: i * 3, stock: i % 2 === 0, link: "" })));
    const getCellContent = React.useCallback(
        ([col, row]: Item): GridCell => {
            const r = rows[row];
            if (col === 0) return text(r.item);
            if (col === 1) return num(r.qty);
            if (col === 2) return { kind: GridCellKind.Boolean, data: r.stock, allowOverlay: false };
            return { kind: GridCellKind.Uri, data: r.link, displayData: r.link, allowOverlay: true };
        },
        [rows]
    );
    const onCellsEdited = React.useCallback((edits: readonly { location: Item; value: GridCell }[]) => {
        setRows(prev => {
            const next = prev.map(r => ({ ...r }));
            for (const e of edits) {
                const r = next[e.location[1]];
                if (r === undefined) continue;
                const v = e.value;
                if (e.location[0] === 1 && v.kind === GridCellKind.Number) r.qty = v.data ?? 0;
                else if (e.location[0] === 2 && v.kind === GridCellKind.Boolean) r.stock = v.data === true;
                else if (e.location[0] === 3 && v.kind === GridCellKind.Uri) r.link = v.data;
                else if (e.location[0] === 0 && v.kind === GridCellKind.Text) r.item = v.data;
            }
            return next;
        });
        return true;
    }, []);
    const provider = React.useMemo(
        () =>
            createMockProvider((i: AiRequest) => {
                const out: { i: number; value: string }[] = [];
                for (const m of i.prompt.matchAll(/^(\d+)\. .*pasted text: "(.+)"$/gm)) {
                    const v = WORDS[m[2].toLowerCase()];
                    if (v !== undefined) out.push({ i: Number(m[1]), value: v });
                }
                return JSON.stringify(out);
            }, { delayMs: 500 }),
        []
    );
    const paste = useSmartPaste({ provider, columns, getCellContent, onCellsEdited });
    return (
        <Frame
            title="Smart paste"
            blurb='Copy some text and paste it into the Qty / In stock / Link columns: "$1,200", "twelve", "yes", "example.com" are coerced instantly; things like "a dozen" or "affirmative" go to the model in one batched call and are corrected a moment later.'
            aside={<span>pending model corrections: <b>{paste.pending}</b>{paste.lastError !== undefined && <span style={{ color: "crimson" }}> · {paste.lastError}</span>}</span>}>
            <DataEditor
                columns={columns}
                rows={rows.length}
                getCellContent={getCellContent}
                onCellsEdited={onCellsEdited}
                coercePasteValue={paste.coercePasteValue}
                onPaste={paste.onPaste}
                getCellsForSelection={true}
                rowMarkers="number"
            />
        </Frame>
    );
};

// ------------------------------------------------------------ 5. bulk edit

export const BulkEdit: React.FC = () => {
    const columns = React.useMemo<GridColumn[]>(() => [{ title: "Order", width: 140 }, { title: "Status", width: 120 }, { title: "Qty", width: 90 }, { title: "Customer", width: 200 }], []);
    const [orders, setOrders] = React.useState(() =>
        Array.from({ length: 15 }, (_, i) => ({ order: `#${1000 + i}`, status: i % 3 === 0 ? "shipped" : "open", qty: 1 + (i % 6), customer: makePeople(15)[i].name }))
    );
    const getCellContent = React.useCallback(
        ([col, row]: Item): GridCell => {
            const o = orders[row];
            return col === 0 ? text(o.order) : col === 1 ? text(o.status) : col === 2 ? num(o.qty) : text(o.customer);
        },
        [orders]
    );
    const onCellsEdited = React.useCallback((edits: readonly { location: Item; value: GridCell }[]) => {
        setOrders(prev => {
            const next = prev.map(o => ({ ...o }));
            for (const e of edits) {
                const o = next[e.location[1]];
                const v = e.value;
                if (o === undefined) continue;
                if (e.location[0] === 1 && v.kind === GridCellKind.Text) o.status = v.data;
                if (e.location[0] === 2 && v.kind === GridCellKind.Number) o.qty = v.data ?? o.qty;
                if (e.location[0] === 3 && v.kind === GridCellKind.Text) o.customer = v.data;
            }
            return next;
        });
        return true;
    }, []);
    const provider = React.useMemo(
        () =>
            createMockProvider((i: AiRequest) => {
                const instruction = /Instruction: "(.+?)"/.exec(i.prompt)?.[1]?.toLowerCase() ?? "";
                const rowsInScope = [...i.prompt.matchAll(/^\{"row":(\d+),(.*)\}$/gm)].map(m => ({ row: Number(m[1]), json: JSON.parse(`{${m[2]}}`) as Record<string, string> }));
                const changes: unknown[] = [];
                for (const r of rowsInScope) {
                    if (instruction.includes("ship")) changes.push({ row: r.row, column: "Status", value: "shipped" });
                    if (instruction.includes("double")) changes.push({ row: r.row, column: "Qty", value: String(Number(r.json.Qty) * 2) });
                    if (instruction.includes("upper")) changes.push({ row: r.row, column: "Customer", value: (r.json.Customer ?? "").toUpperCase() });
                }
                return JSON.stringify(changes);
            }, { delayMs: 600 }),
        []
    );
    const [selection, setSelection] = React.useState<GridSelection>({ rows: CompactSelection.empty(), columns: CompactSelection.empty() });
    const [instruction, setInstruction] = React.useState("mark them as shipped");
    const bulk = useBulkEdit({ provider, columns, rows: orders.length, getCellContent, onCellsEdited });
    return (
        <Frame
            title="Bulk edit in plain language"
            blurb='Select some rows (click the row markers), type an instruction such as "mark them as shipped", "double the quantity", or "uppercase the customer", and propose. The model returns edits, the grid previews them as highlights, and nothing is written until you apply.'
            aside={
                <span>
                    <input value={instruction} onChange={e => setInstruction(e.target.value)} style={{ padding: 6, width: 260, marginRight: 8 }} />
                    <button onClick={() => void bulk.propose(instruction, selection)} disabled={bulk.status === "proposing"}>Propose</button>
                    <button onClick={bulk.apply} disabled={bulk.proposal === undefined} style={{ marginLeft: 6 }}>Apply {bulk.proposal !== undefined ? `(${bulk.proposal.edits.length})` : ""}</button>
                    <button onClick={bulk.discard} disabled={bulk.proposal === undefined} style={{ marginLeft: 6 }}>Discard</button>
                    <span style={{ marginLeft: 12 }}>status: <b>{bulk.status}</b></span>
                    {bulk.error !== undefined && <span style={{ color: "crimson", marginLeft: 12 }}>{bulk.error}</span>}
                </span>
            }>
            <DataEditor
                columns={columns}
                rows={orders.length}
                getCellContent={getCellContent}
                onCellsEdited={onCellsEdited}
                gridSelection={selection}
                onGridSelectionChange={setSelection}
                highlightRegions={bulk.highlightRegions}
                rowMarkers="both"
                rowSelect="multi"
            />
        </Frame>
    );
};
