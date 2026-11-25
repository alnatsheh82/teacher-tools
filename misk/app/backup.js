/* مِسك الختام — النسخ الاحتياطي والاستعادة، وفحص بنية الأنشطة، وتحصين قراءة الملفات */
(function () {
  var MK = window.MK, h = MK.h, ar = MK.toArabicDigits;
  MK.EN = MK.EN || {}; MK.EN['التفسير: '] = 'Why: ';

  // ================= فحص بنية النشاط وإصلاحه =================
  function isObj(x) { return x && typeof x === 'object' && !Array.isArray(x); }
  // يطابق القيمة على شكل القيمة الافتراضية: يصلح الأنواع ويكمل الحقول الناقصة
  function shape(v, def) {
    if (Array.isArray(def)) {
      if (!Array.isArray(v)) return def.slice ? JSON.parse(JSON.stringify(def)) : [];
      var proto = def.length ? def[0] : undefined;
      if (proto === undefined) return v.filter(function (x) { return x != null; });
      return v.filter(function (x) { return x != null; }).map(function (x) { return shape(x, proto); });
    }
    if (isObj(def)) {
      var out = isObj(v) ? Object.assign({}, v) : {};
      Object.keys(def).forEach(function (k) { out[k] = shape(out[k], def[k]); });
      return out;
    }
    if (typeof def === 'string') return v == null ? '' : (typeof v === 'string' ? v : (typeof v === 'number' || typeof v === 'boolean') ? String(v) : '');
    if (typeof def === 'number') return typeof v === 'number' && isFinite(v) ? v : (isFinite(+v) && v !== '' && v != null ? +v : def);
    if (typeof def === 'boolean') return v === true || v === false ? v : (v == null ? def : !!v);
    return v === undefined ? def : v;
  }
  var KEEP_NULL = { answer: 1, x: 1, y: 1 }; // قيم يُسمح بأن تكون فارغة (حكم لم يُحدد، دبوس لم يوضع)
  // يعيد {ok, act, err}
  MK.sanitizeAct = function (a) {
    if (!isObj(a)) return { ok: false, err: 'ليس نشاطًا' };
    if (a.app !== 'misk') return { ok: false, err: 'ليس ملفًا من مِسك الختام' };
    var tpl = MK.templates[a.template];
    if (!tpl) return { ok: false, err: 'قالب غير معروف: ' + String(a.template).slice(0, 30) };
    var x = JSON.parse(JSON.stringify(a));
    if (typeof x.id !== 'string' || !/^[\w-]{3,64}$/.test(x.id)) x.id = MK.uid();
    ['title', 'grade', 'term', 'goal', 'kind', 'theme', 'lang'].forEach(function (k) { if (x[k] != null && typeof x[k] !== 'string') x[k] = String(x[k]); });
    if (x.kind && !MK.KINDS.some(function (k) { return k.v === x.kind; })) delete x.kind;
    if (x.lang && x.lang !== 'en') x.lang = 'ar';
    if (!isObj(x.settings)) x.settings = {};
    if (!Array.isArray(x.settings.levels)) x.settings.levels = [];
    if (x.settings.timer != null && !(+x.settings.timer >= 0)) x.settings.timer = 0;
    var blank = tpl.blank(), raw = isObj(x.content) ? x.content : {};
    // احفظ القيم الفارغة المقصودة قبل المطابقة
    var c = shape(raw, blank);
    // أعد null المقصودة (مثل حكم صح/خطأ غير محدد) ومواضع الدبابيس
    (function restore(src, dst) {
      if (Array.isArray(src) && Array.isArray(dst)) src.forEach(function (s, i) { restore(s, dst[i]); });
      else if (isObj(src) && isObj(dst)) Object.keys(src).forEach(function (k) { if (KEEP_NULL[k] && src[k] === null) dst[k] = null; else restore(src[k], dst[k]); });
    })(raw, c);
    // حقول خاصة بقوالب معيّنة
    if (c.questions) c.questions.forEach(function (q) { q.correct = Number.isInteger(q.correct) && q.correct < q.options.length ? q.correct : -1; if (typeof q.explain !== 'string') delete q.explain; });
    if (a.template === 'diagram') c.labels = (Array.isArray(raw.labels) ? raw.labels : []).filter(isObj).map(function (l) { return { text: String(l.text || ''), x: l.x == null ? null : +l.x, y: l.y == null ? null : +l.y }; });
    if (a.template === 'rounds') c.ids = (Array.isArray(raw.ids) ? raw.ids : []).filter(function (s) { return typeof s === 'string'; });
    if (typeof c.image === 'string' && c.image && !/^data:image\//.test(c.image)) c.image = '';
    x.content = c;
    // تحقق نهائي بقواعد القالب نفسه (الجولات تُتحقق عند العرض)
    if (a.template !== 'rounds') {
      var e = null;
      try { e = tpl.validate(c); } catch (err) { e = 'محتوى غير صالح'; }
      if (e) return { ok: false, err: e, act: x };
    }
    return { ok: true, act: x };
  };

  // ================= تحصين قراءة الملفات =================
  var LIMITS = { json: 25, docx: 30, pptx: 60, xlsx: 15 }; // ميغابايت
  MK.checkFile = function (file, kind) {
    return new Promise(function (resolve, reject) {
      if (!file) return reject('لم يُختر ملف.');
      var mb = file.size / 1048576, lim = LIMITS[kind] || 30;
      if (mb > lim) return reject('الملف كبير جدًا (' + mb.toFixed(1) + ' م.ب). الحد الأعلى ' + lim + ' م.ب.');
      if (file.size === 0) return reject('الملف فارغ.');
      if (kind === 'json') return resolve();
      file.slice(0, 8).arrayBuffer().then(function (b) {
        var u = new Uint8Array(b);
        if (u[0] === 0xD0 && u[1] === 0xCF && u[2] === 0x11 && u[3] === 0xE0) return reject(kind === 'xlsx' ? 'الملف محمي بكلمة مرور أو بصيغة Excel القديمة (.xls). احفظه بصيغة .xlsx بلا كلمة مرور.' : 'الملف محمي بكلمة مرور، أو بالصيغة القديمة (.doc / .ppt). احفظه بصيغة .' + kind + ' بلا كلمة مرور ثم أعد المحاولة.');
        if (!(u[0] === 0x50 && u[1] === 0x4B)) return reject('هذا ليس ملف ' + (kind === 'docx' ? 'Word' : kind === 'pptx' ? 'PowerPoint' : 'Excel') + ' صالحًا (.' + kind + ').');
        if (typeof DecompressionStream === 'undefined') return reject('هذا المتصفح لا يدعم قراءة هذه الملفات. استخدم إصدارًا حديثًا من Chrome أو Edge.');
        resolve();
      }).catch(function () { reject('تعذّرت قراءة الملف.'); });
    });
  };
  MK.fileError = function (msg) {
    MK.modal('تعذّر فتح الملف', typeof msg === 'string' ? h('p', null, msg) : (msg && msg.nodeType ? msg : h('p', null, 'الملف تالف أو غير مدعوم.')), [{ label: 'حسنًا' }]);
  };

  // ================= النسخ الاحتياطي =================
  function today() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  MK.makeBackup = function () {
    var acts = (MK.allActs ? MK.allActs() : []).map(function (a) { var x = MK.clone(a); delete x.sample; return x; });
    var settings = MK.clone(MK.settings); delete settings.lastBackup;
    var data = { app: 'misk-backup', v: 1, created: Date.now(), version: MK.VERSION || '', acts: acts, classes: MK.classes || { classes: [] }, profile: MK.profile || {}, settings: settings };
    var blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    var el = document.createElement('a'); el.href = URL.createObjectURL(blob);
    el.download = 'مسك الختام — نسخة احتياطية ' + today() + '.misk-backup.json';
    document.body.appendChild(el); el.click(); el.remove();
    setTimeout(function () { URL.revokeObjectURL(el.href); }, 3000);
    MK.settings.lastBackup = Date.now(); MK.saveSettings();
    MK.toast('حُفظت النسخة الاحتياطية: ' + ar(acts.length) + ' نشاط و' + ar(((MK.classes || {}).classes || []).length) + ' شعبة');
    var bn = document.querySelector('.backup-banner'); if (bn) bn.remove();
  };
  MK.restoreBackup = function (done) {
    var fi = h('input', { type: 'file', accept: '.json,application/json', class: 'hidden' });
    document.body.appendChild(fi);
    fi.addEventListener('change', function () {
      var f = fi.files[0]; fi.remove();
      MK.checkFile(f, 'json').then(function () { return f.text(); }).then(function (t) {
        var d; try { d = JSON.parse(t); } catch (e) { throw 'الملف ليس نسخة احتياطية صالحة.'; }
        if (!d || d.app !== 'misk-backup' || !Array.isArray(d.acts)) throw 'هذا ليس ملف نسخة احتياطية من مِسك الختام.';
        var good = [], bad = 0;
        d.acts.forEach(function (a) { var r = MK.sanitizeAct(a); if (r.ok || (r.act && a.template === 'rounds')) good.push(r.act); else if (r.act && r.act.needsAnswers) good.push(r.act); else bad++; });
        var nCls = (d.classes && Array.isArray(d.classes.classes)) ? d.classes.classes.length : 0;
        var opt = { acts: true, classes: nCls > 0, profile: !!(d.profile && (d.profile.school || d.profile.teacher || d.profile.logo)) };
        function cb(key, label) { var c = h('input', { type: 'checkbox', checked: opt[key] || null }); c.addEventListener('change', function () { opt[key] = c.checked; }); return h('label', { class: 'toggle' }, c, label); }
        var when = d.created ? new Date(d.created).toLocaleDateString('ar-QA-u-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
        var body = h('div', { class: 'bk-body' },
          h('p', null, 'نسخة بتاريخ ', h('b', null, when), '، فيها:'),
          cb('acts', ar(good.length) + ' نشاط' + (bad ? ' (و' + ar(bad) + ' تالف سيُتجاهل)' : '')),
          nCls ? cb('classes', ar(nCls) + ' شعبة مع أسماء الطلاب وسجل المشاركة') : null,
          opt.profile ? cb('profile', 'ملفي: اسم المعلم والمدرسة والشعار والمجالات') : null,
          h('p', { class: 'hint' }, 'الأنشطة التي لها المعرّف نفسه تُستبدل بنسختها في الملف، وما عداها يبقى كما هو.'));
        MK.modal('استعادة نسخة احتياطية', body, [{ label: 'استعد', onClick: function () {
          var p = Promise.resolve(), n = 0;
          if (opt.acts) good.forEach(function (a) { p = p.then(function () { return MK.store.save(a).then(function () { n++; }); }); });
          if (opt.classes) p = p.then(function () {
            var cur = MK.classes || { app: 'misk-classes', v: 1, classes: [] };
            d.classes.classes.forEach(function (c) { if (!c || !c.id || !Array.isArray(c.students)) return; var i = cur.classes.findIndex(function (x) { return x.id === c.id; }); if (i >= 0) cur.classes[i] = c; else cur.classes.push(c); });
            MK.classes = cur; return MK.saveClasses();
          });
          if (opt.profile) p = p.then(function () { MK.profile = Object.assign({}, MK.profile || {}, d.profile); return MK.store.saveProfile(MK.profile); });
          p.then(function () { MK.toast('استُعيد ' + ar(n) + ' نشاط'); if (done) done(); })
            .catch(function () { MK.toast('تعذّرت استعادة بعض البيانات'); if (done) done(); });
        } }, { label: 'إلغاء', cls: 'soft' }]);
      }).catch(function (m) { MK.fileError(m); });
    });
    fi.click();
  };
  MK.backupSection = function () {
    var last = MK.settings.lastBackup;
    return h('div', { class: 'bk-sec' },
      h('p', { class: 'hint' }, last ? 'آخر نسخة احتياطية: ' + new Date(last).toLocaleDateString('ar-QA-u-nu-latn') : 'لم تأخذ نسخة احتياطية بعد.'),
      h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
        h('button', { type: 'button', class: 'btn small', onclick: function () { MK.makeBackup(); } }, MK.icon('download'), 'خذ نسخة احتياطية الآن'),
        h('button', { type: 'button', class: 'btn small ghost', onclick: function () { MK.restoreBackup(function () { if (MK.goHome) MK.goHome(); }); } }, MK.icon('upload'), 'استعد من نسخة')),
      h('p', { class: 'hint' }, 'ملف واحد فيه أنشطتك وشعبك وسجل المشاركة وبياناتك. احفظه في OneDrive أو على ذاكرة خارجية.'));
  };
  // تذكير: أسبوعيًا، وأقوى إن كانت الأنشطة داخل المتصفح
  MK.backupBanner = function () {
    var n = (MK.allActs ? MK.allActs() : []).length;
    if (!n) return null;
    var last = MK.settings.lastBackup || 0, days = (Date.now() - last) / 864e5;
    var local = MK.store.mode !== 'folder';
    if (days < 7 && !(local && days >= 3)) return null;
    if (MK.settings.backupSnooze && Date.now() < MK.settings.backupSnooze) return null;
    return h('div', { class: 'backup-banner' + (local ? ' warn' : '') }, MK.icon('save'),
      h('div', null, h('strong', null, last ? 'مرّ ' + ar(Math.floor(days)) + ' يومًا على آخر نسخة احتياطية' : 'لم تأخذ نسخة احتياطية من أنشطتك بعد'),
        h('span', null, local ? 'أنشطتك محفوظة داخل المتصفح، وقد تضيع إن نُظّف المتصفح أو تغيّر الجهاز.' : 'نسخة في OneDrive أو ذاكرة خارجية تحميك من ضياع المجلد.')),
      h('button', { type: 'button', class: 'btn small', onclick: function () { MK.makeBackup(); } }, 'خذ نسخة الآن'),
      h('button', { type: 'button', class: 'mini-x', 'aria-label': 'ذكّرني لاحقًا', title: 'ذكّرني بعد يومين', onclick: function () { MK.settings.backupSnooze = Date.now() + 2 * 864e5; MK.saveSettings(); this.parentNode.remove(); } }, MK.icon('close')));
  };

  // ================= فحص الأداة =================
  MK.selfTest = function () {
    var list = h('div', { class: 'st-list' }), sum = h('p', { class: 'st-sum' }, 'جارٍ الفحص…');
    MK.modal('فحص الأداة', h('div', null, sum, list), [{ label: 'إغلاق' }]);
    var results = [], box = h('div', { class: 'st-sandbox', 'aria-hidden': 'true' });
    document.body.appendChild(box);
    function row(name, ok, note) { results.push(ok); list.appendChild(h('div', { class: 'st-row ' + (ok ? 'ok' : 'no') }, h('span', null, ok ? '✓' : '✗'), h('b', null, name), note ? h('em', null, note) : null)); }
    var tpls = Object.keys(MK.templates).filter(function (k) { return k !== 'rounds'; });
    var origSound = MK.sound, quiet = {}; Object.keys(origSound).forEach(function (k) { quiet[k] = function () { }; });
    var origConf = MK.confetti;
    MK.sound = quiet; MK.confetti = function () { };
    var i = 0;
    function next() {
      if (i >= tpls.length) return storage();
      var id = tpls[i++], tpl = MK.templates[id], smp = MK.samples.filter(function (s) { return s.template === id; })[0];
      try {
        var act = smp ? MK.clone(smp) : { app: 'misk', id: 'st', template: id, settings: {}, content: tpl.blank() };
        var san = MK.sanitizeAct(act);
        if (!san.ok && smp) throw new Error(san.err);
        MK.clear(box);
        var body = h('div', { class: 'stage-body' }), foot = h('div');
        box.appendChild(body); box.appendChild(foot);
        var ended = false;
        var ctx = { act: san.act || act, body: body, foot: foot, setProgress: function () { }, addPoints: function () { }, addRaw: function () { }, nextTurn: function () { }, mascot: function () { }, end: function () { ended = true; }, teamCount: function () { return 1; }, teamName: function () { return ''; } };
        var clean = tpl.play(ctx);
        var shown = body.childNodes.length > 0;
        setTimeout(function () { try { if (clean) clean(); } catch (e) { } row(tpl.name, shown, shown ? '' : 'لم يُعرض شيء'); next(); }, 60);
      } catch (e) { row(tpl.name, false, String(e && e.message || e).slice(0, 80)); next(); }
    }
    function storage() {
      box.remove(); MK.sound = origSound; MK.confetti = origConf;
      var t = { app: 'misk', v: 1, id: 'selftest-' + Date.now(), template: 'tf', title: '__فحص__', grade: '', term: '', settings: {}, content: { items: [{ text: 'فحص', answer: true }] } };
      MK.store.save(t).then(function () { return MK.store.remove(t); }).then(function () { row('الحفظ والحذف (' + (MK.store.mode === 'folder' ? 'المجلد' : 'المتصفح') + ')', true); })
        .catch(function () { row('الحفظ والحذف', false, 'تعذّر الحفظ'); })
        .then(function () {
          var fontsOk = document.fonts && document.fonts.check ? document.fonts.check('20px "kfgqpc_hafs_uthmanic_script"', 'ب') : true;
          row('خط المصحف', fontsOk);
          row('قراءة ملفات Word وPowerPoint', typeof DecompressionStream !== 'undefined', typeof DecompressionStream !== 'undefined' ? '' : 'المتصفح لا يدعمها');
          row('الحفظ في مجلد', !!window.showDirectoryPicker, window.showDirectoryPicker ? '' : 'المتصفح لا يدعمه، وستُحفظ الأنشطة داخله');
          var bad = results.filter(function (x) { return !x; }).length;
          sum.textContent = bad ? 'انتهى الفحص: ' + ar(results.length - bad) + ' سليم، و' + ar(bad) + ' فيه مشكلة.' : 'انتهى الفحص: كل شيء سليم ✓ (' + ar(results.length) + ' بندًا)';
          sum.className = 'st-sum ' + (bad ? 'no' : 'ok');
        });
    }
    setTimeout(next, 100);
  };
})();
