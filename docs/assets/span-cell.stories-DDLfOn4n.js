import{R as e}from"./iframe-Dnr8FEb7.js";import{D as h}from"./data-editor-all-T61qpa25.js";import{u as y,d as f,B as w,D as S,P as p,M as x}from"./utils-DzmEeguY.js";import{G as d}from"./image-window-loader-Cnvlbs8E.js";import{S as G}from"./story-utils-BfUU3aXg.js";import"./preload-helper-Dp1pzeXC.js";import"./throttle-bg4wIPcC.js";import"./flatten-BiR_gpKC.js";import"./scrolling-data-grid-sKiesypa.js";import"./marked.esm-CHiQR2Yr.js";import"./isArray-DG6spoFr.js";import"./throttle--dN168Gr.js";const P={title:"Glide-Data-Grid/DataEditor Demos",decorators:[r=>e.createElement(G,null,e.createElement(w,{title:"Spans",description:e.createElement(S,null,"By setting the ",e.createElement(p,null,"span")," of a cell you can create spans in your grid. All cells within a span must return consistent data for defined behavior.",e.createElement(x,null,"Spans will always be split if they span frozen and non-frozen columns. By default selections are always expanded to include a span. This can be disabled using the"," ",e.createElement(p,null,"spanRangeBehavior")," prop."))},e.createElement(r,null)))]},a=()=>{const{cols:r,getCellContent:i}=y(100,!0,!0),o=e.useCallback(l=>{const[n,t]=l;return t===6&&n>=3&&n<=4?{kind:d.Text,allowOverlay:!1,data:"Span Cell that is very long and will go past the cell limits",span:[3,4],displayData:"Span Cell that is very long and will go past the cell limits"}:t===5?{kind:d.Text,allowOverlay:!1,data:"Span Cell that is very long and will go past the cell limits",span:[0,99],displayData:"Span Cell that is very long and will go past the cell limits"}:i(l)},[i]),g=e.useCallback(l=>{const n=[];for(let t=l.y;t<l.y+l.height;t++){const c=[];for(let s=l.x;s<l.x+l.width;s++)c.push(o([s,t]));n.push(c)}return n},[o]);return e.createElement(h,{...f,getCellContent:o,getCellsForSelection:g,columns:r,freezeColumns:2,rows:300,rowMarkers:"both"})};var u,m,C;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`() => {
  const {
    cols,
    getCellContent
  } = useMockDataGenerator(100, true, true);
  const mangledGetCellContent = React.useCallback<typeof getCellContent>(cell => {
    const [col, row] = cell;
    if (row === 6 && col >= 3 && col <= 4) {
      return {
        kind: GridCellKind.Text,
        allowOverlay: false,
        data: "Span Cell that is very long and will go past the cell limits",
        span: [3, 4],
        displayData: "Span Cell that is very long and will go past the cell limits"
      };
    }
    if (row === 5) {
      return {
        kind: GridCellKind.Text,
        allowOverlay: false,
        data: "Span Cell that is very long and will go past the cell limits",
        span: [0, 99],
        displayData: "Span Cell that is very long and will go past the cell limits"
      };
    }
    return getCellContent(cell);
  }, [getCellContent]);
  const getCellsForSelection = React.useCallback((selection: Rectangle): CellArray => {
    const result: GridCell[][] = [];
    for (let y = selection.y; y < selection.y + selection.height; y++) {
      const row: GridCell[] = [];
      for (let x = selection.x; x < selection.x + selection.width; x++) {
        row.push(mangledGetCellContent([x, y]));
      }
      result.push(row);
    }
    return result;
  }, [mangledGetCellContent]);
  return <DataEditor {...defaultProps} getCellContent={mangledGetCellContent} getCellsForSelection={getCellsForSelection} columns={cols} freezeColumns={2} rows={300} rowMarkers="both" />;
}`,...(C=(m=a.parameters)==null?void 0:m.docs)==null?void 0:C.source}}};const A=["SpanCell"];export{a as SpanCell,A as __namedExportsOrder,P as default};
