'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const web=path.resolve(__dirname,'../web'),read=p=>fs.readFileSync(path.join(web,p),'utf8');
const cards=JSON.parse(read('SCOUT_V69_AUDITORIA.json')).cards;
const positional=require('../web/craque-positional-v311.js');
const training=require('../web/craque-friends-training-v228.js');
const tactical=require('../web/scout-multitactic-engine-v220.js');
const skills=require('../web/skills-booster-v162.js'),boosters=require('../web/booster-engine-v103.js');
const deps={tactical,skills,boosters},before=JSON.stringify(cards);
const neymar=cards.find(c=>c.numero===90),maldini=cards.find(c=>c.numero===10);
for(const [card,selected,origin] of [[neymar,'SA','MLE'],[maldini,'ZG','LD']]){
 const model=positional.fromPersonal(card);
 for(const style of ['posse','normal','rapido','fora','longo']){
  const scenario=positional.compute(model,selected,style);
  const review=scenario.outcome.functionReview;
  assert(review,'Each selected function must expose the individual review, not only generic warnings');
  assert.equal(review.sourcePosition,origin);assert.equal(review.position,selected);
  assert.equal(review.tactic,style);assert.equal(review.playerStyle,card.estilo_ataque);
  assert.equal(review.eligibleForLineup,false,'Preview cannot authenticate familiarity');
  assert.equal(review.pp,card.pp);assert.equal(review.spent,card.pp);
  assert(review.priorities.length>0&&review.priorities.every(x=>x.attributes&&x.category));
  assert(review.nativeSkills.length>0);
  for(const suggestion of review.skills)
   assert(!review.nativeSkills.some(n=>skills.keyFor(n)&&skills.keyFor(n)===skills.keyFor(suggestion.name)),
    'Do not recommend an already native skill as new');
  if(review.current){assert.equal(review.changes.reduce((sum,x)=>sum+x.deltaPP,0),0);}
  assert.equal(review.finalAttributesVerified,false,'Partial base flag never becomes full validation');
 }
}
const own=JSON.parse(read('ct364-owned-cards.json')).cards[0];
const pending={localKey:own.key,name:own.name,position:own.position,originalPosition:own.position,
 style:own.style,level:null,pp:null,cardId:'',edition:'',nativeSkills:own.observed.nativeSkills.join('; '),skills:'',
 fixedBooster:'',booster:'',boosterSlot:'pendente',trainingLevels:''};
const unknown=training.evaluate(pending,'posse',deps);
assert.equal(training.evaluate({...pending,position:'ZG',originalPosition:'ZC'},'posse',deps).functionReview.eligibleForLineup,true,
 'ZC and ZG are documented position aliases, not an unproved secondary adaptation');
assert.throws(()=>training.evaluate(pending,'sobreposicao',deps),/Sobreposição.*disponível/,
 'Unsupported sixth style must be explicit, never silently mapped to possession');
assert.equal(unknown.functionReview.proposed,null);
assert.equal(unknown.functionReview.current,null);
assert.equal(unknown.functionReview.canSave,false);
assert(unknown.functionReview.priorities.length>0,'Missing PP still allows useful function priorities');
const known={...pending,level:31}; // Explicit maximum-level declaration; not shown simulator level.
const result=training.evaluate(known,'posse',deps);
assert.equal(result.functionReview.pp,60);assert.equal(result.functionReview.canSave,true);
const fromBalance=training.functionReview(known,result,Array(10).fill(0),deps);
assert.equal(fromBalance.currentSpent,0);
assert.equal(fromBalance.redistributedPP,0,'Spending unallocated PP is not redistribution');
assert.equal(fromBalance.investedFromBalance,60);
const memory=new Map(),store={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v))};
const first=training.saveFunctionDraft(store,known,'posse',result);
assert.equal(first.revision,1);
assert.deepEqual(training.readFunctionDraft(store,known,'posse').levels,result.plan.levels);
const second=training.saveFunctionDraft(store,known,'posse',result);
assert.equal(second.revision,2);assert.equal(second.history.length,1);
for(let revision=3;revision<=40;revision++)training.saveFunctionDraft(store,known,'posse',result);
const fullHistory=memory.get(training.functionDraftKey(known,'posse'));
assert.throws(()=>training.saveFunctionDraft(store,known,'posse',result),/limite|histórico/i,
 'History limit must block a new write instead of discarding old revisions');
