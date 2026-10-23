(function(){'use strict';
// Central de Técnicos acessível na home instalada ou em navegador.
function putManagerLink(){
 if(document.body?.dataset?.page!=='catalog')return;
 const list=document.querySelector('.hero-actions');
 if(!list||list.querySelector('[data-manager-hub-link]'))return;
 // V334: atalhos adicionados após o DOMContentLoaded também respeitam o menu
 // avançado recolhível V332; na ausência dele, preservar a navegação legada.
 const destination=list.querySelector('.hero-more-tools .hero-more-links')||list;
 const link=document.createElement('a');
 link.href='tecnicos-v307.html';link.textContent='Técnicos · comparar 22 versões →';
 link.className='btn primary';link.setAttribute('data-manager-hub-link','v307');
 destination.append(link);
 const own=document.createElement('a');
 own.href='outros-elencos-v227.html?colecao=minhas-cartas-adicionadas';
 own.textContent='+ Adicionar minhas novas cartas · PP automático →';
 own.className='btn primary';own.setAttribute('data-my-cards-link','v309');
 destination.append(own);
 const label=list.querySelector('.hero-more-tools > summary');
 if(label){label.textContent='Mais ferramentas e análises ('+destination.querySelectorAll('a[href]').length+')';}
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
