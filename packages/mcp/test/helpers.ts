import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { DocBundle } from "../src/types.js";

export function fixtureDir(): string {
    return join(dirname(fileURLToPath(import.meta.url)), "fixtures");
}

export function loadFixture(): DocBundle {
    return JSON.parse(readFileSync(join(fixtureDir(), "index.json"), "utf8")) as DocBundle;
}

export function realBundleDir(): string {
    return join(dirname(fileURLToPath(import.meta.url)), "..", "docs");
}
