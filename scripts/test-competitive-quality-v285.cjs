// Fixture histórica anterior à correção autorizada V381; dados atuais são verificados no teste de integração V381.
const {historicalRead}=require('./historical-level-fixtures-v381.cjs');
'use strict';
/* V285: auditoria por CAP/Card ID/edição, função, cinco táticas e três ablações. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>historicalRead(path.join(root,p),'utf8');
const original=read('web/SCOUT_V69_AUDITORIA.json');
const cards=JSON.parse(original).cards;
const S=require('../web/skills-booster-v162.js');
const B=require('../web/booster-engine-v103.js');
assert.equal(cards.length,246);
assert.equal(new Set(cards.map(c=>c.numero+'@'+c.id+'@'+c.versao)).size,246);
const dFor=c=>({capture:c.numero,id:c.id,edition:c.versao,
 role_used:c.posicao,shown_position:c.posicao,posicao:c.posicao,
 original_position:c.posicao,attack_style:c.estilo_ataque,
 defence_style:c.estilo_defesa,native_skills:c.habilidades_nativas,
 pp:c.pp,pp_estimado:c.pp_estimado===true,recommended_levels:c.niveis,
 training_provisional:c.treino_proposto_nao_validado===true,
 boost1:c.impeto_fixo,boost2:c.impeto_extra});
const results=[];
let scenarios=0,crossPairs=0,samePairs=0,skillMoves=0,boostMoves=0;
let missingStyle=0,missingNatives=0,sensitiveCards=0,fullCopies=0;
for(const card of cards){
 const source=JSON.stringify(card),d=dFor(card);
 const tactics=[];
 for(const tactic of B.tactics){
  const lab=S.competitiveQualityLabV285(d,tactic,B);
  assert.equal(lab.schema,'CRAQUE_V285_SEGUNDA_OPINIAO_COMPETITIVA');
  assert.equal(lab.identity.id,String(card.id));
  assert.equal(lab.identity.edition,String(card.versao));
  assert.equal(lab.identity.capture,card.numero);
  assert.equal(lab.identity.position,card.posicao);
  assert.equal(lab.tactic,tactic);
  assert.equal(lab.mayAlterOriginalBuild,false);
  assert.equal(lab.mayEquipSkill,false);
  assert.equal(lab.maySpendTokens,false);
  assert.equal(lab.creatorSourceVerified,false);
  assert.equal(lab.readiness,'PARECER_CONSULTIVO_SEM_HOMOLOGACAO');
  assert.equal(lab.skillReasons.length<=5,true);
  assert.equal(new Set(lab.skillReasons.map(s=>s.key)).size,lab.skillReasons.length);
  assert(lab.skillReasons.every(s=>s.neverEquippedByApp&&s.recommendationOnly));
  assert(lab.skillReasons.every(s=>s.explanation&&s.fieldTask&&s.fieldSupport&&s.fieldRisk));
  assert(lab.skillReasons.every(s=>s.usedInTactics.length>=1&&s.usedInTactics.length<=5));
  assert(lab.boosterReasons.length<=3);
  assert(lab.boosterReasons.every(b=>b.fourAxes.length===4&&!b.maySpendTokens&&!b.mayApply));
  assert(lab.boosterReasons.every(b=>b.sharedWithFixed===null||
   (Number.isInteger(b.sharedWithFixed)&&b.sharedWithFixed>=0&&b.sharedWithFixed<=4)));
  assert.equal(lab.tacticalMatrix.length,5);
  assert.equal(lab.tacticPairs.length,10);
  assert.equal(lab.summary.comparablePairs,10);
  assert(lab.summary.sameFivePairs>=0&&lab.summary.sameFivePairs<=10);
  assert(lab.summary.distinctSkillSets>=1&&lab.summary.distinctSkillSets<=5);
  assert.equal(lab.summary.exactlySameFiveAllStyles,lab.summary.sameFivePairs===10);
  assert.equal(lab.summary.nativeMapped+lab.summary.nativeUnmapped<=lab.summary.sourceNativeTotal,true);
  assert.equal(lab.evidenceAblation.length,3);
  assert.deepEqual(lab.evidenceAblation.map(a=>a.factor),['sem_nativas','sem_pp','sem_estilo']);
  assert(lab.evidenceAblation.every(a=>a.mayChangeBuild===false));
  assert(lab.evidenceAblation.every(a=>a.changedSkills>=0&&a.changedSkills<=5));
  assert(lab.evidenceAblation.every(a=>!a.tested||a.unchangedPositions+a.changedSkills===5));
  assert(lab.tacticalMatrix.every(x=>x.skills.length<=5&&!x.mayApply));
  assert(lab.tacticPairs.every(pair=>pair.sharedFive<=5));
  assert(lab.evidenceTasks.some(x=>x.key==='gameplay'));
  assert(Object.values(lab.guards).every(Boolean), 'V285 invariantes: #'+card.numero+' '+tactic);
  const dlab=S.competitiveDecisionBoardV284(d,tactic,B);
  assert.deepEqual(lab.skillReasons.map(s=>s.key),dlab.skills.map(s=>s.key));
  assert.deepEqual(lab.boosterReasons.map(s=>s.key),dlab.boosters.map(s=>s.key));
  const thisStyle=lab.tacticalMatrix.find(x=>x.tactic===tactic);
  assert.deepEqual(thisStyle.skills,dlab.skills.map(s=>s.key));
  const abNative=lab.evidenceAblation[0],abStyle=lab.evidenceAblation[2];
  if(!abNative.tested)missingNatives++;
  if(!abStyle.tested)missingStyle++;
  skillMoves+=lab.evidenceAblation.reduce((sum,x)=>sum+x.changedSkills,0);
  boostMoves+=lab.evidenceAblation.filter(x=>x.changedBooster).length;
  crossPairs+=lab.tacticPairs.length;
  samePairs+=lab.tacticPairs.filter(x=>x.sameFiveInOrder).length;
  if(lab.evidenceAblation.some(x=>x.changedSkills||x.changedBooster))sensitiveCards++;
  if(lab.summary.exactlySameFiveAllStyles)fullCopies++;
  tactics.push({tactic,selectedSkills:lab.skillReasons.map(s=>s.key),
   selectedBooster:lab.boosterReasons[0]?.key||null,
   uniqueSets:lab.summary.distinctSkillSets,
   identicalTacticPairs:lab.summary.sameFivePairs,
   inputChanges:lab.evidenceAblation.map(x=>({factor:x.factor,tested:x.tested,
    changedSkills:x.changedSkills,changedBooster:x.changedBooster})),
   missing:lab.evidenceTasks.map(x=>x.key)});
  scenarios++;
 }
 assert.equal(JSON.stringify(card),source,'Dados de origem alterados: '+card.numero);
 results.push({capture:card.numero,cardId:card.id,edition:card.versao,tactics});
}
assert.equal(scenarios,1230);
assert.equal(crossPairs,12300);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),original);
const messiPending=cards.find(c=>c.numero===50);
assert(messiPending&&/PENDENTE/i.test(messiPending.id));
const pendingLab=S.competitiveQualityLabV285(dFor(messiPending),'posse',B);
assert.equal(pendingLab.guards.identityNotFaked,true);
assert(pendingLab.evidenceTasks.some(x=>x.key==='identidade'),
 'CAP050 deve continuar pendente, jamais assumir Card ID confirmado');
const martin=cards.find(c=>c.numero===191);
assert(martin&&martin.max_level===26&&martin.pp===50);
const martinLab=S.competitiveQualityLabV285(dFor(martin),'posse',B);
assert.equal(martinLab.identity.position,'PTE');
assert.equal(martinLab.mayAlterOriginalBuild,false);
const nativeCard=cards.find(c=>String(c.habilidades_nativas||'').trim());
assert(nativeCard);
const nTest=S.competitiveQualityLabV285(dFor(nativeCard),'posse',B);
assert.equal(nTest.evidenceAblation[0].tested,true);
const noNative=S.competitiveQualityLabV285({...dFor(nativeCard),native_skills:'',
 habilidades_nativas:''},'posse',B);
assert.equal(noNative.evidenceAblation[0].tested,false);
const noStyle=S.competitiveQualityLabV285({...dFor(nativeCard),attack_style:'',
 defence_style:'',estilo_ataque:'',estilo_defesa:''},'posse',B);
assert.equal(noStyle.evidenceAblation[2].tested,false);
const trained=cards.find(c=>B.trainingAudit(c).status==='custo_pp_conferido');
assert(trained);
assert.equal(S.competitiveQualityLabV285(dFor(trained),'posse',B).evidenceAblation[1].tested,true);
assert.equal(S.competitiveQualityLabV285({...dFor(trained),pp_estimado:true},'posse',B).evidenceAblation[1].tested,false);
const js=read('web/craque-ficha-individual-v251.js');
assert(js.includes('ct285-quality-lab')&&js.includes('competitiveQualityLabV285'));
assert(js.includes('ct285-tactics')&&js.includes('ct285-boosters'));
const css=read('web/craque-ficha-individual-v251.css');
assert(css.includes('.ct285-quality-lab')&&css.includes('@media(min-width:900px)'));
assert(read('package.json').includes('test-competitive-quality-v285.cjs'));
assert(read('web/sw.js').includes('v285-deep-quality'));
fs.mkdirSync(path.join(root,'build'),{recursive:true});
fs.writeFileSync(path.join(root,'build/v285-quality-246x5.json'),JSON.stringify({
 schema:'CRAQUE_V285_AUDITORIA_SEGUNDA_OPINIAO',
 cards:246,scenarios,crossPairs,samePairs,skillMoves,boostMoves,
 missingStyle,missingNatives,sensitiveCards,fullCopies,
 notes:'Sinais documentais e pares táticos, não testes em partidas, metas de atributo ou aprovações de criadores.',
 profiles:results
},null,2)+'\n');
console.log('V285 PASS: '+scenarios+' cenários, '+crossPairs+' comparações pareadas, '+
 samePairs+' pares com o mesmo top cinco; '+skillMoves+' alterações posicionais por ablações, '+
 boostMoves+' mudanças de ímpeto líder; '+fullCopies+
 ' cenários com top cinco igual em todos os estilos; 246 cartas intactas.');
