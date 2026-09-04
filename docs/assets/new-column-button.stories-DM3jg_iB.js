import{R as t}from"./iframe-Dm-TGfvz.js";import{D as c}from"./data-editor-all-Bfc1Nsq6.js";import{B as u,D as i,P as p,u as d,d as C,C as E}from"./utils-Cc9MVzQL.js";import{S as w}from"./story-utils-CqKPcFDr.js";import"./preload-helper-C1FmrZbK.js";import"./image-window-loader-Bgk-AzmM.js";import"./throttle-DUpnrlRK.js";import"./marked.esm-DO1BaHSb.js";import"./flatten-DPzrbH7m.js";import"./scrolling-data-grid-yLHLalDR.js";import"./index-D_kXk1yT.js";import"./throttle--dN168Gr.js";const R={title:"Glide-Data-Grid/DataEditor Demos",decorators:[e=>t.createElement(w,null,t.createElement(u,{title:"New column button",description:t.createElement(i,null,"A new column button can be created using the ",t.createElement(p,null,"rightElement"),".")},t.createElement(e,null)))]},o=()=>{const{cols:e,getCellContent:a}=d(10,!0),s=t.useMemo(()=>e.map(m=>({...m,grow:1})),[e]);return t.createElement(c,{...C,getCellContent:a,columns:s,rightElement:t.createElement(E,null,t.createElement("button",{onClick:()=>window.alert("Add a column!")},"+")),rightElementProps:{fill:!1,sticky:!1},rows:3e3,rowMarkers:"both"})};var n,r,l;o.parameters={...o.parameters,docs:{...(n=o.parameters)==null?void 0:n.docs,source:{originalSource:`() => {
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
