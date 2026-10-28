'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const dir=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(dir,p),'utf8');
const cards=require('./historical-catalog-v377.cjs').historicalRoster(JSON.parse(read('web/SCOUT_V69_AUDITORIA.json'))).cards;
const evidence=JSON.parse(read('web/SCOUT_V211_REPETICOES_REVIEW.json'));
const audit=require('../web/scout-build-audit-v211.js');
const display=require('../web/scout-training-reference-v208.js');
assert.equal(cards.length,246);
const result=audit.audit(cards);
assert.equal(result.registered,162);assert.equal(result.pending,84);
assert.equal(result.groups.length,20,'20 grupos de distribuição repetida');
assert.equal(result.duplicatedCards,56,'Normalização legítima AC/CA e ZC/ZG');
assert.equal(result.priorityGroups,20);
assert.equal(evidence.total_cards,246);assert.equal(evidence.validated_replacements,0);
assert.equal(evidence.duplicated_cards,result.duplicatedCards);
assert.deepEqual(evidence.groups.map(g=>g.ids),result.groups.map(g=>g.ids),'Relatório estático sincronizado');
assert.deepEqual(evidence.groups.map(g=>g.divergentPairs),result.groups.map(g=>g.divergentPairs));
const massaro=cards.find(c=>c.numero===1),batistuta=cards.find(c=>c.numero===32);
assert(audit.cardReview(result,1).ids.includes(32));
for(const n of [99,102,216])assert(audit.cardReview(result,95).ids.includes(n));
assert.equal(audit.cardReview(result,12),null);
assert(audit.compare(massaro,batistuta).distinctSkills);
assert(audit.compare(massaro,batistuta).distinctBoost);
assert(audit.compare(massaro,batistuta).basis.includes('atributos-base'));
const unknown=audit.compare({habilidades_nativas:'',impeto_fixo:'PENDENTE'}, {habilidades_nativas:'',impeto_fixo:'NENHUM FIXO CONFIRMADO'});
assert(unknown.missingEvidence&&!unknown.needsReview);
assert.equal(audit.confirmedBooster('SLOT SELECIONÁVEL +1 — escolha da conta não confirmada'),null);
assert.equal(audit.confirmedBooster('Saving +3'),'saving +3');
for(const c of cards){
 const levels=c.niveis;
 if(!Array.isArray(levels)){assert.equal(audit.signature(c),null);continue}
 const st=display.resolveTraining({recommended_levels:levels,pp:c.pp,recommended_scenario:c.recomendacao},{});
 assert.equal(st.spent,c.pp,'PP da carta '+c.numero);
 assert.equal(st.levels.join(','),levels.join(','),'Nenhum nível recalculado '+c.numero);
}
const css=read('web/scout-theme-v210.css');
for(const x of ['.scout-v208-icon','.scout-v208-svg','.scout-v208-table tfoot','.scout-v207-identity','#lab-controls','#scout-v211-audit']){
 assert(css.includes(x),'CSS uniforme '+x);
}
assert(css.includes('var(--accent,#35e4b9)')&&css.includes('var(--gold,#e9be71)'));
const js=read('web/scout-build-audit-v211.js');
assert(!js.includes('localStorage.setItem')&&!js.includes('updateBuild('));
for(const file of ['scout-theme-v210.css','scout-build-audit-v211.js','SCOUT_V211_REPETICOES_REVIEW.json']){
 assert(read('web/sw.js').includes("'./"+file+"'"),'Cache offline '+file);
 assert(read('scripts/stamp-bundle-v189.cjs').includes("'"+file+"'"),'Fingerprint '+file);
}
assert(read('web/app-bridge.js').includes("v189Root+'scout-theme-v210.css'"));
assert(read('web/app-bridge.js').includes("v189Root+'scout-build-audit-v211.js'"));
assert(read('web/sw.js').includes('v211-build-review'));
assert.equal(fs.readdirSync(path.join(dir,'web/fichas')).filter(x=>x.endsWith('.html')).length,246);
assert.equal((read('web/index.html').match(/class="player-card"/g)||[]).length,246);
console.log('V210/V211 OK: paleta do projeto, '+result.groups.length+' grupos, '+result.duplicatedCards+' cartas repetidas, nenhuma build modificada.');
