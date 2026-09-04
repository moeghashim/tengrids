import type { AiProvider } from "../provider.js";
import { type AuthSource, resolveAuth } from "./auth.js";

export interface OpenAiCompatibleProviderOptions {
    readonly apiKey?: AuthSource;
    /** The service's OpenAI-compatible base URL, e.g. `https://api.x.ai/v1`. */
    readonly baseURL: string;
    readonly model: string;
    readonly defaultHeaders?: Record<string, string>;
    readonly maxTokens?: number;
    readonly temperature?: number;
    readonly dangerouslyAllowBrowser?: boolean;
    readonly allowModelOverride?: boolean;
    readonly system?: string;
    /** Extra JSON merged into the chat-completions body (vendor extensions). */
    readonly extraBody?: Record<string, unknown>;
    /** Name used in error messages. */
    readonly label?: string;
}

/**
 * Any OpenAI-compatible chat-completions endpoint through the official `openai`
 * SDK with a custom `baseURL` (loaded lazily). Grok and OpenRouter build on this.
 */
export function createOpenAiCompatibleProvider(options: OpenAiCompatibleProviderOptions): AiProvider {
    const { allowModelOverride = true, label = "OpenAI-compatible provider" } = options;
    return {
        complete(input, { signal }) {
            return (async function* () {
                const { default: OpenAI } = await import("openai");
                const client = new OpenAI({
                    apiKey: await resolveAuth(options.apiKey, label),
                    baseURL: options.baseURL,
                    defaultHeaders: options.defaultHeaders,
                    dangerouslyAllowBrowser: options.dangerouslyAllowBrowser,
                });
                const model = (allowModelOverride ? input.model : undefined) ?? options.model;
                const system = [options.system, input.system].filter((s): s is string => s !== undefined && s !== "").join("\n\n");
                const messages = [
                    ...(system === "" ? [] : [{ role: "system" as const, content: system }]),
                    { role: "user" as const, content: input.prompt },
                ];
                const stream = await client.chat.completions.create(
                    {
                        model,
                        messages,
                        stream: true,
                        ...(options.maxTokens === undefined ? {} : { max_tokens: options.maxTokens }),
                        ...(options.temperature === undefined ? {} : { temperature: options.temperature }),
                        ...(options.extraBody ?? {}),
                    },
                    { signal }
                );
                for await (const chunk of stream) {
                    const text = chunk.choices?.[0]?.delta?.content;
                    if (typeof text === "string" && text !== "") yield text;
                }
            })();
        },
    };
}

export const GROK_BASE_URL = "https://api.x.ai/v1";
export const GROK_DEFAULT_MODEL = "grok-4";

export interface GrokProviderOptions extends Partial<Omit<OpenAiCompatibleProviderOptions, "model">> {
    /** Default `grok-4`. */
    readonly model?: string;
}

/** xAI Grok — OpenAI-compatible at api.x.ai. */
export function createGrokProvider(options: GrokProviderOptions = {}): AiProvider {
    return createOpenAiCompatibleProvider({ ...options, baseURL: options.baseURL ?? GROK_BASE_URL, model: options.model ?? GROK_DEFAULT_MODEL, label: "Grok" });
}

export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
export const OPENROUTER_DEFAULT_MODEL = "openrouter/auto";

export interface OpenRouterProviderOptions extends Partial<Omit<OpenAiCompatibleProviderOptions, "model">> {
    /** An OpenRouter model id such as `anthropic/claude-opus-5` or `openrouter/auto` (default). */
    readonly model?: string;
    /** Sent as HTTP-Referer / X-Title so your app shows up on openrouter.ai. */
    readonly site?: { readonly url?: string; readonly title?: string };
    /** Ordered fallback models if the primary is unavailable (OpenRouter's `models` field). */
    readonly fallbackModels?: readonly string[];
}

/** OpenRouter — one key, hundreds of models, OpenAI-compatible. */
export function createOpenRouterProvider(options: OpenRouterProviderOptions = {}): AiProvider {
    const headers: Record<string, string> = { ...(options.defaultHeaders ?? {}) };
    if (options.site?.url !== undefined) headers["HTTP-Referer"] = options.site.url;
    if (options.site?.title !== undefined) headers["X-Title"] = options.site.title;
    const primary = options.model ?? OPENROUTER_DEFAULT_MODEL;
    const extraBody = { ...(options.extraBody ?? {}), ...(options.fallbackModels === undefined ? {} : { models: [primary, ...options.fallbackModels] }) };
    return createOpenAiCompatibleProvider({ ...options, baseURL: options.baseURL ?? OPENROUTER_BASE_URL, model: primary, defaultHeaders: headers, extraBody, label: "OpenRouter" });
}
