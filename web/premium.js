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