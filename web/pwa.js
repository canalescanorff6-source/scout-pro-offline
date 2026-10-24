(function(){'use strict';
// Central de Técnicos acessível na home instalada ou em navegador.
function putManagerLink(){
 if(document.body?.dataset?.page!=='catalog')return;
 const list=document.querySelector('.hero-actions');
 if(!list)return;
 // A navegação real V189/V326 fica visível; a hero-actions legada é escondida
 // pelo CSS V192. Inserir atalhos na navegação visível sempre que disponível.
 const live=document.querySelector('.scout-v189-extra-links');
 const target=live||list.querySelector('.hero-more-tools .hero-more-links')||list;
 if(!document.querySelector('.scout-v326-managers-entry') &&
    !list.querySelector('[data-manager-hub-link]') &&
    !target.querySelector('[data-manager-hub-link]')){
  const link=document.createElement('a');
  link.href='tecnicos-v307.html';link.textContent='Central de Técnicos · escolher edição →';
  link.className=live?'':'btn primary';link.setAttribute('data-manager-hub-link','v307');
  target.append(link);
 }
 if(!document.querySelector('[data-my-cards-link]') &&
    !document.querySelector('.scout-v189-extra-links a[href*="colecao=minhas-cartas-adicionadas"]')){
  const own=document.createElement('a');
  own.href='outros-elencos-v227.html?colecao=minhas-cartas-adicionadas';
  own.textContent='+ Adicionar minhas novas cartas · PP automático →';
  own.className=live?'':'btn primary';own.setAttribute('data-my-cards-link','v309');
  target.append(own);
 }
 const label=list.querySelector('.hero-more-tools > summary');
 const fallback=list.querySelector('.hero-more-tools .hero-more-links');
 if(label&&fallback)label.textContent='Mais ferramentas e análises ('+fallback.querySelectorAll('a[href]').length+')';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',putManagerLink,{once:true});
else putManagerLink();
if (!('serviceWorker' in navigator)) return;
const nativeApp=!!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
if (nativeApp) {
  // Capacitor already packages every file offline; stale PWA caches interfere with APK updates.
  navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister())).catch(()=>{});
  return;
}
// V355 — aviso sem recarga automática: evita a mistura visual entre a
// página antiga já aberta e o cache Premium recém-ativado no navegador/PWA.
// APK Capacitor: sai acima; o atualizador nativo permanece independente.
const worker=navigator.serviceWorker;
if(typeof worker.addEventListener==='function'){
 let previous=worker.controller||null,dirty=false,dismissed=false,notice=null;
 document.addEventListener('input',event=>{
  const el=event.target;
  // Busca e filtros não contam como edição pendente. Formulários de ficha sim.
  if(el&&typeof el.closest==='function'&&el.closest('form')&&
     !(typeof el.matches==='function'&&el.matches('input[type="search"]')))dirty=true;
 },true);
 document.addEventListener('submit',()=>{dirty=false},true);
 function showReady(){
  if(dismissed||notice||!document.body)return;
  notice=document.createElement('aside');
  notice.id='ct355-update-ready';
  notice.setAttribute('role','status');
  notice.setAttribute('aria-live','polite');
  const label=document.createElement('strong');
  label.textContent='Interface Premium atualizada';
  const description=document.createElement('p');
  description.textContent='Uma versão nova está pronta. Recarregue quando terminar suas edições para evitar misturar telas antigas e novas.';
  const actions=document.createElement('div');
  actions.className='ct355-update-actions';
  const apply=document.createElement('button');
  apply.type='button';apply.id='ct355-apply-update';
  apply.textContent='Recarregar versão nova';
  apply.addEventListener('click',()=>{
   if(dirty&&typeof window.confirm==='function'&&!window.confirm(
    'Há um formulário editado nesta página. Salve antes de recarregar. Deseja continuar mesmo assim?'))return;
   window.location.reload();
  });
  const later=document.createElement('button');
  later.type='button';later.id='ct355-update-later';
  later.textContent='Depois';
  later.addEventListener('click',()=>{
   dismissed=true;notice.remove();notice=null;
  });
  actions.append(apply,later);
  notice.append(label,description,actions);
  document.body.appendChild(notice);
 }
 worker.addEventListener('controllerchange',()=>{
  const current=worker.controller||null;
  // Primeira instalação não representa atualização da tela já aberta.
  if(!previous){previous=current;return;}
  if(!current||current===previous)return;
  previous=current;
  showReady();
 });
}
// No Android nativo e no Electron, nunca registrar este worker. O navegador
// HTTPS conserva o cadastro atual; só a pessoa decide quando recarregar.
if(location.protocol==='https:'){
 window.addEventListener('load',()=>worker.register('./sw.js').catch(()=>{}));
}
})();
