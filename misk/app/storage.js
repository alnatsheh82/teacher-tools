/* مِسك الختام — حفظ الأنشطة: في مجلد «أنشطتي» إن أمكن، وإلا داخل المتصفح */
(function () {
  var MK = window.MK;
  var LKEY = 'misk.activities';
  var dirHandle = null;
  var fileOf = {}; // id -> اسم الملف في المجلد

  // ---------- IndexedDB لحفظ مقبض المجلد ----------
  function idb(mode, fn) {
    return new Promise(function (res, rej) {
      var r = indexedDB.open('misk-store', 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('kv'); };
      r.onerror = function () { rej(r.error); };
      r.onsuccess = function () {
        var tx = r.result.transaction('kv', mode), st = tx.objectStore('kv');
        var q = fn(st);
        tx.oncomplete = function () { res(q && q.result); };
        tx.onerror = function () { rej(tx.error); };
      };
    });
  }
  function idbGet(k) { return idb('readonly', function (s) { return s.get(k); }); }
  function idbSet(k, v) { return idb('readwrite', function (s) { return s.put(v, k); }); }
  function idbDel(k) { return idb('readwrite', function (s) { return s.delete(k); }); }

  // ---------- التخزين داخل المتصفح ----------
  function localAll() { try { return JSON.parse(localStorage.getItem(LKEY) || '{}'); } catch (e) { return {}; } }
  function localPut(map) { localStorage.setItem(LKEY, JSON.stringify(map)); }

  var S = {
    mode: 'local', // local | folder | needs-permission
    folderName: '',
    supported: typeof window.showDirectoryPicker === 'function'
  };

  function safeName(s) {
    return (s || 'نشاط').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60) || 'نشاط';
  }
  function fileNameFor(act) { return safeName(act.title) + ' — ' + act.id + '.misk.json'; }

  S.init = function () {
    if (!S.supported) { S.mode = 'local'; return Promise.resolve(S.mode); }
    return idbGet('dir').then(function (hd) {
      if (!hd) { S.mode = 'local'; return S.mode; }
      dirHandle = hd; S.folderName = hd.name;
      return hd.queryPermission({ mode: 'readwrite' }).then(function (p) {
        S.mode = p === 'granted' ? 'folder' : 'needs-permission';
        return S.mode;
      });
    }).catch(function () { S.mode = 'local'; return S.mode; });
  };

  // ترتيب «أدوات المعلمين»: أدوات المعلمين / مسك الختام / البرنامج + البيانات
  var TOOL = 'مسك الختام', DATA = 'البيانات', PROG = 'البرنامج';
  function sub(d, name, create) { return d.getDirectoryHandle(name, { create: !!create }).catch(function () { return null; }); }
  // من أي مجلد يختاره المعلم نصل إلى مجلد البيانات (ومجلد البرنامج إن وُجد)
  S.resolveFamily = function (hd) {
    var out = { data: hd, prog: null };
    if (hd.name === DATA) return Promise.resolve(out);
    if (hd.name === PROG) return Promise.reject({ name: 'PickedProgram' });
    return sub(hd, TOOL).then(function (t) { return t || hd; }).then(function (root) {
      return sub(root, PROG).then(function (pg) {
        if (!pg && root === hd && hd.name !== TOOL) return out; // مجلد عادي: يُستعمل كما هو
        out.prog = pg;
        return sub(root, DATA, true).then(function (dd) { out.data = dd || hd; return out; });
      });
    });
  };
  S.chooseFolder = function () {
    return window.showDirectoryPicker({ id: 'misk-activities', mode: 'readwrite' }).then(S.resolveFamily).then(function (r) {
      var hd = r.data;
      dirHandle = hd; S.folderName = hd.name; S.mode = 'folder';
      return idbSet('dir', hd).then(function () { if (r.prog) return idbSet('prog', r.prog); })
        .then(function () { return S.migrateLocal(); });
    });
  };
  S.progHandle = function () { return idbGet('prog').catch(function () { return null; }); };
  S.setProgHandle = function (hd) { return idbSet('prog', hd); };
  // هل البيانات في مجلد قديم (أنشطتي) لا في «مسك الختام/البيانات»؟
  S.isLegacy = function () { return S.mode === 'folder' && S.folderName !== DATA; };
  // نقل البيانات إلى مجلد «البيانات» في ترتيب العائلة (نسخ، ولا يُحذف القديم)
  function copyDir(from, to) {
    var it = from.values();
    function step() {
      return it.next().then(function (r) {
        if (r.done) return;
        var e = r.value;
        if (e.kind === 'directory') return to.getDirectoryHandle(e.name, { create: true }).then(function (d) { return copyDir(e, d); }).then(step);
        return e.getFile().then(function (f) {
          return to.getFileHandle(e.name, { create: true }).then(function (fh) { return fh.createWritable(); })
            .then(function (w) { return w.write(f).then(function () { return w.close(); }); });
        }).then(step);
      });
    }
    return step();
  }
  S.moveToFamily = function () {
    var src = dirHandle;
    return window.showDirectoryPicker({ id: 'misk-family', mode: 'readwrite' }).then(S.resolveFamily).then(function (r) {
      if (r.data.name !== DATA) throw { name: 'NotFamily' };
      return (src && src.name !== DATA ? copyDir(src, r.data) : Promise.resolve()).then(function () {
        dirHandle = r.data; S.folderName = DATA; S.mode = 'folder';
        return idbSet('dir', r.data).then(function () { if (r.prog) return idbSet('prog', r.prog); })
          .then(function () { return S.migrateLocal(); });
      });
    });
  };
  S.reconnect = function () {
    if (!dirHandle) return S.chooseFolder();
    return dirHandle.requestPermission({ mode: 'readwrite' }).then(function (p) {
      S.mode = p === 'granted' ? 'folder' : 'needs-permission';
      if (S.mode === 'folder') return S.migrateLocal();
    });
  };
  S.forgetFolder = function () {
    dirHandle = null; S.mode = 'local'; S.folderName = '';
    return idbDel('dir');
  };
  // نقل ما حُفظ في المتصفح إلى المجلد بعد ربطه
  S.migrateLocal = function () {
    var map = localAll(), ids = Object.keys(map);
    if (!ids.length) return Promise.resolve(0);
    return ids.reduce(function (p, id) { return p.then(function () { return writeFile(map[id]); }); }, Promise.resolve())
      .then(function () { localPut({}); return ids.length; });
  };

  // مسار النشاط في المجلد: الصف / الفصل / الدرس
  function pathFor(act) {
    var p = [];
    if (act.grade) p.push(safeName(act.grade));
    if (act.term) p.push('الفصل ' + safeName(act.term));
    if (act.grade || act.term) p.push(safeName(act.title || 'درس'));
    if ((act.grade || act.term) && act.kind && MK.kindName) p.push(MK.kindName(act.kind));
    return p;
  }
  function getDir(parts, create) {
    return parts.reduce(function (pr, name) {
      return pr.then(function (d) { return d.getDirectoryHandle(name, { create: !!create }); });
    }, Promise.resolve(dirHandle));
  }
  function fileNameFor2(act) {
    var t = MK.templates[act.template];
    return safeName(t ? t.name : act.template) + ' — ' + act.id + '.misk.json';
  }
  function writeFile(act) {
    var parts = pathFor(act), name = parts.length ? fileNameFor2(act) : fileNameFor(act), old = fileOf[act.id];
    var dir;
    return getDir(parts, true).then(function (d) { dir = d; return d.getFileHandle(name, { create: true }); })
      .then(function (fh) { return fh.createWritable(); })
      .then(function (w) { return w.write(JSON.stringify(act, null, 2)).then(function () { return w.close(); }); })
      .then(function () {
        var neo = { dir: dir, name: name, parts: parts };
        fileOf[act.id] = neo;
        if (old && (old.name !== name || old.parts.join('/') !== parts.join('/')))
          return old.dir.removeEntry(old.name).then(function () { return pruneEmpty(old.parts); }).catch(function () { });
      });
  }
  // حذف المجلدات الفارغة بعد نقل أو حذف آخر نشاط فيها
  function pruneEmpty(parts) {
    if (!parts.length) return Promise.resolve();
    return getDir(parts, false).then(function (d) {
      return d.values().next().then(function (r) {
        if (!r.done) return;
        return getDir(parts.slice(0, -1), false).then(function (p) { return p.removeEntry(parts[parts.length - 1]); })
          .then(function () { return pruneEmpty(parts.slice(0, -1)); });
      });
    }).catch(function () { });
  }

  S.list = function () {
    if (S.mode !== 'folder') {
      var map = localAll();
      return Promise.resolve(Object.keys(map).map(function (k) { return map[k]; }));
    }
    var out = [];
    fileOf = {};
    function walk(dir, parts, depth) {
      var it = dir.values();
      function step() {
        return it.next().then(function (r) {
          if (r.done) return;
          var e = r.value;
          if (e.kind === 'directory') return (depth < 4 ? walk(e, parts.concat(e.name), depth + 1) : Promise.resolve()).then(step);
          if (!/\.misk\.json$/i.test(e.name)) return step();
          return e.getFile().then(function (f) { return f.text(); }).then(function (txt) {
            try {
              var a = JSON.parse(txt);
              if (a && a.app === 'misk' && a.id) { out.push(a); fileOf[a.id] = { dir: dir, name: e.name, parts: parts }; }
            } catch (err) { }
            return step();
          });
        });
      }
      return step();
    }
    return walk(dirHandle, [], 0).then(function () { return out; });
  };

  S.save = function (act) {
    act.updated = Date.now();
    if (!act.created) act.created = act.updated;
    if (S.mode === 'folder') return writeFile(act).then(function () { return act; });
    var map = localAll(); map[act.id] = act;
    try { localPut(map); } catch (e) { return Promise.reject(e); }
    return Promise.resolve(act);
  };

  S.remove = function (act) {
    if (S.mode === 'folder') {
      var f = fileOf[act.id];
      if (!f) return Promise.resolve();
      return f.dir.removeEntry(f.name).then(function () { delete fileOf[act.id]; return pruneEmpty(f.parts); });
    }
    var map = localAll(); delete map[act.id]; localPut(map);
    return Promise.resolve();
  };

  // تصدير نشاط ملفًا يُحمَّل
  S.exportFile = function (act) {
    var blob = new Blob([JSON.stringify(act, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileNameFor(act);
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  };
  // استيراد ملفات أنشطة
  S.importFiles = function (files) {
    var list = Array.prototype.slice.call(files);
    var ok = 0;
    return list.reduce(function (p, f) {
      return p.then(function () { return f.text(); }).then(function (txt) {
        var a = JSON.parse(txt);
        if (!a || a.app !== 'misk' || !MK.templates[a.template]) throw new Error('bad');
        ok++;
        return S.save(a);
      }).catch(function () { });
    }, Promise.resolve()).then(function () { return ok; });
  };

  // ---------- الصفوف: ملف واحد في المجلد، أو داخل المتصفح ----------
  var CFILE = 'شعبي.misk-classes.json', CKEY = 'misk.classes';
  function emptyClasses() { return { app: 'misk-classes', v: 1, classes: [] }; }
  function localClasses() { try { return JSON.parse(localStorage.getItem(CKEY)) || emptyClasses(); } catch (e) { return emptyClasses(); } }
  S.loadClasses = function () {
    if (S.mode !== 'folder') return Promise.resolve(localClasses());
    return dirHandle.getFileHandle(CFILE).then(function (fh) { return fh.getFile(); }).then(function (f) { return f.text(); })
      .then(function (t) { var d = JSON.parse(t); return d && d.classes ? d : emptyClasses(); })
      .catch(function () {
        // لا يوجد ملف بعد: انقل ما في المتصفح إن وُجد
        var l = localClasses();
        if (l.classes.length) return S.saveClasses(l).then(function () { localStorage.removeItem(CKEY); return l; });
        return emptyClasses();
      });
  };
  S.saveClasses = function (data) {
    if (S.mode !== 'folder') { localStorage.setItem(CKEY, JSON.stringify(data)); return Promise.resolve(); }
    return dirHandle.getFileHandle(CFILE, { create: true }).then(function (fh) { return fh.createWritable(); })
      .then(function (w) { return w.write(JSON.stringify(data, null, 2)).then(function () { return w.close(); }); });
  };

  // ---------- ملفي: بيانات المعلم والمدرسة ----------
  var PFILE = 'ملفي.misk-profile.json', PKEY = 'misk.profile';
  S.loadProfile = function () {
    if (S.mode !== 'folder') { try { return Promise.resolve(JSON.parse(localStorage.getItem(PKEY)) || {}); } catch (e) { return Promise.resolve({}); } }
    return dirHandle.getFileHandle(PFILE).then(function (fh) { return fh.getFile(); }).then(function (f) { return f.text(); })
      .then(function (t) { return JSON.parse(t) || {}; })
      .catch(function () { try { var l = JSON.parse(localStorage.getItem(PKEY)); if (l) return S.saveProfile(l).then(function () { return l; }); } catch (e) { } return {}; });
  };
  S.saveProfile = function (p) {
    var data = Object.assign({ app: 'misk-profile', v: 1 }, p);
    if (S.mode !== 'folder') { localStorage.setItem(PKEY, JSON.stringify(data)); return Promise.resolve(); }
    return dirHandle.getFileHandle(PFILE, { create: true }).then(function (fh) { return fh.createWritable(); })
      .then(function (w) { return w.write(JSON.stringify(data, null, 2)).then(function () { return w.close(); }); });
  };
  S._useDir = function (d) { dirHandle = d; S.mode = 'folder'; S.folderName = d.name || 'أنشطتي'; }; // للاختبار
  MK.store = S;
})();
