'use strict';
// V355 — recarga de PWA somente com gesto explícito, sem perder cadastros.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const pwa=read('web/pwa.js'),css=read('web/app-bridge.css');
const sw=read('web/sw.js');
const manifest=JSON.parse(read('web/manifest.webmanifest'));
const audit=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json'));
assert.equal(audit.cards.length,246);
assert.equal(manifest.theme_color,'#222225','PWA deve usar o cromo Premium mais recente');
assert.equal(manifest.background_color,'#28282c','PWA não deve abrir com fundo azul legado');
assert(sw.includes('v355-pwa-sync'));
assert(sw.includes("'./manifest.webmanifest'"));
assert(sw.includes("'./pwa.js'"));
assert(css.includes('#ct355-update-ready'));
assert(css.includes('#ct355-apply-update'));
assert(css.includes('env(safe-area-inset-bottom'));
assert(!/caches\.delete\(|localStorage\.clear\(|sessionStorage\.clear\(/.test(pwa));
function fixture({native=false,initialController={version:'old'},protocol='https:'}={}){
 const swListeners={},docListeners={},hostListeners={},added=[];
 let reloads=0,confirmCount=0,confirmAnswer=true,registers=0,unregisters=0;
 const node=(tag)=>{
  const handlers={};
  return {tag,children:[],id:'',className:'',attributes:{},textContent:'',
   setAttribute(k,v){this.attributes[k]=v},
   addEventListener(k,v){handlers[k]=v},
   append(...items){this.children.push(...items)},
   remove(){const i=added.indexOf(this);if(i>=0)added.splice(i,1)},
   click(){if(handlers.click)handlers.click()}
  };
 };
 const doc={readyState:'complete',body:{dataset:{page:'friends'},appendChild(el){added.push(el)}},
  addEventListener(n,fn){docListeners[n]=fn},
  createElement:node};
 const worker={controller:initialController,
  addEventListener(n,fn){swListeners[n]=fn},
  getRegistrations(){return Promise.resolve([{unregister(){unregisters++}}])},
  register(){registers++;return Promise.resolve({})}};
 const win={Capacitor:native?{isNativePlatform:()=>true}:null,
  addEventListener(n,fn){hostListeners[n]=fn},
  confirm(){confirmCount++;return confirmAnswer},
  location:{reload(){reloads++}}};
 vm.runInNewContext(pwa,{document:doc,navigator:{serviceWorker:worker},
  location:{protocol},window:win,Promise,console},{timeout:4000});
 return {worker,added,swListeners,docListeners,hostListeners,
  get reloads(){return reloads},get confirms(){return confirmCount},
  get registers(){return registers},get unregisters(){return unregisters},
  setConfirm(x){confirmAnswer=x}};
}
const normal=fixture();
assert.equal(normal.added.length,0,'Nunca mostrar aviso ao abrir');
assert.equal(normal.reloads,0,'Nunca recarregar sem ação');
assert(normal.hostListeners.load,'HTTPS deve continuar registrando SW');
normal.hostListeners.load();assert.equal(normal.registers,1);
normal.worker.controller={version:'new'};
normal.swListeners.controllerchange();
assert.equal(normal.added.length,1,'Atualização não exibiu aviso');
const banner=normal.added[0];
assert.equal(banner.id,'ct355-update-ready');
assert.equal(banner.attributes.role,'status');
assert.equal(banner.attributes['aria-live'],'polite');
const [heading,description,actions]=banner.children;
assert(heading.textContent.includes('Premium'));
assert(description.textContent.includes('Recarregue'));
const [apply,later]=actions.children;
assert.equal(apply.id,'ct355-apply-update');
assert.equal(later.id,'ct355-update-later');
assert.equal(normal.reloads,0);
normal.docListeners.input({target:{closest:()=>null,matches:()=>false}});
apply.click();assert.equal(normal.confirms,0);assert.equal(normal.reloads,1,
 'Recarga é aceita somente com clique');
const edited=fixture();
edited.docListeners.input({target:{closest:selector=>selector==='form'?{}:null,matches:()=>false}});
edited.worker.controller={version:'new'};
edited.swListeners.controllerchange();
const applyEdited=edited.added[0].children[2].children[0];
edited.setConfirm(false);applyEdited.click();
assert.equal(edited.reloads,0,'Cancelar confirmação preserva o trabalho');
assert.equal(edited.confirms,1,'Edição deve pedir consentimento');
edited.setConfirm(true);applyEdited.click();
assert.equal(edited.reloads,1,'Após confirmar, recarga permitida');
const postponed=fixture();
postponed.worker.controller={version:'new'};
postponed.swListeners.controllerchange();
postponed.added[0].children[2].children[1].click();
assert.equal(postponed.added.length,0,'Depois oculta apenas o aviso');
postponed.worker.controller={version:'newer'};
postponed.swListeners.controllerchange();
assert.equal(postponed.added.length,0,'Aviso dispensado não deve reaparecer');
const firstInstall=fixture({initialController:null});
firstInstall.worker.controller={version:'first'};
firstInstall.swListeners.controllerchange();
assert.equal(firstInstall.added.length,0,'Primeira instalação não é atualização');
firstInstall.worker.controller={version:'next'};
firstInstall.swListeners.controllerchange();
assert.equal(firstInstall.added.length,1,'Upgrade subsequente notificado');
const native=fixture({native:true});
assert.equal(native.added.length,0);
assert.equal(native.swListeners.controllerchange,undefined,'APK não usa PWA');
assert.equal(native.hostListeners.load,undefined,'APK não registra SW');
assert.equal(native.registers,0);
const insecure=fixture({protocol:'file:'});
assert.equal(insecure.hostListeners.load,undefined,'Electron não registra SW');
console.log('V355 PASS: troca real de controlador, recarga voluntária, consentimento de formulário, Android nativo isolado, tema e 246 cartas preservados.');
