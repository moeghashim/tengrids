import { describe, expect, it } from "vitest";
import { assertAllowedUrl, GITHUB_ORIGIN, PAGES_ORIGIN, refreshBundle, urlsFor } from "../src/refresh.js";
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
});
