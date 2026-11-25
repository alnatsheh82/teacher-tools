/* مِسك الختام — استيراد الأسئلة باللصق أو من ملف Word (.docx)، بلا إنترنت */
(function () {
  var MK = window.MK, h = MK.h, ar = MK.toArabicDigits;

  // ---------- قراءة ملف Word ----------
  function unzipEntry(buf, name) {
    var dv = new DataView(buf), eocd = -1;
    for (var i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 65557); i--) { if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; } }
    if (eocd < 0) return Promise.reject(new Error('zip'));
    var count = dv.getUint16(eocd + 10, true), p = dv.getUint32(eocd + 16, true), dec = new TextDecoder();
    for (var k = 0; k < count; k++) {
      if (dv.getUint32(p, true) !== 0x02014b50) break;
      var method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true);
      var nlen = dv.getUint16(p + 28, true), elen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true), lho = dv.getUint32(p + 42, true);
      var fname = dec.decode(new Uint8Array(buf, p + 46, nlen));
      if (fname === name) {
        var start = lho + 30 + dv.getUint16(lho + 26, true) + dv.getUint16(lho + 28, true);
        var data = new Uint8Array(buf, start, csize);
        if (method === 0) return Promise.resolve(dec.decode(data));
        var ds = new DecompressionStream('deflate-raw');
        return new Response(new Blob([data]).stream().pipeThrough(ds)).arrayBuffer().then(function (b) { return dec.decode(b); });
      }
      p += 46 + nlen + elen + clen;
    }
    return Promise.reject(new Error('nodoc'));
  }
  MK.unzip = unzipEntry;
  // يحوّل المستند إلى أسطر، ويضع * بعد السطر المظلَّل أو المكتوب كله بخط عريض أو تحته خط
  MK.readDocx = function (file) {
    return file.arrayBuffer().then(function (buf) { return unzipEntry(buf, 'word/document.xml'); }).then(function (xml) {
      var doc = new DOMParser().parseFromString(xml, 'application/xml');
      var ps = doc.getElementsByTagName('w:p'), lines = [];
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i], txt = '', runs = p.getElementsByTagName('w:r'), marked = 0, textRuns = 0;
        for (var r = 0; r < runs.length; r++) {
          var run = runs[r], rt = '';
          for (var c = 0; c < run.childNodes.length; c++) {
            var n = run.childNodes[c];
            if (n.nodeName === 'w:t') rt += n.textContent;
            else if (n.nodeName === 'w:tab') rt += '\t';
            else if (n.nodeName === 'w:br') rt += '\n';
          }
          if (rt.trim()) {
            textRuns++;
            var rpr = run.getElementsByTagName('w:rPr')[0];
            if (rpr && (rpr.getElementsByTagName('w:highlight').length || rpr.getElementsByTagName('w:u').length ||
              (rpr.getElementsByTagName('w:b').length && rpr.getElementsByTagName('w:b')[0].getAttribute('w:val') !== '0'))) marked++;
          }
          txt += rt;
        }
        txt = txt.replace(/\s+$/, '');
        if (textRuns && marked === textRuns && txt.trim() && txt.indexOf('*') < 0) txt += ' *';
        lines.push(txt);
      }
      return lines.join('\n');
    });
  };

  // ---------- أدوات التحليل ----------
  var reNum = /^\s*(?:\(?\s*[0-9٠-٩]{1,3}\s*[\)\-–ـ.:]\s*|\[\s*[0-9٠-٩]{1,3}\s*\]\s*|(?:س|السؤال)\s*[0-9٠-٩]{1,3}\s*[:\-–ـ.)]?\s*)/;
  var reOpt = /^\s*\(?\s*(أ|ا|ب|ج|د|هـ|ه|و|ز|[a-fA-F])\s*[\)\-–ـ.]\s*/;
  var reStar = /\s*[\*✱]\s*$|^\s*[\*✱]\s*/;
  function lines(text) { return (text || '').replace(/\r/g, '').split('\n').map(function (s) { return s.replace(/\t+/g, ' ').trim(); }); }
  function strip(s) { return s.replace(reNum, '').trim(); }
  function isQuestion(s) { return reNum.test(s) || /[؟?:]\s*\*?\s*$/.test(s); }

  var P = {};
  P.quiz = function (text) {
    var out = [], cur = null, unknown = 0;
    function close() {
      if (cur && cur.opts.length >= 2) {
        var stars = cur.opts.map(function (o, i) { return o.star ? i : -1; }).filter(function (i) { return i >= 0; });
        var cor = stars.length >= 1 && stars.length < cur.opts.length ? stars[0] : 0;
        if (!(stars.length >= 1 && stars.length < cur.opts.length)) unknown++;
        out.push({ q: cur.q, options: cur.opts.slice(0, 6).map(function (o) { return o.t; }), correct: Math.min(cor, 5) });
      }
      cur = null;
    }
    lines(text).forEach(function (L) {
      if (!L) { if (cur && cur.opts.length >= 2) close(); return; }
      var star = reStar.test(L), clean = L.replace(reStar, '').trim();
      // خيارات في سطر واحد: أ) ... ب) ...
      var inline = clean.split(/\s+(?=\(?(?:أ|ب|ج|د|هـ)\s*[\)\-])/);
      if (cur && inline.length > 1 && reOpt.test(inline[0])) {
        inline.forEach(function (x) { var st = /\*/.test(x); cur.opts.push({ t: x.replace(reOpt, '').replace(/\*/g, '').trim(), star: st }); });
        return;
      }
      if (reOpt.test(clean) && cur) { cur.opts.push({ t: clean.replace(reOpt, '').trim(), star: star }); return; }
      if (isQuestion(clean) && !(cur && cur.opts.length === 0 && !cur.q)) { close(); cur = { q: strip(clean), opts: [] }; return; }
      if (cur) cur.opts.push({ t: clean, star: star });
      else cur = { q: strip(clean), opts: [] };
    });
    close();
    return { items: out, note: unknown ? 'لم تُحدَّد الإجابة الصحيحة في ' + ar(unknown) + ' سؤال، فجُعل الخيار الأول صحيحًا. صحّحها في المحرّر، أو ضع * بجانب الإجابة الصحيحة.' : '' };
  };
  var reT = /[\(\[]?\s*(صح|صحيحة|صحيح|ص|✓|✔|√|T|True)\s*[\)\]]?\s*\.?$/i, reF = /[\(\[]?\s*(خطأ|خطا|خاطئة|خاطئ|خ|✗|✘|×|X|F|False)\s*[\)\]]?\s*\.?$/i;
  P.tf = function (text) {
    var out = [], unknown = 0;
    lines(text).forEach(function (L) {
      if (!L) return;
      var s = strip(L), ans = null;
      var mt = s.match(reT), mf = s.match(reF);
      if (mt && (mt[0].length < s.length)) { ans = true; s = s.slice(0, s.length - mt[0].length); }
      else if (mf && (mf[0].length < s.length)) { ans = false; s = s.slice(0, s.length - mf[0].length); }
      s = s.replace(/[\-–:(\[]\s*$/, '').trim();
      if (!s) return;
      if (ans === null) { unknown++; ans = true; }
      out.push({ text: s, answer: ans });
    });
    return { items: out, note: unknown ? 'لم يُحدَّد الحكم في ' + ar(unknown) + ' عبارة، فجُعلت صحيحة. صحّحها، أو اكتب (صح) أو (خطأ) في آخر كل عبارة.' : '' };
  };
  function pairs(text, keepSlash) {
    var out = [], noB = 0;
    lines(text).forEach(function (L) {
      if (!L) return;
      var s = strip(L);
      var m = s.match(/^(.+?)\s*(?:[:：=]|\s[-–—]\s|\t)\s*(.+)$/);
      if (m) out.push({ a: m[1].trim(), b: m[2].trim() });
      else { out.push({ a: s, b: '' }); noB++; }
    });
    return { items: out, noB: noB };
  }
  var pairNote = function (r) { return r.noB ? 'في ' + ar(r.noB) + ' سطر لم يُعثر على فاصل بين المصطلح والتعريف. اكتب: المصطلح: التعريف' : ''; };
  P.match = function (t) { var r = pairs(t); return { items: r.items.map(function (p) { return { a: p.a, b: p.b }; }), note: pairNote(r) }; };
  P.unjumble = function (t) { var r = pairs(t, true); return { items: r.items.map(function (p) { return { term: p.a, definition: p.b }; }), note: pairNote(r) }; };
  P.flash = function (t) { var r = pairs(t); return { items: r.items.map(function (p) { return { front: p.a, back: p.b }; }), note: pairNote(r) }; };
  P.boxes = function (t) { var r = pairs(t); return { items: r.items.map(function (p) { return { q: p.a, a: p.b }; }), note: '' }; };
  P.wheel = function (t) { return { items: lines(t).filter(Boolean).map(strip).filter(Boolean), note: '' }; };
  function blocks(t) { return (t || '').replace(/\r/g, '').split(/\n\s*\n/).map(function (b) { return b.trim(); }).filter(Boolean); }
  P.erase = function (t) { return { items: blocks(t).map(function (b) { return { intro: '', text: b.replace(/\s*\n\s*/g, ' '), source: '' }; }), note: '' }; };
  P.cloze = function (t) {
    var bs = blocks(t), noBr = bs.filter(function (b) { return b.indexOf('[') < 0; }).length;
    return { items: bs.map(function (b) { return { text: b.replace(/\s*\n\s*/g, ' '), extra: '' }; }), note: noBr ? 'لم تُحدَّد فراغات في ' + ar(noBr) + ' نص. ضع الكلمات المحذوفة بين [ ] في المحرّر.' : '' };
  };
  var KEY = { quiz: 'questions', tf: 'items', match: 'pairs', unjumble: 'items', flash: 'cards', boxes: 'items', wheel: 'items', erase: 'texts', cloze: 'texts' };
  var HELP = {
    quiz: 'السؤال في سطر، وتحته الخيارات كل خيار في سطر (أ) ب) ج) د) أو بلا ترقيم). ضع * بجانب الإجابة الصحيحة.\nمثال:\n1- من راوي الحديث؟\nأ) عمر بن الخطاب *\nب) أبو هريرة',
    tf: 'كل عبارة في سطر، وفي آخرها (صح) أو (خطأ).\nمثال:\nالنية محلها القلب (صح)',
    match: 'كل زوج في سطر: المصطلح: ما يطابقه.\nمثال:\nالنية: عزم القلب على فعل العبادة',
    unjumble: 'كل تعريف في سطر: المصطلح: التعريف. ويمكن وضع / بين أجزاء التعريف.\nمثال:\nالنية: عزم القلب / على فعل العبادة / تقربًا إلى الله',
    flash: 'كل بطاقة في سطر: الوجه الأمامي: الوجه الخلفي.',
    boxes: 'كل صندوق في سطر: السؤال، ويمكن إضافة الإجابة بعد نقطتين.\nمثال:\nما معنى النية؟: عزم القلب',
    wheel: 'كل عنصر في سطر (أسئلة أو أسماء طلاب).',
    erase: 'الصق النص كما هو. وإن كان أكثر من نص فافصل بينها بسطر فارغ.',
    cloze: 'الصق النص، وضع الكلمات المحذوفة بين [ ]. وافصل بين النصوص بسطر فارغ.'
  };

  // ---------- نافذة الاستيراد ----------
  MK.openImport = function (act, onDone) {
    var tid = act.template, parse = P[tid];
    if (!parse) return;
    var ta = h('textarea', { rows: 10, style: { width: '100%', minHeight: '200px', padding: '12px', borderRadius: '12px', border: '2px solid var(--line)', background: 'var(--bg)', lineHeight: '1.8' }, placeholder: 'الصق هنا الأسئلة من ورقة العمل…' });
    var fileIn = h('input', { type: 'file', accept: '.docx', class: 'hidden' });
    var prev = h('div', { class: 'import-prev', 'aria-live': 'polite' });
    var note = h('div', { class: 'err' });
    var result = { items: [] };
    function update() {
      result = parse(ta.value);
      MK.clear(prev);
      note.textContent = result.note || '';
      if (!result.items.length) { prev.appendChild(h('div', { class: 'hint' }, ta.value.trim() ? 'لم تُفهم أي أسئلة بعد. راجع الصيغة في التعليمات.' : '')); return; }
      prev.appendChild(h('strong', null, 'عدد ما فُهم: ' + ar(result.items.length)));
      var ol = h('ol');
      result.items.slice(0, 40).forEach(function (it) { ol.appendChild(h('li', null, describe(tid, it))); });
      prev.appendChild(ol);
    }
    ta.addEventListener('input', update);
    fileIn.addEventListener('change', function () {
      var f = fileIn.files[0]; if (!f) return;
      MK.checkFile(f, 'docx').then(function () { return MK.readDocx(f); }).then(function (t) { ta.value = t; update(); MK.toast('قُرئ الملف «' + f.name + '»'); })
        .catch(function (m) { MK.fileError(typeof m === 'string' ? m : 'تعذّرت قراءة الملف. تأكد أنه ملف Word بصيغة ‎.docx سليم.'); });
      fileIn.value = '';
    });
    var body = h('div', null,
      h('p', { class: 'hint', style: { whiteSpace: 'pre-line', color: 'var(--muted)', marginTop: 0 } }, HELP[tid]),
      h('div', { style: { display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' } },
        h('button', { type: 'button', class: 'btn soft', onclick: function () { fileIn.click(); } }, MK.icon('upload'), 'افتح ملف Word'), fileIn),
      ta, note, prev);
    MK.modal('استيراد إلى «' + MK.templates[tid].name + '»', body, [
      { label: 'أضف إلى النشاط', onClick: function () { return apply(false); } },
      { label: 'استبدل المحتوى', cls: 'ghost', onClick: function () { return apply(true); } },
      { label: 'إلغاء', cls: 'soft' }
    ]);
    document.querySelector('.modal').classList.add('wide');
    function apply(replace) {
      update();
      if (!result.items.length) { MK.toast('لا يوجد ما يُستورد'); return false; }
      var k = KEY[tid], arr = act.content[k];
      if (tid === 'wheel') {
        act.content.items = (replace ? [] : act.content.items.filter(Boolean)).concat(result.items);
      } else {
        // احذف العناصر الفارغة التي يبدأ بها النشاط الجديد
        var kept = replace ? [] : arr.filter(function (x) { return !isBlank(x); });
        act.content[k] = kept.concat(result.items);
      }
      MK.toast('تمت الإضافة: ' + ar(result.items.length));
      onDone();
    }
  };
  function isBlank(x) {
    if (typeof x === 'string') return !x.trim();
    return Object.keys(x).every(function (k) { var v = x[k]; return typeof v !== 'string' || !v.trim() || k === 'extra'; }) &&
      !(x.options && x.options.some(function (o) { return o.trim(); }));
  }
  var DESCX = {};
  function describe(tid, it) {
    if (DESCX[tid]) return DESCX[tid](it);
    switch (tid) {
      case 'quiz': return h('span', null, it.q, ' ← ', h('span', { style: { color: 'var(--ok)', fontWeight: 700 } }, it.options[it.correct]), ' (' + ar(it.options.length) + ' خيارات)');
      case 'tf': return it.text + ' ← ' + (it.answer ? 'صح' : 'خطأ');
      case 'match': return it.a + ' ← ' + (it.b || '؟');
      case 'unjumble': return it.term + ' ← ' + (it.definition || '؟');
      case 'flash': return it.front + ' ← ' + (it.back || '؟');
      case 'boxes': return it.q + (it.a ? ' ← ' + it.a : '');
      case 'wheel': return it;
      default: return (it.text || '').slice(0, 120);
    }
  }
  MK.canImport = function (tid) { return !!P[tid]; };
  MK.addImport = function (tid, key, help, parse, desc) { P[tid] = parse; KEY[tid] = key; HELP[tid] = help; if (desc) DESCX[tid] = desc; };
  MK.importParsers = P;
})();
