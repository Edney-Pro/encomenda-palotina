// Service Worker - Encomenda Palotina
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

/* -----------------------------
      INSTALAÇÃO DO SW
------------------------------*/
self.addEventListener('install', (event) => {
  console.log('🔄 Instalando Service Worker...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_STATIC))
      .then(() => {
        console.log('✅ Instalado!');
        return self.skipWaiting();
      })
      .catch(err => console.error('❌ Erro ao instalar:', err))
  );
});

/* -----------------------------
      ATIVAÇÃO / LIMPAR CACHES
------------------------------*/
self.addEventListener('activate', (event) => {
  console.log('🎯 Ativando Service Worker...');

  event.waitUntil(
    caches.keys().then(names => {
      return Promise.all(
        names.map(name => {
          if (name !== CACHE_NAME) {
            console.log('🗑️ Deletando cache antigo:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      console.log('✅ Pronto para uso');
      return self.clients.claim();
    })
  );
});

/* -----------------------------
      FETCH - TRATAMENTO DE REDE
------------------------------*/
self.addEventListener('fetch', (event) => {

  // ⚠️ Requisição especial para versao.json → sempre buscar online
  if (event.request.url.includes('versao.json')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Atualiza cache com nova versão
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Ignorar chrome-extension e métodos não GET
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('chrome-extension')) return;

  // Estratégia Cache First padrão
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(network => {
          // Apenas arquivos do mesmo domínio vão para o cache
          if (network.status === 200 && event.request.url.startsWith(self.location.origin)) {
            const clone = network.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return network;
        })
        .catch(() => {
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
          return new Response('🔴 Modo Offline', {
            status: 503,
            statusText: 'Offline'
          });
        });
    })
  );
});

/* -----------------------------
      MENSAGENS ENTRE APP ↔ SW
------------------------------*/
self.addEventListener('message', (event) => {
  
  // Forçar atualização do SW
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Pegar versão
  if (event.data?.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: '2.0.0',
      name: 'Encomenda Palotina'
    });
  }

  // Atualizar arquivo individual no cache
  if (event.data?.type === 'UPDATE_FILE') {
    caches.open(CACHE_NAME).then(cache => {
      cache.put(event.data.file, new Response(event.data.content));
    });
  }
});
