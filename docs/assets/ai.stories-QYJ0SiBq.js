const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./index-DHdbU2e9.js","./preload-helper-Dp1pzeXC.js"])))=>i.map(i=>d[i]);
var mt=Object.defineProperty;var pt=(t,e,n)=>e in t?mt(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var B=(t,e,n)=>pt(t,typeof e!="symbol"?e+"":e,n);import{r as o}from"./iframe-gtUd2ThD.js";/* empty css              */import{G as v,m as ht,d as ke,D as j,C as Se}from"./data-editor-all-C3Xa7YAw.js";import{_ as ye}from"./preload-helper-Dp1pzeXC.js";import"./throttle-CUoaKfhD.js";import"./flatten-DH73lhJo.js";import"./marked.esm-CWskPn-N.js";class z extends Error{constructor(e="The AI request was aborted"){super(e),this.name="AbortError"}}function H(t){return t instanceof Error&&t.name==="AbortError"}function ft(t){return t!==null&&typeof t=="object"&&Symbol.asyncIterator in t}async function de(t,e,n){if(!ft(t)){const s=await t;if((n==null?void 0:n.aborted)===!0)throw new z;return s}let r="";for await(const s of t){if((n==null?void 0:n.aborted)===!0)throw new z;r+=s,e==null||e(r)}return r}function Ee(t,e){return new Promise((n,r)=>{if(e.aborted)return r(new z);const s=setTimeout(()=>{e.removeEventListener("abort",i),n()},t),i=()=>{clearTimeout(s),r(new z)};e.addEventListener("abort",i,{once:!0})})}function Q(t,e={}){const n=e.delayMs??0,r=[];return{calls:r,complete(s,{signal:i}){r.push(s);const c=t(s);if(typeof c=="string")return(async()=>{if(n>0&&await Ee(n,i),i.aborted)throw new z;return c})();const u=c;return async function*(){for(const a of u){if(n>0&&await Ee(n,i),i.aborted)throw new z;yield a}}()}}}async function st(t,e){const n=typeof t=="function"?await t():t;if(n===void 0||n==="")throw new Error(`${e}: no API key or token was provided`);return n}async function Re(t){const e=typeof t=="function"?await t():t;return e===""?void 0:e}const gt={low:"low",medium:"medium",high:"high"},vt=/^claude-(opus-5|fable-5)/,yt="claude-opus-5";function wt(t={}){const{maxTokens:e=4096,allowModelOverride:n=!0}=t;return{complete(r,{signal:s}){return async function*(){var f;const{default:i}=await ye(async()=>{const{default:p}=await import("./index-DHdbU2e9.js").then(y=>y.i);return{default:p}},__vite__mapDeps([0,1]),import.meta.url),c=new i({apiKey:await Re(t.apiKey),authToken:await Re(t.authToken),baseURL:t.baseURL,dangerouslyAllowBrowser:t.dangerouslyAllowBrowser}),u=(n?r.model:void 0)??t.model??yt,a=t.effort??(r.difficulty===void 0?void 0:gt[r.difficulty]),l=[t.system,r.system].filter(p=>p!==void 0&&p!=="").join(`

`),d={model:u,max_tokens:e,...l===""?{}:{system:l},...a===void 0?{}:{output_config:{effort:a}},messages:[{role:"user",content:r.prompt}]},m=t.fallbacks!==!1&&vt.test(u)?c.beta.messages.stream({...d,betas:["server-side-fallback-2026-07-01"],fallbacks:"default"},{signal:s}):c.messages.stream(d,{signal:s});for await(const p of m)p.type==="content_block_delta"&&p.delta.type==="text_delta"&&(yield p.delta.text);const b=await m.finalMessage();if(b.stop_reason==="refusal"){const p=(f=b.stop_details)==null?void 0:f.category;throw new Error(`Claude declined this request${p!=null&&p!==""?` (${p})`:""}`)}}()}}}const bt="gpt-5",Ct="gpt-5-codex";function at(t={}){const{allowModelOverride:e=!0}=t;return{complete(n,{signal:r}){return async function*(){const{default:s}=await ye(async()=>{const{default:d}=await import("./index-BP-EPeDL.js");return{default:d}},[],import.meta.url),i=new s({apiKey:await st(t.apiKey,"OpenAI"),baseURL:t.baseURL,organization:t.organization,dangerouslyAllowBrowser:t.dangerouslyAllowBrowser}),c=(e?n.model:void 0)??t.model??bt,u=t.reasoningEffort??n.difficulty,a=[t.system,n.system].filter(d=>d!==void 0&&d!=="").join(`

`),l=await i.responses.create({model:c,input:n.prompt,...a===""?{}:{instructions:a},...u===void 0?{}:{reasoning:{effort:u}},...t.maxOutputTokens===void 0?{}:{max_output_tokens:t.maxOutputTokens},stream:!0},{signal:r});for await(const d of l)d.type==="response.output_text.delta"&&(yield d.delta)}()}}}function kt(t={}){return at({model:Ct,...t})}function it(t){const{allowModelOverride:e=!0,label:n="OpenAI-compatible provider"}=t;return{complete(r,{signal:s}){return async function*(){var h,m,b;const{default:i}=await ye(async()=>{const{default:f}=await import("./index-BP-EPeDL.js");return{default:f}},[],import.meta.url),c=new i({apiKey:await st(t.apiKey,n),baseURL:t.baseURL,defaultHeaders:t.defaultHeaders,dangerouslyAllowBrowser:t.dangerouslyAllowBrowser}),u=(e?r.model:void 0)??t.model,a=[t.system,r.system].filter(f=>f!==void 0&&f!=="").join(`

`),l=[...a===""?[]:[{role:"system",content:a}],{role:"user",content:r.prompt}],d=await c.chat.completions.create({model:u,messages:l,stream:!0,...t.maxTokens===void 0?{}:{max_tokens:t.maxTokens},...t.temperature===void 0?{}:{temperature:t.temperature},...t.extraBody??{}},{signal:s});for await(const f of d){const p=(b=(m=(h=f.choices)==null?void 0:h[0])==null?void 0:m.delta)==null?void 0:b.content;typeof p=="string"&&p!==""&&(yield p)}}()}}}const St="https://api.x.ai/v1",Et="grok-4";function Rt(t={}){return it({...t,baseURL:t.baseURL??St,model:t.model??Et,label:"Grok"})}const xt="https://openrouter.ai/api/v1",Mt="openrouter/auto";function At(t={}){var s,i;const e={...t.defaultHeaders??{}};((s=t.site)==null?void 0:s.url)!==void 0&&(e["HTTP-Referer"]=t.site.url),((i=t.site)==null?void 0:i.title)!==void 0&&(e["X-Title"]=t.site.title);const n=t.model??Mt,r={...t.extraBody??{},...t.fallbackModels===void 0?{}:{models:[n,...t.fallbackModels]}};return it({...t,baseURL:t.baseURL??xt,model:n,defaultHeaders:e,extraBody:r,label:"OpenRouter"})}const Lt={"ai-cell":"medium",search:"low",filter:"low","smart-paste":"low","bulk-edit":"high","agent-source":"medium"};function Nt(t){const e=n=>{var s;if(n.model!==void 0&&((s=t.models)==null?void 0:s[n.model])!==void 0)return{provider:t.models[n.model],via:"model"};const r=n.difficulty??t.fallbackDifficulty??(n.feature===void 0?void 0:Lt[n.feature]);return r!==void 0&&t[r]!==void 0?{provider:t[r],via:r}:{provider:t.default,via:"default"}};return{route:e,complete(n,r){return e(n).provider.complete(n,r)}}}class Ot{constructor(e){B(this,"provider");B(this,"concurrency");B(this,"cacheSize");B(this,"cache",new Map);B(this,"queue",[]);B(this,"inflight",new Map);B(this,"stats",{hits:0,misses:0,completed:0,cancelled:0,errors:0});this.provider=e.provider,this.concurrency=Math.max(1,e.concurrency??2),this.cacheSize=Math.max(1,e.cacheSize??1e3)}get(e){return this.cache.get(e)}has(e){return this.cache.has(e)}isPending(e){return this.inflight.has(e)||this.queue.some(n=>n.key===e)}get pendingCount(){return this.inflight.size+this.queue.length}request(e,n,r={}){const s=this.cache.get(e);if(s!==void 0)return this.stats.hits++,Promise.resolve(s);const i=this.inflight.get(e)??this.queue.find(a=>a.key===e);if(i!==void 0)return this.stats.hits++,r.onChunk!==void 0&&i.chunkListeners.push(r.onChunk),(r.priority??0)>i.priority&&(i.priority=r.priority??0,this.sortQueue()),new Promise((a,l)=>{i.resolvers.push(a),i.rejecters.push(l)});this.stats.misses++;const c={key:e,input:n,priority:r.priority??0,controller:new AbortController,chunkListeners:r.onChunk===void 0?[]:[r.onChunk],resolvers:[],rejecters:[],started:!1},u=new Promise((a,l)=>{c.resolvers.push(a),c.rejecters.push(l)});return this.queue.push(c),this.sortQueue(),this.pump(),u}cancel(e){const n=this.queue.findIndex(s=>s.key===e);if(n!==-1){const[s]=this.queue.splice(n,1);return this.finishCancelled(s),!0}const r=this.inflight.get(e);return r!==void 0?(r.controller.abort(),!0):!1}cancelWhere(e){const n=[...this.queue.map(r=>r.key),...this.inflight.keys()].filter(e);for(const r of n)this.cancel(r);return n.length}cancelAll(){return this.cancelWhere(()=>!0)}clearCache(){this.cache.clear()}clearKey(e){return this.cache.delete(e)}prime(e,n){this.remember(e,n)}sortQueue(){this.queue.sort((e,n)=>n.priority-e.priority)}remember(e,n){for(this.cache.delete(e),this.cache.set(e,n);this.cache.size>this.cacheSize;){const r=this.cache.keys().next().value;if(r===void 0)break;this.cache.delete(r)}}finishCancelled(e){this.stats.cancelled++;for(const n of e.rejecters)n(new z)}pump(){for(;this.inflight.size<this.concurrency&&this.queue.length>0;){const e=this.queue.shift();if(e===void 0)break;e.started=!0,this.inflight.set(e.key,e),this.runJob(e)}}async runJob(e){try{const n=this.provider.complete(e.input,{signal:e.controller.signal}),r=await de(n,s=>{if(!e.controller.signal.aborted)for(const i of e.chunkListeners)i(s)},e.controller.signal);if(e.controller.signal.aborted)throw new z;this.remember(e.key,r),this.stats.completed++;for(const s of e.resolvers)s(r)}catch(n){if(H(n)||e.controller.signal.aborted){this.stats.cancelled++;for(const r of e.rejecters)r(new z)}else{this.stats.errors++;for(const r of e.rejecters)r(n)}}finally{this.inflight.delete(e.key),this.pump()}}}function Y(t){var e;return t.kind===v.Custom&&((e=t.data)==null?void 0:e.kind)==="ai-cell"}function ge(t,e={}){return{kind:v.Custom,allowOverlay:!0,copyData:"",...e.cell,data:{kind:"ai-cell",prompt:t,status:"idle",...e.model===void 0?{}:{model:e.model},...e.difficulty===void 0?{}:{difficulty:e.difficulty}}}}function F(t,e){const n={...t.data,...e};return{...t,data:n,copyData:n.result??""}}const It={display:"flex",flexDirection:"column",gap:6,padding:8,minWidth:280,fontFamily:"var(--gdg-font-family)",color:"var(--gdg-text-dark)"},Pt={font:"inherit",fontSize:"var(--gdg-editor-font-size)",color:"inherit",background:"var(--gdg-bg-cell)",border:"1px solid var(--gdg-border-color)",borderRadius:4,padding:6,resize:"vertical",minHeight:48},Dt={fontSize:"var(--gdg-editor-font-size)",whiteSpace:"pre-wrap",maxHeight:160,overflow:"auto",padding:"4px 0"},Tt={alignSelf:"flex-start",font:"inherit",fontSize:12,padding:"4px 10px",borderRadius:4,border:"1px solid var(--gdg-border-color)",background:"var(--gdg-bg-header)",color:"var(--gdg-text-dark)",cursor:"pointer"},$t={display:"flex",gap:8,alignItems:"center",fontSize:11,color:"var(--gdg-text-medium)"},xe={font:"inherit",fontSize:12,color:"var(--gdg-text-dark)",background:"var(--gdg-bg-cell)",border:"1px solid var(--gdg-border-color)",borderRadius:4,padding:"2px 4px"},_t=({value:t,onChange:e})=>{const{prompt:n,result:r,status:s,error:i,model:c,difficulty:u}=t.data,a=l=>e(F({...t,data:{...t.data,...l}},{result:void 0,status:"idle",error:void 0}));return o.createElement("div",{style:It,className:"gdg-ai-cell-editor"},o.createElement("div",{style:$t},o.createElement("label",null,"Difficulty"," ",o.createElement("select",{style:xe,value:u??"",onChange:l=>a({difficulty:l.target.value===""?void 0:l.target.value})},o.createElement("option",{value:""},"auto"),o.createElement("option",{value:"low"},"low"),o.createElement("option",{value:"medium"},"medium"),o.createElement("option",{value:"high"},"high"))),o.createElement("label",{style:{flex:1}},"Model"," ",o.createElement("input",{style:{...xe,width:"60%"},placeholder:"provider default",value:c??"",onChange:l=>a({model:l.target.value===""?void 0:l.target.value})}))),o.createElement("label",{style:{fontSize:11,color:"var(--gdg-text-medium)"}},"Prompt — use ","{Column Title}"," to reference this row"),o.createElement("textarea",{style:Pt,value:n,autoFocus:!0,onChange:l=>e(F({...t,data:{...t.data,prompt:l.target.value}},{result:void 0,status:"idle",error:void 0}))}),o.createElement("div",{style:Dt,"data-status":s??"idle"},s==="error"?`⚠ ${i??"Generation failed"}`:r??(s==="pending"||s==="streaming"?"Generating…":"No result yet")),o.createElement("button",{type:"button",style:Tt,onClick:()=>e(F(t,{result:void 0,status:"idle",error:void 0}))},"Regenerate"))},Me=900,Ft={kind:v.Custom,isMatch:t=>{var e;return((e=t.data)==null?void 0:e.kind)==="ai-cell"},draw:(t,e)=>{const{ctx:n,theme:r,rect:s,requestAnimationFrame:i,frameTime:c}=t,{prompt:u,result:a,status:l="idle",error:d}=e.data;if(l==="done"&&a!==void 0)return ke(t,a,e.contentAlign),!0;if(l==="streaming"&&a!==void 0&&a!=="")return ke(t,a,e.contentAlign),i(),!0;if(l==="pending"||l==="streaming"){const h=1+Math.floor(c%Me/(Me/3))%3;return n.fillStyle=r.textLight,n.font=r.baseFontFull,n.textBaseline="middle",n.fillText("✦ "+".".repeat(h),s.x+r.cellHorizontalPadding,s.y+s.height/2),i(),!0}return l==="error"?(n.fillStyle=r.textMedium,n.font=r.baseFontFull,n.textBaseline="middle",n.fillText(`⚠ ${d??"error"}`,s.x+r.cellHorizontalPadding,s.y+s.height/2),!0):(n.fillStyle=r.textLight,n.font=r.baseFontFull,n.textBaseline="middle",n.fillText(u===""?"✦ (empty prompt)":`✦ ${u}`,s.x+r.cellHorizontalPadding,s.y+s.height/2),!0)},measure:(t,e,n)=>{const r=e.data.result??e.data.prompt;return ht(r,t,n.baseFontFull).width+n.cellHorizontalPadding*2},provideEditor:()=>({editor:t=>o.createElement(_t,{value:t.value,onChange:t.onChange}),disablePadding:!0}),onPaste:(t,e)=>({...e,prompt:t,result:void 0,status:"idle",error:void 0}),onDelete:t=>F(t,{result:void 0,status:"idle",error:void 0})};function J(t){switch(t.kind){case v.Text:case v.Number:case v.Uri:return t.displayData??(t.data===void 0?"":String(t.data));case v.Markdown:case v.RowID:return t.data??"";case v.Boolean:return t.data===!0?"true":t.data===!1?"false":"";case v.Bubble:case v.Image:return t.data.join(", ");case v.Drilldown:return t.data.map(e=>e.text).join(", ");case v.Custom:return t.copyData??"";case v.Loading:case v.Protected:return"";default:return""}}function we(t){const e=/```(?:json)?\s*([\s\S]*?)```/i.exec(t),n=[e==null?void 0:e[1],t].filter(r=>typeof r=="string");for(const r of n){const s=r.trim();try{return JSON.parse(s)}catch{}const i=[s.indexOf("["),s.indexOf("{")].filter(l=>l!==-1);if(i.length===0)continue;const c=Math.min(...i),u=s[c]==="["?"]":"}",a=s.lastIndexOf(u);if(!(a<=c))try{return JSON.parse(s.slice(c,a+1))}catch{}}}function qt(t){let e=5381;for(let n=0;n<t.length;n++)e=(e<<5)+e+t.charCodeAt(n)|0;return(e>>>0).toString(36)}function Ae(t,e,n){return t.replace(/\{([^{}]+)\}/g,(r,s)=>{const i=s.trim().toLowerCase(),c=e.findIndex(u=>u.title.toLowerCase()===i||u.id!==void 0&&u.id.toLowerCase()===i);return c===-1||n[c]===void 0?r:J(n[c])})}function lt(t){const{provider:e,columns:n,getCellContent:r,gridRef:s,autoRun:i=!0,concurrency:c,system:u,onCellsEdited:a,defaultDifficulty:l="medium"}=t,d=o.useRef(a);d.current=a;const h=t.scheduler,m=o.useMemo(()=>{if(h!==void 0)return h;if(e===void 0)throw new Error("useAiCells needs a provider or a scheduler");return new Ot({provider:e,concurrency:c})},[h,e,c]),[,b]=o.useReducer(w=>w+1,0),f=o.useRef(new Map),p=o.useRef(new Map),y=o.useRef(new Set),C=o.useRef(new Set),L=o.useRef(new Map),R=o.useRef(void 0),M=o.useRef(new Map),k=o.useCallback(w=>{const g=s==null?void 0:s.current;g!=null?g.updateCells([{cell:w}]):b()},[s]),A=o.useCallback(w=>n.map((g,x)=>r([x,w])),[n,r]),E=o.useCallback((w,g,x)=>`${w[0]}:${w[1]}:${qt(`${g}\0${x.data.model??""}\0${x.data.difficulty??l}`)}`,[l]),N=o.useCallback(w=>{const g=R.current;return g===void 0?!0:w[1]>=g.y&&w[1]<g.y+g.height},[]),D=o.useCallback((w,g,x,S)=>{M.current.set(g,w),m.request(g,{prompt:x,system:u,feature:"ai-cell",context:{location:w},difficulty:S.data.difficulty??l,...S.data.model===void 0?{}:{model:S.data.model}},{priority:N(w)?1:0,onChunk:P=>{f.current.set(g,P),k(w)}}).then(P=>{f.current.delete(g),p.current.delete(g),C.current.delete(g),L.current.set(g,P);const $=r(w);if(Y($)&&d.current!==void 0){const G=F($,{result:P,status:"done",error:void 0});d.current([{location:w,value:G}])}k(w)}).catch(P=>{f.current.delete(g),C.current.delete(g),H(P)||(p.current.set(g,P instanceof Error?P.message:String(P)),k(w))})},[m,u,N,k,r,l]),T=o.useCallback(w=>{const g=r(w);if(!Y(g))return g;if(g.data.prompt.trim()==="")return F(g,{status:"idle"});const x=Ae(g.data.prompt,n,A(w[1])),S=E(w,x,g),P=L.current.get(S);if(P!==void 0)if(g.data.result===P)L.current.delete(S);else return F(g,{result:P,status:"done",error:void 0});if(g.data.status==="done"&&g.data.result!==void 0&&!C.current.has(S))return m.get(S)!==g.data.result&&m.prime(S,g.data.result),g;const $=m.get(S);if($!==void 0)return F(g,{result:$,status:"done",error:void 0});const G=p.current.get(S);if(G!==void 0)return F(g,{status:"error",error:G,result:void 0});const q=f.current.get(S);return q!==void 0?F(g,{status:"streaming",result:q}):m.isPending(S)?F(g,{status:"pending",result:void 0}):(i||y.current.has(S))&&N(w)?(y.current.delete(S),D(w,S,x,g),F(g,{status:"pending",result:void 0})):F(g,{status:"idle"})},[r,n,A,E,m,i,N,D]),K=o.useCallback(w=>{R.current=w,m.cancelWhere(g=>{const x=M.current.get(g);return x!==void 0&&!(x[1]>=w.y&&x[1]<w.y+w.height)})},[m]),U=o.useCallback(w=>{const g=r(w);if(Y(g))return Ae(g.data.prompt,n,A(w[1]))},[r,n,A]),O=o.useCallback(w=>{const g=r(w),x=U(w);if(x===void 0||!Y(g))return;const S=E(w,x,g);m.has(S)||m.isPending(S)||(y.current.add(S),p.current.delete(S),D(w,S,x,g),k(w))},[r,U,E,m,D,k]),I=o.useCallback(w=>{const g=r(w),x=U(w);if(x===void 0||!Y(g))return;const S=E(w,x,g);m.cancel(S),m.clearKey(S),p.current.delete(S),f.current.delete(S),C.current.add(S),y.current.add(S),D(w,S,x,g),k(w)},[r,U,E,m,D,k]),V=o.useMemo(()=>[Ft],[]);return{getCellContent:T,onVisibleRegionChanged:K,customRenderers:V,scheduler:m,regenerate:I,run:O,resolvePrompt:U}}const pe={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90,hundred:100,thousand:1e3,million:1e6,billion:1e9},Ut={k:1e3,m:1e6,b:1e9,bn:1e9,mm:1e6};function Vt(t){let e=t.trim().toLowerCase();if(e==="")return;const n=Number(e);if(!Number.isNaN(n)&&/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/.test(e))return n;let r=!1;/^\(.*\)$/.test(e)&&(r=!0,e=e.slice(1,-1).trim()),e=e.replace(/^[-−–]/,u=>(r=!r||u==="","")),e=e.replace(/^\+/,""),e=e.replace(/^[$€£¥₹]\s*/,"").replace(/\s*(usd|eur|gbp|%|percent)$/,""),e=e.replace(/,/g,"").replace(/\s+/g," ").trim();const s=/^(\d+\.?\d*|\.\d+)\s*(k|m|b|bn|mm|thousand|million|billion)$/.exec(e);if(s!==null){const u=Ut[s[2]]??pe[s[2]],a=Number(s[1])*u;return r?-a:a}const i=Number(e);if(!Number.isNaN(i)&&e!=="")return r?-i:i;const c=e.split(/[\s-]+/);if(c.length>0&&c.every(u=>u in pe)){let u=0,a=0;for(const d of c){const h=pe[d];h===100?a=Math.max(a,1)*100:h>=1e3?(u+=Math.max(a,1)*h,a=0):a+=h}const l=u+a;return r?-l:l}}function Gt(t){switch(t.kind){case v.Text:case v.Number:case v.Uri:return t.displayData??(t.data===void 0?"":String(t.data));case v.Markdown:case v.RowID:return t.data??"";case v.Boolean:return t.data===!0?"true":t.data===!1?"false":"";case v.Bubble:case v.Image:return t.data.join(", ");case v.Drilldown:return t.data.map(e=>e.text).join(", ");case v.Custom:return t.copyData??"";case v.Loading:case v.Protected:return"";default:return""}}function Le(t){if(typeof t=="number")return Number.isNaN(t)?void 0:t;if(typeof t=="boolean")return t?1:0;if(typeof t=="string"){const e=Vt(t);if(e!==void 0)return e;const n=Date.parse(t);return Number.isNaN(n)?void 0:n}}function ne(t,e){const n=Le(t),r=Le(e);if(n!==void 0&&r!==void 0)return n===r?0:n<r?-1:1;const s=String(e??"");return t.localeCompare(s,void 0,{sensitivity:"base",numeric:!0})}function zt(t,e){const n=Gt(t),r=n.toLowerCase(),s=e.value,i=s===void 0?"":String(s).toLowerCase();switch(e.op){case"contains":return r.includes(i);case"notContains":return!r.includes(i);case"startsWith":return r.startsWith(i);case"endsWith":return r.endsWith(i);case"empty":return n.trim()==="";case"notEmpty":return n.trim()!=="";case"in":return(Array.isArray(s)?s:s===void 0?[]:[s]).some(u=>ne(n,u)===0);case"eq":return ne(n,s)===0;case"neq":return ne(n,s)!==0;case"gt":case"gte":case"lt":case"lte":{const c=ne(n,s);return c===void 0?!1:e.op==="gt"?c>0:e.op==="gte"?c>=0:e.op==="lt"?c<0:c<=0}default:return!1}}function Bt(t,e){const n=e.trim().toLowerCase();return t.findIndex(r=>r.title.toLowerCase()===n||r.id!==void 0&&r.id.toLowerCase()===n)}function Kt(t,e,n){const r=t.clauses.map(s=>{const i=Bt(e,s.column),c=i===-1?void 0:n[i];return c===void 0?!1:zt(c,s)});return t.conjunction==="or"?r.some(Boolean):r.every(Boolean)}const jt=new Set(["contains","notContains","eq","neq","gt","gte","lt","lte","startsWith","endsWith","empty","notEmpty","in"]),Wt={"=":"eq","==":"eq",equals:"eq",is:"eq","!=":"neq","<>":"neq",not:"neq",isnot:"neq",">":"gt",after:"gt",greater:"gt",">=":"gte","<":"lt",before:"lt",less:"lt","<=":"lte",includes:"contains",like:"contains",has:"contains",excludes:"notContains",startswith:"startsWith",endswith:"endsWith",isempty:"empty",isnotempty:"notEmpty",oneof:"in",any:"in"};function Jt(t){const e=we(t);if(e==null||typeof e!="object")return;const n=e,r=Array.isArray(n.clauses)?n.clauses:Array.isArray(e)?e:void 0;if(r===void 0)return;const s=[];for(const c of r){if(c===null||typeof c!="object")continue;const{column:u,op:a,value:l}=c;if(typeof u!="string"||typeof a!="string")continue;const d=a.trim(),h=jt.has(d)?d:Wt[d.toLowerCase().replace(/[\s_-]/g,"")];if(h===void 0)continue;const m=l==null?void 0:Array.isArray(l)?l.filter(b=>typeof b=="string"||typeof b=="number"):typeof l=="string"||typeof l=="number"||typeof l=="boolean"?l:String(l);s.push({column:u,op:h,value:m})}return s.length===0?void 0:{conjunction:n.conjunction==="or"?"or":"and",clauses:s}}function Ht(t,e){const n=t.trim().toLowerCase();if(n==="")return[];const r=[];return e.forEach((s,i)=>{J(s).toLowerCase().includes(n)&&r.push(i)}),r}const Qt={text:"text",number:"number",boolean:"boolean",uri:"url",markdown:"text",bubble:"tags",image:"image urls",drilldown:"text",custom:"text",loading:"text",protected:"text","row-id":"id"};function Yt(t,e,n){const r=e.map((s,i)=>{var a,l;const c=(l=(a=n[0])==null?void 0:a[i])==null?void 0:l.kind,u=n.map(d=>J(d[i]??{kind:"loading"})).filter(d=>d!=="").slice(0,3);return`- "${s.title}" (${Qt[c??"text"]??"text"})${u.length>0?` e.g. ${u.map(d=>JSON.stringify(d)).join(", ")}`:""}`});return[`Translate this search into a filter over a table. Query: ${JSON.stringify(t)}`,"Columns:",...r,'Reply with ONLY JSON: {"conjunction": "and"|"or", "clauses": [{"column": "<column title>", "op": <op>, "value": <value>}]}',"Allowed ops: contains, notContains, eq, neq, gt, gte, lt, lte, startsWith, endsWith, empty, notEmpty, in (value is an array).","Use column titles exactly as listed. Dates as ISO strings. If the query is just a word to look for, use contains on the most likely column."].join(`
`)}const Ne={status:"idle",spec:void 0,error:void 0,matchedRows:[],matchedCells:new Map};function ct(t){const{provider:e,columns:n,rows:r,getCellContent:s,query:i,debounceMs:c=300,maxRows:u=5e4,sampleRows:a=3}=t,[l,d]=o.useState(Ne),h=o.useRef(new Map),m=o.useCallback(p=>n.map((y,C)=>s([C,p])),[n,s]),b=o.useCallback(p=>{const y=[],C=new Map,L=Math.min(r,u);for(let R=0;R<L;R++){const M=Ht(p,m(R));M.length>0&&(y.push(R),C.set(R,M))}return{matchedRows:y,matchedCells:C}},[r,u,m]),f=o.useCallback(p=>{const y=[],C=new Map,L=Math.min(r,u),R=p.clauses.map(k=>n.findIndex(A=>{var E;return A.title.toLowerCase()===k.column.trim().toLowerCase()||((E=A.id)==null?void 0:E.toLowerCase())===k.column.trim().toLowerCase()})).filter(k=>k!==-1),M=R.length>0?[...new Set(R)]:[0];for(let k=0;k<L;k++)Kt(p,n,m(k))&&(y.push(k),C.set(k,M));return{matchedRows:y,matchedCells:C}},[r,u,n,m]);return o.useEffect(()=>{const p=i.trim();if(p===""){d(Ne);return}const y=b(p),C=h.current.get(p);if(C!==void 0){d({status:"compiled",spec:C,error:void 0,...f(C)});return}if(e===void 0){d({status:"literal",spec:void 0,error:void 0,...y});return}d({status:"compiling",spec:void 0,error:void 0,...y});const L=new AbortController,R=setTimeout(async()=>{try{const M=Array.from({length:Math.min(a,r)},(E,N)=>m(N)),k=await de(e.complete({prompt:Yt(p,n,M),system:"You translate search queries into JSON filters. Reply with JSON only.",feature:"search",difficulty:"low"},{signal:L.signal}),void 0,L.signal);if(L.signal.aborted)return;const A=Jt(k);if(A===void 0){d({status:"literal",spec:void 0,error:"The model did not return a usable filter",...y});return}h.current.set(p,A),d({status:"compiled",spec:A,error:void 0,...f(A)})}catch(M){if(H(M)||L.signal.aborted)return;d({status:"error",spec:void 0,error:M instanceof Error?M.message:String(M),...y})}},c);return()=>{clearTimeout(R),L.abort()}},[i,e,n,r,c,a,m,b,f]),l}function Xt(t){const[e,n]=o.useState(""),[r,s]=o.useState(!1),i=ct({...t,query:e}),c=o.useMemo(()=>{const d=[];for(const h of i.matchedRows)for(const m of i.matchedCells.get(h)??[0])d.push([m,h]);return d},[i.matchedRows,i.matchedCells]),u=o.useCallback(d=>n(d),[]),a=o.useCallback(()=>s(!0),[]),l=o.useCallback(()=>s(!1),[]);return{searchValue:e,onSearchValueChange:u,searchResults:c,showSearch:r,onSearchClose:l,setSearchValue:n,openSearch:a,closeSearch:l,status:i.status,spec:i.spec,error:i.error,matchedRows:i.matchedRows}}function Zt(t){const{getCellContent:e,rows:n,query:r}=t,s=ct(t),i=r.trim()!=="",c=s.matchedRows,u=o.useCallback(l=>i?c[l]??l:l,[i,c]),a=o.useCallback(([l,d])=>e([l,u(d)]),[e,u]);return{rows:i?c.length:n,getCellContent:i?a:e,getOriginalIndex:u,status:s.status,spec:s.spec,error:s.error}}function en(t){const{source:e,toCell:n,onEdited:r,flushIntervalMs:s=50,autoStart:i=!0,initialRows:c}=t,[u,a]=o.useState(c??[]),[l,d]=o.useState("idle"),[h,m]=o.useState(void 0),b=o.useRef([...c??[]]),f=o.useRef(void 0),p=o.useRef([]),y=o.useRef(void 0),[C,L]=o.useState(i?1:0),R=o.useRef(e);R.current=e;const M=o.useRef(r);M.current=r;const k=o.useCallback(()=>{y.current=void 0,p.current.length!==0&&(b.current.push(...p.current),p.current=[],a([...b.current]))},[]),A=o.useCallback(()=>{y.current===void 0&&(y.current=setTimeout(k,s))},[k,s]),E=o.useCallback(()=>{var O;(O=f.current)==null||O.abort(),f.current=void 0,y.current!==void 0&&clearTimeout(y.current),k(),d(I=>I==="streaming"?"cancelled":I)},[k]),N=o.useCallback(()=>{var O;(O=f.current)==null||O.abort(),f.current=void 0,y.current!==void 0&&clearTimeout(y.current),y.current=void 0,p.current=[],b.current=[],a([]),d("idle"),m(void 0)},[]),D=o.useCallback(()=>{N(),L(O=>O+1)},[N]);o.useEffect(()=>{if(C===0)return;const O=new AbortController;return f.current=O,d("streaming"),m(void 0),(async()=>{try{for await(const I of R.current(O.signal)){if(O.signal.aborted)break;Array.isArray(I)?p.current.push(...I):p.current.push(I),A()}if(O.signal.aborted)return;y.current!==void 0&&clearTimeout(y.current),k(),d("done")}catch(I){if(O.signal.aborted||H(I))return;y.current!==void 0&&clearTimeout(y.current),k(),m(I instanceof Error?I.message:String(I)),d("error")}finally{f.current===O&&(f.current=void 0)}})(),()=>{O.abort()}},[C,A,k]);const T=o.useCallback(([O,I])=>{const V=b.current[I];return V===void 0?{kind:"loading",allowOverlay:!1}:n(V,O,I)},[n]),K=o.useCallback(O=>{const I=M.current;if(I===void 0)return!0;let V=!1;const w=[];for(const g of O){const[x,S]=g.location,P=b.current[S];if(P===void 0)continue;const $=I(P,x,g.value,S),G=q=>{q!==void 0&&(b.current[S]=q,V=!0)};$ instanceof Promise?w.push($.then(q=>{q!==void 0&&(b.current[S]=q,a([...b.current]))})):G($)}return V&&a([...b.current]),!0},[]),U=o.useCallback(O=>{b.current.push(...O),a([...b.current])},[]);return{rows:u.length,data:u,getCellContent:T,onCellsEdited:K,status:l,error:h,start:D,stop:E,reset:N,appendRows:U}}const he={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90,hundred:100,thousand:1e3,million:1e6,billion:1e9},tn={k:1e3,m:1e6,b:1e9,bn:1e9,mm:1e6};function nn(t){let e=t.trim().toLowerCase();if(e==="")return;const n=Number(e);if(!Number.isNaN(n)&&/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/.test(e))return n;let r=!1;/^\(.*\)$/.test(e)&&(r=!0,e=e.slice(1,-1).trim()),e=e.replace(/^[-−–]/,u=>(r=!r||u==="","")),e=e.replace(/^\+/,""),e=e.replace(/^[$€£¥₹]\s*/,"").replace(/\s*(usd|eur|gbp|%|percent)$/,""),e=e.replace(/,/g,"").replace(/\s+/g," ").trim();const s=/^(\d+\.?\d*|\.\d+)\s*(k|m|b|bn|mm|thousand|million|billion)$/.exec(e);if(s!==null){const u=tn[s[2]]??he[s[2]],a=Number(s[1])*u;return r?-a:a}const i=Number(e);if(!Number.isNaN(i)&&e!=="")return r?-i:i;const c=e.split(/[\s-]+/);if(c.length>0&&c.every(u=>u in he)){let u=0,a=0;for(const d of c){const h=he[d];h===100?a=Math.max(a,1)*100:h>=1e3?(u+=Math.max(a,1)*h,a=0):a+=h}const l=u+a;return r?-l:l}}const rn=new Set(["true","yes","y","1","on","✓","✔","x","checked","done","t"]),on=new Set(["false","no","n","0","off","✗","✘","unchecked","f","-","—"]);function sn(t){const e=t.trim().toLowerCase();if(rn.has(e))return!0;if(on.has(e))return!1}function fe(t){const e=t.trim();if(e!==""){if(/^[a-z][a-z0-9+.-]*:\/\//i.test(e)||/^(mailto|tel):/i.test(e))return e;if(/^[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(e))return`https://${e}`;if(/^[\w.+-]+@[\w-]+\.[a-z]{2,}$/i.test(e))return`mailto:${e}`}}function ce(t,e){switch(e.kind){case v.Text:{const n=t.trim();return{...e,data:n,displayData:n}}case v.Markdown:case v.RowID:return{...e,data:t.trim()};case v.Number:{const n=nn(t);return n===void 0?void 0:{...e,data:n,displayData:String(n)}}case v.Boolean:{const n=sn(t);return n===void 0?void 0:{...e,data:n}}case v.Uri:{const n=fe(t);return n===void 0?void 0:{...e,data:n,displayData:n}}case v.Bubble:{const n=t.split(/[,;\n]+/).map(r=>r.trim()).filter(r=>r!=="");return{...e,data:n}}case v.Image:{const n=t.split(/[\s,;]+/).map(r=>r.trim()).filter(r=>fe(r)!==void 0).map(r=>fe(r));return n.length===0?void 0:{...e,data:n}}default:return}}const an={[v.Number]:"a plain number (digits, optional decimal point, no units)",[v.Boolean]:"true or false",[v.Uri]:"an absolute URL",[v.Bubble]:"a comma-separated list of short tags",[v.Image]:"a comma-separated list of image URLs",[v.Text]:"plain text"};function ln(t){return["Convert each pasted text into the value the column expects. Interpret dates, numbers written as words, currencies, and yes/no phrasing.",'Reply with ONLY a JSON array of objects {"i": <index>, "value": <string>} — omit entries you cannot convert.',...t.map((n,r)=>`${r}. column "${n.column}" expects ${an[n.target.kind]??"plain text"}; pasted text: ${JSON.stringify(n.text)}`)].join(`
`)}function cn(t){const{provider:e,columns:n,getCellContent:r,onCellsEdited:s,batchSize:i=50}=t,[c,u]=o.useState(0),[a,l]=o.useState(void 0),d=o.useRef(s);d.current=s;const h=o.useCallback((f,p)=>ce(f,p),[]),m=o.useCallback(async f=>{if(!(e===void 0||f.length===0)){u(p=>p+f.length);try{const p=new AbortController,y=await de(e.complete({prompt:ln(f),system:"You convert pasted spreadsheet text into typed cell values. Reply with JSON only.",feature:"smart-paste",difficulty:"low"},{signal:p.signal}),void 0,p.signal),C=we(y),L=[];if(Array.isArray(C))for(const R of C){if(R===null||typeof R!="object")continue;const M=f[Number(R.i)];if(M===void 0)continue;const k=ce(String(R.value??""),M.target);k!==void 0&&L.push({location:M.location,value:k})}L.length>0&&d.current(L),l(void 0)}catch(p){H(p)||l(p instanceof Error?p.message:String(p))}finally{u(p=>Math.max(0,p-f.length))}}},[e]),b=o.useCallback((f,p)=>{if(e===void 0)return!0;const y=[];p.forEach((C,L)=>{C.forEach((R,M)=>{var E;const k=[f[0]+M,f[1]+L];if(k[0]>=n.length)return;const A=r(k);R.trim()===""||A.kind===v.Text||A.kind===v.Custom||ce(R,A)===void 0&&y.push({index:y.length,location:k,text:R,target:A,column:((E=n[k[0]])==null?void 0:E.title)??String(k[0])})})});for(let C=0;C<y.length;C+=i)m(y.slice(C,C+i));return!0},[e,n,r,i,m]);return{coercePasteValue:h,onPaste:b,pending:c,lastError:a}}function Oe(t){return t===void 0?[]:t.toArray()}function un(t,e,n){const r=new Set(Oe(t.rows)),s=new Set(Oe(t.columns)),i=t.current===void 0?[]:[t.current.range,...t.current.rangeStack];for(const a of i){for(let l=a.y;l<a.y+a.height;l++)r.add(l);for(let l=a.x;l<a.x+a.width;l++)s.add(l)}if(r.size===0&&s.size>0)for(let a=0;a<e;a++)r.add(a);const c=[...r].filter(a=>a>=0&&a<e).sort((a,l)=>a-l),u=[...s].filter(a=>a>=0&&a<n).sort((a,l)=>a-l);return{rows:c,columns:t.rows.length>0&&u.length===0?void 0:u.length>0?u:void 0}}function dn(t,e,n,r){const s=n.map(i=>`"${e[i].title}"`).join(", ");return[`Instruction: ${JSON.stringify(t)}`,`Editable columns: ${s}. Only these may be changed.`,"Rows (JSON, one per line):",...r.map(i=>JSON.stringify({row:i.row,...i.values})),'Reply with ONLY a JSON array of changes: [{"row": <row>, "column": "<column title>", "value": "<new value>"}]. Omit rows that need no change.'].join(`
`)}function mn(t){const{provider:e,columns:n,rows:r,getCellContent:s,onCellsEdited:i,maxRows:c=200,highlightColor:u="rgba(79, 93, 255, 0.25)"}=t,[a,l]=o.useState("idle"),[d,h]=o.useState(void 0),[m,b]=o.useState(void 0),f=o.useRef(void 0),p=o.useCallback(async(R,M)=>{var D;const k="rows"in M&&Array.isArray(M.rows)?M:un(M,r,n.length),A=k.rows,E=k.columns??n.map((T,K)=>K);if((D=f.current)==null||D.abort(),A.length===0||E.length===0){h("Select the rows or cells to edit first"),l("error");return}if(A.length>c){h(`Too many rows selected (${A.length}); the limit is ${c}`),l("error");return}const N=new AbortController;f.current=N,l("proposing"),h(void 0),b(void 0);try{const T=A.map(x=>{const S={};for(const P of E)S[n[P].title]=J(s([P,x]));return{row:x,values:S}}),K=await de(e.complete({prompt:dn(R,n,E,T),system:"You edit spreadsheet rows exactly as instructed and reply with JSON only.",feature:"bulk-edit",difficulty:"high"},{signal:N.signal}),void 0,N.signal);if(N.signal.aborted)return;const U=we(K),O=new Set(A),I=[],V=new Set;let w=0;for(const x of Array.isArray(U)?U:[]){if(x===null||typeof x!="object"){w++;continue}const S=Number(x.row),P=String(x.column??"").trim().toLowerCase(),$=E.find(be=>{var Ce;return n[be].title.toLowerCase()===P||((Ce=n[be].id)==null?void 0:Ce.toLowerCase())===P});if(!O.has(S)||$===void 0||V.has(`${$}:${S}`)){w++;continue}const G=[$,S],q=s(G),te=ce(String(x.value??""),q);if(te===void 0){w++;continue}J(te)!==J(q)&&(V.add(`${$}:${S}`),I.push({location:G,value:te}))}const g={instruction:R,edits:I,rejected:w};return b(g),l("proposed"),g}catch(T){if(H(T)||N.signal.aborted)return;h(T instanceof Error?T.message:String(T)),l("error");return}},[e,n,r,s,c]),y=o.useCallback(()=>{m!==void 0&&(m.edits.length>0&&i(m.edits),b(void 0),l("idle"))},[m,i]),C=o.useCallback(()=>{var R;(R=f.current)==null||R.abort(),b(void 0),l("idle"),h(void 0)},[]),L=o.useMemo(()=>{if(!(m===void 0||m.edits.length===0))return m.edits.map(R=>({color:u,range:{x:R.location[0],y:R.location[1],width:1,height:1},style:"solid"}))},[m,u]);return{status:a,error:d,proposal:m,propose:p,apply:y,discard:C,highlightRegions:L}}const En={title:"Extra Packages/AI",parameters:{layout:"fullscreen"}},ve=["Engineering","Sales","Ops","Design"],Ie=["Ada","Grace","Linus","Mia","Noor","Ken","Sara","Yuki","Omar","Lea"],Pe=["Lovelace","Hopper","Torvalds","Chen","Haddad","Sato","Okafor","Ruiz","Novak","Berg"];function me(t){return Array.from({length:t},(e,n)=>({name:`${Ie[n%Ie.length]} ${Pe[n*7%Pe.length]}`,dept:ve[n*3%ve.length],age:22+n*13%40,notes:["Ships weekly","Owns the roadmap","Mentors juniors","Runs on-call","Leads hiring"][n%5]}))}const _=t=>({kind:v.Text,data:t,displayData:t,allowOverlay:!0}),ee=t=>({kind:v.Number,data:t,displayData:String(t),allowOverlay:!0}),W=({title:t,blurb:e,children:n,aside:r})=>o.createElement("div",{style:{padding:24,fontFamily:"Inter, system-ui, sans-serif",color:"#1a1a1a",background:"#f6f7fb",minHeight:"100vh",boxSizing:"border-box"}},o.createElement("h2",{style:{margin:"0 0 4px"}},t),o.createElement("p",{style:{margin:"0 0 12px",color:"#555",maxWidth:720}},e),r!==void 0&&o.createElement("div",{style:{margin:"0 0 12px",fontSize:13}},r),o.createElement("div",{style:{width:"100%",height:460,background:"white",borderRadius:8,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.12)"}},n)),re=()=>{const t=o.useMemo(()=>me(40),[]),e=o.useMemo(()=>[{title:"Name",id:"name",width:160},{title:"Dept",id:"dept",width:120},{title:"Notes",id:"notes",width:180},{title:"Intro (AI)",id:"intro",width:420}],[]),n=o.useMemo(()=>Q(l=>{var m,b,f,p;return`${((m=/for (.+?):/.exec(l.prompt))==null?void 0:m[1])??"them"} is a ${((b=/in ([A-Za-z]+)/.exec(l.prompt))==null?void 0:b[1])??"team"} teammate who ${((p=(f=/who (.+)$/.exec(l.prompt))==null?void 0:f[1])==null?void 0:p.toLowerCase())??"does great work"}.`.split(" ").map((y,C)=>C===0?y:` ${y}`)},{delayMs:60}),[]),[r,s]=o.useState(()=>new Map),i=o.useCallback(([l,d])=>{const h=t[d];return l===0?_(h.name):l===1?_(h.dept):l===2?_(h.notes):r.get(d)??ge("Write one friendly sentence for {Name}: they work in {Dept} and are someone who {Notes}")},[t,r]),c=o.useCallback(l=>(s(d=>{const h=new Map(d);for(const m of l)m.location[0]===3&&h.set(m.location[1],m.value);return h}),!0),[]),u=o.useRef(null),a=lt({provider:n,columns:e,getCellContent:i,gridRef:u,concurrency:3,onCellsEdited:c});return o.createElement(W,{title:"AI cells — =AI() formulas",blurb:"The last column is an AI cell whose prompt references the row's other cells. Cells generate as they scroll into view, stream their text, cache by prompt, and cancel when scrolled away. Finished results are handed to onCellsEdited so your app can persist them; double-click a cell to edit the prompt or regenerate.",aside:o.createElement("span",null,"saved results: ",o.createElement("b",null,r.size)," · model calls: ",o.createElement("b",null,n.calls.length),o.createElement("button",{style:{marginLeft:12},onClick:()=>s(new Map)},"Forget saved results"))},o.createElement(j,{ref:u,columns:e,rows:t.length,getCellContent:a.getCellContent,customRenderers:a.customRenderers,onVisibleRegionChanged:a.onVisibleRegionChanged,onCellsEdited:c,rowMarkers:"number",smoothScrollY:!0}))};function ut(t){var i,c;const e=((c=(i=/Query: "(.+?)"/.exec(t.prompt))==null?void 0:i[1])==null?void 0:c.toLowerCase())??"",n=[];for(const u of ve)e.includes(u.toLowerCase().slice(0,5))&&n.push({column:"Dept",op:"eq",value:u});const r=/(?:over|above|older than) (\d+)/.exec(e);r&&n.push({column:"Age",op:"gt",value:Number(r[1])});const s=/(?:under|below|younger than) (\d+)/.exec(e);return s&&n.push({column:"Age",op:"lt",value:Number(s[1])}),e.includes("mentor")&&n.push({column:"Notes",op:"contains",value:"mentor"}),n.length===0&&n.push({column:"Name",op:"contains",value:e.split(" ")[0]??e}),JSON.stringify({conjunction:"and",clauses:n})}const ue=[{title:"Name",width:180},{title:"Dept",width:130},{title:"Age",width:80},{title:"Notes",width:200}],dt=t=>([e,n])=>{const r=t[n];return e===0?_(r.name):e===1?_(r.dept):e===2?ee(r.age):_(r.notes)},oe=()=>{const t=o.useMemo(()=>me(300),[]),e=o.useMemo(()=>dt(t),[t]),n=o.useMemo(()=>Q(ut,{delayMs:400}),[]),r=Xt({provider:n,columns:ue,rows:t.length,getCellContent:e});return o.createElement(W,{title:"Natural-language search",blurb:'Type into the box (or press Ctrl/⌘+F in the grid): literal matches highlight instantly, then the model compiles the query into a filter — try "engineers over 40" or "sales who mentor". The model only sees column names and a few sample values, never the table.',aside:o.createElement("span",null,o.createElement("input",{value:r.searchValue??"",onChange:s=>r.setSearchValue(s.target.value),placeholder:'e.g. "engineers over 40"',style:{padding:6,width:280,marginRight:12}}),"status: ",o.createElement("b",null,r.status)," · matches: ",o.createElement("b",null,r.matchedRows.length),r.spec!==void 0&&o.createElement("code",{style:{marginLeft:12,fontSize:12}},JSON.stringify(r.spec.clauses)))},o.createElement(j,{columns:ue,rows:t.length,getCellContent:e,searchValue:r.searchValue,onSearchValueChange:r.onSearchValueChange,searchResults:r.searchResults,showSearch:r.showSearch,onSearchClose:r.onSearchClose,getCellsForSelection:!0,rowMarkers:"number"}))},se=()=>{const t=o.useMemo(()=>me(300),[]),e=o.useMemo(()=>dt(t),[t]),n=o.useMemo(()=>Q(ut,{delayMs:400}),[]),[r,s]=o.useState(""),i=Zt({provider:n,columns:ue,rows:t.length,getCellContent:e,query:r});return o.createElement(W,{title:"Natural-language filter",blurb:'Rows that do not match the query are hidden — the same compiled filter as search, applied as a row permutation like useColumnSort. Try "design under 30".',aside:o.createElement("span",null,o.createElement("input",{value:r,onChange:c=>s(c.target.value),placeholder:"filter rows…",style:{padding:6,width:280,marginRight:12}}),"status: ",o.createElement("b",null,i.status)," · showing ",o.createElement("b",null,i.rows)," of ",t.length)},o.createElement(j,{columns:ue,rows:i.rows,getCellContent:i.getCellContent,rowMarkers:"number"}))};async function*pn(t){const e=["Acme","Globex","Initech","Umbrella","Hooli","Stark","Wayne","Wonka","Tyrell","Cyberdyne","Aperture","Vandelay"],n=["Hiring a VP Sales","Raised Series B","Launched pricing page","Opened EU office","Sponsoring a conference"];for(let r=0;r<e.length;r++){if(await new Promise(s=>setTimeout(s,350)),t.aborted)return;yield{company:e[r],signal:n[r%n.length],confidence:60+r*17%40}}}const ae=()=>{const t=o.useMemo(()=>[{title:"Company",width:160},{title:"Signal",width:260},{title:"Confidence",width:120}],[]),e=o.useCallback((r,s)=>s===0?_(r.company):s===1?_(r.signal):ee(r.confidence),[]),n=en({source:pn,toCell:e,onEdited:(r,s,i)=>s===2&&i.kind===v.Number?{...r,confidence:i.data??r.confidence}:s===1&&i.kind===v.Text?{...r,signal:i.data}:void 0});return o.createElement(W,{title:"Agent-fed data source",blurb:"The grid is the agent's output surface: rows stream in as a (simulated) research agent finds them, the grid stays fully interactive, and your edits flow back through onEdited so the agent can react.",aside:o.createElement("span",null,"status: ",o.createElement("b",null,n.status)," · rows: ",o.createElement("b",null,n.rows),o.createElement("button",{onClick:n.start,style:{marginLeft:12}},"Restart"),o.createElement("button",{onClick:n.stop,style:{marginLeft:6}},"Stop"),n.error!==void 0&&o.createElement("span",{style:{color:"crimson",marginLeft:12}},n.error))},o.createElement(j,{columns:t,rows:n.rows,getCellContent:n.getCellContent,onCellsEdited:n.onCellsEdited,rowMarkers:"number"}))},hn={ten:"10","a dozen":"12","half a hundred":"50",yep:"true",nope:"false",affirmative:"true",negative:"false","next tuesday":"2026-09-08"},ie=()=>{const t=o.useMemo(()=>[{title:"Item",width:160},{title:"Qty",width:100},{title:"In stock",width:100},{title:"Link",width:260}],[]),[e,n]=o.useState(()=>Array.from({length:12},(u,a)=>({item:`SKU-${100+a}`,qty:a*3,stock:a%2===0,link:""}))),r=o.useCallback(([u,a])=>{const l=e[a];return u===0?_(l.item):u===1?ee(l.qty):u===2?{kind:v.Boolean,data:l.stock,allowOverlay:!1}:{kind:v.Uri,data:l.link,displayData:l.link,allowOverlay:!0}},[e]),s=o.useCallback(u=>(n(a=>{const l=a.map(d=>({...d}));for(const d of u){const h=l[d.location[1]];if(h===void 0)continue;const m=d.value;d.location[0]===1&&m.kind===v.Number?h.qty=m.data??0:d.location[0]===2&&m.kind===v.Boolean?h.stock=m.data===!0:d.location[0]===3&&m.kind===v.Uri?h.link=m.data:d.location[0]===0&&m.kind===v.Text&&(h.item=m.data)}return l}),!0),[]),i=o.useMemo(()=>Q(u=>{const a=[];for(const l of u.prompt.matchAll(/^(\d+)\. .*pasted text: "(.+)"$/gm)){const d=hn[l[2].toLowerCase()];d!==void 0&&a.push({i:Number(l[1]),value:d})}return JSON.stringify(a)},{delayMs:500}),[]),c=cn({provider:i,columns:t,getCellContent:r,onCellsEdited:s});return o.createElement(W,{title:"Smart paste",blurb:'Copy some text and paste it into the Qty / In stock / Link columns: "$1,200", "twelve", "yes", "example.com" are coerced instantly; things like "a dozen" or "affirmative" go to the model in one batched call and are corrected a moment later.',aside:o.createElement("span",null,"pending model corrections: ",o.createElement("b",null,c.pending),c.lastError!==void 0&&o.createElement("span",{style:{color:"crimson"}}," · ",c.lastError))},o.createElement(j,{columns:t,rows:e.length,getCellContent:r,onCellsEdited:s,coercePasteValue:c.coercePasteValue,onPaste:c.onPaste,getCellsForSelection:!0,rowMarkers:"number"}))},le=()=>{const t=o.useMemo(()=>[{title:"Order",width:140},{title:"Status",width:120},{title:"Qty",width:90},{title:"Customer",width:200}],[]),[e,n]=o.useState(()=>Array.from({length:15},(h,m)=>({order:`#${1e3+m}`,status:m%3===0?"shipped":"open",qty:1+m%6,customer:me(15)[m].name}))),r=o.useCallback(([h,m])=>{const b=e[m];return h===0?_(b.order):h===1?_(b.status):h===2?ee(b.qty):_(b.customer)},[e]),s=o.useCallback(h=>(n(m=>{const b=m.map(f=>({...f}));for(const f of h){const p=b[f.location[1]],y=f.value;p!==void 0&&(f.location[0]===1&&y.kind===v.Text&&(p.status=y.data),f.location[0]===2&&y.kind===v.Number&&(p.qty=y.data??p.qty),f.location[0]===3&&y.kind===v.Text&&(p.customer=y.data))}return b}),!0),[]),i=o.useMemo(()=>Q(h=>{var p,y;const m=((y=(p=/Instruction: "(.+?)"/.exec(h.prompt))==null?void 0:p[1])==null?void 0:y.toLowerCase())??"",b=[...h.prompt.matchAll(/^\{"row":(\d+),(.*)\}$/gm)].map(C=>({row:Number(C[1]),json:JSON.parse(`{${C[2]}}`)})),f=[];for(const C of b)m.includes("ship")&&f.push({row:C.row,column:"Status",value:"shipped"}),m.includes("double")&&f.push({row:C.row,column:"Qty",value:String(Number(C.json.Qty)*2)}),m.includes("upper")&&f.push({row:C.row,column:"Customer",value:(C.json.Customer??"").toUpperCase()});return JSON.stringify(f)},{delayMs:600}),[]),[c,u]=o.useState({rows:Se.empty(),columns:Se.empty()}),[a,l]=o.useState("mark them as shipped"),d=mn({provider:i,columns:t,rows:e.length,getCellContent:r,onCellsEdited:s});return o.createElement(W,{title:"Bulk edit in plain language",blurb:'Select some rows (click the row markers), type an instruction such as "mark them as shipped", "double the quantity", or "uppercase the customer", and propose. The model returns edits, the grid previews them as highlights, and nothing is written until you apply.',aside:o.createElement("span",null,o.createElement("input",{value:a,onChange:h=>l(h.target.value),style:{padding:6,width:260,marginRight:8}}),o.createElement("button",{onClick:()=>void d.propose(a,c),disabled:d.status==="proposing"},"Propose"),o.createElement("button",{onClick:d.apply,disabled:d.proposal===void 0,style:{marginLeft:6}},"Apply ",d.proposal!==void 0?`(${d.proposal.edits.length})`:""),o.createElement("button",{onClick:d.discard,disabled:d.proposal===void 0,style:{marginLeft:6}},"Discard"),o.createElement("span",{style:{marginLeft:12}},"status: ",o.createElement("b",null,d.status)),d.error!==void 0&&o.createElement("span",{style:{color:"crimson",marginLeft:12}},d.error))},o.createElement(j,{columns:t,rows:e.length,getCellContent:r,onCellsEdited:s,gridSelection:c,onGridSelectionChange:u,highlightRegions:d.highlightRegions,rowMarkers:"both",rowSelect:"multi"}))},De={anthropic:"claude-opus-5",openai:"gpt-5",codex:"gpt-5-codex",grok:"grok-4",openrouter:"openrouter/auto"},Te={anthropic:"claude-haiku-4-5",openai:"gpt-5-mini",codex:"gpt-5-codex",grok:"grok-4",openrouter:"openrouter/auto"};function fn(t,e,n){const r={apiKey:e,model:n,dangerouslyAllowBrowser:!0};switch(t){case"anthropic":return wt(r);case"openai":return at(r);case"codex":return kt(r);case"grok":return Rt(r);case"openrouter":return At({...r,site:{title:"tengrids Storybook"}})}}const X={padding:6,marginRight:8},Z=()=>{const[t,e]=o.useState("anthropic"),[n,r]=o.useState(""),[s,i]=o.useState(De.anthropic),[c,u]=o.useState(Te.anthropic),[a,l]=o.useState(void 0),[d,h]=o.useState(1.2),m=o.useMemo(()=>[{name:"Standing desk",cost:349,notes:"Bamboo top, dual motor"},{name:"Task chair",cost:189.5,notes:"Mesh back, lumbar support"},{name:"Monitor arm",cost:79,notes:"Fits 17–32 inch, gas spring"},{name:"Desk lamp",cost:42.25,notes:"Warm/cool dimming"},{name:"Cable tray",cost:24,notes:"Under-desk, steel"},{name:"Footrest",cost:31,notes:"Adjustable tilt"}],[]),b=o.useMemo(()=>[{title:"Product",id:"product",width:150},{title:"Cost",id:"cost",width:90},{title:"Notes",id:"notes",width:200},{title:`Cost × ${d} (AI)`,id:"scaled",width:150},{title:"Pitch (AI)",id:"pitch",width:360}],[d]),[f,p]=o.useState(()=>new Map),y=o.useCallback(([E,N])=>{const D=m[N];if(E===0)return _(D.name);if(E===1)return ee(D.cost);if(E===2)return _(D.notes);const T=f.get(`${E}:${N}`);return T!==void 0?T:E===3?ge(`Multiply {Cost} by ${d}. Reply with only the resulting number, two decimals, no currency symbol.`,{model:c,difficulty:"low",cell:{contentAlign:"right"}}):ge("Write one punchy sales sentence for {Product} ({Notes}) priced at {Cost}.",{model:s,difficulty:"high"})},[m,f,d,c,s]),C=o.useCallback(E=>(p(N=>{const D=new Map(N);for(const T of E)D.set(`${T.location[0]}:${T.location[1]}`,T.value);return D}),!0),[]),L=o.useRef(null),R=o.useMemo(()=>Q(()=>"(connect a provider above to generate)"),[]),M=o.useMemo(()=>a===void 0?R:Nt({default:a.provider,models:{[c]:a.provider,[s]:a.provider}}),[a,R,c,s]),k=lt({provider:M,columns:b,getCellContent:y,gridRef:L,onCellsEdited:C,concurrency:2}),A=()=>{n.trim()!==""&&(p(new Map),l({provider:fn(t,n.trim(),s),label:`${t} · ${s} / ${c}`}))};return o.createElement(W,{title:"Live providers — Claude, OpenAI/Codex, Grok, OpenRouter",blurb:"Paste a key for the vendor you choose (it stays in this page's memory only), then connect. The Cost × factor column reads each row's Cost cell, multiplies it, and prints the result in a new cell using the cheap model; the Pitch column uses the strong model. Double-click any AI cell to change its prompt, model, or difficulty. Browser-direct calls are for experimenting — production apps should route through their own backend.",aside:o.createElement("span",{style:{display:"inline-flex",flexWrap:"wrap",gap:6,alignItems:"center"}},o.createElement("select",{style:X,value:t,onChange:E=>{const N=E.target.value;e(N),i(De[N]),u(Te[N])}},o.createElement("option",{value:"anthropic"},"Claude (Anthropic)"),o.createElement("option",{value:"openai"},"OpenAI"),o.createElement("option",{value:"codex"},"Codex (OpenAI)"),o.createElement("option",{value:"grok"},"Grok (xAI)"),o.createElement("option",{value:"openrouter"},"OpenRouter")),o.createElement("input",{style:X,type:"password",placeholder:"API key",value:n,onChange:E=>r(E.target.value)}),o.createElement("input",{style:X,value:s,onChange:E=>i(E.target.value),title:"strong model"}),o.createElement("input",{style:X,value:c,onChange:E=>u(E.target.value),title:"cheap model"}),o.createElement("label",null,"factor"," ",o.createElement("input",{style:{...X,width:60},type:"number",step:"0.1",value:d,onChange:E=>{h(Number(E.target.value)||1),p(new Map)}})),o.createElement("button",{onClick:A,disabled:n.trim()===""},"Connect"),o.createElement("span",null,a===void 0?"not connected":`connected: ${a.label}`," · saved results: ",o.createElement("b",null,f.size)))},o.createElement(j,{ref:L,columns:b,rows:m.length,getCellContent:k.getCellContent,customRenderers:k.customRenderers,onVisibleRegionChanged:k.onVisibleRegionChanged,onCellsEdited:C,rowMarkers:"number"}))};var $e,_e,Fe;re.parameters={...re.parameters,docs:{...($e=re.parameters)==null?void 0:$e.docs,source:{originalSource:`() => {
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
}`,...(Fe=(_e=re.parameters)==null?void 0:_e.docs)==null?void 0:Fe.source}}};var qe,Ue,Ve;oe.parameters={...oe.parameters,docs:{...(qe=oe.parameters)==null?void 0:qe.docs,source:{originalSource:`() => {
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
}`,...(Ve=(Ue=oe.parameters)==null?void 0:Ue.docs)==null?void 0:Ve.source}}};var Ge,ze,Be;se.parameters={...se.parameters,docs:{...(Ge=se.parameters)==null?void 0:Ge.docs,source:{originalSource:`() => {
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
}`,...(Be=(ze=se.parameters)==null?void 0:ze.docs)==null?void 0:Be.source}}};var Ke,je,We;ae.parameters={...ae.parameters,docs:{...(Ke=ae.parameters)==null?void 0:Ke.docs,source:{originalSource:`() => {
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
}`,...(We=(je=ae.parameters)==null?void 0:je.docs)==null?void 0:We.source}}};var Je,He,Qe;ie.parameters={...ie.parameters,docs:{...(Je=ie.parameters)==null?void 0:Je.docs,source:{originalSource:`() => {
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
}`,...(Qe=(He=ie.parameters)==null?void 0:He.docs)==null?void 0:Qe.source}}};var Ye,Xe,Ze;le.parameters={...le.parameters,docs:{...(Ye=le.parameters)==null?void 0:Ye.docs,source:{originalSource:`() => {
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
}`,...(Ze=(Xe=le.parameters)==null?void 0:Xe.docs)==null?void 0:Ze.source}}};var et,tt,nt,rt,ot;Z.parameters={...Z.parameters,docs:{...(et=Z.parameters)==null?void 0:et.docs,source:{originalSource:`() => {
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
}`,...(nt=(tt=Z.parameters)==null?void 0:tt.docs)==null?void 0:nt.source},description:{story:`Connect a real model with your own key (kept in memory only — never persisted).
Column "Cost × factor (AI)" is the worked example: it reads the Cost cell,
multiplies it, and prints the result in a new cell using the cheap model of
the vendor you picked; "Pitch (AI)" uses the strong model.`,...(ot=(rt=Z.parameters)==null?void 0:rt.docs)==null?void 0:ot.description}}};const Rn=["AiCells","NaturalLanguageSearch","NaturalLanguageFilter","AgentDataSource","SmartPaste","BulkEdit","LiveProviders"];export{ae as AgentDataSource,re as AiCells,le as BulkEdit,Z as LiveProviders,se as NaturalLanguageFilter,oe as NaturalLanguageSearch,ie as SmartPaste,Rn as __namedExportsOrder,En as default};