assert.equal(memory.get(training.functionDraftKey(known,'posse')),fullHistory);
assert.equal(training.readFunctionDraft(store,{...known,position:'SA'},'posse'),null,'Roles never overwrite each other');
assert.equal(training.readFunctionDraft(store,known,'rapido'),null,'Tactics never overwrite each other');
assert.equal(training.readFunctionDraft(store,{...known,level:32},'posse').stale,true);
assert.throws(()=>training.saveFunctionDraft(store,{...known,level:32},'posse',result),/mud|diverg|atual/i,
 'Stale proposal cannot be adopted after source changes');
const draftKey=training.functionDraftKey(known,'posse');
const invalid=JSON.stringify({...second,levels:[60,0,0,0,0,0,0,0,0,0]});
memory.set(draftKey,invalid);
assert.throws(()=>training.readFunctionDraft(store,known,'posse'),/inválid|ilegível|reconhecid/i);
assert.equal(memory.get(draftKey),invalid,'Malformed draft must be preserved for recovery');
const manual='Interceptação; Marcação individual',account=new Map();
account.set('scoutpro:v162:equipped:90:'+neymar.id,manual);
account.set(skills.confirmationKey(90,neymar.id),JSON.stringify({
 schema:'CRAQUE_ADDITIONAL_V254',confirmed:true,capture:90,card_id:neymar.id,
 edition:neymar.versao,fingerprint:skills.fingerprint(manual),
 nativeFingerprint:skills.fingerprint(neymar.habilidades_nativas)
}));
account.set('scoutpro:v103:booster:90',JSON.stringify({schema:'CRAQUE_BOOST_SLOT_V283',
 capture:90,card_id:neymar.id,edition:neymar.versao,status:'ocupado',equipped:'Agility'}));
const withAccount=positional.fromPersonal(neymar,null,{getItem:k=>account.get(k)??null});
assert.equal(withAccount.skills,manual,'Known account skills must enter the selected function review');
assert.equal(withAccount.booster,'Agility');assert.equal(withAccount.boosterSlot,'ocupado');
const equippedScenario=positional.compute(withAccount,'SA','posse');
assert.equal(equippedScenario.outcome.freeSkillSlots,3,'Only an exact-edition complete receipt proves free slots');
assert.equal(equippedScenario.outcome.functionReview.freeSkillSlots,3);
assert(!equippedScenario.outcome.functionReview.skills.some(x=>/Interceptação|Marcação individual/.test(x.name)));
assert.equal(positional.fromPersonal({...neymar,id:'999991'},null,{getItem:k=>account.get(k)??null}).skills,'');
let originalScenarios=0,pendingAdditionScenarios=0;
assert.equal(positional.normalize('ME'),'MLG','Paul Scholes #015 uses the documented ME central-midfield alias');
for(const card of cards)for(const tactic of ['posse','normal','rapido','fora','longo']){
 const model=positional.fromPersonal(card),scenario=positional.compute(model,model.position,tactic);
 assert.equal(scenario.outcome.functionReview.pp,card.pp);
 assert.equal(scenario.outcome.functionReview.spent,card.pp);
 assert.equal(scenario.outcome.functionReview.finalAttributesVerified,false);
 originalScenarios++;
}
for(const card of JSON.parse(read('ct364-owned-cards.json')).cards)for(const tactic of ['posse','normal','rapido','fora','longo']){
 const result=training.evaluate({...pending,localKey:card.key,name:card.name,position:card.position,
  originalPosition:card.position,style:card.style,nativeSkills:card.observed.nativeSkills.join('; ')},tactic,deps);
 assert.equal(result.functionReview.proposed,null,'Shown simulator level must not create a PP budget');
 assert.equal(result.functionReview.canSave,false);
 assert(result.functionReview.priorities.length>0);
 pendingAdditionScenarios++;
}
assert.equal(originalScenarios,1230);assert.equal(pendingAdditionScenarios,75);
assert.equal(JSON.stringify(cards),before);
console.log('V374 PASS: 261 × 5 = 1305 reviews (1230 exact-PP original proposals, 75 additions pending PP); secondary previews, account receipts, native filtering, explicit drafts and immutable history.');
