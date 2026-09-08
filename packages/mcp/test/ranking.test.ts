import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadBundleFromDir } from "../src/bundle.js";
import { searchDocs } from "../src/search.js";
import { realBundleDir } from "./helpers.js";

describe("C3 search ranking on the real bundle", () => {
    it("nothing shows up → API.md Prerequisites in the top 3", () => {
        expect(existsSync(realBundleDir()), "run docs-bundle / build mcp first").toBe(true);
        const bundle = loadBundleFromDir(realBundleDir());
        const hits = searchDocs(bundle, "nothing shows up", 3);
        expect(hits.some(h => h.id === "api" && /prerequisites/iu.test(h.heading))).toBe(true);
    });

    it("dark mode → theme section in the top 3", () => {
        const bundle = loadBundleFromDir(realBundleDir());
        const hits = searchDocs(bundle, "dark mode", 3);
        expect(hits.some(h => /theme/iu.test(h.heading))).toBe(true);
    });

    it("frozen columns → freezeColumns in the top 3", () => {
        const bundle = loadBundleFromDir(realBundleDir());
        const hits = searchDocs(bundle, "frozen columns", 3);
        expect(hits.some(h => /freezecolumns/iu.test(h.heading))).toBe(true);
    });
});
