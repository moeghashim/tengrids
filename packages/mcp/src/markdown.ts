import type { DocHeading } from "./types.js";

const STORY_HELPERS = new Set(["Frame", "Box", "Wrapper", "Decorator"]);

/** Split markdown on ATX headings, ignoring fences. `level` is the # count (0 = preamble). */
export function parseHeadings(text: string): DocHeading[] {
    const headings: DocHeading[] = [];
    let heading = "";
    let level = 0;
    let buf: string[] = [];
    let inFence = false;

    const flush = (): void => {
        const body = buf.join("\n").replace(/\s+$/u, "");
        if (heading.length > 0 || body.length > 0) {
            headings.push({ heading, text: body, level });
        }
        buf = [];
    };

    for (const line of text.split(/\n/u)) {
        if (/^```/u.test(line)) {
            inFence = !inFence;
            buf.push(line);
            continue;
        }
        const match = /^(#{1,6})\s+(.*)$/u.exec(line);
        if (!inFence && match !== null) {
            flush();
            level = match[1].length;
            heading = match[2].trim();
        } else {
            buf.push(line);
        }
    }
    flush();
    return headings;
}

/** Own section plus nested headings until the next heading of equal or lesser depth. */
export function headingWithChildren(headings: readonly DocHeading[], index: number): string {
    const start = headings[index];
    if (start === undefined) return "";
    const chunks: string[] = [];
    if (start.heading.length > 0) {
        chunks.push(`${"#".repeat(Math.max(start.level, 1))} ${start.heading}`);
    }
    if (start.text.length > 0) chunks.push(start.text);
    if (start.level === 0) return chunks.join("\n\n");
    for (let i = index + 1; i < headings.length; i++) {
        const next = headings[i];
        if (next.level <= start.level) break;
        if (next.heading.length > 0) {
            chunks.push(`${"#".repeat(Math.max(next.level, 1))} ${next.heading}`);
        }
        if (next.text.length > 0) chunks.push(next.text);
    }
    return chunks.join("\n\n");
}

export function firstTitle(text: string, fallback: string): string {
    const match = /^#\s+(.+)$/mu.exec(text);
    if (match === null) return fallback;
    return match[1].trim();
}

export function storyTitle(source: string, fallback: string): string {
    const match = /title:\s*["'`]([^"'`]+)["'`]/u.exec(source);
    if (match === null) return fallback;
    return match[1];
}

export function isStoryHelperExport(name: string): boolean {
    return STORY_HELPERS.has(name);
}

/** First PascalCase `export const` that is not a Frame/Box/Wrapper/Decorator helper. */
export function firstExportedStory(source: string): string | undefined {
    for (const match of source.matchAll(/export const ([A-Z][A-Za-z0-9]*)/gu)) {
        const name = match[1];
        if (!isStoryHelperExport(name)) return name;
    }
    return undefined;
}

export function parseStoryHeadings(source: string): DocHeading[] {
    const matches = [...source.matchAll(/export const ([A-Z][A-Za-z0-9]*)/gu)];
    const headings: DocHeading[] = [];
    for (let i = 0; i < matches.length; i++) {
        const name = matches[i][1];
        if (isStoryHelperExport(name)) continue;
        const start = matches[i].index ?? 0;
        let end = source.length;
        for (let j = i + 1; j < matches.length; j++) {
            if (!isStoryHelperExport(matches[j][1])) {
                end = matches[j].index ?? source.length;
                break;
            }
        }
        headings.push({ heading: name, text: source.slice(start, end), level: 2 });
    }
    if (headings.length === 0) {
        return [{ heading: storyTitle(source, "Story"), text: source, level: 1 }];
    }
    return headings;
}

/** Storybook 7+ `storyNameFromExport`: FreezeColumns → freeze-columns. */
export function storyNameFromExport(exportName: string): string {
    return exportName.replace(/([a-z0-9])([A-Z])/gu, "$1-$2").toLowerCase();
}

export function storybookSlug(title: string, exportName: string): string {
    const kebab = (value: string): string =>
        value
            .toLowerCase()
            .replace(/[^a-z0-9]+/gu, "-")
            .replace(/^-|-$/gu, "");
    return `${kebab(title)}--${storyNameFromExport(exportName)}`;
}
