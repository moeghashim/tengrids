import{R as e}from"./iframe-DJsx_LMI.js";import{C as c,u as w}from"./image-window-loader-BL-vzFfI.js";import{D as R}from"./data-editor-all-xo4btEP4.js";import{a as y,d as E,B as V,D as v,P as D}from"./utils-CpGkIYWR.js";import{S as K}from"./story-utils-4UdsftyL.js";import"./preload-helper-Dp1pzeXC.js";import"./throttle-xUL8d2YT.js";import"./marked.esm-B8EVsN7W.js";import"./flatten-DKU9CJY_.js";import"./scrolling-data-grid-D8pm8eI1.js";import"./isArray-C6bsAYrg.js";import"./throttle--dN168Gr.js";const W={title:"Glide-Data-Grid/DataEditor Demos",decorators:[s=>e.createElement(K,null,e.createElement(V,{title:"Controlling search results",description:e.createElement(e.Fragment,null,e.createElement(v,null,"Search results can be controlled via ",e.createElement(D,null,"searchResults"),". You can implement any search algorithm you want, even a silly one."))},e.createElement(s,null)))]},o=()=>{const{cols:s,getCellContent:h,onColumnResize:S,setCellValue:p}=y(),[d,a]=e.useState(!1),[C,g]=e.useState({rows:c.empty(),columns:c.empty()});w("keydown",e.useCallback(t=>{(t.ctrlKey||t.metaKey)&&t.code==="KeyF"&&(a(n=>!n),t.stopPropagation(),t.preventDefault())},[]),window,!1,!0);const[l,r]=e.useState(""),f=e.useMemo(()=>{const t=[];for(let n=0;n<l.length;n++)t.push([3,n]);return t},[l.length]);return e.createElement(R,{...E,searchResults:f,getCellContent:h,getCellsForSelection:!0,gridSelection:C,onGridSelectionChange:g,columns:s,onCellEdited:p,onColumnResize:S,searchValue:l,onSearchValueChange:r,showSearch:d,onSearchClose:()=>{a(!1),r("")},rows:1e4})};var u,i,m;o.parameters={...o.parameters,docs:{...(u=o.parameters)==null?void 0:u.docs,source:{originalSource:`() => {
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
  const [searchValue, setSearchValue] = React.useState("");
  const searchResults = React.useMemo(() => {
    const result: Item[] = [];
    for (let i = 0; i < searchValue.length; i++) {
      result.push([3, i]);
    }
    return result;
  }, [searchValue.length]);
  return <DataEditor {...defaultProps} searchResults={searchResults} getCellContent={getCellContent} getCellsForSelection={true} gridSelection={selection} onGridSelectionChange={setSelection} columns={cols} onCellEdited={setCellValue} onColumnResize={onColumnResize} searchValue={searchValue} onSearchValueChange={setSearchValue} showSearch={showSearch} onSearchClose={() => {
    setShowSearch(false);
    setSearchValue("");
  }} rows={10_000} />;
}`,...(m=(i=o.parameters)==null?void 0:i.docs)==null?void 0:m.source}}};const I=["ControlledSearch"];export{o as ControlledSearch,I as __namedExportsOrder,W as default};
