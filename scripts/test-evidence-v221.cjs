'use strict';
/* Scout PRO V221 — validação determinística de fonte + vínculo exato das 246 fichas. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),base=path.join(root,'web');
const load=(file)=>{const value=JSON.parse(fs.readFileSync(path.join(base,file),'utf8'));return file==='SCOUT_V69_AUDITORIA.json'?require('./historical-catalog-v377.cjs').historicalRoster(value):value;};
const roster=load('SCOUT_V69_AUDITORIA.json').cards;
const audit=load('SCOUT_V213_AUDITORIA_INDIVIDUAL.json');
const data=load('SCOUT_V221_EVIDENCE_INDEX.json');
const repetitions=load('SCOUT_V211_REPETICOES_REVIEW.json');
const gate=require('../web/scout-evidence-review-v221.js');
const generator=require('./build-card-evidence-v221.cjs');
generator.run=generator.run; // Manter API exportada disponível.
assert.deepEqual(generator.createIndex({cards:roster},audit,repetitions),data,'Índice deve ser reproduzível a partir das fontes imutáveis');
assert.equal(data.resumo.total,246);
assert.equal(data.resumo.registrados,162);
assert.equal(data.resumo.pendentes,84);
assert.equal(data.resumo.repetidos,56);
assert.equal(data.resumo.base_confirmada,14);
assert.equal(data.resumo.nativas_pendentes,3);
assert.equal(data.resumo.ids_pendentes,22);
assert.equal(data.resumo.ids_compartilhados,4);
assert.equal(data.resumo.prints_candidatos,185);
assert.equal(data.resumo.com_biotipo,15);
assert.equal(new Set(data.cards.map(x=>x.numero)).size,246,'Todas as capturas distintas');
assert.equal(new Set(data.cards.map(x=>x.numero+':'+x.card_id)).size,246,'Identidade composta única');
const original=JSON.stringify(roster);
let checked=0,blocked=0,duplicate=0,unexpected=false;
for(const r of roster){
 const no=r.numero;
 const file=path.resolve(base,r.arquivo);
 assert(file.startsWith(base+path.sep)&&fs.existsSync(file),'Arquivo original preservado #'+no);
 const html=fs.readFileSync(file,'utf8');
 const match=html.match(/<script\b[^>]*\bid="scout-v68-data"[^>]*>([\s\S]*?)<\/script>/);
 assert(match,'Contexto individual presente #'+no);
 const c=require('./historical-catalog-v377.cjs').historicalRaw(JSON.parse(match[1]));
 assert.equal(c.capture,no,'Número da captura vinculada #'+no);
 assert.equal(String(c.id),String(r.id),'Card ID preservado #'+no);
 assert.equal(Number(c.pp),Number(r.pp),'PP preservado #'+no);
 const state=gate.validate(data,c);
 assert(state.ok,'Índice deve corresponder à edição/número/ID/PP #'+no+': '+state.error);
 assert.equal(state.record.numero,no);
 assert.equal(state.record.card_id,String(r.id));
 assert.equal(state.record.pp,Number(r.pp));
 assert.equal(state.matchedOn,'numero + Card ID + PP');
 assert.equal(state.registered,Array.isArray(r.niveis),'Registro não é homologação #'+no);
 assert(!state.issues.some(i=>/homologado e comprovado|validado em partidas/i.test(i.why)), 'Nenhuma alegação falsa de desempenho');
 if(!state.registered){
  blocked++;
  assert.equal(state.stage,'PENDENTE','Proposta nunca recebe selo de build aprovada');
  assert(state.issues.some(i=>i.code==='treino'),'Bloqueio textual de treino ausente');
 }
 if(state.peers.length)duplicate++;
 if(state.record.print_candidato)assert.equal(state.record.print_edicao_confirmada,false,'Print não confirma Card ID');
 if(state.record.id_status==='sem_card_id')assert(state.issues.some(i=>i.code==='id'),'ID desconhecido deve travar associação');
 if(state.record.id_status==='card_id_compartilhado')assert(state.issues.some(i=>i.code==='id_partilhado'),'ID duplicado deve aparecer');
 assert.equal(gate.storageKey({capture:c.capture,id:c.id}),'scoutpro:v221:evidence:'+no+':'+c.id);
 checked++;
}
assert.equal(blocked,84);
assert.equal(duplicate,56);
const massaro=data.cards.find(x=>x.numero===1),messi=data.cards.find(x=>x.numero===50),
      savinhoA=data.cards.find(x=>x.numero===61),savinhoB=data.cards.find(x=>x.numero===196),
      huijsenA=data.cards.find(x=>x.numero===144),huijsenB=data.cards.find(x=>x.numero===153);
assert(massaro.pares_repetidos.includes(32),'Massaro/Batistuta continuam só para comparação');
assert.equal(messi.treino,'treino_sem_validacao');
assert.equal(messi.id_status,'sem_card_id');
assert.equal(messi.nativas_documentadas,0);
assert.equal(savinhoA.id_status,'card_id_compartilhado');
assert.equal(huijsenB.id_status,'card_id_compartilhado');
assert.equal(savinhoA.card_id,savinhoB.card_id);
assert.equal(huijsenA.card_id,huijsenB.card_id);
assert.notEqual(gate.storageKey({capture:144,id:huijsenA.card_id}),gate.storageKey({capture:153,id:huijsenB.card_id}),
 'Fichas com Card ID igual não podem misturar notas');
const wrong=gate.validate(data,{capture:50,id:'inventado',pp:56});
assert.equal(wrong.ok,false);
const wrongPP=gate.validate(data,{capture:1,id:massaro.card_id,pp:999});
assert.equal(wrongPP.ok,false);
const missing=gate.validate({resumo:{total:10},cards:[]},{capture:1,id:massaro.card_id,pp:62});
assert.equal(missing.ok,false);
assert.equal(JSON.stringify(roster),original,'V221 não altera uma única carta');
for(const file of ['scout-evidence-review-v221.js','scout-evidence-review-v221.css','SCOUT_V221_EVIDENCE_INDEX.json']){
 for(const target of ['web/sw.js','scripts/stamp-bundle-v189.cjs']){
  assert(fs.readFileSync(path.join(root,target),'utf8').includes("'"+(target.startsWith('web/')?'./':'')+file+"'"),target+' inclui '+file);
 }
}
for(const file of ['scout-evidence-review-v221.js','scout-evidence-review-v221.css']){
 assert(fs.readFileSync(path.join(base,'app-bridge.js'),'utf8').includes("'"+file+"'"),'UI comum inclui '+file);
}
assert(fs.readFileSync(path.join(root,'scripts/stamp-bundle-v189.cjs'),'utf8').includes("'SCOUT_V221_EVIDENCE_INDEX.json'"));
assert.equal(gate.VALUES.length,4);
assert(gate.STEP_NAMES.gameplay.includes('Testei'));
console.log('V221 PASS: '+checked+' cartas individuais; '+blocked+' treinos pendentes; '+duplicate+' repetições; 22 IDs ausentes, 4 entradas compartilhadas, 0 vínculos inventados.');
