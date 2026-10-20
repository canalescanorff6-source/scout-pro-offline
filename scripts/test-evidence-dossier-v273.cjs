'use strict';
/* V273: 246 Card IDs × cinco táticas; nenhuma mudança do catálogo.
 * Investimento matemático PP não é homologação, nem stats finais.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const original=read('web/SCOUT_V69_AUDITORIA.json'),cards=JSON.parse(original).cards;
const S=require('../web/skills-booster-v162.js'),B=require('../web/booster-engine-v103.js');
assert.equal(cards.length,246);
assert.equal(new Set(cards.map(c=>c.numero+'@'+c.id)).size,246);
const copy=JSON.stringify(cards),groups=new Map(),issues=new Map(),cases=[];
let scenarios=0,math=0,provisional=0,missing=0,mappedPartial=0,invested=0,clones=0;
const bump=(m,key)=>m.set(key,(m.get(key)||0)+1);
for(const card of cards){
 const before=JSON.stringify(card);
 const d={capture:card.numero,id:card.id,edition:card.versao,
  shown_position:card.posicao,role_used:card.posicao,attack_style:card.estilo_ataque,
  defence_style:card.estilo_defesa,native_skills:card.habilidades_nativas,
  pp:card.pp,recommended_levels:card.niveis,pp_estimated:card.pp_estimado,
  training_provisional:card.treino_proposto_nao_validado===true,
  boost1:card.impeto_fixo,boost2:card.impeto_extra};
 const inv=S.investmentAudit(d),audit=B.trainingAudit(card);
 assert.equal(inv.levels!==null,audit.levels!==null);
 if(inv.levels)math++;else if(audit.status==='treino_proposto_nao_validado')provisional++;
 else missing++;
 const auditRecord={cap:card.numero,id:card.id,name:card.name,edition:card.versao,
  profile:S.archetypeOf(d),investment:inv.status,styles:{}};
 for(const tactic of B.tactics){
  const dossier=S.evidenceDossier(d,tactic,B);
  const skills=S.evaluate(d,tactic),boosters=B.rank(card,tactic);
  assert.equal(dossier.schema,'CRAQUE_DOSSIER_COMPETITIVO_V273');
  assert.equal(dossier.cardId,String(card.id));
  assert.equal(dossier.cap,card.numero);
  assert.equal(dossier.edition,card.versao);
  assert.equal(dossier.competitivelyApproved,false);
  assert.equal(dossier.maySpendTokensAutomatically,false);
  assert.equal(dossier.sourceConfirmed,false);
  assert.equal(dossier.scenarios.length,5);
  assert.equal(dossier.skillSlotsVerified,false);
  assert.equal(dossier.trainingStatus,inv.status);
  assert.equal(dossier.trainingCategories.length,inv.levels?10:0);
  assert.equal(dossier.skillCandidateCount,skills.recommendations.length);
  assert.equal(dossier.boosterName,boosters[0]?.nome_pt||boosters[0]?.nome||null);
  assert(dossier.evidencePending.length>0);
  assert(skills.recommendations.length<=5);
  assert.equal(skills.slotsRemaining,null);
  if(skills.unmappedNativeSkills.length)mappedPartial++;
  for(const sk of skills.recommendations){
   assert(!String(card.habilidades_nativas||'').split(';').map(S.keyFor).includes(sk.key));
   const f=sk.criterios;
   assert.equal(sk.score,f.funcao+f.tatica+f.estilo+f.nativas+f.investimento);
   assert.equal(f.investimento>=0&&f.investimento<=8,true);
   if(f.investimento>0)invested++;
  }
  for(const target of dossier.scenarios){
   assert.equal(target.equipAuthorized,false);
  }
  const sig=skills.recommendations.map(x=>x.key).join('|');
  const group=[tactic,skills.role,card.estilo_ataque,card.estilo_defesa].join('::');
  if(!groups.has(group))groups.set(group,new Map());
  const seen=groups.get(group);
  if(!seen.has(sig))seen.set(sig,[]);
  seen.get(sig).push(card.numero);
  for(const reason of dossier.evidencePending)bump(issues,reason);
  auditRecord.styles[tactic]={
   trainingEvidence:skills.investmentEvidence,
   skills:skills.recommendations.map(x=>({name:x.name,score:x.score,investment:x.criterios.investimento})),
   booster:boosters[0].nome_pt,alternative:boosters[1]?.nome_pt||null,
   margin:Number((boosters[0].score-(boosters[1]?.score||boosters[0].score)).toFixed(2)),
   riskCount:dossier.evidencePending.length
  };
  scenarios++;
 }
 assert.equal(JSON.stringify(card),before);
 cases.push(auditRecord);
}
assert.equal(scenarios,1230);
assert.equal(math,161);assert.equal(provisional,1);assert.equal(missing,84);
// Investimento não é usado quando orçamento inválido ou proposta não validada.
const first=cards.find(x=>x.numero===1),mart=cards.find(x=>x.numero===191);
const input=c=>({capture:c.numero,id:c.id,edition:c.versao,shown_position:c.posicao,
 attack_style:c.estilo_ataque,defence_style:c.estilo_defesa,native_skills:c.habilidades_nativas,
 pp:c.pp,recommended_levels:c.niveis,training_provisional:c.treino_proposto_nao_validado===true});
const verified=input(first),sameNoLevels={...verified,recommended_levels:null};
assert.equal(S.investmentAudit(verified).status,'investimento_matematico');
assert.equal(S.investmentAudit({...verified,pp:verified.pp+4}).status,'pp_divergente');
assert.equal(S.investmentAudit({...verified,pp_estimated:true}).status,'nao_confirmado_ou_provisorio');
assert.equal(S.investmentAudit({...verified,training_provisional:true}).status,'nao_confirmado_ou_provisorio');
assert.equal(S.investmentAudit(input(mart)).status,'nao_confirmado_ou_provisorio');
assert.equal(S.evaluate(input(mart),'posse').investmentApplied,false);
const withBuild=S.evaluate(verified,'posse');
const withoutBuild=S.evaluate(sameNoLevels,'posse');
assert(withBuild.recommendations.some(x=>x.criterios.investimento>0));
assert(withoutBuild.recommendations.every(x=>x.criterios.investimento===0));
assert.equal(withBuild.recommendations.length,5);
const go=cards.find(c=>['GR','GO'].includes(c.posicao));
assert(go&&S.evidenceDossier(input(go),'posse',B).archetype.includes('Goleiro'));
const fake={capture:999,id:'PENDENTE - confirmar',edition:'PENDENTE',shown_position:'CA',
 attack_style:'Artilheiro',native_skills:''};
const blocked=S.evidenceDossier(fake,'posse',B);
assert.equal(blocked.identityConfirmed,false);
assert.equal(blocked.competitivelyApproved,false);
assert(blocked.evidencePending.some(x=>x.includes('Card ID')));
const identical=[];
for(const [group,sigs] of groups)
 for(const [signature,ids] of sigs)if(ids.length>1){
  clones+=ids.length;
  identical.push({group,signature,captures:ids});
 }
assert.equal(JSON.stringify(cards),copy);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),original);
assert(read('web/sw.js').includes('v273-individual-evidence'));
assert(read('package.json').includes('test-evidence-dossier-v273.cjs'));
const report={schema:'CRAQUE_V273_AUDITORIA_246_X_5',limit:
 'Comparações heurísticas. Mesmo grupo/lista não comprova erro de treino; verificar as fontes da edição.',
 total_cards:246,scenarios,investment_valid:math,provisional,missing,
 scenarios_with_unmapped_native:mappedPartial,
 skill_recommendations_with_investment_signal:invested,
 duplicate_groups:identical.length,duplicate_appearances:clones,
 largest_similar_groups:identical.sort((a,b)=>b.captures.length-a.captures.length).slice(0,75),
 evidence_gaps:[...issues].sort((a,b)=>b[1]-a[1]).map(([reason,count])=>({reason,count})),
 cards:cases};
fs.mkdirSync(path.join(root,'build'),{recursive:true});
fs.writeFileSync(path.join(root,'build/v273-card-evidence-246x5.json'),JSON.stringify(report,null,2)+'\n');
console.log('V273 PASS: '+scenarios+' avaliações, 246 cartas intactas, '+invested+
 ' recomendações com investimento matemático, '+identical.length+
 ' grupos de listas semelhantes identificados sem correção artificial.');
console.log('V273 PENDÊNCIAS: '+mappedPartial+' cenários com nativas fora do vocabulário; 84 vetores ausentes e 1 provisório.');
