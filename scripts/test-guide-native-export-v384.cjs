'use strict';
const a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{EventEmitter}=require('node:events');
async function run(){
 const handlers=new Map(),copies=[],wc={on(){},setWindowOpenHandler(){},send(){}},updater=new EventEmitter();
 const win={webContents:wc,isDestroyed:()=>false,loadURL(){}};
 class BrowserWindow{constructor(){return win}static getAllWindows(){return [win]}}
 let cancel=true;
 const electron={app:{isPackaged:false,getPath:()=>process.cwd(),setPath(){},getVersion:()=> '1.1.0',whenReady:()=>Promise.resolve(),on(){},quit(){}},BrowserWindow,ipcMain:{handle:(k,f)=>handlers.set(k,f)},protocol:{registerSchemesAsPrivileged(){},handle(){}},net:{fetch(){}},shell:{openExternal:async()=>{}},dialog:{showSaveDialog:async()=>({canceled:cancel,filePath:'chosen-guide.pdf'})}};
 const nodeFs=require('node:fs/promises');
 const stub={...nodeFs,copyFile:async(...args)=>copies.push(args)};
 vm.runInNewContext(fs.readFileSync('desktop/main.cjs','utf8'),{require:n=>n==='electron'?electron:n==='electron-updater'?{autoUpdater:updater}:n==='node:fs/promises'?stub:require(n),__dirname:path.resolve('desktop'),process:{platform:'win32'},URL,Response,Buffer,setTimeout:()=>0,setInterval:()=>0});
 await new Promise(r=>setImmediate(r));
 const save=handlers.get('scout:save-guide-pdf');a.equal(typeof save,'function','PDF precisa do diálogo nativo Windows');
 await a.rejects(()=>save({sender:{}}));
 a.equal((await save({sender:wc})).status,'cancelled');a.equal(copies.length,0);
 cancel=false;a.equal((await save({sender:wc},{path:'C:/Windows/private'})).status,'saved');
 a.equal(copies.length,1);a.equal(copies[0][0],path.resolve('web/manual-2027/manual-2027.pdf'));a.equal(copies[0][1],'chosen-guide.pdf');
 const java=fs.readFileSync('native/android/ScoutFileExportPlugin.java','utf8');
 a(java.includes('public void saveGuidePdf(PluginCall call)'));a(java.includes('public/manual-2027/manual-2027.pdf'));a(java.includes('application/pdf'));
 const clicks={},feedback={},reader={};let called=0;
 const doc={getElementById:id=>id==='feedback'?feedback:reader,addEventListener:(id,f)=>clicks[id]=f};
 vm.runInNewContext(fs.readFileSync('web/manual-2027/native-guide-v384.js','utf8'),{window:{scoutDesktop:{saveGuidePdf:async()=>{called++;return {status:'saved'}}}},document:doc});
 let prevented=false;clicks.click({target:{closest:()=>({getAttribute:()=> 'manual-2027.pdf'})},preventDefault(){prevented=true}});
 await new Promise(r=>setImmediate(r));a(prevented);a.equal(called,1);a.match(feedback.textContent,/salvo/);
 console.log('V384 EXPORT PASS:recurso PDF fixo,origem validada,cancelamento e confirmação nativa;Android SAF.');
}
run().catch(e=>{console.error(e);process.exitCode=1});
