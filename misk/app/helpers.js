/* مِسك الختام — الإصدار 1.5: اللغة، والنص الغني (الآيات والمعادلات)، والرموز، والآيات، وملفي، والصفحة الرئيسية، والصور المصغّرة */
(function () {
  var MK = window.MK, h = MK.h, ar = MK.toArabicDigits;
  MK.DESC = 'أنشطة تفاعلية للغلق البنائي والختامي';

  // ---------- اللغة ----------
  MK.lang = 'ar';
  MK.EN = Object.assign(MK.EN || {}, {" من ": " of ", "أعد": "Reset", "إخفاء الكل": "Hide all", "إظهار الكل": "Show all", "اختفى النص كله، ردّدوه من الذاكرة": "The text is hidden. Say it from memory!", "اضغط على الفراغ لتظهر الكلمة": "Tap a blank to show the word", "التالي": "Next", "التعريف التالي": "Next", "السؤال ": "Question ", "السؤال التالي": "Next question", "السابق": "Previous", "القطع": "Pieces", "المرحلة ": "Step ", "النتيجة": "Results", "النص كاملًا": "Full text", "الوقت المتبقي": "Time left", "امسح": "Erase", "تحقّق": "Check", "تراجع": "Undo", "تلميح": "Hint", "خانات التعريف": "Answer slots", "ضع كل القطع في الخانات أولًا": "Place all pieces first", "أدر العجلة": "Spin", "أظهر الإجابة": "Show answer", "إجابة صحيحة": "Correct", "اخلط": "Shuffle", "اضغط البطاقة لقلبها": "Tap the card to flip it", "اقلب البطاقة": "Flip card", "البطاقة ": "Card ", "التالية": "Next", "الجولة ": "Round ", "الجولة التالية": "Next round", "السابقة": "Previous", "الصندوق ": "Box ", "العبارة ": "Statement ", "العبارة التالية": "Next statement", "النص التالي": "Next text", "انتهت عناصر العجلة": "The wheel is empty", "بنك الكلمات": "Word bank", "خاطئة": "false", "خانة ": "Slot ", "خطأ": "False", "صح": "True", "صحيحة": "true", "لم تُجب": "Not answered", "ضع قطعة في كل خانة أولًا": "Fill every slot first", "تعادل جميل! أحسنتم جميعًا": "A tie! Well done, everyone", "أحسنتم يا ": "Well done, ", "أحسنت يا ": "Well done, ", "ما شاء الله! أحسنتم": "Excellent work!", "أحسنتم!": "Well done!", "محاولة طيبة": "Good try!", "الإجابات الصحيحة: ": "Correct answers: ", "النقاط: ": "Points: ", "أعد اللعب": "Play again", "خروج": "Exit", "فريق ": "Team ", " و": " & ", "يجيب: ": "Answering: ", "النقاط": "Points", "الفريق": "Team", "تعادل!": "A tie!", "ليجب ": "Answering: ", "أدر مرة أخرى": "Spin again", "اضغط في أي مكان للعودة إلى السؤال": "Tap anywhere to return to the question", "شارك جميع الطلاب": "Everyone has had a turn", "إغلاق": "Close", "بقي في العجلة: ": "Left on the wheel: ", "الاختبار": "Quiz", "المسح التدريجي": "Erase & Recall", "رتّب التعريف": "Unjumble", "صح أم خطأ": "True or False", "المطابقة": "Match Up", "الكلمة المفقودة": "Missing Word", "العجلة الدوّارة": "Spin the Wheel", "افتح الصندوق": "Open the Box", "البطاقات التعليمية": "Flash Cards"});
  MK.t = function (s) { return MK.lang === 'en' && MK.EN[s] != null ? MK.EN[s] : s; };

  // ---------- الخطوط المشتركة (المصحف والرموز وقوسا الآية) ----------
  MK.fontsReady = (function () {
    var F = window.ExamFonts; if (!F || !window.FontFace) return Promise.resolve();
    var all = ['quran', 'sym', 'brk'].map(function (k) {
      if (!F[k]) return null;
      try {
        var bin = atob(F[k].b64), u = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
        var ff = new FontFace(F[k].name, u.buffer);
        document.fonts.add(ff);
        if (k === 'sym') document.fonts.add(new FontFace('MiskSym', u.buffer, { unicodeRange: 'U+FD3E-FD3F, U+FD40-FD4F, U+FDCF, U+FDF0-FDFF' }));
        return ff.load();
      } catch (e) { return null; }
    }).filter(Boolean);
    return Promise.all(all).catch(function () { });
  })();

  // ---------- النص الغني: الآيات بخط المصحف، والمعادلات بشكلها الرياضي ----------
  var MNS = 'http://www.w3.org/1998/Math/MathML';
  function m(tag, kids) { var e = document.createElementNS(MNS, tag); (kids || []).forEach(function (k) { e.appendChild(k); }); return e; }
  function mt(s) { var e = document.createElementNS(MNS, 'mtext'); e.textContent = s; return e; }
  function unpar(s) { s = s.trim(); return /^\(.*\)$/.test(s) && s.indexOf(')') === s.length - 1 ? s.slice(1, -1) : s; }
  var SUPN = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', 'ⁿ': 'n' };
  var TOK = '(\\([^()]+\\)|[0-9A-Za-z\\u0621-\\u064A.]+)';
  var RE = new RegExp(
    TOK + '⁄' + TOK + '|' +                       // كسر
    '([⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ]*)√\\(([^()]+)\\)|' +            // جذر بدليل أو تربيعي
    '∛\\(([^()]+)\\)|' +                            // جذر تكعيبي
    TOK + '\\^\\(([^()]+)\\)|' +                     // أس مركّب
    TOK + '_\\(([^()]+)\\)', 'g');                  // دليل سفلي مركّب
  function mathNode(g) {
    var mm;
    if (g[1] != null) mm = m('mfrac', [mt(unpar(g[1])), mt(unpar(g[2]))]);
    else if (g[4] != null) {
      var idx = g[3] ? g[3].split('').map(function (c) { return SUPN[c]; }).join('') : '';
      mm = idx ? m('mroot', [mt(g[4]), mt(idx)]) : m('msqrt', [mt(g[4])]);
    }
    else if (g[5] != null) mm = m('mroot', [mt(g[5]), mt('3')]);
    else if (g[6] != null) mm = m('msup', [mt(unpar(g[6])), mt(g[7])]);
    else mm = m('msub', [mt(unpar(g[8])), mt(g[9])]);
    var root = m('math', [mm]); root.setAttribute('class', 'mk-math');
    return root;
  }
  function plainInto(frag, s) {
    var last = 0, g; RE.lastIndex = 0;
    while ((g = RE.exec(s))) {
      if (g.index > last) frag.appendChild(document.createTextNode(s.slice(last, g.index)));
      frag.appendChild(mathNode(g));
      last = RE.lastIndex;
    }
    if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
  }
  MK.rich = function (s) {
    s = String(s == null ? '' : s);
    var frag = document.createDocumentFragment(), re = /﴿[^﴿﴾]*﴾/g, last = 0, g;
    while ((g = re.exec(s))) {
      if (g.index > last) plainInto(frag, s.slice(last, g.index));
      frag.appendChild(h('span', { class: 'qr' }, g[0]));
      last = re.lastIndex;
    }
    if (last < s.length) plainInto(frag, s.slice(last));
    return frag;
  };
  // للعجلة والأماكن التي لا تقبل إلا نصًا
  MK.plain = function (s) {
    return String(s || '').replace(/\(([^()]+)\)⁄\(([^()]+)\)/g, '$1/$2').replace(/⁄/g, '/').replace(/\^\(([^()]+)\)/g, '^$1').replace(/_\(([^()]+)\)/g, '$1');
  };

  // ---------- المصحف ----------
  MK.quran = function () { return window.QuranData || null; };

  // ---------- زر الرموز ✦ ----------
  var SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻', 'n': 'ⁿ', '(': '⁽', ')': '⁾' };
  var SUB = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉', '+': '₊', '-': '₋', 'x': 'ₓ', '(': '₍', ')': '₎' };
  function conv(s, map) { var o = ''; for (var i = 0; i < s.length; i++) { if (!map[s[i]]) return null; o += map[s[i]]; } return o; }
  function wrap(s) { s = s.trim(); return /^[0-9A-Za-zء-ي.]+$/.test(s) ? s : '(' + s + ')'; }
  var TABS = [
    { name: 'رموز إسلامية', items: [{ t: '﴿ ﴾', ins: '﴿﴾', back: 1, cls: 'qr', name: 'قوسا الآية' }, { t: 'ﷺ', name: 'صلى الله عليه وسلم', cls: 'sym lig' }, { t: 'ﷻ', name: 'جل جلاله', cls: 'sym lig' }, { t: '﷿', name: 'عز وجل', cls: 'sym lig' }, { t: '﷾', name: 'سبحانه وتعالى', cls: 'sym lig' }, { t: '﵎', name: 'تبارك وتعالى', cls: 'sym lig' }, { t: '﵇', name: 'عليه السلام', cls: 'sym lig' }, { t: '﵊', name: 'عليه الصلاة والسلام', cls: 'sym lig' }, { t: '﵍', name: 'عليها السلام', cls: 'sym lig' }, { t: '﵈', name: 'عليهم السلام', cls: 'sym lig' }, { t: '﵉', name: 'عليهما السلام', cls: 'sym lig' }, { t: '﵁', name: 'رضي الله عنه', cls: 'sym lig' }, { t: '﵂', name: 'رضي الله عنها', cls: 'sym lig' }, { t: '﵃', name: 'رضي الله عنهم', cls: 'sym lig' }, { t: '﵄', name: 'رضي الله عنهما', cls: 'sym lig' }, { t: '﵅', name: 'رضي الله عنهن', cls: 'sym lig' }, { t: '﵀', name: 'رحمه الله تعالى', cls: 'sym lig' }, { t: '﵏', name: 'رحمهم الله', cls: 'sym lig' }, { t: 'ﷲ', name: 'الله', cls: 'sym lig' }, { t: '﷽', name: 'البسملة', cls: 'sym lig' }, { t: 'إدراج آية…', act: 'verse', cls: 'wide' }] },
    { name: 'رياضيات', items: '+ − × ÷ = ≠ ≈ ± < > ≤ ≥ √ ∛ π ∞ ° % ½ ⅓ ¼ ¾ ⅔ ∠ ⊥ ∥ △ ∑ ∫ ∴ ∵ ∈ ∉ ⊂ ∪ ∩ ∅ ℕ ℤ ℚ ℝ ′ ″ · |'.split(' ') },
    { name: 'أسس ودلائل', items: '⁰ ¹ ² ³ ⁴ ⁵ ⁶ ⁷ ⁸ ⁹ ⁺ ⁻ ⁿ ₀ ₁ ₂ ₃ ₄ ₅ ₆ ₇ ₈ ₉ ₊ ₋ ₓ'.split(' ') },
    { name: 'كسور وجذور ولوغاريتمات', builder: true },
    { name: 'علوم وكيمياء', items: '→ ⇌ ↑ ↓ Δ °C °F Ω μ H₂O CO₂ O₂ H₂ N₂ NaCl H₂SO₄ HCl NaOH CH₄ NH₃ CaCO₃ (aq) (s) (l) (g) m/s m/s² kg N J W Pa'.split(' ') },
    { name: 'حروف يونانية', items: 'α β γ δ ε θ λ μ π ρ σ τ φ ω Δ Σ Φ Ω'.split(' ') },
    { name: 'أسهم وأشكال', items: '→ ← ↑ ↓ ↔ ⇒ ⇐ ⇔ • ○ ● □ ■ △ ▲ ◇ ◆ ✓ ✗ ★ ☆'.split(' ') }
  ];
  var field = null, symBtn = null, pop = null, lastTab = 0;
  function insertText(el, text, back) {
    if (!el) return;
    el.focus();
    var s = el.selectionStart != null ? el.selectionStart : el.value.length, e = el.selectionEnd != null ? el.selectionEnd : s;
    var sel = el.value.slice(s, e);
    if (back && sel) text = text.slice(0, text.length - back) + sel + text.slice(text.length - back);
    el.setRangeText(text, s, e, 'end');
    if (back && !sel) { var p = el.selectionStart - back; el.setSelectionRange(p, p); }
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
  MK.insertText = insertText;
  function closePop() { if (pop) { pop.remove(); pop = null; } }
  function builder(onIns) {
    var type = 'frac', box = h('div', { class: 'sym-builder' }), prev = h('div', { class: 'sym-prev' });
    var defs = {
      frac: { label: 'كسر', f: ['البسط', 'المقام'], make: function (v) { return wrap(v[0]) + '⁄' + wrap(v[1]); } },
      mixed: { label: 'عدد كسري', f: ['العدد', 'البسط', 'المقام'], make: function (v) { return v[0].trim() + ' ' + wrap(v[1]) + '⁄' + wrap(v[2]); } },
      sqrt: { label: 'جذر تربيعي', f: ['ما تحت الجذر'], make: function (v) { return '√(' + v[0].trim() + ')'; } },
      root: { label: 'جذر بدليل', f: ['الدليل', 'ما تحت الجذر'], make: function (v) { var i = conv(v[0].trim(), SUP); return (i || '') + '√(' + v[1].trim() + ')'; } },
      pow: { label: 'أس', f: ['الأساس', 'الأس'], make: function (v) { var p = conv(v[1].trim(), SUP); return p ? v[0].trim() + p : wrap(v[0]) + '^(' + v[1].trim() + ')'; } },
      sub: { label: 'دليل سفلي', f: ['الرمز', 'الدليل'], make: function (v) { var p = conv(v[1].trim(), SUB); return p ? v[0].trim() + p : wrap(v[0]) + '_(' + v[1].trim() + ')'; } },
      log: { label: 'لوغاريتم', f: ['الأساس (اتركه فارغًا للعشري)', 'العدد'], make: function (v) { var b = v[0].trim(), p = b ? conv(b, SUB) : ''; return 'log' + (b ? (p || '_(' + b + ')') : '') + '(' + v[1].trim() + ')'; } }
    };
    var inputs = [], fieldsEl = h('div', { class: 'sym-fields' });
    var typeCh = MK.choice(Object.keys(defs).map(function (k) { return { value: k, label: defs[k].label }; }), type, function (v) { type = v; drawFields(); });
    function val() { return inputs.map(function (i) { return i.value; }); }
    function upd() { var v = val(); MK.clear(prev); if (v.every(function (x) { return x.trim(); }) || (type === 'log' && v[1].trim())) prev.appendChild(MK.rich(defs[type].make(v))); }
    function drawFields() {
      MK.clear(fieldsEl); inputs = [];
      defs[type].f.forEach(function (lb) { var i = h('input', { type: 'text', placeholder: lb, 'aria-label': lb, dir: 'auto' }); i.addEventListener('input', upd); inputs.push(i); fieldsEl.appendChild(i); });
      upd(); setTimeout(function () { inputs[0].focus(); }, 0);
    }
    box.appendChild(typeCh); box.appendChild(fieldsEl);
    box.appendChild(h('div', { class: 'sym-row' }, prev, h('button', { type: 'button', class: 'btn small', onclick: function () {
      var v = val(); if (!v.every(function (x, i) { return x.trim() || (type === 'log' && i === 0); })) { MK.toast('أكمل الخانات'); return; }
      onIns(defs[type].make(v));
    } }, 'إدراج')));
    drawFields();
    return box;
  }
  function openPop(target) {
    closePop();
    var r = target.getBoundingClientRect();
    pop = h('div', { class: 'sym-pop', role: 'dialog', 'aria-label': 'الرموز' });
    var tabs = h('div', { class: 'sym-tabs' }), body = h('div', { class: 'sym-body' });
    function draw(i) {
      lastTab = i;
      Array.prototype.forEach.call(tabs.children, function (b, k) { b.classList.toggle('on', k === i); });
      MK.clear(body);
      var T = TABS[i];
      if (T.builder) { body.appendChild(builder(function (s) { insertText(target, s); closePop(); })); return; }
      T.items.forEach(function (it) {
        var o = typeof it === 'string' ? { t: it } : it;
        body.appendChild(h('button', { type: 'button', class: 'sym-key' + (o.cls ? ' ' + o.cls : ''), onmousedown: function (e) { e.preventDefault(); }, onclick: function () {
          if (o.act === 'verse') { closePop(); MK.verseDialog(function (res) { insertText(target, res.text + ' ' + res.ref); }); return; }
          insertText(target, o.ins || o.t, o.back);
        }, title: o.name || null }, o.name ? h('span', { class: 'lig-g' }, o.t) : o.t, o.name ? h('small', null, o.name) : null));
      });
    }
    TABS.forEach(function (T, i) { tabs.appendChild(h('button', { type: 'button', class: 'sym-tab', onmousedown: function (e) { e.preventDefault(); }, onclick: function () { draw(i); } }, T.name)); });
    pop.appendChild(h('div', { class: 'sym-head' }, tabs, h('button', { type: 'button', class: 'mini-x', 'aria-label': 'إغلاق', onclick: closePop }, MK.icon('close'))));
    pop.appendChild(body);
    pop.appendChild(h('div', { class: 'hint' }, 'يُدرج الرمز مكان المؤشر في الخانة.'));
    document.body.appendChild(pop);
    var top = r.bottom + window.scrollY + 6, left = Math.max(10, Math.min(r.left + window.scrollX, window.innerWidth - pop.offsetWidth - 10));
    if (r.bottom + pop.offsetHeight + 10 > window.innerHeight) top = Math.max(10, r.top + window.scrollY - pop.offsetHeight - 6);
    pop.style.top = top + 'px'; pop.style.left = left + 'px';
    draw(lastTab);
  }
  function placeBtn() {
    if (!field || !symBtn) return;
    var r = field.getBoundingClientRect();
    if (!r.width || !document.body.contains(field)) { symBtn.style.display = 'none'; return; }
    symBtn.style.display = '';
    symBtn.style.top = (r.top + window.scrollY + 4) + 'px';
    symBtn.style.left = (r.left + window.scrollX + 4) + 'px';
  }
  document.addEventListener('focusin', function (e) {
    var el = e.target;
    if (!el.matches || !el.matches('.editor textarea, .editor input[type=text]') || el.closest('.sym-pop') || el.list) {
      if (!(el.closest && (el.closest('.sym-pop') || el.closest('.sym-btn')))) { if (symBtn) symBtn.style.display = 'none'; }
      return;
    }
    field = el;
    if (!symBtn) {
      symBtn = h('button', { type: 'button', class: 'sym-btn', title: 'الرموز', 'aria-label': 'الرموز', onmousedown: function (ev) { ev.preventDefault(); }, onclick: function () { if (pop) closePop(); else openPop(field); } }, '✦');
      document.body.appendChild(symBtn);
    }
    placeBtn();
  });
  window.addEventListener('scroll', placeBtn, true);
  window.addEventListener('resize', placeBtn);
  document.addEventListener('mousedown', function (e) { if (pop && !pop.contains(e.target) && e.target !== symBtn) closePop(); });
  MK.hideSym = function () { closePop(); if (symBtn) symBtn.style.display = 'none'; field = null; };

  // ---------- نافذة إدراج آية ----------
  MK.verseDialog = function (onIns) {
    var Q = MK.quran();
    if (!Q) { MK.toast('ملف المصحف غير موجود'); return; }
    var sel = h('select', { 'aria-label': 'السورة' }, Q.names.map(function (n, i) { return h('option', { value: i }, (i + 1) + '. ' + n); }));
    var from = h('input', { type: 'number', min: 1, value: 1, 'aria-label': 'من الآية' }), to = h('input', { type: 'number', min: 1, value: 1, 'aria-label': 'إلى الآية' });
    var info = h('span', { class: 'hint' }), prev = h('div', { class: 'verse-prev qr' });
    var res = null;
    function upd() {
      var s = +sel.value, n = Q.suras[s].length;
      from.max = to.max = n; info.textContent = 'عدد آياتها: ' + n;
      var a = Math.max(1, Math.min(n, +from.value || 1)), b = Math.max(a, Math.min(n, +to.value || a));
      var parts = [];
      for (var k = a; k <= b; k++) parts.push(Q.suras[s][k - 1].replace(/^۞\s*/, '') + (b > a ? ' (' + k + ')' : ''));
      res = { text: '﴿' + parts.join(' ') + '﴾', ref: '[' + Q.names[s] + ': ' + (a === b ? a : a + '-' + b) + ']', sura: Q.names[s] };
      MK.clear(prev).appendChild(MK.rich(res.text)); prev.appendChild(h('span', { class: 'verse-ref' }, ' ' + res.ref));
    }
    // البحث بكلمة: بلا تشكيل ولا همزات ولا ألفات، والمسافات لا تؤثر
    var q = h('input', { type: 'search', placeholder: 'اكتب كلمة من الآية، مثل: الصراط المستقيم', 'aria-label': 'ابحث بكلمة' });
    var hits = h('div', { class: 'verse-hits' }), tmr = null;
    function pick(si, ai, el) {
      sel.value = si; from.value = ai + 1; to.value = ai + 1; upd();
      Array.prototype.forEach.call(hits.children, function (c) { c.classList.remove('on'); });
      if (el) el.classList.add('on');
    }
    function search() {
      var key = MK.qNorm(q.value); MK.clear(hits);
      if (key.length < 2) { hits.style.display = 'none'; return; }
      var idx = MK.qIndex(), found = [];
      for (var i = 0; i < idx.length && found.length < 501; i++) if (idx[i].n.indexOf(key) >= 0) found.push(idx[i]);
      hits.style.display = '';
      if (!found.length) { hits.appendChild(h('div', { class: 'hint' }, 'لا توجد نتائج. جرّب كلمة أخرى أو جزءًا منها.')); return; }
      var more = found.length > 500 ? 'أكثر من 500' : found.length;
      hits.appendChild(h('div', { class: 'hint' }, 'عدد النتائج: ' + more + (found.length > 40 ? ' — يظهر أول 40، أضف كلمة أخرى لتضييق البحث.' : ' — اضغط على الآية لاختيارها.')));
      found.slice(0, 40).forEach(function (f) {
        var t = Q.suras[f.s][f.a].replace(/^۞\s*/, '');
        var b = h('button', { type: 'button', class: 'verse-hit' }, h('span', { class: 'verse-ref' }, Q.names[f.s] + ': ' + (f.a + 1)), h('span', { class: 'qr' }, t));
        b.addEventListener('click', function () { pick(f.s, f.a, b); });
        hits.appendChild(b);
      });
    }
    hits.style.display = 'none';
    q.addEventListener('input', function () { clearTimeout(tmr); tmr = setTimeout(search, 200); });
    sel.addEventListener('change', function () { from.value = 1; to.value = 1; upd(); });
    from.addEventListener('input', function () { if (+to.value < +from.value) to.value = from.value; upd(); });
    to.addEventListener('input', upd);
    var body = h('div', { class: 'verse-dlg' },
      h('div', { class: 'field' }, h('label', null, 'ابحث بكلمة'), q, hits),
      h('div', { class: 'field' }, h('label', null, 'السورة'), sel, info),
      h('div', { class: 'two-col' }, h('div', { class: 'field' }, h('label', null, 'من الآية'), from), h('div', { class: 'field' }, h('label', null, 'إلى الآية'), to)),
      prev, h('div', { class: 'hint' }, 'نص المصحف برواية حفص بالرسم العثماني، من مجمع الملك فهد لطباعة المصحف الشريف.'));
    upd();
    body.appendChild(h('p', { class: 'hint quran-src' }, 'النص من مصحف مجمع الملك فهد لطباعة المصحف الشريف (الإصدار 22)، برواية حفص عن عاصم وبالرسم العثماني.'));
    MK.modal('إدراج آية', body, [{ label: 'إدراج', onClick: function () { onIns(res); } }, { label: 'إلغاء', cls: 'ghost' }]);
    document.querySelector('.modal').classList.add('wide');
    setTimeout(function () { q.focus(); }, 50);
  };
  MK.qNorm = function (t) {
    return String(t || '')
      .replace(/و(?=[\u064B-\u065F]*\u0670)/g, '')   // الصلوٰة ← الصلاة
      .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '')
      .replace(/[اأإآٱءٰ]/g, '').replace(/ؤ/g, 'و').replace(/[ئى]/g, 'ي').replace(/ة/g, 'ه')
      .replace(/[^\u0621-\u064A]/g, '');
  };
  var qIdx = null;
  MK.qIndex = function () {
    if (qIdx) return qIdx;
    var Q = MK.quran(); qIdx = [];
    Q.suras.forEach(function (ay, s) { ay.forEach(function (t, a) { qIdx.push({ s: s, a: a, n: MK.qNorm(t) }); }); });
    return qIdx;
  };

  // ---------- ملفي: بيانات المعلم والمدرسة ----------
  MK.profile = { teacher: '', school: '', logo: '', showTeacher: false };
  MK.loadProfile = function () { return MK.store.loadProfile().then(function (p) { MK.profile = Object.assign({ teacher: '', school: '', logo: '', showTeacher: false }, p || {}); return MK.profile; }); };
  function resizeImage(file) {
    return new Promise(function (res, rej) {
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var s = Math.min(1, 320 / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url); res(c.toDataURL('image/png'));
      };
      img.onerror = function () { rej(); }; img.src = url;
    });
  }
  MK.DEFAULT_DOMAINS = ['القرآن الكريم', 'الحديث الشريف', 'العقيدة', 'الفقه', 'السيرة النبوية'];
  MK.domains = function () { var d = (MK.profile || {}).domains; return d && d.length ? d : MK.DEFAULT_DOMAINS.slice(); };
  MK.profilePage = function () {
    var p = MK.clone(MK.profile), wrap = h('div');
    wrap.appendChild(h('div', { class: 'section-head page-head' }, h('h2', null, 'ملفي')));
    var tIn = h('input', { type: 'text', placeholder: 'مثال: أ. محمد سعيد النتشة' }); tIn.value = p.teacher;
    var sIn = h('input', { type: 'text', placeholder: 'مثال: مدرسة قطر التقنية الثانوية للبنين' }); sIn.value = p.school;
    tIn.addEventListener('input', function () { p.teacher = tIn.value; });
    sIn.addEventListener('input', function () { p.school = sIn.value; });
    var logoBox = h('div', { class: 'logo-box' });
    var fileIn = h('input', { type: 'file', accept: 'image/*', class: 'hidden' });
    fileIn.addEventListener('change', function () { var f = fileIn.files[0]; if (!f) return; resizeImage(f).then(function (d) { p.logo = d; drawLogo(); }).catch(function () { MK.toast('تعذّرت قراءة الصورة'); }); fileIn.value = ''; });
    function drawLogo() {
      MK.clear(logoBox);
      logoBox.appendChild(p.logo ? h('img', { src: p.logo, alt: 'شعار المدرسة' }) : h('span', { class: 'hint' }, 'لا يوجد شعار'));
      logoBox.appendChild(h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
        h('button', { type: 'button', class: 'btn small soft', onclick: function () { fileIn.click(); } }, MK.icon('upload'), p.logo ? 'تغيير الشعار' : 'رفع صورة الشعار'),
        p.logo ? h('button', { type: 'button', class: 'btn small danger', onclick: function () { p.logo = ''; drawLogo(); } }, 'حذف الشعار') : null, fileIn));
    }
    drawLogo();
    var domIn = h('textarea', { rows: 5 }); domIn.value = MK.domains().join('\n');
    var show = h('input', { type: 'checkbox', checked: !!p.showTeacher });
    show.addEventListener('change', function () { p.showTeacher = show.checked; });
    wrap.appendChild(h('div', { class: 'panel', style: { maxWidth: '760px' } },
      h('h3', null, 'بياناتي'),
      h('div', { class: 'two-col' }, h('div', { class: 'field' }, h('label', null, 'اسم المعلم'), tIn), h('div', { class: 'field' }, h('label', null, 'اسم المدرسة'), sIn)),
      h('div', { class: 'field' }, h('label', null, 'شعار المدرسة'), logoBox),
      h('label', { class: 'toggle' }, show, 'أظهر اسمي على شاشة العرض تحت اسم المدرسة'),
      h('div', { class: 'hint', style: { marginBottom: '12px' } }, 'يظهر اسم المدرسة وشعارها أعلى شاشة اللعبة وفي شاشة النهاية.'),
      h('div', { class: 'field' }, h('label', null, 'مجالات مادتي (مجال في كل سطر) — تُستخدم أعمدةً في «لوحة التحديات»'), domIn),
      h('button', { type: 'button', class: 'btn', onclick: function () {
        p.teacher = p.teacher.trim(); p.school = p.school.trim();
        p.domains = domIn.value.split(/\n+/).map(function (x) { return x.trim(); }).filter(Boolean);
        MK.store.saveProfile(p).then(function () { MK.profile = p; MK.toast('حُفظت بياناتك'); if (MK.refreshSide) MK.refreshSide(); }).catch(function () { MK.toast('تعذّر الحفظ'); });
      } }, MK.icon('save'), 'حفظ بياناتي')));
    wrap.appendChild(MK.classesSection());
    return wrap;
  };

  // ---------- الصور المصغّرة للأنشطة ----------
  function chip(t, k) { return h('span', { class: 'th-chip c' + (k % 4) }, MK.rich(t)); }
  MK.thumb = function (a) {
    var c = a.content || {}, en = a.lang === 'en', box = h('div', { class: 'th-in' });
    var L = function (i) { return en ? 'ABCD'[i] : ['أ', 'ب', 'ج', 'د'][i]; };
    switch (a.template) {
      case 'quiz': var q = (c.questions || [])[0] || { q: '', options: [] };
        box.appendChild(h('div', { class: 'th-q' }, MK.rich(q.q)));
        box.appendChild(h('div', { class: 'th-opts' }, q.options.slice(0, 4).map(function (o, i) { return h('div', { class: 'th-opt' }, h('b', null, L(i)), MK.rich(o)); }))); break;
      case 'tf': var s = (c.items || [])[0] || { text: '' };
        box.appendChild(h('div', { class: 'th-card' }, MK.rich(s.text)));
        box.appendChild(h('div', { class: 'th-tf' }, h('span', { class: 'ok' }, en ? '✓ True' : '✓ صح'), h('span', { class: 'no' }, en ? '✗ False' : '✗ خطأ'))); break;
      case 'match': var ps = (c.pairs || []).slice(0, 3);
        ps.forEach(function (p) { box.appendChild(h('div', { class: 'th-mrow' }, h('span', { class: 'th-term' }, MK.rich(p.a)), h('span', { class: 'th-slot' }))); });
        box.appendChild(h('div', { class: 'th-chips' }, ps.map(function (p, i) { return chip(p.b.length > 22 ? p.b.slice(0, 21) + '…' : p.b, i + 1); }))); break;
      case 'erase': var t = (c.texts || [])[0] || { text: '' }, ws = t.text.split(/\s+/).slice(0, 14);
        var line = h('div', { class: 'th-scroll' + (/﴿/.test(t.text) ? ' qr' : '') });
        ws.forEach(function (w, i) { line.appendChild(i % 3 === 1 ? h('span', { class: 'th-gap' }) : document.createTextNode(w)); line.appendChild(document.createTextNode(' ')); });
        box.appendChild(line); break;
      case 'unjumble': var it = (c.items || [])[0] || { term: '', definition: '' }, ch = MK.ui.chunksOf(it.definition).slice(0, 4);
        box.appendChild(h('div', { class: 'th-term-big' }, MK.rich(it.term)));
        box.appendChild(h('div', { class: 'th-chips' }, MK.shuffle(ch).map(function (x, i) { return chip(x, i); }))); break;
      case 'cloze': var tx = ((c.texts || [])[0] || { text: '' }).text, parts = tx.split(/\[([^\]]+)\]/), para = h('div', { class: 'th-scroll' }), bank = [];
        parts.slice(0, 7).forEach(function (pt, k) { if (k % 2) { para.appendChild(h('span', { class: 'th-gap box' })); bank.push(pt); } else para.appendChild(MK.rich(pt.length > 60 ? pt.slice(0, 60) + '…' : pt)); });
        box.appendChild(para); box.appendChild(h('div', { class: 'th-chips' }, bank.slice(0, 3).map(chip))); break;
      case 'wheel': var its = (c.items || []).filter(Boolean), n = Math.max(2, Math.min(8, its.length)), d = '';
        var cols = ['var(--p1)', 'var(--p2)', 'var(--p3)', 'var(--gold)'];
        for (var i = 0; i < n; i++) { var a0 = (i / n * 2 - .5) * Math.PI, a1 = ((i + 1) / n * 2 - .5) * Math.PI; d += '<path d="M50 50 L' + (50 + 46 * Math.cos(a0)).toFixed(1) + ' ' + (50 + 46 * Math.sin(a0)).toFixed(1) + ' A46 46 0 0 1 ' + (50 + 46 * Math.cos(a1)).toFixed(1) + ' ' + (50 + 46 * Math.sin(a1)).toFixed(1) + ' Z" style="fill:' + cols[i % 4] + '" stroke="#fff" stroke-width="1.5"/>'; }
        var w = h('span', { class: 'th-wheel' }); w.innerHTML = '<svg viewBox="0 0 100 100" aria-hidden="true">' + d + '<circle cx="50" cy="50" r="8" style="fill:var(--surface);stroke:var(--gold)" stroke-width="2"/><path d="M44 0 L56 0 L50 10Z" style="fill:var(--ink)"/></svg>';
        box.appendChild(h('div', { class: 'th-wrow' }, w, its[0] ? h('div', { class: 'th-card small' }, MK.plain(its[0])) : null)); break;
      case 'boxes': var nb = Math.min(8, (c.items || []).length || 4);
        box.appendChild(h('div', { class: 'th-boxes' }, Array.apply(null, Array(nb)).map(function (_, i) { return h('span', { class: 'th-box c' + (i % 4) + (i === 2 ? ' open' : '') }, String(i + 1)); }))); break;
      case 'flash': var f = (c.cards || [])[0] || { front: '' };
        box.appendChild(h('div', { class: 'th-flash' }, MK.rich(f.front))); break;
      case 'show': var sq = (c.questions || [])[0] || { q: '', options: [] };
        box.classList.add('th-dark');
        box.appendChild(h('div', { class: 'th-gsq' }, MK.plain(sq.q)));
        box.appendChild(h('div', { class: 'th-opts' }, sq.options.slice(0, 4).map(function (o, i) { return h('div', { class: 'th-gso' + (i === 1 ? ' sel' : '') }, h('b', null, L(i)), MK.plain(o)); }))); break;
      case 'find': var fp = (c.pairs || []);
        box.appendChild(h('div', { class: 'th-card' }, MK.plain((fp[0] || {}).a || '')));
        box.appendChild(h('div', { class: 'th-tiles' }, fp.slice(0, 6).map(function (p, i) { return h('span', { class: 'th-tile c' + (i % 4) + (i === 2 ? ' gone' : '') }, MK.plain(p.b || '').slice(0, 18)); }))); break;
      case 'memory': var mp = (c.pairs || []).slice(0, 4), mc = [];
        mp.forEach(function (p, i) { mc.push(i === 0 ? h('span', { class: 'th-mem up' }, MK.plain(p.a).slice(0, 14)) : h('span', { class: 'th-mem' }, '✦')); mc.push(i === 0 ? h('span', { class: 'th-mem up' }, MK.plain(p.b || p.a).slice(0, 14)) : h('span', { class: 'th-mem' }, '✦')); });
        box.appendChild(h('div', { class: 'th-memg' }, mc)); break;
      case 'order': var ol = ((c.lists || [])[0] || { items: [] }).items.slice(0, 4);
        box.appendChild(h('div', { class: 'th-ord' }, ol.map(function (t, i) { return h('div', { class: 'th-ordr' }, h('b', null, String(i + 1)), h('span', { class: 'th-chip c' + ([2, 0, 3, 1][i] % 4) }, MK.plain(ol[[2, 0, 3, 1][i]] || t).slice(0, 26))); }))); break;
      case 'group': var gg = (c.groups || []).slice(0, 3);
        box.appendChild(h('div', { class: 'th-grp' }, gg.map(function (g, i) { return h('div', { class: 'th-grpc g' + i }, h('b', null, MK.plain(g.name)), (g.items || []).slice(0, 2).map(function (x) { return h('span', null, MK.plain(x).slice(0, 14)); })); }))); break;
      case 'randcards': var rn = Math.min(6, (c.items || []).length || 6);
        box.appendChild(h('div', { class: 'th-rc' }, Array.apply(null, Array(rn)).map(function (_, i) { return h('span', { class: 'th-rcc' + (i === 2 ? ' up' : ''), style: { transform: 'rotate(' + ((i % 3) - 1) * 4 + 'deg)' } }, i === 2 ? MK.plain((c.items || [''])[0]).slice(0, 22) : '✦'); }))); break;
      case 'tiles': var tc = (c.cards || []).slice(0, 6);
        box.appendChild(h('div', { class: 'th-tiles g3' }, tc.map(function (x, i) { return h('span', { class: 'th-tile c' + (i % 4) }, MK.plain(i === 1 ? x.back : x.front).slice(0, 16)); }))); break;
      case 'talk': var tq = (c.items || [''])[0];
        box.appendChild(h('div', { class: 'th-talk' }, h('span', { class: 'th-deck' }, '✦'), h('div', { class: 'th-tcard' }, h('i', null, '؟'), MK.plain(tq).slice(0, 60)))); break;
      case 'diagram':
        var dw = h('div', { class: 'th-dg' }, c.image ? h('img', { src: c.image, alt: '' }) : null);
        (c.labels || []).filter(function (l) { return l.x != null; }).slice(0, 5).forEach(function (l, i) { dw.appendChild(h('span', { class: 'th-dgl', style: { left: l.x + '%', top: l.y + '%' } }, String(i + 1))); });
        box.appendChild(dw); break;
      case 'crossword':
        var cg = h('div', { class: 'th-cw' }), pat = ['01110', '00100', '11111', '00100', '00110'];
        pat.forEach(function (row) { row.split('').forEach(function (b) { cg.appendChild(h('span', { class: b === '1' ? 'on' : '' })); }); });
        box.appendChild(h('div', { class: 'th-cwrow' }, cg, h('div', { class: 'th-clue' }, (c.pairs || []).slice(0, 3).map(function (p, i) { return h('div', null, (i + 1) + '. ' + MK.plain(p.a).slice(0, 26)); })))); break;
      case 'board':
        var bc = (c.cols || []).slice(0, 6), bv = { a: [100, 300, 600, 900], b: [100, 200, 300, 400], c: [200, 400, 600, 800, 1000] }[c.vals || 'a'];
        box.appendChild(h('div', { class: 'th-board', style: { gridTemplateColumns: 'repeat(' + bc.length + ',1fr)' } },
          bc.map(function (col) { return h('b', null, MK.plain(col.name).slice(0, 10)); }).concat([].concat.apply([], bv.map(function (v, ri) { return bc.map(function (col, ci) { return h('span', { class: ri === 1 && ci === 2 ? 'used' : '' }, String(v)); }); }))))); break;
      case 'rounds':
        var rl = (c.ids || []).map(function (id) { return (MK.allActs ? MK.allActs() : []).filter(function (x) { return x.id === id; })[0]; }).filter(Boolean);
        box.appendChild(h('div', { class: 'th-rounds' }, rl.slice(0, 4).map(function (x, i) { var t = MK.templates[x.template]; return h('div', { class: 'th-rd' }, h('b', null, String(i + 1)), t ? t.name : x.template); }))); break;
      case 'whack': var wq = (c.questions || [])[0] || { q: '', options: [] };
        box.appendChild(h('div', { class: 'th-q' }, MK.plain(wq.q)));
        box.appendChild(h('div', { class: 'th-wk' }, wq.options.slice(0, 3).map(function (o, i) { return h('span', { class: 'th-mole' + (i === 1 ? ' up' : '') }, h('b', null, MK.plain(o).slice(0, 12)), h('i')); }))); break;
      case 'balloon': var bp = (c.pairs || []);
        box.classList.add('th-sky');
        box.appendChild(h('div', { class: 'th-q' }, MK.plain((bp[0] || {}).b || '').slice(0, 40)));
        box.appendChild(h('div', { class: 'th-bls' }, bp.slice(0, 4).map(function (p, i) { return h('span', { class: 'th-bl b' + i, style: { marginTop: (i % 2 ? 14 : 0) + 'px' } }, MK.plain(p.a).slice(0, 10)); }))); break;
      case 'maze': box.appendChild(h('div', { class: 'th-mz' }, h('span', { class: 'z0' }, 'أ'), h('span', { class: 'z1' }, 'ب'), h('span', { class: 'z2' }, 'ج'), h('span', { class: 'z3' }, 'د'), h('i', { class: 'pl' }, '☺'), h('i', { class: 'gh' }, '👻'))); break;
      case 'plane': var pq = (c.questions || [])[0] || { q: '', options: [] };
        box.classList.add('th-sky');
        box.appendChild(h('div', { class: 'th-q' }, MK.plain(pq.q).slice(0, 40)));
        box.appendChild(h('div', { class: 'th-pl' }, h('span', { class: 'cl' }, MK.plain(pq.options[0] || '').slice(0, 14)), h('span', { class: 'cl b' }, MK.plain(pq.options[1] || '').slice(0, 14)), h('i', null, '✈'))); break;
      case 'fruit': var fq = (c.questions || [])[0] || { q: '', options: [] };
        box.classList.add('th-dark2');
        box.appendChild(h('div', { class: 'th-q' }, MK.plain(fq.q).slice(0, 40)));
        box.appendChild(h('div', { class: 'th-fr' }, fq.options.slice(0, 3).map(function (o, i) { return h('span', { class: 'f' + i }, MK.plain(o).slice(0, 10)); }))); break;
      case 'speedsort': var sg = c.groups || [];
        box.appendChild(h('div', { class: 'th-ss' }, h('span', { class: 'cd' }, MK.plain(((sg[0] || {}).items || [''])[0])), h('div', { class: 'bins' }, sg.slice(0, 3).map(function (g, i) { return h('b', { class: 'g' + i }, MK.plain(g.name).slice(0, 14)); })))); break;
      case 'wordsearch':
        var wg = h('div', { class: 'th-ws' }), AL = en ? 'ABCDEFGHIKLMNOPRSTUW' : 'ابتجحدرسصطعفقلمنهوي', w0 = ((c.words || [])[0] || '').replace(/[\u064B-\u065F\s]/g, '').slice(0, 6);
        for (var q2 = 0; q2 < 36; q2++) { var r2 = Math.floor(q2 / 6), c2 = q2 % 6, inW = r2 === 2 && c2 < w0.length; wg.appendChild(h('span', { class: inW ? 'hit' : '' }, inW ? w0[c2] : AL[(q2 * 7) % AL.length])); }
        box.appendChild(h('div', { class: 'th-cwrow' }, wg, h('div', { class: 'th-clue' }, (c.words || []).slice(0, 4).map(function (w, i) { return h('div', { class: i === 0 ? 'done' : '' }, w); })))); break;
    }
    var th = h('div', { class: 'th', 'data-theme': a.theme || 'seal', dir: en ? 'ltr' : 'rtl', 'aria-hidden': 'true' }, box);
    return th;
  };
})();
