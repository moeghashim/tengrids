import { describe, expect, it } from "vitest";
import { expandQuery, searchDocs, tokenize } from "../src/search.js";
import { loadFixture } from "./helpers.js";

describe("search ranking on fixtures", () => {
    const bundle = loadFixture();

    it("tokenizes alphanumerics of length >= 2", () => {
        expect(tokenize("Frozen Columns!")).toEqual(["frozen", "columns"]);
        expect(tokenize("a x")).toEqual([]);
    });

    it("expands nothing shows up", () => {
        const tokens = expandQuery("nothing shows up");
        expect(tokens).toContain("portal");
        expect(tokens).toContain("prerequisites");
    });

    it("expands dark mode", () => {
        const tokens = expandQuery("dark mode");
        expect(tokens).toContain("theme");
        expect(tokens).toContain("dark");
    });

    it("ranks Prerequisites in the top 3 for nothing shows up", () => {
        const hits = searchDocs(bundle, "nothing shows up", 3);
        expect(hits.some(h => /prerequisites/iu.test(h.heading))).toBe(true);
    });

    it("ranks Theme in the top 3 for dark mode", () => {
        const hits = searchDocs(bundle, "dark mode", 3);
        expect(hits.some(h => /theme/iu.test(h.heading))).toBe(true);
    });

    it("finds frozen columns", () => {
        const hits = searchDocs(bundle, "frozen columns", 5);
        expect(hits[0]?.id).toBe("api");
        expect(hits[0]?.heading.toLowerCase()).toContain("freezecolumns");
    });

    it("respects limit", () => {
        const hits = searchDocs(bundle, "grid", 1);
        expect(hits.length).toBeLessThanOrEqual(1);
    });

    it("returns empty for an empty query", () => {
        expect(searchDocs(bundle, "   ", 10)).toEqual([]);
    });

    it("excerpts are at most 300 characters", () => {
        const hits = searchDocs(bundle, "portal", 5);
        for (const hit of hits) {
            expect(hit.excerpt.length).toBeLessThanOrEqual(300);
        }
    });
});
