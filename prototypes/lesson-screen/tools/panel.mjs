// PROTOTYPE tooling, throwaway. One fixed set of pictures of a look, for judging it by eye. Chrome only.
// Needs ImageMagick's `montage` for the seq-*.png sheets (without it the single frames are still written).
//   node tools/panel.mjs <look> <outDir> [--only stills|motion|states|bar]
// stills : m1..m9 at ipad; m1,m3,m5,m9 at laptop, laptop-s, ipad-s; keyboard-up m2,m5,m7 (+ m5 small iPad); 2x zooms.
// motion : frames while dragging the loan slider and a block; stepping through all nine moments; thinking; tab handover.
// states : hover, keyboard focus, pressed, Notes open, Note saved, wrong / right, reduced motion.
// bar    : inside the prototype bar: both "Replay Widget arrival" modes frame by frame, and keyboard-up in the bar.
// Sequences are also joined into seq-*.png sheets (frames left to right, top to bottom, time in the file names).
// report.json: page errors, which tool hooks exist, and the numbers measured on the way.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { open, lookUrl, sleep, SIZES, ROOT, args } from './cdp.mjs';

const { pos, opt } = args();
const [slug, out] = pos;
if (!slug || !out) { console.error('usage: node panel.mjs <slug> <outDir> [--only stills|motion|states|bar]'); process.exit(1); }
const want = (part) => !opt.only || String(opt.only).split(',').includes(part);
mkdirSync(out, { recursive: true });
const report = { slug, errors: {}, facts: {}, missing: [] };
const f = (name) => join(out, name);
const sheet = (name, files, tile = '3x', width = 0) => {
  // Each frame is fitted to a width that keeps the whole sheet near 2000 px across, so it stays readable.
  const across = parseInt(tile, 10) || 3;
  const w = width || Math.floor(1960 / across) - 12;
  try { execFileSync('montage', [...files, '-tile', tile, '-geometry', `${w}x+6+6`, '-background', '#30343c', f(name)]); }
  catch (e) { report.missing.push('montage failed for ' + name); }
};
const clickText = (pattern, scope = '') => `(() => {
  const norm = (s) => s.toLowerCase().replace(/[’‘]/g, "'").replace(/\\s+/g, ' ').trim();
  const root = ${JSON.stringify(scope)} ? document.querySelector(${JSON.stringify(scope)}) : document;
  const el = [...(root?.querySelectorAll('button,[role=tab],[role=button],a[href]') || [])].find((e) => e.getClientRects().length && new RegExp(${JSON.stringify(pattern)}, 'i').test(norm([e.innerText, e.getAttribute('aria-label'), e.title].filter(Boolean).join(' '))));
  if (!el) return null; el.click(); return el.outerHTML.slice(0, 100);
})()`;
const rectText = (pattern, scope = '') => `(() => {
  const norm = (s) => s.toLowerCase().replace(/[’‘]/g, "'").replace(/\\s+/g, ' ').trim();
  const root = ${JSON.stringify(scope)} ? document.querySelector(${JSON.stringify(scope)}) : document;
  const el = [...(root?.querySelectorAll('button,[role=tab],[role=button],a[href]') || [])].find((e) => e.getClientRects().length && new RegExp(${JSON.stringify(pattern)}, 'i').test(norm([e.innerText, e.getAttribute('aria-label'), e.title].filter(Boolean).join(' '))));
  if (!el) return null; el.scrollIntoView({ block: 'nearest' }); const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, width: r.width, height: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
})()`;
const blockSel = (k) => `[data-block="${k}"], .block.${k}, .segment.${k}`;

async function frames(page, prefix, times, { sheetName, clip } = {}) {
  const t0 = Date.now(), files = [];
  for (const ms of times) {
    await sleep(Math.max(0, ms - (Date.now() - t0)));
    const file = f(`${prefix}-${String(ms).padStart(4, '0')}ms.png`);
    await page.shot(file, clip ? { clip } : {}); files.push(file);
  }
  if (sheetName) sheet(sheetName, files, files.length > 4 ? '3x' : `${files.length}x`);
  return files;
}

