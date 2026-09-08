const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./index-DHdbU2e9.js","./preload-helper-Dp1pzeXC.js"])))=>i.map(i=>d[i]);
var at=Object.defineProperty;var lt=(t,e,n)=>e in t?at(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var U=(t,e,n)=>lt(t,typeof e!="symbol"?e+"":e,n);import{r}from"./iframe-Dnr8FEb7.js";/* empty css              */import{A as ue,c as fe,i as Y,h as it,a as ae,u as ct,e as Ze,b as W,d as ut}from"./use-natural-language-filter-PPA6RvsU.js";import{G as R,m as dt,d as we,D as K,C as Ce}from"./data-editor-all-0mILIZ8H.js";import{_ as ge}from"./preload-helper-Dp1pzeXC.js";import"./throttle-bg4wIPcC.js";import"./flatten-BiR_gpKC.js";import"./marked.esm-CHiQR2Yr.js";async function et(t,e){const n=typeof t=="function"?await t():t;if(n===void 0||n==="")throw new Error(`${e}: no API key or token was provided`);return n}async function be(t){const e=typeof t=="function"?await t():t;return e===""?void 0:e}const mt={low:"low",medium:"medium",high:"high"},pt=/^claude-(opus-5|fable-5)/,ht="claude-opus-5";function ft(t={}){const{maxTokens:e=4096,allowModelOverride:n=!0}=t;return{complete(o,{signal:s}){return async function*(){var f;const{default:i}=await ge(async()=>{const{default:m}=await import("./index-DHdbU2e9.js").then(y=>y.i);return{default:m}},__vite__mapDeps([0,1]),import.meta.url),p=new i({apiKey:await be(t.apiKey),authToken:await be(t.authToken),baseURL:t.baseURL,dangerouslyAllowBrowser:t.dangerouslyAllowBrowser}),d=(n?o.model:void 0)??t.model??ht,a=t.effort??(o.difficulty===void 0?void 0:mt[o.difficulty]),l=[t.system,o.system].filter(m=>m!==void 0&&m!=="").join(`

`),u={model:d,max_tokens:e,...l===""?{}:{system:l},...a===void 0?{}:{output_config:{effort:a}},messages:[{role:"user",content:o.prompt}]},c=t.fallbacks!==!1&&pt.test(d)?p.beta.messages.stream({...u,betas:["server-side-fallback-2026-07-01"],fallbacks:"default"},{signal:s}):p.messages.stream(u,{signal:s});for await(const m of c)m.type==="content_block_delta"&&m.delta.type==="text_delta"&&(yield m.delta.text);const C=await c.finalMessage();if(C.stop_reason==="refusal"){const m=(f=C.stop_details)==null?void 0:f.category;throw new Error(`Claude declined this request${m!=null&&m!==""?` (${m})`:""}`)}}()}}}const gt="gpt-5",vt="gpt-5-codex";function tt(t={}){const{allowModelOverride:e=!0}=t;return{complete(n,{signal:o}){return async function*(){const{default:s}=await ge(async()=>{const{default:u}=await import("./index-BP-EPeDL.js");return{default:u}},[],import.meta.url),i=new s({apiKey:await et(t.apiKey,"OpenAI"),baseURL:t.baseURL,organization:t.organization,dangerouslyAllowBrowser:t.dangerouslyAllowBrowser}),p=(e?n.model:void 0)??t.model??gt,d=t.reasoningEffort??n.difficulty,a=[t.system,n.system].filter(u=>u!==void 0&&u!=="").join(`

`),l=await i.responses.create({model:p,input:n.prompt,...a===""?{}:{instructions:a},...d===void 0?{}:{reasoning:{effort:d}},...t.maxOutputTokens===void 0?{}:{max_output_tokens:t.maxOutputTokens},stream:!0},{signal:o});for await(const u of l)u.type==="response.output_text.delta"&&(yield u.delta)}()}}}function yt(t={}){return tt({model:vt,...t})}function nt(t){const{allowModelOverride:e=!0,label:n="OpenAI-compatible provider"}=t;return{complete(o,{signal:s}){return async function*(){var g,c,C;const{default:i}=await ge(async()=>{const{default:f}=await import("./index-BP-EPeDL.js");return{default:f}},[],import.meta.url),p=new i({apiKey:await et(t.apiKey,n),baseURL:t.baseURL,defaultHeaders:t.defaultHeaders,dangerouslyAllowBrowser:t.dangerouslyAllowBrowser}),d=(e?o.model:void 0)??t.model,a=[t.system,o.system].filter(f=>f!==void 0&&f!=="").join(`

`),l=[...a===""?[]:[{role:"system",content:a}],{role:"user",content:o.prompt}],u=await p.chat.completions.create({model:d,messages:l,stream:!0,...t.maxTokens===void 0?{}:{max_tokens:t.maxTokens},...t.temperature===void 0?{}:{temperature:t.temperature},...t.extraBody??{}},{signal:s});for await(const f of u){const m=(C=(c=(g=f.choices)==null?void 0:g[0])==null?void 0:c.delta)==null?void 0:C.content;typeof m=="string"&&m!==""&&(yield m)}}()}}}const wt="https://api.x.ai/v1",Ct="grok-4";function bt(t={}){return nt({...t,baseURL:t.baseURL??wt,model:t.model??Ct,label:"Grok"})}const kt="https://openrouter.ai/api/v1",St="openrouter/auto";function Et(t={}){var s,i;const e={...t.defaultHeaders??{}};((s=t.site)==null?void 0:s.url)!==void 0&&(e["HTTP-Referer"]=t.site.url),((i=t.site)==null?void 0:i.title)!==void 0&&(e["X-Title"]=t.site.title);const n=t.model??St,o={...t.extraBody??{},...t.fallbackModels===void 0?{}:{models:[n,...t.fallbackModels]}};return nt({...t,baseURL:t.baseURL??kt,model:n,defaultHeaders:e,extraBody:o,label:"OpenRouter"})}const Rt={"ai-cell":"medium",search:"low",filter:"low","smart-paste":"low","bulk-edit":"high","agent-source":"medium"};function xt(t){const e=n=>{var s;if(n.model!==void 0&&((s=t.models)==null?void 0:s[n.model])!==void 0)return{provider:t.models[n.model],via:"model"};const o=n.difficulty??t.fallbackDifficulty??(n.feature===void 0?void 0:Rt[n.feature]);return o!==void 0&&t[o]!==void 0?{provider:t[o],via:o}:{provider:t.default,via:"default"}};return{route:e,complete(n,o){return e(n).provider.complete(n,o)}}}class Mt{constructor(e){U(this,"provider");U(this,"concurrency");U(this,"cacheSize");U(this,"cache",new Map);U(this,"queue",[]);U(this,"inflight",new Map);U(this,"stats",{hits:0,misses:0,completed:0,cancelled:0,errors:0});this.provider=e.provider,this.concurrency=Math.max(1,e.concurrency??2),this.cacheSize=Math.max(1,e.cacheSize??1e3)}get(e){return this.cache.get(e)}has(e){return this.cache.has(e)}isPending(e){return this.inflight.has(e)||this.queue.some(n=>n.key===e)}get pendingCount(){return this.inflight.size+this.queue.length}request(e,n,o={}){const s=this.cache.get(e);if(s!==void 0)return this.stats.hits++,Promise.resolve(s);const i=this.inflight.get(e)??this.queue.find(a=>a.key===e);if(i!==void 0)return this.stats.hits++,o.onChunk!==void 0&&i.chunkListeners.push(o.onChunk),(o.priority??0)>i.priority&&(i.priority=o.priority??0,this.sortQueue()),new Promise((a,l)=>{i.resolvers.push(a),i.rejecters.push(l)});this.stats.misses++;const p={key:e,input:n,priority:o.priority??0,controller:new AbortController,chunkListeners:o.onChunk===void 0?[]:[o.onChunk],resolvers:[],rejecters:[],started:!1},d=new Promise((a,l)=>{p.resolvers.push(a),p.rejecters.push(l)});return this.queue.push(p),this.sortQueue(),this.pump(),d}cancel(e){const n=this.queue.findIndex(s=>s.key===e);if(n!==-1){const[s]=this.queue.splice(n,1);return this.finishCancelled(s),!0}const o=this.inflight.get(e);return o!==void 0?(o.controller.abort(),!0):!1}cancelWhere(e){const n=[...this.queue.map(o=>o.key),...this.inflight.keys()].filter(e);for(const o of n)this.cancel(o);return n.length}cancelAll(){return this.cancelWhere(()=>!0)}clearCache(){this.cache.clear()}clearKey(e){return this.cache.delete(e)}prime(e,n){this.remember(e,n)}sortQueue(){this.queue.sort((e,n)=>n.priority-e.priority)}remember(e,n){for(this.cache.delete(e),this.cache.set(e,n);this.cache.size>this.cacheSize;){const o=this.cache.keys().next().value;if(o===void 0)break;this.cache.delete(o)}}finishCancelled(e){this.stats.cancelled++;for(const n of e.rejecters)n(new ue)}pump(){for(;this.inflight.size<this.concurrency&&this.queue.length>0;){const e=this.queue.shift();if(e===void 0)break;e.started=!0,this.inflight.set(e.key,e),this.runJob(e)}}async runJob(e){try{const n=this.provider.complete(e.input,{signal:e.controller.signal}),o=await fe(n,s=>{if(!e.controller.signal.aborted)for(const i of e.chunkListeners)i(s)},e.controller.signal);if(e.controller.signal.aborted)throw new ue;this.remember(e.key,o),this.stats.completed++;for(const s of e.resolvers)s(o)}catch(n){if(Y(n)||e.controller.signal.aborted){this.stats.cancelled++;for(const o of e.rejecters)o(new ue)}else{this.stats.errors++;for(const o of e.rejecters)o(n)}}finally{this.inflight.delete(e.key),this.pump()}}}function J(t){var e;return t.kind===R.Custom&&((e=t.data)==null?void 0:e.kind)==="ai-cell"}function pe(t,e={}){return{kind:R.Custom,allowOverlay:!0,copyData:"",...e.cell,data:{kind:"ai-cell",prompt:t,status:"idle",...e.model===void 0?{}:{model:e.model},...e.difficulty===void 0?{}:{difficulty:e.difficulty}}}}function _(t,e){const n={...t.data,...e};return{...t,data:n,copyData:n.result??""}}const At={display:"flex",flexDirection:"column",gap:6,padding:8,minWidth:280,fontFamily:"var(--gdg-font-family)",color:"var(--gdg-text-dark)"},Lt={font:"inherit",fontSize:"var(--gdg-editor-font-size)",color:"inherit",background:"var(--gdg-bg-cell)",border:"1px solid var(--gdg-border-color)",borderRadius:4,padding:6,resize:"vertical",minHeight:48},Ot={fontSize:"var(--gdg-editor-font-size)",whiteSpace:"pre-wrap",maxHeight:160,overflow:"auto",padding:"4px 0"},Nt={alignSelf:"flex-start",font:"inherit",fontSize:12,padding:"4px 10px",borderRadius:4,border:"1px solid var(--gdg-border-color)",background:"var(--gdg-bg-header)",color:"var(--gdg-text-dark)",cursor:"pointer"},Pt={display:"flex",gap:8,alignItems:"center",fontSize:11,color:"var(--gdg-text-medium)"},ke={font:"inherit",fontSize:12,color:"var(--gdg-text-dark)",background:"var(--gdg-bg-cell)",border:"1px solid var(--gdg-border-color)",borderRadius:4,padding:"2px 4px"},Dt=({value:t,onChange:e})=>{const{prompt:n,result:o,status:s,error:i,model:p,difficulty:d}=t.data,a=l=>e(_({...t,data:{...t.data,...l}},{result:void 0,status:"idle",error:void 0}));return r.createElement("div",{style:At,className:"gdg-ai-cell-editor"},r.createElement("div",{style:Pt},r.createElement("label",null,"Difficulty"," ",r.createElement("select",{style:ke,value:d??"",onChange:l=>a({difficulty:l.target.value===""?void 0:l.target.value})},r.createElement("option",{value:""},"auto"),r.createElement("option",{value:"low"},"low"),r.createElement("option",{value:"medium"},"medium"),r.createElement("option",{value:"high"},"high"))),r.createElement("label",{style:{flex:1}},"Model"," ",r.createElement("input",{style:{...ke,width:"60%"},placeholder:"provider default",value:p??"",onChange:l=>a({model:l.target.value===""?void 0:l.target.value})}))),r.createElement("label",{style:{fontSize:11,color:"var(--gdg-text-medium)"}},"Prompt — use ","{Column Title}"," to reference this row"),r.createElement("textarea",{style:Lt,value:n,autoFocus:!0,onChange:l=>e(_({...t,data:{...t.data,prompt:l.target.value}},{result:void 0,status:"idle",error:void 0}))}),r.createElement("div",{style:Ot,"data-status":s??"idle"},s==="error"?`⚠ ${i??"Generation failed"}`:o??(s==="pending"||s==="streaming"?"Generating…":"No result yet")),r.createElement("button",{type:"button",style:Nt,onClick:()=>e(_(t,{result:void 0,status:"idle",error:void 0}))},"Regenerate"))},Se=900,It={kind:R.Custom,isMatch:t=>{var e;return((e=t.data)==null?void 0:e.kind)==="ai-cell"},draw:(t,e)=>{const{ctx:n,theme:o,rect:s,requestAnimationFrame:i,frameTime:p}=t,{prompt:d,result:a,status:l="idle",error:u}=e.data;if(l==="done"&&a!==void 0)return we(t,a,e.contentAlign),!0;if(l==="streaming"&&a!==void 0&&a!=="")return we(t,a,e.contentAlign),i(),!0;if(l==="pending"||l==="streaming"){const g=1+Math.floor(p%Se/(Se/3))%3;return n.fillStyle=o.textLight,n.font=o.baseFontFull,n.textBaseline="middle",n.fillText("✦ "+".".repeat(g),s.x+o.cellHorizontalPadding,s.y+s.height/2),i(),!0}return l==="error"?(n.fillStyle=o.textMedium,n.font=o.baseFontFull,n.textBaseline="middle",n.fillText(`⚠ ${u??"error"}`,s.x+o.cellHorizontalPadding,s.y+s.height/2),!0):(n.fillStyle=o.textLight,n.font=o.baseFontFull,n.textBaseline="middle",n.fillText(d===""?"✦ (empty prompt)":`✦ ${d}`,s.x+o.cellHorizontalPadding,s.y+s.height/2),!0)},measure:(t,e,n)=>{const o=e.data.result??e.data.prompt;return dt(o,t,n.baseFontFull).width+n.cellHorizontalPadding*2},provideEditor:()=>({editor:t=>r.createElement(Dt,{value:t.value,onChange:t.onChange}),disablePadding:!0}),onPaste:(t,e)=>({...e,prompt:t,result:void 0,status:"idle",error:void 0}),onDelete:t=>_(t,{result:void 0,status:"idle",error:void 0})};function Ee(t,e,n){return t.replace(/\{([^{}]+)\}/g,(o,s)=>{const i=s.trim().toLowerCase(),p=e.findIndex(d=>d.title.toLowerCase()===i||d.id!==void 0&&d.id.toLowerCase()===i);return p===-1||n[p]===void 0?o:ae(n[p])})}function rt(t){const{provider:e,columns:n,getCellContent:o,gridRef:s,autoRun:i=!0,concurrency:p,system:d,onCellsEdited:a,defaultDifficulty:l="medium"}=t,u=r.useRef(a);u.current=a;const g=t.scheduler,c=r.useMemo(()=>{if(g!==void 0)return g;if(e===void 0)throw new Error("useAiCells needs a provider or a scheduler");return new Mt({provider:e,concurrency:p})},[g,e,p]),[,C]=r.useReducer(v=>v+1,0),f=r.useRef(new Map),m=r.useRef(new Map),y=r.useRef(new Set),k=r.useRef(new Set),T=r.useRef(new Map),x=r.useRef(void 0),P=r.useRef(new Map),S=r.useCallback(v=>{const h=s==null?void 0:s.current;h!=null?h.updateCells([{cell:v}]):C()},[s]),N=r.useCallback(v=>n.map((h,E)=>o([E,v])),[n,o]),b=r.useCallback((v,h,E)=>`${v[0]}:${v[1]}:${it(`${h}\0${E.data.model??""}\0${E.data.difficulty??l}`)}`,[l]),A=r.useCallback(v=>{const h=x.current;return h===void 0?!0:v[1]>=h.y&&v[1]<h.y+h.height},[]),D=r.useCallback((v,h,E,w)=>{P.current.set(h,v),c.request(h,{prompt:E,system:d,feature:"ai-cell",context:{location:v},difficulty:w.data.difficulty??l,...w.data.model===void 0?{}:{model:w.data.model}},{priority:A(v)?1:0,onChunk:O=>{f.current.set(h,O),S(v)}}).then(O=>{f.current.delete(h),m.current.delete(h),k.current.delete(h),T.current.set(h,O);const $=o(v);if(J($)&&u.current!==void 0){const z=_($,{result:O,status:"done",error:void 0});u.current([{location:v,value:z}])}S(v)}).catch(O=>{f.current.delete(h),k.current.delete(h),Y(O)||(m.current.set(h,O instanceof Error?O.message:String(O)),S(v))})},[c,d,A,S,o,l]),I=r.useCallback(v=>{const h=o(v);if(!J(h))return h;if(h.data.prompt.trim()==="")return _(h,{status:"idle"});const E=Ee(h.data.prompt,n,N(v[1])),w=b(v,E,h),O=T.current.get(w);if(O!==void 0)if(h.data.result===O)T.current.delete(w);else return _(h,{result:O,status:"done",error:void 0});if(h.data.status==="done"&&h.data.result!==void 0&&!k.current.has(w))return c.get(w)!==h.data.result&&c.prime(w,h.data.result),h;const $=c.get(w);if($!==void 0)return _(h,{result:$,status:"done",error:void 0});const z=m.current.get(w);if(z!==void 0)return _(h,{status:"error",error:z,result:void 0});const G=f.current.get(w);return G!==void 0?_(h,{status:"streaming",result:G}):c.isPending(w)?_(h,{status:"pending",result:void 0}):(i||y.current.has(w))&&A(v)?(y.current.delete(w),D(v,w,E,h),_(h,{status:"pending",result:void 0})):_(h,{status:"idle"})},[o,n,N,b,c,i,A,D]),B=r.useCallback(v=>{x.current=v,c.cancelWhere(h=>{const E=P.current.get(h);return E!==void 0&&!(E[1]>=v.y&&E[1]<v.y+v.height)})},[c]),V=r.useCallback(v=>{const h=o(v);if(J(h))return Ee(h.data.prompt,n,N(v[1]))},[o,n,N]),M=r.useCallback(v=>{const h=o(v),E=V(v);if(E===void 0||!J(h))return;const w=b(v,E,h);c.has(w)||c.isPending(w)||(y.current.add(w),m.current.delete(w),D(v,w,E,h),S(v))},[o,V,b,c,D,S]),L=r.useCallback(v=>{const h=o(v),E=V(v);if(E===void 0||!J(h))return;const w=b(v,E,h);c.cancel(w),c.clearKey(w),m.current.delete(w),f.current.delete(w),k.current.add(w),y.current.add(w),D(v,w,E,h),S(v)},[o,V,b,c,D,S]),q=r.useMemo(()=>[It],[]);return{getCellContent:I,onVisibleRegionChanged:B,customRenderers:q,scheduler:c,regenerate:L,run:M,resolvePrompt:V}}function Tt(t){const[e,n]=r.useState(""),[o,s]=r.useState(!1),i=ct({...t,query:e}),p=r.useMemo(()=>{const u=[];for(const g of i.matchedRows)for(const c of i.matchedCells.get(g)??[0])u.push([c,g]);return u},[i.matchedRows,i.matchedCells]),d=r.useCallback(u=>n(u),[]),a=r.useCallback(()=>s(!0),[]),l=r.useCallback(()=>s(!1),[]);return{searchValue:e,onSearchValueChange:d,searchResults:p,showSearch:o,onSearchClose:l,setSearchValue:n,openSearch:a,closeSearch:l,status:i.status,spec:i.spec,error:i.error,matchedRows:i.matchedRows}}function $t(t){const{source:e,toCell:n,onEdited:o,flushIntervalMs:s=50,autoStart:i=!0,initialRows:p}=t,[d,a]=r.useState(p??[]),[l,u]=r.useState("idle"),[g,c]=r.useState(void 0),C=r.useRef([...p??[]]),f=r.useRef(void 0),m=r.useRef([]),y=r.useRef(void 0),[k,T]=r.useState(i?1:0),x=r.useRef(e);x.current=e;const P=r.useRef(o);P.current=o;const S=r.useCallback(()=>{y.current=void 0,m.current.length!==0&&(C.current.push(...m.current),m.current=[],a([...C.current]))},[]),N=r.useCallback(()=>{y.current===void 0&&(y.current=setTimeout(S,s))},[S,s]),b=r.useCallback(()=>{var M;(M=f.current)==null||M.abort(),f.current=void 0,y.current!==void 0&&clearTimeout(y.current),S(),u(L=>L==="streaming"?"cancelled":L)},[S]),A=r.useCallback(()=>{var M;(M=f.current)==null||M.abort(),f.current=void 0,y.current!==void 0&&clearTimeout(y.current),y.current=void 0,m.current=[],C.current=[],a([]),u("idle"),c(void 0)},[]),D=r.useCallback(()=>{A(),T(M=>M+1)},[A]);r.useEffect(()=>{if(k===0)return;const M=new AbortController;return f.current=M,u("streaming"),c(void 0),(async()=>{try{for await(const L of x.current(M.signal)){if(M.signal.aborted)break;Array.isArray(L)?m.current.push(...L):m.current.push(L),N()}if(M.signal.aborted)return;y.current!==void 0&&clearTimeout(y.current),S(),u("done")}catch(L){if(M.signal.aborted||Y(L))return;y.current!==void 0&&clearTimeout(y.current),S(),c(L instanceof Error?L.message:String(L)),u("error")}finally{f.current===M&&(f.current=void 0)}})(),()=>{M.abort()}},[k,N,S]);const I=r.useCallback(([M,L])=>{const q=C.current[L];return q===void 0?{kind:"loading",allowOverlay:!1}:n(q,M,L)},[n]),B=r.useCallback(M=>{const L=P.current;if(L===void 0)return!0;let q=!1;const v=[];for(const h of M){const[E,w]=h.location,O=C.current[w];if(O===void 0)continue;const $=L(O,E,h.value,w),z=G=>{G!==void 0&&(C.current[w]=G,q=!0)};$ instanceof Promise?v.push($.then(G=>{G!==void 0&&(C.current[w]=G,a([...C.current]))})):z($)}return q&&a([...C.current]),!0},[]),V=r.useCallback(M=>{C.current.push(...M),a([...C.current])},[]);return{rows:d.length,data:d,getCellContent:I,onCellsEdited:B,status:l,error:g,start:D,stop:b,reset:A,appendRows:V}}const de={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90,hundred:100,thousand:1e3,million:1e6,billion:1e9},Ft={k:1e3,m:1e6,b:1e9,bn:1e9,mm:1e6};function _t(t){let e=t.trim().toLowerCase();if(e==="")return;const n=Number(e);if(!Number.isNaN(n)&&/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/.test(e))return n;let o=!1;/^\(.*\)$/.test(e)&&(o=!0,e=e.slice(1,-1).trim()),e=e.replace(/^[-−–]/,d=>(o=!o||d==="","")),e=e.replace(/^\+/,""),e=e.replace(/^[$€£¥₹]\s*/,"").replace(/\s*(usd|eur|gbp|%|percent)$/,""),e=e.replace(/,/g,"").replace(/\s+/g," ").trim();const s=/^(\d+\.?\d*|\.\d+)\s*(k|m|b|bn|mm|thousand|million|billion)$/.exec(e);if(s!==null){const d=Ft[s[2]]??de[s[2]],a=Number(s[1])*d;return o?-a:a}const i=Number(e);if(!Number.isNaN(i)&&e!=="")return o?-i:i;const p=e.split(/[\s-]+/);if(p.length>0&&p.every(d=>d in de)){let d=0,a=0;for(const u of p){const g=de[u];g===100?a=Math.max(a,1)*100:g>=1e3?(d+=Math.max(a,1)*g,a=0):a+=g}const l=d+a;return o?-l:l}}const Gt=new Set(["true","yes","y","1","on","✓","✔","x","checked","done","t"]),Vt=new Set(["false","no","n","0","off","✗","✘","unchecked","f","-","—"]);function qt(t){const e=t.trim().toLowerCase();if(Gt.has(e))return!0;if(Vt.has(e))return!1}function me(t){const e=t.trim();if(e!==""){if(/^[a-z][a-z0-9+.-]*:\/\//i.test(e)||/^(mailto|tel):/i.test(e))return e;if(/^[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(e))return`https://${e}`;if(/^[\w.+-]+@[\w-]+\.[a-z]{2,}$/i.test(e))return`mailto:${e}`}}function le(t,e){switch(e.kind){case R.Text:{const n=t.trim();return{...e,data:n,displayData:n}}case R.Markdown:case R.RowID:return{...e,data:t.trim()};case R.Number:{const n=_t(t);return n===void 0?void 0:{...e,data:n,displayData:String(n)}}case R.Boolean:{const n=qt(t);return n===void 0?void 0:{...e,data:n}}case R.Uri:{const n=me(t);return n===void 0?void 0:{...e,data:n,displayData:n}}case R.Bubble:{const n=t.split(/[,;\n]+/).map(o=>o.trim()).filter(o=>o!=="");return{...e,data:n}}case R.Image:{const n=t.split(/[\s,;]+/).map(o=>o.trim()).filter(o=>me(o)!==void 0).map(o=>me(o));return n.length===0?void 0:{...e,data:n}}default:return}}const zt={[R.Number]:"a plain number (digits, optional decimal point, no units)",[R.Boolean]:"true or false",[R.Uri]:"an absolute URL",[R.Bubble]:"a comma-separated list of short tags",[R.Image]:"a comma-separated list of image URLs",[R.Text]:"plain text"};function Ut(t){return["Convert each pasted text into the value the column expects. Interpret dates, numbers written as words, currencies, and yes/no phrasing.",'Reply with ONLY a JSON array of objects {"i": <index>, "value": <string>} — omit entries you cannot convert.',...t.map((n,o)=>`${o}. column "${n.column}" expects ${zt[n.target.kind]??"plain text"}; pasted text: ${JSON.stringify(n.text)}`)].join(`
`)}function Bt(t){const{provider:e,columns:n,getCellContent:o,onCellsEdited:s,batchSize:i=50}=t,[p,d]=r.useState(0),[a,l]=r.useState(void 0),u=r.useRef(s);u.current=s;const g=r.useCallback((f,m)=>le(f,m),[]),c=r.useCallback(async f=>{if(!(e===void 0||f.length===0)){d(m=>m+f.length);try{const m=new AbortController,y=await fe(e.complete({prompt:Ut(f),system:"You convert pasted spreadsheet text into typed cell values. Reply with JSON only.",feature:"smart-paste",difficulty:"low"},{signal:m.signal}),void 0,m.signal),k=Ze(y),T=[];if(Array.isArray(k))for(const x of k){if(x===null||typeof x!="object")continue;const P=f[Number(x.i)];if(P===void 0)continue;const S=le(String(x.value??""),P.target);S!==void 0&&T.push({location:P.location,value:S})}T.length>0&&u.current(T),l(void 0)}catch(m){Y(m)||l(m instanceof Error?m.message:String(m))}finally{d(m=>Math.max(0,m-f.length))}}},[e]),C=r.useCallback((f,m)=>{if(e===void 0)return!0;const y=[];m.forEach((k,T)=>{k.forEach((x,P)=>{var b;const S=[f[0]+P,f[1]+T];if(S[0]>=n.length)return;const N=o(S);x.trim()===""||N.kind===R.Text||N.kind===R.Custom||le(x,N)===void 0&&y.push({index:y.length,location:S,text:x,target:N,column:((b=n[S[0]])==null?void 0:b.title)??String(S[0])})})});for(let k=0;k<y.length;k+=i)c(y.slice(k,k+i));return!0},[e,n,o,i,c]);return{coercePasteValue:g,onPaste:C,pending:p,lastError:a}}function Re(t){return t===void 0?[]:t.toArray()}function Kt(t,e,n){const o=new Set(Re(t.rows)),s=new Set(Re(t.columns)),i=t.current===void 0?[]:[t.current.range,...t.current.rangeStack];for(const a of i){for(let l=a.y;l<a.y+a.height;l++)o.add(l);for(let l=a.x;l<a.x+a.width;l++)s.add(l)}if(o.size===0&&s.size>0)for(let a=0;a<e;a++)o.add(a);const p=[...o].filter(a=>a>=0&&a<e).sort((a,l)=>a-l),d=[...s].filter(a=>a>=0&&a<n).sort((a,l)=>a-l);return{rows:p,columns:t.rows.length>0&&d.length===0?void 0:d.length>0?d:void 0}}function Ht(t,e,n,o){const s=n.map(i=>`"${e[i].title}"`).join(", ");return[`Instruction: ${JSON.stringify(t)}`,`Editable columns: ${s}. Only these may be changed.`,"Rows (JSON, one per line):",...o.map(i=>JSON.stringify({row:i.row,...i.values})),'Reply with ONLY a JSON array of changes: [{"row": <row>, "column": "<column title>", "value": "<new value>"}]. Omit rows that need no change.'].join(`
`)}function Wt(t){const{provider:e,columns:n,rows:o,getCellContent:s,onCellsEdited:i,maxRows:p=200,highlightColor:d="rgba(79, 93, 255, 0.25)"}=t,[a,l]=r.useState("idle"),[u,g]=r.useState(void 0),[c,C]=r.useState(void 0),f=r.useRef(void 0),m=r.useCallback(async(x,P)=>{var D;const S="rows"in P&&Array.isArray(P.rows)?P:Kt(P,o,n.length),N=S.rows,b=S.columns??n.map((I,B)=>B);if((D=f.current)==null||D.abort(),N.length===0||b.length===0){g("Select the rows or cells to edit first"),l("error");return}if(N.length>p){g(`Too many rows selected (${N.length}); the limit is ${p}`),l("error");return}const A=new AbortController;f.current=A,l("proposing"),g(void 0),C(void 0);try{const I=N.map(E=>{const w={};for(const O of b)w[n[O].title]=ae(s([O,E]));return{row:E,values:w}}),B=await fe(e.complete({prompt:Ht(x,n,b,I),system:"You edit spreadsheet rows exactly as instructed and reply with JSON only.",feature:"bulk-edit",difficulty:"high"},{signal:A.signal}),void 0,A.signal);if(A.signal.aborted)return;const V=Ze(B),M=new Set(N),L=[],q=new Set;let v=0;for(const E of Array.isArray(V)?V:[]){if(E===null||typeof E!="object"){v++;continue}const w=Number(E.row),O=String(E.column??"").trim().toLowerCase(),$=b.find(ve=>{var ye;return n[ve].title.toLowerCase()===O||((ye=n[ve].id)==null?void 0:ye.toLowerCase())===O});if(!M.has(w)||$===void 0||q.has(`${$}:${w}`)){v++;continue}const z=[$,w],G=s(z),Z=le(String(E.value??""),G);if(Z===void 0){v++;continue}ae(Z)!==ae(G)&&(q.add(`${$}:${w}`),L.push({location:z,value:Z}))}const h={instruction:x,edits:L,rejected:v};return C(h),l("proposed"),h}catch(I){if(Y(I)||A.signal.aborted)return;g(I instanceof Error?I.message:String(I)),l("error");return}},[e,n,o,s,p]),y=r.useCallback(()=>{c!==void 0&&(c.edits.length>0&&i(c.edits),C(void 0),l("idle"))},[c,i]),k=r.useCallback(()=>{var x;(x=f.current)==null||x.abort(),C(void 0),l("idle"),g(void 0)},[]),T=r.useMemo(()=>{if(!(c===void 0||c.edits.length===0))return c.edits.map(x=>({color:d,range:{x:x.location[0],y:x.location[1],width:1,height:1},style:"solid"}))},[c,d]);return{status:a,error:u,proposal:c,propose:m,apply:y,discard:k,highlightRegions:T}}const an={title:"Extra Packages/AI",parameters:{layout:"fullscreen"}},he=["Engineering","Sales","Ops","Design"],xe=["Ada","Grace","Linus","Mia","Noor","Ken","Sara","Yuki","Omar","Lea"],Me=["Lovelace","Hopper","Torvalds","Chen","Haddad","Sato","Okafor","Ruiz","Novak","Berg"];function ce(t){return Array.from({length:t},(e,n)=>({name:`${xe[n%xe.length]} ${Me[n*7%Me.length]}`,dept:he[n*3%he.length],age:22+n*13%40,notes:["Ships weekly","Owns the roadmap","Mentors juniors","Runs on-call","Leads hiring"][n%5]}))}const F=t=>({kind:R.Text,data:t,displayData:t,allowOverlay:!0}),X=t=>({kind:R.Number,data:t,displayData:String(t),allowOverlay:!0}),H=({title:t,blurb:e,children:n,aside:o})=>r.createElement("div",{style:{padding:24,fontFamily:"Inter, system-ui, sans-serif",color:"#1a1a1a",background:"#f6f7fb",minHeight:"100vh",boxSizing:"border-box"}},r.createElement("h2",{style:{margin:"0 0 4px"}},t),r.createElement("p",{style:{margin:"0 0 12px",color:"#555",maxWidth:720}},e),o!==void 0&&r.createElement("div",{style:{margin:"0 0 12px",fontSize:13}},o),r.createElement("div",{style:{width:"100%",height:460,background:"white",borderRadius:8,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.12)"}},n)),ee=()=>{const t=r.useMemo(()=>ce(40),[]),e=r.useMemo(()=>[{title:"Name",id:"name",width:160},{title:"Dept",id:"dept",width:120},{title:"Notes",id:"notes",width:180},{title:"Intro (AI)",id:"intro",width:420}],[]),n=r.useMemo(()=>W(l=>{var c,C,f,m;return`${((c=/for (.+?):/.exec(l.prompt))==null?void 0:c[1])??"them"} is a ${((C=/in ([A-Za-z]+)/.exec(l.prompt))==null?void 0:C[1])??"team"} teammate who ${((m=(f=/who (.+)$/.exec(l.prompt))==null?void 0:f[1])==null?void 0:m.toLowerCase())??"does great work"}.`.split(" ").map((y,k)=>k===0?y:` ${y}`)},{delayMs:60}),[]),[o,s]=r.useState(()=>new Map),i=r.useCallback(([l,u])=>{const g=t[u];return l===0?F(g.name):l===1?F(g.dept):l===2?F(g.notes):o.get(u)??pe("Write one friendly sentence for {Name}: they work in {Dept} and are someone who {Notes}")},[t,o]),p=r.useCallback(l=>(s(u=>{const g=new Map(u);for(const c of l)c.location[0]===3&&g.set(c.location[1],c.value);return g}),!0),[]),d=r.useRef(null),a=rt({provider:n,columns:e,getCellContent:i,gridRef:d,concurrency:3,onCellsEdited:p});return r.createElement(H,{title:"AI cells — =AI() formulas",blurb:"The last column is an AI cell whose prompt references the row's other cells. Cells generate as they scroll into view, stream their text, cache by prompt, and cancel when scrolled away. Finished results are handed to onCellsEdited so your app can persist them; double-click a cell to edit the prompt or regenerate.",aside:r.createElement("span",null,"saved results: ",r.createElement("b",null,o.size)," · model calls: ",r.createElement("b",null,n.calls.length),r.createElement("button",{style:{marginLeft:12},onClick:()=>s(new Map)},"Forget saved results"))},r.createElement(K,{ref:d,columns:e,rows:t.length,getCellContent:a.getCellContent,customRenderers:a.customRenderers,onVisibleRegionChanged:a.onVisibleRegionChanged,onCellsEdited:p,rowMarkers:"number",smoothScrollY:!0}))};function ot(t){var i,p;const e=((p=(i=/Query: "(.+?)"/.exec(t.prompt))==null?void 0:i[1])==null?void 0:p.toLowerCase())??"",n=[];for(const d of he)e.includes(d.toLowerCase().slice(0,5))&&n.push({column:"Dept",op:"eq",value:d});const o=/(?:over|above|older than) (\d+)/.exec(e);o&&n.push({column:"Age",op:"gt",value:Number(o[1])});const s=/(?:under|below|younger than) (\d+)/.exec(e);return s&&n.push({column:"Age",op:"lt",value:Number(s[1])}),e.includes("mentor")&&n.push({column:"Notes",op:"contains",value:"mentor"}),n.length===0&&n.push({column:"Name",op:"contains",value:e.split(" ")[0]??e}),JSON.stringify({conjunction:"and",clauses:n})}const ie=[{title:"Name",width:180},{title:"Dept",width:130},{title:"Age",width:80},{title:"Notes",width:200}],st=t=>([e,n])=>{const o=t[n];return e===0?F(o.name):e===1?F(o.dept):e===2?X(o.age):F(o.notes)},te=()=>{const t=r.useMemo(()=>ce(300),[]),e=r.useMemo(()=>st(t),[t]),n=r.useMemo(()=>W(ot,{delayMs:400}),[]),o=Tt({provider:n,columns:ie,rows:t.length,getCellContent:e});return r.createElement(H,{title:"Natural-language search",blurb:'Type into the box (or press Ctrl/⌘+F in the grid): literal matches highlight instantly, then the model compiles the query into a filter — try "engineers over 40" or "sales who mentor". The model only sees column names and a few sample values, never the table.',aside:r.createElement("span",null,r.createElement("input",{value:o.searchValue??"",onChange:s=>o.setSearchValue(s.target.value),placeholder:'e.g. "engineers over 40"',style:{padding:6,width:280,marginRight:12}}),"status: ",r.createElement("b",null,o.status)," · matches: ",r.createElement("b",null,o.matchedRows.length),o.spec!==void 0&&r.createElement("code",{style:{marginLeft:12,fontSize:12}},JSON.stringify(o.spec.clauses)))},r.createElement(K,{columns:ie,rows:t.length,getCellContent:e,searchValue:o.searchValue,onSearchValueChange:o.onSearchValueChange,searchResults:o.searchResults,showSearch:o.showSearch,onSearchClose:o.onSearchClose,getCellsForSelection:!0,rowMarkers:"number"}))},ne=()=>{const t=r.useMemo(()=>ce(300),[]),e=r.useMemo(()=>st(t),[t]),n=r.useMemo(()=>W(ot,{delayMs:400}),[]),[o,s]=r.useState(""),i=ut({provider:n,columns:ie,rows:t.length,getCellContent:e,query:o});return r.createElement(H,{title:"Natural-language filter",blurb:'Rows that do not match the query are hidden — the same compiled filter as search, applied as a row permutation like useColumnSort. Try "design under 30".',aside:r.createElement("span",null,r.createElement("input",{value:o,onChange:p=>s(p.target.value),placeholder:"filter rows…",style:{padding:6,width:280,marginRight:12}}),"status: ",r.createElement("b",null,i.status)," · showing ",r.createElement("b",null,i.rows)," of ",t.length)},r.createElement(K,{columns:ie,rows:i.rows,getCellContent:i.getCellContent,rowMarkers:"number"}))};async function*Jt(t){const e=["Acme","Globex","Initech","Umbrella","Hooli","Stark","Wayne","Wonka","Tyrell","Cyberdyne","Aperture","Vandelay"],n=["Hiring a VP Sales","Raised Series B","Launched pricing page","Opened EU office","Sponsoring a conference"];for(let o=0;o<e.length;o++){if(await new Promise(s=>setTimeout(s,350)),t.aborted)return;yield{company:e[o],signal:n[o%n.length],confidence:60+o*17%40}}}const re=()=>{const t=r.useMemo(()=>[{title:"Company",width:160},{title:"Signal",width:260},{title:"Confidence",width:120}],[]),e=r.useCallback((o,s)=>s===0?F(o.company):s===1?F(o.signal):X(o.confidence),[]),n=$t({source:Jt,toCell:e,onEdited:(o,s,i)=>s===2&&i.kind===R.Number?{...o,confidence:i.data??o.confidence}:s===1&&i.kind===R.Text?{...o,signal:i.data}:void 0});return r.createElement(H,{title:"Agent-fed data source",blurb:"The grid is the agent's output surface: rows stream in as a (simulated) research agent finds them, the grid stays fully interactive, and your edits flow back through onEdited so the agent can react.",aside:r.createElement("span",null,"status: ",r.createElement("b",null,n.status)," · rows: ",r.createElement("b",null,n.rows),r.createElement("button",{onClick:n.start,style:{marginLeft:12}},"Restart"),r.createElement("button",{onClick:n.stop,style:{marginLeft:6}},"Stop"),n.error!==void 0&&r.createElement("span",{style:{color:"crimson",marginLeft:12}},n.error))},r.createElement(K,{columns:t,rows:n.rows,getCellContent:n.getCellContent,onCellsEdited:n.onCellsEdited,rowMarkers:"number"}))},jt={ten:"10","a dozen":"12","half a hundred":"50",yep:"true",nope:"false",affirmative:"true",negative:"false","next tuesday":"2026-09-08"},oe=()=>{const t=r.useMemo(()=>[{title:"Item",width:160},{title:"Qty",width:100},{title:"In stock",width:100},{title:"Link",width:260}],[]),[e,n]=r.useState(()=>Array.from({length:12},(d,a)=>({item:`SKU-${100+a}`,qty:a*3,stock:a%2===0,link:""}))),o=r.useCallback(([d,a])=>{const l=e[a];return d===0?F(l.item):d===1?X(l.qty):d===2?{kind:R.Boolean,data:l.stock,allowOverlay:!1}:{kind:R.Uri,data:l.link,displayData:l.link,allowOverlay:!0}},[e]),s=r.useCallback(d=>(n(a=>{const l=a.map(u=>({...u}));for(const u of d){const g=l[u.location[1]];if(g===void 0)continue;const c=u.value;u.location[0]===1&&c.kind===R.Number?g.qty=c.data??0:u.location[0]===2&&c.kind===R.Boolean?g.stock=c.data===!0:u.location[0]===3&&c.kind===R.Uri?g.link=c.data:u.location[0]===0&&c.kind===R.Text&&(g.item=c.data)}return l}),!0),[]),i=r.useMemo(()=>W(d=>{const a=[];for(const l of d.prompt.matchAll(/^(\d+)\. .*pasted text: "(.+)"$/gm)){const u=jt[l[2].toLowerCase()];u!==void 0&&a.push({i:Number(l[1]),value:u})}return JSON.stringify(a)},{delayMs:500}),[]),p=Bt({provider:i,columns:t,getCellContent:o,onCellsEdited:s});return r.createElement(H,{title:"Smart paste",blurb:'Copy some text and paste it into the Qty / In stock / Link columns: "$1,200", "twelve", "yes", "example.com" are coerced instantly; things like "a dozen" or "affirmative" go to the model in one batched call and are corrected a moment later.',aside:r.createElement("span",null,"pending model corrections: ",r.createElement("b",null,p.pending),p.lastError!==void 0&&r.createElement("span",{style:{color:"crimson"}}," · ",p.lastError))},r.createElement(K,{columns:t,rows:e.length,getCellContent:o,onCellsEdited:s,coercePasteValue:p.coercePasteValue,onPaste:p.onPaste,getCellsForSelection:!0,rowMarkers:"number"}))},se=()=>{const t=r.useMemo(()=>[{title:"Order",width:140},{title:"Status",width:120},{title:"Qty",width:90},{title:"Customer",width:200}],[]),[e,n]=r.useState(()=>Array.from({length:15},(g,c)=>({order:`#${1e3+c}`,status:c%3===0?"shipped":"open",qty:1+c%6,customer:ce(15)[c].name}))),o=r.useCallback(([g,c])=>{const C=e[c];return g===0?F(C.order):g===1?F(C.status):g===2?X(C.qty):F(C.customer)},[e]),s=r.useCallback(g=>(n(c=>{const C=c.map(f=>({...f}));for(const f of g){const m=C[f.location[1]],y=f.value;m!==void 0&&(f.location[0]===1&&y.kind===R.Text&&(m.status=y.data),f.location[0]===2&&y.kind===R.Number&&(m.qty=y.data??m.qty),f.location[0]===3&&y.kind===R.Text&&(m.customer=y.data))}return C}),!0),[]),i=r.useMemo(()=>W(g=>{var m,y;const c=((y=(m=/Instruction: "(.+?)"/.exec(g.prompt))==null?void 0:m[1])==null?void 0:y.toLowerCase())??"",C=[...g.prompt.matchAll(/^\{"row":(\d+),(.*)\}$/gm)].map(k=>({row:Number(k[1]),json:JSON.parse(`{${k[2]}}`)})),f=[];for(const k of C)c.includes("ship")&&f.push({row:k.row,column:"Status",value:"shipped"}),c.includes("double")&&f.push({row:k.row,column:"Qty",value:String(Number(k.json.Qty)*2)}),c.includes("upper")&&f.push({row:k.row,column:"Customer",value:(k.json.Customer??"").toUpperCase()});return JSON.stringify(f)},{delayMs:600}),[]),[p,d]=r.useState({rows:Ce.empty(),columns:Ce.empty()}),[a,l]=r.useState("mark them as shipped"),u=Wt({provider:i,columns:t,rows:e.length,getCellContent:o,onCellsEdited:s});return r.createElement(H,{title:"Bulk edit in plain language",blurb:'Select some rows (click the row markers), type an instruction such as "mark them as shipped", "double the quantity", or "uppercase the customer", and propose. The model returns edits, the grid previews them as highlights, and nothing is written until you apply.',aside:r.createElement("span",null,r.createElement("input",{value:a,onChange:g=>l(g.target.value),style:{padding:6,width:260,marginRight:8}}),r.createElement("button",{onClick:()=>void u.propose(a,p),disabled:u.status==="proposing"},"Propose"),r.createElement("button",{onClick:u.apply,disabled:u.proposal===void 0,style:{marginLeft:6}},"Apply ",u.proposal!==void 0?`(${u.proposal.edits.length})`:""),r.createElement("button",{onClick:u.discard,disabled:u.proposal===void 0,style:{marginLeft:6}},"Discard"),r.createElement("span",{style:{marginLeft:12}},"status: ",r.createElement("b",null,u.status)),u.error!==void 0&&r.createElement("span",{style:{color:"crimson",marginLeft:12}},u.error))},r.createElement(K,{columns:t,rows:e.length,getCellContent:o,onCellsEdited:s,gridSelection:p,onGridSelectionChange:d,highlightRegions:u.highlightRegions,rowMarkers:"both",rowSelect:"multi"}))},Ae={anthropic:"claude-opus-5",openai:"gpt-5",codex:"gpt-5-codex",grok:"grok-4",openrouter:"openrouter/auto"},Le={anthropic:"claude-haiku-4-5",openai:"gpt-5-mini",codex:"gpt-5-codex",grok:"grok-4",openrouter:"openrouter/auto"};function Qt(t,e,n){const o={apiKey:e,model:n,dangerouslyAllowBrowser:!0};switch(t){case"anthropic":return ft(o);case"openai":return tt(o);case"codex":return yt(o);case"grok":return bt(o);case"openrouter":return Et({...o,site:{title:"tengrids Storybook"}})}}const j={padding:6,marginRight:8},Q=()=>{const[t,e]=r.useState("anthropic"),[n,o]=r.useState(""),[s,i]=r.useState(Ae.anthropic),[p,d]=r.useState(Le.anthropic),[a,l]=r.useState(void 0),[u,g]=r.useState(1.2),c=r.useMemo(()=>[{name:"Standing desk",cost:349,notes:"Bamboo top, dual motor"},{name:"Task chair",cost:189.5,notes:"Mesh back, lumbar support"},{name:"Monitor arm",cost:79,notes:"Fits 17–32 inch, gas spring"},{name:"Desk lamp",cost:42.25,notes:"Warm/cool dimming"},{name:"Cable tray",cost:24,notes:"Under-desk, steel"},{name:"Footrest",cost:31,notes:"Adjustable tilt"}],[]),C=r.useMemo(()=>[{title:"Product",id:"product",width:150},{title:"Cost",id:"cost",width:90},{title:"Notes",id:"notes",width:200},{title:`Cost × ${u} (AI)`,id:"scaled",width:150},{title:"Pitch (AI)",id:"pitch",width:360}],[u]),[f,m]=r.useState(()=>new Map),y=r.useCallback(([b,A])=>{const D=c[A];if(b===0)return F(D.name);if(b===1)return X(D.cost);if(b===2)return F(D.notes);const I=f.get(`${b}:${A}`);return I!==void 0?I:b===3?pe(`Multiply {Cost} by ${u}. Reply with only the resulting number, two decimals, no currency symbol.`,{model:p,difficulty:"low",cell:{contentAlign:"right"}}):pe("Write one punchy sales sentence for {Product} ({Notes}) priced at {Cost}.",{model:s,difficulty:"high"})},[c,f,u,p,s]),k=r.useCallback(b=>(m(A=>{const D=new Map(A);for(const I of b)D.set(`${I.location[0]}:${I.location[1]}`,I.value);return D}),!0),[]),T=r.useRef(null),x=r.useMemo(()=>W(()=>"(connect a provider above to generate)"),[]),P=r.useMemo(()=>a===void 0?x:xt({default:a.provider,models:{[p]:a.provider,[s]:a.provider}}),[a,x,p,s]),S=rt({provider:P,columns:C,getCellContent:y,gridRef:T,onCellsEdited:k,concurrency:2}),N=()=>{n.trim()!==""&&(m(new Map),l({provider:Qt(t,n.trim(),s),label:`${t} · ${s} / ${p}`}))};return r.createElement(H,{title:"Live providers — Claude, OpenAI/Codex, Grok, OpenRouter",blurb:"Paste a key for the vendor you choose (it stays in this page's memory only), then connect. The Cost × factor column reads each row's Cost cell, multiplies it, and prints the result in a new cell using the cheap model; the Pitch column uses the strong model. Double-click any AI cell to change its prompt, model, or difficulty. Browser-direct calls are for experimenting — production apps should route through their own backend.",aside:r.createElement("span",{style:{display:"inline-flex",flexWrap:"wrap",gap:6,alignItems:"center"}},r.createElement("select",{style:j,value:t,onChange:b=>{const A=b.target.value;e(A),i(Ae[A]),d(Le[A])}},r.createElement("option",{value:"anthropic"},"Claude (Anthropic)"),r.createElement("option",{value:"openai"},"OpenAI"),r.createElement("option",{value:"codex"},"Codex (OpenAI)"),r.createElement("option",{value:"grok"},"Grok (xAI)"),r.createElement("option",{value:"openrouter"},"OpenRouter")),r.createElement("input",{style:j,type:"password",placeholder:"API key",value:n,onChange:b=>o(b.target.value)}),r.createElement("input",{style:j,value:s,onChange:b=>i(b.target.value),title:"strong model"}),r.createElement("input",{style:j,value:p,onChange:b=>d(b.target.value),title:"cheap model"}),r.createElement("label",null,"factor"," ",r.createElement("input",{style:{...j,width:60},type:"number",step:"0.1",value:u,onChange:b=>{g(Number(b.target.value)||1),m(new Map)}})),r.createElement("button",{onClick:N,disabled:n.trim()===""},"Connect"),r.createElement("span",null,a===void 0?"not connected":`connected: ${a.label}`," · saved results: ",r.createElement("b",null,f.size)))},r.createElement(K,{ref:T,columns:C,rows:c.length,getCellContent:S.getCellContent,customRenderers:S.customRenderers,onVisibleRegionChanged:S.onVisibleRegionChanged,onCellsEdited:k,rowMarkers:"number"}))};var Oe,Ne,Pe;ee.parameters={...ee.parameters,docs:{...(Oe=ee.parameters)==null?void 0:Oe.docs,source:{originalSource:`() => {
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
}`,...(Pe=(Ne=ee.parameters)==null?void 0:Ne.docs)==null?void 0:Pe.source}}};var De,Ie,Te;te.parameters={...te.parameters,docs:{...(De=te.parameters)==null?void 0:De.docs,source:{originalSource:`() => {
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
}`,...(Te=(Ie=te.parameters)==null?void 0:Ie.docs)==null?void 0:Te.source}}};var $e,Fe,_e;ne.parameters={...ne.parameters,docs:{...($e=ne.parameters)==null?void 0:$e.docs,source:{originalSource:`() => {
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
}`,...(_e=(Fe=ne.parameters)==null?void 0:Fe.docs)==null?void 0:_e.source}}};var Ge,Ve,qe;re.parameters={...re.parameters,docs:{...(Ge=re.parameters)==null?void 0:Ge.docs,source:{originalSource:`() => {
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
}`,...(qe=(Ve=re.parameters)==null?void 0:Ve.docs)==null?void 0:qe.source}}};var ze,Ue,Be;oe.parameters={...oe.parameters,docs:{...(ze=oe.parameters)==null?void 0:ze.docs,source:{originalSource:`() => {
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
}`,...(Be=(Ue=oe.parameters)==null?void 0:Ue.docs)==null?void 0:Be.source}}};var Ke,He,We;se.parameters={...se.parameters,docs:{...(Ke=se.parameters)==null?void 0:Ke.docs,source:{originalSource:`() => {
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
}`,...(We=(He=se.parameters)==null?void 0:He.docs)==null?void 0:We.source}}};var Je,je,Qe,Ye,Xe;Q.parameters={...Q.parameters,docs:{...(Je=Q.parameters)==null?void 0:Je.docs,source:{originalSource:`() => {
  const [vendor, setVendor] = React.useState<Vendor>("anthropic");
  const [apiKey, setApiKey] = React.useState("");
  const [strongModel, setStrongModel] = React.useState(VENDOR_DEFAULT_MODEL.anthropic);
  const [cheapModel, setCheapModel] = React.useState(VENDOR_CHEAP_MODEL.anthropic);
  const [connected, setConnected] = React.useState<{
    provider: AiProvider;
    label: string;
  } | undefined>(undefined);
  const [factor, setFactor] = React.useState(1.2);
  const products = React.useMemo(() => [{
    name: "Standing desk",
    cost: 349,
    notes: "Bamboo top, dual motor"
  }, {
    name: "Task chair",
    cost: 189.5,
    notes: "Mesh back, lumbar support"
  }, {
    name: "Monitor arm",
    cost: 79,
    notes: "Fits 17–32 inch, gas spring"
  }, {
    name: "Desk lamp",
    cost: 42.25,
    notes: "Warm/cool dimming"
  }, {
    name: "Cable tray",
    cost: 24,
    notes: "Under-desk, steel"
  }, {
    name: "Footrest",
    cost: 31,
    notes: "Adjustable tilt"
  }], []);
  const columns = React.useMemo<GridColumn[]>(() => [{
    title: "Product",
    id: "product",
    width: 150
  }, {
    title: "Cost",
    id: "cost",
    width: 90
  }, {
    title: "Notes",
    id: "notes",
    width: 200
  }, {
    title: \`Cost × \${factor} (AI)\`,
    id: "scaled",
    width: 150
  }, {
    title: "Pitch (AI)",
    id: "pitch",
    width: 360
  }], [factor]);
  const [saved, setSaved] = React.useState<Map<string, GridCell>>(() => new Map());
  const getCellContent = React.useCallback(([col, row]: Item): GridCell => {
    const p = products[row];
    if (col === 0) return text(p.name);
    if (col === 1) return num(p.cost);
    if (col === 2) return text(p.notes);
    const stored = saved.get(\`\${col}:\${row}\`);
    if (stored !== undefined) return stored;
    if (col === 3) return aiCell(\`Multiply {Cost} by \${factor}. Reply with only the resulting number, two decimals, no currency symbol.\`, {
      model: cheapModel,
      difficulty: "low",
      cell: {
        contentAlign: "right"
      }
    });
    return aiCell("Write one punchy sales sentence for {Product} ({Notes}) priced at {Cost}.", {
      model: strongModel,
      difficulty: "high"
    });
  }, [products, saved, factor, cheapModel, strongModel]);
  const onCellsEdited = React.useCallback((edits: readonly {
    location: Item;
    value: GridCell;
  }[]) => {
    setSaved(prev => {
      const next = new Map(prev);
      for (const e of edits) next.set(\`\${e.location[0]}:\${e.location[1]}\`, e.value);
      return next;
    });
    return true;
  }, []);
  const gridRef = React.useRef<DataEditorRef | null>(null);
  const fallback = React.useMemo(() => createMockProvider(() => "(connect a provider above to generate)"), []);
  const provider = React.useMemo(() => {
    if (connected === undefined) return fallback;
    return createRoutingProvider({
      default: connected.provider,
      models: {
        [cheapModel]: connected.provider,
        [strongModel]: connected.provider
      }
    });
  }, [connected, fallback, cheapModel, strongModel]);
  const ai = useAiCells({
    provider,
    columns,
    getCellContent,
    gridRef,
    onCellsEdited,
    concurrency: 2
  });
  const connect = () => {
    if (apiKey.trim() === "") return;
    setSaved(new Map());
    setConnected({
      provider: makeVendorProvider(vendor, apiKey.trim(), strongModel),
      label: \`\${vendor} · \${strongModel} / \${cheapModel}\`
    });
  };
  return <Frame title="Live providers — Claude, OpenAI/Codex, Grok, OpenRouter" blurb="Paste a key for the vendor you choose (it stays in this page's memory only), then connect. The Cost × factor column reads each row's Cost cell, multiplies it, and prints the result in a new cell using the cheap model; the Pitch column uses the strong model. Double-click any AI cell to change its prompt, model, or difficulty. Browser-direct calls are for experimenting — production apps should route through their own backend." aside={<span style={{
    display: "inline-flex",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center"
  }}>
                    <select style={inputStyle} value={vendor} onChange={e => {
      const v = e.target.value as Vendor;
      setVendor(v);
      setStrongModel(VENDOR_DEFAULT_MODEL[v]);
      setCheapModel(VENDOR_CHEAP_MODEL[v]);
    }}>
                        <option value="anthropic">Claude (Anthropic)</option>
                        <option value="openai">OpenAI</option>
                        <option value="codex">Codex (OpenAI)</option>
                        <option value="grok">Grok (xAI)</option>
                        <option value="openrouter">OpenRouter</option>
                    </select>
                    <input style={inputStyle} type="password" placeholder="API key" value={apiKey} onChange={e => setApiKey(e.target.value)} />
                    <input style={inputStyle} value={strongModel} onChange={e => setStrongModel(e.target.value)} title="strong model" />
                    <input style={inputStyle} value={cheapModel} onChange={e => setCheapModel(e.target.value)} title="cheap model" />
                    <label>
                        factor{" "}
                        <input style={{
        ...inputStyle,
        width: 60
      }} type="number" step="0.1" value={factor} onChange={e => {
        setFactor(Number(e.target.value) || 1);
        setSaved(new Map());
      }} />
                    </label>
                    <button onClick={connect} disabled={apiKey.trim() === ""}>Connect</button>
                    <span>
                        {connected === undefined ? "not connected" : \`connected: \${connected.label}\`} · saved results: <b>{saved.size}</b>
                    </span>
                </span>}>
            <DataEditor ref={gridRef} columns={columns} rows={products.length} getCellContent={ai.getCellContent} customRenderers={ai.customRenderers} onVisibleRegionChanged={ai.onVisibleRegionChanged} onCellsEdited={onCellsEdited} rowMarkers="number" />
        </Frame>;
}`,...(Qe=(je=Q.parameters)==null?void 0:je.docs)==null?void 0:Qe.source},description:{story:`Connect a real model with your own key (kept in memory only — never persisted).
Column "Cost × factor (AI)" is the worked example: it reads the Cost cell,
multiplies it, and prints the result in a new cell using the cheap model of
the vendor you picked; "Pitch (AI)" uses the strong model.`,...(Xe=(Ye=Q.parameters)==null?void 0:Ye.docs)==null?void 0:Xe.description}}};const ln=["AiCells","NaturalLanguageSearch","NaturalLanguageFilter","AgentDataSource","SmartPaste","BulkEdit","LiveProviders"];export{re as AgentDataSource,ee as AiCells,se as BulkEdit,Q as LiveProviders,ne as NaturalLanguageFilter,te as NaturalLanguageSearch,oe as SmartPaste,ln as __namedExportsOrder,an as default};
