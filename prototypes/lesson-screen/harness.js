// PROTOTYPE, throwaway. The dark bar at the bottom: switches look, moment and screen size,
// and keeps all of it in the address bar so a link reopens the same view.
// A look is a finished-looking take on layout A; each lives in looks/<name>/ and is shown in a frame.
// The look called "rough" is the first pass: three layouts (A, B, C) drawn by this page itself.
(function () {
  const $ = (id) => document.getElementById(id);
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
  const qs = new URLSearchParams(location.search);
  const VK = Object.keys(P.variants);
  const N = P.moments.length;

  // Rough browser-window sizes, not exact device specs.
  const SCREENS = {
    fit: { label: 'This window' },
    laptop: { label: 'Big laptop (1470 × 840)', w: 1470, h: 840 },
    'laptop-s': { label: 'Small laptop (1366 × 650)', w: 1366, h: 650 },
    ipad: { label: 'iPad sideways (1180 × 750)', w: 1180, h: 750 },
    'ipad-s': { label: 'Small iPad sideways (1080 × 740)', w: 1080, h: 740 },
  };
  const KB_VISIBLE = 0.47; // share of the screen left above an iPad's on-screen keyboard, roughly

  const LOOKS = [...(P.looks || []), { slug: 'rough', name: 'First rough pass', blurb: 'Layout only: three layouts, placeholder colours and type.' }];
  if (qs.get('look') === '_template') LOOKS.push({ slug: '_template', name: 'Template', blurb: 'Wiring only.' });
  const l0 = qs.get('look');
  const SPLIT = 48; // the owner's choice for layout A: Chatbot 48, Widget 52

  const v0 = (qs.get('variant') || '').toUpperCase();
  const state = P.state = {
    look: LOOKS.some((l) => l.slug === l0) ? l0 : qs.get('variant') ? 'rough' : LOOKS[0].slug,
    variant: VK.includes(v0) ? v0 : 'A',
    moment: clamp((parseInt(qs.get('moment'), 10) || 1) - 1, 0, N - 1),
    screen: SCREENS[qs.get('screen')] ? qs.get('screen') : 'fit',
    kb: qs.get('kb') === '1',
    split: clamp(parseInt(qs.get('split'), 10) || SPLIT, 26, 60),
  };
  P.ui = { focus: null, drawer: false, saved: {} };
  P.ws = {};

  const app = $('app'), screenEl = $('screen'), scaler = $('scaler'), viewport = $('viewport'), bar = $('protobar');
  const frame = $('lookframe');
  const rough = () => state.look === 'rough';

  for (const [k, s] of Object.entries(SCREENS)) $('s-sel').append(P.h('option', { value: k, text: s.label }));

  // A fake on-screen keyboard, to see what is left of the screen while a Student types on an iPad.
  const kb = $('kb');
  [11, 10, 9].forEach((n) => {
    kb.append(P.h('div', { class: 'kb-row' }, Array.from({ length: n }, () => P.h('i'))));
  });
  kb.append(P.h('div', { class: 'kb-row' }, P.h('i'), P.h('i'), P.h('i', { class: 'space' }), P.h('i'), P.h('i')));
  kb.append(P.h('span', { text: 'iPad on-screen keyboard (simulated)' }));

  function resetMoment() {
    const st = P.moments[state.moment].stage;
    P.ui.focus = null;
    P.ui.drawer = false;
    P.ui.saved = {};
    P.ws = { lesson: { ...st.lesson }, built: { ...st.built } };
  }

  function syncUrl() {
    const p = new URLSearchParams();
    p.set('look', state.look);
    if (rough()) p.set('variant', state.variant);
    p.set('moment', state.moment + 1);
    if (state.screen !== 'fit') p.set('screen', state.screen);
    if (state.kb) p.set('kb', '1');
    if (rough() && state.variant === 'A' && state.split !== SPLIT) p.set('split', state.split);
    try { history.replaceState(null, '', '?' + p); } catch (e) { /* some browsers refuse on file:// */ }
  }

  function layout() {
    viewport.style.bottom = bar.offsetHeight + 'px';
    const s = SCREENS[state.screen];
    const availW = viewport.clientWidth, availH = viewport.clientHeight;
    let w = availW, h = availH, k = 1;
    if (s.w) { w = s.w; h = s.h; k = Math.min(1, (availW - 24) / w, (availH - 24) / h); }
    viewport.classList.toggle('framed', !!s.w);
    scaler.style.width = w * k + 'px';
    scaler.style.height = h * k + 'px';
    screenEl.style.width = w + 'px';
    screenEl.style.height = h + 'px';
    screenEl.style.transform = k === 1 ? 'none' : `scale(${k})`;
    screenEl.classList.toggle('kb-up', state.kb);
    app.style.height = state.kb ? KB_VISIBLE * 100 + '%' : '100%';
    frame.style.width = w + 'px';
    frame.style.height = (state.kb ? Math.round(h * KB_VISIBLE) : h) + 'px';

    // Surface the state.
    const parts = [`${Math.round(w)} × ${Math.round(h)}`];
    if (k < 1) parts.push(`shown at ${Math.round(k * 100)}%`);
    if (state.kb) parts.push(`${Math.round(h * KB_VISIBLE)} high above the keyboard`);
    if (!rough()) parts.push(`split ${SPLIT} / ${100 - SPLIT}`);
    else if (state.variant === 'A') parts.push(`split ${state.split} / ${100 - state.split}`);
    $('pb-state').textContent = parts.join(' · ');
  }

  function syncBar() {
    const V = P.variants[state.variant], m = P.moments[state.moment];
    const L = LOOKS.find((l) => l.slug === state.look);
    bar.dataset.look = state.look;
    $('arrival-preview').hidden = rough() || state.look === '_template' || state.moment !== 2;
    $('l-label').textContent = L.name;
    $('v-label').textContent = `${state.variant} · ${V.name}`;
    $('m-label').textContent = `${state.moment + 1} of ${N} · ${m.title}`;
    $('s-sel').value = state.screen;
    $('kb-chk').checked = state.kb;
    if (rough()) {
      $('pb-version').textContent = `Layout ${state.variant}:`;
      $('pb-says').textContent = `${V.blurb}  ▸ Moment ${state.moment + 1}: ${m.says}`;
    } else {
      $('pb-version').textContent = `${L.name}:`;
      $('pb-says').textContent = `${L.blurb}  ▸ Moment ${state.moment + 1}: ${m.says.replace(/\s*Compare where[^.]*\./, '')}`;
    }
  }

  // A look draws itself inside the frame. The bar only tells it which moment to show.
  const toLook = (msg) => frame.contentWindow && frame.contentWindow.postMessage({ source: 'valueit-bar', ...msg }, '*');
  $('arrival-pieces').onclick = () => toLook({ type: 'arrival', mode: 'pieces' });
  $('arrival-whole').onclick = () => toLook({ type: 'arrival', mode: 'whole' });
  function showLook() {
    const m = state.moment + 1;
    if (frame.dataset.look !== state.look) {
      frame.dataset.look = state.look;
      frame.dataset.moment = m;
      frame.src = `looks/${state.look}/index.html?moment=${m}`;
    } else if (+frame.dataset.moment !== m) {
      frame.dataset.moment = m;
      toLook({ type: 'moment', moment: m });
    }
  }
  addEventListener('message', (e) => {
    const d = e.data;
    if (!d || d.source !== 'valueit-look' || e.source !== frame.contentWindow || rough()) return;
    if (d.type === 'ready') {
      // The look has loaded. If the bar moved on meanwhile, catch it up.
      if (clamp((d.moment | 0) - 1, 0, N - 1) !== state.moment) toLook({ type: 'moment', moment: state.moment + 1 });
      frame.dataset.moment = state.moment + 1;
    } else if (d.type === 'moment') {
      // The Student pressed something inside the look (Send, an answer, "Go on").
      state.moment = clamp((d.moment | 0) - 1, 0, N - 1);
      frame.dataset.moment = state.moment + 1;
      syncBar();
      layout();
      syncUrl();
    } else if (d.type === 'key') {
      onKey(d.key);
    }
  });

  function draw() {
    syncBar();
    layout();
    syncUrl();
    app.hidden = !rough();
    frame.hidden = rough();
    if (!rough()) { app.replaceChildren(); showLook(); return; }
    if (frame.dataset.look) { delete frame.dataset.look; frame.removeAttribute('src'); }
    const m = P.moments[state.moment];
    const before = state.moment > 0 ? P.moments[state.moment - 1].upto : 0;
    const items = P.stream.slice(0, m.upto)
      .map((it, i) => ({ ...it, fresh: i >= before }))
      .filter((it, i, all) => it.t !== 'thinking' || i === all.length - 1);
    const cx = {
      lesson: P.lesson, moment: m, stage: m.stage, items, state, ui: P.ui,
      focus: P.ui.focus || m.stage.focus,
      go: goMoment,
      next: () => goMoment(state.moment + 1),
      stuck: () => goMoment(5),
      pick: (i) => goMoment(i === P.testIntuition.right ? 7 : 6),
      setFocus: (id) => { P.ui.focus = id; render(); },
      toggleDrawer: () => { P.ui.drawer = !P.ui.drawer; render(); },
      changed: () => { layout(); syncUrl(); },
    };
    app.replaceChildren();
    app.dataset.v = state.variant;
    P.variants[state.variant].render(app, cx);
  }

  // Scroll so the first new thing sits at the top, or to the very end if everything new fits.
  P.anchor = (scroll, el) => {
    const max = scroll.scrollHeight - scroll.clientHeight;
    scroll.scrollTop = el ? Math.min(max, Math.max(0, el.offsetTop - 12)) : max;
  };

  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  function render() {
    if (!rough() || !document.startViewTransition || calm.matches) return draw();
    // A quick second click cuts the running transition short; that is fine, not an error.
    const t = document.startViewTransition(draw);
    t.ready.catch(() => {});
    t.finished.catch(() => {});
  }

  function goMoment(i) {
    state.moment = (i + N) % N;
    resetMoment();
    render();
  }
  function goLook(step) {
    const i = LOOKS.findIndex((l) => l.slug === state.look);
    state.look = LOOKS[(i + step + LOOKS.length) % LOOKS.length].slug;
    P.ui.focus = null;
    P.ui.drawer = false;
    render();
  }
  function goVariant(step) {
    state.variant = VK[(VK.indexOf(state.variant) + step + VK.length) % VK.length];
    P.ui.focus = null;
    P.ui.drawer = false;
    render();
  }

  $('l-prev').onclick = () => goLook(-1);
  $('l-next').onclick = () => goLook(1);
  $('v-prev').onclick = () => goVariant(-1);
  $('v-next').onclick = () => goVariant(1);
  $('m-prev').onclick = () => goMoment(state.moment - 1);
  $('m-next').onclick = () => goMoment(state.moment + 1);
  $('s-sel').onchange = (e) => { state.screen = e.target.value; render(); };
  $('kb-chk').onchange = (e) => { state.kb = e.target.checked; render(); };

  // Left and right change the look, up and down change the moment.
  // Left alone while typing or dragging a slider. A look passes these keys up when it has the focus.
  function onKey(key) {
    if (key === 'ArrowLeft') goLook(-1);
    else if (key === 'ArrowRight') goLook(1);
    else if (key === 'ArrowUp') goMoment(state.moment - 1);
    else if (key === 'ArrowDown') goMoment(state.moment + 1);
    else return false;
    return true;
  }
  document.addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (onKey(e.key)) e.preventDefault();
  });

  addEventListener('resize', layout);
  resetMoment();
  draw();
})();
