// PROTOTYPE tooling, throwaway. Measures one look instead of guessing from a picture:
// type sizes actually used, fonts that failed to load, contrast (sampled from real pixels), touch targets
// smaller than 44px, cut or truncated text, what scrolls, the pane split, line length, and near-miss alignment.
//
//   node tools/audit.mjs <look>                                  moments 1,3,5,9 at ipad, ipad-s, laptop-s, ipad-kb
//   node tools/audit.mjs <look> --moments 5 --sizes ipad,laptop
//   options: --settle 1200 (ms to wait before measuring), --json out.json (raw numbers)
//
// <look> is a folder under looks/. Sizes are listed in tools/shots.mjs.
// It measures; it does not judge. A flagged item can be intended (a clamped title, a decorative clip): look and decide.
import { inflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { open, lookUrl, SIZES, args } from './cdp.mjs';

// ---- Runs inside the page ----
const AUDIT = () => {
  const vw = innerWidth, vh = innerHeight;
  const cnv = document.createElement('canvas');
  cnv.width = cnv.height = 1;
  const ctx = cnv.getContext('2d', { willReadFrequently: true });
  const rgba = (css) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], +(d[3] / 255).toFixed(3)];
  };
  const desc = (el, withText = true) => {
    const cls = typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
    const t = withText ? (el.getAttribute('aria-label') || el.textContent || el.value || '').replace(/\s+/g, ' ').trim().slice(0, 34) : '';
    return `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${cls}${t ? ` “${t}”` : ''}`;
  };
  // The rectangle an element may show in, after every clipping ancestor and the screen edge.
  const clipBox = (el, self) => {
    const c = { l: 0, t: 0, r: vw, b: vh, scrollsY: false, scrollsX: false, opacity: 1 };
    for (let p = el; p && p.nodeType === 1; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (cs.display === 'none') return null;
      c.opacity *= parseFloat(cs.opacity);
      if (p === el && !self) continue;
      const ox = cs.overflowX, oy = cs.overflowY;
      if (ox === 'visible' && oy === 'visible') continue;
      const pr = p.getBoundingClientRect();
      if (ox !== 'visible') { c.l = Math.max(c.l, pr.left); c.r = Math.min(c.r, pr.right); if (/auto|scroll/.test(ox)) c.scrollsX = true; }
      if (oy !== 'visible') { c.t = Math.max(c.t, pr.top); c.b = Math.min(c.b, pr.bottom); if (/auto|scroll/.test(oy)) c.scrollsY = true; }
    }
    return c.opacity < 0.05 || c.r - c.l < 1 || c.b - c.t < 1 ? null : c;
  };
  const shown = (r, c) => r.width > 0.5 && r.height > 0.5 && r.right > c.l + 1 && r.left < c.r - 1 && r.bottom > c.t + 1 && r.top < c.b - 1;
  const blockOf = (el) => {
    let b = el;
    while (b && b !== document.body && /^(inline|contents)$/.test(getComputedStyle(b).display)) b = b.parentElement;
    return b || document.body;
  };
  const paneOf = (el) => { const p = el.closest('[data-pane]'); return p ? p.dataset.pane : 'other'; };

  // Every piece of text that is actually on screen.
  const texts = [];
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = tw.nextNode());) {
    const s = n.nodeValue.replace(/\s+/g, ' ').trim();
    if (!s) continue;
    const el = n.parentElement;
    if (!el || el.closest('script, style, noscript, template, title')) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility !== 'visible') continue;
    const c = clipBox(el, true);
    if (!c) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    const all = [...range.getClientRects()].filter((r) => r.width > 0.5 && r.height > 0.5);
    const lines = all.filter((r) => shown(r, c));
    if (!lines.length) continue;
    texts.push({ el, s, cs, c, all, lines, size: parseFloat(cs.fontSize) });
  }

  // Type: every distinct style in use.
  const typeMap = new Map();
  const colourMap = new Map();
  for (const t of texts) {
    const cs = t.cs;
    const fam = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
    const size = +t.size.toFixed(2);
    const lh = cs.lineHeight === 'normal' ? 'normal' : +parseFloat(cs.lineHeight).toFixed(1);
    const ls = cs.letterSpacing === 'normal' ? 0 : +(parseFloat(cs.letterSpacing) / size).toFixed(3);
    const key = [fam, size, lh, cs.fontWeight, cs.fontStyle, ls, cs.textTransform].join('|');
    let rec = typeMap.get(key);
    if (!rec) typeMap.set(key, rec = { fam, size, lh, weight: cs.fontWeight, italic: cs.fontStyle === 'italic', ls, caps: cs.textTransform === 'uppercase', chars: 0, sample: t.s.slice(0, 28) });
    rec.chars += t.s.length;
    const col = rgba(cs.color).slice(0, 3).map((v) => v.toString(16).padStart(2, '0')).join('');
    colourMap.set(col, (colourMap.get(col) || 0) + t.s.length);
  }
  const GENERIC = /^(serif|sans-serif|monospace|system-ui|ui-sans-serif|ui-serif|ui-monospace|ui-rounded|cursive|fantasy|math|emoji|-apple-system|BlinkMacSystemFont)$/i;
  const fontOk = (fam) => {
    if (GENERIC.test(fam)) return 'generic';
    const probe = 'mmmmmmmmmmlli10,000Qg';
    const w = (f) => { ctx.font = `72px ${f}`; return ctx.measureText(probe).width; };
    return w(`"${fam}", monospace`) !== w('monospace') || w(`"${fam}", serif`) !== w('serif') ? 'ok' : 'MISSING (a fallback font is showing)';
  };
  const families = [...new Set([...typeMap.values()].map((t) => t.fam))].map((fam) => ({ fam, state: fontOk(fam) }));

  // Contrast: text colour here, background sampled from the screenshot by the caller.
  const contrast = texts.map((t) => {
    const svg = t.el instanceof SVGElement;
    const fill = svg ? t.cs.fill : (t.cs.webkitTextFillColor && t.cs.webkitTextFillColor !== t.cs.color ? t.cs.webkitTextFillColor : t.cs.color);
    const col = rgba(fill);
    const l = t.lines[0];
    const x0 = Math.max(l.left, t.c.l), y0 = Math.max(l.top, t.c.t), x1 = Math.min(l.right, t.c.r), y1 = Math.min(l.bottom, t.c.b);
    return {
      s: t.s.slice(0, 40), color: [col[0], col[1], col[2], +(col[3] * t.c.opacity).toFixed(3)], size: +t.size.toFixed(1), weight: +t.cs.fontWeight,
      rect: [x0, y0, x1 - x0, y1 - y0], disabled: !!t.el.closest('[disabled], [aria-disabled="true"]'), pane: paneOf(t.el),
    };
  });

  // Text that is cut by a box it sits in, or shortened with "…".
  const cut = [];
  for (const t of texts) {
    const tol = Math.max(1.5, t.size * 0.25);
    const cutX = !t.c.scrollsX && t.lines.some((r) => r.left < t.c.l - 1.5 || r.right > t.c.r + 1.5);
    const cutY = !t.c.scrollsY && (t.lines.some((r) => r.top < t.c.t - tol || r.bottom > t.c.b + tol) || t.all.length > t.lines.length);
    if (cutX || cutY) cut.push({ s: t.s.slice(0, 40), how: cutX ? 'cut sideways' : t.all.length > t.lines.length ? 'some lines hidden' : 'cut top or bottom', pane: paneOf(t.el) });
  }
  const truncated = [];
  const scrolls = [];
  for (const el of document.body.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none') continue;
    const ox = cs.overflowX, oy = cs.overflowY;
    if (ox === 'visible' && oy === 'visible') continue;
    const dx = el.scrollWidth - el.clientWidth, dy = el.scrollHeight - el.clientHeight;
    if (dx <= 1 && dy <= 1) continue;
    const c = clipBox(el, false);
    if (!c || !shown(el.getBoundingClientRect(), c)) continue;
    if (/auto|scroll/.test(oy) && dy > 1) scrolls.push({ what: desc(el, false), axis: 'up-down', shows: el.clientHeight, holds: el.scrollHeight, pane: paneOf(el) });
    if (/auto|scroll/.test(ox) && dx > 1) scrolls.push({ what: desc(el, false), axis: 'SIDEWAYS', shows: el.clientWidth, holds: el.scrollWidth, pane: paneOf(el) });
    if (cs.textOverflow === 'ellipsis' && dx > 1) truncated.push({ s: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 48), shows: el.clientWidth, needs: el.scrollWidth });
  }

  // Things a finger must hit. Probed 21.5px either side of the centre, so an enlarged hit area counts.
  const sel = 'a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=tab], [role=slider], [role=radio], [role=checkbox], [role=switch], [role=option], [role=link], [tabindex]:not([tabindex="-1"])';
  const hit = (el, x, y) => {
    if (x < 0 || y < 0 || x >= vw || y >= vh) return true;
    const top = document.elementFromPoint(x, y);
    if (!top) return false;
    if (el === top || el.contains(top)) return true;
    const lab = top.closest('label');
    return !!(lab && (lab.control === el || lab.contains(el)));
  };
  const targets = [];
  let targetCount = 0;
  for (const el of document.querySelectorAll(sel)) {
    if (el.disabled || el.getAttribute('aria-disabled') === 'true') continue;
    const c = clipBox(el, false);
    const r = el.getBoundingClientRect();
    if (!c || !shown(r, c) || getComputedStyle(el).visibility !== 'visible') continue;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    if (!hit(el, cx, cy)) continue;       // covered or scrolled under something: cannot be measured
    targetCount++;
    const wide = hit(el, cx - 21.5, cy) && hit(el, cx + 21.5, cy);
    const tall = hit(el, cx, cy - 21.5) && hit(el, cx, cy + 21.5);
    if (!wide || !tall) targets.push({ what: desc(el), w: Math.round(r.width), h: Math.round(r.height), inline: getComputedStyle(el).display === 'inline', pane: paneOf(el) });
  }

  // Blocks of text: left edges (alignment) and characters per line (reading comfort).
  const blocks = new Map();
  for (const t of texts) {
    const b = blockOf(t.el);
    let rec = blocks.get(b);
    if (!rec) blocks.set(b, rec = { el: b, left: Infinity, tops: [], chars: 0, s: '', size: t.size });
    for (const r of t.lines) {
      rec.left = Math.min(rec.left, r.left);
      if (!rec.tops.some((y) => Math.abs(y - r.top) < r.height * 0.6)) rec.tops.push(r.top);
    }
    rec.chars += t.s.length + 1;
    if (rec.s.length < 36) rec.s = (rec.s + ' ' + t.s).trim().slice(0, 36);
  }
  const edges = {};
  const measure = {};
  for (const rec of blocks.values()) {
    const pane = paneOf(rec.el);
    const align = getComputedStyle(rec.el).textAlign;
    if (/^(start|left|-webkit-auto)$/.test(align)) {
      const x = Math.round(rec.left * 2) / 2;
      const e = (edges[pane] ||= {});
      (e[x] ||= { n: 0, s: rec.s }).n++;
    }
    if (rec.tops.length >= 2 && rec.chars >= 60) (measure[pane] ||= []).push({ cpl: Math.round(rec.chars / (rec.tops.length - 0.4)), lines: rec.tops.length, size: +rec.size.toFixed(1), s: rec.s });
  }

  // Spacing steps and corner radii in use (a short list means a disciplined scale).
  const spacing = {}, radii = {};
  let seen = 0;
  for (const el of document.body.querySelectorAll('*')) {
    if (++seen > 3000) break;
    const cs = getComputedStyle(el);
    if (cs.display === 'none') continue;
    for (const p of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'marginTop', 'marginBottom', 'rowGap', 'columnGap']) {
      const v = Math.round(parseFloat(cs[p]) * 2) / 2;
      if (v > 0 && v <= 96) spacing[v] = (spacing[v] || 0) + 1;
    }
    const rr = cs.borderTopLeftRadius;
    if (rr && rr !== '0px') { const k = /%/.test(rr) || parseFloat(rr) >= 99 ? 'round' : String(Math.round(parseFloat(rr) * 2) / 2); radii[k] = (radii[k] || 0) + 1; }
  }

  const de = document.documentElement;
  return {
    view: { w: vw, h: vh, pageW: Math.max(de.scrollWidth, document.body.scrollWidth), pageH: Math.max(de.scrollHeight, document.body.scrollHeight) },
    panes: [...document.querySelectorAll('[data-pane]')].map((p) => { const r = p.getBoundingClientRect(); return { name: p.dataset.pane, x: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) }; }),
    type: [...typeMap.values()].sort((a, b) => b.chars - a.chars),
    families,
    faces: [...document.fonts].map((f) => `${f.family.replace(/["']/g, '')} ${f.weight} ${f.style}: ${f.status}`),
    colours: [...colourMap.entries()].sort((a, b) => b[1] - a[1]).map(([c, n]) => ({ c: '#' + c, chars: n })),
    contrast, cut, truncated, scrolls, targets, targetCount, edges, measure, spacing, radii,
  };
};

