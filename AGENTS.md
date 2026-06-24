# OpenCode Instructions for PageCraft

## Architecture
See `SYSTEM-DESIGN.md` for the project's data flow, API definitions, and database schema.

## Development
All work is in the `pagecraft-api/` directory.

- **Commands** (in `pagecraft-api/`):
  - `npm run dev`: Start development server.
  - `npm run deploy`: Deploy to Cloudflare.
  - `npm run cf-typegen`: Sync Worker bindings (updates `worker-configuration.d.ts`).
  - `npm run test:all`: Run all test suites.

## Conventions & Gotchas
- **Hono Bindings**: Always include bindings when creating Hono instances:
  ```typescript
  const app = new Hono<{ Bindings: CloudflareBindings }>()
  ```
- **Type Safety**: Run `npm run cf-typegen` if changing `wrangler.jsonc`.
- **Cloudflare R2**:
  - Bucket: `pagecraft-images`
  - Binding: `IMAGE_BUCKET` (`R2Bucket`)
