import{R as e}from"./iframe-gtUd2ThD.js";import{D as w}from"./data-editor-all-BDmbvInp.js";import{u as g,d as h,B as R,D as b,P as E}from"./utils-suV3M9is.js";import{S as y}from"./story-utils-R7FeDyC8.js";import"./preload-helper-Dp1pzeXC.js";import"./image-window-loader-8z6v7mDR.js";import"./throttle-CUoaKfhD.js";import"./marked.esm-CWskPn-N.js";import"./flatten-DH73lhJo.js";import"./scrolling-data-grid-Dy2wBT_0.js";import"./isArray-DlVmPg05.js";import"./throttle--dN168Gr.js";const V={title:"Glide-Data-Grid/DataEditor Demos",decorators:[n=>e.createElement(y,null,e.createElement(R,{title:"Right Element",description:e.createElement(b,null,"A DOM element may be added as a trailer to the grid by using the"," ",e.createElement(E,null,"rightElement")," prop.")},e.createElement(n,null)))]},o=()=>{const{cols:n,getCellContent:p,setCellValue:a}=g(8,!1),m=e.useMemo(()=>n.map(s=>({...s,grow:1})),[n]),[r,u]=e.useState(300),d=e.useCallback(()=>{const s=r;u(t=>t+1);for(let t=0;t<6;t++)a([t,s],{displayData:"",data:""})},[r,a]);return e.createElement(w,{...h,getCellContent:p,columns:m,rowMarkers:"both",onCellEdited:a,trailingRowOptions:{hint:"New row...",sticky:!0,tint:!0},rows:r,onRowAppended:d,rightElementProps:{sticky:!0},rightElement:e.createElement("div",{style:{height:"100%",padding:"20px 20px 40px 20px",width:200,color:"black",whiteSpace:"pre-wrap",backgroundColor:"rgba(240, 240, 250, 0.2)",display:"flex",justifyContent:"center",alignItems:"center",boxShadow:"0 0 10px rgba(0, 0, 0, 0.15)",backdropFilter:"blur(12px)"}},"This is a real DOM element. You can put whatever you want here. You can also size it as big as you want. ",`

`,"It also does not have to be sticky.")})};var l,i,c;o.parameters={...o.parameters,docs:{...(l=o.parameters)==null?void 0:l.docs,source:{originalSource:`() => {
  const {
    cols,
    getCellContent,
    setCellValue
  } = useMockDataGenerator(8, false);
  const columns = React.useMemo(() => cols.map(c => ({
    ...c,
    grow: 1
  })), [cols]);
  const [numRows, setNumRows] = React.useState(300);
  const onRowAppended = React.useCallback(() => {
    const newRow = numRows;
    setNumRows(cv => cv + 1);
    for (let c = 0; c < 6; c++) {
      setCellValue([c, newRow], {
        displayData: "",
        data: ""
      } as any);
    }
  }, [numRows, setCellValue]);
  return <DataEditor {...defaultProps} getCellContent={getCellContent} columns={columns} rowMarkers={"both"} onCellEdited={setCellValue} trailingRowOptions={{
    hint: "New row...",
    sticky: true,
    tint: true
  }} rows={numRows} onRowAppended={onRowAppended} rightElementProps={{
    sticky: true
  }} rightElement={<div style={{
    height: "100%",
    padding: "20px 20px 40px 20px",
    width: 200,
    color: "black",
    whiteSpace: "pre-wrap",
    backgroundColor: "rgba(240, 240, 250, 0.2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.15)",
    backdropFilter: "blur(12px)"
  }}>
                    This is a real DOM element. You can put whatever you want here. You can also size it as big as you
                    want. {"\\n\\n"}It also does not have to be sticky.
                </div>} />;
}`,...(c=(i=o.parameters)==null?void 0:i.docs)==null?void 0:c.source}}};const G=["RightElement"];export{o as RightElement,G as __namedExportsOrder,V as default};
