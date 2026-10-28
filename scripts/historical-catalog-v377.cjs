'use strict';
// Somente auditorias de snapshots imutáveis anteriores à correção V377.
// Não é carregado pelo app e não regrava catálogo, HTML nem armazenamento.
const assert=require('node:assert/strict');
const corrections=require('../web/ct377-identity-corrections.json').cards;
function historicalCards(cards){
 return cards.map(c=>{
  const correction=corrections.find(x=>x.capture===c.numero);if(!correction)return c;
  assert.deepEqual(c,correction.afterCanonical,'Snapshot atual diverge da correção autorizada');
  return structuredClone(correction.beforeCanonical);
 });
}
function historicalRoster(roster){return {...roster,cards:historicalCards(roster.cards)}}
function historicalRaw(raw){
 const correction=corrections.find(x=>x.capture===raw.capture);if(!correction)return raw;
 assert.equal(raw.id,correction.afterCanonical.id);assert.equal(raw.edition,correction.afterCanonical.versao);
 return structuredClone(correction.beforeRaw);
}
module.exports={historicalCards,historicalRoster,historicalRaw};
