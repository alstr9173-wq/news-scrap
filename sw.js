/* 시사 스크랩 service worker: app shell cached for offline, articles always fetched fresh first */
const V="scrap-v2";
const SHELL=["./","./index.html","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png","./icons/apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
const fresh=(req,key)=>fetch(req).then(r=>{if(r&&r.ok){const c=r.clone();caches.open(V).then(x=>x.put(key||req,c));}return r;}).catch(()=>caches.match(key||req));
self.addEventListener("fetch",e=>{
  const req=e.request;if(req.method!=="GET")return;
  const u=new URL(req.url);
  if(u.origin===self.location.origin){
    if(req.mode==="navigate"){e.respondWith(fresh(req,"./index.html"));return;}
    if(u.pathname.includes("/data/")){e.respondWith(fresh(req));return;}
    e.respondWith(caches.match(req).then(r=>r||fresh(req)));return;
  }
  if(u.hostname==="fonts.googleapis.com"||u.hostname==="fonts.gstatic.com"){
    e.respondWith(caches.open(V).then(c=>c.match(req).then(hit=>{const net=fetch(req).then(r=>{c.put(req,r.clone());return r;}).catch(()=>hit);return hit||net;})));
  }
});
