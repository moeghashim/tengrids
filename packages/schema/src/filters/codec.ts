import type { FilterClause, FilterOp, FilterSpec } from "../filter-spec.js";
import { isFilterOp } from "./ops.js";

const DEFAULT_PARAM = "filter";

function isNumberToken(s: string): boolean {
    if (s === "") return false;
    const n = Number(s);
    if (!Number.isFinite(n)) return false;
    return JSON.stringify(n) === s;
}

function encodeAtom(v: string | number | boolean): string {
    if (typeof v === "boolean") return v ? "true" : "false";
    if (typeof v === "number") {
        if (!Number.isFinite(v)) return "0";
        return JSON.stringify(v);
    }
    if (v === "" || v === "true" || v === "false" || v.startsWith('"') || isNumberToken(v)) {
        return encodeURIComponent(JSON.stringify(v));
    }
    return encodeURIComponent(v);
}

function safeDecode(s: string): string {
    try {
        return decodeURIComponent(s);
    } catch {
        return s;
    }
}

function decodeAtom(raw: string): string | number | boolean {
    const d = safeDecode(raw);
    if (d === "true") return true;
    if (d === "false") return false;
    if (isNumberToken(d)) return Number(d);
    if (d.length >= 2 && d.startsWith('"') && d.endsWith('"')) {
        try {
            const parsed: unknown = JSON.parse(d);
            if (typeof parsed === "string") return parsed;
        } catch {
            return d;
        }
    }
    return d;
}

function encodeValue(op: FilterOp, value: FilterClause["value"]): string {
    if (op === "empty" || op === "notEmpty" || value === undefined) return "";
    if (op === "in") {
        const items: readonly (string | number | boolean)[] = Array.isArray(value) ? value : [value];
        return items.map(item => encodeAtom(item)).join(",");
    }
    if (Array.isArray(value)) {
        const items: readonly (string | number)[] = value;
        return items.map(item => encodeAtom(item)).join(",");
    }
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return encodeAtom(value);
    }
    return "";
}

function decodeValue(op: FilterOp, raw: string): FilterClause["value"] {
    if (op === "empty" || op === "notEmpty") return undefined;
    if (op === "in") {
        if (raw === "") return [];
        return raw.split(",").map(part => {
            const v = decodeAtom(part);
            return typeof v === "boolean" ? String(v) : v;
        });
    }
    if (raw === "") return undefined;
    return decodeAtom(raw);
}

export function encodeClause(clause: FilterClause): string {
    return `${encodeURIComponent(clause.column)}:${clause.op}:${encodeValue(clause.op, clause.value)}`;
}

function decodeClauseRaw(raw: string): FilterClause | undefined {
    const first = raw.indexOf(":");
    if (first <= 0) return undefined;
    const column = safeDecode(raw.slice(0, first));
    if (column === "") return undefined;
    const rest = raw.slice(first + 1);
    const second = rest.indexOf(":");
    const opRaw = second === -1 ? rest : rest.slice(0, second);
    if (!isFilterOp(opRaw)) return undefined;
    const valuePart = second === -1 ? "" : rest.slice(second + 1);
    const value = decodeValue(opRaw, valuePart);
    return value === undefined ? { column, op: opRaw } : { column, op: opRaw, value };
}

function decodeClause(raw: string): FilterClause | undefined {
    const direct = decodeClauseRaw(raw);
    if (direct !== undefined) return direct;
    // Browsers often percent-encode structural `:` on reload (`status%3Ain%3Aactive`).
    if (raw.includes("%")) return decodeClauseRaw(safeDecode(raw));
    return undefined;
}

export function conjunctionParam(param: string): string {
    return `${param}x`;
}

/**
 * Readable query string: structural `:` / `,` stay bare; atoms percent-encode
 * `,` and `:` as `%2C` / `%3A`. Extra params from `extra` are preserved.
 */
export function toQueryString(spec: FilterSpec, param: string = DEFAULT_PARAM, extra?: URLSearchParams): string {
    const parts: string[] = [];
    if (extra !== undefined) {
        for (const [key, value] of extra.entries()) {
            if (key === param || key === conjunctionParam(param)) continue;
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
    }
    for (const clause of spec.clauses) {
        parts.push(`${encodeURIComponent(param)}=${encodeClause(clause)}`);
    }
    if (spec.conjunction === "or") parts.push(`${encodeURIComponent(conjunctionParam(param))}=or`);
    return parts.join("&");
}

/** Parse a raw `location.search` (or query without `?`) so `%2C` in atoms survives. */
export function fromQueryString(search: string, param: string = DEFAULT_PARAM): FilterSpec {
    const q = search.startsWith("?") ? search.slice(1) : search;
    if (q === "") return { clauses: [] };
    const clauses: FilterClause[] = [];
    let or = false;
    for (const part of q.split("&")) {
        if (part === "") continue;
        const eq = part.indexOf("=");
        const key = safeDecode(eq === -1 ? part : part.slice(0, eq));
        const raw = eq === -1 ? "" : part.slice(eq + 1);
        if (key === conjunctionParam(param) && safeDecode(raw) === "or") {
            or = true;
            continue;
        }
        if (key !== param) continue;
        try {
            const clause = decodeClause(raw);
            if (clause !== undefined) clauses.push(clause);
        } catch {
            // hostile / malformed value — skip
        }
    }
    return or ? { conjunction: "or", clauses } : { clauses };
}

/** Encode a spec as one readable search param per clause (`status:in:draft,active`). */
export function toSearchParams(spec: FilterSpec, param: string = DEFAULT_PARAM): URLSearchParams {
    return new URLSearchParams(toQueryString(spec, param));
}

/**
 * Decode a spec from search params. Unknown keys and invalid ops are ignored
 * so a tampered URL yields a partial filter, never an error.
 *
 * Prefer `fromQueryString` when the URL may contain `%2C` / `%3A` inside atoms:
 * `URLSearchParams` decodes those before we can split lists.
 */
export function fromSearchParams(params: URLSearchParams, param: string = DEFAULT_PARAM): FilterSpec {
    const clauses: FilterClause[] = [];
    for (const raw of params.getAll(param)) {
        try {
            const clause = decodeClause(raw);
            if (clause !== undefined) clauses.push(clause);
        } catch {
            // hostile / malformed value — skip
        }
    }
    const conj = params.get(conjunctionParam(param));
    return conj === "or" ? { conjunction: "or", clauses } : { clauses };
}
