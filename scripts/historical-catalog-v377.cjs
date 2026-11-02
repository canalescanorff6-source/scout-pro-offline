'use strict';
// Somente auditorias de snapshots imutáveis anteriores à correção V377.
// Não é carregado pelo app e não regrava catálogo, HTML nem armazenamento.
const assert=require('node:assert/strict');
const corrections=require('../web/ct377-identity-corrections.json').cards;
const levels=require('../web/ct381-level-corrections.json');
function restoreFields(value,change){
 if(!change)return value;const old=structuredClone(value);
 if(change.fields.every(k=>JSON.stringify(value[k])===JSON.stringify(change.before[k])))return old;
 for(const key of change.fields){assert.deepEqual(value[key],change.after[key],'Campo atual diverge da revisão autorizada: '+key);
  if(Object.hasOwn(change.before,key))old[key]=structuredClone(change.before[key]);else delete old[key];}
 return old;
}
function historicalCards(cards){
 return cards.map(c=>{
  c=restoreFields(c,levels.originals.find(x=>x.capture===c.numero));
  const correction=corrections.find(x=>x.capture===c.numero);if(!correction)return c;
  assert.deepEqual(c,correction.afterCanonical,'Snapshot atual diverge da correção autorizada');
  return structuredClone(correction.beforeCanonical);
 });
}
function historicalRoster(roster){return {...roster,summary:structuredClone(levels.beforeSummary),cards:historicalCards(roster.cards)}}
function historicalRaw(raw){
 raw=restoreFields(raw,levels.originals.find(x=>x.capture===raw.capture)?.raw);
 const correction=corrections.find(x=>x.capture===raw.capture);if(!correction)return raw;
 assert.equal(raw.id,correction.afterCanonical.id);assert.equal(raw.edition,correction.afterCanonical.versao);
 return structuredClone(correction.beforeRaw);
}
module.exports={historicalCards,historicalRoster,historicalRaw};
