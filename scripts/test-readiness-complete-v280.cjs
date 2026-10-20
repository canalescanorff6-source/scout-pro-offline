'use strict';
/* V280: a classificação documental não pode antecipar comprovação das
 * nativas, cinco adicionais ou slot de ímpeto da edição exata.
 * Nenhum dado é escrito no catálogo e gameplay não homologa builds.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const snapshot=read('web/SCOUT_V69_AUDITORIA.json');
const cards=JSON.parse(snapshot).cards;
const rows=JSON.parse(read('web/SCOUT_V221_EVIDENCE_INDEX.json')).cards;
const index=new Map(rows.map(x=>[x.numero,x]));
const V=require('../web/craque-ficha-individual-v251.js');
const C=require('../web/craque-competitive-readiness-v264.js');
const B=require('../web/booster-engine-v103.js');
assert.equal(cards.length,246);
assert.equal(index.size,246);
const pristine=JSON.stringify(cards);
function labOf(card){
 const html=read('web/'+card.arquivo);
 const match=html.match(/<script id="lab-data"[^>]*>([\s\S]*?)<\/script>/);
 assert(match,'Laboratório ausente na carta '+card.numero);
 return JSON.parse(match[1]);
}
let total=0;
for(const card of cards){
 const proof=V.proofChecklist(card,index.get(card.numero),labOf(card),null);
 const unmodified=JSON.stringify(card);
 for(const style of C.styles){
  const advice=V.methodologyGate(card,proof,style,null);
  const result=C.assess(card,proof,style,advice);
  const complete=Object.values(result.sources).every(v=>v===true);
  assert.equal(result.documentaryComplete,complete,'Status documental #'+card.numero+' '+style);
  assert.equal(result.classification==='gameplay',complete,
   'Não classificar gameplay com requisitos pendentes #'+card.numero+' '+style);
  if(!complete)assert(result.missing.length>0);
  if(complete)assert.equal(result.missing.length,0);
  assert.equal(result.allowedToReplaceApprovedBuild,false);
  assert.equal(result.competitivelyHomologated,false);
  assert.equal(result.canSpendTokensAutomatically,false);
  total++;
 }
 assert.equal(JSON.stringify(card),unmodified);
}
assert.equal(total,1230);
const card=cards.find(c=>c.numero===2);
assert(card&&B.trainingAudit(card).status==='custo_pp_conferido');
const ids=['edition','budget','native','additional','booster','base','video','gameplay'];
const documented={matched:true,checks:ids.map(id=>({id,documented:true}))};
for(const style of C.styles){
 const full=C.assess(card,documented,style);
 assert.equal(full.classification,'gameplay');
 assert.equal(full.documentaryComplete,true);
 assert.equal(full.documentationCount,9);
 for(const id of ids){
  const partial={matched:true,checks:documented.checks.map(x=>({
   ...x,documented:x.id===id?false:true
  }))};
  const r=C.assess(card,partial,style);
  assert.notEqual(r.classification,'gameplay','Prova '+id+' ausente em '+style);
  assert.equal(r.documentaryComplete,false);
  assert(r.missing.length>0);
 }
 const proposed=C.assess({...card,treino_proposto_nao_validado:true},documented,style);
 assert.notEqual(proposed.classification,'gameplay');
 assert.equal(proposed.documentaryComplete,false);
}
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),snapshot);
assert.equal(JSON.stringify(cards),pristine);
const report=read('scripts/build-competitive-report-v264.cjs');
assert(report.includes('evidencias_documentais_completas:readiness.documentaryComplete'));
assert(read('web/sw.js').includes('v280-complete-evidence'));
assert(read('package.json').includes('test-readiness-complete-v280.cjs'));
console.log('V280 PASS: 1230 cenários; gameplay exige 9/9 evidências, inclusive nativas, adicionais e slot. 246 cartas intactas.');
