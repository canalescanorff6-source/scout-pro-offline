'use strict';
// V338 — Pareto custo-benefício dos PP: rascunhos com saldo são escolhas legítimas.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const V=require('../web/craque-ficha-individual-v251.js');
const T=require('../web/scout-multitactic-engine-v220.js');
const cardsRaw=fs.readFileSync(require.resolve('../web/SCOUT_V69_AUDITORIA.json'),'utf8');
const cards=JSON.parse(cardsRaw).cards;
assert.equal(cards.length,246);
const weights=[32,18,20,26,23,19,6,0,0,0];
const original=[10,5,5,8,8,6,0,0,0,0],budget=T.total(original);
const draft=[9,6,5,8,8,6,0,0,0,0],used=T.total(draft);
const inputSnapshot=JSON.stringify({weights,original,draft});
assert.equal(budget,62);
assert.equal(used,61);
const r=V.trainingFrontier(weights,'CA',budget,draft,{baselineSource:'rascunho_independente'});
assert.equal(r.status,'ESTIMADO');
assert.equal(r.budgetStatus,'CALCULADO');
assert.equal(r.baselineStatus,'rascunho_com_saldo');
assert.equal(r.referenceSource,'rascunho_independente');
assert.equal(r.referenceSpent,used);
assert.equal(r.referenceRemainingPP,1);
assert.deepEqual([...r.reference],draft);
assert.equal(r.exhaustive,false);
assert.equal(r.mayApply,false);
assert.equal(r.gameplayValidated,false);
assert(r.candidates.length>=2);
assert(r.candidates.length<=7);
const saved=r.candidates.find(x=>x.registered);
assert(saved,'O rascunho de 61 PP deve constar do comparador');
assert.deepEqual([...saved.levels],draft);
assert.equal(saved.spent,61);
assert.equal(saved.remainingPP,1);
assert.equal(saved.freePPInvested,0);
assert.equal(saved.addedPP,0);
assert.equal(saved.removedPP,0);
assert(saved.onFrontier,
 'O rascunho com PP sobrando não pode ser dominado por candidatos que custam MAIS PP');
assert(!saved.dominatedBy.length);
assert(r.candidates.some(x=>x.spent===budget),
 'Devem existir propostas de alocação exata para comparar o investimento do saldo');
for(const c of r.candidates){
 assert.equal(c.spent,T.total(c.levels));
 assert.equal(c.remainingPP,budget-c.spent);
 assert.equal(c.addedPP-c.removedPP,c.spent-r.referenceSpent);
 assert.equal(c.netDeltaPP,c.spent-r.referenceSpent);
 assert.equal(c.redistributedPP,Math.min(c.addedPP,c.removedPP));
 assert.equal(c.freePPInvested,Math.max(0,c.spent-r.referenceSpent));
 assert(c.mayApply===false);
 assert(c.dominatedBy.every(id=>{
  const rival=r.candidates.find(x=>x.id===id);
  return rival&&rival.spent<=c.spent&&
   r.axes.every(a=>rival.objectives[a.key]>=c.objectives[a.key]-1e-8)&&
   (rival.spent<c.spent||r.axes.some(a=>rival.objectives[a.key]>c.objectives[a.key]+1e-8));
 }));
 assert.equal(c.onFrontier,c.dominatedBy.length===0);
 assert(Object.isFrozen(c)&&Object.isFrozen(c.levels)&&Object.isFrozen(c.changes));
}
assert.deepEqual(V.trainingFrontier(weights,'CA',budget,draft,
 {baselineSource:'rascunho_independente'}),r,'Determinismo offline');
assert.equal(V.trainingFrontier(weights,'CA',budget,draft).baselineStatus,
 'orcamento_divergente','Sem origem explícita, PP divergentes continuam BLOQUEADOS');
assert.equal(V.trainingFrontier(weights,'CA',budget,draft).referenceSource,
 'proposta_contextual');
const provisional=V.trainingFrontier(weights,'CA',budget,draft,
 {baselineSource:'rascunho_independente',baselineProvisional:true});
assert.equal(provisional.baselineStatus,'treino_experimental_sem_validacao');
assert(!provisional.candidates.some(c=>c.registered),
 'Origem provisória não vira ficha registrada automaticamente');
const over=original.slice();over[0]=20;
const unsafe=V.trainingFrontier(weights,'CA',budget,over,
 {baselineSource:'rascunho_independente'});
assert.equal(unsafe.baselineStatus,'orcamento_divergente');
assert(!unsafe.candidates.some(c=>c.registered));
const outside=draft.slice();outside[7]=1;
const badRole=V.trainingFrontier(weights,'CA',budget,outside,
 {baselineSource:'rascunho_independente'});
assert.equal(badRole.baselineStatus,'categorias_fora_do_modelo');
const goalieWeights=[0,0,0,0,0,0,0,18,19,17];
const unrelated=V.trainingFrontier(goalieWeights,'GO',budget,draft,
 {baselineSource:'rascunho_independente'});
assert.equal(unrelated.baselineStatus,'categorias_fora_do_modelo');
const ui=fs.readFileSync(require.resolve('../web/craque-ficha-individual-v251.js'),'utf8');
assert(ui.includes("result.referenceSource==='rascunho_independente'"));
assert(ui.includes("chosen.remainingPP+' PP livres"));
assert(ui.includes("chosen.redistributedPP+"));
assert(ui.includes("chosen.freePPInvested+"));
assert(!ui.includes("chosen.removedPP+\n    ' PP redirecionados"));
assert.equal(JSON.stringify({weights,original,draft}),inputSnapshot);
assert.equal(fs.readFileSync(require.resolve('../web/SCOUT_V69_AUDITORIA.json'),'utf8'),cardsRaw);
console.log('V338 PASS: Pareto com orçamento, PP usados/livres, referência salva e custo explícito sem homologar build; 246 cartas intactas.');
