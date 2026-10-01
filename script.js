/* for zenith: everything that moves */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  // ---- the words ----
  const notes = [
    "Whatever it is, it's not too much. It never was.",
    "Reminder: you're the person who spent forever getting one tiny section of a candle holder perfect. And it was perfect. That's just how you do things slow, careful, and worth it. This will be too.",
    "Breathe. In for 4, out for 6. The candle will do it with you. I'll wait.",
    "You don't have to have it figured out today. Today just needs surviving. Tomorrow can be impressed by you.",
    "Text me. Yes, even about this. Especially about this.",
    "Stress check: have you eaten? Drink water. This is a threat \ud83e\udd70",
    "You're a designer, treat the problem like a bad first draft. It's allowed to be ugly right now.",
    "Somewhere out there, I'm rooting for you. Probably right now, actually.",
    "Nothing about you has ever felt like a burden to me. Not once.",
    "Close the laptop. Look out a window. There's a whole world out there that has no deadlines in it.",
    "Just so you know you're a cinnamon girl who solves every murder mystery you'll solve this one too \u2764\ufe0f",
    "if the dinosaurs are chasing you right now, that's not stress. that's cardio.",
    "the bonk is legally protected self-defence. the ankylosaurus and I checked.",
    "do not press the yellow buttons. (press the yellow buttons.)",
    "You're allowed to be tired without earning it.",
    "Whatever went wrong today, it doesn't get to follow you in here. This page has a strict door policy.",
    "You've survived 100% of your worst days so far. Statistically incredible. Keep the streak.",
    "You have a way of making small things careful and careful things beautiful. I noticed it the first hour I knew you.",
    "For the record: your laugh has been stuck in my head since the pottery place. I've stopped fighting it.",
    "Rate today out of 10. Wrong answers accepted. I want to hear them all."
  ];

  // only shuffled into the deck late at night (22:00 to 04:59)
  const nightNotes = [
    "If this note found you at 2am: go to sleep, cutie. The candle will still be here tomorrow. So will I."
  ];

  const caseNote = "CASE FILE #002: the mystery of the racing heart\nSUSPECT: Zenith. Cutiepie. Cheeky. Cinnamon girl.\nEVIDENCE: one perfectly painted candle holder. Several very cute decisions about colours. A laugh the detective keeps thinking about.\nVERDICT: guilty of being the best part of my week.\nSENTENCE: a second date. No appeals.\n\u2014 detective amine";

  const caseNote2 = "CASE FILE #004: the mystery of why the detective keeps thinking about her\nSUSPECT: Zenith. still her. always her.\nEVIDENCE: one laugh, replaying at random hours. several very careful hands. a page that keeps growing because he keeps thinking of things she'd like.\nVERDICT: unsolvable. the detective has stopped investigating and started enjoying it.\nSENTENCE: more time together. effective immediately.\n\u2014 detective amine";

  const caseVerdict = "CASE FILE #003: the vanishing dinosaurs\nVICTIM: one (1) cookie. devoured at the scene.\nEVIDENCE: three-toed footprints. a torn confession reading 'RAW\u2014'. a chalk outline where the cookie used to be.\nVERDICT: it was the ceratosaurus and the spinosaurus. in the margins. with the RAWR.\nSENTENCE: to chase the detective around this page forever.\n\u2014 detective amine";

  const hisNotes = [
    "mine was the dark blue one, from the same table. on here i let it borrow your kingsnake's stripes.",
    "two candles now. yours lights the whole page. mine just likes sitting next to it."
  ];

  const secretNotes = [
    "You looked very cute on our first date, especially when you were deciding which colours to use, and when you were painting.",
    "Second secret: I built every hidden thing on this page because I like the way you look when you find things."
  ];

  const evLabels = {
    tracks: 'suspicious footprints (three toes. hm.)',
    scrap: "a torn confession ('RAW—')",
    chalk: 'the victim (one cookie, devoured)'
  };

  // ---- elements ----
  const $ = (id) => document.getElementById(id);
  const intro = $('intro');
  const main = $('main');
  const scene = $('scene');
  const stage = $('stage');
  const candleBtn = $('candleBtn');
  const flameTap = $('flameTap');
  const hisPiece = $('hisPiece');
  const hint = $('hint');
  const noteCard = $('noteCard');
  const note = $('note');
  const anotherNote = $('anotherNote');
  const putAway = $('putAway');
  const axoTap = $('axoTap');
  const breatheBtn = $('breatheBtn');
  const breathOverlay = $('breathOverlay');
  const breathStage = $('breathStage');
  const breathText = $('breathText');
  const breathTick = $('breathTick');
  const breathProgress = $('breathProgress');
  const breathPause = $('breathPause');
  const breathAgain = $('breathAgain');
  const breathExit = $('breathExit');
  const clueEls = Array.from(document.querySelectorAll('.clue'));
  const caseFile = $('caseFile');
  const caseStamp = $('caseStamp');
  const caseCount = $('caseCount');
  const caseStatus = $('caseStatus');
  const caseVerdictText = $('caseVerdictText');
  const caseReset = $('caseReset');
  const caseTab = $('caseTab');
  const choiceCaseDesc = $('choiceCaseDesc');
  const revealDim = $('revealDim');
  const revealLine = $('revealLine');
  const ankyCursor = $('ankyCursor');
  const cageFront = $('cageFront');
  const cageFront2 = $('cageFront2');
  const releaseBtn = $('releaseBtn');
  const releaseBtn2 = $('releaseBtn2');
  const restBtn = $('restBtn');
  const restChip = $('restChip');
  const keepsakes = $('keepsakes');
  const doorBtn = $('doorBtn');
  const paintBtn = $('paintBtn');
  const chapter = $('chapter');
  const chapterArt = $('chapterArt');
  const chapterLine = $('chapterLine');
  const chapterDots = $('chapterDots');
  const chapterPrev = $('chapterPrev');
  const chapterNext = $('chapterNext');
  const chapterExit = $('chapterExit');
  const studio = $('studio');
  const studioPiece = $('studioPiece');
  const studioParts = $('studioParts');
  const studioSwatches = $('studioSwatches');
  const swatchName = $('swatchName');
  const studioKeep = $('studioKeep');
  const studioOriginal = $('studioOriginal');
  const studioExit = $('studioExit');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const CASE_KEY = 'zenith-case-003';
  const GLAZE_KEY = 'zenith-glaze';
  const DATE_SEEN_KEY = 'zenith-date-seen';
  const SOLVED_STATUS = 'STATUS: solved. culprits at large. do not run. (they love it when you run.)';
  const CASE_BLURB = 'case #003. three clues, two suspects, one missing cookie.';

  // ---- state ----
  let lit = false;
  let deck = [];
  let lastNote = null;
  let secretIdx = 0;
  let hisIdx = 0;
  let caseIdx = 0;
  let cluesFound = 0;
  let caseSolved = false;
  let containmentStarted = false;
  let releaseCount = 0;
  let heartTimer = null;
  let noteTimer = null;

  // ---- helpers ----
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const onMain = () => !main.classList.contains('hidden');
  const breathOpen = () => breathOverlay.classList.contains('on');
  const overlayOpen = () => !!document.querySelector('.overlay.on');
  const motion = () => (reduceMotion.matches ? 'auto' : 'smooth');

  // restart a CSS animation even if the class is already there
  function replay(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  function isNight() {
    const hr = new Date().getHours();
    return hr >= 22 || hr < 5;
  }

  function stored(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function store(key, value) {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch (e) { /* private mode: just not remembered */ }
  }

  // bring the candle (and its note) into view
  const notesHead = document.querySelector('#notes .sec-head');
  function showCandle() {
    notesHead.scrollIntoView({ behavior: motion(), block: 'start' });
  }

  // time-aware subtitle
  const hour = new Date().getHours();
  const timeLine = hour < 12 ? 'in case the morning feels heavy'
    : hour < 18 ? 'in case the day feels heavy'
    : 'in case tonight feels heavy';
  document.querySelectorAll('[data-time-sub]').forEach((el) => { el.textContent = timeLine; });

  // ---- notes ----
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function nextNote() {
    if (deck.length === 0) {
      deck = shuffle(isNight() ? notes.concat(nightNotes) : notes);
      // never show the same note twice in a row across a reshuffle
      if (deck.length > 1 && deck[deck.length - 1] === lastNote) {
        [deck[deck.length - 1], deck[0]] = [deck[0], deck[deck.length - 1]];
      }
    }
    lastNote = deck.pop();
    return lastNote;
  }

  // a note arrives as a small paper card; kind: false | 'pink' | 'case' | 'his'
  function displayNote(text, kind) {
    clearTimeout(noteTimer);
    const showing = !noteCard.hidden;
    if (showing) noteCard.classList.add('is-out');
    noteTimer = setTimeout(() => {
      note.textContent = text;
      noteCard.classList.remove('is-out', 'is-in', 'is-secret', 'is-case', 'is-his');
      if (kind === 'pink') noteCard.classList.add('is-secret');
      if (kind === 'case') noteCard.classList.add('is-case');
      if (kind === 'his') noteCard.classList.add('is-his');
      noteCard.hidden = false;
      replay(noteCard, 'is-in');
    }, showing ? 300 : (lit ? 150 : 650));
  }

  function lightCandle() {
    if (lit) return;
    lit = true;
    scene.classList.add('lit');
    candleBtn.setAttribute('aria-label', 'Another note from the candle');
    hint.textContent = 'it’s lit. tap again whenever you want another note.';
  }

  function candleNote() {
    lightCandle();
    displayNote(nextNote(), false);
    heartOn(3000);
  }

  // ---- the culprits in hiding (dir: -1 faces left, 1 faces right) ----
  function makeHideaway(id, dir) {
    const wrap = $(id);
    const pal = wrap.querySelector('.dino-pal');
    const rawr = wrap.querySelector('.dino-rawr');
    const feet = wrap.querySelector('.feet-tap');
    const dino = { img: wrap.querySelector('.dino-image'), scared: false };

    function setOffsets(sx, sy, peekY, rot) {
      wrap.style.setProperty('--stalk-x', sx + 'px');
      wrap.style.setProperty('--stalk-y', sy + 'px');
      pal.style.setProperty('--peek-y', peekY + 'px');
      pal.style.setProperty('--peek-rot', rot + 'deg');
    }

    dino.stalk = (x, y) => {
      if (!onMain() || wrap.classList.contains('undercover') || pal.classList.contains('scare')) return;
      const nx = (x / Math.max(window.innerWidth, 1)) * 2 - 1;
      const ny = (y / Math.max(window.innerHeight, 1)) * 2 - 1;
      setOffsets(
        clamp(dir * nx * 16, -18, 18),
        clamp(ny * 8, -10, 10),
        clamp(-ny * 8, -12, 6),
        clamp(dir * nx * 7, -10, 10)
      );
      wrap.classList.add('stalking');
    };

    dino.reset = () => {
      if (pal.classList.contains('scare')) return;
      setOffsets(0, 0, 0, 0);
      wrap.classList.remove('stalking');
    };

    dino.scare = () => {
      if (dino.scared) return;
      dino.scared = true;
      rawr.classList.remove('show');
      wrap.classList.remove('stalking');
      setOffsets(0, 0, 0, 0);
      replay(pal, 'scare');
      rawr.classList.add('show');
      setTimeout(() => {
        pal.classList.remove('scare');
        dino.scared = false;
        dino.reset();
      }, 1150);
      setTimeout(() => rawr.classList.remove('show'), 900);
    };

    // hidden culprits can't be tabbed to
    dino.setUndercover = (on) => {
      wrap.classList.toggle('undercover', on);
      wrap.toggleAttribute('inert', on);
    };

    feet.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dino.scare();
    });
    feet.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        dino.scare();
      }
    });

    return dino;
  }

  const spino = makeHideaway('spinoHideaway', -1);
  const cerato = makeHideaway('ceratoHideaway', 1);
  const dinos = [spino, cerato];

  // ---- the cover ----
  $('startBtn').addEventListener('click', (e) => {
    const byKeyboard = e.detail === 0;
    intro.classList.add('leaving');
    setTimeout(() => {
      intro.hidden = true;
      main.classList.remove('hidden');
      main.classList.add('entering');
      window.scrollTo(0, 0);
      watchSections();
      // keyboard users land on the first choice instead of a vanished button
      if (byKeyboard) document.querySelector('.choice').focus({ preventScroll: true });
      // case already solved on an earlier visit: the culprits are waiting
      if (caseSolved) setTimeout(startChase, 900);
    }, reduceMotion.matches ? 0 : 420);
  });

  // gentle entrances, and the nav knows where you are
  function watchSections() {
    const reveals = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      reveals.forEach((el) => el.classList.add('in-view'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('in-view');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -6% 0px' });
    reveals.forEach((el) => io.observe(el));

    const links = Array.from(document.querySelectorAll('.nav a'));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => a.setAttribute('aria-current', a.getAttribute('href') === '#' + en.target.id ? 'true' : 'false'));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['top', 'notes', 'breathe', 'case', 'rest'].forEach((id) => spy.observe($(id)));
  }

  // ---- what sounds good right now? ----
  document.querySelectorAll('.choice').forEach((btn) => {
    btn.addEventListener('click', () => {
      const go = btn.dataset.go;
      if (go === 'notes') {
        showCandle();
        candleNote();
      } else if (go === 'breathe') {
        openBreath(btn);
      } else if (go === 'case') {
        $('case').scrollIntoView({ behavior: motion(), block: 'start' });
      } else if (go === 'rest') {
        if (!restMode) startRest();
        else showCandle();
      }
    });
  });

  // ---- the candle ----
  candleBtn.addEventListener('click', () => {
    candleNote();
    if (chase.active && !containmentStarted) beginContainment();
    else chase.runners.forEach(recontainRunner);
  });

  anotherNote.addEventListener('click', candleNote);

  putAway.addEventListener('click', () => {
    clearTimeout(noteTimer);
    noteCard.classList.add('is-out');
    noteTimer = setTimeout(() => {
      noteCard.hidden = true;
      noteCard.classList.remove('is-out');
    }, reduceMotion.matches ? 0 : 320);
    candleBtn.focus({ preventScroll: true });
  });

  $('nameTap').addEventListener('click', () => {
    lightCandle();
    displayNote(caseIdx === 0 ? caseNote : caseNote2, 'case');
    caseIdx = 1 - caseIdx;
    showCandle();
  });

  flameTap.addEventListener('click', () => {
    displayNote(secretNotes[secretIdx], 'pink');
    secretIdx = (secretIdx + 1) % secretNotes.length;
    heartOn(3000);
  });

  hisPiece.addEventListener('click', () => {
    lightCandle();
    hisPiece.classList.add('lit');
    displayNote(hisNotes[hisIdx], 'his');
    hisIdx = (hisIdx + 1) % hisNotes.length;
    heartOn(3000);
  });

  // ---- full-screen overlays share one open/close ----
  function openOverlay(el, focusEl) {
    el.classList.add('on');
    el.removeAttribute('inert');
    main.setAttribute('inert', '');
    focusEl.focus({ preventScroll: true });
  }

  function closeOverlay(el, returnFocusEl) {
    el.classList.remove('on');
    el.setAttribute('inert', '');
    main.removeAttribute('inert');
    if (returnFocusEl) returnFocusEl.focus({ preventScroll: true });
  }

  // ---- breathing with the axolotl: one clock for the orb, the words and the count ----
  const BREATHS = 6; // 6 × (4 in + 6 out) = one minute
  let breathN = 0;
  let breathPaused = false;
  let phaseTimer = null;
  let tickTimer = null;
  let breathOpener = axoTap;

  breathProgress.innerHTML = '<span></span>'.repeat(BREATHS);
  const breathDots = Array.from(breathProgress.children);
  const breathOrb = breathStage.querySelector('.breath-orb');

  function stopBreathClock() {
    clearTimeout(phaseTimer);
    clearInterval(tickTimer);
  }

  function syncBreathProgress(phase) {
    breathDots.forEach((d, i) => {
      d.classList.toggle('done', i < breathN);
      d.classList.toggle('now', i === breathN && (phase === 'in' || phase === 'out'));
    });
    breathProgress.setAttribute('aria-label', 'breath ' + Math.min(breathN + 1, BREATHS) + ' of ' + BREATHS);
  }

  function setPhase(phase, secs) {
    stopBreathClock();
    breathStage.dataset.phase = phase;
    breathText.textContent = phase === 'in' ? 'breathe in' : 'and out, slowly';
    let left = secs;
    breathTick.textContent = String(left);
    tickTimer = setInterval(() => {
      left -= 1;
      if (left > 0) breathTick.textContent = String(left);
    }, 1000);
    phaseTimer = setTimeout(phase === 'in' ? () => setPhase('out', 6) : afterExhale, secs * 1000);
    syncBreathProgress(phase);
  }

  function afterExhale() {
    breathN += 1;
    if (breathN >= BREATHS) finishBreathing();
    else setPhase('in', 4);
  }

  function startBreathing() {
    breathN = 0;
    breathPaused = false;
    breathOrb.style.transform = '';
    breathOrb.style.opacity = '';
    breathPause.hidden = false;
    breathPause.textContent = 'pause';
    breathAgain.hidden = true;
    // start from the small orb so the first breath in is visible
    breathStage.dataset.phase = 'ready';
    void breathOrb.offsetWidth;
    setPhase('in', 4);
  }

  function finishBreathing() {
    stopBreathClock();
    breathStage.dataset.phase = 'done';
    breathText.textContent = 'that’s a minute. nicely done.';
    breathTick.textContent = '';
    breathPause.hidden = true;
    breathAgain.hidden = false;
    syncBreathProgress('done');
    breathAgain.focus({ preventScroll: true });
  }

  function togglePause() {
    if (!breathPaused) {
      breathPaused = true;
      // freeze the orb exactly where it is
      const cs = getComputedStyle(breathOrb);
      breathOrb.style.transform = cs.transform;
      breathOrb.style.opacity = cs.opacity;
      stopBreathClock();
      breathStage.dataset.phase = 'paused';
      breathText.textContent = 'paused. take your time.';
      breathTick.textContent = '';
      breathPause.textContent = 'resume';
      syncBreathProgress('paused');
    } else {
      breathPaused = false;
      breathOrb.style.transform = '';
      breathOrb.style.opacity = '';
      breathPause.textContent = 'pause';
      setPhase('in', 4);
    }
  }

  function openBreath(opener) {
    breathOpener = opener || axoTap;
    lightCandle();
    openOverlay(breathOverlay, breathPause);
    startBreathing();
  }

  function closeBreath() {
    if (!breathOpen()) return;
    stopBreathClock();
    closeOverlay(breathOverlay);
    displayNote(notes[2], false);
    showCandle();
    breathOpener.focus({ preventScroll: true });
  }

  axoTap.addEventListener('click', () => openBreath(axoTap));
  breatheBtn.addEventListener('click', () => openBreath(breatheBtn));
  breathPause.addEventListener('click', togglePause);
  breathAgain.addEventListener('click', () => {
    startBreathing();
    breathPause.focus({ preventScroll: true });
  });
  breathExit.addEventListener('click', closeBreath);

  // ---- keepsakes: the pottery place opens once the case is closed ----
  function unlockKeepsakes() {
    keepsakes.hidden = false;
    paintBtn.hidden = !(stored(DATE_SEEN_KEY) || stored(GLAZE_KEY));
    replay(keepsakes, 'on');
  }

  // ---- little pottery drawings for the chapter ----
  let potId = 0;

  function potSVG(o) {
    const id = 'pot' + (++potId);
    const x = o.x || 0;
    const body = 'M' + (x + 18) + ' 60 Q' + (x + 18) + ' 56 ' + (x + 22) + ' 56 H' + (x + 98) + ' Q' + (x + 102) + ' 56 ' + (x + 102) + ' 60 C' + (x + 102) + ' 88 ' + (x + 84) + ' 108 ' + (x + 60) + ' 108 C' + (x + 36) + ' 108 ' + (x + 18) + ' 88 ' + (x + 18) + ' 60 Z';
    let out = '<defs><clipPath id="' + id + 'c"><path d="' + body + '"/></clipPath>' +
      '<pattern id="' + id + 'p" width="11" height="7" patternUnits="userSpaceOnUse">' +
      '<circle cx="5.5" cy="0" r="2.6" fill="' + (o.spots || 'none') + '"/>' +
      '<circle cx="0" cy="3.5" r="2.6" fill="' + (o.spots || 'none') + '"/>' +
      '<circle cx="11" cy="3.5" r="2.6" fill="' + (o.spots || 'none') + '"/></pattern></defs>';
    if (o.candle) {
      if (o.lit) {
        out += '<circle cx="' + (x + 60) + '" cy="10" r="34" fill="url(#chapterGlow)"/>' +
          '<path d="M' + (x + 60) + ' -4 C' + (x + 66) + ' 4 ' + (x + 67) + ' 10 ' + (x + 60) + ' 15 C' + (x + 53) + ' 10 ' + (x + 54) + ' 4 ' + (x + 60) + ' -4 Z" fill="#ffc97a"/>';
      }
      out += '<rect x="' + (x + 59) + '" y="14" width="2" height="7" rx="1" fill="#4a3a45"/>' +
        '<rect x="' + (x + 47) + '" y="20" width="26" height="38" rx="3" fill="#fdf3e3"/>';
    }
    out += '<path d="' + body + '" fill="' + o.body + '"/>';
    if (o.spots) out += '<rect x="' + x + '" y="50" width="120" height="60" fill="url(#' + id + 'p)" clip-path="url(#' + id + 'c)"/>';
    out += '<ellipse cx="' + (x + 60) + '" cy="57" rx="44" ry="5" fill="' + o.rim + '"/>';
    if (o.dots) {
      for (let i = -4; i <= 4; i++) {
        out += '<circle cx="' + (x + 60 + i * 9.5) + '" cy="57.4" r="1.5" fill="' + o.dots + '"/>';
      }
    }
    return out;
  }

  const BISQUE = { body: '#e6ddd0', rim: '#efe8dd' };
  const HERS = { body: '#f0adbb', rim: '#f3b3c1', dots: '#fff6ea', spots: 'rgba(197,109,131,0.35)', candle: true };
  const HIS = { body: '#1f2d5c', rim: '#34498a', spots: null };

  function svgWrap(inner, viewBox) {
    return '<svg viewBox="' + (viewBox || '0 -12 240 126') + '" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><radialGradient id="chapterGlow"><stop offset="0" stop-color="rgba(255,201,122,0.5)"/>' +
      '<stop offset="1" stop-color="rgba(255,201,122,0)"/></radialGradient></defs>' + inner + '</svg>';
  }

  function paintPots() {
    const colours = ['#f5b8c4', '#ffd3dc', '#fff6ea', '#1f2d5c', '#ffc97a', '#9db59a'];
    return colours.map((c, i) => {
      const cx = 30 + i * 36;
      const cy = 38 + (i % 2) * 14;
      return '<rect x="' + (cx - 13) + '" y="' + cy + '" width="26" height="28" rx="5" fill="rgba(255,246,234,0.14)"/>' +
        '<ellipse cx="' + cx + '" cy="' + (cy + 2) + '" rx="11" ry="4" fill="' + c + '"/>';
    }).join('');
  }

  function brush(x, y) {
    return '<g transform="rotate(-38 ' + x + ' ' + y + ')">' +
      '<rect x="' + (x - 2.5) + '" y="' + (y - 64) + '" width="5" height="48" rx="2.5" fill="#c9a37a"/>' +
      '<rect x="' + (x - 3.2) + '" y="' + (y - 18) + '" width="6.4" height="7" fill="#a8a9b4"/>' +
      '<path d="M' + (x - 3.2) + ' ' + (y - 11) + ' Q' + x + ' ' + (y + 4) + ' ' + (x + 3.2) + ' ' + (y - 11) + ' Z" fill="#ffd3dc"/></g>';
  }

  function laughs() {
    const has = [[70, 40, -12, 30], [128, 22, 8, 38], [176, 58, -4, 26], [100, 92, 10, 24]];
    return has.map(([x, y, r, size]) =>
      '<text x="' + x + '" y="' + y + '" transform="rotate(' + r + ' ' + x + ' ' + y + ')" font-family="Caveat, cursive" font-size="' + size + '" fill="#f5b8c4">ha</text>'
    ).join('') +
      '<text x="40" y="92" font-size="14" fill="#ffc97a">✦</text><text x="196" y="22" font-size="12" fill="#ffc97a">✦</text>';
  }

  // the story of the first date. every line here is editable: it's his voice.
  const chapterScenes = [
    {
      art: () => svgWrap(potSVG(Object.assign({ x: -4 }, BISQUE)) + potSVG(Object.assign({ x: 124 }, BISQUE))),
      line: 'may 29th. a pottery place, and two plain pieces waiting to become something.'
    },
    {
      art: () => svgWrap(paintPots()),
      line: 'you took ages deciding which colours to use. i didn’t mind. i liked watching you decide.'
    },
    {
      art: () => svgWrap(potSVG(Object.assign({ x: 60 }, HERS, { candle: false })) + brush(150, 56)),
      line: 'then the rim. all those tiny circles. you worked on it forever, slow and careful. it came out perfect.'
    },
    {
      art: () => svgWrap(potSVG(Object.assign({ x: 60 }, HIS))),
      line: 'i painted mine dark blue. honestly, i was mostly watching yours.'
    },
    {
      art: () => svgWrap(laughs()),
      line: 'somewhere in there you laughed. i still hear it at random hours.'
    },
    {
      art: () => svgWrap(potSVG(Object.assign({ x: -4 }, HERS, { lit: true })) + potSVG(Object.assign({ x: 124 }, HIS))),
      line: 'that’s where this page started. all of it grew out of that date.'
    },
    {
      art: () => svgWrap(potSVG(Object.assign({ x: 60 }, BISQUE)) + brush(112, 60)),
      line: 'so here’s a fresh one. your turn again.',
      final: true
    }
  ];

  let chapterIdx = 0;

  chapterDots.innerHTML = chapterScenes.map(() => '<span></span>').join('');

  function showScene(i) {
    chapterIdx = clamp(i, 0, chapterScenes.length - 1);
    const sc = chapterScenes[chapterIdx];
    chapterArt.innerHTML = sc.art();
    chapterLine.textContent = sc.line;
    replay(chapterArt, 'turn');
    Array.from(chapterDots.children).forEach((d, j) => d.classList.toggle('on', j === chapterIdx));
    chapterPrev.disabled = chapterIdx === 0;
    chapterNext.textContent = sc.final ? 'paint it' : 'next';
    if (sc.final) {
      store(DATE_SEEN_KEY, '1');
      paintBtn.hidden = false;
    }
  }

  function openChapter() {
    showScene(0);
    openOverlay(chapter, chapterNext);
  }

  function closeChapter() {
    closeOverlay(chapter, doorBtn);
  }

  doorBtn.addEventListener('click', openChapter);
  chapterPrev.addEventListener('click', () => showScene(chapterIdx - 1));
  chapterNext.addEventListener('click', () => {
    if (chapterScenes[chapterIdx].final) {
      closeOverlay(chapter);
      openStudio();
    } else {
      showScene(chapterIdx + 1);
    }
  });
  chapterExit.addEventListener('click', closeChapter);
  chapter.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' && !chapterScenes[chapterIdx].final) { e.preventDefault(); showScene(chapterIdx + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); showScene(chapterIdx - 1); }
  });

  // ---- the studio: repaint her candle holder ----
  const glazes = [
    { name: 'her may pink', c: '#f5b8c4' },
    { name: 'blush', c: '#ffd3dc' },
    { name: 'candle glow', c: '#ffc97a' },
    { name: 'cinnamon', c: '#b5652b' },
    { name: 'corn snake', c: '#e0703a' },
    { name: 'sage', c: '#9db59a' },
    { name: 'lavender', c: '#b9a7d6' },
    { name: 'his dark blue', c: '#1f2d5c' },
    { name: 'kingsnake cream', c: '#fff6ea' },
    { name: 'kingsnake black', c: '#2e2a33' }
  ];

  // her original, exactly as the css draws it
  const ORIGINAL_VARS = {
    '--glaze': '#f5b8c4', '--glaze-deep': '#e39aab', '--glaze-edge': '#d4879b',
    '--spots': 'rgba(197,109,131,0.30)',
    '--rim-top': '#fac9d3', '--rim': '#e39aab',
    '--rim-dots': 'rgba(255,246,234,0.85)'
  };

  const PART_VARS = {
    glaze: ['--glaze', '--glaze-deep', '--glaze-edge'],
    spots: ['--spots'],
    rim: ['--rim-top', '--rim'],
    dots: ['--rim-dots']
  };

  // mix a hex colour toward white (amt > 0) or black (amt < 0)
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const t = amt < 0 ? 0 : 255;
    const a = Math.abs(amt);
    const ch = (v) => Math.round(v + (t - v) * a);
    return 'rgb(' + ch(n >> 16) + ',' + ch((n >> 8) & 255) + ',' + ch(n & 255) + ')';
  }

  function alpha(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }

  function partValues(part, hex) {
    if (part === 'glaze') return [hex, shade(hex, -0.1), shade(hex, -0.18)];
    if (part === 'spots') return [alpha(hex, 0.5)];
    if (part === 'dots') return [alpha(hex, 0.9)];
    return [shade(hex, 0.12), shade(hex, -0.08)];
  }

  // colours: { glaze, spots, rim, dots } of hex strings; missing = her original
  function glazeVars(colours) {
    const vars = Object.assign({}, ORIGINAL_VARS);
    Object.keys(PART_VARS).forEach((part) => {
      if (!colours[part]) return;
      const vals = partValues(part, colours[part]);
      PART_VARS[part].forEach((v, i) => { vars[v] = vals[i]; });
    });
    return vars;
  }

  function applyGlaze(el, colours) {
    const vars = glazeVars(colours);
    Object.keys(vars).forEach((v) => el.style.setProperty(v, vars[v]));
  }

  function loadGlaze() {
    try { return JSON.parse(stored(GLAZE_KEY)) || {}; } catch (e) { return {}; }
  }

  let studioColours = {};
  let studioPart = 'glaze';

  studioSwatches.innerHTML = glazes.map((g) =>
    '<button class="swatch" type="button" style="--c:' + g.c + '" data-c="' + g.c + '" aria-label="' + g.name + '" title="' + g.name + '" aria-pressed="false"></button>'
  ).join('');
  const swatchEls = Array.from(studioSwatches.children);
  const partEls = Array.from(studioParts.children);

  function syncStudio() {
    applyGlaze(studioPiece, studioColours);
    partEls.forEach((b) => b.setAttribute('aria-checked', b.dataset.part === studioPart ? 'true' : 'false'));
    const current = studioColours[studioPart];
    swatchEls.forEach((b) => b.setAttribute('aria-pressed', b.dataset.c === current ? 'true' : 'false'));
    const g = glazes.find((x) => x.c === current);
    swatchName.textContent = g ? g.name : 'as she painted it on may 29th';
  }

  function openStudio() {
    studioColours = loadGlaze();
    studioPart = 'glaze';
    syncStudio();
    openOverlay(studio, partEls[0]);
  }

  function closeStudio() {
    closeOverlay(studio, paintBtn.hidden ? doorBtn : paintBtn);
  }

  partEls.forEach((b) => b.addEventListener('click', () => {
    studioPart = b.dataset.part;
    syncStudio();
  }));

  swatchEls.forEach((b) => b.addEventListener('click', () => {
    studioColours[studioPart] = b.dataset.c;
    syncStudio();
  }));

  studioOriginal.addEventListener('click', () => {
    studioColours = {};
    syncStudio();
  });

  studioKeep.addEventListener('click', () => {
    const kept = Object.keys(studioColours).length > 0;
    store(GLAZE_KEY, kept ? JSON.stringify(studioColours) : null);
    applyGlaze(document.documentElement, studioColours);
    closeStudio();
    lightCandle();
    displayNote(kept ? 'kept. same piece, painted twice.' : 'back to may 29th. exactly as you made it.', 'pink');
    showCandle();
  });

  paintBtn.addEventListener('click', openStudio);
  studioExit.addEventListener('click', closeStudio);

  // wear her latest version from the start
  applyGlaze(document.documentElement, loadGlaze());

  // ---- CASE FILE #003: the vanishing dinosaurs ----
  function loadCase() {
    try { return JSON.parse(stored(CASE_KEY)) || {}; } catch (e) { return {}; }
  }

  function saveCase() {
    store(CASE_KEY, JSON.stringify({
      found: clueEls.filter((c) => c.classList.contains('found')).map((c) => c.dataset.clue),
      solved: caseSolved
    }));
  }

  // the little ticket that follows you: progress, then whatever the culprits are up to
  function setStatus(text, short) {
    caseStatus.textContent = text;
    if (short) caseTab.dataset.short = short;
    syncCaseTab();
  }

  let chipQuietTimer = null;
  function syncCaseTab() {
    caseTab.hidden = !(cluesFound > 0 || caseSolved);
    const short = caseTab.dataset.short || (cluesFound + ' of ' + clueEls.length + ' found');
    const value = caseTab.querySelector('.chip-v');
    if (value.textContent === ' · ' + short) return;
    value.textContent = ' · ' + short;
    caseTab.setAttribute('aria-label', 'case #003: ' + short + '. open the case file');
    // say the news, then shrink so it never sits on top of a note for long
    caseTab.classList.remove('quiet');
    clearTimeout(chipQuietTimer);
    chipQuietTimer = setTimeout(() => caseTab.classList.add('quiet'), 5000);
  }

  function syncCaseFile() {
    const state = caseSolved ? 'solved' : cluesFound > 0 ? 'progress' : 'open';
    caseFile.dataset.state = state;
    caseStamp.textContent = state === 'progress' ? 'in progress' : state;
    caseCount.textContent = cluesFound + ' of ' + clueEls.length;
    choiceCaseDesc.textContent = caseSolved
      ? 'case closed. the culprits, however, are not.'
      : cluesFound > 0
        ? 'case #003. ' + cluesFound + ' of ' + clueEls.length + ' clues found. keep looking.'
        : CASE_BLURB;
    syncCaseTab();
  }

  function markClue(clue) {
    clue.classList.add('found');
    const key = clue.dataset.clue;
    const ev = caseFile.querySelector('[data-ev="' + key + '"]');
    if (ev) {
      ev.classList.add('got');
      ev.querySelector('.ev-name').textContent = evLabels[key];
      ev.querySelector('.ev-art').innerHTML = '<div class="clue-copy">' + clue.innerHTML + '</div>';
    }
    cluesFound++;
    return ev;
  }

  function markSolved(animate) {
    caseSolved = true;
    caseTab.dataset.short = 'solved';
    setStatus(SOLVED_STATUS, 'culprits at large');
    caseVerdictText.textContent = caseVerdict;
    caseVerdictText.hidden = false;
    caseReset.hidden = false;
    syncCaseFile();
    if (animate) replay(caseStamp, 'thunk');
  }

  caseTab.addEventListener('click', () => {
    $('case').scrollIntoView({ behavior: motion(), block: 'start' });
  });

  caseReset.addEventListener('click', () => {
    store(CASE_KEY, null);
    location.reload();
  });

  clueEls.forEach((clue) => {
    clue.addEventListener('click', () => {
      if (clue.classList.contains('found') || caseSolved) return;
      const ev = markClue(clue);
      if (ev) replay(ev, 'just-found');
      saveCase();
      delete caseTab.dataset.short;
      syncCaseFile();
      replay(caseTab, 'ping');
      if (cluesFound >= clueEls.length) {
        setStatus('STATUS: evidence complete. naming the culprits…', 'naming the culprits…');
        setTimeout(solveCase, 800);
      }
    });
  });

  function solveCase() {
    if (caseSolved) return;
    markSolved(false);
    saveCase();
    revealDim.classList.add('on');
    revealLine.textContent = 'the culprits reveal themselves…';
    revealLine.classList.add('on');
    setTimeout(() => dinos.forEach((d) => d.setUndercover(false)), 1200);
    setTimeout(() => {
      cerato.scare();
      setTimeout(spino.scare, 550);
    }, 2100);
    setTimeout(() => {
      revealDim.classList.remove('on');
      revealLine.classList.remove('on');
      lightCandle();
      // the verdict is typed up in the case file
      $('case').scrollIntoView({ behavior: motion(), block: 'start' });
      replay(caseStamp, 'thunk');
    }, 3300);
    setTimeout(() => {
      startChase();
      unlockKeepsakes();
    }, 4200);
  }

  // pick up where the last visit left off (same storage format as always)
  (function restoreCase() {
    const saved = loadCase();
    const found = Array.isArray(saved.found) ? saved.found : [];
    clueEls.forEach((clue) => {
      if (found.includes(clue.dataset.clue)) markClue(clue);
    });
    if (saved.solved || cluesFound >= clueEls.length) {
      markSolved(false);
      unlockKeepsakes();
    }
    syncCaseFile();
  })();

  // ---- culprits at large: the chase ----
  // free runners live in viewport coordinates (position: fixed);
  // caged or chewing runners are anchored to the page so they scroll with it
  const chase = {
    active: false,
    tx: window.innerWidth / 2,
    ty: window.innerHeight * 0.55,
    runners: []
  };

  function setChaseTarget(x, y) {
    chase.tx = clamp(x, 8, window.innerWidth - 8);
    chase.ty = clamp(y, 8, window.innerHeight - 8);
  }

  // layout size, cached so the animation loop never forces a reflow
  function measureRunner(r) {
    r.w = r.el.offsetWidth || 60;
    r.h = r.el.offsetHeight || 66;
  }

  function placeRunner(r) {
    r.el.style.transform = 'translate(' + (r.x - r.w / 2) + 'px,' + (r.y - r.h + 6) + 'px)';
  }

  function anchorRunner(r) {
    if (r.anchored) return;
    r.anchored = true;
    r.x += window.scrollX;
    r.y += window.scrollY;
    r.el.classList.add('anchored');
    placeRunner(r);
  }

  function unanchorRunner(r) {
    if (!r.anchored) return;
    r.anchored = false;
    r.x -= window.scrollX;
    r.y -= window.scrollY;
    r.el.classList.remove('anchored');
    placeRunner(r);
  }

  // where a paddock (or button) sits on the page
  function pageSpot(el, dy) {
    const c = el.getBoundingClientRect();
    return { x: c.left + c.width / 2 + window.scrollX, y: c.bottom + dy + window.scrollY };
  }

  function makeRunner(srcImg, opts) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'chaser';
    el.setAttribute('aria-label', opts.label);
    const flip = document.createElement('span');
    flip.className = 'flip';
    const body = document.createElement('span');
    body.className = 'body';
    const img = srcImg.cloneNode(false);
    img.removeAttribute('class');
    img.alt = '';
    const rawr = document.createElement('span');
    rawr.className = 'crawr';
    rawr.textContent = 'RAWR.';
    const bonk = document.createElement('span');
    bonk.className = 'cbonk';
    bonk.textContent = opts.bonkText || 'bonk.';
    const stars = document.createElement('span');
    stars.className = 'cstars';
    stars.textContent = '✦ ✦ ✦';
    body.appendChild(img);
    flip.appendChild(body);
    el.appendChild(flip);
    el.appendChild(rawr);
    el.appendChild(bonk);
    el.appendChild(stars);
    document.body.appendChild(el);

    const runner = {
      el, flip, body, rawr, bonk, stars,
      x: opts.x, y: opts.y,
      w: 0, h: 0,
      speed: opts.speed,          // easing per second
      stopDist: opts.stopDist,    // personal space, px
      face: 1,
      popping: false,
      anchored: false,
      stunUntil: 0,
      rearm: 0,
      kvx: 0,
      kvy: 0
    };

    function pop(e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      if (runner.popping) return;
      runner.popping = true;
      rawr.classList.remove('show');
      replay(el, 'pop');
      rawr.classList.add('show');
      if (runner.caged && runner.cageFront) {
        replay(runner.cageFront, 'rattle');
        setTimeout(() => runner.cageFront.classList.remove('rattle'), 340);
      }
      setTimeout(() => { el.classList.remove('pop'); runner.popping = false; }, 520);
      setTimeout(() => rawr.classList.remove('show'), 920);
    }
    el.addEventListener('pointerdown', pop);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') pop(e);
    });

    return runner;
  }

  function bonkRunner(r, now) {
    r.rearm = now + 1500;
    r.stunUntil = now + 900;
    r.stars.textContent = ankyCursor.classList.contains('heart') ? '♡ ♡ ♡' : '✦ ✦ ✦';
    // no knockback flight when motion is reduced, just the dizzy stars
    const ang = Math.atan2((r.y - 30) - ankyY, r.x - ankyX);
    const force = reduceMotion.matches ? 0 : 1;
    r.kvx = Math.cos(ang) * 360 * force;
    r.kvy = (Math.sin(ang) * 220 - 110) * force;
    r.bonk.classList.remove('show');
    r.stars.classList.remove('show');
    replay(r.el, 'bonked');
    r.bonk.classList.add('show');
    r.stars.classList.add('show');
    setTimeout(() => r.el.classList.remove('bonked'), 950);
    setTimeout(() => { r.bonk.classList.remove('show'); r.stars.classList.remove('show'); }, 1000);
    replay(ankyCursor, 'bonk');
    setTimeout(() => ankyCursor.classList.remove('bonk'), 340);
  }

  function chaseFrame(now) {
    if (!chase.active) return;
    const dt = Math.min(0.05, (now - chase.last) / 1000 || 0.016);
    chase.last = now;

    // the anky sets the pace: bleed off speed when she stops moving
    if (now - ankyMoveT > 110) ankySpeed *= Math.exp(-4.5 * dt);
    const norm = Math.min(1, ankySpeed / 620);
    // no cursor to follow on a phone: once she stops touching, they wander to the bottom edge
    const loiter = !finePointer && !restMode && now - lastPointerT > 2500;
    const tx = loiter ? window.innerWidth / 2 : chase.tx;
    const ty = loiter ? window.innerHeight - 8 : chase.ty;
    const paceFactor = 0.58 + norm * 1.02;   // dawdle when she's still, sprint when she bolts
    const spaceFactor = 0.82 + norm * 0.5;   // and give her more room at speed

    chase.runners.forEach((r) => {
      if (r.caged || r.chewing) return;
      if (!r.w) measureRunner(r);
      let moved = 0;

      if (r.goingHome) {
        // on a mission: paddock or button. the target is on the page, so follow the scroll
        const hx = r.homeX - window.scrollX;
        const hy = r.homeY - window.scrollY;
        const dx = hx - r.x;
        const dy = hy - r.y;
        if (Math.hypot(dx, dy) > 6) {
          const k = Math.min(1, 1 - Math.pow(1 - Math.min(0.999, 3.2 * 0.016), dt / 0.016));
          const nx = r.x + dx * k;
          const ny = r.y + dy * k;
          moved = Math.hypot(nx - r.x, ny - r.y);
          r.x = nx; r.y = ny;
          if (Math.abs(dx) > 4) r.face = dx >= 0 ? 1 : -1;
        } else {
          r.x = hx; r.y = hy;
          r.goingHome = false;
          r.el.classList.remove('running');
          anchorRunner(r);
          if (r.homeKind === 'chew') {
            startChew(r);
            return;
          }
          r.caged = true;
          r.el.classList.add('caged');
          r.face = -1;
          r.flip.style.transform = 'scaleX(-1)';
          if (r.cageFront) r.cageFront.classList.remove('open');
          lockCage(r);
          return;
        }
      } else if (now < r.stunUntil) {
        // knocked back by the bonk
        r.x += r.kvx * dt;
        r.y += r.kvy * dt;
        const damp = Math.exp(-5.5 * dt);
        r.kvx *= damp;
        r.kvy *= damp;
      } else {
        const dx = tx - r.x;
        const dy = ty - r.y;
        if (Math.hypot(dx, dy) > r.stopDist * spaceFactor) {
          const rate = Math.min(0.999, r.speed * paceFactor * 0.016);
          const pull = Math.min(1, 1 - Math.pow(1 - rate, dt / 0.016));
          const nx = r.x + dx * pull;
          const ny = r.y + dy * pull;
          moved = Math.hypot(nx - r.x, ny - r.y);
          r.x = nx; r.y = ny;
          if (Math.abs(dx) > 4) r.face = dx >= 0 ? 1 : -1;
        }
      }

      // free-range culprits stay on screen; ones on a mission may walk off it
      if (!r.goingHome) {
        r.x = clamp(r.x, r.w / 2, window.innerWidth - r.w / 2);
        r.y = clamp(r.y, r.h + 56, window.innerHeight - 6);
      }

      // the anky bonks whoever he touches (free-range culprits only)
      if (ankyX !== null && !r.goingHome && now >= r.rearm) {
        const bd = Math.hypot(ankyX - r.x, ankyY - (r.y - r.h * 0.45));
        if (bd < 58) bonkRunner(r, now);
      }

      placeRunner(r);
      r.flip.style.transform = 'scaleX(' + r.face + ')';
      r.el.classList.toggle('running', moved > 0.25);
    });

    requestAnimationFrame(chaseFrame);
  }

  function startChase() {
    if (chase.active) return;
    chase.active = true;

    // culprits duck out of the corners and hit the ground running
    dinos.forEach((d) => d.setUndercover(true));

    chase.runners = [
      makeRunner(cerato.img, {
        label: 'The Ceratosaurus, in hot pursuit',
        x: 70, y: 140,
        speed: 3.4,
        stopDist: 58,
        bonkText: 'ow.'
      }),
      makeRunner(spino.img, {
        label: 'The Spinosaurus, in slightly less hot pursuit',
        x: window.innerWidth - 70, y: 140,
        speed: 2.3,
        stopDist: 96,
        bonkText: 'rude.'
      })
    ];

    chase.last = performance.now();
    requestAnimationFrame(chaseFrame);
  }

  // ---- the detective is an ankylosaurus ----
  let ankyShown = false;
  let ankyLastX = null;
  let ankyWaddleT = null;
  let ankyX = null;
  let ankyY = null;
  let ankySpeed = 0;
  let ankyMoveT = 0;

  function moveAnky(x, y) {
    if (!ankyShown) {
      ankyShown = true;
      ankyCursor.classList.add('on');
      if (finePointer) document.documentElement.classList.add('anky-hide-cursor');
    }
    // how fast is the detective actually moving?
    const tNow = performance.now();
    if (ankyX !== null && ankyMoveT) {
      const gap = Math.max(8, tNow - ankyMoveT);
      if (gap < 260) {
        const inst = Math.hypot(x - ankyX, y - ankyY) / (gap / 1000);
        ankySpeed += (Math.min(2600, inst) - ankySpeed) * 0.28;
      }
    }
    ankyMoveT = tNow;
    ankyX = x;
    ankyY = y;
    ankyCursor.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    if (ankyLastX !== null && Math.abs(x - ankyLastX) > 2) {
      ankyCursor.classList.toggle('left', x < ankyLastX);
    }
    ankyLastX = x;
    ankyCursor.classList.add('waddle');
    clearTimeout(ankyWaddleT);
    ankyWaddleT = setTimeout(() => ankyCursor.classList.remove('waddle'), 150);
  }

  // ---- containment protocol: the candle is the perimeter fence switch ----
  function lockCage(r) {
    if (r.cageFront) {
      replay(r.cageFront, 'zap');
      setTimeout(() => r.cageFront.classList.remove('zap'), 600);
    }
    const cagedCount = chase.runners.filter((q) => q.caged).length;
    if (cagedCount === 1) {
      setStatus('STATUS: one culprit contained. one en route. (dragging their feet.)', 'one contained');
    } else if (cagedCount >= 2) {
      if (releaseCount > 0) setStatus('STATUS: re-contained. a replacement button has been installed. (please. do not.)', 're-contained');
      else setStatus('STATUS: all culprits contained. visiting hours: always.', 'all contained');
    }
    if (r.releaseBtn) setTimeout(() => r.releaseBtn.classList.add('on'), 500);
  }

  function sendToCage(r) {
    const spot = pageSpot(r.cageFront, -12);
    r.homeX = spot.x;
    r.homeY = spot.y;
    r.goingHome = true;
    r.homeKind = 'cage';
    r.stunUntil = 0;
  }

  function beginContainment() {
    if (containmentStarted || !chase.active) return;
    containmentStarted = true;
    stage.classList.add('contained');

    // let the paddocks settle in, then everybody home
    setTimeout(() => {
      const [cer, sp] = chase.runners;
      sp.cageFront = cageFront;
      sp.releaseBtn = releaseBtn;
      cer.cageFront = cageFront2;
      cer.releaseBtn = releaseBtn2;
      sendToCage(sp);
      sendToCage(cer);
    }, 720);
  }

  function recontainRunner(r) {
    if (!r || !r.loose || r.caged || r.chewing || r.goingHome) return;
    r.loose = false;
    sendToCage(r);
  }

  // ---- the release buttons (two mistakes) ----
  function wireRelease(btn, idx, cageEl, name) {
    btn.addEventListener('click', () => {
      const r = chase.runners[idx];
      if (!r || !r.caged || btn.disabled) return;
      releaseCount++;
      btn.disabled = true;
      // gate malfunction
      replay(cageEl, 'zap');
      setTimeout(() => {
        cageEl.classList.remove('zap');
        cageEl.classList.add('open');
        r.caged = false;
        r.el.classList.remove('caged');
        unanchorRunner(r);
        setStatus('STATUS: containment breach. (who pressed the button.)', 'containment breach');
        const spot = pageSpot(btn, 34);
        r.goingHome = true;
        r.homeKind = 'chew';
        r.homeX = spot.x;
        r.homeY = spot.y;
        r.stunUntil = 0;
        r.loose = true;
        r.chewName = name;
      }, 420);
    });
  }

  wireRelease(releaseBtn, 1, cageFront, 'spinosaurus');
  wireRelease(releaseBtn2, 0, cageFront2, 'ceratosaurus');

  function startChew(r) {
    r.chewing = true;
    const btn = r.releaseBtn;
    ['bite1', 'bite2', 'bite3'].forEach((cls, i) => {
      setTimeout(() => {
        replay(r.el, 'chomp');
        btn.classList.add(cls);
      }, i * 380);
    });
    setTimeout(() => {
      btn.classList.add('eaten');
      const prev = r.bonk.textContent;
      r.bonk.textContent = 'crunch.';
      replay(r.bonk, 'show');
      setTimeout(() => { r.bonk.classList.remove('show'); r.bonk.textContent = prev; }, 950);
      setStatus('STATUS: the ' + r.chewName + ' ate the release button. culprit at large. (this is why we can’t have nice buttons.)', 'button eaten');
    }, 1180);
    setTimeout(() => {
      btn.classList.remove('on', 'bite1', 'bite2', 'bite3', 'eaten');
      btn.disabled = false;
      r.el.classList.remove('chomp');
      r.chewing = false;
      unanchorRunner(r);
    }, 1650);
  }

  // ---- the heart: candle clicks melt the cursor for a moment ----
  function heartOn(ms) {
    if (!ankyShown) return;
    if (!ankyCursor.classList.contains('heart')) {
      ankyCursor.classList.add('heart', 'heart-pop');
      setTimeout(() => ankyCursor.classList.remove('heart-pop'), 650);
    }
    clearTimeout(heartTimer);
    heartTimer = setTimeout(() => ankyCursor.classList.remove('heart'), ms);
  }

  // ---- rest mode: for when moving hurts ----
  let restMode = false;
  let restRaf = null;
  let restNoteTimer = null;
  let restFirstTimer = null;
  let manualUntil = 0;
  let kbX = null;
  let kbY = null;

  function restFrame(now) {
    if (!restMode) return;
    // with reduced motion (or an overlay open) the detective stays put; the notes still come
    if (now > manualUntil && !reduceMotion.matches && !overlayOpen()) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // slow lissajous wander, kept well inside the edges
      const x = w / 2 + (w * 0.30) * Math.sin(now * 0.00041);
      const y = h * 0.56 + (h * 0.22) * Math.sin(now * 0.00062 + 1.1);
      moveAnky(x, y);
      setChaseTarget(x, y);
    }
    restRaf = requestAnimationFrame(restFrame);
  }

  function restReleaseDinos() {
    // nobody's out yet: play the reveal hands-free
    if (!chase.active) {
      if (!caseSolved) {
        clueEls.forEach((clue) => {
          if (!clue.classList.contains('found')) clue.click();
        });
        return true;
      }
      startChase();
      return false;
    }
    // already out, but locked up: let them stretch their legs
    let freed = false;
    chase.runners.forEach((r) => {
      if (!r.caged) return;
      r.caged = false;
      r.el.classList.remove('caged');
      unanchorRunner(r);
      r.goingHome = false;
      r.homeKind = null;
      r.stunUntil = 0;
      r.loose = true;
      if (r.cageFront) r.cageFront.classList.add('open');
      if (r.releaseBtn) r.releaseBtn.classList.remove('on');
      freed = true;
    });
    if (freed) setStatus('STATUS: paroled for rest mode. supervised chasing only.', 'paroled for rest mode');
    return false;
  }

  function startRestNotes(delay) {
    clearTimeout(restFirstTimer);
    clearInterval(restNoteTimer);
    restFirstTimer = setTimeout(() => {
      if (!restMode) return;
      showCandle();
      displayNote(nextNote(), false);
      restNoteTimer = setInterval(() => {
        if (restMode) displayNote(nextNote(), false);
      }, 14000);
    }, delay);
  }

  function startRest() {
    restMode = true;
    restBtn.setAttribute('aria-pressed', 'true');
    restBtn.textContent = 'stop resting';
    restChip.hidden = false;
    lightCandle();
    if (restReleaseDinos()) {
      // let the reveal and verdict land before the notes take over
      startRestNotes(11000);
    } else {
      showCandle();
      displayNote(nextNote(), false);
      startRestNotes(14000);
    }
    restRaf = requestAnimationFrame(restFrame);
  }

  function stopRest() {
    restMode = false;
    restBtn.setAttribute('aria-pressed', 'false');
    restBtn.textContent = 'start resting';
    restChip.hidden = true;
    clearTimeout(restFirstTimer);
    clearInterval(restNoteTimer);
    cancelAnimationFrame(restRaf);
  }

  restBtn.addEventListener('click', () => {
    if (restMode) stopRest(); else startRest();
  });
  restChip.addEventListener('click', () => {
    stopRest();
    restBtn.focus({ preventScroll: true });
  });

  // ---- input ----
  let lastPointerT = 0;
  function onPointer(x, y) {
    lastPointerT = performance.now();
    moveAnky(x, y);
    setChaseTarget(x, y);
    dinos.forEach((d) => d.stalk(x, y));
  }

  function resetDinos() {
    dinos.forEach((d) => d.reset());
  }

  window.addEventListener('pointermove', (e) => {
    onPointer(e.clientX, e.clientY);
    // a real pointer always wins; autopilot picks back up after a pause
    if (restMode) manualUntil = performance.now() + 4000;
  });
  window.addEventListener('pointerdown', (e) => onPointer(e.clientX, e.clientY));
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) onPointer(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', resetDinos);
  window.addEventListener('blur', resetDinos);

  const steerKeys = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (breathOpen()) closeBreath();
      else if (chapter.classList.contains('on')) closeChapter();
      else if (studio.classList.contains('on')) closeStudio();
      return;
    }
    if (!onMain() || overlayOpen() || e.defaultPrevented) return;

    // keyboard steering: no dragging, no reaching. only while there's something to steer
    const steer = steerKeys[e.key];
    if (steer) {
      if (!restMode && !chase.active) return;
      e.preventDefault();
      if (kbX === null) {
        kbX = ankyX !== null ? ankyX : window.innerWidth / 2;
        kbY = ankyY !== null ? ankyY : window.innerHeight * 0.55;
      }
      kbX = clamp(kbX + steer[0] * 34, 10, window.innerWidth - 10);
      kbY = clamp(kbY + steer[1] * 34, 10, window.innerHeight - 10);
      manualUntil = performance.now() + 4000;
      moveAnky(kbX, kbY);
      setChaseTarget(kbX, kbY);
      return;
    }
    // space or enter for a note, while resting (otherwise space scrolls, as it should)
    if (restMode && (e.key === ' ' || e.key === 'Enter')) {
      if (e.target instanceof Element && e.target.closest('button, a, input')) return;
      e.preventDefault();
      candleNote();
    }
  });

  // paddocks move with the layout, so re-measure on resize / rotation
  window.addEventListener('resize', () => {
    setChaseTarget(chase.tx, chase.ty);
    chase.runners.forEach((r) => {
      measureRunner(r);
      if (!r.cageFront) return;
      if (r.caged || (r.goingHome && r.homeKind === 'cage')) {
        const spot = pageSpot(r.cageFront, -12);
        r.homeX = spot.x;
        r.homeY = spot.y;
        if (r.caged) { r.x = spot.x; r.y = spot.y; placeRunner(r); }
      }
    });
  });
})();
