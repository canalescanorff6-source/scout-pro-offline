'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {webcrypto}=require('node:crypto'),root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const config=JSON.parse(read('capacitor.config.json'));
const manifest=JSON.parse(read('web/manifest.webmanifest'));
const desktop=read('electron-builder.config.cjs'),brand=read('scripts/build-brand-v75.cjs');
const app=read('web/app-bridge.js'),html=read('web/meu-time-testes-v219.html');
assert.equal(config.appId,'br.com.scoutpro.offline','Manter mesmo package ID Android');
assert.equal(config.appName,'Craque Tático');
assert.equal(manifest.short_name,'Craque Tático');
assert(desktop.includes("productName: 'Craque Tático'"));
assert(desktop.includes("appId: 'br.com.scoutpro.offline'"));
assert(desktop.includes("artifactName: 'ScoutPRO-Setup-"),'Atualizador Windows precisa do mesmo nome de artefato');
assert(brand.includes('craque-tatico-icon.svg'));
assert(read('web/assets/craque-tatico-icon.svg').includes('viewBox="0 0 512 512"'));
assert(read('web/craque-theme-v226.css').includes('--craque-green:#00c853'));
assert(html.includes('craque-backup-open')&&html.includes('craque-backup-panel'));
assert(app.includes('craque-backup-ui-v226.js')&&app.includes('craque-theme-v226.css'));
assert(read('native/android/ScoutFileExportPlugin.java').includes('Intent.ACTION_OPEN_DOCUMENT'));
assert(read('native/android/ScoutFileExportPlugin.java').includes('onBackupSelected'));
assert(read('desktop/main.cjs').includes("ipcMain.handle('craque:open-json'"));
assert(read('desktop/main.cjs').includes("ipcMain.handle('craque:store-backup'"));
assert(read('desktop/main.cjs').includes("previousDataPaths=['Scout PRO'"));
const items=new Map([['scoutpro:v219:black-caps','[2,5,7]'],['scoutpro:v219:match-logs','{"test":[1]}'],['scoutpro:skills','{"a":1}']]);
let failOnce=null;const listeners=new Map();
const localStorage={
 getItem:k=>items.has(k)?items.get(k):null,
 setItem:(k,v)=>{if(failOnce===k){failOnce=null;throw Error('Simulated storage failure')}items.set(k,String(v))},
 removeItem:k=>items.delete(k),key:n=>[...items.keys()][n],
 get length(){return items.size}
};
const fakeWindow={localStorage,crypto:webcrypto,Capacitor:null,
 addEventListener:(n,f)=>listeners.set(n,f),dispatchEvent:()=>true,
 setInterval:()=>0,setTimeout:()=>0,clearTimeout:()=>{},CustomEvent:class{},
};
const sandbox={window:fakeWindow,localStorage,crypto:webcrypto,TextEncoder,
 TextDecoder,CustomEvent:class{},setTimeout:()=>0,clearTimeout:()=>{},document:{visibilityState:'visible'}};
Object.defineProperty(localStorage,'__keys',{value:items});
const nativeKeysProxy=new Proxy(localStorage,{ownKeys(){return [...items.keys()]},getOwnPropertyDescriptor(o,k){if(items.has(k))return {enumerable:true,configurable:true,value:items.get(k)};return Object.getOwnPropertyDescriptor(o,k)||{enumerable:false,configurable:true}}});
sandbox.localStorage=nativeKeysProxy;fakeWindow.localStorage=nativeKeysProxy;
vm.runInNewContext(read('web/craque-backup-v226.js'),sandbox,{filename:'craque-backup-v226.js'});
const api=fakeWindow.CRAQUE_BACKUP_V226;
(async()=>{
 const original=await api.create();assert.equal(original.format,api.FORMAT);
 const validated=await api.inspect(original);
 assert.equal(validated.count,3);assert(validated.hasRoster&&validated.hasMatches);
 const tampered=JSON.parse(JSON.stringify(original));
 tampered.items['scoutpro:v219:black-caps']='[1,3,5]';
 await assert.rejects(()=>api.inspect(tampered),/SHA-256/,'Checksum must reject tampering');
 const malicious=JSON.parse(JSON.stringify(original));malicious.items['outside:private']='bad';
 await assert.rejects(()=>api.inspect(malicious),/chave|valor/);
 const legacy=await api.inspect({format:api.LEGACY,items:{'scoutpro:v219:black-caps':'[11]'}});
 assert(legacy.legacy,'old backups must be importable');
 items.set('scoutpro:v219:black-caps','[99]');
 const result=await api.restore(validated);
 assert.equal(result.count,3);assert.equal(items.get('scoutpro:v219:black-caps'),'[2,5,7]');
 assert(items.has('craque:v226:backup-snapshot'),'Snapshot must be stored before restoration');
 const current=await api.create();
 items.set('scoutpro:v219:black-caps','[66]');
 failOnce='scoutpro:v219:match-logs';
 await assert.rejects(async()=>api.restore(await api.inspect(current)),/desfeita/);
 assert.equal(items.get('scoutpro:v219:black-caps'),'[66]','Failure must restore pre-existing record');
 console.log('V226 PASS: rebrand, stable updater, 246-card files, SHA-256 validation, native SAF hooks, backup and rollback.');
})().catch(e=>{console.error(e);process.exitCode=1});
