/* مِسك الختام — قوالب المرحلة الثانية:
   المسابقة التلفزيونية، جد المطابق، أزواج الذاكرة، الترتيب، التصنيف في مجموعات، البطاقات العشوائية،
   البلاطات المنقلبة، بطاقات المحادثة، الرسم المعنون، الكلمات المتقاطعة، البحث عن الكلمات */
(function () {
  var MK = window.MK, h = MK.h, ar = MK.toArabicDigits, U = MK.ui;
  var field = U.field, bindInput = U.bindInput, itemHead = U.itemHead, toggle = U.toggle;
  var T = function (s) { return MK.t(s); };
  var LET = ['أ', 'ب', 'ج', 'د', 'هـ', 'و'];

  MK.EN = MK.EN || {};
  Object.assign(MK.EN, {
    'المسابقة التلفزيونية': 'Gameshow Quiz', 'جد المطابق': 'Find the Match', 'أزواج الذاكرة': 'Matching Pairs', 'الترتيب': 'Rank Order',
    'التصنيف في مجموعات': 'Group Sort', 'البطاقات العشوائية': 'Random Cards', 'البلاطات المنقلبة': 'Flip Tiles', 'بطاقات المحادثة': 'Speaking Cards',
    'الرسم المعنون': 'Labelled Diagram', 'الكلمات المتقاطعة': 'Crossword', 'البحث عن الكلمات': 'Wordsearch',
    'حذف إجابتين': '50:50', 'اسأل الصف': 'Ask the class', 'وقت إضافي': 'Extra time', 'إجابة نهائية؟': 'Final answer?',
    'نعم': 'Yes', 'غيّر': 'Change', 'رأي الصف': 'Class poll', 'اختر المطابق لـ:': 'Find the match for:', 'المحاولات: ': 'Attempts: ',
    'الأزواج: ': 'Pairs: ', 'رتّب العناصر ثم اضغط تحقّق': 'Put the items in order, then press Check', 'القائمة ': 'List ',
    'اسحب كل بطاقة إلى مجموعتها': 'Drag each card to its group', 'بقي: ': 'Left: ', 'اختر بطاقة': 'Pick a card', 'أعد الخلط': 'Reshuffle',
    'انتهت البطاقات': 'No more cards', 'اضغط أي بلاطة لقلبها': 'Tap any tile to flip it', 'بطاقة جديدة': 'New card', 'ابدأ الحديث': 'Start talking',
    'تبقّى في الرزمة: ': 'Left in the deck: ', 'ضع كل تسمية في مكانها': 'Put each label in its place', 'أفقي': 'Across', 'عمودي': 'Down',
    'أظهر الكلمة': 'Reveal word', 'لوحة الحروف': 'Letters', 'امسح الحرف': 'Delete', 'وجدت: ': 'Found: ', 'الوقت: ': 'Time: ',
    'اضغط خانة أو تعريفًا ثم اكتب': 'Tap a square or a clue, then type', 'اسحب على الحروف لتحديد الكلمة': 'Drag across the letters to select a word',
    'أعد': 'Reset', 'تحقّق': 'Check', 'تلميح': 'Hint', 'التالية': 'Next', 'السؤال ': 'Question ', ' من ': ' of ', 'النتيجة': 'Results'
  });

  // ====== أدوات مشتركة ======
  function linesOf(s) { return String(s || '').split(/\n+/).map(function (x) { return x.trim(); }).filter(Boolean); }
  function listEditor(obj, key, label, hint, rows) {
    var t = h('textarea', { rows: rows || 6 });
    t.value = (obj[key] || []).join('\n');
    t.addEventListener('input', function () { obj[key] = linesOf(t.value); });
    return field(label, t, hint);
  }
  function pairsEditor(c, la, lb, addLabel, min) {
    var box = h('div');
    function draw() {
      MK.clear(box);
      c.pairs.forEach(function (p, i) {
        box.appendChild(h('div', { class: 'item-box' },
          itemHead(i + 1, c.pairs.length > (min || 2) ? function () { c.pairs.splice(i, 1); draw(); } : null, 'زوج'),
          h('div', { class: 'two-col' }, field(la, bindInput(h('input', { type: 'text' }), p, 'a')), field(lb, bindInput(h('input', { type: 'text' }), p, 'b')))));
      });
      box.appendChild(h('button', { type: 'button', class: 'btn ghost', onclick: function () { c.pairs.push({ a: '', b: '' }); draw(); } }, MK.icon('plus'), addLabel || 'أضف زوجًا'));
    }
    draw();
    return box;
  }
  function validPairs(c, min, needB) {
    var ps = c.pairs.filter(function (p) { return p.a.trim(); });
    if (ps.length < min) return 'أضف ' + ar(min) + ' أزواج على الأقل.';
    for (var i = 0; i < c.pairs.length; i++) {
      var p = c.pairs[i];
      if (!p.a.trim() && !p.b.trim()) continue;
      if (!p.a.trim() || (needB !== false && !p.b.trim())) return 'الزوج ' + ar(i + 1) + ' ناقص.';
    }
    return null;
  }
  function chunk(arr, n) { var out = []; for (var i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n)); return out; }
  function btn(label, icon, onclick, cls) { return h('button', { type: 'button', class: 'btn big ' + (cls || ''), onclick: onclick }, icon ? MK.icon(icon) : null, label); }
  function shake(el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
  function finishLater(ctx, r, ms) { setTimeout(function () { ctx.setProgress(1); ctx.end(r); }, ms || 900); }

  // ====== ١) المسابقة التلفزيونية ======
  var show = {
    id: 'show', name: 'المسابقة التلفزيونية', icon: 'tv', teamsOk: true, timerOk: true,
    desc: 'أسئلة بأجواء برامج المسابقات: سلّم أسئلة ووسائل مساعدة وتشويق قبل كشف الإجابة.',
    blank: function () { return { questions: [{ q: '', options: ['', '', '', ''], correct: 0 }], shuffleQ: false, shuffleOpts: true, lifelines: true }; },
    edit: function (c, rerender) { return MK.templates.quiz.edit(c, rerender); },
    options: function (c) { return [toggle('اخلط ترتيب الأسئلة', c, 'shuffleQ'), toggle('اخلط ترتيب الخيارات', c, 'shuffleOpts'), toggle('الوسائل المساعدة (حذف إجابتين، اسأل الصف، وقت إضافي)', c, 'lifelines')]; },
    validate: function (c) { return MK.templates.quiz.validate(c); },
    play: function (ctx) {
      var c = ctx.act.content, sec = +ctx.act.settings.timer || 0;
      var qs = c.questions.map(function (q) {
        var o = q.options.map(function (t, i) { return { t: t, ok: i === q.correct }; }).filter(function (x) { return x.t.trim(); });
        return { q: q.q, explain: q.explain, opts: c.shuffleOpts ? MK.shuffle(o) : o };
      });
      if (c.shuffleQ) qs = MK.shuffle(qs);
      var idx = 0, good = 0, tm = { stop: function () { } }, used = {}, res = [];
      var wrap = h('div', { class: 'gs' }), ladder = h('ol', { class: 'gs-ladder' }), main = h('div', { class: 'gs-main' });
      wrap.appendChild(main); wrap.appendChild(ladder);
      function drawLadder() {
        MK.clear(ladder);
        qs.forEach(function (_, i) {
          ladder.appendChild(h('li', { class: (i === idx ? 'cur ' : '') + (res[i] === true ? 'ok' : res[i] === false ? 'no' : '') + ((i + 1) % 5 === 0 ? ' safe' : '') },
            h('span', null, ar(i + 1)), h('i', null, res[i] === true ? '✓' : res[i] === false ? '✗' : '')));
        });
      }
      function showQ() {
        tm.stop();
        var q = qs[idx], body = MK.clear(ctx.body); MK.clear(ctx.foot); MK.clear(main);
        body.appendChild(wrap); drawLadder(); ctx.setProgress(idx / qs.length);
        var locked = false, sel = -1, tries = 0; ctx.mark();
        tm = MK.startTimer(ctx, sec, function () { reveal(-1); });
        var lifes = h('div', { class: 'gs-life' });
        if (c.lifelines !== false) {
          [['fifty', T('حذف إجابتين'), '50:50'], ['poll', T('اسأل الصف'), '👥'], ['time', T('وقت إضافي'), '+30']].forEach(function (L) {
            var b = h('button', { type: 'button', class: 'gs-lb', disabled: !!used[L[0]], title: L[1], 'aria-label': L[1] }, h('b', null, L[2]), h('span', null, L[1]));
            b.onclick = function () { if (locked || used[L[0]]) return; used[L[0]] = true; b.disabled = true; life(L[0]); };
            lifes.appendChild(b);
          });
        }
        main.appendChild(h('div', { class: 'gs-top' }, h('div', { class: 'q-count' }, T('السؤال ') + ar(idx + 1) + T(' من ') + ar(qs.length)), lifes, tm.el));
        main.appendChild(h('div', { class: 'gs-q' }, h('span', { class: 'gs-q-in' }, MK.rich(q.q))));
        var grid = h('div', { class: 'gs-opts' });
        var bs = q.opts.map(function (o, i) {
          var b = h('button', { type: 'button', class: 'gs-opt' }, h('span', { class: 'gs-l' }, MK.lang === 'en' ? 'ABCDEF'[i] : LET[i]), h('span', { class: 'gs-t' }, MK.rich(o.t)));
          b.onclick = function () { choose(i); };
          grid.appendChild(b); return b;
        });
        main.appendChild(grid);
        var poll = h('div', { class: 'gs-poll hidden' });
        var top0 = main.querySelector('.gs-top'); top0.insertBefore(poll, top0.children[1]);
        function choose(i) {
          if (locked || bs[i].disabled) return;
          sel = i; bs.forEach(function (b, k) { b.classList.toggle('sel', k === i); });
          MK.sound.click();
          MK.clear(ctx.foot).appendChild(h('div', { class: 'gs-final' }, h('span', null, T('إجابة نهائية؟')),
            btn(T('نعم'), 'check', function () { reveal(sel); }), btn(T('غيّر'), null, function () { sel = -1; bs.forEach(function (b) { b.classList.remove('sel'); }); MK.clear(ctx.foot); }, 'ghost')));
        }
        function life(k) {
          MK.sound.reveal();
          if (k === 'fifty') {
            var wrong = bs.map(function (b, i) { return i; }).filter(function (i) { return !q.opts[i].ok; });
            MK.shuffle(wrong).slice(0, Math.max(1, wrong.length - 1)).slice(0, 2).forEach(function (i) { bs[i].disabled = true; bs[i].classList.add('gone'); });
          } else if (k === 'poll') {
            var n = q.opts.length, ci = q.opts.findIndex(function (o) { return o.ok; }), v = [], rest = 100;
            var cv = 45 + Math.floor(Math.random() * 30); v[ci] = cv; rest -= cv;
            for (var i = 0; i < n; i++) if (i !== ci) { var x = i === n - 1 || (i === n - 2 && ci === n - 1) ? rest : Math.floor(Math.random() * rest * 0.7); v[i] = x; rest -= x; }
            MK.clear(poll); poll.classList.remove('hidden');
            poll.appendChild(h('div', { class: 'gs-poll-h' }, T('رأي الصف')));
            poll.appendChild(h('div', { class: 'gs-bars' }, v.map(function (p, i) {
              var bar = h('i'); setTimeout(function () { bar.style.height = p + '%'; }, 50);
              return h('div', { class: 'gs-bar' + (bs[i].disabled ? ' off' : '') }, h('em', null, p + '%'), h('span', { class: 'gs-bar-col' }, bar), h('b', null, MK.lang === 'en' ? 'ABCDEF'[i] : LET[i]));
            })));
          } else if (k === 'time') {
            tm.stop(); tm = MK.startTimer(ctx, (sec || 0) + 30, function () { reveal(-1); });
            var old = main.querySelector('.timer'); if (old && tm.el) old.replaceWith(tm.el); else if (tm.el) main.querySelector('.gs-top').appendChild(tm.el);
          }
        }
        function reveal(i) {
          if (locked) return;
          var ci0 = q.opts.findIndex(function (o) { return o.ok; });
          var left0 = bs.filter(function (b) { return !b.disabled; }).length;
          if (i >= 0 && i !== ci0 && tries === 0 && left0 > 2) { // محاولة ثانية بنصف الدرجة
            tries = 1; bs[i].disabled = true; bs[i].classList.remove('sel'); bs[i].classList.add('wrong'); sel = -1;
            MK.sound.wrong(); ctx.mascot('sad'); MK.clear(ctx.foot); MK.toast(T('حاول مرة أخرى'));
            return;
          }
          locked = true; tm.stop(); MK.clear(ctx.foot);
          bs.forEach(function (b) { b.disabled = true; });
          // تشويق قبل الكشف
          var beats = 0, dr = setInterval(function () { MK.sound.tick(); if (++beats > 5) clearInterval(dr); }, 220);
          setTimeout(function () {
            var ci = q.opts.findIndex(function (o) { return o.ok; });
            bs[ci].classList.add('right');
            var right = i === ci;
            if (i >= 0 && !right) bs[i].classList.add('wrong');
            res[idx] = right; drawLadder();
            if (right) { good++; MK.sound.correct(); ctx.right(tries + 1); ctx.mascot('cheer'); }
            else { ctx.wrong(); MK.sound.wrong(); ctx.mascot('sad'); if (q.explain && q.explain.trim()) main.appendChild(MK.explainBox(q.explain)); }
            MK.nextBtn(ctx, idx === qs.length - 1, T('السؤال التالي'), function () { idx++; showQ(); }, function () { return { correct: good, total: qs.length }; });
          }, 1500);
        }
      }
      showQ();
      return function () { tm.stop(); };
    }
  };

  // ====== ٢) جد المطابق ======
  var find = {
    id: 'find', name: 'جد المطابق', icon: 'search', teamsOk: false, timerOk: false,
    desc: 'تظهر عبارة، فيضغط الطالب ما يطابقها من بين البلاطات حتى تختفي كلها.',
    blank: function () { return { pairs: [{ a: '', b: '' }, { a: '', b: '' }, { a: '', b: '' }], shuffle: true }; },
    edit: function (c) { return pairsEditor(c, 'العبارة (تظهر في الأعلى)', 'ما يطابقها (بلاطة)'); },
    options: function (c) { return [toggle('اخلط الترتيب', c, 'shuffle'), h('div', { class: 'hint' }, 'تُعرض البلاطات في جولات، اثنتا عشرة في كل جولة.')]; },
    validate: function (c) { return validPairs(c, 3); },
    play: function (ctx) {
      var c = ctx.act.content, ps = c.pairs.filter(function (p) { return p.a.trim() && p.b.trim(); });
      if (c.shuffle) ps = MK.shuffle(ps);
      var rounds = chunk(ps, 12), r = 0, good = 0, doneN = 0;
      function round() {
        var set = rounds[r], left = MK.shuffle(set), body = MK.clear(ctx.body); MK.clear(ctx.foot);
        var prompt = h('div', { class: 'fd-prompt' }), grid = h('div', { class: 'fd-grid' + (set.length > 8 ? ' many' : '') });
        body.appendChild(h('div', { class: 'fd-label' }, T('اختر المطابق لـ:')));
        body.appendChild(prompt); body.appendChild(grid);
        var tiles = MK.shuffle(set).map(function (p, i) {
          var b = h('button', { type: 'button', class: 'fd-tile c' + (i % 4) }, MK.rich(p.b));
          b._p = p; b.onclick = function () { pick(b); }; grid.appendChild(b); return b;
        });
        var cur, miss;
        function next() {
          if (!left.length) { r++; if (r < rounds.length) setTimeout(round, 700); else finishLater(ctx, { correct: good, total: ps.length }); return; }
          cur = left.shift(); miss = 0; ctx.mark();
          MK.clear(prompt).appendChild(h('span', { class: 'pop-in' }, MK.rich(cur.a)));
        }
        function pick(b) {
          if (!cur || b.classList.contains('gone')) return;
          if (b._p === cur) {
            b.classList.add('gone'); doneN++; ctx.setProgress(doneN / ps.length);
            if (miss < 2) { good++; ctx.right(miss + 1); } else ctx.wrong();
            MK.sound.correct(); ctx.mascot('cheer'); cur = null; setTimeout(next, 450);
          } else { miss++; MK.sound.wrong(); shake(b); b.classList.add('no'); setTimeout(function () { b.classList.remove('no'); }, 700); }
        }
        next();
      }
      round();
      return function () { };
    }
  };

  // ====== ٣) أزواج الذاكرة ======
  var memory = {
    id: 'memory', name: 'أزواج الذاكرة', icon: 'grid', teamsOk: true, timerOk: false,
    desc: 'بطاقات مقلوبة، يكشف الطالب بطاقتين في كل مرة ليجد الزوجين المتطابقين.',
    blank: function () { return { pairs: [{ a: '', b: '' }, { a: '', b: '' }, { a: '', b: '' }, { a: '', b: '' }] }; },
    edit: function (c) { return h('div', null, h('div', { class: 'hint', style: { marginBottom: '8px' } }, 'اترك الخانة الثانية فارغة إن أردت بطاقتين متطابقتين تمامًا.'), pairsEditor(c, 'البطاقة الأولى', 'البطاقة الثانية (اختياري)')); },
    options: function () { return [h('div', { class: 'hint' }, 'تُعرض عشرة أزواج على الأكثر في كل جولة. في اللعب الجماعي يتغيّر الفريق عند الخطأ.')]; },
    validate: function (c) { return validPairs(c, 3, false); },
    play: function (ctx) {
      var ps = MK.shuffle(ctx.act.content.pairs.filter(function (p) { return p.a.trim(); }));
      var rounds = chunk(ps, 10), r = 0, attempts = 0, found = 0;
      function round() {
        var set = rounds[r], body = MK.clear(ctx.body); MK.clear(ctx.foot);
        var cards = [];
        set.forEach(function (p, k) { cards.push({ k: k, t: p.a }); cards.push({ k: k, t: (p.b || '').trim() || p.a }); });
        cards = MK.shuffle(cards);
        var n = cards.length, cols = n <= 8 ? 4 : n <= 12 ? 4 : n <= 16 ? 4 : 5;
        var info = h('div', { class: 'mm-info' });
        var grid = h('div', { class: 'mm-grid', style: { gridTemplateColumns: 'repeat(' + cols + ',minmax(0,1fr))' } });
        body.appendChild(info); body.appendChild(grid);
        var open = [], busy = false, left = set.length;
        function drawInfo() { info.textContent = T('الأزواج: ') + ar(found) + T(' من ') + ar(ps.length) + '   •   ' + T('المحاولات: ') + ar(attempts); }
        drawInfo();
        cards.forEach(function (cd, i) {
          var b = h('button', { type: 'button', class: 'mm-card', 'aria-label': 'بطاقة ' + (i + 1) },
            h('span', { class: 'mm-in' }, h('span', { class: 'mm-back' }, h('i', null, ar(i + 1))), h('span', { class: 'mm-front' }, MK.rich(cd.t))));
          b.onclick = function () {
            if (busy || b.classList.contains('up')) return;
            b.classList.add('up'); MK.sound.flip(); open.push({ b: b, cd: cd });
            if (open.length === 2) {
              attempts++; busy = true;
              var A = open[0], B = open[1]; open = [];
              if (A.cd.k === B.cd.k) {
                setTimeout(function () {
                  A.b.classList.add('done'); B.b.classList.add('done'); found++; left--; MK.sound.correct(); ctx.addPoints(10); ctx.mascot('cheer');
                  ctx.setProgress(found / ps.length); drawInfo(); busy = false;
                  if (!left) { r++; if (r < rounds.length) setTimeout(round, 900); else finishLater(ctx, { correct: found, total: Math.max(attempts, found) }); }
                }, 450);
              } else {
                setTimeout(function () { MK.sound.wrong(); A.b.classList.add('miss'); B.b.classList.add('miss'); }, 500);
                setTimeout(function () { A.b.classList.remove('up', 'miss'); B.b.classList.remove('up', 'miss'); busy = false; ctx.nextTurn(); drawInfo(); }, 1400);
              }
            }
          };
          grid.appendChild(b);
        });
      }
      round();
      return function () { };
    }
  };

  // ====== ٤) الترتيب ======
  var order = {
    id: 'order', name: 'الترتيب', icon: 'order', teamsOk: true, timerOk: false,
    desc: 'يسحب الطالب العناصر لترتيبها الترتيب الصحيح: خطوات، مراحل، أحداث.',
    blank: function () { return { lists: [{ q: '', items: [] }], shuffle: false }; },
    edit: function (c, rerender) {
      var box = h('div');
      c.lists.forEach(function (L, i) {
        box.appendChild(h('div', { class: 'item-box' },
          itemHead(i + 1, c.lists.length > 1 ? function () { c.lists.splice(i, 1); rerender(); } : null, 'قائمة'),
          field('التعليمة', bindInput(h('input', { type: 'text', placeholder: 'مثال: رتّب خطوات الوضوء' }), L, 'q')),
          listEditor(L, 'items', 'العناصر بترتيبها الصحيح (عنصر في كل سطر)', 'تخلطها الأداة عند العرض.', 5)));
      });
      box.appendChild(h('button', { type: 'button', class: 'btn ghost', onclick: function () { c.lists.push({ q: '', items: [] }); rerender(); } }, MK.icon('plus'), 'أضف قائمة'));
      return box;
    },
    options: function (c) { return [toggle('اخلط ترتيب القوائم', c, 'shuffle')]; },
    validate: function (c) {
      for (var i = 0; i < c.lists.length; i++) if ((c.lists[i].items || []).length < 3) return 'القائمة ' + ar(i + 1) + ' تحتاج ثلاثة عناصر على الأقل.';
      return null;
    },
    play: function (ctx) {
      var c = ctx.act.content, lists = c.shuffle ? MK.shuffle(c.lists) : c.lists.slice(), li = 0, good = 0;
      function showL() {
        var L = lists[li], want = L.items.slice(), cur = want.map(function (t, i) { return i; });
        do { cur = MK.shuffle(cur); } while (cur.every(function (v, i) { return v === i; }));
        var locked = want.map(function () { return false; }), checks = 0, sel = -1; ctx.mark();
        var body = MK.clear(ctx.body); MK.clear(ctx.foot); ctx.setProgress(li / lists.length);
        body.appendChild(h('div', { class: 'q-count', style: { textAlign: 'center' } }, lists.length > 1 ? T('القائمة ') + ar(li + 1) + T(' من ') + ar(lists.length) : ''));
        body.appendChild(h('div', { class: 'ord-q' }, MK.rich(L.q || T('رتّب العناصر ثم اضغط تحقّق'))));
        var list = h('div', { class: 'ord-list' });
        body.appendChild(list);
        function draw() {
          MK.clear(list);
          cur.forEach(function (wi, pos) {
            var row = h('div', { class: 'ord-row' + (locked[pos] ? ' ok' : '') + (sel === pos ? ' sel' : ''), 'data-pos': pos },
              h('span', { class: 'ord-n' }, ar(pos + 1)),
              h('button', { type: 'button', class: 'chip ord-chip' }, MK.rich(want[wi])));
            var ch = row.querySelector('.chip');
            MK.dragChip(ch, {
              targetSel: '.ord-row', canDrag: function () { return !locked[pos]; },
              onTap: function () { tap(pos); },
              onDrop: function (t) { if (t) move(pos, +t.dataset.pos); else draw(); }
            });
            list.appendChild(row);
          });
        }
        function move(a, b) {
          if (a === b || locked[b]) { draw(); return; }
          var x = cur[a]; cur[a] = cur[b]; cur[b] = x; sel = -1; MK.sound.drop();
          list.querySelectorAll('.ord-row').forEach(function (r) { r.classList.remove('no'); });
          draw();
        }
        function tap(p) { if (locked[p]) return; if (sel < 0) { sel = p; draw(); } else if (sel === p) { sel = -1; draw(); } else move(sel, p); }
        draw();
        var checkB = btn(T('تحقّق'), 'check', function () {
          var all = true;
          cur.forEach(function (wi, pos) { if (wi === pos) locked[pos] = true; else all = false; });
          draw();
          list.querySelectorAll('.ord-row').forEach(function (r, pos) { if (!locked[pos]) { r.classList.add('no'); shake(r); } });
          checks++;
          if (all) {
            if (checks <= 2) { good++; ctx.right(checks, { n: want.length }); } else ctx.wrong();
            MK.sound.correct(); ctx.mascot('cheer');
            MK.nextBtn(ctx, li === lists.length - 1, T('التالية'), function () { li++; showL(); }, function () { return { correct: good, total: lists.length }; });
          } else { MK.sound.wrong(); ctx.mascot('sad'); ctx.nextTurn(); }
        });
        ctx.foot.appendChild(checkB);
      }
      showL();
      return function () { };
    }
  };

  // ====== ٥) التصنيف في مجموعات ======
  var group = {
    id: 'group', name: 'التصنيف في مجموعات', icon: 'folder', teamsOk: false, timerOk: false,
    desc: 'يسحب الطالب كل بطاقة إلى مجموعتها الصحيحة.',
    blank: function () { return { groups: [{ name: '', items: [] }, { name: '', items: [] }] }; },
    edit: function (c, rerender) {
      var box = h('div', { class: 'grp-edit' });
      c.groups.forEach(function (g, i) {
        box.appendChild(h('div', { class: 'item-box' },
          itemHead(i + 1, c.groups.length > 2 ? function () { c.groups.splice(i, 1); rerender(); } : null, 'مجموعة'),
          field('اسم المجموعة', bindInput(h('input', { type: 'text' }), g, 'name')),
          listEditor(g, 'items', 'عناصرها (عنصر في كل سطر)', null, 4)));
      });
      if (c.groups.length < 4) box.appendChild(h('button', { type: 'button', class: 'btn ghost', onclick: function () { c.groups.push({ name: '', items: [] }); rerender(); } }, MK.icon('plus'), 'أضف مجموعة'));
      return box;
    },
    options: function () { return [h('div', { class: 'hint' }, 'من مجموعتين إلى أربع مجموعات.')]; },
    validate: function (c) {
      for (var i = 0; i < c.groups.length; i++) {
        if (!c.groups[i].name.trim()) return 'المجموعة ' + ar(i + 1) + ' بلا اسم.';
        if (!(c.groups[i].items || []).length) return 'المجموعة ' + ar(i + 1) + ' بلا عناصر.';
      }
      return null;
    },
    play: function (ctx) {
      var gs = ctx.act.content.groups, items = [];
      gs.forEach(function (g, gi) { g.items.forEach(function (t) { items.push({ t: t, g: gi, miss: false }); }); });
      items = MK.shuffle(items);
      var total = items.length, placed = 0, good = 0, sel = null; ctx.mark();
      var body = MK.clear(ctx.body); MK.clear(ctx.foot);
      var info = h('div', { class: 'q-count', style: { textAlign: 'center' } });
      var pool = h('div', { class: 'grp-pool pool' });
      var cols = h('div', { class: 'grp-cols', style: { gridTemplateColumns: 'repeat(' + gs.length + ',minmax(0,1fr))' } });
      var colEls = gs.map(function (g, gi) {
        var list = h('div', { class: 'grp-list' });
        var col = h('div', { class: 'grp-col g' + gi, 'data-g': gi }, h('div', { class: 'grp-h' }, MK.rich(g.name)), list);
        col._list = list;
        col.addEventListener('click', function (e) { if (sel && !e.target.closest('.chip')) drop(sel, gi); });
        cols.appendChild(col); return col;
      });
      body.appendChild(h('div', { class: 'hint', style: { textAlign: 'center', color: 'var(--muted)' } }, T('اسحب كل بطاقة إلى مجموعتها')));
      body.appendChild(pool); body.appendChild(info); body.appendChild(cols);
      function drawInfo() { info.textContent = T('بقي: ') + ar(total - placed); }
      items.forEach(function (it, k) {
        var el = h('button', { type: 'button', class: 'chip c' + (k % 4) }, MK.rich(it.t));
        it.el = el; pool.appendChild(el);
        MK.dragChip(el, {
          targetSel: '.grp-col', canDrag: function () { return !it.done; },
          onTap: function () { if (it.done) return; if (sel) sel.el.classList.remove('sel'); sel = sel === it ? null : it; if (sel) el.classList.add('sel'); },
          onDrop: function (col) { if (col) drop(it, +col.dataset.g); }
        });
      });
      drawInfo();
      function drop(it, gi) {
        if (it.done) return;
        if (sel) { sel.el.classList.remove('sel'); sel = null; }
        if (it.g === gi) {
          it.done = true; placed++; colEls[gi]._list.appendChild(it.el); it.el.classList.add('ok');
          var m = it.miss || 0; if (m < 2) { good++; ctx.right(m + 1, { n: 1 }); } else ctx.wrong(); ctx.mark();
          MK.sound.correct(); ctx.setProgress(placed / total); drawInfo();
          if (placed === total) finishLater(ctx, { correct: good, total: total });
        } else { it.miss = (it.miss || 0) + 1; MK.sound.wrong(); shake(it.el); it.el.classList.add('no'); setTimeout(function () { it.el.classList.remove('no'); }, 700); shake(colEls[gi]); }
      }
      return function () { };
    }
  };

  // ====== ٦) البطاقات العشوائية ======
  var randcards = {
    id: 'randcards', name: 'البطاقات العشوائية', icon: 'cards', noScore: true, teamsOk: false, timerOk: false,
    desc: 'بطاقات مقلوبة أمام الصف، يختار الطالب واحدة فتنقلب وتظهر كبيرة.',
    blank: function () { return { items: [], remove: true }; },
    edit: function (c) { return listEditor(c, 'items', 'البطاقات (بطاقة في كل سطر)', 'أسئلة، مواقف، كلمات للنقاش… تُخلط عند العرض.', 10); },
    options: function (c) { return [toggle('أبعد البطاقة بعد ظهورها', c, 'remove')]; },
    validate: function (c) { return (c.items || []).length < 2 ? 'أضف بطاقتين على الأقل.' : null; },
    play: function (ctx) {
      var c = ctx.act.content, deck, shown = 0;
      function deal() {
        deck = MK.shuffle(c.items.map(function (t, i) { return { t: t, i: i }; })); shown = 0;
        var body = MK.clear(ctx.body); MK.clear(ctx.foot);
        body.appendChild(h('div', { class: 'hint', style: { textAlign: 'center', color: 'var(--muted)', fontSize: '20px' } }, T('اختر بطاقة')));
        var spread = h('div', { class: 'rc-spread' + (deck.length > 12 ? ' many' : '') });
        body.appendChild(spread);
        deck.forEach(function (d, k) {
          var b = h('button', { type: 'button', class: 'rc-card', style: { '--r': ((k % 5) - 2) * 2.5 + 'deg' }, 'aria-label': 'بطاقة ' + (k + 1) }, h('span', { class: 'rc-mark' }, '✦'), h('i', null, ar(k + 1)));
          b.onclick = function () { if (!b.classList.contains('used')) open(d, b); };
          spread.appendChild(b);
        });
        ctx.foot.appendChild(btn(T('أعد الخلط'), 'shuffle', function () { MK.sound.flip(); deal(); }, 'ghost'));
      }
      function open(d, b) {
        MK.sound.flip();
        var over = h('div', { class: 'reveal-bg rc-over' });
        var card = h('div', { class: 'rc-big' }, h('div', { class: 'rc-big-in' }, MK.rich(d.t)));
        over.appendChild(card);
        over.addEventListener('click', function () {
          over.remove(); shown++; ctx.setProgress(shown / deck.length);
          if (c.remove !== false) b.classList.add('used'); else b.classList.add('seen');
          if (c.remove !== false && shown >= deck.length) { MK.toast(T('انتهت البطاقات')); }
        });
        ctx.body.appendChild(over);
      }
      deal();
      return function () { };
    }
  };

  // ====== ٧) البلاطات المنقلبة ======
  var tiles = {
    id: 'tiles', name: 'البلاطات المنقلبة', icon: 'copy', noScore: true, teamsOk: false, timerOk: false,
    desc: 'بلاطات بوجهين: يضغط الطالب بلاطة فتكبر وتنقلب لتكشف وجهها الآخر.',
    blank: function () { return { cards: [{ front: '', back: '' }, { front: '', back: '' }, { front: '', back: '' }] }; },
    edit: function (c, rerender) {
      var box = h('div');
      c.cards.forEach(function (cd, i) {
        box.appendChild(h('div', { class: 'item-box' },
          itemHead(i + 1, c.cards.length > 2 ? function () { c.cards.splice(i, 1); rerender(); } : null, 'بلاطة'),
          h('div', { class: 'two-col' }, field('الوجه الظاهر', bindInput(h('textarea', { rows: 2 }), cd, 'front')), field('الوجه المخفي', bindInput(h('textarea', { rows: 2 }), cd, 'back')))));
      });
      box.appendChild(h('button', { type: 'button', class: 'btn ghost', onclick: function () { c.cards.push({ front: '', back: '' }); rerender(); } }, MK.icon('plus'), 'أضف بلاطة'));
      return box;
    },
    options: function () { return []; },
    validate: function (c) {
      for (var i = 0; i < c.cards.length; i++) if (!c.cards[i].front.trim() || !c.cards[i].back.trim()) return 'البلاطة ' + ar(i + 1) + ' ناقصة.';
      return null;
    },
    play: function (ctx) {
      var cards = ctx.act.content.cards, seen = 0;
      var body = MK.clear(ctx.body); MK.clear(ctx.foot);
      body.appendChild(h('div', { class: 'hint', style: { textAlign: 'center', color: 'var(--muted)', fontSize: '20px' } }, T('اضغط أي بلاطة لقلبها')));
      var n = cards.length, cols = n <= 4 ? 2 : n <= 9 ? 3 : 4;
      var grid = h('div', { class: 'tl-grid', style: { gridTemplateColumns: 'repeat(' + cols + ',minmax(0,1fr))' } });
      body.appendChild(grid);
      cards.forEach(function (cd, i) {
        var b = h('button', { type: 'button', class: 'tl-tile c' + (i % 4) }, MK.rich(cd.front));
        b.onclick = function () {
          MK.sound.flip();
          var inner = h('div', { class: 'tl-in' }, h('div', { class: 'tl-face f' }, MK.rich(cd.front)), h('div', { class: 'tl-face b' }, MK.rich(cd.back)));
          var big = h('div', { class: 'tl-big c' + (i % 4) }, inner);
          var over = h('div', { class: 'reveal-bg tl-over' }, big);
          ctx.body.appendChild(over);
          setTimeout(function () { big.classList.add('flipped'); }, 260);
          over.addEventListener('click', function () {
            if (!big.classList.contains('flipped')) { big.classList.add('flipped'); return; }
            over.remove();
            if (!b.classList.contains('seen')) { b.classList.add('seen'); seen++; ctx.setProgress(seen / cards.length); }
          });
        };
        grid.appendChild(b);
      });
      return function () { };
    }
  };

  // ====== ٨) بطاقات المحادثة ======
  var talk = {
    id: 'talk', name: 'بطاقات المحادثة', icon: 'chat', noScore: true, teamsOk: false, timerOk: false,
    desc: 'رزمة أسئلة مفتوحة تُسحب منها بطاقة لبدء النقاش، مع مؤقّت للحديث.',
    blank: function () { return { items: [], talkTime: 60 }; },
    edit: function (c) { return listEditor(c, 'items', 'الأسئلة أو المواقف (سؤال في كل سطر)', 'مثال: كيف تجدّد نيتك قبل المذاكرة؟', 10); },
    options: function (c) {
      return [h('div', { class: 'field' }, h('label', null, 'وقت الحديث لكل بطاقة'),
        MK.choice([0, 30, 60, 90, 120].map(function (s) { return { value: s, label: s ? String(s) : 'بلا' }; }), +c.talkTime || 0, function (v) { c.talkTime = v; }, { label: 'وقت الحديث' }))];
    },
    validate: function (c) { return (c.items || []).length < 2 ? 'أضف بطاقتين على الأقل.' : null; },
    play: function (ctx) {
      var c = ctx.act.content, deck = MK.shuffle(c.items.slice()), i = -1, tm = { stop: function () { } };
      var body = MK.clear(ctx.body); MK.clear(ctx.foot);
      var stack = h('div', { class: 'tk-stack' }), stage = h('div', { class: 'tk-stage' }), left = h('div', { class: 'q-count' });
      body.appendChild(h('div', { class: 'tk-wrap' }, h('div', { class: 'tk-deck' }, stack, left), stage));
      function drawStack() {
        MK.clear(stack);
        for (var k = 0; k < Math.min(5, deck.length - i - 1); k++) stack.appendChild(h('span', { class: 'tk-back', style: { transform: 'translate(' + (k * 3) + 'px,' + (-k * 3) + 'px) rotate(' + (k % 2 ? 2 : -2) + 'deg)' } }, '✦'));
        left.textContent = T('تبقّى في الرزمة: ') + ar(Math.max(0, deck.length - i - 1));
      }
      var timerBox = h('div', { class: 'tk-timer' });
      function next() {
        tm.stop(); MK.clear(timerBox);
        if (i >= deck.length - 1) { deck = MK.shuffle(deck); i = -1; }
        i++; MK.sound.flip(); ctx.setProgress((i + 1) / deck.length);
        var card = h('div', { class: 'tk-card c' + (i % 4) }, h('span', { class: 'tk-q' }, '؟'), h('div', { class: 'tk-text' }, MK.rich(deck[i])));
        MK.clear(stage).appendChild(card); stage.appendChild(timerBox);
        if (+c.talkTime) timerBox.appendChild(h('button', { type: 'button', class: 'btn soft', onclick: function () { this.remove(); tm = MK.startTimer(ctx, +c.talkTime, function () { }); if (tm.el) timerBox.appendChild(tm.el); } }, MK.icon('play'), T('ابدأ الحديث')));
        drawStack();
      }
      stack.addEventListener('click', next);
      ctx.foot.appendChild(btn(T('بطاقة جديدة'), 'cards', next));
      drawStack(); next();
      return function () { tm.stop(); };
    }
  };

  // ====== ٩) الرسم المعنون ======
  function loadImage(file, cb) {
    var rd = new FileReader();
    rd.onload = function () {
      var img = new Image();
      img.onload = function () {
        var max = 1400, w = img.width, hh = img.height, s = Math.min(1, max / Math.max(w, hh));
        var cv = document.createElement('canvas'); cv.width = Math.round(w * s); cv.height = Math.round(hh * s);
        var g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(img, 0, 0, cv.width, cv.height);
        cb(cv.toDataURL('image/jpeg', 0.86));
      };
      img.src = rd.result;
    };
    rd.readAsDataURL(file);
  }
  var diagram = {
    id: 'diagram', name: 'الرسم المعنون', icon: 'image', teamsOk: false, timerOk: false,
    desc: 'صورة أو رسم، يسحب الطالب التسميات إلى أماكنها الصحيحة.',
    blank: function () { return { image: '', labels: [] }; },
    edit: function (c, rerender) {
      var box = h('div'), moving = -1;
      var placed = function (L) { return L.x != null && L.y != null; };
      var fileIn = h('input', { type: 'file', accept: 'image/*', class: 'hidden' });
      fileIn.addEventListener('change', function () { var f = fileIn.files[0]; if (f) loadImage(f, function (d) { c.image = d; rerender(); }); });
      box.appendChild(h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' } },
        h('button', { type: 'button', class: 'btn soft', onclick: function () { fileIn.click(); } }, MK.icon('upload'), c.image ? 'غيّر الصورة' : 'ارفع صورة أو رسمًا'), fileIn,
        h('button', { type: 'button', class: 'btn ghost', onclick: function () { c.labels.push({ text: '', x: null, y: null }); rerender(); setTimeout(function () { var ins = document.querySelectorAll('.dg-lab input'); if (ins.length) ins[ins.length - 1].focus(); }, 30); } }, MK.icon('plus'), 'أضف تسمية')));
      var nextUn = c.labels.findIndex(function (L) { return !placed(L); });
      var hint = h('div', { class: 'dg-guide' });
      if (!c.image) hint.textContent = c.labels.length ? 'ارفع الصورة، ثم ضع كل تسمية في مكانها بنقرة.' : 'ارفع صورة، ثم اضغط عليها في كل مكان تريد وضع تسمية فيه. ويمكنك كتابة التسميات أولًا.';
      else if (moving >= 0) hint.textContent = 'اضغط مكان: ' + (c.labels[moving].text || 'التسمية ' + (moving + 1));
      else if (nextUn >= 0) { hint.appendChild(document.createTextNode('اضغط على الصورة مكان: ')); hint.appendChild(h('b', null, c.labels[nextUn].text || 'التسمية ' + (nextUn + 1))); hint.classList.add('go'); }
      else hint.textContent = 'اضغط على الصورة لإضافة تسمية جديدة في ذلك المكان.';
      box.appendChild(hint);
      if (c.image) {
        var pic = h('div', { class: 'dg-pic edit' }, h('img', { src: c.image, alt: '' }));
        c.labels.forEach(function (L, i) { if (placed(L)) pic.appendChild(h('span', { class: 'dg-dot', style: { left: L.x + '%', top: L.y + '%' } }, ar(i + 1))); });
        pic.addEventListener('click', function (e) {
          var r = pic.getBoundingClientRect(), x = +((e.clientX - r.left) / r.width * 100).toFixed(1), y = +((e.clientY - r.top) / r.height * 100).toFixed(1);
          var add = false;
          if (moving >= 0) { c.labels[moving].x = x; c.labels[moving].y = y; moving = -1; }
          else if (nextUn >= 0) { c.labels[nextUn].x = x; c.labels[nextUn].y = y; }
          else { c.labels.push({ text: '', x: x, y: y }); add = true; }
          MK.sound.drop(); rerender();
          if (add) setTimeout(function () { var ins = document.querySelectorAll('.dg-lab input'); if (ins.length) ins[ins.length - 1].focus(); }, 30);
        });
        box.appendChild(pic);
      }
      var list = h('div', { class: 'dg-labs' });
      c.labels.forEach(function (L, i) {
        list.appendChild(h('div', { class: 'dg-lab' + (placed(L) ? '' : ' un') + (i === nextUn && c.image && moving < 0 ? ' now' : '') }, h('span', { class: 'num' }, ar(i + 1)), bindInput(h('input', { type: 'text', placeholder: 'التسمية' }), L, 'text'),
          c.image ? h('button', { type: 'button', class: 'btn small ghost', onclick: function () { moving = i; rerender(); } }, placed(L) ? 'انقل' : 'ضعها') : null,
          h('button', { type: 'button', class: 'mini-x', 'aria-label': 'حذف', onclick: function () { c.labels.splice(i, 1); rerender(); } }, MK.icon('trash'))));
      });
      box.appendChild(list);
      return box;
    },
    options: function () { return [h('div', { class: 'hint' }, 'الصورة تُحفظ داخل ملف النشاط نفسه.')]; },
    validate: function (c) {
      if (!c.image) return 'ارفع صورة أولًا.';
      if (c.labels.length < 2) return 'أضف تسميتين على الأقل.';
      for (var i = 0; i < c.labels.length; i++) if (!c.labels[i].text.trim()) return 'التسمية ' + ar(i + 1) + ' فارغة.';
      for (i = 0; i < c.labels.length; i++) if (c.labels[i].x == null) return 'التسمية «' + c.labels[i].text + '» لم يُحدَّد مكانها على الصورة.';
      return null;
    },
    play: function (ctx) {
      var c = ctx.act.content, body = MK.clear(ctx.body); MK.clear(ctx.foot);
      var pic = h('div', { class: 'dg-pic play' }, h('img', { src: c.image, alt: '' }));
      var pool = h('div', { class: 'pool dg-pool' });
      body.appendChild(h('div', { class: 'hint', style: { textAlign: 'center', color: 'var(--muted)' } }, T('ضع كل تسمية في مكانها')));
      body.appendChild(h('div', { class: 'dg-wrap' }, pic, pool));
      var slots = c.labels.map(function (L, i) {
        var side = L.x > 60 ? ' l' : '';
        var s = h('div', { class: 'dg-slot' + side, style: { left: L.x + '%', top: L.y + '%' } });
        pic.appendChild(h('span', { class: 'dg-dot', style: { left: L.x + '%', top: L.y + '%' } }, ar(i + 1)));
        pic.appendChild(s);
        return { el: s, want: L.text };
      });
      var pl = MK.placer({ slots: slots, bank: c.labels.map(function (L) { return { text: L.text }; }), poolEl: pool, chipClass: 'dg-chip' });
      var checks = 0, good = 0, okPrev = 0; ctx.mark();
      ctx.foot.appendChild(btn(T('تحقّق'), 'check', function () {
        var r = pl.check(); if (!r) return;
        var nw = r.okCount - okPrev; okPrev = r.okCount;
        for (var k = 0; k < nw; k++) { if (checks === 0) ctx.right(1, { n: slots.length }); else if (checks === 1) ctx.right(2); else ctx.wrong(); }
        if (checks === 0) good = r.okCount; else if (checks === 1) good += nw;
        checks++;
        ctx.setProgress(r.okCount / slots.length);
        if (r.all) { MK.sound.correct(); ctx.mascot('cheer'); finishLater(ctx, { correct: good, total: slots.length }, 1100); }
        else MK.sound.wrong();
      }));
      return function () { };
    }
  };

  // ====== أدوات الحروف (المتقاطعة والبحث) ======
  var AR_ALPHA = 'ابتثجحخدذرزسشصضطظعغفقكلمنهوية'.split('');
  var EN_ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  function letters(w) {
    return Array.from(String(w || '').replace(/[ً-ٰٟـ‌‍]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/[^\p{L}]/gu, '').toUpperCase());
  }
  function sameL(a, b) { var n = function (x) { return x.replace(/[أإآٱ]/g, 'ا').replace('ى', 'ي').replace('ة', 'ه').toUpperCase(); }; return n(a) === n(b); }
  function isEn(act) { return act.lang === 'en'; }

  // ====== ١٠) الكلمات المتقاطعة ======
  function buildCross(words) {
    var best = null;
    for (var att = 0; att < 60; att++) {
      var ord = words.slice().sort(function (a, b) { return b.L.length - a.L.length; });
      if (att) { var f = ord.shift(); ord = [f].concat(MK.shuffle(ord)); if (att % 3 === 0) ord = MK.shuffle(ord); }
      var cells = {}, placed = [];
      var put = function (w, r, c, d) {
        var dr = d === 'd' ? 1 : 0, dc = d === 'a' ? 1 : 0;
        w.L.forEach(function (ch, k) { var key = (r + dr * k) + ',' + (c + dc * k); if (!cells[key]) cells[key] = { ch: ch, d: {} }; cells[key].d[d] = 1; });
        placed.push({ w: w, r: r, c: c, d: d });
      };
      var fits = function (w, r, c, d) {
        var dr = d === 'd' ? 1 : 0, dc = d === 'a' ? 1 : 0, cross = 0;
        var before = cells[(r - dr) + ',' + (c - dc)], after = cells[(r + dr * w.L.length) + ',' + (c + dc * w.L.length)];
        if (before || after) return -1;
        for (var k = 0; k < w.L.length; k++) {
          var rr = r + dr * k, cc = c + dc * k, cell = cells[rr + ',' + cc];
          if (cell) { if (cell.ch !== w.L[k] || cell.d[d]) return -1; cross++; }
          else {
            var n1 = cells[(rr + dc) + ',' + (cc + dr)], n2 = cells[(rr - dc) + ',' + (cc - dr)];
            if (n1 || n2) return -1;
          }
        }
        return cross;
      };
      put(ord[0], 0, 0, 'a');
      for (var i = 1; i < ord.length; i++) {
        var w = ord[i], cand = null;
        placed.forEach(function (p) {
          p.w.L.forEach(function (ch, pi) {
            w.L.forEach(function (ch2, wi) {
              if (ch !== ch2) return;
              var d = p.d === 'a' ? 'd' : 'a';
              var r = p.d === 'a' ? p.r - wi : p.r + pi, c = p.d === 'a' ? p.c + pi : p.c - wi;
              var x = fits(w, r, c, d);
              if (x > 0) { var sc = x * 10 - Math.abs(r) - Math.abs(c) + Math.random(); if (!cand || sc > cand.sc) cand = { r: r, c: c, d: d, sc: sc }; }
            });
          });
        });
        if (cand) put(w, cand.r, cand.c, cand.d);
      }
      var rs = [], cs = []; Object.keys(cells).forEach(function (k) { var p = k.split(','); rs.push(+p[0]); cs.push(+p[1]); });
      var area = (Math.max.apply(null, rs) - Math.min.apply(null, rs) + 1) * (Math.max.apply(null, cs) - Math.min.apply(null, cs) + 1);
      var score = placed.length * 1000 - area;
      if (!best || score > best.score) best = { score: score, placed: placed, minR: Math.min.apply(null, rs), minC: Math.min.apply(null, cs), rows: Math.max.apply(null, rs) - Math.min.apply(null, rs) + 1, cols: Math.max.apply(null, cs) - Math.min.apply(null, cs) + 1 };
      if (best.placed.length === words.length && att > 20) break;
    }
    best.placed.forEach(function (p) { p.r -= best.minR; p.c -= best.minC; });
    var starts = {}, n = 0;
    best.placed.slice().sort(function (a, b) { return a.r - b.r || a.c - b.c; }).forEach(function (p) { var k = p.r + ',' + p.c; if (!starts[k]) starts[k] = ++n; p.n = starts[k]; });
    best.starts = starts;
    return best;
  }
  var crossword = {
    id: 'crossword', name: 'الكلمات المتقاطعة', icon: 'grid', teamsOk: false, timerOk: false,
    desc: 'شبكة كلمات تُحلّ من التعريفات، تُبنى تلقائيًا من كلماتك.',
    blank: function () { return { pairs: [{ a: '', b: '' }, { a: '', b: '' }, { a: '', b: '' }, { a: '', b: '' }] }; },
    edit: function (c) { return h('div', null, h('div', { class: 'hint', style: { marginBottom: '8px' } }, 'تُبنى الشبكة تلقائيًا. الكلمات التي لا تتقاطع مع غيرها تُستبعد، فاختر كلمات تشترك في حروف.'), pairsEditor(c, 'التعريف أو التلميح', 'الكلمة (بلا مسافات)', 'أضف كلمة', 3)); },
    options: function () { return [h('div', { class: 'hint' }, 'تُتجاهل الحركات والهمزات عند التحقق.')]; },
    validate: function (c) {
      var e = validPairs(c, 3); if (e) return e;
      for (var i = 0; i < c.pairs.length; i++) if (c.pairs[i].b.trim() && letters(c.pairs[i].b).length < 2) return 'الكلمة ' + ar(i + 1) + ' قصيرة جدًا.';
      return null;
    },
    play: function (ctx) {
      var en = isEn(ctx.act), words = ctx.act.content.pairs.filter(function (p) { return p.a.trim() && p.b.trim(); }).map(function (p) { return { clue: p.a, L: letters(p.b), raw: p.b }; });
      var X = buildCross(words), W = X.placed, cell = {}, solved = 0, good = 0, cur = null, pos = 0;
      W.forEach(function (p, wi) {
        p.solved = false; p.revealed = false; p.cells = [];
        p.w.L.forEach(function (ch, k) { var r = p.d === 'd' ? p.r + k : p.r, c = p.d === 'a' ? p.c + k : p.c, key = r + ',' + c; if (!cell[key]) cell[key] = { ch: ch, words: [], v: '' }; cell[key].words.push(wi); p.cells.push(key); });
      });
      var body = MK.clear(ctx.body); MK.clear(ctx.foot);
      var grid = h('div', { class: 'cw-grid', style: { gridTemplateColumns: 'repeat(' + X.cols + ',var(--cw))', gridTemplateRows: 'repeat(' + X.rows + ',var(--cw))', '--cw': 'min(' + Math.floor(56) + 'px,' + (60 / Math.max(X.cols, X.rows)).toFixed(2) + 'vh)', '--cwn': Math.max(X.cols, X.rows) } });
      var keyIn = h('input', { type: 'text', class: 'cw-key', 'aria-label': 'اكتب الحرف', autocomplete: 'off', autocapitalize: 'characters' });
      var clueA = h('ol', { class: 'cw-clues' }), clueD = h('ol', { class: 'cw-clues' });
      var cueEl = h('div', { class: 'cw-cur' }, T('اضغط خانة أو تعريفًا ثم اكتب'));
      body.appendChild(h('div', { class: 'cw-wrap' }, h('div', { class: 'cw-left' }, cueEl, grid, keyIn), h('div', { class: 'cw-side' }, h('h4', null, T('أفقي')), clueA, h('h4', null, T('عمودي')), clueD)));
      var els = {};
      Object.keys(cell).forEach(function (key) {
        var p = key.split(','), r = +p[0], c = +p[1], n = X.starts[key];
        var el = h('div', { class: 'cw-cell', style: { gridRow: r + 1, gridColumn: c + 1 } }, n ? h('sup', null, ar(n)) : null, h('span'));
        el.addEventListener('pointerdown', function (e) { e.preventDefault(); selectCell(key); });
        els[key] = el; grid.appendChild(el);
      });
      W.slice().sort(function (a, b) { return a.n - b.n; }).forEach(function (p) {
        var li = h('li', { value: p.n }, h('b', null, ar(p.n) + '. '), MK.rich(p.w.clue), h('em', null, ' (' + ar(p.w.L.length) + ')'));
        li.addEventListener('click', function () { select(W.indexOf(p), 0); });
        p.li = li; (p.d === 'a' ? clueA : clueD).appendChild(li);
      });
      function selectCell(key) {
        var ws = cell[key].words, wi = ws[0];
        if (cur != null && ws.length > 1 && ws.indexOf(cur) >= 0 && W[cur].cells[pos] === key) wi = ws[(ws.indexOf(cur) + 1) % ws.length];
        else if (cur != null && ws.indexOf(cur) >= 0) wi = cur;
        select(wi, W[wi].cells.indexOf(key));
      }
      function select(wi, p) {
        cur = wi; pos = p; draw();
        cueEl.textContent = ''; cueEl.appendChild(h('b', null, ar(W[wi].n) + ' ' + (W[wi].d === 'a' ? T('أفقي') : T('عمودي')) + ': ')); cueEl.appendChild(MK.rich(W[wi].w.clue));
        keyIn.focus({ preventScroll: true });
      }
      function draw() {
        Object.keys(els).forEach(function (k) {
          var e = els[k], cc = cell[k];
          e.lastChild.textContent = cc.v;
          e.classList.toggle('in', cur != null && W[cur].cells.indexOf(k) >= 0);
          e.classList.toggle('at', cur != null && W[cur].cells[pos] === k);
          e.classList.toggle('ok', cc.words.some(function (wi) { return W[wi].solved; }));
          e.classList.toggle('rv', cc.words.some(function (wi) { return W[wi].revealed; }));
        });
        W.forEach(function (p, i) { p.li.classList.toggle('cur', i === cur); p.li.classList.toggle('done', p.solved || p.revealed); });
      }
      function typeCh(ch) {
        if (cur == null) return;
        var key = W[cur].cells[pos];
        if (W[cur].cells.length && cell[key].words.some(function (wi) { return W[wi].solved || W[wi].revealed; }) && cell[key].v) { if (pos < W[cur].cells.length - 1) { pos++; draw(); typeCh(ch); } return; }
        cell[key].v = ch; MK.sound.click();
        if (pos < W[cur].cells.length - 1) pos++;
        els[key].classList.remove('no'); draw();
      }
      function back() {
        if (cur == null) return;
        var key = W[cur].cells[pos];
        if (cell[key].v && !lockedCell(key)) cell[key].v = ''; else if (pos > 0) { pos--; key = W[cur].cells[pos]; if (!lockedCell(key)) cell[key].v = ''; }
        draw();
      }
      function lockedCell(key) { return cell[key].words.some(function (wi) { return W[wi].solved || W[wi].revealed; }); }
      keyIn.addEventListener('input', function () {
        var v = keyIn.value; keyIn.value = '';
        letters(v).forEach(typeCh);
      });
      keyIn.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace') { e.preventDefault(); back(); }
        else if (e.key === 'Enter') { e.preventDefault(); check(); }
      });
      function check() {
        var newly = 0, anyWrong = false;
        W.forEach(function (p) {
          if (p.solved || p.revealed) return;
          var full = p.cells.every(function (k) { return cell[k].v; });
          if (!full) return;
          var ok = p.cells.every(function (k, i) { return sameL(cell[k].v, p.w.L[i]); });
          if (ok) { p.solved = true; newly++; solved++; var fl = p.fails || 0; if (fl < 2) { good++; ctx.right(fl + 1, { noSpeed: true }); } else ctx.wrong(); }
          else { anyWrong = true; p.fails = (p.fails || 0) + 1; p.cells.forEach(function (k, i) { if (!sameL(cell[k].v, p.w.L[i])) { els[k].classList.add('no'); shake(els[k]); } }); }
        });
        draw();
        if (newly) { MK.sound.correct(); ctx.mascot('cheer'); } else if (anyWrong) MK.sound.wrong(); else MK.toast(T('اضغط خانة أو تعريفًا ثم اكتب'));
        progress();
      }
      function reveal() {
        if (cur == null || W[cur].solved || W[cur].revealed) return;
        var p = W[cur]; p.revealed = true; solved++; ctx.wrong();
        p.cells.forEach(function (k, i) { cell[k].v = p.w.L[i]; });
        MK.sound.reveal(); draw(); progress();
      }
      function progress() {
        ctx.setProgress(solved / W.length);
        if (solved === W.length) finishLater(ctx, { correct: good, total: W.length }, 1200);
      }
      // لوحة الحروف على الشاشة (للسبورة الذكية)
      var pad = h('div', { class: 'cw-pad hidden', dir: en ? 'ltr' : 'rtl' });
      (en ? EN_ALPHA : AR_ALPHA.concat(['ة', 'ى', 'ء', 'ؤ', 'ئ'])).forEach(function (ch) {
        pad.appendChild(h('button', { type: 'button', class: 'cw-k', onpointerdown: function (e) { e.preventDefault(); typeCh(ch); } }, ch));
      });
      pad.appendChild(h('button', { type: 'button', class: 'cw-k wide', onpointerdown: function (e) { e.preventDefault(); back(); } }, '⌫'));
      body.querySelector('.cw-left').appendChild(pad);
      ctx.foot.appendChild(btn(T('تحقّق'), 'check', check));
      ctx.foot.appendChild(btn(T('أظهر الكلمة'), 'eye', reveal, 'ghost'));
      ctx.foot.appendChild(btn(T('لوحة الحروف'), 'grid', function () { pad.classList.toggle('hidden'); body.querySelector('.cw-left').classList.toggle('pad-on', !pad.classList.contains('hidden')); }, 'soft'));
      if (W.length < words.length) MK.toast('استُبعدت ' + ar(words.length - W.length) + ' كلمات لم تتقاطع مع غيرها');
      draw();
      return function () { };
    }
  };

  // ====== ١١) البحث عن الكلمات ======
  function buildSearch(words, opt) {
    var maxL = Math.max.apply(null, words.map(function (w) { return w.L.length; }));
    var total = words.reduce(function (s, w) { return s + w.L.length; }, 0);
    var N = Math.min(16, Math.max(maxL + 1, Math.ceil(Math.sqrt(total * 2.3)), 8));
    var dirs = [[0, 1], [1, 0]];
    if (opt.diag) dirs.push([1, 1], [-1, 1]);
    if (opt.reverse) dirs = dirs.concat(dirs.map(function (d) { return [-d[0], -d[1]]; }));
    for (var tries = 0; tries < 30; tries++) {
      var g = [], placed = [], ok = true;
      for (var r = 0; r < N; r++) { g.push([]); for (var c = 0; c < N; c++) g[r].push(''); }
      var ord = words.slice().sort(function (a, b) { return b.L.length - a.L.length; });
      for (var i = 0; i < ord.length && ok; i++) {
        var w = ord[i], done = false;
        for (var t = 0; t < 400 && !done; t++) {
          var d = dirs[Math.floor(Math.random() * dirs.length)], r0 = Math.floor(Math.random() * N), c0 = Math.floor(Math.random() * N);
          var r1 = r0 + d[0] * (w.L.length - 1), c1 = c0 + d[1] * (w.L.length - 1);
          if (r1 < 0 || r1 >= N || c1 < 0 || c1 >= N) continue;
          var fit = true;
          for (var k = 0; k < w.L.length; k++) { var ch = g[r0 + d[0] * k][c0 + d[1] * k]; if (ch && ch !== w.L[k]) { fit = false; break; } }
          if (!fit) continue;
          for (k = 0; k < w.L.length; k++) g[r0 + d[0] * k][c0 + d[1] * k] = w.L[k];
          placed.push({ w: w, r: r0, c: c0, d: d }); done = true;
        }
        if (!done) ok = false;
      }
      if (ok) {
        var alpha = opt.en ? EN_ALPHA : AR_ALPHA;
        for (r = 0; r < N; r++) for (c = 0; c < N; c++) if (!g[r][c]) g[r][c] = alpha[Math.floor(Math.random() * alpha.length)];
        return { N: N, g: g, placed: placed };
      }
      if (tries % 6 === 5) N = Math.min(18, N + 1);
    }
    return null;
  }
  var wordsearch = {
    id: 'wordsearch', name: 'البحث عن الكلمات', icon: 'search', teamsOk: false, timerOk: false,
    desc: 'شبكة حروف يبحث فيها الطلاب عن كلمات الدرس ويحدّدونها بالسحب.',
    blank: function () { return { words: [], diag: false, reverse: false, showList: true }; },
    edit: function (c) { return listEditor(c, 'words', 'الكلمات (كلمة في كل سطر)', 'من 4 إلى 14 كلمة يناسب السبورة. تُحذف المسافات والحركات تلقائيًا.', 8); },
    options: function (c) { return [toggle('كلمات قطرية', c, 'diag'), toggle('كلمات معكوسة', c, 'reverse'), toggle('أظهر قائمة الكلمات', c, 'showList')]; },
    validate: function (c) {
      var w = (c.words || []).filter(function (x) { return letters(x).length >= 2; });
      if (w.length < 3) return 'أضف ثلاث كلمات على الأقل.';
      if (w.some(function (x) { return letters(x).length > 15; })) return 'إحدى الكلمات أطول من 15 حرفًا.';
      return null;
    },
    play: function (ctx) {
      var c = ctx.act.content, en = isEn(ctx.act);
      var words = c.words.map(function (x) { return { raw: x, L: letters(x) }; }).filter(function (w) { return w.L.length >= 2; });
      var S = buildSearch(words, { diag: c.diag, reverse: c.reverse, en: en });
      var body = MK.clear(ctx.body); MK.clear(ctx.foot);
      if (!S) { body.appendChild(h('div', { class: 'empty' }, 'تعذّر بناء الشبكة، قلّل عدد الكلمات أو أطوالها.')); return function () { }; }
      var found = 0, t0 = Date.now(), color = 0;
      var grid = h('div', { class: 'ws-grid', dir: en ? 'ltr' : 'rtl', style: { gridTemplateColumns: 'repeat(' + S.N + ',1fr)', '--n': S.N } });
      var list = h('ul', { class: 'ws-list' + (c.showList === false ? ' hidden' : '') });
      var info = h('div', { class: 'q-count' });
      body.appendChild(h('div', { class: 'ws-wrap' }, h('div', null, h('div', { class: 'hint', style: { textAlign: 'center', color: 'var(--muted)' } }, T('اسحب على الحروف لتحديد الكلمة')), grid), h('div', { class: 'ws-side' }, info, list)));
      var els = [];
      for (var r = 0; r < S.N; r++) { els.push([]); for (var cc = 0; cc < S.N; cc++) { var e = h('div', { class: 'ws-c', 'data-r': r, 'data-c': cc }, S.g[r][cc]); els[r].push(e); grid.appendChild(e); } }
      words.forEach(function (w) { w.li = h('li', null, MK.rich(w.raw)); list.appendChild(w.li); });
      function drawInfo() { info.textContent = T('وجدت: ') + ar(found) + T(' من ') + ar(words.length); }
      drawInfo();
      var tick = setInterval(function () { var s = Math.floor((Date.now() - t0) / 1000); info.dataset.t = T('الوقت: ') + Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }, 1000);
      var start = null, path = [];
      function cellAt(x, y) { var t = document.elementFromPoint(x, y); return t && t.classList && t.classList.contains('ws-c') ? t : null; }
      function line(a, b) {
        var r0 = +a.dataset.r, c0 = +a.dataset.c, r1 = +b.dataset.r, c1 = +b.dataset.c, dr = r1 - r0, dc = c1 - c0;
        var n = Math.max(Math.abs(dr), Math.abs(dc));
        if (n === 0) return [a];
        if (dr && dc && Math.abs(dr) !== Math.abs(dc)) { if (Math.abs(dr) > Math.abs(dc)) dc = 0; else dr = 0; n = Math.max(Math.abs(dr), Math.abs(dc)); }
        if ((dr && dc) && !c.diag) { if (Math.abs(dr) >= Math.abs(dc)) dc = 0; else dr = 0; n = Math.max(Math.abs(dr), Math.abs(dc)); }
        var sr = Math.sign(dr), sc = Math.sign(dc), out = [];
        for (var k = 0; k <= n; k++) out.push(els[r0 + sr * k][c0 + sc * k]);
        return out;
      }
      function paint() { grid.querySelectorAll('.ws-c.sel').forEach(function (x) { x.classList.remove('sel'); }); path.forEach(function (x) { x.classList.add('sel'); }); }
      grid.addEventListener('pointerdown', function (e) {
        var cEl = cellAt(e.clientX, e.clientY); if (!cEl) return;
        e.preventDefault(); start = cEl; path = [cEl]; paint();
        try { grid.setPointerCapture(e.pointerId); } catch (x) { }
      });
      grid.addEventListener('pointermove', function (e) { if (!start) return; var cEl = cellAt(e.clientX, e.clientY); if (cEl) { path = line(start, cEl); paint(); } });
      function up() {
        if (!start) return;
        var s = path.map(function (x) { return x.textContent; }).join(''), rv = s.split('').reverse().join('');
        var hit = words.filter(function (w) { return !w.found && (w.L.join('') === s || w.L.join('') === rv); })[0];
        if (hit && path.length > 1) {
          hit.found = true; found++; var col = 'f' + (color++ % 6);
          path.forEach(function (x) { x.classList.add('found', col); });
          hit.li.classList.add('done'); MK.sound.correct(); ctx.right(1, { noSpeed: true }); ctx.mascot('cheer'); ctx.setProgress(found / words.length); drawInfo();
          if (found === words.length) { clearInterval(tick); finishLater(ctx, { correct: found, total: words.length }, 1000); }
        } else if (path.length > 2) MK.sound.wrong();
        start = null; path = []; paint();
      }
      grid.addEventListener('pointerup', up); grid.addEventListener('pointercancel', up);
      ctx.foot.appendChild(btn(T('تلميح'), 'hint', function () {
        var w = words.filter(function (x) { return !x.found; })[0]; if (!w) return;
        var p = S.placed.filter(function (x) { return x.w === w; })[0], el = els[p.r][p.c];
        el.classList.add('hint-on'); MK.sound.reveal(); setTimeout(function () { el.classList.remove('hint-on'); }, 1800);
      }, 'ghost'));
      return function () { clearInterval(tick); };
    }
  };

  MK.ui3 = { pairsEditor: pairsEditor, validPairs: validPairs, listEditor: listEditor };
  Object.assign(MK.templates, { show: show, find: find, memory: memory, order: order, group: group, randcards: randcards, tiles: tiles, talk: talk, diagram: diagram, crossword: crossword, wordsearch: wordsearch });

  // ====== التحويل بين القوالب ======
  var P = MK.convP, NB = MK.convNeedsB;
  P.show = P.quiz;
  var pairs = function (key) { return { out: function (c) { return c.pairs.map(function (p) { return { a: p.a, b: p.b }; }); }, in: function (ps) { var o = {}; o[key] = ps.map(function (p) { return { a: p.a, b: p.b }; }); return o; } }; };
  P.find = { out: pairs('pairs').out, in: function (ps) { return ps.length < 3 ? null : { pairs: ps.map(function (p) { return { a: p.a, b: p.b }; }), shuffle: true }; } };
  P.memory = { out: pairs('pairs').out, in: function (ps) { return ps.length < 3 ? null : { pairs: ps.map(function (p) { return { a: p.a, b: p.b }; }) }; } };
  P.tiles = { out: function (c) { return c.cards.map(function (x) { return { a: x.front, b: x.back }; }); }, in: function (ps) { return { cards: ps.map(function (p) { return { front: p.a, back: p.b }; }) }; } };
  P.randcards = { out: function (c) { return c.items.map(function (x) { return { a: x, b: '' }; }); }, in: function (ps) { return { items: ps.map(function (p) { return p.a; }), remove: true }; } };
  P.talk = { out: P.randcards.out, in: function (ps) { return { items: ps.map(function (p) { return p.a; }), talkTime: 60 }; } };
  P.crossword = { out: function (c) { return c.pairs.map(function (p) { return { a: p.a, b: p.b }; }); }, in: function (ps) { ps = ps.filter(function (p) { var l = letters(p.b); return l.length >= 2 && l.length <= 12 && !/\s/.test(p.b.trim()); }); return ps.length < 3 ? null : { pairs: ps }; } };
  P.wordsearch = { out: function (c) { return c.words.map(function (w) { return { a: w, b: '' }; }); }, in: function (ps) { var w = ps.map(function (p) { return p.b && letters(p.b).length <= 12 && !/\s/.test(p.b.trim()) ? p.b : p.a; }).filter(function (x) { var l = letters(x); return l.length >= 2 && l.length <= 12; }); return w.length < 3 ? null : { words: w.slice(0, 14), diag: false, reverse: false, showList: true }; } };
  Object.assign(NB, { show: 1, find: 1, tiles: 1, crossword: 1 });

  // ====== الاستيراد باللصق ======
  if (MK.addImport) {
    var IP = MK.importParsers;
    MK.addImport('show', 'questions', 'الصيغة نفسها في قالب «الاختبار»: السؤال، ثم الخيارات، وضع * بعد الإجابة الصحيحة.', IP.quiz, function (it) { return it.q + ' ← ' + it.options[it.correct]; });
    var pairParse = function (key) {
      return function (txt) {
        var items = linesOf(txt).map(function (l) { var m = l.match(/^(.+?)\s*[:：\-–=]\s*(.+)$/); return m ? { a: m[1].trim(), b: m[2].trim() } : null; }).filter(Boolean);
        return { items: items, note: '' };
      };
    };
    var pd = function (it) { return it.a + ' ← ' + it.b; };
    MK.addImport('find', 'pairs', 'كل زوج في سطر: العبارة: ما يطابقها.', pairParse(), pd);
    MK.addImport('memory', 'pairs', 'كل زوج في سطر: البطاقة الأولى: البطاقة الثانية.', pairParse(), pd);
    MK.addImport('crossword', 'pairs', 'كل كلمة في سطر: التعريف: الكلمة.', pairParse(), pd);
    var lineParse = function (txt) { return { items: linesOf(txt), note: '' }; };
    MK.addImport('randcards', 'items', 'كل بطاقة في سطر.', lineParse, function (x) { return x; });
    MK.addImport('talk', 'items', 'كل سؤال في سطر.', lineParse, function (x) { return x; });
    MK.addImport('wordsearch', 'words', 'كل كلمة في سطر.', lineParse, function (x) { return x; });
    MK.addImport('tiles', 'cards', 'كل بلاطة في سطر: الوجه الظاهر: الوجه المخفي.', function (txt) { var r = pairParse()(txt); r.items = r.items.map(function (p) { return { front: p.a, back: p.b }; }); return r; }, function (it) { return it.front + ' ← ' + it.back; });
  }

  // ====== قائمة القوالب ======
  MK.catalog = MK.catalog.filter(function (x) { return x.phase !== 2; });
  var p2 = ['show', 'find', 'memory', 'order', 'group', 'randcards', 'tiles', 'talk', 'diagram', 'crossword', 'wordsearch'].map(function (id) { return { phase: 1, id: id }; });
  var at = MK.catalog.findIndex(function (x) { return x.phase === 3; });
  Array.prototype.splice.apply(MK.catalog, [at < 0 ? MK.catalog.length : at, 0].concat(p2));
})();
