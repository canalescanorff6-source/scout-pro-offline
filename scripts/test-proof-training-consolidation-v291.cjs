'use strict';
/* V291 — impedir prova de slots sem inventário nativo e usar treino
 * experimental apenas como comparação, nunca âncora de otimização. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const S=require('../web/skills-booster-v162.js'),B=require('../web/booster-engine-v103.js');
const V=require('../web/craque-ficha-individual-v251.js');
const T=require('../web/scout-multitactic-engine-v220.js');
const original=read('web/SCOUT_V69_AUDITORIA.json'),cards=JSON.parse(original).cards;
assert.equal(cards.length,246);
assert.equal(new Set(cards.map(c=>c.numero+'@'+c.id+'@'+c.versao)).size,246);
const before=JSON.stringify(cards);
const adapt=c=>({
 capture:c.numero,id:c.id,edition:c.versao,name:c.name,
 shown_position:c.posicao,role_used:c.posicao,posicao:c.posicao,
 native_skills:c.habilidades_nativas,attack_style:c.estilo_ataque,
 defence_style:c.estilo_defesa,boost1:c.impeto_fixo,boost2:c.impeto_extra,
 pp:c.pp
});
const receipt=(d,manual='')=>({
 schema:'CRAQUE_ADDITIONAL_V254',capture:d.capture,card_id:d.id,
 edition:d.edition,confirmed:true,fingerprint:S.fingerprint(manual),
 nativeFingerprint:S.fingerprint(d.native_skills)
});
let scenarios=0,missing=0,blocked=0,accepted=0,identityPending=0;
const missingCaps=[],evidence=[];
for(const c of cards){
 const nativeAbsent=!String(c.habilidades_nativas||'').trim();
 if(nativeAbsent){missing++;missingCaps.push(c.numero)}
 const d=adapt(c),proof=receipt(d);
 const withReceipt=S.verifiedRecommendationContextV288(d,{
  manualEquipped:'',equipmentRecord:proof
 });
 for(const tactic of B.tactics){
  const unknown=S.verifiedRecommendationContextV288(d,{});
  assert.equal(unknown.skills.remaining,null);
  assert.equal(unknown.skills.confirmed,false);
  const suspicious=S.evaluate(d,tactic,'',{equippedConfirmed:true});
  if(nativeAbsent){
   assert.equal(S.checkedEquipment(d,'',proof),false);
   assert.equal(withReceipt.skills.confirmed,false);
   assert.equal(withReceipt.skills.remaining,null);
   assert.equal(suspicious.equippedConfirmed,false);
   assert.equal(suspicious.slotsRemaining,null);
   assert.equal(suspicious.requiresReconciliation,true);
   const comparison=S.strategicPortfolioV286(d,tactic,B,'',{equippedConfirmed:true});
   assert.equal(comparison.slotsConfirmed,false);
   blocked++;
  }else if(withReceipt.identity.valid){
   assert.equal(S.checkedEquipment(d,'',proof),true);
   assert.equal(withReceipt.skills.remaining,5);
   assert.equal(withReceipt.skills.confirmed,true);
   accepted++;
  }else identityPending++;
  scenarios++;
 }
 evidence.push({cap:c.numero,cardId:c.id,edition:c.versao,
  nativeDocumented:!nativeAbsent,identityValid:withReceipt.identity.valid,
  slotsLocallyConfirmed:withReceipt.skills.confirmed});
}
assert.equal(scenarios,1230);
assert.equal(missing,3);
assert.deepEqual(missingCaps,[50,151,181]);
assert.equal(blocked,15);
assert(accepted>0);
const example=cards.find(c=>c.numero===40);
assert(example&&example.habilidades_nativas);
const sample=adapt(example);
for(const marker of ['',null,'PENDENTE - confirmar','DESCONHECIDO','Não informado']){
 const trial={...sample,native_skills:marker};
 const record=receipt(trial);
 assert.equal(S.checkedEquipment(trial,'',record),false);
 assert.equal(S.verifiedRecommendationContextV288(trial,{
  manualEquipped:'',equipmentRecord:record}).skills.remaining,null);
 assert.equal(S.evaluate(trial,'posse','',{equippedConfirmed:true}).slotsRemaining,null);
}
assert.equal(S.checkedEquipment(sample,'',receipt(sample)),true);
// Mesmo com lista nativa conhecida, uma posição não mapeada não comprova
// a elegibilidade das adicionais nem libera automaticamente cinco vagas.
const unknownRole={...sample,shown_position:'POSICAO_NAO_CADASTRADA',
 role_used:'POSICAO_NAO_CADASTRADA',posicao:'POSICAO_NAO_CADASTRADA'};
assert.equal(S.checkedEquipment(unknownRole,'',receipt(unknownRole)),false);
assert.equal(S.verifiedRecommendationContextV288(unknownRole,{
 manualEquipped:'',equipmentRecord:receipt(unknownRole)}).skills.confirmed,false);
assert.equal(S.skillEligibility(unknownRole,'onepass'),'posicao_pendente');

assert.equal(S.checkedEquipment({...sample,id:'outra edição'},'',receipt(sample)),false);
const martin=cards.find(c=>c.numero===191);
assert.equal(martin.max_level,26);
assert.equal(martin.pp,50);
assert.equal(martin.treino_proposto_nao_validado,true);
const html=read('web/'+martin.arquivo);
const rm=html.match(/<script id="scout-v68-data"[^>]*>([\s\S]*?)<\/script>/);
const lm=html.match(/<script id="lab-data"[^>]*>([\s\S]*?)<\/script>/);
assert(rm&&lm,'A ficha original deve permanecer acessível');
const raw=JSON.parse(rm[1]),lab=JSON.parse(lm[1]);
const comparison=[];
for(const tactic of T.STYLES){
 const x=V.buildReview(martin,raw,lab,cards,tactic.id);
 assert(x.proposal);
 assert.equal(x.trainingProvisional,true);
 assert.equal(x.proposal.baselineUsable,false);
 assert.equal(x.proposal.baselineStatus,'vetor_experimental_ignorado');
 assert.equal(T.total(x.proposal.levels),50);
 assert.deepEqual(x.proposal.levels,V.allocate(x.context.weights,x.context.role,50,null));
 assert.deepEqual(x.original,martin.niveis);
 assert(x.differences.some(t=>/experimental/i.test(t)));
 const frontier=V.trainingFrontier(x.context.weights,x.role,50,x.original,
  {baselineProvisional:x.trainingProvisional});
 assert.equal(frontier.status,'ESTIMADO');
 assert.equal(frontier.baselineStatus,'treino_experimental_sem_validacao');
 assert.equal(frontier.referenceSource,'proposta_contextual');
 assert.equal(frontier.candidates.some(c=>c.registered),false);
 assert.deepEqual(frontier.candidates.find(c=>c.id===frontier.primaryId).levels,
  x.proposal.levels);
 assert(frontier.candidates.every(c=>T.total(c.levels)===50&&!c.mayApply));
 const fixture=V.buildReview({...martin,treino_proposto_nao_validado:false},
  raw,lab,cards,tactic.id);
 assert(fixture.proposal&&fixture.proposal.baselineUsable);
 assert.deepEqual(fixture.proposal.levels,
  V.allocate(fixture.context.weights,fixture.context.role,50,martin.niveis));
 const fixtureFrontier=V.trainingFrontier(fixture.context.weights,fixture.role,50,
  fixture.original,{baselineProvisional:false});
 assert.equal(fixtureFrontier.referenceSource,'treino_registrado');
 comparison.push({tactic:tactic.id,pp:50,
  calculated:x.proposal.levels,baselineStatus:frontier.baselineStatus});
}
assert.equal(JSON.stringify(cards),before);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),original);
assert(read('package.json').includes('test-proof-training-consolidation-v291.cjs'));
assert(read('web/sw.js').includes('v291-proof-training'));
fs.mkdirSync(path.join(root,'build'),{recursive:true});
fs.writeFileSync(path.join(root,'build/v291-proof-training-246x5.json'),JSON.stringify({
 schema:'CRAQUE_V291_PROVA_FICHAS_SEM_ANCHOR_EXPERIMENTAL',
 cards:246,scenarios,blocked,accepted,identityPending,missingCaps,
 comparison,note:'Comparações automatizadas, não 246 builds homologadas.',
 evidence},null,2)+'\n');
console.log('V291 PASS: '+scenarios+' cenários, '+blocked+
 ' bloqueios sem nativas, '+accepted+' confirmações locais elegíveis,'+
 ' Martinelli 26/50 nos cinco estilos, 246 cartas intactas.');
