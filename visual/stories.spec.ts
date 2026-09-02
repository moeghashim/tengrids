import { expect, test } from "@playwright/test";

// A handful of deterministic DataEditor demos. The mock data is faker-seeded,
// so the rendered text is stable; stories whose fixtures use Math.random()
// (Boolean cells, loading skeletons) are deliberately not on this list.
const STORIES = [
    "glide-data-grid-dataeditor-demos--add-columns",
    "glide-data-grid-dataeditor-demos--add-data",
    "glide-data-grid-dataeditor-demos--column-groups",
    "glide-data-grid-dataeditor-demos--freeze-columns",
    "glide-data-grid-dataeditor-demos--automatic-row-markers",
    "glide-data-grid-dataeditor-demos--theme-per-row",
];

for (const id of STORIES) {
    test(id, async ({ page }) => {
        // Demo avatars come from picsum.photos — remote, rate-limited, and
        // irrelevant to the grid's own rendering. Block them for stable pixels.
        await page.route(/picsum\.photos/, route => route.abort());
        await page.goto(`/iframe.html?id=${id}&viewMode=story`);
        await page.locator("canvas").first().waitFor();
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(750); // let the grid's rAF/image passes settle
        await expect(page).toHaveScreenshot(`${id}.png`);
    });
}
