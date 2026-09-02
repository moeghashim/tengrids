import { defineConfig } from "@playwright/test";

// Visual regression over a handful of Storybook stories. Baselines live in
// visual/__snapshots__ and are rendered on Linux inside the official Playwright
// image (mcr.microsoft.com/playwright:v<version>-noble) — the same image CI
// uses — so they are byte-comparable across machines. Regenerate them with
// `npm run visual:docker -- --update-snapshots`, never with a host-OS run.
export default defineConfig({
    testDir: "./visual",
    snapshotPathTemplate: "{testDir}/__snapshots__/{arg}{ext}",
    timeout: 60_000,
    retries: 0,
    fullyParallel: true,
    reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
    expect: {
        toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: "disabled" },
    },
    use: {
        baseURL: "http://127.0.0.1:6006",
        viewport: { width: 1200, height: 800 },
        deviceScaleFactor: 1,
        browserName: "chromium",
    },
    webServer: {
        command: "npx http-server storybook-build -p 6006 -s",
        url: "http://127.0.0.1:6006/iframe.html",
        reuseExistingServer: true,
        timeout: 60_000,
    },
});
