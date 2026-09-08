import type { FilterOp } from "../filter-spec.js";
import type { FilterKind } from "../types.js";

export const FILTER_OPS: readonly FilterOp[] = [
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
];

const OP_SET = new Set<string>(FILTER_OPS);

export function isFilterOp(value: string): value is FilterOp {
    return OP_SET.has(value);
}

/** Field kind → ops the rail offers and `setClause` accepts. */
export const FILTER_OPS_BY_KIND: Readonly<Record<FilterKind, readonly FilterOp[]>> = {
    text: ["contains", "notContains", "startsWith", "endsWith", "eq", "empty", "notEmpty"],
    uri: ["contains", "notContains", "startsWith", "endsWith", "eq", "empty", "notEmpty"],
    number: ["eq", "neq", "gt", "gte", "lt", "lte", "empty", "notEmpty"],
    date: ["eq", "neq", "gt", "gte", "lt", "lte", "empty", "notEmpty"],
    boolean: ["eq", "empty"],
    enum: ["in", "neq", "empty", "notEmpty"],
};

const ALLOWED = (Object.keys(FILTER_OPS_BY_KIND) as FilterKind[]).reduce(
    (acc, kind) => {
        acc[kind] = new Set(FILTER_OPS_BY_KIND[kind]);
        return acc;
    },
    {} as Record<FilterKind, Set<FilterOp>>
);

export function isOpAllowed(kind: FilterKind, op: FilterOp): boolean {
    return ALLOWED[kind].has(op);
}
