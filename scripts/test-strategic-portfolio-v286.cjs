// Fixture histórica anterior à correção autorizada V381; dados atuais são verificados no teste de integração V381.
const {historicalRead}=require('./historical-level-fixtures-v381.cjs');
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>historicalRead(path.join(root,p),'utf8');
const raw=read('web/SCOUT_V69_AUDITORIA.json'),cards=JSON.parse(raw).cards;
const S=require('../web/skills-booster-v162.js'),B=require('../web/booster-engine-v103.js');
assert.equal(cards.length,246);assert.equal(new Set(cards.map(x=>x.numero+'@'+x.id+'@'+x.versao)).size,246);
const adapt=c=>({capture:c.numero,id:c.id,edition:c.versao,
 posicao:c.posicao,role_used:c.posicao,shown_position:c.posicao,
 original_position:c.posicao,attack_style:c.estilo_ataque,defence_style:c.estilo_defesa,
 native_skills:c.habilidades_nativas,pp:c.pp,pp_estimado:c.pp_estimado===true,
 recommended_levels:c.niveis,training_provisional:c.treino_proposto_nao_validado===true,
 boost1:c.impeto_fixo,boost2:c.impeto_extra});
let scenarios=0,changes=0,optimizedEmpty=0,insufficient=0,combinations=0;
let altBooster=0,unverified=0,roles=new Set(),riskMatrix={};
const profiles=[];
for(const c of cards){
 const original=JSON.stringify(c),tactics=[],d=adapt(c);
 for(const tactic of B.tactics){
  const x=S.strategicPortfolioV286(d,tactic,B);
  const previous=S.evaluate(d,tactic,'',{equippedConfirmed:false});
  assert.equal(x.schema,'CRAQUE_V286_OTIMIZADOR_PACOTE');
  assert.equal(x.identity.capture,c.numero);
  assert.equal(x.identity.cardId,String(c.id));
  assert.equal(x.identity.edition,String(c.versao));
  assert.equal(x.identity.role,previous.role);
  assert.equal(x.tactic,tactic);
  assert.equal(x.mayEditBuild,false);assert.equal(x.mayEquip,false);
  assert.equal(x.creatorVerified,false);assert.equal(x.gameplayVerified,false);
  assert.equal(x.boosters.maySpendTokens,false);
  assert.equal(x.slotsConfirmed,false);
  assert(x.selected.length<=5);
  assert.equal(x.selected.length,x.maxCandidates);
  assert.equal(new Set(x.selected.map(s=>s.key)).size,x.selected.length);
  assert(x.selected.every(s=>S.SKILLS[s.key]&&s.equipAuthorized===false));
  assert(x.selected.every(s=>!S.keyFor(c.habilidades_nativas?.split(';')
   .find(v=>S.keyFor(v)===s.key)||'')), 'Skill nativa idêntica reintroduzida');
  assert.equal(x.baseline.length,x.maxCandidates);
  assert.equal(x.mathematicalOptimum.length,x.maxCandidates);
  assert(x.evaluatedCombos>=1);
  assert(x.evaluatedCombos<=5000);
  assert(Number.isFinite(x.improvement));
  assert(x.improvement>=-.001);
  assert(x.adopted?x.improvement>=3:x.selected.map(s=>s.key).join('|')===x.baseline.join('|'));
  assert.equal(x.utility.total,Number(
   (x.utility.raw+x.utility.coverageRole+x.utility.coverageTactic+
    x.utility.bonus-x.utility.repeat-x.utility.nativeOverlap).toFixed(2)));
  assert(x.utility.synergies.every(s=>s.reason&&s.score>=0));
  assert(x.boosters.candidates.length<=3);
  assert(x.boosters.candidates.every(b=>b.axes.length===4&&
   !b.maySpendTokens&&!b.mayApply));
  assert(x.priorityQueue.some(q=>q.key==='gameplay'));
  assert(x.priorityQueue.every(q=>q.what&&q.level));
  if(x.boosters.complementaryAlternative)altBooster++;
  if(!x.identity.valid)unverified++;
  if(x.adopted)changes++;
  if(x.insufficientCandidates)insufficient++;
  if(x.selected.length===0)optimizedEmpty++;
  for(const q of x.priorityQueue)riskMatrix[q.key]=(riskMatrix[q.key]||0)+1;
  combinations+=x.evaluatedCombos;
  roles.add(x.identity.role);
  tactics.push({tactic,sourceTopFive:x.baseline,proposedFive:x.selected.map(s=>s.key),
   optimized:x.adopted,improvement:x.improvement,combinations:x.evaluatedCombos,
   booster:x.boosters.primary?.key||null,alternative:x.boosters.complementaryAlternative?.key||null,
   missing:x.priorityQueue.map(g=>g.key),insufficient:x.insufficientCandidates});
  scenarios++;
 }
 assert.equal(JSON.stringify(c),original,'Carta alterada: #'+c.numero);
 profiles.push({capture:c.numero,cardId:c.id,edition:c.versao,tactics});
}
assert.equal(scenarios,1230);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),raw);
assert.equal(roles.size>=8,true);
const martin=cards.find(c=>c.numero===191),m=S.strategicPortfolioV286(adapt(martin),'posse',B);
assert.equal(m.identity.cardId,String(martin.id));assert.equal(martin.pp,50);
assert.equal(martin.max_level,26);
const messi=cards.find(c=>c.numero===50),mp=S.strategicPortfolioV286(adapt(messi),'posse',B);
assert.equal(mp.identity.valid,false);
assert(mp.priorityQueue.some(q=>q.key==='identidade'));
const shortage=cards.find(c=>S.evaluate(adapt(c),'posse').rankedCandidates.length<5);
assert(shortage);
const shortageProof=S.strategicPortfolioV286(adapt(shortage),'posse',B);
assert(shortageProof.insufficientCandidates);
assert(shortageProof.maxCandidates<5);
const fullyLoaded=cards.find(c=>S.evaluate(adapt(c),'posse').rankedCandidates.length>=5);
const synthetic=adapt(fullyLoaded);
const lockedSkills=S.evaluate(synthetic,'posse').recommendations.slice(0,4).map(x=>x.name).join(';');
const receipt=manual=>({schema:'CRAQUE_ADDITIONAL_V254',confirmed:true,
 capture:synthetic.capture,card_id:synthetic.id,edition:synthetic.edition,
 fingerprint:S.fingerprint(manual),nativeFingerprint:S.fingerprint(synthetic.native_skills)});
