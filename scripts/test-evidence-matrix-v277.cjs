'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const raw=read('web/SCOUT_V69_AUDITORIA.json'),cards=JSON.parse(raw).cards;
const S=require('../web/skills-booster-v162.js'),B=require('../web/booster-engine-v103.js');
assert.equal(cards.length,246);assert.equal(new Set(cards.map(c=>c.numero+'@'+c.id)).size,246);
let cases=0,nativeFamilyCases=0,candidates=0,boosterComponents=0,nearBooster=0;
const record=[],repeats=new Map();
for(const card of cards){
 const original=JSON.stringify(card);
 const d={capture:card.numero,id:card.id,edition:card.versao,
  shown_position:card.posicao,role_used:card.posicao,original_position:card.posicao,
  attack_style:card.estilo_ataque,defence_style:card.estilo_defesa,
  native_skills:card.habilidades_nativas,pp:card.pp,recommended_levels:card.niveis,
  training_provisional:card.treino_proposto_nao_validado===true,
  boost1:card.impeto_fixo,boost2:card.impeto_extra};
 const report={cap:card.numero,id:card.id,edition:card.versao,styles:{}};
 const nativeKeys=new Set(String(card.habilidades_nativas||'').split(';').map(S.keyFor).filter(Boolean));
 const families={};
 for(const key of nativeKeys)if(S.SKILL_FAMILY[key]){
  const family=S.SKILL_FAMILY[key];families[family]=(families[family]||0)+1;
 }
 for(const tactic of B.tactics){
  const evalResult=S.evaluate(d,tactic),boost=S.booster(d,tactic,B),
   dossier=S.evidenceDossier(d,tactic,B);
  const portfolio=evalResult.balancedPortfolio,decision=boost.decisionEvidence,
   ranked=B.rank(card,tactic);
  assert.deepEqual(portfolio.nativeFamilyCounts,families);
  assert.deepEqual(portfolio.equippedFamilyCounts,{});
  assert.equal(portfolio.slotCountConfirmed,false);
  assert.equal(portfolio.mayApply,false);
  assert(portfolio.candidates.length<=5);
  assert.equal(new Set(portfolio.candidates.map(x=>x.key)).size,portfolio.candidates.length);
  assert.deepEqual(dossier.skillFamilyEvidence.nativeFamilies,families);
  assert.equal(dossier.skillFamilyEvidence.applyAuthorized,false);
  for(const x of portfolio.candidates){
   assert(!nativeKeys.has(x.key));
   assert.equal(x.equipAuthorized,false);
   assert.equal(x.evidence.nativePenalty,families[x.family]?7:0);
   assert.equal(x.evidence.equippedPenalty,0);
   assert.equal(x.relativeScore,
    x.baseScore+x.evidence.roleBonus+x.evidence.tacticBonus-
    x.evidence.nativePenalty-x.evidence.equippedPenalty-x.evidence.repetitionPenalty);
   candidates++;
  }
  if(Object.keys(families).length)nativeFamilyCases++;
  assert.equal(decision.status,'SEM_AUTORIZACAO_DE_APLICACAO');
  assert.equal(decision.canSpendTokens,false);
  assert.equal(decision.candidates.length,Math.min(3,ranked.length));
  assert.equal(dossier.boosterDecisionEvidence.canSpendTokens,false);
  for(const entry of decision.candidates){
   const candidate=ranked.find(x=>x.nome===entry.technicalName);
   assert(candidate);assert.equal(entry.relativeScore,candidate.score);
   assert.equal(entry.factors.funcao,candidate.evidencias.score_funcao);
   assert.equal(entry.factors.contexto,candidate.evidencias.score_contexto);
   assert.equal(entry.factors.investimento,candidate.evidencias.score_complemento);
   assert.equal(entry.factors.atributosBase,candidate.evidencias.score_base);
   assert.equal(entry.applyAuthorized,false);
   assert(entry.marginFromFirst>=0);
   boosterComponents++;
  }
  assert.equal(dossier.creatorVerified,false);
  assert.equal(dossier.competitivelyApproved,false);
  assert.equal(dossier.maySpendTokensAutomatically,false);
  if(decision.candidates.length>1&&decision.candidates[1].marginFromFirst<2)nearBooster++;
  const sig=[tactic,evalResult.role,card.estilo_ataque,card.estilo_defesa,
   portfolio.candidates.map(x=>x.key).join(',')].join('|');
  if(!repeats.has(sig))repeats.set(sig,[]);
  repeats.get(sig).push(card.numero);
  report.styles[tactic]={skills:portfolio.candidates.map(x=>({
   name:x.name,family:x.family,score:x.relativeScore,
   nativeSameFamily:x.evidence.nativeFamilyPresent
  })),booster:decision.candidates,problems:decision.warnings,
   applyAuthorized:false};
  cases++;
 }
 assert.equal(JSON.stringify(card),original);
 record.push(report);
}
assert.equal(cases,1230);assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),raw);
const synthetic={shown_position:'CA',attack_style:'Artilheiro',native_skills:'Heading'}; // Inventário sintético presente para prova dos cinco slots (V289).
const initial=S.evaluate(synthetic,'posse');
const ranked=initial.recommendations.concat(initial.alternatives);
const native=S.composePortfolio(ranked,'CA','posse',5,{nativeKeys:['onepass']});
const equipped=S.composePortfolio(ranked,'CA','posse',5,{equippedKeys:['heel']});
assert.equal(native.nativeFamilyCounts.apoio,1);
assert.equal(equipped.equippedFamilyCounts.apoio,1);
assert(native.candidates.some(x=>x.evidence.nativePenalty>0));
assert(equipped.candidates.some(x=>x.evidence.equippedPenalty>0));
assert.throws(()=>S.composePortfolio([],'CA','posse',6),/Limite/);
const originalNative=S.evaluate({...synthetic,native_skills:'Passe de primeira'},'posse');
assert(!originalNative.recommendations.some(x=>x.key==='onepass'));
const four=S.evaluate(synthetic,'posse',
 'Passe de primeira; Passe em profundidade; Toque duplo; Controle com a sola',
 {equippedConfirmed:true});
