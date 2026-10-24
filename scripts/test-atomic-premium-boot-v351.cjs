'use strict';
// V351: não mostrar HTML/CSS legado antes da navegação + tema Premium.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const api=require('../web/craque-ui-bootstrap-v351.js');
const html=read('web/index.html'),bridge=read('web/app-bridge.js');
const original=read('web/SCOUT_V69_AUDITORIA.json');
assert.equal(JSON.parse(original).cards.length,246);
assert.equal(api.REQUIRED.length,4);
assert(html.includes('class="ct-v351-boot"'));
assert(html.includes('<style id="ct-v351-critical">'));
assert(html.includes('id="ct-v351-boot-cover"'));
assert(html.includes('Preparando sua interface Premium'));
assert(html.indexOf('craque-ui-bootstrap-v351.js')<html.indexOf('app-bridge.js'));
assert(html.indexOf('id="ct-v351-boot-cover"')<html.indexOf('<header class="topbar">'));
assert.equal((html.match(/class="player-card"/g)||[]).length,246);
for(const file of api.REQUIRED)assert(bridge.includes(file),'Estilo Premium pendente: '+file);
for(const file of ['scout-v189-home','scout-v189-extra'])assert(read('web/scout-ui-v189.js').includes(file));
assert(read('web/scout-ui-v189.js').includes("dispatchEvent(new Event('scoutpro:ui-ready'))"));
const sw=read('web/sw.js'),stamp=read('scripts/stamp-bundle-v189.cjs');
assert(sw.includes("'./craque-ui-bootstrap-v351.js'"));
assert(stamp.includes("'craque-ui-bootstrap-v351.js'"));
assert(sw.includes('v351-boot'));
new vm.Script(read('web/craque-ui-bootstrap-v351.js'));
function create(overrides={}){
 const classes=new Set(['ct-v351-boot']),attrs=new Map(),listeners={};
 const present=new Set(api.REQUIRED);
 const doc={
  readyState:'loading',body:{dataset:{page:'catalog',scoutV189:'0'},
   setAttribute:(key,value)=>attrs.set(key,value),
   removeAttribute:key=>attrs.delete(key)},
  documentElement:{classList:{contains:k=>classes.has(k),remove:k=>classes.delete(k)}},
  querySelector:s=>s==='.scout-v189-home' && overrides.panel!==false?{}:null,
  querySelectorAll:s=>s==='link[rel="stylesheet"]'?api.REQUIRED.map(file=>({
   getAttribute:()=>file,sheet:overrides.missing===file?null:{}
  })):[],
  addEventListener:(type,fn)=>{listeners['doc:'+type]=fn}
 };
 const frames=[],timers=[];
 const host={document:doc,addEventListener:(type,fn)=>{listeners[type]=fn},
  requestAnimationFrame:fn=>frames.push(fn),setTimeout:(fn,delay)=>timers.push({fn,delay})};
 const step=()=>{const fn=frames.shift();if(fn)fn()};
 return {doc,host,classes,attrs,listeners,frames,timers,step};
}
const e=create();
assert.equal(api.ready(e.doc,true),false,'Antes do DOM premium, mostrar somente carregamento');
api.init(e.host);
assert.equal(e.attrs.get('aria-busy'),'true');
assert(e.classes.has('ct-v351-boot'),'A interface antiga não deve surgir enquanto há recursos pendentes');
e.doc.body.dataset.scoutV189='1';
e.listeners['doc:scoutpro:ui-ready']();
assert(e.classes.has('ct-v351-boot'),'O evento de DOM, isoladamente, não certifica CSS carregado');
e.listeners.load();
assert.equal(e.frames.length,1);
assert(e.classes.has('ct-v351-boot'),'Primeira pintura protegida');
e.step();assert.equal(e.frames.length,1);assert(e.classes.has('ct-v351-boot'));
e.step();
assert.equal(e.doc.body.dataset.ctUiBoot,'premium');
assert.equal(e.attrs.has('aria-busy'),false);
assert.equal(e.classes.has('ct-v351-boot'),false);
e.timers[0].fn();
assert.equal(e.doc.body.dataset.ctUiBoot,'premium','Timeout não pode reverter UI já pronta');
const missing=create({missing:'craque-visual-system-v234.css'});
missing.doc.body.dataset.scoutV189='1';
api.init(missing.host);missing.listeners.load();
assert.equal(missing.frames.length,0,'CSS final ausente deve bloquear a abertura intermediária');
assert(missing.classes.has('ct-v351-boot'));
assert.equal(missing.timers[0].delay,10000);
missing.timers[0].fn();
assert.equal(missing.doc.body.dataset.ctUiBoot,'fallback','Falha não pode deixar o app permanentemente bloqueado');
assert.equal(missing.classes.has('ct-v351-boot'),false);
const noPanel=create({panel:false});noPanel.doc.body.dataset.scoutV189='1';
assert.equal(api.ready(noPanel.doc,true),false);
assert.equal(api.ready(e.doc,true),true);
const catalog=read('web/SCOUT_V69_AUDITORIA.json');
assert.equal(catalog,original,'A correção não modifica nenhuma carta');
console.log('V351 PASS: sem flash do HTML antigo, CSS final e navegação Premium obrigatórios, fallback seguro, offline Android/Windows e 246 cartas intactas.');
