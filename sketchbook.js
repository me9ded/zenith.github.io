/* the sketchbook: a little space to draw, and a shared gallery for the drawings she chooses to share */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const CONFIG = window.SKETCHBOOK_CONFIG || {};
  const SHARING = Boolean(CONFIG.supabaseUrl && CONFIG.supabaseKey);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const main = $('main');

  // every stroke lives in this page space, whatever the screen size or pixel density
  const PAGE_W = 1000;
  const PAGE_H = 1250;
  const PAPER = '#fbf6ec';

  const COLOURS = [
    { name: 'ink', c: '#3b2c35' },
    { name: 'rose', c: '#d9768e' },
    { name: 'blush', c: '#f2b5c1' },
    { name: 'coral', c: '#e8846a' },
    { name: 'candle', c: '#eeac3a' },
    { name: 'sage', c: '#7f9c7a' },
    { name: 'blue', c: '#3d5aa8' },
    { name: 'lavender', c: '#9b86c9' }
  ];
  const SIZES = [
    { name: 'fine', w: 4 },
    { name: 'medium', w: 10 },
    { name: 'bold', w: 24 }
  ];
  const MAX_DRAFTS = 24;

  // ---- elements ----
  const overlay = $('sketchbook');
  const canvas = $('sbCanvas');
  const ctx = canvas.getContext('2d');
  const page = $('sbPage');
  const emptyHint = $('sbEmpty');
  const stateEl = $('sbState');
  const coloursEl = $('sbColours');
  const sizesEl = $('sbSizes');
  const eraserBtn = $('sbEraser');
  const undoBtn = $('sbUndo');
  const redoBtn = $('sbRedo');
  const shareBtn = $('sbShare');
  const saveBtn = $('sbSave');
  const downloadBtn = $('sbDownload');
  const newBtn = $('sbNew');
  const clearBtn = $('sbClear');
  const draftsToggle = $('sbDraftsToggle');
  const draftsEl = $('sbDrafts');
  const draftList = $('sbDraftList');
  const closeBtn = $('sbClose');
  const shelfThumb = $('sketchThumb');
  const shelfBlank = $('sketchBlank');
  const shelfState = $('sketchShelfState');
  const galleryOverlay = $('gallery');
  const galBody = $('galBody');
  const galSignOut = $('galSignOut');
  const confirmDlg = $('sbConfirm');
  const shareDlg = $('sbShareDialog');
  const authDlg = $('sbAuth');
  const viewer = $('sbViewer');

  // ---- small helpers ----
  const motion = () => (reduceMotion.matches ? 'auto' : 'smooth');
  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    const b = crypto.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 15) | 64;
    b[8] = (b[8] & 63) | 128;
    const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
    return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
  }

  function el(tag, attrs, text) {
    const n = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (k === 'class') n.className = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    });
    if (text != null) n.textContent = text;
    return n;
  }

  function prettyDate(iso) {
    const d = new Date(iso);
    const sameYear = d.getFullYear() === new Date().getFullYear();
    return d.toLocaleDateString(undefined, sameYear ? { month: 'long', day: 'numeric' } : { month: 'long', day: 'numeric', year: 'numeric' }).toLowerCase();
  }

  // ---- overlays (the page's own overlays use the same pattern) ----
  let returnFocus = null;
  function openOverlay(o, focusEl) {
    returnFocus = document.activeElement;
    o.classList.add('on');
    o.removeAttribute('inert');
    main.setAttribute('inert', '');
    document.body.classList.add('sb-open');
    (focusEl || o).focus({ preventScroll: true });
  }
  function closeOverlay(o) {
    o.classList.remove('on');
    o.setAttribute('inert', '');
    if (!document.querySelector('.overlay.on')) {
      main.removeAttribute('inert');
      document.body.classList.remove('sb-open');
    }
    if (returnFocus && document.contains(returnFocus)) returnFocus.focus({ preventScroll: true });
  }

  // ---- a gentle confirm, with any number of choices ----
  function ask(title, text, choices) {
    return new Promise((resolve) => {
      $('sbConfirmTitle').textContent = title;
      $('sbConfirmText').textContent = text;
      const row = $('sbConfirmActions');
      row.textContent = '';
      choices.forEach((ch) => {
        row.appendChild(el('button', { class: 'btn ' + (ch.primary ? 'btn-primary' : 'btn-quiet'), value: ch.value, type: 'submit' }, ch.label));
      });
      confirmDlg.returnValue = '';
      confirmDlg.addEventListener('close', () => resolve(confirmDlg.returnValue || null), { once: true });
      confirmDlg.showModal();
    });
  }

  // =====================================================================
  // the drawing: a list of actions (strokes and clears), replayed onto the canvas
  // =====================================================================
  let actions = [];       // { id, t: 's', c, w, e, pen, p: [x, y, pressure, ...] } | { id, t: 'clear' }
  let redoStack = [];
  let draftId = null;     // the saved draft this page belongs to, if any
  let savedSig = '';      // the page as it was last saved as a draft
  let sharedSig = '';     // the page as it was last shared
  let colour = COLOURS[0].c;
  let size = SIZES[1].w;
  let erasing = false;

  const sig = () => actions.length + ':' + (actions.length ? actions[actions.length - 1].id : '');

  function visibleStrokes() {
    let start = 0;
    actions.forEach((a, i) => { if (a.t === 'clear') start = i + 1; });
    return actions.slice(start).filter((a) => a.t === 's');
  }
  const isBlank = () => visibleStrokes().length === 0;

  // ---- drawing a stroke: midpoint quadratic curves, identical live and on replay ----
  function widthAt(s, i) {
    return s.pen ? s.w * (0.35 + s.p[i * 3 + 2] * 1.3) : s.w;
  }

  function strokeStyle(c, s) {
    c.globalCompositeOperation = s.e ? 'destination-out' : 'source-over';
    c.strokeStyle = s.e ? '#000' : s.c;
    c.fillStyle = s.e ? '#000' : s.c;
    c.lineCap = 'round';
    c.lineJoin = 'round';
  }

  function drawDot(c, s) {
    strokeStyle(c, s);
    c.beginPath();
    c.arc(s.p[0], s.p[1], widthAt(s, 0) / 2, 0, Math.PI * 2);
    c.fill();
  }

  // segment k connects the midpoints either side of point k-1
  function drawSegment(c, s, k) {
    const p = s.p;
    const x0 = k === 1 ? p[0] : (p[(k - 2) * 3] + p[(k - 1) * 3]) / 2;
    const y0 = k === 1 ? p[1] : (p[(k - 2) * 3 + 1] + p[(k - 1) * 3 + 1]) / 2;
    const cx = p[(k - 1) * 3];
    const cy = p[(k - 1) * 3 + 1];
    const x1 = (cx + p[k * 3]) / 2;
    const y1 = (cy + p[k * 3 + 1]) / 2;
    strokeStyle(c, s);
    c.lineWidth = widthAt(s, k - 1);
    c.beginPath();
    c.moveTo(x0, y0);
    c.quadraticCurveTo(cx, cy, x1, y1);
    c.stroke();
  }

  function drawTail(c, s) {
    const n = s.p.length / 3;
    if (n < 2) return;
    strokeStyle(c, s);
    c.lineWidth = widthAt(s, n - 1);
    c.beginPath();
    c.moveTo((s.p[(n - 2) * 3] + s.p[(n - 1) * 3]) / 2, (s.p[(n - 2) * 3 + 1] + s.p[(n - 1) * 3 + 1]) / 2);
    c.lineTo(s.p[(n - 1) * 3], s.p[(n - 1) * 3 + 1]);
    c.stroke();
  }

  function drawStroke(c, s) {
    const n = s.p.length / 3;
    drawDot(c, s);
    for (let k = 1; k < n; k++) drawSegment(c, s, k);
    drawTail(c, s);
  }

  // ---- the canvas follows its box; strokes are re-drawn, never lost ----
  let scale = 1;
  function fitCanvas() {
    const r = canvas.getBoundingClientRect();
    if (!r.width) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const w = Math.round(r.width * dpr);
    const h = Math.round(r.height * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    scale = w / PAGE_W;
    renderAll();
  }

  function renderAll() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    visibleStrokes().forEach((s) => drawStroke(ctx, s));
    if (live) {
      drawStroke(ctx, live.stroke);
    }
  }

  if ('ResizeObserver' in window) new ResizeObserver(fitCanvas).observe(canvas);
  window.addEventListener('resize', fitCanvas);

  // ---- pointer input: mouse, finger and stylus ----
  let live = null; // the stroke being drawn right now

  function pagePoint(e) {
    const r = live.rect;
    return [
      Math.round(((e.clientX - r.left) / r.width) * PAGE_W * 10) / 10,
      Math.round(((e.clientY - r.top) / r.height) * PAGE_H * 10) / 10,
      Math.round((e.pressure || 0.5) * 100) / 100
    ];
  }

  function addPoint(e) {
    const [x, y, pr] = pagePoint(e);
    const p = live.stroke.p;
    const n = p.length / 3;
    if (n && Math.hypot(x - p[(n - 1) * 3], y - p[(n - 1) * 3 + 1]) < 0.8) return;
    p.push(x, y, pr);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    if (n === 0) drawDot(ctx, live.stroke);
    else drawSegment(ctx, live.stroke, n);
  }

  canvas.addEventListener('pointerdown', (e) => {
    if (live || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault();
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* pointer already gone; the stroke still works */ }
    live = {
      id: e.pointerId,
      rect: canvas.getBoundingClientRect(),
      stroke: {
        id: uid(),
        t: 's',
        c: colour,
        w: erasing ? size * 2.6 : size,
        e: erasing,
        pen: e.pointerType === 'pen',
        p: []
      }
    };
    page.classList.add('drawing');
    emptyHint.classList.add('gone');
    addPoint(e);
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!live || e.pointerId !== live.id) return;
    e.preventDefault();
    const evs = (e.getCoalescedEvents && e.getCoalescedEvents()) || [];
    (evs.length ? evs : [e]).forEach(addPoint);
  });

  function endStroke(e) {
    if (!live || (e && e.pointerId !== live.id)) return;
    const s = live.stroke;
    live = null;
    page.classList.remove('drawing');
    if (s.p.length) {
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      drawTail(ctx, s);
      actions.push(s);
      redoStack = [];
      changed();
    }
  }
  canvas.addEventListener('pointerup', endStroke);
  // the browser took the gesture away (a call, a system swipe): keep what was drawn
  canvas.addEventListener('pointercancel', endStroke);
  canvas.addEventListener('lostpointercapture', endStroke);
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  // ---- tools ----
  COLOURS.forEach((col, i) => {
    const b = el('button', {
      class: 'sb-swatch',
      type: 'button',
      role: 'radio',
      'aria-checked': i === 0 ? 'true' : 'false',
      'aria-label': col.name,
      title: col.name,
      style: '--c:' + col.c
    });
    b.addEventListener('click', () => { colour = col.c; setEraser(false); syncTools(); });
    coloursEl.appendChild(b);
  });
  SIZES.forEach((sz, i) => {
    const b = el('button', {
      class: 'sb-size',
      type: 'button',
      role: 'radio',
      'aria-checked': i === 1 ? 'true' : 'false',
      'aria-label': sz.name + ' brush',
      title: sz.name,
      style: '--d:' + Math.max(4, Math.round(sz.w * 0.9)) + 'px'
    });
    b.addEventListener('click', () => { size = sz.w; syncTools(); });
    sizesEl.appendChild(b);
  });

  // arrow keys move between options inside a radio group, as screen-reader users expect
  [coloursEl, sizesEl].forEach((group) => {
    group.addEventListener('keydown', (e) => {
      const items = Array.from(group.children);
      const i = items.indexOf(document.activeElement);
      if (i < 0) return;
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      const next = items[(i + step + items.length) % items.length];
      next.focus();
      next.click();
    });
  });

  function setEraser(on) {
    erasing = on;
    eraserBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    page.classList.toggle('erasing', on);
  }
  eraserBtn.addEventListener('click', () => { setEraser(!erasing); syncTools(); });

  function syncTools() {
    Array.from(coloursEl.children).forEach((b, i) => {
      const on = !erasing && COLOURS[i].c === colour;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.tabIndex = (COLOURS[i].c === colour) ? 0 : -1;
    });
    Array.from(sizesEl.children).forEach((b, i) => {
      b.setAttribute('aria-checked', SIZES[i].w === size ? 'true' : 'false');
      b.tabIndex = SIZES[i].w === size ? 0 : -1;
    });
    undoBtn.disabled = actions.length === 0;
    redoBtn.disabled = redoStack.length === 0;
  }

  function undo() {
    if (!actions.length) return;
    redoStack.push(actions.pop());
    renderAll();
    changed();
  }
  function redo() {
    if (!redoStack.length) return;
    actions.push(redoStack.pop());
    renderAll();
    changed();
  }
  undoBtn.addEventListener('click', undo);
  redoBtn.addEventListener('click', redo);

  clearBtn.addEventListener('click', async () => {
    if (isBlank()) return;
    const ok = await ask('clear this page?', 'everything on it goes away. you can still undo it.', [
      { label: 'keep it', value: '' },
      { label: 'clear it', value: 'clear', primary: true }
    ]);
    if (ok !== 'clear') return;
    actions.push({ id: uid(), t: 'clear' });
    redoStack = [];
    renderAll();
    changed();
  });

  // ---- what state is this page in? said plainly, so local and shared never blur ----
  function changed() {
    syncTools();
    emptyHint.classList.toggle('gone', !isBlank());
    describe();
    queueKeep();
  }

  function describe() {
    let text;
    if (isBlank()) text = 'a blank page';
    else if (sharedSig && sharedSig === sig()) text = 'shared ♡ it’s in the shared sketchbook';
    else if (draftId && savedSig === sig()) text = 'saved as a draft · only on this device';
    else if (sharedSig) text = 'changed since you shared it · the changes are only on this device';
    else text = 'only on this device · not shared';
    stateEl.textContent = text;
    shareBtn.textContent = (sharedSig && sharedSig === sig()) ? 'shared ♡' : 'share this drawing';
    shareBtn.disabled = Boolean(sharedSig && sharedSig === sig());
  }

  function flashState(text) {
    stateEl.textContent = text;
    clearTimeout(flashState.t);
    flashState.t = setTimeout(describe, 4000);
  }

  // =====================================================================
  // keeping things on this device: IndexedDB (falls back to "not kept" gracefully)
  // =====================================================================
  const DB_NAME = 'zenith-sketchbook';
  let dbPromise = null;
  function db() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        if (!window.indexedDB) return reject(new Error('no indexeddb'));
        const r = indexedDB.open(DB_NAME, 1);
        r.onupgradeneeded = () => {
          r.result.createObjectStore('state');
          r.result.createObjectStore('drafts', { keyPath: 'id' });
        };
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => reject(r.error);
      }).catch((e) => { dbPromise = null; throw e; });
    }
    return dbPromise;
  }
  function idb(store, mode, fn) {
    return db().then((d) => new Promise((resolve, reject) => {
      const tx = d.transaction(store, mode);
      const req = fn(tx.objectStore(store));
      tx.oncomplete = () => resolve(req && req.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    }));
  }

  // the page you're on is quietly kept on this device, so a closed tab or a
  // resize never loses it. it is never uploaded.
  let keepTimer = null;
  function queueKeep() {
    clearTimeout(keepTimer);
    keepTimer = setTimeout(keepWorkingPage, 500);
  }
  function keepWorkingPage() {
    const data = {
      strokes: visibleStrokes(),
      draftId,
      savedClean: Boolean(draftId && savedSig === sig()),
      sharedClean: Boolean(sharedSig && sharedSig === sig()),
      at: Date.now()
    };
    return idb('state', 'readwrite', (s) => s.put(data, 'page')).then(updateShelf).catch(() => {});
  }

  function loadPage(data) {
    actions = (data && data.strokes) || [];
    redoStack = [];
    draftId = (data && data.draftId) || null;
    savedSig = data && data.savedClean ? sig() : '';
    sharedSig = data && data.sharedClean ? sig() : '';
    renderAll();
    syncTools();
    emptyHint.classList.toggle('gone', !isBlank());
    describe();
  }

  // ---- the page as an image: paper underneath, strokes on their own layer ----
  function renderPng(w, h) {
    const W = w || PAGE_W;
    const H = h || PAGE_H;
    const layer = document.createElement('canvas');
    layer.width = W; layer.height = H;
    const lc = layer.getContext('2d');
    lc.setTransform(W / PAGE_W, 0, 0, H / PAGE_H, 0, 0);
    visibleStrokes().forEach((s) => drawStroke(lc, s));
    const out = document.createElement('canvas');
    out.width = W; out.height = H;
    const oc = out.getContext('2d');
    oc.fillStyle = PAPER;
    oc.fillRect(0, 0, W, H);
    oc.drawImage(layer, 0, 0);
    return out;
  }
  // encode synchronously: toBlob's callback is skipped by some embedded browsers
  function toBlob(cv) {
    try {
      const bin = atob(cv.toDataURL('image/png').split(',')[1]);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return Promise.resolve(new Blob([bytes], { type: 'image/png' }));
    } catch (e) {
      return Promise.reject(e);
    }
  }
  const thumbnail = () => renderPng(200, 250).toDataURL('image/png');

  // ---- drafts ----
  async function saveDraft() {
    if (isBlank()) { flashState('nothing to save yet. draw something first ♡'); return false; }
    try {
      const all = await idb('drafts', 'readonly', (s) => s.getAll());
      if (!draftId && all.length >= MAX_DRAFTS) {
        flashState('your drafts are full. delete one you don’t need, then try again.');
        openDrafts(true);
        return false;
      }
      const id = draftId || uid();
      await idb('drafts', 'readwrite', (s) => s.put({ id, strokes: visibleStrokes(), thumb: thumbnail(), savedAt: Date.now() }));
      draftId = id;
      savedSig = sig();
      describe();
      await keepWorkingPage();
      renderDrafts();
      flashState('draft saved · only on this device');
      return true;
    } catch (e) {
      flashState('this browser won’t keep drafts (private mode?). download it instead to keep a copy.');
      return false;
    }
  }
  saveBtn.addEventListener('click', saveDraft);

  // leaving a page that isn't saved anywhere: ask first
  async function okToLeavePage() {
    if (isBlank() || savedSig === sig() || sharedSig === sig()) return true;
    const choice = await ask('save this page first?', 'it isn’t saved as a draft yet.', [
      { label: 'keep drawing', value: '' },
      { label: 'don’t save', value: 'discard' },
      { label: 'save as a draft', value: 'save', primary: true }
    ]);
    if (choice === 'save') return saveDraft();
    return choice === 'discard';
  }

  newBtn.addEventListener('click', async () => {
    if (!(await okToLeavePage())) return;
    loadPage(null);
    keepWorkingPage();
    flashState('a fresh page');
  });

  async function renderDrafts() {
    let all = [];
    try { all = await idb('drafts', 'readonly', (s) => s.getAll()); } catch (e) { /* no storage */ }
    all.sort((a, b) => b.savedAt - a.savedAt);
    draftList.textContent = '';
    if (!all.length) {
      draftList.appendChild(el('li', { class: 'sb-draft-empty' }, 'no drafts yet. “save draft” keeps a page here.'));
      return;
    }
    all.forEach((d) => {
      const li = el('li', { class: 'sb-draft' + (d.id === draftId ? ' current' : '') });
      const open = el('button', { class: 'sb-draft-open', type: 'button', 'aria-label': 'open the draft from ' + prettyDate(d.savedAt) });
      open.appendChild(el('img', { src: d.thumb, alt: '' }));
      open.appendChild(el('span', {}, prettyDate(d.savedAt)));
      open.addEventListener('click', async () => {
        if (d.id === draftId && savedSig === sig()) { closeDrafts(); return; }
        if (!(await okToLeavePage())) return;
        loadPage({ strokes: d.strokes, draftId: d.id, savedClean: true });
        keepWorkingPage();
        closeDrafts();
        flashState('your draft from ' + prettyDate(d.savedAt));
      });
      const del = el('button', { class: 'sb-draft-del', type: 'button', 'aria-label': 'delete the draft from ' + prettyDate(d.savedAt) }, '×');
      del.addEventListener('click', async () => {
        const ok = await ask('delete this draft?', 'it only lives on this device, so it’ll be gone for good.', [
          { label: 'keep it', value: '' },
          { label: 'delete', value: 'delete', primary: true }
        ]);
        if (ok !== 'delete') return;
        await idb('drafts', 'readwrite', (s) => s.delete(d.id)).catch(() => {});
        if (d.id === draftId) { draftId = null; savedSig = ''; describe(); keepWorkingPage(); }
        renderDrafts();
      });
      li.appendChild(open);
      li.appendChild(del);
      draftList.appendChild(li);
    });
  }

  function openDrafts(open) {
    draftsEl.hidden = !open;
    draftsToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) renderDrafts();
  }
  function closeDrafts() { openDrafts(false); }
  draftsToggle.addEventListener('click', () => openDrafts(draftsEl.hidden));

  // ---- download a copy ----
  downloadBtn.addEventListener('click', async () => {
    if (isBlank()) { flashState('the page is blank. draw something first ♡'); return; }
    const blob = await toBlob(renderPng());
    const url = URL.createObjectURL(blob);
    const a = el('a', { href: url, download: 'sketch-' + new Date().toISOString().slice(0, 10) + '.png' });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    flashState('downloaded · it’s in your downloads');
  });

  // ---- the shelf on the page: a peek at the current page ----
  function updateShelf() {
    const blank = isBlank();
    shelfThumb.hidden = blank;
    shelfBlank.hidden = !blank;
    if (!blank) shelfThumb.src = thumbnail();
    shelfState.textContent = blank ? 'a blank page, whenever you want it.' : 'your page is waiting where you left it.';
  }

  // ---- opening and closing ----
  function openSketchbook() {
    openOverlay(overlay, canvas.closest('.sb-wrap').querySelector('.sb-swatch[aria-checked="true"]') || canvas);
    requestAnimationFrame(fitCanvas);
  }
  function closeSketchbook() {
    keepWorkingPage();
    closeOverlay(overlay);
  }
  $('sketchOpen').addEventListener('click', openSketchbook);
  $('sketchCover').addEventListener('click', openSketchbook);
  closeBtn.addEventListener('click', closeSketchbook);
  $('sbCloseTop').addEventListener('click', closeSketchbook);
  window.addEventListener('sketchbook:open', openSketchbook);

  // ---- keyboard: undo/redo while the sketchbook is open; escape closes ----
  document.addEventListener('keydown', (e) => {
    if (document.querySelector('dialog[open]')) return;
    const typing = e.target instanceof Element && e.target.closest('input, textarea');
    if (overlay.classList.contains('on')) {
      if (e.key === 'Escape') { e.preventDefault(); closeSketchbook(); return; }
      if (!typing && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      } else if (!typing && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    } else if (galleryOverlay.classList.contains('on') && e.key === 'Escape') {
      e.preventDefault();
      closeOverlay(galleryOverlay);
    }
  });

  // keep the page when the tab closes or the phone puts it away
  function keepNow() {
    if (live) endStroke();
    clearTimeout(keepTimer);
    keepWorkingPage();
  }
  window.addEventListener('pagehide', keepNow);
  document.addEventListener('visibilitychange', () => { if (document.hidden) keepNow(); });

  // =====================================================================
  // sharing: only when she chooses, only to the two members
  // =====================================================================
  let clientPromise = null;
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = el('script', { src });
      s.onload = resolve;
      s.onerror = () => reject(new Error('could not load ' + src));
      document.head.appendChild(s);
    });
  }
  function client() {
    if (!clientPromise) {
      clientPromise = (window.supabase ? Promise.resolve() : loadScript('assets/vendor/supabase.js'))
        .then(() => window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey, {
          auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
        }))
        .catch((e) => { clientPromise = null; throw e; });
    }
    return clientPromise;
  }

  // ---- signing in with a one-time code ----
  let authResolve = null;
  let authEmail = '';
  function showAuthStep(step) {
    authDlg.querySelectorAll('.sb-auth-step').forEach((f) => { f.hidden = f.dataset.step !== step; });
    const first = authDlg.querySelector('.sb-auth-step[data-step="' + step + '"] input');
    if (first) setTimeout(() => first.focus(), 0);
  }
  function signIn() {
    return new Promise((resolve) => {
      authResolve = resolve;
      $('sbAuthEmailError').textContent = '';
      $('sbAuthCodeError').textContent = '';
      $('sbAuthCode').value = '';
      showAuthStep('email');
      authDlg.showModal();
    });
  }
  authDlg.addEventListener('close', () => { if (authResolve) { authResolve(null); authResolve = null; } });
  authDlg.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => authDlg.close()));
  $('sbAuthBack').addEventListener('click', () => showAuthStep('email'));

  authDlg.querySelector('[data-step="email"]').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('sbAuthEmail').value.trim();
    const err = $('sbAuthEmailError');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = 'that doesn’t look like an email address.'; return; }
    if (!navigator.onLine) { err.textContent = 'you’re offline right now. signing in needs a connection.'; return; }
    const btn = $('sbAuthSend');
    btn.disabled = true;
    err.textContent = '';
    try {
      const c = await client();
      const { error } = await c.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
      // the same answer whether or not the email has an account, so the form can't be used to look people up
      if (error && error.status === 429) { err.textContent = 'too many tries. wait a minute, then try again.'; return; }
      if (error && error.status && error.status >= 500) { err.textContent = 'the sketchbook couldn’t send a code just now. try again in a bit.'; return; }
      authEmail = email;
      $('sbAuthSentTo').textContent = email;
      showAuthStep('code');
    } catch (ex) {
      err.textContent = 'couldn’t reach the shared sketchbook. check your connection and try again.';
    } finally {
      btn.disabled = false;
    }
  });

  authDlg.querySelector('[data-step="code"]').addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = $('sbAuthCode').value.replace(/\s+/g, '');
    const err = $('sbAuthCodeError');
    if (!/^\d{6,10}$/.test(code)) { err.textContent = 'the code is the number in the email.'; return; }
    const btn = $('sbAuthVerify');
    btn.disabled = true;
    err.textContent = '';
    try {
      const c = await client();
      const { data, error } = await c.auth.verifyOtp({ email: authEmail, token: code, type: 'email' });
      if (error || !data.session) {
        err.textContent = error && error.status === 429 ? 'too many tries. wait a minute, then try again.' : 'that code didn’t work. it may have expired. go back and ask for a new one.';
        return;
      }
      const resolve = authResolve;
      authResolve = null;
      authDlg.close();
      if (resolve) resolve(data.session);
    } catch (ex) {
      err.textContent = 'couldn’t reach the shared sketchbook. check your connection and try again.';
    } finally {
      btn.disabled = false;
    }
  });

  // signed in, and one of the two? the server decides; the page just asks
  async function memberSession(interactive) {
    const c = await client();
    let { data: { session } } = await c.auth.getSession();
    if (!session && interactive) session = await signIn();
    if (!session) return { state: 'signed-out' };
    const { data, error } = await c.rpc('is_sketchbook_member');
    if (error) {
      if (error.status === 401 || /jwt|token/i.test(error.message || '')) {
        await c.auth.signOut({ scope: 'local' }).catch(() => {});
        return { state: 'expired' };
      }
      throw error;
    }
    if (data !== true) return { state: 'not-member', session };
    return { state: 'member', session };
  }

  // ---- the share dialog ----
  let shareWorking = false;
  function shareStep(step) {
    shareDlg.querySelectorAll('.sb-share-step').forEach((d) => { d.hidden = d.dataset.step !== step; });
  }
  shareDlg.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => shareDlg.close()));
  shareDlg.addEventListener('cancel', (e) => { if (shareWorking) e.preventDefault(); });

  function shareFailed(text) {
    shareWorking = false;
    $('sbShareError').textContent = text;
    shareStep('error');
    if (!shareDlg.open) shareDlg.showModal();
    describe();
  }

  async function share() {
    if (isBlank()) { flashState('draw something first ♡'); return; }
    if (!navigator.onLine) {
      shareFailed('you’re offline right now. your drawing is safe here. save it as a draft, and share it once you’re back online.');
      return;
    }
    let who;
    try {
      who = await memberSession(true);
    } catch (e) {
      shareFailed('couldn’t reach the shared sketchbook. your drawing is safe here. try again in a bit.');
      return;
    }
    if (who.state === 'signed-out') return; // she closed the sign-in: nothing happens
    if (who.state === 'expired') { shareFailed('your sign-in ran out. try again and sign in once more. your drawing is still here.'); return; }
    if (who.state === 'not-member') { shareFailed('this account isn’t one of the two this sketchbook is for, so it can’t share here.'); return; }

    $('sbSharePreview').src = thumbnail();
    $('sbShareName').value = '';
    shareStep('ask');
    shareDlg.showModal();
  }

  async function doShare() {
    shareWorking = true;
    shareStep('busy');
    const bar = $('sbProgressBar');
    const meter = bar.parentElement;
    const setProgress = (f) => {
      const pct = Math.round(f * 100);
      bar.style.width = pct + '%';
      meter.setAttribute('aria-valuenow', String(pct));
    };
    setProgress(0);
    const pageSig = sig();
    const title = $('sbShareName').value.trim().slice(0, 80) || null;
    let c, session, path;
    try {
      c = await client();
      ({ data: { session } } = await c.auth.getSession());
      if (!session) { shareFailed('your sign-in ran out. try again and sign in once more. your drawing is still here.'); return; }
      const blob = await toBlob(renderPng());
      path = session.user.id + '/' + uid() + '.png';
      $('sbShareBusyText').textContent = 'sending your drawing';
      await uploadPng(session, path, blob, (f) => setProgress(f * 0.92));
      $('sbShareBusyText').textContent = 'putting it in the sketchbook';
      const { error } = await c.from('shared_drawings').insert({ object_path: path, title, width: PAGE_W, height: PAGE_H });
      if (error) {
        // the image made it but the entry didn't: take the image back out so nothing is half-shared
        await c.storage.from('sketchbook').remove([path]).catch(() => {});
        throw Object.assign(new Error(error.message), { status: error.status || 500 });
      }
      setProgress(1);
      // only now, with the server's word for it, is the drawing called shared
      if (sig() === pageSig) sharedSig = pageSig;
      shareWorking = false;
      describe();
      keepWorkingPage();
      shareStep('done');
    } catch (e) {
      if (e && e.kind === 'network') shareFailed('the connection dropped. your drawing is safe here. try again when you’re back online.');
      else if (e && (e.status === 401 || e.status === 403)) {
        if (c) await c.auth.signOut({ scope: 'local' }).catch(() => {});
        shareFailed('your sign-in ran out. try again and sign in once more. your drawing is still here.');
      } else if (e && e.status === 413) shareFailed('this drawing is too big to share. try clearing a little, or download it instead.');
      else shareFailed('the shared sketchbook didn’t accept it just now. your drawing is safe here. try again in a bit.');
    }
  }

  // upload through XHR so there is real progress to show
  function uploadPng(session, path, blob, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', CONFIG.supabaseUrl.replace(/\/+$/, '') + '/storage/v1/object/sketchbook/' + path);
      xhr.setRequestHeader('Authorization', 'Bearer ' + session.access_token);
      xhr.setRequestHeader('apikey', CONFIG.supabaseKey);
      xhr.setRequestHeader('Content-Type', 'image/png');
      xhr.setRequestHeader('x-upsert', 'false');
      xhr.timeout = 60000;
      xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(e.loaded / e.total); };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) return resolve();
        let status = xhr.status;
        try {
          const body = JSON.parse(xhr.responseText);
          if (body && body.statusCode) status = Number(body.statusCode) || status;
        } catch (e) { /* not json */ }
        reject(Object.assign(new Error('upload'), { status }));
      };
      xhr.onerror = () => reject(Object.assign(new Error('network'), { kind: 'network' }));
      xhr.ontimeout = () => reject(Object.assign(new Error('timeout'), { kind: 'network' }));
      xhr.send(blob);
    });
  }

  shareBtn.addEventListener('click', share);
  $('sbShareGo').addEventListener('click', doShare);
  $('sbShareRetry').addEventListener('click', () => { shareDlg.close(); share(); });
  $('sbShareSee').addEventListener('click', () => { shareDlg.close(); closeOverlay(overlay); openGallery(); });

  // =====================================================================
  // the shared gallery
  // =====================================================================
  let galleryRows = [];
  let me = null;
  let names = {};

  function galMessage(title, text, action) {
    galBody.textContent = '';
    const box = el('div', { class: 'gal-message' });
    box.appendChild(el('p', { class: 'gal-message-title' }, title));
    if (text) box.appendChild(el('p', { class: 'gal-message-text' }, text));
    if (action) {
      const b = el('button', { class: 'btn btn-primary', type: 'button' }, action.label);
      b.addEventListener('click', action.run);
      box.appendChild(b);
    }
    galBody.appendChild(box);
  }

  async function openGallery() {
    openOverlay(galleryOverlay, $('galClose'));
    await loadGallery(false);
  }

  async function loadGallery(interactive) {
    galSignOut.hidden = true;
    galMessage('opening the sketchbook…');
    if (!navigator.onLine) { galMessage('you’re offline right now.', 'the shared sketchbook needs a connection. your own drafts are still in the sketchbook.'); return; }
    let who;
    try {
      who = await memberSession(interactive);
    } catch (e) {
      galMessage('couldn’t reach the shared sketchbook.', 'check your connection and try again.', { label: 'try again', run: () => loadGallery(false) });
      return;
    }
    if (who.state === 'signed-out' || who.state === 'expired') {
      galMessage(who.state === 'expired' ? 'your sign-in ran out.' : 'this part is just for the two of you.', 'sign in with your email to see the drawings you’ve shared.', { label: 'sign in', run: () => loadGallery(true) });
      return;
    }
    galSignOut.hidden = false;
    if (who.state === 'not-member') {
      galMessage('this account isn’t one of the two.', 'this sketchbook is private to two people, so there’s nothing to see here.');
      return;
    }
    me = who.session.user.id;
    try {
      const c = await client();
      const [rows, members] = await Promise.all([
        c.from('shared_drawings').select('id, owner_id, object_path, title, created_at').order('created_at', { ascending: false }).limit(120),
        c.from('sketchbook_members').select('user_id, display_name')
      ]);
      if (rows.error) throw rows.error;
      names = {};
      (members.data || []).forEach((m) => { names[m.user_id] = m.display_name; });
      galleryRows = rows.data || [];
      if (!galleryRows.length) {
        galMessage('nothing here yet.', 'and that’s fine. when a drawing gets shared, it’ll be here.');
        return;
      }
      await renderGrid();
    } catch (e) {
      galMessage('couldn’t open the shared sketchbook.', 'try again in a bit.', { label: 'try again', run: () => loadGallery(false) });
    }
  }

  async function signedUrls(paths) {
    const c = await client();
    const { data, error } = await c.storage.from('sketchbook').createSignedUrls(paths, 300);
    if (error) throw error;
    const map = {};
    (data || []).forEach((d) => { if (d.signedUrl) map[d.path] = d.signedUrl; });
    return map;
  }

  async function renderGrid() {
    const urls = await signedUrls(galleryRows.map((r) => r.object_path));
    galBody.textContent = '';
    const grid = el('ul', { class: 'gal-grid' });
    galleryRows.forEach((r, i) => {
      const li = el('li', { class: 'gal-item' });
      li.style.setProperty('--tilt', ((i % 3) - 1) * 0.8 + 'deg');
      const label = (r.title || 'untitled') + ', ' + prettyDate(r.created_at);
      const b = el('button', { class: 'gal-open', type: 'button', 'aria-label': 'open ' + label });
      const img = el('img', { alt: '', loading: 'lazy', decoding: 'async' });
      img.src = urls[r.object_path] || '';
      img.addEventListener('error', () => resign(img, r), { once: true });
      b.appendChild(img);
      b.addEventListener('click', () => openViewer(r));
      li.appendChild(b);
      const cap = el('p', { class: 'gal-cap' });
      cap.appendChild(el('span', { class: 'gal-title' }, r.title || 'untitled'));
      cap.appendChild(el('span', { class: 'gal-meta' }, prettyDate(r.created_at) + ' · ' + (r.owner_id === me ? 'yours' : 'from ' + (names[r.owner_id] || 'the other page'))));
      li.appendChild(cap);
      grid.appendChild(li);
    });
    galBody.appendChild(grid);
  }

  // signed links last five minutes; if one has run out, ask for a fresh one once
  async function resign(img, r) {
    try {
      const map = await signedUrls([r.object_path]);
      if (map[r.object_path]) img.src = map[r.object_path];
    } catch (e) {
      img.replaceWith(el('span', { class: 'gal-missing' }, 'couldn’t load'));
    }
  }

  let viewing = null;
  async function openViewer(r) {
    viewing = r;
    const img = $('sbViewerImg');
    img.removeAttribute('src');
    img.alt = r.title ? 'a drawing called ' + r.title : 'a shared drawing';
    $('sbViewerTitle').textContent = r.title || 'untitled';
    $('sbViewerWhen').textContent = 'shared ' + prettyDate(r.created_at) + ' · ' + (r.owner_id === me ? 'yours' : 'from ' + (names[r.owner_id] || 'the other page'));
    $('sbViewerDelete').hidden = r.owner_id !== me;
    viewer.showModal();
    try {
      const map = await signedUrls([r.object_path]);
      img.src = map[r.object_path] || '';
    } catch (e) {
      $('sbViewerWhen').textContent = 'couldn’t load this one just now.';
    }
  }
  viewer.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => viewer.close()));

  $('sbViewerDelete').addEventListener('click', async () => {
    const r = viewing;
    viewer.close();
    const ok = await ask('unshare this drawing?', 'it’ll be removed from the shared sketchbook for both of you. any copy on your own device stays.', [
      { label: 'keep it', value: '' },
      { label: 'unshare', value: 'delete', primary: true }
    ]);
    if (ok !== 'delete') return;
    galMessage('taking it out…');
    try {
      const c = await client();
      // the image first, so a half-finished delete never leaves a picture behind
      const rm = await c.storage.from('sketchbook').remove([r.object_path]);
      if (rm.error) throw rm.error;
      const del = await c.from('shared_drawings').delete().eq('id', r.id).select('id');
      if (del.error) throw del.error;
    } catch (e) {
      await loadGallery(false);
      flashGallery('couldn’t unshare it just now. try again in a bit.');
      return;
    }
    await loadGallery(false);
    flashGallery('unshared.');
  });

  function flashGallery(text) {
    const n = el('p', { class: 'gal-flash', role: 'status' }, text);
    galBody.prepend(n);
    setTimeout(() => n.remove(), 4000);
  }

  galSignOut.addEventListener('click', async () => {
    try { const c = await client(); await c.auth.signOut({ scope: 'local' }); } catch (e) { /* already out */ }
    loadGallery(false);
  });
  $('galClose').addEventListener('click', () => closeOverlay(galleryOverlay));
  $('galCloseTop').addEventListener('click', () => closeOverlay(galleryOverlay));
  $('galleryOpen').addEventListener('click', openGallery);

  // ---- sharing only appears once the backend is set up ----
  if (SHARING) {
    shareBtn.hidden = false;
    $('galleryOpen').hidden = false;
    $('sketchNote').textContent = 'drawings stay on this device unless you choose to share one.';
  }

  // ---- start: bring back the page from last time ----
  syncTools();
  describe();
  idb('state', 'readonly', (s) => s.get('page'))
    .then((data) => { if (data) loadPage(data); updateShelf(); })
    .catch(updateShelf);
})();
