import{R as e}from"./iframe-gtUd2ThD.js";import{D as p}from"./data-editor-all-BDmbvInp.js";import{u,d as C,B as f,D as R,P as g}from"./utils-suV3M9is.js";import{S as h}from"./story-utils-R7FeDyC8.js";import{O as w,V as o}from"./image-window-loader-8z6v7mDR.js";import"./preload-helper-Dp1pzeXC.js";import"./throttle-CUoaKfhD.js";import"./flatten-DH73lhJo.js";import"./scrolling-data-grid-Dy2wBT_0.js";import"./marked.esm-CWskPn-N.js";import"./isArray-DlVmPg05.js";import"./throttle--dN168Gr.js";const v={title:"Glide-Data-Grid/DataEditor Demos",decorators:[n=>e.createElement(h,null,e.createElement(f,{title:"Custom renderers",description:e.createElement(R,null,"Override internal cell renderers by passing the "," ",e.createElement(g,null,"renderers")," prop.")},e.createElement(n,null)))]},t=()=>{const{cols:n,getCellContent:i}=u(100,!0,!0),m=e.useMemo(()=>[...w,{...o,draw:l=>{const{ctx:a,rect:r}=l;a.fillStyle="#ffe0e0",a.fillRect(r.x,r.y,r.width,r.height),o.draw(l)}}],[]);return e.createElement(p,{...C,getCellContent:i,columns:n,rows:200,rowMarkers:"both",renderers:m})};var s,c,d;t.parameters={...t.parameters,docs:{...(s=t.parameters)==null?void 0:s.docs,source:{originalSource:`() => {
  const {
    cols,
    getCellContent
  } = useMockDataGenerator(100, true, true);
  const renderers = React.useMemo<readonly InternalCellRenderer<InnerGridCell>[]>(() => {
    return [...AllCellRenderers, {
      ...markerCellRenderer,
      draw: args => {
        const {
          ctx,
          rect
        } = args;
        ctx.fillStyle = "#ffe0e0";
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        markerCellRenderer.draw(args as any);
      }
    } as InternalCellRenderer<InnerGridCell>];
  }, []);
  return <DataEditor {...defaultProps} getCellContent={getCellContent} columns={cols} rows={200} rowMarkers="both" renderers={renderers} />;
}`,...(d=(c=t.parameters)==null?void 0:c.docs)==null?void 0:d.source}}};const A=["OverrideMarkerRenderer"];export{t as OverrideMarkerRenderer,A as __namedExportsOrder,v as default};
