(function(){'use strict';
// Central de Técnicos acessível na home instalada ou em navegador.
function putManagerLink(){
 if(document.body?.dataset?.page!=='catalog')return;
 const list=document.querySelector('.hero-actions');
 if(!list||list.querySelector('[data-manager-hub-link]'))return;
 const link=document.createElement('a');
 link.href='tecnicos-v307.html';link.textContent='Técnicos · comparar 22 versões →';
 link.className='btn primary';link.setAttribute('data-manager-hub-link','v307');
 list.append(link);
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
