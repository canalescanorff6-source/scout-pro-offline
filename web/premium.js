(function(){
'use strict';
const $=(s,root=document)=>root.querySelector(s), $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
const fold=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
if(document.body.dataset.page==='catalog'){
 const cards=$$('.player-card'), search=$('#search'), sort=$('#sort'), count=$('#shown-count'), allcount=$('#all-count'), more=$('#more'), none=$('#none');
 let role='TODOS', rarity='TODAS', limit=30, filtered=[];
 const buttonState=(root,value)=>{$$('.filter',root).forEach(btn=>{const on=btn.dataset.value===value;btn.classList.toggle('active',on);btn.setAttribute('aria-pressed',on?'true':'false')})};
 const apply=()=>{
  const q=fold(search.value.trim());
  filtered=cards.filter(el=>(role==='TODOS'||el.dataset.role===role)&&(rarity==='TODAS'||el.dataset.rarity===rarity)&&fold(el.dataset.search).includes(q));
  const key=sort.value;
  filtered.sort((a,b)=>key==='alpha'?a.dataset.name.localeCompare(b.dataset.name,'pt-BR'):key==='reverse'?Number(b.dataset.cap)-Number(a.dataset.cap):key==='position'?((window.SCOUT_POSITION_ORDER?.[a.dataset.position]??99)-(window.SCOUT_POSITION_ORDER?.[b.dataset.position]??99)||Number(a.dataset.cap)-Number(b.dataset.cap)):Number(a.dataset.cap)-Number(b.dataset.cap));
  cards.forEach(el=>el.hidden=true);
  filtered.forEach((el,i)=>{if(i<limit){$('#cards').appendChild(el);el.hidden=false}});
  count.textContent=Math.min(limit,filtered.length);allcount.textContent=filtered.length;
  more.hidden=filtered.length<=limit;none.hidden=filtered.length!==0;
 };
 $$('.filter', $('#roles')).forEach(btn=>btn.addEventListener('click',()=>{role=btn.dataset.value;buttonState($('#roles'),role);limit=30;apply()}));
 $$('.filter', $('#rarities')).forEach(btn=>btn.addEventListener('click',()=>{rarity=btn.dataset.value;buttonState($('#rarities'),rarity);limit=30;apply()}));
 search.addEventListener('input',()=>{limit=30;apply()}); sort.addEventListener('change',()=>{limit=30;apply()});
 more.addEventListener('click',()=>{limit+=30;apply()});
 const hash=new URLSearchParams(location.search);if(hash.has('q'))search.value=hash.get('q');
 if(hash.has('role') && $(`.filter[data-value="${hash.get('role')}"]`,$('#roles'))){role=hash.get('role');buttonState($('#roles'),role)}
 apply();
}
$$('.build-tab').forEach(btn=>btn.addEventListener('click',()=>{
 const type=btn.dataset.plan; $$('.build-tab').forEach(b=>{b.classList.toggle('active',b.dataset.plan===type);b.setAttribute('aria-selected',b.dataset.plan===type?'true':'false')});
 $$('.build-plan').forEach(el=>el.hidden=el.dataset.plan!==type);
 const note=$('#stats-variant-note');if(note)note.hidden=type==='A';
}));
})();