'use strict';
const assert=require('node:assert/strict');
const S=require('../web/skills-booster-v162.js');
const B=require('../web/booster-engine-v103.js');
const fs=require('node:fs'),vm=require('node:vm');
const d={capture:40,id:'88029918268889',edition:'Epic — Manchester United FC 99-00',
 shown_position:'CA',native_skills:'Heading',attack_style:'Artilheiro',
 boost1:'Shooting +2',boost2:'PENDENTE'};
const proof=(card,list)=>({schema:'CRAQUE_ADDITIONAL_V254',capture:card.capture,
 card_id:card.id,edition:card.edition,confirmed:true,
 fingerprint:S.fingerprint(list),nativeFingerprint:S.fingerprint(card.native_skills)});
const run=(name,fn)=>{try{fn();console.log('PASS',name)}catch(e){console.error('FAIL',name,e.message);process.exitCode=1}};
run('rejeita skill de GO na confirmação de um CA',()=>{
 const manual='Reposição baixa do GO';
 assert.equal(S.checkedEquipment(d,manual,proof(d,manual)),false);
 const x=S.evaluate(d,'posse',manual,{equippedConfirmed:true});
 assert.equal(x.equippedConfirmed,false);
 assert.equal(x.slotsRemaining,null);
 assert.equal(x.requiresReconciliation,true);
 assert(x.incompatibleEquipped.includes(manual));
});
run('especial de GO não equivale à Liderança selecionável',()=>{
 assert.equal(S.keyFor('Comandante da defesa GO'),'');
 const go={...d,shown_position:'GO',native_skills:'Comandante da defesa GO'};
 const x=S.evaluate(go,'posse');
 assert(x.rankedCandidates.some(c=>c.key==='captain'));
 assert.equal(x.contextualNativeSkills.length,1);
});
run('adicional conferida oferece complementaridade separada das nativas',()=>{
 const plain=S.evaluate(d,'posse','Chute de primeira');
 const checked=S.evaluate(d,'posse','Chute de primeira',{
  equippedConfirmed:true,equipmentRecord:proof(d,'Chute de primeira')});
 const a=plain.rankedCandidates.find(x=>x.key==='onepass');
 const b=checked.rankedCandidates.find(x=>x.key==='onepass');
 assert(b.score>a.score);
 assert.equal(a.criterios.adicionais,0);
 assert(b.criterios.adicionais>0&&b.criterios.adicionais<=8);
 assert.equal(checked.equippedSynergyApplied,true);
 assert.equal(plain.equippedSynergyApplied,false);
 assert(!checked.recommendations.some(x=>x.key==='firstshot'));
});
run('nomes equivalentes e lista inválida não fabricam contexto',()=>{
 const a=S.evaluate(d,'posse','First-time Shot',{
  equippedConfirmed:true,equipmentRecord:proof(d,'First-time Shot')});
 const b=S.evaluate(d,'posse','Chute de primeira',{
  equippedConfirmed:true,equipmentRecord:proof(d,'Chute de primeira')});
 assert.deepEqual(a.rankedCandidates,b.rankedCandidates);
 const invalid=S.evaluate(d,'posse','Chute de primeira; Heading',{equippedConfirmed:true});
 assert.equal(invalid.equippedSynergyApplied,false);
});
run('explicações por habilidade distinguem hipótese e lacunas',()=>{
 const x=S.evaluate(d,'posse','Chute de primeira',{equippedConfirmed:true});
 for(const s of x.recommendations){
  assert(s.decision.reason&&s.decision.situation&&s.decision.confidence);
  assert.equal(s.decision.status,'ESTIMADO');
  assert.equal(s.decision.mayApply,false);
  assert(s.decision.priority>=1&&s.decision.priority<=x.rankedCandidates.length);
 }
 const unknown=S.evaluate({...d,native_skills:''},'posse');
 assert(unknown.recommendations.every(s=>s.decision.confidence==='pendente'));
});
run('ímpeto usa apenas adicional conferida da mesma edição',()=>{
 const manual='Passe de primeira';
 const equipment={manualEquipped:manual,equipmentRecord:proof(d,manual)};
 const base=B.rank(d,'posse');
 const checked=B.rank(d,'posse',equipment);
 assert(checked.some(x=>x.evidencias.score_adicionais>0));
 assert(base.every(x=>x.evidencias.score_adicionais===0));
 assert(checked.every(x=>x.evidencias.score_adicionais<=3));
 for(const altered of [
  {...equipment,equipmentRecord:{...equipment.equipmentRecord,edition:'Outra edição'}},
  {...equipment,equipmentRecord:{...equipment.equipmentRecord,card_id:'outro'}},
  {...equipment,equipmentRecord:{...equipment.equipmentRecord,nativeFingerprint:'alterado'}},
  {...equipment,manualEquipped:'Toque duplo'},
  {...equipment,equipmentRecord:{...equipment.equipmentRecord,confirmed:false}}
 ])assert.deepEqual(B.rank(d,'posse',altered),base);
 const context=S.verifiedRecommendationContextV288(d,equipment);
 const boost=S.booster(d,'posse',B,null,null,context.options);
 assert(boost.primary.evidencias.adicionais_conferidas);
 assert.equal(boost.decisionEvidence.canSpendTokens,false);
 assert.equal(boost.able,false,'Comprovar skill não comprova slot de ímpeto');
});
run('ficha principal usa a mesma prova para habilidades e ímpetos',()=>{
 const manual='Passe de primeira',record=proof(d,manual),memory=new Map([
  ['scoutpro:v162:equipped:'+d.capture+':'+d.id,manual],
  [S.confirmationKey(d.capture,d.id),JSON.stringify(record)]
 ]);
 const window={SCOUT_RECOMMENDATIONS_V162:S,SCOUT_BOOSTERS_V103:B,
  SCOUT_TACTICS_V220:require('../web/scout-multitactic-engine-v220.js'),
  localStorage:{getItem:key=>memory.get(key)||null}};
 const exported={exports:{}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../web/scout-card-unified-v220.js'),'utf8'),{window,module:exported});
 const actual=exported.exports.nativeDetails(d,'posse');
 assert.equal(actual.skills.equippedConfirmed,true);
 assert.equal(actual.booster.primary.evidencias.adicionais_conferidas,true);
 const unknown={...d,id:'PENDENTE'};
 memory.set('scoutpro:v162:equipped:'+d.capture+':PENDENTE',manual);
 memory.set(S.confirmationKey(d.capture,'PENDENTE'),JSON.stringify({...record,card_id:'PENDENTE'}));
 const blocked=exported.exports.nativeDetails(unknown,'posse');
 assert.equal(blocked.skills.equippedConfirmed,false);
 assert.equal(blocked.skills.slotsRemaining,null);
 assert.equal(blocked.booster.primary.evidencias.adicionais_conferidas,false);
});
run('bônus adicional rejeita flag isolada e opções verificadas de outra edição',()=>{
 const manual='Chute de primeira',record=proof(d,manual);
 const options=S.verifiedRecommendationContextV288(d,{manualEquipped:manual,equipmentRecord:record}).options;
 assert(S.evaluate(d,'posse',manual,options).equippedSynergyApplied);
 assert.equal(S.evaluate(d,'posse',manual,{equippedConfirmed:true}).equippedSynergyApplied,false);
 for(const card of [{...d,edition:'Outra edição'},{...d,id:'PENDENTE'},
  {...d,native_skills:d.native_skills+'; Interceptação'},{...d,capture:41}]){
  assert.equal(S.evaluate(card,'posse',manual,options).equippedSynergyApplied,false);
 }
 assert.equal(S.evaluate(d,'posse','Passe em profundidade',options).equippedSynergyApplied,false);
 const portfolio=S.strategicPortfolioV286(d,'posse',B,manual,options);
 assert(portfolio.selected.some(x=>x.factors.adicionais>0),'Propagar prova até o portfólio');
});
run('aliases confirmados da mesma skill produzem exatamente o mesmo ranking de ímpetos',()=>{
 const aliases=['Through Passing','Passe em profundidade','Passe a rasgar','Passe infiltrado'];
 const rank=manual=>B.rank(d,'posse',{manualEquipped:manual,equipmentRecord:proof(d,manual)});
 for(const manual of aliases)assert.deepEqual(rank(manual),rank(aliases[0]));
});
const martinelli=require('../web/SCOUT_V69_AUDITORIA.json').cards.find(c=>c.numero===191);
const scenarioCard={capture:martinelli.numero,id:martinelli.id,edition:martinelli.versao,
 shown_position:martinelli.posicao,attack_style:martinelli.estilo_ataque,
 native_skills:martinelli.habilidades_nativas,boost1:martinelli.impeto_fixo,
 boost2:martinelli.impeto_extra,pp:martinelli.pp,max_level:martinelli.max_level,
 pp_origem:martinelli.pp_origem,recommended_levels:martinelli.niveis,training_provisional:true};
run('cenário exclui o ímpeto ocupado comprovado da mesma edição',()=>{
 const record={schema:'CRAQUE_BOOST_SLOT_V283',capture:scenarioCard.capture,
  card_id:scenarioCard.id,edition:scenarioCard.edition,status:'ocupado',equipped:'Technique'};
 const result=S.trainingScenario(scenarioCard,'posse',martinelli.niveis,B,'',{boosterRecord:record});
 assert.equal(result.status,'ESTIMADO');
 assert(!result.boosters.some(x=>x.nome==='Technique'));
 assert.equal(result.maySpendTokens,false);
});
run('cenário respeita as categorias de função do mesmo comparador',()=>{
 const onlyGO=[0,0,0,0,0,0,0,6,11,11];
 assert.equal(B.progressCost(onlyGO),50);
 assert.equal(S.trainingScenario(scenarioCard,'posse',onlyGO,B).status,'PENDENTE');
 assert.equal(S.trainingScenario({...scenarioCard,shown_position:'GO'},'posse',martinelli.niveis,B).status,'PENDENTE');
});
