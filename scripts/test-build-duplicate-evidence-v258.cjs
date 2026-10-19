'use strict';
/* V258 — auditoria de repetição por edição exata e diferenças documentais.
 * Sem sobrescrever builds, editar cartas ou fingir prova de gameplay. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const raw=read('web/SCOUT_V69_AUDITORIA.json');
const cards=JSON.parse(raw).cards;
const E=require('../web/craque-ficha-individual-v251.js');
const T=require('../web/scout-multitactic-engine-v220.js');
assert.equal(cards.length,246);
assert.equal(new Set(cards.map(c=>c.numero+'@'+c.id)).size,246);
const untouched=JSON.stringify(cards);
const summary=E.catalogAudit(cards);
assert.equal(summary.total,246);
assert.equal(summary.duplicateGroups,20);
assert.equal(summary.duplicatedCards,56);
assert.equal(summary.confirmedBuildsByGameplay,0);
const duplicated=new Set();
for(const card of cards){
 const peers=E.related(card,cards),before=JSON.stringify(card);
 assert(peers.every(p=>p.numero!==card.numero));
 for(const peer of peers){
  assert.equal(E.signature(card),E.signature(cards.find(c=>c.numero===peer.numero)));
  assert.equal(peer.id,String(cards.find(c=>c.numero===peer.numero).id));
  assert.equal(peer.edition,String(cards.find(c=>c.numero===peer.numero).versao||''));
  assert.equal(typeof peer.differentDefenceStyle,'boolean');
  assert.equal(typeof peer.differentSkills,'boolean');
  assert.equal(typeof peer.differentBooster,'boolean');
  assert.equal(typeof peer.missingLevelEvidence,'boolean');
  assert.equal(typeof peer.baseEvidencePending,'boolean');
  duplicated.add(card.numero);duplicated.add(peer.numero);
 }
 assert.equal(JSON.stringify(card),before,'Comparação não modifica carta');
}
assert.equal(duplicated.size,56);
const yorke=cards.find(c=>c.numero===40);
assert(yorke);
const yr=E.related(yorke,cards);
assert.deepEqual(yr.map(c=>c.numero).sort((a,b)=>a-b),[43,182]);
assert(yr.every(p=>p.id&&p.edition),'Mostrar edição e Card ID para o grupo do Yorke');
const huijsen=cards.find(c=>c.numero===144);
const defenders=E.related(huijsen,cards);
assert.equal(defenders.length,8,'Listar todas as nove fichas idênticas do grupo');
assert(defenders.some(p=>p.numero===149),'Van Hecke permanece identificado');
assert(defenders.some(p=>p.numero===150),'Konaté permanece identificado');
assert(defenders.some(p=>p.differentSkills),'Há habilidades diferentes no grupo');
const vanHecke=cards.find(c=>c.numero===149);
const contrived={...vanHecke,numero:999,id:'TEST-ONLY-999',versao:'Somente cenário artificial',
 estilo_defesa:vanHecke.estilo_defesa==='Destruidor'?'Básico':'Destruidor'};
const example=E.related(vanHecke,[vanHecke,contrived]);
assert.equal(example.length,1,'Fixture compara uma versão controlada');
assert.equal(example[0].differentDefenceStyle,true);
assert.equal(example[0].edition,'Somente cenário artificial');
assert.equal(T.total(yorke.niveis),yorke.pp,'Custo do treino original do Yorke permanece');
const source=read('web/craque-ficha-individual-v251.js');
assert(source.includes("ct258-duplicate-details"));
assert(source.includes("for(const peer of check.related)"),'Sem ocultar colegas depois de cinco resultados');
assert(source.includes("' · Card ID '+peer.id"),'Comparar Card ID de cada edição');
assert(source.includes("differences.push('função defensiva diferente')"));
assert(source.includes("differences.push('atributos-base ainda pendentes')"));
assert(!/\.setItem\(/.test(source),'Motor consultivo não grava alterações na conta');
assert(read('web/sw.js').includes('v258-duplicate-evidence'));
assert(read('package.json').includes('test-build-duplicate-evidence-v258.cjs'));
assert.equal(JSON.stringify(cards),untouched);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),raw);
console.log('V258 PASS: 246 identidades preservadas; 20 grupos e 56 cartas repetidas; Yorke e zagueiros auditados com Card ID/edição, zero builds alteradas.');
