// PROTOTYPE, throwaway. The made-up Widgets and the small pieces every version reuses
// (a Widget card, the Test intuition block, one conversation item, the Note button).
// How these pieces are laid out on the screen is each version's own business.
(function () {
  const h = P.h;
  const fmt = (n) => n.toLocaleString('en-US');

  P.defs = {
    lesson: {
      title: "Maya's coffee cart: what it owns and owes",
      short: 'The cart: owns and owes',
      max: 16000,
      controls: [
        { key: 'loan', label: 'Bank loan, spent on a coffee machine', min: 0, max: 8000, step: 1000 },
        { key: 'own', label: "Maya's own money put in", min: 4000, max: 8000, step: 1000 },
      ],
      // Each side is listed from the bottom of the bar upwards.
      model: (s) => ({
        left: [
          { k: 'cash', label: 'Cash', v: s.own - 4000 },
          { k: 'cart', label: 'Cart', v: 4000 },
          { k: 'machine', label: 'Coffee machine', v: s.loan },
        ],
        right: [
          { k: 'equity', label: 'Left for Maya', v: s.own },
          { k: 'owes', label: 'Owes the bank', v: s.loan },
        ],
      }),
    },
    built: {
      title: 'The machine wears out',
      short: 'The machine wears out',
      max: 12000,
      controls: [{ key: 'years', label: 'Years of use', min: 0, max: 5, step: 1 }],
      model: (s) => ({
        left: [
          { k: 'cash', label: 'Cash', v: 2000 },
          { k: 'cart', label: 'Cart', v: 4000 },
          { k: 'machine', label: 'Coffee machine', v: 5000 - 1000 * s.years },
        ],
        right: [
          { k: 'equity', label: 'Left for Maya', v: 6000 - 1000 * s.years },
          { k: 'owes', label: 'Owes the bank', v: 5000 },
        ],
      }),
    },
  };

  // The chart and its sliders. Dragging a slider only redraws the bars: no Chatbot call.
  P.mkBody = function (id, stage) {
    const def = P.defs[id];
    const s = P.ws[id];
    const body = h('div', { class: 'wb' });
    if (stage.changed && stage.changed.w === id) {
      body.append(h('div', { class: 'wb-changed', text: 'The Chatbot set ' + stage.changed.what }));
    }

    const cols = {};
    const mkCol = (side, title) => {
      const total = h('b');
      const spacer = h('div', { class: 'seg-space' });
      const stack = h('div', { class: 'stack' }, spacer);
      const segs = {};
      const first = def.model(s)[side];
      for (const part of [...first].reverse()) {
        segs[part.k] = h('div', { class: 'seg seg-' + part.k });
        stack.append(segs[part.k]);
      }
      cols[side] = { total, spacer, segs };
      return h('div', { class: 'col' }, h('div', { class: 'col-h' }, title + ' ', total), stack);
    };
    const bars = h('div', { class: 'bars' },
      mkCol('left', 'Owns'),
      h('div', { class: 'eq', text: '=' }),
      mkCol('right', "Owes + what's left"));

    const update = () => {
      const m = def.model(s);
      for (const side of ['left', 'right']) {
        const c = cols[side];
        const total = m[side].reduce((a, p) => a + p.v, 0);
        c.total.textContent = fmt(total);
        c.spacer.style.flexGrow = def.max - total;
        for (const p of m[side]) {
          const seg = c.segs[p.k];
          seg.style.flexGrow = p.v;
          seg.textContent = `${p.label} ${fmt(p.v)}`;
          seg.classList.toggle('tiny', p.v / def.max < 0.06);
        }
      }
    };

    const ctl = h('div', { class: 'ctl' });
    for (const c of def.controls) {
      const val = h('b', { text: fmt(s[c.key]) });
      const input = h('input', { type: 'range', min: c.min, max: c.max, step: c.step, value: s[c.key], 'aria-label': c.label });
      input.addEventListener('input', () => {
        s[c.key] = +input.value;
        val.textContent = fmt(s[c.key]);
        update();
      });
      const pointed = stage.point && stage.point.w === id && stage.point.key === c.key;
      ctl.append(h('label', { class: 'ctl-row' + (pointed ? ' pointed' : '') },
        h('span', { text: c.label }), val, input,
        pointed && h('em', { text: 'The Chatbot is pointing here' })));
    }

    body.append(bars, ctl);
    update();
    return body;
  };

  // Test intuition: one question, four answers, shown inside the Widget.
  P.mkTI = function (cx) {
    const T = P.testIntuition;
    const st = cx.stage;
    const answers = T.answers.map((text, i) => {
      const wrong = (st.ti === 'wrong' || st.ti === 'right') && st.wrong === i;
      const right = st.ti === 'right' && i === T.right;
      return h('button', {
        type: 'button',
        class: wrong ? 'is-wrong' : right ? 'is-right' : '',
        disabled: wrong || st.ti === 'right',
        onclick: () => cx.pick(i),
      }, text, wrong && h('small', { text: 'Not this one' }), right && h('small', { text: 'Right' }));
    });
    return h('div', { class: 'ti', 'data-state': st.ti },
      h('div', { class: 'ti-k', text: 'Test intuition' }),
      h('p', { class: 'ti-q', text: T.q }),
      h('div', { class: 'ti-a' }, answers));
  };

  // "Save as Note" button. `saved` starts it in its saved state.
  P.noteBtn = function (cx, key, o = {}) {
    const btn = h('button', { type: 'button', class: 'btn note-btn' + (o.mini ? ' mini' : '') });
    const paint = () => { btn.textContent = cx.ui.saved[key] ? 'Saved to Notes ✓' : 'Save as Note'; };
    if (o.saved) cx.ui.saved[key] = true;
    btn.addEventListener('click', () => { cx.ui.saved[key] = !cx.ui.saved[key]; paint(); });
    paint();
    return btn;
  };

  // After saving, a strip opens inside the card for the Student's own optional line.
  P.noteStrip = () => h('div', { class: 'note-strip' },
    h('b', { text: 'Saved to your Notes.' }),
    h('label', {}, h('span', { text: 'Add a line of your own (optional)' }),
      h('input', { type: 'text', value: "Borrowing doesn't change what's left for me." })),
    h('button', { type: 'button', class: 'btn solid', text: 'Done' }));

  P.stuckBtn = (cx) => h('button', { type: 'button', class: 'btn stuck-btn', text: "I'm stuck", onclick: () => cx.stuck() });

  // A Widget card. o.ti: 'below' | 'side' (where the Test intuition sits), o.stuck: button on the Widget.
  P.mkWidget = function (id, cx, o = {}) {
    const def = P.defs[id];
    const ti = o.ti && cx.stage.ti && id === 'lesson' ? o.ti : null;
    return h('section', { class: `w w-${id}`, 'data-ti': ti },
      h('header', { class: 'w-h' },
        h('span', { class: 'w-t', text: def.title }),
        id === 'built' && h('span', { class: 'w-tag', text: 'Built for you' }),
        P.noteBtn(cx, 'w:' + id)),
      h('div', { class: 'w-main' }, P.mkBody(id, cx.stage), ti && P.mkTI(cx)),
      o.stuck && h('footer', { class: 'w-f' },
        P.stuckBtn(cx),
        h('span', { text: 'The Chatbot sees what you have set here.' })));
  };

  // The "what to keep" summary at the end of the Lesson.
  P.mkSummary = function (cx) {
    return h('section', { class: 'w sum' },
      h('header', { class: 'w-h' },
        h('span', { class: 'w-t', text: 'What to keep' }),
        P.noteBtn(cx, 'sum', { saved: cx.stage.noteOpen })),
      cx.stage.noteOpen && P.noteStrip(),
      h('ol', { class: 'sum-list' }, P.keep.map((k) => h('li', { text: k }))),
      h('footer', { class: 'sum-f' },
        h('button', { type: 'button', class: 'btn solid', text: `Finish · Next: ${P.lesson.next} →` })));
  };

  // One conversation item. Widgets, re-uses and the summary are placed by each version itself.
  P.mkItem = function (it, cx, o = {}) {
    switch (it.t) {
      case 'divider':
        return h('div', { class: 'it-div' }, h('span', { text: it.label }));
      case 'skip':
        return h('div', { class: 'it-skip', text: '· · ·  ' + it.text + '  · · ·' });
      case 'act':
        return h('div', { class: 'it-act', text: it.text });
      case 'me':
        return h('div', { class: 'it me' }, h('div', { class: 'bub', text: it.text }));
      case 'thinking':
        return h('div', { class: 'it bot thinking' },
          o.who !== false && h('div', { class: 'who', text: 'Chatbot' }),
          h('div', { class: 'bub' },
            h('span', { class: 'dots' }, h('i'), h('i'), h('i')),
            ' Thinking. This can take half a minute. The Widget still works while you wait.'));
      case 'bot':
        return h('div', { class: 'it bot' },
          o.who !== false && h('div', { class: 'who', text: 'Chatbot' }),
          h('div', { class: 'bub', html: it.html }),
          it.source && h('div', { class: 'src' }, 'From the web: ',
            h('a', { href: '#', onclick: (e) => e.preventDefault(), text: it.source + ' ↗' })),
          (it.save || it.go) && h('div', { class: 'it-foot' },
            it.go && h('button', { type: 'button', class: 'btn solid', text: it.go + ' →', onclick: () => cx.next() }),
            it.save && P.noteBtn(cx, 'm:' + it.id, { mini: true })));
      default:
        return null;
    }
  };
})();
