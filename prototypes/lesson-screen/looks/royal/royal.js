// PROTOTYPE, throwaway. "Royal blocks": the Widget is a lit object in a quiet dark room.
// One routine (instrument) draws every Widget from the plain data in P.defs: labels, amounts, a maximum, controls.
// Which blocks can move, and which move together, is worked out from that data too. Nothing is drawn by hand.
(() => {
  'use strict';

  const h = P.h;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const fmt = (n) => Math.round(n).toLocaleString('en-US');
  const signed = (n) => (n > 0 ? '+' : n < 0 ? '−' : '±') + fmt(Math.abs(n));
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  const short = matchMedia('(max-height: 30.625rem)');   // above the on-screen keyboard
  const SIDES = ['left', 'right'];
  const SIDE_NAME = { left: 'Owns', right: "Owes + what's left" };
  // Rows stagger with CSS sibling-index() where the browser has it; elsewhere the script hands each row its number.
  const NEEDS_INDEX = !window.CSS?.supports?.('animation-delay: calc(sibling-index() * 0.1s)');
  const nth = (i) => (NEEDS_INDEX ? `--sibling-index:${i + 1}` : null);

  // ------------------------------------------------------------------------------------------
  // Small pieces
  // ------------------------------------------------------------------------------------------
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const ICONS = {
    go: ['M3 8h9.5M9 4.25 12.75 8 9 11.75'],
    out: ['M5.25 10.75 10.75 5.25M6 5h5v5'],
    check: ['M3.5 8.5 6.5 11.5 12.5 4.75'],
    cross: ['M4.75 4.75l6.5 6.5M11.25 4.75l-6.5 6.5'],
    turn: ['M4 3.25V8.5h8M9.25 5.75 12 8.5 9.25 11.25'],
    grip: ['M5.25 6.25 8 3.5l2.75 2.75M5.25 9.75 8 12.5l2.75-2.75'],
    note: ['M4 2.5h5.5L12 5v8.5H4z', 'M9.5 2.5V5H12', { d: 'M6.25 8h3.5M6.25 10.5h3.5', cls: 'lines' }, { d: 'M6 9.4 7.4 10.8 10.2 7.6', cls: 'tick' }],
    pane: ['M2.5 3.5h11v9h-11z', { d: 'M9 3.5h4.5v9H9z', cls: 'here' }],
  };
  function icon(name, cls) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('class', 'icon' + (cls ? ' ' + cls : ''));
    for (const part of ICONS[name]) {
      const path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', part.d || part);
      if (part.cls) path.setAttribute('class', part.cls);
      svg.append(path);
    }
    return svg;
  }
  const btn = (cls, kids, click, attrs) => h('button', { type: 'button', class: cls, onclick: click, ...attrs }, kids);

  const live = $('#announce');
  function announce(text) { live.textContent = ''; setTimeout(() => { live.textContent = text; }, 60); }

  // Add a class that plays an entrance, and take it off again when the entrance is over.
  function play(el, cls, ms = 900) {
    if (!el || calm.matches) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    clearTimeout(el['_' + cls]);
    el['_' + cls] = setTimeout(() => el.classList.remove(cls), ms);
  }

  // A number that counts to its new value (the Chatbot's hand) or simply shows it (the Student's hand).
  const counting = new Map();
  function setNumber(el, value, count) {
    const from = el._value;
    const running = counting.get(el);
    if (from === value && (count || !running)) { if (!running) el.textContent = fmt(value); return; }
    el._value = value;
    if (running) { cancelAnimationFrame(running); counting.delete(el); }
    if (!count || calm.matches || from === undefined || from === value) { el.textContent = fmt(value); return; }
    const t0 = performance.now(), ms = 340, grain = Math.abs(value - from) >= 1000 ? 100 : 1;
    const tick = (now) => {
      const t = clamp((now - t0) / ms, 0, 1), e = 1 - (1 - t) ** 3;
      el.textContent = fmt(t === 1 ? value : Math.round((from + (value - from) * e) / grain) * grain);
      if (t < 1) counting.set(el, requestAnimationFrame(tick)); else counting.delete(el);
    };
    counting.set(el, requestAnimationFrame(tick));
  }

  // ------------------------------------------------------------------------------------------
  // State
  // ------------------------------------------------------------------------------------------
  const pane = $('[data-pane="widget"]');
  const panel = $('.panel');
  const tabsEl = $('.tabs');
  const jump = $('.jump');
  const chatPane = $('[data-pane="chat"]');
  const scroll = $('.scroll');
  const doc = $('.doc');
  const sheet = $('.sheet');

  const TAB_NAME = { lesson: P.defs.lesson.short, built: P.defs.built.short, summary: 'What to keep' };
  const EARLIER = [
    { kind: 'Idea 1 of 4', title: P.lesson.ideas[0] },
    { kind: 'Idea 1 of 4', title: 'Cash' },
    { kind: 'Idea 1 of 4', title: 'Cart' },
  ];
  const saved = new Map();                 // key -> { kind, title, text }
  const state = {
    moment: 0, stage: null, front: null, open: [],
    values: { lesson: {}, built: {} },
    wrongs: new Set(), picked: null, slip: null,
    noteLine: '', editing: false, finished: false,
  };
  let inst = null;                          // the instrument in front, if one is
  let sticky = null;                        // what a tap has lit, until the next tap

  // ------------------------------------------------------------------------------------------
  // Notes
  // ------------------------------------------------------------------------------------------
  const countEl = $('.notes-count');
  function countNotes(bump) {
    const n = EARLIER.length + saved.size;
    if (countEl.textContent !== String(n)) { countEl.textContent = n; if (bump) play(countEl, 'is-bumped', 400); }
  }
  function noteButton(key, entry, onToggle) {
    const label = h('span');
    const button = btn('note', [icon('note'), label], () => {
      if (saved.has(key)) saved.delete(key); else saved.set(key, entry());
      paint();
      countNotes(true);
      announce(saved.has(key) ? 'Saved to Notes' : 'Removed from Notes');
      onToggle?.(saved.has(key));
    });
    function paint() {
      const on = saved.has(key);
      label.textContent = on ? 'Saved to Notes' : 'Save as Note';
      button.setAttribute('aria-pressed', String(on));
    }
    paint();
    return button;
  }

  function fillSheet() {
    const mine = [...saved.values()];
    const total = EARLIER.length + mine.length;
    $('.sheet-sub').textContent = `${total} saved in this Lesson`;
    const card = (n) => h('li', { class: 'saved-note' },
      h('span', { class: 'saved-kind', text: n.kind }),
      h('span', { class: 'saved-title', text: n.title }),
      n.text && h('span', { class: 'saved-text', text: n.text }),
      n.points && h('ol', { class: 'saved-text' }, n.points.map((p, i) => h('li', { text: `${i + 1}. ${p}` }))),
      n.own && state.noteLine && h('p', { class: 'saved-own' }, h('small', { text: 'Your own line' }), state.noteLine));
    const group = (title, notes) => h('section', { class: 'sheet-group' }, h('h3', { text: title }), h('ul', {}, notes.map(card)));
    const groups = [group('Earlier in this Lesson', EARLIER)];
    if (mine.length) groups.unshift(group('Saved in this idea', mine));
    $('.sheet-body').replaceChildren(...groups);
    $('.sheet-body').scrollTop = 0;
  }

  // Can this browser keep an element on screen while it leaves the top layer? (Firefox and Safari cannot yet.)
  let displayTransition;
  function canTransitionDisplay() {
    if (displayTransition !== undefined) return displayTransition;
    if (!window.CSS?.supports?.('transition-behavior', 'allow-discrete') || !document.body) return false;
    const probe = document.createElement('div');
    probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
    document.body.appendChild(probe);
    getComputedStyle(probe).display;
    probe.style.display = 'none';
    displayTransition = getComputedStyle(probe).display === 'block';
    probe.remove();
    return displayTransition;
  }
  const exitsByItself = () => !!window.CSS?.supports?.('overlay', 'auto') && canTransitionDisplay();
  async function closeSheet() {
    if (!sheet.open || sheet.hasAttribute('data-closing')) return;
    if (!exitsByItself() && !calm.matches) {
      sheet.setAttribute('data-closing', '');
      const running = sheet.getAnimations({ subtree: true });
      if (running.length) await Promise.race([Promise.allSettled(running.map((a) => a.finished)), new Promise((r) => setTimeout(r, 500))]);
      if (!sheet.hasAttribute('data-closing')) return;
      sheet.removeAttribute('data-closing');
    }
    sheet.close();
  }
  $('.notes-open').addEventListener('click', () => { fillSheet(); sheet.removeAttribute('data-closing'); sheet.showModal(); });
  $('.sheet-close').addEventListener('click', closeSheet);
  sheet.addEventListener('cancel', (e) => { e.preventDefault(); closeSheet(); });
  sheet.addEventListener('click', (e) => { if (e.target === sheet) closeSheet(); });

  // ------------------------------------------------------------------------------------------
  // One teacher: a word, its block, its ledger row and its control light up together
  // ------------------------------------------------------------------------------------------
  // spot: a word turns the lamp on one block and the rest falls into shade.
  // link: a block, a ledger row or a control shows what moves with it. move: a hand is moving it.
  function light(keys, how = 'link') {
    const on = keys && keys.length ? new Set(keys) : null;
    for (const term of $$('.term')) term.classList.toggle('is-lit', !!on && on.has(term.dataset.concept));
    inst?.light(on, how);
  }
  const hoverLight = (keys, how) => { if (!sticky) light(keys, how); };
  function tapLight(keys, how = 'spot') {
    const same = sticky && keys && sticky.join() === keys.join();
    sticky = same || !keys ? null : keys;
    light(sticky, how);
  }
  document.addEventListener('pointerdown', (e) => {
    if (sticky && !e.target.closest('.term, .block, .row, .control')) tapLight(null);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sticky) tapLight(null); });

  // Colour the Chatbot's words about an amount, and make each one answer hover, focus and tap.
  const TERMS = [
    [/what's left for (?:Maya|its owners|the owner)|left for Maya|blue block/gi, 'equity'],
    [/owes the bank|bank loan|the loan|owes/gi, 'owes'],
    [/a new machine|coffee machine/gi, 'machine'],
    [/the cart itself/gi, 'cart'],
    [/some cash/gi, 'cash'],
  ];
  function markTerms(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    for (let n; (n = walker.nextNode());) nodes.push(n);
    for (const node of nodes) {
      let hits = [];
      for (const [re, key] of TERMS) for (const m of node.nodeValue.matchAll(re)) hits.push({ at: m.index, end: m.index + m[0].length, key });
      hits.sort((a, b) => a.at - b.at || b.end - a.end);
      hits = hits.filter((hit, i) => !hits.slice(0, i).some((p) => hit.at < p.end));
      if (!hits.length) continue;
      const out = document.createDocumentFragment();
      let at = 0;
      for (const hit of hits) {
        out.append(node.nodeValue.slice(at, hit.at));
        const keys = [hit.key];
        out.append(h('button', {
          type: 'button', class: 'term', 'data-concept': hit.key, text: node.nodeValue.slice(hit.at, hit.end),
          onpointerenter: (e) => { if (e.pointerType !== 'touch') hoverLight(keys, 'spot'); },
          onpointerleave: () => hoverLight(null),
          onfocus: () => hoverLight(keys, 'spot'), onblur: () => hoverLight(null),
          onclick: () => tapLight(keys, 'spot'),
        }));
        at = hit.end;
      }
      out.append(node.nodeValue.slice(at));
      node.replaceWith(out);
    }
  }

  // ------------------------------------------------------------------------------------------
  // The conversation
  // ------------------------------------------------------------------------------------------
  let clock = 0;
  function marker(id) {
    const name = TAB_NAME[id];
    return btn('marker', [icon('pane'), h('span', {}, 'On the right: ', h('b', { text: name })), icon('go', 'go')], () => bringFront(id, 'handover'), { 'data-for': id });
  }
  function item(it, i, all, n) {
    switch (it.t) {
      case 'divider': {
        const [count, title] = it.label.includes(' · ') ? it.label.split(' · ') : [null, it.label];
        return h('header', { class: 'chapter' }, count && h('p', { class: 'chapter-count', text: count }), h('h2', { class: 'chapter-title', text: title }));
      }
      case 'widget': case 'use': case 'summary':
        return marker(it.w || 'summary');
      case 'me':
        return h('p', { class: 'asked' }, h('span', { class: 'sr-only', text: 'Student: ' }), it.text);
      case 'act': {
        let text = it.text;
        if (it.id === 'a2' && state.slip != null && state.slip !== P.moments[6].stage.wrong) {
          text = `You picked “${P.testIntuition.answers[state.slip].split('.')[0]}”`;
        }
        return h('p', { class: 'aside', text });
      }
      case 'skip':
        return h('p', { class: 'aside skip', text: 'Skipped ' + it.text });
      case 'thinking': {
        if (i !== all.length - 1) return null;
        const time = h('span', { class: 'thinking-clock', text: '0:00' });
        const t0 = Date.now();
        clock = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); time.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }, 1000);
        return h('div', { class: 'said thinking', role: 'status' },
          h('p', { class: 'who', text: 'Chatbot' }),
          h('span', { class: 'thinking-mark', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')),
          h('p', {}, time, 'Thinking. This can take half a minute. The Widget still works while you wait.'));
      }
      case 'bot': {
        const prev = all[i - 1];
        const paras = it.html.split(/<br\s*\/?>/i).map((html) => h('p', { html }));
        paras.forEach(markTerms);
        const text = paras.map((p) => p.textContent).join(' ');
        const foot = [];
        if (it.source) foot.push(h('span', { class: 'source' }, 'From the web',
          h('a', { href: 'https://www.sec.gov/edgar/browse/?CIK=829224&owner=exclude&forms=10-K', target: '_blank', rel: 'noopener' }, it.source, icon('out'))));
        if (it.save) foot.push(noteButton('m:' + it.id, () => ({ kind: "The Chatbot's answer", title: text.split('. ')[0] + '.', text: text.split('. ').slice(1).join('. ') })));
        return h('article', { class: 'said' },
          !(prev && prev.t === 'bot') && h('p', { class: 'who', text: 'Chatbot' }),
          paras,
          foot.length ? h('div', { class: 'said-foot' }, foot) : null,
          it.go && n === 8 && btn('btn primary go-on', [h('span', { text: it.go }), icon('go')], () => Look.go(9)));
      }
      default:
        return null;
    }
  }

  function renderChat(n, prev) {
    clearInterval(clock);
    const m = P.moments[n - 1];
    const items = P.stream.slice(0, m.upto);
    const freshFrom = P.moments[n - 2]?.upto || 0;
    const animate = prev === null || prev < n;
    let first = null, order = 0;
    const nodes = [];
    items.forEach((it, i) => {
      const el = item(it, i, items, n);
      if (!el) return;
      if (i >= freshFrom) {
        first ||= el;
        if (animate) { el.classList.add('is-fresh'); el.style.setProperty('--i', order++); }
      }
      nodes.push(el);
    });
    doc.replaceChildren(...nodes);
    if (animate) setTimeout(() => $$('.is-fresh', doc).forEach((el) => el.classList.remove('is-fresh')), 1200);
    markCurrent();

    // Show the first new thing at the top of the pane; if everything new fits, show the end.
    const anchor = () => {
      if (!first?.isConnected) return;
      const max = scroll.scrollHeight - scroll.clientHeight;
      const top = first.getBoundingClientRect().top - doc.getBoundingClientRect().top + doc.offsetTop - (short.matches ? 4 : 20);
      scroll.scrollTop = n === 1 && !short.matches ? 0 : clamp(top, 0, max);
      edges();
    };
    anchor();
    requestAnimationFrame(anchor);
    document.fonts?.ready.then(anchor);
    $('.composer input').value = '';
    $('.send').disabled = n === P.moments.length;
    paintSend();
  }
  // Send takes the accent only when there is something to send.
  function paintSend() {
    const ready = !!$('.composer input').value.trim();
    $('.send').classList.toggle('primary', ready);
    $('.send').classList.toggle('tonal', !ready);
  }
  $('.composer input').addEventListener('input', paintSend);
  // A hairline over the message box only while there is more conversation under it.
  function edges() { chatPane.toggleAttribute('data-more', scroll.scrollHeight - scroll.clientHeight - scroll.scrollTop > 2); }
  scroll.addEventListener('scroll', edges, { passive: true });
  addEventListener('resize', edges);
  function markCurrent() {
    for (const mk of $$('.marker', doc)) {
      if (mk.dataset.for === state.front) mk.setAttribute('aria-current', 'true'); else mk.removeAttribute('aria-current');
    }
  }

  $('.composer').addEventListener('submit', (e) => { e.preventDefault(); Look.go(Math.min(P.moments.length, Look.moment + 1)); });
  $('.stuck').addEventListener('click', () => Look.go(6));

  // ------------------------------------------------------------------------------------------
  // Top bar
  // ------------------------------------------------------------------------------------------
  $('.lesson-topic').textContent = `${P.lesson.topic} · Lesson ${P.lesson.number}`;
  $('.lesson-title').textContent = P.lesson.title;
  function renderProgress(stage) {
    const { ideas, now } = P.ideaStates(stage);
    const steps = $('.steps');
    if (steps.children.length !== ideas.length) steps.replaceChildren(...ideas.map(() => h('li')));
    ideas.forEach((idea, i) => {
      const li = steps.children[i];
      li.dataset.state = idea.state;
      li.replaceChildren(h('span', { class: 'sr-only', text: `${idea.label}: ${idea.state}` }));
    });
    const [lead, rest] = now.includes(': ') ? now.split(/: (.*)/s) : [now, ''];
    const nowEl = $('.progress-now');
    nowEl.replaceChildren(rest ? lead + ': ' : '', h('b', { text: rest || lead }));
    if (stage.ideaDone) nowEl.append(h('span', { class: 'tick' }, icon('check'), h('span', { class: 'sr-only', text: ' done' })));
  }

  // ------------------------------------------------------------------------------------------
  // The instrument: frame, amounts block, ledger, controls, Test intuition. Drawn from P.defs.
  // ------------------------------------------------------------------------------------------
  function instrument(id, opt = {}) {
    const def = P.defs[id];
    const vals = { ...state.values[id] };        // what the controls say (always on a step)
    const springs = {};                          // what the blocks show (free to move between steps)
    for (const c of def.controls) springs[c.key] = { x: vals[c.key], v: 0, to: vals[c.key], k: 560, c: 31 };

    // Which control moves which block, and by how much, read off the model itself.
    const base = def.model(vals);
    const links = {};                            // block key -> { control, gain }
    for (const c of def.controls) {
      const probe = def.model({ ...vals, [c.key]: vals[c.key] + c.step <= c.max ? vals[c.key] + c.step : vals[c.key] - c.step });
      const d = vals[c.key] + c.step <= c.max ? c.step : -c.step;
      for (const side of SIDES) base[side].forEach((part, i) => {
        const gain = (probe[side][i].v - part.v) / d;
        if (gain && !links[part.k]) links[part.k] = { control: c, gain };
      });
    }
    const partners = (k) => (links[k] ? Object.keys(links).filter((o) => links[o].control === links[k].control) : [k]);
    const moved = (c) => Object.keys(links).filter((k) => links[k].control === c);

    // ---- build ----
    const blocks = {}, rows = {}, amounts = {}, totals = {}, heads = {}, wells = {}, plans = {}, legends = {};
    const stageEl = h('div', { class: 'stage' });
    const ledger = h('div', { class: 'ledger' });
    SIDES.forEach((side, s) => {
      const well = wells[side] = h('div', { class: 'well' });
      const plan = plans[side] = h('div', { class: 'plan', 'aria-hidden': 'true' });
      const col = h('ul', { class: 'ledger-col', 'aria-label': SIDE_NAME[side] });
      base[side].forEach((part, i) => {
        const movable = !!links[part.k];
        const block = blocks[part.k] = h('div', { class: 'block', 'data-block': part.k, 'data-movable': movable, style: `--i:${i}` },
          h('div', { class: 'face' }, h('span', { class: 'face-name', text: part.label }), movable && icon('grip')));
        if (movable) block.addEventListener('pointerdown', (e) => grab(e, part.k));
        block.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch' && !drag) hoverLight(partners(part.k)); });
        block.addEventListener('pointerleave', () => { if (!drag) hoverLight(null); });
        well.append(block);
        plan.append(h('i'));
        const amount = amounts[part.k] = h('span', { class: 'row-amount' });
        const row = rows[part.k] = h('li', { class: 'row', 'data-row': part.k, 'data-c': part.k, style: nth(i) },
          h('i', { class: 'swatch' }), h('span', { class: 'row-name', text: part.label }), amount);
        row.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') hoverLight(partners(part.k)); });
        row.addEventListener('pointerleave', () => hoverLight(null));
        row.addEventListener('click', () => tapLight(partners(part.k), 'link'));
        col.append(row);
      });
      well.append(plan);
      const total = totals[side] = h('strong', { class: 'total', 'data-total': side });
      const head = h('div', { class: 'head' }, s ? h('span', { class: 'head-eq', 'aria-hidden': 'true', text: '=' }) : null, h('span', { class: 'head-name', text: SIDE_NAME[side] }), total);
      heads[side] = h('div', { class: 'col', 'data-side': side }, head, well);
      stageEl.append(heads[side]);
      if (!s) stageEl.append(h('div', { class: 'eq-col' }, equalsEl()));
      ledger.append(col);
      legends[side] = col;
    });
    const chip = h('div', { class: 'chip', 'aria-hidden': 'true' }, h('b'), h('span'));
    function equalsEl() { return h('div', { class: 'equals', role: 'img', 'aria-label': 'equals', text: '=' }); }
    const equals = $('.eq-col', stageEl);
    const amountsEl = h('div', { class: 'amounts', 'data-build-part': 'amounts', style: `--n:${Math.max(base.left.length, base.right.length)}` }, stageEl, ledger, chip);
    const names = {};
    for (const k in blocks) names[k] = $('.face-name', blocks[k]);

    // ---- controls ----
    const controlEls = {}, inputs = {}, outputs = {}, deltas = {};
    const controls = h('div', { class: 'controls', 'data-build-part': 'controls', 'data-count': def.controls.length }, def.controls.map((c) => {
      const inputId = `range-${id}-${c.key}`;
      const input = inputs[c.key] = h('input', { type: 'range', class: 'range', id: inputId, 'aria-label': c.label, min: c.min, max: c.max, step: c.step, value: vals[c.key] });
      const output = outputs[c.key] = h('output', { for: inputId });
      const delta = deltas[c.key] = h('span', { class: 'control-delta', 'aria-hidden': 'true' });
      const [a, b] = moved(c);
      const el = controlEls[c.key] = h('div', { class: 'control', 'data-control': c.key },
        h('label', { class: 'control-label', for: inputId },
          h('i', { class: 'swatch', style: `--ca:var(--c-${a || 'cart'});--cb:var(--c-${b || a || 'cart'})` }), h('span', { text: c.label })),
        h('div', { class: 'control-value' }, delta, output),
        input);
      let before = null;
      const begin = () => { if (before === null) { before = vals[c.key]; } };
      const end = () => { before = null; el.classList.remove('is-moving'); };
      input.addEventListener('pointerdown', begin);
      input.addEventListener('pointerup', end);
      input.addEventListener('pointercancel', end);
      input.addEventListener('blur', end);
      input.addEventListener('input', () => {
        if (before === null) before = vals[c.key];
        if (setControl(c, +input.value)) numbers(false);
        run();
        delta.textContent = signed(vals[c.key] - before);
        el.classList.add('is-moving');
        clearTimeout(el._calm);
        el._calm = setTimeout(end, 1400);
      });
      el.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch' && !drag) hoverLight(moved(c), 'move'); });
      el.addEventListener('pointerleave', () => { if (!drag) hoverLight(null); });
      input.addEventListener('focus', () => hoverLight(moved(c), 'move'));
      input.addEventListener('blur', () => hoverLight(null));
      return el;
    }));

    // ---- frame ----
    const title = h('h2', { class: 'w-title', text: def.title });
    const save = noteButton('w:' + id, () => ({ kind: id === 'built' ? 'Widget, built for you' : 'Widget', title: def.title, text: describe() }));
    save.dataset.buildPart = 'controls';
    const hand = h('p', { class: 'hand', hidden: true });
    const tiSlot = h('div', { class: 'ti-slot' });
    tiSlot.style.display = 'contents';
    const foot = h('div', { class: 'w-foot' }, hand, controls, tiSlot);
    const el = h('div', { class: 'inst', 'data-widget': id }, h('header', { class: 'w-head' }, title, save), amountsEl, foot);

    function describe() {
      const m = def.model(vals);
      return SIDES.map((side) => `${SIDE_NAME[side]} ${fmt(m[side].reduce((a, p) => a + p.v, 0))}: ` + m[side].filter((p) => p.v).map((p) => `${p.label} ${fmt(p.v)}`).join(', ')).join('. ') + '.';
    }

    // ---- drawing ----
    let morph = opt.from ? { from: opt.from, p: 0, v: 0 } : null;   // a handover from the Widget that was in front
    let raf = 0, last = 0;
    function fractions() {
      const shown = {};
      for (const c of def.controls) shown[c.key] = springs[c.key].x;
      const m = def.model(shown), out = {};
      for (const side of SIDES) for (const part of m[side]) {
        let f = Math.max(0, part.v) / def.max;
        if (morph) { const was = morph.from[part.k] ?? 0; f = was + (f - was) * morph.p; }
        out[part.k] = f;
      }
      return out;
    }
    const size = { w: 0, h: 0, flat: false, name: {} };       // the well, measured when it changes; never read while moving
    function draw() {
      const f = fractions();
      SIDES.forEach((side) => {
        let o = 0;
        for (const part of base[side]) {
          const b = blocks[part.k], s = f[part.k];
          b.style.setProperty('--o', o.toFixed(5));
          b.style.setProperty('--s', s.toFixed(5));
          b.toggleAttribute('data-empty', s < 0.002);
          // a block carries its name when it has room
          const w = size.flat ? s * size.w : size.w, high = size.flat ? size.h : s * size.h, need = (size.name[part.k] || 60) + (size.flat ? 20 : 28);
          const label = high < 18 ? 'none' : w >= need + 26 && links[part.k] ? 'full' : w >= need ? 'name' : links[part.k] && w >= 30 ? 'grip' : 'none';
          if (b.dataset.label !== label) b.dataset.label = label;
          o += s;
        }
        heads[side].style.setProperty('--top', o.toFixed(5));
        heads[side].style.setProperty('--has', o < 0.002 ? 0 : 1);
        if (side === 'left') equals.style.setProperty('--top', o.toFixed(5));
      });
    }
    function drawPlan() {
      const m = def.model(vals);
      SIDES.forEach((side) => {
        let o = 0;
        m[side].forEach((part, i) => {
          const s = Math.max(0, part.v) / def.max, mark = plans[side].children[i];
          mark.style.setProperty('--o', o.toFixed(5));
          mark.style.setProperty('--s', s.toFixed(5));
          mark.hidden = s < 0.002;
          o += s;
        });
      });
    }
    function numbers(count) {
      const m = def.model(vals);
      for (const side of SIDES) {
        let sum = 0;
        for (const part of m[side]) {
          sum += part.v;
          setNumber(amounts[part.k], part.v, count);
          rows[part.k].toggleAttribute('data-zero', !part.v);
          blocks[part.k].setAttribute('aria-label', `${part.label} ${fmt(part.v)}`);
        }
        setNumber(totals[side], sum, count);
      }
      for (const c of def.controls) {
        const input = inputs[c.key];
        if (+input.value !== vals[c.key]) input.value = vals[c.key];
        input.style.setProperty('--p', ((vals[c.key] - c.min) / (c.max - c.min)).toFixed(4));
        input.setAttribute('aria-valuetext', fmt(vals[c.key]));
        setNumber(outputs[c.key], vals[c.key], count);
      }
      drawPlan();
    }
    function loop(now) {
      const dt = Math.min(0.034, (now - last) / 1000 || 0.016);
      last = now;
      let busy = false;
      const step = (s, range) => {
        if (s.held) return;
        const n = Math.max(1, Math.round(dt / 0.004)), hdt = dt / n;
        for (let i = 0; i < n; i++) { s.v += (-s.k * (s.x - s.to) - s.c * s.v) * hdt; s.x += s.v * hdt; }
        if (Math.abs(s.x - s.to) < range * 0.0008 && Math.abs(s.v) < range * 0.01) { s.x = s.to; s.v = 0; } else busy = true;
      };
      for (const c of def.controls) step(springs[c.key], c.max - c.min);
      if (morph) {
        const s = morph.s ||= { x: 0, v: 0, to: 1, k: 420, c: 34 };
        step(s, 1);
        morph.p = s.x;
        if (s.x === 1) morph = null;
      }
      draw();
      raf = busy || morph ? requestAnimationFrame(loop) : 0;
    }
    function run() {
      if (calm.matches) {
        for (const c of def.controls) { const s = springs[c.key]; if (!s.held) { s.x = s.to; s.v = 0; } }
        morph = null;
        draw();
        return;
      }
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
    }

    // ---- changing an amount ----
    function setControl(c, value, how = {}) {
      value = clamp(Math.round(value / c.step) * c.step, c.min, c.max);
      const changed = value !== vals[c.key];
      vals[c.key] = value;
      state.values[id][c.key] = value;
      const s = springs[c.key];
      s.to = value;
      s.k = how.hand ? 250 : 560;
      s.c = how.hand ? 24 : 31;
      return changed;
    }
    // The Student's hand: the figures follow at once. The Chatbot's hand: they count.
    function setValues(next, how = {}) {
      let any = false;
      for (const c of def.controls) if (next[c.key] !== undefined) any = setControl(c, next[c.key], how) || any;
      if (any || how.force) numbers(!!how.hand && any);
      run();
      return any;
    }

    // ---- grabbing a block ----
    let drag = null;
    function grab(e, k) {
      if (e.button !== 0 || drag) return;
      const { control: c, gain } = links[k];
      const block = blocks[k];
      e.preventDefault();
      try { block.setPointerCapture(e.pointerId); } catch {}
      const flat = amountsEl.dataset.lay === 'flat';
      const box = wells.left.getBoundingClientRect();
      const perUnit = (flat ? box.width : box.height) / def.max;                // pixels for one unit of amount
      drag = { k, c, gain, block, flat, pointer: e.pointerId, y0: flat ? -e.clientX : e.clientY, from: vals[c.key], perUnit, moved: false, touch: e.pointerType === 'touch', t: performance.now(), x: vals[c.key], speed: 0 };
      springs[c.key].held = true;
      for (const p of partners(k)) blocks[p].classList.add('is-held');
      block.parentElement.classList.add('is-pressed');
      controlEls[c.key].classList.remove('is-moving');
      amountsEl.classList.add('is-dragging');
      sticky = null;
      light(partners(k), 'move');
      readout(e);
      block.addEventListener('pointermove', dragMove);
      block.addEventListener('pointerup', dragEnd);
      block.addEventListener('pointercancel', dragEnd);
      block.addEventListener('lostpointercapture', dragEnd);
    }
    function dragMove(e) {
      if (!drag || e.pointerId !== drag.pointer) return;
      const { c, gain } = drag;
      const at = drag.flat ? -e.clientX : e.clientY;
      if (Math.abs(at - drag.y0) > 3) drag.moved = true;
      let raw = drag.from + (drag.y0 - at) / drag.perUnit / gain;
      const give = c.step * 0.45;                                                // it stretches a little past the end, then holds
      if (raw > c.max) raw = c.max + give * (1 - Math.exp(-(raw - c.max) / (c.step * 1.5)));
      if (raw < c.min) raw = c.min - give * (1 - Math.exp(-(c.min - raw) / (c.step * 1.5)));
      const now = performance.now(), s = springs[c.key];
      drag.speed = (raw - drag.x) / Math.max(0.008, (now - drag.t) / 1000);
      drag.t = now; drag.x = raw;
      s.x = raw; s.v = 0;
      if (setControl(c, raw)) numbers(false);
      draw();
      readout(e);
    }
    function dragEnd(e) {
      if (!drag || (e.pointerId !== undefined && e.pointerId !== drag.pointer)) return;
      const d = drag;
      drag = null;
      d.block.removeEventListener('pointermove', dragMove);
      d.block.removeEventListener('pointerup', dragEnd);
      d.block.removeEventListener('pointercancel', dragEnd);
      d.block.removeEventListener('lostpointercapture', dragEnd);
      try { d.block.releasePointerCapture(d.pointer); } catch {}
      const s = springs[d.c.key];
      s.held = false;
      s.v = clamp(d.speed, -(d.c.max - d.c.min) * 6, (d.c.max - d.c.min) * 6);      // it keeps the hand's speed, then settles
      s.to = vals[d.c.key];
      for (const b of Object.values(blocks)) b.classList.remove('is-held');
      for (const side of SIDES) wells[side].classList.remove('is-pressed');
      amountsEl.classList.remove('is-dragging');
      chip.classList.remove('is-on');
      run();
      if (!d.moved) tapLight(partners(d.k), 'link'); else { light(null); announce(`${d.c.label}: ${fmt(vals[d.c.key])}`); }
    }
    function readout(e) {
      const { k, c, gain, from } = drag;
      const box = amountsEl.getBoundingClientRect();
      const amount = def.model(vals)[SIDES.find((s) => base[s].some((p) => p.k === k))].find((p) => p.k === k).v;
      chip.firstChild.textContent = fmt(amount);
      chip.lastChild.textContent = signed((vals[c.key] - from) * gain);
      // over a finger; beside a mouse pointer, on the side with more room
      const px = e.clientX - box.left, py = e.clientY - box.top;
      if (drag.touch) chip.style.transform = `translate(calc(${clamp(px, 60, box.width - 60).toFixed(1)}px - 50%), calc(${Math.max(40, py - 52).toFixed(1)}px - 100%))`;
      else if (drag.flat) chip.style.transform = `translate(calc(${clamp(px, 60, box.width - 60).toFixed(1)}px - 50%), ${(wells[SIDES.find((s) => base[s].some((p) => p.k === k))].getBoundingClientRect().bottom - box.top + 10).toFixed(1)}px)`;
      else if (px < box.width / 2) chip.style.transform = `translate(${(px + 18).toFixed(1)}px, calc(${py.toFixed(1)}px - 50%))`;
      else chip.style.transform = `translate(calc(${(px - 18).toFixed(1)}px - 100%), calc(${py.toFixed(1)}px - 50%))`;
      chip.classList.add('is-on');
    }

    // ---- what the Chatbot does, and Test intuition ----
    function setHand(stage, fresh) {
      const text = stage.changed?.w === id ? 'The Chatbot set ' + stage.changed.what : '';
      hand.hidden = !text;
      hand.replaceChildren(...(text ? [icon('turn'), text] : []));
      if (text && fresh) play(hand, 'is-new', 700);
      for (const c of def.controls) {
        const pointed = stage.point?.w === id && stage.point.key === c.key;
        const el = controlEls[c.key];
        const mark = $('.pointing', el);
        if (pointed && !mark) { el.setAttribute('data-pointed', ''); el.append(h('p', { class: 'pointing' }, icon('turn'), 'The Chatbot is pointing here')); }
        if (!pointed && mark) { el.removeAttribute('data-pointed'); mark.remove(); }
      }
    }
    function setQuestion(stage, fresh) {
      const on = !!stage.ti && id === 'lesson';
      el.toggleAttribute('data-ti', on);
      setLay();
      if (!on) { tiSlot.replaceChildren(); return; }
      const T = P.testIntuition;
      const done = stage.ti === 'right';
      const answers = T.answers.map((text, i) => {
        const wrong = state.wrongs.has(i) && stage.ti !== 'open';
        const right = done && i === T.right;
        const isNew = fresh && (i === state.picked);
        return h('button', { type: 'button', class: 'answer' + (isNew ? ' is-new' : ''), 'data-verdict': right ? 'right' : wrong ? 'wrong' : null, disabled: wrong || done, onclick: () => pick(i) },
          h('span', { class: 'answer-key', 'aria-hidden': 'true' }, right ? icon('check') : wrong ? icon('cross') : String.fromCharCode(65 + i)),
          h('span', { class: 'answer-text' }, text, (right || wrong) && h('span', { class: 'verdict', text: right ? 'Right' : 'Not this one' })));
      });
      const had = $('.ti', tiSlot);
      const block = h('section', { class: 'ti', 'data-state': stage.ti, 'aria-labelledby': 'ti-q' },
        h('p', { class: 'ti-kicker', text: 'Test intuition' }),
        h('h3', { class: 'ti-q', id: 'ti-q', text: T.q }),
        h('div', { class: 'answers', role: 'group', 'aria-label': 'Answers' }, answers));
      tiSlot.replaceChildren(block);
      if (!had && fresh) play(block, 'is-rising', 700);
      if (done && fresh) { play(amountsEl, 'is-cheering', 1000); announce('Right'); }
    }

    // Tall stacks, or the same blocks lying down when the question or the keyboard needs the room.
    function setLay() {
      const lay = el.hasAttribute('data-ti') || short.matches ? 'flat' : 'tall';
      if (amountsEl.dataset.lay !== lay) {
        amountsEl.dataset.lay = lay;
        // lying down, each bar keeps its own legend beside its total; standing, the ledger sits under both stacks
        for (const side of SIDES) { if (lay === 'flat') heads[side].insertBefore(legends[side], wells[side]); else ledger.append(legends[side]); }
        pitch();
      }
      return lay;
    }
    // One dot a step: the floor is the scale.
    const unit = Math.min(...Object.values(links).map((l) => Math.abs(l.gain * l.control.step)), def.max / 8);
    function pitch() {
      const box = wells.left.getBoundingClientRect();
      if (!box.height) return;
      size.w = box.width; size.h = box.height; size.flat = amountsEl.dataset.lay === 'flat';
      for (const k in names) size.name[k] = names[k].getBoundingClientRect().width || size.name[k];
      stageEl.style.setProperty('--pitch', (box.height / (def.max / unit)).toFixed(3) + 'px');
      draw();
    }
    const sized = new ResizeObserver(pitch);
    sized.observe(amountsEl);
    document.fonts?.ready.then(pitch);

    numbers(false);
    draw();
    if (morph) run();

    return {
      id, el, def, amountsEl, controls, title, save,
      fractions, setValues, setHand, setQuestion,
      light(on, how) {
        if (on) amountsEl.dataset.lit = how; else delete amountsEl.dataset.lit;
        for (const k in blocks) { blocks[k].classList.toggle('is-lit', !!on && on.has(k)); rows[k].classList.toggle('is-lit', !!on && on.has(k)); }
        for (const c of def.controls) controlEls[c.key].classList.toggle('is-lit', !!on && moved(c).some((k) => on.has(k)));
      },
      land(wait = 0) { amountsEl.style.setProperty('--wait', wait + 'ms'); play(amountsEl, 'is-landing', 1300 + wait); },
      rise(wait = 0) { for (const part of [controls, save]) { part.style.setProperty('--wait', wait + 'ms'); play(part, 'is-rising', 800 + wait); } },
      setLay, lay: () => amountsEl.dataset.lay,
      stop() { if (raf) cancelAnimationFrame(raf); raf = 0; if (drag) dragEnd({}); sized.disconnect(); },
    };
  }

  function pick(i) {
    const right = i === P.testIntuition.right;
    state.picked = i;
    if (!right) { state.wrongs.add(i); state.slip = i; }
    if (!right && Look.moment === 7) render(7, 7); else Look.go(right ? 8 : 7);
  }

  // ------------------------------------------------------------------------------------------
  // What to keep
  // ------------------------------------------------------------------------------------------
  function summary() {
    const own = h('div', { class: 'own' });
    const save = noteButton('summary', () => ({ kind: 'End of the Lesson', title: 'What to keep', points: P.keep, own: true }), (on) => { state.editing = on; paintOwn(true); });
    function paintOwn(focus) {
      if (!saved.has('summary')) { own.replaceChildren(); return; }
      if (state.editing) {
        const input = h('input', { type: 'text', id: 'own-line', value: state.noteLine, placeholder: "Borrowing doesn't change what's left for me.", oninput: (e) => { state.noteLine = e.target.value; } });
        const done = () => { state.noteLine = input.value.trim(); state.editing = false; paintOwn(true); announce(state.noteLine ? 'Your line was added to the Note' : 'Saved to Notes'); };
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); done(); } });
        own.replaceChildren(
          h('label', { class: 'own-label', for: 'own-line' }, 'Add a line of your own ', h('span', { text: '(optional)' })),
          h('div', { class: 'own-row' }, h('span', { class: 'field' }, input), btn('btn tonal own-done', 'Done', done)));
        if (focus) play(own, 'is-swapping', 400);
      } else {
        const edit = btn('btn ghost own-edit', state.noteLine ? 'Change' : 'Add a line of your own', () => { state.editing = true; paintOwn(); $('#own-line')?.focus(); });
        own.replaceChildren(state.noteLine
          ? h('div', { class: 'own-kept' }, h('p', {}, h('small', { text: 'Your own line, saved with this Note' }), state.noteLine), edit)
          : edit);
        if (focus) play(own, 'is-swapping', 400);
      }
    }
    paintOwn();
    const finish = btn('btn primary finish', '', () => { state.finished = true; paintFinish(); announce('Lesson finished'); });
    function paintFinish() {
      finish.disabled = state.finished;
      finish.replaceChildren(...(state.finished ? [icon('check'), h('span', { text: 'Lesson finished' })] : [h('span', { text: `Finish · Next: ${P.lesson.next}` }), icon('go')]));
    }
    paintFinish();
    return h('div', { class: 'keep' },
      h('header', { class: 'w-head' }, h('h2', { class: 'w-title', text: 'What to keep' }), save),
      h('ol', { class: 'keep-list' }, P.keep.map((line) => h('li', {}, h('p', { text: line })))),
      h('div', { class: 'keep-foot' }, own, finish));
  }

  // ------------------------------------------------------------------------------------------
  // Tabs and the Widget in front
  // ------------------------------------------------------------------------------------------
  function renderTabs(fresh) {
    const ids = state.open;
    tabsEl.replaceChildren(...ids.map((id, i) => {
      const on = id === state.front;
      const tab = btn('tab' + (fresh === id ? ' is-new' : ''), [h('span', { text: TAB_NAME[id] }), id === 'built' && h('span', { class: 'tab-tag', text: 'Built for you' })],
        () => { bringFront(id, 'handover'); $('[aria-selected="true"]', tabsEl)?.focus(); },
        { role: 'tab', id: 'tab-' + id, 'aria-selected': String(on), 'aria-controls': 'widget-panel', tabindex: on ? 0 : -1, 'aria-label': id === 'lesson' ? `The Lesson's Widget: ${TAB_NAME[id]}` : null });
      tab.addEventListener('keydown', (e) => {
        const to = { ArrowRight: (i + 1) % ids.length, ArrowLeft: (i - 1 + ids.length) % ids.length, Home: 0, End: ids.length - 1 }[e.key];
        if (to === undefined) return;
        e.preventDefault();
        bringFront(ids[to], 'handover');
        $('[aria-selected="true"]', tabsEl)?.focus();
      });
      return tab;
    }));
    panel.setAttribute('aria-labelledby', 'tab-' + state.front);
    $('[aria-selected="true"]', tabsEl)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    tabsMore();
  }
  // The tab strip fades at the edge it scrolls under, when there is more than fits.
  function tabsMore() {
    const last = tabsEl.lastElementChild;
    tabsEl.toggleAttribute('data-more', !!last && last.getBoundingClientRect().right > tabsEl.getBoundingClientRect().right + 2);
  }
  tabsEl.addEventListener('scroll', tabsMore, { passive: true });
  addEventListener('resize', tabsMore);

  // how: 'still' (no motion), 'enter' (first sight), 'handover' (a tab was pressed), 'assemble' (the Chatbot just built it)
  function bringFront(id, how, was) {
    const before = state.front;
    if (!state.open.includes(id)) state.open.push(id);
    const same = before === id && !!panel.firstChild && how !== 'still' && how !== 'enter';
    state.front = id;
    renderTabs(how === 'assemble' ? id : null);
    markCurrent();
    if (same) return;
    if (sticky) tapLight(null);
    const layNext = (state.stage.ti && id === 'lesson') || short.matches ? 'flat' : 'tall';
    const from = inst && id !== 'summary' && how === 'handover' && inst.lay() === layNext ? inst.fractions() : null;
    inst?.stop();
    watch.disconnect();
    if (id === 'summary') {
      inst = null;
      const view = summary();
      panel.replaceChildren(view);
      if (how !== 'still') play(view, 'is-swapping', 500);
    } else {
      const keep = was?.[id];                       // the values this Widget showed a moment ago
      if (keep) { const now = state.values[id]; state.values[id] = { ...keep }; inst = instrument(id, { from }); state.values[id] = now; }
      else inst = instrument(id, { from });
      inst.setHand(state.stage, false);
      inst.setQuestion(state.stage, false);
      panel.replaceChildren(inst.el);
      if (how === 'assemble') { inst.land(120); inst.rise(520); play(inst.title, 'is-swapping', 400); }
      else if (how === 'enter') { inst.land(0); }
      else if (how === 'handover') { play(inst.title, 'is-swapping', 400); if (!from) inst.land(0); inst.rise(60); }
      observeParts();
    }
    panel.scrollTop = 0;
    paintJump();
  }

  // With the keyboard up the panel scrolls: one press takes you to the question and back.
  function paintJump() {
    const on = !!inst && inst.el.hasAttribute('data-ti');
    jump.hidden = !(on && short.matches);
    jump.textContent = panel.scrollTop < 8 ? 'Test intuition ↓' : 'Widget ↑';
    tabsMore();
  }
  jump.addEventListener('click', () => {
    const q = $('.ti', panel);
    const smooth = calm.matches ? 'auto' : 'smooth';
    if (panel.scrollTop < 8 && q) panel.scrollTo({ top: q.offsetTop - 8, behavior: smooth }); else panel.scrollTo({ top: 0, behavior: smooth });
  });
  panel.addEventListener('scroll', paintJump, { passive: true });
  short.addEventListener('change', () => { inst?.setLay(); paintJump(); });

  // ------------------------------------------------------------------------------------------
  // A Widget being built. The prototype bar hides and shows the [data-build-part] pieces;
  // this watches them, shows the plan while they are away, and lands each piece as it arrives.
  // ------------------------------------------------------------------------------------------
  const hiddenParts = new WeakSet();
  const watch = new MutationObserver((records) => {
    if (!inst) return;
    const shown = new Set();
    for (const r of records) {
      const part = r.target;
      if (part === inst.title || part.parentNode === inst.title) { inst.title.classList.toggle('is-building', /^Building/.test(inst.title.textContent)); continue; }
      if (!part.dataset?.buildPart) continue;
      const hide = part.style.visibility === 'hidden';
      if (hide && !hiddenParts.has(part)) { hiddenParts.add(part); part.classList.remove('is-landing', 'is-rising'); }
      if (!hide && hiddenParts.has(part)) { hiddenParts.delete(part); shown.add(part); }
    }
    const away = $$('[data-build-part]', inst.el).filter((p) => hiddenParts.has(p)).map((p) => p.dataset.buildPart);
    if (away.length) inst.el.setAttribute('data-building', [...new Set(away)].join(' ')); else inst.el.removeAttribute('data-building');
    if (shown.has(inst.amountsEl)) inst.land(0);
    if (shown.has(inst.controls)) inst.rise(shown.has(inst.amountsEl) ? 260 : 0);
  });
  function observeParts() {
    if (!inst) return;
    for (const part of $$('[data-build-part]', inst.el)) watch.observe(part, { attributes: true, attributeFilter: ['style'] });
    watch.observe(inst.title, { childList: true, characterData: true, subtree: true });
  }

  // ------------------------------------------------------------------------------------------
  // A moment
  // ------------------------------------------------------------------------------------------
  function render(n, prev) {
    const m = P.moments[n - 1];
    const stage = m.stage;
    const was = { lesson: { ...state.values.lesson }, built: { ...state.values.built } };
    const first = state.stage === null;
    const frontBefore = state.front;
    state.moment = n;
    state.stage = stage;
    state.values = { lesson: { ...stage.lesson }, built: { ...stage.built } };
    state.open = [...stage.open];

    // Which answers are marked. Stepping keeps what the Student picked; a direct visit shows the script's pick.
    if (n < 7) { state.wrongs.clear(); state.picked = null; state.slip = null; }
    if (n === 7 && ![5, 6, 7].includes(prev)) { state.wrongs = new Set([stage.wrong]); state.picked = state.slip = stage.wrong; }
    if (n === 8 && prev !== 7) { state.wrongs = new Set([stage.wrong]); state.slip = stage.wrong; }
    if (n === 8) state.picked = P.testIntuition.right;
    if (n === 9) { if (!saved.has('summary')) saved.set('summary', { kind: 'End of the Lesson', title: 'What to keep', points: P.keep, own: true }); state.editing = true; state.finished = false; }

    renderProgress(stage);
    countNotes(!first);
    renderChat(n, prev);

    const id = stage.focus;
    const stepped = prev !== null && !first;
    if (!stepped || calm.matches) {
      bringFront(id, first && !calm.matches ? 'enter' : 'still');
      inst?.setHand(stage, false);
      inst?.setQuestion(stage, false);
    } else if (frontBefore === id && inst && id !== 'summary') {
      // The same Widget stays in front: its amounts move to this moment's numbers by themselves.
      state.front = id;
      renderTabs(null);
      markCurrent();
      inst.setQuestion(stage, true);
      inst.setHand(stage, true);
      inst.setValues(state.values[id], { hand: !!stage.changed, force: true });
      paintJump();
    } else {
      const built = id === 'built' && !P.moments[prev - 1]?.stage.open.includes('built') && prev < n;
      bringFront(id, built ? 'assemble' : 'handover', was);
      if (inst) {
        inst.setQuestion(stage, true);
        inst.setHand(stage, true);
        // It arrives showing what it showed before; then the Chatbot's hand, if any, moves it.
        const next = state.values[id];
        setTimeout(() => { if (inst && inst.id === id && state.moment === n) inst.setValues(next, { hand: !!stage.changed, force: true }); }, stage.changed ? 380 : 0);
      }
    }
    if (stage.changed && stepped) announce('The Chatbot set ' + stage.changed.what);
  }

  Look.onMoment(render);
  render(Look.moment, null);
})();
