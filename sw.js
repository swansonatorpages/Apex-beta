const CACHE_NAME='apex-system-foundation-v2';
const CORE=['./','./index.html','./manifest.json','./icon-180.png','./icon-192.png','./icon-512.png','./foundation/app.js','./foundation/logic.js','./foundation/style.css'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('apex-system-')&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy)))}return response}).catch(()=>caches.match(event.request).then(cached=>cached||Response.error())))});
