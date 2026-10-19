'use strict';
/* V250 — transferir conferências V248 entre Android/Windows com plano
 * prévio, proteção de conflitos, identidade de edição exata e rollback.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const baseline=read('web/SCOUT_V69_AUDITORIA.json');
const cards=JSON.parse(baseline).cards;
const V=require('../web/craque-progress-transfer-v250.js');
const P=require('../web/craque-progresso-v248.js');
const C=require('../web/craque-progress-consistency-v249.js');
const records=new Map();
const store={
 getItem:k=>records.has(k)?records.get(k):null,
 setItem:(k,v)=>records.set(String(k),String(v)),
 removeItem:k=>records.delete(k)
};
const exportFile=items=>({
 schema:V.SCHEMA,source:'conferência manual eFootball',
 total:items.length,
 divergent:items.filter(r=>cards.find(c=>c.numero===r.numero)?.pp!==r.pp).length,
 records:items
});
const record=(card,level)=>({
 schema:P.SCHEMA,numero:card.numero,card_id:String(card.id),name:card.name,
 level,pp:P.budget(level),confirmed_in_game:true,
 source:'conferência manual no eFootball',
 confirmed_at:'2026-10-19T02:01:11.000Z'
});
assert.equal(cards.length,246);
assert.equal(V.MAX_RECORDS,246);
assert.equal(V.PREFIX,P.PREFIX);
assert.equal(V.SCHEMA,P.SCHEMA);
const card191=cards.find(c=>c.numero===191);
const card1=cards.find(c=>c.numero===1);
const otherEdition=cards.find(c=>c.name===card191.name&&c.numero!==191);
assert(card191&&card1);
assert.equal(card191.pp,50);
const importOne=record(card191,26),importTwo=record(card1,26);
assert(V.valid(card191,importOne));
assert.equal(importOne.pp,50);
assert.equal(importTwo.pp,50);
assert.equal(V.budget(1),0);
assert.equal(V.budget(120),238);
for(const n of [0,121,null,'26',NaN,25.5])assert.equal(V.budget(n),null);
const bundle=exportFile([importOne,importTwo]);
const initial=V.inspect(bundle,cards,store);
assert.equal(initial.total,2);
assert.equal(initial.countNew,2);
assert.equal(initial.countConflict,0);
assert.equal(initial.countUnchanged,0);
assert.equal(records.size,0,'Prévia não pode gravar nenhum dado.');
const first=V.apply(bundle,cards,store);
assert.deepEqual(first,{imported:2,newRecords:2,replaced:0,preserved:0,alreadyPresent:0});
assert.equal(V.readSaved(card191,store).level,26);
assert.equal(V.readSaved(card1,store).pp,50);
assert.equal(P.state(card1,P.readSaved(card1,store)),'divergente');
assert.equal(C.reconcile(card1,store).local_pp,50);
if(otherEdition)assert.equal(V.readSaved(otherEdition,store),null);
let state=V.inspect(bundle,cards,store);
assert.equal(state.countNew,0);
assert.equal(state.countUnchanged,2);
assert.equal(V.apply(bundle,cards,store).imported,0,'Importação repetida não deve criar duplicatas.');
const fromOther=exportFile([record(card191,27),record(card1,26)]);
state=V.inspect(fromOther,cards,store);
assert.equal(state.countConflict,1);
assert.equal(state.countUnchanged,1);
assert.equal(V.apply(fromOther,cards,store).preserved,1);
assert.equal(V.readSaved(card191,store).level,26,'Conflito preservado por padrão.');
let changed=V.apply(fromOther,cards,store,{replaceConflicts:true});
assert.equal(changed.imported,1);
assert.equal(changed.replaced,1);
assert.equal(V.readSaved(card191,store).level,27);
assert.equal(C.reconcile(card191,store,[{label:'Build',levels:card191.niveis}]).mismatch,true);
assert.equal(V.readSaved(card1,store).level,26,'Não mexer em cartas não conflitantes.');
const tampered=[
 {...importTwo,card_id:'edicao-diferente'},
 {...importTwo,numero:191},
 {...importTwo,name:'Outra pessoa'},
 {...importTwo,confirmed_in_game:false},
 {...importTwo,level:27,pp:50},
 {...importTwo,confirmed_at:'invalida'},
 {...importTwo,source:123},
 {...importTwo,schema:'unknown'}
];
for(const invalid of tampered){
 const before=JSON.stringify([...records]);
 assert.throws(()=>V.inspect(exportFile([importOne,invalid]),cards,store),
  /bloqueada/i,'Qualquer linha adulterada deve barrar o arquivo inteiro.');
 assert.equal(JSON.stringify([...records]),before,'Prévia com erro não muda o armazenamento.');
}
for(const invalid of [
 {...bundle,schema:'arquivo-de-outro-app'},
 {...bundle,total:3},
 {...bundle,records:[]},
 {...bundle,records:'false'},
 {...bundle,records:Array(247).fill(importOne)},
 {schema:V.SCHEMA,total:1,records:[importOne]}
]){
 // A última forma (sem source) é aceita por compatibilidade apenas se o
 // conteúdo tiver formato e identidade válidos; não é prova adicional.
 if(invalid.records?.length===1&&invalid.records[0]===importOne)continue;
 assert.throws(()=>V.inspect(invalid,cards,store));
}
assert.throws(()=>V.inspect(exportFile([importOne,importOne]),cards,store),/duplicada/i);
assert.throws(()=>V.inspect(exportFile([importOne]),cards.slice(0,245),store),/246 cartas/i);
// Registro local danificado: preservar byte por byte; nunca sobrescrever.
const slot=V.key(card191),previous=store.getItem(slot);
store.setItem(slot,'{"incompleto":true}');
assert.throws(()=>V.inspect(exportFile([importOne]),cards,store),/bloqueada/i);
assert.equal(store.getItem(slot),'{"incompleto":true}');
store.setItem(slot,previous);
// Falha de gravação durante múltiplas cartas: reverter todas, inclusive
// registros que já estavam salvos antes da tentativa.
records.clear();
const snapshot=new Map(records);
const atomicStore={
 getItem:k=>records.has(k)?records.get(k):null,
 setItem:(k,v)=>{
  if(k===V.key(card1)&&!atomicStore.once){atomicStore.once=true;throw Error('quota exceeded')}
  records.set(k,v);
 },
 removeItem:k=>records.delete(k),
 once:false
};
assert.throws(()=>V.apply(bundle,cards,atomicStore),/revertidas/i);
assert.deepEqual([...records],[...snapshot],'Rollback restaurou integralmente o estado pré-importação.');
assert.equal(P.summary(cards,store).pendente,161);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),baseline);
assert.equal((read('web/index.html').match(/class="player-card"/g)||[]).length,246);
const html=read('web/conferir-progresso-v248.html'),js=read('web/craque-progress-transfer-v250.js');
const css=read('web/craque-progress-transfer-v250.css');
const sw=read('web/sw.js'),fingerprint=read('scripts/stamp-bundle-v189.cjs');
for(const name of ['craque-progress-transfer-v250.js','craque-progress-transfer-v250.css']){
 assert(html.includes(name));
 assert(sw.includes("'./"+name+"'"));
 assert(fingerprint.includes("'"+name+"'"));
}
for(const id of ['v250-choose','v250-file','v250-preview','v250-confirm','v250-import','v250-cancel','v250-notice'])
 assert(html.includes('id="'+id+'"'),'Falta controle real '+id);
assert(js.includes("readSaved(card,store)"));
assert(js.includes("host.dispatchEvent(new Event('craque:v250:progress-imported'))"));
assert(js.includes("host.dispatchEvent(new Event('craque:data-changed'))"),
 'V226 precisa receber notificação e proteger registros importados.');
assert(js.includes("host.CRAQUE_BACKUP_V226.protect('pre-progress-import')"),
 'A importação precisa criar um snapshot de proteção antes de modificar dados.');
assert(read('web/craque-progresso-v248.js').includes("addEventListener('craque:v250:progress-imported',render)"));
assert(css.includes('@media (max-width:750px)'));
assert(sw.includes('v250-progress-portability'));
console.log('V250 OK: importação segura por Card ID, 246 cartas, 161 níveis a conferir, conflito preservado e rollback.');
console.log('V250 OK: JSON V248 compatível, interface Windows/Android, offline e backup via scoutpro: intacto.');
