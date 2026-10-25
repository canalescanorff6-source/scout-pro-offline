/* Craque Tático V364 — insere 15 cartas próprias no MESMO catálogo principal.
 * Nenhuma mutação em SCOUT_V69_AUDITORIA.json, fichas/ ou localStorage.
 * Render síncrono antes de premium.js para busca, ordenação, filtro e contagem comuns.
 */
(function(root){'use strict';
 const doc=root.document;if(!doc||doc.body?.dataset.page!=='catalog')return;
 const host=doc.getElementById('cards');
 if(!host)return;
 const ITEMS=[{"numero":247,"name":"K. Karetsas","image":"cartas/novas/ct364_Karetsas.webp","position":"MAT","style":"Armador criativo","secondary":"Interceptador de passe","level":31,"pp":60},{"numero":248,"name":"Ethan Nwaneri","image":"cartas/novas/ct364_Nwaneri.webp","position":"SA","style":"Atacante pivô","secondary":"Ladrão no ataque","level":35,"pp":68},{"numero":249,"name":"Jobe Bellingham","image":"cartas/novas/ct364_Jobe_Bellingham.webp","position":"MLG","style":"Meia versátil","secondary":"Meia versátil","level":33,"pp":64},{"numero":250,"name":"Nico Schlotterbeck","image":"cartas/novas/ct364_Schlotterbeck.webp","position":"ZC","style":"Defensor criativo","secondary":"Cobertura","level":29,"pp":56},{"numero":251,"name":"Julian Ryerson","image":"cartas/novas/ct364_Ryerson.webp","position":"LD","style":"Lateral ofensivo","secondary":"O destruidor","level":35,"pp":68},{"numero":252,"name":"Waldemar Anton","image":"cartas/novas/ct364_Anton.webp","position":"ZC","style":"Defensor criativo","secondary":"Mestre da linha alta","level":29,"pp":56},{"numero":253,"name":"Gregor Kobel","image":"cartas/novas/ct364_Kobel.webp","position":"GO","style":"Goleiro adiantado","secondary":"Goleiro ofensivo","level":29,"pp":56},{"numero":254,"name":"Daniel Svensson","image":"cartas/novas/ct364_Svensson.webp","position":"LE","style":"Lateral ofensivo","secondary":"Cobertura","level":33,"pp":64},{"numero":255,"name":"Serhou Guirassy","image":"cartas/novas/ct364_Guirassy.webp","position":"CA","style":"Homem de área","secondary":"Saída ofensiva","level":31,"pp":60},{"numero":256,"name":"Felix Nmecha","image":"cartas/novas/ct364_Nmecha.webp","position":"MLG","style":"Meia versátil","secondary":"Meia versátil","level":32,"pp":62},{"numero":257,"name":"Ezequiel Fernández","image":"cartas/novas/ct364_Ezequiel.webp","position":"VOL","style":"Primeiro volante","secondary":"Primeiro volante","level":43,"pp":84},{"numero":258,"name":"Ivan Provedel","image":"cartas/novas/ct364_Provedel.webp","position":"GO","style":"Básico","secondary":"Goleiro ofensivo","level":29,"pp":56},{"numero":259,"name":"Aleksandar Pavlović","image":"cartas/novas/ct364_Pavlovic.webp","position":"VOL","style":"Primeiro volante","secondary":"Primeiro volante","level":33,"pp":64},{"numero":260,"name":"Diego Forlán","image":"cartas/novas/ct364_Forlan.webp","position":"CA","style":"Artilheiro","secondary":"Pressão no ataque","level":32,"pp":62},{"numero":261,"name":"Joane Gadou","image":"cartas/novas/ct364_Gadou.webp","position":"ZC","style":"Defensor criativo","secondary":"O destruidor","level":29,"pp":56}];
 const mk=(t,k,text)=>{const x=doc.createElement(t);if(k)x.className=k;if(text!==undefined)x.textContent=String(text);return x};
 const label=mk('aside','ct364-catalog-notice');
 label.id='ct364-catalog-notice';
 label.append(mk('strong','','Minhas Cartas · 246 originais + 15 novas edições'));
 label.append(mk('span','','As cartas #247–261 foram acrescentadas ao seu catálogo principal. PP calculados do nível exibido no eFHub; confirme o nível MÁXIMO no jogo antes de aplicar treinamentos.'));
 const meta=doc.querySelector('.list-meta');
 if(meta?.parentNode)meta.parentNode.insertBefore(label,meta);
 const more=doc.getElementById('more');if(more)more.title='Carregar também suas cartas adicionais #247–261';
 for(const c of ITEMS){
  if(host.querySelector('[data-cap="'+c.numero+'"]'))continue;
  const card=mk('a','player-card ct364-card');
  card.href='minhas-cartas-v364.html?c='+c.numero;
  card.dataset.cap=String(c.numero);
  card.dataset.name=c.name;
  card.dataset.position=c.position;
  card.dataset.role=c.position;
  card.dataset.rarity='PENDENTE';
  card.dataset.style=c.style;
  card.dataset.styleDefense=c.secondary;
  card.dataset.search=[c.name,c.position,c.style,c.secondary,'efootball 2027',c.numero,'adicional','minhas cartas'].join(' ');
  const art=mk('div','card-art'),no=mk('span','mini-cap','#'+c.numero),rarity=mk('span','mini-rarity','EDIÇÃO NOVA');
  const img=mk('img');img.src=c.image;img.loading='lazy';img.decoding='async';img.alt='Arte original recortada da carta de '+c.name;
  art.append(no,rarity,img);
  const body=mk('div','player-main'),role=mk('span','player-role',c.position+' · '+c.style),name=mk('div','player-name',c.name),version=mk('div','player-version','eFootball 2027 · edição/Card ID a conferir');
  const bottom=mk('div','player-bottom');
  bottom.append(mk('span','pp',c.pp+' PP*'),mk('span','status wait','● Nível '+c.level+' eFHub · verificar máximo'));
  body.append(role,name,version,bottom);
  card.append(art,body);host.append(card);
 }
 doc.body.dataset.ct364MainCards='15';
 root.CRAQUE_MINHAS_CARTAS_V364=Object.freeze({count:ITEMS.length,originals:246,total:246+ITEMS.length});
})(typeof window!=='undefined'?window:null);
