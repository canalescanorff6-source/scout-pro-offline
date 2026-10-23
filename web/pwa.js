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
if (location.protocol === 'https:') window.addEventListener('load', ()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
})();
