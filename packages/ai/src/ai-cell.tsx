import * as React from "react";
import { type CustomCell, type CustomRenderer, type GridCell, GridCellKind, drawTextCell, measureTextCached } from "tengrids";
import type { Difficulty } from "./provider.js";

export type AiCellStatus = "idle" | "pending" | "streaming" | "done" | "error";

export interface AiCellData {
    readonly kind: "ai-cell";
    /** Prompt template. `{Column Title}` or `{column-id}` placeholders are filled from the same row. */
    readonly prompt: string;
    readonly result?: string;
    readonly status?: AiCellStatus;
    readonly error?: string;
    /** Pin a specific model for this cell (passed to the provider as `AiRequest.model`). */
    readonly model?: string;
    /** How hard this cell's task is; routing providers pick a tier by it. */
    readonly difficulty?: Difficulty;
}

export type AiCell = CustomCell<AiCellData>;

export function isAiCell(cell: GridCell): cell is AiCell {
    return cell.kind === GridCellKind.Custom && (cell.data as Partial<AiCellData> | undefined)?.kind === "ai-cell";
}

export interface AiCellOptions {
    readonly model?: string;
    readonly difficulty?: Difficulty;
    /** Other cell properties (themeOverride, contentAlign, readonly, …). */
    readonly cell?: Partial<Omit<AiCell, "kind" | "data">>;
}

/** Build an AI cell — the spreadsheet `=AI("…")` formula for a row. */
export function aiCell(prompt: string, options: AiCellOptions = {}): AiCell {
    return {
        kind: GridCellKind.Custom,
        allowOverlay: true,
        copyData: "",
        ...options.cell,
        data: {
            kind: "ai-cell",
            prompt,
            status: "idle",
            ...(options.model === undefined ? {} : { model: options.model }),
            ...(options.difficulty === undefined ? {} : { difficulty: options.difficulty }),
        },
    };
}

/** Returns the cell with a new result/status, keeping copyData in sync. */
export function withAiResult(cell: AiCell, patch: Partial<Omit<AiCellData, "kind" | "prompt">>): AiCell {
    const data: AiCellData = { ...cell.data, ...patch };
    return { ...cell, data, copyData: data.result ?? "" };
}

const editorStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    padding: 8,
    minWidth: 280,
    fontFamily: "var(--gdg-font-family)",
    color: "var(--gdg-text-dark)",
};
const textareaStyle: React.CSSProperties = {
    font: "inherit",
    fontSize: "var(--gdg-editor-font-size)",
    color: "inherit",
    background: "var(--gdg-bg-cell)",
    border: "1px solid var(--gdg-border-color)",
    borderRadius: 4,
    padding: 6,
    resize: "vertical",
    minHeight: 48,
};
const resultStyle: React.CSSProperties = {
    fontSize: "var(--gdg-editor-font-size)",
    whiteSpace: "pre-wrap",
    maxHeight: 160,
    overflow: "auto",
    padding: "4px 0",
};
const buttonStyle: React.CSSProperties = {
    alignSelf: "flex-start",
    font: "inherit",
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 4,
    border: "1px solid var(--gdg-border-color)",
    background: "var(--gdg-bg-header)",
    color: "var(--gdg-text-dark)",
    cursor: "pointer",
};

const rowStyle: React.CSSProperties = { display: "flex", gap: 8, alignItems: "center", fontSize: 11, color: "var(--gdg-text-medium)" };
const controlStyle: React.CSSProperties = { font: "inherit", fontSize: 12, color: "var(--gdg-text-dark)", background: "var(--gdg-bg-cell)", border: "1px solid var(--gdg-border-color)", borderRadius: 4, padding: "2px 4px" };

