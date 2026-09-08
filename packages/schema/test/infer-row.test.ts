import { describe, expect, it } from "vitest";
import { col, createSchema, type InferRow } from "../src/index.js";

const schema = createSchema({
    name: col.text({ title: "Name", width: 160 }),
    cost: col.number({ title: "Cost", format: "currency", currency: "USD", width: 110 }),
    status: col.enum({ title: "Status", values: ["draft", "active", "closed"] as const }),
    due: col.date({ title: "Due" }),
    paid: col.boolean({ title: "Paid" }),
    site: col.uri({ title: "Website" }),
    notes: col.markdown({ title: "Notes", readonly: true }),
});

type Row = InferRow<typeof schema>;
type Expected = {
    name: string;
    cost: number;
    status: "draft" | "active" | "closed";
    due: Date | undefined;
    paid: boolean;
    site: string;
    notes: string;
};

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Assert<T extends true> = T;

export type _InferRowMatchesDocumentedType = Assert<Equal<Row, Expected>>;

describe("InferRow type-level contract (A1)", () => {
    it("assigns the documented row shape", () => {
        const row: Row = {
            name: "Ada",
            cost: 1,
            status: "active",
            due: undefined,
            paid: true,
            site: "https://example.com",
            notes: "ok",
        };
        const expected: Expected = row;
        expect(expected.name).toBe("Ada");
        expect(expected.status).toBe("active");
    });
});
