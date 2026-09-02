import{R as e}from"./iframe-Cy0SHszz.js";import{D as n}from"./data-editor-all-Bt4s6Qaw.js";import{B as i,D as m,u as p,d as c}from"./utils-qnqgqRi7.js";import{S as u}from"./story-utils-Bbsf33bb.js";import"./preload-helper-C1FmrZbK.js";import"./image-window-loader-ChlrGYux.js";import"./throttle-rr6oSEDW.js";import"./marked.esm-Do_Pr3SV.js";import"./flatten-Tc-1Zgda.js";import"./scrolling-data-grid-BjpqPWLN.js";import"./index-D_kXk1yT.js";import"./throttle--dN168Gr.js";const S={title:"Glide-Data-Grid/DataEditor Demos",decorators:[r=>e.createElement(u,null,e.createElement(i,{title:"Ten Million Cells",description:e.createElement(m,null,"Data grid supports over 10 million cells. Go nuts with it.")},e.createElement(r,null)))]},t=()=>{const{cols:r,getCellContent:a}=p(100);return e.createElement(n,{...c,rowMarkers:"number",getCellContent:a,columns:r,rows:1e5})};var o,l,s;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`() => {
  const {
    cols,
    getCellContent
  } = useMockDataGenerator(100);
  return <DataEditor {...defaultProps} rowMarkers="number" getCellContent={getCellContent} columns={cols} rows={100_000} />;
}`,...(s=(l=t.parameters)==null?void 0:l.docs)==null?void 0:s.source}}};const b=["TenMillionCells"];export{t as TenMillionCells,b as __namedExportsOrder,S as default};
