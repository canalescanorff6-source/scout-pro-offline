(function(){
'use strict';
const $=(s,root=document)=>root.querySelector(s), $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
const fold=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
// V332: a abertura mostra quatro caminhos principais; ferramentas secundárias
// permanecem acessíveis, sem excluir links ou alterar armazenamento.
if(document.body.dataset.page==='catalog'){
 const actions=document.querySelector('.hero-actions');
 if(actions && !actions.querySelector('.hero-more-tools')){
  const links=Array.from(actions.querySelectorAll(':scope > a[href]'));
  const destinations=[
   link=>link.getAttribute('href')==='#catalogo',
   link=>/meu-time-duas-formacoes/.test(link.getAttribute('href')||''),
   link=>/outros-elencos/.test(link.getAttribute('href')||''),
   link=>/meu-time-testes/.test(link.getAttribute('href')||'')
  ];
  const primary=destinations.map(match=>links.find(match)).filter(Boolean);
  const remaining=links.filter(link=>!primary.includes(link));
  if(primary.length===4 && remaining.length){
   const details=document.createElement('details');
   details.className='hero-more-tools';
   const summary=document.createElement('summary');
   summary.textContent='Mais ferramentas e análises ('+remaining.length+')';
   const tools=document.createElement('div');
   tools.className='hero-more-links';
   remaining.forEach(link=>tools.appendChild(link));
   details.append(summary,tools);
   primary.forEach(link=>actions.appendChild(link));
   actions.appendChild(details);
  }
 }
}
if(document.body.dataset.page==='catalog'){
 const cards=Array.from(document.querySelectorAll('.player-card')), search=$('#search'), sort=$('#sort'), styleSelect=$('#style-filter'), count=$('#shown-count'), allcount=$('#all-count'), more=$('#more'), none=$('#none');
 const grid=$('#cards'), foldedSearch=new Map(cards.map(el=>[el,fold(el.dataset.search)]));
 let role='TODOS', rarity='TODAS', style='TODOS', limit=30, filtered=[];
 const buttonState=(root,value)=>{Array.from(root.querySelectorAll('.filter')).forEach(btn=>{const on=btn.dataset.value===value;btn.classList.toggle('active',on);btn.setAttribute('aria-pressed',on?'true':'false')})};
 const apply=()=>{
  const q=fold(search.value.trim());
  filtered=cards.filter(el=>(role==='TODOS'||el.dataset.role===role)&&(rarity==='TODAS'||el.dataset.rarity===rarity)&&(style==='TODOS'||el.dataset.style===style||el.dataset.styleDefense===style)&&foldedSearch.get(el).includes(q));
  const key=sort.value;
  filtered.sort((a,b)=>key==='alpha'?a.dataset.name.localeCompare(b.dataset.name,'pt-BR'):key==='reverse'?Number(b.dataset.cap)-Number(a.dataset.cap):key==='position'?((window.SCOUT_POSITION_ORDER?.[a.dataset.position]??99)-(window.SCOUT_POSITION_ORDER?.[b.dataset.position]??99)||Number(a.dataset.cap)-Number(b.dataset.cap)):Number(a.dataset.cap)-Number(b.dataset.cap));
  const visible=filtered.slice(0,limit), active=new Set(visible);
  // V243: não reescrever 246 atributos hidden e não mover 30 cards em todo input.
  // Só alterar visibilidade de fato; a ordem existente é preservada quando igual.
  cards.forEach(el=>{const show=active.has(el);if(el.hidden===show)el.hidden=!show});
  const ordered=Array.from(grid?.children||[]).filter(el=>active.has(el));
  if(ordered.length!==visible.length||visible.some((el,i)=>ordered[i]!==el)){
   // Uma inserção em lote diminui layouts e notificações de MutationObserver.
   const fragment=typeof document.createDocumentFragment==='function'?document.createDocumentFragment():null;
   for(const el of visible)(fragment||grid).appendChild(el);
   if(fragment)grid.appendChild(fragment);
  }
  count.textContent=visible.length;allcount.textContent=filtered.length;
  more.hidden=filtered.length<=limit;none.hidden=filtered.length!==0;
 };
 $$('.filter', $('#roles')).forEach(btn=>btn.addEventListener('click',()=>{role=btn.dataset.value;buttonState($('#roles'),role);limit=30;apply()}));
 $$('.filter', $('#rarities')).forEach(btn=>btn.addEventListener('click',()=>{rarity=btn.dataset.value;buttonState($('#rarities'),rarity);limit=30;apply()}));
 styleSelect?.addEventListener('change',()=>{style=styleSelect.value;limit=30;apply()});
 search.addEventListener('input',()=>{limit=30;apply()}); sort.addEventListener('change',()=>{limit=30;apply()});
 more.addEventListener('click',()=>{limit+=30;apply()});
 const registerOwned=()=>{
  if(!window.CRAQUE_OWNED_V364)return;
  for(const el of document.querySelectorAll('[data-owned-id]')){
   if(cards.includes(el))continue;
   const c=window.CRAQUE_OWNED_V364.cards.find(c=>c.key===el.dataset.ownedId);if(!c)continue;
   el.dataset.cap=String(247+window.CRAQUE_OWNED_V364.cards.indexOf(c));el.dataset.name=c.name;
   const position=c.position==='ZC'?'ZG':c.position;
   el.dataset.role=position;el.dataset.position=position;el.dataset.rarity='PENDENTE';el.dataset.style=c.style;el.dataset.styleDefense=c.secondaryStyle||'';
   el.dataset.search=[c.name,c.key==='ct364-14'?'Diego Forlán Diego Forlan':'',c.style,c.secondaryStyle,c.position,position].join(' ');
   cards.push(el);foldedSearch.set(el,fold(el.dataset.search));grid.append(el);
  }
  window.CRAQUE_CATALOG_V379.owned=true;
  const old=document.getElementById('ct364-owned-section');if(old){old.hidden=true;old.dataset.integrated='true';}
  const legacy=document.getElementById('ct365-review');if(legacy&&!document.getElementById('ct379-archive')){const archive=document.createElement('details');archive.id='ct379-archive';const summary=document.createElement('summary');summary.textContent='Conferência anterior das 15 cartas · histórico';archive.append(summary,legacy);document.getElementById('catalogo').append(archive);}
  for(const root of [document.getElementById('roles'),document.getElementById('style-filter')]){
   if(!root)continue;for(const node of root.children){const v=node.dataset.value||node.value;
    if(root.id==='roles')node.textContent=(v==='TODOS'?'Todos':v)+' · '+cards.filter(c=>v==='TODOS'||c.dataset.role===v).length;
    else node.textContent=(v==='TODOS'?'Todos os estilos':v)+' · '+cards.filter(c=>v==='TODOS'||c.dataset.style===v||c.dataset.styleDefense===v).length;
   }
  }
  if(styleSelect)for(const value of new Set(cards.flatMap(c=>[c.dataset.style,c.dataset.styleDefense]).filter(Boolean))){
   if(!Array.from(styleSelect.options).some(o=>o.value===value)){const o=document.createElement('option');o.value=value;o.textContent=value+' · '+cards.filter(c=>c.dataset.style===value||c.dataset.styleDefense===value).length;styleSelect.append(o);}
  }
  const rarities=document.getElementById('rarities');
  if(rarities&&!rarities.querySelector('[data-value=\"PENDENTE\"]')){const b=document.createElement('button');b.type='button';b.className='filter rarity';b.dataset.value='PENDENTE';b.textContent='A conferir';b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>{rarity='PENDENTE';buttonState(rarities,rarity);limit=30;apply()});rarities.append(b);}
  apply();
 };
 window.CRAQUE_CATALOG_V379={owned:false,refresh:apply,registerOwned};
 const refreshReviewed=async()=>{
  const R=window.CRAQUE_CARD_REVIEW_V379;if(!R)return;
  try{const response=await fetch('SCOUT_V69_AUDITORIA.json');if(!response.ok)return;const data=await response.json();
   const own=window.CRAQUE_OWNED_V364?.cards||[];const descriptors=new Map(R.catalog(data.cards,own).map(c=>[c.key,c]));
   for(const el of cards){const key=el.dataset.ownedId||'cap:'+el.dataset.cap;const descriptor=descriptors.get(key);if(!descriptor)continue;
    const row=R.read(localStorage,descriptor,true);if(!row)continue;
    if(row.rarity)el.dataset.rarity=row.rarity;if(row.attackStyle)el.dataset.style=row.attackStyle;if(row.defenceStyle)el.dataset.styleDefense=row.defenceStyle;
    foldedSearch.set(el,fold(el.dataset.search+' '+[row.rarity,row.attackStyle,row.defenceStyle,row.cardId,row.edition].join(' ')));
   }apply();
  }catch(_){/* Catálogo original permanece disponível se o registro local falhar. */}
 };
 window.addEventListener('craque:owned-cards-ready',refreshReviewed);refreshReviewed();
 window.addEventListener('craque:owned-cards-ready',registerOwned);
 registerOwned();
 const hash=new URLSearchParams(location.search);if(hash.has('q'))search.value=hash.get('q');
 if(styleSelect&&hash.has('style')&&Array.from(styleSelect.options).some(opt=>opt.value===hash.get('style'))){style=hash.get('style');styleSelect.value=style}
 if(hash.has('role') && $(`.filter[data-value="${hash.get('role')}"]`,$('#roles'))){role=hash.get('role');buttonState($('#roles'),role)}
 apply();
}
$$('.build-tab').forEach(btn=>btn.addEventListener('click',()=>{
 const type=btn.dataset.plan; $$('.build-tab').forEach(b=>{b.classList.toggle('active',b.dataset.plan===type);b.setAttribute('aria-selected',b.dataset.plan===type?'true':'false')});
 $$('.build-plan').forEach(el=>el.hidden=el.dataset.plan!==type);
 const note=$('#stats-variant-note');if(note)note.hidden=type==='A';
}));
})();