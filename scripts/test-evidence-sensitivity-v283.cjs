// Fixture histórica anterior à correção autorizada V381; dados atuais são verificados no teste de integração V381.
const {historicalRead}=require('./historical-level-fixtures-v381.cjs');
'use strict';
// V283 — auditoria integral das 246 cartas nos cinco estilos, sem alterar o acervo.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>historicalRead(path.join(root,p),'utf8');
const raw=read('web/SCOUT_V69_AUDITORIA.json'),cards=JSON.parse(raw).cards;
const S=require('../web/skills-booster-v162.js');
const B=require('../web/booster-engine-v103.js');
const initial=JSON.stringify(cards);
assert.equal(cards.length,246);
assert.equal(new Set(cards.map(c=>c.numero+'@'+c.id+'@'+c.versao)).size,246);
const build=c=>({capture:c.numero,id:c.id,edition:c.versao,
 original_position:c.posicao,shown_position:c.posicao,role_used:c.posicao,
 attack_style:c.estilo_ataque,defence_style:c.estilo_defesa,
 native_skills:c.habilidades_nativas,pp:c.pp,pp_estimado:c.pp_estimado,
 recommended_levels:c.niveis,training_provisional:c.treino_proposto_nao_validado===true,
 boost1:c.impeto_fixo,boost2:c.impeto_extra});
let scenarios=0,nativeSensitive=0,trainingSensitive=0,boosterSensitive=0;
let blocked=0;const report=[];
for(const card of cards){
 const before=JSON.stringify(card),d=build(card),rows=[];
 for(const tactic of B.tactics){
  const r=S.evidenceSensitivityV283(d,tactic,B);
  assert.equal(r.schema,'CRAQUE_V283_SENSIBILIDADE_EVIDENCIAS');
  assert.equal(r.identity.capture,card.numero);
  assert.equal(r.identity.cardId,String(card.id));
  assert.equal(r.identity.edition,String(card.versao));
  assert.equal(r.comparisons.length,2);
  assert.deepEqual(r.comparisons.map(x=>x.factor),['nativas','treino']);
  assert.equal(r.changesAuthorized,false);
  assert.equal(r.equipAuthorized,false);
  assert.equal(r.creatorApproval,false);
  assert.deepEqual(r.sourceTopFive,
   S.individualEvidenceProfile(d,tactic,B).suggestedSkillKeys);
  assert.equal(new Set(r.sourceTopFive).size,r.sourceTopFive.length);
  assert(r.sourceTopFive.length<=5);
  assert(r.comparisons.every(x=>x.mayApply===false&&
    x.originalTopFive.length<=5&&x.scenarioTopFive.length<=5));
  assert(r.comparisons.every(x=>x.changedSkillPositions>=0&&
    x.changedSkillPositions<=5));
  const nc=r.comparisons[0],tc=r.comparisons[1];
  if(nc.skillsChanged)nativeSensitive++;
  if(tc.skillsChanged)trainingSensitive++;
  if(nc.boosterChanged||tc.boosterChanged)boosterSensitive++;
  if(r.warnings.length)blocked++;
  rows.push({tactic,changedWithoutNatives:nc.skillsChanged,
   changedWithoutTraining:tc.skillsChanged,
   changedBooster:nc.boosterChanged||tc.boosterChanged,
   pending:r.warnings.length});
  scenarios++;
 }
 assert.equal(JSON.stringify(card),before,'Carta original modificada '+card.numero);
 report.push({capture:card.numero,cardId:card.id,edition:card.versao,rows});
}
assert.equal(scenarios,1230);assert.equal(JSON.stringify(cards),initial);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),raw);
const martin=cards.find(c=>c.numero===191);
assert(martin);assert.equal(martin.pp,50);assert.equal(martin.max_level,26);
const card=build(cards[0]),valid={
 schema:'CRAQUE_BOOST_SLOT_V283',capture:card.capture,card_id:card.id,
 edition:card.edition,status:'vazio',equipped:''
};
assert.equal(S.boosterRecordEvidence(card,valid).valid,true);
for(const invalid of [
 {...valid,capture:card.capture+1},{...valid,card_id:'outra'},
 {...valid,edition:'outra edicao'},{...valid,schema:'antigo'},
 {...valid,status:'pendente'},{...valid,status:'vazio',equipped:'Technique'},
 {...valid,status:'ausente',equipped:'Technique'},
 {card_id:card.id,edition:card.edition,status:'vazio'}
])assert.equal(S.boosterRecordEvidence(card,invalid).valid,false);
assert.equal(S.boosterRecordEvidence(card,{...valid,status:'ocupado',equipped:'Technique'}).valid,true);
const review=read('web/revisao-impetos-v103.js');
assert(review.includes("schema:'CRAQUE_BOOST_SLOT_V283'"));
assert(review.includes('capture:c.numero'));
assert(review.includes('edition:c.edition'));
assert(review.includes('R.boosterRecordEvidence(identity(c),saved).valid'));
assert(read('web/revisao-impetos-v103.html').includes('skills-booster-v162.js'));
const unified=read('web/scout-card-unified-v220.js');
assert(unified.includes('R.verifiedRecommendationContextV288?.({...card,capture:cap,id},{'));
assert(unified.includes('equipmentRecord:manualProof,boosterRecord:slot'));
const fiche=read('web/craque-ficha-individual-v251.js');
assert(fiche.includes('S?.boosterRecordEvidence?.(data,record)?.valid===true'));
assert(fiche.includes('const S=new Proxy(')&&fiche.includes('const B=new Proxy('));
assert(fiche.includes("doc.addEventListener('scoutpro:recommendations-ready',display)"));
assert(fiche.includes('S.evidenceSensitivityV283(input,active,B)')||
 fiche.includes('S.evidenceSensitivityV283({'));
assert(read('web/sw.js').includes('v283-slot-evidence-sensitivity'));
assert(read('package.json').includes('test-evidence-sensitivity-v283.cjs'));
fs.mkdirSync(path.join(root,'build'),{recursive:true});
fs.writeFileSync(path.join(root,'build/v283-sensitivity-246x5.json'),
 JSON.stringify({schema:'CRAQUE_V283_AUDITORIA',cards:246,scenarios,
 nativeSensitive,trainingSensitive,boosterSensitive,blocked,
 meaning:'Mudanca relativa de heuristica, NUNCA desempenho medido, slot comprovado ou build homologada.',
 reports:report},null,2)+'\n');
console.log('V283 PASS: '+scenarios+' cenários; '+nativeSensitive+
 ' ranking(s) sensíveis a nativas, '+trainingSensitive+
 ' ao treino e '+boosterSensitive+' escolhas de ímpetos sensíveis; '+blocked+
 ' cenários com alertas. Acervo original intacto.');
