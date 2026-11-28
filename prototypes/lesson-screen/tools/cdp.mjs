// PROTOTYPE tooling, throwaway. Drives headless Chrome over the DevTools protocol.
// No dependencies: needs Node 22+ and `google-chrome` on the PATH (or CHROME=/path/to/chrome).
// Every open() starts its own Chrome with its own temporary profile and port, so several can run at once.
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// prototypes/lesson-screen
export const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

// Rough browser-window sizes, the same ones the prototype bar offers.
// The two "-kb" sizes are what is left above an iPad's on-screen keyboard.
export const SIZES = {
  laptop: [1470, 840],
  'laptop-s': [1366, 650],
  ipad: [1180, 750],
  'ipad-s': [1080, 740],
  'ipad-kb': [1180, 353],
  'ipad-s-kb': [1080, 348],
};

// A look's own page at one moment. `look` is a folder name under looks/, or "rough" for the first rough pass.
export function lookUrl(look, moment = 1) {
  if (look === 'rough') return pathToFileURL(join(ROOT, 'index.html')).href + `?look=rough&variant=A&moment=${moment}`;
  if (/^(file|https?):/.test(look)) return look + (look.includes('?') ? '&' : '?') + `moment=${moment}`;
  return pathToFileURL(join(ROOT, 'looks', look, 'index.html')).href + `?moment=${moment}`;
}

const KEYS = {
  ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40, Enter: 13, Tab: 9, Escape: 27, ' ': 32, Home: 36, End: 35,
};

