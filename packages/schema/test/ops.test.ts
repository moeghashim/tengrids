import { describe, expect, it } from "vitest";
import { FILTER_OPS, FILTER_OPS_BY_KIND, isFilterOp, isOpAllowed } from "../src/index.js";

describe("filter ops table", () => {
    it("lists every FilterOp", () => {
        expect(FILTER_OPS).toEqual([
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
    });

    it("isFilterOp accepts known ops and rejects junk", () => {
        expect(isFilterOp("contains")).toBe(true);
        expect(isFilterOp("in")).toBe(true);
        expect(isFilterOp("between")).toBe(false);
        expect(isFilterOp("")).toBe(false);
        expect(isFilterOp("EQ")).toBe(false);
    });

    it("text/uri allow string ops, not in/gt", () => {
        for (const kind of ["text", "uri"] as const) {
            expect(isOpAllowed(kind, "contains")).toBe(true);
            expect(isOpAllowed(kind, "startsWith")).toBe(true);
            expect(isOpAllowed(kind, "eq")).toBe(true);
            expect(isOpAllowed(kind, "empty")).toBe(true);
            expect(isOpAllowed(kind, "in")).toBe(false);
            expect(isOpAllowed(kind, "gt")).toBe(false);
            expect(isOpAllowed(kind, "neq")).toBe(false);
        }
    });

    it("number/date allow compares, not contains/in", () => {
        for (const kind of ["number", "date"] as const) {
            expect(isOpAllowed(kind, "gte")).toBe(true);
            expect(isOpAllowed(kind, "neq")).toBe(true);
            expect(isOpAllowed(kind, "empty")).toBe(true);
            expect(isOpAllowed(kind, "contains")).toBe(false);
            expect(isOpAllowed(kind, "in")).toBe(false);
        }
    });

    it("boolean allows eq and empty only", () => {
        expect(FILTER_OPS_BY_KIND.boolean).toEqual(["eq", "empty"]);
        expect(isOpAllowed("boolean", "eq")).toBe(true);
        expect(isOpAllowed("boolean", "neq")).toBe(false);
        expect(isOpAllowed("boolean", "in")).toBe(false);
    });

    it("enum allows in, neq, empty, notEmpty", () => {
        expect(isOpAllowed("enum", "in")).toBe(true);
        expect(isOpAllowed("enum", "neq")).toBe(true);
        expect(isOpAllowed("enum", "contains")).toBe(false);
        expect(isOpAllowed("enum", "eq")).toBe(false);
    });
});
