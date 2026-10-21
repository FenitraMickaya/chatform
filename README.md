# Chatform — Conversational Forms & Embeddable Chat Widgets

Build interactive conversational forms, publish them, embed the chat widget on any
website with a one-line script, collect responses and analyse them from a dashboard.

Chatform is a Next.js (App Router) + TypeScript + Tailwind CSS application backed by
PostgreSQL.

---

## 📸 Screenshots

| | |
|:--|:--|
| ![Landing page](docs/screenshots/landing.png) | ![Dashboard](docs/screenshots/dashboard.png) |
| **Landing page** (FR) | **Dashboard** — KPIs, forms, recommendation rate |
| ![Form builder](docs/screenshots/builder.png) | ![Responses](docs/screenshots/responses.png) |
| **Form builder** — questions, required flags, live preview | **Responses** — breakdown, advocacy score, export |
| ![Embed dialog](docs/screenshots/embed.png) | ![Chat widget](docs/screenshots/widget.png) |
| **Embed dialog** — the one-line snippet | **Chat widget** — one question at a time |
| ![Rating](docs/screenshots/rating.png) | ![Mobile](docs/screenshots/mobile.png) |
| **Rating** — hovering a star fills the scale | **Mobile** (390 px) |
| ![Landing page EN](docs/screenshots/landing-en.png) | |
| **Landing page** (EN) | |

The interface and the form content are both available in French and English:
switching the language reloads the workspace, and every form carries a
translation for its title, description, bot messages and every question.

These captures are real — they are regenerated from a running instance with
`npm run screenshots` (see [docs/screenshots](docs/screenshots/README.md)),
so they can be diffed between two versions as visual evidence.

---

## ✨ Features

### 1. Landing page
- Hero section with headline, value proposition and CTAs.
- Feature grid explaining the platform capabilities.
- "How it works" 3-step workflow.
- **Live chatbot demo** rendering the published forms of the workspace.
- Embed-snippet section, footer with navigation links.

### 2. Dashboard
- KPIs: total forms, total responses, published forms, average questions per form.
- Create, edit, duplicate, publish/unpublish and delete forms.
- Search by keyword and filter by status.
- Recommendation rate computed across the responses.

### 3. Form builder
- Question types: **text**, **email**, **multiple choice**, **yes/no**, **rating** (1–5 stars).
- Reorder (move up/down), duplicate, delete questions; toggle *required*.
- Theme customisation: primary/accent colours, bot name, bot avatar, welcome and
  thank-you messages, widget position, progress bar.
- Live preview with desktop/mobile viewport toggle.

### 4. Chatbot widget
- One question at a time, chat-style interface.
- Text input, answer buttons, star rating, yes/no buttons.
- Inline validation (required field, email format).
- Welcome and completion messages, confetti on completion.
- Floating launcher that can be embedded on any external website.

### 5. Responses & publishing
- Unique public URL per form: `https://<domain>/f/<formId>`.
- Responses stored in PostgreSQL with a timestamp, completion time and user agent.
- Aggregated breakdown per question type, response table, CSV/JSON export.
- Publish / unpublish a form at any time (drafts are never publicly reachable).

### 6. Accounts
- Server-side sessions stored in PostgreSQL, httpOnly cookie.
- Passwords hashed with scrypt and a per-user salt.
- Each form is owned by its author: users only see and manage their own forms.

### 7. Languages
- Full **French / English** coverage on every screen (landing page, dashboard,
  builder, submissions, embed dialog, sign-in, simulator, chat widget).
- The language is stored in `localStorage` and applied on every route.
- Metric cards never show a computed percentage that no answer backs up: when
  there is no data, they display `—` instead of a made-up value.

---

## 🛠️ Tech stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 16** (App Router, Route Handlers) |
| UI | **React 19**, **TypeScript**, **Tailwind CSS v4**, lucide-react |
| Typography | Bricolage Grotesque (display), Plus Jakarta Sans (UI), JetBrains Mono (data) — self-hosted variable fonts |
| Backend | Next.js API route handlers (`app/api/**`) |
| Database | **PostgreSQL** (`pg` driver, plain SQL, no ORM) |
| Auth | Server-side sessions, httpOnly cookie, scrypt password hashing |
| Embed | Dependency-free `public/widget.js` loader |
| Tests | `node:test` (unit + PostgreSQL integration) |
| Lint/format | ESLint (flat config, `next/core-web-vitals`), TypeScript strict |

---

## 🚀 Getting started

### Prerequisites

- Node.js **20.9+** (developed on Node 22/26)
- PostgreSQL **14+** running locally, or a hosted instance
  (Supabase, Neon, Vercel Postgres, Railway… all work — only `DATABASE_URL` is needed)

### 1. Install

```bash
git clone https://github.com/FenitraMickaya/chatform.git
cd chatform
npm install
```

### 2. Configure the database

```bash
cp .env.example .env.local
```

`.env.local`:

```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/chatform"
DATABASE_SSL="false"
DATABASE_POOL_MAX="10"
```

For Supabase (or any provider requiring TLS):

```env
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres"
DATABASE_SSL="true"
```

### 3. Create the schema and seed the demo data

