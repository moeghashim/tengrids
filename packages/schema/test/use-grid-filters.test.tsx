import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GridCellKind, type GridCell, type GridColumn, type Item } from "tengrids";
import { useColumnSort } from "tengrids-source";
import type { FilterField, FilterSpec } from "../src/index.js";
import { evaluateGridFilters, memoryStore, urlStore, useGridFilters } from "../src/index.js";

const fields: FilterField[] = [
    { key: "name", title: "Name", kind: "text" },
    { key: "cost", title: "Cost", kind: "number" },
    { key: "status", title: "Status", kind: "enum", values: ["draft", "active", "closed"] },
    { key: "due", title: "Due", kind: "date" },
    { key: "paid", title: "Paid", kind: "boolean" },
    { key: "site", title: "Website", kind: "uri" },
];

const columns: GridColumn[] = fields.map(f => ({ id: f.key, title: f.title, width: 1 }));

interface Row {
    name: string;
    cost: number;
    status: "draft" | "active" | "closed";
    due: string;
    paid: boolean;
    site: string;
}

function makeRow(i: number): Row {
    return {
        name: `n${i}`,
        cost: i % 1000,
        status: (["draft", "active", "closed"] as const)[i % 3],
        due: `2026-${String((i % 12) + 1).padStart(2, "0")}-15`,
        paid: i % 2 === 0,
        site: `https://example.com/${i}`,
    };
}

function cellFor(row: Row, col: number): GridCell {
    switch (col) {
        case 0:
            return { kind: GridCellKind.Text, data: row.name, displayData: row.name, allowOverlay: false };
        case 1:
            return { kind: GridCellKind.Number, data: row.cost, displayData: String(row.cost), allowOverlay: false };
        case 2:
            return { kind: GridCellKind.Text, data: row.status, displayData: row.status, allowOverlay: false };
        case 3:
            return { kind: GridCellKind.Text, data: row.due, displayData: row.due, allowOverlay: false };
        case 4:
            return { kind: GridCellKind.Boolean, data: row.paid, allowOverlay: false };
        default:
            return { kind: GridCellKind.Uri, data: row.site, displayData: row.site, allowOverlay: false };
    }
}

function getter(data: readonly Row[]) {
    return ([col, row]: Item): GridCell => cellFor(data[row], col);
}

