'use strict';
const assert=require('node:assert/strict');
const Sheet=require('../web/craque-main-sheet-v378.js');
const F=require('../web/craque-friends-training-v228.js');
const deps={training:F,tactical:require('../web/scout-multitactic-engine-v220.js'),
 skills:require('../web/skills-booster-v162.js'),boosters:require('../web/booster-engine-v103.js')};
const source=require('../web/SCOUT_V69_AUDITORIA.json').cards.find(c=>c.numero===4);
const reference=require('../web/ct376-card-references.json').cards.find(c=>c.capture===4);
const card={capture:4,localKey:reference.cardKey,cardId:source.id,edition:source.versao,
 position:'MLG',style:'Básico',defenceStyle:'Básico',nativeSkills:source.habilidades_nativas,
 fixedBooster:source.impeto_fixo,level:source.max_level,pp:source.pp,boosterSlot:'pendente',reference};
const resolve=(c,outcome,selection={})=>Sheet.resolve(c,outcome,{reference:c.reference,...selection},deps);
const original=F.evaluate(card,'rapido',deps);
const changed={...card,style:'Jogador de infiltração'};
const fromStale=resolve(changed,original),fresh=resolve(changed,F.evaluate(changed,'rapido',deps));
assert.equal(fromStale.result.plan.analysis.task.key,fresh.result.plan.analysis.task.key,
 'Trocar o estilo ativo na mesma edição e posição deve invalidar a ação antiga');
assert.deepEqual(fromStale.review.proposed,fresh.review.proposed);

// Every change is compared with a newly calculated outcome, including changes
// whose category vector can legitimately tie while their task evidence differs.
for(const change of [
 {defenceStyle:'Destruidor'}, {trainingFunction:'anchor'}, {trainingDefensive:true},
 {trainingCounterTarget:true}, {skills:'Passe de primeira'}, {fixedBooster:'Agility +2'},
 {nativeSkills:'Interceptação; Bloqueador'}, {trainingLevels:'0 8 8 8 8 0 8 0 0 0'},
 {reference:{...reference,reference:{...reference.reference,baseStats:{...reference.reference.baseStats,low_pass:40}}}}
]){
 const c={...card,...change};
 const actual=resolve(c,original),expected=resolve(c,F.evaluate(c,'rapido',deps));
 assert.deepEqual(actual.result.plan.analysis,expected.result.plan.analysis,'A ficha deve usar o contexto e a evidência atuais');
 assert.deepEqual(actual.review.proposed,expected.review.proposed);
 assert.deepEqual(actual.review.skills,expected.review.skills);
 assert.deepEqual(actual.review.boosters,expected.review.boosters);
}

let allocations=0;
const counted={...deps,training:{...F,allocate(...args){allocations++;return F.allocate(...args);}}};
const first=Sheet.resolve(card,original,{reference},counted);
assert.equal(allocations,1,'Proposta antiga sem proveniência completa deve ser conferida uma vez');
Sheet.resolve(card,first.result,{reference},counted);
assert.equal(allocations,1,'A mesma proposta já conferida pode ser reutilizada');
Sheet.resolve({...card,trainingCounterTarget:true},first.result,{reference},counted);
assert.equal(allocations,2,'Uma instrução diferente não pode reutilizar a conferência anterior');
const oldStat=reference.reference.baseStats.low_pass;
reference.reference.baseStats.low_pass=oldStat-1;
Sheet.resolve(card,first.result,{reference},counted);
assert.equal(allocations,3,'Mudança no conteúdo da referência invalida a conferência mesmo com o mesmo hash declarado');
reference.reference.baseStats.low_pass=oldStat;
first.result.plan.levels=Array(10).fill(0);
const repaired=Sheet.resolve(card,first.result,{reference},counted);
assert.deepEqual(repaired.review.proposed,original.plan.levels,'Uma proposta alterada depois da conferência precisa ser refeita');
assert.equal(allocations,4);

const saved=[0,4,4,4,0,0,0,0,0,0];
const manual=Sheet.resolve(changed,original,{reference,levels:saved,skills:[],booster:'',source:'profile'},counted);
assert.deepEqual(manual.review.proposed,saved,'Uma ficha salva permanece a escolha explícita');
assert.equal(allocations,4);
const posse=F.evaluate(card,'posse',deps);
const preserved=Sheet.resolve(changed,posse,{reference},counted);
assert.deepEqual(preserved.review.proposed,posse.plan.levels,'O treino da Posse permanece preservado');
assert.equal(allocations,4);
console.log('V394 PASS: contexto e referência atuais, reutilização comprovada, fichas salvas e Posse preservadas.');
