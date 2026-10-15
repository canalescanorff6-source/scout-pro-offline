'use strict';
/* V190: trava regressões da ficha em carregamento assíncrono e paridade visual. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const web=path.join(root,'web');
const get=p=>fs.readFileSync(path.join(web,p),'utf8');
const bridge=get('app-bridge.js'),main=get('scout-profile-v188.js'),ui=get('scout-ui-v189.js'),css=get('scout-polish-v190.css'),sw=get('sw.js');
const stamp=get('../scripts/stamp-bundle-v189.cjs'),index=get('index.html');
assert(bridge.includes("scout-polish-v190.css"),'O visual premium deve carregar pelo bridge comum');
assert(sw.includes("'./scout-polish-v190.css'")&&sw.includes("v190-parity"),'O CSS deve funcionar offline');
assert(stamp.includes("'scout-polish-v190.css'"),'O hash de ambas plataformas deve conter a identidade visual');
assert(ui.includes("doc.addEventListener('scoutpro:profile-ready',details)"),'Biotipo precisa aguardar ficha V188');
assert(main.includes("document.dispatchEvent(new CustomEvent('scoutpro:profile-ready'"),'Ficha precisa notificar os módulos');
assert(!main.includes("Promise.all([\n  fetch('../SCOUT_V188_EFHUB_BOOSTERS_241.json')"),'Booster não pode depender da disponibilidade do biotipo');
assert(main.includes("fetch('../SCOUT_V188_EFHUB_BOOSTERS_241.json')")&&main.includes("fetch('../SCOUT_V184_EFHUB_241_COMPLETE.json')"));
assert(css.includes('@media(min-width:1025px)')&&css.includes('@media(max-width:720px)'),'Uma UI com desktop+mobile');
assert(css.includes('@media(prefers-reduced-motion:reduce)'),'Movimento reduzido');
assert.equal((index.match(/class="player-card"/g)||[]).length,246);
const fichas=fs.readdirSync(path.join(web,'fichas')).filter(x=>x.endsWith('.html'));
assert.equal(fichas.length,246);
for(const f of fichas){
 const content=get('fichas/'+f);
 assert(content.includes('app-bridge.js'),'Tela sem mesmo bundle: '+f);
 assert(content.includes('id="scout-v68-data"'),'Ficha sem dados originais: '+f);
}
function runUI(profileBefore){
 const events={},body={dataset:{page:'detail'}};
 let added=0;
 const before={children:[],appendChild(v){this.children.push(v)},querySelector(){return null}};
 const section={querySelector(q){return q==='.scout-v188-body'?before:null}};
 let profile=!!profileBefore;
 function el(name){return {name,children:[],style:{},className:'',id:null,textContent:'',
  append(...items){this.children.push(...items)},
  appendChild(v){this.children.push(v)},
  setAttribute(){},
  querySelector(){return null}}}
 const doc={body,readyState:'complete',
  createElement:el,
  addEventListener:(name,cb)=>{events[name]=cb},
  getElementById:(name)=>name==='scout-v68-data'?{textContent:JSON.stringify({capture:1,id:'88040387251729'})}:name==='scout-v189-biotype'?before.children.find(x=>x.id==='scout-v189-biotype')||null:name==='scout-v188-principal'&&profile?section:null,
  querySelector:()=>null
 };
 const window={document:doc};
 vm.runInNewContext(ui,{window,fetch:()=>Promise.reject(new Error('offline test'))},{timeout:2000});
 assert(events['scoutpro:profile-ready'],'Listener registrado independentemente da ordem');
 if(!profile){assert.equal(before.children.length,0,'Sem ficha não mostra um painel órfão');profile=true;events['scoutpro:profile-ready']()}
 assert.equal(before.children.filter(x=>x.id==='scout-v189-biotype').length,1,'Biotipo deve aparecer exatamente uma vez quando a ficha existir');
 events['scoutpro:profile-ready']();
 assert.equal(before.children.filter(x=>x.id==='scout-v189-biotype').length,1,'Evento duplicado não pode produzir painéis duplicados');
}
runUI(false);runUI(true);
const manifest=JSON.parse(get('SCOUT_V188_EFHUB_BOOSTERS_241.json'));
assert.equal(manifest.observations.length,241);
const massaro=manifest.observations.find(x=>x.filename==='Daniele_Massaro_efhub.jpg');
assert.deepEqual([massaro.booster_1_print,massaro.booster_2_print],['Fisicalidade +3','Instinto artilheiro +1']);
const data=JSON.parse(get('SCOUT_V189_CORPO_EXTRAS.json'));
assert.equal(data.entries.find(x=>x.cap===1).dimensions.shoulder_width,8);
const wf=fs.readFileSync(path.join(root,'.github/workflows/release.yml'),'utf8');
assert(wf.includes("different=[key for key in keys"),'As releases com bundles diferentes precisam ser bloqueadas');
assert.equal((wf.match(/run: npm run bundle:stamp/g)||[]).length,2);
console.log('V190 OK: ficha/biotipo em ambas as ordens de carregamento, ímpetos independentes, 246 páginas, desenho Android/Windows e cache/fingerprint iguais.');
