import * as React from "react";
import type { FilterClause } from "../filter-spec.js";
import type { FilterField } from "../types.js";
import { clauseMatchesField } from "./evaluate.js";
import type { UseGridFiltersResult } from "./use-grid-filters.js";

const OP_LABEL: Record<string, string> = {
    contains: "contains",
    notContains: "does not contain",
    startsWith: "starts with",
    endsWith: "ends with",
    eq: "=",
    neq: "≠",
    gt: ">",
    gte: "≥",
    lt: "<",
    lte: "≤",
    empty: "is empty",
    notEmpty: "is not empty",
    in: ":",
};

function labelOf(field: FilterField, value: string): string {
    return field.labels?.[value] ?? value;
}

function formatValue(value: FilterClause["value"], field: FilterField): string {
    if (value === undefined) return "";
    if (Array.isArray(value)) return value.map(v => labelOf(field, String(v))).join(", ");
    if (typeof value === "boolean") return value ? "true" : "false";
    return labelOf(field, String(value));
}

export function clausesForField(specClauses: readonly FilterClause[], field: FilterField): FilterClause[] {
    return specClauses.filter(c => clauseMatchesField(c, field));
}

export function summarizeField(field: FilterField, specClauses: readonly FilterClause[]): string | undefined {
    const clauses = clausesForField(specClauses, field);
    if (clauses.length === 0) return undefined;
    const gte = clauses.find(c => c.op === "gte");
    const lte = clauses.find(c => c.op === "lte");
    if (gte !== undefined && lte !== undefined && clauses.length === 2) {
        return `${field.title} ${formatValue(gte.value, field)}–${formatValue(lte.value, field)}`;
    }
    if (clauses.length === 1) {
        const c = clauses[0];
        if (c.op === "in") return `${field.title}: ${formatValue(c.value, field)}`;
        if (c.op === "empty" || c.op === "notEmpty") return `${field.title} ${OP_LABEL[c.op]}`;
        if (c.op === "eq" && field.kind === "boolean") return `${field.title}: ${formatValue(c.value, field)}`;
        const op = OP_LABEL[c.op] ?? c.op;
        const v = formatValue(c.value, field);
        return v === "" ? `${field.title} ${op}` : `${field.title} ${op} ${v}`;
    }
    return `${field.title} (${clauses.length})`;
}

export interface FilterRailState {
    readonly fields: readonly FilterField[];
    readonly openKey: string | undefined;
    readonly open: (key: string) => void;
    readonly close: () => void;
    readonly toggle: (key: string) => void;
    readonly summary: (key: string) => string | undefined;
    readonly isActive: (key: string) => boolean;
    readonly clearField: (key: string) => void;
    readonly clearAll: () => void;
    readonly hasActive: boolean;
    readonly truncated: boolean;
    readonly matched: number;
    readonly fieldByKey: (key: string) => FilterField | undefined;
    readonly clauses: (key: string) => readonly FilterClause[];
}

export function useFilterRailState(filters: UseGridFiltersResult): FilterRailState {
    const [openKey, setOpenKey] = React.useState<string | undefined>(undefined);
    const open = React.useCallback((key: string) => setOpenKey(key), []);
    const close = React.useCallback(() => setOpenKey(undefined), []);
    const toggle = React.useCallback((key: string) => {
        setOpenKey(current => (current === key ? undefined : key));
    }, []);

    const summary = React.useCallback(
        (key: string) => {
            const field = filters.fields.find(f => f.key === key);
            if (field === undefined) return undefined;
            return summarizeField(field, filters.spec.clauses);
        },
        [filters.fields, filters.spec.clauses]
    );

    const isActive = React.useCallback(
        (key: string) => {
            const field = filters.fields.find(f => f.key === key);
            if (field === undefined) return false;
            return clausesForField(filters.spec.clauses, field).length > 0;
        },
        [filters.fields, filters.spec.clauses]
    );

    const clearField = React.useCallback(
        (key: string) => {
            filters.setClause(key, undefined);
        },
        [filters]
    );

    const fieldByKey = React.useCallback((key: string) => filters.fields.find(f => f.key === key), [filters.fields]);

    const clauses = React.useCallback(
        (key: string) => {
            const field = filters.fields.find(f => f.key === key);
            if (field === undefined) return [];
            return clausesForField(filters.spec.clauses, field);
        },
        [filters.fields, filters.spec.clauses]
    );

    return {
        fields: filters.fields,
        openKey,
        open,
        close,
        toggle,
        summary,
        isActive,
        clearField,
        clearAll: filters.clear,
        hasActive: filters.spec.clauses.length > 0,
        truncated: filters.truncated,
        matched: filters.matched,
        fieldByKey,
        clauses,
    };
}