describe("useGridFilters", () => {
    it("is the identity with an empty spec", () => {
        const data = [makeRow(0), makeRow(1)];
        const getCellContent = getter(data);
        const { result } = renderHook(() => useGridFilters({ fields, columns, rows: data.length, getCellContent }));
        expect(result.current.rows).toBe(2);
        expect(result.current.getCellContent).toBe(getCellContent);
        expect(result.current.getOriginalIndex(1)).toBe(1);
        expect(result.current.status).toBe("idle");
        expect(result.current.matched).toBe(2);
        expect(result.current.truncated).toBe(false);
        expect(result.current.spec.clauses).toEqual([]);
    });

    it("filters rows and remaps getCellContent / getOriginalIndex", () => {
        const data = [makeRow(0), makeRow(1), makeRow(2), makeRow(3)];
        const { result } = renderHook(() =>
            useGridFilters({ fields, columns, rows: data.length, getCellContent: getter(data) })
        );
        act(() => result.current.setClause("status", { column: "status", op: "in", value: ["active"] }));
        expect(result.current.status).toBe("filtering");
        expect(result.current.rows).toBe(1);
        expect(result.current.getOriginalIndex(0)).toBe(1);
        expect(result.current.getCellContent([0, 0])).toMatchObject({ data: "n1" });
    });

    it("clear() restores every row", () => {
        const data = [makeRow(0), makeRow(1)];
        const { result } = renderHook(() =>
            useGridFilters({ fields, columns, rows: data.length, getCellContent: getter(data) })
        );
        act(() => result.current.setClause("paid", { column: "paid", op: "eq", value: true }));
        expect(result.current.rows).toBeLessThan(2);
        act(() => result.current.clear());
        expect(result.current.rows).toBe(2);
        expect(result.current.spec.clauses).toEqual([]);
    });

    it("setClause(undefined) removes that field's clauses", () => {
        const data = [makeRow(0)];
        const { result } = renderHook(() => useGridFilters({ fields, columns, rows: 1, getCellContent: getter(data) }));
        act(() => {
            result.current.setSpec({
                clauses: [
                    { column: "status", op: "in", value: ["draft"] },
                    { column: "cost", op: "gte", value: 0 },
                ],
            });
        });
        act(() => result.current.setClause("status", undefined));
        expect(result.current.spec.clauses).toEqual([{ column: "cost", op: "gte", value: 0 }]);
    });

    it("throws RangeError for a disallowed op in development", () => {
        const data = [makeRow(0)];
        const { result } = renderHook(() => useGridFilters({ fields, columns, rows: 1, getCellContent: getter(data) }));
        expect(() => result.current.setClause("cost", { column: "cost", op: "contains", value: "x" })).toThrow(
            RangeError
        );
        expect(result.current.spec.clauses).toEqual([]);
    });

    it("no-ops a disallowed op when NODE_ENV is production", () => {
        const data = [makeRow(0)];
        const { result } = renderHook(() => useGridFilters({ fields, columns, rows: 1, getCellContent: getter(data) }));
        const orig = process.env.NODE_ENV;
        process.env.NODE_ENV = "production";
        try {
            expect(() =>
                result.current.setClause("cost", { column: "cost", op: "contains", value: "x" })
            ).not.toThrow();
            expect(result.current.spec.clauses).toEqual([]);
        } finally {
            process.env.NODE_ENV = orig;
        }
    });

    it("reads and writes through a provided store", () => {
        const store = memoryStore({ clauses: [{ column: "paid", op: "eq", value: true }] });
        const data = [makeRow(0), makeRow(1)];
        const { result } = renderHook(() =>
            useGridFilters({ fields, columns, rows: 2, getCellContent: getter(data), store })
        );
        expect(result.current.spec.clauses).toHaveLength(1);
        act(() => result.current.clear());
        expect(store.get().clauses).toEqual([]);
    });

    it("toSearchParams / fromSearchParams round-trip hostile values through the hook", () => {
        const data = [makeRow(0)];
        const { result } = renderHook(() => useGridFilters({ fields, columns, rows: 1, getCellContent: getter(data) }));
        const hostile: FilterSpec = {
            clauses: [
                { column: "city:id", op: "eq", value: "hi%20" },
                { column: "status", op: "in", value: ["a,b"] },
            ],
        };
        act(() => result.current.setSpec(hostile));
        const params = result.current.toSearchParams();
        act(() => result.current.clear());
        expect(result.current.spec.clauses).toEqual([]);
        act(() => result.current.fromSearchParams(params));
        expect(result.current.spec.clauses).toEqual(hostile.clauses);
    });

    it("exposes truncated whenever facet evaluation is capped, even with an empty spec", () => {
        const data = Array.from({ length: 10 }, (_, i) => makeRow(i));
        const { result } = renderHook(() =>
            useGridFilters({ fields, columns, rows: 10, getCellContent: getter(data), maxRows: 4 })
        );
        expect(result.current.truncated).toBe(true);
        expect(result.current.rows).toBe(10);
        act(() => result.current.setClause("paid", { column: "paid", op: "eq", value: true }));
        expect(result.current.truncated).toBe(true);
        expect(result.current.rows).toBeLessThanOrEqual(4);
    });

    it("setSpec(undefined) clears, and consecutive setClause calls in one act both stick", () => {
        const data = [makeRow(0), makeRow(1)];
        const { result } = renderHook(() => useGridFilters({ fields, columns, rows: 2, getCellContent: getter(data) }));
        act(() => {
            result.current.setClause("status", { column: "status", op: "in", value: ["draft"] });
            result.current.setClause("cost", { column: "cost", op: "gte", value: 0 });
        });
        expect(result.current.spec.clauses).toEqual([
            { column: "status", op: "in", value: ["draft"] },
            { column: "cost", op: "gte", value: 0 },
        ]);
        act(() => result.current.setSpec(undefined));
        expect(result.current.spec.clauses).toEqual([]);
    });

    it("transformed development code throws without a process global; production no-ops", () => {
        // Bundlers replace the member expression `process.env.NODE_ENV` with a string.
        const transformed = (literal: string) => {
            const fn = new Function(`
                let prod = false;
                try { prod = ${JSON.stringify(literal)} === "production"; } catch { prod = false; }
                if (!prod) throw new RangeError("disallowed");
            `);
            return fn;
        };
        expect(() => transformed("development")()).toThrow(RangeError);
        expect(() => transformed("production")()).not.toThrow();
    });

    it("picks up URL changes that happened while the hook was unmounted", () => {
        window.history.replaceState(null, "", "/?f=name:eq:old");
        const store = urlStore({ param: "f" });
        const data = [makeRow(0), makeRow(1)];
        const first = renderHook(() =>
            useGridFilters({ fields, columns, rows: 2, getCellContent: getter(data), store })
        );
        expect(first.result.current.spec.clauses[0]).toMatchObject({ column: "name", op: "eq", value: "old" });
        first.unmount();
        window.history.replaceState(null, "", "/?f=name:eq:new");
        const second = renderHook(() =>
            useGridFilters({ fields, columns, rows: 2, getCellContent: getter(data), store })
        );
        expect(second.result.current.spec.clauses).toEqual([{ column: "name", op: "eq", value: "new" }]);
        window.history.replaceState(null, "", "/");
    });

    it("composes filter-then-sort with a non-identity permutation", () => {
        const data = [
            { ...makeRow(1), status: "active" as const, cost: 50, name: "hi" },
            { ...makeRow(0), status: "draft" as const, cost: 1, name: "lo" },
            { ...makeRow(1), status: "active" as const, cost: 10, name: "mid" },
        ];
        const getCellContent = getter(data);
        const { result } = renderHook(() => {
            const filters = useGridFilters({ fields, columns, rows: data.length, getCellContent });
            const sorted = useColumnSort({
                columns,
                rows: filters.rows,
                getCellContent: filters.getCellContent,
                sort: { column: columns[1], direction: "asc" },
            });
            const original = (i: number) => filters.getOriginalIndex(sorted.getOriginalIndex(i));
            return { filters, sorted, original };
        });
        act(() => result.current.filters.setClause("status", { column: "status", op: "in", value: ["active"] }));
        expect(result.current.filters.rows).toBe(2);
        expect(result.current.original(0)).toBe(2);
        expect(result.current.original(1)).toBe(0);
        expect(result.current.sorted.getCellContent([1, 0])).toMatchObject({ data: 10 });
        expect(result.current.sorted.getCellContent([0, 1])).toMatchObject({ data: "hi" });
    });

    it("composes sort-then-filter with a non-identity permutation", () => {
        const data = [
            { ...makeRow(1), status: "active" as const, cost: 50, name: "hi" },
            { ...makeRow(0), status: "draft" as const, cost: 1, name: "lo" },
            { ...makeRow(1), status: "active" as const, cost: 10, name: "mid" },
        ];
        const getCellContent = getter(data);
        const { result } = renderHook(() => {
            const sorted = useColumnSort({
                columns,
                rows: data.length,
                getCellContent,
                sort: { column: columns[1], direction: "desc" },
            });
            const filters = useGridFilters({
                fields,
                columns,
                rows: data.length,
                getCellContent: sorted.getCellContent,
            });
            const original = (i: number) => sorted.getOriginalIndex(filters.getOriginalIndex(i));
            return { filters, sorted, original };
        });
        act(() => result.current.filters.setClause("status", { column: "status", op: "in", value: ["active"] }));
        expect(result.current.filters.rows).toBe(2);
        expect(result.current.original(0)).toBe(0);
        expect(result.current.original(1)).toBe(2);
        expect(result.current.filters.getCellContent([1, 0])).toMatchObject({ data: 50 });
    });

    it("does not rescan when inputs are unchanged", () => {
        const data = [makeRow(0), makeRow(1)];
        const getCellContent = getter(data);
        let scans = 0;
        const counting: typeof getCellContent = item => {
            scans++;
            return getCellContent(item);
        };
        const { rerender } = renderHook(() =>
            useGridFilters({ fields, columns, rows: data.length, getCellContent: counting })
        );
        const afterFirst = scans;
        expect(afterFirst).toBeGreaterThan(0);
        rerender();
        expect(scans).toBe(afterFirst);
    });
});

