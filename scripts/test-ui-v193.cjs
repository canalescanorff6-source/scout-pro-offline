'use strict';
/* V193: regressões de ergonomia e selo da versão real, sem mexer no motor de cartas. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ui=read('web/scout-ui-v189.js'),css=read('web/scout-visual-v192.css'),skills=read('web/skills-booster-v162.js'),sw=read('web/sw.js');
const bridge=read('web/app-bridge.js'),stamp=read('scripts/stamp-bundle-v189.cjs');
async function versionLabel(){
 let fetched=0;
 const edition={textContent:'V73 • PREMIUM OFFLINE'};
 const first={appendChild(node){this.child=node}};
 const bar={querySelector(q){return q==='div:first-child'?first:null}};
 const body={dataset:{page:'catalog',scoutV189:undefined}};
 const doc={body,readyState:'complete',createElement:tag=>({tag,className:'',textContent:'',dataset:{},title:''}),querySelector:q=>q==='.topbar .edition'?edition:null,getElementById:q=>q==='scout-app-bar'?bar:null};
 const fetch=()=>{fetched++;return Promise.resolve({ok:true,json:()=>Promise.resolve({version:'1.1.180',git_revision:'abcdef1234567',bundle_fingerprint:'a'.repeat(20)})})};
 vm.runInNewContext(ui,{window:{document:doc},fetch},{timeout:2000});
 await new Promise(setImmediate);
 assert.equal(fetched,1,'Versão real deve vir do bundle local, não de número fixo');
 assert.equal(edition.textContent,'v1.1.180 · PREMIUM','Selo de versão atualizado');
 assert.equal(first.child?.id,'scout-v189-version','Versão rastreável mantida no dock');
 assert.equal(body.dataset.scoutV189,'1','Render idempotente');
}
(async()=>{
 await versionLabel();
 assert(skills.includes("principal.classList?.add('scout-v193-skills-integrated')"),'Identificar skills integradas com fallback seguro');
 assert(css.includes('scout-v193-skills-integrated>.scout-v188-skills-link{display:none!important}'),'Esconder atalho duplicado somente na ficha integrada');
 assert(css.includes('@media(max-width:340px)')&&css.includes('@media(max-width:420px)'),'Viewport estreito precisa de ajustes próprios');
 assert(css.includes('min-height:44px'),'Ações táteis precisam de altura adequada');
 assert(css.includes('prefers-reduced-motion:reduce'),'Reduzir movimento na interface');
 assert(sw.includes('v193-finish'),'Atualização visual precisa invalidar cache anterior');
 assert(stamp.includes("'scout-visual-v192.css'")&&stamp.includes("'scout-ui-v189.js'")&&stamp.includes("'skills-booster-v162.js'"),'Fingerprint do bundle deve cobrir as mudanças');
 assert(bridge.includes("v189Root+'scout-visual-v192.css'"),'Folha comum deve carregar no Android e Windows');
 assert.equal((read('web/index.html').match(/class="player-card"/g)||[]).length,246);
 const pages=fs.readdirSync(path.join(root,'web/fichas')).filter(x=>x.endsWith('.html'));
 assert.equal(pages.length,246);
 for(const name of pages){const html=read('web/fichas/'+name);assert(html.includes('app-bridge.js')&&html.includes('id="scout-v68-data"'),name)}
 console.log('V193 OK: selo real, sem atalho duplicado, 320-420px, foco/touch, bundle offline e 246 fichas preservadas.');
})().catch(e=>{console.error(e);process.exitCode=1});
