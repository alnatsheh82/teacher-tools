/* مِسك الختام — التثبيت على الجهاز (تطبيق ويب)
   من الرابط على الإنترنت: زر «ثبّت» يضع الأيقونة بشعارها على سطح المكتب وفي قائمة «ابدأ»، والتطبيق يعمل بعدها دون إنترنت.
   من الملفات المحلية: الزر يفتح صفحة التثبيت على الإنترنت، لأن المتصفح لا يثبّت إلا من رابط. */
(function () {
  var MK = window.MK, h = MK.h;
  var URL_ONLINE = 'https://alnatsheh82.github.io/misk-al-khitam/';
  var LATER = 'misk.install.later';
  var online = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  var I = { online: online, prompt: null, slot: null };

  function standalone() {
    try { return window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: window-controls-overlay)').matches || navigator.standalone === true; } catch (e) { return false; }
  }
  I.installed = standalone;

  if (online && 'serviceWorker' in navigator) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () { }); });
  }
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); I.prompt = e; fill();
  });
  window.addEventListener('appinstalled', function () {
    I.prompt = null; fill();
    MK.toast && MK.toast('ثُبّت مِسك الختام. تجد أيقونته على سطح المكتب وفي قائمة «ابدأ».');
  });

  function bar(text, btnLabel, onClick, later) {
    var el = h('div', { class: 'notice install-bar' }, MK.icon('star'),
      h('span', null, text), h('span', { class: 'spacer' }),
      h('button', { type: 'button', class: 'btn small', onclick: onClick }, MK.icon('plus'), btnLabel),
      later ? h('button', { type: 'button', class: 'btn small ghost', onclick: function () {
        try { localStorage.setItem(LATER, '1'); } catch (x) { } el.remove();
      } }, 'لاحقًا') : null);
    return el;
  }
  function content() {
    if (standalone()) return null;
    if (online) {
      if (!I.prompt) return null; // مثبّت من قبل، أو متصفح لا يدعم التثبيت
      return bar(h('span', null, h('strong', null, 'ثبّت مِسك الختام على جهازك'), ' — أيقونة بشعاره على سطح المكتب، ويعمل دون إنترنت.'),
        'ثبّت', function () {
          var p = I.prompt; if (!p) return;
          p.prompt();
          p.userChoice.then(function (r) { if (r && r.outcome === 'accepted') { I.prompt = null; fill(); } }).catch(function () { });
        }, false);
    }
    if (!I.offerOnline) return null; // صفحة الإنترنت غير مفعّلة بعد، فلا نعرض الزر في نسخة الملفات
    try { if (localStorage.getItem(LATER)) return null; } catch (x) { }
    return bar(h('span', null, h('strong', null, 'ثبّت مِسك الختام بأيقونته على سطح المكتب'), ' — من صفحته على الإنترنت، بضغطة واحدة.'),
      'افتح صفحة التثبيت', function () { window.open(URL_ONLINE, '_blank'); }, true);
  }
  function fill() {
    var s = I.slot;
    if (!s || !s.isConnected) return;
    MK.clear(s);
    var c = content(); if (c) s.appendChild(c);
  }
  // يُستدعى من الصفحة الرئيسية
  I.place = function (slot) { I.slot = slot; fill(); };
  MK.install = I;
})();
