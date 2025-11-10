// service-worker.js
const CACHE_NAME = 'portal-cliente-v1.2.0';
const DYNAMIC_CACHE = 'portal-dynamic-v1';

// Assets para cache imediato
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('🔄 Service Worker instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Cacheando assets estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker instalado');
        return self.skipWaiting();
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('🎯 Service Worker ativando...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE) {
            console.log('🗑️ Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker ativado');
      return self.clients.claim();
    })
  );
});

// Estratégia: Cache First, depois Network
self.addEventListener('fetch', (event) => {
  // Ignora requisições não GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Retorna do cache se disponível
        if (cachedResponse) {
          return cachedResponse;
        }

        // Busca da rede e atualiza cache
        return fetch(event.request)
          .then((networkResponse) => {
            // Clona a resposta porque ela só pode ser consumida uma vez
            const responseToCache = networkResponse.clone();

            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                // Cache apenas de requisições bem-sucedidas e do mesmo origin
                if (networkResponse.status === 200 && 
                    event.request.url.startsWith(self.location.origin)) {
                  cache.put(event.request, responseToCache);
                }
              });

            return networkResponse;
          })
          .catch((error) => {
            // Fallback para página offline
            if (event.request.destination === 'document') {
              return caches.match('/offline.html');
            }
            throw error;
          });
      })
  );
});

// Mensagens para atualização em background
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});