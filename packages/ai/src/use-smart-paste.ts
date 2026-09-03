import * as React from "react";
import type { DataEditorProps, EditableGridCell, EditListItem, GridCell, GridColumn, Item } from "tengrids";
import { GridCellKind } from "tengrids";
import { coerceValue } from "./coerce.js";
import { extractJson } from "./json.js";
import { type AiProvider, collectCompletion, isAbortError } from "./provider.js";

export interface UseSmartPasteOptions {
    /** Optional. Without a provider, only deterministic coercion runs. */
    readonly provider?: AiProvider;
    readonly columns: readonly GridColumn[];
    readonly getCellContent: DataEditorProps["getCellContent"];
    /** Receives the model-corrected cells after an async round trip. */
    readonly onCellsEdited: (edits: readonly EditListItem[]) => void;
    /** Batch at most this many unresolved cells per model call (default 50). */
    readonly batchSize?: number;
}

export interface UseSmartPasteResult extends Pick<DataEditorProps, "coercePasteValue"> {
    readonly onPaste: (target: Item, values: readonly (readonly string[])[]) => boolean;
    /** Number of cells currently waiting on the model. */
    readonly pending: number;
    readonly lastError: string | undefined;
}

export interface UnresolvedPaste {
    readonly index: number;
    readonly location: Item;
    readonly text: string;
    readonly target: GridCell;
    readonly column: string;
}

const KIND_HINT: Partial<Record<GridCell["kind"], string>> = {
    [GridCellKind.Number]: "a plain number (digits, optional decimal point, no units)",
    [GridCellKind.Boolean]: "true or false",
    [GridCellKind.Uri]: "an absolute URL",
    [GridCellKind.Bubble]: "a comma-separated list of short tags",
    [GridCellKind.Image]: "a comma-separated list of image URLs",
    [GridCellKind.Text]: "plain text",
};

export function buildSmartPastePrompt(items: readonly UnresolvedPaste[]): string {
    const lines = items.map(
        (it, i) => `${i}. column "${it.column}" expects ${KIND_HINT[it.target.kind] ?? "plain text"}; pasted text: ${JSON.stringify(it.text)}`
    );
    return [
        "Convert each pasted text into the value the column expects. Interpret dates, numbers written as words, currencies, and yes/no phrasing.",
        'Reply with ONLY a JSON array of objects {"i": <index>, "value": <string>} — omit entries you cannot convert.',
        ...lines,
    ].join("\n");
}

/**
 * Smart paste: deterministic coercion into the target cell's kind runs
 * synchronously through `coercePasteValue`; texts it can't understand are
 * batched into one model call and corrected afterwards via `onCellsEdited`.
 * The grid's own paste still happens immediately, so nothing blocks.
 */
export function useSmartPaste(options: UseSmartPasteOptions): UseSmartPasteResult {
    const { provider, columns, getCellContent, onCellsEdited, batchSize = 50 } = options;
    const [pending, setPending] = React.useState(0);
    const [lastError, setLastError] = React.useState<string | undefined>(undefined);
    const editedRef = React.useRef(onCellsEdited);
    editedRef.current = onCellsEdited;

    const coercePasteValue = React.useCallback<NonNullable<DataEditorProps["coercePasteValue"]>>(
        (val, cell) => coerceValue(val, cell),
        []
    );

    const resolveWithModel = React.useCallback(
        async (items: readonly UnresolvedPaste[]) => {
            if (provider === undefined || items.length === 0) return;
            setPending(p => p + items.length);
            try {
                const controller = new AbortController();
                const answer = await collectCompletion(
                    provider.complete(
                        {
                            prompt: buildSmartPastePrompt(items),
                            system: "You convert pasted spreadsheet text into typed cell values. Reply with JSON only.",
                            feature: "smart-paste",
                        },
                        { signal: controller.signal }
                    ),
                    undefined,
                    controller.signal
                );
                const parsed = extractJson<Array<{ i: number; value: unknown }>>(answer);
                const edits: EditListItem[] = [];
                if (Array.isArray(parsed)) {
                    for (const entry of parsed) {
                        if (entry === null || typeof entry !== "object") continue;
                        const item = items[Number((entry as { i: unknown }).i)];
                        if (item === undefined) continue;
                        const coerced = coerceValue(String((entry as { value: unknown }).value ?? ""), item.target);
                        if (coerced !== undefined) edits.push({ location: item.location, value: coerced as EditableGridCell });
                    }
                }
                if (edits.length > 0) editedRef.current(edits);
                setLastError(undefined);
            } catch (e) {
                if (!isAbortError(e)) setLastError(e instanceof Error ? e.message : String(e));
            } finally {
                setPending(p => Math.max(0, p - items.length));
            }
        },
        [provider]
    );

    const onPaste = React.useCallback(
        (target: Item, values: readonly (readonly string[])[]) => {
            if (provider === undefined) return true;
            const unresolved: UnresolvedPaste[] = [];
            values.forEach((rowValues, r) => {
                rowValues.forEach((text, c) => {
                    const location: Item = [target[0] + c, target[1] + r];
                    if (location[0] >= columns.length) return;
                    const cell = getCellContent(location);
                    if (text.trim() === "" || cell.kind === GridCellKind.Text || cell.kind === GridCellKind.Custom) return;
                    if (coerceValue(text, cell) !== undefined) return;
                    unresolved.push({
                        index: unresolved.length,
                        location,
                        text,
                        target: cell,
                        column: columns[location[0]]?.title ?? String(location[0]),
                    });
                });
            });
            for (let i = 0; i < unresolved.length; i += batchSize) {
                void resolveWithModel(unresolved.slice(i, i + batchSize));
            }
            return true;
        },
        [provider, columns, getCellContent, batchSize, resolveWithModel]
    );

    return { coercePasteValue, onPaste, pending, lastError };
}
