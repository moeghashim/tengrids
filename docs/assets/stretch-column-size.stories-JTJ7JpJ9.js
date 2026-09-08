import{R as e}from"./iframe-Dnr8FEb7.js";import{D as C}from"./data-editor-all-T61qpa25.js";import{u as w,d as h,B as z,D as R,P as S}from"./utils-DzmEeguY.js";import{S as f}from"./story-utils-BfUU3aXg.js";import"./preload-helper-Dp1pzeXC.js";import"./image-window-loader-Cnvlbs8E.js";import"./throttle-bg4wIPcC.js";import"./marked.esm-CHiQR2Yr.js";import"./flatten-BiR_gpKC.js";import"./scrolling-data-grid-sKiesypa.js";import"./isArray-DG6spoFr.js";import"./throttle--dN168Gr.js";const B={title:"Glide-Data-Grid/DataEditor Demos",decorators:[t=>e.createElement(f,null,e.createElement(z,{title:"Column Grow",description:e.createElement(R,null,"Columns in the data grid may be set to grow to fill space by setting the"," ",e.createElement(S,null,"grow")," prop.")},e.createElement(t,null)))]},o=()=>{const{cols:t,getCellContent:m,onColumnResize:c}=w(5,!0,!0),s=e.useRef(new Set),u=e.useMemo(()=>t.map((r,n)=>({...r,grow:s.current.has(n)?void 0:(5+n)/5})),[t]);return e.createElement(C,{...h,getCellContent:m,columns:u,rows:1e3,onColumnResize:(r,n,p,d)=>{s.current.add(p),c(r,d)},rowMarkers:"both"})};var a,l,i;o.parameters={...o.parameters,docs:{...(a=o.parameters)==null?void 0:a.docs,source:{originalSource:`() => {
  const {
    cols,
    getCellContent,
    onColumnResize
  } = useMockDataGenerator(5, true, true);
  const hasResized = React.useRef(new Set<number>());
  const columns = React.useMemo(() => {
    return cols.map((x, i) => ({
      ...x,
      grow: hasResized.current.has(i) ? undefined : (5 + i) / 5
    }));
  }, [cols]);
  return <DataEditor {...defaultProps} getCellContent={getCellContent} columns={columns} rows={1000} onColumnResize={(col, _newSize, colIndex, newSizeWithGrow) => {
    hasResized.current.add(colIndex);
    onColumnResize(col, newSizeWithGrow);
  }} rowMarkers="both" />;
}`,...(i=(l=o.parameters)==null?void 0:l.docs)==null?void 0:i.source}}};const I=["StretchColumnSize"];export{o as StretchColumnSize,I as __namedExportsOrder,B as default};
