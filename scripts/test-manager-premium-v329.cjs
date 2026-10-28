'use strict';
/* V329: decisões de interface, filtragem e integridade de dados por Card ID */
const assert=require('node:assert/strict');
const fs=require('node:fs'),zlib=require('node:zlib'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const managers=require('../web/craque-managers-v302.js');
const picker=require('../web/craque-manager-selector-v328.js');
const hub=require('../web/craque-manager-hub-v307.js');
const archival=JSON.parse(zlib.gunzipSync(Buffer.from(
 read('web/craque-manager-catalog-v302.gz.b64').trim(),'base64')).toString('utf8'));
const actual=managers.withKovacEdition(archival).tecnicos;
const roster=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
const before=JSON.stringify(roster),managerData=JSON.stringify(actual);
assert.equal(roster.length,246);
assert.equal(actual.length,71);
assert.equal(new Set(actual.map(x=>x.catalog_id)).size,71);
assert.equal(managers.CURATED_IDS.length,22);
const mock={map:new Map(),getItem(k){return this.map.get(k)||null},
 setItem(k,v){this.map.set(k,String(v))},removeItem(k){this.map.delete(k)}};
const options={STYLES:managers.STYLES,CURATED_IDS:managers.CURATED_IDS,proficiency:managers.proficiency};
const featured=picker.filter(actual,options,{scope:'featured',style:'posse',storage:mock});
assert.equal(featured.length,23,'Somente 23 destaques no primeiro contato');
assert(featured.some(x=>x.id==='CT-MGR-071'));
assert.equal(picker.filter(actual,options,{scope:'all',style:'posse',storage:mock}).length,71);
const kovacVersions=picker.filter(actual,options,{query:'kovac',style:'posse',storage:mock});
assert(kovacVersions.some(x=>x.id==='CT-MGR-071'),'Kovač 90 Posse não pode desaparecer');
assert.equal(new Set(kovacVersions.map(x=>x.id)).size,kovacVersions.length,
 'Não colapsar edições homônimas de Kovač');
assert.equal(picker.filter(actual,options,{query:'klopp',style:'posse',storage:mock}).length,2);
assert.equal(picker.filter(actual,options,{query:'CT-MGR-013',style:'posse',storage:mock}).length,1);
assert.equal(picker.filter(actual,options,{scope:'favorites',style:'posse',storage:mock}).length,0);
assert(picker.toggleFavorite(mock,'CT-MGR-071'));
assert.equal(picker.filter(actual,options,{scope:'favorites',style:'posse',storage:mock})[0].id,'CT-MGR-071');
assert(hub.fromStore(hub.FAVORITES,mock).has('CT-MGR-071'),'Favoritos precisam funcionar em ambas as telas');
assert(!picker.toggleFavorite(mock,'CT-MGR-071'));
const selected=picker.filter(actual,options,{query:'sem correspondência',scope:'owned',
 selected:'CT-MGR-071',style:'posse',storage:mock});
assert.equal(selected.length,1,'Selecionado não pode desaparecer nos filtros');
assert(selected[0].selected);
assert.equal(managers.proficiency(actual.find(c=>c.catalog_id==='CT-MGR-071'),'posse'),90);
assert.equal(managers.proficiency(actual.find(c=>c.catalog_id==='CT-MGR-071'),'rapido'),67);
const personal=read('web/craque-managers-v302.js'),bridge=read('web/app-bridge.js');
const central=read('web/craque-manager-hub-v307.js');
const personalCSS=read('web/craque-managers-v302.css'),hubCSS=read('web/craque-managers-v307.css');
assert(personal.includes("host.CRAQUE_MANAGER_SELECTOR_V328"));
assert(personal.includes("const tools=make(doc,'div',undefined,'ct-manager-v329-tools')"));
assert(personal.includes("search.addEventListener('input',renderPicker)"));
assert(personal.includes("filter.addEventListener('change',renderPicker)"));
assert(personal.includes("selector.toggleFavorite(host.localStorage,selected.catalog_id)"));
assert(personal.includes("selected:chosen,storage:host.localStorage"));
assert(personal.includes("select.value=chosen"));
assert(personal.includes("'scoutpro:v307:manager-selection:'+capture+'@'+cardId"));
assert(personal.includes("const more=make(doc,'details',undefined,'ct-manager-v329-more')"));
assert(personal.includes("Ver outras 5 proficiências"));
assert(bridge.includes("selector329.onload=()=>document.head.appendChild(managers)"));
assert(bridge.includes("selector329.onerror=()=>document.head.appendChild(managers)"));
assert(central.includes("const focus=A.STYLES.find(s=>s.id===requested)"));
assert(central.includes("const otherStyles")===false || central.includes("A.STYLES.filter(s=>s.id!==focus.id)"));
assert(central.includes("A.STYLES.filter(s=>s.id!==focus.id)"));
assert(central.includes("expandedScores.add(c.catalog_id)"));
assert(central.includes("const photos=el('div','hub-v329-photo-actions')"));
assert(personalCSS.includes(".ct-manager-v329-more:not([open])"));
assert(hubCSS.includes(".hub-v329-other-scores:not([open])"));
assert(read('web/sw.js').includes('v329-premium-managers'));
for(const name of ['craque-managers-v302.js','craque-manager-hub-v307.js','craque-managers-v302.css',
 'craque-managers-v307.css','app-bridge.js','craque-manager-selector-v328.js']){
 assert(read('scripts/stamp-bundle-v189.cjs').includes("'"+name+"'"),'Bundle Android/Windows sem '+name);
 assert(read('web/sw.js').includes("'./"+name+"'"),'Cache offline sem '+name);
}
assert.equal(JSON.stringify(roster),before);
assert.equal(JSON.stringify(actual),managerData);
console.log('V329 PASS: 246 cartas e 71 edições preservadas, 23 destaques, dois acervos, favoritos globais, edição/estilo e visualização prioritária.');
