(function(){'use strict';
if (!('serviceWorker' in navigator)) return;
const nativeApp=!!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
if (nativeApp) {
  // Capacitor already packages every file offline; stale PWA caches interfere with APK updates.
  navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister())).catch(()=>{});
  return;
}
if (location.protocol === 'https:') window.addEventListener('load', ()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
})();
