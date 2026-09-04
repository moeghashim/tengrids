import * as React from "react";
import type { CompactSelection, DataEditorProps, EditableGridCell, EditListItem, GridColumn, GridSelection, Item } from "tengrids";
import { cellText } from "./cell-text.js";
import { coerceValue } from "./coerce.js";
import { extractJson } from "./json.js";
import { type AiProvider, collectCompletion, isAbortError } from "./provider.js";

export type BulkEditStatus = "idle" | "proposing" | "proposed" | "error";

export interface BulkEditScope {
    /** Original row indices in scope. */
    readonly rows: readonly number[];
    /** Column indices the model may edit (all columns when omitted). */
    readonly columns?: readonly number[];
}

export interface BulkEditProposal {
    readonly instruction: string;
    readonly edits: readonly EditListItem[];
    /** Edits the model suggested that were rejected (out of scope, unknown column, uncoercible). */
    readonly rejected: number;
}

type Highlight = NonNullable<DataEditorProps["highlightRegions"]>[number];

export interface UseBulkEditOptions {
    readonly provider: AiProvider;
    readonly columns: readonly GridColumn[];
    readonly rows: number;
    readonly getCellContent: DataEditorProps["getCellContent"];
    readonly onCellsEdited: (edits: readonly EditListItem[]) => void;
    /** Refuse to send more rows than this to the model (default 200). */
    readonly maxRows?: number;
    /** Preview highlight color (default a translucent accent). */
    readonly highlightColor?: string;
}

export interface UseBulkEditResult extends Pick<DataEditorProps, "highlightRegions"> {
    readonly status: BulkEditStatus;
    readonly error: string | undefined;
    readonly proposal: BulkEditProposal | undefined;
    /** Ask the model for edits over a selection or explicit scope. Resolves when the proposal is ready. */
    readonly propose: (instruction: string, scope: GridSelection | BulkEditScope) => Promise<BulkEditProposal | undefined>;
    /** Commit the proposal through onCellsEdited. */
    readonly apply: () => void;
    readonly discard: () => void;
}

function compactToArray(sel: CompactSelection | undefined): number[] {
    return sel === undefined ? [] : sel.toArray();
}

/** Turn a GridSelection into explicit rows/columns. Whole-column selections mean every row. */
export function scopeFromSelection(selection: GridSelection, rows: number, columnCount: number): BulkEditScope {
    const rowSet = new Set<number>(compactToArray(selection.rows));
    const colSet = new Set<number>(compactToArray(selection.columns));
    const ranges = selection.current === undefined ? [] : [selection.current.range, ...selection.current.rangeStack];
    for (const r of ranges) {
        for (let y = r.y; y < r.y + r.height; y++) rowSet.add(y);
        for (let x = r.x; x < r.x + r.width; x++) colSet.add(x);
    }
    if (rowSet.size === 0 && colSet.size > 0) for (let y = 0; y < rows; y++) rowSet.add(y);
    const scopedRows = [...rowSet].filter(r => r >= 0 && r < rows).sort((a, b) => a - b);
    const scopedCols = [...colSet].filter(c => c >= 0 && c < columnCount).sort((a, b) => a - b);
    return { rows: scopedRows, columns: selection.rows.length > 0 && scopedCols.length === 0 ? undefined : scopedCols.length > 0 ? scopedCols : undefined };
}

export function buildBulkEditPrompt(
    instruction: string,
    columns: readonly GridColumn[],
    scopedColumns: readonly number[],
    rowsData: readonly { readonly row: number; readonly values: Record<string, string> }[]
): string {
    const editable = scopedColumns.map(c => `"${columns[c].title}"`).join(", ");
    return [
        `Instruction: ${JSON.stringify(instruction)}`,
        `Editable columns: ${editable}. Only these may be changed.`,
        "Rows (JSON, one per line):",
        ...rowsData.map(r => JSON.stringify({ row: r.row, ...r.values })),
        'Reply with ONLY a JSON array of changes: [{"row": <row>, "column": "<column title>", "value": "<new value>"}]. Omit rows that need no change.',
    ].join("\n");
}

/**
 * Plain-language bulk edits with a safety net: the model proposes changes for
 * the selected cells, the grid previews them as highlights, and nothing is
 * written until `apply()` — which goes through onCellsEdited, so undo/redo
 * hooks see it like any other edit.
 */
