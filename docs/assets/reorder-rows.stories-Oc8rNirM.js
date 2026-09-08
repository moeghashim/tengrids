import{l as R}from"./lodash-B7Londxb.js";import{R as e}from"./iframe-gtUd2ThD.js";import{D as C}from"./data-editor-all-BDmbvInp.js";import{d as D,B as f,D as E,P as b}from"./utils-suV3M9is.js";import{G as g}from"./image-window-loader-8z6v7mDR.js";import{S as h}from"./story-utils-R7FeDyC8.js";import"./preload-helper-Dp1pzeXC.js";import"./throttle-CUoaKfhD.js";import"./flatten-DH73lhJo.js";import"./scrolling-data-grid-Dy2wBT_0.js";import"./marked.esm-CWskPn-N.js";import"./isArray-DlVmPg05.js";import"./throttle--dN168Gr.js";const W={title:"Glide-Data-Grid/DataEditor Demos",decorators:[a=>e.createElement(h,null,e.createElement(f,{title:"Reorder Rows",description:e.createElement(e.Fragment,null,e.createElement(E,null,"Rows can be re-arranged by using the ",e.createElement(b,null,"onRowMoved")," callback. When set the first row can be used to drag and drop."))},e.createElement(a,null)))]},o=()=>{const a=e.useMemo(()=>[{title:"Col A",width:150},{title:"Col B",width:150}],[]),[n,i]=e.useState(()=>R.range(0,50).map(t=>[`A: ${t}`,`B: ${t}`])),m=e.useCallback(([t,r])=>({kind:g.Text,allowOverlay:!1,data:n[r][t],displayData:n[r][t]}),[n]),p=e.useCallback((t,r)=>{i(u=>{const s=[...u],w=s.splice(t,1);return s.splice(r,0,...w),s})},[]);return e.createElement(C,{...D,rowMarkers:"both",onRowMoved:p,getCellContent:m,columns:a,rows:50})};var l,c,d;o.parameters={...o.parameters,docs:{...(l=o.parameters)==null?void 0:l.docs,source:{originalSource:`() => {
  const cols = React.useMemo<GridColumn[]>(() => [{
    title: "Col A",
    width: 150
  }, {
    title: "Col B",
    width: 150
  }], []);
  const [rowData, setRowData] = React.useState(() => {
    return range(0, 50).map(x => [\`A: \${x}\`, \`B: \${x}\`]);
  });
  const getCellContent = React.useCallback<DataEditorProps["getCellContent"]>(([col, row]) => {
    return {
      kind: GridCellKind.Text,
      allowOverlay: false,
      data: rowData[row][col],
      displayData: rowData[row][col]
    };
  }, [rowData]);
  const reorderRows = React.useCallback((from: number, to: number) => {
    setRowData(cv => {
      const d = [...cv];
      const removed = d.splice(from, 1);
      d.splice(to, 0, ...removed);
      return d;
    });
  }, []);
  return <DataEditor {...defaultProps} rowMarkers={"both"} onRowMoved={reorderRows} getCellContent={getCellContent} columns={cols} rows={50} />;
}`,...(d=(c=o.parameters)==null?void 0:c.docs)==null?void 0:d.source}}};const _=["ReorderRows"];export{o as ReorderRows,_ as __namedExportsOrder,W as default};
