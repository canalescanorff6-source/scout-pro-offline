'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=path.resolve(__dirname,'..'),web=path.join(base,'web'),index=fs.readFileSync(path.join(web,'index.html'),'utf8');
const files=fs.readdirSync(path.join(web,'fichas')).filter(x=>/^\d{3}_.*\.html$/.test(x));
const cardTags=[...index.matchAll(/<a\b[^>]*class="player-card"[^>]*>/g)].map(m=>m[0]);
assert.equal(cardTags.length,246);assert.equal(files.length,246);
const tags=new Map();
const field=(tag,key)=>tag.match(new RegExp('\\bdata-'+key+'="([^"]*)"'))?.[1]||'';
for(const tag of cardTags){
 const cap=Number(field(tag,'cap')),style=field(tag,'style'),defense=field(tag,'style-defense');
 assert(cap&&style,'Carta sem ID/estilo: '+tag.slice(0,80));
 assert(!tags.has(cap),'Carta duplicada '+cap);
 assert.equal((tag.match(/\bdata-style=/g)||[]).length,1);
 assert.equal((tag.match(/\bdata-style-defense=/g)||[]).length,1);
 tags.set(cap,{style,defense,tag});
}
let basicDestruidor=0,keepers=0,dual=0;
const confirmed=new Map([[149,['Jan Paul van Hecke','Defensor criativo','Destruidor']],[150,['Ibrahima Konaté','Defensor criativo','Destruidor']],[237,['Piero Hincapié','Lateral defensivo','Destruidor']]]);
for(const file of files){
 const html=fs.readFileSync(path.join(web,'fichas',file),'utf8');
 const data=JSON.parse(html.match(/<script[^>]*id="scout-v68-data"[^>]*>([\s\S]*?)<\/script>/i)?.[1]||'null');
 assert(data&&tags.has(data.capture),'Ficha/card ausente: '+file);
 const entry=tags.get(data.capture);
 assert.equal(entry.style,data.playing_style,'Filtro difere da ficha '+file);
 assert.equal(entry.defense,data.dual_playing_style?data.defence_style:'','Filtro secundário indevido '+file);
 if(data.attack_style==='Básico'&&data.defence_style==='Destruidor'){basicDestruidor++;assert.equal(entry.style,'Destruidor')}
 if(data.attack_style==='Básico'&&/^Goleiro (ofensivo|defensivo)$/.test(data.defence_style)){keepers++;assert.equal(entry.style,data.defence_style)}
 if(confirmed.has(data.capture)){
  dual++;
  const [name,attack,defense]=confirmed.get(data.capture);
  assert.deepEqual([data.name,data.attack_style,data.defence_style],[name,attack,defense]);
  assert.equal(data.dual_playing_style,true);
  assert.deepEqual(data.playing_styles,[attack,defense]);
  assert.equal(data.style_conflict,false);
  assert.equal(entry.style,attack);assert.equal(entry.defense,defense);
  assert(entry.tag.includes('defesa'),'Descrição defensiva ausente');
 }
}
assert.equal(basicDestruidor,12);assert.equal(keepers,11);assert.equal(dual,3);
const js=fs.readFileSync(path.join(web,'premium.js'),'utf8');
const ui=fs.readFileSync(path.join(web,'position-order.js'),'utf8');
assert(js.includes('el.dataset.styleDefense===style'),'Filtro defensivo ausente');
assert(js.includes("styleSelect?.addEventListener('change'"),'Evento de filtro ausente');
assert(ui.includes('el.dataset.styleDefense')&&ui.includes('new Set([primary'),'Contagem de dois estilos ausente');
const sample=(role,rarity,style,q)=>cardTags.filter(tag=>
 (role==='TODOS'||field(tag,'role')===role)&&
 (rarity==='TODAS'||field(tag,'rarity')===rarity)&&
 (style==='TODOS'||field(tag,'style')===style||field(tag,'style-defense')===style)&&
 field(tag,'search').toLowerCase().includes(q.toLowerCase()));
assert.equal(sample('TODOS','TODAS','TODOS','').length,246);
assert.equal(sample('TODOS','TODAS','Destruidor','').length,15,'Destruidor deve incluir os três duplos');
assert.equal(sample('TODOS','TODAS','A confirmar no jogo','').length,0,'As três cartas foram confirmadas');
for(const [cap,[name,attack,defense]] of confirmed){
 assert(sample('TODOS','TODAS',attack,'').some(tag=>Number(field(tag,'cap'))===cap),name+' ausente do filtro ofensivo');
 assert(sample('TODOS','TODAS',defense,'').some(tag=>Number(field(tag,'cap'))===cap),name+' ausente do filtro defensivo');
}
assert(sample('MLG','TODAS','Destruidor','').length>0);
assert(sample('VOL','TODAS','Destruidor','').length>0);
assert(sample('ZC','TODAS','Destruidor','').length>0);
console.log('V79 OK: 246 cartas, 15 Destruidores (12 + 3 duplos), três estilos ofensivos/defensivos confirmados; zero conflitos.');
