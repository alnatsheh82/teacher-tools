/* مساعد التحضير الإلكتروني — العمل دون إنترنت
 * عند الاتصال: يُجلب أحدث إصدار من الملفات دائمًا (فتصل التحديثات للجميع تلقائيًا).
 * دون اتصال: تُستخدم آخر نسخة محفوظة على الجهاز.
 * عند تعديل ملفات المساعد يكفي رفعها؛ ويمكن تغيير VERSION لإجبار تحديث النسخة المحفوظة. */
const VERSION = 'musaed-2026-11-12-v21';
const FILES = [
    './', 'index.html', 'manifest.webmanifest',
    'static/style.css', 'static/lists.js', 'static/jszip.min.js', 'static/docx-export.js', 'static/app.js', 'static/local.js',
    'static/lessons.js', 'static/strategy_bank.js', 'static/template.js',
    'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-192.png', 'icons/maskable-512.png',
    'icons/apple-touch-icon.png', 'icons/favicon-32.png', 'icons/favicon-16.png'
];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
    event.waitUntil(caches.keys()
        .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
        .then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
    const req = event.request;
    if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
    event.respondWith((async () => {
        const cache = await caches.open(VERSION);
        const cachedFirst = await cache.match(req, { ignoreSearch: true });
        try {
            // إذا كان الاتصال بطيئًا جدًا (أكثر من 6 ثوانٍ) نستخدم النسخة المحفوظة إن وُجدت.
            const fresh = await Promise.race([
                fetch(req, { cache: 'no-cache' }),
                new Promise((resolve, reject) => setTimeout(() => cachedFirst ? reject(Error('slow')) : null, 6000))
            ]);
            if (fresh && fresh.ok) cache.put(req, fresh.clone());
            return fresh;
        } catch (err) {
            const cached = await cache.match(req, { ignoreSearch: true });
            if (cached) return cached;
            if (req.mode === 'navigate') return (await cache.match('index.html')) || Response.error();
            throw err;
        }
    })());
});
