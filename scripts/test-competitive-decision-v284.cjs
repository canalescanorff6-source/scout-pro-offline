'use strict';
/* V284 — 246 × 5 fichas, habilidades e ímpetos sem tocar em identidade ou builds. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const raw=read('web/SCOUT_V69_AUDITORIA.json'),cards=JSON.parse(raw).cards;
const S=require('../web/skills-booster-v162.js');
const B=require('../web/booster-engine-v103.js');
const original=JSON.stringify(cards);
assert.equal(cards.length,246);
assert.equal(new Set(cards.map(x=>x.numero+'@'+x.id+'@'+x.versao)).size,246);
const dFor=c=>({capture:c.numero,id:c.id,edition:c.versao,
 posicao:c.posicao,shown_position:c.posicao,role_used:c.posicao,
 original_position:c.posicao,attack_style:c.estilo_ataque,
 defence_style:c.estilo_defesa,native_skills:c.habilidades_nativas,
 pp:c.pp,pp_estimado:c.pp_estimado===true,recommended_levels:c.niveis,
 training_provisional:c.treino_proposto_nao_validado===true,
 boost1:c.impeto_fixo,boost2:c.impeto_extra});
let scenarios=0,ppMath=0,slotPending=0,skillWithNativeFamily=0,balancedDifferent=0;
const reports=[];
for(const c of cards){
 const originalCard=JSON.stringify(c),d=dFor(c),tactics=[];
 for(const tactic of B.tactics){
  const board=S.competitiveDecisionBoardV284(d,tactic,B);
  assert.equal(board.schema,'CRAQUE_V284_LABORATORIO_DECISAO');
  assert.equal(board.identity.capture,c.numero);
  assert.equal(board.identity.cardId,String(c.id));
  assert.equal(board.identity.edition,String(c.versao));
  assert.equal(board.tactic,tactic);
  assert.equal(board.noAutomaticApplication,true);
  assert.equal(board.maySpendTokens,false);
  assert.equal(board.mayModifyTraining,false);
  assert.equal(board.gameplayValidated,false);
  assert.equal(board.creatorEndorsement,false);
  assert(board.skills.length<=5);
  assert.equal(new Set(board.skills.map(x=>x.key)).size,board.skills.length);
  assert.equal(board.checks.skillNamesUnique,true);
  assert.equal(board.checks.boosterAllFourAxes,true);
  assert(board.boosters.length<=3);
  assert(board.portfolio.balanced.length<=5);
  assert(board.portfolio.sharedWithPrimary<=5);
  assert(board.skills.every(x=>x.status==='RECOMENDACAO_CALCULADA_NAO_EQUIPADA'&&
   x.canEquip===false&&x.explanation.length>=7&&Array.isArray(x.synergy)));
  assert(board.skills.every(x=>Math.abs(x.score-x.factorSum)<0.011),
    'Pontuação não reconciliada com fatores na #'+c.numero+' '+tactic);
  assert(board.boosters.every(x=>x.affectedKeys.length===4&&x.axes.length===4&&
   !x.canSpendTokens&&!x.canApply));
  for(let i=1;i<board.boosters.length;i++)
   assert(board.boosters[i-1].score>=board.boosters[i].score);
  assert(board.pending.some(x=>x.key==='gameplay'));
  if(board.skills.some(x=>x.nativeFamilyCount>0))skillWithNativeFamily++;
  if(board.portfolio.divergent)balancedDifferent++;
  if(board.evidence.training==='investimento_matematico')ppMath++;
  if(board.boosterEligibility.manualSlot==='nao_confirmado')slotPending++;
  tactics.push({tactic,role:board.role,archetype:board.archetype,
   topFive:board.skills.map(x=>x.key),portfolio:board.portfolio.balanced.map(x=>x.key),
   firstBooster:board.boosters[0]?.key||null,
   gaps:board.pending.map(x=>x.key),training:board.evidence.training});
  scenarios++;
 }
 assert.equal(JSON.stringify(c),originalCard,'Carta alterada: #'+c.numero);
 reports.push({capture:c.numero,cardId:c.id,edition:c.versao,tactics});
}
assert.equal(scenarios,1230);
assert.equal(JSON.stringify(cards),original);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),raw);
const martin=cards.find(x=>x.numero===191);
assert.equal(martin.pp,50);
assert.equal(martin.max_level,26);
const originalM=dFor(martin);
assert.equal(S.competitiveDecisionBoardV284(originalM,'posse',B).identity.originalPosition,'PTE');
assert.equal(S.individualEvidenceProfile({...originalM,pp:null},'posse',B).proof.pp,null,
 'PP ausentes jamais podem aparecer como zero');
const source=cards.find(x=>B.trainingAudit(x).levels!==null);
assert(source,'Auditoria deve conter ao menos um vetor coerente');
const baseline=B.trainingAudit(source);
assert.equal(baseline.status,'custo_pp_conferido');
assert.equal(B.trainingAudit({...source,pp_estimado:true}).status,'pp_estimado_sem_prova');
assert.equal(B.trainingAudit({...source,pp_estimated:true}).levels,null);
assert.equal(S.investmentAudit({...dFor(source),pp_estimado:true}).levels,null);
const hypothetic=dFor(source);
assert.equal(S.booster({...hypothetic,pp_estimado:true},'posse',B).primary?.evidencias?.pp_status,
 'pp_estimado_sem_prova','Flag de orçamento estimado deve chegar ao motor de ímpetos');
const s=S.evidenceSensitivityV283(hypothetic,'posse',B);
assert(!s.warnings.some(x=>x.includes('Treino não utilizável')),
 'Custo de PP matematicamente fechado não deve provocar falso alerta V283');
assert(s.warnings.some(x=>x.includes('Slot de ímpeto')));
const view=read('web/craque-ficha-individual-v251.js');
assert(view.includes("ct284-decision-lab"));
assert(view.includes('competitiveDecisionBoardV284'));
assert(view.includes("panel.append(mk('summary','','Laboratório competitivo V284"));
const sw=read('web/sw.js');
assert(sw.includes('v284-competitive-decision'));
assert(read('package.json').includes('test-competitive-decision-v284.cjs'));
assert(read('web/skills-booster-v162.js').includes('competitiveDecisionBoardV284'));
fs.mkdirSync(path.join(root,'build'),{recursive:true});
fs.writeFileSync(path.join(root,'build/v284-competitive-decisions-246x5.json'),
 JSON.stringify({schema:'CRAQUE_V284_AUDITORIA_CONSULTIVA',cards:246,
 scenarios,ppMath,slotPending,skillWithNativeFamily,balancedDifferent,
 note:'Scores, famílias e quatro atributos são heurísticas; não homologam builds ou gameplay.',
 profiles:reports},null,2)+'\n');
console.log('V284 PASS: '+scenarios+' cenários, '+ppMath+' vetores com custo matemático, '+
 skillWithNativeFamily+' recomendações com famílias nativas reconhecidas, '+
 balancedDifferent+' portfolios alternativos, '+slotPending+' slots sem confirmação. '+
 'Todas as 246 cartas imutáveis.');
