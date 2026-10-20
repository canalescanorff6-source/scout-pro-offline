'use strict';
/* V270: efeitos consultivos da função real sem Overall, nem mutação de builds.
 * Integração: 246 cartas × cinco táticas, nativas PT/EN, slots e PP intactos.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const original=read('web/SCOUT_V69_AUDITORIA.json');
const cards=JSON.parse(original).cards;
const S=require('../web/skills-booster-v162.js');
const B=require('../web/booster-engine-v103.js');
assert.equal(cards.length,246);
assert.equal(new Set(cards.map(c=>String(c.numero)+'@'+String(c.id))).size,246);
const tactics=B.tactics;
assert.deepEqual(tactics,['posse','normal','rapido','fora','longo']);
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const count=(map,key)=>map.set(key,(map.get(key)||0)+1);
const first=new Map(),firstByRole=new Map(),skillLists=new Map(),profileCounts=new Map();
let evaluations=0,missingBuilds=0,ptNativeAliases=0,aliasesEvaluated=0;
const before=JSON.stringify(cards);
for(const card of cards){
 const snapshot=JSON.stringify(card);
 const role=B.POS[String(card.posicao||'').toUpperCase()];
 assert(role,'Posição não reconhecida #'+card.numero);
 const style=normalize([card.estilo_ataque,card.estilo_defesa].join(' '));
 if(role==='ZG'&&/construcao de jogo|defensor criativo|defensor participativo/.test(style))
  count(profileCounts,'zagueiro_construtor');
 if(role==='ZG'&&/destruidor/.test(style))count(profileCounts,'zagueiro_destruidor');
 if(['LD','LE'].includes(role)&&/lateral ofensivo|lateral atacante|lateral movel/.test(style))
  count(profileCounts,'lateral_de_apoio');
 if(/criador de espacos/.test(style))count(profileCounts,'criador_de_espacos');
 if(/finalizacao de primeira|chute de longa distancia/.test(normalize(card.habilidades_nativas)))
  ptNativeAliases++;
 const audit=B.trainingAudit(card);
 if(audit.levels===null)missingBuilds++;
 const d={capture:card.numero,id:card.id,edition:card.versao,
  shown_position:card.posicao,role_used:card.posicao,
  attack_style:card.estilo_ataque,defence_style:card.estilo_defesa,
  native_skills:card.habilidades_nativas,
  boost1:card.impeto_fixo,boost2:card.impeto_extra,pp:card.pp,
  recommended_levels:card.niveis,
  training_provisional:card.treino_proposto_nao_validado===true};
 for(const t of tactics){
  const skills=S.evaluate(d,t);
  const boosters=B.rank(card,t);
  const guided=S.booster(d,t,B,'vazio');
  assert.equal(guided.primary?.nome,boosters[0]?.nome,'Ranking distinto V103/V162 #'+card.numero);
  assert(skills.recommendations.length<=5);
  assert.equal(skills.slotsRemaining,null,'Sem conferência do usuário, não inferir slot');
  assert.equal(skills.equippedConfirmed,false);
  const ids=new Set(),natives=new Set(String(card.habilidades_nativas||'').split(';').map(S.keyFor).filter(Boolean));
  for(const s of skills.recommendations){
   assert(!ids.has(s.key),'Habilidade duplicada #'+card.numero);ids.add(s.key);
   assert(!natives.has(s.key),'Habilidade já nativa #'+card.numero);
   const f=s.criterios;
   assert.equal(s.score,f.funcao+f.tatica+f.estilo+f.nativas);
  }
  assert(boosters.length>0);
  for(const item of boosters){
   assert(item.evidencias.limite.includes('Sem atributos finais'));
   assert.equal(item.evidencias.pp_status,audit.status);
   assert(item.evidencias.score_base===0||item.evidencias.base_status==='base_completa_confirmada');
  }
  count(first,t+'|'+boosters[0].nome);
  count(firstByRole,t+'|'+role+'|'+boosters[0].nome);
  count(skillLists,t+'|'+role+'|'+skills.recommendations.map(s=>s.key).join(','));
  evaluations++;
 }
 assert.equal(JSON.stringify(card),snapshot,'Mutação de carta '+card.numero);
}
assert.equal(evaluations,1230);
assert.equal(missingBuilds,85,'84 sem vetor + 1 proposta não validada permanecem bloqueados');
assert(ptNativeAliases>0,'Amostra PT-BR precisa existir no catálogo');
assert((profileCounts.get('zagueiro_construtor')||0)>0);
assert((profileCounts.get('lateral_de_apoio')||0)>0);
assert((profileCounts.get('criador_de_espacos')||0)>0);
// Provas sintéticas: mesmos Card IDs/perfis. Não aplicar a cartas reais.
const def={posicao:'DC',estilo_ataque:'Básico',estilo_defesa:'Básico',habilidades_nativas:'',niveis:null,pp:null};
const maker={...def,estilo_ataque:'Construção de Jogo'};
const guardian={...def,estilo_ataque:'O destruidor'};
const bonus=(card,name)=>B.rank(card,'posse').find(b=>b.nome===name).evidencias.score_funcao;
assert(bonus(maker,'Passing')>bonus(def,'Passing'),'Construtor deve ganhar relevância de passe');
assert(bonus(maker,'Regista')>bonus(def,'Regista'),'Construtor deve contribuir para saída curta e defesa');
assert(bonus(guardian,'Shutdown')>bonus(def,'Shutdown'),'Destruidor deve manter foco defensivo');
const roleSkills=(attack,shown_position)=>S.evaluate({
 capture:999,id:'FICTICIO_999',shown_position,attack_style:attack,native_skills:''},'posse');
const factor=(r,key)=>r.recommendations.concat(r.alternatives).find(x=>x.key===key)?.criterios.estilo;
// Expor a melhora nos itens do pool que aparecem entre as primeiras opções:
const candidateScore=(r,key)=>{
 const v=r.recommendations.concat(r.alternatives).find(x=>x.key===key);
 return v?.score??null;
};
const makeSkills=roleSkills('Construção de Jogo','DC');
const basicSkills=roleSkills('Básico','DC');
assert(candidateScore(makeSkills,'onepass')>candidateScore(basicSkills,'onepass'));
const fullback=roleSkills('Lateral ofensivo','DE');
const passive=roleSkills('Lateral defensivo','DE');
assert(candidateScore(fullback,'through')>candidateScore(passive,'through'));
assert.notDeepEqual(fullback.recommendations.map(x=>x.key),passive.recommendations.map(x=>x.key));
const spaces=roleSkills('Criador de Espaços','MO');
const ordinary=roleSkills('Básico','MO');
assert(candidateScore(spaces,'onepass')>candidateScore(ordinary,'onepass'));
// V270: aliases de nativas PT-BR precisam pontuar como a mesma habilidade EN.
// A comparação usa ranking puro da mesma posição, PP e edição sintética.
const aliasCard={posicao:'MLG',estilo_ataque:'Orquestrador',estilo_defesa:'Básico',niveis:null,pp:null};
const rankSkill=skills=>B.rank({...aliasCard,habilidades_nativas:skills},'posse').map(x=>[x.nome,x.score]);
assert.deepEqual(rankSkill('Finalização de primeira; Chute de longa distância'),
 rankSkill('First-time Shot; Long-range Shooting'),
 'Alias PT-BR e inglês devem produzir pontuação idêntica');
aliasesEvaluated+=2;
// O correto não é fabricar diversidade: medir concentração por tática.
const top=(m,n)=>[...m.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))
 .slice(0,n).map(([chave,total])=>({chave,total}));
const result={
 schema:'CRAQUE_V270_ROLE_EVIDENCE_AUDIT',
 status:'CONSULTIVO — builds e slots imutáveis; nenhuma aprovação de gameplay',
 versoes:246,cenarios:evaluations,
 perfis_documentais:Object.fromEntries(profileCounts),
 fichas_sem_vetor_confirmado:missingBuilds,cartas_com_alias_ptbr_identificados:ptNativeAliases,
 checagens_de_equivalencia_nativa:aliasesEvaluated,
 concentracao_impetos:top(first,25),
 impetos_por_funcao:top(firstByRole,25),
 listas_de_skills_por_funcao:top(skillLists,25),
 evidencias_faltantes:'Atributos completos, PP de origem, vídeo Card ID exato, slots confirmados e testes reais continuam independentes',
 nota:'Scores são heurísticas; frequência alta não equivale a erro ou melhor escolha'
};
assert.equal(JSON.stringify(cards),before);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),original);
assert(read('web/sw.js').includes('v270-role-evidence'));
assert(read('package.json').includes('test-role-evidence-v270.cjs'));
fs.mkdirSync(path.join(root,'build'),{recursive:true});
fs.writeFileSync(path.join(root,'build/v270-role-evidence-246x5.json'),JSON.stringify(result,null,2)+'\n');
console.log('V270 PASS: '+evaluations+' análises; perfis '+JSON.stringify(Object.fromEntries(profileCounts))+
 '; '+missingBuilds+' vetores pendentes/provisórios e '+ptNativeAliases+' edições com aliases PT-BR; catálogo intacto.');
console.log('V270 TOP POSSE: '+JSON.stringify(top(new Map([...first].filter(([k])=>k.startsWith('posse|'))),8)));
