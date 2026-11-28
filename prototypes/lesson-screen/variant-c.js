// PROTOTYPE, throwaway. Version C: the Widget is the screen.
// The Widget takes the whole stage. The Chatbot speaks in a band under it, one message at a time,
// like captions. Earlier messages are in a drawer. "I'm stuck" is one fixed button in the band.
// A built Widget opens beside the Lesson's own Widget.
(function () {
  const h = P.h;

  P.variants.C = {
    name: 'Widget as the stage',
    blurb: "The Widget fills the screen. The Chatbot speaks in the band underneath, one message at a time; earlier ones are behind “Earlier”.",
    render(app, cx) {
      const L = cx.lesson;
      const st = cx.stage;
      const prog = P.ideaStates(st);

      const topline = h('div', { class: 'C-topline' },
        h('div', { class: 'C-title' }, `${L.topic} · Lesson ${L.number} · `, h('b', { text: L.title })),
        h('div', { class: 'C-chapters' },
          h('ol', {}, prog.ideas.map((i) => h('li', { class: i.state + (i.end ? ' end' : ''), title: i.label }))),
          h('span', { text: prog.now })),
        h('button', { type: 'button', class: 'btn', text: 'Notes (3)' }));

      // With a Test intuition open only the Widget it sits in stays on the stage;
      // other Widgets wait on a shelf at the side.
      const showAll = !st.ti && st.open.length > 1;
      const ids = showAll ? st.open : [cx.focus];
      const cards = ids.map((id) => {
        const card = id === 'summary' ? P.mkSummary(cx) : P.mkWidget(id, cx, { ti: 'side' });
        if (id === cx.focus) card.classList.add('is-focus');
        return card;
      });
      const shelved = showAll ? [] : st.open.filter((id) => id !== cx.focus);
      const shelf = shelved.length > 0 && h('div', { class: 'C-shelf' },
        shelved.map((id) => h('button', { type: 'button', class: 'C-shelfchip', onclick: () => cx.setFocus(id) },
          h('span', { class: 'glyph', text: '▣' }),
          h('b', { text: id === 'lesson' ? "The Lesson's Widget" : P.defs[id].short }),
          id === 'built' && h('span', { class: 'w-tag', text: 'Built for you' }),
          h('small', { text: 'Tap to bring back' }))));
      const stage = h('div', { class: 'C-stage' }, topline, h('div', { class: 'C-floor' }, cards, shelf));

      // The band shows only the Chatbot's latest message (and what the Student just said or pressed).
      let i = cx.items.length - 1;
      while (i > 0 && !['bot', 'thinking'].includes(cx.items[i].t)) i--;
      const say = cx.items[i];
      const before = cx.items[i - 1];
      const you = before && (before.t === 'me' || before.t === 'act') ? before : null;

      const band = h('div', { class: 'C-band' },
        h('button', { type: 'button', class: 'btn dark', text: '‹ Earlier', onclick: () => cx.toggleDrawer() }),
        h('div', { class: 'C-cap' },
          you && h('div', { class: 'C-you', text: you.t === 'me' ? `You: “${you.text}”` : you.text }),
          P.mkItem(say, cx, { who: false })),
        h('form', { class: 'C-ask', onsubmit: (e) => { e.preventDefault(); cx.next(); } },
          h('input', { type: 'text', placeholder: 'Ask, or answer', 'aria-label': 'Message the Chatbot' }),
          h('button', { type: 'submit', class: 'btn solid', text: 'Send' })),
        P.stuckBtn(cx));

      const drawer = cx.ui.drawer && h('aside', { class: 'C-drawer' },
        h('header', {}, h('b', { text: 'Earlier in this Lesson' }),
          h('button', { type: 'button', class: 'btn', text: 'Close', onclick: () => cx.toggleDrawer() })),
        h('div', { class: 'C-drawer-list' }, cx.items.map((it) => {
          if (it.t === 'use') return null;
          if (it.t === 'widget') return h('div', { class: 'it-act', text: `▣ Widget: ${P.defs[it.w].short}` });
          if (it.t === 'summary') return h('div', { class: 'it-act', text: '▣ What to keep' });
          return P.mkItem(it, cx);
        })));

      app.append(h('div', { class: 'C' }, stage, band, drawer));
    },
  };
})();