// ---------- stills ----------
if (want('stills')) {
  const page = await open({ dpr: 1 });
  const plan = [];
  for (let m = 1; m <= 9; m++) plan.push([m, 'ipad']);
  for (const s of ['laptop', 'laptop-s', 'ipad-s']) for (const m of [1, 3, 5, 9]) plan.push([m, s]);
  for (const m of [2, 5, 7, 9]) plan.push([m, 'ipad-kb']);
  plan.push([5, 'ipad-s-kb'], [1, 'ipad-s-kb']);
  for (const [m, s] of plan) {
    await page.size(...SIZES[s]);
    await page.goto(lookUrl(slug, m), 1000);
    await page.shot(f(`m${m}-${s}.png`));
  }
  // What the page looks like at the instant it loads (should already be settled within 800ms).
  await page.size(...SIZES.ipad);
  await page.goto(lookUrl(slug, 1), 0);
  await frames(page, 'load-m1', [60, 250, 500, 800], { sheetName: 'seq-load-m1.png' });
  report.errors.stills = [...page.errors];
  report.facts.geometry = await page.eval(`(() => { const c = document.querySelector('[data-pane="chat"]'), w = document.querySelector('[data-pane="widget"]');
    return { split: +(c.getBoundingClientRect().width / innerWidth).toFixed(4), overflow: [document.documentElement.scrollWidth - innerWidth, document.documentElement.scrollHeight - innerHeight],
      fonts: [...document.fonts].map((x) => [x.family, x.weight, x.status]),
      hooks: { blocks: document.querySelectorAll('[data-block]').length, concepts: document.querySelectorAll('[data-concept]').length, totals: document.querySelectorAll('[data-total]').length, buildParts: [...document.querySelectorAll('[data-build-part]')].map((e) => e.dataset.buildPart) },
      bodyFont: getComputedStyle(document.body).fontFamily, chatSize: getComputedStyle(document.querySelector('[data-pane="chat"] p') || document.body).fontSize }; })()`);
  await page.close();
  // Sharp zooms for judging type and edges.
  const hi = await open({ dpr: 2 });
  await hi.size(...SIZES.ipad, 2);
  for (const m of [1, 3, 5, 8, 9]) { await hi.goto(lookUrl(slug, m), 1000); await hi.shot(f(`m${m}-ipad@2x.png`)); }
  await hi.close();
}