const AiCellEditor: React.FC<{
    readonly value: AiCell;
    readonly onChange: (newValue: AiCell) => void;
}> = ({ value, onChange }) => {
    const { prompt, result, status, error, model, difficulty } = value.data;
    const reset = (patch: Partial<AiCellData>) =>
        onChange(withAiResult({ ...value, data: { ...value.data, ...patch } }, { result: undefined, status: "idle", error: undefined }));
    return (
        <div style={editorStyle} className="gdg-ai-cell-editor">
            <div style={rowStyle}>
                <label>
                    Difficulty{" "}
                    <select style={controlStyle} value={difficulty ?? ""} onChange={e => reset({ difficulty: e.target.value === "" ? undefined : (e.target.value as Difficulty) })}>
                        <option value="">auto</option>
                        <option value="low">low</option>
                        <option value="medium">medium</option>
                        <option value="high">high</option>
                    </select>
                </label>
                <label style={{ flex: 1 }}>
                    Model{" "}
                    <input style={{ ...controlStyle, width: "60%" }} placeholder="provider default" value={model ?? ""} onChange={e => reset({ model: e.target.value === "" ? undefined : e.target.value })} />
                </label>
            </div>
            <label style={{ fontSize: 11, color: "var(--gdg-text-medium)" }}>
                Prompt — use {"{Column Title}"} to reference this row
            </label>
            <textarea
                style={textareaStyle}
                value={prompt}
                autoFocus={true}
                onChange={e =>
                    onChange(
                        withAiResult(
                            { ...value, data: { ...value.data, prompt: e.target.value } },
                            { result: undefined, status: "idle", error: undefined }
                        )
                    )
                }
            />
            <div style={resultStyle} data-status={status ?? "idle"}>
                {status === "error"
                    ? `⚠ ${error ?? "Generation failed"}`
                    : (result ?? (status === "pending" || status === "streaming" ? "Generating…" : "No result yet"))}
            </div>
            <button
                type="button"
                style={buttonStyle}
                onClick={() => onChange(withAiResult(value, { result: undefined, status: "idle", error: undefined }))}>
                Regenerate
            </button>
        </div>
    );
};

const DOT_PERIOD_MS = 900;

export const AiCellRenderer: CustomRenderer<AiCell> = {
    kind: GridCellKind.Custom,
    isMatch: (cell: CustomCell): cell is AiCell => (cell.data as Partial<AiCellData> | undefined)?.kind === "ai-cell",
    draw: (args, cell) => {
        const { ctx, theme, rect, requestAnimationFrame, frameTime } = args;
        const { prompt, result, status = "idle", error } = cell.data;

        if (status === "done" && result !== undefined) {
            drawTextCell(args, result, cell.contentAlign);
            return true;
        }
        if (status === "streaming" && result !== undefined && result !== "") {
            drawTextCell(args, result, cell.contentAlign);
            requestAnimationFrame();
            return true;
        }
        if (status === "pending" || status === "streaming") {
            const dots = 1 + (Math.floor((frameTime % DOT_PERIOD_MS) / (DOT_PERIOD_MS / 3)) % 3);
            ctx.fillStyle = theme.textLight;
            ctx.font = theme.baseFontFull;
            ctx.textBaseline = "middle";
            ctx.fillText("✦ " + ".".repeat(dots), rect.x + theme.cellHorizontalPadding, rect.y + rect.height / 2);
            requestAnimationFrame();
            return true;
        }
        if (status === "error") {
            ctx.fillStyle = theme.textMedium;
            ctx.font = theme.baseFontFull;
            ctx.textBaseline = "middle";
            ctx.fillText(`⚠ ${error ?? "error"}`, rect.x + theme.cellHorizontalPadding, rect.y + rect.height / 2);
            return true;
        }
        ctx.fillStyle = theme.textLight;
        ctx.font = theme.baseFontFull;
        ctx.textBaseline = "middle";
        ctx.fillText(prompt === "" ? "✦ (empty prompt)" : `✦ ${prompt}`, rect.x + theme.cellHorizontalPadding, rect.y + rect.height / 2);
        return true;
    },
    measure: (ctx, cell, theme) => {
        const text = cell.data.result ?? cell.data.prompt;
        return measureTextCached(text, ctx, theme.baseFontFull).width + theme.cellHorizontalPadding * 2;
    },
    provideEditor: () => ({
        editor: p => <AiCellEditor value={p.value} onChange={p.onChange} />,
        disablePadding: true,
    }),
    onPaste: (val, data) => ({ ...data, prompt: val, result: undefined, status: "idle", error: undefined }),
    onDelete: cell => withAiResult(cell, { result: undefined, status: "idle", error: undefined }),
};
