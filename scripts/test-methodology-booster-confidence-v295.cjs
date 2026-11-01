// Fixture histórica anterior à correção autorizada V381; dados atuais são verificados no teste de integração V381.
const {historicalRead}=require('./historical-level-fixtures-v381.cjs');
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const cards=JSON.parse(historicalRead(path.join(root,'web/SCOUT_V69_AUDITORIA.json'),'utf8')).cards;
const V=require('../web/craque-ficha-individual-v251.js');
const B=require('../web/booster-engine-v103.js');
assert.equal(cards.length,246);
const before=JSON.stringify(cards);
const checks={checks:[
 {id:'edition',documented:true},{id:'budget',documented:true},
 {id:'native',documented:true},{id:'additional',documented:false},
 {id:'booster',documented:false},{id:'base',documented:false},
 {id:'video',documented:false},{id:'gameplay',documented:false}
]};
let scenarios=0,states={};
for(const c of cards){
 for(const tactic of B.tactics){
  const method=V.methodologyGate(c,checks,tactic,null,{});
  assert(method.booster.documentaryConfidence);
  assert(method.competitivelyHomologated===false);
  assert.equal(method.booster.status,'nao_autorizado_para_equipar');
  const status=method.booster.documentaryConfidence;
  states[status]=(states[status]||0)+1;scenarios++;
 }
}
assert.equal(scenarios,1230);
const m=cards.find(x=>x.numero===191);
assert.equal(m.max_level,26);assert.equal(m.pp,50);
const method=V.methodologyGate(m,checks,'posse',null,{});
assert.equal(method.booster.documentaryConfidence,'BAIXA_SEM_BUILD_CONFERIDA');
assert.equal(method.booster.budgetOriginConfirmed,true);
assert.equal(JSON.stringify(cards),before);
const ui=historicalRead(path.join(root,'web/craque-ficha-individual-v251.js'),'utf8');
assert(ui.includes("documentaryConfidence:ppConflict?'PENDENTE_PP_DIVERGENTES':boost?.primary?.estado_confianca"),
 'Conflito documentado deve bloquear confiança; caso normal mantém o motor V292');
assert(ui.includes("max_level:card.max_level,pp_origem:card.pp_origem"));
assert(ui.includes("' — confiança documental: '+method.booster.documentaryConfidence"));
console.log('V295 PASS: '+scenarios+' pareceres, Martinelli 26/50 com origem propagada e sem autorização de ímpetos. '+JSON.stringify(states));