import { describe, expect, it } from "vitest";
import { expandQuery, indexBundle, searchDocs, tokenize } from "../src/search.js";
import { loadFixture } from "./helpers.js";

describe("search ranking on fixtures", () => {
    const bundle = loadFixture();

    it("tokenizes alphanumerics of length >= 2 and splits camelCase", () => {
        expect(tokenize("Frozen Columns!")).toEqual(["freez", "columns"]);
        expect(tokenize("freezeColumns")).toEqual(["freezecolumns", "freez", "columns"]);
        expect(tokenize("a x")).toEqual([]);
    });

    it("expands blank/nothing/invisible onto portal terms", () => {
        const tokens = expandQuery("nothing shows up");
        expect(tokens).toContain("portal");
        expect(tokens).toContain("prerequisites");
        expect(expandQuery("the grid is blank")).toContain("portal");
    });

    it("expands dark/theme/colors onto theme terms", () => {
        const tokens = expandQuery("dark mode");
        expect(tokens).toContain("theme");
        expect(tokens).toContain("theming");
    });

    it("reuses the index across queries", () => {
        expect(indexBundle(bundle)).toBe(indexBundle(bundle));
        searchDocs(bundle, "portal", 5);
        expect(indexBundle(bundle)).toBe(indexBundle(bundle));
    });

    it("ranks Prerequisites in the top 3 for nothing shows up", () => {
        const hits = searchDocs(bundle, "nothing shows up", 3);
        expect(hits.some(h => /prerequisites/iu.test(h.heading))).toBe(true);
    });

    it("ranks Theme in the top 3 for dark mode", () => {
        const hits = searchDocs(bundle, "dark mode", 3);
        expect(hits.some(h => /theme/iu.test(h.heading))).toBe(true);
    });

    it("finds freezeColumns for frozen columns", () => {
        const hits = searchDocs(bundle, "frozen columns", 5);
        expect(hits.some(h => /freezecolumns/iu.test(h.heading))).toBe(true);
    });

    it("a phrase not in the synonym table still returns sensible hits", () => {
        const hits = searchDocs(bundle, "overlay editors", 5);
        expect(hits.length).toBeGreaterThan(0);
        expect(hits.some(h => /prerequisites/iu.test(h.heading) || h.id === "api")).toBe(true);
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
