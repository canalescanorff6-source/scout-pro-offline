'use strict';
// V353 — normalização visual em dez áreas internas, sem mexer no motor.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const css=read('web/craque-premium-workspaces-v353.css');
const previous=read('web/craque-premium-interiors-v352.css');
const bridge=read('web/app-bridge.js');
const sw=read('web/sw.js'),stamp=read('scripts/stamp-bundle-v189.cjs');
const pages=[
 ['conferir-progresso-v248.html','progress-audit','#v248-cards'],
 ['meu-time-testes-v219.html','rotation-lab','#squads'],
 ['pesquisa-videos-v106.html','video-evidence','#videos'],
 ['player-model-v101.html','player-model','#body-form'],
 ['revisao-impetos-v103.html','boosters','#tactics'],
 ['revisao-tatica-v98.html','tactical-review','#tactics'],
 ['lote-8-conferencia.html','batch-8','.grid'],
 ['lote-9-cadastro.html','batch-9','#form'],
 ['raridade-cadastro-v91.html','rarity-audit','#form']
];
for(const [file,page,selector] of pages){
 const html=read('web/'+file);
 assert(html.includes('data-page="'+page+'"'),'Página identificável '+file);
 const link='<link rel="stylesheet" href="craque-premium-workspaces-v353.css" data-ct353-final="true"/>';
 assert(html.includes(link),'Tema estático no HTML '+file);
 assert(html.indexOf(link)<html.indexOf('</head>'),'Tema entregue no head '+file);
 assert(css.includes('body[data-page="'+page+'"]'),'Tema isolado por página '+page);
 assert(html.includes(selector.slice(1)),'Funcionalidade da página preservada: '+file+' '+selector);
}
const alt=read('web/meu-time-posse-4312.html');
assert(alt.includes('data-page="team"'));
assert(alt.includes('craque-premium-interiors-v352.css" data-ct352-final="true"'),
 'A segunda formação deve compartilhar o tema V352');
assert(previous.includes('body[data-page="team"]'));
assert(bridge.includes("document.querySelector('link[data-ct353-final=\"true\"]')"));
assert(bridge.includes("if(ct353Final)document.head.appendChild(ct353Final)"));
assert(bridge.indexOf('document.head.appendChild(ct352Final)')<
 bridge.indexOf('document.head.appendChild(ct353Final)'));
assert(bridge.indexOf("craque-visual-system-v234.css")<
 bridge.indexOf('document.head.appendChild(ct353Final)'));
for(const x of [
 "'./craque-premium-workspaces-v353.css'",
 "'./lote-8-conferencia.html'",
 "'./lote-9-cadastro.html'",
 "'./raridade-cadastro-v91.html'"]){
 assert(sw.includes(x),'Pré-cache PWA: '+x);
}
for(const x of [
 "'craque-premium-workspaces-v353.css'",
 "'lote-8-conferencia.html'",
 "'lote-9-cadastro.html'",
 "'raridade-cadastro-v91.html'"]){
 assert(stamp.includes(x),'Fingerprint compartilhado: '+x);
}
assert(sw.includes('v353-workspaces'));
for(const token of ['--ct353-bg:#060d18','--ct353-ink:#e9eef7',
 '--ct353-gold:#f3cd77','--ct353-line:']){
 assert(css.includes(token),'Paleta original: '+token);
}
assert(css.includes('.fact:not(.warn):not(.good)'),'Avisos semânticos preservados');
assert(css.includes('.status:not([data-status]):not(.warn):not(.error)'));
assert(css.includes('prefers-reduced-motion:reduce'));
assert(css.includes(':focus-visible'));
assert(!/display\s*:\s*none\s*!important/i.test(css));
assert(!/\.remove\(|\.replaceChildren\(|\blocalStorage\b|\bsessionStorage\b|\bindexedDB\b/i.test(css));
const original=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json'));
assert.equal(original.cards.length,246,'Catálogo original mantido');
console.log('V353 PASS: nove workspaces + formação alternativa, cache de arquivos legados, cascata CSS e 246 cartas preservadas.');
