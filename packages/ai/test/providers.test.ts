import { describe, expect, it, vi, beforeEach } from "vitest";
import { collectCompletion } from "../src/provider.js";
import { createAnthropicProvider } from "../src/providers/anthropic.js";
import { createCodexProvider, createOpenAiProvider } from "../src/providers/openai.js";
import { createGrokProvider, createOpenAiCompatibleProvider, createOpenRouterProvider } from "../src/providers/openai-compatible.js";

// ---- SDK doubles: record constructor + call params, stream canned deltas ----
const anthropicState = vi.hoisted(() => ({ ctor: [] as unknown[], calls: [] as Array<{ ns: string; params: any }>, stopReason: "end_turn" as string, category: undefined as string | undefined }));
const openaiState = vi.hoisted(() => ({ ctor: [] as unknown[], responses: [] as any[], chats: [] as any[] }));

vi.mock("@anthropic-ai/sdk", () => {
    function makeStream(ns: string, params: any) {
        anthropicState.calls.push({ ns, params });
        const events = [
            { type: "message_start" },
            { type: "content_block_delta", delta: { type: "text_delta", text: "Hel" } },
            { type: "content_block_delta", delta: { type: "thinking_delta", thinking: "…" } },
            { type: "content_block_delta", delta: { type: "text_delta", text: "lo" } },
        ];
        const stream = {
            [Symbol.asyncIterator]: async function* () {
                for (const e of events) yield e;
            },
            finalMessage: async () => ({ stop_reason: anthropicState.stopReason, stop_details: anthropicState.category === undefined ? null : { type: "refusal", category: anthropicState.category } }),
        };
        return stream;
    }
    class Anthropic {
        messages = { stream: (params: any) => makeStream("messages", params) };
        beta = { messages: { stream: (params: any) => makeStream("beta.messages", params) } };
        constructor(opts: unknown) {
            anthropicState.ctor.push(opts);
        }
    }
    return { default: Anthropic };
});

vi.mock("openai", () => {
    class OpenAI {
        responses = {
            create: async (params: any) => {
                openaiState.responses.push(params);
                return (async function* () {
                    yield { type: "response.created" };
                    yield { type: "response.output_text.delta", delta: "Hi " };
                    yield { type: "response.output_text.delta", delta: "there" };
                    yield { type: "response.completed" };
                })();
            },
        };
        chat = {
            completions: {
                create: async (params: any) => {
                    openaiState.chats.push(params);
                    return (async function* () {
                        yield { choices: [{ delta: { role: "assistant" } }] };
                        yield { choices: [{ delta: { content: "Gr" } }] };
                        yield { choices: [{ delta: { content: "ok" } }] };
                        yield { choices: [{ delta: {}, finish_reason: "stop" }] };
                    })();
                },
            },
        };
        constructor(opts: unknown) {
            openaiState.ctor.push(opts);
        }
    }
    return { default: OpenAI };
});

const signal = () => new AbortController().signal;
const run = (p: { complete: any }, input: any) => collectCompletion(p.complete(input, { signal: signal() }));

beforeEach(() => {
    anthropicState.ctor.length = 0;
    anthropicState.calls.length = 0;
    anthropicState.stopReason = "end_turn";
    anthropicState.category = undefined;
    openaiState.ctor.length = 0;
    openaiState.responses.length = 0;
    openaiState.chats.length = 0;
});

