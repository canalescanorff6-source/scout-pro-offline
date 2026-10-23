'use strict';
// V332: verifica que a navegação premium preserva acesso a todos os atalhos.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'web/index.html'),'utf8');
const js=fs.readFileSync(path.join(root,'web/premium.js'),'utf8');
const css=fs.readFileSync(path.join(root,'web/premium.css'),'utf8');
const section=html.match(/<div class="hero-actions">([\\s\\S]*?)<\\/div>/);
assert(section,'Área de atalhos não encontrada');
const links=[...section[1].matchAll(/<a\\b[^>]*href="([^"]+)"/g)].map(m=>m[1]);
assert(links.length>4,'A página deve manter os atalhos avançados');
for(const destination of ['#catalogo','meu-time-duas-formacoes-v177.html','outros-elencos-v227.html','meu-time-testes-v219.html']){
 assert(links.includes(destination),'Atalho principal ausente: '+destination);
}
assert(js.includes('hero-more-tools')&&js.includes('remaining.forEach(link=>tools.appendChild(link))'));
assert(js.includes('primary.length===4 && remaining.length'));
assert(css.includes('.hero-more-tools summary:focus-visible'));
assert(css.includes('min-height:44px'));
console.log('V332: quatro atalhos prioritários e ferramentas avançadas preservadas.');
