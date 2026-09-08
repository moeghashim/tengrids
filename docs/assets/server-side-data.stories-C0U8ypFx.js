import{R as t}from"./iframe-Dnr8FEb7.js";import{G as x,C as W}from"./image-window-loader-Cnvlbs8E.js";import{S as A}from"./story-utils-BfUU3aXg.js";import{D as O}from"./data-editor-all-T61qpa25.js";import{r as C}from"./throttle-bg4wIPcC.js";import{c as S}from"./chunk-DdqPsvJ0.js";import{B as V}from"./utils-DzmEeguY.js";import{a as $}from"./doc-wrapper-B-3O2-qv.js";import"./preload-helper-Dp1pzeXC.js";import"./marked.esm-CHiQR2Yr.js";import"./flatten-BiR_gpKC.js";import"./scrolling-data-grid-sKiesypa.js";import"./isArray-DG6spoFr.js";import"./throttle--dN168Gr.js";import"./toConsumableArray-Cg7-Q_9P.js";const te={title:"Glide-Data-Grid/DataEditor Demos",decorators:[n=>t.createElement(A,null,t.createElement(n,null))]};function K(n,w,p,y,l,o){n=Math.max(n,1);const u=t.useRef(W.empty()),d=t.useRef([]),[c,M]=t.useState({x:0,y:0,width:0,height:0}),R=t.useRef(c);R.current=c;const G=t.useCallback(e=>{M(a=>e.x===a.x&&e.y===a.y&&e.width===a.width&&e.height===a.height?a:e)},[]),k=t.useCallback(e=>{const[a,i]=e,r=d.current[i];return r!==void 0?y(r,a):{kind:x.Loading,allowOverlay:!1}},[y]),g=t.useCallback(async e=>{var f;u.current=u.current.add(e);const a=e*n,i=await p([a,(e+1)*n]),r=R.current,s=[],m=d.current;for(const[b,I]of i.entries()){m[b+a]=I;for(let D=r.x;D<=r.x+r.width;D++)s.push({cell:[D,b+a]})}(f=o.current)==null||f.updateCells(s)},[p,o,n]),T=t.useCallback(e=>async()=>{const a=Math.max(0,Math.floor(e.y/n)),i=Math.floor((e.y+e.height)/n);for(const s of S(C(a,i+1).filter(m=>!u.current.hasIndex(m)),w))await Promise.allSettled(s.map(g));const r=[];for(let s=e.y;s<e.y+e.height;s++){const m=[];for(let f=e.x;f<e.x+e.width;f++)m.push(k([f,s]));r.push(m)}return r},[k,g,w,n]);t.useEffect(()=>{const e=c,a=Math.max(0,Math.floor((e.y-n/2)/n)),i=Math.floor((e.y+e.height+n/2)/n);for(const r of C(a,i+1))u.current.hasIndex(r)||g(r)},[g,n,c]);const B=t.useCallback((e,a)=>{const[,i]=e,r=d.current[i];if(r===void 0)return;const s=l(e,a,r);s!==void 0&&(d.current[i]=s)},[l]);return{getCellContent:k,onVisibleRegionChanged:G,onCellEdited:B,getCellsForSelection:T}}const h=()=>{const n=t.useRef(null),w=t.useCallback(async l=>(await new Promise(o=>setTimeout(o,300)),C(l[0],l[1]).map(o=>[`1, ${o}`,`2, ${o}`])),[]),p=t.useMemo(()=>[{title:"A",width:150},{title:"B",width:200}],[]),y=K(50,5,w,t.useCallback((l,o)=>({kind:x.Text,data:l[o],allowOverlay:!0,displayData:l[o]}),[]),t.useCallback((l,o,u)=>{const[d]=l;if(o.kind!==x.Text)return;const c=[...u];return c[d]=o.data,c},[]),n);return t.createElement(V,{title:"Server Side Data",description:t.createElement($,null,"Glide data grid is fully ready to handle your server side data needs. This example condenses the implementation into a single custom hook and loads in pages of 50. We are using 300ms sleeps, but network transactions should work the same.")},t.createElement(O,{ref:n,...y,width:"100%",columns:p,rows:3e3,rowMarkers:"both"}))};h.parameters={options:{showPanel:!1}};var v,P,E;h.parameters={...h.parameters,docs:{...(v=h.parameters)==null?void 0:v.docs,source:{originalSource:`() => {
  const ref = React.useRef<DataEditorRef | null>(null);
  const getRowData = React.useCallback(async (r: Item) => {
    await new Promise(res => setTimeout(res, 300));
    return range(r[0], r[1]).map(rowIndex => [\`1, \${rowIndex}\`, \`2, \${rowIndex}\`]);
  }, []);
  const columns = React.useMemo<readonly GridColumn[]>(() => {
    return [{
      title: "A",
      width: 150
    }, {
      title: "B",
      width: 200
    }];
  }, []);
  const args = useAsyncData<string[]>(50, 5, getRowData, React.useCallback((rowData, col) => ({
    kind: GridCellKind.Text,
    data: rowData[col],
    allowOverlay: true,
    displayData: rowData[col]
  }), []), React.useCallback((cell, newVal, rowData) => {
    const [col] = cell;
    if (newVal.kind !== GridCellKind.Text) return undefined;
    const newRow: string[] = [...rowData];
    newRow[col] = newVal.data;
    return newRow;
  }, []), ref);
  return <BeautifulWrapper title="Server Side Data" description={<Description>
                    Glide data grid is fully ready to handle your server side data needs. This example condenses the
                    implementation into a single custom hook and loads in pages of 50. We are using 300ms sleeps, but
                    network transactions should work the same.
                </Description>}>
            <DataEditor ref={ref} {...args} width="100%" columns={columns} rows={3000} rowMarkers="both" />
        </BeautifulWrapper>;
}`,...(E=(P=h.parameters)==null?void 0:P.docs)==null?void 0:E.source}}};const ne=["ServerSideData"];export{h as ServerSideData,ne as __namedExportsOrder,te as default};
