const staticCacheName = 'site-static-v1';
const dynamicCacheName = 'site-dynamic-v1';
const assets = [
  '/',
  '/index.html',
  '/pages/about.html',
  '/pages/contact.html',
  '/pages/fallback.html',
  '/js/app.js',
  '/js/ui.js',
  '/js/materialize.min.js',
  '/css/styles.css',
  '/css/materialize.min.css',
  '/img/dish.jpg',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.gstatic.com/s/materialicons/v52/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2',
];

//Limitar tamanho de cache
const limitCacheSize = (name,size) => {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if(keys.length > size){
        cache.delete(keys[0]).then( limitCacheSize(name,size));
      }
    });
  });
};

//Instalar Service Worker
self.addEventListener('install', evt => {
  //console.log("Service Worker instalado");
  evt.waitUntil(caches.open(staticCacheName).then( cache => {
  console.log('caching shell assets');
  cache.addAll(assets);
  }));
});
  
//Ativar Service Worker
self.addEventListener('activate', evt => {
  //console.log('Service Worker ativado.');
  evt.waitUntil(
    caches.keys().then(keys => {
      // console.log(keys);
      return Promise.all(keys
        .filter(key => key !== staticCacheName && key !== dynamicCacheName)
        .map(key => caches.delete(key))
       );
    })
  );
});

//Evento fetch
self.addEventListener('fetch', evt => {
  if(evt.request.url.indexOf('firestore.googleapis.com') === -1){
    evt.respondWith(
      caches.match(evt.request).then(cacheRes =>{
        return cacheRes || fetch(evt.request).then(fetchRes => {
          return caches.open(dynamicCacheName).then(cache => {
            cache.put(evt.request.url, fetchRes.clone());
            limitCacheSize(dynamicCacheName, 15);
            return fetchRes;
          });
        });
      }).catch(() => {
        if(evt.request.url.indexOf('','.html') > -1){
          return caches.match('/pages/fallback.html');
        }
    })
    );
  }
});