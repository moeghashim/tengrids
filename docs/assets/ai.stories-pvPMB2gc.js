var Ke=Object.defineProperty;var He=(r,e,t)=>e in r?Ke(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var j=(r,e,t)=>He(r,typeof e!="symbol"?e+"":e,t);import{r as o}from"./iframe-Dm-TGfvz.js";/* empty css              */import{G as y,m as Ye,d as ve,D as Q,C as we}from"./data-editor-all-DU7-CmUn.js";import"./preload-helper-C1FmrZbK.js";import"./throttle-DUpnrlRK.js";import"./flatten-DPzrbH7m.js";import"./marked.esm-DO1BaHSb.js";class V extends Error{constructor(e="The AI request was aborted"){super(e),this.name="AbortError"}}function U(r){return r instanceof Error&&r.name==="AbortError"}function Ze(r){return r!==null&&typeof r=="object"&&Symbol.asyncIterator in r}async function ae(r,e,t){if(!Ze(r)){const s=await r;if((t==null?void 0:t.aborted)===!0)throw new V;return s}let n="";for await(const s of r){if((t==null?void 0:t.aborted)===!0)throw new V;n+=s,e==null||e(n)}return n}function ye(r,e){return new Promise((t,n)=>{if(e.aborted)return n(new V);const s=setTimeout(()=>{e.removeEventListener("abort",a),t()},r),a=()=>{clearTimeout(s),n(new V)};e.addEventListener("abort",a,{once:!0})})}function H(r,e={}){const t=e.delayMs??0,n=[];return{calls:n,complete(s,{signal:a}){n.push(s);const c=r(s);if(typeof c=="string")return(async()=>{if(t>0&&await ye(t,a),a.aborted)throw new V;return c})();const d=c;return async function*(){for(const i of d){if(t>0&&await ye(t,a),a.aborted)throw new V;yield i}}()}}}class Xe{constructor(e){j(this,"provider");j(this,"concurrency");j(this,"cacheSize");j(this,"cache",new Map);j(this,"queue",[]);j(this,"inflight",new Map);j(this,"stats",{hits:0,misses:0,completed:0,cancelled:0,errors:0});this.provider=e.provider,this.concurrency=Math.max(1,e.concurrency??2),this.cacheSize=Math.max(1,e.cacheSize??1e3)}get(e){return this.cache.get(e)}has(e){return this.cache.has(e)}isPending(e){return this.inflight.has(e)||this.queue.some(t=>t.key===e)}get pendingCount(){return this.inflight.size+this.queue.length}request(e,t,n={}){const s=this.cache.get(e);if(s!==void 0)return this.stats.hits++,Promise.resolve(s);const a=this.inflight.get(e)??this.queue.find(i=>i.key===e);if(a!==void 0)return this.stats.hits++,n.onChunk!==void 0&&a.chunkListeners.push(n.onChunk),(n.priority??0)>a.priority&&(a.priority=n.priority??0,this.sortQueue()),new Promise((i,l)=>{a.resolvers.push(i),a.rejecters.push(l)});this.stats.misses++;const c={key:e,input:t,priority:n.priority??0,controller:new AbortController,chunkListeners:n.onChunk===void 0?[]:[n.onChunk],resolvers:[],rejecters:[],started:!1},d=new Promise((i,l)=>{c.resolvers.push(i),c.rejecters.push(l)});return this.queue.push(c),this.sortQueue(),this.pump(),d}cancel(e){const t=this.queue.findIndex(s=>s.key===e);if(t!==-1){const[s]=this.queue.splice(t,1);return this.finishCancelled(s),!0}const n=this.inflight.get(e);return n!==void 0?(n.controller.abort(),!0):!1}cancelWhere(e){const t=[...this.queue.map(n=>n.key),...this.inflight.keys()].filter(e);for(const n of t)this.cancel(n);return t.length}cancelAll(){return this.cancelWhere(()=>!0)}clearCache(){this.cache.clear()}clearKey(e){return this.cache.delete(e)}prime(e,t){this.remember(e,t)}sortQueue(){this.queue.sort((e,t)=>t.priority-e.priority)}remember(e,t){for(this.cache.delete(e),this.cache.set(e,t);this.cache.size>this.cacheSize;){const n=this.cache.keys().next().value;if(n===void 0)break;this.cache.delete(n)}}finishCancelled(e){this.stats.cancelled++;for(const t of e.rejecters)t(new V)}pump(){for(;this.inflight.size<this.concurrency&&this.queue.length>0;){const e=this.queue.shift();if(e===void 0)break;e.started=!0,this.inflight.set(e.key,e),this.runJob(e)}}async runJob(e){try{const t=this.provider.complete(e.input,{signal:e.controller.signal}),n=await ae(t,s=>{if(!e.controller.signal.aborted)for(const a of e.chunkListeners)a(s)},e.controller.signal);if(e.controller.signal.aborted)throw new V;this.remember(e.key,n),this.stats.completed++;for(const s of e.resolvers)s(n)}catch(t){if(U(t)||e.controller.signal.aborted){this.stats.cancelled++;for(const n of e.rejecters)n(new V)}else{this.stats.errors++;for(const n of e.rejecters)n(t)}}finally{this.inflight.delete(e.key),this.pump()}}}function ue(r){var e;return r.kind===y.Custom&&((e=r.data)==null?void 0:e.kind)==="ai-cell"}function et(r,e={}){return{kind:y.Custom,allowOverlay:!0,copyData:"",...e,data:{kind:"ai-cell",prompt:r,status:"idle"}}}function $(r,e){const t={...r.data,...e};return{...r,data:t,copyData:t.result??""}}const tt={display:"flex",flexDirection:"column",gap:6,padding:8,minWidth:280,fontFamily:"var(--gdg-font-family)",color:"var(--gdg-text-dark)"},nt={font:"inherit",fontSize:"var(--gdg-editor-font-size)",color:"inherit",background:"var(--gdg-bg-cell)",border:"1px solid var(--gdg-border-color)",borderRadius:4,padding:6,resize:"vertical",minHeight:48},rt={fontSize:"var(--gdg-editor-font-size)",whiteSpace:"pre-wrap",maxHeight:160,overflow:"auto",padding:"4px 0"},ot={alignSelf:"flex-start",font:"inherit",fontSize:12,padding:"4px 10px",borderRadius:4,border:"1px solid var(--gdg-border-color)",background:"var(--gdg-bg-header)",color:"var(--gdg-text-dark)",cursor:"pointer"},st=({value:r,onChange:e})=>{const{prompt:t,result:n,status:s,error:a}=r.data;return o.createElement("div",{style:tt,className:"gdg-ai-cell-editor"},o.createElement("label",{style:{fontSize:11,color:"var(--gdg-text-medium)"}},"Prompt — use ","{Column Title}"," to reference this row"),o.createElement("textarea",{style:nt,value:t,autoFocus:!0,onChange:c=>e($({...r,data:{...r.data,prompt:c.target.value}},{result:void 0,status:"idle",error:void 0}))}),o.createElement("div",{style:rt,"data-status":s??"idle"},s==="error"?`⚠ ${a??"Generation failed"}`:n??(s==="pending"||s==="streaming"?"Generating…":"No result yet")),o.createElement("button",{type:"button",style:ot,onClick:()=>e($(r,{result:void 0,status:"idle",error:void 0}))},"Regenerate"))},Ce=900,at={kind:y.Custom,isMatch:r=>{var e;return((e=r.data)==null?void 0:e.kind)==="ai-cell"},draw:(r,e)=>{const{ctx:t,theme:n,rect:s,requestAnimationFrame:a,frameTime:c}=r,{prompt:d,result:i,status:l="idle",error:u}=e.data;if(l==="done"&&i!==void 0)return ve(r,i,e.contentAlign),!0;if(l==="streaming"&&i!==void 0&&i!=="")return ve(r,i,e.contentAlign),a(),!0;if(l==="pending"||l==="streaming"){const m=1+Math.floor(c%Ce/(Ce/3))%3;return t.fillStyle=n.textLight,t.font=n.baseFontFull,t.textBaseline="middle",t.fillText("✦ "+".".repeat(m),s.x+n.cellHorizontalPadding,s.y+s.height/2),a(),!0}return l==="error"?(t.fillStyle=n.textMedium,t.font=n.baseFontFull,t.textBaseline="middle",t.fillText(`⚠ ${u??"error"}`,s.x+n.cellHorizontalPadding,s.y+s.height/2),!0):(t.fillStyle=n.textLight,t.font=n.baseFontFull,t.textBaseline="middle",t.fillText(d===""?"✦ (empty prompt)":`✦ ${d}`,s.x+n.cellHorizontalPadding,s.y+s.height/2),!0)},measure:(r,e,t)=>{const n=e.data.result??e.data.prompt;return Ye(n,r,t.baseFontFull).width+t.cellHorizontalPadding*2},provideEditor:()=>({editor:r=>o.createElement(st,{value:r.value,onChange:r.onChange}),disablePadding:!0}),onPaste:(r,e)=>({...e,prompt:r,result:void 0,status:"idle",error:void 0}),onDelete:r=>$(r,{result:void 0,status:"idle",error:void 0})};function B(r){switch(r.kind){case y.Text:case y.Number:case y.Uri:return r.displayData??(r.data===void 0?"":String(r.data));case y.Markdown:case y.RowID:return r.data??"";case y.Boolean:return r.data===!0?"true":r.data===!1?"false":"";case y.Bubble:case y.Image:return r.data.join(", ");case y.Drilldown:return r.data.map(e=>e.text).join(", ");case y.Custom:return r.copyData??"";case y.Loading:case y.Protected:return"";default:return""}}function he(r){const e=/```(?:json)?\s*([\s\S]*?)```/i.exec(r),t=[e==null?void 0:e[1],r].filter(n=>typeof n=="string");for(const n of t){const s=n.trim();try{return JSON.parse(s)}catch{}const a=[s.indexOf("["),s.indexOf("{")].filter(l=>l!==-1);if(a.length===0)continue;const c=Math.min(...a),d=s[c]==="["?"]":"}",i=s.lastIndexOf(d);if(!(i<=c))try{return JSON.parse(s.slice(c,i+1))}catch{}}}function it(r){let e=5381;for(let t=0;t<r.length;t++)e=(e<<5)+e+r.charCodeAt(t)|0;return(e>>>0).toString(36)}function be(r,e,t){return r.replace(/\{([^{}]+)\}/g,(n,s)=>{const a=s.trim().toLowerCase(),c=e.findIndex(d=>d.title.toLowerCase()===a||d.id!==void 0&&d.id.toLowerCase()===a);return c===-1||t[c]===void 0?n:B(t[c])})}function lt(r){const{provider:e,columns:t,getCellContent:n,gridRef:s,autoRun:a=!0,concurrency:c,system:d,onCellsEdited:i}=r,l=o.useRef(i);l.current=i;const u=r.scheduler,m=o.useMemo(()=>{if(u!==void 0)return u;if(e===void 0)throw new Error("useAiCells needs a provider or a scheduler");return new Xe({provider:e,concurrency:c})},[u,e,c]),[,h]=o.useReducer(g=>g+1,0),C=o.useRef(new Map),w=o.useRef(new Map),f=o.useRef(new Set),v=o.useRef(new Set),b=o.useRef(new Map),A=o.useRef(void 0),S=o.useRef(new Map),x=o.useCallback(g=>{const p=s==null?void 0:s.current;p!=null?p.updateCells([{cell:g}]):h()},[s]),k=o.useCallback(g=>t.map((p,E)=>n([E,g])),[t,n]),M=o.useCallback((g,p)=>`${g[0]}:${g[1]}:${it(p)}`,[]),O=o.useCallback(g=>{const p=A.current;return p===void 0?!0:g[1]>=p.y&&g[1]<p.y+p.height},[]),T=o.useCallback((g,p,E)=>{S.current.set(p,g),m.request(p,{prompt:E,system:d,feature:"ai-cell",context:{location:g}},{priority:O(g)?1:0,onChunk:R=>{C.current.set(p,R),x(g)}}).then(R=>{C.current.delete(p),w.current.delete(p),v.current.delete(p),b.current.set(p,R);const q=n(g);if(ue(q)&&l.current!==void 0){const P=$(q,{result:R,status:"done",error:void 0});l.current([{location:g,value:P}])}x(g)}).catch(R=>{C.current.delete(p),v.current.delete(p),U(R)||(w.current.set(p,R instanceof Error?R.message:String(R)),x(g))})},[m,d,O,x,n]),W=o.useCallback(g=>{const p=n(g);if(!ue(p))return p;if(p.data.prompt.trim()==="")return $(p,{status:"idle"});const E=be(p.data.prompt,t,k(g[1])),R=M(g,E),q=b.current.get(R);if(q!==void 0)if(p.data.result===q)b.current.delete(R);else return $(p,{result:q,status:"done",error:void 0});if(p.data.status==="done"&&p.data.result!==void 0&&!v.current.has(R))return m.get(R)!==p.data.result&&m.prime(R,p.data.result),p;const P=m.get(R);if(P!==void 0)return $(p,{result:P,status:"done",error:void 0});const z=w.current.get(R);if(z!==void 0)return $(p,{status:"error",error:z,result:void 0});const J=C.current.get(R);return J!==void 0?$(p,{status:"streaming",result:J}):m.isPending(R)?$(p,{status:"pending",result:void 0}):(a||f.current.has(R))&&O(g)?(f.current.delete(R),T(g,R,E),$(p,{status:"pending",result:void 0})):$(p,{status:"idle"})},[n,t,k,M,m,a,O,T]),F=o.useCallback(g=>{A.current=g,m.cancelWhere(p=>{const E=S.current.get(p);return E!==void 0&&!(E[1]>=g.y&&E[1]<g.y+g.height)})},[m]),D=o.useCallback(g=>{const p=n(g);if(ue(p))return be(p.data.prompt,t,k(g[1]))},[n,t,k]),_=o.useCallback(g=>{const p=D(g);if(p===void 0)return;const E=M(g,p);m.has(E)||m.isPending(E)||(f.current.add(E),w.current.delete(E),T(g,E,p),x(g))},[D,M,m,T,x]),N=o.useCallback(g=>{const p=D(g);if(p===void 0)return;const E=M(g,p);m.cancel(E),m.clearKey(E),w.current.delete(E),C.current.delete(E),v.current.add(E),f.current.add(E),T(g,E,p),x(g)},[D,M,m,T,x]),L=o.useMemo(()=>[at],[]);return{getCellContent:W,onVisibleRegionChanged:F,customRenderers:L,scheduler:m,regenerate:N,run:_,resolvePrompt:D}}const de={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90,hundred:100,thousand:1e3,million:1e6,billion:1e9},ct={k:1e3,m:1e6,b:1e9,bn:1e9,mm:1e6};function We(r){let e=r.trim().toLowerCase();if(e==="")return;const t=Number(e);if(!Number.isNaN(t)&&/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/.test(e))return t;let n=!1;/^\(.*\)$/.test(e)&&(n=!0,e=e.slice(1,-1).trim()),e=e.replace(/^[-−–]/,d=>(n=!n||d==="","")),e=e.replace(/^\+/,""),e=e.replace(/^[$€£¥₹]\s*/,"").replace(/\s*(usd|eur|gbp|%|percent)$/,""),e=e.replace(/,/g,"").replace(/\s+/g," ").trim();const s=/^(\d+\.?\d*|\.\d+)\s*(k|m|b|bn|mm|thousand|million|billion)$/.exec(e);if(s!==null){const d=ct[s[2]]??de[s[2]],i=Number(s[1])*d;return n?-i:i}const a=Number(e);if(!Number.isNaN(a)&&e!=="")return n?-a:a;const c=e.split(/[\s-]+/);if(c.length>0&&c.every(d=>d in de)){let d=0,i=0;for(const u of c){const m=de[u];m===100?i=Math.max(i,1)*100:m>=1e3?(d+=Math.max(i,1)*m,i=0):i+=m}const l=d+i;return n?-l:l}}const ut=new Set(["true","yes","y","1","on","✓","✔","x","checked","done","t"]),dt=new Set(["false","no","n","0","off","✗","✘","unchecked","f","-","—"]);function mt(r){const e=r.trim().toLowerCase();if(ut.has(e))return!0;if(dt.has(e))return!1}function me(r){const e=r.trim();if(e!==""){if(/^[a-z][a-z0-9+.-]*:\/\//i.test(e)||/^(mailto|tel):/i.test(e))return e;if(/^[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(e))return`https://${e}`;if(/^[\w.+-]+@[\w-]+\.[a-z]{2,}$/i.test(e))return`mailto:${e}`}}function oe(r,e){switch(e.kind){case y.Text:{const t=r.trim();return{...e,data:t,displayData:t}}case y.Markdown:case y.RowID:return{...e,data:r.trim()};case y.Number:{const t=We(r);return t===void 0?void 0:{...e,data:t,displayData:String(t)}}case y.Boolean:{const t=mt(r);return t===void 0?void 0:{...e,data:t}}case y.Uri:{const t=me(r);return t===void 0?void 0:{...e,data:t,displayData:t}}case y.Bubble:{const t=r.split(/[,;\n]+/).map(n=>n.trim()).filter(n=>n!=="");return{...e,data:t}}case y.Image:{const t=r.split(/[\s,;]+/).map(n=>n.trim()).filter(n=>me(n)!==void 0).map(n=>me(n));return t.length===0?void 0:{...e,data:t}}default:return}}const pt=new Set(["contains","notContains","eq","neq","gt","gte","lt","lte","startsWith","endsWith","empty","notEmpty","in"]),ht={"=":"eq","==":"eq",equals:"eq",is:"eq","!=":"neq","<>":"neq",not:"neq",isnot:"neq",">":"gt",after:"gt",greater:"gt",">=":"gte","<":"lt",before:"lt",less:"lt","<=":"lte",includes:"contains",like:"contains",has:"contains",excludes:"notContains",startswith:"startsWith",endswith:"endsWith",isempty:"empty",isnotempty:"notEmpty",oneof:"in",any:"in"};function ft(r){const e=he(r);if(e==null||typeof e!="object")return;const t=e,n=Array.isArray(t.clauses)?t.clauses:Array.isArray(e)?e:void 0;if(n===void 0)return;const s=[];for(const c of n){if(c===null||typeof c!="object")continue;const{column:d,op:i,value:l}=c;if(typeof d!="string"||typeof i!="string")continue;const u=i.trim(),m=pt.has(u)?u:ht[u.toLowerCase().replace(/[\s_-]/g,"")];if(m===void 0)continue;const h=l==null?void 0:Array.isArray(l)?l.filter(C=>typeof C=="string"||typeof C=="number"):typeof l=="string"||typeof l=="number"||typeof l=="boolean"?l:String(l);s.push({column:d,op:m,value:h})}return s.length===0?void 0:{conjunction:t.conjunction==="or"?"or":"and",clauses:s}}function ke(r){if(typeof r=="number")return Number.isNaN(r)?void 0:r;if(typeof r=="boolean")return r?1:0;if(typeof r=="string"){const e=We(r);if(e!==void 0)return e;const t=Date.parse(r);return Number.isNaN(t)?void 0:t}}function Y(r,e){const t=ke(r),n=ke(e);if(t!==void 0&&n!==void 0)return t===n?0:t<n?-1:1;const s=String(e??"");return r.localeCompare(s,void 0,{sensitivity:"base",numeric:!0})}function gt(r,e){const t=B(r),n=t.toLowerCase(),s=e.value,a=s===void 0?"":String(s).toLowerCase();switch(e.op){case"contains":return n.includes(a);case"notContains":return!n.includes(a);case"startsWith":return n.startsWith(a);case"endsWith":return n.endsWith(a);case"empty":return t.trim()==="";case"notEmpty":return t.trim()!=="";case"in":return(Array.isArray(s)?s:s===void 0?[]:[s]).some(d=>Y(t,d)===0);case"eq":return Y(t,s)===0;case"neq":return Y(t,s)!==0;case"gt":case"gte":case"lt":case"lte":{const c=Y(t,s);return c===void 0?!1:e.op==="gt"?c>0:e.op==="gte"?c>=0:e.op==="lt"?c<0:c<=0}default:return!1}}function vt(r,e){const t=e.trim().toLowerCase();return r.findIndex(n=>n.title.toLowerCase()===t||n.id!==void 0&&n.id.toLowerCase()===t)}function wt(r,e,t){const n=r.clauses.map(s=>{const a=vt(e,s.column),c=a===-1?void 0:t[a];return c===void 0?!1:gt(c,s)});return r.conjunction==="or"?n.some(Boolean):n.every(Boolean)}function yt(r,e){const t=r.trim().toLowerCase();if(t==="")return[];const n=[];return e.forEach((s,a)=>{B(s).toLowerCase().includes(t)&&n.push(a)}),n}const Ct={text:"text",number:"number",boolean:"boolean",uri:"url",markdown:"text",bubble:"tags",image:"image urls",drilldown:"text",custom:"text",loading:"text",protected:"text","row-id":"id"};function bt(r,e,t){const n=e.map((s,a)=>{var i,l;const c=(l=(i=t[0])==null?void 0:i[a])==null?void 0:l.kind,d=t.map(u=>B(u[a]??{kind:"loading"})).filter(u=>u!=="").slice(0,3);return`- "${s.title}" (${Ct[c??"text"]??"text"})${d.length>0?` e.g. ${d.map(u=>JSON.stringify(u)).join(", ")}`:""}`});return[`Translate this search into a filter over a table. Query: ${JSON.stringify(r)}`,"Columns:",...n,'Reply with ONLY JSON: {"conjunction": "and"|"or", "clauses": [{"column": "<column title>", "op": <op>, "value": <value>}]}',"Allowed ops: contains, notContains, eq, neq, gt, gte, lt, lte, startsWith, endsWith, empty, notEmpty, in (value is an array).","Use column titles exactly as listed. Dates as ISO strings. If the query is just a word to look for, use contains on the most likely column."].join(`
`)}const Se={status:"idle",spec:void 0,error:void 0,matchedRows:[],matchedCells:new Map};function _e(r){const{provider:e,columns:t,rows:n,getCellContent:s,query:a,debounceMs:c=300,maxRows:d=5e4,sampleRows:i=3}=r,[l,u]=o.useState(Se),m=o.useRef(new Map),h=o.useCallback(f=>t.map((v,b)=>s([b,f])),[t,s]),C=o.useCallback(f=>{const v=[],b=new Map,A=Math.min(n,d);for(let S=0;S<A;S++){const x=yt(f,h(S));x.length>0&&(v.push(S),b.set(S,x))}return{matchedRows:v,matchedCells:b}},[n,d,h]),w=o.useCallback(f=>{const v=[],b=new Map,A=Math.min(n,d),S=f.clauses.map(k=>t.findIndex(M=>{var O;return M.title.toLowerCase()===k.column.trim().toLowerCase()||((O=M.id)==null?void 0:O.toLowerCase())===k.column.trim().toLowerCase()})).filter(k=>k!==-1),x=S.length>0?[...new Set(S)]:[0];for(let k=0;k<A;k++)wt(f,t,h(k))&&(v.push(k),b.set(k,x));return{matchedRows:v,matchedCells:b}},[n,d,t,h]);return o.useEffect(()=>{const f=a.trim();if(f===""){u(Se);return}const v=C(f),b=m.current.get(f);if(b!==void 0){u({status:"compiled",spec:b,error:void 0,...w(b)});return}if(e===void 0){u({status:"literal",spec:void 0,error:void 0,...v});return}u({status:"compiling",spec:void 0,error:void 0,...v});const A=new AbortController,S=setTimeout(async()=>{try{const x=Array.from({length:Math.min(i,n)},(O,T)=>h(T)),k=await ae(e.complete({prompt:bt(f,t,x),system:"You translate search queries into JSON filters. Reply with JSON only.",feature:"search"},{signal:A.signal}),void 0,A.signal);if(A.signal.aborted)return;const M=ft(k);if(M===void 0){u({status:"literal",spec:void 0,error:"The model did not return a usable filter",...v});return}m.current.set(f,M),u({status:"compiled",spec:M,error:void 0,...w(M)})}catch(x){if(U(x)||A.signal.aborted)return;u({status:"error",spec:void 0,error:x instanceof Error?x.message:String(x),...v})}},c);return()=>{clearTimeout(S),A.abort()}},[a,e,t,n,c,i,h,C,w]),l}function kt(r){const[e,t]=o.useState(""),[n,s]=o.useState(!1),a=_e({...r,query:e}),c=o.useMemo(()=>{const u=[];for(const m of a.matchedRows)for(const h of a.matchedCells.get(m)??[0])u.push([h,m]);return u},[a.matchedRows,a.matchedCells]),d=o.useCallback(u=>t(u),[]),i=o.useCallback(()=>s(!0),[]),l=o.useCallback(()=>s(!1),[]);return{searchValue:e,onSearchValueChange:d,searchResults:c,showSearch:n,onSearchClose:l,setSearchValue:t,openSearch:i,closeSearch:l,status:a.status,spec:a.spec,error:a.error,matchedRows:a.matchedRows}}function St(r){const{getCellContent:e,rows:t,query:n}=r,s=_e(r),a=n.trim()!=="",c=s.matchedRows,d=o.useCallback(l=>a?c[l]??l:l,[a,c]),i=o.useCallback(([l,u])=>e([l,d(u)]),[e,d]);return{rows:a?c.length:t,getCellContent:a?i:e,getOriginalIndex:d,status:s.status,spec:s.spec,error:s.error}}function xt(r){const{source:e,toCell:t,onEdited:n,flushIntervalMs:s=50,autoStart:a=!0,initialRows:c}=r,[d,i]=o.useState(c??[]),[l,u]=o.useState("idle"),[m,h]=o.useState(void 0),C=o.useRef([...c??[]]),w=o.useRef(void 0),f=o.useRef([]),v=o.useRef(void 0),[b,A]=o.useState(a?1:0),S=o.useRef(e);S.current=e;const x=o.useRef(n);x.current=n;const k=o.useCallback(()=>{v.current=void 0,f.current.length!==0&&(C.current.push(...f.current),f.current=[],i([...C.current]))},[]),M=o.useCallback(()=>{v.current===void 0&&(v.current=setTimeout(k,s))},[k,s]),O=o.useCallback(()=>{var N;(N=w.current)==null||N.abort(),w.current=void 0,v.current!==void 0&&clearTimeout(v.current),k(),u(L=>L==="streaming"?"cancelled":L)},[k]),T=o.useCallback(()=>{var N;(N=w.current)==null||N.abort(),w.current=void 0,v.current!==void 0&&clearTimeout(v.current),v.current=void 0,f.current=[],C.current=[],i([]),u("idle"),h(void 0)},[]),W=o.useCallback(()=>{T(),A(N=>N+1)},[T]);o.useEffect(()=>{if(b===0)return;const N=new AbortController;return w.current=N,u("streaming"),h(void 0),(async()=>{try{for await(const L of S.current(N.signal)){if(N.signal.aborted)break;Array.isArray(L)?f.current.push(...L):f.current.push(L),M()}if(N.signal.aborted)return;v.current!==void 0&&clearTimeout(v.current),k(),u("done")}catch(L){if(N.signal.aborted||U(L))return;v.current!==void 0&&clearTimeout(v.current),k(),h(L instanceof Error?L.message:String(L)),u("error")}finally{w.current===N&&(w.current=void 0)}})(),()=>{N.abort()}},[b,M,k]);const F=o.useCallback(([N,L])=>{const g=C.current[L];return g===void 0?{kind:"loading",allowOverlay:!1}:t(g,N,L)},[t]),D=o.useCallback(N=>{const L=x.current;if(L===void 0)return!0;let g=!1;const p=[];for(const E of N){const[R,q]=E.location,P=C.current[q];if(P===void 0)continue;const z=L(P,R,E.value,q),J=G=>{G!==void 0&&(C.current[q]=G,g=!0)};z instanceof Promise?p.push(z.then(G=>{G!==void 0&&(C.current[q]=G,i([...C.current]))})):J(z)}return g&&i([...C.current]),!0},[]),_=o.useCallback(N=>{C.current.push(...N),i([...C.current])},[]);return{rows:d.length,data:d,getCellContent:F,onCellsEdited:D,status:l,error:m,start:W,stop:O,reset:T,appendRows:_}}const Rt={[y.Number]:"a plain number (digits, optional decimal point, no units)",[y.Boolean]:"true or false",[y.Uri]:"an absolute URL",[y.Bubble]:"a comma-separated list of short tags",[y.Image]:"a comma-separated list of image URLs",[y.Text]:"plain text"};function Et(r){return["Convert each pasted text into the value the column expects. Interpret dates, numbers written as words, currencies, and yes/no phrasing.",'Reply with ONLY a JSON array of objects {"i": <index>, "value": <string>} — omit entries you cannot convert.',...r.map((t,n)=>`${n}. column "${t.column}" expects ${Rt[t.target.kind]??"plain text"}; pasted text: ${JSON.stringify(t.text)}`)].join(`
`)}function Mt(r){const{provider:e,columns:t,getCellContent:n,onCellsEdited:s,batchSize:a=50}=r,[c,d]=o.useState(0),[i,l]=o.useState(void 0),u=o.useRef(s);u.current=s;const m=o.useCallback((w,f)=>oe(w,f),[]),h=o.useCallback(async w=>{if(!(e===void 0||w.length===0)){d(f=>f+w.length);try{const f=new AbortController,v=await ae(e.complete({prompt:Et(w),system:"You convert pasted spreadsheet text into typed cell values. Reply with JSON only.",feature:"smart-paste"},{signal:f.signal}),void 0,f.signal),b=he(v),A=[];if(Array.isArray(b))for(const S of b){if(S===null||typeof S!="object")continue;const x=w[Number(S.i)];if(x===void 0)continue;const k=oe(String(S.value??""),x.target);k!==void 0&&A.push({location:x.location,value:k})}A.length>0&&u.current(A),l(void 0)}catch(f){U(f)||l(f instanceof Error?f.message:String(f))}finally{d(f=>Math.max(0,f-w.length))}}},[e]),C=o.useCallback((w,f)=>{if(e===void 0)return!0;const v=[];f.forEach((b,A)=>{b.forEach((S,x)=>{var O;const k=[w[0]+x,w[1]+A];if(k[0]>=t.length)return;const M=n(k);S.trim()===""||M.kind===y.Text||M.kind===y.Custom||oe(S,M)===void 0&&v.push({index:v.length,location:k,text:S,target:M,column:((O=t[k[0]])==null?void 0:O.title)??String(k[0])})})});for(let b=0;b<v.length;b+=a)h(v.slice(b,b+a));return!0},[e,t,n,a,h]);return{coercePasteValue:m,onPaste:C,pending:c,lastError:i}}function xe(r){return r===void 0?[]:r.toArray()}function Nt(r,e,t){const n=new Set(xe(r.rows)),s=new Set(xe(r.columns)),a=r.current===void 0?[]:[r.current.range,...r.current.rangeStack];for(const i of a){for(let l=i.y;l<i.y+i.height;l++)n.add(l);for(let l=i.x;l<i.x+i.width;l++)s.add(l)}if(n.size===0&&s.size>0)for(let i=0;i<e;i++)n.add(i);const c=[...n].filter(i=>i>=0&&i<e).sort((i,l)=>i-l),d=[...s].filter(i=>i>=0&&i<t).sort((i,l)=>i-l);return{rows:c,columns:r.rows.length>0&&d.length===0?void 0:d.length>0?d:void 0}}function At(r,e,t,n){const s=t.map(a=>`"${e[a].title}"`).join(", ");return[`Instruction: ${JSON.stringify(r)}`,`Editable columns: ${s}. Only these may be changed.`,"Rows (JSON, one per line):",...n.map(a=>JSON.stringify({row:a.row,...a.values})),'Reply with ONLY a JSON array of changes: [{"row": <row>, "column": "<column title>", "value": "<new value>"}]. Omit rows that need no change.'].join(`
`)}function Lt(r){const{provider:e,columns:t,rows:n,getCellContent:s,onCellsEdited:a,maxRows:c=200,highlightColor:d="rgba(79, 93, 255, 0.25)"}=r,[i,l]=o.useState("idle"),[u,m]=o.useState(void 0),[h,C]=o.useState(void 0),w=o.useRef(void 0),f=o.useCallback(async(S,x)=>{var W;const k="rows"in x&&Array.isArray(x.rows)?x:Nt(x,n,t.length),M=k.rows,O=k.columns??t.map((F,D)=>D);if((W=w.current)==null||W.abort(),M.length===0||O.length===0){m("Select the rows or cells to edit first"),l("error");return}if(M.length>c){m(`Too many rows selected (${M.length}); the limit is ${c}`),l("error");return}const T=new AbortController;w.current=T,l("proposing"),m(void 0),C(void 0);try{const F=M.map(R=>{const q={};for(const P of O)q[t[P].title]=B(s([P,R]));return{row:R,values:q}}),D=await ae(e.complete({prompt:At(S,t,O,F),system:"You edit spreadsheet rows exactly as instructed and reply with JSON only.",feature:"bulk-edit"},{signal:T.signal}),void 0,T.signal);if(T.signal.aborted)return;const _=he(D),N=new Set(M),L=[],g=new Set;let p=0;for(const R of Array.isArray(_)?_:[]){if(R===null||typeof R!="object"){p++;continue}const q=Number(R.row),P=String(R.column??"").trim().toLowerCase(),z=O.find(fe=>{var ge;return t[fe].title.toLowerCase()===P||((ge=t[fe].id)==null?void 0:ge.toLowerCase())===P});if(!N.has(q)||z===void 0||g.has(`${z}:${q}`)){p++;continue}const J=[z,q],G=s(J),ce=oe(String(R.value??""),G);if(ce===void 0){p++;continue}B(ce)!==B(G)&&(g.add(`${z}:${q}`),L.push({location:J,value:ce}))}const E={instruction:S,edits:L,rejected:p};return C(E),l("proposed"),E}catch(F){if(U(F)||T.signal.aborted)return;m(F instanceof Error?F.message:String(F)),l("error");return}},[e,t,n,s,c]),v=o.useCallback(()=>{h!==void 0&&(h.edits.length>0&&a(h.edits),C(void 0),l("idle"))},[h,a]),b=o.useCallback(()=>{var S;(S=w.current)==null||S.abort(),C(void 0),l("idle"),m(void 0)},[]),A=o.useMemo(()=>{if(!(h===void 0||h.edits.length===0))return h.edits.map(S=>({color:d,range:{x:S.location[0],y:S.location[1],width:1,height:1},style:"solid"}))},[h,d]);return{status:i,error:u,proposal:h,propose:f,apply:v,discard:b,highlightRegions:A}}const Vt={title:"Extra Packages/AI",parameters:{layout:"fullscreen"}},pe=["Engineering","Sales","Ops","Design"],Re=["Ada","Grace","Linus","Mia","Noor","Ken","Sara","Yuki","Omar","Lea"],Ee=["Lovelace","Hopper","Torvalds","Chen","Haddad","Sato","Okafor","Ruiz","Novak","Berg"];function ie(r){return Array.from({length:r},(e,t)=>({name:`${Re[t%Re.length]} ${Ee[t*7%Ee.length]}`,dept:pe[t*3%pe.length],age:22+t*13%40,notes:["Ships weekly","Owns the roadmap","Mentors juniors","Runs on-call","Leads hiring"][t%5]}))}const I=r=>({kind:y.Text,data:r,displayData:r,allowOverlay:!0}),le=r=>({kind:y.Number,data:r,displayData:String(r),allowOverlay:!0}),K=({title:r,blurb:e,children:t,aside:n})=>o.createElement("div",{style:{padding:24,fontFamily:"Inter, system-ui, sans-serif",color:"#1a1a1a",background:"#f6f7fb",minHeight:"100vh",boxSizing:"border-box"}},o.createElement("h2",{style:{margin:"0 0 4px"}},r),o.createElement("p",{style:{margin:"0 0 12px",color:"#555",maxWidth:720}},e),n!==void 0&&o.createElement("div",{style:{margin:"0 0 12px",fontSize:13}},n),o.createElement("div",{style:{width:"100%",height:460,background:"white",borderRadius:8,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.12)"}},t)),Z=()=>{const r=o.useMemo(()=>ie(40),[]),e=o.useMemo(()=>[{title:"Name",id:"name",width:160},{title:"Dept",id:"dept",width:120},{title:"Notes",id:"notes",width:180},{title:"Intro (AI)",id:"intro",width:420}],[]),t=o.useMemo(()=>H(l=>{var h,C,w,f;return`${((h=/for (.+?):/.exec(l.prompt))==null?void 0:h[1])??"them"} is a ${((C=/in ([A-Za-z]+)/.exec(l.prompt))==null?void 0:C[1])??"team"} teammate who ${((f=(w=/who (.+)$/.exec(l.prompt))==null?void 0:w[1])==null?void 0:f.toLowerCase())??"does great work"}.`.split(" ").map((v,b)=>b===0?v:` ${v}`)},{delayMs:60}),[]),[n,s]=o.useState(()=>new Map),a=o.useCallback(([l,u])=>{const m=r[u];return l===0?I(m.name):l===1?I(m.dept):l===2?I(m.notes):n.get(u)??et("Write one friendly sentence for {Name}: they work in {Dept} and are someone who {Notes}")},[r,n]),c=o.useCallback(l=>(s(u=>{const m=new Map(u);for(const h of l)h.location[0]===3&&m.set(h.location[1],h.value);return m}),!0),[]),d=o.useRef(null),i=lt({provider:t,columns:e,getCellContent:a,gridRef:d,concurrency:3,onCellsEdited:c});return o.createElement(K,{title:"AI cells — =AI() formulas",blurb:"The last column is an AI cell whose prompt references the row's other cells. Cells generate as they scroll into view, stream their text, cache by prompt, and cancel when scrolled away. Finished results are handed to onCellsEdited so your app can persist them; double-click a cell to edit the prompt or regenerate.",aside:o.createElement("span",null,"saved results: ",o.createElement("b",null,n.size)," · model calls: ",o.createElement("b",null,t.calls.length),o.createElement("button",{style:{marginLeft:12},onClick:()=>s(new Map)},"Forget saved results"))},o.createElement(Q,{ref:d,columns:e,rows:r.length,getCellContent:i.getCellContent,customRenderers:i.customRenderers,onVisibleRegionChanged:i.onVisibleRegionChanged,onCellsEdited:c,rowMarkers:"number",smoothScrollY:!0}))};function Qe(r){var a,c;const e=((c=(a=/Query: "(.+?)"/.exec(r.prompt))==null?void 0:a[1])==null?void 0:c.toLowerCase())??"",t=[];for(const d of pe)e.includes(d.toLowerCase().slice(0,5))&&t.push({column:"Dept",op:"eq",value:d});const n=/(?:over|above|older than) (\d+)/.exec(e);n&&t.push({column:"Age",op:"gt",value:Number(n[1])});const s=/(?:under|below|younger than) (\d+)/.exec(e);return s&&t.push({column:"Age",op:"lt",value:Number(s[1])}),e.includes("mentor")&&t.push({column:"Notes",op:"contains",value:"mentor"}),t.length===0&&t.push({column:"Name",op:"contains",value:e.split(" ")[0]??e}),JSON.stringify({conjunction:"and",clauses:t})}const se=[{title:"Name",width:180},{title:"Dept",width:130},{title:"Age",width:80},{title:"Notes",width:200}],Ue=r=>([e,t])=>{const n=r[t];return e===0?I(n.name):e===1?I(n.dept):e===2?le(n.age):I(n.notes)},X=()=>{const r=o.useMemo(()=>ie(300),[]),e=o.useMemo(()=>Ue(r),[r]),t=o.useMemo(()=>H(Qe,{delayMs:400}),[]),n=kt({provider:t,columns:se,rows:r.length,getCellContent:e});return o.createElement(K,{title:"Natural-language search",blurb:'Type into the box (or press Ctrl/⌘+F in the grid): literal matches highlight instantly, then the model compiles the query into a filter — try "engineers over 40" or "sales who mentor". The model only sees column names and a few sample values, never the table.',aside:o.createElement("span",null,o.createElement("input",{value:n.searchValue??"",onChange:s=>n.setSearchValue(s.target.value),placeholder:'e.g. "engineers over 40"',style:{padding:6,width:280,marginRight:12}}),"status: ",o.createElement("b",null,n.status)," · matches: ",o.createElement("b",null,n.matchedRows.length),n.spec!==void 0&&o.createElement("code",{style:{marginLeft:12,fontSize:12}},JSON.stringify(n.spec.clauses)))},o.createElement(Q,{columns:se,rows:r.length,getCellContent:e,searchValue:n.searchValue,onSearchValueChange:n.onSearchValueChange,searchResults:n.searchResults,showSearch:n.showSearch,onSearchClose:n.onSearchClose,getCellsForSelection:!0,rowMarkers:"number"}))},ee=()=>{const r=o.useMemo(()=>ie(300),[]),e=o.useMemo(()=>Ue(r),[r]),t=o.useMemo(()=>H(Qe,{delayMs:400}),[]),[n,s]=o.useState(""),a=St({provider:t,columns:se,rows:r.length,getCellContent:e,query:n});return o.createElement(K,{title:"Natural-language filter",blurb:'Rows that do not match the query are hidden — the same compiled filter as search, applied as a row permutation like useColumnSort. Try "design under 30".',aside:o.createElement("span",null,o.createElement("input",{value:n,onChange:c=>s(c.target.value),placeholder:"filter rows…",style:{padding:6,width:280,marginRight:12}}),"status: ",o.createElement("b",null,a.status)," · showing ",o.createElement("b",null,a.rows)," of ",r.length)},o.createElement(Q,{columns:se,rows:a.rows,getCellContent:a.getCellContent,rowMarkers:"number"}))};async function*qt(r){const e=["Acme","Globex","Initech","Umbrella","Hooli","Stark","Wayne","Wonka","Tyrell","Cyberdyne","Aperture","Vandelay"],t=["Hiring a VP Sales","Raised Series B","Launched pricing page","Opened EU office","Sponsoring a conference"];for(let n=0;n<e.length;n++){if(await new Promise(s=>setTimeout(s,350)),r.aborted)return;yield{company:e[n],signal:t[n%t.length],confidence:60+n*17%40}}}const te=()=>{const r=o.useMemo(()=>[{title:"Company",width:160},{title:"Signal",width:260},{title:"Confidence",width:120}],[]),e=o.useCallback((n,s)=>s===0?I(n.company):s===1?I(n.signal):le(n.confidence),[]),t=xt({source:qt,toCell:e,onEdited:(n,s,a)=>s===2&&a.kind===y.Number?{...n,confidence:a.data??n.confidence}:s===1&&a.kind===y.Text?{...n,signal:a.data}:void 0});return o.createElement(K,{title:"Agent-fed data source",blurb:"The grid is the agent's output surface: rows stream in as a (simulated) research agent finds them, the grid stays fully interactive, and your edits flow back through onEdited so the agent can react.",aside:o.createElement("span",null,"status: ",o.createElement("b",null,t.status)," · rows: ",o.createElement("b",null,t.rows),o.createElement("button",{onClick:t.start,style:{marginLeft:12}},"Restart"),o.createElement("button",{onClick:t.stop,style:{marginLeft:6}},"Stop"),t.error!==void 0&&o.createElement("span",{style:{color:"crimson",marginLeft:12}},t.error))},o.createElement(Q,{columns:r,rows:t.rows,getCellContent:t.getCellContent,onCellsEdited:t.onCellsEdited,rowMarkers:"number"}))},Ot={ten:"10","a dozen":"12","half a hundred":"50",yep:"true",nope:"false",affirmative:"true",negative:"false","next tuesday":"2026-09-08"},ne=()=>{const r=o.useMemo(()=>[{title:"Item",width:160},{title:"Qty",width:100},{title:"In stock",width:100},{title:"Link",width:260}],[]),[e,t]=o.useState(()=>Array.from({length:12},(d,i)=>({item:`SKU-${100+i}`,qty:i*3,stock:i%2===0,link:""}))),n=o.useCallback(([d,i])=>{const l=e[i];return d===0?I(l.item):d===1?le(l.qty):d===2?{kind:y.Boolean,data:l.stock,allowOverlay:!1}:{kind:y.Uri,data:l.link,displayData:l.link,allowOverlay:!0}},[e]),s=o.useCallback(d=>(t(i=>{const l=i.map(u=>({...u}));for(const u of d){const m=l[u.location[1]];if(m===void 0)continue;const h=u.value;u.location[0]===1&&h.kind===y.Number?m.qty=h.data??0:u.location[0]===2&&h.kind===y.Boolean?m.stock=h.data===!0:u.location[0]===3&&h.kind===y.Uri?m.link=h.data:u.location[0]===0&&h.kind===y.Text&&(m.item=h.data)}return l}),!0),[]),a=o.useMemo(()=>H(d=>{const i=[];for(const l of d.prompt.matchAll(/^(\d+)\. .*pasted text: "(.+)"$/gm)){const u=Ot[l[2].toLowerCase()];u!==void 0&&i.push({i:Number(l[1]),value:u})}return JSON.stringify(i)},{delayMs:500}),[]),c=Mt({provider:a,columns:r,getCellContent:n,onCellsEdited:s});return o.createElement(K,{title:"Smart paste",blurb:'Copy some text and paste it into the Qty / In stock / Link columns: "$1,200", "twelve", "yes", "example.com" are coerced instantly; things like "a dozen" or "affirmative" go to the model in one batched call and are corrected a moment later.',aside:o.createElement("span",null,"pending model corrections: ",o.createElement("b",null,c.pending),c.lastError!==void 0&&o.createElement("span",{style:{color:"crimson"}}," · ",c.lastError))},o.createElement(Q,{columns:r,rows:e.length,getCellContent:n,onCellsEdited:s,coercePasteValue:c.coercePasteValue,onPaste:c.onPaste,getCellsForSelection:!0,rowMarkers:"number"}))},re=()=>{const r=o.useMemo(()=>[{title:"Order",width:140},{title:"Status",width:120},{title:"Qty",width:90},{title:"Customer",width:200}],[]),[e,t]=o.useState(()=>Array.from({length:15},(m,h)=>({order:`#${1e3+h}`,status:h%3===0?"shipped":"open",qty:1+h%6,customer:ie(15)[h].name}))),n=o.useCallback(([m,h])=>{const C=e[h];return m===0?I(C.order):m===1?I(C.status):m===2?le(C.qty):I(C.customer)},[e]),s=o.useCallback(m=>(t(h=>{const C=h.map(w=>({...w}));for(const w of m){const f=C[w.location[1]],v=w.value;f!==void 0&&(w.location[0]===1&&v.kind===y.Text&&(f.status=v.data),w.location[0]===2&&v.kind===y.Number&&(f.qty=v.data??f.qty),w.location[0]===3&&v.kind===y.Text&&(f.customer=v.data))}return C}),!0),[]),a=o.useMemo(()=>H(m=>{var f,v;const h=((v=(f=/Instruction: "(.+?)"/.exec(m.prompt))==null?void 0:f[1])==null?void 0:v.toLowerCase())??"",C=[...m.prompt.matchAll(/^\{"row":(\d+),(.*)\}$/gm)].map(b=>({row:Number(b[1]),json:JSON.parse(`{${b[2]}}`)})),w=[];for(const b of C)h.includes("ship")&&w.push({row:b.row,column:"Status",value:"shipped"}),h.includes("double")&&w.push({row:b.row,column:"Qty",value:String(Number(b.json.Qty)*2)}),h.includes("upper")&&w.push({row:b.row,column:"Customer",value:(b.json.Customer??"").toUpperCase()});return JSON.stringify(w)},{delayMs:600}),[]),[c,d]=o.useState({rows:we.empty(),columns:we.empty()}),[i,l]=o.useState("mark them as shipped"),u=Lt({provider:a,columns:r,rows:e.length,getCellContent:n,onCellsEdited:s});return o.createElement(K,{title:"Bulk edit in plain language",blurb:'Select some rows (click the row markers), type an instruction such as "mark them as shipped", "double the quantity", or "uppercase the customer", and propose. The model returns edits, the grid previews them as highlights, and nothing is written until you apply.',aside:o.createElement("span",null,o.createElement("input",{value:i,onChange:m=>l(m.target.value),style:{padding:6,width:260,marginRight:8}}),o.createElement("button",{onClick:()=>void u.propose(i,c),disabled:u.status==="proposing"},"Propose"),o.createElement("button",{onClick:u.apply,disabled:u.proposal===void 0,style:{marginLeft:6}},"Apply ",u.proposal!==void 0?`(${u.proposal.edits.length})`:""),o.createElement("button",{onClick:u.discard,disabled:u.proposal===void 0,style:{marginLeft:6}},"Discard"),o.createElement("span",{style:{marginLeft:12}},"status: ",o.createElement("b",null,u.status)),u.error!==void 0&&o.createElement("span",{style:{color:"crimson",marginLeft:12}},u.error))},o.createElement(Q,{columns:r,rows:e.length,getCellContent:n,onCellsEdited:s,gridSelection:c,onGridSelectionChange:d,highlightRegions:u.highlightRegions,rowMarkers:"both",rowSelect:"multi"}))};var Me,Ne,Ae;Z.parameters={...Z.parameters,docs:{...(Me=Z.parameters)==null?void 0:Me.docs,source:{originalSource:`() => {
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
  // "Persisted" AI results: in a real app this is your database. Finished
  // cells arrive through onCellsEdited; on reload they come back with a
  // done result and are never regenerated.
  const [saved, setSaved] = React.useState<Map<number, GridCell>>(() => new Map());
  const baseGetCellContent = React.useCallback(([col, row]: Item): GridCell => {
    const p = people[row];
    if (col === 0) return text(p.name);
    if (col === 1) return text(p.dept);
    if (col === 2) return text(p.notes);
    return saved.get(row) ?? aiCell("Write one friendly sentence for {Name}: they work in {Dept} and are someone who {Notes}");
  }, [people, saved]);
  const onCellsEdited = React.useCallback((edits: readonly {
    location: Item;
    value: GridCell;
  }[]) => {
    setSaved(prev => {
      const next = new Map(prev);
      for (const e of edits) if (e.location[0] === 3) next.set(e.location[1], e.value);
      return next;
    });
    return true;
  }, []);
  const gridRef = React.useRef<DataEditorRef | null>(null);
  const ai = useAiCells({
    provider,
    columns,
    getCellContent: baseGetCellContent,
    gridRef,
    concurrency: 3,
    onCellsEdited
  });
  return <Frame title="AI cells — =AI() formulas" blurb="The last column is an AI cell whose prompt references the row's other cells. Cells generate as they scroll into view, stream their text, cache by prompt, and cancel when scrolled away. Finished results are handed to onCellsEdited so your app can persist them; double-click a cell to edit the prompt or regenerate." aside={<span>
                    saved results: <b>{saved.size}</b> · model calls: <b>{provider.calls.length}</b>
                    <button style={{
      marginLeft: 12
    }} onClick={() => setSaved(new Map())}>Forget saved results</button>
                </span>}>
            <DataEditor ref={gridRef} columns={columns} rows={people.length} getCellContent={ai.getCellContent} customRenderers={ai.customRenderers} onVisibleRegionChanged={ai.onVisibleRegionChanged} onCellsEdited={onCellsEdited} rowMarkers="number" smoothScrollY />
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
}`,...(Oe=(qe=X.parameters)==null?void 0:qe.docs)==null?void 0:Oe.source}}};var Te,Pe,$e;ee.parameters={...ee.parameters,docs:{...(Te=ee.parameters)==null?void 0:Te.docs,source:{originalSource:`() => {
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
}`,...($e=(Pe=ee.parameters)==null?void 0:Pe.docs)==null?void 0:$e.source}}};var Ie,Fe,De;te.parameters={...te.parameters,docs:{...(Ie=te.parameters)==null?void 0:Ie.docs,source:{originalSource:`() => {
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
}`,...(De=(Fe=te.parameters)==null?void 0:Fe.docs)==null?void 0:De.source}}};var ze,Ge,Ve;ne.parameters={...ne.parameters,docs:{...(ze=ne.parameters)==null?void 0:ze.docs,source:{originalSource:`() => {
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
