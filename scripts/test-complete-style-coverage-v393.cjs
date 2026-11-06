'use strict';
const assert=require('node:assert/strict');
const P=require('../web/craque-positional-v311.js');
const F=require('../web/craque-friends-training-v228.js');
const T=require('../web/scout-multitactic-engine-v220.js');
const S=require('../web/craque-main-sheet-v378.js');
const A=require('../web/craque-accounts-v382.js');
const L=require('../web/craque-account-library-v385.js');
const C=require('../web/craque-team-context-v382.js');
const I=require('../web/craque-role-intelligence-v233.js');
const skills=require('../web/skills-booster-v162.js');
const boosters=require('../web/booster-engine-v103.js');
const {cards:originals}=require('../web/SCOUT_V69_AUDITORIA.json');
const {cards:references}=require('../web/ct376-card-references.json');
const deps={training:F,tactical:T,skills,boosters,interpretation:I,
 individual:require('../web/craque-ficha-individual-v251.js')};
const modes=['posse','normal','rapido','fora','longo','overload'];
assert.deepEqual(F.MODES,modes);
const otherPage=require('node:fs').readFileSync(require('node:path').join(__dirname,'../web/outros-elencos-v227.html'),'utf8');
assert(otherPage.indexOf('craque-main-sheet-v378.js')>otherPage.indexOf('craque-friends-training-v228.js'));
assert(otherPage.indexOf('craque-main-sheet-v378.js')<otherPage.indexOf('craque-positional-ui-v311.js'));
const source=originals.find(c=>c.numero===131),model=P.fromPersonal(source);
const ref=references.find(c=>c.capture===131);
for(const style of modes){
 const outcome=P.compute(model,'LD',style,'CT-MGR-071',{...deps,reference:ref}).outcome;
 const resolved=S.resolve(S.cardFromModel(model,'LD'),outcome,{reference:ref},deps);
 assert.equal(T.total(resolved.review.proposed),source.pp);
 assert.equal(resolved.review.skills.length<=5,true);
 assert.equal(resolved.review.boosters.length,0);
 if(style==='overload')assert.equal(resolved.review.individualAnalysis.status,'documentada');
}
const roster=A.roster('primary',{originals,references,positional:P},{getItem:()=>null});
const foyth=roster.find(c=>c.capture===131);
const {externalCards}=require('../web/ct376-card-references.json');
for(const entry of externalCards){
 const card={localKey:entry.cardKey,name:entry.name,cardId:entry.cardId,edition:entry.edition,
  position:entry.position,pp:entry.cataloguePP,level:entry.registeredMaxLevel,
  nativeSkills:entry.reference.nativeSkills.join('; '),reference:entry};
 for(const style of modes){
  const outcome=F.evaluate(card,style,{...deps,reference:entry});
  const sheet=S.resolve(card,outcome,{reference:entry},deps);
  assert.equal(T.total(sheet.review.proposed),card.pp);
  if(style!=='posse')assert.equal(sheet.review.individualAnalysis.status,'documentada');
  if(!entry.reference.extraSlotInPublicEdition)assert.equal(sheet.review.boosters.length,0);
 }
}
const sourceSnapshot=JSON.stringify(originals);
let covered=0;
for(const source of originals){
 const model=P.fromPersonal(source),reference=references.find(r=>r.capture===source.numero);
 for(const style of modes){
  const outcome=P.compute(model,model.position,style,'CT-MGR-071',{...deps,reference}).outcome;
  const sheet=S.resolve(S.cardFromModel(model,model.position),outcome,{reference},deps);
  assert.equal(T.total(sheet.review.proposed),model.pp);
  if(source.numero!==50&&style!=='posse'){
   assert.equal(sheet.review.individualAnalysis.status,'documentada',source.numero+' '+style);
   covered++;
  }
 }
}
assert.equal(covered,245*5);
assert.equal(JSON.stringify(originals),sourceSnapshot);
for(const source of originals.filter(c=>c.numero>=226)){
 const entry=references.find(r=>r.capture===source.numero);
 const model=P.fromPersonal(source);
 assert.equal(model.cardKey,entry.cardKey);
 assert.equal(model.cardId,entry.reference.cardId);
 assert.equal(model.edition,entry.reference.edition);
 for(const style of modes.filter(style=>style!=='posse')){
  const preview=require('../web/craque-style-planner-v303.js').proposal({...source,
   capture:source.numero,shown_position:source.posicao,reference:entry},style,source.niveis);
  assert.equal(preview.analysis.status,'documentada','Editor complementar: '+source.numero+' '+style);
 }
 const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
 const window={SCOUT_TACTICS_V220:T,CRAQUE_FRIEND_TRAINING_V228:F,CRAQUE_POSITIONAL_V311:P,
  CRAQUE_REFERENCES_V376:{cards:references},location:{pathname:'/'+source.arquivo}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../web/craque-style-planner-v303.js'),'utf8'),{window});
 const html=fs.readFileSync(path.join(__dirname,'../web',source.arquivo),'utf8');
 const raw=JSON.parse(html.match(/id="scout-v68-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
 assert.equal(window.CRAQUE_STYLE_PLANNER_V303.proposal(raw,'overload',raw.recommended_levels).analysis.status,'documentada');
 window.location.pathname='/fichas/outra.html';
 assert.equal(window.CRAQUE_STYLE_PLANNER_V303.proposal(raw,'overload',raw.recommended_levels).analysis.status,'dados_insuficientes');
 const bad=references.map(r=>r===entry?{...r,publicIdentityV393:{...r.publicIdentityV393,catalogueId:'outra'}}:r);
 assert.equal(P.fromPersonal(source,null,null,bad).cardId,source.id);
 const review=require('../web/craque-card-review-v379.js'),map=new Map();
 const store={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};
 review.save(store,review.catalog([source],[])[0],{cardId:'1234567890',edition:'Edição conferida pelo proprietário'},true);
 assert.equal(P.fromPersonal(source,null,store).cardId,'1234567890');
 const rating=require('../web/craque-rating-v376.js'),ratingContext=require('../web/craque-rating-context-v376.js');
 const ratingStoreMap=new Map(),ratingStore={getItem:k=>ratingStoreMap.get(k)??null,setItem:(k,v)=>ratingStoreMap.set(k,v)};
 ratingContext.saveTraining(entry,ratingStore,[0,0,0,0,0,0,0,0,0,0],source.pp,true,model.cardId);
 const actual=ratingContext.resolve(entry,source,ratingStore,{rating,positional:P});
 const estimate=rating.evaluate(entry,actual.ctx,require('../web/ct376-rating-model.json'));
 assert.equal(estimate.status,'estimated');
}
for(const accountId of ['primary','secondary']){
 for(const position of P.POS){
  const sample=roster.find(c=>c.position===position);
  assert(sample,'Existe carta de referência para '+position);
  const card={...sample,accountId};
  for(const style of modes){
   const context=L.individualContext(card,{position,style});
   const {review}=C.evaluateCard(context,'individual',deps);
   assert.equal(review.tactic,style);
   assert.equal(review.position,position);
   assert.equal(T.total(review.proposed),card.pp);
   assert.equal(review.accountId,accountId);
   assert.equal(review.identity.cardId,card.cardId);
   assert(review.skills.length<=5);
   const native=new Set(card.nativeSkills.map(skills.keyFor));
   assert(review.skills.every(s=>!native.has(skills.keyFor(s.name))));
   if(card.boosterSlot==='ausente')assert.equal(review.boosters.length,0);
  }
 }
}
console.log('V393 PASS: seis estilos, treze posições, duas contas, PP e equipamento coerentes.');
