import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { findDoc, loadBundleFromDir } from "../src/bundle.js";
import { confine } from "../src/paths.js";
import { fixtureDir, loadFixture } from "./helpers.js";

describe("bundle loading", () => {
    it("loads the fixture bundle", () => {
        const bundle = loadBundleFromDir(fixtureDir());
        expect(bundle.docs.length).toBeGreaterThan(0);
        expect(findDoc(bundle, "api")?.title).toBe("API reference");
    });

    it("rejects a malformed index", () => {
        const dir = mkdtempSync(join(tmpdir(), "tengrids-mcp-"));
        writeFileSync(join(dir, "index.json"), JSON.stringify({ version: 1, docs: [] }));
        expect(() => loadBundleFromDir(dir)).toThrow(/malformed/u);
    });

    it("rejects an index that is not JSON", () => {
        const dir = mkdtempSync(join(tmpdir(), "tengrids-mcp-"));
        writeFileSync(join(dir, "index.json"), "not json");
        expect(() => loadBundleFromDir(dir)).toThrow();
    });

    it("confines reads to the docs directory", () => {
        const dir = mkdtempSync(join(tmpdir(), "tengrids-mcp-"));
        expect(() => confine(dir, join(dir, "..", "secret.txt"))).toThrow(/outside the docs directory/u);
        expect(confine(dir, join(dir, "index.json"))).toContain(dir);
    });

    it("allows the docs root itself", () => {
        const dir = mkdtempSync(join(tmpdir(), "tengrids-mcp-"));
        expect(confine(dir, dir)).toBeTruthy();
    });

    it("rejects a heading that is not an object", () => {
        const dir = mkdtempSync(join(tmpdir(), "tengrids-mcp-"));
        writeFileSync(
            join(dir, "index.json"),
            JSON.stringify({
                version: "1",
                docs: [{ id: "x", title: "x", path: "x", text: "x", headings: ["nope"] }],
            })
        );
        expect(() => loadBundleFromDir(dir)).toThrow(/malformed/u);
    });

    it("fixture matches loadFixture helper", () => {
        expect(loadFixture().version).toBe("6.0.4-alpha26");
        mkdirSync(join(fixtureDir()), { recursive: true });
    });
});
