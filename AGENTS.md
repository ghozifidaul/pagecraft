# OpenCode Instructions for PageCraft

## Architecture
See `SYSTEM-DESIGN.md` for the project's data flow, API definitions, and database schema.

## Development

All work is in the `pagecraft-api/` directory.

- **Commands** (in `pagecraft-api/`):
  - `npm run dev`: Start development server.
  - `npm run deploy`: Deploy to Cloudflare.
  - `npm run cf-typegen`: Sync Worker bindings.
  - `npm run test:all`: Run all test suites.

## Conventions

- **Hono Bindings**: When creating Hono instances, include bindings:
  ```typescript
  const app = new Hono<{ Bindings: CloudflareBindings }>()
  ```
- **Type Safety**: Always run `npm run cf-typegen` if changing worker config (`wrangler.jsonc`).
