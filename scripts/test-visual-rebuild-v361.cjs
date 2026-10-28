'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const app=read('web/app-bridge.js'),html=read('web/index.html'),others=read('web/outros-elencos-v227.html');
const css=read('web/craque-visual-rebuild-v361.css'),js=read('web/craque-visual-rebuild-v361.js');
const stamp=read('scripts/stamp-bundle-v189.cjs'),sw=read('web/sw.js');
const paths=['web/craque-visual-rebuild-v361.js','web/craque-visual-rebuild-v361.css'];
for(const file of paths){
 assert.ok(fs.existsSync(path.join(root,file)),file+' ausente');
 assert.ok(stamp.includes(path.basename(file)),'Fingerprint não cobre '+file);
 assert.ok(sw.includes(path.basename(file)),'Cache offline não inclui '+file);
 assert.ok(app.includes(path.basename(file)),'Bridge não entrega '+file);
}
assert.match(html,/data-ct361-final="true"/);
assert.match(others,/data-ct361-final="true"/);
assert.match(js,/ct361-player-glance/);
assert.match(js,/img\.cloneNode\(false\)/,'Imagem original reutilizada, sem substituição');
assert.match(js,/header\.querySelector\('\.detail-sub'\)/);
assert.match(js,/ct361-glance-stats/);
assert.match(js,/options\.insertBefore\(update,options\.firstChild\)/);
assert.match(js,/max-width:720px/,'Menu mobile não pode remover opções do desktop');
assert.match(css,/ct361-detail-ready/);
assert.match(css,/ct361-home-ready/);
assert.match(css,/ct361-dock-ready/);
assert.doesNotMatch(js,/(localStorage\.setItem|\.PP\s*=|card_id\s*=|training\.push)/,'UI não pode modificar progresso e builds');
const cards=fs.readdirSync(path.join(root,'web','fichas')).filter(f=>/^\d{3}_.*\.html$/.test(f));
assert.equal(cards.length,246,'246 fichas originais obrigatórias');
console.log('V361 OK: 246 fichas, painel novo, arte intacta, menu mobile, CSS declarativo, cache e fingerprint.');
