import { describe, expect, it, vi } from "vitest";
import { GridCellKind, getDefaultTheme, type CustomCell } from "tengrids";
import { AiCellRenderer, aiCell, isAiCell, withAiResult } from "../src/ai-cell.js";

function drawArgs(cell: ReturnType<typeof aiCell>, frameTime = 0) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const theme = { ...getDefaultTheme(), baseFontFull: "13px sans-serif", headerFontFull: "600 13px sans-serif", markerFontFull: "9px sans-serif" };
    const raf = vi.fn();
    const args = {
        ctx,
        theme: theme as any,
        col: 0,
        row: 0,
        rect: { x: 0, y: 0, width: 200, height: 32 },
        highlighted: false,
        hoverAmount: 0,
        hoverX: undefined,
        hoverY: undefined,
        cellFillColor: "#fff",
        imageLoader: {} as any,
        spriteManager: {} as any,
        hyperWrapping: false,
        cell,
        requestAnimationFrame: raf,
        drawState: [undefined, () => undefined] as any,
        frameTime,
        overrideCursor: undefined,
    };
    return { args, ctx, raf };
}

describe("aiCell helpers", () => {
    it("constructs and recognizes AI cells", () => {
        const c = aiCell("Summarize {Notes}");
        expect(isAiCell(c)).toBe(true);
        expect(c.data).toEqual({ kind: "ai-cell", prompt: "Summarize {Notes}", status: "idle" });
        expect(isAiCell({ kind: GridCellKind.Text, data: "", displayData: "", allowOverlay: false })).toBe(false);
        expect(isAiCell({ kind: GridCellKind.Custom, data: { kind: "star-cell" }, copyData: "", allowOverlay: false })).toBe(false);
    });

    it("withAiResult keeps copyData in sync with the result", () => {
        const c = withAiResult(aiCell("p"), { result: "answer", status: "done" });
        expect(c.copyData).toBe("answer");
        expect(withAiResult(c, { result: undefined, status: "idle" }).copyData).toBe("");
    });
});

describe("AiCellRenderer", () => {
    it("matches only ai cells", () => {
        expect(AiCellRenderer.isMatch(aiCell("x") as CustomCell)).toBe(true);
        expect(AiCellRenderer.isMatch({ kind: GridCellKind.Custom, data: { kind: "other" }, copyData: "", allowOverlay: false })).toBe(false);
    });

    it("draws the result when done without requesting animation", () => {
        const cell = withAiResult(aiCell("p"), { result: "Hello", status: "done" });
        const { args, ctx, raf } = drawArgs(cell);
        const fillText = vi.spyOn(ctx, "fillText");
        expect(AiCellRenderer.draw(args as any, cell)).toBe(true);
        expect(fillText).toHaveBeenCalled();
        expect(fillText.mock.calls.some(c => String(c[0]).includes("Hello"))).toBe(true);
        expect(raf).not.toHaveBeenCalled();
    });

    it("animates while pending and shows the formula when idle", () => {
        const pending = withAiResult(aiCell("p"), { status: "pending" });
        const a = drawArgs(pending, 500);
        const fill = vi.spyOn(a.ctx, "fillText");
        AiCellRenderer.draw(a.args as any, pending);
        expect(a.raf).toHaveBeenCalledTimes(1);
        expect(String(fill.mock.calls[0][0])).toMatch(/^✦ \.+$/);

        const idle = aiCell("Translate {Name}");
        const b = drawArgs(idle);
        const fillIdle = vi.spyOn(b.ctx, "fillText");
        AiCellRenderer.draw(b.args as any, idle);
        expect(b.raf).not.toHaveBeenCalled();
        expect(String(fillIdle.mock.calls[0][0])).toBe("✦ Translate {Name}");
    });

    it("shows the error text", () => {
        const cell = withAiResult(aiCell("p"), { status: "error", error: "rate limited" });
        const { args, ctx } = drawArgs(cell);
        const fill = vi.spyOn(ctx, "fillText");
        AiCellRenderer.draw(args as any, cell);
        expect(String(fill.mock.calls[0][0])).toBe("⚠ rate limited");
    });

    it("paste sets the prompt and resets state; delete clears the result", () => {
        const c = withAiResult(aiCell("old"), { result: "r", status: "done" });
        expect(AiCellRenderer.onPaste?.("new prompt", c.data)).toEqual({ kind: "ai-cell", prompt: "new prompt", result: undefined, status: "idle", error: undefined });
        const deleted = AiCellRenderer.onDelete?.(c);
        expect(deleted?.data.result).toBeUndefined();
        expect(deleted?.data.status).toBe("idle");
        expect(deleted?.copyData).toBe("");
    });

    it("measures by the result or the prompt", () => {
        const ctx = document.createElement("canvas").getContext("2d")!;
        const theme = { ...getDefaultTheme(), baseFontFull: "13px sans-serif" } as any;
        const short = AiCellRenderer.measure!(ctx, aiCell("ab"), theme);
        const long = AiCellRenderer.measure!(ctx, withAiResult(aiCell("ab"), { result: "a much longer generated answer", status: "done" }), theme);
        expect(long).toBeGreaterThanOrEqual(short);
    });
});
