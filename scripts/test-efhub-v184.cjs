// Fixture histórica anterior à correção autorizada V381; dados atuais são verificados no teste de integração V381.
const {historicalRead}=require('./historical-level-fixtures-v381.cjs');
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const web=path.resolve(__dirname,'../web');
const read=f=>JSON.parse(historicalRead(path.join(web,f),'utf8'));
const v=read('SCOUT_V184_EFHUB_SCREENSHOT_EVIDENCE.json');
const complete=read('SCOUT_V184_EFHUB_241_COMPLETE.json');
const roster=read('SCOUT_V69_AUDITORIA.json');
const tactical=read('SCOUT_V98_AUDITORIA_TATICA.json');
const older=read('SCOUT_V182_SKILLS_BOOSTERS_EVIDENCE.json');
assert.equal(roster.cards.length,246);assert.equal(tactical.cartas.length,246);
assert.equal(v.summary.images_in_archive,241);
assert.equal(v.summary.transcribed_skill_lists,241);
assert.equal(v.summary.skill_occurrences,2243);
assert.equal(v.observations.length,15);
assert.equal(complete.image_manifest.length,241);
assert.equal(new Set(complete.image_manifest.map(x=>x.filename)).size,241);
assert.equal(complete.image_manifest.filter(x=>Array.isArray(x.skills_ptbr_transcribed)&&x.skills_ptbr_transcribed.length>=1).length,241);
assert.equal(complete.summary.manually_transcribed_screens,241);
assert.equal(complete.summary.skill_total_occurrences,2243);
assert.equal(complete.image_manifest.filter(x=>x.scout_roster_matching?.status==='unambiguous_name_only_no_id').length,185);
assert.equal(complete.image_manifest.filter(x=>x.scout_roster_matching?.status==='multiple_versions_or_cards_no_edition_binding').length,53);
assert.equal(complete.image_manifest.filter(x=>x.scout_roster_matching?.status==='external_edition_multifactor_no_in_game_id').length,1);
assert.equal(new Set(v.observations.map(x=>x.file)).size,15);
assert(v.rules.preserve_project_level_pp_training && !v.rules.may_modify_master_card_id);
for(const o of v.observations){
 assert(o.skills.length>=2&&o.skills.length<=10);
 assert.equal(new Set(o.skills).size,o.skills.length);
 assert.equal(o.boosters_eFHUB.length,2);
 assert(o.file.endsWith('.jpg'));
}
for(const [cap,skillCount,rarity] of [[151,7,'DISTINGUIDO'],[181,10,'DISTINGUIDO'],[75,10,'SHOW TIME'],[170,5,'SHOW TIME']]){
 const card=roster.cards.find(x=>x.numero===cap);
 const evidence=v.observations.find(x=>x.cap===cap);
 assert.equal(card.raridade_confirmada,rarity);
 assert.equal(evidence.rarity_user,rarity);
 assert.equal(evidence.skills.length,skillCount);
 assert.equal(card.pp,tactical.cartas.find(x=>x.numero===cap).pp);
}
for(const n of [151,181]){
 assert(!roster.cards.find(x=>x.numero===n).habilidades_nativas,'Não promover o print sem validar Card ID: '+n);
 assert.equal(older.cartas.find(x=>x.numero===n).habilidades_status,'pendente_identidade');
}
const rodri=roster.cards.find(x=>x.numero===225);
assert.equal(rodri.id,'105779675902175','Corrigir ID Rodri por cotejo fonte/print, sem reivindicar leitura no jogo');
assert.equal(v.observations.find(x=>x.cap===225).player,'Rodri');
assert.notDeepEqual(v.observations.find(x=>x.cap===20).skills,v.observations.find(x=>x.cap===225).skills);
const sw=historicalRead(path.join(web,'sw.js'),'utf8');
const app=historicalRead(path.join(web,'app-bridge.js'),'utf8');
assert(sw.includes('SCOUT_V184_EFHUB_SCREENSHOT_EVIDENCE.json'));
assert(sw.includes('SCOUT_V184_EFHUB_241_COMPLETE.json'));
assert(sw.includes('v183-v184'));
assert(app.includes("fetch('../SCOUT_V184_EFHUB_SCREENSHOT_EVIDENCE.json')"));
assert(app.includes("fetch('../SCOUT_V184_EFHUB_241_COMPLETE.json')"));
assert(app.includes('Selecione uma versão para consultar'));
assert(app.includes("select.addEventListener('change'"));
assert(app.includes('Não substitui o nível nem os PP já cadastrados no Scout PRO.'));
console.log('V185 OK: 241 prints e 2243 skills; Rodri 225 vinculado externamente por pacote/arte/skills, 246 PP/treinos preservados.');
