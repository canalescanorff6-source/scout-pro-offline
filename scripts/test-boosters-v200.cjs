'use strict';
/* V200: rank por carta/Posse, sem mudar ficha ou equipar item na conta. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),web=path.join(root,'web');
const B=require('../web/booster-engine-v103.js');
const R=require('../web/skills-booster-v162.js');
const cards=JSON.parse(fs.readFileSync(path.join(web,'SCOUT_V69_AUDITORIA.json'),'utf8')).cards;
const htmls=fs.readdirSync(path.join(web,'fichas')).filter(x=>x.endsWith('.html'));
assert.equal(cards.length,246);
assert.equal(htmls.length,246);
const counters=Object.fromEntries(B.tactics.map(t=>[t,{}]));
const byId=new Map();
let withTrain=0,withoutTrain=0,noDoubleNative=0,close=0;
for(const c of cards){
 byId.set(c.numero,c);
 const d={capture:c.numero,id:c.id,shown_position:c.posicao,role_used:c.posicao,attack_style:c.estilo_ataque,
  defence_style:c.estilo_defesa,boost1:c.impeto_fixo,boost2:c.impeto_extra,
  recommended_levels:c.niveis,native_skills:c.habilidades_nativas,
  pp:c.pp,training_provisional:c.treino_proposto_nao_validado===true};
 if(Array.isArray(c.niveis)&&c.niveis.length===10)withTrain++;else withoutTrain++;
 for(const tactic of B.tactics){
  const list=B.rank(c,tactic);
  assert(list.length>=1,'Deve haver opção consultiva '+c.numero+' '+tactic);
  assert(list.every(z=>B.CRAFTABLE.includes(z.nome)&&Number.isFinite(z.score)&&z.atributos.length===4),'Tipo regular e quatro atributos '+c.numero);
  assert(list.every(z=>['comparativa_limitada','baixa','pendente'].includes(z.confianca)),'Sem confiança fictícia '+c.numero);
  assert(list.every(z=>z.evidencias.limite.includes('Sem atributos finais')),'Proveniência individual '+c.numero);
  assert.equal(new Set(list.map(z=>z.nome)).size,list.length,'Nunca duplicar candidatos');
  const natural=B.boosterName(c.impeto_fixo),registered=B.slotStatus(c.impeto_extra)==='nome_registrado'?B.boosterName(c.impeto_extra):null;
  if(natural)assert(!list.some(x=>x.nome===natural),'Ímpeto nativo recomendado como novo '+c.numero+' '+natural);
  if(registered)assert(!list.some(x=>x.nome===registered),'Segundo ímpeto registrado recomendado como novo '+c.numero+' '+registered);
  if(natural||registered)noDoubleNative++;
  counters[tactic][list[0].nome]=(counters[tactic][list[0].nome]||0)+1;
  const rec=R.booster(d,tactic,B);
  assert(rec.primary,'A ficha precisa sugerir alternativa '+c.numero+' '+tactic);
  assert.equal(rec.primary.nome,list[0].nome,'Auditoria e ficha devem escolher igual '+c.numero+' '+tactic);
  assert.equal(rec.confidence,rec.primary.confianca);
  if(rec.spread!==null&&rec.spread<2&&tactic==='posse')close++;
  assert.equal(rec.able&&rec.status==='nome_registrado',false,'Não disponibilizar slot registrado '+c.numero);
 }
}
assert.equal(withTrain+withoutTrain,246);
assert(withoutTrain>0,'Cartas sem níveis finais documentados não podem ser fingidas');
assert.equal(B.rank({...byId.get(1),niveis:null},'posse')[0].confianca,'baixa');
// V292: orçamento matematicamente cabível NÃO equivale a nível/PP com origem.
assert.equal(B.rank(byId.get(1),'posse')[0].confianca,'baixa');
assert.equal(B.rank(byId.get(1),'posse')[0].estado_confianca,'BAIXA_SEM_PROVA_NIVEL_PP');
const possePivot=B.rank({...byId.get(33),estilo_ataque:'Pivô'},'posse');
const posseRunner=B.rank({...byId.get(33),estilo_ataque:'Artilheiro'},'posse');
const posseLink=B.rank({...byId.get(1),estilo_ataque:'Puxa marcação'},'posse');
const runnerForLink=B.rank({...byId.get(1),estilo_ataque:'Artilheiro'},'posse');
const score=(list,name)=>list.find(x=>x.nome===name)?.score??null;
assert(score(possePivot,'Passing')>score(posseRunner,'Passing'),'Pivô de posse valoriza passe de apoio');
assert(score(posseLink,'Technique')>score(runnerForLink,'Technique'),'Atacante de apoio valoriza técnica quando a carta não possui ímpeto fixo Technique');
const ca=cards.filter(c=>['AC','CA'].includes(c.posicao));
const leaders=new Set(ca.map(c=>B.rank(c,'posse')[0]?.nome));
console.log('V200 ranking CA '+ca.length+' cartas: '+JSON.stringify([...leaders]));
console.log('V200 ranking Posse 246 cartas: '+JSON.stringify(counters.posse));
assert(leaders.size>=3,'Os CA ainda recebem sempre o mesmo tipo de ímpeto; reavaliar estilo/build');
assert.equal(B.rank(byId.get(24),'posse').some(x=>x.nome==="Striker's Instinct"),false,'Ronaldo Big Time já tem Instinto artilheiro fixo');
assert.equal(B.rank(byId.get(24),'posse').some(x=>x.nome==='Physicality'),false,'Ronaldo Big Time já tem Fisicalidade registrada');
const massaro=B.rank(byId.get(1),'posse')[0],berbatov=B.rank(byId.get(33),'posse')[0];
assert.notEqual(massaro.nome,berbatov.nome,'Pivô técnico não deve receber escolha cega idêntica ao matador');
const cf=R.booster({...byId.get(1),shown_position:'AC',boost1:byId.get(1).impeto_fixo,boost2:byId.get(1).impeto_extra,
 recommended_levels:byId.get(1).niveis,native_skills:byId.get(1).habilidades_nativas},'posse',B,'ausente');
assert.equal(cf.able,false,'Sem slot, nunca sugerir equipar');
assert.equal(cf.equipStatus,'impossivel_na_conta');
const unknownSlot=R.booster({...byId.get(1),shown_position:'AC',boost1:byId.get(1).impeto_fixo,boost2:byId.get(1).impeto_extra},'posse',B);
assert.equal(unknownSlot.able,false,'Texto do catálogo não confirma slot na conta');
assert.equal(unknownSlot.equipStatus,'slot_nao_verificado');
const confirmedEmpty=R.booster({...byId.get(1),shown_position:'AC',boost1:byId.get(1).impeto_fixo,boost2:byId.get(1).impeto_extra},'posse',B,'vazio');
assert.equal(confirmedEmpty.able,true,'Confirmação manual de slot vazio permite elegibilidade condicionada');

const marked=R.booster({shown_position:'AC',role_used:'CA',boost1:'Physicality +3',
 boost2:'SLOT SELECIONÁVEL +1',recommended_levels:byId.get(1).niveis,
 native_skills:byId.get(1).habilidades_nativas,attack_style:'Matador'},'posse',B,'ocupado',"Striker's Instinct");
assert(![marked.primary,...marked.alternatives].some(x=>x?.nome==="Striker's Instinct"),
 'Ímpeto confirmado como equipado pelo usuário não pode reaparecer como nova recomendação');
assert.equal(marked.confirmedEquipped,"Striker's Instinct");
assert.equal(marked.able,false,'Slot ocupado confirmado não pode ser marcado como equipável');
assert.equal(marked.equipStatus,'ocupado_na_conta','Mostrar status correto para slot ocupado');

const auditUI=fs.readFileSync(path.join(web,'revisao-impetos-v103.js'),'utf8');
assert(auditUI.includes('optionsFor(c,key,saved)')&&auditUI.includes("optionsFor(c,'posse',read(c))"),'Planejamento exclui equipado confirmado');
assert(auditUI.includes('scout-pro-246-impetos-individuais-v200.csv'),'Exportação precisa representar motor atual');
const view=require('../web/scout-profile-v188.js').boosterView(
 {shown_position:'AC',role_used:'CA',boost1:byId.get(1).impeto_fixo,boost2:byId.get(1).impeto_extra,
 recommended_levels:byId.get(1).niveis,native_skills:byId.get(1).habilidades_nativas,attack_style:byId.get(1).estilo_ataque},
 B,R,false);
assert(view.recommend&&Array.isArray(view.alternatives));
const src=fs.readFileSync(path.join(web,'scout-profile-v188.js'),'utf8');
assert(src.includes('v200-caution')&&src.includes('v200-alternatives')&&src.includes('v200-review')&&src.includes('v200-why'),'Comparação visível e método expandível na ficha principal');
const ui=fs.readFileSync(path.join(web,'skills-booster-v162.js'),'utf8');
assert(ui.includes('v200-booster-caution')&&ui.includes('score_complemento'),'Explicação do modelo sem OVR');
const css=fs.readFileSync(path.join(web,'scout-finish-v200.css'),'utf8');
assert(css.includes('#v200-caution')&&css.includes('min-height:44px'),'Acesso premium e alvos de toque');
const bridge=fs.readFileSync(path.join(web,'app-bridge.js'),'utf8');
const sw=fs.readFileSync(path.join(web,'sw.js'),'utf8');
const stamp=fs.readFileSync(path.join(root,'scripts/stamp-bundle-v189.cjs'),'utf8');
assert(bridge.includes("v189Root+'scout-finish-v200.css'"));
assert(sw.includes("'./scout-finish-v200.css'")&&sw.includes('v200-boosters'));
assert(stamp.includes("'scout-finish-v200.css'"));
console.log('V220 OK: 246 cartas x '+B.tactics.length+' táticas, '+withTrain+' builds documentadas, '+withoutTrain+' provisórias, '+noDoubleNative+' comparações sem recomendar booster registrado; '+close+' alternativas próximas em Posse.');
