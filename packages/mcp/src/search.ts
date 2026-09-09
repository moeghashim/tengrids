import type { DocBundle, SearchHit } from "./types.js";

const K1 = 1.2;
const B = 0.75;
const EXCERPT = 300;

/**
 * Query expansions used by `search_docs`. A phrase or token in the query adds
 * extra index terms so troubleshooting language hits the right section.
 *
 * - blank / empty / nothing / invisible → portal, prerequisites, css, height
 * - dark / theme / colors / theming → theme, theming
 */
export const QUERY_SYNONYMS: readonly { match: RegExp; extra: readonly string[] }[] = [
    {
        match: /\b(blank|empty|nothing|invisible)\b/iu,
        extra: ["portal", "prerequisites", "css", "height"],
    },
    {
        match: /\b(dark|theme|colors|theming)\b/iu,
        extra: ["theme", "theming"],
    },
];

type IndexedSection = {
    id: string;
    heading: string;
    path: string;
    text: string;
    story: boolean;
    tf: Map<string, number>;
    dl: number;
};

export type SearchIndex = {
    sections: IndexedSection[];
    df: Map<string, number>;
    avgdl: number;
};

const indexCache = new WeakMap<DocBundle, SearchIndex>();

function stem(token: string): string {
    if (token === "frozen" || token === "freeze" || token === "freezing" || token === "freezes") {
        return "freez";
    }
    return token;
}

function splitCamel(token: string): string[] {
    const parts = token.split(/(?<=[a-z0-9])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])/u);
    if (parts.length <= 1) return [];
    return parts.filter(part => part.length >= 2).map(part => stem(part.toLowerCase()));
}

export function tokenize(value: string): string[] {
    const raw = value.split(/[^A-Za-z0-9]+/u).filter(token => token.length >= 2);
    const out: string[] = [];
    for (const token of raw) {
        out.push(stem(token.toLowerCase()));
        for (const part of splitCamel(token)) out.push(part);
    }
    return out;
}

export function expandQuery(query: string): string[] {
    const tokens = tokenize(query);
    const extra: string[] = [];
    for (const synonym of QUERY_SYNONYMS) {
        if (synonym.match.test(query)) extra.push(...synonym.extra);
    }
    return [...tokens, ...extra];
}

function excerpt(text: string, terms: string[]): string {
    const compact = text.replace(/\s+/gu, " ").trim();
    const low = compact.toLowerCase();
    let idx = 0;
    for (const term of terms) {
        const found = low.indexOf(term);
        if (found >= 0) {
            idx = Math.max(0, found - 80);
            break;
        }
    }
    let slice = compact.slice(idx, idx + EXCERPT);
    if (idx > 0) slice = "…" + slice;
    if (idx + EXCERPT < compact.length) slice += "…";
    return slice.slice(0, EXCERPT);
}

export function indexBundle(bundle: DocBundle): SearchIndex {
    const cached = indexCache.get(bundle);
    if (cached !== undefined) return cached;

    const sections: IndexedSection[] = [];
    for (const doc of bundle.docs) {
        const story = doc.id.startsWith("story-") || doc.path.endsWith(".stories.tsx");
        const blocks =
            doc.headings.length === 0
                ? [{ heading: doc.title, text: doc.text, path: doc.path }]
                : doc.headings.map(h => ({
                      heading: h.heading.length > 0 ? h.heading : doc.title,
                      text: `${doc.title}\n${h.heading}\n${h.text}`,
                      path: doc.path,
                  }));
        for (const block of blocks) {
            const tokens = tokenize(`${block.heading}\n${block.text}\n${block.path}`);
            const tf = new Map<string, number>();
            for (const token of tokens) tf.set(token, (tf.get(token) ?? 0) + 1);
            sections.push({
                id: doc.id,
                heading: block.heading,
                path: block.path,
                text: block.text,
                story,
                tf,
                dl: tokens.length,
            });
        }
    }

    const df = new Map<string, number>();
    for (const section of sections) {
        for (const term of section.tf.keys()) {
            df.set(term, (df.get(term) ?? 0) + 1);
        }
    }
    const nDocs = Math.max(sections.length, 1);
    const avgdl = sections.reduce((sum, section) => sum + section.dl, 0) / nDocs;
    const index: SearchIndex = { sections, df, avgdl };
    indexCache.set(bundle, index);
    return index;
}

export function searchDocs(
    bundle: DocBundle,
    query: string,
    limit = 10,
    options: { storiesOnly?: boolean } = {}
): SearchHit[] {
    const terms = expandQuery(query);
    if (terms.length === 0) return [];
    const index = indexBundle(bundle);
    const sections = options.storiesOnly === true ? index.sections.filter(s => s.story) : index.sections;
    const nDocs = sections.length;
    if (nDocs === 0) return [];

    const hits: SearchHit[] = [];
    for (const section of sections) {
        let score = 0;
        for (const term of terms) {
            const freq = section.tf.get(term) ?? 0;
            const docFreq = index.df.get(term) ?? 0;
            const idf = Math.log((index.sections.length - docFreq + 0.5) / (docFreq + 0.5) + 1);
            score += (idf * (freq * (K1 + 1))) / (freq + K1 * (1 - B + (B * section.dl) / index.avgdl));
        }
        const headingLow = section.heading.toLowerCase();
        const pathLow = section.path.toLowerCase();
        for (const term of terms) {
            if (headingLow === term) score += 8;
            else if (headingLow.includes(term)) score += 3;
            if (pathLow.includes(term)) score += 1.5;
        }
        if (score > 0) {
            hits.push({
                id: section.id,
                heading: section.heading,
                score,
                excerpt: excerpt(section.text, terms),
            });
        }
    }

    hits.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
    return hits.slice(0, Math.max(0, limit));
}
