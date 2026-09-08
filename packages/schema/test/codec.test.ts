import { describe, expect, it } from "vitest";
import type { FilterClause, FilterOp, FilterSpec } from "../src/index.js";
import { FILTER_OPS, fromQueryString, fromSearchParams, toQueryString, toSearchParams } from "../src/index.js";

function roundTripQuery(spec: FilterSpec, param = "f"): FilterSpec {
    return fromQueryString(toQueryString(spec, param), param);
}

function roundTripParams(spec: FilterSpec, param = "f"): FilterSpec {
    return fromSearchParams(toSearchParams(spec, param), param);
}

function normalize(spec: FilterSpec): FilterSpec {
    return {
        ...(spec.conjunction === "or" ? { conjunction: "or" as const } : {}),
        clauses: spec.clauses.map(c =>
            c.value === undefined ? { column: c.column, op: c.op } : { column: c.column, op: c.op, value: c.value }
        ),
    };
}

describe("URL codec", () => {
    it("encodes one readable param per clause plus fx=or", () => {
        const spec: FilterSpec = {
            conjunction: "or",
            clauses: [
                { column: "status", op: "in", value: ["draft", "active"] },
                { column: "cost", op: "gte", value: 100 },
                { column: "name", op: "contains", value: "acme" },
            ],
        };
        expect(toQueryString(spec, "f")).toBe("f=status:in:draft,active&f=cost:gte:100&f=name:contains:acme&fx=or");
        const p = toSearchParams(spec, "f");
        expect(p.getAll("f")).toEqual(["status:in:draft,active", "cost:gte:100", "name:contains:acme"]);
        expect(p.get("fx")).toBe("or");
    });

    it("keeps commas inside enum values as %2C on the wire", () => {
        const spec: FilterSpec = { clauses: [{ column: "tags", op: "in", value: ["a,b"] }] };
        expect(toQueryString(spec, "f")).toBe("f=tags:in:a%2Cb");
        expect(fromQueryString("f=tags:in:a%2Cb", "f").clauses[0]?.value).toEqual(["a,b"]);
    });

    it("URLSearchParams pair is lossless for a,b, city:id, and hi%20", () => {
        const spec: FilterSpec = {
            clauses: [
                { column: "tags", op: "in", value: ["a,b"] },
                { column: "city:id", op: "eq", value: "hi%20" },
            ],
        };
        expect(normalize(roundTripParams(spec))).toEqual(normalize(spec));
        expect(toSearchParams(spec, "f").getAll("f")[0]).toContain("%2C");
    });

    it("normalizes a scalar in-value to an array", () => {
        const spec: FilterSpec = { clauses: [{ column: "status", op: "in", value: "draft" }] };
        expect(roundTripQuery(spec).clauses[0]?.value).toEqual(["draft"]);
        expect(roundTripParams(spec).clauses[0]?.value).toEqual(["draft"]);
    });

    it("defaults conjunction to and by omitting the companion param", () => {
        const p = toSearchParams({ clauses: [{ column: "n", op: "eq", value: "x" }] }, "filter");
        expect(p.get("filterx")).toBeNull();
        expect(fromSearchParams(p, "filter").conjunction).toBeUndefined();
    });

    it("round-trips every op", () => {
        for (const op of FILTER_OPS) {
            const value: FilterClause["value"] =
                op === "empty" || op === "notEmpty" ? undefined : op === "in" ? ["a", "b"] : "v";
            const spec: FilterSpec = { clauses: [{ column: "col", op, ...(value === undefined ? {} : { value }) }] };
            expect(normalize(roundTripQuery(spec))).toEqual(normalize(spec));
        }
    });

    it("round-trips commas, colons, unicode, and empty strings", () => {
        const spec: FilterSpec = {
            clauses: [
                { column: "name", op: "contains", value: "a,b:c" },
                { column: "city:id", op: "eq", value: "São Paulo" },
                { column: "nick", op: "eq", value: "" },
                { column: "tags", op: "in", value: ["a,b", "c:d", "🦄"] },
            ],
        };
        expect(normalize(roundTripQuery(spec))).toEqual(normalize(spec));
        expect(normalize(roundTripParams(spec))).toEqual(normalize(spec));
    });

    it("round-trips numbers, booleans, and quoted ambiguous strings", () => {
        const spec: FilterSpec = {
            clauses: [
                { column: "n", op: "eq", value: 100 },
                { column: "n", op: "eq", value: 1.5 },
                { column: "b", op: "eq", value: true },
                { column: "b", op: "eq", value: false },
                { column: "s", op: "eq", value: "true" },
                { column: "s", op: "eq", value: "100" },
                { column: "s", op: "eq", value: "1e+21" },
            ],
        };
        expect(normalize(roundTripQuery(spec))).toEqual(normalize(spec));
    });

    it("ignores unknown keys and invalid ops rather than throwing", () => {
        const p = new URLSearchParams("f=status:in:draft&f=nope:between:1&f=broken&g=other:eq:1&fx=or");
        const spec = fromSearchParams(p, "f");
        expect(spec.conjunction).toBe("or");
        expect(spec.clauses).toEqual([{ column: "status", op: "in", value: ["draft"] }]);
    });

    it("tolerates hostile percent sequences and empty params", () => {
        const p = new URLSearchParams();
        p.append("f", "%");
        p.append("f", "ok:eq:x");
        p.append("f", ":eq:x");
        expect(fromSearchParams(p, "f").clauses).toEqual([{ column: "ok", op: "eq", value: "x" }]);
        expect(fromSearchParams(new URLSearchParams(), "f")).toEqual({ clauses: [] });
    });

    it("uses the given param name and companion x key", () => {
        const spec: FilterSpec = { conjunction: "or", clauses: [{ column: "a", op: "eq", value: 1 }] };
        const p = toSearchParams(spec, "filter");
        expect(p.getAll("filter")).toHaveLength(1);
        expect(p.get("filterx")).toBe("or");
        expect(roundTripQuery(spec, "filter")).toEqual(normalize(spec));
    });

    it("property: encode ∘ decode is identity for ≥ 500 generated specs", () => {
        const rand = mulberry32(0x5eed_f11e);
        const ops = FILTER_OPS as readonly FilterOp[];
        const columns = ["name", "cost", "status", "due", "paid", "site", "weird:key", "🦄"];
        const strings = ["", "acme", "a,b", "c:d", "true", "100", "1e+21", "São", "hi%20", '"quoted"', "line\nbreak"];
        let count = 0;
        for (let i = 0; i < 500; i++) {
            const n = 1 + Math.floor(rand() * 5);
            const clauses: FilterClause[] = [];
            for (let c = 0; c < n; c++) {
                const op = ops[Math.floor(rand() * ops.length)];
                const column = columns[Math.floor(rand() * columns.length)];
                clauses.push(makeClause(op, column, rand, strings));
            }
            const spec: FilterSpec = rand() < 0.3 ? { conjunction: "or", clauses } : { clauses };
            expect(normalize(roundTripQuery(spec)), `query spec ${i}`).toEqual(normalize(spec));
            expect(normalize(roundTripParams(spec)), `params spec ${i}`).toEqual(normalize(spec));
            count++;
        }
        expect(count).toBe(500);
    });
});

function mulberry32(seed: number): () => number {
    let a = seed | 0;
    return () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function makeClause(op: FilterOp, column: string, rand: () => number, strings: readonly string[]): FilterClause {
    if (op === "empty" || op === "notEmpty") return { column, op };
    if (op === "in") {
        const n = 1 + Math.floor(rand() * 3);
        const value = Array.from({ length: n }, () =>
            rand() < 0.4 ? Math.floor(rand() * 1000) : strings[Math.floor(rand() * strings.length)]
        );
        return { column, op, value };
    }
    if (op === "gt" || op === "gte" || op === "lt" || op === "lte") {
        return { column, op, value: Math.floor(rand() * 10_000) / 4 };
    }
    return { column, op, value: pickValue(rand, strings) };
}

function pickValue(rand: () => number, strings: readonly string[]): string | number | boolean {
    const t = rand();
    if (t < 0.25) return Math.floor(rand() * 1000);
    if (t < 0.4) return rand() < 0.5;
    return strings[Math.floor(rand() * strings.length)];
}
