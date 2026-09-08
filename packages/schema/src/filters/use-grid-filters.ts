import * as React from "react";
import type { DataEditorProps, GridColumn } from "tengrids";
import type { FilterClause, FilterSpec } from "../filter-spec.js";
import type { FilterField } from "../types.js";
import { fromSearchParams as decodeSearchParams, toSearchParams as encodeSearchParams } from "./codec.js";
import { columnsFromFields, evaluateGridFilters, clauseMatchesField, type Facet } from "./evaluate.js";
import { isOpAllowed } from "./ops.js";
import { memoryStore, type FilterStore } from "./store.js";

declare const process: { env: { NODE_ENV?: string } };

const DEFAULT_MAX_ROWS = 50_000;
const EMPTY_SPEC: FilterSpec = { clauses: [] };

export interface UseGridFiltersOptions {
    readonly fields: readonly FilterField[];
    readonly rows: number;
    readonly getCellContent: DataEditorProps["getCellContent"];
    /**
     * Grid columns, used to map `FilterField.key` / clause.column onto
     * `getCellContent` indices. When omitted, columns are synthesized from
     * `fields` in order — only correct when those indices match the grid.
     */
    readonly columns?: readonly GridColumn[];
    /**
     * Persistence. The first instance passed (or an internal `memoryStore()`)
     * is pinned for the hook's lifetime, so `store: urlStore({ param: "f" })`
     * inline in render is safe. Remount to switch stores.
     */
    readonly store?: FilterStore;
    readonly maxRows?: number;
}

export interface UseGridFiltersResult {
    readonly spec: FilterSpec;
    /** `undefined` clears the spec (so `onSpec: filters.setSpec` is safe). */
    readonly setSpec: (spec: FilterSpec | undefined) => void;
    readonly setClause: (key: string, clause: FilterClause | readonly FilterClause[] | undefined) => void;
    readonly clear: () => void;
    readonly rows: number;
    readonly getCellContent: DataEditorProps["getCellContent"];
    readonly getOriginalIndex: (row: number) => number;
    readonly facets: ReadonlyMap<string, Facet>;
    readonly status: "idle" | "filtering";
    readonly matched: number;
    readonly truncated: boolean;
    readonly fields: readonly FilterField[];
    readonly toSearchParams: () => URLSearchParams;
    readonly fromSearchParams: (params: URLSearchParams) => void;
}

function identityIndex(row: number): number {
    return row;
}

function rejectOp(key: string, op: string, kind: string): void {
    // `process.env.NODE_ENV` must appear literally so bundlers can replace it.
    // After substitution the identifier `process` may be gone; an unreplaced
    // browser access throws and is treated as development.
    let prod = false;
    try {
        prod = process.env.NODE_ENV === "production";
    } catch {
        prod = false;
    }
    if (!prod) {
        throw new RangeError(`Filter op "${op}" is not allowed for field "${key}" (${kind})`);
    }
}

function asClauseList(clause: FilterClause | readonly FilterClause[] | undefined): FilterClause[] {
    if (clause === undefined) return [];
    if (Array.isArray(clause)) return [...(clause as readonly FilterClause[])];
    return [clause as FilterClause];
}

export function useGridFilters(options: UseGridFiltersOptions): UseGridFiltersResult {
    const { fields, rows, getCellContent, columns: columnsIn, store: storeIn, maxRows = DEFAULT_MAX_ROWS } = options;

    const storeRef = React.useRef<FilterStore | null>(null);
    if (storeRef.current === null) storeRef.current = storeIn ?? memoryStore();
    const store = storeRef.current;

    const [spec, setSpecState] = React.useState<FilterSpec>(() => store.get());
    React.useEffect(() => {
        const unsub = store.subscribe(() => {
            setSpecState(store.get());
        });
        setSpecState(store.get());
        return unsub;
    }, [store]);

    const columns = React.useMemo(() => columnsIn ?? columnsFromFields(fields), [columnsIn, fields]);

    const evaluated = React.useMemo(
        () => evaluateGridFilters(spec, fields, columns, rows, getCellContent, maxRows),
        [spec, fields, columns, rows, getCellContent, maxRows]
    );

    const active = spec.clauses.length > 0;
    const mapping = evaluated.mapping;

    const getOriginalIndex = React.useCallback(
        (row: number): number => (active ? (mapping[row] ?? row) : row),
        [active, mapping]
    );

    const remapped = React.useCallback<DataEditorProps["getCellContent"]>(
        ([col, row]) => getCellContent([col, getOriginalIndex(row)]),
        [getCellContent, getOriginalIndex]
    );

    const setSpec = React.useCallback(
        (next: FilterSpec | undefined) => {
            store.set(next ?? EMPTY_SPEC);
        },
        [store]
    );

    const setClause = React.useCallback(
        (key: string, clause: FilterClause | readonly FilterClause[] | undefined) => {
            const field = fields.find(f => f.key === key);
            const incoming = asClauseList(clause);
            for (const c of incoming) {
                if (field !== undefined && !isOpAllowed(field.kind, c.op)) {
                    rejectOp(key, c.op, field.kind);
                    return;
                }
            }
            const current = store.get();
            const rest = current.clauses.filter(c =>
                field !== undefined ? !clauseMatchesField(c, field) : c.column !== key
            );
            const nextClauses =
                incoming.length === 0 ? rest : [...rest, ...incoming.map(c => ({ ...c, column: c.column || key }))];
            store.set({
                ...(current.conjunction !== undefined ? { conjunction: current.conjunction } : {}),
                clauses: nextClauses,
            });
        },
        [fields, store]
    );

    const clear = React.useCallback(() => {
        store.set(EMPTY_SPEC);
    }, [store]);

    const toSearchParams = React.useCallback(() => encodeSearchParams(spec), [spec]);

    const fromSearchParams = React.useCallback(
        (params: URLSearchParams) => {
            store.set(decodeSearchParams(params));
        },
        [store]
    );

    return {
        spec,
        setSpec,
        setClause,
        clear,
        rows: active ? mapping.length : rows,
        getCellContent: active ? remapped : getCellContent,
        getOriginalIndex: active ? getOriginalIndex : identityIndex,
        facets: evaluated.facets,
        status: active ? "filtering" : "idle",
        matched: active ? evaluated.matched : rows,
        truncated: evaluated.truncated,
        fields,
        toSearchParams,
        fromSearchParams,
    };
}
