'use strict';
/* V215: verificar nativas x adicionais via a MESMA tabela oficial de aliases do recomendador. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const E=require('../web/scout-evidence-v215.js');
const R=require('../web/skills-booster-v162.js');
const originals=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
const audit=JSON.parse(read('web/SCOUT_V213_AUDITORIA_INDIVIDUAL.json')).cards;
const snapshot=originals.map(c=>({n:c.numero,id:c.id,pp:c.pp,levels:c.niveis,skills:c.habilidades_nativas,candidates:c.adicionais_candidatas}));
const rows=E.auditRoster(originals,audit,R.keyFor);
assert.equal(originals.length,246);
assert.equal(audit.length,246);
assert.equal(rows.length,246);
assert(rows.every(r=>r.valid),'Exigir correspondência exata de número e Card ID');
assert.equal(new Set(rows.map(r=>r.numero)).size,246);
for(const row of rows){
 const original=originals.find(c=>c.numero===row.numero);
 assert.equal(row.cardId,String(original.id),'O vínculo não pode trocar edições');
 assert.equal(row.pp,original.pp);
 assert.equal(row.approvedBuildPreserved,true);
 assert.equal(row.baseAttributesNumericallyCompared,false,'Não inventar atributos finais');
 for(const match of row.clashes){
  assert((original.adicionais_candidatas||[]).includes(match.additional),'Sugestão deve existir no cadastro');
  assert(String(original.habilidades_nativas).split(';').map(s=>s.trim()).includes(match.native),'Nativa deve estar registrada');
  assert.equal(R.keyFor(match.additional),R.keyFor(match.native),'PT-BR/EN devem ser sinônimos validados');
 }
}
const affected=rows.filter(x=>x.clashes.length);
const numbers=affected.map(x=>x.numero);
assert.equal(affected.length,21,'21 cartas com sugestão duplicada entre nativas cadastradas');
assert.deepEqual(numbers,[1,12,19,25,26,27,28,29,30,31,32,33,35,36,38,39,40,45,48,110,203]);
const card=n=>rows.find(x=>x.numero===n);
assert.equal(card(1).clashes[0].additional,'Cabeceio');
assert.equal(card(1).clashes[0].native,'Heading');
assert.equal(card(40).clashes[0].native,'Heading');
assert.equal(card(203).clashes[0].native,'Heel Trick');
assert.equal(card(203).clashes[0].additional,'Passe de calcanhar');
assert.equal(rows.filter(x=>x.printMatches.length).length,3,'Avisos dos prints não devem virar habilidades da edição');
assert.equal(rows.filter(x=>x.print).length,185);
assert.equal(rows.filter(x=>x.biotype).length,15);
assert.equal(rows.filter(x=>x.peers.length).length,56);
assert.equal(card(40).approvedBuildPreserved,true,'Yorke não pode perder ficha aprovada');
assert.equal(E.reviewCard(originals[0],{...audit[0],card_id:'999'},R.keyFor).valid,false,'Bloquear Card ID de outra edição');
assert.deepEqual(originals.map(c=>({n:c.numero,id:c.id,pp:c.pp,levels:c.niveis,skills:c.habilidades_nativas,candidates:c.adicionais_candidatas})),snapshot,'Auditoria é somente leitura');
const src=read('web/scout-evidence-v215.js'),css=read('web/scout-evidence-v215.css');
const bridge=read('web/app-bridge.js'),sw=read('web/sw.js'),stamp=read('scripts/stamp-bundle-v189.cjs');
for(const f of ['scout-evidence-v215.js','scout-evidence-v215.css']){
 assert(bridge.includes("v189Root+'"+f+"'"),'Mostrar V215 em cada ficha Android/Windows '+f);
 assert(sw.includes("'./"+f+"'"),'Disponibilidade offline '+f);
 assert(stamp.includes("'"+f+"'"),'Integridade de bundle '+f);
}
assert(src.includes('scoutpro:recommendations-ready'),'Usar mapeamento central EN/PT-BR após carregamento');
assert(src.includes('String(identity.id)!==String(source.id)'),'Não misturar edição da página e do índice');
assert(src.includes('print não mostra Card ID verificável')||src.includes('O print não mostra Card ID verificável'));
assert(!src.includes('localStorage.setItem')&&!src.includes('updateBuild('),'Nunca sobrescrever treino');
assert(css.includes('min-height:48px')&&css.includes('@media(max-width:480px)'),'Painel responsivo e alvos de toque');
assert(sw.includes('v215-skill-evidence'),'Cache novo para instalação');
assert(stamp.includes("'sw.js'"),'Atualização de cache no fingerprint');
console.log('V215 PASS: 246 cartas, 21 alertas canônicos EN/PT-BR, 3 avisos de prints não verificados, 56 pares em grupos repetidos, zero fichas alteradas.');
