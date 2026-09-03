import * as React from "react";
import type { DataEditorProps, GridColumn } from "tengrids";
import type { AiProvider } from "./provider.js";
import { type CompiledQueryResult, useCompiledQuery } from "./use-compiled-query.js";

export interface UseNaturalLanguageFilterOptions {
    readonly provider?: AiProvider;
    readonly columns: readonly GridColumn[];
    readonly rows: number;
    readonly getCellContent: DataEditorProps["getCellContent"];
    /** The natural-language query. Empty = no filtering. */
    readonly query: string;
    readonly debounceMs?: number;
    readonly maxRows?: number;
}

export interface UseNaturalLanguageFilterResult
    extends Pick<DataEditorProps, "getCellContent">,
        Omit<CompiledQueryResult, "matchedCells" | "matchedRows"> {
    /** Filtered row count — pass as `rows`. */
    readonly rows: number;
    /** Map a filtered row index back to the original data row. */
    readonly getOriginalIndex: (row: number) => number;
}

/**
 * Hides rows that don't match a natural-language query. Like useColumnSort,
 * it returns a remapped getCellContent + row count to spread onto the grid.
 */
export function useNaturalLanguageFilter(options: UseNaturalLanguageFilterOptions): UseNaturalLanguageFilterResult {
    const { getCellContent, rows, query } = options;
    const compiled = useCompiledQuery(options);
    const active = query.trim() !== "";
    const mapping = compiled.matchedRows;

    const getOriginalIndex = React.useCallback((row: number) => (active ? (mapping[row] ?? row) : row), [active, mapping]);
    const remapped = React.useCallback<DataEditorProps["getCellContent"]>(
        ([col, row]) => getCellContent([col, getOriginalIndex(row)]),
        [getCellContent, getOriginalIndex]
    );

    return {
        rows: active ? mapping.length : rows,
        getCellContent: active ? remapped : getCellContent,
        getOriginalIndex,
        status: compiled.status,
        spec: compiled.spec,
        error: compiled.error,
    };
}
