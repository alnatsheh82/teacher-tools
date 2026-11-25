/* مِسك الختام — لوحة التحديات: أعمدة مجالات أو دروس، وبطاقات بقيم متصاعدة، واستثمار الفرص */
(function () {
  var MK = window.MK, h = MK.h, ar = MK.toArabicDigits;
  var VALS = { a: [100, 300, 600, 900], b: [100, 200, 300, 400], c: [200, 400, 600, 800, 1000] };
  Object.assign(MK.EN, { 'لوحة التحديات': 'Challenge Board', 'أظهر الإجابة': 'Show answer', 'صحيحة': 'Correct', 'خاطئة': 'Wrong',
    'فرصة لـ': 'A chance for ', 'أحسنتم استثمار الفرصة!': 'Great use of the chance!', 'الإجابة: ': 'Answer: ', 'عودة إلى اللوحة': 'Back to the board' });

  function blankCol(n, name) { var cells = []; for (var i = 0; i < n; i++) cells.push({ q: '', a: '' }); return { name: name || '', cells: cells }; }
  function fitRows(c) { var n = VALS[c.vals || 'a'].length; c.cols.forEach(function (col) { while (col.cells.length < n) col.cells.push({ q: '', a: '' }); col.cells.length = n; }); }

  // ===== قراءة الملفات: سؤال وجواب فقط =====
  function pairsFromLines(lines) {
    lines = lines.map(function (l) { return l.replace(/^\s*(\d+|[٠-٩]+)\s*[.)\-–]\s*/, '').trim(); }).filter(Boolean);
    var out = [], hasEq = lines.some(function (l) { return /\s=\s|=/.test(l); });
    if (hasEq) lines.forEach(function (l) { var i = l.indexOf('='); if (i > 0) out.push({ q: l.slice(0, i).trim(), a: l.slice(i + 1).trim() }); else if (out.length && !out[out.length - 1].a) out[out.length - 1].a = l; else out.push({ q: l, a: '' }); });
    else for (var i = 0; i < lines.length; i += 2) out.push({ q: lines[i], a: lines[i + 1] || '' });
    return out.filter(function (p) { return p.q && !/^(تعليمات|التعليمات|نموذج أسئلة|─)/.test(p.q); });
  }
  function readDocxLines(buf) {
    return MK.unzip(buf, 'word/document.xml').then(function (xml) { return MK._wsBlocks(xml); });
  }
  function readPptx(buf) {
    var out = [];
    function slide(n) {
      return MK.unzip(buf, 'ppt/slides/slide' + n + '.xml').then(function (xml) {
        if (!xml) return out;
        var doc = new DOMParser().parseFromString(xml, 'application/xml');
        var P = 'http://schemas.openxmlformats.org/presentationml/2006/main', A = 'http://schemas.openxmlformats.org/drawingml/2006/main';
        var sps = doc.getElementsByTagNameNS(P, 'sp'), title = '', rest = [];
        for (var i = 0; i < sps.length; i++) {
          var ph = sps[i].getElementsByTagNameNS(P, 'ph')[0], type = ph ? ph.getAttribute('type') : '';
          var paras = sps[i].getElementsByTagNameNS(A, 'p'), txt = [];
          for (var k = 0; k < paras.length; k++) { var ts = paras[k].getElementsByTagNameNS(A, 't'), t = ''; for (var j = 0; j < ts.length; j++) t += ts[j].textContent; if (t.trim()) txt.push(t.trim()); }
          if (!txt.length) continue;
          if (!title && (type === 'title' || type === 'ctrTitle')) title = txt.join(' ');
          else rest.push(txt.join(' '));
        }
        if (!title && rest.length) title = rest.shift();
        if (title && !/^تعليمات/.test(title)) out.push({ q: title, a: rest.join(' ') });
        return slide(n + 1);
      }).catch(function () { return out; });
    }
    return slide(1);
  }

  function importColumn(c, ci, onDone) {
    var vals = VALS[c.vals || 'a'], fileIn = h('input', { type: 'file', accept: '.docx,.pptx', class: 'hidden' });
    var ta = h('textarea', { rows: 5, placeholder: 'أو الصق هنا: كل سؤال وجوابه في سطر بينهما =\nمثال: ما محل النية؟ = القلب' });
    var prev = h('div', { class: 'bd-prev' }), items = [];
    function preview() {
      MK.clear(prev);
      if (!items.length) return;
      var t = h('table', { class: 'part-table' }, h('thead', null, h('tr', null, h('th', null, 'القيمة'), h('th', null, 'السؤال'), h('th', null, 'الجواب'))),
        h('tbody', null, items.slice(0, vals.length).map(function (p, i) {
          var aIn = h('input', { type: 'text', value: p.a }); aIn.addEventListener('input', function () { p.a = aIn.value; tr.classList.toggle('miss', !p.a.trim()); });
          var tr = h('tr', { class: p.a ? '' : 'miss' }, h('td', null, h('b', null, ar(vals[i]))), h('td', null, p.q), h('td', null, aIn));
          return tr;
        })));
      prev.appendChild(t);
      if (items.length > vals.length) prev.appendChild(h('p', { class: 'hint' }, 'في الملف ' + ar(items.length) + ' أسئلة، وفي العمود ' + ar(vals.length) + ' خانات، فأُخذت الأولى منها.'));
      if (items.slice(0, vals.length).some(function (p) { return !p.a.trim(); })) prev.appendChild(h('p', { class: 'ww-status warn' }, 'بعض الأسئلة بلا جواب: اكتبه في الجدول، أو أكمله في المحرّر قبل الحفظ.'));
    }
    ta.addEventListener('input', function () { items = pairsFromLines(ta.value.split(/\n+/)); preview(); });
    fileIn.addEventListener('change', function () {
      var f = fileIn.files[0]; if (!f) return;
      var kind = /\.pptx$/i.test(f.name) ? 'pptx' : 'docx';
      MK.checkFile(f, kind).then(function () { return f.arrayBuffer(); }).then(function (buf) { return kind === 'pptx' ? readPptx(buf) : readDocxLines(buf).then(pairsFromLines); })
        .then(function (r) { items = r; if (!items.length) MK.toast('لم أجد أسئلة في الملف'); preview(); })
        .catch(function (m) { MK.fileError(typeof m === 'string' ? m : 'تعذّرت قراءة الملف.'); });
    });
    var body = h('div', { class: 'bd-imp' },
      h('div', { class: 'bd-howto' },
        h('strong', null, 'جهّز ملفك هكذا: سؤال وجوابه فقط'),
        h('ul', null,
          h('li', null, h('b', null, 'Word: '), 'السؤال والجواب في سطر واحد بينهما علامة = ، أو السؤال في سطر وجوابه في السطر الذي يليه. مثال: ', h('code', null, 'ما محل النية؟ = القلب')),
          h('li', null, h('b', null, 'PowerPoint: '), 'كل شريحة سؤال واحد؛ العنوان هو السؤال، والنص تحته هو الجواب.'),
          h('li', null, 'رتّب الأسئلة من الأسهل إلى الأصعب: الأول يأخذ ' + ar(vals[0]) + '، والأخير ' + ar(vals[vals.length - 1]) + '.'),
          h('li', null, 'لا تكتب في الملف اسم المجال ولا القيمة.')),
        h('div', { class: 'bd-dl' }, 'نماذج جاهزة: ',
          h('a', { href: 'app/نماذج/نموذج أسئلة لوحة التحديات.docx', download: '' }, 'نموذج Word'), ' · ',
          h('a', { href: 'app/نماذج/نموذج أسئلة لوحة التحديات.pptx', download: '' }, 'نموذج PowerPoint'))),
      h('button', { type: 'button', class: 'btn', onclick: function () { fileIn.click(); } }, MK.icon('upload'), 'اختر ملف Word أو PowerPoint'), fileIn, ta, prev);
    MK.modal('استيراد أسئلة العمود ' + ar(ci + 1) + (c.cols[ci].name ? ': ' + c.cols[ci].name : ''), body, [
      { label: 'ضعها في العمود', onClick: function () {
        if (!items.length) { MK.toast('لا أسئلة بعد'); return false; }
        items.slice(0, vals.length).forEach(function (p, i) { c.cols[ci].cells[i] = { q: p.q, a: p.a }; });
        onDone();
      } }, { label: 'إلغاء', cls: 'soft' }]);
    var md = document.querySelector('.modal'); if (md) md.classList.add('wide');
  }

  MK.templates.board = {
    id: 'board', name: 'لوحة التحديات', icon: 'grid', teamsOk: true, timerOk: true, preferTeams: true,
    desc: 'لوحة أعمدة (مجالات أو دروس) تحتها بطاقات بقيم متصاعدة، تتنافس عليها الفرق، ومن أخطأ أُتيحت الفرصة لغيره.',
    blank: function () {
      var d = MK.domains().slice(0, 5);
      return { colType: 'domains', vals: 'a', guide: true, cols: d.map(function (n) { return blankCol(4, n); }) };
    },
    edit: function (c, rerender) {
      fitRows(c);
      var vals = VALS[c.vals || 'a'], box = h('div', { class: 'bd-edit' });
      if (c.guide !== false) box.appendChild(h('div', { class: 'ws-banner' }, MK.icon('info'),
        h('span', { style: { flex: 1 } }, 'اختر نوع الأعمدة (مجالات أو دروس)، ثم استورد أسئلة كل عمود من زره، أو اكتبها مباشرة. كل خانة سؤال وجوابه.'),
        h('button', { type: 'button', class: 'mini-x', 'aria-label': 'إخفاء', onclick: function () { c.guide = false; rerender(); } }, MK.icon('close'))));
      box.appendChild(h('div', { class: 'field' }, h('label', null, 'الأعمدة'),
        MK.choice([{ value: 'domains', label: 'مجالات' }, { value: 'lessons', label: 'دروس' }], c.colType || 'domains', function (v) { c.colType = v; rerender(); }, { label: 'الأعمدة' })));
      box.appendChild(h('div', { class: 'field' }, h('label', null, 'قيم البطاقات'),
        MK.choice([{ value: 'a', label: '100 / 300 / 600 / 900' }, { value: 'b', label: '100 / 200 / 300 / 400' }, { value: 'c', label: '200 … 1000 (خمس)' }], c.vals || 'a', function (v) { c.vals = v; fitRows(c); rerender(); }, { label: 'القيم' })));
      var sugg = c.colType === 'lessons' ? (MK.lessonsFor ? MK.lessonsFor(MK._editAct && MK._editAct.grade, MK._editAct && MK._editAct.term) : []) : MK.domains();
      var dl = h('datalist', { id: 'bd-cols-dl' }, sugg.map(function (t) { return h('option', { value: t }); }));
      box.appendChild(dl);
      var grid = h('div', { class: 'bd-cols' });
      c.cols.forEach(function (col, ci) {
        var nm = h('input', { type: 'text', list: 'bd-cols-dl', value: col.name, placeholder: c.colType === 'lessons' ? 'اسم الدرس' : 'اسم المجال' });
        nm.addEventListener('input', function () { col.name = nm.value; });
        var cells = col.cells.map(function (cell, ri) {
          var q = h('textarea', { rows: 2, placeholder: 'السؤال' }); q.value = cell.q; q.addEventListener('input', function () { cell.q = q.value; });
          var a = h('input', { type: 'text', placeholder: 'الجواب' }); a.value = cell.a; a.addEventListener('input', function () { cell.a = a.value; });
          return h('div', { class: 'bd-cell item-box' }, h('span', { class: 'bd-v' }, ar(vals[ri])), q, a);
        });
        grid.appendChild(h('div', { class: 'bd-col' },
          h('div', { class: 'bd-col-h' }, h('span', { class: 'num' }, ar(ci + 1)), nm,
            c.cols.length > 2 ? h('button', { type: 'button', class: 'mini-x', 'aria-label': 'حذف العمود', onclick: function () { c.cols.splice(ci, 1); rerender(); } }, MK.icon('trash')) : null),
          h('button', { type: 'button', class: 'btn small soft', onclick: function () { importColumn(c, ci, rerender); } }, MK.icon('upload'), 'استورد أسئلة هذا العمود'),
          cells));
      });
      box.appendChild(grid);
      if (c.cols.length < 6) box.appendChild(h('button', { type: 'button', class: 'btn ghost', onclick: function () { c.cols.push(blankCol(vals.length, '')); rerender(); } }, MK.icon('plus'), 'أضف عمودًا'));
      return box;
    },
    options: function () { return [h('div', { class: 'hint' }, 'تُلعب بالفرق في الغالب. الخطأ لا يخصم، وتنتقل البطاقة للفريق التالي بعشر ثوانٍ.')]; },
    validate: function (c) {
      for (var i = 0; i < c.cols.length; i++) {
        if (!c.cols[i].name.trim()) return 'العمود ' + ar(i + 1) + ' بلا اسم.';
        for (var j = 0; j < c.cols[i].cells.length; j++) if (!c.cols[i].cells[j].q.trim()) return 'العمود ' + ar(i + 1) + ': الخانة ' + ar(j + 1) + ' بلا سؤال.';
      }
      return null;
    },
    play: function (ctx) {
      var c = ctx.act.content, vals = VALS[c.vals || 'a'], used = 0, total = 0, right = 0, tm = { stop: function () { } };
      var body = MK.clear(ctx.body); MK.clear(ctx.foot);
      var grid = h('div', { class: 'bd-board', style: { gridTemplateColumns: 'repeat(' + c.cols.length + ',minmax(0,1fr))' } });
      body.appendChild(grid);
      c.cols.forEach(function (col, ci) { grid.appendChild(h('div', { class: 'bd-head c' + (ci % 6), style: { animationDelay: (ci * 60) + 'ms' } }, MK.rich(col.name))); });
      vals.forEach(function (v, ri) {
        c.cols.forEach(function (col, ci) {
          var cell = col.cells[ri];
          if (!cell || !cell.q.trim()) { grid.appendChild(h('div', { class: 'bd-tile empty' })); return; }
          total++;
          var b = h('button', { type: 'button', class: 'bd-tile', style: { animationDelay: (ri * 70 + ci * 40) + 'ms' } }, ar(v));
          b.onclick = function () { if (!b.classList.contains('used')) open(col, cell, v, b, ci); };
          grid.appendChild(b);
        });
      });
      function teamCount() { return ctx.teamCount ? ctx.teamCount() : 1; }
      function open(col, cell, v, tile, ci) {
        MK.sound.flip();
        var over = h('div', { class: 'reveal-bg bd-over' });
        var card = h('div', { class: 'bd-card c' + (ci % 6) });
        over.appendChild(card); ctx.body.appendChild(over);
        var stage1 = true, chance = false;
        function draw() {
          tm.stop(); MK.clear(card);
          card.appendChild(h('div', { class: 'bd-card-h' }, h('span', null, MK.rich(col.name)), h('b', null, ar(v))));
          if (chance) card.appendChild(h('div', { class: 'bd-chance' }, MK.t('فرصة لـ') + ctx.teamName()));
          card.appendChild(h('div', { class: 'bd-q' }, MK.rich(cell.q)));
          var sec = chance ? 10 : (+ctx.act.settings.timer || 0);
          var tbox = h('div', { class: 'bd-timer' }); card.appendChild(tbox);
          tm = MK.startTimer(ctx, sec, function () { judge(false); });
          if (tm.el) tbox.appendChild(tm.el);
          card.appendChild(h('div', { class: 'bd-acts' },
            h('button', { type: 'button', class: 'btn big bd-ok', onclick: function () { judge(true); } }, MK.icon('check'), MK.t('صحيحة')),
            h('button', { type: 'button', class: 'btn big bd-no', onclick: function () { judge(false); } }, MK.icon('close'), MK.t('خاطئة'))));
        }
        function judge(ok) {
          tm.stop();
          if (ok) {
            ctx.addRaw(v, chance ? MK.t('أحسنتم استثمار الفرصة!') : null);
            if (!chance) right++;
            MK.sound.correct(); ctx.mascot('cheer');
            finish(true);
          } else if (!chance && teamCount() > 1) {
            MK.sound.wrong(); ctx.mascot('sad'); ctx.nextTurn(); chance = true; draw();
          } else { MK.sound.wrong(); finish(false); }
        }
        function finish(ok) {
          MK.clear(card);
          card.appendChild(h('div', { class: 'bd-card-h' }, h('span', null, MK.rich(col.name)), h('b', null, ar(v))));
          card.appendChild(h('div', { class: 'bd-q small' }, MK.rich(cell.q)));
          card.appendChild(h('div', { class: 'bd-ans' }, MK.t('الإجابة: '), h('b', null, MK.rich(cell.a || '—'))));
          tile.classList.add('used', ok ? 'won' : 'lost');
          if (ok && ctx.teamCount && teamCount() > 1) tile.textContent = ctx.teamName();
          used++; ctx.setProgress(used / total);
          card.appendChild(h('div', { class: 'bd-acts' }, h('button', { type: 'button', class: 'btn big', onclick: function () {
            over.remove();
            if (!chance && teamCount() > 1) ctx.nextTurn();
            if (used >= total) setTimeout(function () { ctx.setProgress(1); ctx.end({ correct: right, total: total, full: vals.reduce(function (s, x) { return s + x; }, 0) * c.cols.length }); }, 300);
          } }, MK.t('عودة إلى اللوحة'))));
        }
        draw();
      }
      return function () { tm.stop(); };
    }
  };
  // تُعرض في مجموعة «أنشطة حصص المراجعة»
})();
