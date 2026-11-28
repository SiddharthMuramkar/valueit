// PROTOTYPE tooling, throwaway. Screenshots of one look at the prototype's screen sizes.
//
//   node tools/shots.mjs <look> <outDir>                         the standard set (28 pictures)
//   node tools/shots.mjs <look> <outDir> --moments 1,5 --sizes ipad,ipad-kb
//   node tools/shots.mjs <look> <outDir> --set all               every moment at every size (54 pictures)
//   options: --dpr 2 (sharper, for judging type), --settle 900 (ms to wait before each picture), --reduced (reduced motion)
//
// <look> is a folder under looks/ (night, paper, play, _template) or "rough" for the first rough pass.
// Sizes: laptop 1470×840 · laptop-s 1366×650 · ipad 1180×750 · ipad-s 1080×740 · ipad-kb 1180×353 · ipad-s-kb 1080×348
// (the two -kb sizes are what is left above an iPad's on-screen keyboard).
// Files are named m<moment>-<size>.png. Page errors are printed at the end.
import { join } from 'node:path';
import { open, lookUrl, SIZES, args } from './cdp.mjs';

const { pos, opt } = args();
const [look, outDir] = pos;
if (!look || !outDir) { console.error('usage: node tools/shots.mjs <look> <outDir> [--set standard|all] [--moments 1,5] [--sizes ipad,laptop] [--dpr 2] [--settle 900] [--reduced]'); process.exit(1); }

const ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9];
let plan = [];
if (opt.moments || opt.sizes) {
  const ms = opt.moments ? String(opt.moments).split(',').map(Number) : ALL;
  const ss = opt.sizes ? String(opt.sizes).split(',') : ['ipad'];
  for (const s of ss) for (const m of ms) plan.push([m, s]);
} else if (opt.set === 'all') {
  for (const s of Object.keys(SIZES)) for (const m of ALL) plan.push([m, s]);
} else {
  for (const m of ALL) plan.push([m, 'ipad']);
  for (const s of ['laptop', 'laptop-s', 'ipad-s']) for (const m of [1, 3, 5, 8, 9]) plan.push([m, s]);
  for (const m of [2, 5, 7]) plan.push([m, 'ipad-kb']);
  plan.push([5, 'ipad-s-kb']);
}
for (const [, s] of plan) if (!SIZES[s]) { console.error(`unknown size "${s}". Known: ${Object.keys(SIZES).join(', ')}`); process.exit(1); }

const page = await open({ dpr: Number(opt.dpr) || 1, reducedMotion: !!opt.reduced });
const settle = Number(opt.settle) || 900;
for (const [m, s] of plan) {
  const [w, h] = SIZES[s];
  await page.size(w, h);
  await page.goto(lookUrl(look, m), settle);
  const file = join(outDir, `m${m}-${s}.png`);
  await page.shot(file);
  console.log(file);
}
console.log(page.errors.length ? 'PAGE ERRORS:\n' + page.errors.join('\n') : 'PAGE ERRORS: none');
await page.close();
