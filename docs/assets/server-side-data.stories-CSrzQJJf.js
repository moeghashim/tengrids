import{g as O,R as a}from"./iframe-DJsx_LMI.js";import{G as M,C as V}from"./image-window-loader-BL-vzFfI.js";import{S as $}from"./story-utils-4UdsftyL.js";import{D as K}from"./data-editor-all-xo4btEP4.js";import{n as L,o as j,r as E}from"./throttle-xUL8d2YT.js";import{B as H}from"./utils-CpGkIYWR.js";import{a as J}from"./doc-wrapper-C-AxFADA.js";import"./preload-helper-Dp1pzeXC.js";import"./marked.esm-B8EVsN7W.js";import"./flatten-DKU9CJY_.js";import"./scrolling-data-grid-D8pm8eI1.js";import"./isArray-C6bsAYrg.js";import"./throttle--dN168Gr.js";import"./toConsumableArray-Cg7-Q_9P.js";var R,T;function N(){if(T)return R;T=1;function t(d,s,n){var o=-1,r=d.length;s<0&&(s=-s>r?0:r+s),n=n>r?r:n,n<0&&(n+=r),r=s>n?0:n-s>>>0,s>>>=0;for(var c=Array(r);++o<r;)c[o]=d[o+s];return c}return R=t,R}var b,G;function Q(){if(G)return b;G=1;var t=L();function d(s){var n=t(s),o=n%1;return n===n?o?n-o:n:0}return b=d,b}var I,S;function U(){if(S)return I;S=1;var t=N(),d=j(),s=Q(),n=Math.ceil,o=Math.max;function r(c,l,m){(m?d(c,l,m):l===void 0)?l=1:l=o(s(l),0);var v=c==null?0:c.length;if(!v||l<1)return[];for(var w=0,D=0,p=Array(n(v/l));w<v;)p[D++]=t(c,w,w+=l);return p}return I=r,I}var X=U();const Y=O(X),me={title:"Glide-Data-Grid/DataEditor Demos",decorators:[t=>a.createElement($,null,a.createElement(t,null))]};function Z(t,d,s,n,o,r){t=Math.max(t,1);const c=a.useRef(V.empty()),l=a.useRef([]),[m,v]=a.useState({x:0,y:0,width:0,height:0}),w=a.useRef(m);w.current=m;const D=a.useCallback(e=>{v(i=>e.x===i.x&&e.y===i.y&&e.width===i.width&&e.height===i.height?i:e)},[]),p=a.useCallback(e=>{const[i,h]=e,u=l.current[h];return u!==void 0?n(u,i):{kind:M.Loading,allowOverlay:!1}},[n]),C=a.useCallback(async e=>{var k;c.current=c.current.add(e);const i=e*t,h=await s([i,(e+1)*t]),u=w.current,f=[],g=l.current;for(const[P,F]of h.entries()){g[P+i]=F;for(let y=u.x;y<=u.x+u.width;y++)f.push({cell:[y,P+i]})}(k=r.current)==null||k.updateCells(f)},[s,r,t]),B=a.useCallback(e=>async()=>{const i=Math.max(0,Math.floor(e.y/t)),h=Math.floor((e.y+e.height)/t);for(const f of Y(E(i,h+1).filter(g=>!c.current.hasIndex(g)),d))await Promise.allSettled(f.map(C));const u=[];for(let f=e.y;f<e.y+e.height;f++){const g=[];for(let k=e.x;k<e.x+e.width;k++)g.push(p([k,f]));u.push(g)}return u},[p,C,d,t]);a.useEffect(()=>{const e=m,i=Math.max(0,Math.floor((e.y-t/2)/t)),h=Math.floor((e.y+e.height+t/2)/t);for(const u of E(i,h+1))c.current.hasIndex(u)||C(u)},[C,t,m]);const W=a.useCallback((e,i)=>{const[,h]=e,u=l.current[h];if(u===void 0)return;const f=o(e,i,u);f!==void 0&&(l.current[h]=f)},[o]);return{getCellContent:p,onVisibleRegionChanged:D,onCellEdited:W,getCellsForSelection:B}}const x=()=>{const t=a.useRef(null),d=a.useCallback(async o=>(await new Promise(r=>setTimeout(r,300)),E(o[0],o[1]).map(r=>[`1, ${r}`,`2, ${r}`])),[]),s=a.useMemo(()=>[{title:"A",width:150},{title:"B",width:200}],[]),n=Z(50,5,d,a.useCallback((o,r)=>({kind:M.Text,data:o[r],allowOverlay:!0,displayData:o[r]}),[]),a.useCallback((o,r,c)=>{const[l]=o;if(r.kind!==M.Text)return;const m=[...c];return m[l]=r.data,m},[]),t);return a.createElement(H,{title:"Server Side Data",description:a.createElement(J,null,"Glide data grid is fully ready to handle your server side data needs. This example condenses the implementation into a single custom hook and loads in pages of 50. We are using 300ms sleeps, but network transactions should work the same.")},a.createElement(K,{ref:t,...n,width:"100%",columns:s,rows:3e3,rowMarkers:"both"}))};x.parameters={options:{showPanel:!1}};var _,q,A;x.parameters={...x.parameters,docs:{...(_=x.parameters)==null?void 0:_.docs,source:{originalSource:`() => {
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
}`,...(A=(q=x.parameters)==null?void 0:q.docs)==null?void 0:A.source}}};const he=["ServerSideData"];export{x as ServerSideData,he as __namedExportsOrder,me as default};