assert.equal(four.slotsRemaining,1);
assert.equal(four.balancedPortfolio.candidates.length,1);
const five=S.evaluate(synthetic,'posse',
 'Passe de primeira; Passe em profundidade; Toque duplo; Controle com a sola; Espírito guerreiro',
 {equippedConfirmed:true});
assert.equal(five.balancedPortfolio.candidates.length,0);
const martin=cards.find(x=>x.numero===191);assert.equal(martin.pp,50);assert.equal(martin.max_level,26);
const similarities=[...repeats].filter(([,caps])=>caps.length>1)
 .map(([signature,caps])=>({signature,caps}))
 .sort((a,b)=>b.caps.length-a.caps.length);
const report={schema:'CRAQUE_V277_EVIDENCE_MATRIX',cardsCount:246,cases,candidates,
 nativeFamilyCases,boosterComponents,nearBooster,
 similarGroups:similarities.length,
 warning:'Sem vídeo da edição exata, autorização de gasto, atributos finais ou homologação de Rentão/Blackjhon.',
 similarSamples:similarities.slice(0,60),cards:record};
fs.mkdirSync(path.join(root,'build'),{recursive:true});
fs.writeFileSync(path.join(root,'build/v277-evidence-matrix-246x5.json'),JSON.stringify(report,null,2)+'\n');
assert(read('web/sw.js').includes('v277-native-evidence'));
assert(read('package.json').includes('test-evidence-matrix-v277.cjs'));
console.log('V277 PASS: '+cases+' cenários, '+nativeFamilyCases+
 ' com família nativa, '+boosterComponents+' fatores de ímpeto auditados e '+
 similarities.length+' grupos semelhantes documentados. Catálogo preservado.');
