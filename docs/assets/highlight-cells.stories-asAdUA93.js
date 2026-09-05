import{R as e}from"./iframe-DJsx_LMI.js";import{D as m}from"./data-editor-all-xo4btEP4.js";import{u as p,d as u,B as S,D as C,P as f}from"./utils-CpGkIYWR.js";import{C as l}from"./image-window-loader-BL-vzFfI.js";import{S as w}from"./story-utils-4UdsftyL.js";import"./preload-helper-Dp1pzeXC.js";import"./throttle-xUL8d2YT.js";import"./flatten-DKU9CJY_.js";import"./scrolling-data-grid-D8pm8eI1.js";import"./marked.esm-B8EVsN7W.js";import"./isArray-C6bsAYrg.js";import"./throttle--dN168Gr.js";const H={title:"Glide-Data-Grid/DataEditor Demos",decorators:[n=>e.createElement(w,null,e.createElement(S,{title:"HighlightCells",description:e.createElement(C,null,"The ",e.createElement(f,null,"highlightRegions")," prop can be set to provide additional hinting or context for the current selection.")},e.createElement(n,null)))]},r=()=>{const{cols:n,getCellContent:h}=p(100),[t,g]=e.useState({columns:l.empty(),rows:l.empty()}),d=e.useMemo(()=>{if(t.current===void 0)return;const[o,i]=t.current.cell;return[{color:"#44BB0022",range:{x:o+2,y:i,width:10,height:10},style:"solid"},{color:"#b000b021",range:{x:o,y:i+2,width:1,height:1}}]},[t]);return e.createElement(m,{...u,rowMarkers:"both",freezeColumns:1,highlightRegions:d,gridSelection:t,onGridSelectionChange:g,getCellContent:h,columns:n,verticalBorder:o=>o>0,rows:1e3})};var s,c,a;r.parameters={...r.parameters,docs:{...(s=r.parameters)==null?void 0:s.docs,source:{originalSource:`() => {
  const {
    cols,
    getCellContent
  } = useMockDataGenerator(100);
  const [gridSelection, setGridSelection] = React.useState<GridSelection>({
    columns: CompactSelection.empty(),
    rows: CompactSelection.empty()
  });
  const highlights = React.useMemo<DataEditorProps["highlightRegions"]>(() => {
    if (gridSelection.current === undefined) return undefined;
    const [col, row] = gridSelection.current.cell;
    return [{
      color: "#44BB0022",
      range: {
        x: col + 2,
        y: row,
        width: 10,
        height: 10
      },
      style: "solid"
    }, {
      color: "#b000b021",
      range: {
        x: col,
        y: row + 2,
        width: 1,
        height: 1
      }
    }];
  }, [gridSelection]);
  return <DataEditor {...defaultProps} rowMarkers="both" freezeColumns={1} highlightRegions={highlights} gridSelection={gridSelection} onGridSelectionChange={setGridSelection} getCellContent={getCellContent} columns={cols} verticalBorder={c => c > 0} rows={1000} />;
}`,...(a=(c=r.parameters)==null?void 0:c.docs)==null?void 0:a.source}}};const _=["HighlightCells"];export{r as HighlightCells,_ as __namedExportsOrder,H as default};
