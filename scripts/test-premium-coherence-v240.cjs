'use strict';
/* V240 — impedir retorno de tons mint/turquesa ao sistema visual premium.
 * Integridade somente de leitura: não alterar cartas, fichas ou efeitos.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const theme=read('web/craque-visual-system-v234.css');
const filters=read('web/scout-finish-v203.css');
const icons=read('web/scout-training-icons-v206.css');
const effects=read('web/craque-card-effects-v234.css');
const bridge=read('web/app-bridge.js');
const catalog=read('web/index.html');
const roster=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
const packageJson=JSON.parse(read('package.json'));
assert.equal(roster.length,246);
assert.equal((catalog.match(/class="player-card"/g)||[]).length,246);
assert(packageJson.scripts.check.includes('scripts/test-premium-coherence-v240.cjs'));
for(const color of ['#060d18','#111f35','#f3cd77','#ffc629','#175c9f']){
 assert(theme.includes(color),'Falta tom da identidade V234/V240: '+color);
}
for(const selector of [
 'body[data-page="catalog"] .scout-v203-filter-panel',
 'body[data-page="detail"] :is(#lab-controls .lab-group',
 'body[data-page="rotation-lab"] :is(.scout-rotation-team-num',
 'body[data-page="friends"] :is(.friends-person',
 'body[data-page] :is(#scout-backup-modal,#scout-android-update-modal)',
 'body[data-page="detail"] .scout-v206-svg',
 'body[data-page="catalog"] #cards .player-card:hover',
 'var(--ct240-gold)','var(--ct240-stroke)'
])assert(theme.includes(selector),'Cobertura visual ausente: '+selector);
assert(theme.includes('Manter gramado reconhecível'),
 'A formação precisa preservar o gramado funcional.');
const reject=/#(?:00c853|00bd68|10d98b|35e4b9|53e5b8|52e3b8|48c8cd|88dac4|92e2ce|9edfd5|9adcca|aaeee0|a3e2d7)\b/i;
for(const [name,css] of [['Filtros',filters],['Ícones de treino',icons],['Camada V240',theme]]){
 assert(!reject.test(css),name+': verde/turquesa fluorescente reintroduzido');
 const opens=(css.match(/\{/g)||[]).length,closes=(css.match(/\}/g)||[]).length;
 assert.equal(opens,closes,name+': chaves CSS desequilibradas');
}
assert(icons.includes('[data-scout-training-icon="chute"]'));
assert(icons.includes('[data-scout-training-icon="drible"]'));
assert(icons.includes('[data-scout-training-icon="defesa"]'));
assert(icons.includes('[data-scout-training-icon="goleiro1"]'));
assert(icons.includes('min-height:44px'),'Controles de treino acessíveis no celular');
assert(filters.includes('#f3cd77'),'Filtro alinhado ao dourado do escudo');
assert(theme.includes('prefers-reduced-motion:reduce'));
assert(effects.includes('data-scout-motion-rarity="show"'));
assert(effects.includes('data-scout-motion-rarity="epic"'));
assert(effects.includes('data-scout-motion-rarity="big"'));
assert(effects.includes('data-scout-motion-rarity="highlight"'));
assert(bridge.includes("v189Root+'craque-visual-system-v234.css'"));
assert(bridge.includes("v189Root+'craque-card-effects-v234.css'"));
assert(read('web/assets/craque-tatico-icon.svg').includes('Craque Tático'));
console.log('V240 OK: azul noite/champagne em filtros, treino, fichas, formação, backup e outros elencos; 246 cartas, logo e 4 efeitos originais preservados.');
