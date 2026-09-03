import * as React from "react";
import type { DataEditorProps, EditableGridCell, EditListItem, GridCell } from "tengrids";
import { isAbortError } from "./provider.js";

export type AgentSourceStatus = "idle" | "streaming" | "done" | "error" | "cancelled";

export interface UseAgentDataSourceOptions<T> {
    /** The agent: yields rows (or batches of rows) as it produces them. Honor the signal to stop early. */
    readonly source: (signal: AbortSignal) => AsyncIterable<T | readonly T[]>;
    readonly toCell: (row: T, col: number, index: number) => GridCell;
    /**
     * Called when the user edits a cell. Return the updated row (sync or async)
     * — e.g. after telling the agent about the change — or undefined to reject.
     */
    readonly onEdited?: (row: T, col: number, newValue: EditableGridCell, index: number) => T | undefined | Promise<T | undefined>;
    /** Batch incoming rows into one re-render per interval (default 50ms). */
    readonly flushIntervalMs?: number;
    /** Start consuming immediately (default true). */
    readonly autoStart?: boolean;
    readonly initialRows?: readonly T[];
}

export interface UseAgentDataSourceResult<T> extends Pick<DataEditorProps, "getCellContent" | "onCellsEdited"> {
    readonly rows: number;
    readonly data: readonly T[];
    readonly status: AgentSourceStatus;
    readonly error: string | undefined;
    /** (Re)start the source from scratch. */
    readonly start: () => void;
    /** Stop the source; rows received so far are kept. */
    readonly stop: () => void;
    /** Drop all rows and stop. */
    readonly reset: () => void;
    /** Add rows from outside the stream (e.g. a user-triggered follow-up). */
    readonly appendRows: (rows: readonly T[]) => void;
}

/**
 * Lets an agent be the grid's backend: rows stream in as they are produced
 * (batched into cheap re-renders), the grid stays interactive throughout,
 * and edits flow back through `onEdited` so the agent can react.
 */
export function useAgentDataSource<T>(options: UseAgentDataSourceOptions<T>): UseAgentDataSourceResult<T> {
    const { source, toCell, onEdited, flushIntervalMs = 50, autoStart = true, initialRows } = options;
    const [data, setData] = React.useState<readonly T[]>(initialRows ?? []);
    const [status, setStatus] = React.useState<AgentSourceStatus>("idle");
    const [error, setError] = React.useState<string | undefined>(undefined);
    const dataRef = React.useRef<T[]>([...(initialRows ?? [])]);
    const controllerRef = React.useRef<AbortController | undefined>(undefined);
    const bufferRef = React.useRef<T[]>([]);
    const flushTimerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const [generation, setGeneration] = React.useState(autoStart ? 1 : 0);
    const sourceRef = React.useRef(source);
    sourceRef.current = source;
    const onEditedRef = React.useRef(onEdited);
    onEditedRef.current = onEdited;

    const publish = React.useCallback(() => {
        flushTimerRef.current = undefined;
        if (bufferRef.current.length === 0) return;
        dataRef.current.push(...bufferRef.current);
        bufferRef.current = [];
        setData([...dataRef.current]);
    }, []);

    const scheduleFlush = React.useCallback(() => {
        if (flushTimerRef.current !== undefined) return;
        flushTimerRef.current = setTimeout(publish, flushIntervalMs);
    }, [publish, flushIntervalMs]);

    const stop = React.useCallback(() => {
        controllerRef.current?.abort();
        controllerRef.current = undefined;
        if (flushTimerRef.current !== undefined) clearTimeout(flushTimerRef.current);
        publish();
        setStatus(s => (s === "streaming" ? "cancelled" : s));
    }, [publish]);

    const reset = React.useCallback(() => {
        controllerRef.current?.abort();
        controllerRef.current = undefined;
        if (flushTimerRef.current !== undefined) clearTimeout(flushTimerRef.current);
        flushTimerRef.current = undefined;
        bufferRef.current = [];
        dataRef.current = [];
        setData([]);
        setStatus("idle");
        setError(undefined);
    }, []);

    const start = React.useCallback(() => {
        reset();
        setGeneration(g => g + 1);
    }, [reset]);

    React.useEffect(() => {
        if (generation === 0) return;
        const controller = new AbortController();
        controllerRef.current = controller;
        setStatus("streaming");
        setError(undefined);
        void (async () => {
            try {
                for await (const item of sourceRef.current(controller.signal)) {
                    if (controller.signal.aborted) break;
                    if (Array.isArray(item)) bufferRef.current.push(...(item as readonly T[]));
                    else bufferRef.current.push(item as T);
                    scheduleFlush();
                }
                if (controller.signal.aborted) return;
                if (flushTimerRef.current !== undefined) clearTimeout(flushTimerRef.current);
                publish();
                setStatus("done");
            } catch (e) {
                if (controller.signal.aborted || isAbortError(e)) return;
                if (flushTimerRef.current !== undefined) clearTimeout(flushTimerRef.current);
                publish();
                setError(e instanceof Error ? e.message : String(e));
                setStatus("error");
            } finally {
                if (controllerRef.current === controller) controllerRef.current = undefined;
            }
        })();
        return () => {
            controller.abort();
        };
    }, [generation, scheduleFlush, publish]);

    const getCellContent = React.useCallback<DataEditorProps["getCellContent"]>(
        ([col, row]) => {
            const r = dataRef.current[row];
            if (r === undefined) return { kind: "loading", allowOverlay: false } as GridCell;
            return toCell(r, col, row);
        },
        [toCell]
    );

    const onCellsEdited = React.useCallback<NonNullable<DataEditorProps["onCellsEdited"]>>(
        edits => {
            const handler = onEditedRef.current;
            if (handler === undefined) return true;
            let changed = false;
            const pending: Promise<void>[] = [];
            for (const edit of edits as readonly EditListItem[]) {
                const [col, row] = edit.location;
                const current = dataRef.current[row];
                if (current === undefined) continue;
                const outcome = handler(current, col, edit.value, row);
                const applyRow = (updated: T | undefined) => {
                    if (updated === undefined) return;
                    dataRef.current[row] = updated;
                    changed = true;
                };
                if (outcome instanceof Promise) {
                    pending.push(
                        outcome.then(updated => {
                            if (updated === undefined) return;
                            dataRef.current[row] = updated;
                            setData([...dataRef.current]);
                        })
                    );
                } else applyRow(outcome);
            }
            if (changed) setData([...dataRef.current]);
            return true;
        },
        []
    );

    const appendRows = React.useCallback((rows: readonly T[]) => {
        dataRef.current.push(...rows);
        setData([...dataRef.current]);
    }, []);

    return { rows: data.length, data, getCellContent, onCellsEdited, status, error, start, stop, reset, appendRows };
}
