'use strict';
// V356: a entrada Premium precisa existir no APK antes do carregador dinâmico.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=name=>fs.readFileSync(path.resolve(__dirname,'..',name),'utf8');
const index=read('web/index.html'),bridge=read('web/app-bridge.js');
const ui=read('web/scout-ui-v189.js'),boot=read('web/craque-ui-bootstrap-v351.js');
const cache=read('web/sw.js'),stamp=read('scripts/stamp-bundle-v189.cjs');
assert.equal(JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards.length,246);
assert.equal((index.match(/class="player-card"/g)||[]).length,246);
const entry='script defer src="scout-ui-v189.js" data-ct356-entry="premium-home"';
assert(index.includes(entry),'Módulo Premium precisa estar no HTML estático');
assert(index.indexOf('app-bridge.js')<index.indexOf(entry));
assert(index.indexOf('craque-ui-bootstrap-v351.js')<index.indexOf('app-bridge.js'));
assert(index.includes('id="ct356-static-shell"'),'Precisa de acesso sem JS');
assert(index.includes('id="ct356-boot-proof"'),'Precisa de diagnóstico da versão real');
for(const [token,file] of [['v189','scout-ui-v189.css'],['v230','craque-design-v230.css'],
 ['v232','craque-experience-v232.css'],['v234','craque-visual-system-v234.css']]){
 const node='<link rel="stylesheet" href="'+file+'" data-ct356-core="'+token+'"/>';
 assert(index.includes(node),'Folha Premium ausente do HTML: '+file);
 assert(index.indexOf(node)<index.indexOf('craque-ui-bootstrap-v351.js'),
 'Folha deve carregar antes do controlador: '+file);
 assert(bridge.includes('link[data-ct356-core="'+token+'"]'),'Bridge precisa reutilizar '+file);
 assert(cache.includes("'./"+file+"'"),'Offline precisa empacotar '+file);
}
assert(bridge.includes('script[data-ct356-entry="premium-home"]'),
 'Não executar o script de navegação duas vezes');
assert(bridge.includes('if(!ct234Theme.parentNode')===false,
 'Tema V234 deve ser reposicionado para ter prioridade final');
assert(bridge.includes('document.head.appendChild(ct234Theme)'));
assert(ui.includes("doc.getElementById('ct356-static-shell')"),
 'Resgate somente deve desaparecer quando UI Premium estiver pronta');
assert(ui.includes('if(rescue)rescue.hidden=true'));
assert(index.includes('#ct356-static-shell[hidden]{display:none!important}'));
assert(index.includes('body[data-page="catalog"] .hero-text>.hero-actions{display:none!important}'));
assert(index.includes('aria-label="Acesso Premium disponível'));
assert(index.includes('outros-elencos-v227.html'));
assert(index.includes('meu-time-duas-formacoes-v177.html'));
assert(index.includes('meu-time-testes-v219.html'));
assert(boot.includes("doc.addEventListener('DOMContentLoaded',finishLoad"),
 'Não esperar window.load com 246 imagens para liberar o Premium');
assert(boot.includes("host.fetch('scout-build-info.json',{cache:'no-store'})"),
 'Diagnóstico precisa ler fingerprint embarcado sem cache');
assert(boot.includes("version")&&boot.includes("git_revision"));
assert(boot.includes("doc.body.dataset.ctUiBoot=mode"));
assert(boot.includes("writeProof(mode)"));
assert(cache.includes('v356-native-entry'));
for(const required of ['index.html','app-bridge.js','scout-ui-v189.js','scout-ui-v189.css',
 'craque-ui-bootstrap-v351.js','craque-visual-system-v234.css']){
 assert(stamp.includes("'"+required+"'"),'Paridade Android/Windows: '+required);
}
for(const forbidden of ['localStorage.clear(', 'indexedDB.deleteDatabase(', 'caches.delete(']){
 assert(!boot.includes(forbidden)&&!ui.includes(forbidden),
 'A correção visual não pode apagar dados: '+forbidden);
}
// V356: simulação do DOM no Android. O evento "load" nunca será emitido;
// CSS e home já estão prontos em DOMContentLoaded: devemos liberar o Premium.
const vm=require('node:vm');
const api=require('../web/craque-ui-bootstrap-v351.js');
const docEvents={},hostEvents={},frames=[],classes=new Set(['ct-v351-boot']);
const badge={dataset:{},textContent:''},body={dataset:{page:'catalog',scoutV189:'1'},
 setAttribute(){},removeAttribute(){}};
const doc={
 readyState:'loading',body,
 documentElement:{classList:{
  contains:name=>classes.has(name),remove:name=>classes.delete(name)
 }},
 querySelector:selector=>selector==='.scout-v189-home'?{}:null,
 querySelectorAll:selector=>selector==='link[rel="stylesheet"]'
  ?api.REQUIRED.map(name=>({sheet:{},getAttribute:()=>name})):[],
 getElementById:()=>badge,
 addEventListener:(name,fn)=>{docEvents[name]=fn}
};
const host={
 document:doc,
 addEventListener:(name,fn)=>{hostEvents[name]=fn},
 requestAnimationFrame:fn=>{frames.push(fn)},
 setTimeout:()=>0
};
api.init(host);
assert(classes.has('ct-v351-boot'));
docEvents['scoutpro:ui-ready']();
assert(classes.has('ct-v351-boot'),'DOM incompleto não libera Premium');
doc.readyState='interactive';
docEvents.DOMContentLoaded();
assert.equal(frames.length,1,'O DOM pronto agenda primeira pintura');
frames.shift()();frames.shift()();
assert.equal(body.dataset.ctUiBoot,'premium');
assert.equal(classes.has('ct-v351-boot'),false);
assert.equal(badge.dataset.status,'premium');
assert(hostEvents.load,'O fallback load pode existir, mas NÃO deve ser exigido');
const validVersion=vm.runInNewContext(
 boot.split('installed=')[1].split('.test(version)')[0]
);
assert(validVersion instanceof Object || typeof validVersion.test==='function');
assert(validVersion.test('1.1.1004'),'Versão real do APK deve ser reconhecida');
assert(!validVersion.test('source-unbuilt'));
console.log('V356 PASS: entrada Premium estática, resgate Android, versão real visível, nenhuma carta alterada e pacote único.');
