import { describe, expect, it } from "vitest";
import {
    assertAllowedUrl,
    GITHUB_ORIGIN,
    PAGES_ORIGIN,
    REFRESH_REQUEST_MS,
    refreshBundle,
    urlsFor,
} from "../src/refresh.js";
import { loadFixture } from "./helpers.js";

describe("refresh origins", () => {
    it("allows the Pages origin under /tengrids/", () => {
        expect(assertAllowedUrl(`${PAGES_ORIGIN}/tengrids/API.md`).origin).toBe(PAGES_ORIGIN);
    });

    it("allows raw GitHub under moeghashim/tengrids", () => {
        expect(assertAllowedUrl(`${GITHUB_ORIGIN}/moeghashim/tengrids/main/README.md`).origin).toBe(GITHUB_ORIGIN);
    });

    it("rejects a bad origin", () => {
        expect(() => assertAllowedUrl("https://evil.example/tengrids/API.md")).toThrow(/blocked origin/u);
    });

    it("rejects http", () => {
        expect(() => assertAllowedUrl("http://moeghashim.github.io/tengrids/API.md")).toThrow(/protocol/u);
    });

    it("rejects a Pages path outside /tengrids/", () => {
        expect(() => assertAllowedUrl(`${PAGES_ORIGIN}/other/API.md`)).toThrow(/blocked Pages path/u);
    });

    it("rejects a GitHub path outside this repo", () => {
        expect(() => assertAllowedUrl(`${GITHUB_ORIGIN}/someone/else/main/README.md`)).toThrow(/blocked GitHub path/u);
    });
});

describe("refresh fallback", () => {
    it("maps api to Pages then GitHub", () => {
        const api = loadFixture().docs.find(d => d.id === "api");
        expect(api).toBeDefined();
        if (api === undefined) return;
        const urls = urlsFor(api);
        expect(urls[0]).toBe(`${PAGES_ORIGIN}/tengrids/API.md`);
        expect(urls.some(u => u.startsWith(GITHUB_ORIGIN))).toBe(true);
    });

    it("keeps the bundle when every fetch fails", async () => {
        const bundle = loadFixture();
        const result = await refreshBundle(bundle, async () => {
            throw new Error("network down");
        });
        expect(result.refreshed).toBe(0);
        expect(result.failed).toBeGreaterThan(0);
        expect(result.bundle.docs[0]?.text).toBe(bundle.docs[0]?.text);
    });

    it("replaces a doc when a fetch succeeds", async () => {
        const bundle = loadFixture();
        const result = await refreshBundle(bundle, async url => {
            if (url.includes("API.md")) {
                return {
                    ok: true,
                    status: 200,
                    text: async () => "# API reference\n\n## HTML/CSS Prerequisites\n\nrefreshed portal docs\n",
                };
            }
            return { ok: false, status: 404, text: async () => "" };
        });
        expect(result.refreshed).toBeGreaterThan(0);
        const api = result.bundle.docs.find(d => d.id === "api");
        expect(api?.text).toContain("refreshed portal docs");
        expect(api?.headings.some(h => h.level === 2)).toBe(true);
    });

    it("falls back when the response is not ok", async () => {
        const bundle = loadFixture();
        const result = await refreshBundle(bundle, async () => ({
            ok: false,
            status: 500,
            text: async () => "nope",
        }));
        expect(result.refreshed).toBe(0);
        expect(result.bundle.docs.map(d => d.id)).toEqual(bundle.docs.map(d => d.id));
    });

    it("aborts a stalled header fetch and keeps the bundle copy", async () => {
        const bundle = { version: "1", docs: [loadFixture().docs[0]] };
        const result = await refreshBundle(bundle, (_url, init) => {
            return new Promise((resolve, reject) => {
                const timer = setTimeout(() => resolve({ ok: true, status: 200, text: async () => "late" }), 30_000);
                init?.signal?.addEventListener("abort", () => {
                    clearTimeout(timer);
                    reject(Object.assign(new Error("aborted"), { name: "AbortError" }));
                });
            });
        });
        expect(result.refreshed).toBe(0);
        expect(result.failed).toBe(1);
        expect(result.bundle.docs[0]?.text).toBe(bundle.docs[0]?.text);
        expect(REFRESH_REQUEST_MS).toBe(5000);
    }, 15_000);

    it("keeps successful docs when a sibling times out", async () => {
        const fixture = loadFixture();
        const bundle = { version: "1", docs: [fixture.docs[0], fixture.docs[1]] };
        const result = await refreshBundle(bundle, (url, init) => {
            if (url.includes("API.md")) {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    text: async () => "# API reference\n\n## HTML/CSS Prerequisites\n\nmixed ok\n",
                });
            }
            return new Promise((_resolve, reject) => {
                init?.signal?.addEventListener("abort", () => {
                    reject(Object.assign(new Error("aborted"), { name: "AbortError" }));
                });
            });
        });
        expect(result.refreshed).toBeGreaterThanOrEqual(1);
        expect(result.bundle.docs[0]?.text).toContain("mixed ok");
        expect(result.bundle.docs[1]?.text).toBe(bundle.docs[1]?.text);
    }, 15_000);
});
