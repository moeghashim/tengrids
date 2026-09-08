import type { GridCell, GridColumn } from "tengrids";
import { GridCellKind } from "tengrids";

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

const NUMBER_WORDS: Record<string, number> = {
    zero: 0,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
    thirteen: 13,
    fourteen: 14,
    fifteen: 15,
    sixteen: 16,
    seventeen: 17,
    eighteen: 18,
    nineteen: 19,
    twenty: 20,
    thirty: 30,
    forty: 40,
    fifty: 50,
    sixty: 60,
    seventy: 70,
    eighty: 80,
    ninety: 90,
    hundred: 100,
    thousand: 1000,
    million: 1_000_000,
    billion: 1_000_000_000,
};

const SUFFIX: Record<string, number> = { k: 1e3, m: 1e6, b: 1e9, bn: 1e9, mm: 1e6 };

/** Local copy of tengrids-ai's parseNumber so evaluation stays identical after the move. */
function parseNumber(text: string): number | undefined {
    let s = text.trim().toLowerCase();
    if (s === "") return undefined;
    const direct = Number(s);
    if (!Number.isNaN(direct) && /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/.test(s)) return direct;

    let negative = false;
    if (/^\(.*\)$/.test(s)) {
        negative = true;
        s = s.slice(1, -1).trim();
    }
    s = s.replace(/^[-−–]/, m => {
        negative = !negative || m === "";
        return "";
    });
    s = s.replace(/^\+/, "");
    s = s.replace(/^[$€£¥₹]\s*/, "").replace(/\s*(usd|eur|gbp|%|percent)$/, "");
    s = s.replace(/,/g, "").replace(/\s+/g, " ").trim();

    const suffixed = /^(\d+\.?\d*|\.\d+)\s*(k|m|b|bn|mm|thousand|million|billion)$/.exec(s);
    if (suffixed !== null) {
        const mult = SUFFIX[suffixed[2]] ?? NUMBER_WORDS[suffixed[2]];
        const n = Number(suffixed[1]) * mult;
        return negative ? -n : n;
    }
    const plain = Number(s);
    if (!Number.isNaN(plain) && s !== "") return negative ? -plain : plain;

    const words = s.split(/[\s-]+/);
    if (words.length > 0 && words.every(w => w in NUMBER_WORDS)) {
        let total = 0;
        let current = 0;
        for (const w of words) {
            const v = NUMBER_WORDS[w];
            if (v === 100) current = Math.max(current, 1) * 100;
            else if (v >= 1000) {
                total += Math.max(current, 1) * v;
                current = 0;
            } else current += v;
        }
        const n = total + current;
        return negative ? -n : n;
    }
    return undefined;
}

function cellText(cell: GridCell): string {
    switch (cell.kind) {
        case GridCellKind.Text:
        case GridCellKind.Number:
        case GridCellKind.Uri:
            return cell.displayData ?? (cell.data === undefined ? "" : String(cell.data));
        case GridCellKind.Markdown:
        case GridCellKind.RowID:
            return cell.data ?? "";
        case GridCellKind.Boolean:
            return cell.data === true ? "true" : cell.data === false ? "false" : "";
        case GridCellKind.Bubble:
        case GridCellKind.Image:
            return cell.data.join(", ");
        case GridCellKind.Drilldown:
            return cell.data.map(d => d.text).join(", ");
        case GridCellKind.Custom:
            return cell.copyData ?? "";
        case GridCellKind.Loading:
        case GridCellKind.Protected:
            return "";
        default:
            return "";
    }
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
export function evaluateFilter(
    spec: FilterSpec,
    columns: readonly GridColumn[],
    rowCells: readonly GridCell[]
): boolean {
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
