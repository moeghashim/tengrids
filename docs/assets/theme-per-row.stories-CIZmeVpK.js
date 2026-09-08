import{R as e}from"./iframe-Dnr8FEb7.js";import{D as d}from"./data-editor-all-T61qpa25.js";import{u,d as p,B as C,D as f,P as g}from"./utils-DzmEeguY.js";import{S as h}from"./story-utils-BfUU3aXg.js";import"./preload-helper-Dp1pzeXC.js";import"./image-window-loader-Cnvlbs8E.js";import"./throttle-bg4wIPcC.js";import"./marked.esm-CHiQR2Yr.js";import"./flatten-BiR_gpKC.js";import"./scrolling-data-grid-sKiesypa.js";import"./isArray-DG6spoFr.js";import"./throttle--dN168Gr.js";const M={title:"Glide-Data-Grid/DataEditor Demos",decorators:[r=>e.createElement(h,null,e.createElement(C,{title:"Theme per row",description:e.createElement(e.Fragment,null,e.createElement(f,null,"Each row can provide theme overrides for rendering that row using the"," ",e.createElement(g,null,"getRowThemeOverride")," callback."))},e.createElement(r,null)))]},o=()=>{const{cols:r,getCellContent:s,onColumnResize:i,setCellValue:m}=u(5),c=e.useMemo(()=>{const t=[...r];return t[3]={...t[3],themeOverride:{bgCell:"#d6fafd"}},t},[r]);return e.createElement(d,{...p,getCellContent:s,columns:c,height:"100%",getRowThemeOverride:t=>t%2===0?void 0:{bgCell:"#e0f0ff88"},onCellEdited:m,onColumnResize:i,rows:10})};var n,l,a;o.parameters={...o.parameters,docs:{...(n=o.parameters)==null?void 0:n.docs,source:{originalSource:`() => {
  const {
    cols,
    getCellContent,
    onColumnResize,
    setCellValue
  } = useMockDataGenerator(5);
  const realCols = React.useMemo(() => {
    const c = [...cols];
    c[3] = {
      ...c[3],
      themeOverride: {
        bgCell: "#d6fafd"
      }
    };
    return c;
  }, [cols]);
  return <DataEditor {...defaultProps} getCellContent={getCellContent} columns={realCols} height="100%"
  // trailingRowOptions={{
  //     sticky: true,
  //     tint: true,
  // }}
  // onRowAppended={() => undefined}
  getRowThemeOverride={i => i % 2 === 0 ? undefined : {
    bgCell: "#e0f0ff88"
    //   borderColor: "#3f90e0",
  }} onCellEdited={setCellValue} onColumnResize={onColumnResize} rows={10} />;
}`,...(a=(l=o.parameters)==null?void 0:l.docs)==null?void 0:a.source}}};const S=["ThemePerRow"];export{o as ThemePerRow,S as __namedExportsOrder,M as default};
