# AI (`tengrids-ai`)

Bring your own model. Nothing depends on a vendor SDK at runtime.

```ts
import type { AiProvider } from "tengrids-ai";

const provider: AiProvider = {
    async complete({ prompt, system }, { signal }) {
        const res = await fetch("/api/ai", {
            method: "POST",
            body: JSON.stringify({ prompt, system }),
            signal,
        });
        return (await res.json()).text;
    },
};
```

| Feature       | Hook                                                               |
| ------------- | ------------------------------------------------------------------ |
| Formula cells | `useAiCells` + `aiCell("Summarize {Notes} for {Name}")`            |
| NL search     | `useNaturalLanguageSearch`                                         |
| NL filter     | `useNaturalLanguageFilter` (`onSpec` writes into `useGridFilters`) |
| Agent rows    | `useAgentDataSource`                                               |
| Smart paste   | `useSmartPaste` / `coerceValue`                                    |
| Bulk edit     | `useBulkEdit`                                                      |

Optional adapters: `createAnthropicProvider`, `createOpenAiProvider`, `createGrokProvider`, `createOpenRouterProvider`, `createRoutingProvider`. Install the vendor SDK only if you use that adapter.

Never ship API keys to the browser; call from a backend.
