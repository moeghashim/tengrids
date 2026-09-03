import { describe, expect, it } from "vitest";
import { GridCellKind, type GridCell } from "tengrids";
import { coerceValue, normalizeUri, parseBoolean, parseNumber } from "../src/coerce.js";
import { cellText } from "../src/cell-text.js";

describe("parseNumber", () => {
    it.each([
        ["42", 42],
        ["  -7 ", -7],
        ["1,234.5", 1234.5],
        ["$1.2k", 1200],
        ["€3m", 3_000_000],
        ["12%", 12],
        ["(500)", -500],
        ["3 million", 3_000_000],
        ["twelve", 12],
        ["forty two", 42],
        ["three hundred", 300],
        ["two thousand", 2000],
        ["1e3", 1000],
        ["−9", -9],
    ])("parses %s", (input, expected) => {
        expect(parseNumber(input)).toBe(expected);
    });

    it.each(["", "abc", "12abc", "1,2,3,4x", "million dollars"])("rejects %s", input => {
        expect(parseNumber(input)).toBeUndefined();
    });
});

describe("parseBoolean", () => {
    it.each([
        ["yes", true], ["Y", true], ["TRUE", true], ["1", true], ["✓", true], ["done", true],
        ["no", false], ["n", false], ["False", false], ["0", false], ["✗", false], ["off", false],
    ])("parses %s", (input, expected) => {
        expect(parseBoolean(input)).toBe(expected);
    });
    it("returns undefined for non-booleans", () => {
        expect(parseBoolean("maybe")).toBeUndefined();
        expect(parseBoolean("")).toBeUndefined();
    });
});

describe("normalizeUri", () => {
    it("keeps full urls, adds https to bare domains, mailto to emails", () => {
        expect(normalizeUri("https://a.com/x")).toBe("https://a.com/x");
        expect(normalizeUri("example.com/path")).toBe("https://example.com/path");
        expect(normalizeUri("me@example.com")).toBe("mailto:me@example.com");
    });
    it("rejects prose", () => {
        expect(normalizeUri("hello world")).toBeUndefined();
        expect(normalizeUri("")).toBeUndefined();
    });
});

const text: GridCell = { kind: GridCellKind.Text, data: "", displayData: "", allowOverlay: true };
const num: GridCell = { kind: GridCellKind.Number, data: 0, displayData: "0", allowOverlay: true };
const bool: GridCell = { kind: GridCellKind.Boolean, data: false, allowOverlay: false };
const uri: GridCell = { kind: GridCellKind.Uri, data: "", allowOverlay: true };
const bubble: GridCell = { kind: GridCellKind.Bubble, data: [], allowOverlay: true };
const image: GridCell = { kind: GridCellKind.Image, data: [], allowOverlay: true };

describe("coerceValue", () => {
    it("coerces into each kind", () => {
        expect(coerceValue("  hi ", text)).toMatchObject({ data: "hi", displayData: "hi" });
        expect(coerceValue("$1,200", num)).toMatchObject({ data: 1200, displayData: "1200" });
        expect(coerceValue("yes", bool)).toMatchObject({ data: true });
        expect(coerceValue("example.com", uri)).toMatchObject({ data: "https://example.com" });
        expect(coerceValue("a, b;c", bubble)).toMatchObject({ data: ["a", "b", "c"] });
        expect(coerceValue("img.example.com/a.png https://x.com/b.png", image)).toMatchObject({
            data: ["https://img.example.com/a.png", "https://x.com/b.png"],
        });
    });

    it("returns undefined when the text cannot be understood for the kind", () => {
        expect(coerceValue("soon", num)).toBeUndefined();
        expect(coerceValue("perhaps", bool)).toBeUndefined();
        expect(coerceValue("not a link", uri)).toBeUndefined();
        expect(coerceValue("nothing here", image)).toBeUndefined();
    });

    it("preserves the target cell's other fields", () => {
        const styled: GridCell = { ...num, themeOverride: { accentColor: "red" }, contentAlign: "right" };
        expect(coerceValue("5", styled)).toMatchObject({ themeOverride: { accentColor: "red" }, contentAlign: "right" });
    });
});

describe("cellText", () => {
    it("renders the visible text of every kind", () => {
        expect(cellText({ kind: GridCellKind.Text, data: "a", displayData: "A", allowOverlay: false })).toBe("A");
        expect(cellText({ kind: GridCellKind.Number, data: 3, displayData: "3.0", allowOverlay: false })).toBe("3.0");
        expect(cellText({ kind: GridCellKind.Boolean, data: true, allowOverlay: false })).toBe("true");
        expect(cellText({ kind: GridCellKind.Bubble, data: ["x", "y"], allowOverlay: false })).toBe("x, y");
        expect(cellText({ kind: GridCellKind.Drilldown, data: [{ text: "d" }], allowOverlay: false })).toBe("d");
        expect(cellText({ kind: GridCellKind.Custom, data: {}, copyData: "cp", allowOverlay: false })).toBe("cp");
        expect(cellText({ kind: GridCellKind.Loading, allowOverlay: false })).toBe("");
    });
});
