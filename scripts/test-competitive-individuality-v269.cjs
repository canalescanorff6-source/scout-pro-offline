'use strict';
/* V269 — regressão das 246 edições em cinco táticas.
 * Auditoria CONSULTIVA; não altera builds, slots, dados da conta ou catálogo.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const raw=read('web/SCOUT_V69_AUDITORIA.json');
const cards=JSON.parse(raw).cards;
const S=require('../web/skills-booster-v162.js');
const B=require('../web/booster-engine-v103.js');
const tactics=['posse','normal','rapido','fora','longo'];
assert.deepEqual(B.tactics,tactics);
assert.equal(cards.length,246);
assert.equal(new Set(cards.map(c=>c.numero+'@'+c.id)).size,246);
const before=JSON.stringify(cards);
const distro=new Map(),skillDistro=new Map(),patterns=new Map();
let checks=0,ptbrConflictsPrevented=0,unsupportedNative=0,nonEquipable=0;
const take=(map,key)=>map.set(key,(map.get(key)||0)+1);
for(const c of cards){
 const original=JSON.stringify(c);
 const d={capture:c.numero,id:c.id,edition:c.versao,shown_position:c.posicao,
  role_used:c.posicao,native_skills:c.habilidades_nativas,
  attack_style:c.estilo_ataque,defence_style:c.estilo_defesa,
  boost1:c.impeto_fixo,boost2:c.impeto_extra,
  recommended_levels:c.niveis,pp:c.pp,
  training_provisional:c.treino_proposto_nao_validado===true};
 for(const tactic of tactics){
  const s=S.evaluate(d,tactic);
  assert(s.recommendations.length<=5);
  assert.equal(s.slotsRemaining,null);
  assert.equal(s.equippedConfirmed,false);
  const known=new Set(String(c.habilidades_nativas||'').split(';').map(S.keyFor).filter(Boolean));
  const keys=s.recommendations.map(x=>x.key);
  assert.equal(new Set(keys).size,keys.length,'Adicionais repetidas #'+c.numero);
  for(const key of keys)assert(!known.has(key),'Repetição de nativa #'+c.numero);
  if(s.unmappedNativeSkills.length)unsupportedNative++;
  for(const key of keys)take(skillDistro,tactic+'|'+key);
  take(patterns,tactic+'|'+s.role+'|'+keys.join(','));
  const recommendation=S.booster(d,tactic,B,'vazio');
  if(recommendation.primary){
   take(distro,tactic+'|'+recommendation.primary.nome);
   // Uma confirmação em português, inclusive como "Técnica +1", tem
   // identidade igual à entrada técnica "Technique": nunca duplicá-la.
   const current=recommendation.primary.nome;
   for(const value of [current,B.displayName(current),B.displayName(current)+' +1']){
    const compared=S.booster(d,tactic,B,'ocupado',value);
    const visible=[compared.primary,...compared.alternatives].filter(Boolean);
    assert(!visible.some(x=>x.nome===current),
     'Ímpeto já equipado retornou em recomendação #'+c.numero+' '+tactic+' '+value);
   }
   if(B.translationKnown(current))ptbrConflictsPrevented++;
  }
  if(B.slotStatus(c.impeto_extra)!=='selecionavel'){
   assert.equal(recommendation.able,false,'Slot pendente equipável #'+c.numero);
   nonEquipable++;
  }
  checks++;
 }
 assert.equal(JSON.stringify(c),original,'Mutação de carta #'+c.numero);
}
assert.equal(checks,1230);
assert.equal(JSON.stringify(cards),before);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),raw);
assert(ptbrConflictsPrevented>0,'A cobertura precisa incluir ímpetos com tradução PT-BR');
// Dois perfis de CA da mesma posição e tática não podem compartilhar
// automaticamente o reforço de finalização, pois têm papéis distintos.
const example={capture:999,id:'TESTE_V269',shown_position:'CA',native_skills:''};
const link=S.evaluate({...example,attack_style:'Puxa marcação'},'posse');
const finisher=S.evaluate({...example,attack_style:'Artilheiro'},'posse');
const find=(result,key)=>result.recommendations.concat(result.alternatives).find(x=>x.key===key);
assert(find(link,'heel')&&find(finisher,'heel'));
assert(find(link,'heel').criterios.estilo>find(finisher,'heel').criterios.estilo);
assert(find(finisher,'firstshot').criterios.estilo>find(link,'firstshot').criterios.estilo);
assert.notDeepEqual(link.recommendations.map(x=>[x.key,x.score]),
 finisher.recommendations.map(x=>[x.key,x.score]),
 'Arquétipos de apoio e finalizador não devem gerar rankings idênticos');
// Comparação só: um slot local "ocupado" não libera equipar, mesmo se a
// tradução de ímpeto for reconhecida corretamente.
const slot={shown_position:'MAT',boost1:'Fisicalidade +1',boost2:'SLOT SELECIONÁVEL +1'};
const comparison=S.booster(slot,'posse',B,'ocupado','Técnica +1');
assert.equal(comparison.able,false);
assert.equal(comparison.confirmedEquipped,'Technique');
assert.equal(comparison.natural,'Fisicalidade');
assert(![comparison.primary,...comparison.alternatives].filter(Boolean).some(x=>x.nome==='Technique'));
assert.equal(S.booster({...slot,boost2:'PENDENTE / selecionável'},'posse',B,'vazio','Técnica').able,false);
const top=(map,n)=>[...map.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,n)
 .map(([chave,total])=>({chave,total}));
const report={
 schema:'CRAQUE_V269_AUDITORIA_CONSULTIVA',
 aviso:'Repetição de hipótese não demonstra erro individual. NÃO são builds homologadas nem desempenho em jogo.',
 cartas:246,cenarios:checks,estilos:tactics,
 rankings_localizados_sem_duplica_cobertos:ptbrConflictsPrevented,
 cenarios_com_nativas_fora_do_vocabulario:unsupportedNative,
 cenarios_sem_slot_equipavel:nonEquipable,
 combinacoes_habilidades_distintas:patterns.size,
 maiores_grupos_de_recomendacoes:top(patterns,20),
 impetos_mais_frequentes_por_tatica:top(distro,20),
 habilidades_mais_frequentes_por_tatica:top(skillDistro,20)
};
fs.mkdirSync(path.join(root,'build'),{recursive:true});
fs.writeFileSync(path.join(root,'build/v269-competitive-diagnostic.json'),JSON.stringify(report,null,2)+'\n');
assert(read('web/sw.js').includes('v269-archetype-ptbr-booster'));
assert(read('package.json').includes('test-competitive-individuality-v269.cjs'));
console.log('V269 PASS: '+checks+' cenários, '+ptbrConflictsPrevented+
 ' ímpetos com nomes PT-BR protegidos, '+patterns.size+' padrões de skills. 246 cartas preservadas.');
console.log('V269 DIAGNÓSTICO TOP ÍMPETOS: '+JSON.stringify(top(distro,6)));
console.log('V269 DIAGNÓSTICO TOP PADRÕES: '+JSON.stringify(top(patterns,6)));
