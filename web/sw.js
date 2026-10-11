const CACHE='scout-pro-v72-1';
const SHELL=['./','./index.html','./premium.css','./premium.js','./lab.js','./lab.css','./scout_v68.css','./app-bridge.css','./app-bridge.js','./scout-config.js','./assets/icon-192.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const req=event.request;if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
 event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(resp=>{if(resp.ok){const copy=resp.clone();caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{})}return resp}).catch(()=>caches.match('./index.html'))));
});
