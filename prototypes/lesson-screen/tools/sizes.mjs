// PROTOTYPE tooling, throwaway. What each screen size does to one look, as numbers for looks/README.md.
//
//   node tools/sizes.mjs <look>
//
// At each of the six sizes it reads, at moment 1 and at moment 5 (Test intuition):
//   the Chatbot's text size; the longest line of the Chatbot's opening paragraph, in characters;
//   the smallest text on screen; the height of the amounts block ([data-build-part="amounts"]);
//   and the sizes of the idea title, the Widget title and a total.
// Prints one row per size, ready to paste into a table. Chrome only.
import { open, lookUrl, SIZES, args } from './cdp.mjs';

const { pos } = args();
const [slug] = pos;
if (!slug) { console.error('usage: node tools/sizes.mjs <look>'); process.exit(1); }

const READ = () => {
  const paras = [...document.querySelectorAll('[data-pane="chat"] p')];
  const opening = paras.find((p) => p.textContent.includes('coffee cart')) || paras.find((p) => p.textContent.length > 80);
  const px = (el) => (el ? +parseFloat(getComputedStyle(el).fontSize).toFixed(1) : null);
  // Count the characters on each line of the opening paragraph, by where each one sits.
  const lines = new Map();
  if (opening) {
    const walker = document.createTreeWalker(opening, NodeFilter.SHOW_TEXT);
    for (let t; (t = walker.nextNode());) for (let i = 0; i < t.length; i++) {
      const r = document.createRange(); r.setStart(t, i); r.setEnd(t, i + 1);
      const y = Math.round(r.getBoundingClientRect().top / 4);
      lines.set(y, (lines.get(y) || 0) + 1);
    }
  }
  const shown = [...document.querySelectorAll('body *')].filter((e) => e.checkVisibility?.({ visibilityProperty: true }) && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  const amounts = document.querySelector('[data-build-part="amounts"]');
  const heading = document.querySelector('[data-pane="chat"] h1, [data-pane="chat"] h2');
  return {
    chat: px(opening),
    longest: Math.max(0, ...[...lines.values()]),
    smallest: Math.min(...shown.map((e) => parseFloat(getComputedStyle(e).fontSize))),
    amounts: amounts ? Math.round(amounts.getBoundingClientRect().height) : null,
    idea: px(heading),
    widget: px(document.querySelector('[data-pane="widget"] h2')),
    total: px(document.querySelector('[data-total], .colhead strong, .total')),
  };
};

const page = await open();
const rows = [];
for (const [name, [w, h]] of Object.entries(SIZES)) {
  await page.size(w, h);
  const at = {};
  for (const m of [1, 5]) { await page.goto(lookUrl(slug, m), 700); at[m] = await page.eval(`(${READ})()`); }
  rows.push({ name, w, h, ...at[1], amountsAtQuestion: at[5].amounts, totalAtQuestion: at[5].total });
}
console.log(`| Screen | Chatbot | Longest line | Smallest text | Amounts block, opening → Test intuition | Idea title | Widget title | Totals |`);
console.log(`| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |`);
for (const r of rows) console.log(`| ${r.name}, ${r.w} × ${r.h} | ${r.chat} px | ${r.longest} characters | ${r.smallest} px | ${r.amounts} → ${r.amountsAtQuestion} px | ${r.idea} px | ${r.widget} px | ${r.total} → ${r.totalAtQuestion} px |`);
console.log(page.errors.length ? 'PAGE ERRORS:\n' + page.errors.join('\n') : 'PAGE ERRORS: none');
await page.close();
