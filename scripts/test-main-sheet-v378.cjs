'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const file=path.join(__dirname,'../web/craque-main-sheet-v378.js');
assert(fs.existsSync(file),'Uma única resolução deve alimentar treino, habilidades e ímpeto');
const Main=require(file),P=require('../web/craque-positional-v311.js'),F=require('../web/craque-friends-training-v228.js');
const S=require('../web/skills-booster-v162.js'),B=require('../web/booster-engine-v103.js'),T=require('../web/scout-multitactic-engine-v220.js');
const cards=require('../web/SCOUT_V69_AUDITORIA.json').cards,refs=require('../web/ct376-card-references.json').cards;
const deps={training:F,skills:S,boosters:B,tactical:T};
const snapshot=JSON.stringify(cards);let count=0;
for(const c of cards)for(const style of F.MODES){
 const m=P.fromPersonal(c),outcome=P.compute(m,m.position,style).outcome;
 const card=Main.cardFromModel(m,m.position),sheet=Main.resolve(card,outcome,{},deps);
 assert.deepEqual(sheet.review.proposed,outcome.plan.levels);assert.equal(sheet.review.spent,c.pp);
 assert.equal(sheet.source,'proposal');assert(sheet.review.skills.length<=5);
 const expected=S.evaluate({...F.profileOf(card),niveis:sheet.review.proposed},style,'');
 assert.deepEqual(sheet.review.skills.map(x=>S.keyFor(x.name)),expected.recommendations.map(x=>x.key).slice(0,5));
 assert.equal(sheet.review.trainingGroups.reduce((s,g)=>s+g.cost,0),c.pp);
 count++;
}
const ney=cards.find(c=>c.numero===90),model=P.fromPersonal(ney),card=Main.cardFromModel(model,'SA');
const result=P.compute(model,'SA','posse').outcome,levels=[0,4,4,4,0,0,0,0,0,0];
const before=JSON.stringify({card,result});
assert.notEqual(F.sourceSignature({...card,managerId:'CT-MGR-071'}),F.sourceSignature({...card,managerId:'CT-MGR-001'}),
 'Ficha de outro técnico não pode ter a mesma identidade de cálculo');
const selected=Main.resolve(card,result,{levels,skills:[],booster:'',source:'profile'},deps);
assert.deepEqual(selected.review.proposed,levels);assert.equal(selected.review.spent,12);
assert.equal(selected.review.remaining,card.pp-12);assert.deepEqual(selected.review.skills,[]);
assert.deepEqual(selected.review.boosters,[],'Escolha vazia salva não é substituída por uma indicação nova');
assert.equal(selected.source,'profile');assert.equal(JSON.stringify({card,result}),before);
const memory=new Map(),store={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)};
const keptDraft=F.saveFunctionDraft(store,card,'posse',selected.result,deps);
assert.equal(keptDraft.pp,12,'Treino parcial é salvo com o gasto real');
assert.equal(keptDraft.budget,card.pp);
assert.deepEqual(keptDraft.skills,[]);assert.equal(keptDraft.booster,null);
assert.deepEqual(F.readFunctionDraft(store,card,'posse').levels,levels);
const proposed=Main.resolve(card,result,{levels,source:'revision'},deps);
const actual=S.evaluate({...F.profileOf(card),niveis:levels},'posse','');
assert.deepEqual(proposed.review.skills.map(x=>S.keyFor(x.name)),actual.recommendations.map(x=>x.key).slice(0,5));
assert.throws(()=>Main.resolve(card,result,{levels:Array(10).fill(20)},deps),/PP|categorias/);
const go=cards.find(c=>c.numero===169),gm=P.fromPersonal(go),gc=Main.cardFromModel(gm,'GO');
const gs=Main.resolve(gc,P.compute(gm,'GO','posse').outcome,{levels:go.niveis,source:'profile'},deps);
assert(gs.review.proposed[5]>0);assert(gs.review.trainingGroups.some(g=>g.index===5));
assert.throws(()=>Main.resolve(card,result,{levels:[0,0,0,0,0,0,0,1,1,1]},deps),/categorias/);
const pacho=cards.find(c=>c.numero===151),pr=refs.find(r=>r.capture===151);
const pc=Main.cardFromModel(P.fromPersonal(pacho),'ZG');
const enriched=Main.resolve(pc,P.compute(P.fromPersonal(pacho),'ZG','posse').outcome,{reference:pr},deps);
assert.equal(enriched.nativeSource,'public');assert(enriched.review.nativeSkills.includes('Heading'));
assert(!enriched.review.skills.some(s=>S.keyFor(s.name)==='heading'));
assert.equal(Main.resolve(pc,P.compute(P.fromPersonal(pacho),'ZG','posse').outcome,
 {reference:{...pr,identityUsable:false}},deps).nativeSource,'pending');
const owned=require('../web/ct364-owned-cards.json').cards;
for(const c of owned)for(const tactic of F.MODES){
 const ref=refs.find(r=>r.key===c.key),meta=require('../web/craque-rating-v376.js').ownedMetadata(c,{},ref);
 const source={localKey:c.key,name:c.name,cardId:meta.cardId,edition:meta.engineEdition||'',position:c.position,
  originalPosition:c.position,style:c.style,level:meta.level,pp:null,nativeSkills:c.observed.nativeSkills.join('; '),boosterSlot:'pendente'};
 const out=F.evaluate(source,tactic,deps),sheet=Main.resolve(source,out,{reference:ref},deps);
 assert.equal(sheet.review.spent,2*(meta.level-1));
 count++;
}
assert.equal(count,1305);assert.equal(JSON.stringify(cards),snapshot);
assert(Main.text(selected.review).includes('Treino salvo'));
console.log('V378 PASS: 261×5 fichas coerentes, treino parcial, seleção vazia, nativas por edição e nenhum dado alterado.');