```bash
npm run db:migrate   # creates the database if needed + applies db/schema.sql
npm run db:seed      # demo accounts, 3 example forms, 13 example responses
```

`npm run db:migrate` creates the target database when it does not exist yet, so a
blank PostgreSQL instance is enough.

### 4. Run it

```bash
npm run dev          # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

### 5. Demo accounts

| Email | Password | Content |
|---|---|---|
| `demo@chatform.dev` | `demo1234` | *Utilisateur n°1* — 3 forms + 13 responses |
| `demo2@chatform.dev` | `demo1234` | *Utilisateur n°2* — empty workspace |

Signing up without a name gives you a generated one: *Utilisateur n°3*,
*User #4*… depending on the language.

You can also create your own account from the sign-in screen.

---

## 🧩 Embedding the widget on a website

Publish the form from the dashboard, copy the snippet from the **Embed** dialog and
paste it before `</body>`:

```html
<script
  src="https://your-domain.com/widget.js"
  data-form-id="form-lead-gen"
  data-position="bottom-right"
  data-color="#4F46E5"
  async>
</script>
```

The loader has no dependency, derives the app URL from its own `src` (so the same
snippet works on any deployment) and renders a floating launcher that opens the
conversation in an iframe pointing to the public URL of the form.

`public/demo-site.html` is a static test page that embeds the widget — open it at
`http://localhost:3000/demo-site.html` (or on the deployed domain) to check the
embed on a third-party site.

---

## 🎨 Brand

| Asset | File |
|---|---|
| Mark on a dark tile (40×40) | `public/logo.svg` |
| Mark, light background | `public/logo-mark.svg` |
| Mark, dark background | `public/logo-mark-inverse.svg` |
| Favicon | `app/icon.svg` |
| Apple touch icon | `app/apple-icon.png` |
| Social card (1200×630) | `public/og-image.png` |

The mark is a speech bubble with an angular tail holding two form fields and
a cursor block. The fields are cut out with an SVG mask, so the glyph inherits
`currentColor` and works on any background. The in-app version lives in
`src/components/Brand.tsx`.

**Wordmark**: *Chatform* is set in Bricolage Grotesque (display), with Plus
Jakarta Sans for the interface and JetBrains Mono for data.

---

## 🗂️ Project structure

```
app/
  api/                  Route handlers (auth, forms, responses, public)
  icon.svg              Favicon
  apple-icon.png        Apple touch icon
  dashboard/            Workspace home
  f/[formId]/           Public form URL (server-rendered)
  forms/[id]/           Form builder
  forms/[id]/responses/ Submissions & analytics
  login/                Sign in / sign up
  page.tsx              Landing page
  layout.tsx            Root layout + i18n provider
lib/
  auth.ts               Password hashing, sessions, cookie helpers
  db.ts                 PostgreSQL pool & query helpers
  forms.ts              Data access layer
  validation.ts         Dependency-free payload validation
db/schema.sql           PostgreSQL schema
public/
  logo.svg              Brand mark
  logo-mark.svg         Brand mark (light background)
  logo-mark-inverse.svg Brand mark (dark background)
  og-image.png          Social card
  widget.js             Embeddable widget loader
  demo-site.html        Static test page for the embed snippet
scripts/                migrate.ts / seed.ts
src/components/         React components
src/i18n/               FR/EN translations
tests/                  Unit + integration tests
docs/screenshots/        Screenshots used in this README
```

---

## 🔌 API

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | – | Create an account |
| `POST` | `/api/auth/signin` | – | Sign in (sets the session cookie) |
| `POST` | `/api/auth/signout` | – | Sign out |
| `GET` | `/api/auth/me` | ✔ | Current user |
| `GET` | `/api/forms` | ✔ | Forms owned by the user |
| `POST` | `/api/forms` | ✔ | Create or update a form |
| `GET` | `/api/forms/:id` | ✔ | One form (owner only) |
| `DELETE` | `/api/forms/:id` | ✔ | Delete a form and its responses |
| `GET` | `/api/forms/:id/responses` | ✔ | Responses of a form |
| `POST` | `/api/forms/:id/submit` | – / owner | Submit a response (public for published forms) |
| `GET` | `/api/responses` | ✔ | All responses of the user |
| `DELETE` | `/api/responses/:id` | ✔ | Delete a response |
| `GET` | `/api/public/forms` | – | Published forms |
| `GET` | `/api/public/forms/:id` | – | One published form |

---

## ✅ Quality gates

```bash
npm run typecheck   # tsc --noEmit (strict)
npm run lint        # eslint
npm test            # unit + PostgreSQL integration tests
npm run build       # production build
```

---

## 🚀 Deployment

The app is a standard Next.js application: it runs on Vercel, Render, Railway,
Fly.io or any Node host, as long as `DATABASE_URL` is available.

**Vercel**

```bash
npm i -g vercel
vercel link
vercel env add DATABASE_URL production   # paste the Postgres connection string
vercel deploy --prod
```

**Docker / any Node host**

```bash
npm ci && npm run build && npm start   # listens on $PORT (default 3000)
```

---

## 📄 License

Apache-2.0
