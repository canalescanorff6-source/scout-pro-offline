/* Scout PRO V203 — painel de filtros compacto e acessível.
 * Move apenas os controles originais, preservando listeners e dados das 246 cartas.
 * Nunca recria filtros, busca, valores ou estado do catálogo. */
(function(host){
 'use strict';
 function selectedLabel(root,fallback){
  if(!root)return fallback;
  const chosen=root.querySelector('button[aria-pressed="true"]')||root.querySelector('button.active');
  return chosen?String(chosen.textContent||'').replace(/\s+/g,' ').trim():fallback;
 }
 function build(doc){
  if(!doc?.body||doc.body.dataset.page!=='catalog')return false;
  const catalog=doc.getElementById('catalogo');
  const roles=doc.getElementById('roles');
  const rarities=doc.getElementById('rarities');
  const meta=catalog?.querySelector('.list-meta');
  const tools=catalog?.querySelector('.tools');
  if(!catalog||!roles||!rarities||!meta||!tools)return false;
  if(doc.getElementById('scout-v203-filter-panel'))return true;
  const panel=doc.createElement('details');
  panel.id='scout-v203-filter-panel';
  panel.className='scout-v203-filter-panel';
  const summary=doc.createElement('summary');
  summary.id='scout-v203-filter-toggle';
  const title=doc.createElement('span');
  title.className='scout-v203-filter-title';
  title.textContent='Filtrar e ordenar';
  const description=doc.createElement('span');
  description.className='scout-v203-filter-status';
  description.setAttribute('aria-live','polite');
  const chevron=doc.createElement('span');
  chevron.className='scout-v203-chevron';
  chevron.textContent='⌄';
  chevron.setAttribute('aria-hidden','true');
  summary.append(title,description,chevron);
  const contents=doc.createElement('div');
  contents.className='scout-v203-filter-content';
  const roleTitle=doc.createElement('h3');
  roleTitle.textContent='Posição';
  const rarityTitle=doc.createElement('h3');
  rarityTitle.textContent='Raridade';
  const sortTitle=doc.createElement('h3');
  sortTitle.textContent='Ordenação';
  // Os três controles são MOVIMENTADOS, não duplicados; eventos e atributos mantidos.
  contents.append(sortTitle,tools);
  // V238: o controle de efeitos NÃO deve ficar num painel de filtros fechado.
  // Mantém o botão e seus listeners fora do <details>, visível no celular/PC.
  const motion=catalog.querySelector('.scout-motion-controls');
  contents.append(roleTitle,roles,rarityTitle,rarities);
  // V374: position-order also creates role instructions. Move that same
  // node with its controls, so closed filters do not leave an orphan block.
  const overview=catalog.querySelector('.scout-role-overview');
  if(overview)contents.insertBefore(overview,rarityTitle);
  panel.append(summary,contents);
  // V238: reutiliza a altura do cabeçalho dos filtros para mostrar o botão.
  // Não adiciona uma faixa vertical extra antes das cartas no celular.
  const motionRow=doc.createElement('div');
  motionRow.className='scout-v238-filter-motion-row';
  motionRow.appendChild(panel);
  if(motion)motionRow.appendChild(motion);
  catalog.insertBefore(motionRow,meta);
  function update(){
   const position=selectedLabel(roles,'Todas as posições');
   const rarity=selectedLabel(rarities,'Todas as raridades');
   const sort=doc.getElementById('sort');
   const sortName=sort?.selectedOptions?.[0]?.textContent?.trim()||'Ordem do catálogo';
   const defaultPosition=(roles.querySelector('button[aria-pressed="true"]')?.dataset.value||'TODOS')==='TODOS';
   const defaultRarity=(rarities.querySelector('button[aria-pressed="true"]')?.dataset.value||'TODAS')==='TODAS';
   const parts=[];
   if(!defaultPosition)parts.push(position);
   if(!defaultRarity)parts.push(rarity);
   if(sort&&sort.value!=='cap')parts.push(sortName);
   description.textContent=parts.length?parts.join(' · '):'Todas as cartas · filtros opcionais';
   panel.classList.toggle('scout-v203-filter-active',parts.length>0);
  }
  // Eventos borbulham depois dos manipuladores preexistentes dos botões.
  roles.addEventListener('click',event=>{if(event.target?.closest?.('button'))update()});
  rarities.addEventListener('click',event=>{if(event.target?.closest?.('button'))update()});
  doc.getElementById('sort')?.addEventListener('change',update);
  panel.addEventListener('toggle',()=>{chevron.textContent=panel.open?'⌃':'⌄'});
  update();
  // Uma abertura por deep-link mantém visíveis os filtros definidos pelo usuário.
  const params=new URLSearchParams(host?.location?.search||'');
  if(params.has('role')||params.has('style'))panel.open=true;
  doc.body.classList.add('scout-v203-filters-ready');
  return true;
 }
 const api=Object.freeze({build,selectedLabel});
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(!host?.document)return;
 if(host.document.readyState==='loading'){
  host.document.addEventListener('DOMContentLoaded',()=>build(host.document),{once:true});
 }else build(host.document);
})(typeof window!=='undefined'?window:null);
