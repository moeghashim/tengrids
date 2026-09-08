import { expect, test } from "@playwright/test";

const STORIES = [
    "extra-packages-filters--in-memory-100-k",
    "extra-packages-filters--url-store",
    "extra-packages-filters--rail-default",
    "extra-packages-filters--rail-dark",
    "extra-packages-filters--rail-high-contrast",
    "extra-packages-filters--filter-and-sort",
    "extra-packages-filters--async-server",
    "extra-packages-filters--ai-filter-to-chips",
];

for (const id of STORIES) {
    test(`no pageerror: ${id}`, async ({ page }) => {
        const errors: string[] = [];
        page.on("pageerror", err => errors.push(String(err)));
        await page.goto(`/iframe.html?id=${id}&viewMode=story`);
        await page.locator('[data-testid="filter-rail"]').waitFor({ timeout: 15_000 });
        await page.waitForTimeout(250);
        expect(errors, errors.join("\n")).toEqual([]);
    });
}
