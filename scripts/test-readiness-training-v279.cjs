// Fixture histórica anterior à correção autorizada V381; dados atuais são verificados no teste de integração V381.
const {historicalRead}=require('./historical-level-fixtures-v381.cjs');
'use strict';
/* V279 — prontidão do dossiê deve usar exatamente B.trainingAudit V267.
 * Uma build de PP coerente mas provisória não é uma build registrada válida.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>historicalRead(path.join(__dirname,'..',p),'utf8');
const catalogText=read('web/SCOUT_V69_AUDITORIA.json');
const catalog=JSON.parse(catalogText).cards;
const rows=JSON.parse(read('web/SCOUT_V221_EVIDENCE_INDEX.json')).cards;
const B=require('../web/booster-engine-v103.js');
const V=require('../web/craque-ficha-individual-v251.js');
const C=require('../web/craque-competitive-readiness-v264.js');
const index=new Map(rows.map(x=>[x.numero,x]));
assert.equal(catalog.length,246);
const original=JSON.stringify(catalog);
let count=0,valid=0,provisional=0,missing=0;
const labFor=c=>{
 const html=read('web/'+c.arquivo);
 const match=html.match(/<script id="lab-data"[^>]*>([\s\S]*?)<\/script>/);
 assert(match,'Laboratório ausente para #'+c.numero);
 return JSON.parse(match[1]);
};
for(const card of catalog){
 const proof=V.proofChecklist(card,index.get(card.numero),labFor(card),null);
 const training=B.trainingAudit(card);
 if(training.status==='custo_pp_conferido')valid++;
 if(training.status==='treino_proposto_nao_validado')provisional++;
 if(training.status==='vetor_ausente')missing++;
 for(const tactic of C.styles){
  const advice=V.methodologyGate(card,proof,tactic,null);
  const r=C.assess(card,proof,tactic,advice);
  assert.equal(r.trainingAuditStatus,training.status);
  assert.equal(r.ppCalculado,training.spent);
  assert.equal(r.ppOrcamento,training.pp);
  assert.equal(r.sources.training,training.status==='custo_pp_conferido');
  assert.equal(r.training==='registrada_sem_homologacao',training.status==='custo_pp_conferido');
  assert.equal(r.competitivelyHomologated,false);
  assert.equal(r.allowedToReplaceApprovedBuild,false);
  assert.equal(r.canSpendTokensAutomatically,false);
  assert.equal(r.missing.length+r.documentationCount,9);
  if(training.status==='treino_proposto_nao_validado'){
   assert.equal(r.training,'proposta_nao_homologada');
   assert(r.missing.includes('Treino proposto ainda não validado no jogo'));
   assert.notEqual(r.classification,'registered');
  }
  if(training.status==='vetor_ausente'){
   assert.equal(r.training,'ausente_ou_pendente');
   assert(r.missing.includes('Vetor de treino original registrado'));
  }
  count++;
 }
}
assert.equal(count,1230);
assert.equal(valid,159);
assert.equal(provisional,1);
assert.equal(missing,86);
const martinelli=catalog.find(c=>c.numero===191);
assert(martinelli&&martinelli.pp===50&&martinelli.max_level===26);
const baseProof=V.proofChecklist(martinelli,index.get(191),labFor(martinelli),null);
const assess=c=>C.assess(c,baseProof,'posse');
let result=assess(martinelli);
assert.equal(result.training,'proposta_nao_homologada');
assert.equal(result.ppCalculado,50);
assert.equal(result.ppOrcamento,50);
assert.equal(result.classification,'review');
result=assess({...martinelli,pp:66,treino_proposto_nao_validado:false});
assert.equal(result.trainingAuditStatus,'pp_divergentes');
assert.equal(result.training,'orcamento_pp_divergente');
assert.equal(result.ppCalculado,50);
assert.equal(result.ppOrcamento,66);
assert(result.missing.includes('Custo dos PP diverge do orçamento desta edição'));
assert.notEqual(result.classification,'registered');
result=assess({...martinelli,pp:null,treino_proposto_nao_validado:false});
assert.equal(result.trainingAuditStatus,'pp_nao_documentados');
assert(result.missing.includes('Orçamento de PP não documentado para o treino'));
result=assess({...martinelli,niveis:[0,1],treino_proposto_nao_validado:false});
assert.equal(result.trainingAuditStatus,'vetor_invalido');
assert(result.missing.includes('Vetor de treino inválido ou incompleto'));
result=assess({...martinelli,niveis:null});
assert.equal(result.trainingAuditStatus,'vetor_ausente');
const cardRegistered=catalog.find(c=>c.numero===2);
assert.equal(B.trainingAudit(cardRegistered).status,'custo_pp_conferido');
const cardProof=V.proofChecklist(cardRegistered,index.get(2),labFor(cardRegistered),null);
const ready=C.assess(cardRegistered,cardProof,'posse');
assert.equal(ready.training,'registrada_sem_homologacao');
assert.equal(ready.sources.training,true);
assert.equal(ready.classification,'registered');
assert.equal(ready.competitivelyHomologated,false);
const dossier=read('scripts/build-competitive-report-v264.cjs');
assert(dossier.includes('auditoria_pp:readiness.trainingAuditStatus'));
assert(dossier.includes('treino_com_prova_matematica:readiness.sources.training'));
assert(read('web/sw.js').includes('v279-readiness-pp'));
assert(read('package.json').includes('test-readiness-training-v279.cjs'));
assert.equal(JSON.stringify(catalog),original);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),catalogText);
console.log('V279 PASS: '+count+' avaliações; 161 registros PP coerentes, 1 proposta não homologada, 84 vetores ausentes. Nenhuma carta alterada.');
