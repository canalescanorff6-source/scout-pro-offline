// Fixture histórica anterior à correção autorizada V381; dados atuais são verificados no teste de integração V381.
const {historicalRead}=require('./historical-level-fixtures-v381.cjs');
'use strict';
/* V298: a mesma divergência de PP que bloqueia treino também deve
 * impedir que parecer/ímpetos pareçam validados. Nunca alterar cartas. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const before=historicalRead(path.join(root,'web/SCOUT_V69_AUDITORIA.json'),'utf8');
const cards=JSON.parse(before).cards;
const F=require('../web/craque-ficha-individual-v251.js');
const T=require('../web/scout-multitactic-engine-v220.js');
assert.equal(cards.length,246);
const proof={checks:['edition','budget','native','additional','booster','base','video','gameplay'].map(id=>({id,documented:true}))};
let examined=0,conflicts=0,normal=0;
for(const c of cards){
 const snapshot=JSON.stringify(c);
 const base=Number(c.pp)/2+1;
 assert(Number.isInteger(base)&&base>=1&&base<=120,'Orçamento do catálogo não suportado no teste');
 const level=base===120?119:base+1,pp=2*(level-1);
 assert.notEqual(pp,c.pp);
 const receipt={schema:'CRAQUE_PROGRESS_REVIEW_V248',
  numero:c.numero,card_id:String(c.id),name:c.name,edition:c.versao,
  level,pp,confirmed_in_game:true,source:'conferência manual no eFootball',
  confirmed_at:'2026-10-21T15:00:00.000Z'};
 const key='scoutpro:v248:level-review:'+c.numero+'@'+c.id;
 const store={getItem:k=>k===key?JSON.stringify(receipt):null};
 const legacy={...receipt};delete legacy.edition;
 const obsolete={getItem:k=>k===key?JSON.stringify(legacy):null};
 for(const tactic of T.STYLES){
  const m=F.methodologyGate(c,proof,tactic.id,store,{});
  assert.equal(m.training.status,'pp_divergentes_bloqueado');
  assert.equal(m.progressConflict.localPP,pp);
  assert.equal(m.progressConflict.catalogPP,c.pp);
  assert(m.training.note.includes('PP DIVERGENTES'));
  assert.equal(m.booster.status,'bloqueado_pp_divergentes');
  assert.equal(m.booster.equipStatus,'bloqueado_pp_divergentes');
  assert.equal(m.booster.ppStatus,'pp_divergentes');
  assert.equal(m.booster.confidenceReason,'pendente');
  assert.equal(m.booster.documentaryConfidence,'PENDENTE_PP_DIVERGENTES');
  assert.equal(m.booster.budgetOriginConfirmed,false);
  assert.equal(m.booster.name,null);
  assert.equal(m.booster.scoreMargin,null);
  assert.deepEqual(m.booster.comparison,[]);
  assert.deepEqual(m.booster.attributes,[]);
  assert.equal(m.competitivelyHomologated,false);
  conflicts++;
  // Recibo V248 legado sem edição não pode contaminar a análise.
  const stale=F.methodologyGate(c,proof,tactic.id,obsolete,{});
  assert.equal(stale.progressConflict,null);
  assert.notEqual(stale.training.status,'pp_divergentes_bloqueado');
  normal++;examined++;
 }
 assert.equal(JSON.stringify(c),snapshot);
}
assert.equal(examined,1230);assert.equal(conflicts,1230);assert.equal(normal,1230);
const martin=cards.find(c=>c.numero===191);
assert(martin&&martin.max_level===26&&martin.pp===50);
assert.equal(historicalRead(path.join(root,'web/SCOUT_V69_AUDITORIA.json'),'utf8'),before);
fs.mkdirSync(path.join(root,'build'),{recursive:true});
fs.writeFileSync(path.join(root,'build/v298-pp-conflict-gate-246x5.json'),JSON.stringify({
 schema:'CRAQUE_V298_PP_CONFLICT_GATE',cards:246,styles:5,conflictBlocked:1230,
 legacyProofIgnored:1230,originalsModified:false,
 equipmentApplied:false,gameplayValidated:false
},null,2)+'\n');
console.log('V298 PASS: 246 cartas x 5 estilos; 1230 conflitos PP bloqueados, 1230 recibos legados ignorados e build original intacta.');