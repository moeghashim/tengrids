import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { GridCellKind, type EditableGridCell, type GridCell } from "tengrids";
import { useAgentDataSource } from "../src/use-agent-data-source.js";

interface Row {
    readonly name: string;
    readonly score: number;
}
const toCell = (r: Row, col: number): GridCell =>
    col === 0
        ? { kind: GridCellKind.Text, data: r.name, displayData: r.name, allowOverlay: true }
        : { kind: GridCellKind.Number, data: r.score, displayData: String(r.score), allowOverlay: true };

const tick = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

function agent(rows: Row[], gapMs: number, opts: { failAfter?: number; batches?: boolean } = {}) {
    return async function* (signal: AbortSignal) {
        for (let i = 0; i < rows.length; i++) {
            if (signal.aborted) return;
            await tick(gapMs);
            if (opts.failAfter !== undefined && i >= opts.failAfter) throw new Error("agent crashed");
            if (opts.batches && i + 1 < rows.length) {
                yield [rows[i], rows[i + 1]] as readonly Row[];
                i++;
            } else yield rows[i];
        }
    };
}

const sample: Row[] = [
    { name: "Ada", score: 1 },
    { name: "Grace", score: 2 },
    { name: "Linus", score: 3 },
];

describe("useAgentDataSource", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("streams rows in, batching re-renders, and reports done", async () => {
        // rows arrive at 20/40/60ms; the first flush is due 25ms after the first row (45ms)
        const { result } = renderHook(() => useAgentDataSource({ source: agent(sample, 20), toCell, flushIntervalMs: 25 }));
        expect(result.current.status).toBe("streaming");
        expect(result.current.rows).toBe(0);
        expect(result.current.getCellContent([0, 0]).kind).toBe(GridCellKind.Loading);
        await act(async () => {
            await vi.advanceTimersByTimeAsync(44); // two rows produced, flush not yet due
        });
        expect(result.current.rows).toBe(0);
        await act(async () => {
            await vi.advanceTimersByTimeAsync(1); // flush at 45ms publishes both buffered rows
        });
        expect(result.current.rows).toBe(2);
        expect(result.current.getCellContent([0, 1])).toMatchObject({ data: "Grace" });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(100);
        });
        expect(result.current.rows).toBe(3);
        expect(result.current.status).toBe("done");
        expect(result.current.data.map(r => r.name)).toEqual(["Ada", "Grace", "Linus"]);
    });

    it("accepts batches of rows and keeps order", async () => {
        const { result } = renderHook(() => useAgentDataSource({ source: agent(sample, 1, { batches: true }), toCell, flushIntervalMs: 0 }));
        await act(async () => {
            await vi.advanceTimersByTimeAsync(50);
        });
        expect(result.current.data.map(r => r.name)).toEqual(["Ada", "Grace", "Linus"]);
        expect(result.current.status).toBe("done");
    });

    it("stop keeps received rows and marks cancelled; start restarts from scratch", async () => {
        const { result } = renderHook(() => useAgentDataSource({ source: agent(sample, 10), toCell, flushIntervalMs: 0 }));
        await act(async () => {
            await vi.advanceTimersByTimeAsync(15);
        });
        expect(result.current.rows).toBe(1);
        act(() => result.current.stop());
        expect(result.current.status).toBe("cancelled");
        await act(async () => {
            await vi.advanceTimersByTimeAsync(100);
        });
        expect(result.current.rows).toBe(1); // no more rows after stop
        act(() => result.current.start());
        expect(result.current.rows).toBe(0);
        await act(async () => {
            await vi.advanceTimersByTimeAsync(100);
        });
        expect(result.current.rows).toBe(3);
        expect(result.current.status).toBe("done");
    });

    it("surfaces agent errors while keeping rows received so far", async () => {
        const { result } = renderHook(() => useAgentDataSource({ source: agent(sample, 10, { failAfter: 2 }), toCell, flushIntervalMs: 0 }));
        await act(async () => {
            await vi.advanceTimersByTimeAsync(100);
        });
        expect(result.current.status).toBe("error");
        expect(result.current.error).toBe("agent crashed");
        expect(result.current.rows).toBe(2);
    });

    it("routes edits through onEdited (sync and async) and supports appendRows/reset", async () => {
        const onEdited = vi.fn((row: Row, col: number, v: EditableGridCell) =>
            col === 1 && v.kind === GridCellKind.Number ? { ...row, score: v.data ?? 0 } : undefined
        );
        const { result } = renderHook(() => useAgentDataSource({ source: agent(sample, 1), toCell, onEdited, flushIntervalMs: 0 }));
        await act(async () => {
            await vi.advanceTimersByTimeAsync(50);
        });
        act(() => {
            result.current.onCellsEdited!([{ location: [1, 0], value: { kind: GridCellKind.Number, data: 99, displayData: "99", allowOverlay: true } }]);
        });
        expect(onEdited).toHaveBeenCalledTimes(1);
        expect(result.current.getCellContent([1, 0])).toMatchObject({ data: 99 });
        // rejected edit (returns undefined) leaves the row alone
        act(() => {
            result.current.onCellsEdited!([{ location: [0, 0], value: { kind: GridCellKind.Text, data: "X", displayData: "X", allowOverlay: true } }]);
        });
        expect(result.current.getCellContent([0, 0])).toMatchObject({ data: "Ada" });
        // async handler
        const asyncEdited = vi.fn(async (row: Row) => {
            await tick(5);
            return { ...row, name: "Async" };
        });
        const b = renderHook(() => useAgentDataSource({ source: agent(sample, 1), toCell, onEdited: asyncEdited, flushIntervalMs: 0 }));
        await act(async () => {
            await vi.advanceTimersByTimeAsync(50);
        });
        await act(async () => {
            b.result.current.onCellsEdited!([{ location: [0, 2], value: { kind: GridCellKind.Text, data: "q", displayData: "q", allowOverlay: true } }]);
            await vi.advanceTimersByTimeAsync(10);
        });
        expect(b.result.current.getCellContent([0, 2])).toMatchObject({ data: "Async" });
        act(() => b.result.current.appendRows([{ name: "Extra", score: 7 }]));
        expect(b.result.current.rows).toBe(4);
        act(() => b.result.current.reset());
        expect(b.result.current.rows).toBe(0);
        expect(b.result.current.status).toBe("idle");
    });

    it("autoStart=false waits for start()", async () => {
        const { result } = renderHook(() => useAgentDataSource({ source: agent(sample, 1), toCell, autoStart: false, initialRows: [{ name: "Seed", score: 0 }] }));
        expect(result.current.status).toBe("idle");
        expect(result.current.rows).toBe(1);
        act(() => result.current.start());
        await act(async () => {
            await vi.advanceTimersByTimeAsync(100);
        });
        expect(result.current.rows).toBe(3); // start() resets, then streams the agent's rows
    });
});
