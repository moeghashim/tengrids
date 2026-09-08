import type { DocBundle, SearchHit } from "./types.js";

const K1 = 1.2;
const B = 0.75;
const EXCERPT = 300;

type Section = {
    id: string;
    heading: string;
    path: string;
    text: string;
    tokens: string[];
};

export function tokenize(value: string): string[] {
    return value
        .toLowerCase()
        .split(/[^a-z0-9]+/u)
        .filter(token => token.length >= 2);
}

/** Expand well-known troubleshooting phrases onto the sections they refer to (C3). */
export function expandQuery(query: string): string[] {
    const tokens = tokenize(query);
    const extra: string[] = [];
    const lower = query.toLowerCase();
    if (lower.includes("nothing shows up")) {
        extra.push("portal", "prerequisites", "css", "height", "html");
    }
    if (lower.includes("dark mode")) {
        extra.push("theme", "theming", "dark", "accentcolor", "bgcell");
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

function sectionsOf(bundle: DocBundle): Section[] {
    const sections: Section[] = [];
    for (const doc of bundle.docs) {
        if (doc.headings.length === 0) {
            const text = `${doc.title}\n${doc.text}`;
            sections.push({
                id: doc.id,
                heading: doc.title,
                path: doc.path,
                text: doc.text,
                tokens: tokenize(text),
            });
            continue;
        }
        for (const heading of doc.headings) {
            const text = `${doc.title}\n${heading.heading}\n${heading.text}`;
            sections.push({
                id: doc.id,
                heading: heading.heading.length > 0 ? heading.heading : doc.title,
                path: doc.path,
                text: heading.text,
                tokens: tokenize(text),
            });
        }
    }
    return sections;
}

export function searchDocs(bundle: DocBundle, query: string, limit = 10): SearchHit[] {
    const terms = expandQuery(query);
    if (terms.length === 0) return [];
    const sections = sectionsOf(bundle);
    const nDocs = sections.length;
    if (nDocs === 0) return [];

    const df = new Map<string, number>();
    for (const term of new Set(terms)) {
        let count = 0;
        for (const section of sections) {
            if (section.tokens.includes(term)) count++;
        }
        df.set(term, count);
    }

    const avgdl = sections.reduce((sum, section) => sum + section.tokens.length, 0) / nDocs;
    const hits: SearchHit[] = [];

    for (const section of sections) {
        const tf = new Map<string, number>();
        for (const token of section.tokens) {
            tf.set(token, (tf.get(token) ?? 0) + 1);
        }
        let score = 0;
        for (const term of terms) {
            const freq = tf.get(term) ?? 0;
            const docFreq = df.get(term) ?? 0;
            const idf = Math.log((nDocs - docFreq + 0.5) / (docFreq + 0.5) + 1);
            const dl = section.tokens.length;
            score += (idf * (freq * (K1 + 1))) / (freq + K1 * (1 - B + (B * dl) / avgdl));
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
