'use strict';
// V334: verificação da integração real das duas frentes sem modificar os dados.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const pkg=JSON.parse(read('package.json'));
const v189=read('web/scout-ui-v189.js');
const premium=read('web/premium.js');
const pwa=read('web/pwa.js');
const sw=read('web/sw.js');
const desktop=read('desktop/main.cjs');
const preload=read('desktop/preload.cjs');
const bridge=read('web/app-bridge.js');
const cards=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
assert.equal(cards.length,246,'O acervo original precisa manter exatamente 246 cartas');
for(const test of ['test-premium-home-v332.cjs','test-windows-update-consent-v333.cjs','test-integration-v334.cjs'])
 assert(pkg.scripts.check.includes('scripts/'+test),'Regressão obrigatória não executada: '+test);
assert(premium.includes('hero-more-tools'),'V332 precisa existir na home legada');
assert(v189.includes("a.getAttribute('href')==='tecnicos-v307.html'"),
 'Menu Premium real não pode duplicar o link Central de Técnicos');
assert(pwa.includes("document.querySelector('.scout-v189-extra-links')"),
 'Links tardios devem ir para o menu Premium visível');
assert(pwa.includes("colecao=minhas-cartas-adicionadas"),
 'Adicionar cartas precisa continuar acessível');
assert(sw.includes("'./pwa.js'"),'Navegação dinâmica deve estar disponível offline');
assert(sw.includes('v334-premium-win-integration'),'Atualização de cache obrigatória');
assert(desktop.includes('autoUpdater.autoInstallOnAppQuit=false'),
 'A ação Depois não pode instalar ao encerrar o programa');
assert(desktop.includes("ipcMain.handle('scout:update-status'"),
 'Estado da atualização precisa sobreviver à recarga da interface');
assert(desktop.includes("ipcMain.handle('scout:install-downloaded'"),
 'Só instalar após ação explícita');
assert(preload.includes('installDownloadedUpdate:')&&preload.includes('updateStatus:'));
assert(bridge.includes('window.scoutDesktop.updateStatus()'));
console.log('V334 PASS: Premium visível, cache offline e atualização Windows unidos, 246 cartas preservadas.');