export async function open({ width = 1180, height = 750, dpr = 1, reducedMotion = false } = {}) {
  const profile = mkdtempSync(join(tmpdir(), 'valueit-chrome-'));
  const chrome = spawn(process.env.CHROME || 'google-chrome', [
    '--headless=new', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', '--disable-extensions',
    '--remote-debugging-port=0', `--user-data-dir=${profile}`, `--window-size=${width},${height}`, 'about:blank',
  ], { stdio: 'ignore' });
  const kill = () => { try { chrome.kill('SIGKILL'); } catch {} };
  process.on('exit', kill);

  let port;
  for (let i = 0; i < 150 && !port; i++) {
    await sleep(100);
    try { port = readFileSync(join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0].trim(); } catch {}
  }
  if (!port) { kill(); throw new Error('Chrome did not start'); }
  let target;
  for (let i = 0; i < 80 && !target; i++) {
    try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page'); } catch {}
    if (!target) await sleep(100);
  }
  if (!target) { kill(); throw new Error('Chrome has no page'); }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0;
  const pending = new Map();
  const waiters = [];
  const errors = [];
  const note = (e) => { if (!errors.includes(e)) errors.push(e); };
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) {
      const p = pending.get(d.id);
      pending.delete(d.id);
      if (d.error) p.rej(new Error(d.error.message)); else p.res(d.result);
      return;
    }
    if (d.method === 'Runtime.exceptionThrown') note('exception: ' + (d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text));
    if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') note('console.error: ' + d.params.args.map((a) => a.value ?? a.description).join(' '));
    if (d.method === 'Log.entryAdded' && d.params.entry.level === 'error') note('log: ' + d.params.entry.text + (d.params.entry.url ? ' ' + d.params.entry.url : ''));
    for (let i = waiters.length - 1; i >= 0; i--) {
      if (waiters[i].method === d.method) { waiters[i].res(d.params); waiters.splice(i, 1); }
    }
  };
  const send = (method, params = {}) => new Promise((res, rej) => { pending.set(++id, { res, rej }); ws.send(JSON.stringify({ id, method, params })); });
  const once = (method, ms = 10000) => Promise.race([new Promise((res) => waiters.push({ method, res })), sleep(ms)]);

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Log.enable');

  const page = {
    errors,     // page exceptions, console errors, failed loads; filled as they happen
    send,       // raw protocol call, for anything not wrapped below
    sleep,
    width, height, dpr,

    // Set the screen size exactly (CSS pixels) and the pixel density.
    async size(w, h, ratio = page.dpr) {
      page.width = w; page.height = h; page.dpr = ratio;
      await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: ratio, mobile: false });
    },
    async reducedMotion(on = true) {
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: on ? 'reduce' : 'no-preference' }] });
    },

    // Load a page, wait for its fonts, then let entrance motion settle.
    async goto(url, settle = 900) {
      const loaded = once('Page.loadEventFired');
      await send('Page.navigate', { url });
      await loaded;
      await page.eval('document.fonts ? document.fonts.ready.then(() => true) : true');
      await sleep(settle);
    },

    // Run an expression in the page and get its value back (must be JSON-friendly). Promises are awaited.
    async eval(expression) {
      const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) { note('eval: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text)); return undefined; }
      return r.result?.value;
    },

    // The same, but inside the look's frame when the page is the prototype bar (index.html).
    // The frame is another origin on file://, so the page itself cannot reach into it; this can.
    async frameEval(expression, index = 0) {
      const tree = await send('Page.getFrameTree');
      const child = tree.frameTree.childFrames?.[index]?.frame.id;
      if (!child) { note('frameEval: no frame'); return undefined; }
      const { executionContextId } = await send('Page.createIsolatedWorld', { frameId: child });
      const r = await send('Runtime.evaluate', { contextId: executionContextId, expression, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) { note('frameEval: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text)); return undefined; }
      return r.result?.value;
    },

    // Where an element is on screen: { x, y, width, height, cx, cy } or null.
    rect(selector, nth = 0) {
      return page.eval(`(() => { const e = document.querySelectorAll(${JSON.stringify(selector)})[${nth}]; if (!e) return null;
        e.scrollIntoView({ block: 'nearest', inline: 'nearest' }); const r = e.getBoundingClientRect();
        return { x: r.left, y: r.top, width: r.width, height: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 }; })()`);
    },

    // Real mouse input, so pointer and mouse events fire as they do for a person.
    mouse(type, x, y) {
      return send('Input.dispatchMouseEvent', { type, x, y, button: type === 'mouseMoved' ? 'none' : 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1 });
    },
    async hover(selector, nth = 0) {
      const r = await page.rect(selector, nth);
      if (!r) return false;
      await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: r.cx, y: r.cy, button: 'none', buttons: 0 });
      return true;
    },
    async click(selector, nth = 0) {
      const r = await page.rect(selector, nth);
      if (!r) return false;
      await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: r.cx, y: r.cy, button: 'none', buttons: 0 });
      await page.mouse('mousePressed', r.cx, r.cy);
      await page.mouse('mouseReleased', r.cx, r.cy);
      return true;
    },
    // Press at (x1, y1), move to (x2, y2) in steps. With hold: true the button stays down
    // (take a screenshot mid-drag, then call release(x, y)).
    async drag(x1, y1, x2, y2, { steps = 12, stepDelay = 16, hold = false } = {}) {
      await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x1, y: y1, button: 'none', buttons: 0 });
      await page.mouse('mousePressed', x1, y1);
      for (let i = 1; i <= steps; i++) {
        await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x1 + ((x2 - x1) * i) / steps, y: y1 + ((y2 - y1) * i) / steps, button: 'left', buttons: 1 });
        await sleep(stepDelay);
      }
      if (!hold) await page.mouse('mouseReleased', x2, y2);
    },
    release(x, y) { return page.mouse('mouseReleased', x, y); },

    // Set a native <input type=range> the quick way, firing the events a drag would.
    setRange(selector, value, nth = 0) {
      return page.eval(`(() => { const e = document.querySelectorAll(${JSON.stringify(selector)})[${nth}]; if (!e) return false;
        e.value = ${JSON.stringify(String(value))}; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
    },
    type(text) { return send('Input.insertText', { text }); },
    async key(key) {
      const code = KEYS[key] ?? key.toUpperCase().charCodeAt(0);
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code: key.length === 1 ? 'Key' + key.toUpperCase() : key, windowsVirtualKeyCode: code });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code: key.length === 1 ? 'Key' + key.toUpperCase() : key, windowsVirtualKeyCode: code });
    },

    // Save a PNG. clip: { x, y, width, height } in CSS pixels; scale 2 or 3 zooms into that region, re-drawn sharp.
    // Returns the PNG as a Buffer.
    async shot(file, { clip, scale = 1 } = {}) {
      const params = { format: 'png' };
      if (clip) params.clip = { x: clip.x, y: clip.y, width: clip.width, height: clip.height, scale };
      const r = await send('Page.captureScreenshot', params);
      const buf = Buffer.from(r.data, 'base64');
      if (file) { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, buf); }
      return buf;
    },
    // Zoom into one element (with a little air around it).
    async shotOf(file, selector, { nth = 0, pad = 12, scale = 2 } = {}) {
      const r = await page.rect(selector, nth);
      if (!r) return null;
      const x = Math.max(0, r.x - pad), y = Math.max(0, r.y - pad);
      return page.shot(file, { clip: { x, y, width: Math.min(page.width - x, r.width + pad * 2), height: Math.min(page.height - y, r.height + pad * 2) }, scale });
    },

    async close() {
      try { ws.close(); } catch {}
      kill();
      await sleep(150);
      try { rmSync(profile, { recursive: true, force: true }); } catch {}
    },
  };

  await page.size(width, height, dpr);
  if (reducedMotion) await page.reducedMotion(true);
  return page;
}

// Tiny argument reader: positional words and --name value pairs.
export function args(argv = process.argv.slice(2)) {
  const pos = [];
  const opt = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) { const k = argv[i].slice(2); opt[k] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true; }
    else pos.push(argv[i]);
  }
  return { pos, opt };
}
