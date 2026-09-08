import type { DocHeading } from "./types.js";

/** Split markdown (or similar) on ATX headings. The leading block uses heading "". */
export function parseHeadings(text: string): DocHeading[] {
    const headings: DocHeading[] = [];
    let heading = "";
    let buf: string[] = [];

    const flush = (): void => {
        const body = buf.join("\n").replace(/\s+$/u, "");
        if (heading.length > 0 || body.length > 0) {
            headings.push({ heading, text: body });
        }
        buf = [];
    };

    for (const line of text.split(/\n/u)) {
        const match = /^(#{1,6})\s+(.*)$/u.exec(line);
        if (match !== null) {
            flush();
            heading = match[2].trim();
        } else {
            buf.push(line);
        }
    }
    flush();
    return headings;
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

export function firstExportedStory(source: string): string | undefined {
    const match = /export const ([A-Z][A-Za-z0-9]*)/u.exec(source);
    return match?.[1];
}

export function storybookSlug(title: string, exportName: string): string {
    const kebab = (value: string): string =>
        value
            .toLowerCase()
            .replace(/[^a-z0-9]+/gu, "-")
            .replace(/^-|-$/gu, "");
    return `${kebab(title)}--${kebab(exportName)}`;
}
