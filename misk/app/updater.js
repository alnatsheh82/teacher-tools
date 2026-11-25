/* مِسك الختام — التحديث التلقائي المستقل ضمن «أدوات المعلمين»
   يقرأ ملف تحديثاته الخاص (misk/updates.json) في مستودع أدوات المعلمين، فلا يدخل في التحديث الموحّد للأدوات الأخرى.
   ينزّل الملفات التي تغيّرت بصمتها فقط، ويحفظ نسخة من القديم، ويُرجعه إن تعثّر التحديث. */
(function () {
  var MK = window.MK, h = MK.h;
  var BASE = 'https://raw.githubusercontent.com/alnatsheh82/teacher-tools/main/';
  var MANIFEST = 'misk/updates.json', KEY = 'misk-alkhitam', SNOOZE = 'misk.update.later', BACKUP = 'نسخة قبل التحديث';
  var U = { info: null, checking: null };

  function newer(a, b) { // هل a أحدث من b؟
    var x = String(a || '0').split('.'), y = String(b || '0').split('.');
    for (var i = 0; i < Math.max(x.length, y.length); i++) {
      var p = +x[i] || 0, q = +y[i] || 0;
      if (p !== q) return p > q;
    }
    return false;
  }
  function hex(buf) {
    return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }
  function sha(buf) { return crypto.subtle.digest('SHA-256', buf).then(hex); }
  function enc(path) { return path.split('/').map(encodeURIComponent).join('/'); }

  // ---------- البحث عن إصدار جديد ----------
  U.check = function () {
    if (U.checking) return U.checking;
    U.checking = fetch(BASE + MANIFEST + '?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); })
      .then(function (d) {
        var e = d && d[KEY];
        U.info = e && newer(e.version, MK.VERSION) ? e : null;
        return { entry: e || null, update: U.info };
      })
      .finally(function () { U.checking = null; });
    return U.checking;
  };

  // ---------- مجلد البرنامج ----------
  function looksLikeProgram(d) {
    return d.getFileHandle('ابدأ.html').then(function () { return true; }, function () { return false; });
  }
  function askProgram() {
    return new Promise(function (res, rej) {
      var close = MK.modal('اختر مجلد البرنامج',
        h('div', null,
          h('p', null, 'يحتاج التحديث إلى إذن الكتابة في مجلد البرنامج مرة واحدة.'),
          h('p', null, 'اختر مجلد «', h('strong', null, 'مسك الختام'), '» في «المستندات»، ثم اضغط «السماح».')),
        [{ label: 'اختر المجلد', onClick: function () {
          window.showDirectoryPicker({ id: 'misk-program', mode: 'readwrite' }).then(function (hd) {
            return looksLikeProgram(hd).then(function (ok) {
              if (ok) return hd;
              return hd.getDirectoryHandle('مسك الختام').catch(function () { return hd; })
                .then(function (t) { return t.getDirectoryHandle('البرنامج'); })
                .then(function (p) { return looksLikeProgram(p).then(function (ok2) { if (!ok2) throw 0; return p; }); });
            });
          }).then(function (p) { MK.store.setProgHandle(p); close(); res(p); })
            .catch(function (e) { if (!e || e.name !== 'AbortError') MK.toast('لم أجد ملف ابدأ.html في هذا المجلد'); });
          return false;
        } }, { label: 'إلغاء', cls: 'ghost', onClick: function () { rej({ name: 'AbortError' }); } }]);
    });
  }
  function programDir() {
    if (typeof window.showDirectoryPicker !== 'function') return Promise.reject({ name: 'NoFS' });
    return MK.store.progHandle().then(function (p) {
      return p || null;
    }).then(function (p) {
      if (!p) return askProgram();
      return p.requestPermission({ mode: 'readwrite' }).then(function (perm) {
        if (perm !== 'granted') return askProgram();
        return looksLikeProgram(p).then(function (ok) { return ok ? p : askProgram(); });
      });
    });
  }
  function dirOf(root, path, create) {
    var parts = path.split('/'); parts.pop();
    return parts.reduce(function (pr, n) { return pr.then(function (d) { return d.getDirectoryHandle(n, { create: !!create }); }); }, Promise.resolve(root));
  }
  function base(path) { return path.split('/').pop(); }
  function readLocal(root, path) {
    return dirOf(root, path).then(function (d) { return d.getFileHandle(base(path)); })
      .then(function (fh) { return fh.getFile(); }).then(function (f) { return f.arrayBuffer(); })
      .catch(function () { return null; });
  }
  function writeLocal(root, path, data) {
    return dirOf(root, path, true).then(function (d) { return d.getFileHandle(base(path), { create: true }); })
      .then(function (fh) { return fh.createWritable(); })
      .then(function (w) { return w.write(data).then(function () { return w.close(); }); });
  }

  // ---------- التحديث ----------
  U.apply = function (entry, progress) {
    progress = progress || function () { };
    var root, changed = [], fresh = {}, old = {}, written = [];
    var files = entry.files || {}, from = entry.from || {};
    return programDir().then(function (p) {
      root = p; progress('أقارن الملفات…');
      var paths = Object.keys(files);
      return paths.reduce(function (pr, path) {
        return pr.then(function () { return readLocal(root, path); }).then(function (buf) {
          if (!buf) { changed.push(path); return; }
          old[path] = buf;
          return sha(buf).then(function (s) { if (s !== files[path]) changed.push(path); });
        });
      }, Promise.resolve());
    }).then(function () {
      if (!changed.length) return;
      // ننزّل كل شيء ونتحقق من بصمته قبل أن نكتب أي ملف
      return changed.reduce(function (pr, path, i) {
        return pr.then(function () {
          progress('أنزّل ' + (i + 1) + ' من ' + changed.length);
          var src = from[path] || (entry.dir + '/' + path);
          return fetch(BASE + enc(src) + '?v=' + encodeURIComponent(entry.version), { cache: 'no-store' });
        }).then(function (r) { if (!r.ok) throw new Error('download'); return r.arrayBuffer(); })
          .then(function (buf) { return sha(buf).then(function (s) { if (s !== files[path]) throw new Error('hash'); fresh[path] = buf; }); });
      }, Promise.resolve());
    }).then(function () {
      if (!changed.length) return;
      progress('أحفظ نسخة من الملفات الحالية…');
      return root.removeEntry(BACKUP, { recursive: true }).catch(function () { })
        .then(function () { return root.getDirectoryHandle(BACKUP, { create: true }); })
        .then(function (bk) {
          return changed.filter(function (p) { return old[p]; })
            .reduce(function (pr, p) { return pr.then(function () { return writeLocal(bk, p, old[p]); }); }, Promise.resolve());
        });
    }).then(function () {
      if (!changed.length) return;
      progress('أثبّت الإصدار الجديد…');
      return changed.reduce(function (pr, p) {
        return pr.then(function () { return writeLocal(root, p, fresh[p]); }).then(function () { written.push(p); });
      }, Promise.resolve()).catch(function (err) {
        // تراجع: نعيد ما كُتب إلى حاله السابقة
        return written.reduce(function (pr, p) {
          return pr.then(function () { return old[p] ? writeLocal(root, p, old[p]) : dirOf(root, p).then(function (d) { return d.removeEntry(base(p)); }); }).catch(function () { });
        }, Promise.resolve()).then(function () { err.rolledBack = true; throw err; });
      });
    }).then(function () { return changed.length; });
  };

  // ---------- الواجهة ----------
  function notesList(e) {
    return (e.notes && e.notes.length) ? h('ul', { class: 'up-notes' }, e.notes.map(function (n) { return h('li', null, n); })) : null;
  }
  U.run = function (e) {
    var status = h('p', { class: 'hint' }, 'جارٍ التحضير…');
    var close = MK.modal('تحديث مِسك الختام إلى ' + e.version, h('div', null, status), []);
    U.apply(e, function (t) { status.textContent = t; }).then(function (n) {
      close();
      try { localStorage.removeItem(SNOOZE); } catch (x) { }
      MK.modal('تم التحديث', h('div', null,
        h('p', null, n ? 'عدد الملفات المحدَّثة: ' + n + '. بقيت أنشطتك وشُعبك كما هي.' : 'ملفاتك مطابقة للإصدار الجديد.'),
        h('p', { class: 'hint' }, 'حُفظت نسخة من الملفات القديمة في مجلد «' + BACKUP + '» داخل مجلد البرنامج.')),
        [{ label: 'أعد فتح الأداة الآن', onClick: function () { location.reload(); } }]);
    }).catch(function (err) {
      close();
      if (err && err.name === 'AbortError') return;
      var msg = err && err.name === 'NoFS' ? 'هذا المتصفح لا يسمح بالكتابة في المجلدات. استخدم كروم أو إيدج.'
        : err && err.message === 'hash' ? 'وصل ملف غير مطابق فلم يُغيَّر شيء. جرّب لاحقًا.'
        : err && err.rolledBack ? 'تعثّر التحديث وأُعيدت الملفات إلى حالها السابقة.'
        : 'تعذّر التحديث. تأكد من الاتصال بالإنترنت ثم جرّب مرة أخرى.';
      MK.modal('لم يكتمل التحديث', h('p', null, msg), [{ label: 'حسنًا' }]);
    });
  };
  // الشريط الأخضر في الصفحة الرئيسية
  U.banner = function () {
    var e = U.info;
    if (!e) return null;
    try { if (localStorage.getItem(SNOOZE) === e.version) return null; } catch (x) { }
    var bar = h('div', { class: 'notice up-bar' }, MK.icon('star'),
      h('span', null, h('strong', null, 'إصدار جديد ' + e.version + ' متاح'), e.message ? ' — ' + e.message : ''),
      h('span', { class: 'spacer' }),
      h('button', { type: 'button', class: 'btn small ghost', onclick: function () {
        MK.modal('ما الجديد في ' + e.version, h('div', null, notesList(e) || h('p', null, e.message || '')), [{ label: 'حسنًا' }]);
      } }, 'ما الجديد؟'),
      h('button', { type: 'button', class: 'btn small', onclick: function () { U.run(e); } }, 'حدّث الآن'),
      h('button', { type: 'button', class: 'btn small ghost', 'aria-label': 'لاحقًا', onclick: function () {
        try { localStorage.setItem(SNOOZE, e.version); } catch (x) { } bar.remove();
      } }, 'لاحقًا'));
    return bar;
  };
  // يُستدعى عند فتح الأداة: يضع الشريط في مكانه إن وُجد تحديث
  U.auto = function (slot) {
    if (U.done) { var b0 = U.banner(); if (b0) slot.appendChild(b0); return; }
    if (!navigator.onLine) return;
    U.done = true;
    U.check().then(function () { var b = U.banner(); if (b && slot && slot.isConnected) slot.appendChild(b); }).catch(function () { });
  };
  // زر «تحقق من التحديثات» في الإعدادات
  U.section = function () {
    var out = h('p', { class: 'hint' }, 'الإصدار الحالي ' + MK.VERSION + '. يصل التحديث مستقلًا عن بقية أدوات المعلمين.');
    var btn = h('button', { type: 'button', class: 'btn small soft', style: { alignSelf: 'flex-start' }, onclick: function () {
      btn.disabled = true; out.textContent = 'أبحث عن تحديث…';
      U.check().then(function (r) {
        btn.disabled = false;
        if (!r.update) { out.textContent = 'لديك أحدث إصدار (' + MK.VERSION + ').'; return; }
        try { localStorage.removeItem(SNOOZE); } catch (x) { }
        MK.clear(out); out.appendChild(h('span', null, 'يتوفر الإصدار ' + r.update.version + '. '));
        out.appendChild(h('button', { type: 'button', class: 'btn small', onclick: function () { U.run(r.update); } }, 'حدّث الآن'));
      }).catch(function () { btn.disabled = false; out.textContent = 'تعذّر الاتصال. تأكد من الإنترنت ثم جرّب مرة أخرى.'; });
    } }, MK.icon('search'), 'تحقق من التحديثات');
    return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } }, btn, out);
  };
  U._newer = newer;
  MK.updater = U;
})();
