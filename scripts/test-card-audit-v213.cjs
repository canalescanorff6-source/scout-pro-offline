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

const collisions=r.cards.filter(c=>c.habilidades_adicionais_auditoria.coincidencias_com_print.length);
assert.deepStrictEqual(collisions.map(c=>c.numero),[4,69,101]);
for(const c of r.cards){assert.strictEqual(c.habilidades_adicionais_auditoria.print_edicao_confirmada,false);}
const focus=[1,33,40,43,182];
assert.deepStrictEqual(r.estudo_atacantes_posse,focus);
for(const n of focus){const c=r.cards.find(x=>x.numero===n);assert(c.estudo_atacante_posse);assert.strictEqual(c.estudo_atacante_posse.treino_atual_preservado,true);}
assert(r.cards.find(x=>x.numero===40).estudo_atacante_posse.nota.includes('aprovada'));
assert.strictEqual(r.cards.filter(c=>c.comparacao_grupo_repetido).length,56);
assert.strictEqual(r.grupos_repetidos_impetos_fixos_distintos,17);
for(const c of r.cards.filter(c=>c.comparacao_grupo_repetido)){
 assert.strictEqual(c.comparacao_grupo_repetido.substituicao_automatica,false);
 assert(c.comparacao_grupo_repetido.colegas.length>0);
}
console.log('PASS: 246 cartas, Card IDs, PP, treinos preservados; 56 duplicações sinalizadas.');
