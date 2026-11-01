'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {historicalRead}=require('./historical-level-fixtures-v381.cjs');
const cards=JSON.parse(historicalRead(require.resolve('../web/SCOUT_V69_AUDITORIA.json'),'utf8')).cards;
const refs=JSON.parse(historicalRead(require.resolve('../web/ct376-card-references.json'),'utf8')).cards;
const C=require('../web/craque-rating-context-v376.js');
const expected={153:['105780749692770',25,48],196:['105754711432614',42,82]};
for(const [capture,[id,level,pp]] of Object.entries(expected)){
 const card=cards.find(c=>c.numero===Number(capture)),ref=refs.find(c=>c.capture===Number(capture));
 assert.equal(card.id,id,'Vincular a edição retratada, não a outra carta do mesmo jogador');
 assert.equal(card.max_level,level);assert.equal(card.pp,pp);assert.equal(card.pp_estimado,true);
 assert.equal(card.niveis,null,'Treino da identidade errada não é treino atual da nova');
 assert.equal(ref.identityUsable,true);assert.equal(ref.registeredLevels,null);
 const archive=require('../web/ct377-identity-corrections.json').cards.find(x=>x.capture===Number(capture));
 assert.notEqual(archive.beforeCanonical.id,id);assert(Array.isArray(archive.beforeCanonical.niveis));
 assert.equal(archive.afterCanonical.id,id);assert.deepEqual(archive.afterCanonical,card);
 assert.equal(ref.previousIdentity.cardId,archive.beforeCanonical.id);
 const html=historicalRead('web/'+card.arquivo,'utf8');
 const raw=JSON.parse(html.match(/<script id="scout-v68-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
 const lab=JSON.parse(html.match(/<script id="lab-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
 assert.equal(raw.id,id);assert.equal(raw.edition,card.versao);assert.equal(raw.recommended_levels,null);
 assert.equal(raw.native_skills,card.habilidades_nativas);assert.equal(raw.boost1,card.impeto_fixo);
 assert.equal(lab.id,id);assert.equal(lab.pp,pp);assert.equal(lab.A,null);assert.equal(lab.recommended,null);
 assert.equal(C.cost(lab.draftA),pp);assert.equal(lab.draftStatus,'proposta experimental não aprovada');
 const mem=new Map(),store={getItem:k=>mem.get(k)||null,setItem:(k,v)=>mem.set(k,v)};
 const oldKey=C.PREFIX+ref.key,old=JSON.stringify({schema:'CRAQUE_CURRENT_TRAINING_V376',cardKey:ref.key,
  cardId:archive.beforeCanonical.id,budget:52,levels:archive.beforeCanonical.niveis,confirmedByOwner:true});
 mem.set(oldKey,old);assert.equal(C.resolve(ref,card,store).ctx.training,null);
 C.saveTraining(ref,store,Array(10).fill(0),pp,true);
 assert.equal(mem.get(oldKey),old,'Nova confirmação não pode sobrescrever treino da identidade anterior');
 assert.equal(C.resolve(ref,card,store).source,'Treino confirmado por você');
 assert.equal(JSON.parse(mem.get(C.trainingKey(ref,id))).cardId,id);
 const previousEvidence=require('../web/SCOUT_V221_EVIDENCE_INDEX.json');
 assert.equal(require('../web/scout-evidence-review-v221.js').validate(previousEvidence,raw).ok,false,
  'Índice histórico de outra edição não pode certificar a ficha corrigida');
 const oldAudit=require('../web/SCOUT_V213_AUDITORIA_INDIVIDUAL.json').cards.find(x=>x.numero===Number(capture));
 assert.equal(require('../web/craque-ficha-individual-v251.js').proofChecklist(card,oldAudit,{},null).matched,false,
  'Dados antigos não viram comprovação da edição atual');
 const U=require('../web/craque-rating-ui-v376.js');
 assert.notEqual(U.observationKey(ref,{cardId:id}),U.observationKey(ref,{cardId:archive.beforeCanonical.id}));
}
assert(!cards.find(c=>c.numero===153).habilidades_nativas.includes('Visionary Pass'));
assert.equal(cards.find(c=>c.numero===153).impeto_fixo,'—');
for(const n of [61,144])assert.equal(refs.find(c=>c.capture===n).identityUsable,true);
console.log('V377 PASS: duas edições corrigidas, histórico preservado, propostas separadas e confirmação por Card ID.');
