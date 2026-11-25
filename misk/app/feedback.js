/* مِسك الختام — الإعدادات المسبقة: الوقت والدرجة وعبارات التهنئة المتدرجة */
(function () {
  var MK = window.MK, h = MK.h;

  MK.FB_DEFAULT = {
    timer: 20, points: 10,
    t1: 90, t2: 65, t3: 50,
    praise: { ar: 'أحسنت!\nبارك الله فيك\nإجابة موفقة\nممتاز!', en: 'Well done!\nGreat job!\nExcellent!\nCorrect!' },
    tiers: {
      ar: ['ما شاء الله! أحسنت يا {الاسم}', 'جيد جدًا يا {الاسم}، واصل التقدّم', 'جيد يا {الاسم}، تحتاج إلى قليل من المراجعة', 'محاولة طيبة يا {الاسم}، لنراجع الدرس معًا'],
      en: ['Excellent work, {name}!', 'Very good, {name}! Keep going', 'Good, {name}. A little more review', 'Nice try, {name}. Let\'s review together']
    }
  };
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  if (!MK.settings.fb) MK.settings.fb = clone(MK.FB_DEFAULT);
  (function fill(t, d) { Object.keys(d).forEach(function (k) { if (t[k] == null) t[k] = clone(d[k]); else if (typeof d[k] === 'object' && !Array.isArray(d[k])) fill(t[k], d[k]); }); })(MK.settings.fb, MK.FB_DEFAULT);

  // الإعدادات الفعلية لنشاط: الافتراضية العامة أو المخصّصة له
  MK.fb = function (act) {
    var g = MK.settings.fb, s = (act && act.settings) || {};
    var o = s.fbCustom && s.fb ? s.fb : g;
    return { praise: o.praise || g.praise, tiers: o.tiers || g.tiers, t1: +g.t1, t2: +g.t2, t3: +g.t3, points: +(s.points || g.points || 10) };
  };
  function lines(s) { return String(s || '').split(/\n+/).map(function (x) { return x.trim(); }).filter(Boolean); }

  // الشريحة: 0 أعلى … 3 أدنى
  MK.tierOf = function (ratio, act) {
    var f = MK.fb(act), p = ratio * 100;
    return p >= f.t1 ? 0 : p >= f.t2 ? 1 : p >= f.t3 ? 2 : 3;
  };
  MK.endPhrase = function (tier, name, act) {
    var f = MK.fb(act), L = MK.lang === 'en' ? 'en' : 'ar';
    var s = (f.tiers[L] || MK.FB_DEFAULT.tiers[L])[tier] || '';
    if (name) return s.replace(/\{الاسم\}|\{name\}/g, name);
    return s.replace(/\s*(يا|،|,)?\s*\{الاسم\}|,?\s*\{name\}/g, '').replace(/\s+([!،,.])/g, '$1').replace(/^[،,\s]+|[،,\s]+$/g, '').trim();
  };
  MK.praiseText = function (act) {
    var f = MK.fb(act), L = MK.lang === 'en' ? 'en' : 'ar';
    var arr = lines(f.praise[L]); if (!arr.length) arr = lines(MK.FB_DEFAULT.praise[L]);
    return arr[Math.floor(Math.random() * arr.length)];
  };
  var lastPraise = 0;
  MK.showPraise = function (stage, act, text, cls) {
    var now = Date.now(); if (!text && now - lastPraise < 900) return; lastPraise = now;
    var old = stage.querySelector('.praise'); if (old) old.remove();
    var el = h('div', { class: 'praise' + (cls ? ' ' + cls : ''), 'aria-live': 'polite' }, text || MK.praiseText(act));
    stage.appendChild(el);
    setTimeout(function () { el.remove(); }, 1700);
  };

  // واجهة تعديل العبارات (تُستخدم في الإعدادات العامة وفي محرر النشاط)
  MK.fbEditor = function (o, onChange) {
    function ta(obj, key, rows) {
      var t = h('textarea', { rows: rows || 3 }); t.value = obj[key] || '';
      t.addEventListener('input', function () { obj[key] = t.value; onChange(); });
      return t;
    }
    function tierFields(L) {
      var arr = o.tiers[L];
      return h('div', { class: 'fb-tiers', dir: L === 'en' ? 'ltr' : 'rtl' }, arr.map(function (s, i) {
        var inp = h('input', { type: 'text', value: s });
        inp.addEventListener('input', function () { arr[i] = inp.value; onChange(); });
        return h('div', { class: 'fb-tier t' + i }, h('span', { class: 'fb-dot' }), inp);
      }));
    }
    var langBox = h('div');
    function draw(L) {
      MK.clear(langBox);
      langBox.appendChild(h('div', { class: 'field' }, h('label', null, L === 'en' ? 'عند الإجابة الصحيحة (English) — عبارة في كل سطر' : 'عند الإجابة الصحيحة — عبارة في كل سطر، تظهر إحداها عشوائيًا'),
        (function () { var t = ta(o.praise, L, 3); t.dir = L === 'en' ? 'ltr' : 'rtl'; return t; })()));
      langBox.appendChild(h('div', { class: 'field' }, h('label', null, 'شاشة النهاية حسب النتيجة'), tierFields(L),
        h('div', { class: 'hint' }, L === 'en' ? 'Use {name} for the student or team name.' : 'اكتب {الاسم} في مكان اسم الطالب أو الفريق، ويُحذف تلقائيًا إن لم يوجد اسم.')));
    }
    var tabs = MK.choice([{ value: 'ar', label: 'العربية' }, { value: 'en', label: 'English' }], 'ar', draw, { label: 'لغة العبارات' });
    draw('ar');
    return h('div', { class: 'fb-editor' }, tabs, langBox);
  };

  // قسم الإعدادات العامة
  MK.fbSettingsSection = function () {
    var g = MK.settings.fb;
    function save() { MK.saveSettings(); }
    function num(key, list, label) {
      return MK.choice(list.map(function (v) { return { value: v, label: v ? String(v) : 'بلا' }; }), +g[key], function (v) { g[key] = v; save(); }, { label: label });
    }
    function thr(key) {
      var i = h('input', { type: 'number', min: 1, max: 100, value: g[key], class: 'thr' });
      i.addEventListener('input', function () { var v = Math.max(1, Math.min(100, +i.value || 0)); g[key] = v; save(); legend(); });
      return i;
    }
    var leg = h('div', { class: 'fb-legend' });
    function legend() {
      MK.clear(leg);
      [['t0', g.t1 + '% فأكثر'], ['t1', g.t2 + '% – ' + (g.t1 - 1) + '%'], ['t2', g.t3 + '% – ' + (g.t2 - 1) + '%'], ['t3', 'أقل من ' + g.t3 + '%']].forEach(function (x) {
        leg.appendChild(h('span', { class: 'fb-tier-lbl ' + x[0] }, h('span', { class: 'fb-dot' }), x[1]));
      });
    }
    legend();
    return h('div', { class: 'fb-settings' },
      h('div', { class: 'field' }, h('label', null, 'الوقت الافتراضي لكل سؤال (بالثواني)'), num('timer', [0, 10, 15, 20, 30, 45, 60, 90], 'الوقت')),
      h('div', { class: 'field' }, h('label', null, 'درجة كل سؤال'), num('points', [1, 2, 5, 10, 20, 50, 100], 'الدرجة')),
      h('div', { class: 'field' }, h('label', null, 'حدود الشرائح (نسبة الإجابات الصحيحة)'),
        h('div', { class: 'thr-row' }, h('span', { class: 'thr-item' }, 'الأولى: من', thr('t1'), '%'), h('span', { class: 'thr-item' }, 'الثانية: من', thr('t2'), '%'), h('span', { class: 'thr-item' }, 'الثالثة: من', thr('t3'), '%')), leg),
      MK.fbEditor(g, save),
      h('button', { type: 'button', class: 'btn small ghost', style: { alignSelf: 'flex-start' }, onclick: function () {
        MK.settings.fb = clone(MK.FB_DEFAULT); save(); MK.toast('أُعيدت العبارات الافتراضية'); var p = this.closest('.fb-settings'); p.replaceWith(MK.fbSettingsSection());
      } }, MK.icon('redo'), 'استرجع الافتراضي'));
  };
})();
