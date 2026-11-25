/* مِسك الختام — الأدوات الأساسية: العناصر، الإعدادات، الثيمات، الشعار، الأصوات */
var MK = window.MK || {};
window.MK = MK;

(function () {
  // ---------- إنشاء العناصر ----------
  function h(tag, attrs) {
    var el = document.createElement(tag);
    attrs = attrs || {};
    for (var k in attrs) {
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'style' && typeof v === 'object') { for (var sk in v) { if (sk.slice(0, 2) === '--') el.style.setProperty(sk, v[sk]); else el.style[sk] = v[sk]; } }
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, v);
    }
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { append(el, x); }); return; }
    if (typeof c === 'string' || typeof c === 'number') el.appendChild(document.createTextNode(String(c)));
    else el.appendChild(c);
  }
  MK.h = h;
  MK.clear = function (el) { while (el.firstChild) el.removeChild(el.firstChild); return el; };
  MK.uid = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); };
  MK.shuffle = function (arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  };
  // الأرقام بالإنجليزية في كل الأداة
  MK.toArabicDigits = function (n) { return String(n).replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }); };
  MK.clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  MK.fmtDate = function (t) {
    try { return new Date(t).toLocaleDateString('ar-QA-u-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' }); }
    catch (e) { return ''; }
  };

  // ---------- أيقونات خطية ----------
  var P = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    play: '<path d="M7 4.5v15l12-7.5z"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    upload: '<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    back: '<path d="M9 6l6 6-6 6"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    full: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    sound: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
    mute: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/>',
    save: '<path d="M5 4h11l4 4v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',
    swap: '<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
    hint: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
    next: '<path d="M15 6l-6 6 6 6"/>',
    undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eraser: '<path d="M16 3l5 5-11 11H5l-2-2z"/><path d="M11 8l5 5M9 21h12"/>',
    quiz: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 9h10M7 13h4M14 13l1.5 1.5L18 12"/>',
    order: '<rect x="3" y="4" width="7" height="5" rx="1.5"/><rect x="14" y="4" width="7" height="5" rx="1.5"/><rect x="3" y="15" width="18" height="5" rx="1.5" stroke-dasharray="3 2"/><path d="M6.5 9.5v3M17.5 9.5v3"/>',
    redo: '<path d="M4 12a8 8 0 1 0 2.5-5.8L4 8.5"/><path d="M4 4v4.5h4.5"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.5-.2-.8-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5C21 6.4 17 3 12 3z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10" cy="7" r="1.2"/><circle cx="14.5" cy="7" r="1.2"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>',
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
    chat: '<path d="M4 5h16v10H9l-5 4z"/>',
    tag: '<path d="M3 12V4h8l9 9-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
    shuffle: '<path d="M4 7h3c5 0 5 10 10 10h3"/><path d="M4 17h3c2 0 3-1.5 4-3"/><path d="M14 9c1-1.3 2-2 3-2h3"/><path d="M18 5l2 2-2 2M18 15l2 2-2 2"/>',
    tv: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M8 3l4 3 4-3"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M3 18l6-5 4 3 3-2 5 4"/>',
    cards: '<rect x="3" y="6" width="12" height="15" rx="2"/><path d="M8 3h11a2 2 0 0 1 2 2v13"/>'
  };
  MK.icon = function (name) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('class', 'i-' + name);
    s.setAttribute('fill', name === 'play' ? 'currentColor' : 'none');
    s.setAttribute('stroke', 'currentColor');
    s.setAttribute('stroke-width', '2');
    s.setAttribute('stroke-linecap', 'round');
    s.setAttribute('stroke-linejoin', 'round');
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = P[name] || '';
    return s;
  };

  // ---------- الشعار: القطعة الأخيرة ----------
  MK.logo = function (size, opts) {
    opts = opts || {};
    var face = opts.face;
    var wrap = h('span', { class: 'logo', role: opts.decor ? null : 'img', 'aria-label': opts.decor ? null : 'شعار مسك الختام', 'aria-hidden': opts.decor ? 'true' : null });
    var r = (document.body.getAttribute('data-theme') === 'fun') ? 20 : (document.body.getAttribute('data-theme') === 'waha' ? 16 : 16);
    var inner =
      '<rect x="20" y="20" width="76" height="76" rx="' + r + '" style="fill:var(--p1)"/>' +
      '<rect x="104" y="20" width="76" height="76" rx="' + r + '" style="fill:var(--p2)"/>' +
      '<rect x="20" y="104" width="76" height="76" rx="' + r + '" style="fill:var(--p3)"/>' +
      '<circle cx="100" cy="58" r="13" style="fill:var(--p1)"/>' +
      '<circle cx="58" cy="100" r="13" style="fill:var(--p3)"/>' +
      '<g transform="translate(12 12) rotate(10 142 142)">' +
      '<path d="M142 84 C150 96 155 102 155 108 A13 13 0 0 1 129 108 C129 102 134 96 142 84 Z" style="fill:var(--gold)"/>' +
      '<rect x="104" y="104" width="76" height="76" rx="' + r + '" style="fill:var(--gold)"/>' +
      (face
        ? '<circle cx="129" cy="133" r="6" fill="#fff"/><circle cx="155" cy="133" r="6" fill="#fff"/><circle cx="130" cy="134" r="3" style="fill:var(--ink)"/><circle cx="156" cy="134" r="3" style="fill:var(--ink)"/><path d="M128 152 Q142 164 156 152" fill="none" style="stroke:var(--ink)" stroke-width="4" stroke-linecap="round"/>'
        : '<path d="M126 142 L137 153 L158 130" fill="none" style="stroke:var(--check)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>') +
      '</g>';
    wrap.innerHTML = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 200 200">' + inner + '</svg>';
    return wrap;
  };

  // ---------- الثيمات ----------
  MK.themes = [
    { id: 'seal', name: '1', sw: ['#5B1A2E', '#C9A24B', '#5E6B3A'] },
    { id: 'rawda', name: '2', sw: ['#1E6B4E', '#6E9E5B', '#C9A24B'] },
    { id: 'waha', name: '3', sw: ['#0E8C8C', '#E2702A', '#4F7A3A'] },
    { id: 'fun', name: '4', sw: ['#6B3FD4', '#12B5A8', '#FF7A1A'] }
  ];
  MK.setTheme = function (id) {
    if (!MK.themes.some(function (t) { return t.id === id; })) id = 'seal';
    document.body.setAttribute('data-theme', id);
  };
  // «ألوان العرض»: دوائر مرقّمة 1–4، لون كل دائرة من ألوان ثيمها
  MK.themePicker = function (current, onPick) {
    var box = h('div', { class: 'theme-pick', role: 'radiogroup', 'aria-label': 'ألوان العرض' });
    MK.themes.forEach(function (t) {
      var bg = 'conic-gradient(' + t.sw[0] + ' 0 50%,' + t.sw[1] + ' 0 75%,' + t.sw[2] + ' 0)';
      var b = h('button', { type: 'button', class: 'theme-num' + (t.id === current ? ' on' : ''), role: 'radio', 'aria-checked': t.id === current ? 'true' : 'false', 'aria-label': 'ألوان ' + t.name, style: { background: bg } }, h('span', null, t.name));
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(box.children, function (c) { c.classList.remove('on'); c.setAttribute('aria-checked', 'false'); });
        b.classList.add('on'); b.setAttribute('aria-checked', 'true');
        onPick(t.id);
      });
      box.appendChild(b);
    });
    return box;
  };
  // أزرار اختيار بدل القوائم المنسدلة
  MK.choice = function (opts, current, onPick, o) {
    o = o || {};
    var sel = o.multi ? (current || []).slice() : current;
    var box = h('div', { class: 'choice' + (o.cls ? ' ' + o.cls : ''), role: o.multi ? 'group' : 'radiogroup', 'aria-label': o.label || null });
    var btns = opts.map(function (op) {
      var b = h('button', { type: 'button', class: 'ch' }, op.label);
      b.addEventListener('click', function () {
        if (o.multi) { var i = sel.indexOf(op.value); if (i >= 0) sel.splice(i, 1); else sel.push(op.value); }
        else sel = op.value;
        draw(); onPick(o.multi ? sel.slice() : sel);
      });
      box.appendChild(b);
      return b;
    });
    function draw() {
      btns.forEach(function (b, i) {
        var on = o.multi ? sel.indexOf(opts[i].value) >= 0 : sel === opts[i].value;
        b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }
    draw();
    box.set = function (v) { sel = o.multi ? (v || []).slice() : v; draw(); };
    return box;
  };

  // ---------- الإعدادات ----------
  var SKEY = 'misk.settings';
  MK.settings = (function () {
    var d = { theme: 'seal', volume: 0.7, muted: false };
    try { var s = JSON.parse(localStorage.getItem(SKEY) || '{}'); Object.assign(d, s); } catch (e) { }
    return d;
  })();
  MK.saveSettings = function () { try { localStorage.setItem(SKEY, JSON.stringify(MK.settings)); } catch (e) { } };

  // ---------- النوافذ والتنبيهات ----------
  MK.toast = function (msg) {
    var t = h('div', { class: 'toast', role: 'status' }, msg);
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2600);
  };
  MK.modal = function (title, body, actions) {
    var bg = h('div', { class: 'modal-bg' });
    var close = function () { bg.remove(); document.removeEventListener('keydown', onKey); };
    var onKey = function (e) { if (e.key === 'Escape') close(); };
    var acts = h('div', { class: 'actions' });
    (actions || [{ label: 'إغلاق' }]).forEach(function (a) {
      acts.appendChild(h('button', { type: 'button', class: 'btn ' + (a.cls || ''), onclick: function () { var r = a.onClick ? a.onClick() : null; if (r !== false) close(); } }, a.label));
    });
    var m = h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': title }, h('h2', null, title), body, acts);
    bg.appendChild(m);
    bg.addEventListener('click', function (e) { if (e.target === bg) close(); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(bg);
    var f = m.querySelector('input,button'); if (f) f.focus();
    return close;
  };
  MK.confirm = function (title, text, okLabel, onOk, danger) {
    MK.modal(title, h('p', null, text), [
      { label: okLabel, cls: danger ? 'danger' : '', onClick: onOk },
      { label: 'إلغاء', cls: 'ghost' }
    ]);
  };

  // ---------- الاحتفال ----------
  MK.confetti = function (n) {
    n = n || 70;
    var cs = getComputedStyle(document.body);
    var colors = ['--p1', '--p2', '--p3', '--gold', '--primary'].map(function (v) { return cs.getPropertyValue(v).trim(); });
    for (var i = 0; i < n; i++) {
      var c = h('i', { class: 'confetti' });
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = colors[i % colors.length];
      c.style.animationDuration = (2 + Math.random() * 2) + 's';
      c.style.animationDelay = (Math.random() * 0.6) + 's';
      c.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
      document.body.appendChild(c);
      (function (el) { setTimeout(function () { el.remove(); }, 5000); })(c);
    }
  };

  // ---------- الأصوات (مولّدة بالبرمجة) ----------
  var ctx = null;
  function ac() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function vol() { return MK.settings.muted ? 0 : MK.settings.volume; }
  function tone(freq, start, dur, type, gain, slideTo) {
    var a = ac(); if (!a || !vol()) return;
    var t0 = a.currentTime + start;
    var o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime((gain || 0.3) * vol(), t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(a.destination);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function noise(start, dur, gain, fromHz, toHz) {
    var a = ac(); if (!a || !vol()) return;
    var t0 = a.currentTime + start;
    var len = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    var src = a.createBufferSource(); src.buffer = buf;
    var f = a.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2;
    f.frequency.setValueAtTime(fromHz, t0); f.frequency.exponentialRampToValueAtTime(toHz, t0 + dur);
    var g = a.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime((gain || 0.2) * vol(), t0 + dur * 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(a.destination);
    src.start(t0); src.stop(t0 + dur);
  }
  MK.sound = {
    correct: function () { tone(784, 0, 0.18, 'triangle', 0.35); tone(1175, 0.11, 0.35, 'triangle', 0.3); tone(1568, 0.22, 0.4, 'sine', 0.12); },
    wrong: function () { tone(330, 0, 0.2, 'sine', 0.3, 260); tone(247, 0.16, 0.32, 'sine', 0.28, 196); },
    tick: function () { tone(1400, 0, 0.04, 'square', 0.06); },
    tock: function () { tone(880, 0, 0.06, 'triangle', 0.18); },
    click: function () { tone(660, 0, 0.06, 'triangle', 0.15, 880); },
    pick: function () { tone(520, 0, 0.07, 'sine', 0.22, 700); },
    drop: function () { tone(300, 0, 0.09, 'sine', 0.35, 160); noise(0, 0.05, 0.05, 2000, 800); },
    erase: function () { noise(0, 0.45, 0.22, 3000, 600); },
    reveal: function () { tone(988, 0, 0.12, 'sine', 0.2); tone(1319, 0.08, 0.2, 'sine', 0.15); },
    flip: function () { noise(0, 0.12, 0.15, 900, 3500); },
    pop: function () { noise(0, 0.08, 0.5, 2500, 400); tone(900, 0, 0.05, 'triangle', 0.2, 300); },
    whack: function () { tone(160, 0, 0.1, 'square', 0.3, 70); noise(0, 0.07, 0.35, 1200, 200); },
    slice: function () { noise(0, 0.18, 0.25, 6000, 1500); tone(1800, 0.02, 0.08, 'sine', 0.08, 2600); },
    clap: function () { for (var i = 0; i < 14; i++) noise(0.05 + i * 0.075 + Math.random() * 0.03, 0.05, 0.18 + Math.random() * 0.12, 2600, 1200); },
    streak: function () { [659, 880, 1175, 1568].forEach(function (f, i) { tone(f, i * 0.07, 0.16, 'triangle', 0.22); }); },
    count: function () { tone(1046, 0, 0.08, 'square', 0.1); },
    swoosh: function () { noise(0, 0.22, 0.12, 700, 3200); },
    timeup: function () { tone(523, 0, 0.18, 'square', 0.12); tone(392, 0.2, 0.18, 'square', 0.12); tone(262, 0.4, 0.4, 'square', 0.12); },
    win: function () {
      [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * 0.12, 0.3, 'triangle', 0.3); });
      tone(1047, 0.5, 0.7, 'triangle', 0.25); tone(1319, 0.5, 0.7, 'sine', 0.18); tone(1568, 0.5, 0.8, 'sine', 0.12);
      noise(0.48, 0.5, 0.08, 6000, 3000);
    }
  };
})();
