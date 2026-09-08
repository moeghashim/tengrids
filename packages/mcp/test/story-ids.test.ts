import { existsSync } from "node:fs";
import { storyNameFromExport, toId } from "storybook/internal/csf";
import { describe, expect, it } from "vitest";
import { loadBundleFromDir } from "../src/bundle.js";
import { realBundleDir } from "./helpers.js";

describe("bundled Storybook ids", () => {
    it("every story heading id matches toId(title, storyNameFromExport(name))", () => {
        expect(existsSync(realBundleDir()), "run docs-bundle / build mcp first").toBe(true);
        const bundle = loadBundleFromDir(realBundleDir());
        const stories = bundle.docs.filter(doc => doc.path.endsWith(".stories.tsx"));
        expect(stories.length).toBeGreaterThan(0);
        let compared = 0;
        for (const doc of stories) {
            const exported = doc.headings.filter(h => h.storyId !== undefined);
            for (const heading of exported) {
                const expected = toId(doc.title, storyNameFromExport(heading.heading));
                expect(heading.storyId, `${doc.path} ${heading.heading}`).toBe(expected);
                compared++;
            }
        }
        expect(compared).toBeGreaterThan(50);
    });
});
