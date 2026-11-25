/* مِسك الختام — الألعاب الحركية: اضرب الخلد، فرقعة البالونات، مطاردة المتاهة، الطائرة، الفاكهة الطائرة، التصنيف السريع */
(function () {
  var MK = window.MK, h = MK.h, ar = MK.toArabicDigits, U = MK.ui, X = MK.ui3;
  var toggle = U.toggle;
  var T = function (s) { return MK.t(s); };
  var LET = ['أ', 'ب', 'ج', 'د', 'هـ', 'و'];
  MK.EN = MK.EN || {};
  Object.assign(MK.EN, {
    'اضرب الخلد': 'Whack-a-mole', 'فرقعة البالونات': 'Balloon Pop', 'مطاردة المتاهة': 'Maze Chase', 'الطائرة': 'Airplane',
    'الفاكهة الطائرة': 'Flying Fruit', 'التصنيف السريع': 'Speed Sorting', 'استعد…': 'Get ready…', 'انطلق!': 'Go!',
    'الإجابة الصحيحة: ': 'Correct answer: ', 'انتهت المحاولات': 'Out of lives', 'اضغط في المتاهة أو استخدم الأسهم': 'Tap the maze or use the arrow keys',
    'اسحب الطائرة للأعلى والأسفل': 'Drag the plane up and down', 'اقطع الفاكهة الصحيحة': 'Slice the right fruit', 'اضرب الخلد الذي يحمل الإجابة الصحيحة': 'Whack the mole with the right answer',
    'فرقع البالون المطابق': 'Pop the matching balloon', 'أرسل البطاقة إلى مجموعتها': 'Send the card to its group'
  });

  // ====== رسومات الألعاب (SVG داخل الأداة) ======
  function svgEl(markup, cls) { var d = document.createElement('span'); d.className = cls; d.innerHTML = markup; return d; }
  var ART = {
    mole: '<svg viewBox="0 0 100 92"><ellipse cx="50" cy="60" rx="40" ry="36" fill="#8a5a3c"/><ellipse cx="50" cy="70" rx="25" ry="22" fill="#c99a72"/><circle cx="35" cy="45" r="9" fill="#fff"/><circle cx="65" cy="45" r="9" fill="#fff"/><circle cx="36" cy="46" r="5.5" fill="#1b120c"/><circle cx="64" cy="46" r="5.5" fill="#1b120c"/><circle cx="38" cy="44" r="1.8" fill="#fff"/><circle cx="66" cy="44" r="1.8" fill="#fff"/><ellipse cx="50" cy="58" rx="8" ry="6" fill="#e5788c"/><path d="M45 66 q5 5 10 0" stroke="#5a3520" stroke-width="2.5" fill="none" stroke-linecap="round"/><rect x="46" y="66" width="3.6" height="5" rx="1" fill="#fff"/><rect x="50.6" y="66" width="3.6" height="5" rx="1" fill="#fff"/><circle cx="26" cy="58" r="5" fill="#e99a8a" opacity=".55"/><circle cx="74" cy="58" r="5" fill="#e99a8a" opacity=".55"/><path d="M30 57 h-14 M30 61 l-13 3 M70 57 h14 M70 61 l13 3" stroke="#5a3520" stroke-width="1.4" stroke-linecap="round"/><ellipse cx="22" cy="86" rx="11" ry="7" fill="#7a4d32"/><ellipse cx="78" cy="86" rx="11" ry="7" fill="#7a4d32"/></svg>',
    plane: '<svg viewBox="0 0 140 70"><path d="M20 38 Q20 28 34 28 L112 28 Q132 30 136 38 Q132 46 112 47 L34 47 Q20 47 20 38Z" fill="#f4f6fb" stroke="#2b3a55" stroke-width="2.5"/><path d="M60 30 L78 4 L92 4 L84 30Z" fill="#e2574c" stroke="#2b3a55" stroke-width="2.5" stroke-linejoin="round"/><path d="M60 45 L78 66 L92 66 L84 45Z" fill="#c9433a" stroke="#2b3a55" stroke-width="2.5" stroke-linejoin="round"/><path d="M22 36 L10 12 L22 12 L36 30Z" fill="#e2574c" stroke="#2b3a55" stroke-width="2.5" stroke-linejoin="round"/><path d="M112 30 Q124 31 130 38 L112 38Z" fill="#7fc4ef" stroke="#2b3a55" stroke-width="2"/><circle cx="48" cy="37" r="3.4" fill="#7fc4ef"/><circle cx="60" cy="37" r="3.4" fill="#7fc4ef"/><circle cx="96" cy="37" r="3.4" fill="#7fc4ef"/><circle cx="84" cy="37" r="3.4" fill="#7fc4ef"/><path d="M20 38 h-12" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/></svg>',
    ghost: function (c) { return '<svg viewBox="0 0 40 44"><path d="M4 22 Q4 3 20 3 Q36 3 36 22 L36 40 L30 35 L25 40 L20 35 L15 40 L10 35 L4 40Z" fill="' + c + '"/><circle cx="14" cy="19" r="5" fill="#fff"/><circle cx="27" cy="19" r="5" fill="#fff"/><circle cx="15.5" cy="20" r="2.4" fill="#1d1d3a"/><circle cx="28.5" cy="20" r="2.4" fill="#1d1d3a"/></svg>'; },
    hero: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="#f6c343" stroke="#b8860b" stroke-width="2"/><circle cx="14" cy="16" r="2.6" fill="#3a2a00"/><circle cx="26" cy="16" r="2.6" fill="#3a2a00"/><path d="M12 24 Q20 31 28 24" stroke="#3a2a00" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="10" cy="22" r="2.6" fill="#f2896b" opacity=".6"/><circle cx="30" cy="22" r="2.6" fill="#f2896b" opacity=".6"/></svg>'
  };
  MK.ART = ART;
  function lives(n) { return +n === 0 ? Infinity : (+n || 3); }
  function rich(t) { return MK.rich(t); }
  function letter(i) { return MK.lang === 'en' ? 'ABCDEF'[i] : LET[i]; }

  // ====== المحرّك المشترك ======
  function arcade(ctx, cfg) {
    var body = MK.clear(ctx.body); MK.clear(ctx.foot);
    var prompt = h('div', { class: 'ac-prompt' }), hearts = h('div', { class: 'ac-hearts', 'aria-label': 'المحاولات' }), cnt = h('div', { class: 'ac-cnt' });
    var legend = h('div', { class: 'ac-legend hidden' });
    var arena = h('div', { class: 'ac-arena ac-' + cfg.id });
    var banner = h('div', { class: 'ac-banner hidden' });
    arena.appendChild(banner);
    body.appendChild(h('div', { class: 'ac-wrap' }, h('div', { class: 'ac-hud' }, cnt, prompt, hearts), legend, arena));
    if (cfg.hint) ctx.foot.appendChild(h('div', { class: 'hint ac-hint' }, cfg.hint));
    var S = { lives: lives(cfg.lives), good: 0, done: 0, total: cfg.total, alive: true, hold: 0, raf: 0, last: 0, sp: [0.7, 1, 1.4][(+cfg.speed || 2) - 1] };
    function drawHearts() {
      MK.clear(hearts);
      if (S.lives === Infinity) return;
      for (var i = 0; i < Math.min(S.lives, 10); i++) hearts.appendChild(h('span', { class: 'ac-heart' }, '♥'));
    }
    function drawCnt() { cnt.textContent = ar(Math.min(S.done + 1, S.total)) + ' / ' + ar(S.total); ctx.setProgress(S.done / S.total); }
    drawHearts(); drawCnt();
    function frame(t) {
      if (!S.alive) return;
      var dt = Math.min(0.05, (t - (S.last || t)) / 1000); S.last = t;
      if (!MK.paused && t > S.hold) cfg.tick(dt * S.sp, t);
      S.raf = requestAnimationFrame(frame);
    }
    function W() { return arena.clientWidth; }
    function H() { return arena.clientHeight; }
    function say(txt, cls, ms) {
      MK.clear(banner).appendChild(typeof txt === 'string' ? document.createTextNode(txt) : txt);
      banner.className = 'ac-banner ' + (cls || ''); void banner.offsetWidth; banner.classList.add('show');
      clearTimeout(say._t); say._t = setTimeout(function () { banner.className = 'ac-banner hidden'; }, ms || 1200);
    }
    var api = {
      arena: arena, prompt: prompt, legend: legend, S: S, W: W, H: H, say: say,
      setPrompt: function (node) { MK.clear(prompt).appendChild(node); prompt.classList.remove('pop-in'); void prompt.offsetWidth; prompt.classList.add('pop-in'); },
      hold: function (ms) { S.hold = performance.now() + ms; },
      float: function (x, y, txt, cls) {
        var f = h('div', { class: 'ac-float ' + (cls || ''), style: { left: x + 'px', top: y + 'px' } }, txt);
        arena.appendChild(f); setTimeout(function () { f.remove(); }, 900);
      },
      right: function (x, y) {
        S.good++; S.done++; ctx.addPoints(10); MK.sound.correct(); ctx.mascot('cheer'); ctx.nextTurn();
        if (x != null) api.float(x, y, '+' + MK.fb(ctx.act).points, 'ok');
        drawCnt(); return api.checkEnd();
      },
      // خطأ: تنقص محاولة، وتظهر الإجابة الصحيحة لحظة
      wrong: function (x, y, correctText, countDone, explain) {
        MK.sound.wrong(); ctx.mascot('sad');
        if (x != null) api.float(x, y, '✗', 'no');
        if (S.lives !== Infinity) { S.lives--; drawHearts(); hearts.classList.remove('shake'); void hearts.offsetWidth; hearts.classList.add('shake'); }
        if (countDone) { S.done++; ctx.nextTurn(); drawCnt(); }
        if (correctText != null) {
          var ex = explain && String(explain).trim(), ms = ex ? 3600 : 1500;
          say(h('span', null, T('الإجابة الصحيحة: '), h('b', null, rich(correctText)), ex ? h('span', { class: 'ac-ex' }, '💡 ', rich(ex)) : null), 'no', ms); api.hold(ms);
          api._lastHold = ms;
        }
        else api.hold(700);
        if (S.lives <= 0) { say(T('انتهت المحاولات'), 'no', 1600); api.finish(1700); return true; }
        return api.checkEnd();
      },
      checkEnd: function () { if (S.done >= S.total) { api.finish(900); return true; } return false; },
      finish: function (ms) {
        if (!S.alive) return; S.alive = false; cancelAnimationFrame(S.raf);
        setTimeout(function () { ctx.setProgress(1); ctx.end({ correct: S.good, total: S.total }); }, ms || 600);
      },
      start: function () {
        say(T('استعد…'), '', 900);
        S.hold = performance.now() + 900;
        setTimeout(function () { if (S.alive) say(T('انطلق!'), 'ok', 600); }, 900);
        S.raf = requestAnimationFrame(frame);
      },
      stop: function () { S.alive = false; cancelAnimationFrame(S.raf); }
    };
    return api;
  }
  function qsOf(c) {
    var qs = c.questions.map(function (q) {
      var o = q.options.map(function (t, i) { return { t: t, ok: i === q.correct }; }).filter(function (x) { return x.t.trim(); });
      return { q: q.q, explain: q.explain, opts: o, right: (o.filter(function (x) { return x.ok; })[0] || {}).t };
    });
    return c.shuffleQ ? MK.shuffle(qs) : qs;
  }
  function speedOpts(c) {
    return [
      h('div', { class: 'field' }, h('label', null, 'السرعة'), MK.choice([{ value: 1, label: 'بطيئة' }, { value: 2, label: 'متوسطة' }, { value: 3, label: 'سريعة' }], +c.speed || 2, function (v) { c.speed = v; }, { label: 'السرعة' })),
      h('div', { class: 'field' }, h('label', null, 'المحاولات (القلوب)'), MK.choice([{ value: 3, label: '3' }, { value: 5, label: '5' }, { value: 0, label: 'بلا حد' }], c.lives == null ? 3 : +c.lives, function (v) { c.lives = v; }, { label: 'المحاولات' }))
    ];
  }
  var quizBlank = function () { return { questions: [{ q: '', options: ['', '', '', ''], correct: 0 }], shuffleQ: true, speed: 2, lives: 3 }; };
  var quizEdit = function (c, r) { return MK.templates.quiz.edit(c, r); };
  var quizValid = function (c) { return MK.templates.quiz.validate(c); };

  // ====== ١) اضرب الخلد ======
  var whack = {
    id: 'whack', name: 'اضرب الخلد', icon: 'play', teamsOk: true, timerOk: false, arcade: true,
    desc: 'تطلّ الخُلد من الحفر حاملة إجابات، فيضرب الطالب الصحيحة بسرعة.',
    blank: quizBlank, edit: quizEdit, validate: quizValid,
    options: function (c) { return [toggle('اخلط ترتيب الأسئلة', c, 'shuffleQ')].concat(speedOpts(c)); },
    play: function (ctx) {
      var c = ctx.act.content, qs = qsOf(c), qi = 0, A = arcade(ctx, { id: 'whack', total: qs.length, lives: c.lives, speed: c.speed, hint: T('اضرب الخلد الذي يحمل الإجابة الصحيحة'), tick: tick });
      var holes = [], N = 6, spawnT = 0, sinceRight = 0;
      var field = h('div', { class: 'wk-field' }); A.arena.appendChild(field);
      for (var i = 0; i < N; i++) {
        var mole = h('button', { type: 'button', class: 'wk-mole' }, svgEl(ART.mole, 'wk-face'), h('span', { class: 'wk-sign' }));
        var hole = h('div', { class: 'wk-hole' }, h('div', { class: 'wk-pit' }), h('div', { class: 'wk-clip' }, mole), h('div', { class: 'wk-rim' }));
        var H0 = { el: hole, mole: mole, up: false, left: 0, opt: null };
        (function (H0) { mole.addEventListener('pointerdown', function (e) { e.preventDefault(); hit(H0); }); })(H0);
        holes.push(H0); field.appendChild(hole);
      }
      function setQ() { A.setPrompt(rich(qs[qi].q)); holes.forEach(down); spawnT = 0.2; sinceRight = 0; }
      function down(H0) { H0.up = false; H0.mole.classList.remove('up', 'hit', 'bad', 'show'); }
      function spawn() {
        var free = holes.filter(function (x) { return !x.up; }); if (!free.length) return;
        var H0 = free[Math.floor(Math.random() * free.length)], q = qs[qi];
        var shownOk = holes.some(function (x) { return x.up && x.opt && x.opt.ok; });
        var wantOk = !shownOk && (sinceRight >= 2 || Math.random() < 0.34);
        var pool = q.opts.filter(function (o) { return wantOk ? o.ok : !o.ok; });
        if (!pool.length) pool = q.opts;
        var o = pool[Math.floor(Math.random() * pool.length)];
        sinceRight = o.ok ? 0 : sinceRight + 1;
        H0.opt = o; H0.up = true; H0.left = 2.4 + Math.random() * 0.8;
        MK.clear(H0.mole.querySelector('.wk-sign')).appendChild(rich(o.t));
        H0.mole.classList.remove('hit', 'bad'); H0.mole.classList.add('up');
      }
      function tick(dt) {
        spawnT -= dt; if (spawnT <= 0) { spawn(); spawnT = 0.9 + Math.random() * 0.5; }
        holes.forEach(function (H0) { if (H0.up && !H0.mole.classList.contains('hit')) { H0.left -= dt; if (H0.left <= 0) down(H0); } });
      }
      function hit(H0) {
        if (!H0.up || !A.S.alive || H0.mole.classList.contains('hit') || H0.mole.classList.contains('bad') || performance.now() < A.S.hold) return;
        var r = H0.mole.getBoundingClientRect(), ar0 = A.arena.getBoundingClientRect(), x = r.left - ar0.left + r.width / 2, y = r.top - ar0.top;
        if (H0.opt.ok) {
          H0.mole.classList.add('hit'); MK.sound.whack();
          if (!A.right(x, y)) { A.hold(700); setTimeout(function () { qi++; setQ(); }, 650); }
        } else {
          H0.mole.classList.add('bad'); MK.sound.whack();
          var q = qs[qi];
          if (!A.wrong(x, y, q.right, true, q.explain)) setTimeout(function () { qi++; if (qi < qs.length) setQ(); }, (A._lastHold || 1500) - 50);
        }
      }
      setQ(); A.start();
      return function () { A.stop(); };
    }
  };

  // ====== ٢) فرقعة البالونات ======
  var balloon = {
    id: 'balloon', name: 'فرقعة البالونات', icon: 'play', teamsOk: true, timerOk: false, arcade: true,
    desc: 'بالونات تحمل المصطلحات تصعد، فيفرقع الطالب البالون المطابق للتعريف الظاهر.',
    blank: function () { return { pairs: [{ a: '', b: '' }, { a: '', b: '' }, { a: '', b: '' }], speed: 2, lives: 3 }; },
    edit: function (c) { return X.pairsEditor(c, 'المصطلح (على البالون)', 'التعريف (يظهر في الأعلى)'); },
    validate: function (c) { return X.validPairs(c, 3); },
    options: function (c) { return speedOpts(c); },
    play: function (ctx) {
      var c = ctx.act.content, ps = MK.shuffle(c.pairs.filter(function (p) { return p.a.trim() && p.b.trim(); })), qi = 0;
      var A = arcade(ctx, { id: 'balloon', total: ps.length, lives: c.lives, speed: c.speed, hint: T('فرقع البالون المطابق'), tick: tick });
      var bs = [], spawnT = 0, since = 0, cols = ['#e2574c', '#f2a93b', '#3fa26b', '#3d87c9', '#8a5bc9', '#e06aa0'];
      function setQ() { A.setPrompt(rich(ps[qi].b)); since = 0; bs.forEach(function (b) { b.el.classList.add('fade'); b.dead = true; setTimeout(function () { b.el.remove(); }, 300); }); bs = []; spawnT = 0.1; }
      function spawn() {
        var cur = ps[qi], hasOk = bs.some(function (b) { return !b.dead && b.p === cur; });
        var others = ps.filter(function (x) { return x !== cur; }), p = (hasOk || !(since >= 2 || Math.random() < 0.35)) && others.length ? others[Math.floor(Math.random() * others.length)] : cur;
        since = p === cur ? 0 : since + 1;
        var w = Math.min(190, Math.max(120, A.W() / 6)), nl = Math.max(3, Math.floor((A.W() - 20) / (w + 20))), ln; do { ln = Math.floor(Math.random() * nl); } while (nl > 2 && (ln === spawn.l1 || ln === spawn.l2)); spawn.l2 = spawn.l1; spawn.l1 = ln; var x = 10 + ln * ((A.W() - w - 20) / (nl - 1));
        var el = h('button', { type: 'button', class: 'bl-b', style: { width: w + 'px', '--bc': cols[Math.floor(Math.random() * cols.length)] } }, h('span', { class: 'bl-t' }, rich(p.a)), h('i', { class: 'bl-str' }));
        var b = { el: el, p: p, x: x, y: A.H() + 10, v: 55 + Math.random() * 35, w: w, sway: Math.random() * 6.28 };
        el.addEventListener('pointerdown', function (e) { e.preventDefault(); pop(b); });
        A.arena.appendChild(el); bs.push(b);
      }
      function tick(dt, t) {
        spawnT -= dt; if (spawnT <= 0) { spawn(); spawnT = 1.0 + Math.random() * 0.6; }
        bs.forEach(function (b) {
          if (b.dead) return;
          b.y -= b.v * dt * 1.25; var sx = Math.sin(t / 600 + b.sway) * 10;
          b.el.style.transform = 'translate(' + (b.x + sx) + 'px,' + b.y + 'px)';
          if (b.y < -b.w * 1.4) { b.dead = true; b.el.remove(); }
        });
        bs = bs.filter(function (b) { return !b.dead || b.el.isConnected; });
      }
      function pop(b) {
        if (b.dead || !A.S.alive || performance.now() < A.S.hold) return;
        b.dead = true; var x = b.x + b.w / 2, y = b.y;
        if (b.p === ps[qi]) {
          b.el.classList.add('pop'); MK.sound.pop(); setTimeout(function () { b.el.remove(); }, 300);
          if (!A.right(x, y)) { A.hold(500); setTimeout(function () { qi++; setQ(); }, 450); }
        } else {
          b.el.classList.add('popbad'); MK.sound.pop(); setTimeout(function () { b.el.remove(); }, 350);
          if (!A.wrong(x, y, ps[qi].a, true)) setTimeout(function () { qi++; if (qi < ps.length) setQ(); }, 1450);
        }
      }
      setQ(); A.start();
      return function () { A.stop(); };
    }
  };

  // ====== ٣) مطاردة المتاهة ======
  function makeMaze(C, R) {
    var g = []; for (var r = 0; r < R; r++) { g.push([]); for (var c = 0; c < C; c++) g[r].push(1); }
    function carve(r, c) {
      g[r][c] = 0;
      MK.shuffle([[0, 2], [0, -2], [2, 0], [-2, 0]]).forEach(function (d) {
        var nr = r + d[0], nc = c + d[1];
        if (nr > 0 && nr < R - 1 && nc > 0 && nc < C - 1 && g[nr][nc]) { g[r + d[0] / 2][c + d[1] / 2] = 0; carve(nr, nc); }
      });
    }
    carve(1, 1);
    // فتح ممرات إضافية لتصير المتاهة حلقات لا طرقًا مسدودة
    for (var k = 0; k < C * R / 5; k++) {
      var rr = 1 + Math.floor(Math.random() * (R - 2)), cc = 1 + Math.floor(Math.random() * (C - 2));
      if (g[rr][cc] && ((g[rr - 1][cc] === 0 && g[rr + 1][cc] === 0) || (g[rr][cc - 1] === 0 && g[rr][cc + 1] === 0))) g[rr][cc] = 0;
    }
    return g;
  }
  var maze = {
    id: 'maze', name: 'مطاردة المتاهة', icon: 'play', teamsOk: true, timerOk: false, arcade: true,
    desc: 'يقود الطالب شخصيته في المتاهة إلى منطقة الإجابة الصحيحة، هاربًا من الأشباح.',
    blank: quizBlank, edit: quizEdit,
    validate: function (c) { var e = quizValid(c); if (e) return e; for (var i = 0; i < c.questions.length; i++) if (c.questions[i].options.filter(function (o) { return o.trim(); }).length > 4) return 'السؤال ' + (i + 1) + ': أربعة خيارات على الأكثر في المتاهة.'; return null; },
    options: function (c) { return [toggle('اخلط ترتيب الأسئلة', c, 'shuffleQ')].concat(speedOpts(c)); },
    play: function (ctx) {
      var c = ctx.act.content, qs = qsOf(c), qi = 0;
      var A = arcade(ctx, { id: 'maze', total: qs.length, lives: c.lives, speed: c.speed, hint: T('اضغط في المتاهة أو استخدم الأسهم'), tick: tick });
      var C = 21, R = 13, g, cells = [], grid = h('div', { class: 'mz-grid', dir: 'ltr', style: { gridTemplateColumns: 'repeat(' + C + ',1fr)' } });
      A.arena.appendChild(grid); A.legend.classList.remove('hidden');
      var player = svgEl(ART.hero, 'mz-p'), ghosts = [], P, path = [], stepT = 0, zones = [];
      grid.appendChild(player);
      function cellEl(r, c) { return cells[r * C + c]; }
      function place(el, r, c) { el.style.gridRow = r + 1; el.style.gridColumn = c + 1; }
      function build() {
        g = makeMaze(C, R);
        var Z = [[1, 1], [1, C - 4], [R - 4, 1], [R - 4, C - 4]];
        zones = Z.map(function (z) { var zc = []; for (var r = z[0]; r < z[0] + 3; r++) for (var cc = z[1]; cc < z[1] + 3; cc++) { g[r][cc] = 0; zc.push(r + ',' + cc); } return zc; });
        for (var r = R / 2 - 1 | 0; r <= (R / 2 | 0) + 1; r++) for (var cc = (C / 2 | 0) - 1; cc <= (C / 2 | 0) + 1; cc++) g[r][cc] = 0;
        // تأكد من وصول المركز إلى كل منطقة
        Z.forEach(function (z) { var r0 = z[0] + 1, c0 = z[1] + 1, cr = R / 2 | 0, cc0 = C / 2 | 0; var rr = r0, c2 = c0; while (c2 !== cc0) { g[rr][c2] = 0; c2 += c2 < cc0 ? 1 : -1; } while (rr !== cr) { g[rr][c2] = 0; rr += rr < cr ? 1 : -1; } });
        Array.prototype.slice.call(grid.querySelectorAll('.mz-c')).forEach(function (e) { e.remove(); });
        cells = [];
        for (r = 0; r < R; r++) for (cc = 0; cc < C; cc++) {
          var e = h('div', { class: 'mz-c' + (g[r][cc] ? ' w' : '') }); place(e, r, cc);
          (function (r, cc) { e.addEventListener('pointerdown', function (ev) { ev.preventDefault(); walkTo(r, cc); }); })(r, cc);
          cells.push(e); grid.insertBefore(e, player);
        }
      }
      function setQ() {
        build();
        var q = qs[qi]; A.setPrompt(rich(q.q));
        MK.clear(A.legend);
        q.opts.forEach(function (o, i) { A.legend.appendChild(h('span', { class: 'mz-lg z' + i }, h('b', null, letter(i)), rich(o.t))); });
        zones.forEach(function (zc, i) {
          zc.forEach(function (k) { var p = k.split(','); cellEl(+p[0], +p[1]).classList.add('z', i < q.opts.length ? 'z' + i : 'zx'); });
          if (i < q.opts.length) { var p0 = zc[4].split(','); var lb = cellEl(+p0[0], +p0[1]); lb.textContent = letter(i); lb.classList.add('zl'); }
        });
        P = { r: R / 2 | 0, c: C / 2 | 0 }; place(player, P.r, P.c); path = [];
        ghosts.forEach(function (gh) { gh.el.remove(); }); ghosts = [];
        [[1, C / 2 | 0], [R - 2, C / 2 | 0]].forEach(function (s, i) {
          var el = svgEl(ART.ghost(i ? '#e2574c' : '#8a5bc9'), 'mz-g g' + i); grid.appendChild(el);
          var gh = { el: el, r: s[0], c: s[1], t: 0.6 }; g[gh.r][gh.c] = 0; cellEl(gh.r, gh.c).classList.remove('w'); place(el, gh.r, gh.c); ghosts.push(gh);
        });
      }
      function bfs(fr, fc, tr, tc) {
        var prev = {}, Q = [[fr, fc]], key = function (r, c) { return r + ',' + c; }; prev[key(fr, fc)] = null;
        while (Q.length) {
          var cur = Q.shift(); if (cur[0] === tr && cur[1] === tc) break;
          [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(function (d) { var r = cur[0] + d[0], c = cur[1] + d[1]; if (r < 0 || c < 0 || r >= R || c >= C || g[r][c] || prev.hasOwnProperty(key(r, c))) return; prev[key(r, c)] = cur; Q.push([r, c]); });
        }
        if (!prev.hasOwnProperty(key(tr, tc))) return [];
        var out = [], k = [tr, tc]; while (k && !(k[0] === fr && k[1] === fc)) { out.unshift(k); k = prev[key(k[0], k[1])]; }
        return out;
      }
      function walkTo(r, c) { if (g[r][c]) return; path = bfs(P.r, P.c, r, c); }
      function step(dr, dc) { var r = P.r + dr, c = P.c + dc; if (r < 0 || c < 0 || r >= R || c >= C || g[r][c]) return; path = [[r, c]]; stepT = 0; }
      function onKey(e) {
        var m = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key];
        if (m) { e.preventDefault(); step(m[0], m[1]); }
      }
      document.addEventListener('keydown', onKey);
      function check() {
        var k = P.r + ',' + P.c, q = qs[qi];
        for (var i = 0; i < q.opts.length; i++) if (zones[i].indexOf(k) >= 0) {
          path = [];
          if (q.opts[i].ok) { if (!A.right(null)) { A.hold(600); setTimeout(function () { qi++; setQ(); }, 550); } }
          else if (!A.wrong(null, null, q.right, true, q.explain)) setTimeout(function () { qi++; if (qi < qs.length) setQ(); }, (A._lastHold || 1500) - 50);
          return true;
        }
        if (ghosts.some(function (gh) { return gh.r === P.r && gh.c === P.c; })) {
          path = []; player.classList.add('caught'); setTimeout(function () { player.classList.remove('caught'); }, 600);
          if (!A.wrong(null, null, null, false)) { P = { r: R / 2 | 0, c: C / 2 | 0 }; place(player, P.r, P.c); }
          return true;
        }
        return false;
      }
      function tick(dt) {
        stepT -= dt;
        if (path.length && stepT <= 0) { var nx = path.shift(); P = { r: nx[0], c: nx[1] }; place(player, P.r, P.c); stepT = 0.13; if (check()) return; }
        ghosts.forEach(function (gh) {
          gh.t -= dt; if (gh.t > 0) return; gh.t = 0.55;
          var opts = [[0, 1], [0, -1], [1, 0], [-1, 0]].map(function (d) { return [gh.r + d[0], gh.c + d[1]]; }).filter(function (p) { return p[0] >= 0 && p[1] >= 0 && p[0] < R && p[1] < C && !g[p[0]][p[1]]; });
          if (!opts.length) return;
          var nxt = Math.random() < 0.55 ? (bfs(gh.r, gh.c, P.r, P.c)[0] || opts[0]) : opts[Math.floor(Math.random() * opts.length)];
          // لا تدخل الأشباح مناطق الإجابات
          if (zones.some(function (z) { return z.indexOf(nxt[0] + ',' + nxt[1]) >= 0; })) nxt = opts[Math.floor(Math.random() * opts.length)];
          if (zones.some(function (z) { return z.indexOf(nxt[0] + ',' + nxt[1]) >= 0; })) return;
          gh.r = nxt[0]; gh.c = nxt[1]; place(gh.el, gh.r, gh.c);
        });
        check();
      }
      // أزرار اتجاهات على الشاشة
      var pad = h('div', { class: 'mz-pad', dir: 'ltr' });
      [['▲', -1, 0, 'u'], ['◀', 0, -1, 'l'], ['▼', 1, 0, 'd'], ['▶', 0, 1, 'r']].forEach(function (b) {
        pad.appendChild(h('button', { type: 'button', class: 'mz-k ' + b[3], onpointerdown: function (e) { e.preventDefault(); step(b[1], b[2]); } }, b[0]));
      });
      A.arena.appendChild(pad);
      setQ(); A.start();
      return function () { A.stop(); document.removeEventListener('keydown', onKey); };
    }
  };

  // ====== ٤) الطائرة ======
  var plane = {
    id: 'plane', name: 'الطائرة', icon: 'play', teamsOk: true, timerOk: false, arcade: true,
    desc: 'يقود الطالب الطائرة لتصطدم بسحابة الإجابة الصحيحة وتتجنب الخاطئة.',
    blank: quizBlank, edit: quizEdit, validate: quizValid,
    options: function (c) { return [toggle('اخلط ترتيب الأسئلة', c, 'shuffleQ')].concat(speedOpts(c)); },
    play: function (ctx) {
      var c = ctx.act.content, qs = qsOf(c), qi = 0, rtl = MK.lang !== 'en';
      var A = arcade(ctx, { id: 'plane', total: qs.length, lives: c.lives, speed: c.speed, hint: T('اسحب الطائرة للأعلى والأسفل'), tick: tick });
      var pl = svgEl(ART.plane, 'pl-plane' + (rtl ? ' rtl' : '')); A.arena.appendChild(pl);
      for (var k = 0; k < 6; k++) A.arena.appendChild(h('div', { class: 'pl-bg c' + k, style: { top: (8 + k * 15) + '%', animationDelay: (-k * 3) + 's' } }));
      var py = 0.5, ty = 0.5, clouds = [], spawnT = 0, lane = 0, since = 0, drag = false;
      function setQ() { A.setPrompt(rich(qs[qi].q)); clouds.forEach(function (cl) { cl.el.remove(); }); clouds = []; spawnT = 0.2; since = 0; }
      function spawn() {
        var q = qs[qi], hasOk = clouds.some(function (cl) { return cl.o.ok; });
        var pool = q.opts.filter(function (o) { return (!hasOk && (since >= 2 || Math.random() < 0.35)) ? o.ok : !o.ok; }); if (!pool.length) pool = q.opts;
        var o = pool[Math.floor(Math.random() * pool.length)]; since = o.ok ? 0 : since + 1;
        lane = (lane + 1 + Math.floor(Math.random() * 3)) % 4;
        var el = h('div', { class: 'pl-cloud' }, rich(o.t)); A.arena.appendChild(el);
        var cl = { el: el, o: o, x: -260, y: 0.14 + lane * 0.22, w: el.offsetWidth || 220 };
        clouds.push(cl);
      }
      function tick(dt) {
        var Wd = A.W(), Hd = A.H();
        py += (ty - py) * Math.min(1, dt * 8);
        var px = rtl ? Wd - 150 : 40, pyy = py * Hd;
        pl.style.transform = 'translate(' + px + 'px,' + (pyy - 40) + 'px) rotate(' + ((ty - py) * (rtl ? -60 : 60)) + 'deg)' + (rtl ? ' scaleX(-1)' : '');
        spawnT -= dt; if (spawnT <= 0) { spawn(); spawnT = 1.6 + Math.random() * 0.6; }
        clouds = clouds.filter(function (cl) {
          cl.x += 130 * dt; cl.w = cl.el.offsetWidth;
          var cx = rtl ? cl.x : Wd - cl.x - cl.w, cy = cl.y * Hd;
          cl.el.style.transform = 'translate(' + cx + 'px,' + (cy - 30) + 'px)';
          var hitX = rtl ? (cx + cl.w > px + 20 && cx < px + 130) : (cx < px + 140 && cx + cl.w > px + 20);
          if (hitX && Math.abs(cy - pyy) < 46 && !cl.hit) {
            cl.hit = true;
            if (cl.o.ok) { cl.el.classList.add('ok'); if (!A.right(cx + cl.w / 2, cy)) { A.hold(600); setTimeout(function () { qi++; setQ(); }, 550); } }
            else { cl.el.classList.add('no'); if (!A.wrong(cx + cl.w / 2, cy, qs[qi].right, true, qs[qi].explain)) setTimeout(function () { qi++; if (qi < qs.length) setQ(); }, (A._lastHold || 1500) - 50); }
            setTimeout(function () { cl.el.remove(); }, 400); return false;
          }
          if (cl.x > Wd + 40) { cl.el.remove(); return false; }
          return true;
        });
      }
      function setY(e) { var r = A.arena.getBoundingClientRect(); ty = Math.max(0.08, Math.min(0.92, (e.clientY - r.top) / r.height)); }
      A.arena.addEventListener('pointerdown', function (e) { drag = true; setY(e); try { A.arena.setPointerCapture(e.pointerId); } catch (x) { } });
      A.arena.addEventListener('pointermove', function (e) { if (drag || e.pointerType === 'mouse') setY(e); });
      A.arena.addEventListener('pointerup', function () { drag = false; });
      function onKey(e) { if (e.key === 'ArrowUp') { ty = Math.max(0.08, ty - 0.22); e.preventDefault(); } else if (e.key === 'ArrowDown') { ty = Math.min(0.92, ty + 0.22); e.preventDefault(); } }
      document.addEventListener('keydown', onKey);
      setQ(); A.start();
      return function () { A.stop(); document.removeEventListener('keydown', onKey); };
    }
  };

  // ====== ٥) الفاكهة الطائرة ======
  var fruit = {
    id: 'fruit', name: 'الفاكهة الطائرة', icon: 'play', teamsOk: true, timerOk: false, arcade: true,
    desc: 'تُقذف فاكهة تحمل الإجابات، فيقطع الطالب الصحيحة بالسحب أو اللمس.',
    blank: quizBlank, edit: quizEdit, validate: quizValid,
    options: function (c) { return [toggle('اخلط ترتيب الأسئلة', c, 'shuffleQ')].concat(speedOpts(c)); },
    play: function (ctx) {
      var c = ctx.act.content, qs = qsOf(c), qi = 0;
      var A = arcade(ctx, { id: 'fruit', total: qs.length, lives: c.lives, speed: c.speed, hint: T('اقطع الفاكهة الصحيحة'), tick: tick });
      var FR = [['🍉', '#e8505b'], ['🍊', '#f39c33'], ['🍋', '#e9c53a'], ['🍏', '#6bbf4a'], ['🍇', '#8e5bc9'], ['🍑', '#f08a76']];
      var fs = [], spawnT = 0, since = 0, trail = [], drag = false;
      var cv = h('canvas', { class: 'fr-trail' }); A.arena.appendChild(cv);
      function setQ() { A.setPrompt(rich(qs[qi].q)); fs.forEach(function (f) { f.el.remove(); }); fs = []; spawnT = 0.2; since = 0; }
      function spawn() {
        var q = qs[qi], hasOk = fs.some(function (f) { return f.o.ok && !f.cut; });
        var pool = q.opts.filter(function (o) { return (!hasOk && (since >= 1 || Math.random() < 0.4)) ? o.ok : !o.ok; }); if (!pool.length) pool = q.opts;
        var o = pool[Math.floor(Math.random() * pool.length)]; since = o.ok ? 0 : since + 1;
        var F = FR[Math.floor(Math.random() * FR.length)], Wd = A.W(), Hd = A.H(), size = Math.max(120, Math.min(170, Wd / 7));
        var el = h('div', { class: 'fr-f', style: { width: size + 'px', height: size + 'px', '--fc': F[1] } }, h('span', { class: 'fr-e' }, F[0]), h('span', { class: 'fr-t' }, rich(o.t)));
        A.arena.appendChild(el);
        var x = size / 2 + Math.random() * (Wd - size), toward = Wd / 2 - x;
        fs.push({ em: el.firstChild, el: el, o: o, x: x, y: Hd + size / 2, vx: toward * (0.25 + Math.random() * 0.25), vy: -Math.sqrt(2 * 420 * (Hd * (0.62 + Math.random() * 0.22))), r: size / 2, rot: 0, vr: (Math.random() - 0.5) * 90 });
      }
      function tick(dt) {
        var Hd = A.H();
        spawnT -= dt; if (spawnT <= 0) { spawn(); spawnT = 1.1 + Math.random() * 0.5; }
        fs = fs.filter(function (f) {
          f.vy += 420 * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.rot += f.vr * dt;
          f.el.style.transform = 'translate(' + (f.x - f.r) + 'px,' + (f.y - f.r) + 'px)'; f.em.style.transform = 'rotate(' + f.rot * 4 + 'deg)';
          if (f.y > Hd + f.r * 2 && f.vy > 0) { f.el.remove(); return false; }
          return true;
        });
        drawTrail();
      }
      function drawTrail() {
        var g2 = cv.getContext('2d'); if (cv.width !== A.W()) { cv.width = A.W(); cv.height = A.H(); }
        g2.clearRect(0, 0, cv.width, cv.height);
        var now = performance.now(); trail = trail.filter(function (p) { return now - p.t < 180; });
        if (trail.length > 1) { g2.lineCap = 'round'; g2.strokeStyle = 'rgba(255,255,255,.9)'; g2.lineWidth = 8; g2.beginPath(); g2.moveTo(trail[0].x, trail[0].y); trail.forEach(function (p) { g2.lineTo(p.x, p.y); }); g2.stroke(); }
      }
      function cutAt(x, y) {
        if (!A.S.alive || performance.now() < A.S.hold) return;
        for (var i = 0; i < fs.length; i++) {
          var f = fs[i]; if (f.cut) continue;
          if (Math.hypot(f.x - x, f.y - y) < f.r) {
            f.cut = true; f.el.classList.add('cut');
            (function (f) { setTimeout(function () { f.el.remove(); fs = fs.filter(function (z) { return z !== f; }); }, 380); })(f);
            MK.sound.slice(); if (f.o.ok) { if (!A.right(f.x, f.y - f.r)) { A.hold(500); setTimeout(function () { qi++; setQ(); }, 450); } }
            else if (!A.wrong(f.x, f.y - f.r, qs[qi].right, true, qs[qi].explain)) setTimeout(function () { qi++; if (qi < qs.length) setQ(); }, (A._lastHold || 1500) - 50);
            return;
          }
        }
      }
      function pt(e) { var r = A.arena.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }; }
      A.arena.addEventListener('pointerdown', function (e) { drag = true; var p = pt(e); trail = [p]; cutAt(p.x, p.y); try { A.arena.setPointerCapture(e.pointerId); } catch (x) { } });
      A.arena.addEventListener('pointermove', function (e) { if (!drag) return; var p = pt(e); trail.push(p); cutAt(p.x, p.y); });
      A.arena.addEventListener('pointerup', function () { drag = false; });
      setQ(); A.start();
      return function () { A.stop(); };
    }
  };

  // ====== ٦) التصنيف السريع ======
  var speedsort = {
    id: 'speedsort', name: 'التصنيف السريع', icon: 'play', teamsOk: true, timerOk: false, arcade: true,
    desc: 'تسقط البطاقات واحدة بعد أخرى، فيرسلها الطالب إلى مجموعتها قبل أن تصل الأرض.',
    blank: function () { return { groups: [{ name: '', items: [] }, { name: '', items: [] }], speed: 2, lives: 3 }; },
    edit: function (c, r) { return MK.templates.group.edit(c, r); },
    validate: function (c) { return MK.templates.group.validate(c); },
    options: function (c) { return speedOpts(c); },
    play: function (ctx) {
      var c = ctx.act.content, items = [];
      c.groups.forEach(function (g, gi) { g.items.forEach(function (t) { items.push({ t: t, g: gi }); }); });
      items = MK.shuffle(items);
      var A = arcade(ctx, { id: 'speedsort', total: items.length, lives: c.lives, speed: c.speed, hint: T('أرسل البطاقة إلى مجموعتها'), tick: tick });
      A.setPrompt(h('span', null, T('أرسل البطاقة إلى مجموعتها')));
      var bins = h('div', { class: 'ss-bins', style: { gridTemplateColumns: 'repeat(' + c.groups.length + ',1fr)' } });
      var binEls = c.groups.map(function (g, gi) {
        var b = h('button', { type: 'button', class: 'ss-bin g' + gi }, h('span', null, rich(g.name)), c.groups.length === 2 ? h('small', null, gi === 0 ? (MK.lang === 'en' ? '←' : '→') : (MK.lang === 'en' ? '→' : '←')) : h('small', null, String(gi + 1)));
        b.addEventListener('pointerdown', function (e) { e.preventDefault(); send(gi); });
        bins.appendChild(b); return b;
      });
      A.arena.appendChild(bins);
      var idx = 0, card = null, y = 0;
      function next() {
        if (idx >= items.length) return;
        var it = items[idx];
        var el = h('div', { class: 'ss-card' }, rich(it.t)); A.arena.appendChild(el);
        card = { el: el, it: it }; y = -80;
      }
      function tick(dt) {
        if (!card) { next(); return; }
        y += 55 * dt * 1.25;
        card.el.style.transform = 'translate(-50%,' + y + 'px)';
        if (y > A.H() - bins.offsetHeight - card.el.offsetHeight - 6) send(-1);
      }
      function send(gi) {
        if (!card || !A.S.alive || performance.now() < A.S.hold) return;
        var cd = card; card = null; idx++;
        var ok = gi === cd.it.g, target = binEls[gi >= 0 ? gi : cd.it.g];
        var br = target.getBoundingClientRect(), arr = A.arena.getBoundingClientRect(), cr = cd.el.getBoundingClientRect();
        cd.el.style.transition = 'transform .35s ease-in, opacity .35s';
        cd.el.style.transform = 'translate(calc(-50% + ' + (br.left + br.width / 2 - (cr.left + cr.width / 2)) + 'px),' + (br.top - arr.top) + 'px) scale(.4)';
        cd.el.style.opacity = '0';
        setTimeout(function () { cd.el.remove(); }, 400);
        target.classList.remove('flash'); void target.offsetWidth; target.classList.add(ok ? 'flash' : 'flashno');
        setTimeout(function () { target.classList.remove('flash', 'flashno'); }, 700);
        if (ok) A.right(null); else A.wrong(null, null, c.groups[cd.it.g].name + ' ← ' + cd.it.t, true);
      }
      function onKey(e) {
        if (c.groups.length === 2 && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
          e.preventDefault(); var leftIdx = MK.lang === 'en' ? 0 : 1; send(e.key === 'ArrowLeft' ? leftIdx : 1 - leftIdx);
        } else if (/^[1-4]$/.test(e.key)) send(+e.key - 1);
      }
      document.addEventListener('keydown', onKey);
      A.start();
      return function () { A.stop(); document.removeEventListener('keydown', onKey); };
    }
  };

  Object.assign(MK.templates, { whack: whack, balloon: balloon, maze: maze, plane: plane, fruit: fruit, speedsort: speedsort });

  // التحويل
  var P = MK.convP;
  P.whack = P.maze = P.plane = P.fruit = P.quiz;
  P.balloon = { out: P.find.out, in: function (ps) { return ps.length < 3 ? null : { pairs: ps.map(function (p) { return { a: p.a, b: p.b }; }), speed: 2, lives: 3 }; } };
  Object.assign(MK.convNeedsB, { whack: 1, maze: 1, plane: 1, fruit: 1, balloon: 1 });
  if (MK.addImport) {
    var IP = MK.importParsers;
    ['whack', 'maze', 'plane', 'fruit'].forEach(function (id) { MK.addImport(id, 'questions', 'الصيغة نفسها في قالب «الاختبار»: السؤال، ثم الخيارات، وضع * بعد الإجابة الصحيحة.', IP.quiz, function (it) { return it.q + ' ← ' + it.options[it.correct]; }); });
    MK.addImport('balloon', 'pairs', 'كل زوج في سطر: المصطلح: التعريف.', IP.find, function (it) { return it.a + ' ← ' + it.b; });
  }
  MK.catalog = MK.catalog.filter(function (x) { return x.phase !== 3; });
})();
