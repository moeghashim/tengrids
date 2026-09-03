import type { GridCell, GridColumn } from "tengrids";
import { cellText } from "./cell-text.js";
import { parseNumber } from "./coerce.js";
import { extractJson } from "./json.js";

export type FilterOp =
    | "contains"
    | "notContains"
    | "eq"
    | "neq"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "startsWith"
    | "endsWith"
    | "empty"
    | "notEmpty"
    | "in";

export interface FilterClause {
    /** Column title or id (case-insensitive). */
    readonly column: string;
    readonly op: FilterOp;
    readonly value?: string | number | boolean | readonly (string | number)[];
}

/** What the model returns: a structured filter evaluated locally over every row. */
export interface FilterSpec {
    readonly conjunction?: "and" | "or";
    readonly clauses: readonly FilterClause[];
}

const OPS = new Set<FilterOp>(["contains", "notContains", "eq", "neq", "gt", "gte", "lt", "lte", "startsWith", "endsWith", "empty", "notEmpty", "in"]);
const OP_ALIASES: Record<string, FilterOp> = {
    "=": "eq", "==": "eq", equals: "eq", is: "eq", "!=": "neq", "<>": "neq", not: "neq", isnot: "neq",
    ">": "gt", after: "gt", greater: "gt", ">=": "gte", "<": "lt", before: "lt", less: "lt", "<=": "lte",
    includes: "contains", like: "contains", has: "contains", excludes: "notContains", startswith: "startsWith",
    endswith: "endsWith", isempty: "empty", isnotempty: "notEmpty", oneof: "in", any: "in",
};

/** Normalize and validate model output into a FilterSpec, or undefined. */
export function parseFilterSpec(text: string): FilterSpec | undefined {
    const raw = extractJson<unknown>(text);
    if (raw === undefined || raw === null || typeof raw !== "object") return undefined;
    const obj = raw as { conjunction?: unknown; clauses?: unknown };
    const clauseList = Array.isArray(obj.clauses) ? obj.clauses : Array.isArray(raw) ? (raw as unknown[]) : undefined;
    if (clauseList === undefined) return undefined;
    const clauses: FilterClause[] = [];
    for (const c of clauseList) {
        if (c === null || typeof c !== "object") continue;
        const { column, op, value } = c as { column?: unknown; op?: unknown; value?: unknown };
        if (typeof column !== "string" || typeof op !== "string") continue;
        const norm = op.trim();
        const resolved = OPS.has(norm as FilterOp) ? (norm as FilterOp) : OP_ALIASES[norm.toLowerCase().replace(/[\s_-]/g, "")];
        if (resolved === undefined) continue;
        const cleanValue =
            value === undefined || value === null
                ? undefined
                : Array.isArray(value)
                  ? value.filter((v): v is string | number => typeof v === "string" || typeof v === "number")
                  : typeof value === "string" || typeof value === "number" || typeof value === "boolean"
                    ? value
                    : String(value);
        clauses.push({ column, op: resolved, value: cleanValue });
    }
    if (clauses.length === 0) return undefined;
    const conjunction = obj.conjunction === "or" ? "or" : "and";
    return { conjunction, clauses };
}

function asNumber(v: unknown): number | undefined {
    if (typeof v === "number") return Number.isNaN(v) ? undefined : v;
    if (typeof v === "boolean") return v ? 1 : 0;
    if (typeof v === "string") {
        const n = parseNumber(v);
        if (n !== undefined) return n;
        const d = Date.parse(v);
        return Number.isNaN(d) ? undefined : d;
    }
    return undefined;
}

function compare(a: string, b: unknown): number | undefined {
    const an = asNumber(a);
    const bn = asNumber(b);
    if (an !== undefined && bn !== undefined) return an === bn ? 0 : an < bn ? -1 : 1;
    const bs = String(b ?? "");
    return a.localeCompare(bs, undefined, { sensitivity: "base", numeric: true });
}

