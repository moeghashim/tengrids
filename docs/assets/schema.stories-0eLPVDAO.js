import{r as t}from"./iframe-Dnr8FEb7.js";/* empty css              */import{b as D,u as v,c as x,a as r}from"./use-schema-grid-Du_muNuP.js";import{D as R}from"./data-editor-all-0mILIZ8H.js";import"./preload-helper-Dp1pzeXC.js";import"./throttle-bg4wIPcC.js";import"./chunk-DdqPsvJ0.js";import"./flatten-BiR_gpKC.js";import"./marked.esm-CHiQR2Yr.js";const j={title:"Extra Packages/Schema",parameters:{layout:"fullscreen"}},c=x({name:r.text({title:"Name",width:160}),cost:r.number({title:"Cost",format:"currency",currency:"USD",width:110}),status:r.enum({title:"Status",values:["draft","active","closed"],width:110}),due:r.date({title:"Due",width:140}),paid:r.boolean({title:"Paid",width:80}),site:r.uri({title:"Website",width:200}),notes:r.markdown({title:"Notes",readonly:!0,width:220})}),i=["draft","active","closed"],u=["Ada","Grace","Linus","Mia","Noor","Ken","Sara","Yuki","Omar","Lea"];function f(a){return Array.from({length:a},(s,e)=>({name:`${u[e%u.length]} ${e}`,cost:Math.round((10+e*17%990)*100)/100,status:i[e%i.length],due:e%7===0?void 0:new Date(2026,e%12,e%28+1),paid:e%3===0,site:`https://example.com/${e}`,notes:e%5===0?"_starred_":"ok"}))}const b=({title:a,blurb:s,children:e})=>t.createElement("div",{style:{padding:24,fontFamily:"Inter, system-ui, sans-serif",color:"#1a1a1a",background:"#f6f7fb",minHeight:"100vh",boxSizing:"border-box"}},t.createElement("h2",{style:{margin:"0 0 4px"}},a),t.createElement("p",{style:{margin:"0 0 12px",color:"#555",maxWidth:720}},s),t.createElement("div",{style:{width:"100%",height:460,background:"white",borderRadius:8,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.12)"}},e)),o=()=>{const[a,s]=t.useState(()=>f(1e3)),e=v(c,a,{onRowsChange:s});return t.createElement(b,{title:"useSchemaGrid · 1,000 rows",blurb:"The §5.2 schema: one object literal plus useSchemaGrid. Edit cost, paid, status, or due — invalid values (letters in Cost, a status not in the list, a garbage date) are rejected."},t.createElement(R,{...e}))},n=()=>{const a=t.useMemo(()=>f(1e3),[]),s=t.useRef(a);s.current=a;const e=t.useRef(null),S=t.useCallback(async l=>(await new Promise(E=>{window.setTimeout(E,15)}),s.current.slice(l[0],l[1])),[]),y=D(50,2,S,c.toCell,c.onEdited,e);return t.createElement(b,{title:"schema.toCell + useAsyncDataSource",blurb:"schema.toCell and schema.onEdited plug into useAsyncDataSource with no adapters. Pages of 50 rows load as you scroll."},t.createElement(R,{ref:e,columns:c.columns(),rows:a.length,...y}))};var d,m,h;o.parameters={...o.parameters,docs:{...(d=o.parameters)==null?void 0:d.docs,source:{originalSource:`() => {
  const [rows, setRows] = React.useState<readonly Row[]>(() => makeRows(1000));
  const grid = useSchemaGrid(schema, rows, {
    onRowsChange: setRows
  });
  return <Frame title="useSchemaGrid · 1,000 rows" blurb="The §5.2 schema: one object literal plus useSchemaGrid. Edit cost, paid, status, or due — invalid values (letters in Cost, a status not in the list, a garbage date) are rejected.">
            <DataEditor {...grid} />
        </Frame>;
}`,...(h=(m=o.parameters)==null?void 0:m.docs)==null?void 0:h.source}}};var w,g,p;n.parameters={...n.parameters,docs:{...(w=n.parameters)==null?void 0:w.docs,source:{originalSource:`() => {
  const allRows = React.useMemo(() => makeRows(1000), []);
  const dataRef = React.useRef(allRows);
  dataRef.current = allRows;
  const gridRef = React.useRef<DataEditorRef | null>(null);
  const getRowData = React.useCallback(async (range: readonly [number, number]) => {
    await new Promise<void>(resolve => {
      window.setTimeout(resolve, 15);
    });
    return dataRef.current.slice(range[0], range[1]);
  }, []);
  const source = useAsyncDataSource(50, 2, getRowData, schema.toCell, schema.onEdited, gridRef);
  return <Frame title="schema.toCell + useAsyncDataSource" blurb="schema.toCell and schema.onEdited plug into useAsyncDataSource with no adapters. Pages of 50 rows load as you scroll.">
            <DataEditor ref={gridRef} columns={schema.columns()} rows={allRows.length} {...source} />
        </Frame>;
}`,...(p=(g=n.parameters)==null?void 0:g.docs)==null?void 0:p.source}}};const N=["InMemory","AsyncSource"];export{n as AsyncSource,o as InMemory,N as __namedExportsOrder,j as default};
