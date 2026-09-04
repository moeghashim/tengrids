import * as React from "react";
import type { DataEditorProps, DataEditorRef, EditableGridCell, EditListItem, GridCell, GridColumn, Item, Rectangle } from "tengrids";
import { type AiCell, AiCellRenderer, isAiCell, withAiResult } from "./ai-cell.js";
import { cellText } from "./cell-text.js";
import { hashString } from "./json.js";
import { type AiProvider, isAbortError } from "./provider.js";
import { AiScheduler } from "./scheduler.js";

export interface UseAiCellsOptions {
    /** Either a provider (a scheduler is created for you) or a shared scheduler. */
    readonly provider?: AiProvider;
    readonly scheduler?: AiScheduler;
    readonly columns: readonly GridColumn[];
    readonly getCellContent: DataEditorProps["getCellContent"];
    /** Repaints finished cells in place without a React re-render when provided. */
    readonly gridRef?: React.RefObject<DataEditorRef | null>;
    /** Generate as soon as a cell becomes visible (default true). false = only via `run`/`regenerate`. */
    readonly autoRun?: boolean;
    /** Max concurrent model calls when a provider is given (default 2). */
    readonly concurrency?: number;
    /** Optional system instruction sent with every cell prompt. */
    readonly system?: string;
    /**
     * Receives each finished AI cell as an edit (`{ location, value }` with
     * `status: "done"` and the result in `data.result`/`copyData`) so your app
     * can persist generated values exactly like user edits. A cell that comes
     * back from `getCellContent` already holding a `done` result is trusted
     * and never regenerated — that is what makes a saved sheet reload for free.
     */
    readonly onCellsEdited?: (edits: readonly EditListItem[]) => void;
}

export interface UseAiCellsResult
    extends Pick<DataEditorProps, "getCellContent" | "onVisibleRegionChanged" | "customRenderers"> {
    readonly scheduler: AiScheduler;
    /** Forget the cached answer for a cell and generate again. */
    readonly regenerate: (location: Item) => void;
    /** Generate a specific cell now (used when autoRun is false). */
    readonly run: (location: Item) => void;
    /** Resolve a cell's prompt template against its row, e.g. for previews. */
    readonly resolvePrompt: (location: Item) => string | undefined;
}

/** Fill `{Column Title}` / `{column-id}` placeholders from the cells of one row. */
export function resolveTemplate(template: string, columns: readonly GridColumn[], rowCells: readonly GridCell[]): string {
    return template.replace(/\{([^{}]+)\}/g, (whole, name: string) => {
        const key = name.trim().toLowerCase();
        const idx = columns.findIndex(c => c.title.toLowerCase() === key || (c.id !== undefined && c.id.toLowerCase() === key));
        if (idx === -1 || rowCells[idx] === undefined) return whole;
        return cellText(rowCells[idx]);
    });
}

/**
 * Turns AI cells into live spreadsheet formulas: resolves each cell's prompt
 * against its row, generates only for rows on screen (cancelling requests
 * that scroll away), caches by prompt, streams partial text, and repaints
 * finished cells through the grid's damage API.
 */
