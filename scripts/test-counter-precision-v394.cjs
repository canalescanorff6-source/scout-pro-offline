'use strict';
const assert=require('node:assert/strict');
const I=require('../web/craque-role-intelligence-v233.js');
const F=require('../web/craque-friends-training-v228.js');
const P=require('../web/craque-positional-v311.js');
const T=require('../web/scout-multitactic-engine-v220.js');
const S=require('../web/craque-main-sheet-v378.js');
const R=require('../web/skills-booster-v162.js');
const B=require('../web/booster-engine-v103.js');
const {cards}=require('../web/SCOUT_V69_AUDITORIA.json');
const refs=require('../web/ct376-card-references.json').cards;
const deps={training:F,tactical:T,skills:R,boosters:B};
assert.equal(typeof I.counterProfile,'function','Perfil de duas fases por contra-ataque');
for(const position of P.POS){
 const role=['PTE','PTD','MLE','MLD'].includes(position)?'ALA':position;
 for(const tactic of ['normal','rapido']){
  const p=I.counterProfile(role,tactic,{},'outlet');
  assert.equal(p.tactic,tactic);assert(p.attack&&p.defence&&p.risk);
  assert(Object.keys(p.stats).length>=3);
  assert(role==='GO'||p.stats.stamina>0,'Resistência entra como carga de duas fases');
 }
 assert.equal(I.counterProfile(role,'posse',{},'outlet'),null);
}
const fast=I.counterProfile('ZG','rapido',{},'cover');
const normal=I.counterProfile('ZG','normal',{},'cover');
assert(fast.stats.speed>normal.stats.speed,'Cobertura da linha alta tem peso próprio');
assert(fast.stats.defensive_awareness>0&&normal.stats.defensive_awareness>0);
assert.equal(I.counterProfile('CA','rapido',{trainingCounterTarget:true},'depth').pressing,false);
assert.equal(I.counterProfile('CA','rapido',{},'depth').pressing,true);
for(const role of ['MAT','MLG','ALA']){
 const target=I.counterProfile(role,'rapido',{trainingCounterTarget:true},'vertical');
 assert.equal(target.pressing,false);assert(target.defence.includes('Ficar disponível'));
 assert(target.stats.stamina<I.counterProfile(role,'rapido',{},'vertical').stats.stamina);
}
const before=JSON.stringify(cards);let verified=0;
for(const source of cards){
 const m=P.fromPersonal(source),reference=refs.find(r=>r.capture===source.numero);
 const card=S.cardFromModel(m,m.position);
 for(const tactic of ['normal','rapido']){
  const outcome=F.evaluate({...card,reference},tactic,deps);
  const {review}=S.resolve(card,outcome,{reference},deps);
  assert.equal(T.total(review.proposed),m.pp);
  assert(review.skills.length<=5);
  const natives=new Set(review.nativeSkills.map(R.keyFor));
  assert(review.skills.every(s=>!natives.has(R.keyFor(s.name))),source.numero+' '+tactic+' '+review.skills.map(s=>s.name));
  if(source.numero===50){assert.equal(review.individualAnalysis.status,'dados_insuficientes');continue;}
  const task=review.individualAnalysis.task;
  assert.equal(task.counter.tactic,tactic);
  if(m.position!=='GO')assert(task.stats.some(s=>s.key==='stamina'));
  assert(task.stats.every(s=>Number.isInteger(s.base)));
  verified++;
 }
}
assert.equal(verified,490);
const source=cards.find(c=>c.numero===4),m=P.fromPersonal(source),reference=refs.find(r=>r.capture===4);
const base={...S.cardFromModel(m,'VOL'),reference,style:'Básico',defenceStyle:''};
assert.equal(F.profileOf({...base,style:'Infiltração experimental'},'rapido').attack_style,'');
assert.equal(F.profileOf({...base,position:'CA',style:'Artilheiro'},'rapido').attack_style,'Artilheiro');
assert.equal(F.profileOf({...base,position:'SA',style:'Artilheiro'},'rapido').attack_style,'');
assert.deepEqual(F.allocate({...base,style:'Infiltração experimental'},'rapido',deps).levels,F.allocate(base,'rapido',deps).levels,
 'Ativação pendente não vira efeito mecânico na ficha');
const doc=F.allocate({...base,position:'MAT',style:'Jogador de infiltração'},'rapido',deps);
assert.equal(doc.analysis.task.key,'depth');
const capped={...reference,reference:{...reference.reference,baseStats:{...reference.reference.baseStats,acceleration:90}}};
const refined=I.refineIndividual({weights:I.ROLES.CA.weights,role:'CA',tactic:'rapido',card:{...base,position:'CA',style:'Artilheiro'},reference:capped});
assert(refined.utility[3][1]>0,'Noventa é ponto de mudança de retorno, não teto de aceleração');
assert.equal(JSON.stringify(cards),before);
console.log('V394 PRECISÃO PASS: 490 fichas documentadas, 26 perfis de fase, PP, nativas, ativação e dados intactos.');
