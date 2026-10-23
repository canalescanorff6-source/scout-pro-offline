'use strict';
// Auditoria V336 — a escolha de PP do usuário prevalece sobre qualquer simulação.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const core=require('../web/craque-ficha-decision-v327.js');
const tactical=require('../web/scout-multitactic-engine-v220.js');
const profiles=require('../web/craque-manager-fichas-v324.js');
const cards=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
const snapshot=JSON.stringify(cards);
assert.equal(cards.length,246);
const levels=[10,5,5,8,8,6,0,0,0,0],budget=tactical.total(levels);
assert.equal(budget,62);
const context={collection:'outros-elencos',owner:'teste',cardKey:'ficha-1',
 cardId:'105297',edition:'versao-testada'};
const scene=(overrides={})=>({position:'MAT',style:'posse',manager:'CT-MGR-071',
 managerProfile:{name:'Niko Kovač'},compatibility:{eligible:true},
 outcome:{plan:{status:'hipotese',pp:budget,levels:levels.slice(),categories:tactical.CATEGORIES}},
 ...overrides});
const full={revision:{approved:true,levels:levels.slice()},stale:false};
const partial=[8,5,5,8,8,6,0,0,0,0];
const used=tactical.total(partial);
assert(used<budget);
assert(profiles.validTraining(partial,budget),'V324 permite PP não utilizados');
assert(core.validDraft(partial,scene().outcome.plan,tactical),
 'O motor de decisão precisa respeitar o contrato V324');
assert(!core.validateLevels(partial,scene().outcome.plan,tactical),
 'Contrato de treino totalmente alocado continua distinto');
const draft={train:partial.slice(),skills:[],booster:''};
const r=core.resolve(scene(),context,tactical,full,draft);
assert.equal(r.kind,'rascunho_salvo','Proposta antiga nunca substitui rascunho de PP incompleto');
assert.equal(r.source,'rascunho_independente');
assert.equal(r.isSaved,true);
assert.equal(r.approved,false,'Não herdar homologação do vetor de PP diferente');
assert.deepEqual([...r.levels],partial,'Devolver os dez níveis exatos do usuário');
assert.equal(r.pp,budget,'Orçamento de PP não equivale a pontos utilizados');
assert.equal(r.usedPP,used);
assert.equal(r.remainingPP,budget-used);
assert(r.what.some(x=>x.includes('PP continuam livres')));
const blank=core.resolve(scene(),context,tactical,full,{train:Array(10).fill(0),skills:[],booster:''});
assert.equal(blank.kind,'rascunho_salvo','Zerar rascunho explicitamente não deve restaurar proposta');
assert.equal(blank.usedPP,0);
assert.equal(blank.remainingPP,budget);
assert.equal(blank.approved,false);
const complete=core.resolve(scene(),context,tactical,full,{train:levels.slice(),skills:[],booster:''});
assert.equal(complete.approved,true,'Aprovação antiga só se mantém se o vetor é idêntico');
assert.equal(complete.remainingPP,0);
const calculated=core.resolve(scene(),context,tactical,null,null);
assert.equal(calculated.kind,'proposta_calculada');
assert.equal(calculated.remainingPP,0);
const over=levels.slice();over[0]=20;
assert(!core.validDraft(over,scene().outcome.plan,tactical),'Rascunho excedente não é válido');
const bad=[...partial];bad[0]=-1;
assert(!core.validDraft(bad,scene().outcome.plan,tactical));
assert(!core.validDraft(Array(9).fill(0),scene().outcome.plan,tactical));
assert(!core.validDraft(partial,{...scene().outcome.plan,status:'pendente'},tactical));
const ui=read('web/craque-positional-ui-v311.js');
assert(ui.includes('savedProfile.train.slice()'),'Tabela de treino deve vir do rascunho salvo');
assert(ui.includes('const used=host.SCOUT_TACTICS_V220.total(p.levels)'),
 'Mostrar o custo real dos dez grupos');
assert(ui.includes('PP distribuídos · saldo'),'Deve exibir PP utilizados/saldo');
assert(ui.includes("decision.usedPP+' / '+decision.pp+' PP"),'Resumo mostra usado/orçamento');
assert(ui.includes("decision.remainingPP+' PP livres"),'Resumo mostra saldo explícito');
assert(ui.includes('if(guide&&!readError)'), 'Histórico ilegível não pode homologar uma build');
assert.equal(JSON.stringify(cards),snapshot,'Não alterar 246 cartas, Card IDs, PP e builds');
console.log('V336 PP COMPETITIVO PASS: rascunhos incompletos, saldo, aprovação restrita, 246 originais intactas.');
