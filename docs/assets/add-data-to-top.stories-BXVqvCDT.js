import{R as t}from"./iframe-Dnr8FEb7.js";import{D as w}from"./data-editor-all-T61qpa25.js";import{u as C,c as R,d as f,B as D,D as g}from"./utils-DzmEeguY.js";import{S as E}from"./story-utils-BfUU3aXg.js";import"./preload-helper-Dp1pzeXC.js";import"./image-window-loader-Cnvlbs8E.js";import"./throttle-bg4wIPcC.js";import"./marked.esm-CHiQR2Yr.js";import"./flatten-BiR_gpKC.js";import"./scrolling-data-grid-sKiesypa.js";import"./isArray-DG6spoFr.js";import"./throttle--dN168Gr.js";const v={title:"Glide-Data-Grid/DataEditor Demos",decorators:[a=>t.createElement(E,null,t.createElement(D,{title:"Add data",description:t.createElement(t.Fragment,null,t.createElement(g,null,"You can return a different location to have the new row append take place."))},t.createElement(a,null)))]},l=()=>{const{cols:a,getCellContent:n,setCellValueRaw:r,setCellValue:p}=C(60,!1),[s,m]=t.useState(50),d=t.useCallback(async()=>{for(let e=s;e>0;e--)for(let o=0;o<6;o++)r([o,e],n([o,e-1]));for(let e=0;e<6;e++){const o=n([e,0]);r([e,0],R(o))}return m(e=>e+1),"top"},[n,s,r]);return t.createElement(w,{...f,getCellContent:n,columns:a,rowMarkers:"both",onCellEdited:p,trailingRowOptions:{hint:"New row...",sticky:!0,tint:!0},rows:s,onRowAppended:d})};var c,i,u;l.parameters={...l.parameters,docs:{...(c=l.parameters)==null?void 0:c.docs,source:{originalSource:`() => {
  const {
    cols,
    getCellContent,
    setCellValueRaw,
    setCellValue
  } = useMockDataGenerator(60, false);
  const [numRows, setNumRows] = React.useState(50);
  const onRowAppended = React.useCallback(async () => {
    // shift all of the existing cells down
    for (let y = numRows; y > 0; y--) {
      for (let x = 0; x < 6; x++) {
        setCellValueRaw([x, y], getCellContent([x, y - 1]));
      }
    }
    for (let c = 0; c < 6; c++) {
      const cell = getCellContent([c, 0]);
      setCellValueRaw([c, 0], clearCell(cell));
    }
    setNumRows(cv => cv + 1);
    return "top" as const;
  }, [getCellContent, numRows, setCellValueRaw]);
  return <DataEditor {...defaultProps} getCellContent={getCellContent} columns={cols} rowMarkers={"both"} onCellEdited={setCellValue} trailingRowOptions={{
    hint: "New row...",
    sticky: true,
    tint: true
  }} rows={numRows} onRowAppended={onRowAppended} />;
}`,...(u=(i=l.parameters)==null?void 0:i.docs)==null?void 0:u.source}}};const O=["AddDataToTop"];export{l as AddDataToTop,O as __namedExportsOrder,v as default};
