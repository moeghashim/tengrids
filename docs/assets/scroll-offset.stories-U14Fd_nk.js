import{R as e}from"./iframe-DJsx_LMI.js";import{D as n}from"./data-editor-all-xo4btEP4.js";import{u as c,d as m,B as i,D as p,P as f}from"./utils-CpGkIYWR.js";import{S as u}from"./story-utils-4UdsftyL.js";import"./lodash-BDhCB2cW.js";import"./preload-helper-Dp1pzeXC.js";import"./image-window-loader-BL-vzFfI.js";import"./throttle-xUL8d2YT.js";import"./marked.esm-B8EVsN7W.js";import"./flatten-DKU9CJY_.js";import"./scrolling-data-grid-D8pm8eI1.js";import"./isArray-C6bsAYrg.js";import"./throttle--dN168Gr.js";const B={title:"Glide-Data-Grid/DataEditor Demos",decorators:[t=>e.createElement(u,null,e.createElement(i,{title:"Scroll Offset",description:e.createElement(p,null,"The ",e.createElement(f,null,"rowGrouping")," prop can be used to group and even fold rows.")},e.createElement(t,null)))]},r=()=>{const{cols:t,getCellContent:l}=c(100);return e.createElement(n,{...m,height:"100%",rowMarkers:"both",scrollOffsetY:400,getCellContent:l,columns:t,rows:1e3})};var o,s,a;r.parameters={...r.parameters,docs:{...(o=r.parameters)==null?void 0:o.docs,source:{originalSource:`() => {
  const {
    cols,
    getCellContent
  } = useMockDataGenerator(100);
  const rows = 1000;
  return <DataEditor {...defaultProps} height="100%" rowMarkers="both" scrollOffsetY={400} getCellContent={getCellContent} columns={cols}
  // verticalBorder={false}
  rows={rows} />;
}`,...(a=(s=r.parameters)==null?void 0:s.docs)==null?void 0:a.source}}};const _=["ScrollOffset"];export{r as ScrollOffset,_ as __namedExportsOrder,B as default};
