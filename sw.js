const CACHE_NAME="airportfinder-v201";
const APP_SHELL=["./","./index.html","./style.css","./manifest.json","./sw.js","./js/app.js","./js/search.js","./js/ui.js","./js/maps.js","./js/utils.js","./data/airports.json","./data/overrides.json"];

self.addEventListener("install",event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)));
});

self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET") return;
  const url=new URL(event.request.url);
  if(url.pathname.endsWith("/data/overrides.json")){
    event.respondWith(fetch(event.request).then(response=>{
      const clone=response.clone();
      caches.open(CACHE_NAME).then(cache=>cache.put(event.request,clone));
      return response;
    }).catch(()=>caches.match(event.request)));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>{
    if(cached) return cached;
    return fetch(event.request).then(response=>{
      const clone=response.clone();
      caches.open(CACHE_NAME).then(cache=>cache.put(event.request,clone));
      return response;
    }).catch(()=>caches.match("./index.html"));
  }));
});
