// PROTOTYPE tooling, throwaway. How a look reads for people who see colour differently, and in the browser's special modes. Chrome only.
//   node tools/modes.mjs <look> <outDir>
// Makes, at 1180 x 750:
//   cvd-m1.png, cvd-m3.png, cvd-m5.png   one sheet each: normal, deuteranopia, protanopia, tritanopia, no colour at all
//                                        (moment 1 is shown with the loan at 5,000, so all five blocks are on screen)
//   forced-colors-m1.png, forced-colors-m5.png, forced-colors-m9.png   Windows high-contrast style
//   more-contrast-m5.png                 prefers-contrast: more
//   spacing-m3.png, spacing-m5.png       WCAG 1.4.12 text spacing applied (line height 1.5, letter 0.12em, word 0.16em, paragraph 2em)
//   light-os-m1.png                      the operating system set to light: the look must stay dark and complete
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { open, lookUrl, sleep, SIZES, args } from './cdp.mjs';

const { pos } = args();
const [slug, out] = pos;
if (!slug || !out) { console.error('usage: node modes.mjs <slug> <outDir>'); process.exit(1); }
mkdirSync(out, { recursive: true });
const f = (n) => join(out, n);
const page = await open({ dpr: 1 });
await page.size(...SIZES.ipad);

for (const m of [1, 3, 5]) {
  await page.goto(lookUrl(slug, m), 900);
  if (m === 1) { await page.setRange('input[type=range][aria-label*="loan" i]', 5000); await sleep(600); }
  const files = [];
  for (const type of ['none', 'deuteranopia', 'protanopia', 'tritanopia', 'achromatopsia']) {
    await page.send('Emulation.setEmulatedVisionDeficiency', { type });
    await sleep(150);
    const r = await page.rect('[data-pane="widget"]');
    const file = f(`cvd-m${m}-${type}.png`);
    await page.shot(file, { clip: { x: r.x, y: r.y, width: r.width, height: r.height } });
    files.push(file);
  }
  await page.send('Emulation.setEmulatedVisionDeficiency', { type: 'none' });
  try { execFileSync('montage', [...files, '-tile', '5x', '-geometry', '388x+4+4', '-background', '#30343c', f(`cvd-m${m}.png`)]); } catch {}
}

const media = (features) => page.send('Emulation.setEmulatedMedia', { features });
await media([{ name: 'forced-colors', value: 'active' }]);
for (const m of [1, 5, 9]) { await page.goto(lookUrl(slug, m), 900); await page.shot(f(`forced-colors-m${m}.png`)); }
await media([{ name: 'forced-colors', value: 'none' }, { name: 'prefers-contrast', value: 'more' }]);
await page.goto(lookUrl(slug, 5), 900); await page.shot(f('more-contrast-m5.png'));
await media([{ name: 'prefers-contrast', value: 'no-preference' }, { name: 'prefers-color-scheme', value: 'light' }]);
await page.goto(lookUrl(slug, 1), 900); await page.shot(f('light-os-m1.png'));
await media([{ name: 'prefers-color-scheme', value: 'dark' }]);

for (const m of [3, 5]) {
  await page.goto(lookUrl(slug, m), 900);
  await page.eval(`(() => { const s = document.createElement('style'); s.textContent = '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }'; document.head.append(s); return true; })()`);
  await sleep(400);
  await page.shot(f(`spacing-m${m}.png`));
}
console.log(`${slug}: mode pictures in ${out}`);
console.log(page.errors.length ? 'PAGE ERRORS:\n' + page.errors.join('\n') : 'PAGE ERRORS: none');
await page.close();
