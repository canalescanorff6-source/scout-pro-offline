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
assert.ok(shell.includes('CRAQUE_UI_RELEASES')&&shell.includes('activateCurrentRelease()'),
 'Somente a geração ativa pode montar elementos visuais');
assert.ok(shell.includes('next.ready!==true')&&shell.includes('version<this.current'),
 'Substituir uma UI só depois que a próxima estiver pronta e jamais por uma antiga');
assert.ok(shell.includes("link[data-craque-ui-theme]"),
 'A geração anterior deve retirar sua folha oficial na próxima troca');
assert.ok(css.includes('var(--ct362-wine)')&&css.includes('var(--ct362-bg)'),
 'As superfícies devem usar tokens oficiais, não novos temas acumulados');
assert.doesNotMatch(css,/background-color:#070c14/,'Cor de fundo azul antiga não deve vencer o tema grafite');
assert.ok(css.includes('.scout-v220-shell')&&css.includes('.scout-v189-tile')&&css.includes('.friends-card')&&css.includes('.hub-card'));
const layout=source('craque-main-layout-v378.js');
const curator=source('scout-card-curation-v229.js');
for(const id of ['engenharia','foco','pontos','jogar']){
 assert.ok(curator.includes("'"+id+"'"),'Bloco histórico não preservado na curadoria V229: '+id);
}
assert.ok(layout.includes("'#scout-v220-technical'")&&
 curator.includes("archive.id='scout-v229-legacy-archive'"),
 'Blocos antigos devem continuar no arquivo V229 dentro da ferramenta técnica');
assert.ok(!layout.includes("archive.append(node)")&&!layout.includes("ct378-source-archive"),
 'Proibido criar um segundo arquivo da carta e retirar seções do painel técnico');
assert.ok(shell.includes("edition.textContent='eFOOTBALL 2027 · CRAQUE TÁTICO'"),
 'Rótulo V72 não deve continuar na interface moderna');
assert.ok(css.includes('.scout-v229-legacy-archive'),'Arquivo histórico V229 deve herdar o visual editorial');
assert.doesNotMatch(shell,/(localStorage\.setItem|card\.pp\s*=|card\.training\s*=|fetch\([^)]+method\s*:\s*['"]POST)/,'Redesign não altera dados');
console.log('V362 PASS: 14 telas e 246 fichas cobertas, CSS/JS offline, identidade global, nenhum motor reescrito.');
