import { describe, expect, it } from "vitest";
import {
    firstExportedStory,
    firstTitle,
    headingWithChildren,
    parseHeadings,
    parseStoryHeadings,
    storyNameFromExport,
    storyTitle,
    storybookSlug,
} from "../src/markdown.js";

describe("markdown helpers", () => {
    it("splits ATX headings with levels", () => {
        const headings = parseHeadings("# Title\n\nintro\n\n## Section\n\nbody\n");
        expect(headings.map(h => ({ heading: h.heading, level: h.level }))).toEqual([
            { heading: "Title", level: 1 },
            { heading: "Section", level: 2 },
        ]);
        expect(headings[1]?.text).toContain("body");
    });

    it("keeps a leading block with an empty heading", () => {
        const headings = parseHeadings("preamble\n\n# Title\n");
        expect(headings[0]).toEqual({ heading: "", text: "preamble", level: 0 });
    });

    it("ignores heading-looking lines inside fenced code", () => {
        const headings = parseHeadings("# Real\n\n```\n# Fake\n```\n\n## Next\n");
        expect(headings.map(h => h.heading)).toEqual(["Real", "Next"]);
        expect(headings[0]?.text).toContain("# Fake");
    });

    it("includes nested headings through the next equal-or-shallower heading", () => {
        const headings = parseHeadings(
            "## Column factories\n\nshared\n\n### `col.text`\n\ntext docs\n\n## Generators\n\nlater\n"
        );
        const idx = headings.findIndex(h => h.heading === "Column factories");
        const block = headingWithChildren(headings, idx);
        expect(block).toContain("shared");
        expect(block).toContain("`col.text`");
        expect(block).toContain("text docs");
        expect(block).not.toContain("Generators");
    });

    it("reads the first h1", () => {
        expect(firstTitle("# Hello\n\n## Other", "x")).toBe("Hello");
        expect(firstTitle("no title", "x")).toBe("x");
    });

    it("reads a story title and skips helper exports", () => {
        const src = `export default { title: "Glide-Data-Grid/Docs" };\nexport const Frame = () => null;\nexport const Theming = () => null;\n`;
        expect(storyTitle(src, "fb")).toBe("Glide-Data-Grid/Docs");
        expect(firstExportedStory(src)).toBe("Theming");
        expect(parseStoryHeadings(src).map(h => h.heading)).toEqual(["Theming"]);
    });

    it("converts FreezeColumns to the Storybook kebab id", () => {
        expect(storyNameFromExport("FreezeColumns")).toBe("freeze-columns");
        expect(storybookSlug("Glide-Data-Grid/DataEditor Demos", "FreezeColumns")).toBe(
            "glide-data-grid-dataeditor-demos--freeze-columns"
        );
    });
});
