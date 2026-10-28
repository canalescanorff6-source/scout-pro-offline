'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const V=require('../web/craque-ficha-individual-v251.js');
const T=require('../web/scout-multitactic-engine-v220.js');
const I=require('../web/craque-role-intelligence-v233.js');
const S=require('../web/skills-booster-v162.js'),B=require('../web/booster-engine-v103.js');
assert.equal(typeof V.trainingFrontier,'function','Comparador multiobjetivo ainda ausente');
const weights=[32,18,20,26,23,19,6,0,0,0];
const baseline=[4,4,8,10,8,0,0,0,0,0];
const snapshot=JSON.stringify({weights,baseline});
const r=V.trainingFrontier(weights,'CA',50,baseline);
assert.equal(r.status,'ESTIMADO');
assert.equal(r.budgetStatus,'CALCULADO');
assert.equal(r.exhaustive,false);
assert.equal(r.mayApply,false);
assert.equal(r.gameplayValidated,false);
assert(r.candidates.length>=3,'Precisa comparar distribuições distintas');
assert(r.candidates.length<=7,'Busca limitada para a interface offline');
assert.equal(r.referenceSource,'treino_registrado');
assert(r.candidates.some(x=>x.registered));
assert.equal(new Set(r.candidates.map(x=>x.levels.join(','))).size,r.candidates.length);
for(const c of r.candidates){
 assert.equal(T.total(c.levels),50);
 assert(c.levels.slice(7).every(x=>x===0));
 assert.equal(c.changes.reduce((sum,x)=>sum+x.deltaPP,0),0);
 assert.equal(c.addedPP,c.removedPP);
 for(const x of c.changes){
  assert.equal(x.deltaPP,T.ppCost(x.after)-T.ppCost(x.before));
  assert.equal(x.deltaLevels,x.after-x.before);
 }
 const dominant=r.candidates.filter(other=>other.id!==c.id&&
  r.axes.every(axis=>other.objectives[axis.key]>=c.objectives[axis.key]-1e-8)&&
  r.axes.some(axis=>other.objectives[axis.key]>c.objectives[axis.key]+1e-8));
 assert.equal(c.onFrontier,dominant.length===0,'Fronteira precisa respeitar dominância nos eixos declarados');
 assert.deepEqual([...c.dominatedBy].sort(),dominant.map(x=>x.id).sort());
}
assert.equal(JSON.stringify({weights,baseline}),snapshot,'Não mutar inputs');
assert.deepEqual(V.trainingFrontier(weights,'CA',50,baseline),r,'Determinístico');
assert.deepEqual(r.candidates.find(x=>x.id===r.primaryId).levels,V.allocate(weights,'CA',50,baseline),
 'Comparação não troca silenciosamente a proposta contextual');