const withEquipped=S.strategicPortfolioV286(synthetic,'posse',B,lockedSkills,{
 equippedConfirmed:true,equipmentRecord:receipt(lockedSkills)
});
assert.equal(withEquipped.slotsConfirmed,true);
assert.equal(withEquipped.maxCandidates,1);
assert.equal(withEquipped.selected.length,1);
const allSkills=S.evaluate(synthetic,'posse').recommendations.slice(0,5).map(x=>x.name).join(';');
const withNoSlot=S.strategicPortfolioV286(synthetic,'posse',B,
 allSkills,{equippedConfirmed:true,equipmentRecord:receipt(allSkills)});
assert.equal(withNoSlot.maxCandidates,0);
assert.equal(withNoSlot.selected.length,0);
assert.equal(withNoSlot.evaluatedCombos,1);
const ui=read('web/craque-ficha-individual-v251.js');
assert(ui.includes('ct286-strategic')&&ui.includes('strategicPortfolioV286'));
assert(ui.includes('ct286-new-list')&&ui.includes('ct286-boosters'));
const css=read('web/craque-ficha-individual-v251.css');
assert(css.includes('.ct286-comparison')&&css.includes('.ct286-pending'));
assert(read('package.json').includes('test-strategic-portfolio-v286.cjs'));
assert(read('web/sw.js').includes('v286-strategic-portfolio'));
fs.mkdirSync(path.join(root,'build'),{recursive:true});
fs.writeFileSync(path.join(root,'build/v286-strategic-portfolios-246x5.json'),
 JSON.stringify({schema:'CRAQUE_V286_AUDITORIA_ESTRATEGICA',
  cards:246,scenarios,changes,insufficient,optimizedEmpty,
  combos:combinations,altBooster,unverified,
  riskMatrix,interpretation:'Diferenças são de heurística de pacote, não resultado comprovado em partidas.',
  profiles},null,2)+'\n');
console.log('V286 PASS: '+scenarios+' cenários, '+changes+
 ' pacotes alternativos, '+combinations+' combinações, '+insufficient+
 ' casos com menos de cinco candidatas distintas, '+altBooster+
 ' alternativas de ímpeto contextual e '+unverified+
 ' identidades pendentes. 246 cartas intactas.');
