'use strict';
// V337 — custo PP marginal e custo de oportunidade, sem métrica fictícia de gameplay.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const engine=require('../web/scout-multitactic-engine-v220.js');
const decision=require('../web/craque-ficha-decision-v327.js');
const cards=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
const original=JSON.stringify(cards);
assert.equal(cards.length,246);
const ref=[10,5,5,8,8,6,0,0,0,0],pp=engine.total(ref);
const alternative=[9,6,5,8,8,6,0,0,0,0];
assert.equal(pp,62);
assert.equal(engine.total(alternative),61);
assert.equal(engine.ppCost(10)-engine.ppCost(9),3);
assert.equal(engine.ppCost(6)-engine.ppCost(5),2);
const identity={collection:'minhas-246',owner:'principal',cardKey:'40@8804',
 cardId:'8804',edition:'Edição verificada em teste'};
const scenario=style=>({style,position:'MAT',manager:'CT-MGR-071',
 managerProfile:{name:'Niko Kovač'},compatibility:{eligible:true},
 outcome:{plan:{status:'hipotese',pp,levels:ref.slice(),categories:engine.CATEGORIES}}});
const modes=decision.MODES.map(style=>decision.resolve(scenario(style),identity,engine,
 null,style==='rapido'?{train:alternative.slice(),skills:[],booster:''}:null));
const selected=modes[0];
const result=decision.compare(selected,modes,engine.CATEGORIES,engine);
assert.equal(result.rows.length,5);
assert.equal(result.rows[0].costBasis,'custo_progressivo_exato');
const rapid=result.rows.find(x=>x.style==='rapido');
assert.equal(rapid.kind,'rascunho_salvo');
assert.equal(rapid.pp,62);
assert.equal(rapid.usedPP,61);
assert.equal(rapid.remainingPP,1);
assert.equal(rapid.referenceUsedPP,62);
assert.equal(rapid.netDeltaPP,-1);
assert.equal(rapid.addedPP,2);
assert.equal(rapid.removedPP,3);
assert.equal(rapid.redistributedPP,2);
assert.deepEqual(rapid.changes.map(x=>[x.name,x.delta,x.deltaPP]),[
 ['Chute',-1,-3],['Passe',1,2]]);
assert.equal(rapid.major[0].name,'Chute','Ordenar maiores mudanças por PP, não níveis');
assert.equal(rapid.major[1].name,'Passe');
assert.equal(rapid.sameTraining,false);
assert.match(result.statement,/NÃO indicam/);
assert.match(result.statement,/gameplay/);
assert.equal(result.rows.find(x=>x.style==='normal').sameTraining,true);
for(const row of result.rows){
 assert.equal(row.usedPP,engine.total(modes.find(x=>x.style===row.style).levels));
 assert.equal(row.remainingPP,row.pp-row.usedPP);
 assert.equal(row.addedPP-row.removedPP,row.netDeltaPP);
}
const without=decision.compare(selected,modes,engine.CATEGORIES);
assert.equal(without.rows[2].costBasis,'indisponivel');
assert.equal(without.rows[2].usedPP,null);
assert.equal(without.rows[2].changes[0].deltaPP,null);
assert.deepEqual(decision.diff(selected,modes[2],engine.CATEGORIES,engine).map(x=>x.deltaPP),[-3,2]);
assert.throws(()=>decision.compare(selected,modes.map((x,i)=>i===1?
 {...x,edition:'outra versão'}:x),engine.CATEGORIES,engine),/mesma carta/);
assert.throws(()=>decision.compare(selected,modes.slice(0,4),engine.CATEGORIES,engine),/cinco/);
assert(Object.isFrozen(rapid)&&Object.isFrozen(rapid.changes));
const ui=read('web/craque-positional-ui-v311.js');
assert(ui.includes('host.SCOUT_TACTICS_V220);'),'O comparador precisa receber o custo progressivo real');
assert(ui.includes("Number.isInteger(d.deltaPP)"),'A UI precisa distinguir PP de níveis');
assert(ui.includes("item.remainingPP+' PP livres"),'O saldo deve ficar claro');
assert.equal(JSON.stringify(cards),original,'As 246 cartas e PP originais não mudaram');
console.log('V337 PASS: custo marginal 3 versus 2 PP, saldo, ordenação real, isolamento, dados imutáveis.');
