'use strict';
/* Scout PRO V202 — a primeira tela deve mostrar o catálogo sem apagar funções.
 * O CSS só altera apresentação, não PP, fichas, cartas nem lógica de eventos. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('web/scout-finish-v202.css'),bridge=read('web/app-bridge.js');
const sw=read('web/sw.js'),stamp=read('scripts/stamp-bundle-v189.cjs');
assert(css.includes('@media(max-width:720px)')&&css.includes('@media(min-width:1200px)'),'Layouts Android/Windows explícitos');
assert(css.includes('.scout-v189-quick')&&css.includes('repeat(4,minmax(0,1fr))'),'4 ações desktop na primeira linha');
assert(css.includes('.scout-v189-quick')&&css.includes('repeat(2,minmax(0,1fr))'),'4 ações mobile em 2 linhas');
assert(css.includes('.scout-v189-intro{display:none!important}'),'Remover texto redundante mantendo links');
assert(css.includes('.scout-v189-extra[open]'),'Ferramentas expansíveis permanecem');
assert(css.includes('.scout-v189-about'),'Metodologia continua acionável');
assert(css.includes('.hero h1 em{display:block!important}'),'Título mobile não pode concatenar CADA CARTA.SEU');
assert(css.includes('.scout-v192-search-shell')&&css.includes('focus-within'),'Campo real e foco preservados');
assert(css.includes('.profile-content>.mobile-profile'),'Arte mantida com proporção mais compacta');
assert(css.includes('#scout-card-navigator>button'),'Navegação preservada');
assert(!css.includes('body{display:none')&&!css.includes('.player-card{display:none'),'Elenco não pode ser escondido');
assert(bridge.includes("v202Css.href=v189Root+'scout-finish-v202.css'"));
assert(sw.includes("'./scout-finish-v202.css'")&&sw.includes('v202-first-viewport'));
assert(stamp.includes("'scout-finish-v202.css'"));
const html=read('web/index.html');
for(const href of ['#catalogo','revisao-impetos-v103.html','meu-time-duas-formacoes-v177.html'])
 assert(bridge.includes('scout-ui-v189.js')&&
   (read('web/scout-ui-v189.js').includes(href)||html.includes('href="'+href+'"')),
  'Atalho ou ferramenta avançada deve continuar: '+href);
assert.equal((html.match(/class="player-card"/g)||[]).length,246);
assert.equal(fs.readdirSync(path.join(root,'web/fichas')).filter(x=>x.endsWith('.html')).length,246);
const old=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
assert.equal(old.length,246);
console.log('V202 OK: visual Android/Windows responsivo, quatro atalhos, busca real, ferramentas e 246 fichas intactas.');
