import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { GridCellKind, type GridCell, type GridColumn, type Item } from "tengrids";
import { useNaturalLanguageSearch } from "../src/use-natural-language-search.js";
import { useNaturalLanguageFilter } from "../src/use-natural-language-filter.js";
import { createMockProvider } from "../src/provider.js";

const columns: GridColumn[] = [{ title: "Name", width: 1 }, { title: "Dept", width: 1 }, { title: "Age", width: 1 }];
const data = [
    ["Ada", "Engineering", 36],
    ["Grace", "Engineering", 45],
    ["Linus", "Ops", 28],
    ["Mia", "Sales", 31],
] as const;
const getCellContent = ([col, row]: Item): GridCell => {
    const v = data[row][col];
    return typeof v === "number"
        ? { kind: GridCellKind.Number, data: v, displayData: String(v), allowOverlay: false }
        : { kind: GridCellKind.Text, data: v, displayData: v, allowOverlay: false };
};
const rows = data.length;
const engineersOver30 = JSON.stringify({ conjunction: "and", clauses: [{ column: "Dept", op: "eq", value: "Engineering" }, { column: "Age", op: "gt", value: 30 }] });

describe("useNaturalLanguageSearch", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("returns literal matches instantly, then the compiled filter's matches", async () => {
        const provider = createMockProvider(() => engineersOver30);
        const { result } = renderHook(() => useNaturalLanguageSearch({ provider, columns, rows, getCellContent, debounceMs: 100 }));
        expect(result.current.searchResults).toEqual([]);
        act(() => result.current.onSearchValueChange!("engineers over 30"));
        expect(result.current.status).toBe("compiling");
        expect(result.current.searchResults).toEqual([]); // no literal hits for that phrase
        expect(provider.calls).toHaveLength(0); // debounced
        await act(async () => {
            await vi.advanceTimersByTimeAsync(100);
        });
        expect(provider.calls).toHaveLength(1);
        expect(provider.calls[0].prompt).toContain('"engineers over 30"');
        expect(result.current.status).toBe("compiled");
        expect(result.current.spec?.clauses).toHaveLength(2);
        expect(result.current.matchedRows).toEqual([0, 1]);
        // highlighted cells are the clause columns of each matched row
        expect(result.current.searchResults).toEqual([[1, 0], [2, 0], [1, 1], [2, 1]]);
    });

    it("literal search works with no provider and finds the matching cells", () => {
        const { result } = renderHook(() => useNaturalLanguageSearch({ columns, rows, getCellContent }));
        act(() => result.current.onSearchValueChange!("eng"));
        expect(result.current.status).toBe("literal");
        expect(result.current.searchResults).toEqual([[1, 0], [1, 1]]);
        act(() => result.current.setSearchValue(""));
        expect(result.current.searchResults).toEqual([]);
        expect(result.current.status).toBe("idle");
    });

    it("aborts a superseded compile and caches specs per query", async () => {
        const provider = createMockProvider(() => engineersOver30, { delayMs: 50 });
        const { result } = renderHook(() => useNaturalLanguageSearch({ provider, columns, rows, getCellContent, debounceMs: 10 }));
        act(() => result.current.onSearchValueChange!("first query"));
        await act(async () => {
            await vi.advanceTimersByTimeAsync(20); // debounce elapsed, model call in flight
        });
        expect(provider.calls).toHaveLength(1);
        act(() => result.current.onSearchValueChange!("engineers over 30"));
        await act(async () => {
            await vi.advanceTimersByTimeAsync(200);
        });
        expect(provider.calls).toHaveLength(2);
        expect(result.current.status).toBe("compiled");
        expect(result.current.matchedRows).toEqual([0, 1]);
        // same query again: served from the spec cache, no new call
        act(() => result.current.setSearchValue(""));
        act(() => result.current.setSearchValue("engineers over 30"));
        await act(async () => {
            await vi.advanceTimersByTimeAsync(200);
        });
        expect(provider.calls).toHaveLength(2);
        expect(result.current.matchedRows).toEqual([0, 1]);
    });

    it("falls back to literal results when the model fails or answers nonsense", async () => {
        const nonsense = createMockProvider(() => "I have no idea");
        const a = renderHook(() => useNaturalLanguageSearch({ provider: nonsense, columns, rows, getCellContent, debounceMs: 0 }));
        act(() => a.result.current.onSearchValueChange!("ops"));
        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });
        expect(a.result.current.status).toBe("literal");
        expect(a.result.current.error).toMatch(/usable filter/);
        expect(a.result.current.searchResults).toEqual([[1, 2]]);

        const failing = { complete: async () => { throw new Error("down"); } };
        const b = renderHook(() => useNaturalLanguageSearch({ provider: failing, columns, rows, getCellContent, debounceMs: 0 }));
        act(() => b.result.current.onSearchValueChange!("ops"));
        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });
        expect(b.result.current.status).toBe("error");
        expect(b.result.current.error).toBe("down");
        expect(b.result.current.searchResults).toEqual([[1, 2]]);
    });

    it("exposes show/close controls for the search box", () => {
        const { result } = renderHook(() => useNaturalLanguageSearch({ columns, rows, getCellContent }));
        expect(result.current.showSearch).toBe(false);
        act(() => result.current.openSearch());
        expect(result.current.showSearch).toBe(true);
        act(() => result.current.onSearchClose!());
        expect(result.current.showSearch).toBe(false);
    });
});

describe("useNaturalLanguageFilter", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("is the identity with an empty query", () => {
        const { result } = renderHook(() => useNaturalLanguageFilter({ columns, rows, getCellContent, query: "" }));
        expect(result.current.rows).toBe(4);
        expect(result.current.getCellContent).toBe(getCellContent);
        expect(result.current.getOriginalIndex(3)).toBe(3);
    });

    it("hides non-matching rows and remaps cells and indices", async () => {
        const provider = createMockProvider(() => engineersOver30);
        const { result, rerender } = renderHook(({ query }) => useNaturalLanguageFilter({ provider, columns, rows, getCellContent, query, debounceMs: 0 }), {
            initialProps: { query: "" },
        });
        rerender({ query: "engineers over 30" });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });
        expect(result.current.status).toBe("compiled");
        expect(result.current.rows).toBe(2);
        expect(result.current.getOriginalIndex(1)).toBe(1);
        expect(result.current.getCellContent([0, 1])).toMatchObject({ data: "Grace" });
        rerender({ query: "sales" }); // literal path while compiling; the mock still returns the engineering spec afterwards
        expect(result.current.rows).toBe(1);
        expect(result.current.getCellContent([0, 0])).toMatchObject({ data: "Mia" });
    });
});