// ---------- motion ----------
if (want('motion')) {
  const page = await open({ dpr: 1 });
  await page.size(...SIZES.ipad);
  await page.goto(lookUrl(slug, 1), 1000);
  const loanSel = 'input[type=range][aria-label*="loan" i]';
  const loan = await page.rect(loanSel);
  if (loan) {
    const y = loan.cy, x0 = loan.x + 12, x1 = loan.x + loan.width * 0.64;
    await page.mouse('mouseMoved', x0, y); await page.mouse('mousePressed', x0, y);
    const files = [];
    for (let i = 1; i <= 4; i++) {
      await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x0 + ((x1 - x0) * i) / 4, y, button: 'left', buttons: 1 });
      await sleep(70);
      const file = f(`drag-loan-${i}of4-held.png`); await page.shot(file); files.push(file);
    }
    await page.release(x1, y);
    await sleep(60); files.push(f('drag-loan-5-released-060ms.png')); await page.shot(files.at(-1));
    await sleep(500); files.push(f('drag-loan-6-released-560ms.png')); await page.shot(files.at(-1));
    sheet('seq-drag-loan-slider.png', files);
    report.facts.loanAfterDrag = await page.eval(`+document.querySelector(${JSON.stringify(loanSel)}).value`);
  } else report.missing.push('no loan range input');
  // Grab a block itself.
  for (const k of ['owes', 'equity', 'cart']) {
    const b = await page.rect(blockSel(k));
    if (!b || b.height < 6) { report.missing.push('block not found or too small to grab: ' + k); continue; }
    const before = await page.eval(`[...document.querySelectorAll('input[type=range]')].filter((e) => e.offsetWidth).map((e) => +e.value)`);
    await page.hover(blockSel(k)); await sleep(250); await page.shot(f(`block-${k}-1-hover.png`));
    const dy = k === 'equity' ? -46 : 52;
    await page.drag(b.cx, b.cy, b.cx, b.cy + dy, { steps: 8, stepDelay: 22, hold: true });
    await sleep(80); await page.shot(f(`block-${k}-2-held.png`));
    await page.release(b.cx, b.cy + dy);
    await sleep(50); await page.shot(f(`block-${k}-3-released-050ms.png`));
    await sleep(550); await page.shot(f(`block-${k}-4-released-600ms.png`));
    const after = await page.eval(`[...document.querySelectorAll('input[type=range]')].filter((e) => e.offsetWidth).map((e) => +e.value)`);
    report.facts['blockDrag_' + k] = { before, after, cursor: await page.eval(`getComputedStyle(document.querySelector(${JSON.stringify(blockSel(k))})).cursor`) };
    sheet(`seq-block-${k}.png`, [1, 2, 3, 4].map((i) => f(`block-${k}-${i}-${['hover', 'held', 'released-050ms', 'released-600ms'][i - 1]}.png`)), '2x');
  }
  // Step through the Lesson the way a Student would, with frames after each press.
  await page.goto(lookUrl(slug, 1), 1000);
  const acts = [['send', 2], ['send', 3], ['send', 4], ['send', 5], ["i'm stuck", 6], ['it goes up', 7], ['it stays the same', 8], ['go on', 9]];
  report.facts.steps = [];
  for (const [pattern, to] of acts) {
    const hit = await page.eval(clickText(pattern));
    const times = to === 3 ? [80, 250, 500, 800, 1200, 1800] : [80, 250, 500, 900];
    await frames(page, `step-to-m${to}`, times, { sheetName: `seq-step-to-m${to}.png` });
    report.facts.steps.push({ pattern, hit: !!hit, moment: await page.eval('Look.moment') });
    if (to === 2) await frames(page, 'thinking', [1500, 3000, 6000], { sheetName: 'seq-thinking.png' });
  }
  // Tab handover at moment 3.
  await page.goto(lookUrl(slug, 3), 1000);
  await page.eval(clickText("lesson's widget|the lesson|lesson widget|coffee cart", '[data-pane="widget"]'));
  await frames(page, 'tab-to-lesson', [60, 180, 360, 700], { sheetName: 'seq-tab-to-lesson.png' });
  await page.eval(clickText('built for you|wears out', '[data-pane="widget"]'));
  await frames(page, 'tab-to-built', [60, 180, 360, 700], { sheetName: 'seq-tab-to-built.png' });
  report.errors.motion = [...page.errors];
  await page.close();
}