describe("createAnthropicProvider", () => {
    it("streams text deltas only, defaults to claude-opus-5 with server-side fallbacks, maps difficulty to effort", async () => {
        const p = createAnthropicProvider({ apiKey: "sk-test", system: "Be brief." });
        const text = await run(p, { prompt: "Say hi", system: "Reply in French.", difficulty: "high" });
        expect(text).toBe("Hello");
        expect(anthropicState.ctor[0]).toMatchObject({ apiKey: "sk-test" });
        const call = anthropicState.calls[0];
        expect(call.ns).toBe("beta.messages");
        expect(call.params).toMatchObject({
            model: "claude-opus-5",
            max_tokens: 4096,
            system: "Be brief.\n\nReply in French.",
            output_config: { effort: "high" },
            betas: ["server-side-fallback-2026-07-01"],
            fallbacks: "default",
            messages: [{ role: "user", content: "Say hi" }],
        });
    });

    it("honors a model override, disables fallbacks off the opus-5/fable family, and resolves auth from a token getter", async () => {
        const p = createAnthropicProvider({ authToken: async () => "oauth-123", effort: "xhigh", maxTokens: 512 });
        await run(p, { prompt: "x", model: "claude-haiku-4-5", difficulty: "low" });
        expect(anthropicState.ctor[0]).toMatchObject({ authToken: "oauth-123" });
        const call = anthropicState.calls[0];
        expect(call.ns).toBe("messages"); // haiku is outside the fallback family
        expect(call.params).toMatchObject({ model: "claude-haiku-4-5", max_tokens: 512, output_config: { effort: "xhigh" } });
        expect(call.params.betas).toBeUndefined();
    });

    it("can be pinned to its own model and can opt out of fallbacks", async () => {
        const p = createAnthropicProvider({ apiKey: "k", model: "claude-sonnet-5", allowModelOverride: false, fallbacks: false });
        await run(p, { prompt: "x", model: "claude-opus-5" });
        expect(anthropicState.calls[0]).toMatchObject({ ns: "messages", params: { model: "claude-sonnet-5" } });
        expect(anthropicState.calls[0].params.output_config).toBeUndefined();
    });

    it("surfaces a refusal as an error naming the category", async () => {
        anthropicState.stopReason = "refusal";
        anthropicState.category = "cyber";
        const p = createAnthropicProvider({ apiKey: "k" });
        await expect(run(p, { prompt: "x" })).rejects.toThrow(/declined.*\(cyber\)/);
    });
});

describe("createOpenAiProvider / createCodexProvider", () => {
    it("uses the Responses API with instructions and reasoning effort from difficulty", async () => {
        const p = createOpenAiProvider({ apiKey: "sk-o", system: "Sys." });
        expect(await run(p, { prompt: "Q", system: "More.", difficulty: "medium" })).toBe("Hi there");
        expect(openaiState.ctor[0]).toMatchObject({ apiKey: "sk-o" });
        expect(openaiState.responses[0]).toMatchObject({ model: "gpt-5", input: "Q", instructions: "Sys.\n\nMore.", reasoning: { effort: "medium" }, stream: true });
    });
    it("codex defaults to gpt-5-codex and still honors overrides", async () => {
        const p = createCodexProvider({ apiKey: "k", maxOutputTokens: 900 });
        await run(p, { prompt: "x" });
        expect(openaiState.responses[0]).toMatchObject({ model: "gpt-5-codex", max_output_tokens: 900 });
        await run(p, { prompt: "x", model: "gpt-5" });
        expect(openaiState.responses[1].model).toBe("gpt-5");
    });
    it("fails clearly without a key", async () => {
        const p = createOpenAiProvider({});
        await expect(run(p, { prompt: "x" })).rejects.toThrow(/OpenAI: no API key/);
    });
});

describe("OpenAI-compatible: Grok, OpenRouter, generic", () => {
    it("Grok talks chat completions at api.x.ai with grok-4", async () => {
        const p = createGrokProvider({ apiKey: "xai", system: "S" });
        expect(await run(p, { prompt: "hi" })).toBe("Grok");
        expect(openaiState.ctor[0]).toMatchObject({ apiKey: "xai", baseURL: "https://api.x.ai/v1" });
        expect(openaiState.chats[0]).toMatchObject({ model: "grok-4", stream: true, messages: [{ role: "system", content: "S" }, { role: "user", content: "hi" }] });
    });
    it("OpenRouter sets attribution headers and model fallbacks", async () => {
        const p = createOpenRouterProvider({ apiKey: "or", model: "anthropic/claude-opus-5", fallbackModels: ["openai/gpt-5"], site: { url: "https://example.com", title: "tengrids" } });
        await run(p, { prompt: "hi" });
        expect(openaiState.ctor[0]).toMatchObject({ baseURL: "https://openrouter.ai/api/v1", defaultHeaders: { "HTTP-Referer": "https://example.com", "X-Title": "tengrids" } });
        expect(openaiState.chats[0]).toMatchObject({ model: "anthropic/claude-opus-5", models: ["anthropic/claude-opus-5", "openai/gpt-5"] });
        const auto = createOpenRouterProvider({ apiKey: "or" });
        await run(auto, { prompt: "hi" });
        expect(openaiState.chats[1].model).toBe("openrouter/auto");
    });
    it("generic adapter forwards temperature, max_tokens, extra body, and model overrides", async () => {
        const p = createOpenAiCompatibleProvider({ apiKey: "k", baseURL: "https://llm.local/v1", model: "local-7b", temperature: 0.2, maxTokens: 100, extraBody: { top_k: 5 } });
        await run(p, { prompt: "hi", model: "local-70b" });
        expect(openaiState.chats[0]).toMatchObject({ model: "local-70b", temperature: 0.2, max_tokens: 100, top_k: 5 });
    });
});
