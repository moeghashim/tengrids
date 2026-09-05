import{R as e}from"./iframe-DJsx_LMI.js";import{C as a,u as f}from"./image-window-loader-BL-vzFfI.js";import{D as w}from"./data-editor-all-xo4btEP4.js";import{a as y,d as E,B as g,D,P as K,M as R,K as l}from"./utils-CpGkIYWR.js";import{S as v}from"./story-utils-4UdsftyL.js";import"./preload-helper-Dp1pzeXC.js";import"./throttle-xUL8d2YT.js";import"./marked.esm-B8EVsN7W.js";import"./flatten-DKU9CJY_.js";import"./scrolling-data-grid-D8pm8eI1.js";import"./isArray-C6bsAYrg.js";import"./throttle--dN168Gr.js";const x={title:"Glide-Data-Grid/DataEditor Demos",decorators:[n=>e.createElement(v,null,e.createElement(g,{title:"Search is easy",description:e.createElement(e.Fragment,null,e.createElement(D,null,"Search for any data in your grid by setting ",e.createElement(K,null,"showSearch"),"."),e.createElement(R,null,"In this story, ",e.createElement(l,null,"Ctrl")," (",e.createElement(l,null,"⌘")," on Mac) +"," ",e.createElement(l,null,"f")," toggles the search bar. Make sure you're focused on the Data Grid!"))},e.createElement(n,null)))]},o=()=>{const{cols:n,getCellContent:m,onColumnResize:u,setCellValue:p}=y(),[S,r]=e.useState(!1),[d,h]=e.useState({rows:a.empty(),columns:a.empty()});return f("keydown",e.useCallback(t=>{(t.ctrlKey||t.metaKey)&&t.code==="KeyF"&&(r(C=>!C),t.stopPropagation(),t.preventDefault())},[]),window,!1,!0),e.createElement(w,{...E,getCellContent:m,getCellsForSelection:!0,gridSelection:d,onGridSelectionChange:h,columns:n,onCellEdited:p,onColumnResize:u,showSearch:S,onSearchClose:()=>r(!1),rows:1e4})};var s,c,i;o.parameters={...o.parameters,docs:{...(s=o.parameters)==null?void 0:s.docs,source:{originalSource:`() => {
  const {
    cols,
    getCellContent,
    onColumnResize,
    setCellValue
  } = useAllMockedKinds();
  const [showSearch, setShowSearch] = React.useState(false);
  const [selection, setSelection] = React.useState<GridSelection>({
    rows: CompactSelection.empty(),
    columns: CompactSelection.empty()
  });
  useEventListener("keydown", React.useCallback(event => {
    if ((event.ctrlKey || event.metaKey) && event.code === "KeyF") {
      setShowSearch(cv => !cv);
      event.stopPropagation();
      event.preventDefault();
    }
  }, []), window, false, true);
  return <DataEditor {...defaultProps} getCellContent={getCellContent} getCellsForSelection={true} gridSelection={selection} onGridSelectionChange={setSelection} columns={cols} onCellEdited={setCellValue} onColumnResize={onColumnResize} showSearch={showSearch} onSearchClose={() => setShowSearch(false)} rows={10_000} />;
}`,...(i=(c=o.parameters)==null?void 0:c.docs)==null?void 0:i.source}}};const L=["BuiltInSearch"];export{o as BuiltInSearch,L as __namedExportsOrder,x as default};
