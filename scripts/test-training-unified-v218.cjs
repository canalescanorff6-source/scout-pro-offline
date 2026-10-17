'use strict';
/* SCOUT V218: uma ficha principal ajustável por carta; originais sempre preservados. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=x=>fs.readFileSync(path.join(root,x),'utf8');
const UI=require('../web/scout-training-unified-v218.js');
const ref=require('../web/scout-training-reference-v208.js');
const cards=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
assert.equal(cards.length,246);
assert.equal(UI.CATEGORY.length,10);
assert.equal(new Set(UI.CATEGORY).size,10);
for(let i=0;i<21;i++)assert.equal(UI.ppCost(i),ref.ppCost(i));
assert.equal(UI.total(Array(10).fill(0)),0);
assert.equal(UI.total([10,5,5,8,8,6,0,0,0,0]),62);
assert.equal(UI.total([12,5,4,8,8,4,0,0,0,0]),62);
assert.equal(UI.total([12,0,2,8,8,8,0,0,0,0]),62);
assert.equal(UI.total(null),null);
assert.equal(UI.valid(Array(9).fill(0)),false);
assert.equal(UI.adjust([10,5,5,8,8,6,0,0,0,0],0,1,62),null,'Não permitir custo superior ao orçamento');
const minus=UI.adjust([10,5,5,8,8,6,0,0,0,0],0,-1,62);
assert(minus&&UI.total(minus)<62,'Decremento seguro pode deixar PP por alocar');
const plus=UI.adjust(minus,0,1,62);
assert.deepEqual(plus,[10,5,5,8,8,6,0,0,0,0],'Retornar ao orçamento correto');
assert.equal(UI.adjust(Array(10).fill(0),0,-1,62),null);
assert.equal(UI.adjust(Array(10).fill(20),0,1,999),null);
assert.equal(UI.adjust(Array(10).fill(0),12,1,62),null);
assert.equal(UI.adjust(Array(10).fill(0),0,2,62),null);
const s1=UI.readSaved({id:'42',card:'a.html',train:[10,5,5,8,8,6,0,0,0,0],source:'simulação pessoal'},'42','a.html',62);
assert.equal(s1.source,'simulação pessoal');
assert.notEqual(s1.levels[0],99);s1.levels[0]=99;
assert.equal(UI.readSaved({id:'42',card:'a.html',train:[10,5,5,8,8,6,0,0,0,0]},'99','a.html',62),null,'Não reutilizar rascunho de outra edição');
assert.equal(UI.readSaved({id:'42',card:'a.html',train:[10,5,5,8,8,6,0,0,0,0]},'42','b.html',62),null,'Rascunho não migra entre arquivos');
assert.equal(UI.readSaved({id:'42',card:'a.html',train:Array(10).fill(20)},'42','a.html',62),null,'Não carregar rascunho acima do PP');
const model={A:[12,5,4,8,8,4,0,0,0,0],B:[12,0,2,8,8,8,0,0,0,0],P:[10,5,5,8,8,6,0,0,0,0]};
assert.deepEqual(UI.scenarioPlan(model,'A',62,model.P),model.A);
assert.equal(UI.scenarioPlan(model,'P',62,model.P),null,'Não repetir plano recomendado no comparador');
assert.equal(UI.scenarioPlan({A:Array(10).fill(20)},'A',62,model.P),null,'Cenário inválido rejeitado');
const original=cards.map(x=>({num:x.numero,id:String(x.id),pp:x.pp,levels:x.niveis}));
let registered=0,pending=0;
for(const c of cards){
 const p=ref.resolveTraining({pp:c.pp,recommended_levels:c.niveis},{});
 if(p.kind==='registrado'){registered++;assert(UI.valid(p.levels));assert.equal(UI.total(p.levels),c.pp)}
 else{pending++;assert.equal(p.kind,'pendente');assert.equal(p.levels,null)}
}
assert.equal(registered,162);assert.equal(pending,84);
assert.deepEqual(cards.map(x=>({num:x.numero,id:String(x.id),pp:x.pp,levels:x.niveis})),original,'Nenhuma build alterada');
const logic=read('web/scout-training-unified-v218.js'),lab=read('web/lab.js'),css=read('web/scout-training-unified-v218.css');
const bridge=read('web/app-bridge.js'),sw=read('web/sw.js'),bundle=read('scripts/stamp-bundle-v189.cjs');
for(const file of ['scout-training-unified-v218.js','scout-training-unified-v218.css']){
 assert(bridge.includes("v189Root+'"+file+"'"),'Carregamento único Android/Windows '+file);
 assert(sw.includes("'./"+file+"'"),'Cache offline '+file);
 assert(bundle.includes("'"+file+"'"),'Fingerprint do pacote '+file);
}
assert(logic.includes("fold('pontos'")&&logic.includes("fold('performance'"),'Esconder treinos duplicados em opções avançadas');
assert(logic.includes('scoutpro:lab-changed-v218')&&logic.includes('scoutpro:training-edit-v218'),'Sincronismo bidirecional');
assert(lab.includes('scoutpro:lab-changed-v218')&&lab.includes('scoutpro:training-edit-v218'),'Laboratório sincronizado com ficha do topo');
assert(logic.includes('Restaurar treino registrado')&&logic.includes('Editar pontos'));
assert(css.includes('min-height:44px')&&css.includes('@media(max-width:520px)'),'Toques acessíveis e responsividade');
assert(sw.includes('v218-unified-training'),'Novo cache para que a atualização não exiba ficha estática');
assert(!logic.includes('recommended_levels=')&&!logic.includes('cards.push('),'Sem alteração do catálogo');
console.log('V218 PASS: 246 cartas, 162 treinos registrados, 84 pendentes, PP progressivo e comparação A/B/P preservados; ficha editável local Android/Windows.');
