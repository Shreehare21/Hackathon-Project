const CACHE = 'launchpad-static-v1';
const ASSETS = [
        // This array is managed by the build script `scripts/build-assets.js` which inserts hashed /dist asset paths
        self.addEventListener('install', event => {
            self.skipWaiting();
            event.waitUntil(
                caches.open(CACHE).then(cache => cache.addAll(ASSETS))
            );
        });

        self.addEventListener('activate', event => {
            event.waitUntil(
                caches.keys().then(keys => Promise.all(
                    keys.filter(k => k !== CACHE).map(k => caches.delete(k))
                ))
            );
            self.clients.claim();
        });

        self.addEventListener('fetch', event => {
            const { request } = event;
            // prefer network for API calls, cache-first for others
            if (request.url.includes('/api/')) {
                event.respondWith(
                    fetch(request).catch(() => caches.match(request))
                );
                return;
            }

            event.respondWith(
                caches.match(request).then(cached => {
                    if (cached) return cached;
                    return fetch(request).then(resp => {
                        if (!resp || resp.status !== 200 || resp.type !== 'basic') return resp;
                        const copy = resp.clone();
                        caches.open(CACHE).then(cache => cache.put(request, copy));
                        return resp;
                    }).catch(() => caches.match('/index.html'));
                })
            );
        });