'use strict';
/* Apenas fixtures dos testes históricos: desfaz campos enumerados da migração.
   Não é usado pelo app. A integração V381 testa o catálogo REAL atualizado. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const archive=require('../web/ct381-level-corrections.json');
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function restore(value,p){
 if(!p)return value;
 if(p.fields.every(k=>same(value[k],p.before[k])))return structuredClone(value);
 const old=structuredClone(value);for(const k of p.fields){assert.deepEqual(value[k],p.after[k],'Fixture mudou fora dos campos da revisão: '+k);
  if(Object.hasOwn(p.before,k))old[k]=structuredClone(p.before[k]);else delete old[k];}return old;
}
function historicalRead(file,options){
 const text=fs.readFileSync(file,options);if(typeof text!=='string')return text;
 const name=path.resolve(String(file)).replace(/\\/g,'/');
 if(name.endsWith('/SCOUT_V69_AUDITORIA.json')){const o=JSON.parse(text);o.summary=structuredClone(archive.beforeSummary);
  o.cards=o.cards.map(c=>restore(c,archive.originals.find(p=>p.capture===c.numero)));return JSON.stringify(o,null,2)+'\n';}
 if(name.endsWith('/ct364-owned-cards.json')){const o=JSON.parse(text);o.cards=o.cards.map(c=>restore(c,archive.owned.find(p=>p.key===c.key)));return JSON.stringify(o,null,2)+'\n';}
 if(name.endsWith('/ct376-card-references.json')){const o=JSON.parse(text);o.cards=o.cards.map(c=>restore(c,archive.references.find(p=>p.key===c.key)));return JSON.stringify(o,null,2)+'\n';}
 if(name.endsWith('/web/index.html')){let value=text;for(const p of archive.index?.changes||[])value=value.replace(p.after,()=>p.before);return value;}
 if(/\/fichas\/\d{3}_[^/]+\.html$/.test(name)){
  const cap=Number(path.basename(name).slice(0,3)),p=archive.originals.find(p=>p.capture===cap);if(!p)return text;
  let value=text;for(const [id,changes] of [['scout-v68-data',p.raw],['lab-data',p.lab]]){
   const pattern=new RegExp('(<script\\b(?=[^>]*\\bid=["\\\']'+id+'["\\\'])[^>]*>)([\\s\\S]*?)(<\\/script>)','i');
   value=value.replace(pattern,(_all,a,json,b)=>a+JSON.stringify(restore(JSON.parse(json),changes)).replace(/</g,'\\u003c')+b);
  }return value;
 }
 return text;
}
module.exports={restore,historicalRead};