export function useAiCells(options: UseAiCellsOptions): UseAiCellsResult {
    const { provider, columns, getCellContent: baseGetCellContent, gridRef, autoRun = true, concurrency, system, onCellsEdited } = options;
    const onCellsEditedRef = React.useRef(onCellsEdited);
    onCellsEditedRef.current = onCellsEdited;
    const externalScheduler = options.scheduler;
    const scheduler = React.useMemo(() => {
        if (externalScheduler !== undefined) return externalScheduler;
        if (provider === undefined) throw new Error("useAiCells needs a provider or a scheduler");
        return new AiScheduler({ provider, concurrency });
    }, [externalScheduler, provider, concurrency]);

    const [, bump] = React.useReducer((x: number) => x + 1, 0);
    const partials = React.useRef(new Map<string, string>());
    const errors = React.useRef(new Map<string, string>());
    const forced = React.useRef(new Set<string>());
    /** Keys whose persisted result must be ignored until a fresh one arrives. */
    const regenerating = React.useRef(new Set<string>());
    /** Freshly generated results that override a stale persisted value until the app persists them. */
    const freshResults = React.useRef(new Map<string, string>());
    const visible = React.useRef<Rectangle | undefined>(undefined);
    const keyToLocation = React.useRef(new Map<string, Item>());

    const repaint = React.useCallback(
        (location: Item) => {
            const ref = gridRef?.current;
            if (ref !== undefined && ref !== null) ref.updateCells([{ cell: location }]);
            else bump();
        },
        [gridRef]
    );

    const rowCellsFor = React.useCallback(
        (row: number): GridCell[] => columns.map((_, col) => baseGetCellContent([col, row])),
        [columns, baseGetCellContent]
    );

    const keyFor = React.useCallback(
        (location: Item, resolvedPrompt: string) => `${location[0]}:${location[1]}:${hashString(resolvedPrompt)}`,
        []
    );

    const isVisible = React.useCallback((location: Item) => {
        const v = visible.current;
        if (v === undefined) return true;
        return location[1] >= v.y && location[1] < v.y + v.height;
    }, []);

    const schedule = React.useCallback(
        (location: Item, key: string, resolvedPrompt: string) => {
            keyToLocation.current.set(key, location);
            scheduler
                .request(
                    key,
                    { prompt: resolvedPrompt, system, feature: "ai-cell", context: { location } },
                    {
                        priority: isVisible(location) ? 1 : 0,
                        onChunk: acc => {
                            partials.current.set(key, acc);
                            repaint(location);
                        },
                    }
                )
                .then(result => {
                    partials.current.delete(key);
                    errors.current.delete(key);
                    regenerating.current.delete(key);
                    freshResults.current.set(key, result);
                    const base = baseGetCellContent(location);
                    if (isAiCell(base) && onCellsEditedRef.current !== undefined) {
                        const value = withAiResult(base, { result, status: "done", error: undefined }) as unknown as EditableGridCell;
                        onCellsEditedRef.current([{ location, value }]);
                    }
                    repaint(location);
                })
                .catch((e: unknown) => {
                    partials.current.delete(key);
                    regenerating.current.delete(key);
                    if (!isAbortError(e)) {
                        errors.current.set(key, e instanceof Error ? e.message : String(e));
                        repaint(location);
                    }
                });
        },
        [scheduler, system, isVisible, repaint, baseGetCellContent]
    );

    const getCellContent = React.useCallback<DataEditorProps["getCellContent"]>(
        location => {
            const cell = baseGetCellContent(location);
            if (!isAiCell(cell)) return cell;
            if (cell.data.prompt.trim() === "") return withAiResult(cell, { status: "idle" });
            const resolved = resolveTemplate(cell.data.prompt, columns, rowCellsFor(location[1]));
            const key = keyFor(location, resolved);

            const fresh = freshResults.current.get(key);
            if (fresh !== undefined) {
                if (cell.data.result === fresh) freshResults.current.delete(key); // the app persisted it
                else return withAiResult(cell, { result: fresh, status: "done", error: undefined });
            }
            if (cell.data.status === "done" && cell.data.result !== undefined && !regenerating.current.has(key)) {
                // A persisted result — possibly edited by a human — wins over anything cached.
                if (scheduler.get(key) !== cell.data.result) scheduler.prime(key, cell.data.result);
                return cell;
            }

            const cached = scheduler.get(key);
            if (cached !== undefined) return withAiResult(cell, { result: cached, status: "done", error: undefined });
            const err = errors.current.get(key);
            if (err !== undefined) return withAiResult(cell, { status: "error", error: err, result: undefined });
            const partial = partials.current.get(key);
            if (partial !== undefined) return withAiResult(cell, { status: "streaming", result: partial });
            if (scheduler.isPending(key)) return withAiResult(cell, { status: "pending", result: undefined });

            const shouldRun = autoRun || forced.current.has(key);
            if (shouldRun && isVisible(location)) {
                forced.current.delete(key);
                schedule(location, key, resolved);
                return withAiResult(cell, { status: "pending", result: undefined });
            }
            return withAiResult(cell, { status: "idle" });
        },
        [baseGetCellContent, columns, rowCellsFor, keyFor, scheduler, autoRun, isVisible, schedule]
    );

    const onVisibleRegionChanged = React.useCallback<NonNullable<DataEditorProps["onVisibleRegionChanged"]>>(
        range => {
            visible.current = range;
            scheduler.cancelWhere(key => {
                const loc = keyToLocation.current.get(key);
                return loc !== undefined && !(loc[1] >= range.y && loc[1] < range.y + range.height);
            });
        },
        [scheduler]
    );

    const resolvePrompt = React.useCallback(
        (location: Item) => {
            const cell = baseGetCellContent(location);
            if (!isAiCell(cell)) return undefined;
            return resolveTemplate(cell.data.prompt, columns, rowCellsFor(location[1]));
        },
        [baseGetCellContent, columns, rowCellsFor]
    );

    const run = React.useCallback(
        (location: Item) => {
            const resolved = resolvePrompt(location);
            if (resolved === undefined) return;
            const key = keyFor(location, resolved);
            if (scheduler.has(key) || scheduler.isPending(key)) return;
            forced.current.add(key);
            errors.current.delete(key);
            schedule(location, key, resolved);
            repaint(location);
        },
        [resolvePrompt, keyFor, scheduler, schedule, repaint]
    );

    const regenerate = React.useCallback(
        (location: Item) => {
            const resolved = resolvePrompt(location);
            if (resolved === undefined) return;
            const key = keyFor(location, resolved);
            scheduler.cancel(key);
            scheduler.clearKey(key);
            errors.current.delete(key);
            partials.current.delete(key);
            regenerating.current.add(key);
            forced.current.add(key);
            schedule(location, key, resolved);
            repaint(location);
        },
        [resolvePrompt, keyFor, scheduler, schedule, repaint]
    );

    const customRenderers = React.useMemo(() => [AiCellRenderer], []);

    return { getCellContent, onVisibleRegionChanged, customRenderers, scheduler, regenerate, run, resolvePrompt };
}

export type { AiCell };
