import { describe, expect, it } from "vitest";
import { GridCellKind, type GridCell, type GridColumn } from "tengrids";
import { buildQueryPrompt, evaluateFilter, literalMatches, matchesClause, parseFilterSpec, specColumns } from "../src/nl-query.js";

const t = (s: string): GridCell => ({ kind: GridCellKind.Text, data: s, displayData: s, allowOverlay: false });
const n = (v: number): GridCell => ({ kind: GridCellKind.Number, data: v, displayData: String(v), allowOverlay: false });
const b = (v: boolean): GridCell => ({ kind: GridCellKind.Boolean, data: v, allowOverlay: false });
const columns: GridColumn[] = [{ title: "Name", width: 1 }, { title: "Dept", id: "dept", width: 1 }, { title: "Age", width: 1 }, { title: "Hired", width: 1 }, { title: "Active", width: 1 }];
const row = [t("Ada Lovelace"), t("Engineering"), n(36), t("2023-04-01"), b(true)];

describe("parseFilterSpec", () => {
    it("accepts well-formed specs, aliases, and fenced output", () => {
        const spec = parseFilterSpec('```json\n{"conjunction":"or","clauses":[{"column":"Dept","op":"is","value":"Engineering"},{"column":"Age","op":">","value":30}]}\n```');
        expect(spec).toEqual({ conjunction: "or", clauses: [{ column: "Dept", op: "eq", value: "Engineering" }, { column: "Age", op: "gt", value: 30 }] });
    });
    it("accepts a bare clause array and drops invalid clauses", () => {
        const spec = parseFilterSpec('[{"column":"Name","op":"contains","value":"ada"},{"column":"Name","op":"bogus"},{"op":"eq"}]');
        expect(spec).toEqual({ conjunction: "and", clauses: [{ column: "Name", op: "contains", value: "ada" }] });
    });
    it("returns undefined for garbage or empty", () => {
        expect(parseFilterSpec("no json")).toBeUndefined();
        expect(parseFilterSpec('{"clauses":[]}')).toBeUndefined();
        expect(parseFilterSpec('{"clauses":[{"column":"x","op":"nope"}]}')).toBeUndefined();
    });
});

describe("matchesClause", () => {
    it("string ops are case-insensitive", () => {
        expect(matchesClause(t("Ada Lovelace"), { column: "", op: "contains", value: "LOVE" })).toBe(true);
        expect(matchesClause(t("Ada Lovelace"), { column: "", op: "startsWith", value: "ada" })).toBe(true);
        expect(matchesClause(t("Ada Lovelace"), { column: "", op: "endsWith", value: "lace" })).toBe(true);
        expect(matchesClause(t("Ada"), { column: "", op: "notContains", value: "z" })).toBe(true);
        expect(matchesClause(t("Ada"), { column: "", op: "eq", value: "ADA" })).toBe(true);
        expect(matchesClause(t("Ada"), { column: "", op: "neq", value: "Ada" })).toBe(false);
    });
    it("numeric and date comparisons", () => {
        expect(matchesClause(n(36), { column: "", op: "gt", value: 30 })).toBe(true);
        expect(matchesClause(n(36), { column: "", op: "lte", value: "36" })).toBe(true);
        expect(matchesClause(n(36), { column: "", op: "lt", value: "1k" })).toBe(true);
        expect(matchesClause(t("2023-04-01"), { column: "", op: "gt", value: "2022-12-31" })).toBe(true);
        expect(matchesClause(t("2023-04-01"), { column: "", op: "lt", value: "2022-12-31" })).toBe(false);
    });
    it("empty / notEmpty / in / booleans", () => {
        expect(matchesClause(t("  "), { column: "", op: "empty" })).toBe(true);
        expect(matchesClause(t("x"), { column: "", op: "notEmpty" })).toBe(true);
        expect(matchesClause(t("Sales"), { column: "", op: "in", value: ["Sales", "Ops"] })).toBe(true);
        expect(matchesClause(t("HR"), { column: "", op: "in", value: ["Sales", "Ops"] })).toBe(false);
        expect(matchesClause(b(true), { column: "", op: "eq", value: true })).toBe(true);
        expect(matchesClause(b(false), { column: "", op: "eq", value: "true" })).toBe(false);
    });
});

describe("evaluateFilter / specColumns / literalMatches", () => {
    it("and/or semantics and unknown columns", () => {
        const and = { conjunction: "and" as const, clauses: [{ column: "dept", op: "eq" as const, value: "engineering" }, { column: "Age", op: "gte" as const, value: 30 }] };
        const or = { conjunction: "or" as const, clauses: [{ column: "Dept", op: "eq" as const, value: "Sales" }, { column: "Active", op: "eq" as const, value: true }] };
        const unknown = { clauses: [{ column: "Nope", op: "eq" as const, value: 1 }] };
        expect(evaluateFilter(and, columns, row)).toBe(true);
        expect(evaluateFilter(or, columns, row)).toBe(true);
        expect(evaluateFilter(unknown, columns, row)).toBe(false);
        expect(specColumns(and, columns)).toEqual([1, 2]);
    });
    it("literalMatches returns matching column indices", () => {
        expect(literalMatches("eng", row)).toEqual([1]);
        expect(literalMatches("2023", row)).toEqual([3]);
        expect(literalMatches("", row)).toEqual([]);
        expect(literalMatches("zzz", row)).toEqual([]);
    });
    it("buildQueryPrompt lists columns with kinds and samples", () => {
        const p = buildQueryPrompt("engineers over 30", columns, [row]);
        expect(p).toContain('"engineers over 30"');
        expect(p).toContain('"Age" (number) e.g. "36"');
        expect(p).toContain('"Active" (boolean)');
        expect(p).toContain("Allowed ops");
    });
});
