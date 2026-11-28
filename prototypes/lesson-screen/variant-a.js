// PROTOTYPE, throwaway. Version A: two panes.
// Chatbot on the left, the Widget fixed on the right. Only the conversation scrolls.
// "I'm stuck" sits beside the message box. A built Widget opens as a tab on the right.
(function () {
  const h = P.h;

  P.variants.A = {
    name: 'Two panes',
    blurb: 'Chatbot left, Widget fixed on the right. Only the conversation scrolls. Drag the line between them to change the split.',
    render(app, cx) {
      const L = cx.lesson;
      const st = cx.stage;
      const prog = P.ideaStates(st);

      const top = h('header', { class: 'A-top' },
        h('div', { class: 'where' },
          h('span', { text: `${L.topic} · Lesson ${L.number}` }),
          h('b', { text: L.title })),
        h('div', { class: 'ideas' },
          h('ol', {}, prog.ideas.map((i) => h('li', { class: i.state + (i.end ? ' end' : ''), title: i.label }))),
          h('span', { text: prog.now })),
        h('button', { type: 'button', class: 'btn', text: 'Notes (3)' }));

      // Left: the conversation. Widgets show up here only as a pointer to the right.
      const chip = (id) => h('button', { type: 'button', class: 'A-chip', onclick: () => cx.setFocus(id) },
        h('span', { class: 'glyph', text: '▣' }),
        h('span', {}, 'On the right: ', h('b', { text: id === 'summary' ? 'What to keep' : P.defs[id].short })),
        id === 'built' && h('span', { class: 'w-tag', text: 'Built for you' }));

      const scroll = h('div', { class: 'A-scroll' });
      let firstNew = null;
      for (const it of cx.items) {
        if (it.t === 'use') continue;
        const el = it.t === 'widget' ? chip(it.w) : it.t === 'summary' ? chip('summary') : P.mkItem(it, cx);
        if (it.fresh && !firstNew) firstNew = el;
        scroll.append(el);
      }

      const compose = h('form', { class: 'A-compose', onsubmit: (e) => { e.preventDefault(); cx.next(); } },
        P.stuckBtn(cx),
        h('input', { type: 'text', placeholder: 'Ask, or answer the Chatbot', 'aria-label': 'Message the Chatbot' }),
        h('button', { type: 'submit', class: 'btn solid', text: 'Send' }));

      const chat = h('section', { class: 'A-chat' }, scroll, compose);

      // Right: the Widget stage. It never scrolls.
      const tabs = st.open.length > 1 && h('div', { class: 'A-tabs' },
        st.open.map((id) => h('button', {
          type: 'button', class: 'A-tab' + (id === cx.focus ? ' on' : ''), onclick: () => cx.setFocus(id),
        }, id === 'lesson' ? "The Lesson's Widget" : 'Built for you: ' + P.defs[id].short)));
      const card = cx.focus === 'summary' ? P.mkSummary(cx) : P.mkWidget(cx.focus, cx, { ti: 'below' });
      const stage = h('section', { class: 'A-stage' }, tabs, card);

      // The line between the panes can be dragged, to find the right proportions.
      const label = h('span', { class: 'A-split' });
      const divider = h('div', { class: 'A-divider', role: 'separator', 'aria-orientation': 'vertical', title: 'Drag to change the split' }, label);
      const main = h('div', { class: 'A-main' }, chat, divider, stage);
      const paint = () => {
        main.style.setProperty('--split', cx.state.split + '%');
        label.textContent = `↔ ${cx.state.split} / ${100 - cx.state.split}`;
      };
      paint();
      divider.addEventListener('pointerdown', (e) => {
        divider.setPointerCapture(e.pointerId);
        divider.classList.add('drag');
        const move = (ev) => {
          const r = main.getBoundingClientRect();
          cx.state.split = Math.round(Math.min(60, Math.max(26, ((ev.clientX - r.left) / r.width) * 100)));
          paint();
          cx.changed();
        };
        const up = () => {
          divider.classList.remove('drag');
          divider.removeEventListener('pointermove', move);
          divider.removeEventListener('pointerup', up);
        };
        divider.addEventListener('pointermove', move);
        divider.addEventListener('pointerup', up);
      });

      app.append(h('div', { class: 'A' }, top, main));
      P.anchor(scroll, firstNew);
    },
  };
})();
