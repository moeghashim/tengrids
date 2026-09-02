import{R as e}from"./iframe-Cy0SHszz.js";import{D as g}from"./data-editor-all-Bt4s6Qaw.js";import{u as f,B as M,D as v,P as E,d as D}from"./utils-qnqgqRi7.js";import{S as P}from"./story-utils-Bbsf33bb.js";import"./preload-helper-C1FmrZbK.js";import"./image-window-loader-ChlrGYux.js";import"./throttle-rr6oSEDW.js";import"./marked.esm-Do_Pr3SV.js";import"./flatten-Tc-1Zgda.js";import"./scrolling-data-grid-BjpqPWLN.js";import"./index-D_kXk1yT.js";import"./throttle--dN168Gr.js";const $={title:"Glide-Data-Grid/DataEditor Demos",decorators:[n=>e.createElement(P,null,e.createElement(n,null))]},o=()=>{const{cols:n,getCellContent:m}=f(6),i=e.useRef(null),[d,r]=e.useState("Move the mouse over the grid"),p=e.useCallback(s=>{var a;const t=(a=i.current)==null?void 0:a.getMouseArgsForPosition(s.clientX,s.clientY,s);t===void 0?r("Outside grid"):t.kind==="cell"?r(`Cell ${t.location[0]}, ${t.location[1]}`):r(t.kind)},[]);return e.createElement(M,{title:"getMouseArgsForPosition",description:e.createElement(v,null,"Use ",e.createElement(E,null,"getMouseArgsForPosition")," to translate pointer coordinates into grid locations.")},e.createElement("div",{onMouseMove:p},e.createElement(g,{...D,ref:i,columns:n,getCellContent:m,rows:1e3})),e.createElement("div",{style:{marginTop:8}},d))};var l,c,u;o.parameters={...o.parameters,docs:{...(l=o.parameters)==null?void 0:l.docs,source:{originalSource:`() => {
  const {
    cols,
    getCellContent
  } = useMockDataGenerator(6);
  const ref = React.useRef<DataEditorRef>(null);
  const [info, setInfo] = React.useState<string>("Move the mouse over the grid");
  const onMouseMove = React.useCallback((ev: React.MouseEvent<HTMLDivElement>) => {
    const args = ref.current?.getMouseArgsForPosition(ev.clientX, ev.clientY, ev);
    if (args === undefined) {
      setInfo("Outside grid");
    } else if (args.kind === "cell") {
      setInfo(\`Cell \${args.location[0]}, \${args.location[1]}\`);
    } else {
      setInfo(args.kind);
    }
  }, []);
  return <BeautifulWrapper title="getMouseArgsForPosition" description={<Description>
                    Use <PropName>getMouseArgsForPosition</PropName> to translate
                    pointer coordinates into grid locations.
                </Description>}>
            <div onMouseMove={onMouseMove}>
                <DataEditor {...defaultProps} ref={ref} columns={cols} getCellContent={getCellContent} rows={1000} />
            </div>
            <div style={{
      marginTop: 8
    }}>{info}</div>
        </BeautifulWrapper>;
}`,...(u=(c=o.parameters)==null?void 0:c.docs)==null?void 0:u.source}}};const N=["GetMouseArgsForPosition"];export{o as GetMouseArgsForPosition,N as __namedExportsOrder,$ as default};
