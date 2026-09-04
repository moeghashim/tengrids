// Provider seam + scheduling
export { type AiProvider, type AiRequest, type AiCompletion, type Difficulty, type MockProvider, type MockProviderOptions, AbortError, isAbortError, collectCompletion, createMockProvider } from "./provider.js";

// Provider adapters (each SDK is an optional peer dependency, loaded lazily)
export { type AuthSource } from "./providers/auth.js";
export { createAnthropicProvider, ANTHROPIC_DEFAULT_MODEL, type AnthropicProviderOptions, type ClaudeEffort } from "./providers/anthropic.js";
export { createOpenAiProvider, createCodexProvider, OPENAI_DEFAULT_MODEL, CODEX_DEFAULT_MODEL, type OpenAiProviderOptions, type OpenAiReasoningEffort } from "./providers/openai.js";
export {
    createOpenAiCompatibleProvider, createGrokProvider, createOpenRouterProvider,
    GROK_BASE_URL, GROK_DEFAULT_MODEL, OPENROUTER_BASE_URL, OPENROUTER_DEFAULT_MODEL,
    type OpenAiCompatibleProviderOptions, type GrokProviderOptions, type OpenRouterProviderOptions,
} from "./providers/openai-compatible.js";
export { createRoutingProvider, FEATURE_DIFFICULTY, type RoutingProvider, type RoutingProviderOptions } from "./providers/routing.js";
export { AiScheduler, type SchedulerOptions, type SchedulerStats, type RequestOptions } from "./scheduler.js";

// Feature 1: AI cells (=AI() formulas)
export { AiCellRenderer, aiCell, isAiCell, withAiResult, type AiCell, type AiCellData, type AiCellOptions, type AiCellStatus } from "./ai-cell.js";
export { useAiCells, resolveTemplate, type UseAiCellsOptions, type UseAiCellsResult } from "./use-ai-cells.js";

// Feature 2: natural-language search and filter
export {
    parseFilterSpec, evaluateFilter, matchesClause, literalMatches, specColumns, buildQueryPrompt, findColumnIndex,
    type FilterSpec, type FilterClause, type FilterOp,
} from "./nl-query.js";
export { useCompiledQuery, type UseCompiledQueryOptions, type CompiledQueryResult, type QueryStatus } from "./use-compiled-query.js";
export { useNaturalLanguageSearch, type UseNaturalLanguageSearchOptions, type UseNaturalLanguageSearchResult } from "./use-natural-language-search.js";
export { useNaturalLanguageFilter, type UseNaturalLanguageFilterOptions, type UseNaturalLanguageFilterResult } from "./use-natural-language-filter.js";

// Feature 3: agent-fed data source
export { useAgentDataSource, type UseAgentDataSourceOptions, type UseAgentDataSourceResult, type AgentSourceStatus } from "./use-agent-data-source.js";

// Feature 4: smart paste
export { useSmartPaste, buildSmartPastePrompt, type UseSmartPasteOptions, type UseSmartPasteResult, type UnresolvedPaste } from "./use-smart-paste.js";
export { coerceValue, parseNumber, parseBoolean, normalizeUri } from "./coerce.js";

// Feature 5: bulk edit with preview
export { useBulkEdit, scopeFromSelection, buildBulkEditPrompt, type UseBulkEditOptions, type UseBulkEditResult, type BulkEditProposal, type BulkEditScope, type BulkEditStatus } from "./use-bulk-edit.js";

// Utilities
export { cellText } from "./cell-text.js";
export { extractJson, hashString } from "./json.js";
