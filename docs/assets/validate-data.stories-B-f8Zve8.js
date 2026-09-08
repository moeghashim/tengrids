import{R as e}from"./iframe-Dnr8FEb7.js";import{D as d}from"./data-editor-all-T61qpa25.js";import{u,d as c,B as m,D as p,P as f,M as C}from"./utils-DzmEeguY.js";import{G as D}from"./image-window-loader-Cnvlbs8E.js";import{S as E}from"./story-utils-BfUU3aXg.js";import"./preload-helper-Dp1pzeXC.js";import"./throttle-bg4wIPcC.js";import"./flatten-BiR_gpKC.js";import"./scrolling-data-grid-sKiesypa.js";import"./marked.esm-CHiQR2Yr.js";import"./isArray-DG6spoFr.js";import"./throttle--dN168Gr.js";const T={title:"Glide-Data-Grid/DataEditor Demos",decorators:[l=>e.createElement(E,null,e.createElement(m,{title:"Validate data",description:e.createElement(e.Fragment,null,e.createElement(p,null,"Data can be validated using the ",e.createElement(f,null,"validateCell")," callback"),e.createElement(C,null,'This example only allows the word "Valid" inside text cells.'))},e.createElement(l,null)))]},a=()=>{const{cols:l,getCellContent:i,setCellValue:s}=u(60,!1);return e.createElement(d,{...c,getCellContent:i,columns:l,rowMarkers:"both",onPaste:!0,onCellEdited:s,rows:100,validateCell:(V,t)=>t.kind!==D.Text||t.data==="Valid"?!0:t.data.toLowerCase()==="valid"?{...t,data:"Valid",selectionRange:[0,3]}:!1})};var r,n,o;a.parameters={...a.parameters,docs:{...(r=a.parameters)==null?void 0:r.docs,source:{originalSource:`() => {
  const {
    cols,
    getCellContent,
    setCellValue
  } = useMockDataGenerator(60, false);
  return <DataEditor {...defaultProps} getCellContent={getCellContent} columns={cols} rowMarkers={"both"} onPaste={true} onCellEdited={setCellValue} rows={100} validateCell={(_cell, newValue) => {
    if (newValue.kind !== GridCellKind.Text) return true;
    if (newValue.data === "Valid") return true;
    if (newValue.data.toLowerCase() === "valid") {
      return {
        ...newValue,
        data: "Valid",
        selectionRange: [0, 3]
      };
    }
    return false;
  }} />;
}`,...(o=(n=a.parameters)==null?void 0:n.docs)==null?void 0:o.source}}};const S=["ValidateData"];export{a as ValidateData,S as __namedExportsOrder,T as default};
