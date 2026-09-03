import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { AbortError, collectCompletion, createMockProvider, isAbortError } from "../src/provider.js";

describe("createMockProvider", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("resolves a string answer and records the call", async () => {
        const p = createMockProvider(input => `echo:${input.prompt}`);
        const result = await collectCompletion(p.complete({ prompt: "hi" }, { signal: new AbortController().signal }));
        expect(result).toBe("echo:hi");
        expect(p.calls).toHaveLength(1);
        expect(p.calls[0].prompt).toBe("hi");
    });

    it("streams chunks and reports accumulated text", async () => {
        const p = createMockProvider(() => ["a", "b", "c"]);
        const seen: string[] = [];
        const result = await collectCompletion(p.complete({ prompt: "x" }, { signal: new AbortController().signal }), s => seen.push(s));
        expect(result).toBe("abc");
        expect(seen).toEqual(["a", "ab", "abc"]);
    });

    it("honors delay with fake timers", async () => {
        const p = createMockProvider(() => "late", { delayMs: 500 });
        let done = false;
        const promise = collectCompletion(p.complete({ prompt: "x" }, { signal: new AbortController().signal })).then(r => {
            done = true;
            return r;
        });
        await vi.advanceTimersByTimeAsync(499);
        expect(done).toBe(false);
        await vi.advanceTimersByTimeAsync(1);
        expect(await promise).toBe("late");
    });

    it("rejects with AbortError when the signal aborts mid-delay", async () => {
        const p = createMockProvider(() => "never", { delayMs: 1000 });
        const controller = new AbortController();
        const promise = collectCompletion(p.complete({ prompt: "x" }, { signal: controller.signal }), undefined, controller.signal);
        const caught = promise.catch(e => e);
        await vi.advanceTimersByTimeAsync(10);
        controller.abort();
        const e = await caught;
        expect(isAbortError(e)).toBe(true);
        expect(e).toBeInstanceOf(AbortError);
    });

    it("stops a stream when aborted between chunks", async () => {
        const p = createMockProvider(() => ["a", "b", "c"], { delayMs: 100 });
        const controller = new AbortController();
        const seen: string[] = [];
        const caught = collectCompletion(p.complete({ prompt: "x" }, { signal: controller.signal }), s => seen.push(s), controller.signal).catch(e => e);
        await vi.advanceTimersByTimeAsync(150);
        controller.abort();
        await vi.advanceTimersByTimeAsync(500);
        expect(isAbortError(await caught)).toBe(true);
        expect(seen).toEqual(["a"]);
    });
});
