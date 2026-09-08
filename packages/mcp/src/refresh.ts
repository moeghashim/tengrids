import { firstTitle, parseHeadings, storyTitle } from "./markdown.js";
import type { DocBundle, DocEntry } from "./types.js";

export const PAGES_ORIGIN = "https://moeghashim.github.io";
export const GITHUB_ORIGIN = "https://raw.githubusercontent.com";

export type RefreshFetch = (
    url: string,
    init?: { headers?: Record<string, string> }
) => Promise<{
    ok: boolean;
    status: number;
    text(): Promise<string>;
}>;

export function assertAllowedUrl(urlString: string): URL {
    let url: URL;
    try {
        url = new URL(urlString);
    } catch {
        throw new Error(`blocked URL: ${urlString}`);
    }
    if (url.protocol !== "https:") {
        throw new Error(`blocked URL protocol: ${url.protocol}`);
    }
    if (url.origin === PAGES_ORIGIN) {
        if (!url.pathname.startsWith("/tengrids/")) {
            throw new Error("blocked Pages path");
        }
        return url;
    }
    if (url.origin === GITHUB_ORIGIN) {
        if (!url.pathname.startsWith("/moeghashim/tengrids/")) {
            throw new Error("blocked GitHub path");
        }
        return url;
    }
    throw new Error(`blocked origin: ${url.origin}`);
}

export function urlsFor(doc: DocEntry): string[] {
    const urls: string[] = [];
    if (doc.id === "api") urls.push(`${PAGES_ORIGIN}/tengrids/API.md`);
    if (doc.id === "llms") urls.push(`${PAGES_ORIGIN}/tengrids/llms.txt`);
    if (doc.id === "llms-full") urls.push(`${PAGES_ORIGIN}/tengrids/llms-full.txt`);
    if (doc.path.length > 0 && doc.id !== "llms-full") {
        urls.push(`${GITHUB_ORIGIN}/moeghashim/tengrids/main/${doc.path}`);
    }
    return urls;
}

function reparse(doc: DocEntry, text: string): DocEntry {
    const isStory = doc.path.endsWith(".stories.tsx");
    const title = isStory ? storyTitle(text, doc.title) : firstTitle(text, doc.title);
    const headings = isStory ? [{ heading: title, text }] : parseHeadings(text);
    return { ...doc, title, text, headings };
}

export type RefreshResult = {
    bundle: DocBundle;
    refreshed: number;
    failed: number;
};

export async function refreshBundle(
    bundle: DocBundle,
    fetchImpl: RefreshFetch = fetch as RefreshFetch
): Promise<RefreshResult> {
    const nextDocs: DocEntry[] = [];
    let refreshed = 0;
    let failed = 0;

    for (const doc of bundle.docs) {
        const urls = urlsFor(doc);
        let updated: DocEntry | undefined;
        for (const url of urls) {
            try {
                assertAllowedUrl(url);
                const res = await fetchImpl(url, {
                    headers: { accept: "text/plain, text/markdown, */*" },
                });
                if (!res.ok) continue;
                const text = await res.text();
                if (text.length === 0) continue;
                updated = reparse(doc, text);
                break;
            } catch {
                // try the next origin, then keep the bundled copy
            }
        }
        if (updated !== undefined) {
            nextDocs.push(updated);
            refreshed++;
        } else {
            nextDocs.push(doc);
            if (urls.length > 0) failed++;
        }
    }

    return { bundle: { ...bundle, docs: nextDocs }, refreshed, failed };
}
