import { describe, expect, it } from "vitest";
import { extractJson, hashString } from "../src/json.js";

describe("extractJson", () => {
    it("parses bare JSON", () => {
        expect(extractJson('{"a":1}')).toEqual({ a: 1 });
        expect(extractJson("[1,2]")).toEqual([1, 2]);
    });
    it("parses fenced JSON", () => {
        expect(extractJson('Sure!\n```json\n{"a": [1]}\n```\nDone.')).toEqual({ a: [1] });
    });
    it("parses JSON embedded in prose", () => {
        expect(extractJson('Here you go: [{"i":0,"value":"5"}] hope that helps')).toEqual([{ i: 0, value: "5" }]);
    });
    it("returns undefined for no JSON", () => {
        expect(extractJson("nothing here")).toBeUndefined();
        expect(extractJson("")).toBeUndefined();
        expect(extractJson("[oops")).toBeUndefined();
    });
});

describe("hashString", () => {
    it("is stable and distinguishes inputs", () => {
        expect(hashString("abc")).toBe(hashString("abc"));
        expect(hashString("abc")).not.toBe(hashString("abd"));
        expect(hashString("")).toMatch(/^[0-9a-z]+$/);
    });
});
