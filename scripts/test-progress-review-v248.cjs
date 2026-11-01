// Fixture histórica anterior à correção autorizada V381; dados atuais são verificados no teste de integração V381.
const {historicalRead}=require('./historical-level-fixtures-v381.cjs');
'use strict';
/* V248: 161 níveis sem comprovação e revisão local por edição exata.
 * O teste não cria informação para nenhuma das 246 cartas originais.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>historicalRead(path.resolve(__dirname,'..',p),'utf8');
const before=read('web/SCOUT_V69_AUDITORIA.json');
const cards=JSON.parse(before).cards;
const A=require('../web/craque-progresso-v248.js');
assert.equal(cards.length,246);
const map=new Map(),storage={
 getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,String(v)),
 removeItem:k=>map.delete(k)
};
const initial=A.summary(cards,storage);
assert.deepEqual(initial,{
 total:246,pendente:161,registrado:85,confirmado_localmente:0,divergente:0
},'Não marcar como confirmados os níveis que não têm comprovação');
assert.equal(A.budget(26),50);
assert.equal(A.budget(1),0);
assert.equal(A.budget(120),238);
for(const x of [0,121,-1,2.5,NaN,'26',null])assert.equal(A.budget(x),null);
const martinelli=cards.find(c=>c.numero===191);
assert.equal(martinelli.id,'105850811319718');
assert.equal(martinelli.max_level,26);
assert.equal(martinelli.pp,50);
assert.equal(A.state(martinelli,null),'registrado');
const unknown=cards.find(c=>!Number.isInteger(c.max_level));
assert(unknown);
const candidate=Math.min(120,Math.floor(unknown.pp/2)+1);
const proof={
 schema:A.SCHEMA,numero:unknown.numero,card_id:String(unknown.id),name:unknown.name,edition:unknown.versao,
 level:candidate,pp:A.budget(candidate),confirmed_in_game:true,
 source:'conferência manual no eFootball',confirmed_at:'2026-10-19T00:00:00.000Z'
};
assert(A.validate(unknown,proof));
assert.equal(A.validate({...unknown,versao:'Nova edição com o mesmo CAP e ID'},proof),null,
 'Alterar edição mantendo CAP, Card ID e nome invalida a prova');
assert.equal(A.validate(unknown,{...proof,edition:undefined}),null,
 'Comprovante legado V248 sem edição permanece armazenado mas não válido');
assert.equal(A.validate({...unknown,id:'outra-edicao'},proof),null);
assert.equal(A.validate(unknown,{...proof,numero:191}),null);
assert.equal(A.validate(unknown,{...proof,pp:999}),null);
assert.equal(A.validate(unknown,{...proof,confirmed_in_game:false}),null);
const get=()=>A.readSaved(unknown,storage);
storage.setItem(A.key(unknown),JSON.stringify(proof));
assert.deepEqual(get(),proof);
if(proof.pp!==unknown.pp){
 assert.equal(A.state(unknown,get()),'divergente','PP com diferença deve pedir revisão, não ser aprovado');
}else{
 assert.equal(A.state(unknown,get()),'confirmado_localmente');
}
const different={...proof,level:candidate===120?119:candidate+1,
 pp:A.budget(candidate===120?119:candidate+1)};
storage.setItem(A.key(unknown),JSON.stringify(different));
assert.equal(A.state(unknown,get()),'divergente');
assert.equal(A.summary(cards,storage).divergente,1);
storage.setItem(A.key(unknown),JSON.stringify({...different,card_id:'fake'}));
assert.equal(get(),null,'Registros de outra edição não podem contaminar carta da conta');
assert.equal(A.summary(cards,storage).pendente,161);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),before,'Nenhuma fonte original modificada');
const index=read('web/index.html'),html=read('web/conferir-progresso-v248.html');
const script=read('web/craque-progresso-v248.js');
const css=read('web/craque-progresso-v248.css');
for(const entry of ['conferir-progresso-v248.html','craque-progresso-v248.js','craque-progresso-v248.css']){
 assert(read('web/sw.js').includes("'./"+entry+"'"),'Faltou no cache offline: '+entry);
 assert(read('scripts/stamp-bundle-v189.cjs').includes("'"+entry+"'"),'Faltou no bundle Android/Windows: '+entry);
}
assert(index.includes('href="conferir-progresso-v248.html"'),'Acesso ao painel deve existir no catálogo');
assert(html.includes('data-page="progress-audit"'));
assert(html.includes('id="v248-export"')&&html.includes('id="v248-filter"'));
assert(css.includes('@media(max-width:680px)'));
assert(script.includes('confirmed_in_game:true')&&script.includes("readSaved(c,storage())"));
assert(!script.includes('SCOUT_V69_AUDITORIA.json\',\'w'),'Não alterar o catálogo');
const theme=read('web/craque-visual-system-v234.css');
assert(theme.includes('V248 — Cabeçalho Windows sem sobreposição'));
assert(theme.includes('@media (min-width:960px)'));
assert(theme.includes('grid-template-columns:minmax(0,60%) minmax(0,40%)!important'));
assert(theme.includes('overflow:hidden!important'));
assert(theme.includes('@media (min-width:721px) and (max-width:959px)'));
assert(read('scripts/qa-visual-v195.py').includes('"windows_1151"'));
assert(read('web/sw.js').includes('v248-hero-windows-pp-review'));
console.log('V248 OK: 246 cartas, 85 níveis documentados, 161 pendentes, registros por edição, divergências e exportação offline.');
console.log('V248 WINDOWS OK: coluna separada para as artes e QA visual dedicado a 1024/1151px.');
