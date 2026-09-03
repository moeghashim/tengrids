import * as React from "react";
import type { DataEditorProps, GridColumn, Item } from "tengrids";
import type { AiProvider } from "./provider.js";
import { type CompiledQueryResult, useCompiledQuery } from "./use-compiled-query.js";

export interface UseNaturalLanguageSearchOptions {
    readonly provider?: AiProvider;
    readonly columns: readonly GridColumn[];
    readonly rows: number;
    readonly getCellContent: DataEditorProps["getCellContent"];
    readonly debounceMs?: number;
    readonly maxRows?: number;
}

export interface UseNaturalLanguageSearchResult
    extends Pick<DataEditorProps, "searchValue" | "onSearchValueChange" | "searchResults" | "showSearch" | "onSearchClose">,
        Omit<CompiledQueryResult, "matchedCells"> {
    readonly setSearchValue: (value: string) => void;
    readonly openSearch: () => void;
    readonly closeSearch: () => void;
}

/**
 * Drives the grid's built-in search box with natural language: literal
 * matches appear instantly, then the model's compiled filter replaces them.
 * Spread the result onto <DataEditor>.
 */
export function useNaturalLanguageSearch(options: UseNaturalLanguageSearchOptions): UseNaturalLanguageSearchResult {
    const [searchValue, setSearchValue] = React.useState("");
    const [showSearch, setShowSearch] = React.useState(false);
    const compiled = useCompiledQuery({ ...options, query: searchValue });

    const searchResults = React.useMemo<readonly Item[]>(() => {
        const out: Item[] = [];
        for (const row of compiled.matchedRows) {
            for (const col of compiled.matchedCells.get(row) ?? [0]) out.push([col, row]);
        }
        return out;
    }, [compiled.matchedRows, compiled.matchedCells]);

    const onSearchValueChange = React.useCallback((v: string) => setSearchValue(v), []);
    const openSearch = React.useCallback(() => setShowSearch(true), []);
    const closeSearch = React.useCallback(() => setShowSearch(false), []);

    return {
        searchValue,
        onSearchValueChange,
        searchResults,
        showSearch,
        onSearchClose: closeSearch,
        setSearchValue,
        openSearch,
        closeSearch,
        status: compiled.status,
        spec: compiled.spec,
        error: compiled.error,
        matchedRows: compiled.matchedRows,
    };
}
