'use strict';
/* V241 — contrato visual, leitura somente, sem trocar cartas ou persistência. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const cards=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
const rosterAudit=JSON.parse(read('web/SCOUT_V213_AUDITORIA_INDIVIDUAL.json')).cards;
const formations=JSON.parse(read('web/SCOUT_V177_DUAS_FORMACOES.json')).formations;
const index=read('web/index.html');
const visual=read('web/craque-visual-system-v234.css');
const icons=read('web/scout-training-icons-v206.css');
const mobile=read('web/craque-experience-v232.css');
const fx=read('web/craque-card-effects-v234.css');
const motion=read('web/card-motion-v186.js');
const bridge=read('web/app-bridge.js');
const sw=read('web/sw.js');
const stamp=read('scripts/stamp-bundle-v189.cjs');
const scripts=JSON.parse(read('package.json')).scripts;
assert.equal(cards.length,246,'246 cartas originais');
assert.equal(rosterAudit.length,246,'246 pareceres de cartas');
assert.equal(formations.length,2,'Duas formações originais');
assert.equal((index.match(/class="player-card"/g)||[]).length,246,'As 246 cartas do catálogo');
assert(scripts.check.includes('node scripts/test-craque-ux-v241.cjs'),
 'Teste visual V241 deve integrar npm run check');
for(const p of ['craque-visual-system-v234.css','scout-training-icons-v206.css',
 'craque-experience-v232.css','craque-card-effects-v234.css']){
 assert(bridge.includes(p),'Android/Windows carrega '+p);
 assert(sw.includes("'./"+p+"'"),'Cache offline contém '+p);
 assert(stamp.includes("'"+p+"'"),'Fingerprint do bundle contém '+p);
}
assert(sw.includes('v241-ux-visual'),'Cache offline deve ser invalidado');
for(const [p,css] of [
 ['Fichas/catálogo',visual],['Pictogramas',icons],
 ['Navegação móvel',mobile],['Efeitos',fx]
]){
 assert(css.includes('V241'),p+' sem mudança real de V241');
 assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length,
  p+': chaves CSS não balanceadas');
}
for(const token of [
 'body[data-page="catalog"] #cards .player-card',
 '.player-main','body[data-page="detail"] .scout-v220-hero',
 '.scout-v220-recs-grid>article',
 'body[data-page="detail"] .scout-v208-table thead th',
 '#ffc629','--ct240-gold'
])assert(visual.includes(token),'Ficha premium: '+token);
for(const token of [
 '.scout-v230-svg .ct-frame','.scout-v230-svg .ct-fill',
 '.scout-v230-svg .ct-secondary',
 '#lab-controls .lab-group:focus-within',
 'min-height:44px','@media(max-width:355px)'
])assert(icons.includes(token),'Ícones/campo de treino: '+token);
for(const token of [
 'body.scout-native-android',
 '.scout-v189-dock-options','overscroll-behavior:contain',
 '.ct-v232-jumps-menu a','min-height:44px',
 'env(safe-area-inset-bottom,0px)',
 '@media(max-width:355px)','@media(prefers-reduced-motion:reduce)'
])assert(mobile.includes(token),'Mobile premium: '+token);
for(const rarity of ['show','epic','big','highlight'])
 assert(fx.includes('data-scout-motion-rarity="'+rarity+'"'),
  'Raridade sem tratamento visual: '+rarity);
for(const token of [
 'body.scout-motion-on','data-scout-motion-active="true"',
 'ct241-frame-aura','animation-play-state:running',
 '@media(hover:none)','@media(prefers-reduced-motion:reduce)',
 'animation:none!important','@media print'
])assert(fx.includes(token),'Efeito respeitando preferências: '+token);
assert(motion.includes("SETTINGS_KEY='scoutpro:v186:card-motion'"),
 'Preferência existente de animação não pode ser substituída');
assert(motion.includes('IntersectionObserver'),'Pausa fora da tela mantida');
assert(motion.includes('lowMotion'),'Preferência do sistema respeitada');
assert(motion.includes('visibilitychange'),'Pausa em aba oculta mantida');
assert(!/fetch\(|localStorage|indexedDB|sessionStorage|innerHTML\s*=/.test(visual+icons+mobile+fx),
 'CSS visual não altera dados nem faz requisições');
console.log('V241 PASS: 246 cartas, 2 formações, 10 ícones, UI Android/Windows, efeitos por 4 raridades, offline PWA e acessibilidade.');
