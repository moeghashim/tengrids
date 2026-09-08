import{R as e}from"./iframe-gtUd2ThD.js";import{D as m}from"./data-editor-all-BDmbvInp.js";import{u,d as c,B as i,D as p,P as f}from"./utils-suV3M9is.js";import{S as C}from"./story-utils-R7FeDyC8.js";import"./preload-helper-Dp1pzeXC.js";import"./image-window-loader-8z6v7mDR.js";import"./throttle-CUoaKfhD.js";import"./marked.esm-CWskPn-N.js";import"./flatten-DH73lhJo.js";import"./scrolling-data-grid-Dy2wBT_0.js";import"./isArray-DlVmPg05.js";import"./throttle--dN168Gr.js";const M={title:"Glide-Data-Grid/DataEditor Demos",decorators:[t=>e.createElement(C,null,e.createElement(i,{title:"Freeze columns",description:e.createElement(p,null,"Columns at the start of your grid can be frozen in place by settings"," ",e.createElement(f,null,"freezeColumns")," to a number greater than 0.")},e.createElement(t,null)))]},r=t=>{const{cols:s,getCellContent:l}=u(100);return e.createElement(m,{...c,rowMarkers:"both",freezeColumns:t.freezeColumns,getCellContent:l,columns:s,verticalBorder:!1,rows:1e3})};r.argTypes={freezeColumns:{control:{type:"range",min:0,max:10}}};r.args={freezeColumns:1};var o,a,n;r.parameters={...r.parameters,docs:{...(o=r.parameters)==null?void 0:o.docs,source:{originalSource:`(p: {
  freezeColumns: number;
}) => {
  const {
    cols,
    getCellContent
  } = useMockDataGenerator(100);
  return <DataEditor {...defaultProps} rowMarkers="both" freezeColumns={p.freezeColumns} getCellContent={getCellContent} columns={cols} verticalBorder={false} rows={1000} />;
}`,...(n=(a=r.parameters)==null?void 0:a.docs)==null?void 0:n.source}}};const P=["FreezeColumns"];export{r as FreezeColumns,P as __namedExportsOrder,M as default};
