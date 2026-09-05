import{R as n}from"./iframe-DJsx_LMI.js";import{u as v,D as k}from"./data-editor-all-xo4btEP4.js";import{u as x,d as y,B as O,D as I,P as D}from"./utils-CpGkIYWR.js";import{S as P}from"./story-utils-4UdsftyL.js";import{G as m}from"./image-window-loader-BL-vzFfI.js";import"./lodash-BDhCB2cW.js";import"./preload-helper-Dp1pzeXC.js";import"./throttle-xUL8d2YT.js";import"./flatten-DKU9CJY_.js";import"./scrolling-data-grid-D8pm8eI1.js";import"./marked.esm-B8EVsN7W.js";import"./isArray-C6bsAYrg.js";import"./throttle--dN168Gr.js";const L={title:"Glide-Data-Grid/DataEditor Demos",decorators:[s=>n.createElement(P,null,n.createElement(O,{title:"Row Grouping",description:n.createElement(I,null,"The ",n.createElement(D,null,"rowGrouping")," prop can be used to group and even fold rows.")},n.createElement(s,null)))]},l=s=>{const{cols:G,getCellContent:u}=x(100),i=1e5,[o,f]=n.useState(()=>({groups:[{headerIndex:10,isCollapsed:!0,subGroups:[{headerIndex:15,isCollapsed:!1},{headerIndex:20,isCollapsed:!1}]},{headerIndex:30,isCollapsed:!1},...Array.from({length:100},(r,e)=>({headerIndex:i/100*e,isCollapsed:!1}))],height:55,navigationBehavior:"block",selectionBehavior:"block-spanning",themeOverride:{bgCell:"rgba(0, 100, 255, 0.1)"}})),{mapper:t,getRowGroupingForPath:d,updateRowGroupingByPath:g}=v(o,i),R=n.useCallback(r=>{const{path:e,isGroupHeader:a}=t(r);if(a&&r[0]===0){const p=d(o.groups,e);f(c=>({...c,groups:g(c.groups,e,{isCollapsed:!p.isCollapsed})}))}},[d,t,o.groups,g]),b=n.useCallback(r=>{const{path:e,isGroupHeader:a,originalIndex:p}=t(r);return r[0]===0?{kind:m.Text,data:`Row ${JSON.stringify(e)}`,displayData:`Row ${JSON.stringify(e)}`,allowOverlay:!1}:a?{kind:m.Loading,allowOverlay:!1}:u(p)},[u,t]);return n.createElement(k,{...y,rowGrouping:o,height:"100%",rowMarkers:"both",freezeColumns:s.freezeColumns,getRowThemeOverride:(r,e,a)=>{if(e%2===0)return{bgCell:"rgba(0, 0, 0, 0.1)"}},onCellClicked:R,getCellContent:b,columns:G,rows:i})};var C,w,h;l.parameters={...l.parameters,docs:{...(C=l.parameters)==null?void 0:C.docs,source:{originalSource:`(p: {
  freezeColumns: number;
}) => {
  const {
    cols,
    getCellContent
  } = useMockDataGenerator(100);
  const rows = 100_000;
  const [rowGrouping, setRowGrouping] = React.useState<RowGroupingOptions>(() => ({
    groups: [{
      headerIndex: 10,
      isCollapsed: true,
      subGroups: [{
        headerIndex: 15,
        isCollapsed: false
      }, {
        headerIndex: 20,
        isCollapsed: false
      }]
    }, {
      headerIndex: 30,
      isCollapsed: false
    }, ...Array.from({
      length: 100
    }, (_value, i): RowGroupingOptions["groups"][number] => {
      return {
        headerIndex: rows / 100 * i,
        isCollapsed: false
      };
    })],
    height: 55,
    navigationBehavior: "block",
    selectionBehavior: "block-spanning",
    themeOverride: {
      bgCell: "rgba(0, 100, 255, 0.1)"
    }
  }));
  const {
    mapper,
    getRowGroupingForPath,
    updateRowGroupingByPath
  } = useRowGrouping(rowGrouping, rows);
  const onCellClicked = React.useCallback((item: Item) => {
    const {
      path,
      isGroupHeader
    } = mapper(item);
    if (isGroupHeader && item[0] === 0) {
      const group = getRowGroupingForPath(rowGrouping.groups, path);
      setRowGrouping(prev => {
        const result: RowGroupingOptions = {
          ...prev,
          groups: updateRowGroupingByPath(prev.groups, path, {
            isCollapsed: !group.isCollapsed
          })
        };
        return result;
      });
    }
  }, [getRowGroupingForPath, mapper, rowGrouping.groups, updateRowGroupingByPath]);
  const getCellContentMangled = React.useCallback<DataEditorAllProps["getCellContent"]>(item => {
    const {
      path,
      isGroupHeader,
      originalIndex
    } = mapper(item);
    if (item[0] === 0) {
      return {
        kind: GridCellKind.Text,
        data: \`Row \${JSON.stringify(path)}\`,
        displayData: \`Row \${JSON.stringify(path)}\`,
        allowOverlay: false
      };
    } else if (isGroupHeader) {
      return {
        kind: GridCellKind.Loading,
        allowOverlay: false
        // span: [1, cols.length - 1],
      };
    }
    return getCellContent(originalIndex);
  }, [getCellContent, mapper]);
  return <DataEditor {...defaultProps} rowGrouping={rowGrouping} height="100%" rowMarkers="both" freezeColumns={p.freezeColumns} getRowThemeOverride={(_row, groupRow, _contentRow) => {
    if (groupRow % 2 === 0) {
      return {
        bgCell: "rgba(0, 0, 0, 0.1)"
      };
    }
    return undefined;
  }} onCellClicked={onCellClicked} getCellContent={getCellContentMangled} columns={cols}
  // verticalBorder={false}
  rows={rows} />;
}`,...(h=(w=l.parameters)==null?void 0:w.docs)==null?void 0:h.source}}};const W=["RowGrouping"];export{l as RowGrouping,W as __namedExportsOrder,L as default};
