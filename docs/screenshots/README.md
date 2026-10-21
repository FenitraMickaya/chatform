# Screenshots

These images are the **proof** of the feature list in the main README: they are
real captures of a running Chatform instance, not mockups.

## How they were taken

```bash
npm run build && npm start     # a running instance on :3000
npm run screenshots            # regenerates every image below
```

The script (`scripts/screenshots.mjs`) drives a headless Chrome over the
DevTools protocol. It signs in with the demo account, sets the session cookie
and the UI language, and captures the nine screens — including interactive
states that a plain screenshot cannot show:

| File | Screen | How |
|---|---|---|
| `landing.png` | Landing page (FR) | viewport |
| `landing-en.png` | Landing page (EN) | `localStorage` language switched |
| `dashboard.png` | Dashboard — KPIs, forms, recommendation rate | authenticated |
| `builder.png` | Form builder — questions, required flags, live preview | authenticated |
| `responses.png` | Responses — breakdown, advocacy score, export | authenticated |
| `embed.png` | Embed dialog — the one-line snippet | the *Intégrer* button is clicked |
| `widget.png` | Chat widget — one question at a time | public page, `Accept-Language: fr` |
| `rating.png` | Rating — hovering a star fills the scale | a real mouse move over the 4th star |
| `mobile.png` | Landing page | 390 × 844 viewport |

## Options

```bash
CHATFORM_URL=https://your-deployment.example   # default http://localhost:3000
CHATFORM_EMAIL=demo@chatform.dev
CHATFORM_PASSWORD=demo1234
CHROME_BIN=/usr/bin/chromium                   # auto-detected otherwise
```

The captures are deterministic enough to diff between two versions, which
makes them useful as visual regression evidence.
