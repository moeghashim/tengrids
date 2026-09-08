import { describe, expect, it } from "vitest";
import { GridCellKind, type GridCell, type GridColumn, type Item } from "tengrids";
import type { FilterField, FilterSpec } from "../src/index.js";
import { clauseMatchesField, columnsFromFields, evaluateGridFilters } from "../src/index.js";

const fields: FilterField[] = [
    { key: "name", title: "Name", kind: "text" },
    { key: "n", title: "N", kind: "number" },
];
const columns: GridColumn[] = [
    { id: "name", title: "Name", width: 1 },
    { id: "n", title: "N", width: 1 },
];

function get([col, row]: Item): GridCell {
    if (col === 0) {
        const s = `v${row % 3}`;
        return { kind: GridCellKind.Text, data: s, displayData: s, allowOverlay: false };
    }
    return { kind: GridCellKind.Number, data: row, displayData: String(row), allowOverlay: false };
}

describe("evaluateGridFilters", () => {
    it("maps matching rows and reports matched", () => {
        const spec: FilterSpec = { clauses: [{ column: "name", op: "eq", value: "v1" }] };
        const r = evaluateGridFilters(spec, fields, columns, 6, get, 6);
        expect(r.mapping).toEqual([1, 4]);
        expect(r.matched).toBe(2);
        expect(r.truncated).toBe(false);
    });

    it("truncates evaluation at maxRows", () => {
        const spec: FilterSpec = { clauses: [{ column: "n", op: "gte", value: 0 }] };
        const r = evaluateGridFilters(spec, fields, columns, 10, get, 3);
        expect(r.truncated).toBe(true);
        expect(r.mapping).toEqual([0, 1, 2]);
    });

    it("empty spec matches every evaluated row", () => {
        const r = evaluateGridFilters({ clauses: [] }, fields, columns, 4, get, 4);
        expect(r.mapping).toEqual([0, 1, 2, 3]);
    });

    it("unknown columns never match a clause", () => {
        const spec: FilterSpec = { clauses: [{ column: "missing", op: "eq", value: "x" }] };
        const r = evaluateGridFilters(spec, fields, columns, 3, get, 3);
        expect(r.mapping).toEqual([]);
    });

    it("or conjunction keeps a row if any clause hits", () => {
        const spec: FilterSpec = {
            conjunction: "or",
            clauses: [
                { column: "name", op: "eq", value: "v0" },
                { column: "n", op: "eq", value: 1 },
            ],
        };
        const r = evaluateGridFilters(spec, fields, columns, 3, get, 3);
        expect(r.mapping).toEqual([0, 1]);
    });

    it("synthesizes columns from fields", () => {
        const cols = columnsFromFields(fields);
        expect(cols.map(c => c.id)).toEqual(["name", "n"]);
    });

    it("clauseMatchesField is case-insensitive on key and title", () => {
        expect(clauseMatchesField({ column: "NAME", op: "eq" }, fields[0])).toBe(true);
        expect(clauseMatchesField({ column: "n", op: "eq" }, fields[1])).toBe(true);
        expect(clauseMatchesField({ column: "nope", op: "eq" }, fields[0])).toBe(false);
    });

    it("omits text facets when there are too many unique values", () => {
        const many: FilterField[] = [{ key: "name", title: "Name", kind: "text" }];
        const cols: GridColumn[] = [{ id: "name", title: "Name", width: 1 }];
        const getUnique = ([, row]: Item): GridCell => ({
            kind: GridCellKind.Text,
            data: `u${row}`,
            displayData: `u${row}`,
            allowOverlay: false,
        });
        const r = evaluateGridFilters({ clauses: [] }, many, cols, 80, getUnique, 80);
        expect(r.facets.has("name")).toBe(false);
    });

    it("matches multi-value enum rows against individual facet values", () => {
        const enumFields: FilterField[] = [
            { key: "tags", title: "Tags", kind: "enum", values: ["draft", "active"], multiple: true },
        ];
        const cols: GridColumn[] = [{ id: "tags", title: "Tags", width: 1 }];
        const rows = [["draft", "active"], ["draft"], ["active"]];
        const getCell = ([, row]: Item): GridCell => ({
            kind: GridCellKind.Bubble,
            data: rows[row],
            allowOverlay: false,
        });
        const spec: FilterSpec = { clauses: [{ column: "tags", op: "in", value: ["active"] }] };
        const r = evaluateGridFilters(spec, enumFields, cols, 3, getCell, 3);
        expect(r.mapping).toEqual([0, 2]);
        const facet = r.facets.get("tags");
        expect(facet?.kind).toBe("values");
        if (facet?.kind !== "values") return;
        const byVal = Object.fromEntries(facet.values.map(v => [v.value, v.count]));
        expect(byVal.active).toBe(2);
        expect(byVal.draft).toBe(2);
    });
});
