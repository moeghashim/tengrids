import { describe, expect, it } from "vitest";
import { createMockProvider, collectCompletion } from "../src/provider.js";
import { FEATURE_DIFFICULTY, createRoutingProvider } from "../src/providers/routing.js";

const mk = (name: string) => createMockProvider(() => name);
const signal = () => new AbortController().signal;

describe("createRoutingProvider", () => {
    const low = mk("low");
    const medium = mk("medium");
    const high = mk("high");
    const fallback = mk("default");
    const pinned = mk("pinned");
    const router = createRoutingProvider({ default: fallback, low, medium, high, models: { "grok-4": pinned } });

    it("routes by explicit difficulty", async () => {
        expect(router.route({ prompt: "x", difficulty: "high" }).via).toBe("high");
        expect(await collectCompletion(router.complete({ prompt: "x", difficulty: "low" }, { signal: signal() }))).toBe("low");
    });
    it("an explicit model wins over difficulty", () => {
        const r = router.route({ prompt: "x", difficulty: "low", model: "grok-4" });
        expect(r).toEqual({ provider: pinned, via: "model" });
    });
    it("unknown models fall back to the difficulty tier, then the default", () => {
        expect(router.route({ prompt: "x", model: "nope", difficulty: "medium" }).via).toBe("medium");
        expect(router.route({ prompt: "x" }).via).toBe("default");
    });
    it("uses per-feature defaults when a request states no difficulty", () => {
        expect(router.route({ prompt: "x", feature: "bulk-edit" }).via).toBe("high");
        expect(router.route({ prompt: "x", feature: "search" }).via).toBe("low");
        expect(FEATURE_DIFFICULTY["ai-cell"]).toBe("medium");
    });
    it("a missing tier falls back to default, and fallbackDifficulty overrides feature defaults", () => {
        const partial = createRoutingProvider({ default: fallback, high, fallbackDifficulty: "high" });
        expect(partial.route({ prompt: "x", difficulty: "low" }).via).toBe("default");
        expect(partial.route({ prompt: "x", feature: "search" }).via).toBe("high");
    });
});
