/**
 * DigitalStark Aachen - Service Worker
 * Enables offline support and performance optimization
 */

'use strict';

const CACHE_VERSION = 'v1-digitalstark-2025-01';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const OFFLINE_PAGE = '/offline.html';

// Files to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/config.js',
    '/utils.js',
    '/animations.js',
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

/**
 * Activate event - cleanup old caches
 */
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => !cacheName.includes(CACHE_VERSION))
                    .map((cacheName) => {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

/**
 * Fetch event - network first, cache fallback strategy
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const { method, url } = request;

    // Skip non-GET requests
    if (method !== 'GET') return;

    // Network first, fallback to cache
    event.respondWith(
        fetch(request)
            .then((response) => {
                // Cache successful responses
                if (response.ok) {
                    const responseClone = response.clone();
                    caches.open(DYNAMIC_CACHE).then((cache) => {
                        cache.put(request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Network failed, try cache
                return caches.match(request)
                    .then((cachedResponse) => {
                        return cachedResponse || createOfflinePage();
                    });
            })
    );
});

/**
 * Create offline page
 */
function createOfflinePage() {
    return new Response(
        `<!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Offline - DigitalStark Aachen</title>
            <style>
                body {
                    font-family: "Inter", sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    margin: 0;
                    background: linear-gradient(180deg, #e3f2fd 0%, #e8f5e9 100%);
                    color: #212121;
                }
                .container {
                    text-align: center;
                    padding: 24px;
                    max-width: 500px;
                }
                h1 {
                    font-size: 48px;
                    margin: 0 0 16px 0;
                    color: #42a5f5;
                }
                p {
                    font-size: 18px;
                    color: #666;
                    margin-bottom: 24px;
                    line-height: 1.6;
                }
                .offline-icon {
                    font-size: 64px;
                    margin-bottom: 24px;
                }
                .button {
                    display: inline-block;
                    background: linear-gradient(135deg, #42a5f5, #4caf50);
                    color: white;
                    padding: 12px 24px;
                    border-radius: 6px;
                    text-decoration: none;
                    font-weight: 600;
                    transition: transform 0.3s;
                }
                .button:hover {
                    transform: translateY(-2px);
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="offline-icon">🌍</div>
                <h1>Offline</h1>
                <p>Sie sind derzeit offline. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es später erneut.</p>
                <button class="button" onclick="location.reload()">Erneut versuchen</button>
            </div>
        </body>
        </html>`,
        {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'text/html; charset=utf-8',
            }),
        }
    );
}

/**
 * Background sync for form submissions
 */
self.addEventListener('sync', (event) => {
    if (event.tag === 'contact-form-sync') {
        event.waitUntil(
            syncContactForm()
        );
    }
});

/**
 * Sync contact form submissions
 */
async function syncContactForm() {
    try {
        const formData = await getOfflineFormData();
        if (formData) {
            const response = await fetch('/api/contact', {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                await clearOfflineFormData();
            }
        }
    } catch (error) {
        console.log('Background sync failed, will retry:', error);
    }
}

/**
 * Get offline form data from IndexedDB
 */
async function getOfflineFormData() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('DigitalStarkDB', 1);

        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction('formData', 'readonly');
            const store = transaction.objectStore('formData');
            const getRequest = store.getAll();

            getRequest.onsuccess = () => {
                resolve(getRequest.result[0] || null);
            };

            getRequest.onerror = () => {
                reject(getRequest.error);
            };
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

/**
 * Clear offline form data
 */
async function clearOfflineFormData() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('DigitalStarkDB', 1);

        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction('formData', 'readwrite');
            const store = transaction.objectStore('formData');
            const clearRequest = store.clear();

            clearRequest.onsuccess = () => {
                resolve();
            };

            clearRequest.onerror = () => {
                reject(clearRequest.error);
            };
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

/**
 * Push notifications
 */
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'DigitalStark Aachen';
    const options = {
        body: data.body || '',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        tag: 'digitalstark-notification',
        requireInteraction: false,
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

/**
 * Notification click handler
 */
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((windowClients) => {
            // Check if app is already open
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not open, open new window
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

/**
 * Message handler for communication with clients
 */
self.addEventListener('message', (event) => {
    const { type, payload } = event.data;

    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;

        case 'CLEAR_CACHE':
            caches.delete(DYNAMIC_CACHE);
            break;

        case 'GET_VERSION':
            event.ports[0].postMessage({ version: CACHE_VERSION });
            break;

        default:
            break;
    }
});

console.log('Service Worker loaded:', CACHE_VERSION);
