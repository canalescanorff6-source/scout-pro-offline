'use strict';
const fs=require('fs'),assert=require('assert');
const a=JSON.parse(fs.readFileSync('web/SCOUT_V69_AUDITORIA.json','utf8'));
const r=JSON.parse(fs.readFileSync('web/SCOUT_V213_AUDITORIA_INDIVIDUAL.json','utf8'));
assert.strictEqual(a.cards.length,246);
assert.strictEqual(r.cards.length,246);
assert.strictEqual(new Set(r.cards.map(x=>x.numero)).size,246);
for(let i=0;i<246;i++){
 const old=a.cards[i],now=r.cards[i];
 assert.strictEqual(now.numero,old.numero);
 assert.strictEqual(now.card_id,String(old.id));
 assert.strictEqual(now.pp,old.pp);
 assert.deepStrictEqual(now.treino_registrado,old.niveis);
 assert.strictEqual(now.status,'AUDITORIA PENDENTE — não alterar treino automaticamente');
}
assert.strictEqual(r.cards.filter(x=>x.repeticao).length,56);
console.log('PASS: 246 cartas, Card IDs, PP, treinos preservados; 56 duplicações sinalizadas.');
