import{R as l}from"./iframe-Dnr8FEb7.js";import{D as u}from"./data-editor-all-T61qpa25.js";import{u as a,d as s,B as d,D as m}from"./utils-DzmEeguY.js";import{S as p}from"./story-utils-BfUU3aXg.js";import"./preload-helper-Dp1pzeXC.js";import"./image-window-loader-Cnvlbs8E.js";import"./throttle-bg4wIPcC.js";import"./marked.esm-CHiQR2Yr.js";import"./flatten-BiR_gpKC.js";import"./scrolling-data-grid-sKiesypa.js";import"./isArray-DG6spoFr.js";import"./throttle--dN168Gr.js";const E={title:"Glide-Data-Grid/DataEditor Demos",decorators:[e=>l.createElement(p,null,l.createElement(d,{title:"Input blending",description:l.createElement(m,null,"Input blending can be enabled or disable between row, column, and range selections. Multi-selections can also be enabled or disabled with the same level of granularity.")},l.createElement(e,null)))]},t=e=>{const{cols:i,getCellContent:c}=a(30);return l.createElement(u,{...s,rowMarkers:e.rowMultiSelect==="none"?"number":"both",keybindings:{clear:!0,copy:!0,downFill:!0,rightFill:!0,pageDown:!0,pageUp:!0,paste:!0,search:!0,selectAll:!0,selectColumn:!0,selectRow:!0},getCellsForSelection:!0,rangeSelect:e.rangeMultiSelect,columnSelect:e.columnMultiSelect,rowSelect:e.rowMultiSelect,rangeSelectionBlending:e.rangeBlending,columnSelectionBlending:e.columnBlending,rowSelectionBlending:e.rowBlending,rowSelectionMode:e.rowSelectionMode,columnSelectionMode:e.columnSelectionMode,getCellContent:c,columns:i,rows:1e4})};t.args={rangeBlending:"mixed",columnBlending:"mixed",rowBlending:"mixed",rangeMultiSelect:"rect",columnMultiSelect:"multi",rowMultiSelect:"multi",rowSelectionMode:"auto",columnSelectionMode:"auto"};t.argTypes={rangeBlending:{control:{type:"select"},options:["mixed","exclusive","additive"]},columnBlending:{control:{type:"select"},options:["mixed","exclusive","additive"]},rowBlending:{control:{type:"select"},options:["mixed","exclusive","additive"]},rangeMultiSelect:{control:{type:"select"},options:["none","cell","rect","multi-cell","multi-rect"]},columnMultiSelect:{control:{type:"select"},options:["none","single","multi"]},rowMultiSelect:{control:{type:"select"},options:["none","single","multi"]},rowSelectionMode:{control:{type:"select"},options:["auto","multi"]},columnSelectionMode:{control:{type:"select"},options:["auto","multi"]}};var n,o,r;t.parameters={...t.parameters,docs:{...(n=t.parameters)==null?void 0:n.docs,source:{originalSource:`p => {
  const {
    cols,
    getCellContent
  } = useMockDataGenerator(30);
  return <DataEditor {...defaultProps} rowMarkers={p.rowMultiSelect === "none" ? "number" : "both"} keybindings={{
    clear: true,
    copy: true,
    downFill: true,
    rightFill: true,
    pageDown: true,
    pageUp: true,
    paste: true,
    search: true,
    selectAll: true,
    selectColumn: true,
    selectRow: true
  }} getCellsForSelection={true} rangeSelect={p.rangeMultiSelect} columnSelect={p.columnMultiSelect} rowSelect={p.rowMultiSelect} rangeSelectionBlending={p.rangeBlending} columnSelectionBlending={p.columnBlending} rowSelectionBlending={p.rowBlending} rowSelectionMode={p.rowSelectionMode} columnSelectionMode={p.columnSelectionMode} getCellContent={getCellContent} columns={cols} rows={10_000} />;
}`,...(r=(o=t.parameters)==null?void 0:o.docs)==null?void 0:r.source}}};const v=["InputBlending"];export{t as InputBlending,v as __namedExportsOrder,E as default};
