/* مِسك الختام — الاستيراد من Wordwall بالنسخ واللصق (بلا إنترنت) */
(function () {
  var MK = window.MK, h = MK.h, ar = MK.toArabicDigits;

  // قوالبنا وما يقابلها في Wordwall
  var KINDS = [
    { id: 'quiz', ww: 'Quiz', type: 'mc' },
    { id: 'show', ww: 'Gameshow quiz', type: 'mc' },
    { id: 'tf', ww: 'True or false', type: 'tf' },
    { id: 'match', ww: 'Match up', type: 'pairs' },
    { id: 'find', ww: 'Find the match', type: 'pairs' },
    { id: 'memory', ww: 'Matching pairs', type: 'pairs' },
    { id: 'flash', ww: 'Flash cards', type: 'pairs' },
    { id: 'tiles', ww: 'Flip tiles', type: 'pairs' },
    { id: 'crossword', ww: 'Crossword', type: 'pairs' },
    { id: 'diagram', ww: 'Labelled diagram', type: 'list' },
    { id: 'wordsearch', ww: 'Wordsearch', type: 'list' },
    { id: 'wheel', ww: 'Random wheel', type: 'list' },
    { id: 'boxes', ww: 'Open the box', type: 'list' },
    { id: 'randcards', ww: 'Random cards', type: 'list' },
    { id: 'talk', ww: 'Speaking cards', type: 'list' },
    { id: 'whack', ww: 'Whack-a-mole', type: 'mc' },
    { id: 'maze', ww: 'Maze chase', type: 'mc' },
    { id: 'plane', ww: 'Airplane', type: 'mc' },
    { id: 'fruit', ww: 'Flying fruit', type: 'mc' },
    { id: 'balloon', ww: 'Balloon pop', type: 'pairs' }
  ];
  function kind(id) { return KINDS.filter(function (k) { return k.id === id; })[0]; }

  function segments(txt) {
    return String(txt || '').replace(/\r/g, '').split(/\s*[\n،,]+\s*/).map(function (s) {
      return s.replace(/^\s*(\d+|[٠-٩]+)\s*[.)\-–]\s*/, '').replace(/\s+/g, ' ').trim();
    }).filter(Boolean);
  }
  var QLIKE = /[?؟:…_]|\.\.\.|^(ما|من|متى|أين|كيف|لماذا|هل|كم|أي|اختر|what|who|when|where|why|how|which)\b/i;
  // يقترح عدد الخيارات لكل سؤال
  function guessK(seg) {
    var best = null;
    for (var k = 2; k <= 6; k++) {
      var g = k + 1, n = Math.floor(seg.length / g); if (!n) continue;
      var rem = seg.length % g, sc = 0;
      for (var i = 0; i < n; i++) {
        var q = seg[i * g], opts = seg.slice(i * g + 1, i * g + g);
        var avg = opts.reduce(function (s, o) { return s + o.length; }, 0) / k;
        if (QLIKE.test(q)) sc += 3;
        if (q.length > avg * 1.3) sc += 1;
        if (opts.some(function (o) { return QLIKE.test(o) && /[?؟]/.test(o); })) sc -= 3;
      }
      sc = sc / n - rem * 2;
      if (!best || sc > best.sc) best = { k: k, sc: sc };
    }
    return best ? best.k : 4;
  }

  MK.openWordwall = function (onCreate) {
    var st = { tid: 'quiz', k: 4, auto: true, items: [], swap: false };
    var ta = h('textarea', { rows: 7, class: 'ww-ta', placeholder: 'الصق هنا النص الذي نسخته من صفحة النشاط في Wordwall…' });
    var titleIn = h('input', { type: 'text', placeholder: 'عنوان النشاط' });
    var kBox = h('div'), review = h('div', { class: 'ww-review' }), status = h('div', { class: 'ww-status', 'aria-live': 'polite' });
    var tplChoice = MK.choice(KINDS.map(function (k) { return { value: k.id, label: MK.templates[k.id].name }; }), st.tid, function (v) { st.tid = v; st.auto = true; parse(); }, { label: 'القالب' });
    var wwName = h('div', { class: 'hint ww-name' });

    function parse() {
      var K = kind(st.tid), seg = segments(ta.value);
      wwName.textContent = 'يقابل في Wordwall: ' + K.ww;
      MK.clear(kBox);
      st.items = []; st.left = 0;
      if (K.type === 'mc') {
        if (st.auto && seg.length) st.k = guessK(seg);
        kBox.appendChild(h('div', { class: 'field' }, h('label', null, 'عدد الخيارات في كل سؤال' + (st.auto && seg.length ? ' (اقتراح الأداة: ' + st.k + ')' : '')),
          MK.choice([2, 3, 4, 5, 6].map(function (n) { return { value: n, label: String(n) }; }), st.k, function (v) { st.k = v; st.auto = false; parse(); }, { label: 'عدد الخيارات' })));
        var g = st.k + 1;
        for (var i = 0; i + g <= seg.length; i += g) st.items.push({ q: seg[i], options: seg.slice(i + 1, i + g), correct: -1 });
        st.left = seg.length % g;
      } else if (K.type === 'tf') {
        st.items = seg.map(function (s) { return { text: s, answer: true }; });
      } else if (K.type === 'pairs') {
        kBox.appendChild(h('button', { type: 'button', class: 'btn small soft', onclick: function () { st.swap = !st.swap; parse(); } }, MK.icon('swap'), 'اقلب ترتيب كل زوج'));
        for (var j = 0; j + 1 < seg.length; j += 2) st.items.push(st.swap ? { a: seg[j + 1], b: seg[j] } : { a: seg[j], b: seg[j + 1] });
        st.left = seg.length % 2;
      } else st.items = seg.slice();
      drawReview();
    }
    function drawReview() {
      var K = kind(st.tid);
      MK.clear(review);
      if (!st.items.length) { review.appendChild(h('div', { class: 'hint' }, ta.value.trim() ? 'لم يُفهم شيء بعد.' : 'بعد اللصق تظهر هنا المراجعة.')); status.textContent = ''; return; }
      st.items.forEach(function (it, i) {
        if (K.type === 'mc') {
          var row = h('div', { class: 'ww-q' + (it.correct < 0 ? ' need' : '') }, h('div', { class: 'ww-qt' }, h('b', null, ar(i + 1) + '. '), it.q));
          var opts = h('div', { class: 'ww-opts' });
          it.options.forEach(function (o, oi) {
            opts.appendChild(h('button', { type: 'button', class: 'ww-opt' + (it.correct === oi ? ' on' : ''), onclick: function () { it.correct = oi; drawReview(); } }, it.correct === oi ? '✓ ' : '', o));
          });
          row.appendChild(opts);
          row.appendChild(h('div', { class: 'ww-tools' },
            h('button', { type: 'button', class: 'mini-link', onclick: function () { if (it.options.length > 1) { var x = it.options.shift(); it.q = it.q + '، ' + x; if (it.correct > 0) it.correct--; else it.correct = -1; drawReview(); } } }, 'الخيار الأول جزء من السؤال'),
            h('button', { type: 'button', class: 'mini-link', onclick: function () { st.items.splice(i, 1); drawReview(); } }, 'احذف السؤال')));
          review.appendChild(row);
        } else if (K.type === 'tf') {
          review.appendChild(h('div', { class: 'ww-q' }, h('div', { class: 'ww-qt' }, h('b', null, ar(i + 1) + '. '), it.text),
            MK.choice([{ value: true, label: 'صحيحة ✓' }, { value: false, label: 'خاطئة ✗' }], it.answer, function (v) { it.answer = v; }, { label: 'الحكم' })));
        } else if (K.type === 'pairs') {
          review.appendChild(h('div', { class: 'ww-pair' }, h('b', null, ar(i + 1) + '. '), h('span', null, it.a), h('span', { class: 'ar' }, '←'), h('span', null, it.b)));
        } else review.appendChild(h('div', { class: 'ww-pair' }, h('b', null, ar(i + 1) + '. '), it));
      });
      var need = K.type === 'mc' ? st.items.filter(function (x) { return x.correct < 0; }).length : 0;
      status.textContent = 'فُهم ' + st.items.length + (K.type === 'mc' ? ' سؤالًا' : ' عنصرًا') +
        (st.left ? '، وبقي ' + st.left + ' قطعة زائدة في النهاية (راجع عدد الخيارات)' : '') +
        (need ? '. اضغط الإجابة الصحيحة هنا أو في المحرّر، ولن يُحفظ النشاط قبل اكتمالها (بقي ' + need + ').' : '.');
      status.classList.toggle('warn', !!need || !!st.left);
    }
    ta.addEventListener('input', function () { st.auto = true; parse(); });

    var body = h('div', { class: 'ww-body' },
      h('ol', { class: 'ww-steps' },
        h('li', null, 'افتح رابط النشاط في Wordwall، وحدّد نص الأسئلة في الصفحة وانسخه.'),
        h('li', null, 'الصقه هنا واختر القالب المماثل.'),
        h('li', null, 'راجع التقسيم، واضغط الإجابة الصحيحة لكل سؤال، فصفحة المشاركة لا تبيّنها.')),
      ta,
      h('div', { class: 'field' }, h('label', null, 'العنوان'), titleIn),
      h('div', { class: 'field' }, h('label', null, 'القالب في مِسك الختام'), tplChoice, wwName),
      kBox, status, review);
    MK.modal('استيراد من Wordwall', body, [
      { label: 'أنشئ النشاط', onClick: create },
      { label: 'إلغاء', cls: 'soft' }
    ]);
    var md = document.querySelector('.modal'); if (md) md.classList.add('wide');
    parse();
    setTimeout(function () { ta.focus(); }, 50);

    function create() {
      var K = kind(st.tid), it = st.items;
      if (!it.length) { MK.toast('الصق نص النشاط أولًا'); return false; }
      var tpl = MK.templates[st.tid], c = tpl.blank();
      switch (st.tid) {
        case 'quiz': case 'show': case 'whack': case 'maze': case 'plane': case 'fruit': c.questions = it.map(function (x) { return { q: x.q, options: x.options, correct: x.correct }; }); break;
        case 'tf': c.items = it; break;
        case 'match': case 'find': case 'memory': case 'crossword': case 'balloon': c.pairs = it; break;
        case 'flash': c.cards = it.map(function (p) { return { front: p.a, back: p.b }; }); break;
        case 'tiles': c.cards = it.map(function (p) { return { front: p.a, back: p.b }; }); break;
        case 'wordsearch': c.words = it; break;
        case 'diagram': c.labels = it.map(function (t) { return { text: t, x: null, y: null }; }); break;
        case 'wheel': c.items = it; break;
        case 'boxes': c.items = it.map(function (q) { return { q: q, a: '' }; }); break;
        case 'randcards': case 'talk': c.items = it; break;
      }
      var en = /^[\x00-\x7F\s]+$/.test(it.map(function (x) { return typeof x === 'string' ? x : (x.q || x.text || x.a || ''); }).join(' '));
      var act = { app: 'misk', v: 1, id: MK.uid(), template: st.tid, theme: MK.settings.theme, title: titleIn.value.trim(), lang: en ? 'en' : 'ar',
        settings: { timer: tpl.timerOk ? +MK.settings.fb.timer : 0, levels: [] }, content: c, from: 'wordwall', needsAnswers: true };
      setTimeout(function () { onCreate(act); MK.toast('أُنشئ النشاط، راجعه ثم احفظه'); }, 0);
    }
  };
})();
