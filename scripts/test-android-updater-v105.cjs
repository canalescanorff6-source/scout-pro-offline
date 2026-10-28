'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'web/app-bridge.js'),'utf8');
const start=source.indexOf('const androidPanel=nativeAndroid()');
const end=source.indexOf('const ppCss=',start);
assert(start>=0&&end>start,'Não foi possível isolar o fluxo de atualização Android');
const runtime=source.slice(start,end);
new vm.Script(runtime,{filename:'android-updater-v105.js'});
function simulate(nativeUpdater,modalError=false){
 const children=new Map();
 const classNames=new Set();
 const dialog={
  open:false, dataset:{},classList:{add:name=>classNames.add(name),remove:name=>classNames.delete(name),contains:name=>classNames.has(name)},
  innerHTML:'',setAttribute(name){if(name==='open')this.open=true;},removeAttribute(name){if(name==='open')this.open=false;},
  querySelector(selector){if(!children.has(selector))children.set(selector,{hidden:false,disabled:false,textContent:'',value:0,onclick:null,removeAttribute(){},setAttribute(){}});return children.get(selector)},
  showModal(){if(modalError)throw Error('showModal unsupported');this.open=true;},
  close(){if(modalError)throw Error('close unsupported');this.open=false;}
 };
 const messages=[];
 const btn={textContent:'',onclick:null,setAttribute(){}};
 const doc={
  createElement(name){assert.equal(name,'dialog');return dialog;},
  body:{appendChild(){}},getElementById(){return null;},addEventListener(){}
 };
 const ctx={document:doc,window:{scoutDesktop:null,addEventListener(){}},navigator:{onLine:false},
  nativeAndroid:()=>true,nativeUpdater,btn,notify:message=>messages.push(message),onlineUpdate:async()=>{},
  setTimeout:()=>0,clearTimeout:()=>{},Promise,console};
 vm.runInNewContext(runtime,ctx,{timeout:4000});
 assert.equal(btn.textContent,'Atualizar APK','Botão Android não configurado');
 assert.equal(typeof btn.onclick,'function','Botão de atualização sem clique');
 btn.onclick();
 assert(dialog.open,'Botão não abriu o painel');
 assert(children.get('#scout-android-status').textContent.includes('Verificando'),'Sem status no painel');
 return {btn,dialog,children,classNames,messages};
}
const throwing=simulate(()=>{throw Error('Capacitor bridge unavailable')});
assert.equal(throwing.dialog.dataset.nativeBridgeError,'true');
const unsupported=simulate(()=>{throw Error('Legacy WebView')},true);
assert(unsupported.classNames.has('scout-dialog-fallback'),'Fallback sem modal visível');
unsupported.children.get('#scout-android-close').onclick();
assert(!unsupported.dialog.open,'Botão Fechar não encerrou modal fallback');
const progressFail=simulate(()=>({addListener(){throw Error('listener unavailable')}}));
assert.equal(progressFail.dialog.dataset.nativeBridgeError,'true');
const css=fs.readFileSync(path.join(root,'web/app-bridge.css'),'utf8');
assert(css.includes('#scout-android-update-modal.scout-dialog-fallback[open]'));
assert(css.includes('z-index:12005'));
assert(source.includes('const plugin=nativeUpdater();'),'Versão nativa precisa de fallback de API');
assert(!source.includes("btn.onclick=openAndroidUpdater;"),'Handler deve ser instalado antes do bridge');
const flow=fs.readFileSync(path.join(root,'.github/workflows/release.yml'),'utf8');
assert(flow.includes('node scripts/install-native-updater-v102.cjs'),'Plugin interno precisa continuar sendo compilado');
const audit=JSON.parse(fs.readFileSync(path.join(root,'web/SCOUT_V69_AUDITORIA.json'),'utf8'));
assert.equal(audit.cards.length,246,'Cartas preservadas');
console.log('V105 OK: bridge com erro não desativa Atualizar APK, dialog fallback abre e fecha, publicação Android preservada.');
