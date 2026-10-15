/* Scout PRO V198 — ações visíveis sob demanda no desktop sem cobrir cartas.
   O MESMO nó #scout-app-bar mantém listeners, atualização e backup originais. */
(function(host){
 'use strict';
 function relocate(doc,wide){
  if(!doc?.body)return false;
  const bar=doc.getElementById('scout-app-bar');
  const right=doc.querySelector('.topbar .nav-right');
  if(!bar||!right)return false;
  let menu=doc.getElementById('scout-v198-tools');
  if(!menu){
   menu=doc.createElement('details');menu.id='scout-v198-tools';menu.className='scout-v198-tools';
   const summary=doc.createElement('summary');summary.textContent='Ferramentas';summary.setAttribute('aria-label','Abrir atualizações, backup e navegação do Scout PRO');
   menu.appendChild(summary);right.appendChild(menu);
  }
  if(wide){
   if(bar.parentElement!==menu)menu.appendChild(bar);
   menu.hidden=false;
   doc.body.classList.add('scout-v198-desktop-menu');
  }else{
   if(bar.parentElement===menu)doc.body.appendChild(bar);
   menu.open=false;menu.hidden=true;
   doc.body.classList.remove('scout-v198-desktop-menu');
  }
  return true;
 }
 const api=Object.freeze({relocate});
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(!host?.document)return;
 function setup(){
  const doc=host.document;
  if(!doc.querySelector('.topbar .nav-right')||!doc.getElementById('scout-app-bar'))return;
  const media=typeof host.matchMedia==='function'?host.matchMedia('(min-width:960px)'):{matches:false};
  const sync=()=>relocate(doc,!!media.matches);
  sync();
  if(typeof media.addEventListener==='function')media.addEventListener('change',sync);
  doc.addEventListener('click',event=>{
   const menu=doc.getElementById('scout-v198-tools');
   if(menu?.open&&!menu.contains(event.target))menu.open=false;
  });
  doc.addEventListener('keydown',event=>{
   const menu=doc.getElementById('scout-v198-tools');
   if(event.key==='Escape'&&menu?.open){menu.open=false;menu.querySelector('summary')?.focus();}
  });
  // Busca de catálogo: Enter vai para os resultados reais, sem criar outro campo nem alterar filtros.
  if(doc.body.dataset.page==='catalog'){
   const search=doc.getElementById('search');
   if(search)search.addEventListener('keydown',event=>{
    if(event.key!=='Enter'||!String(search.value||'').trim())return;
    const cards=[...doc.querySelectorAll('#cards .player-card')];
    const visible=cards.find(el=>{
     const style=host.getComputedStyle?.(el);
     return !el.hidden&&style?.display!=='none'&&style?.visibility!=='hidden';
    });
    if(!visible)return;
    event.preventDefault();
    visible.scrollIntoView?.({behavior:host.matchMedia?.('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'});
   });
  }
 }
 if(host.document.readyState==='loading')host.document.addEventListener('DOMContentLoaded',setup,{once:true});
 else setup();
})(typeof window!=='undefined'?window:null);
