var Ke=Object.defineProperty;var He=(r,e,t)=>e in r?Ke(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var J=(r,e,t)=>He(r,typeof e!="symbol"?e+"":e,t);import{r as o}from"./iframe-CFAlCqF_.js";/* empty css              */import{G as b,m as Ye,d as ge,D as _,C as we}from"./data-editor-all-Bvy3VWMf.js";import"./preload-helper-C1FmrZbK.js";import"./throttle-CEcqHPvd.js";import"./flatten-_QAO97z6.js";import"./marked.esm-CMLlVlmN.js";class F extends Error{constructor(e="The AI request was aborted"){super(e),this.name="AbortError"}}function Q(r){return r instanceof Error&&r.name==="AbortError"}function Ze(r){return r!==null&&typeof r=="object"&&Symbol.asyncIterator in r}async function ae(r,e,t){if(!Ze(r)){const s=await r;if((t==null?void 0:t.aborted)===!0)throw new F;return s}let n="";for await(const s of r){if((t==null?void 0:t.aborted)===!0)throw new F;n+=s,e==null||e(n)}return n}function ve(r,e){return new Promise((t,n)=>{if(e.aborted)return n(new F);const s=setTimeout(()=>{e.removeEventListener("abort",a),t()},r),a=()=>{clearTimeout(s),n(new F)};e.addEventListener("abort",a,{once:!0})})}function K(r,e={}){const t=e.delayMs??0,n=[];return{calls:n,complete(s,{signal:a}){n.push(s);const u=r(s);if(typeof u=="string")return(async()=>{if(t>0&&await ve(t,a),a.aborted)throw new F;return u})();const c=u;return async function*(){for(const l of c){if(t>0&&await ve(t,a),a.aborted)throw new F;yield l}}()}}}class Xe{constructor(e){J(this,"provider");J(this,"concurrency");J(this,"cacheSize");J(this,"cache",new Map);J(this,"queue",[]);J(this,"inflight",new Map);J(this,"stats",{hits:0,misses:0,completed:0,cancelled:0,errors:0});this.provider=e.provider,this.concurrency=Math.max(1,e.concurrency??2),this.cacheSize=Math.max(1,e.cacheSize??1e3)}get(e){return this.cache.get(e)}has(e){return this.cache.has(e)}isPending(e){return this.inflight.has(e)||this.queue.some(t=>t.key===e)}get pendingCount(){return this.inflight.size+this.queue.length}request(e,t,n={}){const s=this.cache.get(e);if(s!==void 0)return this.stats.hits++,Promise.resolve(s);const a=this.inflight.get(e)??this.queue.find(l=>l.key===e);if(a!==void 0)return this.stats.hits++,n.onChunk!==void 0&&a.chunkListeners.push(n.onChunk),(n.priority??0)>a.priority&&(a.priority=n.priority??0,this.sortQueue()),new Promise((l,i)=>{a.resolvers.push(l),a.rejecters.push(i)});this.stats.misses++;const u={key:e,input:t,priority:n.priority??0,controller:new AbortController,chunkListeners:n.onChunk===void 0?[]:[n.onChunk],resolvers:[],rejecters:[],started:!1},c=new Promise((l,i)=>{u.resolvers.push(l),u.rejecters.push(i)});return this.queue.push(u),this.sortQueue(),this.pump(),c}cancel(e){const t=this.queue.findIndex(s=>s.key===e);if(t!==-1){const[s]=this.queue.splice(t,1);return this.finishCancelled(s),!0}const n=this.inflight.get(e);return n!==void 0?(n.controller.abort(),!0):!1}cancelWhere(e){const t=[...this.queue.map(n=>n.key),...this.inflight.keys()].filter(e);for(const n of t)this.cancel(n);return t.length}cancelAll(){return this.cancelWhere(()=>!0)}clearCache(){this.cache.clear()}clearKey(e){return this.cache.delete(e)}prime(e,t){this.remember(e,t)}sortQueue(){this.queue.sort((e,t)=>t.priority-e.priority)}remember(e,t){for(this.cache.delete(e),this.cache.set(e,t);this.cache.size>this.cacheSize;){const n=this.cache.keys().next().value;if(n===void 0)break;this.cache.delete(n)}}finishCancelled(e){this.stats.cancelled++;for(const t of e.rejecters)t(new F)}pump(){for(;this.inflight.size<this.concurrency&&this.queue.length>0;){const e=this.queue.shift();if(e===void 0)break;e.started=!0,this.inflight.set(e.key,e),this.runJob(e)}}async runJob(e){try{const t=this.provider.complete(e.input,{signal:e.controller.signal}),n=await ae(t,s=>{if(!e.controller.signal.aborted)for(const a of e.chunkListeners)a(s)},e.controller.signal);if(e.controller.signal.aborted)throw new F;this.remember(e.key,n),this.stats.completed++;for(const s of e.resolvers)s(n)}catch(t){if(Q(t)||e.controller.signal.aborted){this.stats.cancelled++;for(const n of e.rejecters)n(new F)}else{this.stats.errors++;for(const n of e.rejecters)n(t)}}finally{this.inflight.delete(e.key),this.pump()}}}function ye(r){var e;return r.kind===b.Custom&&((e=r.data)==null?void 0:e.kind)==="ai-cell"}function et(r,e={}){return{kind:b.Custom,allowOverlay:!0,copyData:"",...e,data:{kind:"ai-cell",prompt:r,status:"idle"}}}function $(r,e){const t={...r.data,...e};return{...r,data:t,copyData:t.result??""}}const tt={display:"flex",flexDirection:"column",gap:6,padding:8,minWidth:280,fontFamily:"var(--gdg-font-family)",color:"var(--gdg-text-dark)"},nt={font:"inherit",fontSize:"var(--gdg-editor-font-size)",color:"inherit",background:"var(--gdg-bg-cell)",border:"1px solid var(--gdg-border-color)",borderRadius:4,padding:6,resize:"vertical",minHeight:48},rt={fontSize:"var(--gdg-editor-font-size)",whiteSpace:"pre-wrap",maxHeight:160,overflow:"auto",padding:"4px 0"},ot={alignSelf:"flex-start",font:"inherit",fontSize:12,padding:"4px 10px",borderRadius:4,border:"1px solid var(--gdg-border-color)",background:"var(--gdg-bg-header)",color:"var(--gdg-text-dark)",cursor:"pointer"},st=({value:r,onChange:e})=>{const{prompt:t,result:n,status:s,error:a}=r.data;return o.createElement("div",{style:tt,className:"gdg-ai-cell-editor"},o.createElement("label",{style:{fontSize:11,color:"var(--gdg-text-medium)"}},"Prompt — use ","{Column Title}"," to reference this row"),o.createElement("textarea",{style:nt,value:t,autoFocus:!0,onChange:u=>e($({...r,data:{...r.data,prompt:u.target.value}},{result:void 0,status:"idle",error:void 0}))}),o.createElement("div",{style:rt,"data-status":s??"idle"},s==="error"?`⚠ ${a??"Generation failed"}`:n??(s==="pending"||s==="streaming"?"Generating…":"No result yet")),o.createElement("button",{type:"button",style:ot,onClick:()=>e($(r,{result:void 0,status:"idle",error:void 0}))},"Regenerate"))},be=900,at={kind:b.Custom,isMatch:r=>{var e;return((e=r.data)==null?void 0:e.kind)==="ai-cell"},draw:(r,e)=>{const{ctx:t,theme:n,rect:s,requestAnimationFrame:a,frameTime:u}=r,{prompt:c,result:l,status:i="idle",error:d}=e.data;if(i==="done"&&l!==void 0)return ge(r,l,e.contentAlign),!0;if(i==="streaming"&&l!==void 0&&l!=="")return ge(r,l,e.contentAlign),a(),!0;if(i==="pending"||i==="streaming"){const p=1+Math.floor(u%be/(be/3))%3;return t.fillStyle=n.textLight,t.font=n.baseFontFull,t.textBaseline="middle",t.fillText("✦ "+".".repeat(p),s.x+n.cellHorizontalPadding,s.y+s.height/2),a(),!0}return i==="error"?(t.fillStyle=n.textMedium,t.font=n.baseFontFull,t.textBaseline="middle",t.fillText(`⚠ ${d??"error"}`,s.x+n.cellHorizontalPadding,s.y+s.height/2),!0):(t.fillStyle=n.textLight,t.font=n.baseFontFull,t.textBaseline="middle",t.fillText(c===""?"✦ (empty prompt)":`✦ ${c}`,s.x+n.cellHorizontalPadding,s.y+s.height/2),!0)},measure:(r,e,t)=>{const n=e.data.result??e.data.prompt;return Ye(n,r,t.baseFontFull).width+t.cellHorizontalPadding*2},provideEditor:()=>({editor:r=>o.createElement(st,{value:r.value,onChange:r.onChange}),disablePadding:!0}),onPaste:(r,e)=>({...e,prompt:r,result:void 0,status:"idle",error:void 0}),onDelete:r=>$(r,{result:void 0,status:"idle",error:void 0})};function B(r){switch(r.kind){case b.Text:case b.Number:case b.Uri:return r.displayData??(r.data===void 0?"":String(r.data));case b.Markdown:case b.RowID:return r.data??"";case b.Boolean:return r.data===!0?"true":r.data===!1?"false":"";case b.Bubble:case b.Image:return r.data.join(", ");case b.Drilldown:return r.data.map(e=>e.text).join(", ");case b.Custom:return r.copyData??"";case b.Loading:case b.Protected:return"";default:return""}}function pe(r){const e=/```(?:json)?\s*([\s\S]*?)```/i.exec(r),t=[e==null?void 0:e[1],r].filter(n=>typeof n=="string");for(const n of t){const s=n.trim();try{return JSON.parse(s)}catch{}const a=[s.indexOf("["),s.indexOf("{")].filter(i=>i!==-1);if(a.length===0)continue;const u=Math.min(...a),c=s[u]==="["?"]":"}",l=s.lastIndexOf(c);if(!(l<=u))try{return JSON.parse(s.slice(u,l+1))}catch{}}}function it(r){let e=5381;for(let t=0;t<r.length;t++)e=(e<<5)+e+r.charCodeAt(t)|0;return(e>>>0).toString(36)}function Ce(r,e,t){return r.replace(/\{([^{}]+)\}/g,(n,s)=>{const a=s.trim().toLowerCase(),u=e.findIndex(c=>c.title.toLowerCase()===a||c.id!==void 0&&c.id.toLowerCase()===a);return u===-1||t[u]===void 0?n:B(t[u])})}function lt(r){const{provider:e,columns:t,getCellContent:n,gridRef:s,autoRun:a=!0,concurrency:u,system:c}=r,l=r.scheduler,i=o.useMemo(()=>{if(l!==void 0)return l;if(e===void 0)throw new Error("useAiCells needs a provider or a scheduler");return new Xe({provider:e,concurrency:u})},[l,e,u]),[,d]=o.useReducer(w=>w+1,0),p=o.useRef(new Map),m=o.useRef(new Map),C=o.useRef(new Set),y=o.useRef(void 0),f=o.useRef(new Map),h=o.useCallback(w=>{const g=s==null?void 0:s.current;g!=null?g.updateCells([{cell:w}]):d()},[s]),k=o.useCallback(w=>t.map((g,v)=>n([v,w])),[t,n]),M=o.useCallback((w,g)=>`${w[0]}:${w[1]}:${it(g)}`,[]),S=o.useCallback(w=>{const g=y.current;return g===void 0?!0:w[1]>=g.y&&w[1]<g.y+g.height},[]),E=o.useCallback((w,g,v)=>{f.current.set(g,w),i.request(g,{prompt:v,system:c,feature:"ai-cell",context:{location:w}},{priority:S(w)?1:0,onChunk:x=>{p.current.set(g,x),h(w)}}).then(()=>{p.current.delete(g),m.current.delete(g),h(w)}).catch(x=>{p.current.delete(g),Q(x)||(m.current.set(g,x instanceof Error?x.message:String(x)),h(w))})},[i,c,S,h]),R=o.useCallback(w=>{const g=n(w);if(!ye(g))return g;if(g.data.prompt.trim()==="")return $(g,{status:"idle"});const v=Ce(g.data.prompt,t,k(w[1])),x=M(w,v),T=i.get(x);if(T!==void 0)return $(g,{result:T,status:"done",error:void 0});const D=m.current.get(x);if(D!==void 0)return $(g,{status:"error",error:D,result:void 0});const z=p.current.get(x);return z!==void 0?$(g,{status:"streaming",result:z}):i.isPending(x)?$(g,{status:"pending",result:void 0}):(a||C.current.has(x))&&S(w)?(C.current.delete(x),E(w,x,v),$(g,{status:"pending",result:void 0})):$(g,{status:"idle"})},[n,t,k,M,i,a,S,E]),N=o.useCallback(w=>{y.current=w,i.cancelWhere(g=>{const v=f.current.get(g);return v!==void 0&&!(v[1]>=w.y&&v[1]<w.y+w.height)})},[i]),A=o.useCallback(w=>{const g=n(w);if(ye(g))return Ce(g.data.prompt,t,k(w[1]))},[n,t,k]),L=o.useCallback(w=>{const g=A(w);if(g===void 0)return;const v=M(w,g);i.has(v)||i.isPending(v)||(C.current.add(v),m.current.delete(v),E(w,v,g),h(w))},[A,M,i,E,h]),W=o.useCallback(w=>{const g=A(w);if(g===void 0)return;const v=M(w,g);i.cancel(v),i.clearKey(v),m.current.delete(v),p.current.delete(v),C.current.add(v),E(w,v,g),h(w)},[A,M,i,E,h]),I=o.useMemo(()=>[at],[]);return{getCellContent:R,onVisibleRegionChanged:N,customRenderers:I,scheduler:i,regenerate:W,run:L,resolvePrompt:A}}const ue={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90,hundred:100,thousand:1e3,million:1e6,billion:1e9},ct={k:1e3,m:1e6,b:1e9,bn:1e9,mm:1e6};function We(r){let e=r.trim().toLowerCase();if(e==="")return;const t=Number(e);if(!Number.isNaN(t)&&/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/.test(e))return t;let n=!1;/^\(.*\)$/.test(e)&&(n=!0,e=e.slice(1,-1).trim()),e=e.replace(/^[-−–]/,c=>(n=!n||c==="","")),e=e.replace(/^\+/,""),e=e.replace(/^[$€£¥₹]\s*/,"").replace(/\s*(usd|eur|gbp|%|percent)$/,""),e=e.replace(/,/g,"").replace(/\s+/g," ").trim();const s=/^(\d+\.?\d*|\.\d+)\s*(k|m|b|bn|mm|thousand|million|billion)$/.exec(e);if(s!==null){const c=ct[s[2]]??ue[s[2]],l=Number(s[1])*c;return n?-l:l}const a=Number(e);if(!Number.isNaN(a)&&e!=="")return n?-a:a;const u=e.split(/[\s-]+/);if(u.length>0&&u.every(c=>c in ue)){let c=0,l=0;for(const d of u){const p=ue[d];p===100?l=Math.max(l,1)*100:p>=1e3?(c+=Math.max(l,1)*p,l=0):l+=p}const i=c+l;return n?-i:i}}const ut=new Set(["true","yes","y","1","on","✓","✔","x","checked","done","t"]),dt=new Set(["false","no","n","0","off","✗","✘","unchecked","f","-","—"]);function mt(r){const e=r.trim().toLowerCase();if(ut.has(e))return!0;if(dt.has(e))return!1}function de(r){const e=r.trim();if(e!==""){if(/^[a-z][a-z0-9+.-]*:\/\//i.test(e)||/^(mailto|tel):/i.test(e))return e;if(/^[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(e))return`https://${e}`;if(/^[\w.+-]+@[\w-]+\.[a-z]{2,}$/i.test(e))return`mailto:${e}`}}function oe(r,e){switch(e.kind){case b.Text:{const t=r.trim();return{...e,data:t,displayData:t}}case b.Markdown:case b.RowID:return{...e,data:r.trim()};case b.Number:{const t=We(r);return t===void 0?void 0:{...e,data:t,displayData:String(t)}}case b.Boolean:{const t=mt(r);return t===void 0?void 0:{...e,data:t}}case b.Uri:{const t=de(r);return t===void 0?void 0:{...e,data:t,displayData:t}}case b.Bubble:{const t=r.split(/[,;\n]+/).map(n=>n.trim()).filter(n=>n!=="");return{...e,data:t}}case b.Image:{const t=r.split(/[\s,;]+/).map(n=>n.trim()).filter(n=>de(n)!==void 0).map(n=>de(n));return t.length===0?void 0:{...e,data:t}}default:return}}const pt=new Set(["contains","notContains","eq","neq","gt","gte","lt","lte","startsWith","endsWith","empty","notEmpty","in"]),ht={"=":"eq","==":"eq",equals:"eq",is:"eq","!=":"neq","<>":"neq",not:"neq",isnot:"neq",">":"gt",after:"gt",greater:"gt",">=":"gte","<":"lt",before:"lt",less:"lt","<=":"lte",includes:"contains",like:"contains",has:"contains",excludes:"notContains",startswith:"startsWith",endswith:"endsWith",isempty:"empty",isnotempty:"notEmpty",oneof:"in",any:"in"};function ft(r){const e=pe(r);if(e==null||typeof e!="object")return;const t=e,n=Array.isArray(t.clauses)?t.clauses:Array.isArray(e)?e:void 0;if(n===void 0)return;const s=[];for(const u of n){if(u===null||typeof u!="object")continue;const{column:c,op:l,value:i}=u;if(typeof c!="string"||typeof l!="string")continue;const d=l.trim(),p=pt.has(d)?d:ht[d.toLowerCase().replace(/[\s_-]/g,"")];if(p===void 0)continue;const m=i==null?void 0:Array.isArray(i)?i.filter(C=>typeof C=="string"||typeof C=="number"):typeof i=="string"||typeof i=="number"||typeof i=="boolean"?i:String(i);s.push({column:c,op:p,value:m})}return s.length===0?void 0:{conjunction:t.conjunction==="or"?"or":"and",clauses:s}}function ke(r){if(typeof r=="number")return Number.isNaN(r)?void 0:r;if(typeof r=="boolean")return r?1:0;if(typeof r=="string"){const e=We(r);if(e!==void 0)return e;const t=Date.parse(r);return Number.isNaN(t)?void 0:t}}function Y(r,e){const t=ke(r),n=ke(e);if(t!==void 0&&n!==void 0)return t===n?0:t<n?-1:1;const s=String(e??"");return r.localeCompare(s,void 0,{sensitivity:"base",numeric:!0})}function gt(r,e){const t=B(r),n=t.toLowerCase(),s=e.value,a=s===void 0?"":String(s).toLowerCase();switch(e.op){case"contains":return n.includes(a);case"notContains":return!n.includes(a);case"startsWith":return n.startsWith(a);case"endsWith":return n.endsWith(a);case"empty":return t.trim()==="";case"notEmpty":return t.trim()!=="";case"in":return(Array.isArray(s)?s:s===void 0?[]:[s]).some(c=>Y(t,c)===0);case"eq":return Y(t,s)===0;case"neq":return Y(t,s)!==0;case"gt":case"gte":case"lt":case"lte":{const u=Y(t,s);return u===void 0?!1:e.op==="gt"?u>0:e.op==="gte"?u>=0:e.op==="lt"?u<0:u<=0}default:return!1}}function wt(r,e){const t=e.trim().toLowerCase();return r.findIndex(n=>n.title.toLowerCase()===t||n.id!==void 0&&n.id.toLowerCase()===t)}function vt(r,e,t){const n=r.clauses.map(s=>{const a=wt(e,s.column),u=a===-1?void 0:t[a];return u===void 0?!1:gt(u,s)});return r.conjunction==="or"?n.some(Boolean):n.every(Boolean)}function yt(r,e){const t=r.trim().toLowerCase();if(t==="")return[];const n=[];return e.forEach((s,a)=>{B(s).toLowerCase().includes(t)&&n.push(a)}),n}const bt={text:"text",number:"number",boolean:"boolean",uri:"url",markdown:"text",bubble:"tags",image:"image urls",drilldown:"text",custom:"text",loading:"text",protected:"text","row-id":"id"};function Ct(r,e,t){const n=e.map((s,a)=>{var l,i;const u=(i=(l=t[0])==null?void 0:l[a])==null?void 0:i.kind,c=t.map(d=>B(d[a]??{kind:"loading"})).filter(d=>d!=="").slice(0,3);return`- "${s.title}" (${bt[u??"text"]??"text"})${c.length>0?` e.g. ${c.map(d=>JSON.stringify(d)).join(", ")}`:""}`});return[`Translate this search into a filter over a table. Query: ${JSON.stringify(r)}`,"Columns:",...n,'Reply with ONLY JSON: {"conjunction": "and"|"or", "clauses": [{"column": "<column title>", "op": <op>, "value": <value>}]}',"Allowed ops: contains, notContains, eq, neq, gt, gte, lt, lte, startsWith, endsWith, empty, notEmpty, in (value is an array).","Use column titles exactly as listed. Dates as ISO strings. If the query is just a word to look for, use contains on the most likely column."].join(`
`)}const Se={status:"idle",spec:void 0,error:void 0,matchedRows:[],matchedCells:new Map};function _e(r){const{provider:e,columns:t,rows:n,getCellContent:s,query:a,debounceMs:u=300,maxRows:c=5e4,sampleRows:l=3}=r,[i,d]=o.useState(Se),p=o.useRef(new Map),m=o.useCallback(f=>t.map((h,k)=>s([k,f])),[t,s]),C=o.useCallback(f=>{const h=[],k=new Map,M=Math.min(n,c);for(let S=0;S<M;S++){const E=yt(f,m(S));E.length>0&&(h.push(S),k.set(S,E))}return{matchedRows:h,matchedCells:k}},[n,c,m]),y=o.useCallback(f=>{const h=[],k=new Map,M=Math.min(n,c),S=f.clauses.map(R=>t.findIndex(N=>{var A;return N.title.toLowerCase()===R.column.trim().toLowerCase()||((A=N.id)==null?void 0:A.toLowerCase())===R.column.trim().toLowerCase()})).filter(R=>R!==-1),E=S.length>0?[...new Set(S)]:[0];for(let R=0;R<M;R++)vt(f,t,m(R))&&(h.push(R),k.set(R,E));return{matchedRows:h,matchedCells:k}},[n,c,t,m]);return o.useEffect(()=>{const f=a.trim();if(f===""){d(Se);return}const h=C(f),k=p.current.get(f);if(k!==void 0){d({status:"compiled",spec:k,error:void 0,...y(k)});return}if(e===void 0){d({status:"literal",spec:void 0,error:void 0,...h});return}d({status:"compiling",spec:void 0,error:void 0,...h});const M=new AbortController,S=setTimeout(async()=>{try{const E=Array.from({length:Math.min(l,n)},(A,L)=>m(L)),R=await ae(e.complete({prompt:Ct(f,t,E),system:"You translate search queries into JSON filters. Reply with JSON only.",feature:"search"},{signal:M.signal}),void 0,M.signal);if(M.signal.aborted)return;const N=ft(R);if(N===void 0){d({status:"literal",spec:void 0,error:"The model did not return a usable filter",...h});return}p.current.set(f,N),d({status:"compiled",spec:N,error:void 0,...y(N)})}catch(E){if(Q(E)||M.signal.aborted)return;d({status:"error",spec:void 0,error:E instanceof Error?E.message:String(E),...h})}},u);return()=>{clearTimeout(S),M.abort()}},[a,e,t,n,u,l,m,C,y]),i}function kt(r){const[e,t]=o.useState(""),[n,s]=o.useState(!1),a=_e({...r,query:e}),u=o.useMemo(()=>{const d=[];for(const p of a.matchedRows)for(const m of a.matchedCells.get(p)??[0])d.push([m,p]);return d},[a.matchedRows,a.matchedCells]),c=o.useCallback(d=>t(d),[]),l=o.useCallback(()=>s(!0),[]),i=o.useCallback(()=>s(!1),[]);return{searchValue:e,onSearchValueChange:c,searchResults:u,showSearch:n,onSearchClose:i,setSearchValue:t,openSearch:l,closeSearch:i,status:a.status,spec:a.spec,error:a.error,matchedRows:a.matchedRows}}function St(r){const{getCellContent:e,rows:t,query:n}=r,s=_e(r),a=n.trim()!=="",u=s.matchedRows,c=o.useCallback(i=>a?u[i]??i:i,[a,u]),l=o.useCallback(([i,d])=>e([i,c(d)]),[e,c]);return{rows:a?u.length:t,getCellContent:a?l:e,getOriginalIndex:c,status:s.status,spec:s.spec,error:s.error}}function xt(r){const{source:e,toCell:t,onEdited:n,flushIntervalMs:s=50,autoStart:a=!0,initialRows:u}=r,[c,l]=o.useState(u??[]),[i,d]=o.useState("idle"),[p,m]=o.useState(void 0),C=o.useRef([...u??[]]),y=o.useRef(void 0),f=o.useRef([]),h=o.useRef(void 0),[k,M]=o.useState(a?1:0),S=o.useRef(e);S.current=e;const E=o.useRef(n);E.current=n;const R=o.useCallback(()=>{h.current=void 0,f.current.length!==0&&(C.current.push(...f.current),f.current=[],l([...C.current]))},[]),N=o.useCallback(()=>{h.current===void 0&&(h.current=setTimeout(R,s))},[R,s]),A=o.useCallback(()=>{var v;(v=y.current)==null||v.abort(),y.current=void 0,h.current!==void 0&&clearTimeout(h.current),R(),d(x=>x==="streaming"?"cancelled":x)},[R]),L=o.useCallback(()=>{var v;(v=y.current)==null||v.abort(),y.current=void 0,h.current!==void 0&&clearTimeout(h.current),h.current=void 0,f.current=[],C.current=[],l([]),d("idle"),m(void 0)},[]),W=o.useCallback(()=>{L(),M(v=>v+1)},[L]);o.useEffect(()=>{if(k===0)return;const v=new AbortController;return y.current=v,d("streaming"),m(void 0),(async()=>{try{for await(const x of S.current(v.signal)){if(v.signal.aborted)break;Array.isArray(x)?f.current.push(...x):f.current.push(x),N()}if(v.signal.aborted)return;h.current!==void 0&&clearTimeout(h.current),R(),d("done")}catch(x){if(v.signal.aborted||Q(x))return;h.current!==void 0&&clearTimeout(h.current),R(),m(x instanceof Error?x.message:String(x)),d("error")}finally{y.current===v&&(y.current=void 0)}})(),()=>{v.abort()}},[k,N,R]);const I=o.useCallback(([v,x])=>{const T=C.current[x];return T===void 0?{kind:"loading",allowOverlay:!1}:t(T,v,x)},[t]),w=o.useCallback(v=>{const x=E.current;if(x===void 0)return!0;let T=!1;const D=[];for(const z of v){const[P,q]=z.location,G=C.current[q];if(G===void 0)continue;const V=x(G,P,z.value,q),H=j=>{j!==void 0&&(C.current[q]=j,T=!0)};V instanceof Promise?D.push(V.then(j=>{j!==void 0&&(C.current[q]=j,l([...C.current]))})):H(V)}return T&&l([...C.current]),!0},[]),g=o.useCallback(v=>{C.current.push(...v),l([...C.current])},[]);return{rows:c.length,data:c,getCellContent:I,onCellsEdited:w,status:i,error:p,start:W,stop:A,reset:L,appendRows:g}}const Rt={[b.Number]:"a plain number (digits, optional decimal point, no units)",[b.Boolean]:"true or false",[b.Uri]:"an absolute URL",[b.Bubble]:"a comma-separated list of short tags",[b.Image]:"a comma-separated list of image URLs",[b.Text]:"plain text"};function Et(r){return["Convert each pasted text into the value the column expects. Interpret dates, numbers written as words, currencies, and yes/no phrasing.",'Reply with ONLY a JSON array of objects {"i": <index>, "value": <string>} — omit entries you cannot convert.',...r.map((t,n)=>`${n}. column "${t.column}" expects ${Rt[t.target.kind]??"plain text"}; pasted text: ${JSON.stringify(t.text)}`)].join(`
`)}function Mt(r){const{provider:e,columns:t,getCellContent:n,onCellsEdited:s,batchSize:a=50}=r,[u,c]=o.useState(0),[l,i]=o.useState(void 0),d=o.useRef(s);d.current=s;const p=o.useCallback((y,f)=>oe(y,f),[]),m=o.useCallback(async y=>{if(!(e===void 0||y.length===0)){c(f=>f+y.length);try{const f=new AbortController,h=await ae(e.complete({prompt:Et(y),system:"You convert pasted spreadsheet text into typed cell values. Reply with JSON only.",feature:"smart-paste"},{signal:f.signal}),void 0,f.signal),k=pe(h),M=[];if(Array.isArray(k))for(const S of k){if(S===null||typeof S!="object")continue;const E=y[Number(S.i)];if(E===void 0)continue;const R=oe(String(S.value??""),E.target);R!==void 0&&M.push({location:E.location,value:R})}M.length>0&&d.current(M),i(void 0)}catch(f){Q(f)||i(f instanceof Error?f.message:String(f))}finally{c(f=>Math.max(0,f-y.length))}}},[e]),C=o.useCallback((y,f)=>{if(e===void 0)return!0;const h=[];f.forEach((k,M)=>{k.forEach((S,E)=>{var A;const R=[y[0]+E,y[1]+M];if(R[0]>=t.length)return;const N=n(R);S.trim()===""||N.kind===b.Text||N.kind===b.Custom||oe(S,N)===void 0&&h.push({index:h.length,location:R,text:S,target:N,column:((A=t[R[0]])==null?void 0:A.title)??String(R[0])})})});for(let k=0;k<h.length;k+=a)m(h.slice(k,k+a));return!0},[e,t,n,a,m]);return{coercePasteValue:p,onPaste:C,pending:u,lastError:l}}function xe(r){return r===void 0?[]:r.toArray()}function Nt(r,e,t){const n=new Set(xe(r.rows)),s=new Set(xe(r.columns)),a=r.current===void 0?[]:[r.current.range,...r.current.rangeStack];for(const l of a){for(let i=l.y;i<l.y+l.height;i++)n.add(i);for(let i=l.x;i<l.x+l.width;i++)s.add(i)}if(n.size===0&&s.size>0)for(let l=0;l<e;l++)n.add(l);const u=[...n].filter(l=>l>=0&&l<e).sort((l,i)=>l-i),c=[...s].filter(l=>l>=0&&l<t).sort((l,i)=>l-i);return{rows:u,columns:r.rows.length>0&&c.length===0?void 0:c.length>0?c:void 0}}function At(r,e,t,n){const s=t.map(a=>`"${e[a].title}"`).join(", ");return[`Instruction: ${JSON.stringify(r)}`,`Editable columns: ${s}. Only these may be changed.`,"Rows (JSON, one per line):",...n.map(a=>JSON.stringify({row:a.row,...a.values})),'Reply with ONLY a JSON array of changes: [{"row": <row>, "column": "<column title>", "value": "<new value>"}]. Omit rows that need no change.'].join(`
`)}function Lt(r){const{provider:e,columns:t,rows:n,getCellContent:s,onCellsEdited:a,maxRows:u=200,highlightColor:c="rgba(79, 93, 255, 0.25)"}=r,[l,i]=o.useState("idle"),[d,p]=o.useState(void 0),[m,C]=o.useState(void 0),y=o.useRef(void 0),f=o.useCallback(async(S,E)=>{var W;const R="rows"in E&&Array.isArray(E.rows)?E:Nt(E,n,t.length),N=R.rows,A=R.columns??t.map((I,w)=>w);if((W=y.current)==null||W.abort(),N.length===0||A.length===0){p("Select the rows or cells to edit first"),i("error");return}if(N.length>u){p(`Too many rows selected (${N.length}); the limit is ${u}`),i("error");return}const L=new AbortController;y.current=L,i("proposing"),p(void 0),C(void 0);try{const I=N.map(P=>{const q={};for(const G of A)q[t[G].title]=B(s([G,P]));return{row:P,values:q}}),w=await ae(e.complete({prompt:At(S,t,A,I),system:"You edit spreadsheet rows exactly as instructed and reply with JSON only.",feature:"bulk-edit"},{signal:L.signal}),void 0,L.signal);if(L.signal.aborted)return;const g=pe(w),v=new Set(N),x=[],T=new Set;let D=0;for(const P of Array.isArray(g)?g:[]){if(P===null||typeof P!="object"){D++;continue}const q=Number(P.row),G=String(P.column??"").trim().toLowerCase(),V=A.find(he=>{var fe;return t[he].title.toLowerCase()===G||((fe=t[he].id)==null?void 0:fe.toLowerCase())===G});if(!v.has(q)||V===void 0||T.has(`${V}:${q}`)){D++;continue}const H=[V,q],j=s(H),ce=oe(String(P.value??""),j);if(ce===void 0){D++;continue}B(ce)!==B(j)&&(T.add(`${V}:${q}`),x.push({location:H,value:ce}))}const z={instruction:S,edits:x,rejected:D};return C(z),i("proposed"),z}catch(I){if(Q(I)||L.signal.aborted)return;p(I instanceof Error?I.message:String(I)),i("error");return}},[e,t,n,s,u]),h=o.useCallback(()=>{m!==void 0&&(m.edits.length>0&&a(m.edits),C(void 0),i("idle"))},[m,a]),k=o.useCallback(()=>{var S;(S=y.current)==null||S.abort(),C(void 0),i("idle"),p(void 0)},[]),M=o.useMemo(()=>{if(!(m===void 0||m.edits.length===0))return m.edits.map(S=>({color:c,range:{x:S.location[0],y:S.location[1],width:1,height:1},style:"solid"}))},[m,c]);return{status:l,error:d,proposal:m,propose:f,apply:h,discard:k,highlightRegions:M}}const Vt={title:"Extra Packages/AI",parameters:{layout:"fullscreen"}},me=["Engineering","Sales","Ops","Design"],Re=["Ada","Grace","Linus","Mia","Noor","Ken","Sara","Yuki","Omar","Lea"],Ee=["Lovelace","Hopper","Torvalds","Chen","Haddad","Sato","Okafor","Ruiz","Novak","Berg"];function ie(r){return Array.from({length:r},(e,t)=>({name:`${Re[t%Re.length]} ${Ee[t*7%Ee.length]}`,dept:me[t*3%me.length],age:22+t*13%40,notes:["Ships weekly","Owns the roadmap","Mentors juniors","Runs on-call","Leads hiring"][t%5]}))}const O=r=>({kind:b.Text,data:r,displayData:r,allowOverlay:!0}),le=r=>({kind:b.Number,data:r,displayData:String(r),allowOverlay:!0}),U=({title:r,blurb:e,children:t,aside:n})=>o.createElement("div",{style:{padding:24,fontFamily:"Inter, system-ui, sans-serif",color:"#1a1a1a",background:"#f6f7fb",minHeight:"100vh",boxSizing:"border-box"}},o.createElement("h2",{style:{margin:"0 0 4px"}},r),o.createElement("p",{style:{margin:"0 0 12px",color:"#555",maxWidth:720}},e),n!==void 0&&o.createElement("div",{style:{margin:"0 0 12px",fontSize:13}},n),o.createElement("div",{style:{width:"100%",height:460,background:"white",borderRadius:8,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.12)"}},t)),Z=()=>{const r=o.useMemo(()=>ie(40),[]),e=o.useMemo(()=>[{title:"Name",id:"name",width:160},{title:"Dept",id:"dept",width:120},{title:"Notes",id:"notes",width:180},{title:"Intro (AI)",id:"intro",width:420}],[]),t=o.useMemo(()=>K(c=>{var d,p,m,C;return`${((d=/for (.+?):/.exec(c.prompt))==null?void 0:d[1])??"them"} is a ${((p=/in ([A-Za-z]+)/.exec(c.prompt))==null?void 0:p[1])??"team"} teammate who ${((C=(m=/who (.+)$/.exec(c.prompt))==null?void 0:m[1])==null?void 0:C.toLowerCase())??"does great work"}.`.split(" ").map((y,f)=>f===0?y:` ${y}`)},{delayMs:60}),[]),n=o.useCallback(([c,l])=>{const i=r[l];return c===0?O(i.name):c===1?O(i.dept):c===2?O(i.notes):et("Write one friendly sentence for {Name}: they work in {Dept} and are someone who {Notes}")},[r]),s=o.useRef(null),a=lt({provider:t,columns:e,getCellContent:n,gridRef:s,concurrency:3}),[,u]=o.useReducer(c=>c+1,0);return o.useEffect(()=>{const c=setInterval(u,500);return()=>clearInterval(c)},[]),o.createElement(U,{title:"AI cells — =AI() formulas",blurb:"The last column is an AI cell whose prompt references the row's other cells. Cells generate as they scroll into view, stream their text, cache by prompt, and cancel when scrolled away. Double-click one to edit the prompt or regenerate.",aside:o.createElement("span",null,"provider calls so far: ",o.createElement("b",null,t.calls.length)," · scheduler cache hits: ",o.createElement("b",null,a.scheduler.stats.hits))},o.createElement(_,{ref:s,columns:e,rows:r.length,getCellContent:a.getCellContent,customRenderers:a.customRenderers,onVisibleRegionChanged:a.onVisibleRegionChanged,rowMarkers:"number",smoothScrollY:!0}))};function Qe(r){var a,u;const e=((u=(a=/Query: "(.+?)"/.exec(r.prompt))==null?void 0:a[1])==null?void 0:u.toLowerCase())??"",t=[];for(const c of me)e.includes(c.toLowerCase().slice(0,5))&&t.push({column:"Dept",op:"eq",value:c});const n=/(?:over|above|older than) (\d+)/.exec(e);n&&t.push({column:"Age",op:"gt",value:Number(n[1])});const s=/(?:under|below|younger than) (\d+)/.exec(e);return s&&t.push({column:"Age",op:"lt",value:Number(s[1])}),e.includes("mentor")&&t.push({column:"Notes",op:"contains",value:"mentor"}),t.length===0&&t.push({column:"Name",op:"contains",value:e.split(" ")[0]??e}),JSON.stringify({conjunction:"and",clauses:t})}const se=[{title:"Name",width:180},{title:"Dept",width:130},{title:"Age",width:80},{title:"Notes",width:200}],Ue=r=>([e,t])=>{const n=r[t];return e===0?O(n.name):e===1?O(n.dept):e===2?le(n.age):O(n.notes)},X=()=>{const r=o.useMemo(()=>ie(300),[]),e=o.useMemo(()=>Ue(r),[r]),t=o.useMemo(()=>K(Qe,{delayMs:400}),[]),n=kt({provider:t,columns:se,rows:r.length,getCellContent:e});return o.createElement(U,{title:"Natural-language search",blurb:'Type into the box (or press Ctrl/⌘+F in the grid): literal matches highlight instantly, then the model compiles the query into a filter — try "engineers over 40" or "sales who mentor". The model only sees column names and a few sample values, never the table.',aside:o.createElement("span",null,o.createElement("input",{value:n.searchValue??"",onChange:s=>n.setSearchValue(s.target.value),placeholder:'e.g. "engineers over 40"',style:{padding:6,width:280,marginRight:12}}),"status: ",o.createElement("b",null,n.status)," · matches: ",o.createElement("b",null,n.matchedRows.length),n.spec!==void 0&&o.createElement("code",{style:{marginLeft:12,fontSize:12}},JSON.stringify(n.spec.clauses)))},o.createElement(_,{columns:se,rows:r.length,getCellContent:e,searchValue:n.searchValue,onSearchValueChange:n.onSearchValueChange,searchResults:n.searchResults,showSearch:n.showSearch,onSearchClose:n.onSearchClose,getCellsForSelection:!0,rowMarkers:"number"}))},ee=()=>{const r=o.useMemo(()=>ie(300),[]),e=o.useMemo(()=>Ue(r),[r]),t=o.useMemo(()=>K(Qe,{delayMs:400}),[]),[n,s]=o.useState(""),a=St({provider:t,columns:se,rows:r.length,getCellContent:e,query:n});return o.createElement(U,{title:"Natural-language filter",blurb:'Rows that do not match the query are hidden — the same compiled filter as search, applied as a row permutation like useColumnSort. Try "design under 30".',aside:o.createElement("span",null,o.createElement("input",{value:n,onChange:u=>s(u.target.value),placeholder:"filter rows…",style:{padding:6,width:280,marginRight:12}}),"status: ",o.createElement("b",null,a.status)," · showing ",o.createElement("b",null,a.rows)," of ",r.length)},o.createElement(_,{columns:se,rows:a.rows,getCellContent:a.getCellContent,rowMarkers:"number"}))};async function*qt(r){const e=["Acme","Globex","Initech","Umbrella","Hooli","Stark","Wayne","Wonka","Tyrell","Cyberdyne","Aperture","Vandelay"],t=["Hiring a VP Sales","Raised Series B","Launched pricing page","Opened EU office","Sponsoring a conference"];for(let n=0;n<e.length;n++){if(await new Promise(s=>setTimeout(s,350)),r.aborted)return;yield{company:e[n],signal:t[n%t.length],confidence:60+n*17%40}}}const te=()=>{const r=o.useMemo(()=>[{title:"Company",width:160},{title:"Signal",width:260},{title:"Confidence",width:120}],[]),e=o.useCallback((n,s)=>s===0?O(n.company):s===1?O(n.signal):le(n.confidence),[]),t=xt({source:qt,toCell:e,onEdited:(n,s,a)=>s===2&&a.kind===b.Number?{...n,confidence:a.data??n.confidence}:s===1&&a.kind===b.Text?{...n,signal:a.data}:void 0});return o.createElement(U,{title:"Agent-fed data source",blurb:"The grid is the agent's output surface: rows stream in as a (simulated) research agent finds them, the grid stays fully interactive, and your edits flow back through onEdited so the agent can react.",aside:o.createElement("span",null,"status: ",o.createElement("b",null,t.status)," · rows: ",o.createElement("b",null,t.rows),o.createElement("button",{onClick:t.start,style:{marginLeft:12}},"Restart"),o.createElement("button",{onClick:t.stop,style:{marginLeft:6}},"Stop"),t.error!==void 0&&o.createElement("span",{style:{color:"crimson",marginLeft:12}},t.error))},o.createElement(_,{columns:r,rows:t.rows,getCellContent:t.getCellContent,onCellsEdited:t.onCellsEdited,rowMarkers:"number"}))},Ot={ten:"10","a dozen":"12","half a hundred":"50",yep:"true",nope:"false",affirmative:"true",negative:"false","next tuesday":"2026-09-08"},ne=()=>{const r=o.useMemo(()=>[{title:"Item",width:160},{title:"Qty",width:100},{title:"In stock",width:100},{title:"Link",width:260}],[]),[e,t]=o.useState(()=>Array.from({length:12},(c,l)=>({item:`SKU-${100+l}`,qty:l*3,stock:l%2===0,link:""}))),n=o.useCallback(([c,l])=>{const i=e[l];return c===0?O(i.item):c===1?le(i.qty):c===2?{kind:b.Boolean,data:i.stock,allowOverlay:!1}:{kind:b.Uri,data:i.link,displayData:i.link,allowOverlay:!0}},[e]),s=o.useCallback(c=>(t(l=>{const i=l.map(d=>({...d}));for(const d of c){const p=i[d.location[1]];if(p===void 0)continue;const m=d.value;d.location[0]===1&&m.kind===b.Number?p.qty=m.data??0:d.location[0]===2&&m.kind===b.Boolean?p.stock=m.data===!0:d.location[0]===3&&m.kind===b.Uri?p.link=m.data:d.location[0]===0&&m.kind===b.Text&&(p.item=m.data)}return i}),!0),[]),a=o.useMemo(()=>K(c=>{const l=[];for(const i of c.prompt.matchAll(/^(\d+)\. .*pasted text: "(.+)"$/gm)){const d=Ot[i[2].toLowerCase()];d!==void 0&&l.push({i:Number(i[1]),value:d})}return JSON.stringify(l)},{delayMs:500}),[]),u=Mt({provider:a,columns:r,getCellContent:n,onCellsEdited:s});return o.createElement(U,{title:"Smart paste",blurb:'Copy some text and paste it into the Qty / In stock / Link columns: "$1,200", "twelve", "yes", "example.com" are coerced instantly; things like "a dozen" or "affirmative" go to the model in one batched call and are corrected a moment later.',aside:o.createElement("span",null,"pending model corrections: ",o.createElement("b",null,u.pending),u.lastError!==void 0&&o.createElement("span",{style:{color:"crimson"}}," · ",u.lastError))},o.createElement(_,{columns:r,rows:e.length,getCellContent:n,onCellsEdited:s,coercePasteValue:u.coercePasteValue,onPaste:u.onPaste,getCellsForSelection:!0,rowMarkers:"number"}))},re=()=>{const r=o.useMemo(()=>[{title:"Order",width:140},{title:"Status",width:120},{title:"Qty",width:90},{title:"Customer",width:200}],[]),[e,t]=o.useState(()=>Array.from({length:15},(p,m)=>({order:`#${1e3+m}`,status:m%3===0?"shipped":"open",qty:1+m%6,customer:ie(15)[m].name}))),n=o.useCallback(([p,m])=>{const C=e[m];return p===0?O(C.order):p===1?O(C.status):p===2?le(C.qty):O(C.customer)},[e]),s=o.useCallback(p=>(t(m=>{const C=m.map(y=>({...y}));for(const y of p){const f=C[y.location[1]],h=y.value;f!==void 0&&(y.location[0]===1&&h.kind===b.Text&&(f.status=h.data),y.location[0]===2&&h.kind===b.Number&&(f.qty=h.data??f.qty),y.location[0]===3&&h.kind===b.Text&&(f.customer=h.data))}return C}),!0),[]),a=o.useMemo(()=>K(p=>{var f,h;const m=((h=(f=/Instruction: "(.+?)"/.exec(p.prompt))==null?void 0:f[1])==null?void 0:h.toLowerCase())??"",C=[...p.prompt.matchAll(/^\{"row":(\d+),(.*)\}$/gm)].map(k=>({row:Number(k[1]),json:JSON.parse(`{${k[2]}}`)})),y=[];for(const k of C)m.includes("ship")&&y.push({row:k.row,column:"Status",value:"shipped"}),m.includes("double")&&y.push({row:k.row,column:"Qty",value:String(Number(k.json.Qty)*2)}),m.includes("upper")&&y.push({row:k.row,column:"Customer",value:(k.json.Customer??"").toUpperCase()});return JSON.stringify(y)},{delayMs:600}),[]),[u,c]=o.useState({rows:we.empty(),columns:we.empty()}),[l,i]=o.useState("mark them as shipped"),d=Lt({provider:a,columns:r,rows:e.length,getCellContent:n,onCellsEdited:s});return o.createElement(U,{title:"Bulk edit in plain language",blurb:'Select some rows (click the row markers), type an instruction such as "mark them as shipped", "double the quantity", or "uppercase the customer", and propose. The model returns edits, the grid previews them as highlights, and nothing is written until you apply.',aside:o.createElement("span",null,o.createElement("input",{value:l,onChange:p=>i(p.target.value),style:{padding:6,width:260,marginRight:8}}),o.createElement("button",{onClick:()=>void d.propose(l,u),disabled:d.status==="proposing"},"Propose"),o.createElement("button",{onClick:d.apply,disabled:d.proposal===void 0,style:{marginLeft:6}},"Apply ",d.proposal!==void 0?`(${d.proposal.edits.length})`:""),o.createElement("button",{onClick:d.discard,disabled:d.proposal===void 0,style:{marginLeft:6}},"Discard"),o.createElement("span",{style:{marginLeft:12}},"status: ",o.createElement("b",null,d.status)),d.error!==void 0&&o.createElement("span",{style:{color:"crimson",marginLeft:12}},d.error))},o.createElement(_,{columns:r,rows:e.length,getCellContent:n,onCellsEdited:s,gridSelection:u,onGridSelectionChange:c,highlightRegions:d.highlightRegions,rowMarkers:"both",rowSelect:"multi"}))};var Me,Ne,Ae;Z.parameters={...Z.parameters,docs:{...(Me=Z.parameters)==null?void 0:Me.docs,source:{originalSource:`() => {
  const people = React.useMemo(() => makePeople(40), []);
  const columns = React.useMemo<GridColumn[]>(() => [{
    title: "Name",
    id: "name",
    width: 160
  }, {
    title: "Dept",
    id: "dept",
    width: 120
  }, {
    title: "Notes",
    id: "notes",
    width: 180
  }, {
    title: "Intro (AI)",
    id: "intro",
    width: 420
  }], []);
  const provider = React.useMemo(() => createMockProvider((i: AiRequest) => {
    const name = /for (.+?):/.exec(i.prompt)?.[1] ?? "them";
    const words = \`\${name} is a \${/in ([A-Za-z]+)/.exec(i.prompt)?.[1] ?? "team"} teammate who \${/who (.+)$/.exec(i.prompt)?.[1]?.toLowerCase() ?? "does great work"}.\`;
    return words.split(" ").map((w, k) => k === 0 ? w : \` \${w}\`);
  }, {
    delayMs: 60
  }), []);
  const baseGetCellContent = React.useCallback(([col, row]: Item): GridCell => {
    const p = people[row];
    if (col === 0) return text(p.name);
    if (col === 1) return text(p.dept);
    if (col === 2) return text(p.notes);
    return aiCell("Write one friendly sentence for {Name}: they work in {Dept} and are someone who {Notes}");
  }, [people]);
  const gridRef = React.useRef<DataEditorRef | null>(null);
  const ai = useAiCells({
    provider,
    columns,
    getCellContent: baseGetCellContent,
    gridRef,
    concurrency: 3
  });
  // The grid repaints finished cells through the damage API without re-rendering this component,
  // so poll the counters for the caption.
  const [, tick] = React.useReducer((x: number) => x + 1, 0);
  React.useEffect(() => {
    const t = setInterval(tick, 500);
    return () => clearInterval(t);
  }, []);
  return <Frame title="AI cells — =AI() formulas" blurb="The last column is an AI cell whose prompt references the row's other cells. Cells generate as they scroll into view, stream their text, cache by prompt, and cancel when scrolled away. Double-click one to edit the prompt or regenerate." aside={<span>provider calls so far: <b>{provider.calls.length}</b> · scheduler cache hits: <b>{ai.scheduler.stats.hits}</b></span>}>
            <DataEditor ref={gridRef} columns={columns} rows={people.length} getCellContent={ai.getCellContent} customRenderers={ai.customRenderers} onVisibleRegionChanged={ai.onVisibleRegionChanged} rowMarkers="number" smoothScrollY />
        </Frame>;
}`,...(Ae=(Ne=Z.parameters)==null?void 0:Ne.docs)==null?void 0:Ae.source}}};var Le,qe,Oe;X.parameters={...X.parameters,docs:{...(Le=X.parameters)==null?void 0:Le.docs,source:{originalSource:`() => {
  const people = React.useMemo(() => makePeople(300), []);
  const getCellContent = React.useMemo(() => peopleCell(people), [people]);
  const provider = React.useMemo(() => createMockProvider(compileMock, {
    delayMs: 400
  }), []);
  const search = useNaturalLanguageSearch({
    provider,
    columns: peopleColumns,
    rows: people.length,
    getCellContent
  });
  return <Frame title="Natural-language search" blurb='Type into the box (or press Ctrl/⌘+F in the grid): literal matches highlight instantly, then the model compiles the query into a filter — try "engineers over 40" or "sales who mentor". The model only sees column names and a few sample values, never the table.' aside={<span>
                    <input value={search.searchValue ?? ""} onChange={e => search.setSearchValue(e.target.value)} placeholder='e.g. "engineers over 40"' style={{
      padding: 6,
      width: 280,
      marginRight: 12
    }} />
                    status: <b>{search.status}</b> · matches: <b>{search.matchedRows.length}</b>
                    {search.spec !== undefined && <code style={{
      marginLeft: 12,
      fontSize: 12
    }}>{JSON.stringify(search.spec.clauses)}</code>}
                </span>}>
            <DataEditor columns={peopleColumns} rows={people.length} getCellContent={getCellContent} searchValue={search.searchValue} onSearchValueChange={search.onSearchValueChange} searchResults={search.searchResults} showSearch={search.showSearch} onSearchClose={search.onSearchClose} getCellsForSelection={true} rowMarkers="number" />
        </Frame>;
}`,...(Oe=(qe=X.parameters)==null?void 0:qe.docs)==null?void 0:Oe.source}}};var Ie,Te,Pe;ee.parameters={...ee.parameters,docs:{...(Ie=ee.parameters)==null?void 0:Ie.docs,source:{originalSource:`() => {
  const people = React.useMemo(() => makePeople(300), []);
  const getCellContent = React.useMemo(() => peopleCell(people), [people]);
  const provider = React.useMemo(() => createMockProvider(compileMock, {
    delayMs: 400
  }), []);
  const [query, setQuery] = React.useState("");
  const filtered = useNaturalLanguageFilter({
    provider,
    columns: peopleColumns,
    rows: people.length,
    getCellContent,
    query
  });
  return <Frame title="Natural-language filter" blurb='Rows that do not match the query are hidden — the same compiled filter as search, applied as a row permutation like useColumnSort. Try "design under 30".' aside={<span>
                    <input value={query} onChange={e => setQuery(e.target.value)} placeholder="filter rows…" style={{
      padding: 6,
      width: 280,
      marginRight: 12
    }} />
                    status: <b>{filtered.status}</b> · showing <b>{filtered.rows}</b> of {people.length}
                </span>}>
            <DataEditor columns={peopleColumns} rows={filtered.rows} getCellContent={filtered.getCellContent} rowMarkers="number" />
        </Frame>;
}`,...(Pe=(Te=ee.parameters)==null?void 0:Te.docs)==null?void 0:Pe.source}}};var $e,De,Fe;te.parameters={...te.parameters,docs:{...($e=te.parameters)==null?void 0:$e.docs,source:{originalSource:`() => {
  const columns = React.useMemo<GridColumn[]>(() => [{
    title: "Company",
    width: 160
  }, {
    title: "Signal",
    width: 260
  }, {
    title: "Confidence",
    width: 120
  }], []);
  const toCell = React.useCallback((f: Finding, col: number): GridCell => col === 0 ? text(f.company) : col === 1 ? text(f.signal) : num(f.confidence), []);
  const agent = useAgentDataSource<Finding>({
    source: researchAgent,
    toCell,
    onEdited: (row, col, v) => col === 2 && v.kind === GridCellKind.Number ? {
      ...row,
      confidence: v.data ?? row.confidence
    } : col === 1 && v.kind === GridCellKind.Text ? {
      ...row,
      signal: v.data
    } : undefined
  });
  return <Frame title="Agent-fed data source" blurb="The grid is the agent's output surface: rows stream in as a (simulated) research agent finds them, the grid stays fully interactive, and your edits flow back through onEdited so the agent can react." aside={<span>
                    status: <b>{agent.status}</b> · rows: <b>{agent.rows}</b>
                    <button onClick={agent.start} style={{
      marginLeft: 12
    }}>Restart</button>
                    <button onClick={agent.stop} style={{
      marginLeft: 6
    }}>Stop</button>
                    {agent.error !== undefined && <span style={{
      color: "crimson",
      marginLeft: 12
    }}>{agent.error}</span>}
                </span>}>
            <DataEditor columns={columns} rows={agent.rows} getCellContent={agent.getCellContent} onCellsEdited={agent.onCellsEdited} rowMarkers="number" />
        </Frame>;
}`,...(Fe=(De=te.parameters)==null?void 0:De.docs)==null?void 0:Fe.source}}};var ze,Ge,Ve;ne.parameters={...ne.parameters,docs:{...(ze=ne.parameters)==null?void 0:ze.docs,source:{originalSource:`() => {
  const columns = React.useMemo<GridColumn[]>(() => [{
    title: "Item",
    width: 160
  }, {
    title: "Qty",
    width: 100
  }, {
    title: "In stock",
    width: 100
  }, {
    title: "Link",
    width: 260
  }], []);
  const [rows, setRows] = React.useState(() => Array.from({
    length: 12
  }, (_, i) => ({
    item: \`SKU-\${100 + i}\`,
    qty: i * 3,
    stock: i % 2 === 0,
    link: ""
  })));
  const getCellContent = React.useCallback(([col, row]: Item): GridCell => {
    const r = rows[row];
    if (col === 0) return text(r.item);
    if (col === 1) return num(r.qty);
    if (col === 2) return {
      kind: GridCellKind.Boolean,
      data: r.stock,
      allowOverlay: false
    };
    return {
      kind: GridCellKind.Uri,
      data: r.link,
      displayData: r.link,
      allowOverlay: true
    };
  }, [rows]);
  const onCellsEdited = React.useCallback((edits: readonly {
    location: Item;
    value: GridCell;
  }[]) => {
    setRows(prev => {
      const next = prev.map(r => ({
        ...r
      }));
      for (const e of edits) {
        const r = next[e.location[1]];
        if (r === undefined) continue;
        const v = e.value;
        if (e.location[0] === 1 && v.kind === GridCellKind.Number) r.qty = v.data ?? 0;else if (e.location[0] === 2 && v.kind === GridCellKind.Boolean) r.stock = v.data === true;else if (e.location[0] === 3 && v.kind === GridCellKind.Uri) r.link = v.data;else if (e.location[0] === 0 && v.kind === GridCellKind.Text) r.item = v.data;
      }
      return next;
    });
    return true;
  }, []);
  const provider = React.useMemo(() => createMockProvider((i: AiRequest) => {
    const out: {
      i: number;
      value: string;
    }[] = [];
    for (const m of i.prompt.matchAll(/^(\\d+)\\. .*pasted text: "(.+)"$/gm)) {
      const v = WORDS[m[2].toLowerCase()];
      if (v !== undefined) out.push({
        i: Number(m[1]),
        value: v
      });
    }
    return JSON.stringify(out);
  }, {
    delayMs: 500
  }), []);
  const paste = useSmartPaste({
    provider,
    columns,
    getCellContent,
    onCellsEdited
  });
  return <Frame title="Smart paste" blurb='Copy some text and paste it into the Qty / In stock / Link columns: "$1,200", "twelve", "yes", "example.com" are coerced instantly; things like "a dozen" or "affirmative" go to the model in one batched call and are corrected a moment later.' aside={<span>pending model corrections: <b>{paste.pending}</b>{paste.lastError !== undefined && <span style={{
      color: "crimson"
    }}> · {paste.lastError}</span>}</span>}>
            <DataEditor columns={columns} rows={rows.length} getCellContent={getCellContent} onCellsEdited={onCellsEdited} coercePasteValue={paste.coercePasteValue} onPaste={paste.onPaste} getCellsForSelection={true} rowMarkers="number" />
        </Frame>;
}`,...(Ve=(Ge=ne.parameters)==null?void 0:Ge.docs)==null?void 0:Ve.source}}};var je,Je,Be;re.parameters={...re.parameters,docs:{...(je=re.parameters)==null?void 0:je.docs,source:{originalSource:`() => {
  const columns = React.useMemo<GridColumn[]>(() => [{
    title: "Order",
    width: 140
  }, {
    title: "Status",
    width: 120
  }, {
    title: "Qty",
    width: 90
  }, {
    title: "Customer",
    width: 200
  }], []);
  const [orders, setOrders] = React.useState(() => Array.from({
    length: 15
  }, (_, i) => ({
    order: \`#\${1000 + i}\`,
    status: i % 3 === 0 ? "shipped" : "open",
    qty: 1 + i % 6,
    customer: makePeople(15)[i].name
  })));
  const getCellContent = React.useCallback(([col, row]: Item): GridCell => {
    const o = orders[row];
    return col === 0 ? text(o.order) : col === 1 ? text(o.status) : col === 2 ? num(o.qty) : text(o.customer);
  }, [orders]);
  const onCellsEdited = React.useCallback((edits: readonly {
    location: Item;
    value: GridCell;
  }[]) => {
    setOrders(prev => {
      const next = prev.map(o => ({
        ...o
      }));
      for (const e of edits) {
        const o = next[e.location[1]];
        const v = e.value;
        if (o === undefined) continue;
        if (e.location[0] === 1 && v.kind === GridCellKind.Text) o.status = v.data;
        if (e.location[0] === 2 && v.kind === GridCellKind.Number) o.qty = v.data ?? o.qty;
        if (e.location[0] === 3 && v.kind === GridCellKind.Text) o.customer = v.data;
      }
      return next;
    });
    return true;
  }, []);
  const provider = React.useMemo(() => createMockProvider((i: AiRequest) => {
    const instruction = /Instruction: "(.+?)"/.exec(i.prompt)?.[1]?.toLowerCase() ?? "";
    const rowsInScope = [...i.prompt.matchAll(/^\\{"row":(\\d+),(.*)\\}$/gm)].map(m => ({
      row: Number(m[1]),
      json: JSON.parse(\`{\${m[2]}}\`) as Record<string, string>
    }));
    const changes: unknown[] = [];
    for (const r of rowsInScope) {
      if (instruction.includes("ship")) changes.push({
        row: r.row,
        column: "Status",
        value: "shipped"
      });
      if (instruction.includes("double")) changes.push({
        row: r.row,
        column: "Qty",
        value: String(Number(r.json.Qty) * 2)
      });
      if (instruction.includes("upper")) changes.push({
        row: r.row,
        column: "Customer",
        value: (r.json.Customer ?? "").toUpperCase()
      });
    }
    return JSON.stringify(changes);
  }, {
    delayMs: 600
  }), []);
  const [selection, setSelection] = React.useState<GridSelection>({
    rows: CompactSelection.empty(),
    columns: CompactSelection.empty()
  });
  const [instruction, setInstruction] = React.useState("mark them as shipped");
  const bulk = useBulkEdit({
    provider,
    columns,
    rows: orders.length,
    getCellContent,
    onCellsEdited
  });
  return <Frame title="Bulk edit in plain language" blurb='Select some rows (click the row markers), type an instruction such as "mark them as shipped", "double the quantity", or "uppercase the customer", and propose. The model returns edits, the grid previews them as highlights, and nothing is written until you apply.' aside={<span>
                    <input value={instruction} onChange={e => setInstruction(e.target.value)} style={{
      padding: 6,
      width: 260,
      marginRight: 8
    }} />
                    <button onClick={() => void bulk.propose(instruction, selection)} disabled={bulk.status === "proposing"}>Propose</button>
                    <button onClick={bulk.apply} disabled={bulk.proposal === undefined} style={{
      marginLeft: 6
    }}>Apply {bulk.proposal !== undefined ? \`(\${bulk.proposal.edits.length})\` : ""}</button>
                    <button onClick={bulk.discard} disabled={bulk.proposal === undefined} style={{
      marginLeft: 6
    }}>Discard</button>
                    <span style={{
      marginLeft: 12
    }}>status: <b>{bulk.status}</b></span>
                    {bulk.error !== undefined && <span style={{
      color: "crimson",
      marginLeft: 12
    }}>{bulk.error}</span>}
                </span>}>
            <DataEditor columns={columns} rows={orders.length} getCellContent={getCellContent} onCellsEdited={onCellsEdited} gridSelection={selection} onGridSelectionChange={setSelection} highlightRegions={bulk.highlightRegions} rowMarkers="both" rowSelect="multi" />
        </Frame>;
}`,...(Be=(Je=re.parameters)==null?void 0:Je.docs)==null?void 0:Be.source}}};const jt=["AiCells","NaturalLanguageSearch","NaturalLanguageFilter","AgentDataSource","SmartPaste","BulkEdit"];export{te as AgentDataSource,Z as AiCells,re as BulkEdit,ee as NaturalLanguageFilter,X as NaturalLanguageSearch,ne as SmartPaste,jt as __namedExportsOrder,Vt as default};
