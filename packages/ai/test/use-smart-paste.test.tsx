import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { GridCellKind, type GridCell, type GridColumn, type Item } from "tengrids";
import { buildSmartPastePrompt, useSmartPaste } from "../src/use-smart-paste.js";
import { createMockProvider } from "../src/provider.js";

const columns: GridColumn[] = [
    { title: "Name", width: 100 },
    { title: "Amount", width: 100 },
    { title: "Paid", width: 60 },
];
const getCellContent = ([col]: Item): GridCell => {
    if (col === 0) return { kind: GridCellKind.Text, data: "", displayData: "", allowOverlay: true };
    if (col === 1) return { kind: GridCellKind.Number, data: 0, displayData: "0", allowOverlay: true };
    return { kind: GridCellKind.Boolean, data: false, allowOverlay: false };
};

describe("useSmartPaste", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("coerces deterministically without a provider and never blocks the paste", () => {
        const onCellsEdited = vi.fn();
        const { result } = renderHook(() => useSmartPaste({ columns, getCellContent, onCellsEdited }));
        expect(result.current.coercePasteValue!("$1,200", getCellContent([1, 0]))).toMatchObject({ data: 1200 });
        expect(result.current.coercePasteValue!("yes", getCellContent([2, 0]))).toMatchObject({ data: true });
        expect(result.current.onPaste([0, 0], [["x", "soon", "maybe"]])).toBe(true);
        expect(onCellsEdited).not.toHaveBeenCalled();
        expect(result.current.pending).toBe(0);
    });

    it("batches the cells it cannot coerce into one model call and applies validated corrections", async () => {
        const provider = createMockProvider(
            () => JSON.stringify([{ i: 0, value: "12" }, { i: 1, value: "true" }, { i: 7, value: "ignored" }, { i: 2, value: "not a number" }]),
            { delayMs: 10 }
        );
        const onCellsEdited = vi.fn();
        const { result } = renderHook(() => useSmartPaste({ provider, columns, getCellContent, onCellsEdited }));
        act(() => {
            expect(result.current.onPaste([1, 0], [["a dozen", "affirmative"], ["2k", "wat"]])).toBe(true);
        });
        expect(result.current.pending).toBe(3);
        expect(provider.calls).toHaveLength(1);
        const prompt = provider.calls[0].prompt;
        expect(prompt).toContain('0. column "Amount"');
        expect(prompt).toContain('"a dozen"');
        expect(prompt).not.toContain('"2k"');
        await act(async () => {
            await vi.advanceTimersByTimeAsync(10);
        });
        expect(onCellsEdited).toHaveBeenCalledTimes(1);
        const edits = onCellsEdited.mock.calls[0][0];
        expect(edits).toHaveLength(2);
        expect(edits[0]).toMatchObject({ location: [1, 0], value: { data: 12 } });
        expect(edits[1]).toMatchObject({ location: [2, 0], value: { data: true } });
        expect(result.current.pending).toBe(0);
        expect(result.current.lastError).toBeUndefined();
    });

    it("skips text and custom cells, empty strings, and columns past the end", () => {
        const provider = createMockProvider(() => "[]");
        const { result } = renderHook(() => useSmartPaste({ provider, columns, getCellContent, onCellsEdited: vi.fn() }));
        act(() => {
            result.current.onPaste([0, 0], [["hello", "", "??", "beyond"]]);
        });
        expect(provider.calls).toHaveLength(1);
        expect(provider.calls[0].prompt).toContain('"??"');
        expect(provider.calls[0].prompt).not.toContain("hello");
        expect(provider.calls[0].prompt).not.toContain("beyond");
    });

    it("tolerates malformed model output and reports provider failures", async () => {
        const bad = createMockProvider(() => "I cannot help with that");
        const onCellsEdited = vi.fn();
        const a = renderHook(() => useSmartPaste({ provider: bad, columns, getCellContent, onCellsEdited }));
        await act(async () => {
            a.result.current.onPaste([2, 0], [["perhaps"]]);
            await vi.advanceTimersByTimeAsync(0);
        });
        expect(onCellsEdited).not.toHaveBeenCalled();
        expect(a.result.current.lastError).toBeUndefined();

        const failing = {
            complete: async () => {
                throw new Error("offline");
            },
        };
        const b = renderHook(() => useSmartPaste({ provider: failing, columns, getCellContent, onCellsEdited }));
        await act(async () => {
            b.result.current.onPaste([2, 0], [["perhaps"]]);
            await vi.advanceTimersByTimeAsync(0);
        });
        expect(b.result.current.lastError).toBe("offline");
        expect(b.result.current.pending).toBe(0);
    });

    it("builds a prompt that names the expected type per column", () => {
        const p = buildSmartPastePrompt([
            { index: 0, location: [1, 0], text: "ten", target: getCellContent([1, 0]), column: "Amount" },
            { index: 1, location: [2, 0], text: "yep", target: getCellContent([2, 0]), column: "Paid" },
        ]);
        expect(p).toContain('0. column "Amount" expects a plain number');
        expect(p).toContain('1. column "Paid" expects true or false');
        expect(p).toContain("JSON array");
    });
});
