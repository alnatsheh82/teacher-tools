/* مِسك الختام — تصدير النشاط حزمةَ SCORM 1.2 لمنصات التعلم (Teams وMoodle وغيرهما)
   الحزمة: index.html (مشغّل يعرض النشاط للطالب وحده) + ملفات الأداة + imsmanifest.xml
   داخل الحزمة يرسل هذا الملف نفسه درجة الطالب إلى المنصة عند انتهاء النشاط. */
(function () {
  var MK = window.MK, h = MK.h, ar = MK.ar || function (x) { return String(x); };
  var TEACHER_LED = { board: 'لوحة التحديات يصحّحها المعلم أمام الصف', talk: 'بطاقات المحادثة نقاش في الصف' };

  // ================= داخل الحزمة: التواصل مع المنصة =================
  if (window.MISK_PLAYER) {
    var api = null, finished = false;
    (function find() {
      var w = window, n = 0;
      while (w && n < 12) { try { if (w.API) { api = w.API; return; } } catch (e) { } if (w === w.parent) break; w = w.parent; n++; }
      try { if (window.opener) { w = window.opener; n = 0; while (w && n < 12) { if (w.API) { api = w.API; return; } if (w === w.parent) break; w = w.parent; n++; } } } catch (e) { }
    })();
    function get(k) { try { return api ? String(api.LMSGetValue(k) || '') : ''; } catch (e) { return ''; } }
    function set(k, v) { try { if (api) api.LMSSetValue(k, String(v)); } catch (e) { } }
    if (api) {
      try { api.LMSInitialize(''); } catch (e) { }
      var st = get('cmi.core.lesson_status');
      if (!st || st === 'not attempted') set('cmi.core.lesson_status', 'incomplete');
      try { api.LMSCommit(''); } catch (e) { }
    }
    MK.onFinish = function (r) {
      var raw = Math.max(0, Math.min(100, Math.round((r.pct || 0) * 100)));
      set('cmi.core.score.min', 0); set('cmi.core.score.max', 100); set('cmi.core.score.raw', raw);
      set('cmi.core.lesson_status', 'completed');
      try { if (api) api.LMSCommit(''); } catch (e) { }
    };
    function finish() { if (finished || !api) return; finished = true; try { api.LMSCommit(''); api.LMSFinish(''); } catch (e) { } }
    window.addEventListener('pagehide', finish); window.addEventListener('beforeunload', finish);
    MK.playerDone = function (again) {
      var box = h('div', { class: 'player-done' },
        h('div', { class: 'pd-card' }, h('h2', null, 'انتهى النشاط'),
          h('p', null, api ? 'سُجّلت نتيجتك في المنصة. يمكنك إغلاق هذه الصفحة.' : 'يمكنك إغلاق هذه الصفحة.'),
          h('button', { type: 'button', class: 'btn big', onclick: function () { box.remove(); again(); } }, MK.icon('redo'), 'أعد اللعب')));
      document.body.appendChild(box);
    };
    return;
  }

  // ================= داخل الأداة: صنع الحزمة =================
  var CRC = (function () { var t = new Uint32Array(256); for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(u) { var c = 0xFFFFFFFF; for (var i = 0; i < u.length; i++) c = CRC[(c ^ u[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function deflate(u) {
    if (typeof CompressionStream === 'undefined') return Promise.resolve(null);
    var cs = new CompressionStream('deflate-raw');
    var out = new Response(new Blob([u]).stream().pipeThrough(cs)).arrayBuffer();
    return out.then(function (b) { return new Uint8Array(b); }, function () { return null; });
  }
  // ملف zip من [{name, data:Uint8Array}]
  function makeZip(files) {
    var enc = new TextEncoder(), parts = [], central = [], off = 0;
    return files.reduce(function (p, f) {
      return p.then(function () { return deflate(f.data); }).then(function (z) {
        var useZ = z && z.length < f.data.length, body = useZ ? z : f.data, name = enc.encode(f.name), crc = crc32(f.data);
        var lh = new DataView(new ArrayBuffer(30));
        lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, useZ ? 8 : 0, true);
        lh.setUint16(10, 0, true); lh.setUint16(12, 0x5B79, true); lh.setUint32(14, crc, true); lh.setUint32(18, body.length, true); lh.setUint32(22, f.data.length, true);
        lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
        var ch = new DataView(new ArrayBuffer(46));
        ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(10, useZ ? 8 : 0, true);
        ch.setUint16(12, 0, true); ch.setUint16(14, 0x5B79, true); ch.setUint32(16, crc, true); ch.setUint32(20, body.length, true); ch.setUint32(24, f.data.length, true);
        ch.setUint16(28, name.length, true); ch.setUint32(42, off, true);
        parts.push(new Uint8Array(lh.buffer), name, body); central.push(new Uint8Array(ch.buffer), name);
        off += 30 + name.length + body.length;
      });
    }, Promise.resolve()).then(function () {
      var csize = central.reduce(function (s, x) { return s + x.length; }, 0);
      var end = new DataView(new ArrayBuffer(22));
      end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
      end.setUint32(12, csize, true); end.setUint32(16, off, true);
      return new Blob(parts.concat(central, [new Uint8Array(end.buffer)]), { type: 'application/zip' });
    });
  }
  function readAll(dir, prefix, out, skip) {
    var it = dir.values(), ps = [];
    function next() {
      return it.next().then(function (r) {
        if (r.done) return Promise.all(ps);
        var e = r.value, path = prefix + e.name;
        if (skip(path, e.kind)) return next();
        if (e.kind === 'directory') ps.push(readAll(e, path + '/', out, skip));
        else ps.push(e.getFile().then(function (f) { return f.arrayBuffer(); }).then(function (b) { out.push({ name: path, data: new Uint8Array(b) }); }));
        return next();
      });
    }
    return next();
  }
  function esc(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function manifest(act) {
    var id = 'misk-' + String(act.id || Date.now()).replace(/[^A-Za-z0-9_-]/g, ''), t = esc(act.title || 'نشاط');
    return '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<manifest identifier="' + id + '" version="1.0" xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2" xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">\n' +
      ' <metadata><schema>ADL SCORM</schema><schemaversion>1.2</schemaversion></metadata>\n' +
      ' <organizations default="org1"><organization identifier="org1"><title>' + t + '</title>\n' +
      '  <item identifier="item1" identifierref="res1" isvisible="true"><title>' + t + '</title></item>\n' +
      ' </organization></organizations>\n' +
      ' <resources><resource identifier="res1" type="webcontent" adlcp:scormtype="sco" href="index.html"><file href="index.html"/></resource></resources>\n' +
      '</manifest>\n';
  }
  function playerHtml(startHtml, act, acts) {
    var t = startHtml;
    t = t.replace(/<link rel="manifest"[^>]*>\s*/g, '').replace(/<meta name="theme-color"[^>]*>\s*/g, '').replace(/<link rel="apple-touch-icon"[^>]*>\s*/g, '');
    t = t.replace(/\s*<script src="app\/(webapp|updater)\.js"><\/script>/g, '');
    t = t.replace(/<title>[^<]*<\/title>/, '<title>' + esc(act.title || 'مِسك الختام') + '</title>');
    var data = JSON.stringify({ act: act, acts: acts }).replace(/</g, '\\u003c');
    t = t.replace('<script src="app/core.js"></script>', '<script>window.MISK_PLAYER = ' + data + ';</script>\n<script src="app/core.js"></script>');
    return t;
  }
  function clean(a) { var x = MK.clone(a); delete x.sample; return x; }
  function safeName(s) { return String(s || 'نشاط').replace(/[\\/:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60) || 'نشاط'; }

  function build(act, done, fail) {
    var all = MK.allActs ? MK.allActs() : [];
    var acts = [];
    if (act.template === 'rounds') acts = (act.content.ids || []).map(function (id) { return all.filter(function (y) { return y.id === id; })[0]; }).filter(Boolean).map(clean);
    MK.updater.programDir().then(function (root) {
      var files = [];
      return root.getFileHandle('ابدأ.html').then(function (fh) { return fh.getFile(); }).then(function (f) { return f.text(); }).then(function (startHtml) {
        return readAll(root, '', files, function (p, kind) {
          if (p === 'app' || p.indexOf('app/') === 0) {
            if (/^app\/نماذج/.test(p) || /^app\/(webapp|updater)\.js$/.test(p) || /\.(ico|png)$/.test(p)) return true;
            return false;
          }
          return true; // خارج مجلد app: لا شيء غير المشغّل
        }).then(function () {
          var enc = new TextEncoder();
          files.push({ name: 'index.html', data: enc.encode(playerHtml(startHtml, clean(act), acts)) });
          files.push({ name: 'imsmanifest.xml', data: enc.encode(manifest(act)) });
          files.sort(function (a, b) { return a.name < b.name ? -1 : 1; });
          return makeZip(files);
        });
      });
    }).then(function (blob) {
      var el = document.createElement('a'); el.href = URL.createObjectURL(blob);
      el.download = safeName(act.title) + ' - SCORM.zip';
      document.body.appendChild(el); el.click(); el.remove();
      setTimeout(function () { URL.revokeObjectURL(el.href); }, 5000);
      done(blob.size);
    }).catch(fail);
  }

  MK._scorm = { makeZip: makeZip, playerHtml: playerHtml, manifest: manifest };
  MK.exportScorm = function (act) {
    var bad = act.template === 'rounds'
      ? (act.content.ids || []).map(function (id) { return (MK.allActs() || []).filter(function (y) { return y.id === id; })[0]; }).filter(function (x) { return x && TEACHER_LED[x.template]; })[0]
      : (TEACHER_LED[act.template] ? act : null);
    if (bad) { MK.modal('لا يصلح لـ SCORM', h('p', null, TEACHER_LED[bad.template] + '، فلا يلعبها الطالب وحده. اختر نشاطًا من قالب آخر.'), [{ label: 'حسنًا' }]); return; }
    if (typeof window.showDirectoryPicker !== 'function') { MK.toast('تصدير SCORM يحتاج متصفح Chrome أو Edge'); return; }
    var status = h('p', { class: 'hint' });
    var close = MK.modal('تصدير SCORM لمنصة التعلم', h('div', { class: 'scorm-help' },
      h('p', null, 'يصير النشاط ', h('b', null, 'حزمة SCORM'), ': ملفًا مضغوطًا ترفعه إلى منصة التعلم (Microsoft Teams أو منصة الوزارة أو Moodle)، فيلعبه كل طالب وحده من جهازه، وتصلك درجته في المنصة.'),
      h('ol', null,
        h('li', null, 'اضغط «صدّر الحزمة». في أول مرة اختر مجلد «مسك الختام» في «المستندات» ليقرأ منه ملفات الأداة.'),
        h('li', null, 'يُنزَّل ملف باسم النشاط ينتهي بـ «SCORM.zip». ', h('b', null, 'لا تفكّ ضغطه.')),
        h('li', null, 'في المنصة: أضف مهمة أو محتوى من نوع SCORM، وارفع الملف كما هو.'),
        h('li', null, 'يفتح الطالب النشاط من المنصة، ويلعبه فرديًا، وعند الانتهاء تُرسَل درجته (من 100) ويُسجَّل أنه أكمل النشاط.')),
      h('p', { class: 'hint' }, 'الطالب لا يحتاج تثبيت الأداة. اللعب فردي فقط، فلا فرق ولا عجلة أسماء. حجم الحزمة نحو 3 ميغابايت.'),
      status),
      [{ label: 'صدّر الحزمة', onClick: function () {
        status.textContent = 'أُجهّز الحزمة…';
        build(act, function (size) { status.textContent = ''; close(); MK.toast('صُدّرت حزمة SCORM (' + ar((size / 1048576).toFixed(1)) + ' ميغابايت)'); },
          function (e) { status.textContent = e && e.name === 'AbortError' ? '' : 'تعذّر التصدير. تأكد أنك اخترت مجلد «مسك الختام».'; });
        return false;
      } }, { label: 'إغلاق', cls: 'ghost' }]);
  };
})();
