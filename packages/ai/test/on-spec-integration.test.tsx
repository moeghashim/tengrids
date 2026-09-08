import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { GridCellKind, type GridCell, type GridColumn, type Item } from "tengrids";
import { memoryStore, useGridFilters, type FilterField } from "tengrids-schema";
import { useNaturalLanguageFilter } from "../src/use-natural-language-filter.js";
import { createMockProvider } from "../src/provider.js";

const columns: GridColumn[] = [
    { title: "Name", id: "name", width: 1 },
    { title: "Status", id: "status", width: 1 },
];
const fields: FilterField[] = [
    { key: "name", title: "Name", kind: "text" },
    { key: "status", title: "Status", kind: "enum", values: ["draft", "active"] },
];
const data = [
    ["Ada", "draft"],
    ["Grace", "active"],
    ["Linus", "active"],
] as const;
const getCellContent = ([col, row]: Item): GridCell => {
    const v = data[row][col];
    return { kind: GridCellKind.Text, data: v, displayData: v, allowOverlay: false };
};
const compiled = JSON.stringify({
    conjunction: "and",
    clauses: [{ column: "status", op: "in", value: ["active"] }],
});

describe("onSpec wired to useGridFilters.setSpec", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("empty query, compile, chip edit without another model call, then clear", async () => {
        const store = memoryStore();
        const provider = createMockProvider(() => compiled);
        const { result, rerender } = renderHook(
            ({ query }: { query: string }) => {
                const filters = useGridFilters({
                    fields,
                    columns,
                    rows: data.length,
                    getCellContent,
                    store,
                });
                useNaturalLanguageFilter({
                    provider,
                    columns,
                    rows: data.length,
                    getCellContent,
                    query,
                    debounceMs: 0,
                    onSpec: filters.setSpec,
                });
                return filters;
            },
            { initialProps: { query: "" } }
        );
        expect(result.current.spec.clauses).toEqual([]);
        expect(result.current.rows).toBe(3);

        rerender({ query: "active rows" });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });
        expect(provider.calls).toHaveLength(1);
        expect(result.current.spec.clauses).toEqual([{ column: "status", op: "in", value: ["active"] }]);
        expect(result.current.rows).toBe(2);

        act(() => result.current.setClause("status", { column: "status", op: "in", value: ["draft"] }));
        expect(provider.calls).toHaveLength(1);
        expect(result.current.rows).toBe(1);
        expect(result.current.getCellContent([0, 0])).toMatchObject({ data: "Ada" });

        rerender({ query: "" });
        expect(result.current.spec.clauses).toEqual([]);
        expect(result.current.rows).toBe(3);
    });
});
