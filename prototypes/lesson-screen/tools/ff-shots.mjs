// PROTOTYPE tooling, throwaway. The same look in Firefox, to compare with Chrome's pictures side by side.
//   node tools/ff-shots.mjs <look> <outDir>
// Makes ff-m1..m9-ipad.png, ff-m{1,5}-laptop-s.png, ff-m{2,5}-ipad-kb.png, ff-m5-ipad-s-kb.png,
// ff-loan-5000.png (moment 1 after the loan slider is set to 5,000 from the keyboard), and ff-report.json.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { lookUrl, SIZES, sleep, args } from './cdp.mjs';
import { openFirefox } from './firefox.mjs';

const { pos } = args();
const [slug, out] = pos;
if (!slug || !out) { console.error('usage: node ff-shots.mjs <slug> <outDir>'); process.exit(1); }
mkdirSync(out, { recursive: true });
const f = (n) => join(out, n);
const page = await openFirefox();
const report = { slug, facts: {} };
try {
  const plan = [];
  for (let m = 1; m <= 9; m++) plan.push([m, 'ipad']);
  plan.push([1, 'laptop-s'], [5, 'laptop-s'], [2, 'ipad-kb'], [5, 'ipad-kb'], [5, 'ipad-s-kb']);
  for (const [m, s] of plan) {
    await page.size(...SIZES[s]);
    await page.goto(lookUrl(slug, m), 1000);
    await page.shot(f(`ff-m${m}-${s}.png`));
  }
  await page.size(...SIZES.ipad);
  await page.goto(lookUrl(slug, 1), 800);
  report.facts.geometry = await page.eval(`(() => { const c = document.querySelector('[data-pane="chat"]');
    return { size: [innerWidth, innerHeight], split: +(c.getBoundingClientRect().width / innerWidth).toFixed(4),
      overflow: [document.documentElement.scrollWidth - innerWidth, document.documentElement.scrollHeight - innerHeight],
      fonts: [...document.fonts].map((x) => [x.family, x.status]), chat: getComputedStyle(document.querySelector('[data-pane="chat"] p')).fontSize }; })()`);
  await page.eval(`(() => { const e = document.querySelector('input[type=range][aria-label*="loan" i]'); e.value = 5000; e.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
  await sleep(700);
  await page.shot(f('ff-loan-5000.png'));
  report.errors = page.errors;
} finally {
  writeFileSync(f('ff-report.json'), JSON.stringify(report, null, 2));
  await page.close();
}
console.log(`${slug}: Firefox pictures in ${out}`);
console.log(report.errors?.length ? 'PAGE ERRORS:\n' + report.errors.join('\n') : 'PAGE ERRORS: none');
