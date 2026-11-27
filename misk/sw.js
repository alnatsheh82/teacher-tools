/* مِسك الختام — يحفظ التطبيق على الجهاز ليعمل دون إنترنت، ويجلب الإصدار الجديد وحده.
   يُولَّد مع كل إصدار من قائمة الملفات، فلا تعدّله يدويًا. */
var CACHE = "misk-2.7.1-041d47baff";
var FILES = [
"index.html",
"manifest.webmanifest",
"أدوات المعلمين.html",
"ابدأ.html",
"app/arcade.js",
"app/backup.js",
"app/board.js",
"app/classes.js",
"app/core.js",
"app/feedback.js",
"app/fonts.css",
"app/helpers.js",
"app/icon-192.png",
"app/icon-32.png",
"app/icon-512.png",
"app/icon-maskable-512.png",
"app/import.js",
"app/main.js",
"app/misk.ico",
"app/rounds-import.js",
"app/samples.js",
"app/storage.js",
"app/styles.css",
"app/templates.js",
"app/templates2.js",
"app/templates3.js",
"app/updater.js",
"app/webapp.js",
"app/wordwall.js",
"app/shared/fonts.js",
"app/shared/quran-data.js",
"app/نماذج/نموذج أسئلة لوحة التحديات.docx",
"app/نماذج/نموذج أسئلة لوحة التحديات.pptx"
];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES.map(function (f) { return new Request(f, { cache: 'reload' }); })); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k.indexOf('misk-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(req, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      if (req.mode === 'navigate') return c.match('index.html').then(function (ix) { return ix || fetch(req); });
      return fetch(req);
    });
  }));
});
