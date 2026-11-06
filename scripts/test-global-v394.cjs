'use strict';
const assert=require('node:assert/strict');
const G=require('../web/craque-global-v394.js');
const T=require('../web/scout-multitactic-engine-v220.js');
const fs=require('node:fs');
const guide=fs.readFileSync('web/guia-movimentacao-v394.html','utf8');
const embedded=guide.match(/^const cards=(\[[^\n]+\]);$/m);
assert.ok(embedded,'Guia precisa conter catálogo offline fixo, sem requisição de dados privados');
const catalogue=JSON.parse(embedded[1]);
assert.equal(catalogue.length,261,'Não excluir cartas do guia');
assert.equal(catalogue.filter(c=>c.collection==='originais').length,246);
assert.equal(catalogue.filter(c=>c.collection==='adicionais').length,15);
assert.equal(new Set(catalogue.map(c=>c.n)).size,261,'Cada registro público é distinto');
assert.ok(fs.readFileSync('web/sw.js','utf8').includes("'./guia-movimentacao-v394.html'"));
assert.ok(fs.readFileSync('web/app-bridge.js','utf8').includes("guia-movimentacao-v394.html"));
assert.equal(G.MODES.length,6);
const build=(shift)=>{
 const v=Array(10).fill(0);
 for(let i=0;i<5;i++)v[(i+shift)%7]=8;
 assert.equal(T.total(v),60);return v;
};
const proposals=G.MODES.map((id,i)=>({tactic:id,status:'hipotese',pp:60,
 role:'MLG',levels:build(i),focus:{priority:[{index:(i+1)%7}]}}));
const originals=JSON.stringify(proposals);
const universal=G.choose(proposals,T);
assert.ok(universal,'Consenso deve existir quando os seis cenários são válidos');
assert.equal(universal.pp,60);
assert.equal(T.total(universal.levels),60);
assert.equal(universal.coverage.length,6);
assert.equal(universal.kind,'hipotese_universal');
assert.deepEqual(G.choose([...proposals].reverse(),T).levels,universal.levels,
 'Ordem de renderização não pode alterar a ficha global');
for(const id of G.MODES)assert.deepEqual(G.choose(proposals,T).levels,universal.levels,
 'Trocar o estilo não altera a distribuição global');
assert.equal(JSON.stringify(proposals),originals,'Não modificar propostas cadastradas');
assert.equal(G.choose([...proposals.slice(0,4),{...proposals[4],status:'pendente'},proposals[5]],T),null);
assert.equal(G.choose([...proposals.slice(0,4),{...proposals[4],pp:58},proposals[5]],T),null);
assert.equal(G.choose([...proposals.slice(0,4),{...proposals[4],levels:[8,8]},proposals[5]],T),null);
const skillRows=G.MODES.map((tactic,i)=>({tactic,result:{recommendations:[
 {name:'Passe de primeira',why:'Apoio central'},
 {name:'Interceptação',why:'Defesa'},
 {name:i%2?'Passe em profundidade':'Passe de primeira',why:'Ligação'}]}}));
const rank=G.rankSkills(skillRows,x=>x.toLowerCase(),5);
assert.equal(rank[0].name,'Passe de primeira');
assert.equal(rank[0].globalCoverage,6);
assert.equal(new Set(rank.map(x=>x.name)).size,rank.length);
const boostRows=G.MODES.map(tactic=>({tactic,result:{slotSupported:true,able:true,
 primary:{nome:'Agilidade',motivo:'Hipótese'},alternatives:[{nome:'Passe'}]}}));
assert.equal(G.rankBoosters(boostRows).primary.nome,'Agilidade');
boostRows[2].result.slotSupported=false;
assert.equal(G.rankBoosters(boostRows).applyAuthorized,false,
 'Sem prova de slot o ranking continua meramente consultivo');
boostRows[2].result.primary=null;boostRows[2].result.alternatives=[];
assert.equal(G.rankBoosters(boostRows),null,'Sem candidatos não criar ímpeto global');
console.log('V394: consenso universal, PP, seis estilos, slots e integridade PASS');
