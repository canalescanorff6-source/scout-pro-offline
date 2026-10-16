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
const body=JSON.parse(fs.readFileSync('web/SCOUT_V101_MODELO_CORPORAL.json','utf8'));
assert.strictEqual(r.cards.filter(x=>x.biotipo).length,body.cartas.length);
for(const b of body.cartas){
 const card=r.cards.find(x=>x.numero===b.numero);
 assert(card&&card.biotipo);
 assert.strictEqual(card.card_id,String(b.card_id));
 assert.strictEqual(card.biotipo.altura_cm,b.altura_cm);
}
const hub=JSON.parse(fs.readFileSync('web/SCOUT_V184_EFHUB_241_COMPLETE.json','utf8'));
const unique=hub.image_manifest.filter(x=>x.scout_roster_matching?.status==='unambiguous_name_only_no_id');
assert.strictEqual(r.cards.filter(x=>x.print_candidato).length,unique.length);
for(const x of unique){
 const card=r.cards.find(c=>c.numero===x.scout_roster_matching.candidate_cap);
 assert(card&&card.print_candidato);
 assert.strictEqual(card.print_candidato.arquivo,x.filename);
 assert.strictEqual(card.print_candidato.status,'NOME_COMPATIVEL_EDICAO_NAO_CONFIRMADA');
}
console.log('PASS: 246 cartas, Card IDs, PP, treinos preservados; 56 duplicações sinalizadas.');