// ---- Back in Node: a small PNG reader, so backgrounds are measured from what was really drawn ----
function decodePng(buf) {
  let p = 8, w = 0, h = 0, colorType = 0;
  const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p);
    const type = buf.toString('ascii', p + 4, p + 8);
    const data = buf.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); colorType = data[9]; if (data[8] !== 8 || data[12]) throw new Error('png: unsupported format'); }
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    p += 12 + len;
  }
  if (colorType !== 2 && colorType !== 6) throw new Error('png: unsupported colour type ' + colorType);
  const bpp = colorType === 6 ? 4 : 3;
  const stride = w * bpp;
  const raw = inflateSync(Buffer.concat(idat));
  const out = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)];
    const line = y * (stride + 1) + 1;
    const o = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[o + x - bpp] : 0;
      const b = y ? out[o - stride + x] : 0;
      const c = x >= bpp && y ? out[o - stride + x - bpp] : 0;
      let v = raw[line + x];
      if (f === 1) v += a;
      else if (f === 2) v += b;
      else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      out[o + x] = v & 255;
    }
  }
  return { w, h, bpp, stride, data: out };
}

const lum = ([r, g, b]) => {
  const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => { const la = lum(a), lb = lum(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); };
const hex = (c) => '#' + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

// The commonest colour in a region is its background; the pixels furthest from it are the ink.
function sample(png, [x, y, w, h], dpr) {
  const x0 = Math.max(0, Math.floor(x * dpr)), y0 = Math.max(0, Math.floor(y * dpr));
  const x1 = Math.min(png.w, Math.ceil((x + w) * dpr)), y1 = Math.min(png.h, Math.ceil((y + h) * dpr));
  const buckets = new Map();
  const px = [];
  for (let yy = y0; yy < y1; yy++) {
    for (let xx = x0; xx < x1; xx++) {
      const i = yy * png.stride + xx * png.bpp;
      const r = png.data[i], g = png.data[i + 1], b = png.data[i + 2];
      px.push([r, g, b]);
      const k = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
      let rec = buckets.get(k);
      if (!rec) buckets.set(k, rec = [0, 0, 0, 0]);
      rec[0] += r; rec[1] += g; rec[2] += b; rec[3]++;
    }
  }
  if (!px.length) return null;
  let best = null;
  for (const rec of buckets.values()) if (!best || rec[3] > best[3]) best = rec;
  const bg = [best[0] / best[3], best[1] / best[3], best[2] / best[3]];
  const lb = lum(bg);
  px.sort((p, q) => Math.abs(lum(q) - lb) - Math.abs(lum(p) - lb));
  const top = px.slice(0, Math.max(1, Math.round(px.length * 0.04)));
  const ink = [0, 1, 2].map((i) => top.reduce((a, p) => a + p[i], 0) / top.length);
  return { bg, ink };
}

const { pos, opt } = args();
const look = pos[0];
if (!look) { console.error('usage: node tools/audit.mjs <look> [--moments 1,5] [--sizes ipad,laptop] [--settle 1200] [--json out.json]'); process.exit(1); }
const moments = opt.moments ? String(opt.moments).split(',').map(Number) : [1, 3, 5, 9];
const sizes = opt.sizes ? String(opt.sizes).split(',') : ['ipad', 'ipad-s', 'laptop-s', 'ipad-kb'];
for (const s of sizes) if (!SIZES[s]) { console.error(`unknown size "${s}". Known: ${Object.keys(SIZES).join(', ')}`); process.exit(1); }
const settle = Number(opt.settle) || 1200;

const page = await open();
const raw = [];
const bySize = {};
const list = (items, f, max = 8) => items.slice(0, max).map(f).join('; ') + (items.length > max ? `; … ${items.length - max} more` : '');

for (const s of sizes) {
  for (const m of moments) {
    const [w, h] = SIZES[s];
    await page.size(w, h, 1);
    await page.goto(lookUrl(look, m), settle);
    const d = await page.eval(`(${AUDIT.toString()})()`);
    if (!d) { console.log(`\n== ${look} · moment ${m} · ${s}: the page could not be measured`); continue; }
    const png = decodePng(await page.shot());

    const fails = [];
    const seenText = new Set();
    for (const t of d.contrast) {
      const smp = sample(png, t.rect, 1);
      if (!smp) continue;
      const inkKnown = t.color[3] > 0.02;
      const a = t.color[3];
      const ink = inkKnown ? [0, 1, 2].map((i) => t.color[i] * a + smp.bg[i] * (1 - a)) : smp.ink;
      const cr = ratio(ink, smp.bg);
      const need = t.size >= 24 || (t.size >= 18.66 && t.weight >= 700) ? 3 : 4.5;
      const key = t.s + hex(ink) + hex(smp.bg);
      if (cr < need && !seenText.has(key)) {
        seenText.add(key);
        fails.push({ ...t, ratio: +cr.toFixed(2), need, ink: hex(ink), bg: hex(smp.bg), approx: !inkKnown });
      }
    }
    fails.sort((x, y) => x.ratio - y.ratio);
    d.contrastFails = fails;
    delete d.contrast;
    raw.push({ look, moment: m, size: s, ...d });

    const out = [];
    out.push(`\n== ${look} · moment ${m} · ${s} ${w}×${h}`);
    const chat = d.panes.find((p) => p.name === 'chat'), wid = d.panes.find((p) => p.name === 'widget');
    out.push(chat && wid
      ? `panes: chat ${chat.w}px, widget ${wid.w}px → ${(100 * chat.w / (chat.w + wid.w)).toFixed(1)} / ${(100 * wid.w / (chat.w + wid.w)).toFixed(1)} (they cover ${Math.round(100 * (chat.w + wid.w) / w)}% of the width)`
      : 'panes: MISSING data-pane="chat" / data-pane="widget"');
    out.push(`page: ${d.view.pageW > w + 1 || d.view.pageH > h + 1 ? `OVERFLOWS the screen (content ${d.view.pageW}×${d.view.pageH})` : 'fits the screen'}`
      + (d.scrolls.length ? ' · scrolls: ' + list(d.scrolls, (x) => `${x.what} [${x.pane}] ${x.axis} ${x.shows}/${x.holds}`) : ' · nothing scrolls'));
    out.push('type: ' + list(d.type, (t) => `${t.fam} ${t.size}/${t.lh} w${t.weight}${t.italic ? ' italic' : ''}${t.ls ? ` ls${t.ls}em` : ''}${t.caps ? ' CAPS' : ''} ×${t.chars} “${t.sample}”`, 14));
    const bad = d.families.filter((f) => f.state.startsWith('MISSING'));
    if (bad.length) out.push('FONTS NOT SHOWING: ' + bad.map((f) => f.fam).join(', '));
    const small = d.type.filter((t) => t.size < 12);
    out.push('small text (<12px): ' + (small.length ? list(small, (t) => `${t.size}px “${t.sample}”`) : 'none'));
    out.push(`small targets (<44px, of ${d.targetCount} checked): ` + (d.targets.length ? list(d.targets, (t) => `${t.what} ${t.w}×${t.h}${t.inline ? ' (inline link)' : ''}`, 12) : 'none'));
    out.push('contrast below the bar: ' + (fails.length ? list(fails, (f) => `“${f.s}” ${f.ratio}:1 (needs ${f.need}; ${f.ink} on ${f.bg}, ${f.size}px${f.disabled ? ', disabled' : ''}${f.approx ? ', ink estimated' : ''})`, 12) : 'none'));
    out.push('cut text: ' + (d.cut.length ? list(d.cut, (c) => `“${c.s}” ${c.how} [${c.pane}]`) : 'none')
      + ' · shortened with “…”: ' + (d.truncated.length ? list(d.truncated, (t) => `“${t.s}” ${t.shows}/${t.needs}px`, 5) : 'none'));
    for (const pane of Object.keys(d.measure)) {
      const ms = d.measure[pane].sort((a, b) => b.cpl - a.cpl);
      out.push(`line length [${pane}]: longest ${ms[0].cpl} characters a line (${ms[0].size}px “${ms[0].s}”), middle ${ms[Math.floor(ms.length / 2)].cpl}, over ${ms.length} blocks`);
    }
    for (const pane of Object.keys(d.edges)) {
      const xs = Object.keys(d.edges[pane]).map(Number).sort((a, b) => a - b);
      const main = [...xs].sort((a, b) => d.edges[pane][b].n - d.edges[pane][a].n).slice(0, 5).map((x) => `${x}px×${d.edges[pane][x].n}`);
      const near = [];
      for (let i = 1; i < xs.length; i++) if (xs[i] - xs[i - 1] <= 3) near.push(`${xs[i - 1]} vs ${xs[i]} (“${d.edges[pane][xs[i - 1]].s}” / “${d.edges[pane][xs[i]].s}”)`);
      out.push(`left edges [${pane}]: ${main.join(' ')}` + (near.length ? ` · NEAR MISSES: ${near.slice(0, 5).join('; ')}` : ''));
    }
    console.log(out.join('\n'));

    const rec = (bySize[s] ||= { sizes: {}, spacing: {}, radii: {}, colours: {}, faces: new Set(), families: new Map() });
    for (const t of d.type) rec.sizes[t.size] = (rec.sizes[t.size] || 0) + t.chars;
    for (const [k, v] of Object.entries(d.spacing)) rec.spacing[k] = (rec.spacing[k] || 0) + v;
    for (const [k, v] of Object.entries(d.radii)) rec.radii[k] = (rec.radii[k] || 0) + v;
    for (const c of d.colours) rec.colours[c.c] = (rec.colours[c.c] || 0) + c.chars;
    for (const f of d.faces) rec.faces.add(f);
    for (const f of d.families) rec.families.set(f.fam, f.state);
  }
}

console.log('\n== ACROSS THE VIEWS MEASURED');
for (const [s, rec] of Object.entries(bySize)) {
  const total = Object.values(rec.sizes).reduce((a, b) => a + b, 0);
  const sz = Object.keys(rec.sizes).map(Number).sort((a, b) => a - b);
  console.log(`${s}: ${sz.length} type sizes: ` + sz.map((x) => `${x}px ${Math.round(100 * rec.sizes[x] / total)}%`).join(' · '));
}
const first = Object.values(bySize)[0];
if (first) {
  const sp = Object.keys(first.spacing).map(Number).sort((a, b) => a - b);
  console.log(`spacing steps in use at ${Object.keys(bySize)[0]} (${sp.length}): ` + sp.map((x) => `${x}×${first.spacing[x]}`).join(' '));
  console.log(`corner radii in use (${Object.keys(first.radii).length}): ` + Object.entries(first.radii).map(([k, v]) => `${k}×${v}`).join(' '));
  const cols = Object.entries(first.colours).sort((a, b) => b[1] - a[1]);
  console.log(`text colours in use (${cols.length}): ` + cols.slice(0, 16).map(([c, n]) => `${c}×${n}`).join(' '));
  console.log('font families: ' + [...first.families.entries()].map(([f, st]) => `${f} (${st})`).join(', '));
  console.log('font files: ' + ([...first.faces].join(' · ') || 'none declared'));
}
console.log(page.errors.length ? '\nPAGE ERRORS:\n' + page.errors.join('\n') : '\nPAGE ERRORS: none');
if (opt.json) { writeFileSync(String(opt.json), JSON.stringify(raw, null, 1)); console.log('raw numbers: ' + opt.json); }
await page.close();
