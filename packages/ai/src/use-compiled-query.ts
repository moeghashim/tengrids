import * as React from "react";
import type { DataEditorProps, GridCell, GridColumn } from "tengrids";
import { buildQueryPrompt, evaluateFilter, type FilterSpec, literalMatches, parseFilterSpec } from "./nl-query.js";
import { type AiProvider, collectCompletion, isAbortError } from "./provider.js";

export type QueryStatus = "idle" | "literal" | "compiling" | "compiled" | "error";

export interface UseCompiledQueryOptions {
    readonly provider?: AiProvider;
    readonly columns: readonly GridColumn[];
    readonly rows: number;
    readonly getCellContent: DataEditorProps["getCellContent"];
    readonly query: string;
    /** Wait this long after the last keystroke before asking the model (default 300ms). */
    readonly debounceMs?: number;
    /** Safety cap on rows scanned per evaluation (default 50 000). */
    readonly maxRows?: number;
    /** Rows sampled into the compile prompt so the model sees value formats (default 3). */
    readonly sampleRows?: number;
}

export interface CompiledQueryResult {
    readonly status: QueryStatus;
    readonly spec: FilterSpec | undefined;
    readonly error: string | undefined;
    /** Original row indices that match, in order. */
    readonly matchedRows: readonly number[];
    /** Per matched row, the column indices that matched (literal path) or the spec's columns. */
    readonly matchedCells: ReadonlyMap<number, readonly number[]>;
}

const EMPTY: CompiledQueryResult = { status: "idle", spec: undefined, error: undefined, matchedRows: [], matchedCells: new Map() };

/**
 * Shared engine for natural-language search and filter. Every keystroke gets
 * an instant literal substring match; when a provider is present the query is
 * compiled (debounced) into a structured FilterSpec which is evaluated locally
 * across all rows — the model never sees the whole table, only column names
 * and a few sample values.
 */
export function useCompiledQuery(options: UseCompiledQueryOptions): CompiledQueryResult {
    const { provider, columns, rows, getCellContent, query, debounceMs = 300, maxRows = 50_000, sampleRows = 3 } = options;
    const [state, setState] = React.useState<CompiledQueryResult>(EMPTY);
    const specCache = React.useRef(new Map<string, FilterSpec>());

    const rowCellsFor = React.useCallback(
        (row: number): GridCell[] => columns.map((_, col) => getCellContent([col, row])),
        [columns, getCellContent]
    );

    const evaluateLiteral = React.useCallback(
        (q: string): Pick<CompiledQueryResult, "matchedRows" | "matchedCells"> => {
            const matchedRows: number[] = [];
            const matchedCells = new Map<number, number[]>();
            const limit = Math.min(rows, maxRows);
            for (let r = 0; r < limit; r++) {
                const cols = literalMatches(q, rowCellsFor(r));
                if (cols.length > 0) {
                    matchedRows.push(r);
                    matchedCells.set(r, cols);
                }
            }
            return { matchedRows, matchedCells };
        },
        [rows, maxRows, rowCellsFor]
    );

    const evaluateSpec = React.useCallback(
        (spec: FilterSpec): Pick<CompiledQueryResult, "matchedRows" | "matchedCells"> => {
            const matchedRows: number[] = [];
            const matchedCells = new Map<number, number[]>();
            const limit = Math.min(rows, maxRows);
            const specCols = spec.clauses
                .map(c => columns.findIndex(col => col.title.toLowerCase() === c.column.trim().toLowerCase() || col.id?.toLowerCase() === c.column.trim().toLowerCase()))
                .filter(i => i !== -1);
            const cols = specCols.length > 0 ? [...new Set(specCols)] : [0];
            for (let r = 0; r < limit; r++) {
                if (evaluateFilter(spec, columns, rowCellsFor(r))) {
                    matchedRows.push(r);
                    matchedCells.set(r, cols);
                }
            }
            return { matchedRows, matchedCells };
        },
        [rows, maxRows, columns, rowCellsFor]
    );

    React.useEffect(() => {
        const q = query.trim();
        if (q === "") {
            setState(EMPTY);
            return;
        }
        const literal = evaluateLiteral(q);
        const cachedSpec = specCache.current.get(q);
        if (cachedSpec !== undefined) {
            setState({ status: "compiled", spec: cachedSpec, error: undefined, ...evaluateSpec(cachedSpec) });
            return;
        }
        if (provider === undefined) {
            setState({ status: "literal", spec: undefined, error: undefined, ...literal });
            return;
        }
        setState({ status: "compiling", spec: undefined, error: undefined, ...literal });
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const samples = Array.from({ length: Math.min(sampleRows, rows) }, (_, r) => rowCellsFor(r));
                const answer = await collectCompletion(
                    provider.complete(
                        { prompt: buildQueryPrompt(q, columns, samples), system: "You translate search queries into JSON filters. Reply with JSON only.", feature: "search", difficulty: "low" },
                        { signal: controller.signal }
                    ),
                    undefined,
                    controller.signal
                );
                if (controller.signal.aborted) return;
                const spec = parseFilterSpec(answer);
                if (spec === undefined) {
                    setState({ status: "literal", spec: undefined, error: "The model did not return a usable filter", ...literal });
                    return;
                }
                specCache.current.set(q, spec);
                setState({ status: "compiled", spec, error: undefined, ...evaluateSpec(spec) });
            } catch (e) {
                if (isAbortError(e) || controller.signal.aborted) return;
                setState({ status: "error", spec: undefined, error: e instanceof Error ? e.message : String(e), ...literal });
            }
        }, debounceMs);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [query, provider, columns, rows, debounceMs, sampleRows, rowCellsFor, evaluateLiteral, evaluateSpec]);

    return state;
}