describe("facets", () => {
    const data = [
        { ...makeRow(0), status: "draft" as const, cost: 10, paid: true },
        { ...makeRow(1), status: "active" as const, cost: 20, paid: false },
        { ...makeRow(2), status: "active" as const, cost: 30, paid: true },
        { ...makeRow(3), status: "closed" as const, cost: 40, paid: false },
    ];
    const getCellContent = getter(data);

    it("value counts exclude the field's own clause (B1 brute force)", () => {
        const spec: FilterSpec = { clauses: [{ column: "status", op: "in", value: ["active"] }] };
        const { facets } = evaluateGridFilters(spec, fields, columns, data.length, getCellContent, 50);
        const status = facets.get("status");
        expect(status?.kind).toBe("values");
        if (status?.kind !== "values") return;
        // own clause excluded → all rows counted
        const byVal = Object.fromEntries(status.values.map(v => [v.value, v.count]));
        expect(byVal.draft).toBe(1);
        expect(byVal.active).toBe(2);
        expect(byVal.closed).toBe(1);

        const paid = facets.get("paid");
        expect(paid?.kind).toBe("values");
        if (paid?.kind !== "values") return;
        // other clause applied: only the two active rows
        const paidCounts = Object.fromEntries(paid.values.map(v => [v.value, v.count]));
        expect(paidCounts.true).toBe(1);
        expect(paidCounts.false).toBe(1);
    });

    it("range facets use the other clauses", () => {
        const spec: FilterSpec = { clauses: [{ column: "paid", op: "eq", value: true }] };
        const { facets } = evaluateGridFilters(spec, fields, columns, data.length, getCellContent, 50);
        const cost = facets.get("cost");
        expect(cost).toEqual({ kind: "range", min: 10, max: 30 });
    });

    it("matches brute-force facet counts on a mixed spec", () => {
        const spec: FilterSpec = {
            clauses: [
                { column: "status", op: "in", value: ["draft", "active"] },
                { column: "cost", op: "gte", value: 20 },
            ],
        };
        const got = evaluateGridFilters(spec, fields, columns, data.length, getCellContent, 50);
        const brute = bruteFacets(spec, data);
        const status = got.facets.get("status");
        expect(status?.kind).toBe("values");
        if (status?.kind !== "values") return;
        expect(Object.fromEntries(status.values.map(v => [v.value, v.count]))).toEqual(brute.status);
        const cost = got.facets.get("cost");
        expect(cost).toEqual({ kind: "range", min: brute.costMin, max: brute.costMax });
    });

    it("or-conjunction with no other clauses still counts every row for a field", () => {
        const spec: FilterSpec = { conjunction: "or", clauses: [{ column: "paid", op: "eq", value: true }] };
        const { facets } = evaluateGridFilters(spec, fields, columns, data.length, getCellContent, 50);
        const paid = facets.get("paid");
        if (paid?.kind !== "values") throw new Error("expected values");
        const byVal = Object.fromEntries(paid.values.map(v => [v.value, v.count]));
        expect(byVal.true + byVal.false).toBe(4);
    });
});

