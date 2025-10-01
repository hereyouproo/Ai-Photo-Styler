const CACHE_VERSION = 'v1';
const APP_CACHE_NAME = `ai-photo-styler-app-${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `ai-photo-styler-static-${CACHE_VERSION}`;

// The essential files that constitute the "app shell"
const APP_SHELL_URLS = [
  '/',
  '/index.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching App Shell');
      return cache.addAll(APP_SHELL_URLS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('ai-photo-styler-') && cacheName !== APP_CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Use a stale-while-revalidate strategy for the app's own resources.
  // This provides a fast response from the cache while updating it in the background.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(APP_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        
        const fetchPromise = fetch(request).then((networkResponse) => {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        }).catch(err => {
            console.warn('Service Worker: Fetch failed; serving stale content if available.', err);
        });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Use a cache-first strategy for immutable third-party assets (CDNs, fonts).
  // These are unlikely to change, so serving from cache is fast and reliable.
  if (url.origin === 'https://aistudiocdn.com' || url.origin === 'https://cdn.tailwindcss.com' || url.origin.includes('fonts.gstatic.com') || url.origin.includes('fonts.googleapis.com')) {
    event.respondWith(
      caches.open(STATIC_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        const networkResponse = await fetch(request);
        cache.put(request, networkResponse.clone());
        return networkResponse;
      })
    );
    return;
  }
  
  // For all other requests, just fetch from the network.
  event.respondWith(fetch(request));
});
