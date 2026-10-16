'use strict';
/* Scout PRO V205 — estado fiel e reset pelo motor original, sem alterações nas fichas. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const mod=require('../web/scout-finish-v205.js');
const initial=mod.summarize({query:'',role:'TODOS',rarity:'TODAS',sort:'cap',count:246});
assert.equal(initial.active,false);
assert(initial.label.includes('Todas as cartas'));
const search=mod.summarize({query:'Szoboszlai',role:'TODOS',rarity:'TODAS',sort:'cap',count:2});
assert.equal(search.active,true);
assert(search.label.includes('Busca: Szoboszlai'));
assert(!search.label.includes('Todas as cartas'));
const combined=mod.summarize({query:'Cristiano Ronaldo',role:'CA',roleLabel:'Centroavantes',rarity:'ÉPICA',sort:'alpha',sortLabel:'Nome A–Z',count:1});
assert(combined.label.includes('1 carta'));
assert(combined.label.includes('CA')&&combined.label.includes('ÉPICA')&&combined.label.includes('A–Z'));
assert(combined.full.includes('Cristiano Ronaldo'));
const empty=mod.summarize({query:'nenhum jogador',role:'TODOS',rarity:'TODAS',sort:'cap',count:0});
assert(empty.label.includes('0 cartas'),'Busca sem resultado deve ser explicitada');
const code=read('web/scout-finish-v205.js'),css=read('web/scout-finish-v205.css');
for(const marker of [
 "empty.append(doc.createTextNode(' '),emptyClear)","roleAll.click()","rarityAll.click()","new host.Event('input'","new host.Event('change'",
 "sort.value='cap'","emptyClear.addEventListener('click',reset)",
 "search.addEventListener('input',refresh)","observer.observe(catalog,{childList:true})"
])assert(code.includes(marker),'Reset sem duplicar motor: '+marker);
assert(!code.includes('cloneNode(')&&!code.includes('localStorage.'),'Preservar eventos e preferências anteriores');
assert(css.includes('@media(max-width:720px)')&&css.includes('@media(max-width:355px)'),'Mobile 320/360/390/412');
assert(css.includes(':focus-visible'),'Acessibilidade de teclado');
const index=read('web/index.html');
assert.equal((index.match(/class="player-card"/g)||[]).length,246,'Acervo imutável');
assert.equal(fs.readdirSync(path.join(root,'web/fichas')).filter(f=>f.endsWith('.html')).length,246);
for(const id of ['id="roles"','id="rarities"','id="sort"','id="search"','id="none"','id="more"'])assert(index.includes(id),'ID original '+id);
const bridge=read('web/app-bridge.js'),sw=read('web/sw.js'),stamp=read('scripts/stamp-bundle-v189.cjs');
for(const file of ['scout-finish-v205.css','scout-finish-v205.js']){
 assert(bridge.includes("v189Root+'"+file+"'"),'Bundle de ambas plataformas '+file);
 assert(sw.includes("'./"+file+"'"),'Offline '+file);
 assert(stamp.includes("'"+file+"'"),'Fingerprint '+file);
}
assert(sw.includes('v205-search-feedback'),'Versionamento do cache offline');
console.log('V205 OK: busca e filtros consistentes, estados vazios, reset, 246 cartas e paridade offline.');
