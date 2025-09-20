
// public/sw.js
const CACHE_NAME = 'match-scribe-cache-v1';
const INITIAL_ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching pre-defined assets');
        return cache.addAll(INITIAL_ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('Service Worker: Pre-defined assets cached successfully.');
        self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache assets during install:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Old caches deleted, now claiming clients.');
      return self.clients.claim();
    })
    .catch(error => {
      console.error('Service Worker: Failed to activate or claim clients:', error);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Validate URL before processing
  let url;
  try {
    url = new URL(event.request.url);
  } catch (error) {
    console.error('Service Worker: Invalid URL detected:', event.request.url);
    return;
  }

  // Skip invalid or problematic URLs
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    console.log('Service Worker: Skipping non-http(s) URL:', event.request.url);
    return;
  }

  // Skip chrome-extension URLs
  if (url.protocol === 'chrome-extension:') {
    console.log('Service Worker: Skipping chrome extension URL:', event.request.url);
    return;
  }

  // Skip YouTube URLs entirely - they should be handled by YouTube embed
  if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
    console.log('Service Worker: Skipping YouTube URL:', event.request.url);
    return;
  }

  // Skip blob URLs
  if (url.protocol === 'blob:') {
    console.log('Service Worker: Skipping blob URL:', event.request.url);
    return;
  }

  // Handle external APIs that might be unreachable
  if (url.hostname.includes('pythonanywhere.com') || 
      url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request).catch(error => {
        console.error('Service Worker: External API request failed for URL:', event.request.url, error);
        return new Response(
          JSON.stringify({
            error: 'Service temporarily unavailable',
            message: error.message,
            stack: error.stack
          }),
          { 
            status: 503, 
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
    return;
  }

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              })
              .catch(error => {
                console.error('Service Worker: Failed to cache navigation response:', error);
              });
          }
          return response;
        })
        .catch(error => {
          console.error('Service Worker: Navigation request failed:', error);
          return caches.match(event.request)
            .then(cachedResponse => {
              return cachedResponse || caches.match('/index.html');
            });
        })
    );
    return;
  }

  // Handle other requests (assets, etc.)
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((networkResponse) => {
            // Only cache successful responses
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch(error => {
                console.error('Service Worker: Failed to cache response:', error);
              });
            return networkResponse;
          })
          .catch(error => {
            console.error('Service Worker: Network request failed:', error);
            // Return a generic error response for failed requests
            return new Response(
              JSON.stringify({ error: 'Resource unavailable' }), 
              { 
                status: 503, 
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
      })
      .catch(error => {
        console.error('Service Worker: Cache match failed:', error);
        // Fallback to network request
        return fetch(event.request).catch(() => {
          return new Response(
            JSON.stringify({ error: 'Resource unavailable' }), 
            { 
              status: 503, 
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'application/json' }
            }
          );
        });
      })
  );
});

self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);

  if (event.data && event.data.type === 'SHOW_LOW_BATTERY_NOTIFICATION') {
    const { level, charging, trackerName, chargingTime, dischargingTime } = event.data.payload;
    
    let title = `🔋 Low Battery: ${level}%`;
    let body = `${trackerName}'s battery is at ${level}%.`;

    if (charging) {
      title = `🔌 Battery Alert: ${level}% (Charging)`;
      body = `${trackerName} is charging at ${level}%.`;
    } else {
        body += " Please connect to a power source soon.";
    }

    const options = {
      body: body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: {
        url: '/',
      }
    };

    if (self.Notification && self.Notification.permission === 'granted') {
      event.waitUntil(self.registration.showNotification(title, options));
      console.log('Service Worker: Low battery notification shown.');
    } else {
      console.log('Service Worker: Notification permission not granted. Cannot show notification.');
    }
  }
});
