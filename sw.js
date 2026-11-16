/* Abre siempre al instante desde lo guardado en el teléfono y se actualiza en segundo plano */
const C='barra-v6';
const F=['./','index.html','manifest.json','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(C).then(c=>c.addAll(F.map(u=>new Request(u,{cache:'reload'})))));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
  e.respondWith(caches.open(C).then(async c=>{
    let hit=await c.match(req,{ignoreSearch:true});
    if(!hit&&req.mode==='navigate')hit=await c.match('index.html');
    const net=fetch(req).then(r=>{if(r&&r.ok)c.put(req,r.clone());return r}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit}
    return (await net)||new Response('Sin conexión',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
  }));
});
