import{R as t}from"./iframe-DJsx_LMI.js";import{D as x}from"./data-editor-all-xo4btEP4.js";import{u as R,c as f,d as g,B as E,D as h,M as y,K as D}from"./utils-CpGkIYWR.js";import{S as k}from"./story-utils-4UdsftyL.js";import"./preload-helper-Dp1pzeXC.js";import"./image-window-loader-BL-vzFfI.js";import"./throttle-xUL8d2YT.js";import"./marked.esm-B8EVsN7W.js";import"./flatten-DKU9CJY_.js";import"./scrolling-data-grid-D8pm8eI1.js";import"./isArray-C6bsAYrg.js";import"./throttle--dN168Gr.js";const B={title:"Glide-Data-Grid/DataEditor Demos",decorators:[a=>t.createElement(k,null,t.createElement(E,{title:"Add data to middle",description:t.createElement(t.Fragment,null,t.createElement(h,null,"You can return a different location to have the new row append take place."),t.createElement(y,null,"Note that ",t.createElement(D,null,"insertIndex"),' is zero-based while the number column on the left side of the grid is one-based, so inserting at index "4" creates a new row at "5"'))},t.createElement(a,null)))]},o=a=>{const{cols:m,getCellContent:r,setCellValueRaw:s,setCellValue:p}=R(60,!1),[i,w]=t.useState(50),l=a.insertIndex,C=t.useCallback(async()=>{for(let e=i;e>l;e--)for(let n=0;n<6;n++)s([n,e],r([n,e-1]));for(let e=0;e<6;e++){const n=r([e,l]);s([e,l],f(n))}return w(e=>e+1),l},[r,i,s,l]);return t.createElement(x,{...g,getCellContent:r,columns:m,rowMarkers:"both",onCellEdited:p,trailingRowOptions:{hint:"New row...",sticky:!0,tint:!0},rows:i,onRowAppended:C})};o.args={insertIndex:10};o.argTypes={insertIndex:{control:{type:"range",min:1,max:48}}};var c,d,u;o.parameters={...o.parameters,docs:{...(c=o.parameters)==null?void 0:c.docs,source:{originalSource:`p => {
  const {
    cols,
    getCellContent,
    setCellValueRaw,
    setCellValue
  } = useMockDataGenerator(60, false);
  const [numRows, setNumRows] = React.useState(50);
  const index = p.insertIndex;
  const onRowAppended = React.useCallback(async () => {
    // shift rows below index down
    for (let y = numRows; y > index; y--) {
      for (let x = 0; x < 6; x++) {
        setCellValueRaw([x, y], getCellContent([x, y - 1]));
      }
    }
    for (let c = 0; c < 6; c++) {
      const cell = getCellContent([c, index]);
      setCellValueRaw([c, index], clearCell(cell));
    }
    setNumRows(cv => cv + 1);
    return index;
  }, [getCellContent, numRows, setCellValueRaw, index]);
  return <DataEditor {...defaultProps} getCellContent={getCellContent} columns={cols} rowMarkers={"both"} onCellEdited={setCellValue} trailingRowOptions={{
    hint: "New row...",
    sticky: true,
    tint: true
  }} rows={numRows} onRowAppended={onRowAppended} />;
}`,...(u=(d=o.parameters)==null?void 0:d.docs)==null?void 0:u.source}}};const K=["AddDataToMiddle"];export{o as AddDataToMiddle,K as __namedExportsOrder,B as default};
