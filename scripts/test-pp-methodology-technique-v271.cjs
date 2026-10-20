'use strict';
/* V271 — PP chega à ficha competitiva apenas com prova de orçamento da
 * mesma edição. Técnica é auditada, não penalizada artificialmente.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const catalogText=read('web/SCOUT_V69_AUDITORIA.json');
const cards=JSON.parse(catalogText).cards;
const evidenceRows=JSON.parse(read('web/SCOUT_V221_EVIDENCE_INDEX.json')).cards;
const rows=new Map(evidenceRows.map(c=>[c.numero,c]));
const V=require('../web/craque-ficha-individual-v251.js');
const B=require('../web/booster-engine-v103.js');
const S=require('../web/skills-booster-v162.js');
const baseline=JSON.stringify(cards);
const counts=new Map(),techRoles=new Map(),techStyles=new Map(),examples=[];
const bump=(map,key)=>map.set(key,(map.get(key)||0)+1);
const labOf=card=>{
 const html=read('web/'+card.arquivo);
 const found=html.match(/<script id="lab-data"[^>]*>([\s\S]*?)<\/script>/);
 assert(found,'LAB da carta #'+card.numero+' ausente');
 return JSON.parse(found[1]);
};
assert.equal(cards.length,246);
assert.equal(rows.size,246);
assert.equal(new Set(cards.map(c=>c.numero+'@'+c.id)).size,246);
let scenarios=0, technique=0, techniqueClose=0, techniqueNoValidTraining=0;
let realBudgets=0, realBudgetsAccepted=0;
for(const card of cards){
 const before=JSON.stringify(card);
 const proof=V.proofChecklist(card,rows.get(card.numero),labOf(card),null);
 const documented=proof.checks.some(c=>c.id==='budget'&&c.documented===true);
 const valid=V.hasValidBuild(card);
 if(documented)realBudgets++;
 for(const tactic of B.tactics){
  const result=V.methodologyGate(card,proof,tactic,null);
  assert.equal(result.capture,card.numero);
  assert.equal(result.card_id,String(card.id));
  assert.equal(result.competitivelyHomologated,false);
  assert.equal(result.booster.status,'nao_autorizado_para_equipar');
  let expected=valid?
   documented?(card.treino_proposto_nao_validado===true?
    'treino_proposto_nao_validado':'custo_pp_conferido'):'pp_nao_documentados':
   'vetor_ausente';
  if(expected==='custo_pp_conferido')realBudgetsAccepted++;
  assert.equal(result.booster.ppStatus,expected,
    '#'+card.numero+' '+tactic+' PP não chegou corretamente');
  assert(result.booster.budgetNote.includes(
   expected==='custo_pp_conferido'?'Custo':'NÃO influenciou')||
   expected==='custo_pp_conferido'&&result.booster.budgetNote.includes('Vetor'));
  assert.equal(result.booster.status,'nao_autorizado_para_equipar');
  assert.equal(result.booster.scoreMargin===null||result.booster.scoreMargin>=0,true);
  scenarios++;
 }
 const ranked=B.rank(card,'posse');
 const top=ranked[0],second=ranked[1];
 if(top.nome==='Technique'){
  technique++;
  const role=top.funcao_considerada,style=String(card.estilo_ataque||'(ausente)');
  const gap=Number((top.score-(second?.score??top.score)).toFixed(2));
  bump(techRoles,role);bump(techStyles,style);
  if(gap<2)techniqueClose++;
  if(B.trainingAudit(card).levels===null)techniqueNoValidTraining++;
  examples.push({cap:card.numero,card_id:card.id,nome:card.name,
   posicao:card.posicao,funcao:role,estilo:style,
   principal:top.nome_pt,nota:top.score,
   concorrente:second?.nome_pt||null,distancia:gap,
   pp_status:top.evidencias.pp_status,base_status:top.evidencias.base_status,
   teste_competitivo_comprovado:false});
 }
 assert.equal(JSON.stringify(card),before,'#'+card.numero+' modificado');
}
assert.equal(scenarios,1230);
assert.equal(technique,101,'O benchmark anterior de Técnica não pode mudar sem alterar a fórmula');
assert(realBudgets>0,'Nenhuma prova de PP documental passou o checklist');
assert(realBudgetsAccepted<=realBudgets*5,'Não contar PP sem prova como aceito');
// O acervo pode ter zero interseções entre PP com prova e vetor válido:
// nesse caso, o teste sintético abaixo verifica a correção da API sem
// inventar homologação das cartas reais.
// Mesmo vetor: PP confirmado habilita complemento; PP não confirmado bloqueia.
const one=cards.find(c=>c.numero===1);
assert(V.hasValidBuild(one),'#001 possui distribuição e PP coerentes');
const fixture=(documented,c=one)=>V.methodologyGate(c,{
 checks:[{id:'edition',documented:true},{id:'budget',documented},
         {id:'native',documented:true}]},'posse',null);
assert.equal(fixture(true).booster.ppStatus,'custo_pp_conferido');
assert.equal(fixture(false).booster.ppStatus,'pp_nao_documentados');
const proposal=cards.find(c=>c.numero===191);
assert.equal(proposal.max_level,26);assert.equal(proposal.pp,50);
assert.equal(fixture(true,proposal).booster.ppStatus,'treino_proposto_nao_validado');
assert.equal(fixture(true,{...one,pp:one.pp+16}).booster.ppStatus,'vetor_ausente');
assert.equal(fixture(true,{...one,niveis:null}).booster.ppStatus,'vetor_ausente');
assert.equal(JSON.stringify(cards),baseline);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),catalogText);
assert(read('web/sw.js').includes('v271-pp-methodology-evidence'));
assert(read('package.json').includes('test-pp-methodology-technique-v271.cjs'));
const sorted=map=>Object.fromEntries([...map].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])));
const report={
 schema:'CRAQUE_V271_AUDITORIA_TECNICA_246X5',
 source:'Catálogo de 246 Card IDs; motor da main V270 + gate de PP V271',
 changes:'Corrigida passagem de PP ao parecer. Fórmula de ranking V270 preservada.',
 limits:'Heurística sem medição de atributos finais, ensaio controlado ou aval de criadores.',
 cards:246,scenarios,pp_documentado_no_gate:realBudgets,
 cenarios_com_vetor_pp_aceito:realBudgetsAccepted,
 tecnica_primeira_posse:technique,tecnica_com_alternativa_proxima_menor_2:techniqueClose,
 tecnica_sem_treino_validado:techniqueNoValidTraining,
 tecnica_por_funcao:sorted(techRoles),tecnica_por_estilo:sorted(techStyles),
 auditados_101:examples
};
fs.mkdirSync(path.join(root,'build'),{recursive:true});
fs.writeFileSync(path.join(root,'build/v271-tecnica-evidencias.json'),JSON.stringify(report,null,2)+'\n');
console.log('V271 PASS: '+scenarios+' cenários; '+realBudgets+' cartas com orçamento comprovado; '+realBudgetsAccepted+' cenários de PP habilitados no parecer; 246 cartas intactas.');
console.log('V271 TÉCNICA: '+technique+' primeiras; '+techniqueClose+' disputas próximas; '+techniqueNoValidTraining+' sem treino validado; por função '+JSON.stringify(sorted(techRoles)));
