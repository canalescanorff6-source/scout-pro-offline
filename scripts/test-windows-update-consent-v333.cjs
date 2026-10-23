'use strict';
// V333: simular o processo Electron sem instalar binários nem buscar updates reais.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {EventEmitter}=require('node:events');
const root=path.resolve(__dirname,'..');
const desktop=fs.readFileSync(path.join(root,'desktop/main.cjs'),'utf8');
const preload=fs.readFileSync(path.join(root,'desktop/preload.cjs'),'utf8');
const bridge=fs.readFileSync(path.join(root,'web/app-bridge.js'),'utf8');

async function exercise(){
 let installs=0,checks=0,response=1;
 const messages=[],handles=new Map();
 const updater=new EventEmitter();
 updater.checkForUpdates=async()=>{checks++;return {ok:true}};
 updater.quitAndInstall=()=>{installs++};
 const wc={
  send:(channel,payload)=>messages.push({channel,payload}),
  on:()=>{},setWindowOpenHandler:()=>{}
 };
 const windowStub={webContents:wc,isDestroyed:()=>false,loadURL:()=>{}};
 class BrowserWindowMock{
  constructor(){return windowStub}
  static getAllWindows(){return [windowStub]}
 }
 const app={
  isPackaged:true,
  getPath:()=>root,
  setPath:()=>{},
  whenReady:()=>Promise.resolve(),
  on:()=>{},
  getVersion:()=> '1.1.938',
  quit:()=>{}
 };
 const ipcMain={handle:(name,fn)=>handles.set(name,fn)};
 const electron={
  app,BrowserWindow:BrowserWindowMock,ipcMain,
  dialog:{showMessageBox:async(_win,options)=>{
   assert(options.buttons.some(s=>s.includes('Instalar')));
   return {response};
  }},
  shell:{openExternal:()=>Promise.resolve()},
  protocol:{registerSchemesAsPrivileged:()=>{},handle:()=>{}},
  net:{fetch:()=>Promise.resolve()}
 };
 const requireMock=name=>name==='electron'?electron:name==='electron-updater'?{autoUpdater:updater}:require(name);
 vm.runInNewContext(desktop,{
  require:requireMock,__dirname:path.join(root,'desktop'),
  process:{platform:'win32'},setTimeout:()=>0,setInterval:()=>0,
  URL,Response,Buffer
 },{filename:'desktop/main.cjs',timeout:5000});
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(updater.autoDownload,true);
 assert.equal(updater.autoInstallOnAppQuit,false,'Escolher Depois deve bloquear instalação ao sair');
 const manual=handles.get('scout:install-downloaded');
 const check=handles.get('scout:check-updates');
 assert.equal(typeof manual,'function');
 assert.equal((await check()).ok,true);
 assert.equal(checks,1);
 assert.equal((await manual({sender:wc})).ok,false,'Antes do download não há instalação');
 response=1;
 updater.emit('update-downloaded',{version:'1.1.940'});
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(installs,0,'Escolher Depois não executa instalação');
 assert(messages.some(m=>m.payload.type==='deferred'));
 const ready=await check();
 assert.equal(ready.ready,true,'Download pronto não reinicia download');
 assert.equal(checks,1,'Não consultar novamente quando atualização está baixada');
 await assert.rejects(()=>manual({sender:{}}),/Origem de atualização não autorizada/);
 response=1;
 assert.equal((await manual({sender:wc})).ok,false,'Cancelar mantém instalação adiada');
 assert.equal(installs,0);
 response=0;
 assert.equal((await manual({sender:wc})).ok,true,'Confirmação explícita permite instalar');
 assert.equal(installs,1);
 assert(preload.includes("installDownloadedUpdate:()=>ipcRenderer.invoke('scout:install-downloaded')"));
 assert(bridge.includes("if(e.type==='ready'||e.type==='deferred')windowsButtonReady(true)"));
 assert(bridge.includes('window.scoutDesktop.installDownloadedUpdate()'));
 assert(bridge.includes("btn.textContent=ready?'Instalar atualização':'Atualizar Windows'"));
 console.log('V333 PASS: Depois preservado; reinstalação somente após confirmação; bridge Windows conectado.');
}
exercise().catch(err=>{console.error(err);process.exitCode=1});
