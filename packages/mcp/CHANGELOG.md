# tengrids-mcp changelog

## Unreleased

- Initial release: stdio MCP server (`npx -y tengrids-mcp`) with `list_docs`, `get_doc`, `search_docs`, `get_example`, `scaffold`, and `check_setup`.
- Docs are bundled at build time into `docs/index.json` (a gitignored artifact). `--refresh` fetches the same files from GitHub Pages and raw GitHub, falling back to the bundle on any failure.
- Resources at `tengrids://docs/<id>` mirror `get_doc`.
- Server version equals the package version.
