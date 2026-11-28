// PROTOTYPE tooling, throwaway. The two "Replay Widget arrival" buttons in the prototype bar, for any look listed in looks.js.
//   node tools/arrival.mjs <chrome|firefox> <look> [<look>...]
// Passes when: the bar offers the replays at moment 3; both start hidden with "Building…" in the title;
// "Piece by piece" shows the amounts before the controls and "All at once" does not; both end complete;
// a replay cut short by moving on leaves nothing hidden or inert.
import assert from 'node:assert/strict';
import { open, sleep, ROOT } from './cdp.mjs';
import { openFirefox } from './firefox.mjs';
import { pathToFileURL } from 'node:url';
const [engine = 'chrome', ...slugs] = process.argv.slice(2);
const p = engine === 'chrome' ? await open() : await openFirefox();
const read = () => p.frameEval(`({
  title: document.querySelector('[data-pane="widget"] h2').textContent,
  chart: [...document.querySelectorAll('[data-build-part=amounts]')].every(e => !e.inert && getComputedStyle(e).visibility === 'visible'),
  ready: !document.querySelector('input[type=range]').closest('[inert]'),
  count: document.querySelectorAll('[data-build-part=amounts]').length
})`);
const click = (id) => p.eval('document.getElementById(' + JSON.stringify(id) + ').click()');
let failed = 0;
try {
  await p.size(1500, 1000);
  for (const slug of slugs) {
    try {
      await p.goto(pathToFileURL(ROOT + '/index.html').href + '?screen=ipad&moment=3&look=' + slug, 500);
      assert.equal(await p.eval('P.state.look'), slug, 'the bar does not know this look (looks.js)');
      assert.equal(await p.eval('document.getElementById("arrival-preview").hidden'), false);
      for (const mode of ['pieces', 'whole']) {
        await click('arrival-' + mode);
        await sleep(120);
        const initial = await read();
        assert.ok(initial.count && !initial.chart && !initial.ready && initial.title.includes('Building'), JSON.stringify(initial));
        const samples = [];
        const deadline = Date.now() + 6000;
        while (Date.now() < deadline) {
          await sleep(80);
          const state = await read();
          samples.push(state);
          if (state.chart && state.ready) break;
        }
        const staged = samples.some((s) => s.chart && !s.ready && s.title.includes('wears out'));
        assert.equal(staged, mode === 'pieces', JSON.stringify({ slug, mode, samples }));
        const end = samples.at(-1);
        assert.ok(end.chart && end.ready && end.title.includes('wears out'), JSON.stringify(end));
      }
      await click('arrival-whole'); await sleep(60); await click('arrival-pieces'); await sleep(70);
      await click('m-next'); await sleep(1700);
      assert.equal(await p.frameEval('Number(new URLSearchParams(location.search).get("moment"))'), 4);
      assert.ok((await p.frameEval('document.querySelector(\'[data-pane="chat"]\').innerText')).includes('Starbucks'));
      assert.equal(await p.frameEval('document.querySelectorAll("[inert]").length'), 0);
      assert.equal(await p.eval('document.getElementById("arrival-preview").hidden'), true);
      console.log('PASS', engine, slug, 'arrival: timing, replay and moving on mid-build');
    } catch (e) {
      failed++;
      console.log('FAIL', engine, slug, String(e.message).slice(0, 700));
    }
  }
  if (p.errors.length) { failed++; console.log('PAGE ERRORS', JSON.stringify(p.errors).slice(0, 900)); }
} finally { await p.close(); }
process.exitCode = failed ? 1 : 0;
