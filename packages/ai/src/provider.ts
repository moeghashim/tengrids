/**
 * The bring-your-own-model seam. Every feature in tengrids-ai talks to a model
 * exclusively through this interface, so the grid never depends on a vendor
 * SDK: wrap Claude, OpenAI, a local model, or a test double.
 */
export interface AiRequest {
    /** The user-level prompt. Features build this for you. */
    readonly prompt: string;
    /** Optional system instruction the feature wants honored (e.g. "reply with JSON only"). */
    readonly system?: string;
    /** Free-form context a provider may use (row data, column names, feature name). */
    readonly context?: unknown;
    /** Which feature issued the request — useful for routing or telemetry. */
    readonly feature?: "ai-cell" | "search" | "filter" | "smart-paste" | "bulk-edit" | "agent-source" | string;
}

/** A provider may resolve the whole answer at once or stream chunks. */
export type AiCompletion = Promise<string> | AsyncIterable<string>;

export interface AiProvider {
    complete(input: AiRequest, options: { readonly signal: AbortSignal }): AiCompletion;
}

export class AbortError extends Error {
    constructor(message = "The AI request was aborted") {
        super(message);
        this.name = "AbortError";
    }
}

export function isAbortError(e: unknown): boolean {
    return e instanceof Error && e.name === "AbortError";
}

function isAsyncIterable(x: unknown): x is AsyncIterable<string> {
    return x !== null && typeof x === "object" && Symbol.asyncIterator in (x as object);
}

/**
 * Normalizes a completion into a final string, forwarding partial text to
 * `onChunk` as it arrives (the accumulated text so far, not the delta).
 */
export async function collectCompletion(
    completion: AiCompletion,
    onChunk?: (accumulated: string) => void,
    signal?: AbortSignal
): Promise<string> {
    if (!isAsyncIterable(completion)) {
        const result = await completion;
        if (signal?.aborted === true) throw new AbortError();
        return result;
    }
    let acc = "";
    for await (const chunk of completion) {
        if (signal?.aborted === true) throw new AbortError();
        acc += chunk;
        onChunk?.(acc);
    }
    return acc;
}

export interface MockProviderOptions {
    /** Delay before the answer (or between streamed chunks) in ms. Works with fake timers. */
    readonly delayMs?: number;
}

export interface MockProvider extends AiProvider {
    /** Every request received, in order. */
    readonly calls: AiRequest[];
}

function wait(ms: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        if (signal.aborted) return reject(new AbortError());
        const t = setTimeout(() => {
            signal.removeEventListener("abort", onAbort);
            resolve();
        }, ms);
        const onAbort = () => {
            clearTimeout(t);
            reject(new AbortError());
        };
        signal.addEventListener("abort", onAbort, { once: true });
    });
}

/**
 * A deterministic provider for tests, Storybook, and offline demos. `respond`
 * returns the full answer as a string, or an array of chunks to stream.
 */
export function createMockProvider(
    respond: (input: AiRequest) => string | readonly string[],
    options: MockProviderOptions = {}
): MockProvider {
    const delayMs = options.delayMs ?? 0;
    const calls: AiRequest[] = [];
    return {
        calls,
        complete(input, { signal }) {
            calls.push(input);
            const answer = respond(input);
            if (typeof answer === "string") {
                return (async () => {
                    if (delayMs > 0) await wait(delayMs, signal);
                    if (signal.aborted) throw new AbortError();
                    return answer;
                })();
            }
            const chunks = answer;
            return (async function* () {
                for (const c of chunks) {
                    if (delayMs > 0) await wait(delayMs, signal);
                    if (signal.aborted) throw new AbortError();
                    yield c;
                }
            })();
        },
    };
}
