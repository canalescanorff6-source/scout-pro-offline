'use strict';
// V314: formações convertem cada vaga na posição REAL de uso para o mesmo motor V311.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),text=p=>fs.readFileSync(path.join(root,p),'utf8');
const positional=require('../web/craque-positional-v311.js');
const formation=require('../web/craque-formation-context-v314.js');
const tactics=require('../web/scout-multitactic-engine-v220.js');
const training=require('../web/craque-friends-training-v228.js');
const skills=require('../web/skills-booster-v162.js');
const boosters=require('../web/booster-engine-v103.js');
const dep={tactical:tactics,training,skills,boosters};
const catalog=JSON.parse(text('web/SCOUT_V69_AUDITORIA.json'));
const original=JSON.stringify(catalog.cards),planned=JSON.parse(text('web/SCOUT_V177_DUAS_FORMACOES.json'));
assert.equal(catalog.cards.length,246);
for(const plan of planned.formations){
 const expected=Object.fromEntries(plan.starters.map(x=>[x.slot,x.role]));
 const actual=Object.fromEntries(formation.slots(plan.id).map(x=>[x.slot,x.position]));
 assert.equal(Object.keys(actual).length,11);
 assert.deepEqual(actual,expected,'Vaga real deve seguir plano oficial V177 e não Overall');
}
const personal={numero:247,id:'EDICAO-TESTE-CONTEXTUAL',name:'Jogador teste SA',
 posicao:'MO',versao:'Edição de teste',pp:68,max_level:35,
 estilo_ataque:'Armador criativo',habilidades_nativas:'One-touch Pass; Through Passing'};
const owner={id:'bruno-teste',name:'Bruno Santos CD'};
const external={id:'fake-01',ownerId:owner.id,name:personal.name,position:'MAT',cardId:personal.id,
 edition:personal.versao,level:35,pp:68,style:personal.estilo_ataque,
 nativeSkills:personal.habilidades_nativas,skills:'',fixedBooster:'',booster:'',
 boosterSlot:'pendente',trainingLevels:''};
const before=JSON.stringify({personal,external});
assert.equal(formation.slotPosition('4213','sa'),'SA');
assert.equal(formation.slotPosition('4213','mat'),'MAT');
assert.equal(formation.slotPosition('4312','sa'),null);
assert.throws(()=>formation.context({collection:'outros-elencos',owner:{id:'outro'},card:external,
 formation:'4213',slot:'sa',style:'posse'},positional),/Proprietário/);
for(const style of formation.modes){
 const first=formation.context({collection:'minhas-cartas',card:personal,formation:'4213',
  slot:'sa',style,manager:'CT-MGR-013'},positional);
 const second=formation.context({collection:'outros-elencos',card:external,owner,formation:'4213',
  slot:'sa',style,manager:'CT-MGR-013'},positional);
 assert.equal(first.position,'SA');
 assert.equal(first.originalPosition,'MAT');
 assert.equal(first.scenario.compatibility.eligible,false,'Familiaridade SA não é deduzida');
 assert.equal(first.scenario.outcome.plan.pp,68);
 assert.equal(first.scenario.outcome.plan.status,'hipotese');
 assert.equal(tactics.total(first.scenario.outcome.plan.levels),68);
 assert.deepEqual(first.scenario.outcome.plan.levels,second.scenario.outcome.plan.levels,
  'Mesmo cenário deve ter a mesma distribuição PP em ambos acervos');
 assert.deepEqual(first.scenario.outcome.suggestedSkills.map(x=>x.name),
  second.scenario.outcome.suggestedSkills.map(x=>x.name));
 assert.equal(first.scenario.outcome.booster?.primary?.nome,
  second.scenario.outcome.booster?.primary?.nome);
 const mat=formation.context({collection:'minhas-cartas',card:personal,formation:'4213',
  slot:'mat',style,manager:'CT-MGR-013'},positional);
 assert.notEqual(mat.scenario.id,first.scenario.id);
 assert.equal(mat.position,'MAT');
 assert.equal(mat.scenario.compatibility.status,'original');
}
// Sem PP, nenhuma vaga/posição cria distribuição falsamente zerada.
const pending=formation.context({collection:'outros-elencos',card:{...external,pp:null,level:null},
 owner,formation:'4213',slot:'sa',style:'posse'},positional);
assert.equal(pending.scenario.outcome.plan.status,'pendente');
assert.equal(pending.scenario.outcome.plan.levels,null);
const reader={getItem:k=>reader.db[k]||null,setItem:(k,v)=>{reader.db[k]=v},db:{}};
const orig=formation.context({collection:'outros-elencos',card:external,owner,
 formation:'4213',slot:'mat',style:'posse'},positional);
const alt=formation.context({collection:'outros-elencos',card:external,owner,
 formation:'4213',slot:'sa',style:'posse'},positional);
positional.save(reader,orig.scenario);
const snapshot=JSON.stringify(positional.saved(reader,orig.scenario).revision);
positional.save(reader,alt.scenario);
assert.equal(JSON.stringify(positional.saved(reader,orig.scenario).revision),snapshot,
 'Ficha MAT salva não pode ser substituída por SA');
assert.equal(JSON.stringify({personal,external}),before,'Formação não altera original nem equipamentos');
assert.equal(JSON.stringify(catalog.cards),original,'A análise não altera as 246 cartas');
const html=text('web/meu-time-duas-formacoes-v177.html');
const extHtml=text('web/outros-elencos-v227.html');
const ui=text('web/craque-formation-ui-v230.js');
for(const file of ['craque-formation-context-v314.js','craque-formation-context-v314.css']){
 assert(html.includes(file)&&extHtml.includes(file),'Arquivos V314 ausentes de uma plataforma/acervo: '+file);
 assert(text('web/sw.js').includes('./'+file));
 assert(text('scripts/stamp-bundle-v189.cjs').includes("'"+file+"'"));
}
assert(ui.includes('formationCore.context'),'Escalação real não chama motor de cenário compartilhado');
const lineup=text('web/meu-time-duas-formacoes-v177.js');
assert(lineup.includes("craque:lineup-assigned-v315"),'Troca real da vaga não informa motor contextual');
const accept=lineup.slice(lineup.indexOf('function assign('),lineup.indexOf('function makePlayer('));
assert(accept.indexOf("if(!fits(c,slot))")<accept.indexOf("craque:lineup-assigned-v315"),
 'Evento não pode disparar antes de validar a familiaridade da escalação');
assert(accept.indexOf("save();render()")<accept.indexOf("craque:lineup-assigned-v315"),
 'Evento deve ocorrer após salvar e renderizar a troca efetiva');
assert(ui.includes("openPositionScenario(player,slot,{automatic=false}"),
 'Motor contextual não reutiliza componente da vaga já existente');
assert(ui.includes("state.snapshot()[d.slot]")&&ui.includes("queueMicrotask"),
 'Trocas rápidas exigem descarte de eventos obsoletos e ficha do titular atual');
assert(ui.includes("const selection=chosen.find(c=>c.slot===contextSlot)"),
 'Contexto aberto não acompanha alteração de tática/elenco');
assert(text('web/craque-positional-ui-v311.js').includes('formationApi.ui'),
 'Laboratório não possui seletor de vaga de formação');
assert(text('web/app-bridge.js').includes("load('craque-formation-context-v314.js'"));
console.log('V315 PASS: 11 vagas×2 formações, MAT→SA, 5 estilos, PP exatos, habilidades/ímpetos por vaga, 2 acervos, versões de técnico e 246 cartas intactas.');
