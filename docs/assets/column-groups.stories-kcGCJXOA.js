import{R as e}from"./iframe-Dnr8FEb7.js";import{D as i}from"./data-editor-all-T61qpa25.js";import{u,d as p,B as d,D as c,P as g}from"./utils-DzmEeguY.js";import{a as C}from"./image-window-loader-Cnvlbs8E.js";import{S as G}from"./story-utils-BfUU3aXg.js";import"./preload-helper-Dp1pzeXC.js";import"./throttle-bg4wIPcC.js";import"./flatten-BiR_gpKC.js";import"./scrolling-data-grid-sKiesypa.js";import"./marked.esm-CHiQR2Yr.js";import"./isArray-DG6spoFr.js";import"./throttle--dN168Gr.js";const R={title:"Glide-Data-Grid/DataEditor Demos",decorators:[t=>e.createElement(G,null,e.createElement(d,{title:"Column Grouping",description:e.createElement(c,null,"Columns in the data grid may be grouped by setting their ",e.createElement(g,null,"group")," ","property.")},e.createElement(t,null)))]},o=()=>{const{cols:t,getCellContent:l}=u(20,!0,!0);return e.createElement(i,{...p,getCellContent:l,onGroupHeaderRenamed:(r,m)=>window.alert(`Please rename group ${r} to ${m}`),columns:t,rows:1e3,getGroupDetails:r=>({name:r,icon:r===""?void 0:C.HeaderCode}),rowMarkers:"both"})};var a,n,s;o.parameters={...o.parameters,docs:{...(a=o.parameters)==null?void 0:a.docs,source:{originalSource:`() => {
  const {
    cols,
    getCellContent
  } = useMockDataGenerator(20, true, true);
  return <DataEditor {...defaultProps} getCellContent={getCellContent} onGroupHeaderRenamed={(x, y) => window.alert(\`Please rename group \${x} to \${y}\`)} columns={cols} rows={1000} getGroupDetails={g => ({
    name: g,
    icon: g === "" ? undefined : GridColumnIcon.HeaderCode
  })} rowMarkers="both" />;
}`,...(s=(n=o.parameters)==null?void 0:n.docs)==null?void 0:s.source}}};const $=["ColumnGroups"];export{o as ColumnGroups,$ as __namedExportsOrder,R as default};
