# PageCraft

Generate personalized children's books with AI stories and illustrations. A React frontend talks to a Cloudflare Worker backend that uses Gemini for story and image generation, D1 for storage, and R2 for image hosting.

## Architecture

```
┌──────────────┐     proxied     ┌──────────────────┐
│  Browser     │ ─── /api ───→   │  Wrangler dev    │
│  localhost   │     /art-styles │  localhost:8787   │
│  :5173       │ ←───────────── │  (Hono Worker)    │
└──────────────┘                 └────────┬─────────┘
                                          │
                          ┌───────────────┼───────────────┐
                          ▼               ▼               ▼
                     ┌─────────┐   ┌──────────┐   ┌────────────┐
                     │  D1     │   │  R2      │   │  Gemini    │
                     │  local  │   │  remote  │   │  API       │
                     │  SQLite │   │  bucket  │   │            │
                     └─────────┘   └──────────┘   └────────────┘
```

The project has **two independent packages** (no monorepo workspace):

| Package          | Stack                         | Runs on          |
| ---------------- | ----------------------------- | ---------------- |
| `pagecraft-api/` | Hono + Cloudflare Workers     | `localhost:8787` |
| `pagecraft-ui/`  | Vite + React 19 + Tailwind v4 | `localhost:5173` |

## Prerequisites

