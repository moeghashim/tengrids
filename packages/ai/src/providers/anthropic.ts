import type { AiProvider, Difficulty } from "../provider.js";
import { type AuthSource, resolveOptionalAuth } from "./auth.js";

export type ClaudeEffort = "low" | "medium" | "high" | "xhigh" | "max";

export interface AnthropicProviderOptions {
    /** API key (`x-api-key`). Omit to let the SDK resolve credentials from the environment (Node only). */
    readonly apiKey?: AuthSource;
    /** OAuth bearer token (`ANTHROPIC_AUTH_TOKEN` / `ant auth login` tokens) — alternative to `apiKey`. */
    readonly authToken?: AuthSource;
    /** Default `claude-opus-5`. */
    readonly model?: string;
    /** Default 4096 — grid cells are short; raise it for long-form columns. */
    readonly maxTokens?: number;
    /** Fixed effort. When omitted, the request's `difficulty` maps low→low, medium→medium, high→high (API default otherwise). */
    readonly effort?: ClaudeEffort;
    /**
     * Server-side refusal fallbacks (beta). Default `"default"` on Claude Opus 5 / Fable 5.x: a policy
     * decline re-runs the request on a fallback model inside the same call. Pass `false` to disable.
     */
    readonly fallbacks?: "default" | false;
    readonly baseURL?: string;
    /** Required to call the API from a browser (keys are then visible to the page). */
    readonly dangerouslyAllowBrowser?: boolean;
    /** Honor `AiRequest.model` (default true). */
    readonly allowModelOverride?: boolean;
    /** System text prepended to every request's own `system`. */
    readonly system?: string;
}

const DIFFICULTY_EFFORT: Record<Difficulty, ClaudeEffort> = { low: "low", medium: "medium", high: "high" };
const FALLBACK_MODELS = /^claude-(opus-5|fable-5)/;
export const ANTHROPIC_DEFAULT_MODEL = "claude-opus-5";

/**
 * Claude through the official `@anthropic-ai/sdk` (loaded lazily — install it
 * to use this adapter). Streams text deltas; `difficulty` becomes `effort`.
 */
export function createAnthropicProvider(options: AnthropicProviderOptions = {}): AiProvider {
    const { maxTokens = 4096, allowModelOverride = true } = options;
    return {
        complete(input, { signal }) {
            return (async function* () {
                const { default: Anthropic } = await import("@anthropic-ai/sdk");
                const client = new Anthropic({
                    apiKey: await resolveOptionalAuth(options.apiKey),
                    authToken: await resolveOptionalAuth(options.authToken),
                    baseURL: options.baseURL,
                    dangerouslyAllowBrowser: options.dangerouslyAllowBrowser,
                });
                const model = (allowModelOverride ? input.model : undefined) ?? options.model ?? ANTHROPIC_DEFAULT_MODEL;
                const effort = options.effort ?? (input.difficulty === undefined ? undefined : DIFFICULTY_EFFORT[input.difficulty]);
                const system = [options.system, input.system].filter((s): s is string => s !== undefined && s !== "").join("\n\n");
                const params = {
                    model,
                    max_tokens: maxTokens,
                    ...(system === "" ? {} : { system }),
                    ...(effort === undefined ? {} : { output_config: { effort } }),
                    messages: [{ role: "user" as const, content: input.prompt }],
                };
                const useFallbacks = options.fallbacks !== false && FALLBACK_MODELS.test(model);
                const stream = useFallbacks
                    ? client.beta.messages.stream(
                          { ...params, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" } as unknown as Parameters<typeof client.beta.messages.stream>[0],
                          { signal }
                      )
                    : client.messages.stream(params, { signal });
                for await (const event of stream) {
                    if (event.type === "content_block_delta" && event.delta.type === "text_delta") yield event.delta.text;
                }
                const final = await stream.finalMessage();
                if (final.stop_reason === "refusal") {
                    const category = (final as { stop_details?: { category?: string | null } }).stop_details?.category;
                    throw new Error(`Claude declined this request${category !== undefined && category !== null && category !== "" ? ` (${category})` : ""}`);
                }
            })();
        },
    };
}
