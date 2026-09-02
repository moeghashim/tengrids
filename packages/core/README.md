# tengrids

A canvas-based React data grid supporting **millions** of rows, **rapid** updating, and **native scrolling**.

tengrids is a fork of [Glide Data Grid](https://github.com/glideapps/glide-data-grid) by [Glide](https://www.glideapps.com). The architecture, rendering engine, and the overwhelming majority of the code are their work, released under the MIT license, which this package retains along with their copyright notice.

- Repository, issues, and full README: https://github.com/moeghashim/tengrids
- API reference: https://moeghashim.github.io/tengrids/API.md
- Live examples (Storybook): https://moeghashim.github.io/tengrids/
- Machine-readable overview for AI agents: https://moeghashim.github.io/tengrids/llms.txt

## Install

```shell
npm i tengrids
```

Peer dependencies you may need: `react` and `react-dom` (16.12 through 19), plus `lodash`, `marked`, and `react-responsive-carousel`.

## Quick start

```tsx
import { DataEditor, GridCellKind } from "tengrids";
import "tengrids/dist/index.css";

const columns = [
    { title: "Name", id: "name", width: 180 },
    { title: "Score", id: "score", width: 90 },
];

function getCellContent([col, row]) {
    const d = data[row];
    return col === 0
        ? { kind: GridCellKind.Text, data: d.name, displayData: d.name, allowOverlay: true }
        : { kind: GridCellKind.Number, data: d.score, displayData: String(d.score), allowOverlay: true };
}

<div style={{ width: "100%", height: 420 }}>
    <DataEditor columns={columns} rows={data.length} getCellContent={getCellContent} />
</div>;
```

Two things the grid needs that fail silently if skipped: a parent with a real width and height (or `width`/`height` props), and a `<div id="portal" />` as the last child of `<body>` for cell editors to mount into. Styling is done through the `theme` prop, not CSS classes — cells are painted on canvas.

Companion packages: [`tengrids-cells`](https://www.npmjs.com/package/tengrids-cells) (extra cell renderers) and [`tengrids-source`](https://www.npmjs.com/package/tengrids-source) (data-source hooks).
