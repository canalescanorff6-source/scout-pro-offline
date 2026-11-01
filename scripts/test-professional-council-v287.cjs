// Fixture histórica anterior à correção autorizada V381; dados atuais são verificados no teste de integração V381.
const {historicalRead}=require('./historical-level-fixtures-v381.cjs');
'use strict';
/* V287 — 246 fichas, 5 estilos, provas exatas e fila operacional de fontes. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),load=p=>historicalRead(path.join(root,p),'utf8');
const corpus=load('web/SCOUT_V69_AUDITORIA.json');
const source=load('web/SCOUT_V221_EVIDENCE_INDEX.json');
const cards=JSON.parse(corpus).cards,index=JSON.parse(source).cards;
const S=require('../web/skills-booster-v162.js'),B=require('../web/booster-engine-v103.js');
assert.equal(cards.length,246);assert.equal(index.length,246);
assert.equal(new Set(cards.map(c=>c.numero)).size,246);
const adapt=c=>({capture:c.numero,id:c.id,name:c.name,edition:c.versao,
 posicao:c.posicao,original_position:c.posicao,shown_position:c.posicao,role_used:c.posicao,
 attack_style:c.estilo_ataque,defence_style:c.estilo_defesa,
 native_skills:c.habilidades_nativas,pp:c.pp,pp_estimado:c.pp_estimado===true,
 recommended_levels:c.niveis,training_provisional:c.treino_proposto_nao_validado===true,
 boost1:c.impeto_fixo,boost2:c.impeto_extra});
const rowsByCap=new Map(index.map(x=>[x.numero,x]));
let scenarios=0,sourceMatches=0,blocked=0,underReview=0,pendingTotal=0;
let inferredSource=0,changedPortfolio=0,skillCandidates=0,boostCandidate=0;
const queue=[];
for(const c of cards){
 const immutable=JSON.stringify(c),d=adapt(c),src=rowsByCap.get(c.numero);
 assert(src, 'Sem entrada do índice CAP '+c.numero);
 const styles=[];
 for(const tactic of B.tactics){
  const council=S.professionalEvidenceCouncilV287(d,tactic,B,src);
  assert.equal(council.schema,'CRAQUE_V287_CONSELHO_DE_EVIDENCIAS');
  assert.equal(council.identity.capture,c.numero);
  assert.equal(council.identity.cardId,String(c.id));
  assert.equal(council.identity.edition,String(c.versao));
  assert.equal(council.tactic,tactic);
  assert.equal(council.mayApply,false);
  assert.equal(council.maySpendTokens,false);
  assert.equal(council.mayOverwriteBuild,false);
  assert.equal(council.authorVerified,false);
  assert.equal(council.gameplayVerified,false);
  assert.equal(council.checks.length,12);
  assert.equal(council.pendingCount,council.checks.filter(x=>!x.ok).length);
  assert(council.pending.some(x=>x.key==='gameplay'));
  assert(council.pending.some(x=>x.key==='video'));
  assert.equal(council.evidence.gameplay,'SEM_COMPARACAO_CONTROLADA_VALIDADA');
  assert.equal(council.evidence.video,'SEM_VINCULO_COM_CARD_ID_VERIFICADO_NESTE_RELATORIO');
  assert.equal(council.skillCouncil.length<=5,true);
  assert.equal(council.chosenFive.length,council.skillCouncil.length);
  assert.equal(new Set(council.skillCouncil.map(x=>x.key)).size,council.skillCouncil.length);
  assert(council.skillCouncil.every(x=>x.status==='SUGESTAO_NAO_EQUIPADA'&&!x.mayEquip));
  assert(council.skillCouncil.every(x=>x.usedByStyles.length>=1));
  assert(council.boosters.length<=3);
  assert(council.boosters.every(x=>x.fourAttributes.length===4&&!x.canSpendTokens&&!x.canApply));
  assert(council.boosters.every(x=>x.metric==='PESOS_DA_FUNCAO_NAO_ATRIBUTOS_FINAIS'));
  assert.equal(council.boosterSensitivity.length,3);
  assert.equal(council.changeLog.length,
   council.chosenFive.filter(k=>!council.priorFive.includes(k)).length);
  assert(council.criticalWarnings.every(x=>typeof x==='string'&&x.length>0));
  const direct=S.strategicPortfolioV286(d,tactic,B);
  assert.deepEqual(council.chosenFive,direct.selected.map(x=>x.key));
  assert.deepEqual(council.priorFive,direct.baseline);
  assert.equal(council.adoptedOptimizedPortfolio,direct.adopted);
  sourceMatches+=+(council.evidence.documentaryIndex==='VINCULADO_POR_CAP_CARD_ID_EDICAO');
  if(council.confidence==='BLOQUEADO_POR_EVIDENCIA')blocked++;
  if(council.confidence==='CONSULTIVO_COM_LACUNAS')underReview++;
  pendingTotal+=council.pendingCount;
  inferredSource+=+(council.evidence.editionImage!=='NAO_CONFIRMADA');
  changedPortfolio+=+(council.adoptedOptimizedPortfolio);
  skillCandidates+=council.skillCouncil.length;
  boostCandidate+=council.boosters.length;
  styles.push({
   tactic,selected:council.chosenFive,base:council.priorFive,
   booster:council.boosters[0]?.key||null,
   boosterAlternatives:council.boosters.slice(1).map(x=>x.key),
   confidence:council.confidence,
   pending:council.pending.map(x=>x.key),
   changes:council.changeLog.map(x=>x.key),
   sensitiveBoosters:council.boosterSensitivity.filter(x=>x.firstChoiceChanges).map(x=>x.factor)
  });
  scenarios++;
 }
 const first=S.professionalEvidenceCouncilV287(d,'posse',B,src);
 const priority=first.pending.reduce((sum,x)=>
  sum+(x.phase==='bloqueio'?4:x.phase==='alta'?2:1),0);
 queue.push({
  capture:c.numero,cardId:c.id,edition:c.versao,name:c.name,
  role:first.identity.role,priority,pending:first.pendingCount,
  blockers:first.pending.filter(x=>x.phase==='bloqueio').map(x=>x.key),
  nextActions:first.pending.map(x=>({key:x.key,what:x.action,phase:x.phase})),
  scenarios:styles
 });
 assert.equal(JSON.stringify(c),immutable,'Acervo adulterado: CAP '+c.numero);
}
assert.equal(scenarios,1230);
assert.equal(sourceMatches,1220);
assert.equal(load('web/SCOUT_V69_AUDITORIA.json'),corpus);
assert.equal(load('web/SCOUT_V221_EVIDENCE_INDEX.json'),source);
assert.equal(inferredSource,0,'Print candidato não pode ser convertido em print confirmado');
const martin=cards.find(x=>x.numero===191);assert.equal(martin.pp,50);
const messi=cards.find(x=>x.numero===50),m=S.professionalEvidenceCouncilV287(
 adapt(messi),'posse',B,rowsByCap.get(50));
assert.equal(m.confidence,'BLOQUEADO_POR_EVIDENCIA');
assert(m.pending.some(x=>x.key==='identity'));
const first=cards.find(x=>S.evaluate(adapt(x),'posse').rankedCandidates.length>=5);
const identity=adapt(first);
const skill=S.evaluate(identity,'posse').recommendations.slice(0,4).map(x=>x.name).join(';');
const verifiedSkills={schema:'CRAQUE_ADDITIONAL_V254',capture:identity.capture,
 card_id:identity.id,edition:identity.edition,confirmed:true,
 fingerprint:S.fingerprint(skill),nativeFingerprint:S.fingerprint(identity.native_skills)};
const accepted=S.professionalEvidenceCouncilV287(identity,'posse',B,
 rowsByCap.get(first.numero),{manualEquipped:skill,equippedConfirmed:true,
 equipmentRecord:verifiedSkills});
assert.equal(accepted.evidence.additionalSlots,'DECLARACAO_LOCAL_USUARIO');
assert(accepted.skillCouncil.length<=1,'Skills já equipadas ocupam quatro dos cinco slots');
const forged=S.professionalEvidenceCouncilV287(identity,'posse',B,
 rowsByCap.get(first.numero),{manualEquipped:skill,equippedConfirmed:true,
 equipmentRecord:{...verifiedSkills,edition:'EDICAO_ADULTERADA'}});
assert.equal(forged.evidence.additionalSlots,'SEM_CONFIRMACAO_LOCAL');
assert(forged.skillCouncil.length>=accepted.skillCouncil.length);
const noRecord=S.professionalEvidenceCouncilV287(identity,'posse',B,
 rowsByCap.get(first.numero),{manualEquipped:skill,equippedConfirmed:true,
 verifiedSlot:'vazio'});
assert.equal(noRecord.evidence.additionalSlots,'SEM_CONFIRMACAO_LOCAL');
assert.equal(noRecord.evidence.boosterAccount,'NAO_CONFIRMADO_VAZIO');
const mismatched=S.professionalEvidenceCouncilV287(identity,'posse',B,
 {...rowsByCap.get(first.numero),card_id:'IDENTIDADE_ERRADA'});
assert.equal(mismatched.evidence.documentaryIndex,'SEM_VINCULO_EXATO');
assert(mismatched.pending.some(x=>x.key==='source'));
const wrongPP=S.professionalEvidenceCouncilV287(identity,'posse',B,
 {...rowsByCap.get(first.numero),pp:Number(first.pp)+2});
assert(wrongPP.pending.some(x=>x.key==='source'),'PP divergente invalida vínculo');
const wrongName=S.professionalEvidenceCouncilV287(identity,'posse',B,
 {...rowsByCap.get(first.numero),nome:'ATLETA DE OUTRA EDICAO'});
assert(wrongName.pending.some(x=>x.key==='source'),'Nome divergente invalida vínculo');
const wrongPosition=S.professionalEvidenceCouncilV287(identity,'posse',B,
 {...rowsByCap.get(first.numero),posicao:'POSICAO_ADULTERADA'});
assert(wrongPosition.pending.some(x=>x.key==='source'),'Posição original divergente invalida vínculo');
const slotCard=cards.find(x=>B.slotStatus(x.impeto_extra)==='selecionavel');
assert(slotCard);
const cap=adapt(slotCard),goodRecord={schema:'CRAQUE_BOOST_SLOT_V283',
 capture:cap.capture,card_id:cap.id,edition:cap.edition,status:'vazio',equipped:''};
const boostProof=S.professionalEvidenceCouncilV287(cap,'posse',B,rowsByCap.get(cap.capture),
 {boosterRecord:goodRecord});
assert.equal(boostProof.evidence.boosterAccount,'DECLARADO_VAZIO');
const invalidBoost=S.professionalEvidenceCouncilV287(cap,'posse',B,rowsByCap.get(cap.capture),
 {boosterRecord:{...goodRecord,edition:'OUTRA EDICAO'}});
assert.equal(invalidBoost.evidence.boosterAccount,'NAO_CONFIRMADO_VAZIO');
const ui=load('web/craque-ficha-individual-v251.js');
assert(ui.includes('ct287-evidence-council')&&ui.includes('professionalEvidenceCouncilV287'));
const css=load('web/craque-ficha-individual-v251.css');
assert(css.includes('.ct287-metrics')&&css.includes('.ct287-priority'));
assert(load('package.json').includes('test-professional-council-v287.cjs'));
assert(load('web/sw.js').includes('v287-evidence-council'));
queue.sort((a,b)=>b.priority-a.priority||b.pending-a.pending||a.capture-b.capture);
const csvCell=x=>{
 const s=String(x??'');
 const formula=/^[=+@-]/.test(s)?"'"+s:s;
 return '"'+formula.replace(/"/g,'""')+'"';
};
const csv=[
 ['CAP','CARD ID','EDICAO','NOME','FUNCAO','PONTOS PENDENCIA','TOTAL PENDENTE','BLOQUEIOS','PRIMEIRA ACAO'].map(csvCell).join(','),
 ...queue.map(x=>[x.capture,x.cardId,x.edition,x.name,x.role,
  x.priority,x.pending,x.blockers.join('|'),
  x.nextActions[0]?.what||''].map(csvCell).join(','))
].join('\n')+'\n';
fs.mkdirSync(path.join(root,'build'),{recursive:true});
fs.writeFileSync(path.join(root,'build/v287-evidence-queue-246.csv'),'\ufeff'+csv);
fs.writeFileSync(path.join(root,'build/v287-evidence-council-246x5.json'),
 JSON.stringify({schema:'CRAQUE_V287_FILA_DOCUMENTAL',cards:246,scenarios,
  sourceMatches,blocked,underReview,pendingTotal,inferredSource,changedPortfolio,
  skillCandidates,boostCandidate,
  warning:'Índice sem print da mesma edição; métricas são de pendências, não de desempenho em campo.',
  queue},null,2)+'\n');
console.log('V287 PASS: 1220 cenários, '+sourceMatches+' vínculos exatos ao índice, '+
 blocked+' bloqueios, '+underReview+' revisões; '+changedPortfolio+
 ' pacotes estratégicos diferentes; 246 cartas intactas, CSV e JSON exportados.');
