/* مِسك الختام — القوالب: المحرّر وطريقة اللعب لكل قالب */
(function () {
  var MK = window.MK, h = MK.h, ar = MK.toArabicDigits;
  var LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و'];

  // ====== أدوات المحرّر ======
  function field(label, input, hint) {
    return h('div', { class: 'field' }, h('label', null, label), input, hint ? h('div', { class: 'hint' }, hint) : null);
  }
  function bindInput(el, obj, key) {
    el.value = obj[key] || '';
    el.addEventListener('input', function () { obj[key] = el.value; });
    return el;
  }
  function itemHead(n, onDel, label) {
    return h('div', { class: 'item-head' },
      h('span', { class: 'num' }, ar(n)),
      h('strong', null, label),
      h('span', { class: 'spacer' }),
      onDel ? h('button', { type: 'button', class: 'mini-x', 'aria-label': 'حذف', title: 'حذف', onclick: onDel }, MK.icon('trash')) : null);
  }

  // ====== ١) الاختبار ======
  var quiz = {
    id: 'quiz', name: 'الاختبار', icon: 'quiz', teamsOk: true, timerOk: true,
    desc: 'أسئلة متعددة الخيارات بمؤقت ونقاط.',
    blank: function () { return { questions: [{ q: '', options: ['', '', '', ''], correct: 0 }], shuffleQ: false, shuffleOpts: true }; },
    edit: function (c, rerender) {
      var box = h('div');
      c.questions.forEach(function (qq, qi) {
        var opts = h('div');
        qq.options.forEach(function (op, oi) {
          var name = 'cor-' + qi;
          var radio = h('input', { type: 'radio', name: name, 'aria-label': 'الإجابة الصحيحة', checked: qq.correct === oi });
          radio.addEventListener('change', function () { qq.correct = oi; rerender(); });
          var inp = h('input', { type: 'text', placeholder: 'الخيار ' + LETTERS[oi] });
          inp.value = op;
          inp.addEventListener('input', function () { qq.options[oi] = inp.value; });
          var del = qq.options.length > 2 ? h('button', {
            type: 'button', class: 'mini-x', 'aria-label': 'حذف الخيار', onclick: function () {
              qq.options.splice(oi, 1);
              if (qq.correct >= qq.options.length) qq.correct = 0; else if (qq.correct > oi) qq.correct--;
              rerender();
            }
          }, MK.icon('close')) : null;
          opts.appendChild(h('div', { class: 'opt-row' + (qq.correct === oi ? ' correct' : '') }, radio, h('span', { style: { fontWeight: 800, width: '26px' } }, LETTERS[oi]), inp, del));
        });
        var addOpt = qq.options.length < 6 ? h('button', { type: 'button', class: 'btn small soft', onclick: function () { qq.options.push(''); rerender(); } }, MK.icon('plus'), 'خيار') : null;
        box.appendChild(h('div', { class: 'item-box' },
          itemHead(qi + 1, c.questions.length > 1 ? function () { c.questions.splice(qi, 1); rerender(); } : null, 'سؤال'),
          field('نص السؤال', bindInput(h('textarea', { rows: 2 }), qq, 'q')),
          h('div', { class: 'hint', style: { marginBottom: '6px' } }, 'اكتب الخيارات، واختر الدائرة بجانب الإجابة الصحيحة.'),
          opts, addOpt,
          h('details', { class: 'explain-ed', open: qq.explain ? true : null }, h('summary', null, 'التفسير (اختياري): يظهر للطلاب بعد الإجابة الخاطئة'),
            bindInput(h('textarea', { rows: 2, placeholder: 'لماذا كانت الإجابة الصحيحة صحيحة؟' }), qq, 'explain'))));
      });
      box.appendChild(h('button', { type: 'button', class: 'btn ghost', onclick: function () { c.questions.push({ q: '', options: ['', '', '', ''], correct: 0 }); rerender(); } }, MK.icon('plus'), 'أضف سؤالًا'));
      return box;
    },
    options: function (c) {
      return [toggle('اخلط ترتيب الأسئلة', c, 'shuffleQ'), toggle('اخلط ترتيب الخيارات', c, 'shuffleOpts')];
    },
    validate: function (c) {
      var qs = c.questions.filter(function (q) { return q.q.trim(); });
      if (!qs.length) return 'اكتب سؤالًا واحدًا على الأقل.';
      for (var i = 0; i < c.questions.length; i++) {
        var q = c.questions[i];
        if (!q.q.trim()) return 'السؤال ' + ar(i + 1) + ' بلا نص.';
        var filled = q.options.filter(function (o) { return o.trim(); }).length;
        if (filled < 2) return 'السؤال ' + ar(i + 1) + ' يحتاج خيارين على الأقل.';
        if (q.correct >= 0 && !(q.options[q.correct] || '').trim()) return 'الإجابة الصحيحة في السؤال ' + ar(i + 1) + ' فارغة.';
      }
      return null;
    },
    play: function (ctx) {
      var c = ctx.act.content, timerSec = +ctx.act.settings.timer || 0;
      var qs = c.questions.map(function (q) {
        var opts = q.options.map(function (t, i) { return { t: t, ok: i === q.correct }; }).filter(function (o) { return o.t.trim(); });
        return { q: q.q, explain: q.explain, opts: c.shuffleOpts ? MK.shuffle(opts) : opts };
      });
      if (c.shuffleQ) qs = MK.shuffle(qs);
      var idx = 0, timer = null, correctCount = 0;
      function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
      function show() {
        stopTimer();
        var q = qs[idx], body = MK.clear(ctx.body);
        ctx.setProgress(idx / qs.length);
        MK.clear(ctx.foot);
        var tEl = null;
        if (timerSec) { tEl = h('div', { class: 'timer', role: 'timer', 'aria-label': MK.t('الوقت المتبقي') }, h('span', null, ar(timerSec))); }
        body.appendChild(h('div', { class: 'q-top' }, h('div', { class: 'q-count' }, MK.t('السؤال ') + ar(idx + 1) + MK.t(' من ') + ar(qs.length)), tEl));
        body.appendChild(h('div', { class: 'q-text' }, MK.rich(q.q)));
        var grid = h('div', { class: 'q-options' });
        var btns = q.opts.map(function (o, i) {
          var b = h('button', { type: 'button', class: 'q-opt' }, h('span', { class: 'letter' }, MK.lang === 'en' ? 'ABCDEF'[i] : LETTERS[i]), h('span', null, MK.rich(o.t)));
          b.addEventListener('click', function () { answer(i); });
          grid.appendChild(b);
          return b;
        });
        if (q.opts.length === 3) grid.style.gridTemplateColumns = 'repeat(3,minmax(0,1fr))';
        body.appendChild(grid);
        var done = false;
        function answer(i) {
          if (done) return; done = true; stopTimer();
          var right = i >= 0 && q.opts[i].ok;
          btns.forEach(function (b, j) {
            b.disabled = true;
            if (q.opts[j].ok) b.classList.add('right');
            else if (j === i) b.classList.add('wrong');
            else b.classList.add('dim');
          });
          if (right) { correctCount++; MK.sound.correct(); ctx.addPoints(10); ctx.mascot('cheer'); }
          else { if (i >= 0) MK.sound.wrong(); ctx.mascot('sad'); if (q.explain && q.explain.trim()) body.appendChild(MK.explainBox(q.explain)); }
          var last = idx === qs.length - 1;
          ctx.foot.appendChild(h('button', {
            type: 'button', class: 'btn big', onclick: function () {
              ctx.nextTurn();
              if (last) { ctx.setProgress(1); ctx.end({ correct: correctCount, total: qs.length }); }
              else { idx++; show(); }
            }
          }, last ? MK.t('النتيجة') : MK.t('السؤال التالي'), MK.icon(last ? 'check' : 'next')));
          ctx.foot.querySelector('button').focus();
        }
        if (timerSec) {
          var left = timerSec;
          timer = setInterval(function () {
            if (MK.paused) return;
            left--;
            if (left > 0 && left <= 5 && MK.sound.count) MK.sound.count();
            tEl.style.setProperty('--p', left / timerSec);
            tEl.firstChild.textContent = ar(Math.max(left, 0));
            if (left <= 5) tEl.classList.add('low');
            if (left > 0 && left <= 5) MK.sound.tick();
            if (left <= 0) { MK.sound.timeup(); answer(-1); }
          }, 1000);
        }
      }
      show();
      return stopTimer;
    }
  };

  function toggle(label, obj, key) {
    var cb = h('input', { type: 'checkbox', checked: !!obj[key] });
    cb.addEventListener('change', function () { obj[key] = cb.checked; });
    return h('label', { class: 'toggle' }, cb, label);
  }

  // ====== ٢) المسح التدريجي ======
  var PUNCT = '«»"\'()\\[\\]{}.,،؛:!؟?\\-–—…﴿﴾';
  var reTok = new RegExp('^([' + PUNCT + ']*)(.*?)([' + PUNCT + ']*)$');
  var HARAKAT = /[ً-ٰٟۖ-ۭ]/;
  function tokenize(str) {
    return (str || '').split(/\s+/).filter(Boolean).map(function (w) {
      var m = w.match(reTok) || ['', '', w, ''];
      return { pre: m[1], core: m[2], post: m[3], hideable: /[ء-يٱ-ۓA-Za-z0-9٠-٩]/.test(m[2]) };
    });
  }
  function firstCluster(s) {
    var i = 1;
    while (i < s.length && HARAKAT.test(s[i])) i++;
    // إن بدأت الكلمة بـ«ال» نُظهر «ال» والحرف الذي بعدها
    if (s[0] === 'ا' || s[0] === 'ٱ') {
      var j = i;
      if (s[j] === 'ل') { j++; while (j < s.length && HARAKAT.test(s[j])) j++; if (j < s.length) { j++; while (j < s.length && HARAKAT.test(s[j])) j++; i = j; } }
    }
    // لا نفصل «ال» عن ما بعدها: يكفي الحرف الأول مع حركاته
    return [s.slice(0, i), s.slice(i)];
  }
  var MODES = [
    { id: 'random', short: 'عشوائي' },
    { id: 'end', short: 'من آخر النص' },
    { id: 'alternate', short: 'كلمة وكلمة' },
    { id: 'first', short: 'يبقى أول حرف' }
  ];
  var erase = {
    id: 'erase', name: 'المسح التدريجي', icon: 'eraser', teamsOk: false, timerOk: false,
    desc: 'لحفظ الحديث والآيات والتعاريف: تختفي الكلمات تدريجيًا ويردّد الطلاب النص.',
    blank: function () { return { texts: [{ intro: '', text: '', source: '' }], mode: 'random', steps: 4, includeExtras: false }; },
    edit: function (c, rerender) {
      var box = h('div');
      c.texts.forEach(function (t, i) {
        box.appendChild(h('div', { class: 'item-box' },
          itemHead(i + 1, c.texts.length > 1 ? function () { c.texts.splice(i, 1); rerender(); } : null, 'نص'),
          field('المقدمة أو الراوي (اختياري)', bindInput(h('input', { type: 'text', placeholder: 'عن عمر بن الخطاب رضي الله عنه قال: سمعت رسول الله ﷺ يقول:' }), t, 'intro')),
          h('div', { style: { display: 'flex', justifyContent: 'flex-end', marginBottom: '-6px' } }, h('button', { type: 'button', class: 'btn small soft', onclick: function () { MK.verseDialog(function (r) { t.text = r.text; t.source = r.ref; if (!t.intro) t.intro = 'قال الله تعالى:'; rerender(); }); } }, '﴿ ﴾ إدراج آية')),
          field('النص المراد حفظه', bindInput(h('textarea', { class: 'arabic-text', rows: 4, placeholder: 'اكتب النص أو الصقه مشكولًا' }), t, 'text')),
          field('التخريج (اختياري)', bindInput(h('input', { type: 'text', placeholder: 'متفق عليه' }), t, 'source'))));
      });
      box.appendChild(h('button', { type: 'button', class: 'btn ghost', onclick: function () { c.texts.push({ intro: '', text: '', source: '' }); rerender(); } }, MK.icon('plus'), 'أضف نصًا آخر'));
      return box;
    },
    options: function (c) {
      var modes = MK.choice(MODES.map(function (m) { return { value: m.id, label: m.short }; }), c.mode, function (v) { c.mode = v; }, { cls: 'col', label: 'طريقة المسح' });
      var steps = MK.choice([3, 4, 5, 6, 8].map(function (n) { return { value: n, label: String(n) }; }), +c.steps, function (v) { c.steps = v; }, { label: 'عدد مراحل المسح' });
      return [field('طريقة المسح', modes), field('عدد مراحل المسح', steps, 'كل ضغطة على «امسح» تُخفي جزءًا، حتى يختفي النص كله.'),
        toggle('يدخل الراوي والتخريج في المسح', c, 'includeExtras')];
    },
    validate: function (c) {
      if (!c.texts.some(function (t) { return t.text.trim(); })) return 'اكتب النص المراد حفظه.';
      return null;
    },
    play: function (ctx) {
      var c = ctx.act.content, texts = c.texts.filter(function (t) { return t.text.trim(); });
      var ti = 0, step = 0, steps = +c.steps || 4;
      var words = [], order = [];
      function buildOrder() {
        var idxs = []; words.forEach(function (w, i) { if (w.hideable && (c.includeExtras || w.part === 'text')) idxs.push(i); });
        if (c.mode === 'end') order = idxs.slice().reverse();
        else if (c.mode === 'alternate') order = idxs.filter(function (_, k) { return k % 2 === 1; }).concat(idxs.filter(function (_, k) { return k % 2 === 0; }));
        else order = MK.shuffle(idxs);
      }
      function wordEl(w) {
        var inner;
        if (c.mode === 'first') { var fc = firstCluster(w.core); inner = [h('span', { class: 'fl' }, fc[0]), fc[1]]; }
        else inner = w.core;
        var el = h('span', { class: 'w' }, inner);
        el.addEventListener('click', function () { if (el.classList.contains('gone')) { el.classList.toggle('peek'); MK.sound.reveal(); } });
        w.el = el;
        return [w.pre, el, w.post];
      }
      function renderLine(cls, part, str) {
        var line = h('div', { class: cls });
        tokenize(str).forEach(function (w, k) {
          w.part = part;
          if (k) line.appendChild(document.createTextNode(' '));
          if (!w.hideable) { line.appendChild(document.createTextNode(w.pre + w.core + w.post)); return; }
          words.push(w);
          wordEl(w).forEach(function (x) { if (x) line.appendChild(typeof x === 'string' ? document.createTextNode(x) : x); });
        });
        return line;
      }
      var dots;
      function render() {
        var t = texts[ti], body = MK.clear(ctx.body);
        words = []; step = 0;
        ctx.setProgress(texts.length > 1 ? ti / texts.length : 0);
        var scroll = h('div', { class: 'scroll' });
        if (t.intro && t.intro.trim()) scroll.appendChild(renderLine('erase-intro', 'intro', t.intro));
        scroll.appendChild(renderLine('erase-text' + (/﴿/.test(t.text) ? ' qr' : ''), 'text', t.text));
        if (t.source && t.source.trim()) scroll.appendChild(renderLine('erase-source', 'source', t.source));
        body.appendChild(scroll);
        buildOrder();
        dots = h('div', { class: 'steps-dots', 'aria-hidden': 'true' });
        for (var i = 0; i < steps; i++) dots.appendChild(h('i'));
        foot();
        apply(false);
      }
      function apply(animate) {
        var n = Math.round(order.length * step / steps);
        var hide = {}; order.slice(0, n).forEach(function (i) { hide[i] = 1; });
        words.forEach(function (w, i) {
          var g = !!hide[i];
          if (!g) w.el.classList.remove('peek');
          w.el.classList.toggle('gone', g);
        });
        Array.prototype.forEach.call(dots.children, function (d, i) { d.classList.toggle('on', i < step); });
        stepLabel.textContent = step === 0 ? MK.t('النص كاملًا') : (step === steps ? MK.t('اختفى النص كله، ردّدوه من الذاكرة') : MK.t('المرحلة ') + ar(step) + MK.t(' من ') + ar(steps));
        btnErase.disabled = step >= steps; btnBack.disabled = step <= 0;
        tapHint.classList.toggle('hidden', step === 0);
        if (animate) MK.sound.erase();
      }
      var btnErase, btnBack, stepLabel, tapHint;
      function foot() {
        MK.clear(ctx.foot);
        stepLabel = h('span', { class: 'erase-step', 'aria-live': 'polite' });
        btnBack = h('button', { type: 'button', class: 'btn soft big', onclick: function () { if (step > 0) { step--; apply(false); MK.sound.reveal(); } } }, MK.icon('undo'), MK.t('تراجع'));
        btnErase = h('button', { type: 'button', class: 'btn big', onclick: function () { if (step < steps) { step++; apply(true); } } }, MK.icon('eraser'), MK.t('امسح'));
        var showAll = h('button', { type: 'button', class: 'btn ghost big', onclick: function () { step = 0; apply(false); MK.sound.reveal(); } }, MK.icon('eye'), MK.t('إظهار الكل'));
        var hideAll = h('button', { type: 'button', class: 'btn ghost big', onclick: function () { step = steps; apply(true); } }, MK.t('إخفاء الكل'));
        var row = [btnBack, btnErase, showAll, hideAll];
        if (texts.length > 1) {
          row.unshift(h('button', { type: 'button', class: 'btn soft big', disabled: ti === 0, onclick: function () { ti--; render(); } }, MK.icon('back'), MK.t('السابق')));
          row.push(h('button', { type: 'button', class: 'btn soft big', disabled: ti === texts.length - 1, onclick: function () { ti++; render(); } }, MK.t('التالي'), MK.icon('next')));
        }
        tapHint = h('span', { class: 'tap-hint' }, MK.t('اضغط على الفراغ لتظهر الكلمة'));
        ctx.foot.appendChild(h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%' } },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' } }, dots, stepLabel, tapHint),
          h('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' } }, row)));
      }
      // أزرار جهاز العرض (الريموت) ولوحة المفاتيح
      function onKey(e) {
        if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
        if (e.key === 'ArrowLeft' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); btnErase.click(); }
        else if (e.key === 'ArrowRight' || e.key === 'PageUp') { e.preventDefault(); btnBack.click(); }
      }
      document.addEventListener('keydown', onKey);
      render();
      return function () { document.removeEventListener('keydown', onKey); };
    }
  };

  // ====== ٣) رتّب التعريف ======
  function chunksOf(def) {
    def = (def || '').trim();
    if (def.indexOf('/') >= 0) return def.split('/').map(function (s) { return s.trim(); }).filter(Boolean);
    return def.split(/\s+/).filter(Boolean);
  }
  var unjumble = {
    id: 'unjumble', name: 'رتّب التعريف', icon: 'order', teamsOk: true, timerOk: false,
    desc: 'كلمات التعريف مبعثرة، ويرتّبها الطالب بالسحب ليبني التعريف الصحيح.',
    blank: function () { return { items: [{ term: '', definition: '' }], shuffle: false }; },
    edit: function (c, rerender) {
      var box = h('div');
      c.items.forEach(function (it, i) {
        var prev = h('div', { class: 'hint' });
        var ta = bindInput(h('textarea', { rows: 2, placeholder: 'عزم القلب / على فعل العبادة / تقربًا إلى الله تعالى' }), it, 'definition');
        function upd() { var ch = chunksOf(it.definition); prev.textContent = ch.length ? 'سيُقسَّم إلى ' + ar(ch.length) + ' قطع: ' + ch.join(' | ') : ''; }
        ta.addEventListener('input', upd); upd();
        box.appendChild(h('div', { class: 'item-box' },
          itemHead(i + 1, c.items.length > 1 ? function () { c.items.splice(i, 1); rerender(); } : null, 'تعريف'),
          field('المصطلح', bindInput(h('input', { type: 'text', placeholder: 'النية' }), it, 'term')),
          field('التعريف الصحيح', ta, 'ضع «/» بين أجزاء التعريف لتكون القطع عبارات، أو اتركه بلا «/» ليُقسَّم كلمة كلمة.'),
          prev));
      });
      box.appendChild(h('button', { type: 'button', class: 'btn ghost', onclick: function () { c.items.push({ term: '', definition: '' }); rerender(); } }, MK.icon('plus'), 'أضف تعريفًا'));
      return box;
    },
    options: function (c) { return [toggle('اخلط ترتيب التعاريف', c, 'shuffle')]; },
    validate: function (c) {
      for (var i = 0; i < c.items.length; i++) {
        var it = c.items[i];
        if (!it.term.trim()) return 'التعريف ' + ar(i + 1) + ' بلا مصطلح.';
        if (chunksOf(it.definition).length < 2) return 'التعريف ' + ar(i + 1) + ' يحتاج قطعتين على الأقل.';
      }
      return null;
    },
    play: function (ctx) {
      var c = ctx.act.content;
      var items = c.items.filter(function (it) { return it.term.trim() && chunksOf(it.definition).length > 1; });
      if (c.shuffle) items = MK.shuffle(items);
      var ii = 0, solvedCount = 0, cleanup = [];
      function show() {
        var it = items[ii], chunks = chunksOf(it.definition), hints = 0, solved = false;
        ctx.setProgress(ii / items.length);
        var body = MK.clear(ctx.body); MK.clear(ctx.foot);
        var chips = chunks.map(function (t, k) { return { id: k, text: t, locked: false }; });
        var pool = MK.shuffle(chips);
        var guard = 0;
        while (chips.length > 1 && pool.every(function (ch, k) { return ch.text === chunks[k]; }) && guard++ < 20) pool = MK.shuffle(chips);
        var slots = chunks.map(function () { return null; }); // chip id في كل خانة
        var where = {}; // id -> 'pool' | slot index
        chips.forEach(function (ch) { where[ch.id] = 'pool'; });

        body.appendChild(h('div', { class: 'term-card' }, MK.rich(it.term)));
        var slotsEl = h('div', { class: 'slots', 'aria-label': MK.t('خانات التعريف') });
        var poolEl = h('div', { class: 'pool', 'aria-label': MK.t('القطع') });
        body.appendChild(slotsEl); body.appendChild(poolEl);

        var chipEls = {};
        chips.forEach(function (ch, k) {
          var el = h('button', { type: 'button', class: 'chip c' + (k % 4) }, MK.rich(ch.text));
          el.dataset.id = ch.id;
          chipEls[ch.id] = el;
          attachDrag(el, ch);
        });
        var slotEls = slots.map(function (_, i) {
          var s = h('div', { class: 'slot' }); s.dataset.slot = i;
          slotsEl.appendChild(s);
          return s;
        });
        function layout() {
          slotEls.forEach(function (s, i) {
            MK.clear(s);
            var id = slots[i];
            s.classList.toggle('filled', id != null);
            if (id != null) s.appendChild(chipEls[id]);
          });
          MK.clear(poolEl);
          pool.forEach(function (ch) { if (where[ch.id] === 'pool') poolEl.appendChild(chipEls[ch.id]); });
        }
        function clearMarks() { chips.forEach(function (ch) { if (!ch.locked) chipEls[ch.id].classList.remove('no', 'ok'); }); }
        function moveTo(id, target) { // target: slot index or 'pool'
          var ch = chips[id]; if (ch.locked || solved) return;
          var from = where[id];
          if (target === from) { layout(); return; }
          if (target !== 'pool') {
            var occ = slots[target];
            if (occ != null && chips[occ].locked) { layout(); return; }
            if (occ != null) { // تبديل
              if (from === 'pool') { where[occ] = 'pool'; }
              else { slots[from] = occ; where[occ] = from; }
            }
            if (from !== 'pool' && occ == null) slots[from] = null;
            slots[target] = id; where[id] = target;
          } else {
            if (from !== 'pool') slots[from] = null;
            where[id] = 'pool';
          }
          clearMarks(); layout(); MK.sound.drop();
        }
        function tap(id) {
          if (chips[id].locked || solved) return;
          if (where[id] === 'pool') {
            var e = slots.indexOf(null);
            if (e >= 0) moveTo(id, e);
          } else moveTo(id, 'pool');
        }
        // السحب باللمس والفأرة
        function attachDrag(el, ch) {
          var sx, sy, dragging = false, ghost = null, pid = null, over = null;
          el.addEventListener('pointerdown', function (e) {
            if (ch.locked || solved || e.button > 0) return;
            sx = e.clientX; sy = e.clientY; dragging = false; pid = e.pointerId;
            el.setPointerCapture(pid);
          });
          el.addEventListener('pointermove', function (e) {
            if (pid !== e.pointerId) return;
            if (!dragging && Math.hypot(e.clientX - sx, e.clientY - sy) > 8) {
              dragging = true; MK.sound.pick();
              var r = el.getBoundingClientRect();
              ghost = el.cloneNode(true); ghost.classList.add('drag');
              ghost.style.width = r.width + 'px'; ghost.style.left = r.left + 'px'; ghost.style.top = r.top + 'px';
              ghost._dx = sx - r.left; ghost._dy = sy - r.top;
              document.body.appendChild(ghost); el.classList.add('ghost');
            }
            if (dragging) {
              ghost.style.left = (e.clientX - ghost._dx) + 'px'; ghost.style.top = (e.clientY - ghost._dy) + 'px';
              var t = document.elementFromPoint(e.clientX, e.clientY);
              var s = t && t.closest ? t.closest('.slot') : null;
              if (over && over !== s) over.classList.remove('over');
              over = s; if (s) s.classList.add('over');
            }
          });
          function end(e) {
            if (pid !== e.pointerId) return;
            pid = null;
            if (!dragging) { if (e.type === 'pointerup') tap(ch.id); return; }
            dragging = false;
            if (ghost) ghost.remove(); ghost = null; el.classList.remove('ghost');
            if (over) over.classList.remove('over');
            var t = document.elementFromPoint(e.clientX, e.clientY);
            var s = t && t.closest ? t.closest('.slot') : null;
            var target = s ? +s.dataset.slot : (t && t.closest && t.closest('.slots') ? null : 'pool');
            over = null;
            if (target === null) { layout(); return; }
            moveTo(ch.id, target);
          }
          el.addEventListener('pointerup', end);
          el.addEventListener('pointercancel', end);
          // لوحة المفاتيح
          el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(ch.id); } });
          el.addEventListener('click', function (e) { if (e.detail === 0) { /* نقر لوحة المفاتيح عولج أعلاه */ } });
        }
        function check() {
          if (slots.indexOf(null) >= 0) { MK.toast(MK.t('ضع كل القطع في الخانات أولًا')); return; }
          var allOk = true;
          slots.forEach(function (id, i) {
            var ok = chips[id].text === chunks[i];
            chipEls[id].classList.remove('ok', 'no');
            void chipEls[id].offsetWidth;
            chipEls[id].classList.add(ok ? 'ok' : 'no');
            if (ok) chips[id].locked = true; else allOk = false;
          });
          if (allOk) win();
          else {
            MK.sound.wrong(); ctx.mascot('sad');
            setTimeout(function () {
              slots.forEach(function (id, i) { if (id != null && !chips[id].locked) { slots[i] = null; where[id] = 'pool'; chipEls[id].classList.remove('no'); } });
              layout();
            }, 1200);
          }
        }
        function hint() {
          var i;
          for (i = 0; i < slots.length; i++) { var id0 = slots[i]; if (id0 == null || !chips[id0].locked) break; }
          if (i >= slots.length) return;
          var want = chips.filter(function (ch) { return !ch.locked && ch.text === chunks[i]; })[0];
          if (!want) return;
          // أخلِ الخانة
          if (slots[i] != null && slots[i] !== want.id) { where[slots[i]] = 'pool'; slots[i] = null; }
          if (where[want.id] !== 'pool' && where[want.id] !== i) slots[where[want.id]] = null;
          slots[i] = want.id; where[want.id] = i; want.locked = true;
          chipEls[want.id].classList.add('ok');
          hints++; layout(); MK.sound.reveal();
          if (slots.every(function (id, k) { return id != null && chips[id].text === chunks[k]; })) {
            slots.forEach(function (id) { chips[id].locked = true; chipEls[id].classList.add('ok'); });
            win();
          }
        }
        function win() {
          solved = true; solvedCount++;
          MK.sound.correct(); ctx.mascot('cheer');
          ctx.addPoints(Math.max(4, 10 - hints * 3));
          slotsEl.classList.add('flash-ok');
          var last = ii === items.length - 1;
          MK.clear(ctx.foot);
          ctx.foot.appendChild(h('button', {
            type: 'button', class: 'btn big', onclick: function () {
              ctx.nextTurn();
              if (last) { ctx.setProgress(1); ctx.end({ correct: solvedCount, total: items.length }); }
              else { ii++; show(); }
            }
          }, last ? MK.t('النتيجة') : MK.t('التعريف التالي'), MK.icon(last ? 'check' : 'next')));
          ctx.foot.querySelector('button').focus();
        }
        ctx.foot.appendChild(h('button', { type: 'button', class: 'btn big', onclick: check }, MK.icon('check'), MK.t('تحقّق')));
        ctx.foot.appendChild(h('button', { type: 'button', class: 'btn ghost big', onclick: hint }, MK.icon('hint'), MK.t('تلميح')));
        ctx.foot.appendChild(h('button', { type: 'button', class: 'btn soft big', onclick: function () { show(); } }, MK.icon('redo'), MK.t('أعد')));
        layout();
      }
      show();
      return function () { document.querySelectorAll('.chip.drag').forEach(function (g) { g.remove(); }); };
    }
  };

  MK.explainBox = function (t) { return h('div', { class: 'explain' }, h('span', { class: 'ex-i' }, '💡'), h('div', null, h('b', null, MK.t('التفسير: ')), MK.rich(t))); };
  MK.templates = { quiz: quiz, erase: erase, unjumble: unjumble };
  MK.ui = { field: field, bindInput: bindInput, itemHead: itemHead, toggle: toggle, chunksOf: chunksOf, LETTERS: LETTERS };

  // ====== قائمة القوالب كلها (المتاح الآن وما سيأتي) ======
  MK.catalog = [
    { phase: 1, id: 'quiz' }, { phase: 1, id: 'erase' }, { phase: 1, id: 'unjumble' },
    { phase: 1, name: 'صح أم خطأ', icon: 'check', desc: 'عبارات سريعة يحكم عليها الطلاب.' },
    { phase: 1, name: 'المطابقة', icon: 'swap', desc: 'سحب المصطلح إلى تعريفه.' },
    { phase: 1, name: 'الكلمة المفقودة', icon: 'edit', desc: 'سحب الكلمات إلى الفراغات في النص.' },
    { phase: 1, name: 'العجلة الدوّارة', icon: 'redo', desc: 'تختار سؤالًا أو طالبًا عشوائيًا.' },
    { phase: 1, name: 'افتح الصندوق', icon: 'copy', desc: 'صناديق مرقّمة يُكشف في كل منها سؤال.' },
    { phase: 1, name: 'البطاقات التعليمية', icon: 'copy', desc: 'وجه للسؤال ووجه للجواب.' },
    { phase: 2, name: 'المسابقة التلفزيونية', icon: 'quiz' }, { phase: 2, name: 'جد المطابق', icon: 'swap' },
    { phase: 2, name: 'أزواج الذاكرة', icon: 'copy' }, { phase: 2, name: 'الترتيب', icon: 'order' },
    { phase: 2, name: 'التصنيف في مجموعات', icon: 'folder' }, { phase: 2, name: 'البطاقات العشوائية', icon: 'copy' },
    { phase: 2, name: 'البلاطات المنقلبة', icon: 'copy' }, { phase: 2, name: 'بطاقات المحادثة', icon: 'info' },
    { phase: 2, name: 'الرسم المعنون', icon: 'edit' }, { phase: 2, name: 'الكلمات المتقاطعة', icon: 'order' },
    { phase: 2, name: 'البحث عن الكلمات', icon: 'eye' },
    { phase: 3, name: 'اضرب الخلد', icon: 'play' }, { phase: 3, name: 'فرقعة البالونات', icon: 'play' },
    { phase: 3, name: 'مطاردة المتاهة', icon: 'play' }, { phase: 3, name: 'الطائرة', icon: 'play' },
    { phase: 3, name: 'الفاكهة الطائرة', icon: 'play' }, { phase: 3, name: 'التصنيف السريع', icon: 'play' }
  ];
})();
