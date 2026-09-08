import{R as t}from"./iframe-gtUd2ThD.js";import{D as c}from"./data-editor-all-BDmbvInp.js";import{u,d as i,C as p,B as d,D as C,P as E}from"./utils-suV3M9is.js";import{S as w}from"./story-utils-R7FeDyC8.js";import"./preload-helper-Dp1pzeXC.js";import"./image-window-loader-8z6v7mDR.js";import"./throttle-CUoaKfhD.js";import"./marked.esm-CWskPn-N.js";import"./flatten-DH73lhJo.js";import"./scrolling-data-grid-Dy2wBT_0.js";import"./isArray-DlVmPg05.js";import"./throttle--dN168Gr.js";const R={title:"Glide-Data-Grid/DataEditor Demos",decorators:[e=>t.createElement(w,null,t.createElement(d,{title:"New column button",description:t.createElement(C,null,"A new column button can be created using the ",t.createElement(E,null,"rightElement"),".")},t.createElement(e,null)))]},o=()=>{const{cols:e,getCellContent:a}=u(10,!0),s=t.useMemo(()=>e.map(m=>({...m,grow:1})),[e]);return t.createElement(c,{...i,getCellContent:a,columns:s,rightElement:t.createElement(p,null,t.createElement("button",{onClick:()=>window.alert("Add a column!")},"+")),rightElementProps:{fill:!1,sticky:!1},rows:3e3,rowMarkers:"both"})};var n,r,l;o.parameters={...o.parameters,docs:{...(n=o.parameters)==null?void 0:n.docs,source:{originalSource:`() => {
  const {
    cols,
    getCellContent
  } = useMockDataGenerator(10, true);
  const columns = React.useMemo(() => cols.map(c => ({
    ...c,
    grow: 1
  })), [cols]);
  return <DataEditor {...defaultProps} getCellContent={getCellContent} columns={columns} rightElement={<ColumnAddButton>
                    <button onClick={() => window.alert("Add a column!")}>+</button>
                </ColumnAddButton>} rightElementProps={{
    fill: false,
    sticky: false
  }} rows={3000} rowMarkers="both" />;
}`,...(l=(r=o.parameters)==null?void 0:r.docs)==null?void 0:l.source}}};const S=["NewColumnButton"];export{o as NewColumnButton,S as __namedExportsOrder,R as default};
