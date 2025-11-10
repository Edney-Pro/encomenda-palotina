// sw.js — Service Worker unificado para Sistema Financeiro (v3.0)
const CACHE_NAME = 'sistema-financeiro-v3.0';

// 🗂️ Arquivos essenciais (use caminhos relativos)
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './assets/icones/produtos.ico',
  './assets/icones/veiculos.ico',
  // Adicione aqui mais módulos quando necessário:
  // './PRODUTOS/produtos-novos-com-entrada/index.html',
  // './EMPRESTIMOS/calculadora/index.html',
];

// 🧱 Instala o cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Cache inicial criado');
      return cache.addAll(urlsToCache);
    })
  );
});

// ♻️ Atualiza o cache quando versão muda
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
  console.log('[SW] Versão atualizada:', CACHE_NAME);
});

// 🌐 Responde requisições
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
