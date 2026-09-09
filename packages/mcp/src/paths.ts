import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export function defaultDocsDir(): string {
    return join(dirname(fileURLToPath(import.meta.url)), "..", "docs");
}

/** Resolve `target` and throw if it escapes `root`. */
export function confine(root: string, target: string): string {
    const resolvedRoot = resolve(root);
    const resolved = resolve(target);
    const prefix = resolvedRoot.endsWith(sep) ? resolvedRoot : resolvedRoot + sep;
    if (resolved !== resolvedRoot && !resolved.startsWith(prefix)) {
        throw new Error("refusing to read outside the docs directory");
    }
    return resolved;
}
