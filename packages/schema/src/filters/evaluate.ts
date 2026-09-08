import { GridCellKind, type DataEditorProps, type GridCell, type GridColumn } from "tengrids";
import {
    asNumber,
    findColumnIndex,
    matchesClause,
    matchesClauseParsed,
    parsedCellNumber,
    type FilterClause,
    type FilterOp,
    type FilterSpec,
} from "../filter-spec.js";
import type { FilterField } from "../types.js";
import { forEachFacetString, numericValue } from "./cell-value.js";

export type ValueFacet = {
    readonly kind: "values";
    readonly values: readonly { readonly value: string; readonly count: number }[];
};

export type RangeFacet = {
    readonly kind: "range";
    readonly min: number;
    readonly max: number;
};

export type Facet = ValueFacet | RangeFacet;

export interface EvaluateGridResult {
    readonly mapping: readonly number[];
    readonly facets: ReadonlyMap<string, Facet>;
    readonly truncated: boolean;
    readonly matched: number;
}

const TEXT_FEW_VALUES = 64;

export function clauseMatchesField(clause: FilterClause, field: FilterField): boolean {
    const key = clause.column.trim().toLowerCase();
    return field.key.toLowerCase() === key || field.title.toLowerCase() === key;
}

function isRangeKind(kind: FilterField["kind"]): boolean {
    return kind === "number" || kind === "date";
}

function isAlwaysValuesKind(kind: FilterField["kind"]): boolean {
    return kind === "enum" || kind === "boolean";
}

interface PreparedClause {
    readonly clause: FilterClause;
    readonly parsed: number | undefined;
    readonly inParsed: readonly (number | undefined)[] | undefined;
}

function prepareClause(clause: FilterClause): PreparedClause {
    const v = clause.value;
    if (clause.op === "in") {
        const list = Array.isArray(v) ? v : v === undefined ? [] : [v];
        return { clause, parsed: undefined, inParsed: list.map(asNumber) };
    }
    return { clause, parsed: asNumber(v), inParsed: undefined };
}

function matchNumberData(n: number, op: FilterOp, prep: PreparedClause): boolean | undefined {
    switch (op) {
        case "eq":
            return prep.parsed === undefined ? undefined : n === prep.parsed;
        case "neq":
            return prep.parsed === undefined ? undefined : n !== prep.parsed;
        case "gt":
            return prep.parsed === undefined ? undefined : n > prep.parsed;
        case "gte":
            return prep.parsed === undefined ? undefined : n >= prep.parsed;
        case "lt":
            return prep.parsed === undefined ? undefined : n < prep.parsed;
        case "lte":
            return prep.parsed === undefined ? undefined : n <= prep.parsed;
        case "in": {
            if (prep.inParsed === undefined) return undefined;
            let allNumeric = true;
            for (const p of prep.inParsed) {
                if (p === undefined) allNumeric = false;
                else if (p === n) return true;
            }
            return allNumeric ? false : undefined;
        }
        default:
            return undefined;
    }
}

/** `in` against each displayed enum/bubble item, not the joined cell text. */
function matchesEnumIn(cell: GridCell, clause: FilterClause, field: FilterField): boolean {
    const list = Array.isArray(clause.value) ? clause.value : clause.value === undefined ? [] : [clause.value];
    const sub: FilterClause = { column: clause.column, op: "in", value: list };
    let hit = false;
    forEachFacetString(cell, field, item => {
        if (hit) return;
        const fake: GridCell = { kind: GridCellKind.Text, data: item, displayData: item, allowOverlay: false };
        if (matchesClause(fake, sub)) hit = true;
    });
    return hit;
}

export function matchesEvaluatorClause(
    cell: GridCell,
    clause: FilterClause,
    field: FilterField | undefined,
    prep?: PreparedClause,
    parsedText?: { readonly value: number | undefined }
): boolean {
    if (
        field !== undefined &&
        field.kind === "enum" &&
        clause.op === "in" &&
        (field.multiple === true || cell.kind === GridCellKind.Bubble)
    ) {
        return matchesEnumIn(cell, clause, field);
    }
    const ready = prep ?? prepareClause(clause);
    if (cell.kind === GridCellKind.Number && typeof cell.data === "number" && Number.isFinite(cell.data)) {
        const display = cell.displayData;
        if (display === undefined || display === String(cell.data)) {
            const fast = matchNumberData(cell.data, clause.op, ready);
            if (fast !== undefined) return fast;
        }
    }
    if (
        cell.kind === GridCellKind.Boolean &&
        (clause.op === "eq" || clause.op === "neq") &&
        typeof clause.value === "boolean"
    ) {
        const eq = cell.data === clause.value;
        return clause.op === "eq" ? eq : !eq;
    }
    return matchesClauseParsed(cell, clause, parsedText !== undefined ? parsedText.value : parsedCellNumber(cell));
}

/**
 * One synchronous pass over `min(rows, maxRows)`: row mapping plus facet counts.
 * Facet counts apply every clause except the field's own.
 */
