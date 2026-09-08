import { describe, expect, it } from "vitest";
import {
    CheckSetupInputSchema,
    GetDocInputSchema,
    GetExampleInputSchema,
    ListDocsInputSchema,
    ScaffoldInputSchema,
    SearchDocsInputSchema,
    checkSetupTool,
    formatZodError,
    getDoc,
    getExample,
    listDocs,
    scaffoldTool,
    searchDocsTool,
} from "../src/tools.js";
import { EXAMPLE_SCHEMA } from "../src/scaffold.js";
import { loadFixture } from "./helpers.js";

describe("tool zod validation", () => {
    it("list_docs accepts an empty object", () => {
        expect(ListDocsInputSchema.safeParse({}).success).toBe(true);
    });

    it("list_docs rejects unknown keys", () => {
        expect(ListDocsInputSchema.safeParse({ extra: true }).success).toBe(false);
    });

    it("get_doc requires id", () => {
        expect(GetDocInputSchema.safeParse({}).success).toBe(false);
        expect(GetDocInputSchema.safeParse({ id: "api" }).success).toBe(true);
        expect(GetDocInputSchema.safeParse({ id: "" }).success).toBe(false);
    });

    it("search_docs requires query and caps limit", () => {
        expect(SearchDocsInputSchema.safeParse({ query: "x" }).success).toBe(true);
        expect(SearchDocsInputSchema.safeParse({ query: "x", limit: 0 }).success).toBe(false);
        expect(SearchDocsInputSchema.safeParse({ query: "x", limit: 51 }).success).toBe(false);
        expect(SearchDocsInputSchema.safeParse({ query: "" }).success).toBe(false);
    });

    it("get_example requires query", () => {
        expect(GetExampleInputSchema.safeParse({}).success).toBe(false);
        expect(GetExampleInputSchema.safeParse({ query: "freeze" }).success).toBe(true);
    });

    it("scaffold requires a non-empty schema of known kinds", () => {
        expect(ScaffoldInputSchema.safeParse({ schema: {} }).success).toBe(false);
        expect(ScaffoldInputSchema.safeParse({ schema: { n: { kind: "text" } } }).success).toBe(true);
        expect(ScaffoldInputSchema.safeParse({ schema: { n: { kind: "custom" } } }).success).toBe(false);
        expect(ScaffoldInputSchema.safeParse({ schema: { n: { kind: "text", accessor: true } } }).success).toBe(false);
    });

    it("check_setup requires packageJson", () => {
        expect(CheckSetupInputSchema.safeParse({}).success).toBe(false);
        expect(CheckSetupInputSchema.safeParse({ packageJson: "{}" }).success).toBe(true);
    });

    it("formatZodError mentions the path", () => {
        const parsed = GetDocInputSchema.safeParse({});
        expect(parsed.success).toBe(false);
        if (parsed.success) return;
        expect(formatZodError(parsed.error)).toMatch(/id/u);
    });
});

describe("tool error paths", () => {
    const bundle = loadFixture();

    it("list_docs lists ids", () => {
        const result = listDocs(bundle);
        expect(result.isError).toBe(false);
        expect(result.text).toContain("api");
        expect(result.text).toContain("story-core-docs-examples-freeze-columns");
    });

    it("get_doc unknown id is an error", () => {
        const result = getDoc(bundle, { id: "nope" });
        expect(result.isError).toBe(true);
        expect(result.text).toMatch(/unknown doc id/u);
    });

    it("get_doc unknown heading is an error", () => {
        const result = getDoc(bundle, { id: "api", heading: "no such heading" });
        expect(result.isError).toBe(true);
        expect(result.text).toMatch(/not found/u);
    });

    it("get_doc returns a section", () => {
        const result = getDoc(bundle, { id: "api", heading: "Prerequisites" });
        expect(result.isError).toBe(false);
        expect(result.text).toMatch(/portal/iu);
    });

    it("get_doc returns the whole document", () => {
        const result = getDoc(bundle, { id: "api" });
        expect(result.isError).toBe(false);
        expect(result.text).toContain("# API reference");
    });

    it("search_docs empty matches", () => {
        const result = searchDocsTool(bundle, { query: "zzzz-no-such-token" });
        expect(result.isError).toBe(false);
        expect(result.text).toMatch(/No matches/u);
    });

    it("get_example returns a story", () => {
        const result = getExample(bundle, { query: "FreezeColumns" });
        expect(result.isError).toBe(false);
        expect(result.text).toContain("url: https://moeghashim.github.io/tengrids/");
        expect(result.text).toContain("FreezeColumns");
    });

    it("get_example with no story is an error", () => {
        const empty = { version: "1", docs: bundle.docs.filter(d => !d.id.startsWith("story-")) };
        const result = getExample(empty, { query: "zzzz" });
        expect(result.isError).toBe(true);
    });

    it("scaffoldTool emits createSchema", () => {
        const result = scaffoldTool({ schema: EXAMPLE_SCHEMA });
        expect(result.isError).toBe(false);
        expect(result.text).toContain("createSchema");
        expect(result.text).toContain('id="portal"');
    });

    it("checkSetupTool reports missing tengrids", () => {
        const result = checkSetupTool({ packageJson: JSON.stringify({ dependencies: { react: "19.0.0" } }) });
        expect(result.isError).toBe(false);
        expect(result.text).toMatch(/tengrids is missing/u);
    });
});
