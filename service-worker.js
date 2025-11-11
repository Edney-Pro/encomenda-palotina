// Service Worker Simplificado - Encomenda Palotina
const CACHE_NAME = 'encomenda-palotina-v2.0.0';
const APP_STATIC = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/matrix.js',
  '/versao.json'
];

// Instalação - Cache dos arquivos essenciais
self.addEventListener('install', (event) => {
  console.log('🔄 Service Worker Encomenda Palotina - Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Cacheando arquivos estáticos');
        return cache.addAll(APP_STATIC);
      })
      .then(() => {
        console.log('✅ Service Worker instalado com sucesso');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Erro na instalação:', error);
      })
  );
});

// Ativação - Limpeza de caches antigos
self.addEventListener('activate', (event) => {
  console.log('🎯 Service Worker Ativando...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker ativado e pronto');
      return self.clients.claim();
    })
  );
});

// Estratégia: Cache First para melhor performance
self.addEventListener('fetch', (event) => {
  // Ignora requisições não-GET
  if (event.request.method !== 'GET') return;
  
  // Ignora requisições de chrome-extension
  if (event.request.url.includes('chrome-extension')) return;
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Retorna do cache se disponível
        if (cachedResponse) {
          return cachedResponse;
        }

        // Busca da rede
        return fetch(event.request)
          .then((networkResponse) => {
            // Não cacheia requisições de terceiros
            if (!event.request.url.startsWith(self.location.origin)) {
              return networkResponse;
            }

            // Cache apenas de requisições bem-sucedidas
            if (networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }

            return networkResponse;
          })
          .catch(() => {
            // Fallback para página offline
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
            return new Response('🔴 Modo Offline - Encomenda Palotina', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Comunicação com a página principal
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: '2.0.0',
      name: 'Encomenda Palotina'
    });
  }
});// Ouvir mensagens da página
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'UPDATE_FILE') {
    caches.open(CACHE_NAME).then(cache => {
      const response = new Response(event.data.content);
      cache.put(event.data.file, response);
    });
  }
});

// Na estratégia de fetch, para o versao.json, sempre buscar da rede
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('versao.json')) {
    event.respondWith(
      fetch(event.request).then(response => {
        // Atualiza o cache com a nova versão
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response);
        });
        return response.clone();
      }).catch(() => {
        // Se não conseguiu buscar, tenta do cache
        return caches.match(event.request);
      })
    );
    return;
  }

  // ... resto do código do fetch ...
});