/** Evaluate one clause against one cell. */
export function matchesClause(cell: GridCell, clause: FilterClause): boolean {
    const text = cellText(cell);
    const lower = text.toLowerCase();
    const v = clause.value;
    const vs = v === undefined ? "" : String(v).toLowerCase();
    switch (clause.op) {
        case "contains":
            return lower.includes(vs);
        case "notContains":
            return !lower.includes(vs);
        case "startsWith":
            return lower.startsWith(vs);
        case "endsWith":
            return lower.endsWith(vs);
        case "empty":
            return text.trim() === "";
        case "notEmpty":
            return text.trim() !== "";
        case "in": {
            const list = Array.isArray(v) ? v : v === undefined ? [] : [v];
            return list.some(x => compare(text, x) === 0);
        }
        case "eq":
            return compare(text, v) === 0;
        case "neq":
            return compare(text, v) !== 0;
        case "gt":
        case "gte":
        case "lt":
        case "lte": {
            const c = compare(text, v);
            if (c === undefined) return false;
            return clause.op === "gt" ? c > 0 : clause.op === "gte" ? c >= 0 : clause.op === "lt" ? c < 0 : c <= 0;
        }
        default:
            return false;
    }
}

export function findColumnIndex(columns: readonly GridColumn[], name: string): number {
    const key = name.trim().toLowerCase();
    return columns.findIndex(c => c.title.toLowerCase() === key || (c.id !== undefined && c.id.toLowerCase() === key));
}

/** Evaluate a spec against one row's cells. Unknown columns never match. */
export function evaluateFilter(spec: FilterSpec, columns: readonly GridColumn[], rowCells: readonly GridCell[]): boolean {
    const results = spec.clauses.map(clause => {
        const idx = findColumnIndex(columns, clause.column);
        const cell = idx === -1 ? undefined : rowCells[idx];
        return cell === undefined ? false : matchesClause(cell, clause);
    });
    return spec.conjunction === "or" ? results.some(Boolean) : results.every(Boolean);
}

/** The columns a spec touches (indices), for highlighting matches. */
export function specColumns(spec: FilterSpec, columns: readonly GridColumn[]): number[] {
    const set = new Set<number>();
    for (const c of spec.clauses) {
        const idx = findColumnIndex(columns, c.column);
        if (idx !== -1) set.add(idx);
    }
    return [...set];
}

/** Plain substring search — the instant path before (or without) a model. */
export function literalMatches(query: string, rowCells: readonly GridCell[]): number[] {
    const q = query.trim().toLowerCase();
    if (q === "") return [];
    const out: number[] = [];
    rowCells.forEach((cell, i) => {
        if (cellText(cell).toLowerCase().includes(q)) out.push(i);
    });
    return out;
}

const KIND_NAMES: Record<string, string> = {
    text: "text", number: "number", boolean: "boolean", uri: "url", markdown: "text", bubble: "tags", image: "image urls",
    drilldown: "text", custom: "text", loading: "text", protected: "text", "row-id": "id",
};

/** Ask the model to compile a natural-language query into a FilterSpec. */
export function buildQueryPrompt(query: string, columns: readonly GridColumn[], sampleRows: readonly (readonly GridCell[])[]): string {
    const cols = columns.map((c, i) => {
        const kind = sampleRows[0]?.[i]?.kind;
        const samples = sampleRows.map(r => cellText(r[i] ?? { kind: "loading", allowOverlay: false } as GridCell)).filter(s => s !== "").slice(0, 3);
        return `- "${c.title}" (${KIND_NAMES[kind ?? "text"] ?? "text"})${samples.length > 0 ? ` e.g. ${samples.map(s => JSON.stringify(s)).join(", ")}` : ""}`;
    });
    return [
        `Translate this search into a filter over a table. Query: ${JSON.stringify(query)}`,
        "Columns:",
        ...cols,
        'Reply with ONLY JSON: {"conjunction": "and"|"or", "clauses": [{"column": "<column title>", "op": <op>, "value": <value>}]}',
        `Allowed ops: contains, notContains, eq, neq, gt, gte, lt, lte, startsWith, endsWith, empty, notEmpty, in (value is an array).`,
        "Use column titles exactly as listed. Dates as ISO strings. If the query is just a word to look for, use contains on the most likely column.",
    ].join("\n");
}
