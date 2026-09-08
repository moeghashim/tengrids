import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { GridCellKind, type GridCell, type GridColumn, type Item } from "tengrids";
import type { FilterField, FilterSpec } from "../src/index.js";
import { clauseMatchesField, columnsFromFields, evaluateGridFilters, matchesClause } from "../src/index.js";
import { matchesEvaluatorClause } from "../src/filters/evaluate.js";
import type { FilterClause } from "../src/index.js";

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

    it("numeric fast path agrees with matchesClause on mixed cells", () => {
        const num = (n: number): GridCell => ({
            kind: GridCellKind.Number,
            data: n,
            displayData: String(n),
            allowOverlay: false,
        });
        const text = (s: string): GridCell => ({
            kind: GridCellKind.Text,
            data: s,
            displayData: s,
            allowOverlay: false,
        });
        const bool = (v: boolean): GridCell => ({ kind: GridCellKind.Boolean, data: v, allowOverlay: false });
        const cells: GridCell[] = [
            num(100),
            num(1),
            text("100"),
            text("1e2"),
            text("café"),
            bool(true),
            bool(false),
            text("2023-04-01"),
            text("a01"),
            text("a1"),
            text("a\u0000"),
            text("a"),
            {
                kind: GridCellKind.Number,
                data: 1.234,
                displayData: "1.23",
                allowOverlay: false,
            },
            {
                kind: GridCellKind.Number,
                data: 0.125,
                displayData: "12.5%",
                allowOverlay: false,
            },
            { kind: GridCellKind.Number, data: 10, displayData: "", allowOverlay: false },
            {
                kind: GridCellKind.Number,
                data: 1e21,
                displayData: String(1e21),
                allowOverlay: false,
            },
            { kind: GridCellKind.Number, data: -4, displayData: "-4", allowOverlay: false },
            { kind: GridCellKind.Number, data: -4, displayData: "(4)", allowOverlay: false },
            {
                kind: GridCellKind.Number,
                data: Infinity,
                displayData: "Infinity",
                allowOverlay: false,
            },
            {
                kind: GridCellKind.Number,
                data: -Infinity,
                displayData: "-Infinity",
                allowOverlay: false,
            },
        ];
        const clauses: FilterClause[] = [
            { column: "x", op: "eq", value: 100 },
            { column: "x", op: "eq", value: "1e2" },
            { column: "x", op: "neq", value: 100 },
            { column: "x", op: "gte", value: 50 },
            { column: "x", op: "lt", value: 10 },
            { column: "x", op: "in", value: ["1e2", 100] },
            { column: "x", op: "in", value: ["cafe"] },
            { column: "x", op: "eq", value: true },
            { column: "x", op: "neq", value: false },
            { column: "x", op: "gt", value: "2022-12-31" },
            { column: "x", op: "eq", value: 1 },
            { column: "x", op: "eq", value: "a1" },
            { column: "x", op: "neq", value: "a1" },
            { column: "x", op: "in", value: ["a1"] },
            { column: "x", op: "eq", value: "a" },
            { column: "x", op: "neq", value: "a" },
            { column: "x", op: "in", value: ["a"] },
            { column: "x", op: "eq", value: 1.23 },
            { column: "x", op: "in", value: [1.23] },
            { column: "x", op: "gte", value: 12.5 },
            { column: "x", op: "eq", value: 10 },
            { column: "x", op: "eq", value: "1.23" },
            { column: "x", op: "eq", value: "12.5%" },
            { column: "x", op: "eq", value: "1e309" },
            { column: "x", op: "in", value: ["1e309"] },
            { column: "x", op: "gt", value: "one" },
            { column: "x", op: "neq", value: "1e309" },
        ];
        const numberField: FilterField = { key: "x", title: "X", kind: "number" };
        const textField: FilterField = { key: "x", title: "X", kind: "text" };
        const boolField: FilterField = { key: "x", title: "X", kind: "boolean" };
        const dateField: FilterField = { key: "x", title: "X", kind: "date" };
        for (const cell of cells) {
            const field =
                cell.kind === GridCellKind.Number
                    ? numberField
                    : cell.kind === GridCellKind.Boolean
                      ? boolField
                      : cell.kind === GridCellKind.Text && cell.data.includes("-")
                        ? dateField
                        : textField;
            for (const clause of clauses) {
                expect(
                    matchesEvaluatorClause(cell, clause, field),
                    `${cell.kind} ${JSON.stringify(cell)} vs ${clause.op} ${JSON.stringify(clause.value)}`
                ).toBe(matchesClause(cell, clause));
            }
        }
    });

    it("numeric collation and formatted numbers affect mapping and facets", () => {
        const names = ["a01", "a1", "b"];
        const cols: GridColumn[] = [{ id: "name", title: "Name", width: 1 }];
        const nameField: FilterField = { key: "name", title: "Name", kind: "text" };
        const getCell = ([, row]: Item): GridCell => {
            const s = names[row];
            return { kind: GridCellKind.Text, data: s, displayData: s, allowOverlay: false };
        };
        const spec: FilterSpec = { clauses: [{ column: "name", op: "eq", value: "a1" }] };
        const r = evaluateGridFilters(spec, [nameField], cols, 3, getCell, 3);
        expect(r.mapping).toEqual([0, 1]);
        const facet = r.facets.get("name");
        expect(facet?.kind).toBe("values");
        if (facet?.kind !== "values") return;
        const byVal = Object.fromEntries(facet.values.map(v => [v.value, v.count]));
        expect(byVal.a01).toBe(1);
        expect(byVal.a1).toBe(1);
        expect(byVal.b).toBe(1);
    });

    it("seeded ASCII pairs agree with matchesClause for eq/neq/in", () => {
        // mulberry32
        let seed = 0x9e3779b9;
        const rand = (): number => {
            seed = (seed + 0x6d2b79f5) | 0;
            let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
        const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ._-:/+*%#@!?";
        const make = (): string => {
            const len = 1 + Math.floor(rand() * 6);
            let s = "";
            for (let i = 0; i < len; i++) s += alphabet[Math.floor(rand() * alphabet.length)];
            if (rand() < 0.15) s = "0" + s;
            if (rand() < 0.1) s = " " + s;
            return s;
        };
        const textField: FilterField = { key: "x", title: "X", kind: "text" };
        for (let i = 0; i < 2000; i++) {
            const a = make();
            const b = make();
            const cell: GridCell = { kind: GridCellKind.Text, data: a, displayData: a, allowOverlay: false };
            const clauses: FilterClause[] = [
                { column: "x", op: "eq", value: b },
                { column: "x", op: "neq", value: b },
                { column: "x", op: "in", value: [b] },
                { column: "x", op: "in", value: [b, a] },
            ];
            for (const clause of clauses) {
                expect(
                    matchesEvaluatorClause(cell, clause, textField),
                    `pair ${i} ${JSON.stringify(a)} vs ${clause.op} ${JSON.stringify(clause.value)}`
                ).toBe(matchesClause(cell, clause));
            }
        }
    });

    it("Thai default locale: evaluator agrees with matchesClause on punctuation", () => {
        const helper = join(dirname(fileURLToPath(import.meta.url)), "thai-locale.mjs");
        const out = execFileSync(process.execPath, [helper], {
            encoding: "utf8",
            env: {
                ...process.env,
                LANG: "th_TH.UTF-8",
                LC_ALL: "th_TH.UTF-8",
                LC_COLLATE: "th_TH.UTF-8",
            },
        });
        const result = JSON.parse(out) as {
            rows: readonly { op: string; agree: boolean; legacy: unknown; evaluator: unknown }[];
        };
        for (const row of result.rows) {
            expect(row.agree, JSON.stringify(row)).toBe(true);
        }
    });
});
