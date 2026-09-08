import { readFileSync } from "node:fs";
import { join } from "node:path";
import { confine, defaultDocsDir } from "./paths.js";
import type { DocBundle, DocEntry } from "./types.js";

function isDocEntry(value: unknown): value is DocEntry {
    if (typeof value !== "object" || value === null) return false;
    const rec = value as Record<string, unknown>;
    if (typeof rec.id !== "string" || rec.id.length === 0) return false;
    if (typeof rec.title !== "string") return false;
    if (typeof rec.path !== "string") return false;
    if (typeof rec.text !== "string") return false;
    if (!Array.isArray(rec.headings)) return false;
    return rec.headings.every(h => {
        if (typeof h !== "object" || h === null) return false;
        const heading = h as Record<string, unknown>;
        return (
            typeof heading.heading === "string" &&
            typeof heading.text === "string" &&
            typeof heading.level === "number" &&
            (heading.storyId === undefined || typeof heading.storyId === "string")
        );
    });
}

function isBundle(value: unknown): value is DocBundle {
    if (typeof value !== "object" || value === null) return false;
    const rec = value as Record<string, unknown>;
    if (typeof rec.version !== "string") return false;
    if (!Array.isArray(rec.docs)) return false;
    return rec.docs.every(isDocEntry);
}

export function loadBundleFromDir(dir: string): DocBundle {
    const root = confine(dir, dir);
    const indexPath = confine(root, join(root, "index.json"));
    const raw = readFileSync(indexPath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!isBundle(parsed)) {
        throw new Error("docs bundle index.json is malformed");
    }
    return parsed;
}

export function loadBundle(dir = defaultDocsDir()): DocBundle {
    return loadBundleFromDir(dir);
}

export function findDoc(bundle: DocBundle, id: string): DocEntry | undefined {
    return bundle.docs.find(doc => doc.id === id);
}
