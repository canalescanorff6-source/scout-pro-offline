'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const selector=require('../web/craque-manager-selector-v328.js');
const api=require('../web/craque-managers-v302.js');
const source=fs.readFileSync('web/craque-friends-training-ui-v228.js','utf8');
const html=fs.readFileSync('web/outros-elencos-v227.html','utf8');
const sw=fs.readFileSync('web/sw.js','utf8');
const stamp=fs.readFileSync('scripts/stamp-bundle-v189.cjs','utf8');
const memory=new Map(),storage={
 getItem:k=>memory.get(k)||null,
 setItem:(k,v)=>memory.set(k,String(v))
};
const items=[
 {catalog_id:'CT-MGR-071',nome:'Niko Kovač',versao_lancamento:'2026',boosters_PTBR:['Condução'],posse:90,contra_rapido:88},
 {catalog_id:'CT-MGR-002',nome:'Jürgen Klopp',versao_lancamento:'2025',boosters_PTBR:[],posse:87,contra_rapido:89},
 {catalog_id:'CT-MGR-003',nome:'Jürgen Klopp',versao_lancamento:'2026',boosters_PTBR:[],posse:89,contra_rapido:90}
];
const scores={posse:{'CT-MGR-071':90,'CT-MGR-002':87,'CT-MGR-003':89},rapido:{'CT-MGR-071':88,'CT-MGR-002':89,'CT-MGR-003':90}};
const mock={STYLES:[{id:'posse'},{id:'rapido'}],CURATED_IDS:['CT-MGR-002'],proficiency:(c,id)=>scores[id]?.[c.catalog_id]??null};
assert.equal(selector.normalize('  JÜRGEN  '),'jurgen');
assert.equal(selector.filter(items,mock,{query:'Kovac',storage}).length,1);
assert.equal(selector.filter(items,mock,{query:'klopp',storage}).length,2);
assert.equal(selector.filter(items,mock,{query:'2025',storage})[0].id,'CT-MGR-002');
assert.equal(selector.filter(items,mock,{query:'CT-MGR-003',storage})[0].id,'CT-MGR-003');
assert.equal(selector.filter(items,mock,{query:'inexistente',selected:'CT-MGR-071',storage})[0].id,'CT-MGR-071');
assert.equal(selector.filter(items,mock,{query:'inexistente',selected:'CT-MGR-071',storage}).length,1);
assert.equal(selector.filter(items,mock,{scope:'featured',storage}).length,2);
assert.equal(selector.filter(items,mock,{scope:'favorites',storage}).length,0);
assert.equal(selector.toggleFavorite(storage,'CT-MGR-003'),true);
assert.equal(selector.filter(items,mock,{scope:'favorites',storage})[0].id,'CT-MGR-003');
assert.equal(selector.filter(items,mock,{scope:'all',style:'rapido',storage})[0].id,'CT-MGR-003');
assert.equal(selector.toggleFavorite(storage,'CT-MGR-003'),false);
storage.setItem(selector.OWNED,JSON.stringify(['CT-MGR-002']));
assert.equal(selector.filter(items,mock,{scope:'owned',storage})[0].id,'CT-MGR-002');
assert.equal(selector.filter(items,mock,{scope:'owned',selected:'CT-MGR-071',storage}).length,2);
storage.setItem(selector.FAVORITES,'invalid');
assert.equal(selector.readIds(storage,selector.FAVORITES).size,0);
assert.throws(()=>selector.toggleFavorite(storage,'<script>'),/ID inválido/);
assert(source.includes('selectorEngine.toggleFavorite(localStorage,managerSelectedId)'));
assert(source.includes("search.addEventListener('input',renderManager)"));
assert(source.includes("scope.addEventListener('change',renderManager)"));
assert(source.includes('selected:managerSelectedId'));
assert(html.includes('craque-manager-selector-v328.js'));
assert(sw.includes('craque-manager-selector-v328.js'));
assert(stamp.includes('craque-manager-selector-v328.js'));
assert(api.STYLES.length>=5);
console.log('V328 PASS: busca sem acento, versões, favoritos, owned, estilo, seleção preservada, bundle offline.');
