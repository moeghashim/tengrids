import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { AiScheduler } from "../src/scheduler.js";
import { createMockProvider, isAbortError } from "../src/provider.js";

describe("AiScheduler", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("resolves, caches, and serves repeats from cache without calling the provider", async () => {
        const provider = createMockProvider(i => `A:${i.prompt}`);
        const s = new AiScheduler({ provider });
        expect(await s.request("k1", { prompt: "p" })).toBe("A:p");
        expect(await s.request("k1", { prompt: "p" })).toBe("A:p");
        expect(provider.calls).toHaveLength(1);
        expect(s.get("k1")).toBe("A:p");
        expect(s.stats).toMatchObject({ hits: 1, misses: 1, completed: 1 });
    });

    it("deduplicates identical in-flight requests", async () => {
        const provider = createMockProvider(() => "same", { delayMs: 100 });
        const s = new AiScheduler({ provider });
        const a = s.request("k", { prompt: "p" });
        const b = s.request("k", { prompt: "p" });
        expect(s.isPending("k")).toBe(true);
        await vi.advanceTimersByTimeAsync(100);
        expect(await Promise.all([a, b])).toEqual(["same", "same"]);
        expect(provider.calls).toHaveLength(1);
    });

    it("limits concurrency and drains the queue in priority order", async () => {
        const order: string[] = [];
        const provider = createMockProvider(i => {
            order.push(i.prompt);
            return "ok";
        }, { delayMs: 10 });
        const s = new AiScheduler({ provider, concurrency: 1 });
        const p1 = s.request("a", { prompt: "a" });
        const p2 = s.request("b", { prompt: "b" }, { priority: 1 });
        const p3 = s.request("c", { prompt: "c" }, { priority: 5 });
        expect(order).toEqual(["a"]); // only one started
        await vi.advanceTimersByTimeAsync(10);
        expect(order).toEqual(["a", "c"]); // highest priority next
        await vi.advanceTimersByTimeAsync(10);
        expect(order).toEqual(["a", "c", "b"]);
        await vi.advanceTimersByTimeAsync(10);
        await Promise.all([p1, p2, p3]);
        expect(s.pendingCount).toBe(0);
    });

    it("cancels queued work without ever calling the provider", async () => {
        const provider = createMockProvider(() => "ok", { delayMs: 10 });
        const s = new AiScheduler({ provider, concurrency: 1 });
        void s.request("a", { prompt: "a" });
        const queued = s.request("b", { prompt: "b" }).catch(e => e);
        expect(s.cancel("b")).toBe(true);
        expect(isAbortError(await queued)).toBe(true);
        await vi.advanceTimersByTimeAsync(10);
        expect(provider.calls.map(c => c.prompt)).toEqual(["a"]);
        expect(s.stats.cancelled).toBe(1);
    });

    it("aborts in-flight work and never caches the cancelled answer", async () => {
        const provider = createMockProvider(() => "ok", { delayMs: 100 });
        const s = new AiScheduler({ provider });
        const p = s.request("a", { prompt: "a" }).catch(e => e);
        await vi.advanceTimersByTimeAsync(10);
        expect(s.cancel("a")).toBe(true);
        expect(isAbortError(await p)).toBe(true);
        await vi.advanceTimersByTimeAsync(200);
        expect(s.has("a")).toBe(false);
        expect(s.isPending("a")).toBe(false);
    });

    it("cancelWhere evicts everything outside a window", async () => {
        const provider = createMockProvider(() => "ok", { delayMs: 50 });
        const s = new AiScheduler({ provider, concurrency: 2 });
        const results = ["r1", "r2", "r3", "r4"].map(k => s.request(k, { prompt: k }).catch(e => (isAbortError(e) ? "aborted" : e)));
        const visible = new Set(["r1", "r4"]);
        expect(s.cancelWhere(k => !visible.has(k))).toBe(2);
        await vi.advanceTimersByTimeAsync(200);
        expect(await Promise.all(results)).toEqual(["ok", "aborted", "aborted", "ok"]);
    });

    it("forwards streamed chunks to every waiter", async () => {
        const provider = createMockProvider(() => ["x", "y"], { delayMs: 10 });
        const s = new AiScheduler({ provider });
        const seenA: string[] = [];
        const seenB: string[] = [];
        const a = s.request("k", { prompt: "p" }, { onChunk: c => seenA.push(c) });
        const b = s.request("k", { prompt: "p" }, { onChunk: c => seenB.push(c) });
        await vi.advanceTimersByTimeAsync(30);
        expect(await a).toBe("xy");
        expect(await b).toBe("xy");
        expect(seenA).toEqual(["x", "xy"]);
        expect(seenB).toEqual(["x", "xy"]);
    });

    it("propagates provider errors and keeps serving afterwards", async () => {
        let fail = true;
        const provider = {
            complete: async () => {
                if (fail) throw new Error("boom");
                return "recovered";
            },
        };
        const s = new AiScheduler({ provider });
        await expect(s.request("k", { prompt: "p" })).rejects.toThrow("boom");
        expect(s.stats.errors).toBe(1);
        fail = false;
        expect(await s.request("k", { prompt: "p" })).toBe("recovered");
    });

    it("evicts the oldest cache entries beyond cacheSize", async () => {
        const provider = createMockProvider(i => i.prompt);
        const s = new AiScheduler({ provider, cacheSize: 2 });
        await s.request("a", { prompt: "a" });
        await s.request("b", { prompt: "b" });
        await s.request("c", { prompt: "c" });
        expect(s.has("a")).toBe(false);
        expect(s.has("b")).toBe(true);
        expect(s.has("c")).toBe(true);
    });

    it("prime stores an answer without a model call", async () => {
        const provider = createMockProvider(() => "model");
        const s = new AiScheduler({ provider });
        s.prime("k", "human");
        expect(await s.request("k", { prompt: "p" })).toBe("human");
        expect(provider.calls).toHaveLength(0);
    });
});
