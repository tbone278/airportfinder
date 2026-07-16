const CACHE_NAME='airportfinder-v220';
const APP_SHELL=['./','./index.html','./style.css','./manifest.json','./version.json','./js/app.js','./js/search.js','./js/ui.js','./js/maps.js','./js/utils.js'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE_NAME).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
if(e.request.method!=='GET')return;
const p=new URL(e.request.url).pathname;
const nf=p.endsWith('/')||p.endsWith('.html')||p.endsWith('.css')||p.endsWith('.js')||p.endsWith('manifest.json')||p.endsWith('version.json');
if(nf){e.respondWith(fetch(e.request).then(r=>{caches.open(CACHE_NAME).then(c=>c.put(e.request,r.clone()));return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));return;}
e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(n=>{caches.open(CACHE_NAME).then(c=>c.put(e.request,n.clone()));return n;})));
});