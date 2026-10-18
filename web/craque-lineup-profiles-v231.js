/* Craque Tático V231 — perfis de escalação independentes por formação e estilo.
 * As 246 cartas, as fichas, o planejamento V177 e os titulares legados de Posse
 * permanecem íntegros. Somente escolhas explícitas são persistidas.
 */
(function(host,factory){'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_LINEUP_PROFILES_V231=api;
})(typeof window!=='undefined'?window:null,function(){'use strict';
const MODES=Object.freeze({
 posse:'Posse de Bola',normal:'Contra-Ataque Normal',
 rapido:'Contra-Ataque Rápido',fora:'Por Fora',longo:'Bola Longa'
});
const SCHEMA='CRAQUE_V231_LINEUP_PROFILE';
const oldKey=id=>'scoutpro:v177:minhas-duas-formacoes:'+id;
const modeKey=id=>'scoutpro:v230:formation-mode:'+id;
const profileKey=(id,mode)=>'scoutpro:v231:formation-lineup:'+id+':'+mode;
function defaults(formation){
 return Object.fromEntries((formation?.starters||[]).map(x=>[x.slot,Number(x.cap)]));
}
function validate(form,slots,known){
 const seed=defaults(form);
 if(!slots||typeof slots!=='object'||Array.isArray(slots)||Object.keys(seed).length!==11)return false;
 const picked={};
 for(const key of Object.keys(seed)){
  const n=Number(slots[key]);
  if(!Number.isInteger(n)||n<1||n>246||known&& !known.has(n))return false;
  picked[key]=n;
 }
 return Object.keys(slots).length===11 && new Set(Object.values(picked)).size===11;
}
function validSlots(form,slots,known){
 if(!validate(form,slots,known))return null;
 const original=defaults(form);
 return Object.fromEntries(Object.keys(original).map(k=>[k,Number(slots[k])]));
}
function readJson(storage,key){
 try{const raw=storage?.getItem(key);return raw?JSON.parse(raw):null}catch(_e){return null}
}
function selectedMode(storage,id){
 let value='posse';
 try{value=storage?.getItem(modeKey(id))||'posse'}catch(_e){}
 return Object.hasOwn(MODES,value)?value:'posse';
}
function read(form,mode,storage,known){
 if(!Object.hasOwn(MODES,mode))throw Error('Estilo de jogo inválido');
 if(!form?.id)throw Error('Formação inválida');
 const legacy=readJson(storage,oldKey(form.id));
 const verifiedPosse=legacy?.schema==='SCOUT_V177_DUAS_FORMACOES_ESCOLHIDAS'?
  validSlots(form,legacy.slots,known):null;
 if(mode==='posse')return verifiedPosse||defaults(form);
 const entry=readJson(storage,profileKey(form.id,mode));
 const saved=entry?.schema===SCHEMA&&entry.formation===form.id&&entry.mode===mode?
  validSlots(form,entry.slots,known):null;
 // A primeira utilização de outra tática é uma CÓPIA TEMPORÁRIA de Posse,
 // sem sobrescrever a posse nem fingir que a escalação alternativa foi validada.
 return saved||{...(verifiedPosse||defaults(form))};
}
function save(form,mode,slots,storage,known){
 const copy=validSlots(form,slots,known);
 if(!Object.hasOwn(MODES,mode)||!copy)throw Error('Escalação inválida; são necessários 11 jogadores diferentes do catálogo');
 if(!storage?.setItem)throw Error('Armazenamento local indisponível');
 const key=mode==='posse'?oldKey(form.id):profileKey(form.id,mode);
 const value=mode==='posse'?
  {schema:'SCOUT_V177_DUAS_FORMACOES_ESCOLHIDAS',slots:copy}:
  {schema:SCHEMA,formation:form.id,mode,slots:copy,savedAt:new Date().toISOString()};
 storage.setItem(key,JSON.stringify(value));
 return {key,slots:copy};
}
function hasSaved(form,mode,storage,known){
 if(mode==='posse')return !!(readJson(storage,oldKey(form.id))?.schema==='SCOUT_V177_DUAS_FORMACOES_ESCOLHIDAS'&&
   validSlots(form,readJson(storage,oldKey(form.id))?.slots,known));
 const entry=readJson(storage,profileKey(form.id,mode));
 return !!(entry?.schema===SCHEMA&&entry.formation===form.id&&entry.mode===mode&&validSlots(form,entry.slots,known));
}
return Object.freeze({MODES,SCHEMA,oldKey,modeKey,profileKey,defaults,validate,validSlots,selectedMode,read,save,hasSaved});
});
