/* مِسك الختام 2.2 — الجولات، استيراد أوراق المعد، حزم التصدير، انسخه وعدّل */
(function () {
  var MK = window.MK, h = MK.h, ar = MK.toArabicDigits;

  // ================= الجولات =================
  MK.templates.rounds = {
    id: 'rounds', name: 'الجولات', icon: 'cards', teamsOk: true, timerOk: false, hidden: true,
    desc: 'عدة أنشطة تُعرض متتابعة في عرض واحد، بدرجات متراكمة وشاشة نهاية واحدة.',
    blank: function () { return { ids: [] }; },
    edit: function (c, rerender) {
      var box = h('div');
      var all = MK.allActs ? MK.allActs() : [];
      var byId = function (id) { return all.filter(function (a) { return a.id === id; })[0]; };
      box.appendChild(h('div', { class: 'hint', style: { marginBottom: '10px' } }, 'رتّب الأنشطة بالأسهم. تُعرض بهذا الترتيب جولةً بعد جولة.'));
      var list = h('div', { class: 'rd-list' });
      c.ids.forEach(function (id, i) {
        var a = byId(id), t = a && MK.templates[a.template];
        list.appendChild(h('div', { class: 'rd-item' + (a ? '' : ' missing') },
          h('span', { class: 'num' }, ar(i + 1)),
          h('div', { class: 'rd-info' }, h('strong', null, a ? (t ? t.name : a.template) : 'نشاط محذوف'), a ? h('span', null, (a.title || '') + (a.goal ? ' — ' + a.goal : '')) : null),
          h('button', { type: 'button', class: 'mini-x', 'aria-label': 'للأعلى', disabled: i === 0 || null, onclick: function () { var x = c.ids[i - 1]; c.ids[i - 1] = c.ids[i]; c.ids[i] = x; rerender(); } }, '▲'),
          h('button', { type: 'button', class: 'mini-x', 'aria-label': 'للأسفل', disabled: i === c.ids.length - 1 || null, onclick: function () { var x = c.ids[i + 1]; c.ids[i + 1] = c.ids[i]; c.ids[i] = x; rerender(); } }, '▼'),
          h('button', { type: 'button', class: 'mini-x', 'aria-label': 'إزالة', onclick: function () { c.ids.splice(i, 1); rerender(); } }, MK.icon('trash'))));
      });
      box.appendChild(list);
      box.appendChild(h('button', { type: 'button', class: 'btn ghost', onclick: function () { pickActs(c, rerender); } }, MK.icon('plus'), 'أضف أنشطة'));
      return box;
    },
    options: function () { return []; },
    validate: function (c) {
      var all = MK.allActs ? MK.allActs() : [];
      var ok = c.ids.filter(function (id) { return all.some(function (a) { return a.id === id; }); });
      return ok.length < 2 ? 'اختر نشاطين على الأقل.' : null;
    }
  };
  function pickActs(c, rerender) {
    var all = (MK.allActs ? MK.allActs() : []).filter(function (a) { return a.template !== 'rounds' && c.ids.indexOf(a.id) < 0; });
    var q = h('input', { type: 'search', class: 'search', placeholder: 'ابحث بالدرس أو الهدف…', style: { width: '100%' } });
    var list = h('div', { class: 'rd-pick' }), sel = {};
    function draw() {
      MK.clear(list);
      var nq = MK.normAr(q.value);
      var shown = all.filter(function (a) { var t = MK.templates[a.template]; return !nq || MK.normAr([a.title, a.goal, t && t.name, a.grade].join(' ')).indexOf(nq) >= 0; });
      if (!shown.length) list.appendChild(h('p', { class: 'empty' }, all.length ? 'لا نتائج.' : 'لا توجد أنشطة محفوظة بعد.'));
      shown.forEach(function (a) {
        var cb = h('input', { type: 'checkbox', checked: !!sel[a.id] || null });
        cb.addEventListener('change', function () { sel[a.id] = cb.checked; });
        var t = MK.templates[a.template];
        list.appendChild(h('label', { class: 'rd-opt' }, cb, h('strong', null, t ? t.name : a.template), h('span', null, (a.grade || '') + ' · ' + (a.title || '') + (a.goal ? ' — ' + a.goal : ''))));
      });
    }
    q.addEventListener('input', draw); draw();
    MK.modal('أضف أنشطة إلى الجولات', h('div', { class: 'rd-pickbox' }, q, list), [
      { label: 'أضف المحدد', onClick: function () { Object.keys(sel).forEach(function (id) { if (sel[id]) c.ids.push(id); }); rerender(); } },
      { label: 'إلغاء', cls: 'soft' }]);
  }

  // ================= انسخه وعدّل =================
  MK.copySample = function (s) {
    var a = MK.clone(s);
    delete a.sample; delete a.created; delete a.updated; a.id = MK.uid();
    a.grade = MK.settings.lastGrade || a.grade; a.term = MK.settings.lastTerm || a.term;
    MK.openEditorPublic(a, true);
    MK.toast('نسخة من المثال: عدّلها ثم احفظها');
  };

  // ================= حزم التصدير =================
  function clean(a) { var x = MK.clone(a); delete x.sample; return x; }
  function download(obj, name) {
    var blob = new Blob([JSON.stringify(obj, null, 1)], { type: 'application/json' });
    var el = document.createElement('a'); el.href = URL.createObjectURL(blob);
    el.download = name.replace(/[\\/:*?"<>|]+/g, '-') + '.misk-pack.json';
    document.body.appendChild(el); el.click(); el.remove();
    setTimeout(function () { URL.revokeObjectURL(el.href); }, 2000);
  }
  // acts: الأنشطة المختارة؛ تُضاف الجولات التي كل أنشطتها داخل الحزمة، وأنشطة الجولات المختارة
  MK.exportPack = function (acts, name) {
    var all = MK.allActs(), ids = {};
    acts.forEach(function (a) { ids[a.id] = a; });
    acts.forEach(function (a) { if (a.template === 'rounds') a.content.ids.forEach(function (id) { var x = all.filter(function (y) { return y.id === id; })[0]; if (x) ids[x.id] = x; }); });
    all.forEach(function (a) { if (a.template === 'rounds' && !ids[a.id] && a.content.ids.length && a.content.ids.every(function (id) { return ids[id]; })) ids[a.id] = a; });
    var list = Object.keys(ids).map(function (k) { return clean(ids[k]); });
    if (!list.length) { MK.toast('لا أنشطة لتصديرها'); return; }
    download({ app: 'misk-pack', v: 1, name: name, created: Date.now(), acts: list }, name);
    MK.toast('صُدّر ' + ar(list.length) + ' نشاط في ملف واحد');
  };
  MK.exportBtn = function (getActs, name, title) {
    return h('button', { type: 'button', class: 'exp-btn', title: title || 'تصدير', 'aria-label': title || 'تصدير', onclick: function (e) { e.stopPropagation(); MK.exportPack(getActs(), name); } }, MK.icon('download'));
  };

  // استيراد ملفات: نشاط مفرد أو حزمة
  MK.importAny = function (files, done) {
    var list = Array.prototype.slice.call(files), incoming = [];
    var rejected = [], tooBig = [];
    Promise.all(list.map(function (f) {
      if (f.size > 25 * 1048576) { tooBig.push(f.name); return null; }
      return f.text().then(function (t) { try { return JSON.parse(t); } catch (e) { rejected.push(f.name + ': ليس ملف أنشطة'); return null; } });
    })).then(function (objs) {
      if (objs.some(function (o) { return o && o.app === 'misk-backup'; })) { MK.fileError('هذا ملف نسخة احتياطية. استعده من «الإعدادات ← النسخ الاحتياطي ← استعد من نسخة».'); return; }
      objs.forEach(function (o) {
        if (!o) return;
        if (o.app === 'misk-pack' && Array.isArray(o.acts)) o.acts.forEach(function (a) { incoming.push(a); });
        else incoming.push(o);
      });
      incoming = incoming.map(function (a) {
        var r = MK.sanitizeAct(a);
        if (r.ok || (r.act && (a.template === 'rounds' || a.needsAnswers))) return r.act;
        rejected.push(((a && a.title) || 'نشاط') + ': ' + r.err); return null;
      }).filter(Boolean);
      if (!incoming.length) {
        MK.fileError(h('div', null, h('p', null, 'لم أجد أنشطة صالحة في الملف.'), (rejected.concat(tooBig.map(function (n) { return n + ': أكبر من 25 م.ب'; }))).length ? h('ul', null, rejected.concat(tooBig.map(function (n) { return n + ': أكبر من 25 م.ب'; })).slice(0, 8).map(function (t) { return h('li', null, t); })) : null));
        return;
      }
      var have = MK.allActs(), dups = incoming.filter(function (a) { return have.some(function (x) { return x.id === a.id; }); });
      var lessons = {}; incoming.forEach(function (a) { lessons[(a.grade || '') + '|' + (a.term || '') + '|' + (a.title || '')] = 1; });
      var summary = h('div', null, h('p', null, 'في الملف ' + ar(incoming.length) + ' نشاط في ' + ar(Object.keys(lessons).length) + ' درس، وستُرتَّب في مكانها: الصف ← الفصل ← الدرس ← النوع.'));
      if (rejected.length || tooBig.length) summary.appendChild(h('p', { class: 'ww-status warn' }, 'تُجوهل ' + ar(rejected.length + tooBig.length) + ' لأنه تالف أو ناقص أو كبير جدًا.'));
      var mode = { v: 'replace' };
      if (dups.length) {
        summary.appendChild(h('p', { style: { fontWeight: 700, color: '#b0701a' } }, ar(dups.length) + ' منها موجود عندك من قبل:'));
        summary.appendChild(MK.choice([{ value: 'replace', label: 'استبدال' }, { value: 'copy', label: 'نسخة جديدة' }, { value: 'skip', label: 'تخطَّ المكرر' }], 'replace', function (v) { mode.v = v; }, { label: 'المكرر' }));
      }
      MK.modal('استيراد أنشطة', summary, [{ label: 'استورد', onClick: function () { apply(); } }, { label: 'إلغاء', cls: 'soft' }]);
      function apply() {
        var map = {};
        var go = incoming.filter(function (a) {
          var dup = have.some(function (x) { return x.id === a.id; });
          if (dup && mode.v === 'skip') return false;
          if (dup && mode.v === 'copy') { var n = MK.uid(); map[a.id] = n; a.id = n; }
          return true;
        });
        go.forEach(function (a) { if (a.template === 'rounds') a.content.ids = a.content.ids.map(function (id) { return map[id] || id; }); });
        go.reduce(function (p, a) { return p.then(function () { return MK.store.save(a); }); }, Promise.resolve())
          .then(function () { MK.toast('استُورد ' + ar(go.length) + ' نشاط'); if (done) done(go.length); })
          .catch(function () { MK.toast('تعذّر استيراد بعض الأنشطة'); if (done) done(0); });
      }
    });
  };

  // ================= الإجابات الناقصة =================
  MK.missingAnswers = function (act) {
    var c = act.content || {}, out = [];
    if (c.questions) c.questions.forEach(function (q, i) { if (!(q.correct >= 0 && q.options[q.correct] && String(q.options[q.correct]).trim())) out.push(i + 1); });
    else if (act.template === 'tf') (c.items || []).forEach(function (it, i) { if (it.answer !== true && it.answer !== false) out.push(i + 1); });
    else if (c.cards) c.cards.forEach(function (cd, i) { if (!String(cd.back || '').trim()) out.push(i + 1); });
    else if (act.template === 'boxes') (c.items || []).forEach(function (it, i) { if (!String(it.a || '').trim() && act.needsAnswers) out.push(i + 1); });
    return out;
  };

  // ================= استيراد أوراق المعد =================
  function docxBlocks(xml) {
    // يقرأ الفقرات والجداول بترتيبها في الوثيقة
    var doc = new DOMParser().parseFromString(xml, 'application/xml');
    var W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
    var body = doc.getElementsByTagNameNS(W, 'body')[0], out = [];
    function ptext(p) { var t = ''; var ts = p.getElementsByTagNameNS(W, 't'); for (var i = 0; i < ts.length; i++) t += ts[i].textContent; return t.replace(/\s+/g, ' ').trim(); }
    function walk(node) {
      for (var n = node.firstChild; n; n = n.nextSibling) {
        if (n.namespaceURI !== W) continue;
        if (n.localName === 'p') { var t = ptext(n); if (t) out.push(t); }
        else if (n.localName === 'tbl') {
          var rows = n.getElementsByTagNameNS(W, 'tr');
          for (var r = 0; r < rows.length; r++) {
            if (rows[r].parentNode !== n) continue;
            var cells = [], tcEls = [], tcs = rows[r].childNodes;
            for (var c = 0; c < tcs.length; c++) if (tcs[c].localName === 'tc') {
              tcEls.push(tcs[c]);
              var ps = tcs[c].getElementsByTagNameNS(W, 'p'), ct = [];
              for (var k = 0; k < ps.length; k++) { var x = ptext(ps[k]); if (x) ct.push(x); }
              cells.push(ct.join(' '));
            }
            var isOpt = cells.length >= 2 && cells.some(function (t) { return /^([أابجدو]|هـ)$/.test(t); });
            if (!isOpt) { tcEls.forEach(function (tc) { walk(tc); }); continue; }
            // خانة حرف + خانة نص ← «أ) النص»
            var line = [], i2 = 0;
            while (i2 < cells.length) {
              if (/^([أابجدو]|هـ)$/.test(cells[i2]) && i2 + 1 < cells.length && cells[i2 + 1]) { out.push(cells[i2] + ') ' + cells[i2 + 1]); i2 += 2; }
              else { if (cells[i2]) line.push(cells[i2]); i2++; }
            }
            if (line.length) out.push(line.join('  '));
          }
        } else if (n.localName === 'sdt' || n.localName === 'sdtContent') walk(n);
      }
    }
    walk(body);
    return out;
  }
  var SKIP = /^(اسم الطالب|التاريخ|الشعبة|التوقيع|الدرجة)\s*[:：]?|^مع تمنياتي|^انتهت الأسئلة|^ورقة (دعم|عمل|إثرائية)|^بالتوفيق/;
  function parseSheet(lines) {
    var head = { lesson: '', grade: '', subject: '' }, secs = [], cur = null, q = null;
    lines.forEach(function (L) {
      var m;
      if ((m = L.match(/الدرس\s*[:：]\s*(.+?)(?=\s{2,}|\s+(?:المادة|الصف)\s*[:：]|$)/))) head.lesson = head.lesson || m[1].trim();
      if ((m = L.match(/المادة\s*[:：]\s*(.+?)(?=\s{2,}|\s+(?:الدرس|الصف)\s*[:：]|$)/))) head.subject = head.subject || m[1].trim();
      if ((m = L.match(/^الصف\s*[:：]\s*(.+)$/))) { head.grade = head.grade || m[1].trim(); return; }
      if (/^(المادة|الدرس)\s*[:：]/.test(L)) return;
      if (SKIP.test(L)) return;
      if ((m = L.match(/^السؤال\s+\S+(?:\s+\S+)?\s*[:：]\s*(.*)$/))) {
        var t = m[1] || '';
        cur = { title: t, type: /اختر|اختيار/.test(t) ? 'mc' : /صح|خطأ|علامة/.test(t) ? 'tf' : 'open', items: [] }; secs.push(cur); q = null; return;
      }
      if (!cur) return;
      if ((m = L.match(/^\s*(\d+|[٠-٩]+)\s*[.)\-–]\s*(.+)$/))) { q = { q: m[2].trim(), options: [] }; cur.items.push(q); return; }
      if (cur.type === 'mc' && (m = L.match(/^\s*([أابجدو]|هـ)\s*[)\-.]\s*(.+)$/)) && q) { q.options.push(m[2].replace(/\s+/g, ' ').trim()); return; }
      if (q) { if (cur.type === 'mc' && q.options.length) q.options[q.options.length - 1] += ' ' + L; else q.q += ' ' + L; }
    });
    secs = secs.filter(function (s) { return s.items.length; });
    secs.forEach(function (s) { if (s.type === 'mc' && s.items.some(function (x) { return x.options.length < 2; })) s.type = 'open'; });
    return { head: head, secs: secs };
  }
  function gradeOf(g) {
    if (!g) return '';
    var n = MK.normAr(g.replace(/^الصف\s*/, ''));
    return MK.GRADES.filter(function (x) { return MK.normAr(x.replace(/^الصف\s*/, '')) === n; })[0] || '';
  }
  var MC_TPL = ['quiz', 'show', 'whack', 'balloon0', 'maze', 'plane', 'fruit'].filter(function (k) { return k !== 'balloon0'; });
  var OPEN_TPL = ['flash', 'boxes', 'tiles', 'talk'];
  MK._wsBlocks = docxBlocks; MK._wsParse = parseSheet;
  MK.openWorksheet = function () {
    var fileIn = h('input', { type: 'file', accept: '.docx', class: 'hidden' });
    var body = h('div', { class: 'ws-body' },
      h('ol', { class: 'ww-steps' },
        h('li', null, 'اختر ملف Word الذي أخرجه «معد أوراق العمل».'),
        h('li', null, 'تقرأ الأداة الدرس والصف، وتقسّم الورقة حسب أسئلتها الرئيسة، ويصير كل قسم نشاطًا.'),
        h('li', null, 'تُفتح الأنشطة في المحرّر واحدًا بعد الآخر. ', h('b', null, 'لا يُحفظ نشاط حتى تحدد الإجابة الصحيحة لكل سؤال وتكتب إجابة كل سؤال مقالي.'))),
      h('button', { type: 'button', class: 'btn', onclick: function () { fileIn.click(); } }, MK.icon('upload'), 'اختر ورقة العمل (.docx)'), fileIn);
    var res = h('div', { class: 'ws-res' }); body.appendChild(res);
    var close = MK.modal('استيراد ورقة من المعد', body, [{ label: 'إلغاء', cls: 'soft' }]);
    var md = document.querySelector('.modal'); if (md) md.classList.add('wide');
    fileIn.addEventListener('change', function () {
      var f = fileIn.files[0]; if (!f) return;
      MK.checkFile(f, 'docx').then(function () { return f.arrayBuffer(); }).then(function (buf) { return MK.unzip(buf, 'word/document.xml'); }).then(function (xml) {
        if (!xml) throw 'لم أجد نص المستند داخل الملف.';
        show(parseSheet(docxBlocks(xml)), f.name);
      }).catch(function (m) { MK.clear(res).appendChild(h('p', { class: 'empty' }, typeof m === 'string' ? m : 'تعذّرت قراءة الملف. تأكد أنه ملف Word ‏(.docx) سليم.')); });
    });
    function show(P, fname) {
      MK.clear(res);
      if (!P.secs.length) { res.appendChild(h('p', { class: 'empty' }, 'لم أجد أسئلة مرقّمة تحت «السؤال الأول: …» في هذه الورقة.')); return; }
      var lessonIn = h('input', { type: 'text', value: P.head.lesson || fname.replace(/\.docx$/i, '') });
      var gSel = h('select', null, MK.GRADES.map(function (g) { return h('option', { value: g }, g); }));
      gSel.value = gradeOf(P.head.grade) || MK.settings.lastGrade || MK.GRADES[9];
      res.appendChild(h('div', { class: 'two-col' }, h('div', { class: 'field' }, h('label', null, 'الدرس'), lessonIn), h('div', { class: 'field' }, h('label', null, 'الصف'), gSel)));
      var picks = P.secs.map(function (s) { return s.type === 'mc' ? 'quiz' : s.type === 'tf' ? 'tf' : 'flash'; });
      P.secs.forEach(function (s, i) {
        var opts = (s.type === 'mc' ? MC_TPL : s.type === 'tf' ? ['tf'] : OPEN_TPL).filter(function (k) { return MK.templates[k]; });
        res.appendChild(h('div', { class: 'ws-sec' },
          h('div', { class: 'ws-sec-h' }, h('b', null, 'القسم ' + ar(i + 1) + ': '), s.title || '', h('span', { class: 'meta' }, ' — ' + ar(s.items.length) + (s.type === 'mc' ? ' أسئلة اختيار من متعدد' : ' أسئلة'))),
          h('ol', { class: 'ws-prev' }, s.items.slice(0, 3).map(function (it) { return h('li', null, MK.plain ? MK.plain(it.q).slice(0, 90) : it.q); })),
          MK.choice(opts.map(function (k) { return { value: k, label: MK.templates[k].name }; }), picks[i], function (v) { picks[i] = v; }, { label: 'القالب' })));
      });
      var roundsOn = { v: P.secs.length > 1 };
      if (P.secs.length > 1) res.appendChild(h('label', { class: 'toggle' }, (function () { var c = h('input', { type: 'checkbox', checked: true }); c.addEventListener('change', function () { roundsOn.v = c.checked; }); return c; })(), 'اجمعها في عرض «جولات» واحد بترتيب الورقة'));
      res.appendChild(h('button', { type: 'button', class: 'btn big', style: { marginTop: '10px' }, onclick: function () {
        build(P, picks, lessonIn.value.trim() || 'درس', gSel.value, roundsOn.v, fname); close();
      } }, MK.icon('check'), 'أنشئ الأنشطة وراجعها'));
    }
  };
  function build(P, picks, lesson, grade, withRounds, fname) {
    var term = MK.settings.lastTerm || MK.TERMS[0], theme = MK.settings.theme;
    var acts = P.secs.map(function (s, i) {
      var tid = picks[i], tpl = MK.templates[tid], c = tpl.blank();
      if (s.type === 'mc' || ['quiz', 'show', 'whack', 'maze', 'plane', 'fruit'].indexOf(tid) >= 0) {
        c.questions = s.items.map(function (it) { return { q: it.q, options: it.options.length ? it.options : ['', '', '', ''], correct: -1 }; });
      } else if (tid === 'tf') c.items = s.items.map(function (it) { return { text: it.q, answer: null }; });
      else if (tid === 'boxes') c.items = s.items.map(function (it) { return { q: it.q, a: '' }; });
      else if (tid === 'talk') c.items = s.items.map(function (it) { return it.q; });
      else c.cards = s.items.map(function (it) { return { front: it.q, back: '' }; });
      return { app: 'misk', v: 1, id: MK.uid(), template: tid, theme: theme, title: lesson, grade: grade, term: term, kind: 'kht', lang: 'ar',
        settings: { timer: tpl.timerOk ? +MK.settings.fb.timer : 0, levels: [] }, content: c, needsAnswers: true, from: 'worksheet' };
    });
    var rounds = withRounds && acts.length > 1 ? { app: 'misk', v: 1, id: MK.uid(), template: 'rounds', theme: theme, title: lesson, grade: grade, term: term, kind: 'kht',
      goal: 'جولات ' + fname.replace(/\.docx$/i, ''), settings: { levels: [] }, content: { ids: acts.map(function (a) { return a.id; }) } } : null;
    var i = 0;
    function next() {
      if (i >= acts.length) {
        if (rounds) MK.store.save(rounds).then(function () { MK.addAct(rounds); MK.toast('اكتملت الأنشطة، وأُنشئ عرض الجولات'); MK.goActs(); });
        else MK.goActs();
        return;
      }
      var a = acts[i++];
      MK.editorBanner = 'من ورقة المعد: النشاط ' + ar(i) + ' من ' + ar(acts.length) + ' (' + MK.templates[a.template].name + '). حدّد الإجابات ثم احفظ' + (i < acts.length ? '، فيُفتح النشاط التالي.' : '.');
      MK.afterSave = next;
      MK.openEditorPublic(a, true);
    }
    next();
  }
})();
