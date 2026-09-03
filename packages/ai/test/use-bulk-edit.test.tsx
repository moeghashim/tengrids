import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { CompactSelection, GridCellKind, type GridCell, type GridColumn, type GridSelection, type Item } from "tengrids";
import { buildBulkEditPrompt, scopeFromSelection, useBulkEdit } from "../src/use-bulk-edit.js";
import { createMockProvider } from "../src/provider.js";

const columns: GridColumn[] = [{ title: "Name", width: 1 }, { title: "Status", width: 1 }, { title: "Qty", width: 1 }];
const data = [
    ["Order A", "open", 1],
    ["Order B", "open", 2],
    ["Order C", "shipped", 3],
] as const;
const getCellContent = ([col, row]: Item): GridCell => {
    const v = data[row][col];
    return typeof v === "number"
        ? { kind: GridCellKind.Number, data: v, displayData: String(v), allowOverlay: true }
        : { kind: GridCellKind.Text, data: v, displayData: v, allowOverlay: true };
};
const rowsSel = (a: number, b: number): GridSelection => ({ rows: CompactSelection.fromSingleSelection([a, b]), columns: CompactSelection.empty(), current: undefined });

describe("scopeFromSelection", () => {
    it("expands row selections, ranges, and whole columns", () => {
        expect(scopeFromSelection(rowsSel(0, 2), 3, 3)).toEqual({ rows: [0, 1], columns: undefined });
        const range: GridSelection = {
            rows: CompactSelection.empty(),
            columns: CompactSelection.empty(),
            current: { cell: [1, 1], range: { x: 1, y: 1, width: 2, height: 2 }, rangeStack: [] },
        };
        expect(scopeFromSelection(range, 3, 3)).toEqual({ rows: [1, 2], columns: [1, 2] });
        const cols: GridSelection = { rows: CompactSelection.empty(), columns: CompactSelection.fromSingleSelection(1), current: undefined };
        expect(scopeFromSelection(cols, 3, 3)).toEqual({ rows: [0, 1, 2], columns: [1] });
    });
});

describe("useBulkEdit", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("proposes validated edits with a highlight preview, then applies through onCellsEdited", async () => {
        const provider = createMockProvider(() =>
            JSON.stringify([
                { row: 0, column: "Status", value: "shipped" },
                { row: 1, column: "status", value: "shipped" },
                { row: 1, column: "Qty", value: "twelve" },
                { row: 2, column: "Status", value: "shipped" }, // out of scope
                { row: 0, column: "Nope", value: "x" }, // unknown column
                { row: 0, column: "Name", value: "Order A" }, // unchanged → skipped silently
            ])
        );
        const onCellsEdited = vi.fn();
        const { result } = renderHook(() => useBulkEdit({ provider, columns, rows: 3, getCellContent, onCellsEdited }));
        let proposal: any;
        await act(async () => {
            proposal = await result.current.propose("mark the open orders as shipped", rowsSel(0, 2));
        });
        expect(provider.calls[0].prompt).toContain('"mark the open orders as shipped"');
        expect(provider.calls[0].prompt).toContain('{"row":0,"Name":"Order A","Status":"open","Qty":"1"}');
        expect(provider.calls[0].prompt).not.toContain("Order C");
        expect(result.current.status).toBe("proposed");
        expect(proposal.edits).toHaveLength(3);
        expect(proposal.rejected).toBe(2);
        expect(proposal.edits[2]).toMatchObject({ location: [2, 1], value: { data: 12 } });
        expect(result.current.highlightRegions).toHaveLength(3);
        expect(result.current.highlightRegions![0]).toMatchObject({ range: { x: 1, y: 0, width: 1, height: 1 } });
        act(() => result.current.apply());
        expect(onCellsEdited).toHaveBeenCalledTimes(1);
        expect(onCellsEdited.mock.calls[0][0]).toHaveLength(3);
        expect(result.current.proposal).toBeUndefined();
        expect(result.current.highlightRegions).toBeUndefined();
        expect(result.current.status).toBe("idle");
    });

    it("discard drops the proposal without writing", async () => {
        const provider = createMockProvider(() => JSON.stringify([{ row: 0, column: "Status", value: "closed" }]));
        const onCellsEdited = vi.fn();
        const { result } = renderHook(() => useBulkEdit({ provider, columns, rows: 3, getCellContent, onCellsEdited }));
        await act(async () => {
            await result.current.propose("close it", { rows: [0] });
        });
        expect(result.current.proposal?.edits).toHaveLength(1);
        act(() => result.current.discard());
        expect(onCellsEdited).not.toHaveBeenCalled();
        expect(result.current.proposal).toBeUndefined();
    });

    it("refuses empty scopes and too many rows, and reports model failures", async () => {
        const provider = createMockProvider(() => "[]");
        const { result } = renderHook(() => useBulkEdit({ provider, columns, rows: 3, getCellContent, onCellsEdited: vi.fn(), maxRows: 2 }));
        await act(async () => {
            await result.current.propose("x", { rows: [] });
        });
        expect(result.current.status).toBe("error");
        expect(result.current.error).toMatch(/Select/);
        await act(async () => {
            await result.current.propose("x", { rows: [0, 1, 2] });
        });
        expect(result.current.error).toMatch(/Too many rows/);
        expect(provider.calls).toHaveLength(0);

        const failing = { complete: async () => { throw new Error("nope"); } };
        const b = renderHook(() => useBulkEdit({ provider: failing, columns, rows: 3, getCellContent, onCellsEdited: vi.fn() }));
        await act(async () => {
            await b.result.current.propose("x", { rows: [0] });
        });
        expect(b.result.current.status).toBe("error");
        expect(b.result.current.error).toBe("nope");
    });

    it("restricts edits to scoped columns", async () => {
        const provider = createMockProvider(() => JSON.stringify([{ row: 0, column: "Status", value: "done" }, { row: 0, column: "Qty", value: "5" }]));
        const { result } = renderHook(() => useBulkEdit({ provider, columns, rows: 3, getCellContent, onCellsEdited: vi.fn() }));
        await act(async () => {
            await result.current.propose("x", { rows: [0], columns: [2] });
        });
        expect(provider.calls[0].prompt).toContain('Editable columns: "Qty"');
        expect(result.current.proposal?.edits).toHaveLength(1);
        expect(result.current.proposal?.edits[0]).toMatchObject({ location: [2, 0], value: { data: 5 } });
        expect(result.current.proposal?.rejected).toBe(1);
    });

    it("builds a prompt with editable columns and row JSON", () => {
        const p = buildBulkEditPrompt("do it", columns, [1], [{ row: 4, values: { Status: "open" } }]);
        expect(p).toContain('Editable columns: "Status"');
        expect(p).toContain('{"row":4,"Status":"open"}');
        expect(p).toContain("JSON array of changes");
    });
});
