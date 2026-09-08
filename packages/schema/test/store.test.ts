import { afterEach, describe, expect, it, vi } from "vitest";
import type { FilterSpec } from "../src/index.js";
import { memoryStore, urlStore } from "../src/index.js";

const specA: FilterSpec = { clauses: [{ column: "status", op: "in", value: ["draft"] }] };
const specB: FilterSpec = { conjunction: "or", clauses: [{ column: "cost", op: "gte", value: 10 }] };

describe("memoryStore", () => {
    it("starts empty or with the initial spec", () => {
        expect(memoryStore().get()).toEqual({ clauses: [] });
        expect(memoryStore(specA).get()).toEqual(specA);
    });

    it("notifies subscribers on set and unsubscribes", () => {
        const store = memoryStore();
        const a = vi.fn();
        const b = vi.fn();
        const offA = store.subscribe(a);
        store.subscribe(b);
        store.set(specA);
        expect(a).toHaveBeenCalledTimes(1);
        expect(b).toHaveBeenCalledTimes(1);
        expect(store.get()).toEqual(specA);
        offA();
        store.set(specB);
        expect(a).toHaveBeenCalledTimes(1);
        expect(b).toHaveBeenCalledTimes(2);
        expect(store.get()).toEqual(specB);
    });

    it("skips notify when set with the same reference", () => {
        const store = memoryStore(specA);
        const fn = vi.fn();
        store.subscribe(fn);
        store.set(specA);
        expect(fn).not.toHaveBeenCalled();
    });
});

describe("urlStore", () => {
    afterEach(() => {
        window.history.replaceState(null, "", "/");
    });

    it("reads the current search string and writes with replace by default", () => {
        window.history.replaceState(null, "", "/?filter=status:in:draft");
        const store = urlStore();
        expect(store.get().clauses).toEqual([{ column: "status", op: "in", value: ["draft"] }]);
        store.set(specB);
        expect(window.location.search).toContain("filter=");
        expect(window.location.search).toContain("filterx=or");
        expect(store.get()).toEqual(specB);
    });

    it("uses a custom param and push history", () => {
        window.history.replaceState(null, "", "/");
        const store = urlStore({ param: "f", history: "push" });
        const before = window.history.length;
        store.set(specA);
        expect(window.location.search).toContain("f=");
        expect(window.location.search).not.toContain("filter=");
        expect(window.history.length).toBeGreaterThanOrEqual(before);
    });

    it("preserves unrelated search params", () => {
        window.history.replaceState(null, "", "/?keep=1");
        const store = urlStore({ param: "f" });
        store.set(specA);
        const p = new URLSearchParams(window.location.search);
        expect(p.get("keep")).toBe("1");
        expect(p.getAll("f").length).toBeGreaterThan(0);
        store.set({ clauses: [] });
        expect(new URLSearchParams(window.location.search).get("keep")).toBe("1");
        expect(new URLSearchParams(window.location.search).get("f")).toBeNull();
    });

    it("listens to popstate only while subscribed", () => {
        window.history.replaceState(null, "", "/");
        const store = urlStore({ param: "f" });
        const off = store.subscribe(() => undefined);
        store.set(specA);
        window.history.replaceState(null, "", "/");
        window.dispatchEvent(new PopStateEvent("popstate"));
        expect(store.get().clauses).toEqual([]);
        off();
    });

    it("notifies subscribers after set and popstate", () => {
        window.history.replaceState(null, "", "/");
        const store = urlStore({ param: "f" });
        const fn = vi.fn();
        store.subscribe(fn);
        store.set(specA);
        expect(fn).toHaveBeenCalledTimes(1);
        window.history.replaceState(null, "", "/");
        window.dispatchEvent(new PopStateEvent("popstate"));
        expect(fn).toHaveBeenCalledTimes(2);
    });

    it("unsubscribe stops notifications", () => {
        const store = urlStore({ param: "f" });
        const fn = vi.fn();
        const off = store.subscribe(fn);
        off();
        store.set(specA);
        expect(fn).not.toHaveBeenCalled();
    });

    it("detaches popstate on last unsubscribe and refreshes on resubscribe", () => {
        window.history.replaceState(null, "", "/");
        const store = urlStore({ param: "f" });
        const a = vi.fn();
        const b = vi.fn();
        const offA = store.subscribe(a);
        const offB = store.subscribe(b);
        store.set(specA);
        offA();
        offB();
        window.history.replaceState(null, "", "/?f=cost:gte:10");
        window.dispatchEvent(new PopStateEvent("popstate"));
        expect(store.get()).toEqual(specA);
        store.subscribe(() => undefined);
        expect(store.get().clauses).toEqual([{ column: "cost", op: "gte", value: 10 }]);
    });
});