- [Node.js](https://nodejs.org/) >= 20 (LTS recommended)
- npm (ships with Node.js)
- A [Gemini API key](https://aistudio.google.com/apikey) (free tier works for story generation but only paid tier works for illustration generation)

## Quick Start

Estimated time: **~6 minutes**.

### 1. Install dependencies

```bash
make install
```

Or without Make:

```bash
npm --prefix pagecraft-api install && npm --prefix pagecraft-ui install
```

### 2. Configure environment + database

```bash
make setup
```

This copies `.env.example` → `.env` for both packages (won't overwrite existing) and applies D1 migrations to your local SQLite database. **No Cloudflare login required** for local development.

> Set `GEMINI_API_KEY` in `pagecraft-api/.env` — it's the only required variable for local development.

### 3. Start development

```bash
make dev
```

Starts the API (`localhost:8787`) and UI (`localhost:5173`) in a single terminal. Press `Ctrl+C` to stop both.

Or start them separately in two terminals:

```bash
npm --prefix pagecraft-api run dev   # Terminal 1 — API on :8787
npm --prefix pagecraft-ui run dev    # Terminal 2 — UI on :5173
```

### 4. Open the app

Visit **http://localhost:5173** in your browser.

---

## Available Scripts

### Root (project root)

| Command              | Description                                         |
| -------------------- | --------------------------------------------------- |
| `make install`       | Install deps for both packages                      |
| `make setup`         | Configure `.env` files + apply DB migrations        |
| `make dev`           | Start both API (`:8787`) and UI (`:5173`)           |
| `npm run dev:api`    | Start API only                                      |
| `npm run dev:ui`     | Start UI only                                       |
| `npm run test:api`   | Run API unit tests                                  |

### pagecraft-api

| Command                    | Description                                                                 |
| -------------------------- | --------------------------------------------------------------------------- |
| `npm run dev`              | Start Wrangler dev server (`:8787`)                                         |
| `npm run deploy`           | Deploy to Cloudflare Workers (`--minify`)                                   |
| `npm run cf-typegen`       | Regenerate `worker-configuration.d.ts` (run after editing `wrangler.jsonc`) |
| `npm run test`             | Run unit tests only                                                         |
| `npm run test:integration` | Run integration tests (needs `GEMINI_API_KEY` in `.env`)                    |
| `npm run test:all`         | Run all test suites                                                         |

### pagecraft-ui

| Command           | Description                                            |
| ----------------- | ------------------------------------------------------ |
| `npm run dev`     | Start Vite dev server (`:5173`)                        |
| `npm run build`   | Type-check + production build (`tsc -b && vite build`) |
| `npm run lint`    | Run ESLint across the codebase                         |
| `npm run preview` | Preview production build                               |

---

## Project Structure

```
Makefile                # Dev orchestration (install, setup, dev)
scripts/
  setup.mjs             # Setup automation script
package.json            # Root scripts (npm --prefix delegates)

pagecraft-api/          # Cloudflare Worker (Hono)
  src/
    index.ts            # Entrypoint, CORS, route mounting
    routes/             # Route handlers (art-styles, books, pages)
    services/           # Business logic (story, illustration, image)
    db/                 # D1 queries + static art-style data
    lib/                # Gemini client, R2 S3 client
    types/              # TypeScript interfaces (DB, AI)
  migrations/           # D1 SQL migrations
  public/art-styles/    # Static art style reference images
  wrangler.jsonc        # Worker config (bindings, routes)

pagecraft-ui/           # Vite + React 19
  src/
    pages/              # Route-level page components
    components/         # Reusable UI components
    hooks/              # Custom React hooks
    lib/                # Utility functions
  vite.config.ts        # Vite config (React, Tailwind, API proxy)
```

---

## API Routes

| Method | Path                                                   | Description                              |
| ------ | ------------------------------------------------------ | ---------------------------------------- |
| GET    | `/api/art-styles`                                      | List art presets                         |
| GET    | `/api/books`                                           | List all books                           |
| POST   | `/api/books`                                           | Create book + generate story             |
| GET    | `/api/books/:id`                                       | Get book with pages                      |
| DELETE | `/api/books/:id`                                       | Delete book (cascades pages + R2 images) |
| PUT    | `/api/books/:id/pages/:pageId/story`                   | Manual story edit                        |
| POST   | `/api/books/:id/pages/:pageId/story/regenerate`        | AI story regen with feedback             |
| POST   | `/api/books/:id/pages/:pageId/illustration`            | Generate illustration (sequential order) |
| POST   | `/api/books/:id/pages/:pageId/illustration/regenerate` | Regen illustration with feedback         |

---

## Troubleshooting

| Symptom                                     | Likely cause                    | Fix                                                                                   |
| ------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------- |
| `wrangler: command not found`               | Wrangler not installed           | Run with `npx wrangler` instead, or `npm install -g wrangler`                        |
| `✘ [ERROR] Could not find ... pagecraft-db` | D1 database not created          | Run `make setup` or `npx wrangler d1 create pagecraft-db` for deploy                  |
| `SQLITE_ERROR: no such table: books`        | Migrations not applied           | Run `make setup` or `npx wrangler d1 migrations apply pagecraft-db --local`           |
| CORS error in browser console               | `FRONTEND_URL` mismatch         | Set `FRONTEND_URL=http://localhost:5173` in `pagecraft-api/.env`                      |
| `401 Unauthorized` from Gemini              | Missing or invalid API key      | Check `GEMINI_API_KEY` in `pagecraft-api/.env`                                        |
| Illustration generation fails silently      | R2 credentials not configured   | Set `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` in `pagecraft-api/.env` |
| `Cannot GET /`                              | API server not running          | Ensure `npm run dev` is running in `pagecraft-api/`                                   |
| UI shows blank page                         | Vite not proxying correctly     | Verify `VITE_API_BASE_URL` in `pagecraft-ui/.env` is `http://localhost:8787`          |

---

## Deploy

```bash
# API — deploy to Cloudflare Workers
cd pagecraft-api
npm run deploy

# UI — build and deploy your Vite output to Cloudflare Pages
cd pagecraft-ui
npm run build
```

For production, ensure Cloudflare resources exist on your account:

```bash
npx wrangler login
npx wrangler d1 create pagecraft-db          # save the returned ID
npx wrangler r2 bucket create pagecraft-images
```

Then update `wrangler.jsonc` with your D1 database ID and run `npm run cf-typegen`.

---

_No authentication — intentionally anonymous._
