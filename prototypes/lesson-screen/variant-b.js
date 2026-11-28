// PROTOTYPE, throwaway. Version B: one stream.
// The Chatbot's words and the Widgets share a single flow down the middle of the screen.
// When the Chatbot uses a Widget again, the Widget comes back at the bottom of the stream.
// "I'm stuck" sits on the Widget itself.
(function () {
  const h = P.h;

  P.variants.B = {
    name: 'One stream',
    blurb: "Words and Widgets share one flow. Everything scrolls except the message box. A Widget the Chatbot uses again comes back at the bottom.",
    render(app, cx) {
      const L = cx.lesson;
      const st = cx.stage;
      const prog = P.ideaStates(st);

      const top = h('header', { class: 'B-top' },
        h('div', { class: 'where' },
          h('span', { text: `${L.topic} · Lesson ${L.number}` }),
          h('b', { text: L.title })),
        h('button', { type: 'button', class: 'btn', text: 'Notes (3)' }));

      const rail = h('nav', { class: 'B-rail', 'aria-label': 'Ideas in this Lesson' },
        h('ol', {}, prog.ideas.map((i) => h('li', { class: i.state }, h('span', { text: i.label })))));

      // Each Widget is live only where it was last used; earlier places keep a one-line stub.
      const live = {};
      let lastWidget = -1;
      cx.items.forEach((it, i) => {
        if (it.t === 'widget' || it.t === 'use') { live[it.w] = i; lastWidget = i; }
      });

      const col = h('div', { class: 'B-col' });
      col.append(h('div', { class: 'B-stub', text: 'Idea 1 of 4 · What the cart owns · done · scroll up to look again' }));
      let firstNew = null;
      cx.items.forEach((it, i) => {
        let el;
        if (it.t === 'widget' || it.t === 'use') {
          el = live[it.w] === i
            ? P.mkWidget(it.w, cx, { ti: 'below', stuck: i === lastWidget })
            : h('div', { class: 'B-stub', text: `▣ ${P.defs[it.w].short} · moved down ↓` });
        } else if (it.t === 'summary') {
          el = P.mkSummary(cx);
        } else {
          el = P.mkItem(it, cx, { who: false });
        }
        if (it.fresh && !firstNew) firstNew = el;
        col.append(el);
      });
      const scroll = h('div', { class: 'B-scroll' }, col);

      const compose = h('form', { class: 'B-compose', onsubmit: (e) => { e.preventDefault(); cx.next(); } },
        h('div', {},
          h('input', { type: 'text', placeholder: 'Ask, or answer the Chatbot', 'aria-label': 'Message the Chatbot' }),
          h('button', { type: 'submit', class: 'btn solid', text: 'Send' })));

      app.append(h('div', { class: 'B' }, top, h('div', { class: 'B-body' }, rail, scroll), compose));
      P.anchor(scroll, firstNew);
    },
  };
})();