function bruteFacets(spec: FilterSpec, data: readonly Row[]) {
    const status: Record<string, number> = { draft: 0, active: 0, closed: 0 };
    let costMin = Infinity;
    let costMax = -Infinity;
    for (const row of data) {
        const others = spec.clauses.filter(c => c.column !== "status");
        if (others.every(c => rowMatches(row, c))) status[row.status]++;
        const costOthers = spec.clauses.filter(c => c.column !== "cost");
        if (costOthers.every(c => rowMatches(row, c))) {
            costMin = Math.min(costMin, row.cost);
            costMax = Math.max(costMax, row.cost);
        }
    }
    return { status, costMin, costMax };
}

function rowMatches(row: Row, c: FilterSpec["clauses"][number]): boolean {
    if (c.column === "status" && c.op === "in" && Array.isArray(c.value))
        return c.value.map(String).includes(row.status);
    if (c.column === "cost" && c.op === "gte") return row.cost >= Number(c.value);
    if (c.column === "paid" && c.op === "eq") return row.paid === c.value;
    return true;
}

describe("B1 performance", () => {
    it("re-evaluates a clause change over 100,000 rows × 6 fields under 250 ms", () => {
        vi.useRealTimers();
        const n = 100_000;
        const data = Array.from({ length: n }, (_, i) => makeRow(i));
        const fly: GridCell[] = [
            { kind: GridCellKind.Text, data: "", displayData: "", allowOverlay: false },
            { kind: GridCellKind.Number, data: 0, displayData: "0", allowOverlay: false },
            { kind: GridCellKind.Text, data: "", displayData: "", allowOverlay: false },
            { kind: GridCellKind.Text, data: "", displayData: "", allowOverlay: false },
            { kind: GridCellKind.Boolean, data: false, allowOverlay: false },
            { kind: GridCellKind.Uri, data: "", displayData: "", allowOverlay: false },
        ];
        const getCellContent = ([col, row]: Item): GridCell => {
            const r = data[row];
            const cell = fly[col];
            if (col === 1) {
                (cell as { data: number; displayData: string }).data = r.cost;
                (cell as { data: number; displayData: string }).displayData = String(r.cost);
            } else if (col === 4) {
                (cell as { data: boolean }).data = r.paid;
            } else {
                const s = col === 0 ? r.name : col === 2 ? r.status : col === 3 ? r.due : r.site;
                (cell as { data: string; displayData: string }).data = s;
                (cell as { data: string; displayData: string }).displayData = s;
            }
            return cell;
        };
        const spec0: FilterSpec = { clauses: [{ column: "status", op: "in", value: ["active"] }] };
        evaluateGridFilters(spec0, fields, columns, n, getCellContent, n);
        const spec1: FilterSpec = {
            clauses: [
                { column: "status", op: "in", value: ["active"] },
                { column: "cost", op: "gte", value: 100 },
            ],
        };
        const start = performance.now();
        const out = evaluateGridFilters(spec1, fields, columns, n, getCellContent, n);
        const elapsed = performance.now() - start;
        expect(out.matched).toBeGreaterThan(0);
        expect(out.facets.get("status")?.kind).toBe("values");
        expect(elapsed).toBeLessThan(250);
        vi.useFakeTimers();
    });
});
