import{R as n}from"./iframe-gtUd2ThD.js";import{D as i}from"./data-editor-all-BDmbvInp.js";import{a as F,d,B as u,D as A}from"./utils-suV3M9is.js";import{S as p}from"./story-utils-R7FeDyC8.js";import"./preload-helper-Dp1pzeXC.js";import"./image-window-loader-8z6v7mDR.js";import"./throttle-CUoaKfhD.js";import"./marked.esm-CWskPn-N.js";import"./flatten-DH73lhJo.js";import"./scrolling-data-grid-Dy2wBT_0.js";import"./isArray-DlVmPg05.js";import"./throttle--dN168Gr.js";const L={title:"Glide-Data-Grid/DataEditor Demos",decorators:[t=>n.createElement(p,null,n.createElement(u,{title:"Theme per column",description:n.createElement(n.Fragment,null,n.createElement(A,null,"Each column can provide theme overrides for rendering that column."))},n.createElement(t,null)))]},r=()=>{const{cols:t,getCellContent:l,onColumnResize:s,setCellValue:C}=F(),m=n.useMemo(()=>{const e=[...t];return e[3]={...e[3],themeOverride:{textDark:"#009CA6",bgIconHeader:"#009CA6",accentColor:"#009CA6",accentLight:"#009CA620",fgIconHeader:"#FFFFFF",baseFontStyle:"600 13px"}},e[4]={...e[4],themeOverride:{textDark:"#009CA6",bgIconHeader:"#009CA6",accentColor:"#009CA6",accentLight:"#009CA620",fgIconHeader:"#FFFFFF",baseFontStyle:"600 13px"}},e[9]={...e[9],themeOverride:{textDark:"#009CA6",bgIconHeader:"#009CA6",accentColor:"#009CA6",accentLight:"#009CA620",fgIconHeader:"#FFFFFF"}},e[10]={...e[10],themeOverride:{textDark:"#009CA6",bgIconHeader:"#009CA6",accentColor:"#009CA6",accentLight:"#009CA620",fgIconHeader:"#FFFFFF"}},e},[t]);return n.createElement(i,{...d,getCellContent:l,columns:m,onCellEdited:C,onColumnResize:s,rows:1e3})};var o,c,a;r.parameters={...r.parameters,docs:{...(o=r.parameters)==null?void 0:o.docs,source:{originalSource:`() => {
  const {
    cols,
    getCellContent,
    onColumnResize,
    setCellValue
  } = useAllMockedKinds();
  const realCols = React.useMemo(() => {
    const c = [...cols];
    c[3] = {
      ...c[3],
      themeOverride: {
        textDark: "#009CA6",
        bgIconHeader: "#009CA6",
        accentColor: "#009CA6",
        accentLight: "#009CA620",
        fgIconHeader: "#FFFFFF",
        baseFontStyle: "600 13px"
      }
    };
    c[4] = {
      ...c[4],
      themeOverride: {
        textDark: "#009CA6",
        bgIconHeader: "#009CA6",
        accentColor: "#009CA6",
        accentLight: "#009CA620",
        fgIconHeader: "#FFFFFF",
        baseFontStyle: "600 13px"
      }
    };
    c[9] = {
      ...c[9],
      themeOverride: {
        textDark: "#009CA6",
        bgIconHeader: "#009CA6",
        accentColor: "#009CA6",
        accentLight: "#009CA620",
        fgIconHeader: "#FFFFFF"
      }
    };
    c[10] = {
      ...c[10],
      themeOverride: {
        textDark: "#009CA6",
        bgIconHeader: "#009CA6",
        accentColor: "#009CA6",
        accentLight: "#009CA620",
        fgIconHeader: "#FFFFFF"
      }
    };
    return c;
  }, [cols]);
  return <DataEditor {...defaultProps} getCellContent={getCellContent} columns={realCols} onCellEdited={setCellValue} onColumnResize={onColumnResize} rows={1000} />;
}`,...(a=(c=r.parameters)==null?void 0:c.docs)==null?void 0:a.source}}};const R=["ThemePerColumn"];export{r as ThemePerColumn,R as __namedExportsOrder,L as default};
