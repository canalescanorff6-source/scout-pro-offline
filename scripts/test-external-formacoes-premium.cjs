'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {EventEmitter} = require('node:events');
const root = path.resolve(__dirname, '..');
const URL_FORMACOES = 'https://craque-tatico-formacoes-premium.vocalclock33.chatgpt.site/';
const source = fs.readFileSync(path.join(root, 'web/craque-app-shell-v362.js'), 'utf8');

function catalog(native = false, reject = false, page = 'catalog', withProof = false) {
  const ids = new Map(), events = new Map(), opens = [];
  const element = tag => ({tagName:tag, children:[], attrs:{}, handlers:{}, hidden:false,
    append(...nodes){this.children.push(...nodes); for(const n of nodes)if(n.id)ids.set(n.id,n)},
    setAttribute(k,v){this.attrs[k]=v}, addEventListener(k,fn){this.handlers[k]=fn}});
  const quick = {after(node){ids.set(node.id,node);this.inserted=node}};
  const proofParent={insertBefore(node){this.inserted=node}};
  if(withProof){const proof=element('div');proof.id='ct356-boot-proof';proof.parentNode=proofParent;ids.set(proof.id,proof)}
  const document = {readyState:'complete',body:{dataset:{page}},
    getElementById:id=>id==='ct362-design-proof'?{}:ids.get(id)||null,
    querySelector:selector=>selector==='.scout-v189-quick'?quick:null,
    createElement:element,addEventListener:(name,fn)=>events.set(name,fn)};
  const window = {document,setTimeout:()=>0,Capacitor:{isNativePlatform:()=>native,
    registerPlugin:name=>{assert.equal(name,'Browser');return {open:async options=>{
      opens.push(options);if(reject)throw Error('offline');
    }}}}};
  vm.runInNewContext(source,{window},{timeout:3000});
  return {ids,quick,events,opens,proofParent};
}

async function run(){
  const web=catalog(), link=web.ids.get('ct-formacoes-premium-link');
  assert(link,'O catálogo deve oferecer o link externo sem modificar o índice');
  assert.equal(link.href,URL_FORMACOES);
  assert.equal(link.target,'_blank');assert.equal(link.rel,'noopener noreferrer');
  assert.match(link.attrs['aria-label'],/online.*navegador/i);
  assert.equal(web.opens.length,0,'Nunca abrir página automaticamente');
  const first=web.quick.inserted;web.events.get('scoutpro:ui-ready')();
  assert.equal(web.quick.inserted,first,'Eventos de UI não duplicam o acesso');
  const compact=catalog(false,false,'catalog',true);
  assert(compact.proofParent.inserted,'Reutilizar a linha de status para preservar a primeira dobra');
  assert.equal(compact.quick.inserted,undefined,'Não acrescentar uma linha sob os quatro atalhos');
  assert(compact.proofParent.inserted.children.some(n=>n.id==='ct356-boot-proof'),'Preservar o mesmo indicador de versão');
  assert.equal(catalog(false,false,'friends').ids.has('ct-formacoes-premium-link'),false);
  const android=catalog(true);let prevented=false;
  await android.ids.get('ct-formacoes-premium-link').handlers.click({preventDefault(){prevented=true}});
  assert(prevented);assert.equal(android.opens.length,1);assert.equal(android.opens[0].url,URL_FORMACOES);
  const failed=catalog(true,true);
  await failed.ids.get('ct-formacoes-premium-link').handlers.click({preventDefault(){}});
  const status=failed.ids.get('ct-formacoes-premium-status');
  assert.equal(status.hidden,false);assert.match(status.textContent,/consegui abrir/i);

  const wc={send(){},on(){},setWindowOpenHandler(){}}, updater=new EventEmitter(), opened=[];
  updater.checkForUpdates=()=>Promise.resolve();updater.quitAndInstall=()=>{};
  const windowStub={webContents:wc,isDestroyed:()=>false,loadURL(){}};
  class BrowserWindow {constructor(){return windowStub}static getAllWindows(){return [windowStub]}}
  const electron={app:{isPackaged:false,getPath:()=>root,setPath(){},whenReady:()=>Promise.resolve(),on(){},getVersion:()=> '1.1.1148',quit(){}},
    BrowserWindow,ipcMain:{handle(){}},dialog:{showMessageBox:async()=>({response:1})},
    shell:{openExternal:async url=>{opened.push(url)}},protocol:{registerSchemesAsPrivileged(){},handle(){}},net:{fetch(){}}};
  const context={require:name=>name==='electron'?electron:name==='electron-updater'?{autoUpdater:updater}:require(name),
    __dirname:path.join(root,'desktop'),process:{platform:'win32'},URL,Response,Buffer,setTimeout:()=>0,setInterval:()=>0};
  vm.runInNewContext(fs.readFileSync(path.join(root,'desktop/main.cjs'),'utf8'),context,{timeout:5000});
  await new Promise(resolve=>setImmediate(resolve));
  await context.openTrustedExternal(URL_FORMACOES+'#plano-084');
  await context.openTrustedExternal('https://github.com/canalescanorff6-source/scout-pro-offline');
  assert.equal(opened.length,2,'A página específica e o destino existente devem abrir');
  for(const url of [URL_FORMACOES.replace('https:','http:'),URL_FORMACOES+'other',URL_FORMACOES+'?redirect=evil',
    URL_FORMACOES.replace('https://','https://user:pass@'),URL_FORMACOES.replace('.site/','.site.evil.test/'),
    URL_FORMACOES.replace('vocalclock33','other'),URL_FORMACOES.replace('.site/','.site:8443/'),'javascript:alert(1)'])await context.openTrustedExternal(url);
  assert.equal(opened.length,2,'Não ampliar a permissão para outros destinos, credenciais, portas ou rotas');
  const references=[
    'https://www.konami.com/efootball/pt-br/page/v6/versioninfo_v6-00',
    'https://www.pesmaster.com/sergi-cardona/efootball-2022/player/105803298257275/',
    'https://www.pesdb.net/efootball/players/k-kvaratskhelia-105880876086992',
    'https://efootbase.com/players/134580/88044145348020',
    'https://ef-labo.com/efootball/rodri-national-team-selection-spain-5-sep-24/',
    'https://efootball-world.com/player/105842221312066',
    'https://efootballmeta.com/players/88045755827028'
  ];
  for(const url of references){
    const before=opened.length;await context.openTrustedExternal(url);
    assert.equal(opened.length,before+1,'Fonte cadastrada deve abrir no Windows: '+url);
    assert.equal(opened.at(-1),url);
  }
  const count=opened.length;
  for(const url of ['https://www.konami.com.evil.test/path','https://evil.test/path',
    'https://user:pass@www.konami.com/path','https://www.pesmaster.com:8443/path',
    'http://efootbase.com/players/1','file:///C:/Windows/notepad.exe'])await context.openTrustedExternal(url);
  assert.equal(opened.length,count,'Novas fontes não permitem domínios falsos, credenciais, portas ou protocolos arbitrários');
  console.log('PASS: acesso externo idempotente, navegador Android e destino Windows restrito.');
}
run().catch(error=>{console.error(error);process.exitCode=1});