// ---------- states ----------
if (want('states')) {
  const page = await open({ dpr: 1 });
  await page.size(...SIZES.ipad);
  await page.goto(lookUrl(slug, 3), 1000);
  const concept = await page.rect('[data-concept]');
  if (concept) { await page.hover('[data-concept]'); await sleep(300); await page.shot(f('hover-concept-word.png')); } else report.missing.push('no [data-concept] word in the conversation');
  for (const [name, pattern, scope] of [['send', '^send', '[data-pane="chat"]'], ['stuck', "i'm stuck", '[data-pane="chat"]'], ['notes', '^notes', ''], ['save-note', 'save as note', '[data-pane="widget"]'], ['marker', 'on the right', '[data-pane="chat"]']]) {
    const r = await page.eval(rectText(pattern, scope));
    if (!r) { report.missing.push('control not found: ' + name); continue; }
    await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: r.cx, y: r.cy, button: 'none', buttons: 0 });
    await sleep(220); await page.shot(f(`hover-${name}.png`), { clip: { x: Math.max(0, r.x - 90), y: Math.max(0, r.y - 50), width: Math.min(420, r.width + 180), height: r.height + 100 }, scale: 2 });
    await page.mouse('mousePressed', r.cx, r.cy); await sleep(90);
    await page.shot(f(`pressed-${name}.png`), { clip: { x: Math.max(0, r.x - 90), y: Math.max(0, r.y - 50), width: Math.min(420, r.width + 180), height: r.height + 100 }, scale: 2 });
    await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 5, y: 5, button: 'left', buttons: 1 }); await page.release(5, 5); await sleep(120);
    await page.goto(lookUrl(slug, 3), 500);
  }
  // Keyboard focus: where the ring is, and what it looks like.
  await page.goto(lookUrl(slug, 5), 1000);
  const focusFiles = [];
  report.facts.tabOrder = [];
  for (let i = 1; i <= 14; i++) {
    await page.key('Tab'); await sleep(140);
    report.facts.tabOrder.push(await page.eval(`(() => { const e = document.activeElement; if (!e || e === document.body) return 'body'; return (e.getAttribute('aria-label') || e.innerText || e.placeholder || e.tagName).replace(/\\s+/g, ' ').trim().slice(0, 44) + ' <' + e.tagName.toLowerCase() + (e.type ? ':' + e.type : '') + '>'; })()`));
    const file = f(`focus-${String(i).padStart(2, '0')}.png`); await page.shot(file); focusFiles.push(file);
  }
  sheet('seq-focus-order-m5.png', focusFiles, '4x');
  // Notes sheet, saved Note.
  await page.goto(lookUrl(slug, 4), 1000);
  await page.eval(clickText('save as note', '[data-pane="widget"]')); await sleep(500); await page.shot(f('note-saved-widget.png'));
  await page.eval(clickText('save as note', '[data-pane="chat"]')); await sleep(400);
  await page.eval(clickText('^notes')); await frames(page, 'notes-open', [60, 200, 450, 900], { sheetName: 'seq-notes-open.png' });
  await page.shot(f('notes-open.png'));
  await page.key('Escape'); await sleep(500);
  report.facts.notesClosedByEscape = await page.eval('!document.querySelector("dialog[open], [role=dialog]:not([hidden])")');
  // Wrong then right, straight from the question.
  await page.goto(lookUrl(slug, 5), 1000);
  const ans = await page.eval(rectText('it goes down', '[data-pane="widget"]'));
  if (ans) { await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: ans.cx, y: ans.cy, button: 'none', buttons: 0 }); await sleep(250); await page.shot(f('hover-answer.png')); }
  await page.eval(clickText('it goes down', '[data-pane="widget"]')); await sleep(1100); await page.shot(f('wrong-pick-B.png'));
  await page.eval(clickText('it stays the same', '[data-pane="widget"]')); await sleep(1100); await page.shot(f('right-after-wrong.png'));
  // Reduced motion: must land on the finished state at once.
  await page.reducedMotion(true);
  for (const m of [2, 3, 8]) { await page.goto(lookUrl(slug, m), 150); await page.shot(f(`reduced-m${m}-150ms.png`)); }
  report.facts.reducedAnimations = await page.eval('document.getAnimations().map((a) => a.animationName || a.transitionProperty || "waapi").slice(0, 20)');
  await page.reducedMotion(false);
  report.errors.states = [...page.errors];
  await page.close();
}

// ---------- inside the prototype bar ----------
if (want('bar')) {
  const page = await open({ dpr: 1 });
  await page.size(1500, 1000);
  const base = pathToFileURL(join(ROOT, 'index.html')).href;
  await page.goto(`${base}?look=${slug}&moment=3&screen=ipad`, 1200);
  report.facts.barKnowsLook = (await page.eval('P.state.look')) === slug;
  // Only the screen inside the bar, so the look fills each frame.
  const clip = await page.eval(`(() => { const r = document.getElementById('scaler').getBoundingClientRect(); return { x: Math.floor(r.left), y: Math.floor(r.top), width: Math.ceil(r.width), height: Math.ceil(r.height) }; })()`);
  for (const mode of ['pieces', 'whole']) {
    await page.eval(`document.getElementById('arrival-${mode}').click()`);
    await frames(page, `arrival-${mode}`, [120, 450, 800, 1150, 1500, 1750, 2100, 2600], { sheetName: `seq-arrival-${mode}.png`, clip });
    await sleep(600);
  }
  await page.goto(`${base}?look=${slug}&moment=5&screen=ipad&kb=1`, 1200); await page.shot(f('bar-m5-ipad-keyboard-up.png'));
  await page.goto(`${base}?look=${slug}&moment=1&screen=laptop`, 1200); await page.shot(f('bar-m1-laptop.png'));
  report.errors.bar = [...page.errors];
  await page.close();
}

writeFileSync(f('report.json'), JSON.stringify(report, null, 2));
const errs = Object.values(report.errors).flat();
console.log(`${slug}: pictures in ${out}`);
console.log(errs.length ? 'PAGE ERRORS:\n' + errs.join('\n') : 'PAGE ERRORS: none');
if (report.missing.length) console.log('NOT FOUND:\n' + report.missing.join('\n'));