export function useBulkEdit(options: UseBulkEditOptions): UseBulkEditResult {
    const { provider, columns, rows, getCellContent, onCellsEdited, maxRows = 200, highlightColor = "rgba(79, 93, 255, 0.25)" } = options;
    const [status, setStatus] = React.useState<BulkEditStatus>("idle");
    const [error, setError] = React.useState<string | undefined>(undefined);
    const [proposal, setProposal] = React.useState<BulkEditProposal | undefined>(undefined);
    const controllerRef = React.useRef<AbortController | undefined>(undefined);

    const propose = React.useCallback(
        async (instruction: string, scopeIn: GridSelection | BulkEditScope) => {
            const scope: BulkEditScope = "rows" in scopeIn && Array.isArray((scopeIn as BulkEditScope).rows) ? (scopeIn as BulkEditScope) : scopeFromSelection(scopeIn as GridSelection, rows, columns.length);
            const scopedRows = scope.rows;
            const scopedCols = scope.columns ?? columns.map((_, i) => i);
            controllerRef.current?.abort();
            if (scopedRows.length === 0 || scopedCols.length === 0) {
                setError("Select the rows or cells to edit first");
                setStatus("error");
                return undefined;
            }
            if (scopedRows.length > maxRows) {
                setError(`Too many rows selected (${scopedRows.length}); the limit is ${maxRows}`);
                setStatus("error");
                return undefined;
            }
            const controller = new AbortController();
            controllerRef.current = controller;
            setStatus("proposing");
            setError(undefined);
            setProposal(undefined);
            try {
                const rowsData = scopedRows.map(row => {
                    const values: Record<string, string> = {};
                    for (const c of scopedCols) values[columns[c].title] = cellText(getCellContent([c, row]));
                    return { row, values };
                });
                const answer = await collectCompletion(
                    provider.complete(
                        {
                            prompt: buildBulkEditPrompt(instruction, columns, scopedCols, rowsData),
                            system: "You edit spreadsheet rows exactly as instructed and reply with JSON only.",
                            feature: "bulk-edit",
                            difficulty: "high",
                        },
                        { signal: controller.signal }
                    ),
                    undefined,
                    controller.signal
                );
                if (controller.signal.aborted) return undefined;
                const parsed = extractJson<Array<{ row: unknown; column: unknown; value: unknown }>>(answer);
                const allowedRows = new Set(scopedRows);
                const edits: EditListItem[] = [];
                const seen = new Set<string>();
                let rejected = 0;
                for (const change of Array.isArray(parsed) ? parsed : []) {
                    if (change === null || typeof change !== "object") {
                        rejected++;
                        continue;
                    }
                    const row = Number(change.row);
                    const colName = String(change.column ?? "").trim().toLowerCase();
                    const col = scopedCols.find(c => columns[c].title.toLowerCase() === colName || columns[c].id?.toLowerCase() === colName);
                    if (!allowedRows.has(row) || col === undefined || seen.has(`${col}:${row}`)) {
                        rejected++;
                        continue;
                    }
                    const location: Item = [col, row];
                    const current = getCellContent(location);
                    const coerced = coerceValue(String(change.value ?? ""), current);
                    if (coerced === undefined) {
                        rejected++;
                        continue;
                    }
                    if (cellText(coerced) === cellText(current)) continue;
                    seen.add(`${col}:${row}`);
                    edits.push({ location, value: coerced as EditableGridCell });
                }
                const result: BulkEditProposal = { instruction, edits, rejected };
                setProposal(result);
                setStatus("proposed");
                return result;
            } catch (e) {
                if (isAbortError(e) || controller.signal.aborted) return undefined;
                setError(e instanceof Error ? e.message : String(e));
                setStatus("error");
                return undefined;
            }
        },
        [provider, columns, rows, getCellContent, maxRows]
    );

    const apply = React.useCallback(() => {
        if (proposal === undefined) return;
        if (proposal.edits.length > 0) onCellsEdited(proposal.edits);
        setProposal(undefined);
        setStatus("idle");
    }, [proposal, onCellsEdited]);

    const discard = React.useCallback(() => {
        controllerRef.current?.abort();
        setProposal(undefined);
        setStatus("idle");
        setError(undefined);
    }, []);

    const highlightRegions = React.useMemo<readonly Highlight[] | undefined>(() => {
        if (proposal === undefined || proposal.edits.length === 0) return undefined;
        return proposal.edits.map(e => ({
            color: highlightColor,
            range: { x: e.location[0], y: e.location[1], width: 1, height: 1 },
            style: "solid" as const,
        }));
    }, [proposal, highlightColor]);

    return { status, error, proposal, propose, apply, discard, highlightRegions };
}
