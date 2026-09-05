> Part of [tengrids](https://github.com/moeghashim/tengrids), a fork of [Glide Data Grid](https://github.com/glideapps/glide-data-grid) by Glide (MIT). Install with `npm i tengrids-cells`; requires `tengrids` at the same version.

<h1 align="center">
  <img src="https://raw.githubusercontent.com/glideapps/glide-data-grid/master/icon.png" width="224px"/><br/>
  <b>Glide Data Grid Cells</b>
</h1>
<p align="center">Additional cells and features for Glide Data Grid</p>

[![Version](https://img.shields.io/npm/v/tengrids-cells?color=blue&label=latest&style=for-the-badge)](https://github.com/glideapps/glide-data-grid/releases)
[![React 16+](https://img.shields.io/badge/React-16+-00ADD8?style=for-the-badge&logo=react)](https://reactjs.org)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/tengrids-cells?color=success&label=bundle&style=for-the-badge)](https://bundlephobia.com/package/tengrids-cells)
[![License](https://img.shields.io/github/license/glideapps/glide-data-grid?color=red&style=for-the-badge)](https://github.com/glideapps/glide-data-grid/blob/main/LICENSE)
[![Made By Glide](https://img.shields.io/badge/❤_Made_by-Glide-11CCE5?style=for-the-badge&logo=none)](https://www.glideapps.com/jobs)

![Data Grid](https://raw.githubusercontent.com/glideapps/glide-data-grid/master/data-grid.jpg)

Current cells

-   Star (Rating) Cell
-   Sparklines
-   Article
-   Dropdown
-   Range
-   User profile
-   Tags

# Usage

Step 1: Import the cell renderers you want to use and pass them to the grid.

```tsx
import { allCells } from "tengrids-cells";

const Grid = () => {
    return <DataEditor customRenderers={allCells} {...rest} />;
};
```

Step 2: Use the cells in your `getCellContent` callback

```ts
import type { StarCell } from "tengrids-cells";

const getCellContent = React.useCallback(() => {
    const starCell: StarCell = {
        kind: GridCellKind.Custom,
        allowOverlay: true,
        copyData: "4 out of 5",
        data: {
            kind: "star-cell",
            label: "Test",
            rating: 4,
        },
    };

    return starCell;
}, []);
```

## Note on ArticleCell

The ArticleCell uses `@toast-ui/editor` to provide its editor. To make sure it works correctly your project will need to import the css file it depends on.

```
import "@toast-ui/editor/dist/toastui-editor.css";
```

### Security note

`@toast-ui/editor` 3.2.2 (its last release, February 2023) bundles its own copy of DOMPurify **2.3.3** inside its dist files instead of importing the `dompurify` package it lists as a dependency. That inlined sanitizer is what runs when an `ArticleCell` renders markdown, and it predates several published DOMPurify advisories. Treat article content as trusted, or sanitize it yourself before it reaches the cell. Overriding the `dompurify` package version in your project (this repository does so with an npm `overrides` entry) only updates the unused on-disk copy: it silences `npm audit`, it does not change what runs.
