import { AbortError, type AiProvider, type AiRequest, collectCompletion, isAbortError } from "./provider.js";

export interface SchedulerOptions {
    readonly provider: AiProvider;
    /** Maximum in-flight requests. Default 2. */
    readonly concurrency?: number;
    /** Maximum cached answers before the oldest are evicted. Default 1000. */
    readonly cacheSize?: number;
}

export interface RequestOptions {
    /** Receives the accumulated partial answer as it streams. */
    readonly onChunk?: (accumulated: string) => void;
    /** Higher runs first. Visible cells should outrank off-screen ones. Default 0. */
    readonly priority?: number;
}

interface Job {
    readonly key: string;
    readonly input: AiRequest;
    priority: number;
    readonly controller: AbortController;
    readonly chunkListeners: Array<(s: string) => void>;
    readonly resolvers: Array<(s: string) => void>;
    readonly rejecters: Array<(e: unknown) => void>;
    started: boolean;
}

export interface SchedulerStats {
    hits: number;
    misses: number;
    completed: number;
    cancelled: number;
    errors: number;
}

/**
 * Cost control for every feature: identical requests are deduplicated while
 * in flight and cached afterwards, at most `concurrency` run at once, callers
 * can cancel by key or by predicate (e.g. everything outside the visible
 * region), and cancelled work never resolves into the grid.
 */
export class AiScheduler {
    private readonly provider: AiProvider;
    private readonly concurrency: number;
    private readonly cacheSize: number;
    private readonly cache = new Map<string, string>();
    private readonly queue: Job[] = [];
    private readonly inflight = new Map<string, Job>();
    public readonly stats: SchedulerStats = { hits: 0, misses: 0, completed: 0, cancelled: 0, errors: 0 };

    constructor(options: SchedulerOptions) {
        this.provider = options.provider;
        this.concurrency = Math.max(1, options.concurrency ?? 2);
        this.cacheSize = Math.max(1, options.cacheSize ?? 1000);
    }

    /** Cached answer for a key, if any. */
    public get(key: string): string | undefined {
        return this.cache.get(key);
    }

    public has(key: string): boolean {
        return this.cache.has(key);
    }

    public isPending(key: string): boolean {
        return this.inflight.has(key) || this.queue.some(j => j.key === key);
    }

    public get pendingCount(): number {
        return this.inflight.size + this.queue.length;
    }

    public request(key: string, input: AiRequest, options: RequestOptions = {}): Promise<string> {
        const cached = this.cache.get(key);
        if (cached !== undefined) {
            this.stats.hits++;
            return Promise.resolve(cached);
        }
        const existing = this.inflight.get(key) ?? this.queue.find(j => j.key === key);
        if (existing !== undefined) {
            this.stats.hits++;
            if (options.onChunk !== undefined) existing.chunkListeners.push(options.onChunk);
            if ((options.priority ?? 0) > existing.priority) {
                existing.priority = options.priority ?? 0;
                this.sortQueue();
            }
            return new Promise((resolve, reject) => {
                existing.resolvers.push(resolve);
                existing.rejecters.push(reject);
            });
        }
        this.stats.misses++;
        const job: Job = {
            key,
            input,
            priority: options.priority ?? 0,
            controller: new AbortController(),
            chunkListeners: options.onChunk === undefined ? [] : [options.onChunk],
            resolvers: [],
            rejecters: [],
            started: false,
        };
        const promise = new Promise<string>((resolve, reject) => {
            job.resolvers.push(resolve);
            job.rejecters.push(reject);
        });
        this.queue.push(job);
        this.sortQueue();
        this.pump();
        return promise;
    }

    /** Aborts a queued or in-flight request. Waiters reject with AbortError. */
    public cancel(key: string): boolean {
        const qi = this.queue.findIndex(j => j.key === key);
        if (qi !== -1) {
            const [job] = this.queue.splice(qi, 1);
            this.finishCancelled(job);
            return true;
        }
        const job = this.inflight.get(key);
        if (job !== undefined) {
            job.controller.abort();
            return true;
        }
        return false;
    }

    /** Cancels every pending request whose key fails the predicate — e.g. rows that scrolled away. */
    public cancelWhere(shouldCancel: (key: string) => boolean): number {
        const keys = [...this.queue.map(j => j.key), ...this.inflight.keys()].filter(shouldCancel);
        for (const k of keys) this.cancel(k);
        return keys.length;
    }

    public cancelAll(): number {
        return this.cancelWhere(() => true);
    }

    public clearCache(): void {
        this.cache.clear();
    }

    /** Forget one cached answer so the next request asks the model again. */
    public clearKey(key: string): boolean {
        return this.cache.delete(key);
    }

    /** Store an answer without asking the model (e.g. a user-edited result). */
    public prime(key: string, value: string): void {
        this.remember(key, value);
    }

    private sortQueue(): void {
        this.queue.sort((a, b) => b.priority - a.priority);
    }

    private remember(key: string, value: string): void {
        this.cache.delete(key);
        this.cache.set(key, value);
        while (this.cache.size > this.cacheSize) {
            const oldest = this.cache.keys().next().value;
            if (oldest === undefined) break;
            this.cache.delete(oldest);
        }
    }

    private finishCancelled(job: Job): void {
        this.stats.cancelled++;
        for (const r of job.rejecters) r(new AbortError());
    }

    private pump(): void {
        while (this.inflight.size < this.concurrency && this.queue.length > 0) {
            const job = this.queue.shift();
            if (job === undefined) break;
            job.started = true;
            this.inflight.set(job.key, job);
            void this.runJob(job);
        }
    }

    private async runJob(job: Job): Promise<void> {
        try {
            const completion = this.provider.complete(job.input, { signal: job.controller.signal });
            const result = await collectCompletion(
                completion,
                acc => {
                    if (job.controller.signal.aborted) return;
                    for (const l of job.chunkListeners) l(acc);
                },
                job.controller.signal
            );
            if (job.controller.signal.aborted) throw new AbortError();
            this.remember(job.key, result);
            this.stats.completed++;
            for (const r of job.resolvers) r(result);
        } catch (e) {
            if (isAbortError(e) || job.controller.signal.aborted) {
                this.stats.cancelled++;
                for (const r of job.rejecters) r(new AbortError());
            } else {
                this.stats.errors++;
                for (const r of job.rejecters) r(e);
            }
        } finally {
            this.inflight.delete(job.key);
            this.pump();
        }
    }
}
