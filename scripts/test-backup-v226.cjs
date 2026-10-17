'use strict';
const assert=require('node:assert/strict');
const {webcrypto}=require('node:crypto');
globalThis.crypto=globalThis.crypto||webcrypto;
const B=require('../web/craque-backup-v226.js');
function storage(items={}){
 const s={getItem(k){return Object.hasOwn(this,k)?this[k]:null;},
  setItem(k,v){this[k]=String(v)},removeItem(k){delete this[k]}};
 for(const [k,v] of Object.entries(items))s.setItem(k,v);
 return s;
}
(async()=>{
 const keys={'scoutpro:v219:black-caps':JSON.stringify([1,2,3]),'scoutpro:v219:match-logs':'{}',
 'scoutpro:test:game':'{"pp":12}'};
 const source=storage(keys);
 const output=await B.create(source);
 assert.equal(output.format,'craque-tatico-backup-v2');
 assert.equal(output.record_count,3);
 let detail=await B.inspect(JSON.stringify(output));
 assert(detail.verified&&detail.hasBlack&&detail.hasMatches);
 const broken=structuredClone(output);broken.items['scoutpro:test:game']='{"pp":999}';
 await assert.rejects(()=>B.inspect(broken),/SHA-256/);
 await assert.rejects(()=>B.inspect({format:B.FORMAT,items:{'other:key':'a'}}),/fora do aplicativo/);
 await assert.rejects(()=>B.inspect({format:'scoutpro-userdata-v1',items:{'scoutpro:v219:black-caps':JSON.stringify([999])}}),/restritos/);
 const target=storage({'scoutpro:older':'keep'});
 assert.deepEqual(B.apply(target,detail),{written:3});
 assert.equal(target.getItem('scoutpro:older'),'keep');
 assert.equal(target.getItem('scoutpro:v219:black-caps'),'[1,2,3]');
 const corruptStore=storage({'scoutpro:v219:black-caps':'[1]','scoutpro:existing':'original'});
 let failOnce=true;const original=corruptStore.setItem;
 corruptStore.setItem=function(k,v){if(k==='scoutpro:test:game'&&failOnce){failOnce=false;throw Error('Disco cheio')}return original.call(this,k,v)};
 assert.throws(()=>B.apply(corruptStore,detail),/Restauração interrompida/);
 assert.equal(corruptStore.getItem('scoutpro:v219:black-caps'),'[1]');
 const legacy=await B.inspect({format:'scoutpro-userdata-v1',items:keys});
 assert.equal(legacy.verified,false,'Legacy can import but cannot claim SHA validation');
 let saved=0;globalThis.SCOUT_FILE_EXPORT={saveJson:async data=>{saved++;return {status:'saved'}}};
 const restoreFile={size:1000,text:async()=>JSON.stringify(output)};
 const destination=storage({'scoutpro:old':'data'});
 const imported=await B.restoreFromInput(destination,restoreFile,()=>true);
 assert.equal(imported.status,'restored');
 assert.equal(saved,1,'Mandatory preventative export before overwriting');
 let mirror='';
 globalThis.Capacitor={isNativePlatform:()=>true,getPlatform:()=> 'android',
  Plugins:{ScoutFileExport:{storeSnapshot:async ({record})=>{mirror=record;return {status:'saved'}},
    loadSnapshot:async()=>({record:mirror})}}};
 const res=await B.autoSnapshot(source);
 assert.equal(res.status,'saved');
 assert((await B.inspect(await B.recoverySnapshot(source))).verified);
 delete globalThis.Capacitor;
 console.log('V226 PASS: SHA-256 backup, V225 migration, 23-card restrictions, rollback, preventative export and native recovery.');
})().catch(e=>{console.error(e);process.exitCode=1});
