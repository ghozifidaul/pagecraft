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
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) installed globally:
  ```bash
  npm install -g wrangler
  ```
- A [Gemini API key](https://aistudio.google.com/apikey) (free tier works for story generation but only paid tier works for illustration generation)

## Quick Start

Estimated time: **~12 minutes**.

### 1. Install API dependencies

```bash
cd pagecraft-api
npm install
```

### 2. Install UI dependencies

```bash
cd ../pagecraft-ui
npm install
```

### 3. Set up the database

Create the database in your Cloudflare account (this registers the database metadata that Wrangler needs):

```bash
cd ../pagecraft-api
npx wrangler d1 create pagecraft-db
```

Save the returned database UUID — you'll need it for deployment. The ID in `wrangler.jsonc` is pre-filled as a placeholder.

Then apply the schema to your **local** SQLite database:

```bash
npx wrangler d1 migrations apply pagecraft-db --local
```

This creates a local SQLite database at `.wrangler/state/v3/d1/` and runs the migration (`migrations/0001_create_books_and_pages.sql`).

> After the initial `wrangler d1 create` step, all local development runs entirely on your machine. No ongoing Cloudflare account needed.

### 4. Configure environment

**API** — copy and fill the template:

```bash
cp .env.example .env
```

| Variable               | Required | Default                 | Description                      |
| ---------------------- | -------- | ----------------------- | -------------------------------- |
| `GEMINI_API_KEY`       | Yes      | —                       | Gemini API key for AI generation |
| `FRONTEND_URL`         | Yes      | `http://localhost:5173` | CORS allowed origin              |
| `R2_ENDPOINT`          | No\*     | —                       | R2 S3-compatible endpoint        |
| `R2_ACCESS_KEY_ID`     | No\*     | —                       | R2 access key                    |
| `R2_SECRET_ACCESS_KEY` | No\*     | —                       | R2 secret key                    |

\* R2 vars are only needed for illustration generation. The app works without them for book creation and story editing.

**UI** — copy and fill the template:

```bash
cd ../pagecraft-ui
cp .env.example .env
```

| Variable            | Required | Default                 | Description  |
| ------------------- | -------- | ----------------------- | ------------ |
| `VITE_API_BASE_URL` | Yes      | `http://localhost:8787` | API base URL |

### 5. Start the API

Open **Terminal 1**:

```bash
cd pagecraft-api
npm run dev
```

The API starts at `http://localhost:8787`. Verify it works:

```bash
curl http://localhost:8787/api/art-styles
```

### 6. Start the UI

Open **Terminal 2**:

```bash
cd pagecraft-ui
npm run dev
```

The UI starts at `http://localhost:5173`. Vite proxies `/api` and `/art-styles` requests to the API.

### 7. Open the app

Visit **http://localhost:5173** in your browser.

---

## Available Scripts

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
| `wrangler: command not found`               | Wrangler not installed globally | `npm install -g wrangler`                                                             |
| `✘ [ERROR] Could not find ... pagecraft-db` | D1 database not created         | Run `npx wrangler d1 create pagecraft-db` first (step 3a)                             |
| `SQLITE_ERROR: no such table: books`        | Migrations not applied          | Run `npx wrangler d1 migrations apply pagecraft-db --local` — ensure step 3b was run  |
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
