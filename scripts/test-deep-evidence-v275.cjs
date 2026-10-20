'use strict';
/* V275 — revisão com prova documental, doutrinação e decisão conservadora. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const raw=read('web/SCOUT_V69_AUDITORIA.json'),catalog=JSON.parse(raw).cards;
const S=require('../web/skills-booster-v162.js'),B=require('../web/booster-engine-v103.js');
const before=JSON.stringify(catalog);
assert.equal(catalog.length,246);assert.equal(new Set(catalog.map(c=>c.numero+'@'+c.id)).size,246);
const profiles={},identical=new Map(),audit=[];
let scenarios=0,playbooks=0,nearSkills=0,nearBoosters=0,incompleteId=0,positionWarnings=0;
const tactics=['posse','normal','rapido','fora','longo'];
for(const card of catalog){
 const cBefore=JSON.stringify(card);
 const d={capture:card.numero,id:card.id,edition:card.versao,
  shown_position:card.posicao,role_used:card.posicao,original_position:card.posicao,
  attack_style:card.estilo_ataque,defence_style:card.estilo_defesa,
  native_skills:card.habilidades_nativas,pp:card.pp,recommended_levels:card.niveis,
  training_provisional:card.treino_proposto_nao_validado===true,
  boost1:card.impeto_fixo,boost2:card.impeto_extra};
 const results=[];
 for(const tactic of tactics){
  const dossier=S.evidenceDossier(d,tactic,B);
  const sk=S.evaluate(d,tactic),boost=B.rank(card,tactic);
  const play=S.playbookOf(d,tactic);
  assert.equal(dossier.schema,'CRAQUE_DOSSIER_COMPETITIVO_V273');
  assert.equal(dossier.cap,card.numero);
  assert.equal(dossier.cardId,String(card.id));
  assert.equal(dossier.edition,String(card.versao));
  assert.equal(dossier.totalIndicators,7);
  assert.equal(dossier.evidenceChecklist.length,7);
  assert.equal(dossier.documentedIndicators,dossier.evidenceChecklist.filter(x=>x.ok).length);
  assert.equal(dossier.creatorVerified,false);
  assert.equal(dossier.realMatchValidated,false);
  assert.equal(dossier.sourcePublication,null);
  assert.equal(dossier.competitivelyApproved,false);
  assert.equal(dossier.maySpendTokensAutomatically,false);
  assert.equal(dossier.playbook.evidence,'ORIENTACAO_CONDICIONAL_NAO_TESTADA_EM_PARTIDAS');
  assert.equal(dossier.playbook.steps.length,3);
  assert.equal(dossier.playbook.tactic,tactic);
  assert.equal(play.role,sk.role);
  assert.equal(play.steps.length,3);
  assert.equal(dossier.tacticalStability.tacticsCompared,5);
  assert(dossier.tacticalStability.topSkillVariations<=5);
  assert(dossier.tacticalStability.boosterVariations<=5);
  assert(sk.recommendations.length<=5);
  assert.equal(sk.equippedConfirmed,false);
  assert.equal(sk.slotsRemaining,null);
  assert.equal(dossier.skillSlotsVerified,false);
  assert.equal(dossier.boosterSlotVerified,false);
  assert.equal(boost[0]?.recomendacao_condicional,true);
  assert.equal(boost[0]?.evidencias.atributos_finais_comprovados,false);
  for(const skill of sk.recommendations){
   assert.equal(skill.priorityNote.startsWith(skill.marginToNext!==null&&
    skill.marginToNext<3?'PRIORIDADES PRÓXIMAS':'Ordem consultiva'),true);
   assert(skill.marginToNext===null||skill.marginToNext>=0);
   if(skill.marginToNext!==null&&skill.marginToNext<3)nearSkills++;
   const c=skill.criterios;
   assert.equal(skill.score,c.funcao+c.tatica+c.estilo+c.nativas+c.investimento);
  }
  if(dossier.boosterMargin!==null&&dossier.boosterMargin<2)nearBoosters++;
  if(!dossier.identityConfirmed)incompleteId++;
  if(!dossier.roleApproved)positionWarnings++;
  const key=[tactic,sk.role,card.estilo_ataque,card.estilo_defesa,
   sk.recommendations.map(x=>x.key).join('|')].join('::');
  if(!identical.has(key))identical.set(key,[]);
  identical.get(key).push(card.numero);
  results.push({tactic,topSkill:sk.recommendations[0]?.name||null,
   booster:boost[0]?.nome_pt||boost[0]?.nome||null,
   skillGap:sk.recommendations[0]?.marginToNext??null,
   boosterGap:dossier.boosterMargin,documentedIndicators:dossier.documentedIndicators});
  const tag=dossier.archetype;profiles[tag]=(profiles[tag]||0)+1;
  scenarios++;playbooks++;
 }
 audit.push({capture:card.numero,id:card.id,edition:card.versao,originalPosition:card.posicao,
  archetype:S.archetypeOf(d),recommendations:results});
 assert.equal(JSON.stringify(card),cBefore,'Alteração inesperada da carta '+card.numero);
}
assert.equal(scenarios,1230);
assert.equal(playbooks,1230);
assert.equal(JSON.stringify(catalog),before);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),raw);
// PTE com doutrinação CA não vira CA na posição ORIGINAL e não é
// homologado sem status confirmado do treinamento de posição.
const martin=catalog.find(c=>c.numero===191);
assert.equal(martin.posicao,'PTE');assert.equal(martin.pp,50);assert.equal(martin.max_level,26);
const moved={capture:martin.numero,id:martin.id,edition:martin.versao,
 original_position:'PTE',shown_position:'CA',role_used:'CA',
 attack_style:martin.estilo_ataque,native_skills:martin.habilidades_nativas,
 pp:martin.pp,recommended_levels:martin.niveis,
 training_provisional:true,boost1:martin.impeto_fixo,boost2:martin.impeto_extra};
const noProof=S.evidenceDossier(moved,'posse',B),confirmed=S.evidenceDossier(moved,'posse',B,'',{roleConfirmed:true});
assert.equal(noProof.originalPosition,'PTE');
assert.equal(noProof.positionUsed,'CA');
assert.equal(noProof.roleApproved,false);
assert(noProof.evidencePending.some(x=>x.includes('Proficiência')));
assert.equal(confirmed.roleApproved,true);
assert.equal(confirmed.originalPosition,'PTE');
assert.equal(confirmed.trainingStatus,'nao_confirmado_ou_provisorio');
// Identidade exige ambos, e não apenas ID de carta.
assert.equal(S.evidenceDossier({...moved,edition:''},'posse',B).identityConfirmed,false);
assert.equal(S.evidenceDossier({...moved,id:'PENDENTE'},'posse',B).identityConfirmed,false);
// Não recomendar skills já nativas, mesmo que grafia varie.
const native=S.evaluate({...moved,native_skills:'One-touch Pass; Passe de primeira'},'posse');
assert(!native.recommendations.some(x=>x.key==='onepass'));
// Guia: 4-3-1-2 central não obriga cruzamentos; varia com o estilo escolhido.
const possession=S.playbookOf(moved,'posse'),wide=S.playbookOf(moved,'fora');
assert(possession.steps.some(x=>x.includes('triangule')));
assert(wide.steps.some(x=>x.includes('cruzar é opcional')));
const repeated=[...identical.entries()].filter(([,caps])=>caps.length>1).map(([signature,caps])=>({signature,caps}))
 .sort((a,b)=>b.caps.length-a.caps.length).slice(0,70);
const report={schema:'CRAQUE_V275_EVIDENCE_DEEP_REVIEW',
 cardsCount:246,scenarios,playbooks,nearSkills,nearBoosters,incompleteId,positionWarnings,
 profileOccurrences:profiles,similarGroups:repeated,
 constraints:'Provas de identidade, nativas, PP, posição, slots e bases separadas. Não há autoria Rentão/Blackjhon, gameplay homologado ou gasto automático.',
 cards:audit};
fs.mkdirSync(path.join(root,'build'),{recursive:true});
fs.writeFileSync(path.join(root,'build/v275-competitive-evidence-246x5.json'),JSON.stringify(report,null,2)+'\n');
assert(read('web/sw.js').includes('v275-deep-evidence'));
assert(read('package.json').includes('test-deep-evidence-v275.cjs'));
console.log('V275 PASS: 246 cartas x 5 táticas = '+scenarios+' laudos, '+playbooks+
 ' guias práticos, '+nearSkills+' margens pequenas de skills e '+nearBoosters+
 ' disputas de ímpeto. Catálogo inalterado.');
