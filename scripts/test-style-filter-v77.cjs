'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=path.resolve(__dirname,'..'),web=path.join(base,'web'),index=fs.readFileSync(path.join(web,'index.html'),'utf8');
const files=fs.readdirSync(path.join(web,'fichas')).filter(x=>/^\d{3}_.*\.html$/.test(x));
const cardTags=[...index.matchAll(/<a\b[^>]*class="player-card"[^>]*>/g)].map(m=>m[0]);
assert.equal(cardTags.length,246);assert.equal(files.length,246);
const tags=new Map();
for(const tag of cardTags){
 const cap=Number(tag.match(/\bdata-cap="(\d+)"/)?.[1]);
 const style=tag.match(/\bdata-style="([^"]*)"/)?.[1];
 assert(cap&&style,'Carta sem ID/estilo no catálogo: '+tag.slice(0,80));
 assert(!tags.has(cap),'Carta duplicada: '+cap);
 assert.equal((tag.match(/\bdata-style=/g)||[]).length,1,'data-style duplicado: '+cap);
 tags.set(cap,style);
}
let destruidores=0,goleiros=0,pendentes=0;
for(const file of files){
 const html=fs.readFileSync(path.join(web,'fichas',file),'utf8');
 const json=html.match(/<script[^>]*id="scout-v68-data"[^>]*>([\s\S]*?)<\/script>/i)?.[1];
 assert(json,'Dados ausentes '+file);
 const card=JSON.parse(json),style=tags.get(card.capture);
 assert.equal(style,card.playing_style,'Índice difere da ficha: '+card.capture+' '+card.name);
 if(card.attack_style==='Básico'&&card.defence_style==='Destruidor'){assert.equal(style,'Destruidor');destruidores++}
 if(card.attack_style==='Básico'&&/^Goleiro (ofensivo|defensivo)$/.test(card.defence_style)){assert.equal(style,card.defence_style);goleiros++}
 if(card.style_conflict){assert.equal(style,'A confirmar no jogo');pendentes++}
}
assert.equal(destruidores,12);assert.equal(goleiros,11);assert.equal(pendentes,3);
const js=fs.readFileSync(path.join(web,'premium.js'),'utf8');
const ui=fs.readFileSync(path.join(web,'position-order.js'),'utf8');
assert(js.includes("style==='TODOS'||el.dataset.style===style"),'Filtro não está integrado à busca');
assert(js.includes("styleSelect?.addEventListener('change'"),'Evento de seleção ausente');
assert(js.includes("hash.has('style')"),'Filtro por link ausente');
assert(ui.includes("select.id='style-filter'")&&ui.includes("counts.set(style,"),'Seletor ou contagem ausente');
// Amostragem determinística de combinação de filtros: posição, raridade e estilo.
const sample=(role,rarity,style,q)=>cardTags.filter(tag=>{
 const get=k=>tag.match(new RegExp('\\bdata-'+k+'="([^"]*)"'))?.[1]||'';
 return (role==='TODOS'||get('role')===role)&&
  (rarity==='TODAS'||get('rarity')===rarity)&&
  (style==='TODOS'||get('style')===style)&&get('search').toLowerCase().includes(q.toLowerCase());
});
assert.equal(sample('TODOS','TODAS','Destruidor','').length,
 [...tags.values()].filter(x=>x==='Destruidor').length);
assert.equal(sample('TODOS','TODAS','TODOS','').length,246);
assert.equal(sample('TODOS','TODAS','A confirmar no jogo','').length,
 [...tags.values()].filter(x=>x==='A confirmar no jogo').length);
assert(sample('MLG','TODAS','Destruidor','').length>0,'MLG Destruidor invisível');
assert(sample('VOL','TODAS','Destruidor','').length>0,'VOL Destruidor invisível');
assert(sample('ZC','TODAS','Destruidor','').length>0,'ZC Destruidor invisível');
console.log('V77 OK: 246 estilos cruzados com fichas; filtros combinados; Destruidor 12; goleiros 11; conflitos 3.');
