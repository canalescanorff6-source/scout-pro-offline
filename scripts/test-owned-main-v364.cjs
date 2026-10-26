'use strict';
/* V364: prova das 15 fichas principais sem substituir qualquer original. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),web=path.join(root,'web');
const read=name=>fs.readFileSync(path.join(web,name),'utf8');
const index=read('index.html'),orig=JSON.parse(read('SCOUT_V69_AUDITORIA.json'));
const c=JSON.parse(read('ct364-owned-cards.json'));
const js=read('ct364-owned-main.js'),css=read('ct364-owned-main.css');
const sw=read('sw.js'),fingerprint=fs.readFileSync(path.join(root,'scripts/stamp-bundle-v189.cjs'),'utf8');
assert.equal(c.schema,'craque-owned-cards-v364');
assert.equal(c.destination,'minhas-cartas-principais');
assert.equal(c.originalsPreserved,246);
assert.equal(c.additions,15);
assert.equal(c.cards.length,15);
assert.equal(fs.readdirSync(path.join(web,'fichas')).filter(p=>/^\d{3}_.+\.html$/.test(p)).length,246);
assert.equal((index.match(/class="player-card"/g)||[]).length,246,'246 miniaturas HTML originais devem continuar intactas');
assert.equal(orig.cards.length,246,'audit oficial inalterada');
assert.equal(new Set(c.cards.map(v=>v.key)).size,15);
assert.equal(new Set(c.cards.map(v=>v.image)).size,15);
const names=c.cards.map(x=>x.name);
assert.ok(names.includes('Serhou Guirassy')&&index.includes('data-cap="181" data-name="Serhou Guirassy"'),'duas versões coexistem');
for(const card of c.cards){
 assert.equal(card.maxLevel,null,card.name+' inventou nível máximo');
 assert.equal(card.pp,null,card.name+' inventou PP');
 assert.equal(card.cardId,null,card.name+' inventou Card ID');
 assert.ok(card.position&&card.style,card.name+' sem função');
 assert.ok(card.observed.shownLevel>=1,card.name+' sem nível exibido do eFHub');
 assert.equal(card.observed.attributes.length,21,card.name+' sem atributos documentados');
 assert.ok(card.observed.nativeSkills.length>=3,card.name+' sem habilidades da captura');
 const img=path.join(web,card.image);
 assert.ok(fs.existsSync(img),card.name+' sem imagem original recortada');
 assert.ok(fs.statSync(img).size>15000,card.name+' imagem miniatura inválida');
 assert.ok(sw.includes('./'+card.image),'SW sem foto offline de '+card.name);
 assert.ok(fingerprint.includes("'"+card.image+"'"),'bundle sem SHA da foto de '+card.name);
}
for(const name of ['ct364-owned-main.js','ct364-owned-main.css','ct364-owned-cards.json']){
 assert.ok(index.includes(name)||name.endsWith('.json'),'home não carrega '+name);
 assert.ok(sw.includes('./'+name),'SW sem '+name);
 assert.ok(fingerprint.includes("'"+name+"'"),'fingerprint sem '+name);
}
assert.match(js,/CRAQUE_FRIEND_TRAINING_V228/,'mesmo motor de análise tática');
assert.match(js,/const STYLE_IDS=\['posse','normal','rapido','fora','longo'\]/);
assert.match(js,/scoutpro:v364:owned-confirmed/);
assert.match(js,/scoutpro:v364:owned-equipment/,'skills e ímpetos manuais sem armazenamento isolado');
assert.match(js,/equipmentSave/,'gravação manual por edição ausente');
assert.match(js,/unique.size!==names.length/,'colisão entre skills adicionais não bloqueada');
assert.match(js,/known.has\(normalize\(v\)\)/,'colisão com nativa simulada não bloqueada');
assert.match(js,/ct364-equipped-booster/,'ípetos manuais não possuem campo individual');
assert.ok(index.indexOf('craque-app-shell-v362.css')<index.indexOf('ct364-owned-main.css'),
 'CSS V364 deve carregar DEPOIS de V362 para corrigir cascata visual em 320px');
assert.match(js,/ct364-owned-section/);
assert.match(js,/const compactHint=/,'sinalização compacta via JS não instalada');
assert.match(js,/margin-top','-10px'/,'espaçamento da grade principal em 320px não corrigido');
assert.match(js,/\(max-width:355px\)/,'limite responsivo de 320px não configurado');
assert.match(js,/ct364-owned-grid/);
assert.match(js,/ct364-card-navigator/,'navegacao 15 cartas ausente');
assert.match(js,/function switchOwnedCard/,'isolamento entre fichas ausente');
assert.match(js,/function navigateOwned/,'anterior/proxima ausentes');
assert.match(js,/ct364-jump/,'ir ao numero especifico ausente');
assert.match(css,/ct364-player-card/);
assert.match(css,/ct364-card-nav/,'navegador responsivo ausente');
assert.match(css,/V364[.]2/,'correcao da primeira dobra ausente');
assert.doesNotMatch(js,/SCOUT_V69_AUDITORIA|localStorage\.removeItem\(/,'não sobrescrever originais/backup');
console.log('V364 OK: 246 originais + 15 minhas cartas com fotos, dados reais e lacunas honestas; 5 táticas mesmo motor, Android/Windows offline.');
