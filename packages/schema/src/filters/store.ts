import type { FilterSpec } from "../filter-spec.js";
import { fromQueryString, toQueryString, conjunctionParam } from "./codec.js";

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
    const extra = new URLSearchParams(window.location.search);
    extra.delete(param);
    extra.delete(conjunctionParam(param));
    const qs = toQueryString(spec, param, extra);
    const url = `${window.location.pathname}${qs === "" ? "" : `?${qs}`}${window.location.hash}`;
    if (history === "push") {
        window.history.pushState(null, "", url);
    } else {
        window.history.replaceState(null, "", url);
    }
}

function readLocation(param: string): FilterSpec {
    return fromQueryString(window.location.search, param);
}

/**
 * Persist the spec in `window.location.search` through the History API.
 * Safe under SSR (falls back to `memoryStore`). Default param is `"filter"`.
 * The `popstate` listener is attached on the first `subscribe` and removed
 * after the last unsubscribe.
 */
export function urlStore(options: UrlStoreOptions = {}): FilterStore {
    const param = options.param ?? "filter";
    const history = options.history ?? "replace";
    if (typeof window === "undefined") {
        return memoryStore();
    }
    let spec: FilterSpec = readLocation(param);
    const listeners = new Set<() => void>();
    let listening = false;
    const onPopState = (): void => {
        spec = readLocation(param);
        notify(listeners);
    };
    return {
        get: () => spec,
        set: next => {
            spec = next;
            writeUrl(next, param, history);
            notify(listeners);
        },
        subscribe: listener => {
            listeners.add(listener);
            if (!listening) {
                spec = readLocation(param);
                window.addEventListener("popstate", onPopState);
                listening = true;
            }
            return () => {
                listeners.delete(listener);
                if (listeners.size === 0 && listening) {
                    window.removeEventListener("popstate", onPopState);
                    listening = false;
                }
            };
        },
    };
}
