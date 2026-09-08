import { describe, expect, it } from "vitest";
import { EXAMPLE_SCHEMA, scaffold, splitScaffoldFiles, SchemaInputSchema } from "../src/scaffold.js";

describe("scaffold snapshots", () => {
    it("react default", () => {
        expect(scaffold({ schema: EXAMPLE_SCHEMA })).toMatchSnapshot();
    });

    it("react + filters", () => {
        expect(scaffold({ schema: EXAMPLE_SCHEMA, filters: true })).toMatchSnapshot();
    });

    it("react + ai", () => {
        expect(scaffold({ schema: EXAMPLE_SCHEMA, ai: true })).toMatchSnapshot();
    });

    it("react + filters + ai", () => {
        expect(scaffold({ schema: EXAMPLE_SCHEMA, filters: true, ai: true })).toMatchSnapshot();
    });

    it("next default", () => {
        expect(scaffold({ schema: EXAMPLE_SCHEMA, framework: "next" })).toMatchSnapshot();
    });

    it("next + filters", () => {
        expect(scaffold({ schema: EXAMPLE_SCHEMA, filters: true, framework: "next" })).toMatchSnapshot();
    });

    it("next + ai", () => {
        expect(scaffold({ schema: EXAMPLE_SCHEMA, ai: true, framework: "next" })).toMatchSnapshot();
    });

    it("next + filters + ai", () => {
        expect(scaffold({ schema: EXAMPLE_SCHEMA, filters: true, ai: true, framework: "next" })).toMatchSnapshot();
    });
});

describe("scaffold contents", () => {
    it("uses schema.print() output", () => {
        const text = scaffold({ schema: EXAMPLE_SCHEMA });
        expect(text).toContain("col.text");
        expect(text).toContain("col.number");
        expect(text).toContain("col.enum");
        expect(text).toContain('import "tengrids/dist/index.css"');
        expect(text).toContain("useSchemaGrid");
    });

    it("next output splits into two files including ssr: false", () => {
        const text = scaffold({ schema: EXAMPLE_SCHEMA, framework: "next" });
        const files = splitScaffoldFiles(text);
        expect(files.map(f => f.path)).toEqual(["components/ScaffoldGrid.tsx", "pages/scaffold-scratch.tsx"]);
        expect(files[1]?.content).toContain("ssr: false");
        expect(files[1]?.content).toContain("next/dynamic");
    });

    it("rejects custom columns at the schema boundary", () => {
        expect(SchemaInputSchema.safeParse({ x: { kind: "custom" } }).success).toBe(false);
    });

    it("throws when enum values are missing at print time", () => {
        expect(() =>
            scaffold({
                schema: { status: { kind: "enum", title: "Status" } },
            })
        ).toThrow(/values/u);
    });
});
