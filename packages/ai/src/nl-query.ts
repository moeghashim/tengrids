import type { GridCell, GridColumn } from "tengrids";
import {
    evaluateFilter,
    findColumnIndex,
    matchesClause,
    specColumns,
    type FilterClause,
    type FilterOp,
    type FilterSpec,
} from "tengrids-schema";
import { cellText } from "./cell-text.js";
import { extractJson } from "./json.js";

export {
    evaluateFilter,
    findColumnIndex,
    matchesClause,
    specColumns,
    type FilterClause,
    type FilterOp,
    type FilterSpec,
};

const OPS = new Set<FilterOp>([
    "contains",
    "notContains",
    "eq",
    "neq",
    "gt",
    "gte",
    "lt",
    "lte",
    "startsWith",
    "endsWith",
    "empty",
    "notEmpty",
    "in",
]);
const OP_ALIASES: Record<string, FilterOp> = {
    "=": "eq",
    "==": "eq",
    equals: "eq",
    is: "eq",
    "!=": "neq",
    "<>": "neq",
    not: "neq",
    isnot: "neq",
    ">": "gt",
    after: "gt",
    greater: "gt",
    ">=": "gte",
    "<": "lt",
    before: "lt",
    less: "lt",
    "<=": "lte",
    includes: "contains",
    like: "contains",
    has: "contains",
    excludes: "notContains",
    startswith: "startsWith",
    endswith: "endsWith",
    isempty: "empty",
    isnotempty: "notEmpty",
    oneof: "in",
    any: "in",
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
        const resolved = OPS.has(norm as FilterOp)
            ? (norm as FilterOp)
            : OP_ALIASES[norm.toLowerCase().replace(/[\s_-]/g, "")];
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
    text: "text",
    number: "number",
    boolean: "boolean",
    uri: "url",
    markdown: "text",
    bubble: "tags",
    image: "image urls",
    drilldown: "text",
    custom: "text",
    loading: "text",
    protected: "text",
    "row-id": "id",
};

/** Ask the model to compile a natural-language query into a FilterSpec. */
export function buildQueryPrompt(
    query: string,
    columns: readonly GridColumn[],
    sampleRows: readonly (readonly GridCell[])[]
): string {
    const cols = columns.map((c, i) => {
        const kind = sampleRows[0]?.[i]?.kind;
        const samples = sampleRows
            .map(r => cellText(r[i] ?? ({ kind: "loading", allowOverlay: false } as GridCell)))
            .filter(s => s !== "")
            .slice(0, 3);
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
