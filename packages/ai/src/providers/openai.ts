import type { AiProvider, Difficulty } from "../provider.js";
import { type AuthSource, resolveAuth } from "./auth.js";

export type OpenAiReasoningEffort = "low" | "medium" | "high";

export interface OpenAiProviderOptions {
    readonly apiKey?: AuthSource;
    /** Default `gpt-5` (`createCodexProvider` defaults to `gpt-5-codex`). */
    readonly model?: string;
    readonly baseURL?: string;
    readonly organization?: string;
    /** Fixed reasoning effort. When omitted, the request's `difficulty` maps 1:1. */
    readonly reasoningEffort?: OpenAiReasoningEffort;
    readonly maxOutputTokens?: number;
    readonly dangerouslyAllowBrowser?: boolean;
    readonly allowModelOverride?: boolean;
    readonly system?: string;
}

export const OPENAI_DEFAULT_MODEL = "gpt-5";
export const CODEX_DEFAULT_MODEL = "gpt-5-codex";

/**
 * OpenAI through the official `openai` SDK's Responses API (loaded lazily).
 * Works for GPT-5 and the Codex models; `difficulty` becomes `reasoning.effort`.
 */
export function createOpenAiProvider(options: OpenAiProviderOptions = {}): AiProvider {
    const { allowModelOverride = true } = options;
    return {
        complete(input, { signal }) {
            return (async function* () {
                const { default: OpenAI } = await import("openai");
                const client = new OpenAI({
                    apiKey: await resolveAuth(options.apiKey, "OpenAI"),
                    baseURL: options.baseURL,
                    organization: options.organization,
                    dangerouslyAllowBrowser: options.dangerouslyAllowBrowser,
                });
                const model = (allowModelOverride ? input.model : undefined) ?? options.model ?? OPENAI_DEFAULT_MODEL;
                const effort = options.reasoningEffort ?? (input.difficulty as Difficulty | undefined);
                const instructions = [options.system, input.system].filter((s): s is string => s !== undefined && s !== "").join("\n\n");
                const stream = await client.responses.create(
                    {
                        model,
                        input: input.prompt,
                        ...(instructions === "" ? {} : { instructions }),
                        ...(effort === undefined ? {} : { reasoning: { effort } }),
                        ...(options.maxOutputTokens === undefined ? {} : { max_output_tokens: options.maxOutputTokens }),
                        stream: true,
                    },
                    { signal }
                );
                for await (const event of stream) {
                    if (event.type === "response.output_text.delta") yield event.delta;
                }
            })();
        },
    };
}

/** OpenAI's Codex models (default `gpt-5-codex`) — same Responses API adapter. */
export function createCodexProvider(options: OpenAiProviderOptions = {}): AiProvider {
    return createOpenAiProvider({ model: CODEX_DEFAULT_MODEL, ...options });
}
