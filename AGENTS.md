# OpenCode Instructions for PageCraft

**Do not create commits unless the user explicitly asks.**

## Architecture
See `SYSTEM-DESIGN.md` for data flow, API definitions, and database schema.

## Development
All code is in `pagecraft-api/`. The Worker entrypoint is `src/index.ts`, which mounts three Hono routers under `/api/art-styles`, `/api/books`, and `/api/books` (pages router shares the books prefix).

Routes → `src/routes/`, database access → `src/db/`, business logic → `src/services/`, infra helpers → `src/lib/`.

### Commands (run in `pagecraft-api/`)
- `npm run dev` — start dev server via `wrangler dev`
- `npm run deploy` — `wrangler deploy --minify`
- `npm run cf-typegen` — sync Worker bindings (run after editing `wrangler.jsonc`)
- `npm run test` — unit tests only (`story.service.test.ts`)
- `npm run test:watch` — watch mode for unit tests
- `npm run test:integration` — integration test (`story.service.integration.test.ts`, requires `GEMINI_API_KEY` in `.env`)
- `npm run test:all` — all test suites

### Testing
- **Unit tests** mock `globalThis.fetch` to stub the Gemini Interactions API. Route tests mock all DB and service modules with `vi.mock()`.
- **Integration tests** call the real Gemini API. They use `it.skipIf` — they are silently skipped when `GEMINI_API_KEY` is unset.
- Test setup (`vitest.config.ts`) loads `.env` via `dotenv`. Timeout: 30s.
- Test files live in `__tests__` directories next to their source code.

### Key Gotchas
- **Hono bindings**: Always type Hono with `<{ Bindings: CloudflareBindings }>`.
- **Gemini models**: Story generation uses `gemini-3.1-flash-lite`, illustration uses `gemini-3.1-flash-image`. Both via the Interactions API (`v1beta/interactions`). Uses structured output (JSON schema) for story gen, image output for illustrations.
- **R2**: Bucket `pagecraft-images`, binding `IMAGE_BUCKET` (`R2Bucket`). Images are stored at `books/{bookId}/pages/{pageId}/{timestamp}.png`. Signed URLs (1h expiry) are generated via S3-compatible API — requires `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT` env vars.
- **D1**: Binding `pagecraft_db`. Schema in `migrations/0001_create_books_and_pages.sql`. Cascade deletes from `books` → `pages` (but NOT to R2 — image cleanup is the caller's responsibility).
- **No auth** — the app is intentionally anonymous for portfolio use.
- **Frontend** is a Vite app in `public/`, served as Worker assets.

### Route Reference
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/art-styles` | List art presets |
| GET | `/api/books` | List all books |
| POST | `/api/books` | Create book + generate story |
| GET | `/api/books/:id` | Get book with pages |
| DELETE | `/api/books/:id` | Delete book (cascades pages, NOT R2 images — TODO) |
| PUT | `/api/books/:id/pages/:pageId/story` | Manual story edit |
| POST | `/api/books/:id/pages/:pageId/story/regenerate` | AI story regen with feedback |
| POST | `/api/books/:id/pages/:pageId/illustration` | Generate illustration (sequential order enforced) |
| POST | `/api/books/:id/pages/:pageId/illustration/regenerate` | Regen illustration with feedback |
