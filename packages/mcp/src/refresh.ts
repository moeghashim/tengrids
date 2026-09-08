import { firstTitle, parseHeadings, parseStoryHeadings, storyTitle } from "./markdown.js";
import type { DocBundle, DocEntry } from "./types.js";

export const PAGES_ORIGIN = "https://moeghashim.github.io";
export const GITHUB_ORIGIN = "https://raw.githubusercontent.com";
export const REFRESH_REQUEST_MS = 5000;
export const REFRESH_TOTAL_MS = 20_000;
export const REFRESH_CONCURRENCY = 8;

export type RefreshFetch = (
    url: string,
    init?: { headers?: Record<string, string>; signal?: AbortSignal }
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
    const headings = isStory ? parseStoryHeadings(text) : parseHeadings(text);
    return { ...doc, title, text, headings };
}

export type RefreshResult = {
    bundle: DocBundle;
    refreshed: number;
    failed: number;
};

function combineSignals(parent: AbortSignal, timeoutMs: number): AbortSignal {
    const perRequest = AbortSignal.timeout(timeoutMs);
    if (typeof AbortSignal.any === "function") {
        return AbortSignal.any([parent, perRequest]);
    }
    return perRequest;
}

async function fetchDoc(doc: DocEntry, fetchImpl: RefreshFetch, parent: AbortSignal): Promise<DocEntry | undefined> {
    for (const url of urlsFor(doc)) {
        if (parent.aborted) return undefined;
        try {
            assertAllowedUrl(url);
            const signal = combineSignals(parent, REFRESH_REQUEST_MS);
            const res = await fetchImpl(url, {
                headers: { accept: "text/plain, text/markdown, */*" },
                signal,
            });
            if (!res.ok) continue;
            const text = await res.text();
            if (text.length === 0) continue;
            return reparse(doc, text);
        } catch {
            // try the next origin, then keep the bundled copy
        }
    }
    return undefined;
}

async function mapPool<T, R>(
    items: readonly T[],
    concurrency: number,
    parent: AbortSignal,
    fn: (item: T) => Promise<R>
): Promise<R[]> {
    const results: R[] = new Array(items.length);
    let next = 0;
    const worker = async (): Promise<void> => {
        while (next < items.length) {
            if (parent.aborted) return;
            const i = next;
            next++;
            results[i] = await fn(items[i]);
        }
    };
    const n = Math.max(1, Math.min(concurrency, items.length));
    await Promise.all(Array.from({ length: n }, () => worker()));
    return results;
}

export async function refreshBundle(
    bundle: DocBundle,
    fetchImpl: RefreshFetch = fetch as RefreshFetch
): Promise<RefreshResult> {
    const parent = AbortSignal.timeout(REFRESH_TOTAL_MS);
    const updated = await mapPool(bundle.docs, REFRESH_CONCURRENCY, parent, doc => fetchDoc(doc, fetchImpl, parent));

    let refreshed = 0;
    let failed = 0;
    const nextDocs: DocEntry[] = bundle.docs.map((doc, i) => {
        const replacement = updated[i];
        if (replacement !== undefined) {
            refreshed++;
            return replacement;
        }
        if (urlsFor(doc).length > 0) failed++;
        return doc;
    });

    return { bundle: { ...bundle, docs: nextDocs }, refreshed, failed };
}
