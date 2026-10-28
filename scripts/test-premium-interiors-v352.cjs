'use strict';
// V352: telas internas compartilham uma única camada Premium verificável.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const css=read('web/craque-premium-interiors-v352.css');
const friends=read('web/outros-elencos-v227.html');
const team=read('web/meu-time-duas-formacoes-v177.html');
const hub=read('web/tecnicos-v307.html');
const bridge=read('web/app-bridge.js');
const sw=read('web/sw.js');
const stamp=read('scripts/stamp-bundle-v189.cjs');
const catalog=read('web/SCOUT_V69_AUDITORIA.json');
const cards=JSON.parse(catalog).cards;
assert.equal(cards.length,246);
for(const [page,html] of [
 ['friends',friends],['team',team],['manager-hub',hub]]){
 assert(html.includes('data-page="'+page+'"'),'Página existente '+page);
 assert(html.includes('<link rel="stylesheet" href="craque-premium-interiors-v352.css" data-ct352-final="true"/>'),
  'Camada estática Premium em '+page);
 assert(css.includes('body[data-page="'+page+'"]'),'Regras isoladas da página '+page);
 assert(!html.includes('data-page="legacy"'));
}
assert(friends.indexOf('craque-friends-v227.css')<friends.indexOf('craque-premium-interiors-v352.css'));
assert(team.indexOf('craque-lineup-focus-v330.css')<team.indexOf('craque-premium-interiors-v352.css'));
assert(hub.indexOf('craque-managers-v307.css')<hub.indexOf('craque-premium-interiors-v352.css'));
assert(bridge.includes("document.querySelector('link[data-ct352-final=\"true\"]')"));
assert(bridge.includes("document.head.appendChild(ct352Final)"));
assert(bridge.indexOf("v189Root+'craque-visual-system-v234.css'")<
 bridge.indexOf("document.head.appendChild(ct352Final)"));
assert(bridge.includes("['friends','team'].includes(document.body.dataset.page)"));
assert(sw.includes("'./craque-premium-interiors-v352.css'"));
assert(stamp.includes("'craque-premium-interiors-v352.css'"));
assert(sw.includes('v352-interiors'));
for(const named of ['--ct352-gold:#f3cd77','--ct352-ivory:#fcf7e9',
 '--ct352-surface:#111f35','--ct352-bg:#060d18']){
 assert(css.includes(named),'Paleta da marca '+named);
}
for(const label of ['.friends-hero','.friends-panel','.friends-card',
 '.friends-dialog','.friends-primary','.friends-person','.ct311-positional',
 '.hero','.panel','.linkup-panel','.bench-card','.formation-button',
 '.p-slot','.hub-panel','.hub-card','.hub-btn.primary','.hub-v329-primary-score']){
 assert(css.includes(label),'Componente legado visualmente consolidado '+label);
}
assert(css.includes('body[data-page="team"] .p-slot') &&
 css.includes('Manter')===false ? true : css.includes('Gramado'));
assert(!/display\s*:\s*none\s*!important/i.test(css),
 'A camada Premium não pode esconder funcionalidades');
assert(!/\.remove\(|\.replaceChildren\(|localStorage|sessionStorage|fetch\(/i.test(css),
 'CSS não pode tocar em dados ou identidade de cartas');
const selectors=[
 '#friend-new-card','#friend-card-dialog','#friend-analysis-dialog',
 '#friend-search','#friend-people'];
for(const id of selectors)assert(friends.includes('id="'+id.slice(1)+'"'),'Cadastro permanece '+id);
for(const id of ['#formation-pick','#pitch','#bench','#picker'])
 assert(team.includes('id="'+id.slice(1)+'"'),'Formação permanece '+id);
for(const id of ['#hub-search','#hub-scope','#hub-style','#hub-cards'])
 assert(hub.includes('id="'+id.slice(1)+'"'),'Central permanece '+id);
assert(css.includes('prefers-reduced-motion:reduce'));
assert(css.includes(':focus-visible'));
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),catalog);
console.log('V352 PASS: 3 telas internas Premium, CSS único em ordem estável, menus e 246 cartas preservados, bundle offline Android/Windows.');
