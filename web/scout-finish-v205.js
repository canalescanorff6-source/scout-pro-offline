/* Scout PRO V205: busca e filtros claros, sem substituir o motor ou duplicar controles. */
(function(host){
 'use strict';
 function summarize(state){
  const q=String(state.query||'').trim();
  const role=String(state.role||'TODOS');
  const rarity=String(state.rarity||'TODAS');
  const sort=String(state.sort||'cap');
  const style=String(state.style||'TODOS');
  const count=Math.max(0,Number(state.count)||0);
  const parts=[];
  const full=[];
  if(q){
   const compact=q.length>18?q.slice(0,18)+'…':q;
   parts.push('Busca: '+compact);
   full.push('Busca: '+q);
  }
  if(role!=='TODOS'){
   parts.push(role);
   full.push('Posição: '+(state.roleLabel||role));
  }
  if(rarity!=='TODAS'){
   parts.push(rarity);
   full.push('Raridade: '+rarity);
  }
  if(style!=='TODOS'){
   parts.push('Estilo: '+style);
   full.push('Estilo: '+style);
  }
  if(sort!=='cap'){
   parts.push(sort==='alpha'?'Nome A–Z':sort==='reverse'?'Recentes':String(state.sortLabel||sort));
   full.push('Ordem: '+String(state.sortLabel||sort));
  }
  if(!parts.length){
   return {active:false,label:'Todas as cartas · filtros opcionais',full:'Nenhum filtro ativo'};
  }
  const quantity=count===1?'1 carta':count+' cartas';
  return {active:true,label:quantity+' · '+parts.join(' · '),full:quantity+'; '+full.join('; ')};
 }
 function build(doc){
  if(!doc?.body||doc.body.dataset.page!=='catalog')return false;
  if(doc.getElementById('scout-v205-clear'))return true;
  const panel=doc.getElementById('scout-v203-filter-panel');
  const meta=doc.querySelector('#catalogo .list-meta');
  const empty=doc.getElementById('none');
  const search=doc.getElementById('search');
  const roles=doc.getElementById('roles');
  const rarities=doc.getElementById('rarities');
  const sort=doc.getElementById('sort');
  const count=doc.getElementById('all-count');
  const status=panel?.querySelector('.scout-v203-filter-status');
  if(!panel||!meta||!empty||!search||!roles||!rarities||!sort||!count||!status)return false;
  const clear=doc.createElement('button');
  clear.id='scout-v205-clear';clear.type='button';
  clear.className='scout-v205-reset';
  clear.textContent='Limpar filtros';
  clear.setAttribute('aria-label','Limpar busca, posição, raridade e ordenação');
  clear.hidden=true;meta.appendChild(clear);
  const emptyClear=doc.createElement('button');
  emptyClear.id='scout-v205-empty-reset';emptyClear.type='button';
  emptyClear.className='scout-v205-reset scout-v205-empty-reset';
  emptyClear.textContent='Mostrar todas as 246 cartas';
  empty.append(doc.createTextNode(' '),emptyClear);
  const current=(group)=>group.querySelector('button[aria-pressed="true"]')||group.querySelector('button.active');
  function refresh(){
   const role=current(roles),rarity=current(rarities);
   const style=doc.getElementById('style-filter');
   const state={
    query:search.value,role:role?.dataset.value||'TODOS',roleLabel:role?.textContent?.trim(),
    rarity:rarity?.dataset.value||'TODAS',sort:sort.value,
    sortLabel:sort.selectedOptions?.[0]?.textContent?.trim(),
    style:style?.value||'TODOS',count:count.textContent
   };
   const summary=summarize(state);
   status.textContent=summary.label;
   status.title=summary.full;
   panel.classList.toggle('scout-v203-filter-active',summary.active);
   clear.hidden=!summary.active;
   doc.body.classList.toggle('scout-v205-active-search',!!String(search.value||'').trim());
  }
  function reset(){
   // Use os eventos originais de premium.js: o motor refiltra as 246 cartas.
   search.value='';
   search.dispatchEvent(new host.Event('input',{bubbles:true}));
   const roleAll=roles.querySelector('button[data-value="TODOS"]');
   const rarityAll=rarities.querySelector('button[data-value="TODAS"]');
   if(roleAll&&roleAll.getAttribute('aria-pressed')!=='true')roleAll.click();
   if(rarityAll&&rarityAll.getAttribute('aria-pressed')!=='true')rarityAll.click();
   const style=doc.getElementById('style-filter');
   if(style&&style.value!=='TODOS'){
    style.value='TODOS';style.dispatchEvent(new host.Event('change',{bubbles:true}));
   }
   if(sort.value!=='cap'){
    sort.value='cap';sort.dispatchEvent(new host.Event('change',{bubbles:true}));
   }
   refresh();
  }
  clear.addEventListener('click',reset);
  emptyClear.addEventListener('click',reset);
  search.addEventListener('input',refresh);
  roles.addEventListener('click',event=>{if(event.target?.closest?.('button'))refresh()});
  rarities.addEventListener('click',event=>{if(event.target?.closest?.('button'))refresh()});
  sort.addEventListener('change',refresh);
  doc.getElementById('style-filter')?.addEventListener('change',refresh);
  doc.getElementById('more')?.addEventListener('click',refresh);
  refresh();
  doc.body.classList.add('scout-v205-ready');
  return true;
 }
 const api=Object.freeze({build,summarize});
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(!host?.document)return;
 function start(){
  if(build(host.document))return;
  const catalog=host.document.getElementById('catalogo');
  if(!catalog||!host.MutationObserver)return;
  const observer=new host.MutationObserver(()=>{if(build(host.document))observer.disconnect()});
  observer.observe(catalog,{childList:true});
 }
 if(host.document.readyState==='loading'){
  host.document.addEventListener('DOMContentLoaded',start,{once:true});
 }else start();
})(typeof window!=='undefined'?window:null);
