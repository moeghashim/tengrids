import type { FilterSpec } from "../filter-spec.js";
import { fromSearchParams, toSearchParams, conjunctionParam } from "./codec.js";

export interface FilterStore {
    get(): FilterSpec;
    set(spec: FilterSpec): void;
    subscribe(listener: () => void): () => void;
}

const EMPTY: FilterSpec = { clauses: [] };

function notify(listeners: Set<() => void>): void {
    for (const listener of listeners) listener();
}

/** Ephemeral in-memory store. The default for `useGridFilters`. */
export function memoryStore(initial?: FilterSpec): FilterStore {
    let spec: FilterSpec = initial ?? EMPTY;
    const listeners = new Set<() => void>();
    return {
        get: () => spec,
        set: next => {
            if (next === spec) return;
            spec = next;
            notify(listeners);
        },
        subscribe: listener => {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
    };
}

export interface UrlStoreOptions {
    readonly param?: string;
    readonly history?: "replace" | "push";
}

function writeUrl(spec: FilterSpec, param: string, history: "replace" | "push"): void {
    const current = new URLSearchParams(window.location.search);
    current.delete(param);
    current.delete(conjunctionParam(param));
    const encoded = toSearchParams(spec, param);
    for (const [key, value] of encoded.entries()) {
        current.append(key, value);
    }
    const qs = current.toString();
    const url = `${window.location.pathname}${qs === "" ? "" : `?${qs}`}${window.location.hash}`;
    if (history === "push") {
        window.history.pushState(null, "", url);
    } else {
        window.history.replaceState(null, "", url);
    }
}

/**
 * Persist the spec in `window.location.search` through the History API.
 * Safe under SSR (falls back to `memoryStore`). Default param is `"filter"`.
 */
export function urlStore(options: UrlStoreOptions = {}): FilterStore {
    const param = options.param ?? "filter";
    const history = options.history ?? "replace";
    if (typeof window === "undefined") {
        return memoryStore();
    }
    let spec: FilterSpec = fromSearchParams(new URLSearchParams(window.location.search), param);
    const listeners = new Set<() => void>();
    const onPopState = (): void => {
        spec = fromSearchParams(new URLSearchParams(window.location.search), param);
        notify(listeners);
    };
    window.addEventListener("popstate", onPopState);
    return {
        get: () => spec,
        set: next => {
            spec = next;
            writeUrl(next, param, history);
            notify(listeners);
        },
        subscribe: listener => {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
    };
}
