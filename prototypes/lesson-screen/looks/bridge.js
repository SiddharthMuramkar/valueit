// PROTOTYPE, throwaway. The link between the prototype bar (the page around the screen) and one look
// (the page inside the screen). A look also runs on its own: open looks/<name>/index.html?moment=3.
//
//   Look.moment            which of the nine moments is showing, 1 to 9
//   Look.onMoment(fn)      fn(moment, previousMoment) runs whenever the moment changes, from the bar or from the look
//   Look.go(n)             the look itself moves to moment n (Send, "I'm stuck", an answer, "Go on")
//   Look.count             9
//
// Up and down arrows change the moment, left and right change the look; inside a text box or on a slider
// the keys are left alone.
(function () {
  const N = 9;
  const clamp = (n) => Math.min(N, Math.max(1, parseInt(n, 10) || 1));
  const framed = window.parent !== window;
  const subs = new Set();
  let moment = clamp(new URLSearchParams(location.search).get('moment'));
  let stopPreview;

  // Both previews simulate the same build time. Every exposed amount comes from the
  // same complete model, so the two sides of a partly revealed chart still agree.
  function replayArrival(mode) {
    if (moment !== 3 || !['pieces', 'whole'].includes(mode)) return;
    stopPreview?.();
    subs.forEach((fn) => fn(moment, null));
    const pane = document.querySelector('[data-pane="widget"]');
    const title = pane?.querySelector('h2');
    if (!title) return;
    const parts = [...pane.querySelectorAll('[data-build-part]')];
    const originalTitle = title.textContent;
    const timers = [];
    const show = (part) => { part.style.removeProperty('visibility'); part.inert = false; };
    function finish() {
      timers.forEach(clearTimeout);
      title.textContent = originalTitle;
      parts.forEach(show);
      stopPreview = null;
    }
    stopPreview = finish;
    title.textContent = 'Building the Widget…';
    for (const part of parts) { part.style.visibility = 'hidden'; part.inert = true; }
    if (mode === 'pieces') {
      timers.push(setTimeout(() => { title.textContent = originalTitle; }, 300));
      timers.push(setTimeout(() => parts.filter(p => p.dataset.buildPart === 'amounts').forEach(show), 900));
    }
    timers.push(setTimeout(finish, 1600));
  }

  const tell = (msg) => { if (framed) window.parent.postMessage({ source: 'valueit-look', ...msg }, '*'); };

  function set(n, fromBar) {
    n = clamp(n);
    if (n === moment) return;
    stopPreview?.();
    const prev = moment;
    moment = n;
    try {
      const p = new URLSearchParams(location.search);
      p.set('moment', n);
      history.replaceState(null, '', '?' + p);
    } catch (e) { /* some browsers refuse on file:// */ }
    subs.forEach((fn) => fn(moment, prev));
    if (!fromBar) tell({ type: 'moment', moment });
  }

  window.addEventListener('message', (e) => {
    const d = e.data;
    if (!framed || e.source !== window.parent || d?.source !== 'valueit-bar') return;
    if (d.type === 'moment') set(d.moment, true);
    if (d.type === 'arrival') replayArrival(d.mode);
  });

  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    const t = e.target;
    if (t && t.closest && t.closest('input, textarea, select, [contenteditable], [role=slider], [role=radiogroup], [role=tablist]')) return;
    if (framed) tell({ type: 'key', key: e.key });
    else if (e.key === 'ArrowUp') set(moment === 1 ? N : moment - 1);
    else if (e.key === 'ArrowDown') set(moment === N ? 1 : moment + 1);
    else return;
    e.preventDefault();
  });

  window.Look = {
    count: N,
    framed,
    get moment() { return moment; },
    onMoment(fn) { subs.add(fn); return () => subs.delete(fn); },
    go(n) { set(n, false); },
  };

  tell({ type: 'ready', moment });
})();
