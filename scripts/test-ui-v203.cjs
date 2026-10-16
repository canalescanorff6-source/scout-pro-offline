'use strict';
/* SCOUT PRO V203: controles originais preservados e catálogo realmente priorizado. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const mod=require('../web/scout-finish-v203.js');
assert.equal(typeof mod.build,'function');
assert.equal(typeof mod.selectedLabel,'function');
const active={querySelector(selector){
 assert(selector.includes('button'));
 return {textContent:'  CA  ·  44  ',dataset:{value:'CA'}};
}};
const none={querySelector:()=>null};
assert.equal(mod.selectedLabel(active,'Todos'),'CA · 44');
assert.equal(mod.selectedLabel(none,'Todos'),'Todos');
assert.equal(mod.build({body:{dataset:{page:'detail'}}}),false,'Fichas não devem receber filtros');
const code=read('web/scout-finish-v203.js');
for(const phrase of [
 'catalog.insertBefore(panel,meta)',
 'contents.append(sortTitle,tools)',
 'contents.append(roleTitle,roles,rarityTitle,rarities)',
 "const motion=catalog.querySelector('.scout-motion-controls')",
 "roles.addEventListener('click'",
 "rarities.addEventListener('click'",
 "doc.getElementById('sort')?.addEventListener('change'",
 "new URLSearchParams(host?.location?.search||'')"
])assert(code.includes(phrase),'Preservação dos filtros: '+phrase);
assert(!code.includes('cloneNode(')&&!code.includes('innerHTML='),'Não duplicar botões ou reescrever a lista de filtros');
const css=read('web/scout-finish-v203.css');
assert(css.includes('.scout-v203-filter-panel:not([open])>.scout-v203-filter-content'),'Painel fechado mostra só o resumo');
assert(css.includes('scout-v203-filter-active'),'Resumo visível quando filtro está aplicado');
assert(css.includes('@media(max-width:720px)')&&css.includes('@media(min-width:960px)'),'Android e desktop');
assert(css.includes(':focus-visible'),'Acesso por teclado');
const b=read('web/app-bridge.js'),sw=read('web/sw.js'),stamp=read('scripts/stamp-bundle-v189.cjs');
for(const name of ['scout-finish-v203.js','scout-finish-v203.css']){
 assert(b.includes("v189Root+'"+name+"'"),'Bridge: '+name);
 assert(sw.includes("'./"+name+"'"),'Offline: '+name);
 assert(stamp.includes("'"+name+"'"),'Fingerprint: '+name);
}
assert(sw.includes('v203-filter-panel'));
const html=read('web/index.html'),source=read('web/premium.js');
assert.equal((html.match(/class="player-card"/g)||[]).length,246,'246 jogadores de catálogo');
assert.equal(fs.readdirSync(path.join(root,'web/fichas')).filter(x=>x.endsWith('.html')).length,246);
for(const name of ['id="sort"','id="roles"','id="rarities"','id="cards"','id="search"'])
 assert(html.includes(name),'O HTML mantém o controle real '+name);
for(const name of ['buttonState','search.addEventListener','sort.addEventListener','more.addEventListener'])
 assert(source.includes(name),'Filtros originais continuam intactos: '+name);
console.log('V203 OK: filtros originais acessíveis, resumo do estado, animação preservada e 246 cartas.');
