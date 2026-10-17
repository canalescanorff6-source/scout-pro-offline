'use strict';
/* V215: verificar nativas x adicionais via a MESMA tabela oficial de aliases do recomendador. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const E=require('../web/scout-evidence-v215.js');
const R=require('../web/skills-booster-v162.js');
const originals=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
const audit=JSON.parse(read('web/SCOUT_V213_AUDITORIA_INDIVIDUAL.json')).cards;
const snapshot=originals.map(c=>({n:c.numero,id:c.id,pp:c.pp,levels:c.niveis,skills:c.habilidades_nativas,candidates:c.adicionais_candidatas}));
const rows=E.auditRoster(originals,audit,R.keyFor,R.evaluate);
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
for(const entry of rows){
 const source=originals.find(c=>Number(c.numero)===entry.numero);
 assert.equal(entry.plan.updateApplied,false,'Nenhuma edição automática '+entry.numero);
 assert.equal(entry.plan.allHistoric.length,entry.plan.kept.length+entry.plan.clashes.length+entry.plan.repeated.length,'Toda candidata antiga contabilizada '+entry.numero);
 const native=new Set(String(source.habilidades_nativas||'').split(';').map(R.keyFor).filter(Boolean));
 const kept=new Set(entry.plan.kept.map(R.keyFor).filter(Boolean));
 const alternatives=entry.plan.replacements;
 assert.equal(new Set(alternatives.map(a=>a.key)).size,alternatives.length,'Sem repetição interna '+entry.numero);
 assert(alternatives.length<=entry.plan.clashes.length,'Não sugerir substituições além do necessário '+entry.numero);
 if(entry.clashes.length){
  assert(alternatives.length>0,'Ao menos uma alternativa de Posse para carta sinalizada '+entry.numero);
  assert.equal(entry.plan.kept.length+alternatives.length,entry.plan.allHistoric.length,'Completar cinco candidatas sem duplicação '+entry.numero);
 }else assert.equal(alternatives.length,0,'Não substituir sem diagnóstico de duplicação '+entry.numero);
 for(const suggestion of alternatives){
  assert(!native.has(suggestion.key)&&!kept.has(suggestion.key),'Nunca recomendar skill já nativa ou mantida '+entry.numero);
  assert.equal(suggestion.key,R.keyFor(suggestion.name),'Alias oficial '+entry.numero);
  assert.equal(suggestion.approval,'HIPÓTESE — não validada na edição');
 }
}
const massaro=originals.find(c=>c.numero===1),massaroEvidence=audit.find(c=>c.numero===1);
const suggestion=rows.find(x=>x.numero===1).plan.replacements[0].name;
const withManual=E.reviewCard(massaro,massaroEvidence,R.keyFor,new Map(),R.evaluate,suggestion);
assert(withManual.plan.replacements.length>0,'Manter alternativa sem usar habilidade já equipada');
assert(!withManual.plan.replacements.some(x=>x.name===suggestion),'Não sugerir habilidade informada como equipada');
const filled='Passe de primeira; Passe em profundidade; Toque duplo; Controle com a sola; Toque de calcanhar';
const fullPlan=E.reviewCard(massaro,massaroEvidence,R.keyFor,new Map(),R.evaluate,filled).plan;
assert.equal(fullPlan.manualCount,5,'Cinco skills distintas informadas');
assert.equal(fullPlan.unreportedSlots,0,'Não apresentar vagas teóricas extras');
assert.equal(fullPlan.replacements.length,0,'Não sugerir sexta habilidade quando cinco foram informadas');
const aliasPlan=E.reviewCard(massaro,massaroEvidence,R.keyFor,new Map(),R.evaluate,
 'One-touch Pass; Passe de primeira; Cabeceio').plan;
assert.equal(aliasPlan.manualCount,1,'Aliases são uma única habilidade; nativa não ocupa slot adicional');
assert(aliasPlan.nativeManualConflicts.includes('Cabeceio'),'Exibir conflito entre nativa e adicional manual');


assert.deepEqual(numbers,[1,12,19,25,26,27,28,29,30,31,32,33,35,36,38,39,40,45,48,110,203]);
const card=n=>rows.find(x=>x.numero===n);
assert.equal(card(1).clashes[0].additional,'Cabeceio');
assert.equal(card(1).clashes[0].native,'Heading');
assert.equal(card(40).clashes[0].native,'Heading');
assert.equal(card(203).clashes[0].native,'Toque de calcanhar');
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
assert(sw.includes('v215-skill-evidence-v216-candidates-v217-live-context'),'Cache V217 renovado para usuários Android/Windows');
assert(src.includes('SCOUT PRO · Verificação individual V217'),'Título V217 apresentado na ficha');
assert(src.includes('scoutpro:skills-updated'),'Painel precisa reagir ao salvamento sem recarregar');
assert(read('web/skills-booster-v162.js').includes("new CustomEvent('scoutpro:skills-updated'"),'Salvar deve notificar laudo V217');
assert(stamp.includes("'sw.js'"),'Atualização de cache no fingerprint');
console.log('V216 PASS: 246 cartas, 21 listas candidatas revisadas com alternativas de Posse, 56 cartas repetidas, builds originais intactas.');
