'use strict';
/* V206 — desenhos premium não tocam em PP, motor, IDs nem rótulos. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const orig=require('../web/scout-training-icons-v201.js');
const premium=require('../web/scout-training-icons-v206.js');
const labels=['Chute','Passe','Drible','Destreza','Força das pernas','Jogo aéreo','Defesa','Goleiro 1','Goleiro 2','Goleiro 3'];
assert.deepEqual(orig.CATEGORIES.map(x=>x[1]),labels,'Todos os rótulos originais das fichas');
assert.equal(Object.keys(premium.SHAPES).length,10);
assert.equal(new Set(Object.values(premium.SHAPES)).size,10,'Cada grupo tem figura própria');
for(const [key,label] of orig.CATEGORIES){
 const svg=premium.render(key);
 assert(svg.includes('data-scout-v206-symbol="'+key+'"'),'Identidade '+label);
 assert(svg.includes('class="scout-v201-svg scout-v206-svg"'),'Compatível com renderizador anterior');
 assert(svg.includes('viewBox="0 0 64 64"')&&svg.includes('aria-hidden="true"'));
 assert(svg.includes('<path')&&svg.includes('<rect')&&svg.includes('stroke='),'Vetor elaborado: '+label);
 assert(!/<(?:image|foreignObject|script|iframe|use)\b/i.test(svg),'Nada de arte externa');
 assert(!/(?:https?:\/\/|data:image|@import|<style)/i.test(svg),'Somente vetores offline');
 assert.equal(orig.keyFor(label+' 12'),key,'Grupos nativos intocados');
}
assert.equal(premium.render('inexistente'),'');
function fake(key){
 const attrs=new Map(),classes=new Set();
 return {
  nodeType:1,innerHTML:'SVG V201 anterior',
  parentElement:{getAttribute:k=>k==='data-scout-training-icon'?key:null},
  classList:{add:c=>classes.add(c)},getAttribute:k=>attrs.get(k),setAttribute:(k,v)=>attrs.set(k,v),
  attrs,classes
 };
}
const icon=fake('chute'),backup=icon.parentElement;
assert(premium.upgrade(icon));
assert(icon.innerHTML.includes('scout-v206-svg'));
assert.equal(icon.getAttribute('data-scout-v206'),'1');
assert.equal(icon.parentElement,backup,'Não substituir DOM/controles');
assert.equal(premium.upgrade(icon),false,'Upgrade idempotente');
assert.equal(premium.upgrade(fake('invalido')),false,'Nunca alterar um grupo desconhecido');
const js=read('web/scout-training-icons-v206.js'),css=read('web/scout-training-icons-v206.css');
assert(js.includes('MutationObserver')&&js.includes('addedNodes'),'Laboratório com rerender');
assert(!js.includes('localStorage')&&!js.includes('fetch('),'Camada somente visual');
for(const marker of ['#v188-train','#lab-controls','.lab-adjust','.v68-progress-row','#scout-training-v160']){
 assert(css.includes(marker),'Integração real com '+marker);
}
for(const marker of ['min-height:44px','@media(max-width:720px)','@media(max-width:355px)',':focus-visible','prefers-reduced-motion']){
 assert(css.includes(marker),'Usabilidade e acessibilidade: '+marker);
}
const sw=read('web/sw.js'),stamp=read('scripts/stamp-bundle-v189.cjs'),bridge=read('web/app-bridge.js');
for(const f of ['scout-training-icons-v206.js','scout-training-icons-v206.css']){
 assert(sw.includes("'./"+f+"'"),'Cache offline '+f);
 assert(stamp.includes("'"+f+"'"),'Fingerprint '+f);
 assert(bridge.includes("v189Root+'"+f+"'"),'Paridade Windows e Android '+f);
}
assert(sw.includes('v206-premium-training-icons'),'Cache incrementado');
assert.equal(fs.readdirSync(path.join(root,'web/fichas')).filter(x=>x.endsWith('.html')).length,246);
assert.equal((read('web/index.html').match(/class="player-card"/g)||[]).length,246);
console.log('V206 OK: dez desenhos únicos, 246 cartas, PP e controles preexistentes intactos, cache offline.');
