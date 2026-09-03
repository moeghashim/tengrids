/**
 * Models are asked for JSON but often wrap it in prose or ```json fences.
 * Pull the first JSON value out of free text; undefined when there is none.
 */
export function extractJson<T = unknown>(text: string): T | undefined {
    const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
    const candidates = [fenced?.[1], text].filter((s): s is string => typeof s === "string");
    for (const c of candidates) {
        const trimmed = c.trim();
        try {
            return JSON.parse(trimmed) as T;
        } catch {
            // fall through to bracket scanning
        }
        const starts = [trimmed.indexOf("["), trimmed.indexOf("{")].filter(i => i !== -1);
        if (starts.length === 0) continue;
        const start = Math.min(...starts);
        const closer = trimmed[start] === "[" ? "]" : "}";
        const end = trimmed.lastIndexOf(closer);
        if (end <= start) continue;
        try {
            return JSON.parse(trimmed.slice(start, end + 1)) as T;
        } catch {
            // not valid JSON either
        }
    }
    return undefined;
}

/** Small, stable string hash for cache keys (djb2). */
export function hashString(s: string): string {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
}
