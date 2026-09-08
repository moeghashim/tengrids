import{R as n}from"./iframe-Dnr8FEb7.js";import{D as g}from"./data-editor-all-T61qpa25.js";import{u as O,c as x,d as I,B as h,D as f,P as E}from"./utils-DzmEeguY.js";import{a as i}from"./image-window-loader-Cnvlbs8E.js";import{S as D}from"./story-utils-BfUU3aXg.js";import"./preload-helper-Dp1pzeXC.js";import"./throttle-bg4wIPcC.js";import"./flatten-BiR_gpKC.js";import"./scrolling-data-grid-sKiesypa.js";import"./marked.esm-CHiQR2Yr.js";import"./isArray-DG6spoFr.js";import"./throttle--dN168Gr.js";const z={title:"Glide-Data-Grid/DataEditor Demos",decorators:[t=>n.createElement(D,null,n.createElement(h,{title:"Trailing row options",description:n.createElement(f,null,"You can customize the trailing row in each column by setting a"," ",n.createElement(E,null,"trailingRowOptions")," in your columns.")},n.createElement(t,null)))]},b={2:"Smol text",3:"Add",5:"New"},k={2:i.HeaderArray,3:i.HeaderEmoji,5:i.HeaderNumber},T={2:0,3:0,5:0},A={3:!0},S={2:{baseFontStyle:"10px"}},l=()=>{const{cols:t,getCellContent:s,setCellValueRaw:a,setCellValue:p}=O(60,!1),[r,d]=n.useState(50),w=n.useCallback(()=>{const o=r;for(let e=0;e<6;e++){const C=s([e,o]);a([e,o],x(C))}d(e=>e+1)},[s,r,a]),R=n.useMemo(()=>t.map((o,e)=>({...o,trailingRowOptions:{hint:b[e],addIcon:k[e],targetColumn:T[e],disabled:A[e],themeOverride:S[e]}})),[t]);return n.createElement(g,{...I,getCellContent:s,columns:R,rowMarkers:"both",onCellEdited:p,trailingRowOptions:{tint:!0,sticky:!0},rows:r,onRowAppended:w})};var c,m,u;l.parameters={...l.parameters,docs:{...(c=l.parameters)==null?void 0:c.docs,source:{originalSource:`() => {
  const {
    cols,
    getCellContent,
    setCellValueRaw,
    setCellValue
  } = useMockDataGenerator(60, false);
  const [numRows, setNumRows] = React.useState(50);
  const onRowAppended = React.useCallback(() => {
    const newRow = numRows;
    for (let c = 0; c < 6; c++) {
      const cell = getCellContent([c, newRow]);
      setCellValueRaw([c, newRow], clearCell(cell));
    }
    setNumRows(cv => cv + 1);
  }, [getCellContent, numRows, setCellValueRaw]);
  const columnsWithRowOptions: GridColumn[] = React.useMemo(() => {
    return cols.map((c, idx) => ({
      ...c,
      trailingRowOptions: {
        hint: trailingRowOptionsColumnIndexesHint[idx],
        addIcon: trailingRowOptionsColumnIndexesIcon[idx],
        targetColumn: trailingRowOptionsColumnIndexesTarget[idx],
        disabled: trailingRowOptionsColumnIndexesDisabled[idx],
        themeOverride: trailingRowOptionsColumnIndexesTheme[idx]
      }
    }));
  }, [cols]);
  return <DataEditor {...defaultProps} getCellContent={getCellContent} columns={columnsWithRowOptions} rowMarkers={"both"} onCellEdited={setCellValue} trailingRowOptions={{
    tint: true,
    sticky: true
  }} rows={numRows} onRowAppended={onRowAppended} />;
}`,...(u=(m=l.parameters)==null?void 0:m.docs)==null?void 0:u.source}}};const F=["TrailingRowOptions"];export{l as TrailingRowOptions,F as __namedExportsOrder,z as default};
