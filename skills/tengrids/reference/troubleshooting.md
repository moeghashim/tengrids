# Troubleshooting

## Nothing shows up

1. Parent has no width/height — `DataEditor` fills its parent. Set size on the parent or pass `width`/`height`.
2. Missing `import "tengrids/dist/index.css"`.
3. Missing `#portal` — not required to _paint_ the canvas, but editors will fail. See [setup.md](setup.md).
4. Next.js rendered the grid on the server — wrap with `dynamic(..., { ssr: false })`.

The API.md **HTML/CSS Prerequisites** section covers (1)–(3).

## Crash on edit

Overlay editors mount into `#portal`. If it is missing, editing throws. Add the portal div or `portalElementRef`.

## Theme / dark mode

The canvas is not styled with CSS classes. Pass a `theme` object (`accentColor`, `bgCell`, `textDark`, `fontFamily`, …). CSS variables `--gdg-*` are emitted for DOM overlays (editors, search, `FilterRail`). Keep the canvas theme and those variables in sync.

## Invalid edits rejected

`useSchemaGrid` / `schema.applyEdit` return `undefined` for invalid values (letters in a number, enum outside `values`, bad date). The row does not change.
