const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./index-C8btu08e.js","./preload-helper-C1FmrZbK.js","./iframe-FRQDWZBQ.js","./index-Db_4MQF1.js"])))=>i.map(i=>d[i]);
var mt=Object.defineProperty;var pt=(t,e,n)=>e in t?mt(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var B=(t,e,n)=>pt(t,typeof e!="symbol"?e+"":e,n);import{r as o}from"./iframe-FRQDWZBQ.js";/* empty css              */import{G as k,m as ht,d as be,D as W,C as ke}from"./data-editor-all-CO5157Ur.js";import{_ as ve}from"./preload-helper-C1FmrZbK.js";import"./throttle-DSjTzJTq.js";import"./flatten-C8mnatsO.js";import"./marked.esm-rk7g6d9n.js";class z extends Error{constructor(e="The AI request was aborted"){super(e),this.name="AbortError"}}function H(t){return t instanceof Error&&t.name==="AbortError"}function ft(t){return t!==null&&typeof t=="object"&&Symbol.asyncIterator in t}async function de(t,e,n){if(!ft(t)){const s=await t;if((n==null?void 0:n.aborted)===!0)throw new z;return s}let r="";for await(const s of t){if((n==null?void 0:n.aborted)===!0)throw new z;r+=s,e==null||e(r)}return r}function Se(t,e){return new Promise((n,r)=>{if(e.aborted)return r(new z);const s=setTimeout(()=>{e.removeEventListener("abort",a),n()},t),a=()=>{clearTimeout(s),r(new z)};e.addEventListener("abort",a,{once:!0})})}function Q(t,e={}){const n=e.delayMs??0,r=[];return{calls:r,complete(s,{signal:a}){r.push(s);const c=t(s);if(typeof c=="string")return(async()=>{if(n>0&&await Se(n,a),a.aborted)throw new z;return c})();const d=c;return async function*(){for(const l of d){if(n>0&&await Se(n,a),a.aborted)throw new z;yield l}}()}}}async function ot(t,e){const n=typeof t=="function"?await t():t;if(n===void 0||n==="")throw new Error(`${e}: no API key or token was provided`);return n}async function Ee(t){const e=typeof t=="function"?await t():t;return e===""?void 0:e}const gt={low:"low",medium:"medium",high:"high"},vt=/^claude-(opus-5|fable-5)/,yt="claude-opus-5";function wt(t={}){const{maxTokens:e=4096,allowModelOverride:n=!0}=t;return{complete(r,{signal:s}){return async function*(){var h;const{default:a}=await ve(async()=>{const{default:p}=await import("./index-C8btu08e.js").then(v=>v.i);return{default:p}},__vite__mapDeps([0,1,2]),import.meta.url),c=new a({apiKey:await Ee(t.apiKey),authToken:await Ee(t.authToken),baseURL:t.baseURL,dangerouslyAllowBrowser:t.dangerouslyAllowBrowser}),d=(n?r.model:void 0)??t.model??yt,l=t.effort??(r.difficulty===void 0?void 0:gt[r.difficulty]),i=[t.system,r.system].filter(p=>p!==void 0&&p!=="").join(`

`),u={model:d,max_tokens:e,...i===""?{}:{system:i},...l===void 0?{}:{output_config:{effort:l}},messages:[{role:"user",content:r.prompt}]},m=t.fallbacks!==!1&&vt.test(d)?c.beta.messages.stream({...u,betas:["server-side-fallback-2026-07-01"],fallbacks:"default"},{signal:s}):c.messages.stream(u,{signal:s});for await(const p of m)p.type==="content_block_delta"&&p.delta.type==="text_delta"&&(yield p.delta.text);const w=await m.finalMessage();if(w.stop_reason==="refusal"){const p=(h=w.stop_details)==null?void 0:h.category;throw new Error(`Claude declined this request${p!=null&&p!==""?` (${p})`:""}`)}}()}}}const Ct="gpt-5",bt="gpt-5-codex";function st(t={}){const{allowModelOverride:e=!0}=t;return{complete(n,{signal:r}){return async function*(){const{default:s}=await ve(async()=>{const{default:u}=await import("./index-Db_4MQF1.js");return{default:u}},__vite__mapDeps([3,2,1]),import.meta.url),a=new s({apiKey:await ot(t.apiKey,"OpenAI"),baseURL:t.baseURL,organization:t.organization,dangerouslyAllowBrowser:t.dangerouslyAllowBrowser}),c=(e?n.model:void 0)??t.model??Ct,d=t.reasoningEffort??n.difficulty,l=[t.system,n.system].filter(u=>u!==void 0&&u!=="").join(`

`),i=await a.responses.create({model:c,input:n.prompt,...l===""?{}:{instructions:l},...d===void 0?{}:{reasoning:{effort:d}},...t.maxOutputTokens===void 0?{}:{max_output_tokens:t.maxOutputTokens},stream:!0},{signal:r});for await(const u of i)u.type==="response.output_text.delta"&&(yield u.delta)}()}}}function kt(t={}){return st({model:bt,...t})}function at(t){const{allowModelOverride:e=!0,label:n="OpenAI-compatible provider"}=t;return{complete(r,{signal:s}){return async function*(){var g,m,w;const{default:a}=await ve(async()=>{const{default:h}=await import("./index-Db_4MQF1.js");return{default:h}},__vite__mapDeps([3,2,1]),import.meta.url),c=new a({apiKey:await ot(t.apiKey,n),baseURL:t.baseURL,defaultHeaders:t.defaultHeaders,dangerouslyAllowBrowser:t.dangerouslyAllowBrowser}),d=(e?r.model:void 0)??t.model,l=[t.system,r.system].filter(h=>h!==void 0&&h!=="").join(`

`),i=[...l===""?[]:[{role:"system",content:l}],{role:"user",content:r.prompt}],u=await c.chat.completions.create({model:d,messages:i,stream:!0,...t.maxTokens===void 0?{}:{max_tokens:t.maxTokens},...t.temperature===void 0?{}:{temperature:t.temperature},...t.extraBody??{}},{signal:s});for await(const h of u){const p=(w=(m=(g=h.choices)==null?void 0:g[0])==null?void 0:m.delta)==null?void 0:w.content;typeof p=="string"&&p!==""&&(yield p)}}()}}}const St="https://api.x.ai/v1",Et="grok-4";function Rt(t={}){return at({...t,baseURL:t.baseURL??St,model:t.model??Et,label:"Grok"})}const xt="https://openrouter.ai/api/v1",Mt="openrouter/auto";function At(t={}){var s,a;const e={...t.defaultHeaders??{}};((s=t.site)==null?void 0:s.url)!==void 0&&(e["HTTP-Referer"]=t.site.url),((a=t.site)==null?void 0:a.title)!==void 0&&(e["X-Title"]=t.site.title);const n=t.model??Mt,r={...t.extraBody??{},...t.fallbackModels===void 0?{}:{models:[n,...t.fallbackModels]}};return at({...t,baseURL:t.baseURL??xt,model:n,defaultHeaders:e,extraBody:r,label:"OpenRouter"})}const Lt={"ai-cell":"medium",search:"low",filter:"low","smart-paste":"low","bulk-edit":"high","agent-source":"medium"};function Ot(t){const e=n=>{var s;if(n.model!==void 0&&((s=t.models)==null?void 0:s[n.model])!==void 0)return{provider:t.models[n.model],via:"model"};const r=n.difficulty??t.fallbackDifficulty??(n.feature===void 0?void 0:Lt[n.feature]);return r!==void 0&&t[r]!==void 0?{provider:t[r],via:r}:{provider:t.default,via:"default"}};return{route:e,complete(n,r){return e(n).provider.complete(n,r)}}}class Nt{constructor(e){B(this,"provider");B(this,"concurrency");B(this,"cacheSize");B(this,"cache",new Map);B(this,"queue",[]);B(this,"inflight",new Map);B(this,"stats",{hits:0,misses:0,completed:0,cancelled:0,errors:0});this.provider=e.provider,this.concurrency=Math.max(1,e.concurrency??2),this.cacheSize=Math.max(1,e.cacheSize??1e3)}get(e){return this.cache.get(e)}has(e){return this.cache.has(e)}isPending(e){return this.inflight.has(e)||this.queue.some(n=>n.key===e)}get pendingCount(){return this.inflight.size+this.queue.length}request(e,n,r={}){const s=this.cache.get(e);if(s!==void 0)return this.stats.hits++,Promise.resolve(s);const a=this.inflight.get(e)??this.queue.find(l=>l.key===e);if(a!==void 0)return this.stats.hits++,r.onChunk!==void 0&&a.chunkListeners.push(r.onChunk),(r.priority??0)>a.priority&&(a.priority=r.priority??0,this.sortQueue()),new Promise((l,i)=>{a.resolvers.push(l),a.rejecters.push(i)});this.stats.misses++;const c={key:e,input:n,priority:r.priority??0,controller:new AbortController,chunkListeners:r.onChunk===void 0?[]:[r.onChunk],resolvers:[],rejecters:[],started:!1},d=new Promise((l,i)=>{c.resolvers.push(l),c.rejecters.push(i)});return this.queue.push(c),this.sortQueue(),this.pump(),d}cancel(e){const n=this.queue.findIndex(s=>s.key===e);if(n!==-1){const[s]=this.queue.splice(n,1);return this.finishCancelled(s),!0}const r=this.inflight.get(e);return r!==void 0?(r.controller.abort(),!0):!1}cancelWhere(e){const n=[...this.queue.map(r=>r.key),...this.inflight.keys()].filter(e);for(const r of n)this.cancel(r);return n.length}cancelAll(){return this.cancelWhere(()=>!0)}clearCache(){this.cache.clear()}clearKey(e){return this.cache.delete(e)}prime(e,n){this.remember(e,n)}sortQueue(){this.queue.sort((e,n)=>n.priority-e.priority)}remember(e,n){for(this.cache.delete(e),this.cache.set(e,n);this.cache.size>this.cacheSize;){const r=this.cache.keys().next().value;if(r===void 0)break;this.cache.delete(r)}}finishCancelled(e){this.stats.cancelled++;for(const n of e.rejecters)n(new z)}pump(){for(;this.inflight.size<this.concurrency&&this.queue.length>0;){const e=this.queue.shift();if(e===void 0)break;e.started=!0,this.inflight.set(e.key,e),this.runJob(e)}}async runJob(e){try{const n=this.provider.complete(e.input,{signal:e.controller.signal}),r=await de(n,s=>{if(!e.controller.signal.aborted)for(const a of e.chunkListeners)a(s)},e.controller.signal);if(e.controller.signal.aborted)throw new z;this.remember(e.key,r),this.stats.completed++;for(const s of e.resolvers)s(r)}catch(n){if(H(n)||e.controller.signal.aborted){this.stats.cancelled++;for(const r of e.rejecters)r(new z)}else{this.stats.errors++;for(const r of e.rejecters)r(n)}}finally{this.inflight.delete(e.key),this.pump()}}}function Y(t){var e;return t.kind===k.Custom&&((e=t.data)==null?void 0:e.kind)==="ai-cell"}function fe(t,e={}){return{kind:k.Custom,allowOverlay:!0,copyData:"",...e.cell,data:{kind:"ai-cell",prompt:t,status:"idle",...e.model===void 0?{}:{model:e.model},...e.difficulty===void 0?{}:{difficulty:e.difficulty}}}}function _(t,e){const n={...t.data,...e};return{...t,data:n,copyData:n.result??""}}const Pt={display:"flex",flexDirection:"column",gap:6,padding:8,minWidth:280,fontFamily:"var(--gdg-font-family)",color:"var(--gdg-text-dark)"},It={font:"inherit",fontSize:"var(--gdg-editor-font-size)",color:"inherit",background:"var(--gdg-bg-cell)",border:"1px solid var(--gdg-border-color)",borderRadius:4,padding:6,resize:"vertical",minHeight:48},Dt={fontSize:"var(--gdg-editor-font-size)",whiteSpace:"pre-wrap",maxHeight:160,overflow:"auto",padding:"4px 0"},Tt={alignSelf:"flex-start",font:"inherit",fontSize:12,padding:"4px 10px",borderRadius:4,border:"1px solid var(--gdg-border-color)",background:"var(--gdg-bg-header)",color:"var(--gdg-text-dark)",cursor:"pointer"},$t={display:"flex",gap:8,alignItems:"center",fontSize:11,color:"var(--gdg-text-medium)"},Re={font:"inherit",fontSize:12,color:"var(--gdg-text-dark)",background:"var(--gdg-bg-cell)",border:"1px solid var(--gdg-border-color)",borderRadius:4,padding:"2px 4px"},Ft=({value:t,onChange:e})=>{const{prompt:n,result:r,status:s,error:a,model:c,difficulty:d}=t.data,l=i=>e(_({...t,data:{...t.data,...i}},{result:void 0,status:"idle",error:void 0}));return o.createElement("div",{style:Pt,className:"gdg-ai-cell-editor"},o.createElement("div",{style:$t},o.createElement("label",null,"Difficulty"," ",o.createElement("select",{style:Re,value:d??"",onChange:i=>l({difficulty:i.target.value===""?void 0:i.target.value})},o.createElement("option",{value:""},"auto"),o.createElement("option",{value:"low"},"low"),o.createElement("option",{value:"medium"},"medium"),o.createElement("option",{value:"high"},"high"))),o.createElement("label",{style:{flex:1}},"Model"," ",o.createElement("input",{style:{...Re,width:"60%"},placeholder:"provider default",value:c??"",onChange:i=>l({model:i.target.value===""?void 0:i.target.value})}))),o.createElement("label",{style:{fontSize:11,color:"var(--gdg-text-medium)"}},"Prompt — use ","{Column Title}"," to reference this row"),o.createElement("textarea",{style:It,value:n,autoFocus:!0,onChange:i=>e(_({...t,data:{...t.data,prompt:i.target.value}},{result:void 0,status:"idle",error:void 0}))}),o.createElement("div",{style:Dt,"data-status":s??"idle"},s==="error"?`⚠ ${a??"Generation failed"}`:r??(s==="pending"||s==="streaming"?"Generating…":"No result yet")),o.createElement("button",{type:"button",style:Tt,onClick:()=>e(_(t,{result:void 0,status:"idle",error:void 0}))},"Regenerate"))},xe=900,_t={kind:k.Custom,isMatch:t=>{var e;return((e=t.data)==null?void 0:e.kind)==="ai-cell"},draw:(t,e)=>{const{ctx:n,theme:r,rect:s,requestAnimationFrame:a,frameTime:c}=t,{prompt:d,result:l,status:i="idle",error:u}=e.data;if(i==="done"&&l!==void 0)return be(t,l,e.contentAlign),!0;if(i==="streaming"&&l!==void 0&&l!=="")return be(t,l,e.contentAlign),a(),!0;if(i==="pending"||i==="streaming"){const g=1+Math.floor(c%xe/(xe/3))%3;return n.fillStyle=r.textLight,n.font=r.baseFontFull,n.textBaseline="middle",n.fillText("✦ "+".".repeat(g),s.x+r.cellHorizontalPadding,s.y+s.height/2),a(),!0}return i==="error"?(n.fillStyle=r.textMedium,n.font=r.baseFontFull,n.textBaseline="middle",n.fillText(`⚠ ${u??"error"}`,s.x+r.cellHorizontalPadding,s.y+s.height/2),!0):(n.fillStyle=r.textLight,n.font=r.baseFontFull,n.textBaseline="middle",n.fillText(d===""?"✦ (empty prompt)":`✦ ${d}`,s.x+r.cellHorizontalPadding,s.y+s.height/2),!0)},measure:(t,e,n)=>{const r=e.data.result??e.data.prompt;return ht(r,t,n.baseFontFull).width+n.cellHorizontalPadding*2},provideEditor:()=>({editor:t=>o.createElement(Ft,{value:t.value,onChange:t.onChange}),disablePadding:!0}),onPaste:(t,e)=>({...e,prompt:t,result:void 0,status:"idle",error:void 0}),onDelete:t=>_(t,{result:void 0,status:"idle",error:void 0})};function j(t){switch(t.kind){case k.Text:case k.Number:case k.Uri:return t.displayData??(t.data===void 0?"":String(t.data));case k.Markdown:case k.RowID:return t.data??"";case k.Boolean:return t.data===!0?"true":t.data===!1?"false":"";case k.Bubble:case k.Image:return t.data.join(", ");case k.Drilldown:return t.data.map(e=>e.text).join(", ");case k.Custom:return t.copyData??"";case k.Loading:case k.Protected:return"";default:return""}}function ye(t){const e=/```(?:json)?\s*([\s\S]*?)```/i.exec(t),n=[e==null?void 0:e[1],t].filter(r=>typeof r=="string");for(const r of n){const s=r.trim();try{return JSON.parse(s)}catch{}const a=[s.indexOf("["),s.indexOf("{")].filter(i=>i!==-1);if(a.length===0)continue;const c=Math.min(...a),d=s[c]==="["?"]":"}",l=s.lastIndexOf(d);if(!(l<=c))try{return JSON.parse(s.slice(c,l+1))}catch{}}}function qt(t){let e=5381;for(let n=0;n<t.length;n++)e=(e<<5)+e+t.charCodeAt(n)|0;return(e>>>0).toString(36)}function Me(t,e,n){return t.replace(/\{([^{}]+)\}/g,(r,s)=>{const a=s.trim().toLowerCase(),c=e.findIndex(d=>d.title.toLowerCase()===a||d.id!==void 0&&d.id.toLowerCase()===a);return c===-1||n[c]===void 0?r:j(n[c])})}function lt(t){const{provider:e,columns:n,getCellContent:r,gridRef:s,autoRun:a=!0,concurrency:c,system:d,onCellsEdited:l,defaultDifficulty:i="medium"}=t,u=o.useRef(l);u.current=l;const g=t.scheduler,m=o.useMemo(()=>{if(g!==void 0)return g;if(e===void 0)throw new Error("useAiCells needs a provider or a scheduler");return new Nt({provider:e,concurrency:c})},[g,e,c]),[,w]=o.useReducer(y=>y+1,0),h=o.useRef(new Map),p=o.useRef(new Map),v=o.useRef(new Set),C=o.useRef(new Set),L=o.useRef(new Map),R=o.useRef(void 0),M=o.useRef(new Map),b=o.useCallback(y=>{const f=s==null?void 0:s.current;f!=null?f.updateCells([{cell:y}]):w()},[s]),A=o.useCallback(y=>n.map((f,x)=>r([x,y])),[n,r]),E=o.useCallback((y,f,x)=>`${y[0]}:${y[1]}:${qt(`${f}\0${x.data.model??""}\0${x.data.difficulty??i}`)}`,[i]),O=o.useCallback(y=>{const f=R.current;return f===void 0?!0:y[1]>=f.y&&y[1]<f.y+f.height},[]),D=o.useCallback((y,f,x,S)=>{M.current.set(f,y),m.request(f,{prompt:x,system:d,feature:"ai-cell",context:{location:y},difficulty:S.data.difficulty??i,...S.data.model===void 0?{}:{model:S.data.model}},{priority:O(y)?1:0,onChunk:I=>{h.current.set(f,I),b(y)}}).then(I=>{h.current.delete(f),p.current.delete(f),C.current.delete(f),L.current.set(f,I);const $=r(y);if(Y($)&&u.current!==void 0){const U=_($,{result:I,status:"done",error:void 0});u.current([{location:y,value:U}])}b(y)}).catch(I=>{h.current.delete(f),C.current.delete(f),H(I)||(p.current.set(f,I instanceof Error?I.message:String(I)),b(y))})},[m,d,O,b,r,i]),T=o.useCallback(y=>{const f=r(y);if(!Y(f))return f;if(f.data.prompt.trim()==="")return _(f,{status:"idle"});const x=Me(f.data.prompt,n,A(y[1])),S=E(y,x,f),I=L.current.get(S);if(I!==void 0)if(f.data.result===I)L.current.delete(S);else return _(f,{result:I,status:"done",error:void 0});if(f.data.status==="done"&&f.data.result!==void 0&&!C.current.has(S))return m.get(S)!==f.data.result&&m.prime(S,f.data.result),f;const $=m.get(S);if($!==void 0)return _(f,{result:$,status:"done",error:void 0});const U=p.current.get(S);if(U!==void 0)return _(f,{status:"error",error:U,result:void 0});const q=h.current.get(S);return q!==void 0?_(f,{status:"streaming",result:q}):m.isPending(S)?_(f,{status:"pending",result:void 0}):(a||v.current.has(S))&&O(y)?(v.current.delete(S),D(y,S,x,f),_(f,{status:"pending",result:void 0})):_(f,{status:"idle"})},[r,n,A,E,m,a,O,D]),K=o.useCallback(y=>{R.current=y,m.cancelWhere(f=>{const x=M.current.get(f);return x!==void 0&&!(x[1]>=y.y&&x[1]<y.y+y.height)})},[m]),V=o.useCallback(y=>{const f=r(y);if(Y(f))return Me(f.data.prompt,n,A(y[1]))},[r,n,A]),N=o.useCallback(y=>{const f=r(y),x=V(y);if(x===void 0||!Y(f))return;const S=E(y,x,f);m.has(S)||m.isPending(S)||(v.current.add(S),p.current.delete(S),D(y,S,x,f),b(y))},[r,V,E,m,D,b]),P=o.useCallback(y=>{const f=r(y),x=V(y);if(x===void 0||!Y(f))return;const S=E(y,x,f);m.cancel(S),m.clearKey(S),p.current.delete(S),h.current.delete(S),C.current.add(S),v.current.add(S),D(y,S,x,f),b(y)},[r,V,E,m,D,b]),G=o.useMemo(()=>[_t],[]);return{getCellContent:T,onVisibleRegionChanged:K,customRenderers:G,scheduler:m,regenerate:P,run:N,resolvePrompt:V}}const pe={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90,hundred:100,thousand:1e3,million:1e6,billion:1e9},Vt={k:1e3,m:1e6,b:1e9,bn:1e9,mm:1e6};function it(t){let e=t.trim().toLowerCase();if(e==="")return;const n=Number(e);if(!Number.isNaN(n)&&/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/.test(e))return n;let r=!1;/^\(.*\)$/.test(e)&&(r=!0,e=e.slice(1,-1).trim()),e=e.replace(/^[-−–]/,d=>(r=!r||d==="","")),e=e.replace(/^\+/,""),e=e.replace(/^[$€£¥₹]\s*/,"").replace(/\s*(usd|eur|gbp|%|percent)$/,""),e=e.replace(/,/g,"").replace(/\s+/g," ").trim();const s=/^(\d+\.?\d*|\.\d+)\s*(k|m|b|bn|mm|thousand|million|billion)$/.exec(e);if(s!==null){const d=Vt[s[2]]??pe[s[2]],l=Number(s[1])*d;return r?-l:l}const a=Number(e);if(!Number.isNaN(a)&&e!=="")return r?-a:a;const c=e.split(/[\s-]+/);if(c.length>0&&c.every(d=>d in pe)){let d=0,l=0;for(const u of c){const g=pe[u];g===100?l=Math.max(l,1)*100:g>=1e3?(d+=Math.max(l,1)*g,l=0):l+=g}const i=d+l;return r?-i:i}}const Gt=new Set(["true","yes","y","1","on","✓","✔","x","checked","done","t"]),Ut=new Set(["false","no","n","0","off","✗","✘","unchecked","f","-","—"]);function zt(t){const e=t.trim().toLowerCase();if(Gt.has(e))return!0;if(Ut.has(e))return!1}function he(t){const e=t.trim();if(e!==""){if(/^[a-z][a-z0-9+.-]*:\/\//i.test(e)||/^(mailto|tel):/i.test(e))return e;if(/^[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(e))return`https://${e}`;if(/^[\w.+-]+@[\w-]+\.[a-z]{2,}$/i.test(e))return`mailto:${e}`}}function ce(t,e){switch(e.kind){case k.Text:{const n=t.trim();return{...e,data:n,displayData:n}}case k.Markdown:case k.RowID:return{...e,data:t.trim()};case k.Number:{const n=it(t);return n===void 0?void 0:{...e,data:n,displayData:String(n)}}case k.Boolean:{const n=zt(t);return n===void 0?void 0:{...e,data:n}}case k.Uri:{const n=he(t);return n===void 0?void 0:{...e,data:n,displayData:n}}case k.Bubble:{const n=t.split(/[,;\n]+/).map(r=>r.trim()).filter(r=>r!=="");return{...e,data:n}}case k.Image:{const n=t.split(/[\s,;]+/).map(r=>r.trim()).filter(r=>he(r)!==void 0).map(r=>he(r));return n.length===0?void 0:{...e,data:n}}default:return}}const Bt=new Set(["contains","notContains","eq","neq","gt","gte","lt","lte","startsWith","endsWith","empty","notEmpty","in"]),Kt={"=":"eq","==":"eq",equals:"eq",is:"eq","!=":"neq","<>":"neq",not:"neq",isnot:"neq",">":"gt",after:"gt",greater:"gt",">=":"gte","<":"lt",before:"lt",less:"lt","<=":"lte",includes:"contains",like:"contains",has:"contains",excludes:"notContains",startswith:"startsWith",endswith:"endsWith",isempty:"empty",isnotempty:"notEmpty",oneof:"in",any:"in"};function jt(t){const e=ye(t);if(e==null||typeof e!="object")return;const n=e,r=Array.isArray(n.clauses)?n.clauses:Array.isArray(e)?e:void 0;if(r===void 0)return;const s=[];for(const c of r){if(c===null||typeof c!="object")continue;const{column:d,op:l,value:i}=c;if(typeof d!="string"||typeof l!="string")continue;const u=l.trim(),g=Bt.has(u)?u:Kt[u.toLowerCase().replace(/[\s_-]/g,"")];if(g===void 0)continue;const m=i==null?void 0:Array.isArray(i)?i.filter(w=>typeof w=="string"||typeof w=="number"):typeof i=="string"||typeof i=="number"||typeof i=="boolean"?i:String(i);s.push({column:d,op:g,value:m})}return s.length===0?void 0:{conjunction:n.conjunction==="or"?"or":"and",clauses:s}}function Ae(t){if(typeof t=="number")return Number.isNaN(t)?void 0:t;if(typeof t=="boolean")return t?1:0;if(typeof t=="string"){const e=it(t);if(e!==void 0)return e;const n=Date.parse(t);return Number.isNaN(n)?void 0:n}}function ne(t,e){const n=Ae(t),r=Ae(e);if(n!==void 0&&r!==void 0)return n===r?0:n<r?-1:1;const s=String(e??"");return t.localeCompare(s,void 0,{sensitivity:"base",numeric:!0})}function Wt(t,e){const n=j(t),r=n.toLowerCase(),s=e.value,a=s===void 0?"":String(s).toLowerCase();switch(e.op){case"contains":return r.includes(a);case"notContains":return!r.includes(a);case"startsWith":return r.startsWith(a);case"endsWith":return r.endsWith(a);case"empty":return n.trim()==="";case"notEmpty":return n.trim()!=="";case"in":return(Array.isArray(s)?s:s===void 0?[]:[s]).some(d=>ne(n,d)===0);case"eq":return ne(n,s)===0;case"neq":return ne(n,s)!==0;case"gt":case"gte":case"lt":case"lte":{const c=ne(n,s);return c===void 0?!1:e.op==="gt"?c>0:e.op==="gte"?c>=0:e.op==="lt"?c<0:c<=0}default:return!1}}function Jt(t,e){const n=e.trim().toLowerCase();return t.findIndex(r=>r.title.toLowerCase()===n||r.id!==void 0&&r.id.toLowerCase()===n)}function Ht(t,e,n){const r=t.clauses.map(s=>{const a=Jt(e,s.column),c=a===-1?void 0:n[a];return c===void 0?!1:Wt(c,s)});return t.conjunction==="or"?r.some(Boolean):r.every(Boolean)}function Qt(t,e){const n=t.trim().toLowerCase();if(n==="")return[];const r=[];return e.forEach((s,a)=>{j(s).toLowerCase().includes(n)&&r.push(a)}),r}const Yt={text:"text",number:"number",boolean:"boolean",uri:"url",markdown:"text",bubble:"tags",image:"image urls",drilldown:"text",custom:"text",loading:"text",protected:"text","row-id":"id"};function Xt(t,e,n){const r=e.map((s,a)=>{var l,i;const c=(i=(l=n[0])==null?void 0:l[a])==null?void 0:i.kind,d=n.map(u=>j(u[a]??{kind:"loading"})).filter(u=>u!=="").slice(0,3);return`- "${s.title}" (${Yt[c??"text"]??"text"})${d.length>0?` e.g. ${d.map(u=>JSON.stringify(u)).join(", ")}`:""}`});return[`Translate this search into a filter over a table. Query: ${JSON.stringify(t)}`,"Columns:",...r,'Reply with ONLY JSON: {"conjunction": "and"|"or", "clauses": [{"column": "<column title>", "op": <op>, "value": <value>}]}',"Allowed ops: contains, notContains, eq, neq, gt, gte, lt, lte, startsWith, endsWith, empty, notEmpty, in (value is an array).","Use column titles exactly as listed. Dates as ISO strings. If the query is just a word to look for, use contains on the most likely column."].join(`
`)}const Le={status:"idle",spec:void 0,error:void 0,matchedRows:[],matchedCells:new Map};function ct(t){const{provider:e,columns:n,rows:r,getCellContent:s,query:a,debounceMs:c=300,maxRows:d=5e4,sampleRows:l=3}=t,[i,u]=o.useState(Le),g=o.useRef(new Map),m=o.useCallback(p=>n.map((v,C)=>s([C,p])),[n,s]),w=o.useCallback(p=>{const v=[],C=new Map,L=Math.min(r,d);for(let R=0;R<L;R++){const M=Qt(p,m(R));M.length>0&&(v.push(R),C.set(R,M))}return{matchedRows:v,matchedCells:C}},[r,d,m]),h=o.useCallback(p=>{const v=[],C=new Map,L=Math.min(r,d),R=p.clauses.map(b=>n.findIndex(A=>{var E;return A.title.toLowerCase()===b.column.trim().toLowerCase()||((E=A.id)==null?void 0:E.toLowerCase())===b.column.trim().toLowerCase()})).filter(b=>b!==-1),M=R.length>0?[...new Set(R)]:[0];for(let b=0;b<L;b++)Ht(p,n,m(b))&&(v.push(b),C.set(b,M));return{matchedRows:v,matchedCells:C}},[r,d,n,m]);return o.useEffect(()=>{const p=a.trim();if(p===""){u(Le);return}const v=w(p),C=g.current.get(p);if(C!==void 0){u({status:"compiled",spec:C,error:void 0,...h(C)});return}if(e===void 0){u({status:"literal",spec:void 0,error:void 0,...v});return}u({status:"compiling",spec:void 0,error:void 0,...v});const L=new AbortController,R=setTimeout(async()=>{try{const M=Array.from({length:Math.min(l,r)},(E,O)=>m(O)),b=await de(e.complete({prompt:Xt(p,n,M),system:"You translate search queries into JSON filters. Reply with JSON only.",feature:"search",difficulty:"low"},{signal:L.signal}),void 0,L.signal);if(L.signal.aborted)return;const A=jt(b);if(A===void 0){u({status:"literal",spec:void 0,error:"The model did not return a usable filter",...v});return}g.current.set(p,A),u({status:"compiled",spec:A,error:void 0,...h(A)})}catch(M){if(H(M)||L.signal.aborted)return;u({status:"error",spec:void 0,error:M instanceof Error?M.message:String(M),...v})}},c);return()=>{clearTimeout(R),L.abort()}},[a,e,n,r,c,l,m,w,h]),i}function Zt(t){const[e,n]=o.useState(""),[r,s]=o.useState(!1),a=ct({...t,query:e}),c=o.useMemo(()=>{const u=[];for(const g of a.matchedRows)for(const m of a.matchedCells.get(g)??[0])u.push([m,g]);return u},[a.matchedRows,a.matchedCells]),d=o.useCallback(u=>n(u),[]),l=o.useCallback(()=>s(!0),[]),i=o.useCallback(()=>s(!1),[]);return{searchValue:e,onSearchValueChange:d,searchResults:c,showSearch:r,onSearchClose:i,setSearchValue:n,openSearch:l,closeSearch:i,status:a.status,spec:a.spec,error:a.error,matchedRows:a.matchedRows}}function en(t){const{getCellContent:e,rows:n,query:r}=t,s=ct(t),a=r.trim()!=="",c=s.matchedRows,d=o.useCallback(i=>a?c[i]??i:i,[a,c]),l=o.useCallback(([i,u])=>e([i,d(u)]),[e,d]);return{rows:a?c.length:n,getCellContent:a?l:e,getOriginalIndex:d,status:s.status,spec:s.spec,error:s.error}}function tn(t){const{source:e,toCell:n,onEdited:r,flushIntervalMs:s=50,autoStart:a=!0,initialRows:c}=t,[d,l]=o.useState(c??[]),[i,u]=o.useState("idle"),[g,m]=o.useState(void 0),w=o.useRef([...c??[]]),h=o.useRef(void 0),p=o.useRef([]),v=o.useRef(void 0),[C,L]=o.useState(a?1:0),R=o.useRef(e);R.current=e;const M=o.useRef(r);M.current=r;const b=o.useCallback(()=>{v.current=void 0,p.current.length!==0&&(w.current.push(...p.current),p.current=[],l([...w.current]))},[]),A=o.useCallback(()=>{v.current===void 0&&(v.current=setTimeout(b,s))},[b,s]),E=o.useCallback(()=>{var N;(N=h.current)==null||N.abort(),h.current=void 0,v.current!==void 0&&clearTimeout(v.current),b(),u(P=>P==="streaming"?"cancelled":P)},[b]),O=o.useCallback(()=>{var N;(N=h.current)==null||N.abort(),h.current=void 0,v.current!==void 0&&clearTimeout(v.current),v.current=void 0,p.current=[],w.current=[],l([]),u("idle"),m(void 0)},[]),D=o.useCallback(()=>{O(),L(N=>N+1)},[O]);o.useEffect(()=>{if(C===0)return;const N=new AbortController;return h.current=N,u("streaming"),m(void 0),(async()=>{try{for await(const P of R.current(N.signal)){if(N.signal.aborted)break;Array.isArray(P)?p.current.push(...P):p.current.push(P),A()}if(N.signal.aborted)return;v.current!==void 0&&clearTimeout(v.current),b(),u("done")}catch(P){if(N.signal.aborted||H(P))return;v.current!==void 0&&clearTimeout(v.current),b(),m(P instanceof Error?P.message:String(P)),u("error")}finally{h.current===N&&(h.current=void 0)}})(),()=>{N.abort()}},[C,A,b]);const T=o.useCallback(([N,P])=>{const G=w.current[P];return G===void 0?{kind:"loading",allowOverlay:!1}:n(G,N,P)},[n]),K=o.useCallback(N=>{const P=M.current;if(P===void 0)return!0;let G=!1;const y=[];for(const f of N){const[x,S]=f.location,I=w.current[S];if(I===void 0)continue;const $=P(I,x,f.value,S),U=q=>{q!==void 0&&(w.current[S]=q,G=!0)};$ instanceof Promise?y.push($.then(q=>{q!==void 0&&(w.current[S]=q,l([...w.current]))})):U($)}return G&&l([...w.current]),!0},[]),V=o.useCallback(N=>{w.current.push(...N),l([...w.current])},[]);return{rows:d.length,data:d,getCellContent:T,onCellsEdited:K,status:i,error:g,start:D,stop:E,reset:O,appendRows:V}}const nn={[k.Number]:"a plain number (digits, optional decimal point, no units)",[k.Boolean]:"true or false",[k.Uri]:"an absolute URL",[k.Bubble]:"a comma-separated list of short tags",[k.Image]:"a comma-separated list of image URLs",[k.Text]:"plain text"};function rn(t){return["Convert each pasted text into the value the column expects. Interpret dates, numbers written as words, currencies, and yes/no phrasing.",'Reply with ONLY a JSON array of objects {"i": <index>, "value": <string>} — omit entries you cannot convert.',...t.map((n,r)=>`${r}. column "${n.column}" expects ${nn[n.target.kind]??"plain text"}; pasted text: ${JSON.stringify(n.text)}`)].join(`
`)}function on(t){const{provider:e,columns:n,getCellContent:r,onCellsEdited:s,batchSize:a=50}=t,[c,d]=o.useState(0),[l,i]=o.useState(void 0),u=o.useRef(s);u.current=s;const g=o.useCallback((h,p)=>ce(h,p),[]),m=o.useCallback(async h=>{if(!(e===void 0||h.length===0)){d(p=>p+h.length);try{const p=new AbortController,v=await de(e.complete({prompt:rn(h),system:"You convert pasted spreadsheet text into typed cell values. Reply with JSON only.",feature:"smart-paste",difficulty:"low"},{signal:p.signal}),void 0,p.signal),C=ye(v),L=[];if(Array.isArray(C))for(const R of C){if(R===null||typeof R!="object")continue;const M=h[Number(R.i)];if(M===void 0)continue;const b=ce(String(R.value??""),M.target);b!==void 0&&L.push({location:M.location,value:b})}L.length>0&&u.current(L),i(void 0)}catch(p){H(p)||i(p instanceof Error?p.message:String(p))}finally{d(p=>Math.max(0,p-h.length))}}},[e]),w=o.useCallback((h,p)=>{if(e===void 0)return!0;const v=[];p.forEach((C,L)=>{C.forEach((R,M)=>{var E;const b=[h[0]+M,h[1]+L];if(b[0]>=n.length)return;const A=r(b);R.trim()===""||A.kind===k.Text||A.kind===k.Custom||ce(R,A)===void 0&&v.push({index:v.length,location:b,text:R,target:A,column:((E=n[b[0]])==null?void 0:E.title)??String(b[0])})})});for(let C=0;C<v.length;C+=a)m(v.slice(C,C+a));return!0},[e,n,r,a,m]);return{coercePasteValue:g,onPaste:w,pending:c,lastError:l}}function Oe(t){return t===void 0?[]:t.toArray()}function sn(t,e,n){const r=new Set(Oe(t.rows)),s=new Set(Oe(t.columns)),a=t.current===void 0?[]:[t.current.range,...t.current.rangeStack];for(const l of a){for(let i=l.y;i<l.y+l.height;i++)r.add(i);for(let i=l.x;i<l.x+l.width;i++)s.add(i)}if(r.size===0&&s.size>0)for(let l=0;l<e;l++)r.add(l);const c=[...r].filter(l=>l>=0&&l<e).sort((l,i)=>l-i),d=[...s].filter(l=>l>=0&&l<n).sort((l,i)=>l-i);return{rows:c,columns:t.rows.length>0&&d.length===0?void 0:d.length>0?d:void 0}}function an(t,e,n,r){const s=n.map(a=>`"${e[a].title}"`).join(", ");return[`Instruction: ${JSON.stringify(t)}`,`Editable columns: ${s}. Only these may be changed.`,"Rows (JSON, one per line):",...r.map(a=>JSON.stringify({row:a.row,...a.values})),'Reply with ONLY a JSON array of changes: [{"row": <row>, "column": "<column title>", "value": "<new value>"}]. Omit rows that need no change.'].join(`
`)}function ln(t){const{provider:e,columns:n,rows:r,getCellContent:s,onCellsEdited:a,maxRows:c=200,highlightColor:d="rgba(79, 93, 255, 0.25)"}=t,[l,i]=o.useState("idle"),[u,g]=o.useState(void 0),[m,w]=o.useState(void 0),h=o.useRef(void 0),p=o.useCallback(async(R,M)=>{var D;const b="rows"in M&&Array.isArray(M.rows)?M:sn(M,r,n.length),A=b.rows,E=b.columns??n.map((T,K)=>K);if((D=h.current)==null||D.abort(),A.length===0||E.length===0){g("Select the rows or cells to edit first"),i("error");return}if(A.length>c){g(`Too many rows selected (${A.length}); the limit is ${c}`),i("error");return}const O=new AbortController;h.current=O,i("proposing"),g(void 0),w(void 0);try{const T=A.map(x=>{const S={};for(const I of E)S[n[I].title]=j(s([I,x]));return{row:x,values:S}}),K=await de(e.complete({prompt:an(R,n,E,T),system:"You edit spreadsheet rows exactly as instructed and reply with JSON only.",feature:"bulk-edit",difficulty:"high"},{signal:O.signal}),void 0,O.signal);if(O.signal.aborted)return;const V=ye(K),N=new Set(A),P=[],G=new Set;let y=0;for(const x of Array.isArray(V)?V:[]){if(x===null||typeof x!="object"){y++;continue}const S=Number(x.row),I=String(x.column??"").trim().toLowerCase(),$=E.find(we=>{var Ce;return n[we].title.toLowerCase()===I||((Ce=n[we].id)==null?void 0:Ce.toLowerCase())===I});if(!N.has(S)||$===void 0||G.has(`${$}:${S}`)){y++;continue}const U=[$,S],q=s(U),te=ce(String(x.value??""),q);if(te===void 0){y++;continue}j(te)!==j(q)&&(G.add(`${$}:${S}`),P.push({location:U,value:te}))}const f={instruction:R,edits:P,rejected:y};return w(f),i("proposed"),f}catch(T){if(H(T)||O.signal.aborted)return;g(T instanceof Error?T.message:String(T)),i("error");return}},[e,n,r,s,c]),v=o.useCallback(()=>{m!==void 0&&(m.edits.length>0&&a(m.edits),w(void 0),i("idle"))},[m,a]),C=o.useCallback(()=>{var R;(R=h.current)==null||R.abort(),w(void 0),i("idle"),g(void 0)},[]),L=o.useMemo(()=>{if(!(m===void 0||m.edits.length===0))return m.edits.map(R=>({color:d,range:{x:R.location[0],y:R.location[1],width:1,height:1},style:"solid"}))},[m,d]);return{status:l,error:u,proposal:m,propose:p,apply:v,discard:C,highlightRegions:L}}const Cn={title:"Extra Packages/AI",parameters:{layout:"fullscreen"}},ge=["Engineering","Sales","Ops","Design"],Ne=["Ada","Grace","Linus","Mia","Noor","Ken","Sara","Yuki","Omar","Lea"],Pe=["Lovelace","Hopper","Torvalds","Chen","Haddad","Sato","Okafor","Ruiz","Novak","Berg"];function me(t){return Array.from({length:t},(e,n)=>({name:`${Ne[n%Ne.length]} ${Pe[n*7%Pe.length]}`,dept:ge[n*3%ge.length],age:22+n*13%40,notes:["Ships weekly","Owns the roadmap","Mentors juniors","Runs on-call","Leads hiring"][n%5]}))}const F=t=>({kind:k.Text,data:t,displayData:t,allowOverlay:!0}),ee=t=>({kind:k.Number,data:t,displayData:String(t),allowOverlay:!0}),J=({title:t,blurb:e,children:n,aside:r})=>o.createElement("div",{style:{padding:24,fontFamily:"Inter, system-ui, sans-serif",color:"#1a1a1a",background:"#f6f7fb",minHeight:"100vh",boxSizing:"border-box"}},o.createElement("h2",{style:{margin:"0 0 4px"}},t),o.createElement("p",{style:{margin:"0 0 12px",color:"#555",maxWidth:720}},e),r!==void 0&&o.createElement("div",{style:{margin:"0 0 12px",fontSize:13}},r),o.createElement("div",{style:{width:"100%",height:460,background:"white",borderRadius:8,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.12)"}},n)),re=()=>{const t=o.useMemo(()=>me(40),[]),e=o.useMemo(()=>[{title:"Name",id:"name",width:160},{title:"Dept",id:"dept",width:120},{title:"Notes",id:"notes",width:180},{title:"Intro (AI)",id:"intro",width:420}],[]),n=o.useMemo(()=>Q(i=>{var m,w,h,p;return`${((m=/for (.+?):/.exec(i.prompt))==null?void 0:m[1])??"them"} is a ${((w=/in ([A-Za-z]+)/.exec(i.prompt))==null?void 0:w[1])??"team"} teammate who ${((p=(h=/who (.+)$/.exec(i.prompt))==null?void 0:h[1])==null?void 0:p.toLowerCase())??"does great work"}.`.split(" ").map((v,C)=>C===0?v:` ${v}`)},{delayMs:60}),[]),[r,s]=o.useState(()=>new Map),a=o.useCallback(([i,u])=>{const g=t[u];return i===0?F(g.name):i===1?F(g.dept):i===2?F(g.notes):r.get(u)??fe("Write one friendly sentence for {Name}: they work in {Dept} and are someone who {Notes}")},[t,r]),c=o.useCallback(i=>(s(u=>{const g=new Map(u);for(const m of i)m.location[0]===3&&g.set(m.location[1],m.value);return g}),!0),[]),d=o.useRef(null),l=lt({provider:n,columns:e,getCellContent:a,gridRef:d,concurrency:3,onCellsEdited:c});return o.createElement(J,{title:"AI cells — =AI() formulas",blurb:"The last column is an AI cell whose prompt references the row's other cells. Cells generate as they scroll into view, stream their text, cache by prompt, and cancel when scrolled away. Finished results are handed to onCellsEdited so your app can persist them; double-click a cell to edit the prompt or regenerate.",aside:o.createElement("span",null,"saved results: ",o.createElement("b",null,r.size)," · model calls: ",o.createElement("b",null,n.calls.length),o.createElement("button",{style:{marginLeft:12},onClick:()=>s(new Map)},"Forget saved results"))},o.createElement(W,{ref:d,columns:e,rows:t.length,getCellContent:l.getCellContent,customRenderers:l.customRenderers,onVisibleRegionChanged:l.onVisibleRegionChanged,onCellsEdited:c,rowMarkers:"number",smoothScrollY:!0}))};function ut(t){var a,c;const e=((c=(a=/Query: "(.+?)"/.exec(t.prompt))==null?void 0:a[1])==null?void 0:c.toLowerCase())??"",n=[];for(const d of ge)e.includes(d.toLowerCase().slice(0,5))&&n.push({column:"Dept",op:"eq",value:d});const r=/(?:over|above|older than) (\d+)/.exec(e);r&&n.push({column:"Age",op:"gt",value:Number(r[1])});const s=/(?:under|below|younger than) (\d+)/.exec(e);return s&&n.push({column:"Age",op:"lt",value:Number(s[1])}),e.includes("mentor")&&n.push({column:"Notes",op:"contains",value:"mentor"}),n.length===0&&n.push({column:"Name",op:"contains",value:e.split(" ")[0]??e}),JSON.stringify({conjunction:"and",clauses:n})}const ue=[{title:"Name",width:180},{title:"Dept",width:130},{title:"Age",width:80},{title:"Notes",width:200}],dt=t=>([e,n])=>{const r=t[n];return e===0?F(r.name):e===1?F(r.dept):e===2?ee(r.age):F(r.notes)},oe=()=>{const t=o.useMemo(()=>me(300),[]),e=o.useMemo(()=>dt(t),[t]),n=o.useMemo(()=>Q(ut,{delayMs:400}),[]),r=Zt({provider:n,columns:ue,rows:t.length,getCellContent:e});return o.createElement(J,{title:"Natural-language search",blurb:'Type into the box (or press Ctrl/⌘+F in the grid): literal matches highlight instantly, then the model compiles the query into a filter — try "engineers over 40" or "sales who mentor". The model only sees column names and a few sample values, never the table.',aside:o.createElement("span",null,o.createElement("input",{value:r.searchValue??"",onChange:s=>r.setSearchValue(s.target.value),placeholder:'e.g. "engineers over 40"',style:{padding:6,width:280,marginRight:12}}),"status: ",o.createElement("b",null,r.status)," · matches: ",o.createElement("b",null,r.matchedRows.length),r.spec!==void 0&&o.createElement("code",{style:{marginLeft:12,fontSize:12}},JSON.stringify(r.spec.clauses)))},o.createElement(W,{columns:ue,rows:t.length,getCellContent:e,searchValue:r.searchValue,onSearchValueChange:r.onSearchValueChange,searchResults:r.searchResults,showSearch:r.showSearch,onSearchClose:r.onSearchClose,getCellsForSelection:!0,rowMarkers:"number"}))},se=()=>{const t=o.useMemo(()=>me(300),[]),e=o.useMemo(()=>dt(t),[t]),n=o.useMemo(()=>Q(ut,{delayMs:400}),[]),[r,s]=o.useState(""),a=en({provider:n,columns:ue,rows:t.length,getCellContent:e,query:r});return o.createElement(J,{title:"Natural-language filter",blurb:'Rows that do not match the query are hidden — the same compiled filter as search, applied as a row permutation like useColumnSort. Try "design under 30".',aside:o.createElement("span",null,o.createElement("input",{value:r,onChange:c=>s(c.target.value),placeholder:"filter rows…",style:{padding:6,width:280,marginRight:12}}),"status: ",o.createElement("b",null,a.status)," · showing ",o.createElement("b",null,a.rows)," of ",t.length)},o.createElement(W,{columns:ue,rows:a.rows,getCellContent:a.getCellContent,rowMarkers:"number"}))};async function*cn(t){const e=["Acme","Globex","Initech","Umbrella","Hooli","Stark","Wayne","Wonka","Tyrell","Cyberdyne","Aperture","Vandelay"],n=["Hiring a VP Sales","Raised Series B","Launched pricing page","Opened EU office","Sponsoring a conference"];for(let r=0;r<e.length;r++){if(await new Promise(s=>setTimeout(s,350)),t.aborted)return;yield{company:e[r],signal:n[r%n.length],confidence:60+r*17%40}}}const ae=()=>{const t=o.useMemo(()=>[{title:"Company",width:160},{title:"Signal",width:260},{title:"Confidence",width:120}],[]),e=o.useCallback((r,s)=>s===0?F(r.company):s===1?F(r.signal):ee(r.confidence),[]),n=tn({source:cn,toCell:e,onEdited:(r,s,a)=>s===2&&a.kind===k.Number?{...r,confidence:a.data??r.confidence}:s===1&&a.kind===k.Text?{...r,signal:a.data}:void 0});return o.createElement(J,{title:"Agent-fed data source",blurb:"The grid is the agent's output surface: rows stream in as a (simulated) research agent finds them, the grid stays fully interactive, and your edits flow back through onEdited so the agent can react.",aside:o.createElement("span",null,"status: ",o.createElement("b",null,n.status)," · rows: ",o.createElement("b",null,n.rows),o.createElement("button",{onClick:n.start,style:{marginLeft:12}},"Restart"),o.createElement("button",{onClick:n.stop,style:{marginLeft:6}},"Stop"),n.error!==void 0&&o.createElement("span",{style:{color:"crimson",marginLeft:12}},n.error))},o.createElement(W,{columns:t,rows:n.rows,getCellContent:n.getCellContent,onCellsEdited:n.onCellsEdited,rowMarkers:"number"}))},un={ten:"10","a dozen":"12","half a hundred":"50",yep:"true",nope:"false",affirmative:"true",negative:"false","next tuesday":"2026-09-08"},le=()=>{const t=o.useMemo(()=>[{title:"Item",width:160},{title:"Qty",width:100},{title:"In stock",width:100},{title:"Link",width:260}],[]),[e,n]=o.useState(()=>Array.from({length:12},(d,l)=>({item:`SKU-${100+l}`,qty:l*3,stock:l%2===0,link:""}))),r=o.useCallback(([d,l])=>{const i=e[l];return d===0?F(i.item):d===1?ee(i.qty):d===2?{kind:k.Boolean,data:i.stock,allowOverlay:!1}:{kind:k.Uri,data:i.link,displayData:i.link,allowOverlay:!0}},[e]),s=o.useCallback(d=>(n(l=>{const i=l.map(u=>({...u}));for(const u of d){const g=i[u.location[1]];if(g===void 0)continue;const m=u.value;u.location[0]===1&&m.kind===k.Number?g.qty=m.data??0:u.location[0]===2&&m.kind===k.Boolean?g.stock=m.data===!0:u.location[0]===3&&m.kind===k.Uri?g.link=m.data:u.location[0]===0&&m.kind===k.Text&&(g.item=m.data)}return i}),!0),[]),a=o.useMemo(()=>Q(d=>{const l=[];for(const i of d.prompt.matchAll(/^(\d+)\. .*pasted text: "(.+)"$/gm)){const u=un[i[2].toLowerCase()];u!==void 0&&l.push({i:Number(i[1]),value:u})}return JSON.stringify(l)},{delayMs:500}),[]),c=on({provider:a,columns:t,getCellContent:r,onCellsEdited:s});return o.createElement(J,{title:"Smart paste",blurb:'Copy some text and paste it into the Qty / In stock / Link columns: "$1,200", "twelve", "yes", "example.com" are coerced instantly; things like "a dozen" or "affirmative" go to the model in one batched call and are corrected a moment later.',aside:o.createElement("span",null,"pending model corrections: ",o.createElement("b",null,c.pending),c.lastError!==void 0&&o.createElement("span",{style:{color:"crimson"}}," · ",c.lastError))},o.createElement(W,{columns:t,rows:e.length,getCellContent:r,onCellsEdited:s,coercePasteValue:c.coercePasteValue,onPaste:c.onPaste,getCellsForSelection:!0,rowMarkers:"number"}))},ie=()=>{const t=o.useMemo(()=>[{title:"Order",width:140},{title:"Status",width:120},{title:"Qty",width:90},{title:"Customer",width:200}],[]),[e,n]=o.useState(()=>Array.from({length:15},(g,m)=>({order:`#${1e3+m}`,status:m%3===0?"shipped":"open",qty:1+m%6,customer:me(15)[m].name}))),r=o.useCallback(([g,m])=>{const w=e[m];return g===0?F(w.order):g===1?F(w.status):g===2?ee(w.qty):F(w.customer)},[e]),s=o.useCallback(g=>(n(m=>{const w=m.map(h=>({...h}));for(const h of g){const p=w[h.location[1]],v=h.value;p!==void 0&&(h.location[0]===1&&v.kind===k.Text&&(p.status=v.data),h.location[0]===2&&v.kind===k.Number&&(p.qty=v.data??p.qty),h.location[0]===3&&v.kind===k.Text&&(p.customer=v.data))}return w}),!0),[]),a=o.useMemo(()=>Q(g=>{var p,v;const m=((v=(p=/Instruction: "(.+?)"/.exec(g.prompt))==null?void 0:p[1])==null?void 0:v.toLowerCase())??"",w=[...g.prompt.matchAll(/^\{"row":(\d+),(.*)\}$/gm)].map(C=>({row:Number(C[1]),json:JSON.parse(`{${C[2]}}`)})),h=[];for(const C of w)m.includes("ship")&&h.push({row:C.row,column:"Status",value:"shipped"}),m.includes("double")&&h.push({row:C.row,column:"Qty",value:String(Number(C.json.Qty)*2)}),m.includes("upper")&&h.push({row:C.row,column:"Customer",value:(C.json.Customer??"").toUpperCase()});return JSON.stringify(h)},{delayMs:600}),[]),[c,d]=o.useState({rows:ke.empty(),columns:ke.empty()}),[l,i]=o.useState("mark them as shipped"),u=ln({provider:a,columns:t,rows:e.length,getCellContent:r,onCellsEdited:s});return o.createElement(J,{title:"Bulk edit in plain language",blurb:'Select some rows (click the row markers), type an instruction such as "mark them as shipped", "double the quantity", or "uppercase the customer", and propose. The model returns edits, the grid previews them as highlights, and nothing is written until you apply.',aside:o.createElement("span",null,o.createElement("input",{value:l,onChange:g=>i(g.target.value),style:{padding:6,width:260,marginRight:8}}),o.createElement("button",{onClick:()=>void u.propose(l,c),disabled:u.status==="proposing"},"Propose"),o.createElement("button",{onClick:u.apply,disabled:u.proposal===void 0,style:{marginLeft:6}},"Apply ",u.proposal!==void 0?`(${u.proposal.edits.length})`:""),o.createElement("button",{onClick:u.discard,disabled:u.proposal===void 0,style:{marginLeft:6}},"Discard"),o.createElement("span",{style:{marginLeft:12}},"status: ",o.createElement("b",null,u.status)),u.error!==void 0&&o.createElement("span",{style:{color:"crimson",marginLeft:12}},u.error))},o.createElement(W,{columns:t,rows:e.length,getCellContent:r,onCellsEdited:s,gridSelection:c,onGridSelectionChange:d,highlightRegions:u.highlightRegions,rowMarkers:"both",rowSelect:"multi"}))},Ie={anthropic:"claude-opus-5",openai:"gpt-5",codex:"gpt-5-codex",grok:"grok-4",openrouter:"openrouter/auto"},De={anthropic:"claude-haiku-4-5",openai:"gpt-5-mini",codex:"gpt-5-codex",grok:"grok-4",openrouter:"openrouter/auto"};function dn(t,e,n){const r={apiKey:e,model:n,dangerouslyAllowBrowser:!0};switch(t){case"anthropic":return wt(r);case"openai":return st(r);case"codex":return kt(r);case"grok":return Rt(r);case"openrouter":return At({...r,site:{title:"tengrids Storybook"}})}}const X={padding:6,marginRight:8},Z=()=>{const[t,e]=o.useState("anthropic"),[n,r]=o.useState(""),[s,a]=o.useState(Ie.anthropic),[c,d]=o.useState(De.anthropic),[l,i]=o.useState(void 0),[u,g]=o.useState(1.2),m=o.useMemo(()=>[{name:"Standing desk",cost:349,notes:"Bamboo top, dual motor"},{name:"Task chair",cost:189.5,notes:"Mesh back, lumbar support"},{name:"Monitor arm",cost:79,notes:"Fits 17–32 inch, gas spring"},{name:"Desk lamp",cost:42.25,notes:"Warm/cool dimming"},{name:"Cable tray",cost:24,notes:"Under-desk, steel"},{name:"Footrest",cost:31,notes:"Adjustable tilt"}],[]),w=o.useMemo(()=>[{title:"Product",id:"product",width:150},{title:"Cost",id:"cost",width:90},{title:"Notes",id:"notes",width:200},{title:`Cost × ${u} (AI)`,id:"scaled",width:150},{title:"Pitch (AI)",id:"pitch",width:360}],[u]),[h,p]=o.useState(()=>new Map),v=o.useCallback(([E,O])=>{const D=m[O];if(E===0)return F(D.name);if(E===1)return ee(D.cost);if(E===2)return F(D.notes);const T=h.get(`${E}:${O}`);return T!==void 0?T:E===3?fe(`Multiply {Cost} by ${u}. Reply with only the resulting number, two decimals, no currency symbol.`,{model:c,difficulty:"low",cell:{contentAlign:"right"}}):fe("Write one punchy sales sentence for {Product} ({Notes}) priced at {Cost}.",{model:s,difficulty:"high"})},[m,h,u,c,s]),C=o.useCallback(E=>(p(O=>{const D=new Map(O);for(const T of E)D.set(`${T.location[0]}:${T.location[1]}`,T.value);return D}),!0),[]),L=o.useRef(null),R=o.useMemo(()=>Q(()=>"(connect a provider above to generate)"),[]),M=o.useMemo(()=>l===void 0?R:Ot({default:l.provider,models:{[c]:l.provider,[s]:l.provider}}),[l,R,c,s]),b=lt({provider:M,columns:w,getCellContent:v,gridRef:L,onCellsEdited:C,concurrency:2}),A=()=>{n.trim()!==""&&(p(new Map),i({provider:dn(t,n.trim(),s),label:`${t} · ${s} / ${c}`}))};return o.createElement(J,{title:"Live providers — Claude, OpenAI/Codex, Grok, OpenRouter",blurb:"Paste a key for the vendor you choose (it stays in this page's memory only), then connect. The Cost × factor column reads each row's Cost cell, multiplies it, and prints the result in a new cell using the cheap model; the Pitch column uses the strong model. Double-click any AI cell to change its prompt, model, or difficulty. Browser-direct calls are for experimenting — production apps should route through their own backend.",aside:o.createElement("span",{style:{display:"inline-flex",flexWrap:"wrap",gap:6,alignItems:"center"}},o.createElement("select",{style:X,value:t,onChange:E=>{const O=E.target.value;e(O),a(Ie[O]),d(De[O])}},o.createElement("option",{value:"anthropic"},"Claude (Anthropic)"),o.createElement("option",{value:"openai"},"OpenAI"),o.createElement("option",{value:"codex"},"Codex (OpenAI)"),o.createElement("option",{value:"grok"},"Grok (xAI)"),o.createElement("option",{value:"openrouter"},"OpenRouter")),o.createElement("input",{style:X,type:"password",placeholder:"API key",value:n,onChange:E=>r(E.target.value)}),o.createElement("input",{style:X,value:s,onChange:E=>a(E.target.value),title:"strong model"}),o.createElement("input",{style:X,value:c,onChange:E=>d(E.target.value),title:"cheap model"}),o.createElement("label",null,"factor"," ",o.createElement("input",{style:{...X,width:60},type:"number",step:"0.1",value:u,onChange:E=>{g(Number(E.target.value)||1),p(new Map)}})),o.createElement("button",{onClick:A,disabled:n.trim()===""},"Connect"),o.createElement("span",null,l===void 0?"not connected":`connected: ${l.label}`," · saved results: ",o.createElement("b",null,h.size)))},o.createElement(W,{ref:L,columns:w,rows:m.length,getCellContent:b.getCellContent,customRenderers:b.customRenderers,onVisibleRegionChanged:b.onVisibleRegionChanged,onCellsEdited:C,rowMarkers:"number"}))};var Te,$e,Fe;re.parameters={...re.parameters,docs:{...(Te=re.parameters)==null?void 0:Te.docs,source:{originalSource:`() => {
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
}`,...(Fe=($e=re.parameters)==null?void 0:$e.docs)==null?void 0:Fe.source}}};var _e,qe,Ve;oe.parameters={...oe.parameters,docs:{...(_e=oe.parameters)==null?void 0:_e.docs,source:{originalSource:`() => {
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
}`,...(Ve=(qe=oe.parameters)==null?void 0:qe.docs)==null?void 0:Ve.source}}};var Ge,Ue,ze;se.parameters={...se.parameters,docs:{...(Ge=se.parameters)==null?void 0:Ge.docs,source:{originalSource:`() => {
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
}`,...(ze=(Ue=se.parameters)==null?void 0:Ue.docs)==null?void 0:ze.source}}};var Be,Ke,je;ae.parameters={...ae.parameters,docs:{...(Be=ae.parameters)==null?void 0:Be.docs,source:{originalSource:`() => {
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
}`,...(je=(Ke=ae.parameters)==null?void 0:Ke.docs)==null?void 0:je.source}}};var We,Je,He;le.parameters={...le.parameters,docs:{...(We=le.parameters)==null?void 0:We.docs,source:{originalSource:`() => {
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
}`,...(He=(Je=le.parameters)==null?void 0:Je.docs)==null?void 0:He.source}}};var Qe,Ye,Xe;ie.parameters={...ie.parameters,docs:{...(Qe=ie.parameters)==null?void 0:Qe.docs,source:{originalSource:`() => {
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
}`,...(Xe=(Ye=ie.parameters)==null?void 0:Ye.docs)==null?void 0:Xe.source}}};var Ze,et,tt,nt,rt;Z.parameters={...Z.parameters,docs:{...(Ze=Z.parameters)==null?void 0:Ze.docs,source:{originalSource:`() => {
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
}`,...(tt=(et=Z.parameters)==null?void 0:et.docs)==null?void 0:tt.source},description:{story:`Connect a real model with your own key (kept in memory only — never persisted).
Column "Cost × factor (AI)" is the worked example: it reads the Cost cell,
multiplies it, and prints the result in a new cell using the cheap model of
the vendor you picked; "Pitch (AI)" uses the strong model.`,...(rt=(nt=Z.parameters)==null?void 0:nt.docs)==null?void 0:rt.description}}};const bn=["AiCells","NaturalLanguageSearch","NaturalLanguageFilter","AgentDataSource","SmartPaste","BulkEdit","LiveProviders"];export{ae as AgentDataSource,re as AiCells,ie as BulkEdit,Z as LiveProviders,se as NaturalLanguageFilter,oe as NaturalLanguageSearch,le as SmartPaste,bn as __namedExportsOrder,Cn as default};
