'use strict';
/* V282 — distinguish same outcomes from identical evidence, not randomize builds. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const raw=read('web/SCOUT_V69_AUDITORIA.json'),cards=JSON.parse(raw).cards;
const S=require('../web/skills-booster-v162.js'),B=require('../web/booster-engine-v103.js');
const before=JSON.stringify(cards);
const materialize=c=>({
 capture:c.numero,id:c.id,edition:c.versao,
 original_position:c.posicao,shown_position:c.posicao,role_used:c.posicao,
 attack_style:c.estilo_ataque,defence_style:c.estilo_defesa,
 native_skills:c.habilidades_nativas,pp:c.pp,pp_estimado:c.pp_estimado,
 recommended_levels:c.niveis,training_provisional:c.treino_proposto_nao_validado===true,
 boost1:c.impeto_fixo,boost2:c.impeto_extra
});
const bySignature=new Map(),dossiers=[],auditedPairs=[],topTraces=[];
let count=0,deltaCount=0,sourceIncomplete=0,blocked=0,sourceNative=0,
 sameTop=0,distinctTop=0,differentSourceClusters=0;
assert.equal(cards.length,246);assert.equal(new Set(cards.map(c=>c.numero+'@'+c.id)).size,246);
for(const card of cards){
 const snapshot=JSON.stringify(card),d=materialize(card);
 const dossier=S.evidenceDossier(d,'posse',B);
 assert.equal(dossier.tacticCounterfactuals.length,4);
 const results={cap:card.numero,cardId:card.id,edition:card.versao,
  origin:card.posicao,styles:{}};
 for(const tactic of B.tactics){
  const p=S.individualEvidenceProfile(d,tactic,B);
  assert.equal(p.schema,'CRAQUE_V282_PERFIL_EVIDENCIA_INDIVIDUAL');
  assert.equal(p.proof.capture,card.numero);
  assert.equal(p.proof.cardId,String(card.id));
  assert.equal(p.proof.edition,String(card.versao));
  assert.equal(p.proof.progressStatus,S.investmentAudit(d).status);
  assert.equal(p.verifiedCreatorBuild,false);assert.equal(p.verifiedGameplay,false);
  assert.equal(p.mayChangeBuild,false);assert.equal(p.maySpendTokens,false);
  assert(p.recommendations.length<=5);
  assert.equal(new Set(p.suggestedSkillKeys).size,p.suggestedSkillKeys.length);
  const known=new Set(String(card.habilidades_nativas||'').split(';')
   .map(S.keyFor).filter(Boolean));
  assert(p.suggestedSkillKeys.every(x=>!known.has(x)));
  for(const item of p.recommendations){
   const c=item.criteria;
   assert.equal(item.score,c.funcao+c.tatica+c.estilo+c.nativas+c.investimento);
   assert.deepEqual(item.provenance,
    {functionScore:c.funcao,tacticScore:c.tatica,styleScore:c.estilo,
     nativeScore:c.nativas,investmentScore:c.investimento});
   assert.equal(item.status,'SUGESTAO_SEM_HOMOLOGACAO');
  }
  if(!p.proof.nativeFingerprint)sourceIncomplete++;
  if(p.proof.nativeCount)sourceNative++;
  if(p.missing.length)blocked++;
  const key=[tactic,p.proof.role,p.proof.style,p.suggestedSkillKeys.join(','),
   p.firstBooster||''].join('::');
  if(!bySignature.has(key))bySignature.set(key,[]);
  bySignature.get(key).push({cap:card.numero,cardId:card.id,
   edition:card.versao,proof:p.proof});
  results.styles[tactic]={first:p.suggestedSkillKeys[0]||null,
   skills:p.suggestedSkillKeys,boost:p.firstBooster,
   evidence:p.proof,missing:p.missing,applies:false};
  count++;
 }
 for(const compareWith of B.tactics.slice(1)){
  const diff=S.tacticalSkillDelta(d,'posse',compareWith);
  assert.equal(diff.schema,'CRAQUE_V282_DELTA_TATICO');
  assert.equal(diff.changesAuthorized,false);
  assert.equal(diff.first,'posse');assert.equal(diff.second,compareWith);
  assert(diff.rows.length<=10);
  for(const row of diff.rows){
   if(row.comparable){
    assert.equal(row.scoreDelta,row.secondScore-row.firstScore);
    const names=['funcao','tatica','estilo','nativas','investimento'];
    assert.equal(row.scoreDelta,names.reduce((sum,key)=>sum+row.factors[key].delta,0));
   }else{
    assert.equal(row.scoreDelta,null);
   }
  }
  if(diff.sameFirst)sameTop++;else distinctTop++;
  deltaCount++;topTraces.push({cap:card.numero,tactic:compareWith,
   topSame:diff.sameFirst,deltas:diff.rows.filter(x=>x.comparable&&x.scoreDelta!==0).length});
 }
 assert.equal(JSON.stringify(card),snapshot,'Carta original alterada #'+card.numero);
 dossiers.push(results);
}
assert.equal(count,1230);assert.equal(deltaCount,984);
assert.equal(JSON.stringify(cards),before);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),raw);
for(const [signature,group] of bySignature){
 if(group.length<2)continue;
 const native=new Set(group.map(x=>x.proof.nativeFingerprint));
 const pp=new Set(group.map(x=>JSON.stringify(x.proof.progressVector)));
 if(native.size===1&&pp.size===1)continue;
 differentSourceClusters++;
 const left=group[0],right=group.find(x=>
  x.proof.nativeFingerprint!==left.proof.nativeFingerprint||
  JSON.stringify(x.proof.progressVector)!==JSON.stringify(left.proof.progressVector));
 if(!right)continue;
 const tactic=signature.split('::')[0];
 const x=cards.find(c=>c.numero===left.cap),y=cards.find(c=>c.numero===right.cap);
 const comparator=S.compareIndividualEvidence(materialize(x),materialize(y),tactic,B);
 assert.equal(comparator.schema,'CRAQUE_V282_COMPARATIVO_SEM_CLONE_FORCADO');
 assert.equal(comparator.canApply,false);assert.equal(comparator.canChangeTraining,false);
 assert.equal(comparator.topFiveIdentical,true);
 assert.equal(comparator.reviewRequired,true);
 assert.equal(comparator.assessment,'MESMAS_SKILLS_EVIDENCIAS_DIFERENTES_REVISAR');
 assert(comparator.evidenceDeltas.some(z=>['native','training','pp'].includes(z.field)));
 auditedPairs.push({signature,caps:group.map(z=>z.cap),
  distinctNative:native.size,distinctTraining:pp.size,
  sampleComparison:comparator});
}
const fixture={capture:777,id:'SAME-ID',edition:'Epic Test A',shown_position:'MAT',
 attack_style:'Armador criativo',native_skills:'Passe de primeira',pp:64,
 recommended_levels:null};
const copy={...fixture,edition:'Epic Test B',native_skills:'Passe em profundidade'};
const compared=S.compareIndividualEvidence(fixture,copy,'posse',B);
assert.equal(compared.canApply,false);
assert(compared.evidenceDeltas.some(x=>x.field==='edition'));
assert(compared.evidenceDeltas.some(x=>x.field==='native'));
assert.equal(S.compareIndividualEvidence(fixture,fixture,'posse',B).reviewRequired,false);
assert.throws(()=>S.tacticalSkillDelta(fixture,'posse','INVENTADA'),/dois estilos/);
const martin=cards.find(x=>x.numero===191);
assert.equal(martin.pp,50);assert.equal(martin.max_level,26);
const moved=S.individualEvidenceProfile({...materialize(martin),
 original_position:'PTE',shown_position:'CA',role_used:'CA',
 training_provisional:true},'posse',B);
assert.equal(moved.proof.originalPosition,'PTE');
assert.equal(moved.proof.usedPosition,'CA');
assert.equal(moved.proof.progressVector,null);
const report={schema:'CRAQUE_V282_CARD_DISTINCTION_DIAGNOSTIC',
 cards:246,scenarios:count,counterfactuals:deltaCount,
 cardsWithTrainingOrNativePending:blocked,
 scenariosWithNativeSkills:sourceNative,emptyNativeFingerprints:sourceIncomplete,
 sameTopAcrossPosse: sameTop,distinctTopAcrossPosse:distinctTop,
 differentEvidenceClusters:differentSourceClusters,
 note:'Semelhanças são fila de conferência, não erros provados, e nenhuma carta foi alterada.',
 keyComparisons:auditedPairs.slice(0,100),
 traces:topTraces,playerDossiers:dossiers};
fs.mkdirSync(path.join(root,'build'),{recursive:true});
fs.writeFileSync(path.join(root,'build/v282-individual-card-distinction-246x5.json'),
 JSON.stringify(report,null,2)+'\n');
assert(read('web/sw.js').includes('v282-distinct-evidence'));
assert(read('package.json').includes('test-card-distinction-v282.cjs'));
console.log('V282 PASS: '+count+' fichas x cinco estilos, '+deltaCount+
 ' contrafactuais, '+differentSourceClusters+
 ' agrupamentos de recomendações iguais com evidências diferentes, 246 cartas intactas.');
