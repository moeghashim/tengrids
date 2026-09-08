import { expect, test } from "@playwright/test";

const STORY = "extra-packages-filters--url-store";

test("urlStore survives reload and back/forward (B3)", async ({ page }) => {
    await page.goto(`/iframe.html?id=${STORY}&viewMode=story`);
    await page.locator('[data-testid="filter-rail"]').waitFor();
    await page.locator("canvas").first().waitFor();

    await page.getByTestId("filter-chip-status").click();
    await page.getByTestId("filter-option-status-active").click();

    await expect.poll(() => new URL(page.url()).searchParams.getAll("f").join("&")).toContain("status:in:active");

    await page.reload();
    await page.locator('[data-testid="filter-rail"]').waitFor();
    await expect(page.getByTestId("filter-chip-status")).toContainText("active");
    expect(new URL(page.url()).searchParams.getAll("f").join("&")).toContain("status:in:active");

    await page.goBack();
    await page.locator('[data-testid="filter-rail"]').waitFor();
    await expect.poll(() => page.getByTestId("filter-chip-status").textContent()).toBe("Status");

    await page.goForward();
    await page.locator('[data-testid="filter-rail"]').waitFor();
    await expect(page.getByTestId("filter-chip-status")).toContainText("active");
    expect(new URL(page.url()).searchParams.getAll("f").join("&")).toContain("status:in:active");
});
