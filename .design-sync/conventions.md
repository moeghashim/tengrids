# Building with tengrids (Glide Data Grid)

This library is one powerful component — `DataEditor`, a canvas-rendered data grid for up to millions of rows — plus the enums and helpers it needs. It is not a widget kit: build your page layout with your own HTML/CSS and mount `DataEditor` where tabular data lives.

## Setup that breaks silently if skipped

1. **Size the grid explicitly.** `DataEditor` fills its parent; an unsized parent renders nothing. Wrap it in a container with a real width and height (e.g. `style={{ width: "100%", height: 400 }}`), or pass `width`/`height` props.
2. **Add a portal div once per page**: `<div id="portal" style="position:fixed;top:0;left:0;z-index:9999" />` as the LAST child of `<body>`. Cell editing overlays mount into it; without it, activating a cell throws.
3. The stylesheet ships via this design system's `styles.css` — no extra CSS import is needed here.

## Styling idiom: the `theme` prop, never CSS classes

The grid paints on canvas — CSS classes and selectors do NOT style cells. Pass a partial theme object; unlisted keys keep their defaults:

- Colors: `accentColor`, `accentLight`, `textDark`, `textMedium`, `textLight`, `bgCell`, `bgCellMedium`, `bgHeader`, `bgHeaderHovered`, `bgHeaderHasFocus`, `textHeader`, `bgGroupHeader`, `textGroupHeader`, `borderColor`, `horizontalBorderColor`, `linkColor`, `bgSearchResult`, `bgBubble`, `drilldownBorder`
- Type: `fontFamily`, `baseFontStyle` (e.g. `"13px"`), `headerFontStyle` (e.g. `"600 13px"`), `lineHeight`, `editorFontSize`
- Metrics: `cellHorizontalPadding`, `cellVerticalPadding`, `headerIconSize`, `roundingRadius`

Per-scope overrides: `themeOverride` on a column, `getRowThemeOverride` prop for rows, `themeOverride` on an individual cell.

## Data flows through callbacks, not arrays

The grid asks for cells: give it `columns` (`{title, id, width}`), `rows` (a count), and `getCellContent([col, row]) => GridCell`. Cell kinds come from `GridCellKind`: `Text`, `Number`, `Boolean`, `Uri`, `Image`, `Markdown`, `Bubble`, `Drilldown`, `RowID`, `Loading`, `Protected`. Editing: set `allowOverlay: true` on cells and handle `onCellEdited`. Useful props seen in the demos: `rowMarkers="both"`, `showSearch`, `freezeColumns`, `onColumnResize`, `getCellsForSelection={true}` (enables copy).

## Idiomatic example

```tsx
const G = window.GlideappsGlideDataGrid;
const columns = [{ title: "Name", id: "name", width: 180 }, { title: "Score", id: "score", width: 90 }];
const rows = data.length;
const getCellContent = ([col, row]) => {
  const d = data[row];
  return col === 0
    ? { kind: G.GridCellKind.Text, data: d.name, displayData: d.name, allowOverlay: true }
    : { kind: G.GridCellKind.Number, data: d.score, displayData: String(d.score), allowOverlay: true };
};
<div style={{ width: "100%", height: 420 }}>
  <G.DataEditor columns={columns} rows={rows} getCellContent={getCellContent}
    rowMarkers="number" smoothScrollX smoothScrollY
    theme={{ accentColor: "#4F5DFF", bgHeader: "#F7F7F8", fontFamily: "Inter, sans-serif" }}
    onCellEdited={(cell, newValue) => update(cell, newValue)} />
</div>
```

`getDefaultTheme()`, `CompactSelection` (row/column selection sets), and `GridColumnIcon` (header icons) are also exported. Read `components/glide-data-grid/DataEditor/DataEditor.prompt.md` and `DataEditor.d.ts` for the full prop surface before going beyond this pattern.
