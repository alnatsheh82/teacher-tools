/* مِسك الختام — صفوفي، وشاشة ما قبل البدء، وعجلة الأسماء، وتوزيع الفرق */
(function () {
  var MK = window.MK, h = MK.h, ar = MK.toArabicDigits;
  var LEVELS = [{ value: 'a', label: 'أ' }, { value: 'b', label: 'ب' }, { value: 'c', label: 'ج' }];
  var TEAM_NAMES = ['الصقور', 'النجوم', 'الفرسان', 'الأبطال', 'الروّاد', 'المبدعون', 'النخبة', 'العلماء', 'الأوائل', 'المتميزون', 'السبّاقون', 'الشهب'];

  MK.classes = { app: 'misk-classes', v: 1, classes: [] };
  MK.loadClasses = function () { return MK.store.loadClasses().then(function (d) { MK.classes = d; return d; }); };
  MK.saveClasses = function () { return MK.store.saveClasses(MK.classes).catch(function () { MK.toast('تعذّر حفظ الصفوف'); }); };
  function findClass(id) { return MK.classes.classes.filter(function (c) { return c.id === id; })[0]; }

  // ---------- قسم «صفوفي» في الرئيسية ----------
  MK.classesSection = function () {
    var wrap = h('div');
    wrap.appendChild(h('div', { class: 'section-head page-head' }, h('h2', null, 'شُعَبي'), h('span', { class: 'spacer' }),
      h('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' } },
        h('button', { type: 'button', class: 'btn soft', onclick: function () { MK.pickExcel(function (rows, fname) { bulkImport(rows, fname); }); } }, MK.icon('upload'), 'رفع من Excel'),
        h('button', { type: 'button', class: 'btn', onclick: function () { openClassEditor(null); } }, MK.icon('plus'), 'شعبة جديدة'))));
    var grid = h('div', { class: 'grid' });
    wrap.appendChild(grid);
    var list = MK.classes.classes;
    if (!list.length) grid.appendChild(h('div', { class: 'empty', style: { gridColumn: '1/-1' } }, 'أضف شُعَبك وأسماء طلابها، لتختار الأداة من يجيب أو توزّع الطلاب على فرق. ويمكنك رفعها كلها من ملف Excel.'));
    list.forEach(function (c) {
      grid.appendChild(h('div', { class: 'card act-card class-card' },
        h('span', { class: 'tpl' }, MK.icon('users'), 'شعبة'),
        h('h3', null, c.name),
        h('div', { class: 'meta' }, 'عدد الطلاب: ' + ar(c.students.length)),
        h('div', { class: 'row' },
          h('button', { type: 'button', class: 'btn small ghost', onclick: function () { openClassEditor(c); } }, MK.icon('edit'), 'تعديل'),
          h('button', { type: 'button', class: 'btn small soft', onclick: function () { MK.partLog(c); } }, MK.icon('star'), 'سجل المشاركة'),
          h('button', {
            type: 'button', class: 'mini-x', title: 'حذف الشعبة', 'aria-label': 'حذف الشعبة', onclick: function () {
              MK.confirm('حذف الشعبة', 'هل تريد حذف شعبة «' + c.name + '» وأسماء طلابها؟ لا يمكن التراجع.', 'احذف', function () {
                MK.classes.classes = MK.classes.classes.filter(function (x) { return x.id !== c.id; });
                MK.saveClasses().then(MK.goHome);
              }, true);
            }
          }, MK.icon('trash')))));
    });
    return wrap;
  };


  // ---------- قراءة ملف Excel (.xlsx) بلا إنترنت ----------
  function colIdx(ref) { var m = /^([A-Z]+)/.exec(ref || ''), n = 0; if (!m) return -1; for (var i = 0; i < m[1].length; i++) n = n * 26 + m[1].charCodeAt(i) - 64; return n - 1; }
  MK.readXlsx = function (file) {
    return file.arrayBuffer().then(function (buf) {
      var dp = new DOMParser();
      return MK.unzip(buf, 'xl/sharedStrings.xml').catch(function () { return ''; }).then(function (ssx) {
        var ss = [];
        if (ssx) {
          var sis = dp.parseFromString(ssx, 'application/xml').getElementsByTagName('si');
          for (var i = 0; i < sis.length; i++) { var ts = sis[i].getElementsByTagName('t'), t = ''; for (var j = 0; j < ts.length; j++) t += ts[j].textContent; ss.push(t); }
        }
        var all = [];
        function next(n) {
          if (n > 30) return Promise.resolve(all);
          return MK.unzip(buf, 'xl/worksheets/sheet' + n + '.xml').then(function (x) {
            var rs = dp.parseFromString(x, 'application/xml').getElementsByTagName('row');
            for (var r = 0; r < rs.length; r++) {
              var cells = rs[r].getElementsByTagName('c'), row = [];
              for (var k = 0; k < cells.length; k++) {
                var c = cells[k], t = c.getAttribute('t'), v = c.getElementsByTagName('v')[0], val = '';
                if (t === 's' && v) val = ss[+v.textContent] || '';
                else if (t === 'inlineStr') { var is = c.getElementsByTagName('t'); for (var q = 0; q < is.length; q++) val += is[q].textContent; }
                else if (v) val = v.textContent;
                var ix = colIdx(c.getAttribute('r')); row[ix >= 0 ? ix : k] = String(val).trim();
              }
              for (var z = 0; z < row.length; z++) if (row[z] == null) row[z] = '';
              if (row.some(function (x) { return x; })) all.push(row);
            }
            all.push([]); // فاصل بين الأوراق
            return next(n + 1);
          }, function () { return all; });
        }
        return next(1);
      });
    });
  };
  MK.pickExcel = function (cb) {
    var fi = h('input', { type: 'file', accept: '.xlsx', class: 'hidden' });
    fi.addEventListener('change', function () {
      var f = fi.files[0]; fi.remove(); if (!f) return;
      MK.checkFile(f, 'xlsx').then(function () { return MK.readXlsx(f); }).then(function (rows) { cb(rows, f.name.replace(/\.xlsx$/i, '')); })
        .catch(function (m) { MK.fileError(typeof m === 'string' ? m : 'تعذّرت قراءة الملف. تأكد أنه ملف Excel بصيغة ‎.xlsx سليم.'); });
    });
    document.body.appendChild(fi); fi.click();
  };
  function norm(s) { return String(s || '').replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/\s+/g, ' ').trim(); }
  function uniq(a) { var o = []; a.forEach(function (x) { if (o.indexOf(x) < 0) o.push(x); }); return o; }
  function sameSec(a, b) { return norm(a).replace(/\s/g, '') === norm(b).replace(/\s/g, ''); }
  var H_NAME = /^(الاسم|اسم الطالب|اسم الطالبه|الطالب|اسم|name|student|student name|الاسم الرباعي|الاسم الثلاثي|الاسم الكامل)$/i,
    H_SEC = /^(الشعبه|الشعبة|الفصل|الصف\/الشعبه|الصف والشعبه|section|class|الصف)$/i,
    H_LV = /^(المستوى|التصنيف|level|الفئه|الفئة)$/i,
    H_SCORE = /^(الدرجه|الدرجة|الدرجات|المجموع|النسبه|النسبة|النسبه المئويه|score|grade|mark|marks|total|%)$/i;
  function levelOf(v) {
    v = norm(v);
    if (/^(ا|a|فائق|متفوق|مرتفع|عالي)$/i.test(v)) return 'a';
    if (/^(ب|b|متوسط)$/i.test(v)) return 'b';
    if (/^(ج|c|ضعيف|دعم|منخفض|يحتاج دعما|متدني)$/i.test(v)) return 'c';
    return '';
  }
  function num(x) { return parseFloat(String(x).replace('%', '').replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); })); }
  function parseRoster(rows) {
    var out = [], hdr = null, ci = {}, levelFrom = '', scoreRows = [];
    rows.forEach(function (r) {
      if (!r.length) { hdr = null; return; }
      var cells = r.map(norm);
      var nameCol = cells.findIndex(function (x) { return H_NAME.test(x); });
      if (nameCol >= 0) {
        hdr = 'yes';
        ci = { name: nameCol, sec: cells.findIndex(function (x) { return H_SEC.test(x); }), lv: cells.findIndex(function (x) { return H_LV.test(x); }), sc: cells.findIndex(function (x) { return H_SCORE.test(x); }) };
        return;
      }
      if (!hdr) {
        var c0 = r.findIndex(function (x) { return x && /[A-Za-zء-ي]/.test(x) && x.length > 3; });
        if (c0 < 0) return;
        ci = { name: c0, sec: -1, lv: -1, sc: -1 }; hdr = 'none';
      }
      var nm = (r[ci.name] || '').trim();
      if (!nm || nm.length > 60 || !/[A-Za-zء-ي]/.test(nm)) return;
      var st = { name: nm, section: ci.sec >= 0 ? (r[ci.sec] || '').trim() : '', level: ci.lv >= 0 ? levelOf(r[ci.lv]) : '' };
      if (st.level) levelFrom = 'عمود المستوى';
      else if (ci.sc >= 0) { var n = num(r[ci.sc]); if (!isNaN(n)) scoreRows.push({ st: st, v: n }); }
      out.push(st);
    });
    if (scoreRows.length) {
      var mx = Math.max.apply(null, scoreRows.map(function (x) { return x.v; }));
      var full = mx <= 1 ? 1 : [10, 20, 30, 40, 50, 60, 100].filter(function (f) { return mx <= f; })[0] || mx;
      scoreRows.forEach(function (x) { var p = x.v / full; x.st.level = p >= 0.85 ? 'a' : (p < 0.5 ? 'c' : 'b'); });
      if (!levelFrom) levelFrom = 'الدرجات (من ' + full + ')';
    }
    return { students: out, levelFrom: levelFrom };
  }
  MK.parseRoster = parseRoster;
  function mergeInto(c, list) {
    var have = {}, added = 0;
    c.students.forEach(function (x) { have[norm(x.name)] = x; });
    list.forEach(function (x) { var e = have[norm(x.name)]; if (e) { if (x.level) e.level = x.level; } else { c.students.push({ id: MK.uid(), name: x.name, level: x.level || '' }); added++; } });
    return added;
  }
  // رفع ملف كامل: شعبة لكل قيمة في عمود الشعبة
  function bulkImport(rows, fname) {
    var r = parseRoster(rows);
    if (!r.students.length) { MK.toast('لم يُعثر على أسماء في الملف'); return; }
    var bySec = {};
    r.students.forEach(function (s) { var k = s.section || fname || 'شعبة جديدة'; (bySec[k] = bySec[k] || []).push(s); });
    var secs = Object.keys(bySec);
    var body = h('div', null,
      h('p', null, 'فُهم من الملف: ' + ar(r.students.length) + ' طالب، في ' + ar(secs.length) + ' شعبة' + (r.levelFrom ? '، وحُدّدت المستويات من ' + r.levelFrom : '') + '.'),
      h('ul', { class: 'import-prev' }, secs.map(function (k) {
        var ex = MK.classes.classes.filter(function (c) { return sameSec(c.name, k); })[0];
        return h('li', null, h('strong', null, k), ': ' + ar(bySec[k].length) + ' طالب' + (ex ? ' (تُضاف إلى الشعبة الموجودة)' : ' (شعبة جديدة)'));
      })),
      h('p', { class: 'hint', style: { color: 'var(--muted)' } }, 'المستويات تبقى مخفية، وتراجعها من «إظهار المستويات» داخل كل شعبة.'));
    MK.modal('رفع الشُّعَب من Excel', body, [
      { label: 'أنشئ الشُّعَب', onClick: function () {
        secs.forEach(function (k) {
          var c = MK.classes.classes.filter(function (x) { return sameSec(x.name, k); })[0];
          if (!c) { c = { id: MK.uid(), name: k, students: [], picked: [] }; MK.classes.classes.push(c); }
          mergeInto(c, bySec[k]);
        });
        MK.saveClasses().then(function () { MK.toast('حُفظت الشُّعَب'); MK.goHome(); });
      } },
      { label: 'إلغاء', cls: 'ghost' }
    ]);
  }

  // ---------- محرّر الصف ----------
  function openClassEditor(orig) {
    var c = orig ? MK.clone(orig) : { id: MK.uid(), name: '', students: [], picked: [] };
    var showLv = false, dirty = false;
    window.scrollTo(0, 0);
    var m = MK.clear(MK.mainEl);
    var nameIn = h('input', { type: 'text', placeholder: 'مثال: 10/3', style: { fontSize: '22px', fontWeight: 700 } });
    nameIn.value = c.name; nameIn.addEventListener('input', function () { c.name = nameIn.value; dirty = true; });
    var listEl = h('div', { class: 'stu-list' });
    var lvBtn = h('button', { type: 'button', class: 'btn small ghost', onclick: function () { showLv = !showLv; drawList(); } });
    var countEl = h('span', { class: 'hint' });
    function drawList() {
      MK.clear(lvBtn).appendChild(MK.icon(showLv ? 'lock' : 'eye'));
      lvBtn.appendChild(document.createTextNode(showLv ? 'إخفاء المستويات' : 'إظهار المستويات'));
      countEl.textContent = 'عدد الطلاب: ' + ar(c.students.length);
      MK.clear(listEl);
      if (!c.students.length) { listEl.appendChild(h('div', { class: 'empty' }, 'لا يوجد طلاب بعد. الصق الأسماء في المربع وأضفها.')); return; }
      c.students.forEach(function (st, i) {
        var nm = h('input', { type: 'text', 'aria-label': 'اسم الطالب' }); nm.value = st.name;
        nm.addEventListener('input', function () { st.name = nm.value; dirty = true; });
        listEl.appendChild(h('div', { class: 'stu-row' },
          h('span', { class: 'num' }, ar(i + 1)), nm,
          showLv ? MK.choice(LEVELS.concat([{ value: '', label: '—' }]), st.level || '', function (v) { st.level = v; dirty = true; }, { cls: 'lv', label: 'المستوى' }) : null,
          h('button', { type: 'button', class: 'mini-x', 'aria-label': 'حذف الطالب', onclick: function () { c.students.splice(i, 1); dirty = true; drawList(); } }, MK.icon('trash'))));
      });
    }
    var ta = h('textarea', { rows: 6, placeholder: 'الصق الأسماء هنا، كل اسم في سطر' });
    var fileIn = h('input', { type: 'file', accept: '.docx', class: 'hidden' });
    fileIn.addEventListener('change', function () {
      var f = fileIn.files[0]; if (!f) return;
      MK.checkFile(f, 'docx').then(function () { return MK.readDocx(f); }).then(function (t) { ta.value = t.replace(/\s*\*\s*$/gm, ''); MK.toast('قُرئ الملف، راجع الأسماء ثم اضغط «أضف الأسماء»'); }).catch(function (m) { MK.fileError(typeof m === 'string' ? m : 'تعذّرت قراءة الملف.'); });
      fileIn.value = '';
    });
    function addNames() {
      var names = ta.value.split('\n').map(function (s) {
        return s.replace(/^\s*[\(\[]?[0-9٠-٩]+[\)\]\-–.ـ:]?\s*/, '').replace(/\t.*$/, '').trim();
      }).filter(function (s) { return s && s.length < 60; });
      if (!names.length) { MK.toast('لا توجد أسماء'); return; }
      names.forEach(function (n) { c.students.push({ id: MK.uid(), name: n, level: '' }); });
      ta.value = ''; dirty = true; drawList(); MK.toast('أُضيف ' + ar(names.length) + ' اسم');
    }
    function save() {
      if (!c.name.trim()) { MK.toast('اكتب اسم الشعبة'); nameIn.focus(); return; }
      c.students = c.students.filter(function (s) { return s.name.trim(); });
      var i = MK.classes.classes.findIndex(function (x) { return x.id === c.id; });
      if (i >= 0) MK.classes.classes[i] = c; else MK.classes.classes.push(c);
      MK.saveClasses().then(function () { dirty = false; MK.toast('حُفظت الشعبة'); MK.goHome(); });
    }
    function back() {
      if (!dirty) return MK.goHome();
      MK.confirm('تغييرات غير محفوظة', 'في الشعبة تغييرات لم تُحفظ. هل تخرج دون حفظ؟', 'اخرج دون حفظ', MK.goHome, true);
    }
    m.appendChild(h('div', { class: 'section-head' },
      h('button', { type: 'button', class: 'icon-btn', onclick: back }, MK.icon('back'), 'رجوع'),
      h('h2', null, orig ? 'تعديل الشعبة' : 'شعبة جديدة')));
    m.appendChild(h('div', { class: 'editor' },
      h('div', null,
        h('div', { class: 'panel', style: { marginBottom: '18px' } }, h('div', { class: 'field', style: { marginBottom: 0 } }, h('label', null, 'اسم الشعبة'), nameIn)),
        h('div', { class: 'panel' },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' } },
            h('h3', { style: { margin: 0, flex: 1 } }, 'الطلاب'), countEl, lvBtn),
          h('div', { class: 'hint', style: { marginBottom: '10px' } }, 'المستويات (أ فائق، ب متوسط، ج يحتاج دعمًا) مخفية افتراضيًا، ولا تظهر للطلاب على شاشة العرض أبدًا.'),
          listEl)),
      h('div', { class: 'sticky-actions' },
        h('div', { class: 'panel' },
          h('button', { type: 'button', class: 'btn big', style: { width: '100%' }, onclick: save }, MK.icon('save'), 'حفظ الشعبة')),
        h('div', { class: 'panel' }, h('h3', null, 'أضف أسماء'),
          h('div', { class: 'field' }, ta),
          h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
            h('button', { type: 'button', class: 'btn small', onclick: addNames }, MK.icon('plus'), 'أضف الأسماء'),
            h('button', { type: 'button', class: 'btn small soft', onclick: function () { fileIn.click(); } }, MK.icon('upload'), 'من ملف Word'), fileIn,
            h('button', { type: 'button', class: 'btn small soft', onclick: function () {
              MK.pickExcel(function (rows) {
                var r = parseRoster(rows), list = r.students;
                if (!list.length) { MK.toast('لم يُعثر على أسماء في الملف'); return; }
                var secs = uniq(list.map(function (x) { return x.section; }).filter(Boolean));
                if (secs.length > 1 && c.name) { var mine = list.filter(function (x) { return sameSec(x.section, c.name); }); if (mine.length) list = mine; }
                if (!c.name && secs.length === 1) { c.name = secs[0]; nameIn.value = c.name; }
                var added = mergeInto(c, list);
                dirty = true; drawList();
                MK.toast('أُضيف ' + ar(added) + ' اسم' + (r.levelFrom ? '، وحُدّدت المستويات من ' + r.levelFrom : ''));
              });
            } }, MK.icon('upload'), 'من ملف Excel'))))));
    drawList();
    if (!orig) nameIn.focus();
  }

  // ---------- توزيع متوازن على فرق ----------
  function makeTeams(pool, size) {
    var n = pool.length, k = Math.max(2, Math.floor(n / size));
    if (n < 2) k = 1;
    var order = [];
    ['a', 'b', 'c', ''].forEach(function (lv) { order = order.concat(MK.shuffle(pool.filter(function (s) { return (s.level || '') === lv; }))); });
    var teams = []; for (var i = 0; i < k; i++) teams.push({ name: '', members: [] });
    var names = MK.shuffle(TEAM_NAMES);
    teams.forEach(function (t, i) { t.name = names[i % names.length]; });
    // توزيع «ثعباني» حتى تتوازن المستويات
    order.forEach(function (s, i) {
      var r = Math.floor(i / k), j = i % k;
      teams[r % 2 ? k - 1 - j : j].members.push(s);
    });
    return teams;
  }

  // ---------- شاشة ما قبل البدء ----------
  MK.startScreen = function (act, tpl, onStart, onCancel) {
    var scored = !tpl.noScore && tpl.id !== 'erase';
    var cls = !MK.classes.classes.length || MK.settings.lastClass === 'none' ? null : (findClass(MK.settings.lastClass) || MK.classes.classes[0]);
    var st = { who: (act.settings.levels && act.settings.levels.length) ? 'level' : 'all', levels: (act.settings.levels || []).slice(), mode: tpl.preferTeams ? 'teams' : 'solo', size: 4, nTeams: 2, teams: null };
    var scr = h('div', { class: 'start-screen' });
    var body = h('div', { class: 'start-body' });
    scr.appendChild(h('div', { class: 'start-card' },
      h('div', { class: 'start-title' }, h('span', { class: 'tname' }, tpl.name, act.kind ? ' · ' + MK.kindName(act.kind) : ''), h('h2', null, act.title), act.goal ? h('div', { class: 'start-goal' }, 'الهدف: ' + act.goal) : null),
      body,
      h('div', { class: 'start-acts' },
        h('button', { type: 'button', class: 'btn big', onclick: go }, MK.icon('play'), 'ابدأ'),
        h('button', { type: 'button', class: 'btn ghost big', onclick: function () { scr.remove(); onCancel(); } }, 'إلغاء'))));
    document.body.appendChild(scr);

    function pool() {
      if (!cls) return [];
      return cls.students.filter(function (s) { return st.who === 'all' || st.levels.indexOf(s.level || '') >= 0; });
    }
    function row(label, el, sub) { return h('div', { class: 'start-row' }, h('div', { class: 'start-label' }, label), h('div', { class: 'start-ctl' }, el, sub || null)); }
    function draw() {
      MK.clear(body);
      // الصف
      if (MK.classes.classes.length) {
        var opts = MK.classes.classes.map(function (c) { return { value: c.id, label: c.name }; }).concat([{ value: '', label: 'بدون شعبة' }]);
        body.appendChild(row('الشعبة', MK.choice(opts, cls ? cls.id : '', function (v) { cls = v ? findClass(v) : null; st.teams = null; draw(); }, { label: 'الصف' })));
        if (cls && cls.log && Object.keys(cls.log).length) body.appendChild(h('div', { class: 'start-honor' }, h('button', { type: 'button', class: 'btn small soft', onclick: function () { MK.honorBoard(cls); } }, '⭐ لوحة الشرف')));
      }
      if (cls) {
        var lvSub = st.who === 'level' ? MK.choice(LEVELS, st.levels, function (v) { st.levels = v; st.teams = null; draw(); }, { multi: true, label: 'المستوى' }) : null;
        body.appendChild(row('من يشارك', MK.choice([{ value: 'all', label: 'عام' }, { value: 'level', label: 'حسب المستوى' }], st.who, function (v) { st.who = v; st.teams = null; draw(); }, { label: 'من يشارك' }), lvSub));
        body.appendChild(h('div', { class: 'start-count' }, 'عدد المشاركين: ' + ar(pool().length)));
      }
      if (scored) {
        var modeOpts = [{ value: 'solo', label: 'فردي' }, { value: 'teams', label: 'جماعي' }];
        var sub = null;
        if (st.mode === 'teams' && cls) {
          sub = h('div', null, h('div', { class: 'start-sub' }, 'عدد الطلاب في كل فريق'),
            MK.choice([2, 3, 4, 5, 6].map(function (n) { return { value: n, label: String(n) }; }), st.size, function (v) { st.size = v; st.teams = null; draw(); }, { label: 'عدد الطلاب في كل فريق' }));
        } else if (st.mode === 'teams') {
          sub = h('div', null, h('div', { class: 'start-sub' }, 'عدد الفرق'),
            MK.choice([2, 3, 4].map(function (n) { return { value: n, label: String(n) }; }), st.nTeams, function (v) { st.nTeams = v; st.teams = null; draw(); }, { label: 'عدد الفرق' }));
        }
        body.appendChild(row('طريقة اللعب', MK.choice(modeOpts, st.mode, function (v) { st.mode = v; st.teams = null; draw(); }, { label: 'طريقة اللعب' }), sub));
        if (st.mode === 'teams') drawTeams();
      }
      if (st.mode === 'solo' && cls) {
        var pids = pool().map(function (s) { return s.id; }), done = (cls.picked || []).filter(function (id) { return pids.indexOf(id) >= 0; }).length;
        if (done > 0 && done < pids.length) {
          body.appendChild(row('عجلة الأسماء', MK.choice([{ value: false, label: 'كل الطلاب من جديد' }, { value: true, label: 'أكمل الدور السابق (بقي ' + (pids.length - done) + ')' }], !!st.keepRound, function (v) { st.keepRound = v; }, { label: 'عجلة الأسماء' })));
        }
        body.appendChild(h('div', { class: 'hint start-note' }, 'أثناء النشاط اضغط العجلة الصغيرة في زاوية الشاشة لتختار طالبًا يجيب.'));
      }
    }
    function drawTeams() {
      if (!st.teams) {
        if (cls) {
          var p = pool();
          if (p.length < 2) { body.appendChild(h('div', { class: 'err' }, 'المشاركون أقل من أن يُوزَّعوا على فرق.')); return; }
          st.teams = makeTeams(p, st.size);
        } else {
          var nm = MK.shuffle(TEAM_NAMES);
          st.teams = []; for (var i = 0; i < st.nTeams; i++) st.teams.push({ name: nm[i], members: [] });
        }
      }
      var grid = h('div', { class: 'team-prev' });
      st.teams.forEach(function (t, i) {
        var nameIn = h('input', { type: 'text', 'aria-label': 'اسم الفريق ' + (i + 1) }); nameIn.value = t.name;
        nameIn.addEventListener('input', function () { t.name = nameIn.value; });
        grid.appendChild(h('div', { class: 'team-card c' + (i % 4) },
          h('div', { class: 'team-name' }, h('span', null, 'فريق'), nameIn),
          t.members.length ? h('ul', null, t.members.map(function (s) { return h('li', null, s.name); })) : null));
      });
      body.appendChild(grid);
      if (cls) body.appendChild(h('button', { type: 'button', class: 'btn soft', onclick: function () { st.teams = null; draw(); MK.sound.flip(); } }, MK.icon('redo'), 'وزّع من جديد'));
    }
    function go() {
      MK.settings.lastClass = cls ? cls.id : 'none'; MK.saveSettings();
      if (cls && st.who === 'level' && !st.levels.length) { MK.toast('اختر مستوى واحدًا على الأقل'); return; }
      if (cls && !st.keepRound && cls.picked) { var pids2 = pool().map(function (s) { return s.id; }); cls.picked = cls.picked.filter(function (id) { return pids2.indexOf(id) < 0; }); MK.saveClasses(); }
      var opts = { cls: cls, pool: pool(), hideNames: !!(cls && st.who === 'level'), mode: scored ? st.mode : 'solo', teams: null };
      if (opts.mode === 'teams') {
        if (!st.teams) return;
        opts.teams = st.teams.map(function (t, i) { return { name: (t.name || '').trim() || TEAM_NAMES[i], members: t.members, score: 0 }; });
      }
      scr.remove();
      onStart(opts);
    }
    draw();
  };

  // ---------- عجلة الأسماء ----------
  function drawWheel(wrap, labels, rot) {
    var n = labels.length, R = 200, seg = 360 / n, s = '';
    var colors = ['var(--p1)', 'var(--p2)', 'var(--p3)', 'var(--primary-dark)', 'var(--accent)'];
    labels.forEach(function (lb, i) {
      var a0 = (i * seg - 90) * Math.PI / 180, a1 = ((i + 1) * seg - 90) * Math.PI / 180;
      var col = colors[i % colors.length]; if (n % colors.length === 1 && i === n - 1) col = colors[1];
      s += n === 1 ? '<circle cx="210" cy="210" r="200" style="fill:' + col + '"/>' :
        '<path d="M210 210 L' + (210 + R * Math.cos(a0)) + ' ' + (210 + R * Math.sin(a0)) + ' A200 200 0 ' + (seg > 180 ? 1 : 0) + ' 1 ' + (210 + R * Math.cos(a1)) + ' ' + (210 + R * Math.sin(a1)) + ' Z" style="fill:' + col + '" stroke="#fff" stroke-width="3"/>';
      var mid = i * seg + seg / 2, num = /^\d+$/.test(String(lb)), fs = num ? (n > 20 ? 18 : 28) : (n > 24 ? 11 : (n > 14 ? 13 : 16)), max = n > 14 ? 12 : 16;
      var label = String(lb); if (label.length > max) label = label.slice(0, max - 1) + '…';
      label = label.replace(/[&<>]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]; });
      var am = ((mid + (+rot || 0)) % 360 + 360) % 360;
      if (num) {
        var ang = (mid - 90) * Math.PI / 180, tx = 210 + 150 * Math.cos(ang), ty = 210 + 150 * Math.sin(ang);
        s += '<text x="' + tx.toFixed(1) + '" y="' + ty.toFixed(1) + '" transform="rotate(' + (-(+rot || 0)) + ' ' + tx.toFixed(1) + ' ' + ty.toFixed(1) + ')" text-anchor="middle" dominant-baseline="central" font-size="' + fs + '" font-weight="800" fill="#fff" font-family="Cairo">' + label + '</text>';
      } else s += am > 180
        ? '<text transform="rotate(' + (mid + 90) + ' 210 210) translate(' + (num ? 60 : 30) + ' ' + (210 + fs / 3) + ')" text-anchor="end" direction="rtl" font-size="' + fs + '" font-weight="800" fill="#fff" font-family="Cairo">' + label + '</text>'
        : '<text transform="rotate(' + (mid - 90) + ' 210 210) translate(' + (num ? 360 : 390) + ' ' + (210 + fs / 3) + ')" text-anchor="start" direction="rtl" font-size="' + fs + '" font-weight="800" fill="#fff" font-family="Cairo">' + label + '</text>';
    });
    s += '<circle cx="210" cy="210" r="34" style="fill:var(--surface);stroke:var(--gold)" stroke-width="6"/>';
    wrap.innerHTML = '<svg viewBox="0 0 420 420" class="wheel-svg" role="img" aria-label="عجلة الأسماء"><g class="wheel-g" style="transform-origin:210px 210px;transform:rotate(' + rot + 'deg)">' + s + '</g></svg><div class="wheel-pointer" aria-hidden="true"></div>';
    return wrap.querySelector('.wheel-g');
  }

  // يفتح عجلة الأسماء فوق شاشة العرض، ويعيد الطالب المختار
  MK.nameWheel = function (stage, opts, onPicked, xo) {
    xo = xo || {};
    var cls = opts.cls, ids = opts.pool.map(function (s) { return s.id; });
    if (!cls.picked) cls.picked = [];
    var overlay = h('div', { class: 'reveal-bg wheel-over' + (xo.auto ? ' grow' : '') });
    var picked = null;
    overlay.addEventListener('click', function (e) { if (spinning) return; if (picked || !card.contains(e.target)) { if (e.target.closest && e.target.closest('button')) return; close(); } });
    var card = h('div', { class: 'reveal-card wheel-box' });
    overlay.appendChild(card);
    stage.querySelector('.stage-body').appendChild(overlay);
    var rot = 0, spinning = false;
    function remaining() { return opts.pool.filter(function (s) { return cls.picked.indexOf(s.id) < 0; }); }
    function close() { if (!overlay.parentNode) return; overlay.classList.add('shrink'); setTimeout(function () { overlay.remove(); }, 260); if (picked) onPicked(picked); picked = null; if (xo.onClose) xo.onClose(); }
    function draw() {
      MK.clear(card);
      var rem = remaining();
      if (!rem.length) {
        card.appendChild(h('div', { class: 'reveal-q' }, MK.t('شارك جميع الطلاب')));
        card.appendChild(h('div', { class: 'reveal-acts' },
          h('button', { type: 'button', class: 'btn big', onclick: function () { cls.picked = cls.picked.filter(function (id) { return ids.indexOf(id) < 0; }); MK.saveClasses(); draw(); MK.sound.flip(); } }, MK.icon('redo'), 'ابدأ دورًا جديدًا'),
          h('button', { type: 'button', class: 'btn ghost big', onclick: close }, MK.t('إغلاق'))));
        return;
      }
      // أرقام بدل الأسماء عند اختيار مستوى
      var shown = MK.shuffle(rem);
      var labels = opts.hideNames ? shown.map(function (_, i) { return String(i + 1); }) : shown.map(function (s) { return s.name; });
      var wrap = h('div', { class: 'wheel-wrap small' });
      var res = h('div', { class: 'wheel-result', 'aria-live': 'polite' });
      card.appendChild(h('div', { class: 'wheel-stage' }, wrap, res));
      var g = drawWheel(wrap, labels, rot);
      var spinB = h('button', { type: 'button', class: 'btn big spin-go' }, MK.icon('redo'), MK.t('أدر العجلة'));
      var acts = h('div', { class: 'reveal-acts' }, spinB, h('button', { type: 'button', class: 'btn ghost big', onclick: close }, MK.t('إغلاق')));
      card.appendChild(h('div', { class: 'hint', style: { textAlign: 'center', color: 'var(--muted)' } }, MK.t('بقي في العجلة: ') + ar(rem.length)));
      card.appendChild(acts);
      sizeWheel(wrap);
      spinB.addEventListener('click', function () {
        if (spinning) return; spinning = true; spinB.disabled = true;
        var n = labels.length, seg = 360 / n, pick = Math.floor(Math.random() * n);
        var target = 360 - (pick * seg + seg * (0.2 + Math.random() * 0.6));
        var start = rot, end = start + 360 * 5 + ((target - start % 360) + 360) % 360, D = 4200;
        g.style.transition = 'transform ' + D + 'ms cubic-bezier(.12,.75,.12,1)';
        g.style.transform = 'rotate(' + end + 'deg)';
        var last = Math.floor(start / seg);
        for (var k = 1; k <= 140; k++) {
          var t = k / 140, e = 1 - Math.pow(1 - t, 3.2), cur = Math.floor((start + (end - start) * e) / seg);
          if (cur !== last) { last = cur; setTimeout(MK.sound.tick, t * D); }
        }
        setTimeout(function () {
          rot = end % 360; spinning = false;
          g = drawWheel(wrap, labels, rot);
          var stu = shown[pick];
          cls.picked.push(stu.id); MK.saveClasses();
          MK.sound.reveal();
          picked = stu;
          var wc = h('div', { class: 'wheel-card' }, stu.name);
          MK.clear(res).appendChild(wc); wrap.classList.add('dim');
          fitName(wc, wrap.clientWidth);
          MK.clear(acts).appendChild(h('button', { type: 'button', class: 'btn big', onclick: function () { close(); } }, MK.icon('check'), MK.t('ليجب ') + stu.name));
          acts.appendChild(h('button', { type: 'button', class: 'btn ghost big', onclick: function () { picked = null; draw(); if (xo.auto) setTimeout(function () { var b = card.querySelector('.spin-go'); if (b) b.click(); }, 120); } }, MK.icon('redo'), MK.t('أدر مرة أخرى')));
          if (xo.auto) acts.appendChild(h('div', { class: 'hint', style: { width: '100%', textAlign: 'center', color: 'var(--muted)' } }, MK.t('اضغط في أي مكان للعودة إلى السؤال')));
          onResize();
        }, D + 80);
      });
    }
    // حجم العجلة من المساحة الفعلية المتاحة
    function sizeWheel(wrap) {
      var chrome = 40, stg = wrap.parentNode;
      Array.prototype.forEach.call(card.children, function (ch) { if (ch !== stg) chrome += ch.offsetHeight + 10; });
      var avail = overlay.clientHeight - 16 - chrome;
      var s = Math.max(200, Math.min(avail, card.clientWidth - 48, 560));
      wrap.style.width = s + 'px';
    }
    // خط الاسم يتكيّف مع طوله: سطران على الأكثر داخل العجلة
    function fitName(el, s) {
      var fs = Math.round(s * 0.16), maxW = s * 0.94, maxH = s * 0.46;
      el.style.maxWidth = maxW + 'px';
      el.style.fontSize = fs + 'px';
      while (fs > 18 && (el.scrollWidth > maxW + 1 || el.offsetHeight > maxH)) { fs -= 2; el.style.fontSize = fs + 'px'; }
    }
    function onResize() { var w = card.querySelector('.wheel-wrap'); if (w) { w.style.width = ''; sizeWheel(w); var wc = card.querySelector('.wheel-card'); if (wc) fitName(wc, w.clientWidth); } }
    window.addEventListener('resize', onResize);
    var close0 = close; close = function () { window.removeEventListener('resize', onResize); close0(); };
    draw();
    if (xo.auto) setTimeout(function () { var b = card.querySelector('.spin-go'); if (b) b.click(); }, 350);
  };

  // العجلة المصغّرة الظاهرة في زاوية شاشة العرض
  // ===== سجل المشاركة ولوحة الشرف =====
  function today() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  MK.logPart = function (cls, sid, kind) {
    if (!cls || !sid) return;
    if (!cls.log) cls.log = {};
    var L = cls.log[sid] || (cls.log[sid] = { ok: 0, star: 0, try: 0, days: {} });
    L[kind] = (L[kind] || 0) + 1;
    var d = today(), D = L.days[d] || (L.days[d] = { ok: 0, star: 0, try: 0 });
    D[kind]++;
    var cut = new Date(Date.now() - 120 * 864e5).toISOString().slice(0, 10);
    Object.keys(L.days).forEach(function (k) { if (k < cut) delete L.days[k]; });
    MK.saveClasses();
  };
  function weekOf(L) {
    var cut = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10), w = { ok: 0, star: 0 };
    Object.keys((L && L.days) || {}).forEach(function (k) { if (k >= cut) { w.ok += L.days[k].ok; w.star += L.days[k].star; } });
    return w;
  }
  MK.honorBoard = function (cls) {
    var rows = cls.students.map(function (s) { var w = weekOf((cls.log || {})[s.id]); return { name: s.name, ok: w.ok, star: w.star, sc: w.ok + w.star * 2 }; })
      .filter(function (r) { return r.sc > 0; }).sort(function (a, b) { return b.sc - a.sc; }).slice(0, 5);
    var body = rows.length ? h('div', { class: 'honor' }, rows.map(function (r, i) {
      return h('div', { class: 'honor-row r' + i, style: { animationDelay: (i * 90) + 'ms' } }, h('span', { class: 'honor-n' }, String(i + 1)), h('strong', null, r.name),
        h('span', { class: 'honor-s' }, r.star ? '⭐ ' + r.star : '', r.ok ? '  ✓ ' + r.ok : ''));
    })) : h('p', { class: 'empty' }, 'لا مشاركات مسجلة في الأيام السبعة الأخيرة بعد.');
    MK.modal('لوحة الشرف: نجوم الأسبوع — ' + cls.name, body, [{ label: 'إغلاق' }]);
    if (rows.length) { MK.sound.win(); MK.confetti(40); }
  };
  MK.partLog = function (cls) {
    var rows = cls.students.map(function (s) { var L = (cls.log || {})[s.id] || {}, w = weekOf(L); return { name: s.name, ok: L.ok || 0, star: L.star || 0, tr: L.try || 0, w: w.ok + w.star }; })
      .sort(function (a, b) { return (b.star * 2 + b.ok) - (a.star * 2 + a.ok); });
    var t = h('table', { class: 'part-table' }, h('thead', null, h('tr', null, h('th', null, 'الطالب'), h('th', null, '✓ أحسنت'), h('th', null, '⭐ تعزيز'), h('th', null, '↺ حاول'), h('th', null, 'هذا الأسبوع'))),
      h('tbody', null, rows.map(function (r) { return h('tr', null, h('td', null, r.name), h('td', null, String(r.ok)), h('td', null, String(r.star)), h('td', null, String(r.tr)), h('td', null, String(r.w))); })));
    MK.modal('سجل المشاركة — ' + cls.name, h('div', { class: 'part-wrap' }, t), [
      { label: 'لوحة الشرف', onClick: function () { setTimeout(function () { MK.honorBoard(cls); }, 50); } },
      { label: 'صفّر السجل', cls: 'ghost', onClick: function () { MK.confirm('تصفير السجل', 'هل تريد مسح سجل مشاركة «' + cls.name + '»؟', 'امسح', function () { cls.log = {}; MK.saveClasses(); MK.toast('صُفّر السجل'); }); } },
      { label: 'إغلاق', cls: 'soft' }]);
  };

  MK.miniWheel = function (onOpen) {
    var cols = ['#7a1f3d', '#c9a24a', '#2f6b4f', '#1f5d7a', '#b5562b', '#5b3f8c'];
    var ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '-50 -50 100 100'); svg.setAttribute('class', 'mw-svg');
    for (var i = 0; i < 6; i++) {
      var a0 = (i * 60 - 90) * Math.PI / 180, a1 = ((i + 1) * 60 - 90) * Math.PI / 180, p = document.createElementNS(ns, 'path');
      p.setAttribute('d', 'M0 0 L' + 46 * Math.cos(a0) + ' ' + 46 * Math.sin(a0) + ' A46 46 0 0 1 ' + 46 * Math.cos(a1) + ' ' + 46 * Math.sin(a1) + 'Z');
      p.setAttribute('fill', cols[i]); svg.appendChild(p);
    }
    var c = document.createElementNS(ns, 'circle'); c.setAttribute('r', '9'); c.setAttribute('fill', '#fff'); svg.appendChild(c);
    var b = h('button', { type: 'button', class: 'mini-wheel', title: 'من يجيب؟', 'aria-label': 'من يجيب؟ أدر عجلة الأسماء' }, svg, h('span', { class: 'mw-pin' }), h('span', { class: 'mw-lbl' }, 'من يجيب؟'));
    b.addEventListener('click', onOpen);
    return b;
  };
})();
