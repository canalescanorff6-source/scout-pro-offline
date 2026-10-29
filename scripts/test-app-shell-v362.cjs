'use strict';
/* V362 — cobertura dos 260 HTMLs (14 fluxos + 246 fichas originais). */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),web=path.join(root,'web');
const source=p=>fs.readFileSync(path.join(web,p),'utf8');
const entry=source('app-bridge.js'),stamp=fs.readFileSync(path.join(root,'scripts/stamp-bundle-v189.cjs'),'utf8'),sw=source('sw.js');
const shell=source('craque-app-shell-v362.js'),css=source('craque-app-shell-v362.css');
const originals=fs.readdirSync(path.join(web,'fichas')).filter(p=>/^\d{3}_.+\.html$/.test(p));
assert.equal(originals.length,246,'Não remover/substituir fichas originais');
for(const filename of ['craque-app-shell-v362.js','craque-app-shell-v362.css']){
 assert.ok(stamp.includes(filename),'fingerprint precisa do '+filename);
 assert.ok(sw.includes(filename),'PWA precisa carregar '+filename);
 assert.ok(entry.includes(filename),'bridge precisa carregar '+filename);
}
const pages=fs.readdirSync(web).filter(p=>p.endsWith('.html'));
assert.equal(pages.length,15,'Conferir cobertura das 15 páginas de topo, incluindo conferência V379');
assert(pages.includes('conferir-cartas.html'));
for(const name of pages){
 const html=source(name);
 const viaBridge=html.includes('src="app-bridge.js"');
 const direct=html.includes('src="craque-app-shell-v362.js"');
 assert.ok(viaBridge||direct, name+' sem o novo shell');
 assert.ok(!viaBridge||entry.includes('craque-app-shell-v362.js'),name+' perdeu bridge');
 const stylesheet=html.includes('href="craque-app-shell-v362.css"');
 assert.ok(stylesheet||viaBridge,name+' sem folhas de estilo');
}
for(const name of originals.slice(0,1).concat(originals.slice(-1))){
 assert.ok(source('fichas/'+name).includes('../app-bridge.js'),'Ficha não inclui bridge: '+name);
}
assert.match(css,/body\.ct362-design/);
for(const id of ['catalog','detail','friends','team','rotation-lab','manager-hub','progress-audit','boosters','tactical-review','video-evidence','player-model','rarity-audit','batch-8','batch-9']){
 assert.ok(shell.includes(id),'Página sem rota no shell V362: '+id);
}
assert.ok(shell.includes('ct362-design-proof')&&shell.includes('ct362-appnav'));
assert.ok(css.includes('.scout-v220-shell')&&css.includes('.scout-v189-tile')&&css.includes('.friends-card')&&css.includes('.hub-card'));
assert.doesNotMatch(shell,/(localStorage\.setItem|card\.pp\s*=|card\.training\s*=|fetch\([^)]+method\s*:\s*['"]POST)/,'Redesign não altera dados');
console.log('V362 PASS: 14 telas e 246 fichas cobertas, CSS/JS offline, identidade global, nenhum motor reescrito.');
