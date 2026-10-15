'use strict';
/* V192 — regressão da ficha única e paridade visual. Sem alterar dados de jogadores. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..'),web=path.join(root,'web');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('web/scout-premium-v192.css'),bridge=read('web/app-bridge.js');
const skills=read('web/skills-booster-v162.js'),profile=read('web/scout-profile-v188.js');
const sw=read('web/sw.js'),stamp=read('scripts/stamp-bundle-v189.cjs');
const index=read('web/index.html');
assert(css.includes('scout-v192-unified-skills'),'Layout V192 precisa acomodar habilidades dentro da ficha');
assert(css.includes('@media(max-width:720px)')&&css.includes('@media(min-width:1025px)'),'Layout precisa cobrir mobile e Windows');
assert(css.includes('prefers-reduced-motion'),'Respeitar redução de animações');
assert(bridge.includes("v192Css.href=v189Root+'scout-premium-v192.css'"),'Mesmo visual nas 246 fichas e no catálogo');
assert(sw.includes("'./scout-premium-v192.css'")&&sw.includes('v192-premium'),'V192 offline e com cache renovado');
assert(stamp.includes("'scout-premium-v192.css'"),'V192 no fingerprint comum das duas plataformas');
assert(skills.includes("const unified=container.querySelector('#scout-v188-principal')"),'Habilidades devem ser inseridas na ficha real');
assert(skills.includes("skillsAnchor.insertAdjacentElement('beforebegin',section)"),'Skills devem vir antes do biotipo');
assert(skills.includes("unified.classList.add('scout-v192-unified-skills')"),'Marcação para CSS do layout unificado');
assert(skills.includes("if(after)after.insertAdjacentElement('afterend',section)"),'Fallback quando ficha antiga ainda não existir');
assert(skills.includes("const proposed=result.recommendations.slice(0,remaining)"),'Preservar cinco recomendações do motor original');
assert(profile.includes("id=\"v188-b1\"")&&profile.includes("id=\"v188-b2\""),'Preservar ambos os ímpetos de fonte');
assert.equal((index.match(/class="player-card"/g)||[]).length,246,'Não perder cards');
const dir=path.join(web,'fichas');
const names=fs.readdirSync(dir).filter(n=>n.endsWith('.html'));
assert.equal(names.length,246,'Não perder fichas');
for(const filename of names) {
 const html=fs.readFileSync(path.join(dir,filename),'utf8');
 assert(html.includes('app-bridge.js')&&html.includes('id="scout-v68-data"'),'Ficha preservada: '+filename);
}
console.log('V192 OK: home, 246 cartas, cinco habilidades na ficha única, dois ímpetos, CSS offline, paridade e acessibilidade.');
