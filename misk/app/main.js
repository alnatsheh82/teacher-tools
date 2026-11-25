/* مِسك الختام — الشاشات: القائمة الجانبية، أنشطتي، اختيار القالب، المحرّر، العرض، الإعدادات */
(function () {
  var MK = window.MK, h = MK.h, ar = MK.toArabicDigits;
  var VERSION = '2.7.0';
  var RIGHTS = '© 2026 مِسك الختام — فكرة وتصميم: أ. محمد سعيد النتشة، مدرسة قطر التقنية الثانوية للبنين. جميع الحقوق محفوظة.';
  var GRADES = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر', 'الحادي عشر', 'الثاني عشر'].map(function (g) { return 'الصف ' + g; });
  var TERMS = ['الأول', 'الثاني'];
  MK.GRADES = GRADES; MK.TERMS = TERMS;
  var app, mainEl, navEl, activities = [], view = 'home';
  var filt = { grade: '', term: '', q: '', kind: '' };

  // ---------- الإطار العام: قائمة جانبية ----------
  var NAV = [
    { id: 'home', icon: 'home', label: 'الرئيسية' },
    { id: 'acts', icon: 'folder', label: 'أنشطتي' },
    { id: 'new', icon: 'plus', label: 'نشاط جديد' },
    { id: 'samples', icon: 'copy', label: 'أمثلة جاهزة' },
    { id: 'profile', icon: 'user', label: 'ملفي' }
  ];
  function shell() {
    app = document.getElementById('app');
    navEl = h('nav', { class: 'side-nav', 'aria-label': 'القائمة' });
    var brand = h('div', { class: 'side-brand' });
    var aside = h('aside', { class: 'side' }, brand, navEl,
      h('div', { class: 'side-bottom' },
        h('button', { type: 'button', class: 'nav-item', onclick: openSettings }, MK.icon('gear'), 'الإعدادات'),
        h('button', { type: 'button', class: 'nav-item', onclick: openAbout }, MK.icon('info'), 'عن الأداة'),
        location.protocol === 'file:' ? h('a', { class: 'nav-item', href: 'أدوات المعلمين.html', target: '_blank' }, MK.icon('cards'), 'أدوات المعلمين') : null));
    mainEl = h('main'); MK.mainEl = mainEl;
    app.appendChild(h('div', { class: 'layout' }, aside, mainEl));
    app.appendChild(h('footer', { class: 'rights' }, RIGHTS));
    app._brand = brand;
    refreshBrand(); drawNav();
  }
  function drawNav() {
    MK.clear(navEl);
    NAV.forEach(function (n) {
      navEl.appendChild(h('button', { type: 'button', class: 'nav-item' + (view === n.id ? ' on' : ''), 'aria-current': view === n.id ? 'page' : null, onclick: function () { go(n.id); } }, MK.icon(n.icon), n.label));
    });
  }
  function refreshBrand() {
    var b = app._brand; MK.clear(b);
    b.appendChild(MK.logo(46, { decor: true })); b.appendChild(h('span', { class: 'brand-txt' }, h('span', { class: 'name' }, 'مِسك الختام'), h('span', { class: 'desc' }, MK.DESC)));
  }
  function setTheme(id) { MK.setTheme(id); refreshBrand(); }
  MK.applySettings = function () { setTheme(MK.settings.theme); };
  function go(v) {
    if (editorDirty) { confirmLeave(function () { go(v); }); return; }
    MK.afterSave = null;
    view = v; editorOpen = false; drawNav(); if (MK.hideSym) MK.hideSym();
    setTheme(MK.settings.theme);
    window.scrollTo(0, 0);
    if (v === 'new') goPicker();
    else if (v === 'samples') showSamples();
    else if (v === 'profile' || v === 'classes') { view = 'profile'; drawNav(); MK.clear(mainEl).appendChild(MK.profilePage()); }
    else if (v === 'home') showHome();
    else showActs();
  }
  function goHome() { go(view === 'profile' || view === 'classes' ? 'profile' : (view === 'acts' ? 'acts' : 'home')); }
  MK.refreshSide = function () { refreshBrand(); };

  // ---------- الصفحة الرئيسية ----------
  function showHome() {
    var m = MK.clear(mainEl);
    var P = MK.profile || {};
    m.appendChild(h('section', { class: 'home-hero' },
      MK.logo(120, { face: document.body.getAttribute('data-theme') === 'fun' }),
      h('div', { class: 'txt' }, h('h1', null, 'مِسك الختام'), h('p', null, MK.DESC),
        (P.school || P.teacher) ? h('div', { class: 'home-school' }, P.logo ? h('img', { src: P.logo, alt: '' }) : null, h('span', null, [P.teacher, P.school].filter(Boolean).join(' — '))) : null)));
    var inSlot = h('div'); m.appendChild(inSlot); if (MK.install) MK.install.place(inSlot);
    var note = folderLine(); if (note) m.appendChild(note);
    var upSlot = h('div'); m.appendChild(upSlot); MK.updater.auto(upSlot);
    var bkSlot = h('div'); m.appendChild(bkSlot);
    var quick = [['new', 'plus', 'نشاط جديد', 'سبعة وعشرون قالبًا'], ['ww', 'upload', 'من Wordwall', 'الصق نص نشاطك فيُنشأ هنا'], ['acts', 'folder', 'أنشطتي', 'كل أنشطتك مرتبة بالدروس'], ['profile', 'users', 'ملفي وشُعَبي', 'بياناتك والطلاب'], ['samples', 'copy', 'أمثلة جاهزة', 'جرّب قبل أن تصنع']];
    m.appendChild(h('div', { class: 'quick' }, quick.map(function (q) {
      return h('button', { type: 'button', class: 'quick-btn', onclick: function () { if (q[0] === 'ww') MK.openWordwall(function (act) { openEditor(act, true); editorDirty = true; }); else go(q[0]); } }, h('span', { class: 'ico' }, MK.icon(q[1])), h('strong', null, q[2]), h('span', null, q[3]));
    })));
    var stats = h('div', { class: 'stats' }), recent = h('div', { class: 'recent' });
    m.appendChild(h('div', { class: 'home-cols' },
      h('div', null, h('h3', { class: 'home-h' }, 'آخر الأنشطة'), recent),
      h('div', null, h('h3', { class: 'home-h' }, 'أرقام'), stats)));
    MK.store.list().then(function (l) { activities = l; draw(); }).catch(function () { activities = []; draw(); });
    function draw() {
      var bkb = MK.backupBanner && MK.backupBanner(); if (bkb) bkSlot.appendChild(bkb);
      var lessons = {}; activities.forEach(function (a) { lessons[(a.grade || '') + '|' + (a.term || '') + '|' + a.title] = 1; });
      [[activities.length, 'نشاطًا'], [Object.keys(lessons).length, 'درسًا'], [MK.classes.classes.length, 'شعبة']].forEach(function (x) {
        stats.appendChild(h('div', { class: 'stat' }, h('b', null, ar(x[0])), h('span', null, x[1])));
      });
      var list = activities.slice().sort(function (a, b) { return (b.updated || 0) - (a.updated || 0); }).slice(0, 4);
      if (!list.length) { recent.appendChild(h('div', { class: 'empty' }, 'لم تصنع أنشطة بعد. ابدأ من «نشاط جديد».')); return; }
      list.forEach(function (a) {
        var tpl = MK.templates[a.template];
        recent.appendChild(h('div', { class: 'recent-row' },
          MK.thumb(a),
          h('div', { class: 'r-txt' }, h('strong', null, a.title), h('span', null, (tpl ? tpl.name : '') + (a.grade ? ' · ' + a.grade : ''))),
          h('button', { type: 'button', class: 'btn small', onclick: function () { play(a); } }, MK.icon('play'), 'عرض')));
      });
    }
  }
  function pageHead(title, extra) { return h('div', { class: 'section-head page-head' }, h('h2', null, title), h('span', { class: 'spacer' }), extra || null); }

  // ---------- أنشطتي: الصف ← الفصل ← الدرس ----------
  function showActs() {
    var m = MK.clear(mainEl);
    var search = h('input', { type: 'search', class: 'search', placeholder: 'ابحث بالدرس أو الهدف…', 'aria-label': 'بحث في الأنشطة' });
    search.value = filt.q;
    var fileIn = h('input', { type: 'file', accept: '.json,application/json', multiple: true, class: 'hidden' });
    fileIn.addEventListener('change', function () {
      MK.importAny(fileIn.files, function () { MK.store.list().then(function (l) { activities = l; showActs(); }); });
      fileIn.value = '';
    });
    m.appendChild(pageHead('أنشطتي', h('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' } }, search,
      h('button', { type: 'button', class: 'btn soft', onclick: function () { fileIn.click(); } }, MK.icon('upload'), 'استيراد'), fileIn,
      h('button', { type: 'button', class: 'btn soft', onclick: function () { MK.openWorksheet(); } }, MK.icon('upload'), 'ورقة من المعد'),
      h('button', { type: 'button', class: 'btn soft', onclick: function () { openEditor(newActivity('rounds'), true); } }, MK.icon('cards'), 'جولات جديدة'),
      h('button', { type: 'button', class: 'btn', onclick: function () { go('new'); } }, MK.icon('plus'), 'نشاط جديد'))));
    var note = folderLine(); if (note) m.appendChild(note);
    var filters = h('div', { class: 'filters' });
    var listEl = h('div', { class: 'lessons' });
    m.appendChild(filters); m.appendChild(listEl);
    function draw() {
      MK.clear(filters); MK.clear(listEl);
      var grades = GRADES.filter(function (g) { return activities.some(function (a) { return a.grade === g; }); });
      if (activities.some(function (a) { return !a.grade; })) grades.push('');
      if (filt.grade && grades.indexOf(filt.grade) < 0) filt.grade = '';
      if (grades.length > 1) filters.appendChild(MK.choice([{ value: '', label: 'كل الصفوف' }].concat(grades.filter(Boolean).map(function (g) { return { value: g, label: g }; })), filt.grade, function (v) { filt.grade = v; draw(); }, { label: 'الصف' }));
      var inGrade = activities.filter(function (a) { return !filt.grade || a.grade === filt.grade; });
      var terms = TERMS.filter(function (t) { return inGrade.some(function (a) { return a.term === t; }); });
      if (filt.term && terms.indexOf(filt.term) < 0) filt.term = '';
      if (terms.length > 1) filters.appendChild(MK.choice([{ value: '', label: 'كل الفصول' }].concat(terms.map(function (t) { return { value: t, label: 'الفصل ' + t }; })), filt.term, function (v) { filt.term = v; draw(); }, { label: 'الفصل' }));
      var q = filt.q.trim();
      filters.appendChild(MK.choice([{ value: '', label: 'كل الأنواع' }].concat(MK.KINDS.map(function (k) { return { value: k.v, label: k.l }; })), filt.kind || '', function (v) { filt.kind = v; draw(); }, { label: 'نوع النشاط', cls: 'kind-filter' }));
      var nq = MK.normAr(q);
      var list = inGrade.filter(function (a) {
        if (filt.term && a.term !== filt.term) return false;
        if (filt.kind && a.kind !== filt.kind) return false;
        if (!nq) return true;
        var tpl0 = MK.templates[a.template];
        return MK.normAr([a.title, a.goal, tpl0 && tpl0.name].join(' ')).indexOf(nq) >= 0;
      });
      if (!list.length) {
        listEl.appendChild(h('div', { class: 'empty' }, q ? 'لا توجد أنشطة بهذا الاسم.' : 'لا توجد أنشطة بعد. اضغط «نشاط جديد» لتصنع أول نشاط، أو جرّب «أمثلة جاهزة».'));
        return;
      }
      // تجميع حسب الصف ثم الفصل ثم الدرس
      var groups = {};
      list.forEach(function (a) {
        var k = (a.grade || '') + '|' + (a.term || '') + '|' + (a.title || '');
        (groups[k] = groups[k] || { grade: a.grade, term: a.term, lesson: a.title, acts: [], upd: 0 }).acts.push(a);
        groups[k].upd = Math.max(groups[k].upd, a.updated || 0);
      });
      var gs = Object.keys(groups).map(function (k) { return groups[k]; }).sort(function (a, b) {
        var ga = GRADES.indexOf(a.grade), gb = GRADES.indexOf(b.grade);
        if (ga !== gb) return gb - ga;
        if (a.term !== b.term) return TERMS.indexOf(a.term) - TERMS.indexOf(b.term);
        return b.upd - a.upd;
      });
      var lastHead = '';
      gs.forEach(function (g) {
        var head = (g.grade || 'بلا صف') + (g.term ? ' · الفصل ' + g.term : '');
        if (head !== lastHead) {
          var gG = g.grade, gT = g.term;
          listEl.appendChild(h('h3', { class: 'grade-head' }, head,
            h('span', { class: 'exp-grp' },
              MK.exportBtn(function () { return activities.filter(function (a) { return a.grade === gG && a.term === gT; }); }, (gG || 'أنشطة') + ' — الفصل ' + (gT || ''), 'تصدير هذا الفصل'),
              h('small', null, 'الفصل'),
              MK.exportBtn(function () { return activities.filter(function (a) { return a.grade === gG; }); }, gG || 'أنشطة', 'تصدير الصف كاملًا'),
              h('small', null, 'الصف كاملًا'))));
          lastHead = head;
        }
        var grid = h('div', { class: 'grid' });
        g.acts.sort(function (a, b) { return (b.updated || 0) - (a.updated || 0); }).forEach(function (a) { grid.appendChild(actCard(a, false)); });
        var gActs = g.acts;
        var sec = h('section', { class: 'lesson' }, h('div', { class: 'lesson-head' }, MK.icon('folder'), h('strong', null, g.lesson || 'بلا اسم'), h('span', { class: 'meta' }, ar(g.acts.length) + ' نشاط'),
          MK.exportBtn(function () { return gActs; }, (g.grade || '') + ' — ' + (g.lesson || 'درس'), 'تصدير الدرس')));
        var order = MK.KINDS.map(function (k) { return k.v; }).concat(['']);
        order.forEach(function (kv) {
          var ks = g.acts.filter(function (a) { return (a.kind || '') === kv; });
          if (!ks.length) return;
          var kg = h('div', { class: 'grid' });
          ks.sort(function (a, b) { return (b.updated || 0) - (a.updated || 0); }).forEach(function (a) { kg.appendChild(actCard(a, false)); });
          var K = MK.KINDS.filter(function (k) { return k.v === kv; })[0];
          sec.appendChild(h('div', { class: 'kind-block' }, h('div', { class: 'kind-head k-' + (kv || 'none') }, h('span', { class: 'kdot' }), K ? K.l : 'بلا نوع', h('span', { class: 'meta' }, ar(ks.length))), kg));
        });
        listEl.appendChild(sec);
      });
    }
    search.addEventListener('input', function () { filt.q = search.value; draw(); });
    MK.store.list().then(function (l) { activities = l; draw(); }).catch(function () { activities = []; draw(); });
  }
  MK.KINDS = [{ v: 'tah', l: 'تهيئة' }, { v: 'bin', l: 'غلق بنائي' }, { v: 'kht', l: 'غلق ختامي' }];
  MK.kindName = function (v) { var k = MK.KINDS.filter(function (x) { return x.v === v; })[0]; return k ? k.l : ''; };
  MK.normAr = function (s) { return String(s || '').replace(/[\u064B-\u065F\u0670\u0640]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').toLowerCase().trim(); };
  MK.goalsFor = function (grade, term, title) {
    var seen = {};
    return activities.filter(function (a) { return a.grade === grade && a.term === term && a.title === title && a.goal; })
      .map(function (a) { return a.goal; }).filter(function (t) { if (seen[t]) return false; seen[t] = 1; return true; });
  };
  MK.lessonsFor = function (grade, term) {
    var seen = {};
    return activities.filter(function (a) { return a.grade === grade && a.term === term && a.title; })
      .map(function (a) { return a.title; }).filter(function (t) { if (seen[t]) return false; seen[t] = 1; return true; });
  };

  function showSamples() {
    var m = MK.clear(mainEl);
    m.appendChild(pageHead('أمثلة جاهزة'));
    m.appendChild(h('p', { class: 'hint', style: { color: 'var(--muted)', marginTop: 0 } }, 'جرّب أي مثال بزر «عرض»، أو أنشئ نشاطًا مثله لتعدّله.'));
    var sg = h('div', { class: 'grid' });
    MK.samples.forEach(function (a) { sg.appendChild(actCard(a, true)); });
    m.appendChild(sg);
  }

  function folderLine() {
    var S = MK.store;
    if (S.mode === 'folder') return null;
    if (S.mode === 'needs-permission') return h('div', { class: 'notice' }, MK.icon('folder'),
      h('span', null, 'اسمح للأداة بفتح مجلد «', h('strong', null, S.folderName), '» لعرض أنشطتك.'), h('span', { class: 'spacer' }),
      h('button', { type: 'button', class: 'btn small', onclick: function () { S.reconnect().then(MK.loadClasses).then(showActs).catch(function () { MK.toast('لم يُمنح الإذن'); }); } }, 'اسمح بالوصول'));
    if (!S.supported) return h('div', { class: 'notice' }, MK.icon('info'), 'متصفحك لا يدعم الحفظ في مجلد، فتُحفظ الأنشطة داخل المتصفح.');
    return h('div', { class: 'notice' }, MK.icon('folder'), h('span', null, location.protocol === 'file:' ? 'اختر مكان حفظ ملفاتك: مجلد «مسك الختام» في «المستندات». إلى ذلك الحين تُحفظ الأنشطة داخل المتصفح.' : 'اختر مجلدًا لحفظ أنشطتك على جهازك، مثل «مسك الختام» في «المستندات» (أنشئه من نافذة الاختيار إن لم يكن موجودًا). إلى ذلك الحين تُحفظ الأنشطة داخل المتصفح.'), h('span', { class: 'spacer' }),
      h('button', { type: 'button', class: 'btn small', onclick: pickFolder }, 'اختر المجلد'));
  }
  function pickFolder() {
    MK.store.chooseFolder().then(function (n) {
      MK.toast(n ? 'رُبط المجلد ونُقل إليه ' + ar(n) + ' نشاط' : 'رُبط المجلد، وستُحفظ أنشطتك فيه');
      MK.loadClasses().then(goHome, goHome);
    }).catch(function (e) {
      if (e && e.name === 'PickedProgram') MK.toast('اختر مجلد «مسك الختام»، لا مجلد «البرنامج»');
      else if (e && e.name !== 'AbortError') MK.toast('تعذّر ربط المجلد');
    });
  }

  function actCard(a, isSample) {
    var tpl = MK.templates[a.template];
    var row = h('div', { class: 'row' },
      h('button', { type: 'button', class: 'btn small', onclick: function () { play(a); } }, MK.icon('play'), 'عرض'));
    if (isSample) {
      row.appendChild(h('button', { type: 'button', class: 'btn small ghost', onclick: function () { createLike(a); } }, MK.icon('copy'), 'أنشئ مثله'));
    } else {
      row.appendChild(h('span', { class: 'spacer' }));
      row.appendChild(h('button', { type: 'button', class: 'mini-x', title: 'تعديل', 'aria-label': 'تعديل', onclick: function () { openEditor(MK.clone(a), false); } }, MK.icon('edit')));
      row.appendChild(h('button', { type: 'button', class: 'mini-x', title: 'تصدير ملف', 'aria-label': 'تصدير ملف', onclick: function () { MK.store.exportFile(a); } }, MK.icon('download')));
      row.appendChild(h('button', {
        type: 'button', class: 'mini-x', title: 'نسخة مكررة', 'aria-label': 'نسخة مكررة', onclick: function () {
          var c = MK.clone(a); c.id = MK.uid(); c.created = 0;
          MK.store.save(c).then(function () { MK.toast('صُنعت نسخة'); showActs(); });
        }
      }, MK.icon('copy')));
      row.appendChild(h('button', {
        type: 'button', class: 'mini-x', title: 'حذف', 'aria-label': 'حذف', onclick: function () {
          var inR = (MK.allActs ? MK.allActs() : []).filter(function (r) { return r.template === 'rounds' && r.content && Array.isArray(r.content.ids) && r.content.ids.indexOf(a.id) >= 0; });
          var warn = inR.length ? ' تنبيه: هذا النشاط جزء من ' + (inR.length === 1 ? 'جولة' : ar(inR.length) + ' جولات') + ': ' + inR.map(function (r) { return '«' + r.title + '»'; }).join('، ') + '. إن حذفته فلن يظهر فيها.' : '';
          MK.confirm('حذف النشاط', 'هل تريد حذف نشاط «' + (tpl ? tpl.name : '') + '» من درس «' + a.title + '»؟ لا يمكن التراجع.' + warn, 'احذف', function () {
            MK.store.remove(a).then(function () { MK.toast('حُذف النشاط'); showActs(); });
          }, true);
        }
      }, MK.icon('trash')));
    }
    if (!isSample) return h('div', { class: 'card act-card compact with-th' }, MK.thumb(a),
      h('h3', null, h('span', { class: 'ico-s' }, MK.icon(tpl ? tpl.icon : 'info')), tpl ? tpl.name : a.template, a.kind ? h('span', { class: 'kbadge k-' + a.kind }, MK.kindName(a.kind)) : null),
      a.goal ? h('div', { class: 'goal-line' }, MK.icon('star'), h('span', null, a.goal), MK.exportBtn(function () { return activities.filter(function (x) { return x.goal === a.goal && x.title === a.title && x.grade === a.grade; }); }, (a.title || '') + ' — ' + a.goal, 'تصدير أنشطة هذا الهدف')) : null,
      h('div', { class: 'meta' }, a.updated ? 'آخر تعديل: ' + MK.fmtDate(a.updated) : ''),
      row);
    return h('div', { class: 'card act-card with-th' }, MK.thumb(a),
      h('span', { class: 'tpl' }, MK.icon(tpl ? tpl.icon : 'info'), tpl ? tpl.name : a.template),
      h('h3', null, a.title || ''),
      h('div', { class: 'meta' }, isSample ? 'مثال جاهز' : (a.updated ? 'آخر تعديل: ' + MK.fmtDate(a.updated) : '')),
      row);
  }

  function createLike(a) {
    function make(withContent) {
      var c = MK.clone(a); c.id = MK.uid(); delete c.sample; c.created = 0; c.title = ''; delete c.grade; delete c.term;
      if (!withContent) { c.content = MK.templates[a.template].blank(); var keep = MK.clone(a.content);
        Object.keys(keep).forEach(function (k) { if (typeof keep[k] !== 'object') c.content[k] = keep[k]; }); }
      view = 'new'; drawNav();
      openEditor(c, true);
    }
    MK.modal('أنشئ نشاطًا مثله', h('p', null, 'يُنشأ نشاط جديد بقالب «' + MK.templates[a.template].name + '» وألوانه وإعداداته. هل تبدأ بمحتوى المثال لتعدّل عليه، أم فارغًا؟'), [
      { label: 'ابدأ بمحتوى المثال', onClick: function () { setTimeout(function () { make(true); }, 0); } },
      { label: 'ابدأ فارغًا', cls: 'ghost', onClick: function () { setTimeout(function () { make(false); }, 0); } },
      { label: 'إلغاء', cls: 'soft' }
    ]);
  }

  // ---------- اختيار القالب ----------
  function goPicker() {
    var m = MK.clear(mainEl);
    m.appendChild(pageHead('نشاط جديد: اختر القالب'));
    m.appendChild(h('div', { class: 'ww-banner' }, h('span', { class: 'ico' }, MK.icon('upload')),
      h('div', null, h('strong', null, 'عندك نشاط على Wordwall؟'), h('span', null, 'انسخ نصه والصقه هنا، فيُنشأ في القالب المماثل.')),
      h('button', { type: 'button', class: 'btn', onclick: function () { MK.openWordwall(function (act) { openEditor(act, true); editorDirty = true; }); } }, 'استيراد من Wordwall')));
    var CATS = [
      ['أنشطة حصص المراجعة', ['board', 'show'], 'مسابقات طويلة بين الفرق لمراجعة الوحدة أو الفصل.'],
      ['أسئلة واختبارات', ['quiz', 'tf', 'find']],
      ['مطابقة وترتيب وتصنيف', ['match', 'memory', 'unjumble', 'order', 'group', 'diagram']],
      ['نصوص وكلمات', ['erase', 'cloze', 'crossword', 'wordsearch']],
      ['عرض ونقاش واختيار', ['wheel', 'boxes', 'flash', 'tiles', 'randcards', 'talk']],
      ['ألعاب حركية', ['whack', 'balloon', 'maze', 'plane', 'fruit', 'speedsort']]
    ];
    function card(t, c) {
      var cd = h('button', { type: 'button', class: 'card tpl-card' + (t ? '' : ' soon'), disabled: !t },
        (function () { var smp = t && MK.samples.filter(function (x) { return x.template === t.id; })[0]; return smp ? MK.thumb(smp) : h('span', { class: 'ico' }, MK.icon(t ? t.icon : c.icon)); })(),
        h('h3', null, t ? t.name : c.name),
        (t ? t.desc : c.desc) ? h('p', null, t ? t.desc : c.desc) : null,
        t ? null : h('span', { class: 'badge' }, 'قريبًا'));
      if (t) cd.addEventListener('click', function () { openEditor(newActivity(t.id), true); });
      return cd;
    }
    CATS.forEach(function (cat) {
      m.appendChild(h('h3', { class: 'cat-h' }, cat[0]));
      if (cat[2]) m.appendChild(h('p', { class: 'cat-sub' }, cat[2]));
      m.appendChild(h('div', { class: 'grid' }, cat[1].filter(function (id) { return MK.templates[id]; }).map(function (id) { return card(MK.templates[id]); })));
    });
    var soon = MK.catalog.filter(function (c) { return c.phase === 3; });
    if (soon.length) {
      m.appendChild(h('h3', { class: 'cat-h' }, 'قريبًا: الألعاب الحركية'));
      m.appendChild(h('div', { class: 'grid' }, soon.map(function (c) { return card(null, c); })));
    }
  }
  function newActivity(tid) {
    return { app: 'misk', v: 1, id: MK.uid(), template: tid, theme: MK.settings.theme, title: '', settings: { timer: MK.templates[tid].timerOk ? +MK.settings.fb.timer : 0, levels: [] }, content: MK.templates[tid].blank() };
  }

  // ---------- المحرّر ----------
  var editorDirty = false, editorOpen = false;
  function confirmLeave(then) {
    MK.confirm('تغييرات غير محفوظة', 'في النشاط تغييرات لم تُحفظ. هل تريد الخروج دون حفظ؟', 'اخرج دون حفظ', function () { editorDirty = false; then(); }, true);
    return false;
  }
  function openEditor(act, isNew) {
    MK._editAct = act;
    editorOpen = true;
    var tpl = MK.templates[act.template];
    setTheme(act.theme);
    editorDirty = !!isNew && false;
    window.scrollTo(0, 0);
    var m = h('div');
    MK.clear(mainEl).appendChild(m);
    var markDirty = function () { editorDirty = true; };
    m.addEventListener('input', markDirty);
    m.addEventListener('change', markDirty);

    if (!act.grade) act.grade = MK.settings.lastGrade || 'الصف العاشر';
    if (!act.term) act.term = MK.settings.lastTerm || 'الأول';
    var dl = h('datalist', { id: 'lessons-dl' });
    function fillLessons() { MK.clear(dl); MK.lessonsFor(act.grade, act.term).forEach(function (t) { dl.appendChild(h('option', { value: t })); }); }
    fillLessons();
    var titleIn = h('input', { type: 'text', list: 'lessons-dl', placeholder: 'اكتب اسم الدرس أو اختره', style: { fontSize: '20px', fontWeight: 700 } });
    titleIn.value = act.title || '';
    titleIn.addEventListener('input', function () { act.title = titleIn.value; });
    var gradeSel = h('select', { 'aria-label': 'الصف' }, GRADES.map(function (g) { return h('option', { value: g, selected: g === act.grade }, g); }));
    gradeSel.addEventListener('change', function () { act.grade = gradeSel.value; fillLessons(); });
    var termCh = MK.choice(TERMS.map(function (t) { return { value: t, label: 'الفصل ' + t }; }), act.term, function (v) { act.term = v; editorDirty = true; fillLessons(); }, { label: 'الفصل' });
    var gdl = h('datalist', { id: 'goals-dl' });
    function fillGoals() { MK.clear(gdl); MK.goalsFor(act.grade, act.term, act.title).forEach(function (t) { gdl.appendChild(h('option', { value: t })); }); }
    fillGoals();
    titleIn.addEventListener('change', fillGoals);
    var goalIn = h('input', { type: 'text', list: 'goals-dl', placeholder: 'مثال: أن يحدد الطالب راوي الحديث' });
    goalIn.value = act.goal || '';
    goalIn.addEventListener('input', function () { act.goal = goalIn.value; });
    var kindCh = MK.choice(MK.KINDS.map(function (k) { return { value: k.v, label: k.l }; }), act.kind || '', function (v) { act.kind = v; editorDirty = true; }, { label: 'نوع النشاط', cls: 'kind-choice' });
    var placePanel = h('div', { class: 'panel place-panel', style: { marginBottom: '18px' } },
      h('div', { class: 'place-row' },
        h('div', { class: 'field' }, h('label', null, 'الصف'), gradeSel),
        h('div', { class: 'field' }, h('label', null, 'الفصل الدراسي'), termCh)),
      h('div', { class: 'field' }, h('label', null, 'الدرس'), titleIn, dl),
      h('div', { class: 'place-row goal-row' },
        h('div', { class: 'field', style: { marginBottom: 0 } }, h('label', null, 'الهدف التعليمي (اختياري)'), goalIn, gdl),
        h('div', { class: 'field', style: { marginBottom: 0 } }, h('label', null, 'نوع النشاط'), kindCh)));
    var editArea = h('div', { dir: act.lang === 'en' ? 'ltr' : 'rtl' });
    function rerender() { MK.clear(editArea); editArea.appendChild(tpl.edit(act.content, function () { editorDirty = true; rerender(); })); }
    rerender();
    var errEl = h('div', { class: 'err', role: 'alert' });

    function validate(forSave) {
      if (!act.title.trim()) { errEl.textContent = 'اكتب اسم الدرس.'; titleIn.focus(); return false; }
      var e = tpl.validate(act.content);
      errEl.textContent = e || '';
      if (e) return false;
      document.querySelectorAll('.editor .item-box.need-ans').forEach(function (x) { x.classList.remove('need-ans'); });
      if (forSave) {
        var miss = MK.missingAnswers(act);
        if (miss.length) {
          errEl.textContent = 'بقي ' + ar(miss.length) + ' سؤال بلا إجابة (' + miss.map(ar).join('، ') + '). حدّد الإجابة الصحيحة أو اكتبها قبل الحفظ.';
          var boxes = document.querySelectorAll('.editor .item-box');
          miss.forEach(function (n) { if (boxes[n - 1]) boxes[n - 1].classList.add('need-ans'); });
          if (boxes[miss[0] - 1]) boxes[miss[0] - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
          MK.toast('بقي ' + ar(miss.length) + ' سؤال بلا إجابة');
          return false;
        }
        delete act.needsAnswers;
      }
      return true;
    }
    var goalWarned = false;
    function save(then) {
      if (!validate(true)) return;
      act.title = act.title.trim(); act.goal = (act.goal || '').trim();
      if (!act.goal && !goalWarned) { goalWarned = true; MK.toast('تلميح: أضف الهدف التعليمي ليسهل البحث عن النشاط لاحقًا'); }
      MK.settings.lastGrade = act.grade; MK.settings.lastTerm = act.term; MK.saveSettings();
      MK.store.save(act).then(function () {
        editorDirty = false; MK.toast('حُفظ النشاط في: ' + act.grade + ' ← الفصل ' + act.term + ' ← ' + act.title);
        var i = activities.findIndex(function (x) { return x.id === act.id; }); if (i >= 0) activities[i] = MK.clone(act); else activities.push(MK.clone(act));
        if (MK.afterSave) { var nx = MK.afterSave; MK.afterSave = null; setTimeout(nx, 400); }
        else if (then) then();
      }).catch(function () { MK.toast('تعذّر الحفظ. جرّب «تصدير» للاحتفاظ بنسخة.'); });
    }

    // التحويل إلى قالب آخر
    var convBox = null;
    var targets = Object.keys(MK.templates).filter(function (k) { return MK.canConvert(act.template, k); });
    if (targets.length) {
      convBox = MK.choice(targets.map(function (k) { return { value: k, label: MK.templates[k].name }; }), null, function (to) {
        var c = MK.doConvert(act, to);
        convBox.set(null);
        if (!c) { MK.toast('المحتوى لا يكفي لهذا القالب'); return; }
        MK.confirm('تحويل القالب', 'سيُحوَّل النشاط إلى «' + MK.templates[to].name + '» بالمحتوى نفسه. راجعه بعد التحويل ثم احفظه.', 'حوّل', function () {
          act.template = to; act.content = c; editorDirty = true; openEditor(act, false); editorDirty = true;
        });
      }, { label: 'حوّل إلى قالب آخر' });
    }

    var opts = h('div');
    (tpl.options ? tpl.options(act.content) : []).forEach(function (o) { opts.appendChild(o); });
    if (tpl.timerOk) {
      opts.appendChild(h('div', { class: 'field' }, h('label', null, 'المؤقت لكل سؤال (بالثواني)'),
        MK.choice([0, 10, 15, 20, 30, 45, 60, 90].map(function (s) { return { value: s, label: s ? String(s) : 'بلا' }; }), +act.settings.timer || 0, function (v) { act.settings.timer = v; editorDirty = true; }, { label: 'المؤقت' })));
    }
    if (!tpl.noScore && ['erase', 'board', 'rounds'].indexOf(tpl.id) < 0) {
      opts.appendChild(h('div', { class: 'field' }, h('label', null, 'درجة كل سؤال'),
        MK.choice([1, 2, 5, 10, 20, 50, 100].map(function (s) { return { value: s, label: String(s) }; }), +(act.settings.points || MK.settings.fb.points), function (v) { act.settings.points = v; editorDirty = true; }, { label: 'الدرجة' })));
    }
    (function () {
      var fbBox = h('div');
      function drawFb() {
        MK.clear(fbBox);
        if (act.settings.fbCustom) {
          if (!act.settings.fb) act.settings.fb = JSON.parse(JSON.stringify({ praise: MK.settings.fb.praise, tiers: MK.settings.fb.tiers }));
          fbBox.appendChild(MK.fbEditor(act.settings.fb, function () { editorDirty = true; }));
        }
      }
      opts.appendChild(h('div', { class: 'field' }, h('label', null, 'عبارات التهنئة'),
        MK.choice([{ value: false, label: 'الافتراضية' }, { value: true, label: 'مخصّصة لهذا النشاط' }], !!act.settings.fbCustom, function (v) { act.settings.fbCustom = v; editorDirty = true; drawFb(); }, { label: 'عبارات التهنئة' }),
        fbBox));
      drawFb();
    })();
    opts.appendChild(h('div', { class: 'field' }, h('label', null, 'لغة النشاط'),
      MK.choice([{ value: 'ar', label: 'عربية' }, { value: 'en', label: 'English' }], act.lang === 'en' ? 'en' : 'ar', function (v) { act.lang = v; editorDirty = true; editArea.setAttribute('dir', v === 'en' ? 'ltr' : 'rtl'); }, { label: 'لغة النشاط' }),
      h('div', { class: 'hint' }, 'مع English يُعرض المحتوى من اليسار، وتظهر أزرار شاشة اللعبة بالإنجليزية.')));
    if (!act.settings.levels) act.settings.levels = [];
    opts.appendChild(h('div', { class: 'field' }, h('label', null, 'مخصص لمستوى (اختياري)'),
      MK.choice([{ value: 'a', label: 'أ' }, { value: 'b', label: 'ب' }, { value: 'c', label: 'ج' }], act.settings.levels, function (v) { act.settings.levels = v; editorDirty = true; }, { multi: true, label: 'المستوى' }),
      h('div', { class: 'hint' }, 'إن اخترت مستوى، يبدأ النشاط بطلابه فقط. اتركه فارغًا للجميع.')));

    m.appendChild(h('div', { class: 'section-head' },
      h('button', { type: 'button', class: 'icon-btn', onclick: function () { if (editorDirty) confirmLeave(goHome); else goHome(); } }, MK.icon('back'), 'رجوع'),
      h('h2', null, (act.created ? 'تعديل: ' : 'نشاط جديد: ') + tpl.name)));
    m.appendChild(h('div', { class: 'editor' },
      h('div', null,
        MK.editorBanner ? (function () { var b = h('div', { class: 'ws-banner' }, MK.icon('info'), MK.editorBanner); MK.editorBanner = null; return b; })() : null,
        placePanel,
        h('div', { class: 'panel' },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' } },
            h('h3', { style: { margin: 0, flex: 1 } }, 'المحتوى'),
            MK.canImport && MK.canImport(act.template) ? h('button', { type: 'button', class: 'btn soft small', onclick: function () { MK.openImport(act, function () { editorDirty = true; rerender(); }); } }, MK.icon('upload'), 'استيراد من ورقة عمل') : null),
          editArea)),
      h('div', { class: 'sticky-actions' },
        h('div', { class: 'panel' },
          h('button', { type: 'button', class: 'btn big', style: { width: '100%', marginBottom: '10px' }, onclick: function () { if (validate()) play(act, true); } }, MK.icon('play'), 'عرض وتجربة'),
          h('button', { type: 'button', class: 'btn ghost', style: { width: '100%', marginBottom: '10px' }, onclick: function () { save(function () { openEditor(act, false); }); } }, MK.icon('save'), 'حفظ'),
          h('button', { type: 'button', class: 'btn soft', style: { width: '100%' }, onclick: function () { if (validate(true)) MK.store.exportFile(act); } }, MK.icon('download'), 'تصدير ملف'),
          errEl),
        h('div', { class: 'panel' }, h('h3', null, 'الإعدادات'), opts),
        h('div', { class: 'panel' }, h('h3', null, 'ألوان العرض'), MK.themePicker(act.theme, function (id) { act.theme = id; editorDirty = true; setTheme(id); })),
        convBox ? h('div', { class: 'panel' }, h('h3', null, 'حوّل إلى قالب آخر'), convBox, h('div', { class: 'hint', style: { marginTop: '8px' } }, 'يصير النشاط لعبة أخرى بالمحتوى نفسه.')) : null)));
    if (!act.title) titleIn.focus();
  }

  // ---------- العرض ----------
  function play(act, fromEditor) {
    var tpl = MK.templates[act.template];
    if (!tpl) return;
    if (act.template === 'rounds') {
      var list = act.content.ids.map(function (id) { return activities.filter(function (a) { return a.id === id; })[0]; }).filter(Boolean);
      if (!list.length) { MK.toast('لا توجد أنشطة في هذه الجولات'); return; }
      act._list = list;
    }
    if (!act.settings) act.settings = {};
    var prevTheme = document.body.getAttribute('data-theme');
    MK.setTheme(act.theme);
    document.body.classList.add('playing');
    if (MK.hideSym) MK.hideSym();
    MK.startScreen(act, tpl, function (o) { MK.lang = act.lang === 'en' ? 'en' : 'ar'; run(act, tpl, fromEditor, prevTheme, o); },
      function () { document.body.classList.remove('playing'); MK.setTheme(prevTheme); refreshBrand(); });
  }

  function run(act, tpl, fromEditor, prevTheme, o) {
    var teams = o.mode === 'teams';
    // الجولات: عدة أنشطة في عرض واحد
    var R = act.template === 'rounds' ? { list: act._list || [], idx: 0, res: [] } : null;
    var curAct = R ? R.list[0] : act, curTpl = R ? MK.templates[curAct.template] : tpl;
    function isScored(t) { return !t.noScore && t.id !== 'erase'; }
    var scored = R ? R.list.some(function (a) { return isScored(MK.templates[a.template]); }) : isScored(tpl);
    if (R) MK.lang = curAct.lang === 'en' ? 'en' : 'ar';
    var players = teams ? o.teams : [{ name: MK.t('النقاط'), score: 0 }];
    var turn = 0, cleanup = null, current = null, stuScore = {}, stuAtt = {};
    var FB = MK.fb(act), mult = FB.points / 10;

    var scoresEl = h('div', { class: 'scores' + (teams && players.length > 3 ? ' many' : '') });
    var shownScore = {};
    function drawScores(bumpIdx) {
      MK.clear(scoresEl);
      if (!scored && !rewardsUsed && !teams) return;
      players.forEach(function (p, i) {
        var num = h('b', null, ar(Math.round(shownScore[i] == null ? p.score : shownScore[i])));
        var pill = h(teams ? 'button' : 'div', { type: teams ? 'button' : null, class: 'score-pill' + (teams && i === turn ? ' turn' : '') + (bumpIdx === i ? ' bump' : ''), 'data-i': i, title: teams ? 'اضغط لإعطاء الدور لهذا الفريق' : null }, teams ? p.name : p.name, num);
        if (teams) pill.addEventListener('click', function () { if (turn === i) return; turn = i; drawScores(); MK.sound.click(); MK.toast(MK.t('الدور الآن: ') + teamTitle(p.name)); });
        scoresEl.appendChild(pill);
        // النقاط تعدّ صعودًا
        var from = shownScore[i] == null ? p.score : shownScore[i], to = p.score;
        if (from !== to) {
          var t0 = performance.now();
          (function step(t) {
            var k = Math.min(1, (t - t0) / 500), v = from + (to - from) * (1 - Math.pow(1 - k, 3));
            num.textContent = ar(Math.round(v)); shownScore[i] = v;
            if (k < 1 && num.isConnected) requestAnimationFrame(step); else shownScore[i] = to;
          })(t0);
        } else shownScore[i] = to;
      });
    }
    var lastPt = null, streak = 0;
    if (!MK._wrongOrig) MK._wrongOrig = MK.sound.wrong;
    MK.sound.wrong = function () { streak = 0; MK._wrongOrig(); };
    function flyPts(n, idx) {
      var pill = scoresEl.querySelector('[data-i="' + idx + '"]'); if (!pill || !lastPt) return;
      var sr = stage.getBoundingClientRect(), pr = pill.getBoundingClientRect();
      var f = h('div', { class: 'fly-pts' }, '+' + ar(Math.round(n)));
      f.style.left = (lastPt.x - sr.left) + 'px'; f.style.top = (lastPt.y - sr.top) + 'px';
      stage.appendChild(f);
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        f.style.transform = 'translate(' + (pr.left + pr.width / 2 - lastPt.x) + 'px,' + (pr.top + pr.height / 2 - lastPt.y) + 'px) scale(.6)'; f.style.opacity = '0.3';
      }); });
      setTimeout(function () { f.remove(); }, 750);
    }
    function onStreak() {
      if (streak < 3) return;
      var bonus = Math.round(FB.points * 0.5);
      players[teams ? turn : 0].score += bonus;
      var big = streak === 5 || streak === 10;
      var el = h('div', { class: 'streak' + (big ? ' big' : '') }, '🔥 ' + (MK.lang === 'en' ? streak + ' in a row! +' + bonus : ar(streak) + ' متتالية! +' + ar(bonus)));
      var old = stage.querySelector('.streak'); if (old) old.remove();
      stage.appendChild(el); setTimeout(function () { el.remove(); }, 1800);
      setTimeout(MK.sound.streak, 250); if (big) MK.confetti(40);
    }
    var muteBtn = h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'الصوت', onclick: function () { MK.settings.muted = !MK.settings.muted; MK.saveSettings(); drawMute(); } });
    function drawMute() { MK.clear(muteBtn); muteBtn.appendChild(MK.icon(MK.settings.muted ? 'mute' : 'sound')); muteBtn.title = MK.settings.muted ? 'تشغيل الصوت' : 'كتم الصوت'; }
    drawMute();
    var fullBtn = h('button', { type: 'button', class: 'icon-btn', title: 'ملء الشاشة', 'aria-label': 'ملء الشاشة', onclick: function () {
      if (document.fullscreenElement) document.exitFullscreen(); else if (stage.requestFullscreen) stage.requestFullscreen();
    } }, MK.icon('full'));
    var exitBtn = h('button', { type: 'button', class: 'icon-btn', onclick: exit }, MK.icon('close'), 'خروج');
    // ألوان العرض أثناء اللعب
    var pop = null;
    var colorBtn = h('button', { type: 'button', class: 'icon-btn', 'aria-expanded': 'false', onclick: function () {
      if (pop) { pop.remove(); pop = null; colorBtn.setAttribute('aria-expanded', 'false'); return; }
      pop = h('div', { class: 'color-pop' }, MK.themePicker(document.body.getAttribute('data-theme'), function (id) {
        MK.setTheme(id); setMascot();
        if (!act.sample && !fromEditor) { act.theme = id; MK.store.save(act).catch(function () { }); }
        else if (fromEditor) act.theme = id;
      }));
      stage.appendChild(pop); colorBtn.setAttribute('aria-expanded', 'true');
      var br = colorBtn.getBoundingClientRect(), sr = stage.getBoundingClientRect();
      pop.style.left = Math.max(8, br.left - sr.left) + 'px'; pop.style.top = (br.bottom - sr.top + 8) + 'px';
      var off = function (e) { if (!pop || pop.contains(e.target) || colorBtn.contains(e.target)) return; pop.remove(); pop = null; colorBtn.setAttribute('aria-expanded', 'false'); document.removeEventListener('pointerdown', off, true); };
      document.addEventListener('pointerdown', off, true);
    } }, MK.icon('palette'), 'ألوان العرض');
    // الطالب الذي يجيب
    var whoEl = h('span', { class: 'who-pill hidden', 'aria-live': 'polite' });
    var whoBtn = null, rewardsUsed = false;
    function rName() { return teams ? teamTitle(players[turn].name) : (current ? current.name : ''); }
    function reward(kind) {
      var nm = rName(), en = MK.lang === 'en';
      if (kind === 'try') {
        MK.showPraise(stage, act, en ? 'Almost, ' + nm + '! Try again' : 'اقتربت يا ' + nm + '، حاول مرة أخرى', 'soft'); MK.sound.flip();
      } else {
        var pts = kind === 'star' ? 20 : 10;
        players[teams ? turn : 0].score += pts * mult; rewardsUsed = true; drawScores(teams ? turn : 0);
        if (!teams && current) stuScore[current.id] = { name: current.name, score: ((stuScore[current.id] || {}).score || 0) + pts * mult };
        if (kind === 'star') {
          MK.showPraise(stage, act, en ? 'Excellent, ' + nm + '! ⭐' : 'ما شاء الله يا ' + nm + '! ⭐', 'star'); MK.sound.win(); MK.confetti(30); flyStar();
        } else { MK.showPraise(stage, act, en ? 'Well done, ' + nm + '!' : 'أحسنت يا ' + nm + '!'); MK.sound.correct(); }
        ctx.mascot('cheer');
      }
      if (!teams && current) { stuAtt[current.id] = (stuAtt[current.id] || 0) + 1; MK.logPart(o.cls, current.id, kind); }
    }
    function flyStar() {
      var s = h('div', { class: 'fly-star' }, '⭐'); stage.appendChild(s);
      var t = whoEl.getBoundingClientRect(), sr = stage.getBoundingClientRect();
      s.style.left = (sr.width / 2) + 'px'; s.style.top = (sr.height / 2) + 'px';
      requestAnimationFrame(function () { s.style.transform = 'translate(' + (t.left + t.width / 2 - sr.left - sr.width / 2) + 'px,' + (t.top - sr.top - sr.height / 2) + 'px) scale(.5)'; s.style.opacity = '.2'; });
      setTimeout(function () { s.remove(); whoEl.classList.remove('bump'); void whoEl.offsetWidth; whoEl.classList.add('bump'); }, 800);
    }
    var rewardBox = h('span', { class: 'reward' + (teams ? '' : ' hidden') },
      h('button', { type: 'button', class: 'rw ok', title: 'أحسنت', 'aria-label': 'أحسنت', onclick: function () { reward('ok'); } }, '✓'),
      h('button', { type: 'button', class: 'rw star', title: 'تعزيز', 'aria-label': 'تعزيز', onclick: function () { reward('star'); } }, '⭐'),
      h('button', { type: 'button', class: 'rw try', title: 'حاول مرة أخرى', 'aria-label': 'حاول مرة أخرى', onclick: function () { reward('try'); } }, '↺'));
    var miniWheel = (!teams && o.cls && o.pool.length) ? MK.miniWheel(function () {
      MK.paused = true; miniWheel.classList.add('away');
      MK.nameWheel(stage, o, function (stu) { current = stu; whoEl.textContent = MK.t('يجيب: ') + stu.name; whoEl.classList.remove('hidden'); rewardBox.classList.remove('hidden'); },
        { auto: true, onClose: function () { MK.paused = false; miniWheel.classList.remove('away'); } });
    }) : null;
    var prog = h('i', { style: { width: '0%' } });
    var body = h('div', { class: 'stage-body' + (MK.lang === 'en' ? ' lang-en' : ''), dir: MK.lang === 'en' ? 'ltr' : 'rtl' });
    var foot = h('div', { class: 'stage-foot', dir: MK.lang === 'en' ? 'ltr' : 'rtl' });
    function schoolBlock(big) {
      var P = MK.profile || {};
      if (!P.school && !P.logo && !(P.showTeacher && P.teacher)) return h('div', { class: 'bar-school' });
      return h('div', { class: 'bar-school' + (big ? ' big' : '') }, P.logo ? h('img', { src: P.logo, alt: 'شعار المدرسة' }) : null,
        h('div', null, P.school ? h('strong', null, P.school) : null, P.showTeacher && P.teacher ? h('span', null, P.teacher) : null));
    }
    var mascot = null;
    var tnameEl = h('span', { class: 'tname' });
    function drawTname() { tnameEl.textContent = R ? MK.t('الجولة ') + ar(R.idx + 1) + MK.t(' من ') + ar(R.list.length) + ' · ' + MK.t(curTpl.name) : MK.t(tpl.name); }
    drawTname();
    var copyBtn = act.sample ? h('button', { type: 'button', class: 'icon-btn copy-btn', onclick: function () { exit(); MK.copySample(act); } }, MK.icon('copy'), 'انسخه وعدّل') : null;
    var stage = h('div', { id: 'stage', role: 'application', 'aria-label': 'عرض النشاط' },
      h('div', { class: 'stage-bar' },
        schoolBlock(),
        h('div', { class: 'bar-mid' }, tnameEl, h('span', { class: 'title' }, act.title)),
        h('div', { class: 'bar-end' }, whoEl, rewardBox, scoresEl, whoBtn, copyBtn, colorBtn, muteBtn, fullBtn, exitBtn)),
      h('div', { style: { padding: '0 22px', display: 'flex', justifyContent: 'center', background: 'var(--surface)' } }, h('div', { class: 'progress', style: { margin: '0 0 10px' } }, prog)),
      body, foot, miniWheel);
    MK.paused = false;
    function setMascot() {
      var fun = document.body.getAttribute('data-theme') === 'fun';
      if (mascot) { mascot.remove(); mascot = null; }
      mascot = MK.logo(fun ? 110 : 92, { face: true, decor: fun }); mascot.classList.add('mascot'); stage.appendChild(mascot);
    }
    setMascot();
    document.body.appendChild(stage);
    stage.addEventListener('pointerdown', function (e) { lastPt = { x: e.clientX, y: e.clientY }; }, true);
    stage.addEventListener('click', function (e) { if (pop && !pop.contains(e.target) && !colorBtn.contains(e.target)) { pop.remove(); pop = null; colorBtn.setAttribute('aria-expanded', 'false'); } });
    drawScores();

    function teamTitle(name) { return /^فريق|^Team/i.test(name) ? name : MK.t('فريق ') + name; }
    var ctx = {
      act: curAct, body: body, foot: foot,
      setProgress: function (f) { prog.style.width = Math.round(f * 100) + '%'; },
      addPoints: function (n) {
        n = Math.round(n * mult * 10) / 10;
        if (n > 0) { MK.showPraise(stage, act); streak++; }
        players[teams ? turn : 0].score += n;
        if (n > 0) { flyPts(n, teams ? turn : 0); onStreak(); }
        drawScores(teams ? turn : 0);
        if (!teams && current) stuScore[current.id] = { name: current.name, score: ((stuScore[current.id] || {}).score || 0) + n };
      },
      addRaw: function (n, txt) {
        players[teams ? turn : 0].score += n; drawScores(teams ? turn : 0);
        if (!teams && current) stuScore[current.id] = { name: current.name, score: ((stuScore[current.id] || {}).score || 0) + n };
        MK.showPraise(stage, act, txt || null);
      },
      teamCount: function () { return teams ? players.length : 1; },
      teamName: function () { return teams ? teamTitle(players[turn].name) : (current ? current.name : ''); },
      nextTurn: function () { if (!teams && current) stuAtt[current.id] = (stuAtt[current.id] || 0) + 1; if (teams) { turn = (turn + 1) % players.length; drawScores(); } },
      mascot: function (kind) {
        if (!mascot) return;
        mascot.classList.remove('cheer', 'sad'); void mascot.offsetWidth; mascot.classList.add(kind);
      },
      end: function (r) {
        if (cleanup) cleanup(); cleanup = null;
        MK.clear(body); MK.clear(foot);
        if (R) {
          R.res.push({ name: curTpl.name, title: curAct.title, scored: isScored(curTpl), r: r || { correct: 0, total: 0 } });
          if (R.idx < R.list.length - 1) {
            R.idx++; curAct = R.list[R.idx]; curTpl = MK.templates[curAct.template]; ctx.act = curAct;
            MK.lang = curAct.lang === 'en' ? 'en' : 'ar';
            body.dir = foot.dir = MK.lang === 'en' ? 'ltr' : 'rtl'; body.classList.toggle('lang-en', MK.lang === 'en');
            drawTname(); prog.style.width = '0%';
            var nx = h('div', { class: 'round-next' },
              h('div', { class: 'rn-k' }, MK.t('الجولة ') + ar(R.idx + 1) + MK.t(' من ') + ar(R.list.length)),
              h('h2', null, MK.t(curTpl.name)),
              curAct.goal ? h('div', { class: 'rn-g' }, curAct.goal) : null,
              h('button', { type: 'button', class: 'btn big', onclick: function () { MK.clear(body); cleanup = curTpl.play(ctx); } }, MK.icon('play'), MK.t('ابدأ الجولة')));
            body.appendChild(nx); MK.sound.reveal();
            return;
          }
          var sc = R.res.filter(function (x) { return x.scored; });
          r = { correct: sc.reduce(function (s, x) { return s + (x.r.correct || 0); }, 0), total: sc.reduce(function (s, x) { return s + (x.r.total || 0); }, 0) };
        }
        var box = h('div', { class: 'end' });
        stage.classList.add('end-on'); var pr = stage.querySelector('.praise'); if (pr) pr.remove();
        var sb = schoolBlock(true); if (sb.childNodes.length) box.appendChild(sb);
        var full = Math.max(1, r.full || (r.total || 1) * FB.points), tier;
        function head(t, name) { tier = t; box.appendChild(h('h2', { class: 'end-h tier' + t }, MK.endPhrase(t, name, act))); }
        if (teams) {
          var best = Math.max.apply(null, players.map(function (p) { return p.score; }));
          var winners = players.filter(function (p) { return p.score === best; });
          var share = full / players.length;
          var wt = MK.tierOf(Math.min(1, best / share), act);
          head(wt, winners.length === players.length ? '' : winners.map(function (w) { return teamTitle(w.name); }).join(MK.t(' و')));
          if (winners.length === players.length && players.length > 1) box.appendChild(h('div', { class: 'big-score' }, MK.t('تعادل!')));
          box.appendChild(h('div', { class: 'teams-result' }, players.map(function (p) { return h('div', { class: 'team-box' + (p.score === best && winners.length < players.length ? ' win' : '') }, teamTitle(p.name), h('b', null, ar(p.score))); })));
        } else {
          var stus = Object.keys(stuScore).map(function (k) { return Object.assign({ id: k }, stuScore[k]); }).sort(function (a, b) { return b.score - a.score; });
          var overall = !scored ? 1 : (r.total ? r.correct / r.total : 0);
          if (stus.length) {
            var top = stus.filter(function (s) { return s.score === stus[0].score; });
            var att = Math.max(1, stuAtt[top[0].id] || 1);
            head(MK.tierOf(Math.min(1, top[0].score / (att * FB.points)), act), top.map(function (s) { return s.name; }).join(MK.t(' و')));
            box.appendChild(h('div', { class: 'teams-result' }, stus.slice(0, 8).map(function (s, i) { return h('div', { class: 'team-box' + (i < top.length ? ' win' : '') }, s.name, h('b', null, ar(s.score))); })));
          } else {
            head(MK.tierOf(overall, act), current ? current.name : '');
          }
          box.appendChild(h('div', { class: 'big-score' }, MK.t('الإجابات الصحيحة: ') + ar(r.correct) + MK.t(' من ') + ar(r.total)));
          if (!stus.length && scored) box.appendChild(h('div', { class: 'big-score', style: { color: 'var(--primary)' } }, MK.t('النقاط: ') + ar(players[0].score)));
        }
        if (R) box.appendChild(h('div', { class: 'rounds-sum' }, R.res.map(function (x, i) {
          return h('div', { class: 'rs-row' }, h('b', null, MK.t('الجولة ') + ar(i + 1)), h('span', null, MK.t(x.name)), h('em', null, x.scored ? ar(x.r.correct) + ' / ' + ar(x.r.total) : '✓'));
        })));
        if (mascot) { mascot.classList.remove('sad'); ctx.mascot('cheer'); }
        box.appendChild(h('div', { style: { display: 'flex', gap: '12px', marginTop: '10px', flexWrap: 'wrap', justifyContent: 'center' } },
          act.sample ? h('button', { type: 'button', class: 'btn soft big', onclick: function () { exit(); MK.copySample(act); } }, MK.icon('copy'), 'انسخه وعدّل') : null,
          h('button', { type: 'button', class: 'btn big', onclick: function () { if (cleanup) cleanup(); stage.remove(); document.removeEventListener('keydown', onEsc); document.querySelectorAll('.confetti').forEach(function (c) { c.remove(); }); if (o.teams) o.teams.forEach(function (t) { t.score = 0; }); if (o.cls && o.cls.picked) { var ids0 = o.pool.map(function (x) { return x.id; }); o.cls.picked = o.cls.picked.filter(function (id) { return ids0.indexOf(id) < 0; }); MK.saveClasses(); } run(act, tpl, fromEditor, prevTheme, o); } }, MK.icon('redo'), MK.t('أعد اللعب')),
          h('button', { type: 'button', class: 'btn ghost big', onclick: exit }, MK.t('خروج'))));
        body.appendChild(box);
        if (tier === 0) { MK.sound.win(); MK.confetti(90); setTimeout(MK.sound.clap, 600); }
        else if (tier === 1) { MK.sound.correct(); MK.confetti(28); }
        else if (tier === 2) MK.sound.reveal();
        else MK.sound.flip();
        if (mascot && tier >= 2) { mascot.classList.remove('cheer'); }
        if (mascot && tier <= 1) { mascot.classList.add('dance'); }
      }
    };
    function exit() {
      if (cleanup) cleanup();
      if (document.fullscreenElement) document.exitFullscreen();
      stage.remove();
      document.querySelectorAll('.confetti').forEach(function (c) { c.remove(); });
      document.body.classList.remove('playing');
      document.removeEventListener('keydown', onEsc);
      MK.setTheme(prevTheme); refreshBrand(); MK.lang = 'ar'; MK.paused = false;
      if (MK._wrongOrig) MK.sound.wrong = MK._wrongOrig;
    }
    function onEsc(e) { if (e.key === 'Escape' && !document.fullscreenElement && !document.querySelector('.modal-bg')) exit(); }
    document.addEventListener('keydown', onEsc);
    cleanup = curTpl.play(ctx);
  }

  // ---------- الإعدادات ----------
  function openSettings() {
    var S = MK.store;
    var vol = h('input', { type: 'range', min: 0, max: 1, step: 0.05, value: MK.settings.volume, 'aria-label': 'مستوى الصوت' });
    vol.addEventListener('input', function () { MK.settings.volume = +vol.value; MK.saveSettings(); });
    vol.addEventListener('change', function () { MK.sound.correct(); });
    var mute = h('input', { type: 'checkbox', checked: MK.settings.muted });
    mute.addEventListener('change', function () { MK.settings.muted = mute.checked; MK.saveSettings(); });
    var folderBox = h('div');
    if (!S.supported) folderBox.appendChild(h('p', { class: 'hint' }, 'هذا المتصفح لا يدعم الحفظ في مجلد. استخدم كروم أو إيدج.'));
    else {
      folderBox.appendChild(h('p', null, S.mode === 'local' ? 'الأنشطة محفوظة داخل المتصفح.' : 'المجلد الحالي: ', S.folderName ? h('strong', null, S.folderName) : null));
      folderBox.appendChild(h('p', { class: 'hint' }, 'اختر مجلد «مسك الختام» في «المستندات». تُحفظ أنشطتك في «مسك الختام ← البيانات» على جهازك فقط.'));
      folderBox.appendChild(h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
        h('button', { type: 'button', class: 'btn small', onclick: function () { close(); pickFolder(); } }, MK.icon('folder'), S.mode === 'local' ? 'اختر مجلد «مسك الختام»' : 'غيّر المجلد'),
        S.mode !== 'local' ? h('button', { type: 'button', class: 'btn small ghost', onclick: function () { S.forgetFolder().then(MK.loadClasses).then(function () { close(); MK.toast('فُصل المجلد، والأنشطة فيه لم تُحذف'); goHome(); }); } }, 'افصل المجلد') : null));
    }
    var body = h('div', null,
      h('div', { class: 'field' }, h('label', null, 'ألوان العرض الافتراضية'),
        MK.themePicker(MK.settings.theme, function (id) { MK.settings.theme = id; MK.saveSettings(); setTheme(id); })),
      h('div', { class: 'field' }, h('label', null, 'مستوى الصوت'), vol),
      h('label', { class: 'toggle' }, mute, 'كتم الأصوات'),
      h('details', { class: 'fb-details' }, h('summary', null, MK.icon('star'), 'الوقت والدرجات وعبارات التهنئة'), MK.fbSettingsSection()),
      h('div', { class: 'field' }, h('label', null, 'مكان حفظ الأنشطة'), folderBox),
      h('div', { class: 'field' }, h('label', null, 'النسخ الاحتياطي'), MK.backupSection()),
      h('div', { class: 'field' }, h('label', null, 'التحديثات'), MK.updater.section()),
      h('div', { class: 'field' }, h('label', null, 'فحص الأداة'),
        h('button', { type: 'button', class: 'btn small soft', style: { alignSelf: 'flex-start' }, onclick: function () { close(); setTimeout(MK.selfTest, 200); } }, MK.icon('check'), 'افحص كل القوالب الآن'),
        h('p', { class: 'hint' }, 'يشغّل كل القوالب والحفظ في ثوانٍ، ويفيد عند تجربة الأداة على جهاز جديد.')),
      h('div', { class: 'field' }, h('label', null, 'شُعَبي وأسماء الطلاب'),
        h('button', { type: 'button', class: 'btn small soft', style: { alignSelf: 'flex-start' }, onclick: function () { close(); go('classes'); } }, MK.icon('users'), 'إدارة الشُّعَب')));
    var close = MK.modal('الإعدادات', body, [{ label: 'تم', onClick: function () { if (!editorOpen) go(view); } }]);
  }
  function openAbout() {
    MK.modal('عن مِسك الختام', h('div', { style: { textAlign: 'center' } },
      MK.logo(120, { face: document.body.getAttribute('data-theme') === 'fun' }),
      h('p', { style: { fontSize: '20px', fontWeight: 700, margin: '10px 0 4px' } }, MK.DESC),
      h('p', null, 'أداة مجانية تعمل بلا إنترنت لصنع أنشطة التهيئة والغلق البنائي والختامي وعرضها في الصف.'),
      h('p', { class: 'hint', style: { color: 'var(--muted)' } }, 'الإصدار ' + VERSION),
      h('p', { class: 'hint quran-src' }, 'النص القرآني وخطه من مجمع الملك فهد لطباعة المصحف الشريف (الإصدار 22)، برواية حفص عن عاصم وبالرسم العثماني، ويُستخدم مجانًا دون تعديل.'),
      h('div', { class: 'about-contact', style: { margin: '14px auto 0', padding: '10px 16px', borderRadius: '14px', background: 'var(--soft, rgba(0,0,0,.04))', display: 'inline-block' } },
        h('div', { style: { fontWeight: 700, marginBottom: '4px' } }, 'تواصل معنا'),
        h('a', { href: 'mailto:m.alnatsheh0701@education.qa', dir: 'ltr', style: { fontWeight: 700, fontSize: '17px', color: 'var(--primary, #8A1538)', direction: 'ltr', unicodeBidi: 'isolate' } }, 'm.alnatsheh0701@education.qa')),
      h('div', { style: { fontWeight: 700, marginTop: '16px', lineHeight: 1.8 } },
        h('div', null, '© 2026 مِسك الختام — فكرة وتصميم: أ. محمد سعيد النتشة'),
        h('div', null, 'مدرسة قطر التقنية الثانوية للبنين'),
        h('div', null, 'جميع الحقوق محفوظة.'))));
  }

  MK.play = play;
  MK.VERSION = VERSION;
  MK.openEditorPublic = function (a, isNew) { openEditor(a, isNew); editorDirty = true; };
  MK.allActs = function () { return activities; };
  MK.addAct = function (a) { var i = activities.findIndex(function (x) { return x.id === a.id; }); if (i >= 0) activities[i] = MK.clone(a); else activities.push(MK.clone(a)); };
  MK.goActs = function () { editorDirty = false; go('acts'); };
  MK.goHome = function () { goHome(); };
  // ---------- البدء ----------
  document.addEventListener('DOMContentLoaded', function () {
    MK.setTheme(MK.settings.theme);
    shell();
    MK.store.init().then(MK.loadClasses).then(MK.loadProfile).then(function () { go('home'); }, function () { go('home'); });
    window.addEventListener('beforeunload', function (e) { if (editorDirty) { e.preventDefault(); e.returnValue = ''; } });
  });
})();
