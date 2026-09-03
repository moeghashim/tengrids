import { type GridCell, GridCellKind } from "tengrids";

const NUMBER_WORDS: Record<string, number> = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
    eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70,
    eighty: 80, ninety: 90, hundred: 100, thousand: 1000, million: 1_000_000, billion: 1_000_000_000,
};

const SUFFIX: Record<string, number> = { k: 1e3, m: 1e6, b: 1e9, bn: 1e9, mm: 1e6 };

/**
 * Parses the ways people actually type numbers: "1,234.5", "$1.2k", "(500)",
 * "12%", "3 million", "twelve", "−7". Returns undefined for anything else.
 */
export function parseNumber(text: string): number | undefined {
    let s = text.trim().toLowerCase();
    if (s === "") return undefined;
    const direct = Number(s);
    if (!Number.isNaN(direct) && /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/.test(s)) return direct;

    let negative = false;
    if (/^\(.*\)$/.test(s)) {
        negative = true;
        s = s.slice(1, -1).trim();
    }
    s = s.replace(/^[-−–]/, m => {
        negative = !negative || m === "";
        return "";
    });
    s = s.replace(/^\+/, "");
    s = s.replace(/^[$€£¥₹]\s*/, "").replace(/\s*(usd|eur|gbp|%|percent)$/, "");
    s = s.replace(/,/g, "").replace(/\s+/g, " ").trim();

    const suffixed = /^(\d+\.?\d*|\.\d+)\s*(k|m|b|bn|mm|thousand|million|billion)$/.exec(s);
    if (suffixed !== null) {
        const mult = SUFFIX[suffixed[2]] ?? NUMBER_WORDS[suffixed[2]];
        const n = Number(suffixed[1]) * mult;
        return negative ? -n : n;
    }
    const plain = Number(s);
    if (!Number.isNaN(plain) && s !== "") return negative ? -plain : plain;

    // Word numbers: "forty two", "twelve", "three hundred"
    const words = s.split(/[\s-]+/);
    if (words.length > 0 && words.every(w => w in NUMBER_WORDS)) {
        let total = 0;
        let current = 0;
        for (const w of words) {
            const v = NUMBER_WORDS[w];
            if (v === 100) current = Math.max(current, 1) * 100;
            else if (v >= 1000) {
                total += Math.max(current, 1) * v;
                current = 0;
            } else current += v;
        }
        const n = total + current;
        return negative ? -n : n;
    }
    return undefined;
}

const TRUE_WORDS = new Set(["true", "yes", "y", "1", "on", "✓", "✔", "x", "checked", "done", "t"]);
const FALSE_WORDS = new Set(["false", "no", "n", "0", "off", "✗", "✘", "unchecked", "f", "-", "—"]);

/** true/false for the words people use; undefined when it isn't a boolean at all. */
export function parseBoolean(text: string): boolean | undefined {
    const s = text.trim().toLowerCase();
    if (TRUE_WORDS.has(s)) return true;
    if (FALSE_WORDS.has(s)) return false;
    return undefined;
}

/** Adds a scheme to bare domains and rejects things that aren't links. */
export function normalizeUri(text: string): string | undefined {
    const s = text.trim();
    if (s === "") return undefined;
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(s) || /^(mailto|tel):/i.test(s)) return s;
    if (/^[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(s)) return `https://${s}`;
    if (/^[\w.+-]+@[\w-]+\.[a-z]{2,}$/i.test(s)) return `mailto:${s}`;
    return undefined;
}

/**
 * Deterministic coercion of pasted text into the target cell's kind. Returns
 * undefined when the text can't be understood — the caller may then fall back
 * to the grid's default paste or to a model.
 */
export function coerceValue(text: string, target: GridCell): GridCell | undefined {
    switch (target.kind) {
        case GridCellKind.Text: {
            const t = text.trim();
            return { ...target, data: t, displayData: t };
        }
        case GridCellKind.Markdown:
        case GridCellKind.RowID:
            return { ...target, data: text.trim() };
        case GridCellKind.Number: {
            const n = parseNumber(text);
            if (n === undefined) return undefined;
            return { ...target, data: n, displayData: String(n) };
        }
        case GridCellKind.Boolean: {
            const b = parseBoolean(text);
            if (b === undefined) return undefined;
            return { ...target, data: b };
        }
        case GridCellKind.Uri: {
            const u = normalizeUri(text);
            if (u === undefined) return undefined;
            return { ...target, data: u, displayData: u };
        }
        case GridCellKind.Bubble: {
            const parts = text.split(/[,;\n]+/).map(s => s.trim()).filter(s => s !== "");
            return { ...target, data: parts };
        }
        case GridCellKind.Image: {
            const urls = text.split(/[\s,;]+/).map(s => s.trim()).filter(s => normalizeUri(s) !== undefined).map(s => normalizeUri(s) as string);
            if (urls.length === 0) return undefined;
            return { ...target, data: urls };
        }
        default:
            return undefined;
    }
}
