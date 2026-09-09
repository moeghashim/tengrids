# tengrids-mcp

stdio [MCP](https://modelcontextprotocol.io) server for [tengrids](https://github.com/moeghashim/tengrids). An agent can search the docs, pull a Storybook example, scaffold a grid from a JSON schema, and check setup (`#portal`, CSS import, React version) without cloning the repository.

```shell
npx -y tengrids-mcp
```

Requires Node 20.10+. Docs are bundled at build time; pass `--refresh` to fetch the live copies from GitHub Pages and raw GitHub at startup (falls back to the bundle on any failure). Fetches only those two origins. Each request is aborted after 5s, at most 8 run at once, and the whole refresh is capped at 20s so a hung origin cannot block stdio startup.

This package is **ESM-only**. The build is a plain `tsc` emit to `dist/` — no linaria, no CJS dual compile — because the server is a Node CLI, not a browser bundle.

## Install in an agent

Claude Code:

```shell
claude mcp add tengrids -- npx -y tengrids-mcp
```

Cursor (`~/.cursor/mcp.json`):

```json
{
    "mcpServers": {
        "tengrids": {
            "command": "npx",
            "args": ["-y", "tengrids-mcp"]
        }
    }
}
```

Codex / other stdio clients: run `npx -y tengrids-mcp` as the server command.

## Tools

| Tool                                              | What it returns                                                      |
| ------------------------------------------------- | -------------------------------------------------------------------- |
| `list_docs`                                       | ids, titles, and sizes of every bundled document                     |
| `get_doc({ id, heading? })`                       | a whole document or one heading                                      |
| `search_docs({ query, limit? })`                  | BM25 over sections: id, heading, score, 300-character excerpt        |
| `get_example({ query })`                          | best-matching `*.stories.tsx` source, title, and Pages URL           |
| `scaffold({ schema, filters?, ai?, framework? })` | a complete TypeScript snippet from `createSchema` + `schema.print()` |
| `check_setup({ packageJson, appSource? })`        | peer deps, CSS import, `#portal`, supported React                    |

Resources: `tengrids://docs/<id>` mirrors `get_doc`.

`scaffold` takes a JSON schema (column key → `{ kind, ...options }`, no function options). It calls `createSchema` / `col.*` from `tengrids-schema` and emits `schema.print()` plus `DataEditor`, optional `useGridFilters` + `FilterRail`, optional `useAiCells`, the CSS import, and `#portal`. `framework: "next"` wraps the grid in `next/dynamic` with `ssr: false`.

## Skill

```shell
npx skills add https://github.com/moeghashim/tengrids --skill tengrids
```

The skill tells an agent to prefer these MCP tools and fall back to [llms.txt](https://moeghashim.github.io/tengrids/llms.txt).

MIT. Part of tengrids, a fork of Glide Data Grid by Glide.
