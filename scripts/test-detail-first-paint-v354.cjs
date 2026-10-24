'use strict';
// V354: CSS no HTML de todas as 246 cartas protege o primeiro frame.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(base,f),'utf8');
const data=read('web/SCOUT_V69_AUDITORIA.json');
assert.equal(JSON.parse(data).cards.length,246);
const all=fs.readdirSync(path.join(base,'web/fichas')).filter(x=>x.endsWith('.html'));
assert.equal(all.length,246,'Exatamente 246 fichas originais, não substituídas');
for(const file of all){
 const html=read('web/fichas/'+file);
 assert(html.includes('data-page="detail"'),file+': data-page');
 assert(html.includes('href="../app-bridge.css"'),file+': CSS original carregado estaticamente');
 assert(html.includes('src="../app-bridge.js"'),file+': cabeçalho universal no script defer');
 assert(html.includes('class="brand-copy"'),file+': o cabeçalho existe');
}
const css=read('web/app-bridge.css'),js=read('web/app-bridge.js');
for(const token of ['body[data-page="detail"]','.topbar .brand-logo','.brand-logo-img',
 'assets/craque-tatico-icon.svg','--ct354-bg:#060d18','--ct354-gold:#f3cd77',
 ':focus-visible','prefers-reduced-motion:reduce']){
 assert(css.includes(token),'Primeira pintura Premium: '+token);
}
assert(!/display\s*:\s*none\s*!important/.test(css.split('/* V354')[1]));
assert(css.includes('html body[data-page="detail"]{'),
 'A primeira pintura deve prevalecer sobre CSS V230 carregado depois');
assert(css.includes('html body[data-page="detail"] .topbar'),
 'O cabeçalho também precisa vencer CSS legado assíncrono');
assert(js.includes("if(inCard&&document.body.dataset.page==='detail'"));
assert(js.includes("name.textContent='CRAQUE TÁTICO'"));
assert(js.includes("subtitle.textContent='LABORATÓRIO DE FUTEBOL'"));
assert(js.includes("logo.src='../assets/craque-tatico-icon.svg'"));
assert(js.includes('oldLogo.replaceWith(logo)'));
const before=read('web/SCOUT_V69_AUDITORIA.json');
assert.equal(before,data,'Sem alteração em Card ID, PP, artes ou builds');
console.log('V354 PASS: 246 fichas compartilham CSS de primeira pintura e cabeçalho CRAQUE TÁTICO, catálogo original intacto.');
