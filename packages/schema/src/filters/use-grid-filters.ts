import * as React from "react";
import type { DataEditorProps, GridColumn } from "tengrids";
import type { FilterClause, FilterSpec } from "../filter-spec.js";
import type { FilterField } from "../types.js";
import { fromSearchParams as decodeSearchParams, toSearchParams as encodeSearchParams } from "./codec.js";
import { columnsFromFields, evaluateGridFilters, clauseMatchesField, type Facet } from "./evaluate.js";
import { isOpAllowed } from "./ops.js";
import { memoryStore, type FilterStore } from "./store.js";

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
    readonly store?: FilterStore;
    readonly maxRows?: number;
}

export interface UseGridFiltersResult {
    readonly spec: FilterSpec;
    readonly setSpec: (spec: FilterSpec) => void;
    readonly setClause: (key: string, clause: FilterClause | undefined) => void;
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

function nodeEnv(): string | undefined {
    const g = globalThis as { process?: { env?: { NODE_ENV?: string } } };
    return g.process?.env?.NODE_ENV;
}

function rejectOp(key: string, op: string, kind: string): void {
    if (nodeEnv() !== "production") {
        throw new RangeError(`Filter op "${op}" is not allowed for field "${key}" (${kind})`);
    }
}

export function useGridFilters(options: UseGridFiltersOptions): UseGridFiltersResult {
    const { fields, rows, getCellContent, columns: columnsIn, store: storeIn, maxRows = DEFAULT_MAX_ROWS } = options;

    const defaultStore = React.useRef<FilterStore | null>(null);
    if (defaultStore.current === null) defaultStore.current = memoryStore();
    const store = storeIn ?? defaultStore.current;

    const [spec, setSpecState] = React.useState<FilterSpec>(() => store.get());
    React.useEffect(() => {
        setSpecState(store.get());
        return store.subscribe(() => {
            setSpecState(store.get());
        });
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
        (next: FilterSpec) => {
            store.set(next);
        },
        [store]
    );

    const setClause = React.useCallback(
        (key: string, clause: FilterClause | undefined) => {
            const field = fields.find(f => f.key === key);
            if (clause !== undefined && field !== undefined && !isOpAllowed(field.kind, clause.op)) {
                rejectOp(key, clause.op, field.kind);
                return;
            }
            const rest = spec.clauses.filter(c =>
                field !== undefined ? !clauseMatchesField(c, field) : c.column !== key
            );
            const nextClauses = clause === undefined ? rest : [...rest, { ...clause, column: clause.column || key }];
            store.set({
                ...(spec.conjunction !== undefined ? { conjunction: spec.conjunction } : {}),
                clauses: nextClauses,
            });
        },
        [fields, spec, store]
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
        truncated: active ? evaluated.truncated : false,
        fields,
        toSearchParams,
        fromSearchParams,
    };
}
