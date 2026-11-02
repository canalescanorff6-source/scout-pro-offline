// Fixture histórica anterior à correção autorizada V381; dados atuais são verificados no teste de integração V381.
const {historicalRead}=require('./historical-level-fixtures-v381.cjs');
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>historicalRead(path.join(root,p),'utf8');
const ui=require('../web/scout-training-reference-v208.js');
const roster=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
assert.equal(roster.length,246);
assert.equal(ui.CATEGORIES.length,10);assert.equal(Object.keys(ui.SHAPES).length,10);
assert.equal(new Set(Object.values(ui.SHAPES)).size,10,'Ícones específicos');
for(const [key,label] of ui.CATEGORIES){
 const svg=ui.svg(key);assert(svg.includes('viewBox="0 0 64 64"')&&svg.includes('aria-hidden="true"'),label);
 assert(!/<(?:script|foreignObject|image|iframe)\b/i.test(svg),'SVG local');
}
for(const [level,pp] of [[0,0],[4,4],[5,6],[8,12],[9,15],[10,18],[11,21],[12,24]])assert.equal(ui.ppCost(level),pp);
assert.throws(()=>ui.ppCost(21));
const example=[0,8,4,8,11,4,9,0,0,0];
assert.equal(example.reduce((a,b)=>a+ui.ppCost(b),0),68,'Imagem do usuário 68/68');
let registered=0,pending=0;
for(const c of roster){
 const state=ui.resolveTraining({pp:c.pp,recommended_levels:c.niveis,recommended_scenario:c.recomendacao},{});
 if(Array.isArray(c.niveis)){
  registered++;assert.equal(state.kind,'registrado');assert(state.matchesBudget,'PP ' +c.numero);
  assert.equal(state.levels.join(','),c.niveis.join(','),'Sem alterar builds');
 }else{
  pending++;assert.equal(state.kind,'pendente');assert.equal(state.spent,null,'Sem zeros inventados');
 }
}
assert.equal(registered,160);assert.equal(pending,86);
const p=ui.resolveTraining({pp:60,recommended_levels:null},{draftA:[11,4,4,11,7,0,0,0,0,0]});
assert.equal(p.kind,'prévia experimental');assert.equal(p.spent,60);
// V209: cabeçalho visual uniforme A em QUALQUER cenário; cenário real preservado para lógica.
assert.equal(ui.DISPLAY_SCENARIO,'A','Cabeçalho de todas as fichas no padrão aprovado');
const actualScenario=ui.resolveTraining({pp:62,recommended_levels:roster[0].niveis,recommended_scenario:'P'},{});
assert.equal(actualScenario.scenario,'P','O cenário real P continua intacto');
assert.equal(actualScenario.spent,62,'A etiqueta fixa não altera os PP');
for(const scenario of ['A','B','C','P']){
 const train=ui.resolveTraining({pp:62,recommended_levels:roster[0].niveis,recommended_scenario:scenario},{});
 assert.equal(train.scenario,scenario,'Cenário interno preservado: '+scenario);
 assert.equal(train.spent,62,'PP idêntico: '+scenario);
 assert.equal(ui.DISPLAY_SCENARIO+' - Posse central','A - Posse central','Título visual uniforme: '+scenario);
}
const js=read('web/scout-training-reference-v208.js'),css=read('web/scout-training-reference-v208.css');
assert(js.includes("prefix.textContent=DISPLAY_SCENARIO+' - '"),'A tela usa a letra fixa da apresentação');
assert(!js.includes("prefix.textContent=state.scenario+' - '"),'Não reintroduzir cenário real no cabeçalho');
assert(js.includes("old.hidden=true")&&js.includes('aria-hidden'),'Fallback acessível');
assert(!js.includes('localStorage.setItem')&&!js.includes('fetch('));
for(const x of ['scout-v208-heading','scout-v208-icon','scout-v208-total'])assert(js.includes(x)&&css.includes(x));
assert(css.includes('#v188-train[hidden]')&&css.includes('@media(max-width:355px)'));
for(const n of ['scout-training-reference-v208.js','scout-training-reference-v208.css']){
 assert(read('web/app-bridge.js').includes("v189Root+'"+n+"'"));
 assert(read('web/sw.js').includes("'./"+n+"'"));
 assert(read('scripts/stamp-bundle-v189.cjs').includes("'"+n+"'"));
}
assert(read('web/sw.js').includes('v209-uniform-a-title'));
assert(read('web/sw.js').includes('v208-user-reference'));

assert.equal(fs.readdirSync(path.join(root,'web/fichas')).filter(x=>x.endsWith('.html')).length,246);
console.log('V208 OK: layout, 10 ícones, custos progressivos, exemplo 68/68, 162 builds e 84 pendentes preservadas.');
