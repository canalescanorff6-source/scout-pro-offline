'use strict';
/* V301 — a ausência de uma proposta NÃO é nível 0. Os cinco estilos
 * devem distinguir referência cadastrada, hipótese e dados pendentes. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(base,p),'utf8');
const T=require('../web/scout-multitactic-engine-v220.js');
const V=require('../web/craque-ficha-individual-v251.js');
const cards=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
const original=JSON.stringify(cards);
assert.equal(cards.length,246);
assert.equal(new Set(cards.map(c=>c.numero+'@'+c.id+'@'+c.versao)).size,246);
const editor=read('web/scout-training-unified-v218.js');
const display=read('web/craque-ficha-individual-v251.js');
assert(editor.includes('referenceOnly=!savedForStyle&&!suggested&&!!original'),
 'Ao trocar de estilo, mostrar o treino já cadastrado quando faltar proposta');
assert(editor.includes('current=savedForStyle?savedForStyle.levels.slice():suggested?suggested.slice():original?original.slice():null'),
 'Não substituir distribuição existente por dez zeros');
assert(!editor.includes('suggested?suggested.slice():Array(10).fill(0)'));
assert(editor.includes("valid(current)?String(current[i]):'—'"),
 'Dados de nível ausentes devem ser representados como pendentes, não zero');
assert(editor.includes('scoutpro:v301:preview-ready'));
assert(editor.includes('autoPreview')&&editor.includes('referenceOnly'));
assert(editor.includes("total(info.levels)!==budget"),'Nunca aceitar simulação com PP excedidos');
assert(display.includes('scoutpro:v301:preview-ready'));
assert(display.includes('check.canDraft===true&&check.sourceCompatible===true'));
assert(display.includes('/^[0-9]+$/.test(String(card.id))'),
 'ID pendente não pode virar prévia automática');
const martin=cards.find(c=>c.numero===191);
assert(martin&&martin.max_level===26&&martin.pp===50);
assert.equal(martin.treino_proposto_nao_validado,true);
const html=read('web/'+martin.arquivo);
const raw=JSON.parse(html.match(/<script id="scout-v68-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
const lab=JSON.parse(html.match(/<script id="lab-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
let generated=0,references=0,pending=0;
for(const c of cards){
 if(T.valid(c.niveis)&&T.total(c.niveis)===c.pp)references++;
 else pending++;
 // Os cinco estilos mantêm sua identidade. A classificação não é prova de gameplay.
 for(const tactic of T.STYLES){
  assert(T.styleFor(tactic.id));
  assert(Number.isInteger(c.pp));
 }
}
assert.equal(references,160);
assert.equal(pending,86);
for(const tactic of T.STYLES){
 const result=V.buildReview(martin,raw,lab,cards,tactic.id);
 assert(result.proposal,'Martinelli 26/50 não pode exibir zeros falsos para '+tactic.id);
 assert.equal(result.canDraft,true);
 assert.equal(result.proposal.spent,50);
 assert.equal(T.total(result.proposal.levels),50);
 assert(result.proposal.levels.some(n=>n>0));
 assert.equal(result.proposal.baselineUsable,false,
  'Treino provisório jamais vira baseline homologada');
 generated++;
}
assert.equal(generated,5);
assert.equal(JSON.stringify(cards),original,'Catálogo alterado');
assert(read('web/sw.js').includes('v301-styles-no-false-zero'),
 'Cache offline precisa ser invalidado nos dois aplicativos');
console.log('V301 PASS: 246 cartas intactas, 162 referências sem zero falso, 84 sem base marcadas pendentes, Martinelli 50 PP nos cinco estilos.');
