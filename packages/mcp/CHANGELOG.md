# tengrids-mcp changelog

## Unreleased

- Initial release: stdio MCP server (`npx -y tengrids-mcp`) with `list_docs`, `get_doc`, `search_docs`, `get_example`, `scaffold`, and `check_setup`.
- Docs are bundled at build time into `docs/index.json` (a gitignored artifact). `--refresh` fetches the same files from GitHub Pages and raw GitHub, falling back to the bundle on any failure.
- Resources at `tengrids://docs/<id>` mirror `get_doc`.
- Server version equals the package version.
- Review follow-up: library entry is `dist/index.js` (CLI is `bin` only); `--refresh` has 5s/request and 20s total timeouts; search indexes once per bundle, splits camelCase, and uses a documented synonym table; `scaffold` remaps filtered edits, quotes sample keys, validates kind-specific options; `check_setup` covers every core peer.
