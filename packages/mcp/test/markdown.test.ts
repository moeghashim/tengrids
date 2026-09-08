import { describe, expect, it } from "vitest";
import { firstExportedStory, firstTitle, parseHeadings, storyTitle, storybookSlug } from "../src/markdown.js";

describe("markdown helpers", () => {
    it("splits ATX headings", () => {
        const headings = parseHeadings("# Title\n\nintro\n\n## Section\n\nbody\n");
        expect(headings.map(h => h.heading)).toEqual(["Title", "Section"]);
        expect(headings[1]?.text).toContain("body");
    });

    it("keeps a leading block with an empty heading", () => {
        const headings = parseHeadings("preamble\n\n# Title\n");
        expect(headings[0]).toEqual({ heading: "", text: "preamble" });
    });

    it("reads the first h1", () => {
        expect(firstTitle("# Hello\n\n## Other", "x")).toBe("Hello");
        expect(firstTitle("no title", "x")).toBe("x");
    });

    it("reads a story title and export", () => {
        const src = `export default { title: "Glide-Data-Grid/Docs" };\nexport const Theming = () => null;\n`;
        expect(storyTitle(src, "fb")).toBe("Glide-Data-Grid/Docs");
        expect(firstExportedStory(src)).toBe("Theming");
        expect(storybookSlug("Glide-Data-Grid/Docs", "Theming")).toBe("glide-data-grid-docs--theming");
    });
});
