import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { GridCellKind, type GridCell, type GridColumn, type Item } from "tengrids";
import { aiCell, isAiCell } from "../src/ai-cell.js";
import { resolveTemplate, useAiCells } from "../src/use-ai-cells.js";
import { createMockProvider } from "../src/provider.js";

const columns: GridColumn[] = [
    { title: "Name", id: "name", width: 100 },
    { title: "Notes", id: "notes", width: 200 },
    { title: "Summary", id: "summary", width: 200 },
];
const rows = [
    { name: "Ada", notes: "Wrote the first program" },
    { name: "Grace", notes: "Invented the compiler" },
    { name: "Linus", notes: "Started Linux" },
];
function text(s: string): GridCell {
    return { kind: GridCellKind.Text, data: s, displayData: s, allowOverlay: true };
}
const getCellContent = ([col, row]: Item): GridCell => {
    const r = rows[row];
    if (col === 0) return text(r.name);
    if (col === 1) return text(r.notes);
    return aiCell("Summarize for {Name}: {notes}");
};
const region = (y: number, height: number) => ({ x: 0, y, width: 3, height });

describe("resolveTemplate", () => {
    it("fills placeholders by title or id, case-insensitively, and leaves unknown ones", () => {
        const cells = [text("Ada"), text("Wrote it"), aiCell("x")];
        expect(resolveTemplate("{name} — {Notes} — {missing}", columns, cells)).toBe("Ada — Wrote it — {missing}");
    });
});

describe("useAiCells", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("resolves prompts per row, generates visible cells, caches, and repaints", async () => {
        const provider = createMockProvider(i => `S(${i.prompt})`, { delayMs: 10 });
        const gridRef = { current: { updateCells: vi.fn() } as any };
        const { result } = renderHook(() => useAiCells({ provider, columns, getCellContent, gridRef }));

        const first = result.current.getCellContent([2, 0]);
        expect(isAiCell(first) && first.data.status).toBe("pending");
        expect(provider.calls[0].prompt).toBe("Summarize for Ada: Wrote the first program");

        await act(async () => {
            await vi.advanceTimersByTimeAsync(20);
        });
        const done = result.current.getCellContent([2, 0]);
        expect(isAiCell(done) && done.data).toMatchObject({ status: "done", result: "S(Summarize for Ada: Wrote the first program)" });
        expect(gridRef.current.updateCells).toHaveBeenCalledWith([{ cell: [2, 0] }]);

        result.current.getCellContent([2, 0]);
        result.current.getCellContent([2, 0]);
        expect(provider.calls).toHaveLength(1);
        expect(result.current.getCellContent([0, 1])).toEqual(text("Grace"));
    });

    it("streams partial results into the cell", async () => {
        const provider = createMockProvider(() => ["Hel", "lo"], { delayMs: 10 });
        const { result } = renderHook(() => useAiCells({ provider, columns, getCellContent }));
        result.current.getCellContent([2, 1]);
        await act(async () => {
            await vi.advanceTimersByTimeAsync(10);
        });
        const mid = result.current.getCellContent([2, 1]);
        expect(isAiCell(mid) && mid.data).toMatchObject({ status: "streaming", result: "Hel" });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(20);
        });
        const end = result.current.getCellContent([2, 1]);
        expect(isAiCell(end) && end.data).toMatchObject({ status: "done", result: "Hello" });
    });

    it("cancels requests for rows that scroll out of view and re-requests when they return", async () => {
        const provider = createMockProvider(() => "ok", { delayMs: 100 });
        const { result } = renderHook(() => useAiCells({ provider, columns, getCellContent, concurrency: 1 }));
        act(() => result.current.onVisibleRegionChanged!(region(0, 2), 0, 0, 0, 0));
        result.current.getCellContent([2, 0]);
        result.current.getCellContent([2, 1]);
        expect(result.current.scheduler.pendingCount).toBe(2);
        act(() => result.current.onVisibleRegionChanged!(region(2, 1), 0, 0, 0, 0));
        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });
        expect(result.current.scheduler.pendingCount).toBe(0);
        expect(result.current.scheduler.stats.cancelled).toBe(2);
        const off = result.current.getCellContent([2, 0]);
        expect(isAiCell(off) && off.data.status).toBe("idle");
        act(() => result.current.onVisibleRegionChanged!(region(0, 3), 0, 0, 0, 0));
        const again = result.current.getCellContent([2, 0]);
        expect(isAiCell(again) && again.data.status).toBe("pending");
    });

    it("surfaces provider errors on the cell and regenerate retries", async () => {
        let fail = true;
        const provider = {
            complete: async (i: { prompt: string }) => {
                if (fail) throw new Error("quota");
                return `ok:${i.prompt.length}`;
            },
        };
        const { result } = renderHook(() => useAiCells({ provider, columns, getCellContent }));
        result.current.getCellContent([2, 2]);
        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });
        const errored = result.current.getCellContent([2, 2]);
        expect(isAiCell(errored) && errored.data).toMatchObject({ status: "error", error: "quota" });
        fail = false;
        act(() => result.current.regenerate([2, 2]));
        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });
        const fixed = result.current.getCellContent([2, 2]);
        expect(isAiCell(fixed) && fixed.data.status).toBe("done");
    });

    it("autoRun=false waits for run()", async () => {
        const provider = createMockProvider(() => "manual");
        const { result } = renderHook(() => useAiCells({ provider, columns, getCellContent, autoRun: false }));
        const idle = result.current.getCellContent([2, 0]);
        expect(isAiCell(idle) && idle.data.status).toBe("idle");
        expect(provider.calls).toHaveLength(0);
        act(() => result.current.run([2, 0]));
        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });
        const done = result.current.getCellContent([2, 0]);
        expect(isAiCell(done) && done.data.result).toBe("manual");
        expect(result.current.resolvePrompt([2, 0])).toBe("Summarize for Ada: Wrote the first program");
    });

    it("treats an empty prompt as idle and never calls the model", () => {
        const provider = createMockProvider(() => "never");
        const empty = ([col]: Item): GridCell => (col === 0 ? aiCell("   ") : text("x"));
        const { result } = renderHook(() => useAiCells({ provider, columns, getCellContent: empty }));
        const c = result.current.getCellContent([0, 0]);
        expect(isAiCell(c) && c.data.status).toBe("idle");
        expect(provider.calls).toHaveLength(0);
    });
});
