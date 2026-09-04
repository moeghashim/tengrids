import type { AiProvider, AiRequest, Difficulty } from "../provider.js";

export interface RoutingProviderOptions {
    /** Used when nothing more specific matches. */
    readonly default: AiProvider;
    /** Per-difficulty tiers. A missing tier falls back to `default`. */
    readonly low?: AiProvider;
    readonly medium?: AiProvider;
    readonly high?: AiProvider;
    /** Explicit model names → providers; wins over the difficulty tier when a request names a model. */
    readonly models?: Readonly<Record<string, AiProvider>>;
    /** Difficulty assumed for requests that don't state one (default: per feature, see FEATURE_DIFFICULTY). */
    readonly fallbackDifficulty?: Difficulty;
}

export interface RoutingProvider extends AiProvider {
    /** Which provider a request would go to — handy for UI ("this cell uses Opus") and tests. */
    readonly route: (input: AiRequest) => { readonly provider: AiProvider; readonly via: "model" | Difficulty | "default" };
}

/** What each feature asks for when a request doesn't say. */
export const FEATURE_DIFFICULTY: Readonly<Record<string, Difficulty>> = {
    "ai-cell": "medium",
    search: "low",
    filter: "low",
    "smart-paste": "low",
    "bulk-edit": "high",
    "agent-source": "medium",
};

/**
 * One provider that fans out by difficulty and by explicit model name — so a
 * cheap model handles search compilation and paste fix-ups, a strong one
 * handles bulk edits, and a cell can still pin a specific model.
 */
export function createRoutingProvider(options: RoutingProviderOptions): RoutingProvider {
    const route: RoutingProvider["route"] = input => {
        if (input.model !== undefined && options.models?.[input.model] !== undefined) {
            return { provider: options.models[input.model], via: "model" };
        }
        const difficulty = input.difficulty ?? options.fallbackDifficulty ?? (input.feature === undefined ? undefined : FEATURE_DIFFICULTY[input.feature]);
        if (difficulty !== undefined && options[difficulty] !== undefined) return { provider: options[difficulty] as AiProvider, via: difficulty };
        return { provider: options.default, via: "default" };
    };
    return {
        route,
        complete(input, opts) {
            return route(input).provider.complete(input, opts);
        },
    };
}
