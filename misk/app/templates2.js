/* مِسك الختام — قوالب الدفعة الثانية: صح أم خطأ، المطابقة، الكلمة المفقودة، العجلة، افتح الصندوق، البطاقات */
(function () {
  var MK = window.MK, h = MK.h, ar = MK.toArabicDigits, U = MK.ui;
  var field = U.field, bindInput = U.bindInput, itemHead = U.itemHead, toggle = U.toggle;

  // ====== أداة السحب المشتركة (لمس وفأرة) ======
  MK.dragChip = function (el, o) {
    var sx, sy, drag = false, ghost = null, pid = null, over = null;
    function targetAt(x, y) { var t = document.elementFromPoint(x, y); return t && t.closest ? t.closest(o.targetSel) : null; }
    el.addEventListener('pointerdown', function (e) {
      if (e.button > 0 || (o.canDrag && !o.canDrag())) return;
      sx = e.clientX; sy = e.clientY; drag = false; pid = e.pointerId;
      try { el.setPointerCapture(pid); } catch (x) { }
    });
    el.addEventListener('pointermove', function (e) {
      if (pid !== e.pointerId) return;
      if (!drag && Math.hypot(e.clientX - sx, e.clientY - sy) > 8) {
        drag = true; MK.sound.pick();
        var r = el.getBoundingClientRect();
        ghost = el.cloneNode(true); ghost.classList.add('drag'); ghost.classList.remove('sel');
        ghost.style.width = r.width + 'px'; ghost.style.left = r.left + 'px'; ghost.style.top = r.top + 'px';
        ghost._dx = sx - r.left; ghost._dy = sy - r.top;
        document.body.appendChild(ghost); el.classList.add('ghost');
      }
      if (drag) {
        ghost.style.left = (e.clientX - ghost._dx) + 'px'; ghost.style.top = (e.clientY - ghost._dy) + 'px';
        var s = targetAt(e.clientX, e.clientY);
        if (over && over !== s) over.classList.remove('over');
        over = s; if (s) s.classList.add('over');
      }
    });
    function end(e) {
      if (pid !== e.pointerId) return;
      pid = null;
      if (!drag) { if (e.type === 'pointerup' && o.onTap) o.onTap(); return; }
      drag = false;
      if (ghost) ghost.remove(); ghost = null; el.classList.remove('ghost');
      if (over) over.classList.remove('over'); over = null;
      o.onDrop(targetAt(e.clientX, e.clientY), document.elementFromPoint(e.clientX, e.clientY));
    }
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (o.onTap) o.onTap(); } });
  };

  // ====== محرّك «ضع القطع في خاناتها» المشترك بين المطابقة والكلمة المفقودة ======
  // slots: [{el, want}] ، bank: [{text}] ، poolEl: حاوية القطع
  function placer(cfg) {
    var chips = cfg.bank.map(function (b, i) { return { id: i, text: b.text, locked: false }; });
    var where = {}, slotChip = cfg.slots.map(function () { return null; }), selSlot = null, done = false;
    var chipEls = {};
    chips.forEach(function (ch, k) {
      where[ch.id] = 'pool';
      var el = h('button', { type: 'button', class: 'chip c' + (k % 4) + (cfg.chipClass ? ' ' + cfg.chipClass : '') }, MK.rich(ch.text));
      chipEls[ch.id] = el;
      MK.dragChip(el, {
        targetSel: '.dz', canDrag: function () { return !ch.locked && !done; },
        onTap: function () { tap(ch.id); },
        onDrop: function (dz, raw) {
          if (dz && dz.dataset.slot != null) moveTo(ch.id, +dz.dataset.slot);
          else if (raw && raw.closest && raw.closest('.pool')) moveTo(ch.id, 'pool');
          else layout();
        }
      });
    });
    cfg.slots.forEach(function (s, i) {
      s.el.classList.add('dz'); s.el.dataset.slot = i;
      s.el.addEventListener('click', function (e) {
        if (e.target.closest('.chip')) return;
        if (slotChip[i] != null || done) return;
        selSlot = selSlot === i ? null : i; drawSel();
      });
    });
    function drawSel() { cfg.slots.forEach(function (s, i) { s.el.classList.toggle('sel', selSlot === i); }); }
    function layout() {
      cfg.slots.forEach(function (s, i) {
        var id = slotChip[i];
        Array.prototype.slice.call(s.el.querySelectorAll('.chip')).forEach(function (c) { c.remove(); });
        s.el.classList.toggle('filled', id != null);
        if (id != null) s.el.appendChild(chipEls[id]);
      });
      MK.clear(cfg.poolEl);
      cfg.order.forEach(function (id) { if (where[id] === 'pool') cfg.poolEl.appendChild(chipEls[id]); });
      drawSel();
    }
    function clearMarks() { chips.forEach(function (ch) { if (!ch.locked) chipEls[ch.id].classList.remove('no', 'ok'); }); }
    function moveTo(id, target) {
      var ch = chips[id]; if (ch.locked || done) return;
      var from = where[id];
      if (target === from) { layout(); return; }
      if (target !== 'pool') {
        var occ = slotChip[target];
        if (occ != null && chips[occ].locked) { layout(); return; }
        if (occ != null) { if (from === 'pool') where[occ] = 'pool'; else { slotChip[from] = occ; where[occ] = from; } }
        else if (from !== 'pool') slotChip[from] = null;
        slotChip[target] = id; where[id] = target;
        if (selSlot === target) selSlot = null;
      } else { if (from !== 'pool') slotChip[from] = null; where[id] = 'pool'; }
      clearMarks(); layout(); MK.sound.drop();
    }
    function tap(id) {
      if (chips[id].locked || done) return;
      if (where[id] === 'pool') {
        var e = selSlot != null ? selSlot : slotChip.indexOf(null);
        if (e >= 0) moveTo(id, e);
      } else moveTo(id, 'pool');
    }
    function check() {
      if (slotChip.indexOf(null) >= 0) { MK.toast(MK.t('ضع قطعة في كل خانة أولًا')); return null; }
      var okCount = 0, newOk = 0;
      slotChip.forEach(function (id, i) {
        var ch = chips[id], ok = ch.text === cfg.slots[i].want;
        chipEls[id].classList.remove('ok', 'no'); void chipEls[id].offsetWidth;
        chipEls[id].classList.add(ok ? 'ok' : 'no');
        if (ok) { if (!ch.locked) newOk++; ch.locked = true; okCount++; }
      });
      var all = okCount === cfg.slots.length;
      if (all) done = true;
      else setTimeout(function () {
        slotChip.forEach(function (id, i) { if (id != null && !chips[id].locked) { slotChip[i] = null; where[id] = 'pool'; chipEls[id].classList.remove('no'); } });
        layout();
      }, 1200);
      return { all: all, newOk: newOk, okCount: okCount };
    }
    function hint() {
      for (var i = 0; i < cfg.slots.length; i++) { var c0 = slotChip[i]; if (c0 == null || !chips[c0].locked) break; }
      if (i >= cfg.slots.length) return false;
      var want = chips.filter(function (ch) { return !ch.locked && ch.text === cfg.slots[i].want; })[0];
      if (!want) return false;
      if (slotChip[i] != null && slotChip[i] !== want.id) { where[slotChip[i]] = 'pool'; slotChip[i] = null; }
      if (where[want.id] !== 'pool' && where[want.id] !== i) slotChip[where[want.id]] = null;
      slotChip[i] = want.id; where[want.id] = i; want.locked = true; chipEls[want.id].classList.add('ok');
      layout(); MK.sound.reveal();
      var all = cfg.slots.every(function (s, k) { return slotChip[k] != null && chips[slotChip[k]].locked; });
      if (all) done = true;
      return all;
    }
    cfg.order = MK.shuffle(chips.map(function (c) { return c.id; }));
    MK._placerLast = true;
    layout();
    return { check: check, hint: hint };
  }

  MK.placer = placer;
  function nextBtn(ctx, last, label, onNext, result) {
    MK.clear(ctx.foot);
    var b = h('button', {
      type: 'button', class: 'btn big', onclick: function () {
        ctx.nextTurn();
        if (last) { ctx.setProgress(1); ctx.end(result()); } else onNext();
      }
    }, last ? MK.t('النتيجة') : label, MK.icon(last ? 'check' : 'next'));
    ctx.foot.appendChild(b); b.focus();
  }
  MK.startTimer = startTimer; MK.nextBtn = nextBtn;
  function startTimer(ctx, sec, onEnd) {
    if (!sec) return { el: null, stop: function () { } };
    var el = h('div', { class: 'timer', role: 'timer', 'aria-label': 'الوقت المتبقي' }, h('span', null, ar(sec)));
    var left = sec, t = setInterval(function () {
      if (MK.paused) return;
      left--;
      if (left > 0 && left <= 5 && MK.sound.count) MK.sound.count();
      el.style.setProperty('--p', left / sec);
      el.firstChild.textContent = ar(Math.max(left, 0));
      if (left <= 5) el.classList.add('low');
      if (left > 0 && left <= 5) MK.sound.tick();
      if (left <= 0) { clearInterval(t); MK.sound.timeup(); onEnd(); }
    }, 1000);
    return { el: el, stop: function () { clearInterval(t); } };
  }

  // ====== ١) صح أم خطأ ======
  var tf = {
    id: 'tf', name: 'صح أم خطأ', icon: 'check', teamsOk: true, timerOk: true,
    desc: 'عبارات يحكم عليها الطلاب بسرعة: صحيحة أم خاطئة.',
    blank: function () { return { items: [{ text: '', answer: true }], shuffle: false }; },
    edit: function (c, rerender) {
      var box = h('div');
      c.items.forEach(function (it, i) {
        var sel = MK.choice([{ value: true, label: 'صحيحة ✓' }, { value: false, label: 'خاطئة ✗' }], it.answer === true || it.answer === false ? it.answer : null, function (v) { it.answer = v; }, { label: 'الحكم', cls: 'tf-choice' });
        box.appendChild(h('div', { class: 'item-box' },
          itemHead(i + 1, c.items.length > 1 ? function () { c.items.splice(i, 1); rerender(); } : null, 'عبارة'),
          field('نص العبارة', bindInput(h('textarea', { rows: 2 }), it, 'text')),
          field('الحكم الصحيح', sel),
          h('details', { class: 'explain-ed', open: it.explain ? true : null }, h('summary', null, 'التفسير (اختياري): يظهر للطلاب بعد الإجابة الخاطئة'),
            bindInput(h('textarea', { rows: 2, placeholder: 'لماذا كان الحكم كذلك؟' }), it, 'explain'))));
      });
      box.appendChild(h('button', { type: 'button', class: 'btn ghost', onclick: function () { c.items.push({ text: '', answer: true }); rerender(); } }, MK.icon('plus'), 'أضف عبارة'));
      return box;
    },
    options: function (c) { return [toggle('اخلط ترتيب العبارات', c, 'shuffle')]; },
    validate: function (c) {
      for (var i = 0; i < c.items.length; i++) if (!c.items[i].text.trim()) return 'العبارة ' + ar(i + 1) + ' فارغة.';
      return null;
    },
    play: function (ctx) {
      var c = ctx.act.content, items = c.shuffle ? MK.shuffle(c.items) : c.items.slice();
      var idx = 0, good = 0, tm = { stop: function () { } };
      function show() {
        tm.stop();
        var it = items[idx], body = MK.clear(ctx.body); MK.clear(ctx.foot);
        ctx.setProgress(idx / items.length);
        var done = false;
        tm = startTimer(ctx, +ctx.act.settings.timer || 0, function () { answer(null); });
        body.appendChild(h('div', { class: 'q-top' }, h('div', { class: 'q-count' }, MK.t('العبارة ') + ar(idx + 1) + MK.t(' من ') + ar(items.length)), tm.el));
        var card = h('div', { class: 'tf-card' }, MK.rich(it.text));
        body.appendChild(card);
        var bT = h('button', { type: 'button', class: 'tf-btn t' }, h('span', { class: 'mk' }, '✓'), MK.t('صح'));
        var bF = h('button', { type: 'button', class: 'tf-btn f' }, h('span', { class: 'mk' }, '✗'), MK.t('خطأ'));
        bT.onclick = function () { answer(true); }; bF.onclick = function () { answer(false); };
        body.appendChild(h('div', { class: 'tf-btns' }, bT, bF));
        function answer(v) {
          if (done) return; done = true; tm.stop();
          var right = v === it.answer;
          bT.disabled = bF.disabled = true;
          (it.answer ? bT : bF).classList.add('right');
          if (v !== null && !right) (v ? bT : bF).classList.add('wrong');
          card.classList.add(right ? 'ok' : 'no');
          card.appendChild(h('div', { class: 'tf-verdict' }, (MK.lang === 'en' ? 'This statement is ' : 'العبارة ') + (it.answer ? MK.t('صحيحة') : MK.t('خاطئة'))));
          if (right) { good++; MK.sound.correct(); ctx.addPoints(10); ctx.mascot('cheer'); }
          else { if (v !== null) MK.sound.wrong(); ctx.mascot('sad'); if (it.explain && it.explain.trim()) body.appendChild(MK.explainBox(it.explain)); }
          nextBtn(ctx, idx === items.length - 1, MK.t('العبارة التالية'), function () { idx++; show(); }, function () { return { correct: good, total: items.length }; });
        }
      }
      show();
      return function () { tm.stop(); };
    }
  };

  // ====== ٢) المطابقة ======
  // إذا لم يتسع المحتوى للشاشة (أسطر كثيرة أو عرض صغير) نصغّره درجة أو درجتين حتى لا يختفي بنك الكلمات
  function fitBody(body) {
    function over() { return body.scrollHeight > body.clientHeight + 2; }
    function run() {
      body.classList.remove('fit1', 'fit2');
      if (over()) { body.classList.add('fit1'); if (over()) { body.classList.remove('fit1'); body.classList.add('fit2'); } }
    }
    requestAnimationFrame(function () { requestAnimationFrame(run); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
    var onR = function () { if (!body.isConnected) return window.removeEventListener('resize', onR); run(); };
    window.addEventListener('resize', onR);
  }
  MK.fitBody = fitBody;
  var match = {
    id: 'match', name: 'المطابقة', icon: 'swap', teamsOk: true, timerOk: false,
    desc: 'يسحب الطالب كل تعريف إلى مصطلحه المناسب.',
    blank: function () { return { pairs: [{ a: '', b: '' }, { a: '', b: '' }, { a: '', b: '' }], shuffle: true }; },
    edit: function (c, rerender) {
      var box = h('div');
      c.pairs.forEach(function (p, i) {
        box.appendChild(h('div', { class: 'item-box' },
          itemHead(i + 1, c.pairs.length > 2 ? function () { c.pairs.splice(i, 1); rerender(); } : null, 'زوج'),
          h('div', { class: 'two-col' },
            field('المصطلح (العمود الثابت)', bindInput(h('input', { type: 'text' }), p, 'a')),
            field('ما يطابقه (يُسحب)', bindInput(h('input', { type: 'text' }), p, 'b')))));
      });
      box.appendChild(h('button', { type: 'button', class: 'btn ghost', onclick: function () { c.pairs.push({ a: '', b: '' }); rerender(); } }, MK.icon('plus'), 'أضف زوجًا'));
      return box;
    },
    options: function (c) { return [toggle('اخلط ترتيب المصطلحات', c, 'shuffle'), h('div', { class: 'hint' }, 'تُعرض الأزواج في جولات، ستة في كل جولة.')]; },
    validate: function (c) {
      if (c.pairs.length < 2) return 'أضف زوجين على الأقل.';
      for (var i = 0; i < c.pairs.length; i++) if (!c.pairs[i].a.trim() || !c.pairs[i].b.trim()) return 'الزوج ' + ar(i + 1) + ' ناقص.';
      return null;
    },
    play: function (ctx) {
      var c = ctx.act.content, all = c.shuffle ? MK.shuffle(c.pairs) : c.pairs.slice();
      var rounds = []; for (var i = 0; i < all.length; i += 6) rounds.push(all.slice(i, i + 6));
      if (rounds.length > 1 && rounds[rounds.length - 1].length === 1) { rounds[rounds.length - 2].push(rounds.pop()[0]); }
      var ri = 0, good = 0;
      function show() {
        var pairs = rounds[ri], body = MK.clear(ctx.body); MK.clear(ctx.foot);
        ctx.setProgress(ri / rounds.length);
        if (rounds.length > 1) body.appendChild(h('div', { class: 'q-count', style: { textAlign: 'center' } }, MK.t('الجولة ') + ar(ri + 1) + MK.t(' من ') + ar(rounds.length)));
        var grid = h('div', { class: 'match-grid' }), slots = [];
        pairs.forEach(function (p) {
          var dz = h('div', { class: 'mslot', 'aria-label': MK.t('خانة ') + p.a });
          slots.push({ el: dz, want: p.b });
          grid.appendChild(h('div', { class: 'mrow' }, h('div', { class: 'mterm' }, MK.rich(p.a)), dz));
        });
        var pool = h('div', { class: 'pool' });
        body.appendChild(grid); body.appendChild(pool);
        var pl = placer({ slots: slots, bank: pairs.map(function (p) { return { text: p.b }; }), poolEl: pool, chipClass: 'wide' });
        fitBody(body);
        var checkB = h('button', {
          type: 'button', class: 'btn big', onclick: function () {
            var r = pl.check(); if (!r) return;
            if (r.newOk) ctx.addPoints(r.newOk * 5);
            good += r.newOk;
            if (r.all) win(); else { MK.sound.wrong(); ctx.mascot('sad'); }
          }
        }, MK.icon('check'), MK.t('تحقّق'));
        ctx.foot.appendChild(checkB);
        ctx.foot.appendChild(h('button', { type: 'button', class: 'btn ghost big', onclick: function () { if (pl.hint()) win(); } }, MK.icon('hint'), MK.t('تلميح')));
        function win() {
          MK.sound.correct(); ctx.mascot('cheer'); grid.classList.add('flash-ok');
          nextBtn(ctx, ri === rounds.length - 1, MK.t('الجولة التالية'), function () { ri++; show(); }, function () { return { correct: good, total: all.length }; });
        }
      }
      show();
    }
  };

  // ====== ٣) الكلمة المفقودة ======
  function clozeParts(text) { return (text || '').split(/\[([^\]]+)\]/); } // زوجي: نص، فردي: إجابة
  var cloze = {
    id: 'cloze', name: 'الكلمة المفقودة', icon: 'edit', teamsOk: true, timerOk: false,
    desc: 'نص بفراغات، يسحب الطالب الكلمات المناسبة إليها.',
    blank: function () { return { texts: [{ text: '', extra: '' }] }; },
    edit: function (c, rerender) {
      var box = h('div');
      c.texts.forEach(function (t, i) {
        var prev = h('div', { class: 'hint' });
        var ta = bindInput(h('textarea', { rows: 4, placeholder: 'إنما الأعمال [بالنيات]، وإنما لكل امرئ [ما نوى]' }), t, 'text');
        function upd() { var n = (clozeParts(t.text).length - 1) / 2; prev.textContent = n ? 'عدد الفراغات: ' + ar(n) : 'ضع كل كلمة تريدها فراغًا بين قوسين مربعين [ ]'; }
        ta.addEventListener('input', upd); upd();
        box.appendChild(h('div', { class: 'item-box' },
          itemHead(i + 1, c.texts.length > 1 ? function () { c.texts.splice(i, 1); rerender(); } : null, 'نص'),
          field('النص', ta, 'اكتب النص وضع الكلمات المحذوفة بين [ ].'), prev,
          field('كلمات مشتِّتة (اختياري)', bindInput(h('input', { type: 'text', placeholder: 'بالأقوال، ما عمل' }), t, 'extra'), 'كلمات خاطئة تُضاف لبنك الكلمات، افصل بينها بفاصلة.')));
      });
      box.appendChild(h('button', { type: 'button', class: 'btn ghost', onclick: function () { c.texts.push({ text: '', extra: '' }); rerender(); } }, MK.icon('plus'), 'أضف نصًا'));
      return box;
    },
    validate: function (c) {
      for (var i = 0; i < c.texts.length; i++) if (clozeParts(c.texts[i].text).length < 3) return 'النص ' + ar(i + 1) + ' بلا فراغات. ضع الكلمات المحذوفة بين [ ].';
      return null;
    },
    play: function (ctx) {
      var texts = ctx.act.content.texts, ti = 0, good = 0, total = 0;
      texts.forEach(function (t) { total += (clozeParts(t.text).length - 1) / 2; });
      function show() {
        var t = texts[ti], parts = clozeParts(t.text), body = MK.clear(ctx.body); MK.clear(ctx.foot);
        ctx.setProgress(ti / texts.length);
        var para = h('div', { class: 'cloze-text' }), slots = [], bank = [];
        parts.forEach(function (p, k) {
          if (k % 2 === 0) { if (p) para.appendChild(MK.rich(p)); }
          else { var dz = h('span', { class: 'islot' }); slots.push({ el: dz, want: p.trim() }); bank.push({ text: p.trim() }); para.appendChild(dz); }
        });
        (t.extra || '').split(/[,،]/).map(function (s) { return s.trim(); }).filter(Boolean).forEach(function (x) { bank.push({ text: x }); });
        var pool = h('div', { class: 'pool' });
        body.appendChild(h('div', { class: 'scroll cloze-scroll' }, para));
        body.appendChild(h('div', { class: 'bank-label' }, MK.t('بنك الكلمات')));
        body.appendChild(pool);
        var pl = placer({ slots: slots, bank: bank, poolEl: pool });
        ctx.foot.appendChild(h('button', {
          type: 'button', class: 'btn big', onclick: function () {
            var r = pl.check(); if (!r) return;
            if (r.newOk) ctx.addPoints(r.newOk * 5);
            good += r.newOk;
            if (r.all) win(); else { MK.sound.wrong(); ctx.mascot('sad'); }
          }
        }, MK.icon('check'), MK.t('تحقّق')));
        ctx.foot.appendChild(h('button', { type: 'button', class: 'btn ghost big', onclick: function () { if (pl.hint()) win(); } }, MK.icon('hint'), MK.t('تلميح')));
        function win() {
          MK.sound.correct(); ctx.mascot('cheer');
          nextBtn(ctx, ti === texts.length - 1, MK.t('النص التالي'), function () { ti++; show(); }, function () { return { correct: good, total: total }; });
        }
      }
      show();
    }
  };

  // ====== ٤) العجلة الدوّارة ======
  var wheel = {
    id: 'wheel', name: 'العجلة الدوّارة', icon: 'redo', noScore: true, teamsOk: false, timerOk: false,
    desc: 'تدور العجلة فتختار سؤالًا أو طالبًا عشوائيًا.',
    blank: function () { return { items: ['', '', '', ''], remove: true }; },
    edit: function (c, rerender) {
      var box = h('div');
      var ta = h('textarea', { rows: 10, placeholder: 'اكتب كل عنصر في سطر: سؤال، أو اسم طالب، أو مهمة' });
      ta.value = c.items.filter(function (x) { return x !== ''; }).join('\n');
      var cnt = h('div', { class: 'hint' });
      function upd() { c.items = ta.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean); cnt.textContent = 'عدد العناصر: ' + ar(c.items.length); }
      ta.addEventListener('input', upd); upd();
      box.appendChild(field('عناصر العجلة (كل عنصر في سطر)', ta, 'تصلح للأسئلة، أو لأسماء الطلاب لاختيار من يجيب.'));
      box.appendChild(cnt);
      return box;
    },
    options: function (c) { return [toggle('احذف العنصر من العجلة بعد اختياره', c, 'remove')]; },
    validate: function (c) { return c.items.filter(Boolean).length < 2 ? 'أضف عنصرين على الأقل.' : null; },
    play: function (ctx) {
      var c = ctx.act.content, items = c.items.filter(Boolean).slice(), rot = 0, spinning = false, total = items.length;
      var svgWrap = h('div', { class: 'wheel-wrap' });
      var body = MK.clear(ctx.body);
      var result = h('div', { class: 'wheel-result', 'aria-live': 'polite' });
      body.appendChild(h('div', { class: 'wheel-stage' }, svgWrap, result));
      var spinBtn = h('button', { type: 'button', class: 'btn big', onclick: spin }, MK.icon('redo'), MK.t('أدر العجلة'));
      MK.clear(ctx.foot); ctx.foot.appendChild(spinBtn);
      // ألوان من متغيرات الثيم حتى تتغير مع تبديل الثيم أثناء اللعب
      var colors = ['var(--p1)', 'var(--p2)', 'var(--p3)', 'var(--primary-dark)', 'var(--accent)'];
      var g;
      function draw() {
        var n = items.length, R = 200, seg = 360 / n, s = '';
        items.forEach(function (it, i) {
          var a0 = (i * seg - 90) * Math.PI / 180, a1 = ((i + 1) * seg - 90) * Math.PI / 180;
          var x0 = 210 + R * Math.cos(a0), y0 = 210 + R * Math.sin(a0), x1 = 210 + R * Math.cos(a1), y1 = 210 + R * Math.sin(a1);
          var col = colors[i % colors.length]; if (n % colors.length === 1 && i === n - 1) col = colors[1];
          s += n === 1 ? '<circle cx="210" cy="210" r="200" style="fill:' + col + '"/>' :
            '<path d="M210 210 L' + x0 + ' ' + y0 + ' A' + R + ' ' + R + ' 0 ' + (seg > 180 ? 1 : 0) + ' 1 ' + x1 + ' ' + y1 + ' Z" style="fill:' + col + '" stroke="#fff" stroke-width="3"/>';
          var mid = i * seg + seg / 2, max = n > 12 ? 12 : 15, pl = MK.plain(it), label = pl.length > max ? pl.slice(0, max - 1) + '…' : pl;
          var fs = n > 16 ? 12 : (n > 10 ? 13 : 15);
          // النصف الأيسر يُقلب حتى لا يظهر النص مقلوبًا
          var left = mid > 180;
          s += left
            ? '<text transform="rotate(' + (mid + 90) + ' 210 210) translate(30 ' + (210 + fs / 3) + ')" text-anchor="end" direction="rtl" font-size="' + fs + '" font-weight="800" fill="#fff" font-family="Cairo">' + esc(label) + '</text>'
            : '<text transform="rotate(' + (mid - 90) + ' 210 210) translate(390 ' + (210 + fs / 3) + ')" text-anchor="start" direction="rtl" font-size="' + fs + '" font-weight="800" fill="#fff" font-family="Cairo">' + esc(label) + '</text>';
        });
        s += '<circle cx="210" cy="210" r="34" fill="var(--surface)" stroke="var(--gold)" stroke-width="6"/>';
        svgWrap.innerHTML = '<svg viewBox="0 0 420 420" class="wheel-svg" role="img" aria-label="العجلة"><g class="wheel-g" style="transform-origin:210px 210px;transform:rotate(' + rot + 'deg)">' + s + '</g></svg><div class="wheel-pointer" aria-hidden="true"></div>';
        g = svgWrap.querySelector('.wheel-g');
      }
      function esc(t) { return String(t).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); }
      function spin() {
        if (spinning || !items.length) return;
        spinning = true; spinBtn.disabled = true; MK.clear(result);
        var n = items.length, seg = 360 / n, pick = Math.floor(Math.random() * n);
        var target = 360 - (pick * seg + seg * (0.2 + Math.random() * 0.6));
        var start = rot, end = start + 360 * 6 + ((target - start % 360) + 360) % 360, D = 4600;
        g.style.transition = 'transform ' + D + 'ms cubic-bezier(.12,.75,.12,1)';
        g.style.transform = 'rotate(' + end + 'deg)';
        // أصوات التكتكة عند عبور كل قطاع
        var last = Math.floor(start / seg);
        for (var k = 1; k <= 160; k++) {
          var t = k / 160, e = 1 - Math.pow(1 - t, 3.2), ang = start + (end - start) * e, cur = Math.floor(ang / seg);
          if (cur !== last) { last = cur; setTimeout(MK.sound.tick, t * D); }
        }
        setTimeout(function () {
          rot = end; spinning = false; spinBtn.disabled = false;
          var landed = items[pick];
          MK.sound.reveal(); ctx.mascot('cheer');
          MK.clear(result).appendChild(h('div', { class: 'wheel-card' }, MK.rich(landed)));
          if (c.remove) {
            items.splice(pick, 1);
            ctx.setProgress((total - items.length) / total);
            setTimeout(function () { g.style.transition = 'none'; draw(); }, 50);
            if (!items.length) { spinBtn.disabled = true; MK.clear(ctx.foot).appendChild(h('div', { class: 'erase-step' }, MK.t('انتهت عناصر العجلة'))); }
          }
        }, D + 80);
      }
      draw();
      return function () { };
    }
  };

  // ====== ٥) افتح الصندوق ======
  var boxes = {
    id: 'boxes', name: 'افتح الصندوق', icon: 'copy', teamsOk: true, timerOk: true,
    desc: 'صناديق مرقّمة، يختار الطالب صندوقًا فيُكشف سؤاله.',
    blank: function () { return { items: [{ q: '', a: '' }, { q: '', a: '' }, { q: '', a: '' }, { q: '', a: '' }], shuffle: true }; },
    edit: function (c, rerender) {
      var box = h('div');
      c.items.forEach(function (it, i) {
        box.appendChild(h('div', { class: 'item-box' },
          itemHead(i + 1, c.items.length > 2 ? function () { c.items.splice(i, 1); rerender(); } : null, 'صندوق'),
          field('السؤال أو المهمة', bindInput(h('textarea', { rows: 2 }), it, 'q')),
          field('الإجابة (اختياري)', bindInput(h('input', { type: 'text' }), it, 'a'), 'تظهر بزر «أظهر الإجابة».')));
      });
      if (c.items.length < 30) box.appendChild(h('button', { type: 'button', class: 'btn ghost', onclick: function () { c.items.push({ q: '', a: '' }); rerender(); } }, MK.icon('plus'), 'أضف صندوقًا'));
      return box;
    },
    options: function (c) { return [toggle('اخلط ما في الصناديق', c, 'shuffle')]; },
    validate: function (c) {
      if (c.items.length < 2) return 'أضف صندوقين على الأقل.';
      for (var i = 0; i < c.items.length; i++) if (!c.items[i].q.trim()) return 'الصندوق ' + ar(i + 1) + ' فارغ.';
      return null;
    },
    play: function (ctx) {
      var c = ctx.act.content, items = c.shuffle ? MK.shuffle(c.items) : c.items.slice(), opened = 0, good = 0, tm = { stop: function () { } };
      var body = MK.clear(ctx.body); MK.clear(ctx.foot);
      var grid = h('div', { class: 'box-grid' + (items.length > 12 ? ' many' : '') });
      body.appendChild(grid);
      var overlay = h('div', { class: 'reveal-bg hidden' });
      ctx.body.appendChild(overlay);
      items.forEach(function (it, i) {
        var b = h('button', { type: 'button', class: 'box b' + (i % 4), 'aria-label': MK.t('الصندوق ') + (i + 1) }, h('span', { class: 'lid' }), h('span', { class: 'n' }, ar(i + 1)));
        b.addEventListener('click', function () { if (!b.classList.contains('opened')) open(it, b); });
        grid.appendChild(b);
      });
      function open(it, b) {
        b.classList.add('opening'); MK.sound.flip();
        setTimeout(function () {
          b.classList.add('opened'); b.disabled = true;
          MK.clear(overlay); overlay.classList.remove('hidden');
          var ans = it.a && it.a.trim() ? h('div', { class: 'reveal-ans hidden' }, MK.rich(it.a)) : null;
          tm = startTimer(ctx, +ctx.act.settings.timer || 0, function () { });
          var acts = h('div', { class: 'reveal-acts' });
          if (ans) acts.appendChild(h('button', { type: 'button', class: 'btn ghost big', onclick: function () { ans.classList.remove('hidden'); MK.sound.reveal(); this.remove(); } }, MK.icon('eye'), MK.t('أظهر الإجابة')));
          acts.appendChild(h('button', { type: 'button', class: 'btn big ok-btn', onclick: function () { good++; ctx.addPoints(10); MK.sound.correct(); ctx.mascot('cheer'); close(); } }, MK.icon('check'), MK.t('إجابة صحيحة')));
          acts.appendChild(h('button', { type: 'button', class: 'btn soft big', onclick: function () { MK.sound.wrong(); close(); } }, MK.t('لم تُجب')));
          overlay.appendChild(h('div', { class: 'reveal-card' }, tm.el ? h('div', { style: { alignSelf: 'center' } }, tm.el) : null, h('div', { class: 'reveal-q' }, MK.rich(it.q)), ans, acts));
        }, 380);
      }
      function close() {
        tm.stop(); overlay.classList.add('hidden'); opened++;
        ctx.setProgress(opened / items.length); ctx.nextTurn();
        if (opened === items.length) setTimeout(function () { ctx.end({ correct: good, total: items.length }); }, 400);
      }
      return function () { tm.stop(); };
    }
  };

  // ====== ٦) البطاقات التعليمية ======
  var flash = {
    id: 'flash', name: 'البطاقات التعليمية', icon: 'copy', noScore: true, teamsOk: false, timerOk: false,
    desc: 'بطاقة تنقلب: وجه للسؤال أو المصطلح، ووجه للجواب.',
    blank: function () { return { cards: [{ front: '', back: '' }, { front: '', back: '' }], shuffle: false }; },
    edit: function (c, rerender) {
      var box = h('div');
      c.cards.forEach(function (cd, i) {
        box.appendChild(h('div', { class: 'item-box' },
          itemHead(i + 1, c.cards.length > 1 ? function () { c.cards.splice(i, 1); rerender(); } : null, 'بطاقة'),
          h('div', { class: 'two-col' },
            field('الوجه الأمامي', bindInput(h('textarea', { rows: 2 }), cd, 'front')),
            field('الوجه الخلفي', bindInput(h('textarea', { rows: 2 }), cd, 'back')))));
      });
      box.appendChild(h('button', { type: 'button', class: 'btn ghost', onclick: function () { c.cards.push({ front: '', back: '' }); rerender(); } }, MK.icon('plus'), 'أضف بطاقة'));
      return box;
    },
    options: function (c) { return [toggle('اخلط ترتيب البطاقات', c, 'shuffle')]; },
    validate: function (c) {
      for (var i = 0; i < c.cards.length; i++) if (!c.cards[i].front.trim() || !c.cards[i].back.trim()) return 'البطاقة ' + ar(i + 1) + ' ناقصة.';
      return null;
    },
    play: function (ctx) {
      var c = ctx.act.content, cards = c.shuffle ? MK.shuffle(c.cards) : c.cards.slice(), i = 0;
      var body = MK.clear(ctx.body);
      var count = h('div', { class: 'q-count', style: { textAlign: 'center' } });
      var inner = h('div', { class: 'fcard-inner' });
      var card = h('button', { type: 'button', class: 'fcard', 'aria-label': MK.t('اقلب البطاقة') }, inner);
      card.addEventListener('click', flip);
      body.appendChild(count); body.appendChild(h('div', { class: 'fcard-wrap' }, card));
      body.appendChild(h('div', { class: 'hint', style: { color: 'var(--muted)' } }, MK.t('اضغط البطاقة لقلبها')));
      var prevB = h('button', { type: 'button', class: 'btn soft big', onclick: function () { go(-1); } }, MK.icon('back'), MK.t('السابقة'));
      var nextB = h('button', { type: 'button', class: 'btn big', onclick: function () { go(1); } }, MK.t('التالية'), MK.icon('next'));
      var shufB = h('button', { type: 'button', class: 'btn ghost big', onclick: function () { cards = MK.shuffle(cards); i = 0; render(); MK.sound.flip(); } }, MK.icon('redo'), MK.t('اخلط'));
      MK.clear(ctx.foot); [prevB, nextB, shufB].forEach(function (b) { ctx.foot.appendChild(b); });
      function render() {
        card.classList.remove('flipped');
        MK.clear(inner);
        inner.appendChild(h('div', { class: 'face front' }, MK.rich(cards[i].front)));
        inner.appendChild(h('div', { class: 'face back' }, MK.rich(cards[i].back)));
        count.textContent = MK.t('البطاقة ') + ar(i + 1) + MK.t(' من ') + ar(cards.length);
        ctx.setProgress((i + 1) / cards.length);
        prevB.disabled = i === 0; nextB.disabled = i === cards.length - 1;
      }
      function flip() { card.classList.toggle('flipped'); MK.sound.flip(); }
      function go(d) { i = Math.max(0, Math.min(cards.length - 1, i + d)); render(); MK.sound.click(); }
      function onKey(e) {
        if (e.key === ' ' || e.key === 'Enter') { if (document.activeElement !== card) { e.preventDefault(); flip(); } }
        else if (e.key === 'ArrowLeft' || e.key === 'PageDown') { e.preventDefault(); go(1); }
        else if (e.key === 'ArrowRight' || e.key === 'PageUp') { e.preventDefault(); go(-1); }
      }
      document.addEventListener('keydown', onKey);
      render();
      return function () { document.removeEventListener('keydown', onKey); };
    }
  };

  Object.assign(MK.templates, { tf: tf, match: match, cloze: cloze, wheel: wheel, boxes: boxes, flash: flash });

  // ====== التحويل بين القوالب عبر «أزواج» مشتركة ======
  var noSlash = function (s) { return (s || '').replace(/\s*\/\s*/g, ' '); };
  var P = {
    quiz: {
      out: function (c) { return c.questions.map(function (q) { return { a: q.q, b: q.options[q.correct] || '' }; }); },
      in: function (ps) {
        if (ps.length < 2) return null;
        var bs = ps.map(function (p) { return p.b; });
        return { shuffleQ: false, shuffleOpts: true, questions: ps.map(function (p, k) {
          var others = MK.shuffle(bs.filter(function (_, j) { return j !== k && bs[j] !== p.b; })).slice(0, 3);
          return { q: p.a, options: [p.b].concat(others), correct: 0 };
        }) };
      }
    },
    erase: { out: function (c) { return c.texts.map(function (t) { return { a: t.intro || '', b: t.text }; }); }, in: function (ps) { return { texts: ps.map(function (p) { return { intro: p.a, text: p.b, source: '' }; }), mode: 'random', steps: 4, includeExtras: false }; } },
    unjumble: { out: function (c) { return c.items.map(function (i) { return { a: i.term, b: noSlash(i.definition) }; }); }, in: function (ps) { return { items: ps.map(function (p) { return { term: p.a, definition: p.b }; }), shuffle: false }; } },
    match: { out: function (c) { return c.pairs.map(function (p) { return { a: p.a, b: p.b }; }); }, in: function (ps) { return { pairs: ps.map(function (p) { return { a: p.a, b: p.b }; }), shuffle: true }; } },
    flash: { out: function (c) { return c.cards.map(function (x) { return { a: x.front, b: x.back }; }); }, in: function (ps) { return { cards: ps.map(function (p) { return { front: p.a, back: p.b }; }), shuffle: false }; } },
    boxes: { out: function (c) { return c.items.map(function (x) { return { a: x.q, b: x.a || '' }; }); }, in: function (ps) { return { items: ps.map(function (p) { return { q: p.a, a: p.b }; }), shuffle: true }; } },
    wheel: { out: function (c) { return c.items.filter(Boolean).map(function (x) { return { a: x, b: '' }; }); }, in: function (ps) { return { items: ps.map(function (p) { return p.a; }).filter(Boolean), remove: true }; } },
    tf: { out: function (c) { return c.items.map(function (x) { return { a: x.text, b: x.answer ? 'صح' : 'خطأ' }; }); }, in: null }
  };
  var needsB = { quiz: 1, unjumble: 1, match: 1, flash: 1 };
  MK.convP = P; MK.convNeedsB = needsB;
  MK.canConvert = function (from, to) { return from !== to && P[from] && P[to] && P[from].out && P[to].in; };
  MK.doConvert = function (act, to) {
    var ps = P[act.template].out(act.content).filter(function (p) { return p.a && p.a.trim(); });
    if (needsB[to]) ps = ps.filter(function (p) { return p.b && p.b.trim(); });
    if (!ps.length) return null;
    return P[to].in(ps);
  };

  // ====== قائمة القوالب ======
  MK.catalog = [
    { phase: 1, id: 'quiz' }, { phase: 1, id: 'erase' }, { phase: 1, id: 'unjumble' },
    { phase: 1, id: 'tf' }, { phase: 1, id: 'match' }, { phase: 1, id: 'cloze' },
    { phase: 1, id: 'wheel' }, { phase: 1, id: 'boxes' }, { phase: 1, id: 'flash' },
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
