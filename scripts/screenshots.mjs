/**
 * Generates the screenshots used in the README.
 *
 *   npm run screenshots
 *
 * The script drives a headless Chrome over the DevTools protocol, signs in
 * with a demo account and captures every screen of the app. It is the
 * reproducible proof behind the images in docs/screenshots/.
 *
 * Environment:
 *   CHATFORM_URL       base URL of a running instance (default http://localhost:3000)
 *   CHATFORM_EMAIL     account to sign in with  (default demo@chatform.dev)
 *   CHATFORM_PASSWORD  password               (default demo1234)
 *   CHROME_BIN         Chrome binary (auto-detected)
 */

import { spawn, execSync } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'screenshots');

const BASE = process.env.CHATFORM_URL || 'http://localhost:3000';
const EMAIL = process.env.CHATFORM_EMAIL || 'demo@chatform.dev';
const PASSWORD = process.env.CHATFORM_PASSWORD || 'demo1234';

function findChrome() {
  if (process.env.CHROME_BIN) return process.env.CHROME_BIN;
  const candidates = [
    'google-chrome-stable',
    'google-chrome',
    'chromium',
    'chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ];
  for (const bin of candidates) {
    try {
      execSync(`command -v ${bin} || test -x ${bin}`, { stdio: 'ignore' });
      return bin;
    } catch {}
  }
  throw new Error('No Chrome/Chromium binary found. Set CHROME_BIN.');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function signIn() {
  const res = await fetch(`${BASE}/api/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`Sign-in failed (${res.status}). Check the demo credentials.`);
  const cookie = res.headers.getSetCookie?.()[0] || res.headers.get('set-cookie') || '';
  const token = /chatform_session=([^;]+)/.exec(cookie)?.[1];
  if (!token) throw new Error('No session cookie returned by the API.');
  return token;
}

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`timeout on ${method}`));
        }
      }, 30000);
    });
  }
}

const SHOTS = [
  { file: 'landing.png', url: '/', lang: 'fr', w: 1440, h: 900 },
  { file: 'landing-en.png', url: '/', lang: 'en', w: 1440, h: 900 },
  { file: 'dashboard.png', url: '/dashboard', lang: 'fr', w: 1440, h: 900, auth: true },
  { file: 'builder.png', url: '/forms/form-feedback', lang: 'fr', w: 1440, h: 900, auth: true },
  {
    file: 'responses.png',
    url: '/forms/form-feedback/responses',
    lang: 'fr',
    w: 1440,
    h: 900,
    auth: true,
  },
  {
    file: 'embed.png',
    url: '/dashboard',
    lang: 'fr',
    w: 1440,
    h: 900,
    auth: true,
    script: `[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Intégrer').click()`,
  },
  { file: 'widget.png', url: '/f/form-feedback', lang: 'fr', w: 1440, h: 900, acceptLang: 'fr-FR,fr;q=0.9' },
  {
    file: 'rating.png',
    url: '/f/form-feedback',
    lang: 'fr',
    w: 1440,
    h: 900,
    acceptLang: 'fr-FR,fr;q=0.9',
    hover: `[...document.querySelectorAll('button')].filter(b => (b.getAttribute('aria-label') || '').indexOf('sur') >= 0)[3]`,
  },
  { file: 'mobile.png', url: '/', lang: 'fr', w: 390, h: 844 },
];

async function capture(shot, token) {
  const port = 9300 + Math.floor(Math.random() * 500);
  const chrome = spawn(
    findChrome(),
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      '--no-sandbox',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=/tmp/chatform-shots-${port}`,
      `--window-size=${shot.w},${shot.h}`,
      '--force-device-scale-factor=2',
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  try {
    for (let i = 0; i < 60; i++) {
      try {
        if ((await fetch(`http://127.0.0.1:${port}/json/version`)).ok) break;
      } catch {}
      await sleep(250);
    }

    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    const page = targets.find((t) => t.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve) => ws.addEventListener('open', resolve));
    const cdp = new CDP(ws);

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Network.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: shot.w,
      height: shot.h,
      deviceScaleFactor: 2,
      mobile: false,
    });

    if (shot.acceptLang) {
      await cdp.send('Network.setExtraHTTPHeaders', {
        headers: { 'Accept-Language': shot.acceptLang },
      });
    }
    if (shot.auth) {
      await cdp.send('Network.setCookie', {
        name: 'chatform_session',
        value: token,
        domain: 'localhost',
        path: '/',
      });
    }
    if (shot.lang) {
      await cdp.send('Page.navigate', { url: `${BASE}/` });
      await sleep(1200);
      await cdp.send('Runtime.evaluate', {
        expression: `localStorage.setItem('chatform_language', ${JSON.stringify(shot.lang)})`,
      });
    }

    await cdp.send('Page.navigate', { url: `${BASE}${shot.url}` });
    await sleep(3000);

    if (shot.hover) {
      const r = await cdp.send('Runtime.evaluate', {
        expression: `(() => { const el = ${shot.hover}; if (!el) return null; const b = el.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; })()`,
        returnByValue: true,
      });
      const pt = r.result?.value;
      if (pt) {
        await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: pt.x, y: pt.y });
        await sleep(700);
      }
    }
    if (shot.script) {
      await cdp.send('Runtime.evaluate', { expression: shot.script });
      await sleep(1500);
    }

    await cdp.send('Runtime.evaluate', { expression: 'window.scrollTo(0, 0)' });
    await sleep(400);

    const image = await cdp.send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(path.join(OUT, shot.file), Buffer.from(image.data, 'base64'));
    console.log(`  ✓ ${shot.file}`);

    ws.close();
  } finally {
    chrome.kill();
  }
}

async function main() {
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
  console.log(`Capturing ${BASE} → docs/screenshots/`);
  const token = await signIn();
  for (const shot of SHOTS) {
    await capture(shot, token);
  }
  console.log('Done.');
}

main().catch((err) => {
  console.error('screenshots:', err.message);
  process.exit(1);
});
