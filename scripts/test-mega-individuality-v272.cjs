'use strict';
/* V272: 246 cartas × cinco táticas, skills/ímpetos/PP e transparência.
 * Não homologar builds por fórmula nem editar cartas aprovadas.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const raw=read('web/SCOUT_V69_AUDITORIA.json');
const cards=JSON.parse(raw).cards;
const S=require('../web/skills-booster-v162.js');
const B=require('../web/booster-engine-v103.js');
const V=require('../web/craque-ficha-individual-v251.js');
assert.equal(cards.length,246);
assert.equal(new Set(cards.map(c=>c.numero+'@'+c.id)).size,246);
const originals=JSON.stringify(cards),counts=new Map(),topByRole=new Map(),rows=[];
let cases=0,coherent=0,provisional=0,noVectors=0,incompleteNatives=0,unknownAdditional=0;
const bump=(m,k)=>m.set(k,(m.get(k)||0)+1);
for(const card of cards){
 const cardSource=JSON.stringify(card),training=B.trainingAudit(card);
 if(training.status==='custo_pp_conferido')coherent++;
 if(training.status==='treino_proposto_nao_validado')provisional++;
 if(training.status==='vetor_ausente')noVectors++;
 const d={capture:card.numero,id:card.id,edition:card.versao,
  shown_position:card.posicao,role_used:card.posicao,pp:card.pp,
  recommended_levels:card.niveis,
  training_provisional:card.treino_proposto_nao_validado===true,
  attack_style:card.estilo_ataque,defence_style:card.estilo_defesa,
  native_skills:card.habilidades_nativas,boost1:card.impeto_fixo,boost2:card.impeto_extra};
 const record={capture:card.numero,card_id:card.id,edition:card.versao,
  name:card.name,position:card.posicao,style:card.estilo_ataque,
  pp_status:training.status,recommendations:{}};
 for(const tactic of B.tactics){
  const skills=S.evaluate(d,tactic),boost=B.rank(card,tactic);
  const wrapped=S.booster(d,tactic,B);
  assert(skills.role,'Função desconhecida #'+card.numero);
  assert.equal(skills.perfil,S.ROLE_LABEL[skills.role]);
  assert.equal(skills.inference,'CONSULTIVA_SEM_OVR_OU_TESTE_DE_GAMEPLAY');
  assert(skills.recommendations.length<=5);
  assert.equal(skills.slotsRemaining,null,'Não criar slots para carta sem conferência');
  assert.equal(skills.equippedConfirmed,false);
  const seen=new Set;
  const native=new Set(String(card.habilidades_nativas||'').split(';').map(S.keyFor).filter(Boolean));
  for(const skill of skills.recommendations){
   assert(!seen.has(skill.key),'Skill duplicada #'+card.numero);
   seen.add(skill.key);
   assert(!native.has(skill.key),'Skill já nativa #'+card.numero);
   const x=skill.criterios;
   assert.equal(skill.score,x.funcao+x.tatica+x.estilo+x.nativas+(x.investimento||0));
  }
  if(skills.unmappedNativeSkills.length)incompleteNatives++;
  assert(boost.length>0);
  assert.equal(wrapped.primary?.nome,boost[0]?.nome,'Divergência engines #'+card.numero);
  assert.equal(boost[0].recomendacao_condicional,true);
  assert.equal(boost[0].status_validacao,'HIPOTESE_COMPETITIVA_SEM_HOMOLOGACAO');
  assert.equal(boost[0].evidencias.atributos_finais_comprovados,false);
  assert.equal(boost[0].evidencias.pp_status,training.status);
  assert(boost.every(b=>b.nome!==B.boosterName(card.impeto_fixo)));
  assert(boost.every(b=>b.nome!==B.boosterName(card.impeto_extra)));
  assert(!wrapped.able);
  const primary=boost[0],runnerUp=boost[1];
  bump(counts,tactic+'|'+primary.nome);
  bump(topByRole,tactic+'|'+primary.funcao_considerada+'|'+primary.nome);
  record.recommendations[tactic]={
   role:skills.role,skills:skills.recommendations.map(s=>s.name),
   native_unmapped:skills.unmappedNativeSkills.length,
   booster:primary.nome_pt,booster_technical:primary.nome,
   runner_up:runnerUp?.nome_pt||null,
   margin:runnerUp?Number((primary.score-runnerUp.score).toFixed(2)):null,
   pp_status:primary.evidencias.pp_status,
   base_status:primary.evidencias.base_status,
   confidence:primary.confianca,
   upgrade_authorized:false
  };
  cases++;
 }
 if(training.levels===null)assert(B.rank(card,'posse').every(x=>x.evidencias.score_complemento===0));
 assert.equal(JSON.stringify(card),cardSource,'Carta modificada #'+card.numero);
 rows.push(record);
}
assert.equal(cases,1230);
assert.equal(coherent,161);
assert.equal(provisional,1);
assert.equal(noVectors,84);
assert.equal(JSON.stringify(cards),originals);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),raw);
const synthetic={shown_position:'CA',attack_style:'Artilheiro',native_skills:''};
const finisher=S.evaluate(synthetic,'posse');
const target=S.evaluate({...synthetic,attack_style:'Pivô'},'posse');
const support=S.evaluate({...synthetic,attack_style:'Puxa marcação'},'posse');
const position=(output,key)=>output.recommendations.concat(output.alternatives).find(x=>x.key===key);
assert(position(target,'heading'),'Pivô precisa considerar cabeceio');
assert(position(finisher,'firstshot').criterios.estilo>position(target,'firstshot').criterios.estilo);
assert(position(support,'onepass').criterios.estilo>position(finisher,'onepass').criterios.estilo);
const fake={...synthetic,shown_position:'ZC',attack_style:'Defensor criativo'};
const zc=B.rank({...fake,posicao:'ZG',impeto_fixo:'Técnica +1'},'posse');
assert(zc.length>0&&!zc.some(x=>x.nome==='Technique'),'ZG compatível e excluir Técnica fixa');
const bad=S.evaluate(synthetic,'posse','Habilidade Fantasma',{equippedConfirmed:true});
assert(bad.unmappedEquipped.includes('Habilidade Fantasma'));
assert.equal(bad.requiresReconciliation,true);
assert.equal(bad.equippedConfirmed,false);
assert.equal(bad.slotsRemaining,null);
const used=S.evaluate({...synthetic,native_skills:'One-touch Pass'},'posse','Passe de primeira',{equippedConfirmed:true});
assert.equal(used.requiresReconciliation,true);
assert.equal(used.equippedConfirmed,false);
const first=cards.find(x=>x.numero===191);
assert.equal(first.pp,50);assert.equal(first.max_level,26);
assert.equal(B.trainingAudit(first).status,'treino_proposto_nao_validado');
const sorted=m=>[...m.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
const report={
 schema:'CRAQUE_V272_MEGA_INDIVIDUALIDADE',
 method:'Função confirmada, estilo, tática e nativas, PP matemático apenas consultivo',
 limits:'OVR não prova resultado; recomendações não equipam; não é método oficial de Rentão ou Blackjhon',
 cards:246,cases,training:{coherent,provisional,noVectors},
 scenarios_with_unmapped_native_skill:incompleteNatives,
 booster_frequency:sorted(counts).slice(0,40).map(([key,n])=>({key,n})),
 booster_frequency_by_role:sorted(topByRole).slice(0,40).map(([key,n])=>({key,n})),
 cards_audited:rows
};
fs.mkdirSync(path.join(root,'build'),{recursive:true});
fs.writeFileSync(path.join(root,'build/v272-competitive-246x5.json'),JSON.stringify(report,null,2)+'\n');
assert(read('web/sw.js').includes('v272-mega-individuality'));
assert(read('package.json').includes('test-mega-individuality-v272.cjs'));
console.log('V272 PASS: '+cases+' cenários, 246 cartas intactas, '+coherent+
 ' vetores coerentes, '+provisional+' provisório, '+noVectors+' ausentes, '+
 incompleteNatives+' avaliações com nativas não reconhecidas.');
console.log('V272 TOP POSSE '+JSON.stringify(sorted(new Map([...counts].filter(([k])=>k.startsWith('posse|')))).slice(0,8)));
