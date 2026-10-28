'use strict';
/* V360 — UX leve + auditoria não destrutiva das 246 cartas. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const index=read('web/index.html'),friends=read('web/outros-elencos-v227.html');
const page=read('web/craque-friends-page-v227.js'),bridge=read('web/app-bridge.js');
const nav=read('web/scout-ui-v189.js'),css=read('web/craque-ux-lite-v360.css');
const focus=read('web/craque-detail-focus-v360.js');
const sw=read('web/sw.js'),stamp=read('scripts/stamp-bundle-v189.cjs');
const audit=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
assert.equal(audit.length,246);
assert.equal((index.match(/class="player-card"/g)||[]).length,246);
assert(index.includes('craque-ux-lite-v360.css" data-ct360-final="true"'));
assert(friends.includes('craque-ux-lite-v360.css" data-ct360-final="true"'));
assert(bridge.includes('document.head.appendChild(ct360Final)'));
assert(sw.includes("'./craque-ux-lite-v360.css'")&&sw.includes('v360-ux-lite'));
assert(sw.includes("'./craque-detail-focus-v360.js'")&&stamp.includes("'craque-detail-focus-v360.js'"));
assert(bridge.includes("focus360.src=v189Root+'craque-detail-focus-v360.js'"));
assert(focus.includes("'performance'")&&focus.includes("'status'")&&
 focus.includes("'hashchange'")&&focus.includes("details.ct360-card-extra"));
assert(css.includes('ct360-card-quick')&&css.includes('ct360-card-extra'));
new vm.Script(focus);
assert(stamp.includes("'craque-ux-lite-v360.css'"));
assert(nav.includes("scout-v360-dock-friends")&&nav.includes('outros-elencos-v227.html'));
assert(friends.includes('id="friend-owner-jump"'));
assert(page.includes("quick.addEventListener('change'")&&page.includes('selectOwner(quick.value)'));
assert(friends.includes('friend-card-advanced')&&page.includes("dialog.querySelector('.friend-card-advanced')"));
assert(friends.includes('id="friend-analysis-modes"')&&friends.includes('id="friend-analysis-sections"'));
for(const id of ['friend-card-name','friend-card-position','friend-card-level','friend-card-pp',
 'friend-card-skills','friend-card-booster','friend-card-native','friend-card-training-levels',
 'friend-card-notes','friend-photo','friend-card-id','friend-dialog-save'])
 assert(friends.includes('id="'+id+'"'),'Campo original preservado: '+id);
for(const tag of ['catalog','detail','friends'])assert(css.includes('body[data-page="'+tag+'"]'));
assert(!/\blocalStorage\b|\bsessionStorage\b|\bindexedDB\b/.test(css));
assert(bridge.includes('window.CRAQUE_MOTION_PAUSED_V360=true'));
for(const filepath of ['web/card-motion-v186.js','web/craque-card-effects-v234.js']){
 const script=read(filepath);
 assert(script.includes('if(host.CRAQUE_MOTION_PAUSED_V360)return;'));
 const host={document:{},CRAQUE_MOTION_PAUSED_V360:true};
 vm.runInNewContext(script,{window:host,module:{exports:{}},console},{timeout:3000});
 assert.equal(Object.keys(host).length,2,'O módulo pausado não deve tocar o DOM: '+filepath);
}
const ppCost=n=>{let total=0;for(let k=0;k<n;k++)total+=1+Math.floor(k/4);return total};
let explicit=0,undocumented=0,trainVerified=0,trainMissing=0;
for(const card of audit){
 assert(Number.isInteger(card.pp)&&card.pp>=0,'PP impossível: #'+card.numero);
 if(Number.isInteger(card.max_level)){
  explicit++;
  assert.equal(card.pp,2*(card.max_level-1),'PP incompatível com nível comprovado: #'+card.numero);
 }else undocumented++;
 if(card.niveis===null){trainMissing++;continue;}
 assert(Array.isArray(card.niveis)&&card.niveis.length===10,'10 grupos de treino necessários: #'+card.numero);
 assert(card.niveis.every(n=>Number.isInteger(n)&&n>=0&&n<=20));
 assert.equal(card.niveis.reduce((v,n)=>v+ppCost(n),0),card.pp,'Custo do treino divergente: #'+card.numero);
 trainVerified++;
}
assert.equal(explicit+undocumented,246);
assert.equal(trainVerified+trainMissing,246);
console.log('V360 PASS: navegação simples, 246 cartas intactas, efeitos pausados, PP auditados.');
console.log('Documentados nível máximo: '+explicit+'; sem nível máximo explícito: '+undocumented+
 '; builds com custo matemático conferido: '+trainVerified+'; sem níveis de treino: '+trainMissing+'.');