for(const invalid of [null,undefined,'50',-1,1.5,239,NaN]){
 const x=V.trainingFrontier(weights,'CA',invalid,baseline);
 assert.equal(x.status,'PENDENTE');assert.equal(x.candidates.length,0);
}
assert.equal(V.trainingFrontier(weights,'DESCONHECIDO',50,baseline).status,'PENDENTE');
assert.equal(V.trainingFrontier([1,2],'CA',50,baseline).status,'PENDENTE');
assert.equal(V.trainingFrontier(weights.map(()=>0),'CA',50,baseline).status,'PENDENTE');
const zero=V.trainingFrontier(weights,'CA',0,null);
assert.equal(zero.candidates.length,1);assert(zero.candidates[0].levels.every(x=>x===0));
const go=V.trainingFrontier([0,0,0,0,0,0,0,18,19,17],'GO',56,null);
assert(go.candidates.length>=2);
assert(go.candidates.every(c=>c.levels.slice(0,7).every(x=>x===0)&&T.total(c.levels)===56));
const mismatch=V.trainingFrontier(weights,'CA',52,baseline);
assert.equal(mismatch.referenceSource,'proposta_contextual');
assert.equal(mismatch.baselineStatus,'orcamento_divergente');
assert(!mismatch.candidates.some(x=>x.registered));
const cached=V.allocate(weights,'CA',50,baseline);cached[0]=20;
assert.deepEqual(V.allocate(weights,'CA',50,baseline),r.candidates.find(x=>x.id===r.primaryId).levels);
// A matriz cobre as 246 edições; só 85 podem gerar hipóteses de PP. Não
// confundir processamento automático com validação individual de gameplay.
const raw=fs.readFileSync(require.resolve('../web/SCOUT_V69_AUDITORIA.json'),'utf8');
const cards=JSON.parse(raw).cards;
let tested=0,pending=0,candidates=0,tradeoffs=0;
for(const c of cards){
 const before=JSON.stringify(c);
 for(const tactic of T.STYLES){
  if(!V.confirmedLevel(c)){pending++;continue}
  const d={capture:c.numero,id:c.id,edition:c.versao,pp:c.pp,
   shown_position:c.posicao,attack_style:c.estilo_ataque,defence_style:c.estilo_defesa,
   native_skills:c.habilidades_nativas,recommended_levels:c.niveis};
  const interpretation=I.interpret(d,tactic.id,{});
  const x=V.trainingFrontier(interpretation.weights,interpretation.role,c.pp,c.niveis);
  assert.equal(x.status,'ESTIMADO');
  for(const candidate of x.candidates){
   assert.equal(T.total(candidate.levels),c.pp);
   assert.equal(candidate.addedPP,candidate.removedPP);
   assert(Object.values(candidate.objectives).every(Number.isFinite));
   assert.equal(candidate.mayApply,false);
   candidates++;if(candidate.changes.length)tradeoffs++;
  }
  tested++;
 }
 assert.equal(JSON.stringify(c),before);
}
assert.equal(tested,425);assert.equal(pending,805);assert(candidates>tested);
assert.equal(fs.readFileSync(require.resolve('../web/SCOUT_V69_AUDITORIA.json'),'utf8'),raw);
assert.equal(typeof S.trainingScenario,'function','Cenário precisa recalcular habilidades e ímpetos sem gravar treino');
const c=cards.find(x=>x.numero===191);
const d={capture:c.numero,id:c.id,edition:c.versao,pp:c.pp,shown_position:c.posicao,
 attack_style:c.estilo_ataque,native_skills:c.habilidades_nativas,
 boost1:c.impeto_fixo,boost2:c.impeto_extra,max_level:c.max_level,pp_origem:c.pp_origem,
 recommended_levels:c.niveis,training_provisional:true};
const inputSnapshot=JSON.stringify(d),levels=r.candidates[0].levels;
const experiment=S.trainingScenario(d,'posse',levels,B);
assert.equal(experiment.status,'ESTIMADO');
assert.equal(experiment.sourceTrainingStatus,'treino_proposto_nao_validado');
assert.equal(experiment.mayApply,false);assert.equal(experiment.maySpendTokens,false);
assert.equal(experiment.budgetStatus,'CALCULADO');
assert(experiment.boosters.length>0);
assert(experiment.boosters.every(x=>x.status_validacao==='SIMULACAO_EXPERIMENTAL'&&
 x.evidencias.pp_status==='simulacao_custo_pp_exato'&&!x.evidencias.atributos_finais_comprovados));
assert.equal(experiment.skills.investmentEvidence,'simulacao_custo_pp_exato');
assert.equal(experiment.skills.slotsRemaining,null);
assert.equal(JSON.stringify(d),inputSnapshot);
assert.equal(S.trainingScenario({...d,max_level:undefined},'posse',levels,B).status,'PENDENTE');
assert.equal(S.trainingScenario(d,'posse',Array(10).fill(0),B).status,'PENDENTE');
assert.equal(S.trainingScenario({...d,id:'PENDENTE'},'posse',levels,B).status,'PENDENTE');
console.log(`V289 TREINO PASS: ${tested} hipóteses contextuais, ${candidates} candidatos exatos, ${tradeoffs} comparações de custo; ${pending} cenários pendentes, 246 cartas imutáveis.`);
