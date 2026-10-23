/* Craque Tático V324 — ficha pessoal CONSULTIVA por edição de técnico e posição.
 * Compartilhada por Minhas Cartas / Outros Elencos, sem afetar o catálogo.
 * Revisões imutáveis por contexto; armazenamento no backup scoutpro:*.
 */
(function(host,factory){'use strict';
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_MANAGER_FICHAS_V324=api;
})(typeof window!=='undefined'?window:null,function(){'use strict';
const PREFIX='scoutpro:v324:manager-profile:';
const SCHEMA='CRAQUE_MANAGER_FICHA_V324';
const STYLES=Object.freeze(['posse','rapido','normal','fora','longo']);
const POSITIONS=Object.freeze(['CA','SA','MAT','MLG','VOL','ZG','LE','LD','GO','PTE','PTD','MLE','MLD']);
const normalize=v=>String(v??'').trim();
const safeParts=parts=>parts.map(x=>encodeURIComponent(normalize(x))).join('|');
function validateContext(c){
 if(!c||!['minhas-246','outros-elencos'].includes(c.collection)||!c.owner||
  !c.cardKey||!c.cardId||!c.edition||!POSITIONS.includes(c.position)||
  !STYLES.includes(c.style)||!/^CT-MGR-\d{3}$/.test(c.manager||'')||
  !Number.isInteger(c.budget)||c.budget<0||c.budget>250||
  !c.sourceSignature)throw Error('Ficha exige carta, edição, técnico, função, estilo e PP comprovados');
 return Object.freeze({...c});
}
function fromScenario(s,model){
 if(!s||!model||!s.outcome)throw Error('Cenário da carta ausente');
 return validateContext({
  collection:model.collection,owner:model.owner,cardKey:model.cardKey,
  cardId:model.cardId,edition:model.edition||'edicao-pendente',
  position:s.position,style:s.style,manager:s.manager,
  budget:model.pp,sourceSignature:s.contentSignature
 });
}
function withStyle(c,style){
 return validateContext({...c,style});
}
function withManager(c,manager){
 return validateContext({...c,manager});
}
function withPosition(c,position){
 return validateContext({...c,position});
}
function key(c){
 validateContext(c);
 return PREFIX+safeParts([c.collection,c.owner,c.cardKey,c.cardId,c.edition,c.manager,c.position,c.style]);
}
function ppCost(n){
 if(!Number.isInteger(n)||n<0||n>20)throw Error('Progressão inválida');
 let cost=0;for(let i=0;i<n;i++)cost+=1+Math.floor(i/4);
 return cost;
}
function validTraining(value,budget){
 return Array.isArray(value)&&value.length===10&&
  value.every(n=>Number.isInteger(n)&&n>=0&&n<=20)&&
  value.reduce((n,x)=>n+ppCost(x),0)<=budget;
}
function cleanSkills(values){
 if(!Array.isArray(values)||values.length>5)throw Error('Máximo de cinco candidatas');
 const list=values.map(normalize);
 if(list.some(v=>!v||v.length>100)||new Set(list.map(x=>x.toLocaleLowerCase('pt-BR'))).size!==list.length)
  throw Error('Habilidade vazia, duplicada ou inválida');
 return list;
}
function validateRecord(row,c){
 if(!row||typeof row!=='object'||row.schema!==SCHEMA||
  row.key!==key(c)||row.sourceSignature!==c.sourceSignature||
  row.budget!==c.budget||!validTraining(row.train,c.budget)||
  !Array.isArray(row.skills)||row.skills.length>5||
  typeof row.booster!=='string'||row.booster.length>100||
  row.status!=='proposta_consultiva')return false;
 try{cleanSkills(row.skills)}catch(_){return false}
 return true;
}
function readAll(store,c){
 if(!store?.getItem)throw Error('Armazenamento local não disponível');
 const raw=store.getItem(key(c));
 if(raw===null||raw===undefined||raw==='')return [];
 let obj;try{obj=JSON.parse(raw)}catch(_){throw Error('Ficha do técnico ilegível; gravação bloqueada para preservar dados')}
 if(obj?.schema!==SCHEMA||!Array.isArray(obj.revisions)||obj.revisions.length>50||
  obj.revisions.some(r=>!validateRecord(r,c)))
  throw Error('Ficha do técnico incompatível ou desatualizada; histórico preservado, gravação bloqueada');
 return obj.revisions;
}
function read(store,c){
 const versions=readAll(store,c);
 const row=versions.at(-1);
 return row?JSON.parse(JSON.stringify(row)):null;
}
function save(store,c,{train,skills=[],booster='',source='Edição manual de cenário'}={}){
 validateContext(c);
 if(!validTraining(train,c.budget))throw Error('Distribuição excede PP ou contém níveis inválidos');
 const names=cleanSkills(skills),boost=normalize(booster);
 if(boost.length>100)throw Error('Ímpeto candidato inválido');
 if(typeof source!=='string'||source.length>120)throw Error('Fonte da proposta inválida');
 const versions=readAll(store,c); // erro em dado corrompido proíbe sobrescrita
 const row={
  schema:SCHEMA,key:key(c),sourceSignature:c.sourceSignature,budget:c.budget,
  train:train.slice(),skills:names,booster:boost,status:'proposta_consultiva',
  source,revision:versions.length+1,
  // Nunca usar campos "equipped"/"approved": recomendar não é equipar.
  savedAt:new Date().toISOString()
 };
 const serialized=JSON.stringify({schema:SCHEMA,revisions:[...versions,row]});
 if(serialized.length>85000)throw Error('Limite do histórico atingido; exporte backup');
 if(!store?.setItem)throw Error('Armazenamento indisponível');
 store.setItem(key(c),serialized);
 return JSON.parse(JSON.stringify(row));
}
function deleteDraft(store,c){
 readAll(store,c); // valida antes de remover, sem apagar histórico corrompido
 // Nunca apagar revisões: restaurar consiste em registrar nova revisão
 // ou manter o histórico existente; cancelamento usa confirmação na UI.
 return false;
}
return Object.freeze({PREFIX,SCHEMA,STYLES,POSITIONS,validateContext,
 fromScenario,withStyle,withManager,withPosition,key,ppCost,validTraining,
 cleanSkills,readAll,read,save,deleteDraft});
});
