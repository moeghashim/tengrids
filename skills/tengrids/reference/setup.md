# Setup

```shell
npm i tengrids
```

Peer deps: `react` / `react-dom` `^16.12.0 || 17.x || 18.x || 19.x`, plus `lodash`, `marked`, `react-responsive-carousel`.

```ts
import { DataEditor } from "tengrids";
import "tengrids/dist/index.css";
```

The grid never holds your data. You pass `columns`, a `rows` count, and `getCellContent([col, row]) => GridCell`.

## Overlay portal

Cell editors portal into `#portal`. Put this as the last child of `<body>`:

```html
<div id="portal" style="position: fixed; left: 0; top: 0; z-index: 9999;"></div>
```

Or pass `portalElementRef`.

## Size

`DataEditor` fills its parent. Give the parent a real width and height, or pass `width`/`height`.

## Next.js

The canvas and overlay editors are client-only:

```tsx
import dynamic from "next/dynamic";

const Grid = dynamic(() => import("../components/Grid"), { ssr: false });
```

## React versions

16.12 through 19 are supported. Do not use React 18-only APIs inside `packages/core`. Consumer apps may use `createRoot` themselves.

Companion packages: `tengrids-cells`, `tengrids-source`, `tengrids-schema`, `tengrids-ai`.