export function evaluateGridFilters(
    spec: FilterSpec,
    fields: readonly FilterField[],
    columns: readonly GridColumn[],
    rows: number,
    getCellContent: DataEditorProps["getCellContent"],
    maxRows: number
): EvaluateGridResult {
    const limit = Math.min(rows, maxRows);
    const truncated = rows > maxRows;
    const mapping: number[] = [];
    const conjOr = spec.conjunction === "or";

    const clauseCols = spec.clauses.map(c => findColumnIndex(columns, c.column));
    const clauseFields = spec.clauses.map(c => fields.find(f => clauseMatchesField(c, f)));
    const prepared = spec.clauses.map(prepareClause);
    const fieldCols = fields.map(f => {
        const byKey = findColumnIndex(columns, f.key);
        return byKey === -1 ? findColumnIndex(columns, f.title) : byKey;
    });
    const ownMask = fields.map(f => spec.clauses.map(c => clauseMatchesField(c, f)));

    const valueAcc: Array<Map<string, number> | undefined> = fields.map(f =>
        isRangeKind(f.kind) ? undefined : new Map()
    );
    const rangeAcc: Array<{ min: number; max: number } | undefined> = fields.map(() => undefined);
    const overflow: boolean[] = fields.map(() => false);

    const scratch: GridCell[] = new Array(columns.length);
    const hits: boolean[] = new Array(spec.clauses.length);
    const fetched: boolean[] = new Array(columns.length);
    const parsedReady: boolean[] = new Array(columns.length);
    const parsedOf: Array<number | undefined> = new Array(columns.length);

    for (let r = 0; r < limit; r++) {
        for (let c = 0; c < columns.length; c++) {
            fetched[c] = false;
            parsedReady[c] = false;
        }
        for (let i = 0; i < clauseCols.length; i++) {
            const idx = clauseCols[i];
            if (idx !== -1 && fetched[idx] !== true) {
                scratch[idx] = getCellContent([idx, r]);
                fetched[idx] = true;
            }
        }
        for (let f = 0; f < fields.length; f++) {
            if (overflow[f]) continue;
            const idx = fieldCols[f];
            if (idx !== -1 && fetched[idx] !== true) {
                scratch[idx] = getCellContent([idx, r]);
                fetched[idx] = true;
            }
        }

        let fullAnd = true;
        let fullOr = false;
        for (let i = 0; i < spec.clauses.length; i++) {
            const idx = clauseCols[i];
            const cell = idx === -1 ? undefined : scratch[idx];
            let parsed: number | undefined;
            if (cell !== undefined && idx !== -1) {
                if (parsedReady[idx] !== true) {
                    parsedOf[idx] = parsedCellNumber(cell);
                    parsedReady[idx] = true;
                }
                parsed = parsedOf[idx];
            }
            const hit =
                cell !== undefined &&
                matchesEvaluatorClause(cell, spec.clauses[i], clauseFields[i], prepared[i], {
                    value: parsed,
                });
            hits[i] = hit;
            if (hit) fullOr = true;
            else fullAnd = false;
        }
        const full = spec.clauses.length === 0 ? true : conjOr ? fullOr : fullAnd;
        if (full) mapping.push(r);

        for (let f = 0; f < fields.length; f++) {
            const own = ownMask[f];
            let otherCount = 0;
            let otherAny = false;
            let otherAll = true;
            for (let i = 0; i < hits.length; i++) {
                if (own[i] === true) continue;
                otherCount++;
                if (hits[i]) otherAny = true;
                else otherAll = false;
            }
            const matchOthers = otherCount === 0 ? true : conjOr ? otherAny : otherAll;
            if (!matchOthers) continue;

            const colIdx = fieldCols[f];
            if (colIdx === -1) continue;
            const cell = scratch[colIdx];
            const field = fields[f];
            if (isRangeKind(field.kind)) {
                const n = numericValue(cell);
                if (n === undefined) continue;
                const acc = rangeAcc[f];
                if (acc === undefined) rangeAcc[f] = { min: n, max: n };
                else {
                    if (n < acc.min) acc.min = n;
                    if (n > acc.max) acc.max = n;
                }
            } else {
                const acc = valueAcc[f];
                if (acc === undefined || overflow[f]) continue;
                forEachFacetString(cell, field, v => {
                    acc.set(v, (acc.get(v) ?? 0) + 1);
                });
                if (!isAlwaysValuesKind(field.kind) && acc.size > TEXT_FEW_VALUES) overflow[f] = true;
            }
        }
    }

    const facets = new Map<string, Facet>();
    for (let f = 0; f < fields.length; f++) {
        const field = fields[f];
        if (isRangeKind(field.kind)) {
            const acc = rangeAcc[f];
            if (acc !== undefined) facets.set(field.key, { kind: "range", min: acc.min, max: acc.max });
            continue;
        }
        const acc = valueAcc[f];
        if (acc === undefined) continue;
        if (!isAlwaysValuesKind(field.kind) && acc.size > TEXT_FEW_VALUES) continue;
        const counts = new Map(acc);
        if (field.kind === "enum" && field.values !== undefined) {
            for (const v of field.values) {
                if (!counts.has(v)) counts.set(v, 0);
            }
        }
        if (field.kind === "boolean") {
            if (!counts.has("true")) counts.set("true", 0);
            if (!counts.has("false")) counts.set("false", 0);
        }
        const values = [...counts.entries()]
            .map(([value, count]) => ({ value, count }))
            .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
        facets.set(field.key, { kind: "values", values });
    }

    return { mapping, facets, truncated, matched: mapping.length };
}

export function columnsFromFields(fields: readonly FilterField[]): GridColumn[] {
    return fields.map(f => ({ id: f.key, title: f.title, width: 1 }));
}
