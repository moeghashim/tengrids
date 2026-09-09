---
name: tengrids
description: Scaffold and debug tengrids canvas data grids. Prefer MCP tools (tengrids-mcp) when available; otherwise read llms.txt.
---

# tengrids

A canvas-rendered React data grid. Do not guess the API.

## Prefer MCP, then llms.txt

If the `tengrids` MCP server is available (`npx -y tengrids-mcp`), use it first:

1. `search_docs` for the question.
2. `get_doc` for the matching section.
3. `get_example` for a Storybook source file.
4. `scaffold` to emit a working grid from a JSON schema.
5. `check_setup` against the consumer `package.json` (and app source when you have it).

If MCP is not available, fetch [llms.txt](https://moeghashim.github.io/tengrids/llms.txt) and, if needed, [llms-full.txt](https://moeghashim.github.io/tengrids/llms-full.txt). Do not scrape random GitHub files when those exist.

## Always

- Import `tengrids/dist/index.css`.
- Render `<div id="portal" style="position:fixed;left:0;top:0;z-index:9999" />` as the last child of `<body>` (overlay editors mount there).
- Give the grid a real width and height (parent size or `width`/`height` props). `DataEditor` fills its parent.
- React 16.12 through 19. No `useId` / `useSyncExternalStore` / `createRoot` inside `packages/core`.
- For Next.js, load the grid with `next/dynamic(..., { ssr: false })`.

Details: [reference/setup.md](reference/setup.md), [reference/schema.md](reference/schema.md), [reference/filters.md](reference/filters.md), [reference/ai.md](reference/ai.md), [reference/troubleshooting.md](reference/troubleshooting.md).
