# AGENTS.md

## Commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` (port 4321) |
| Build | `npm run build` |
| Lint | `npm run lint` / `npm run lint:fix` |
| Format | `npm run format` / `npm run format:check` |
| Test | `npm run test` |

**Order matters:** Run `npm run build` before `npm run test`. Tests use `astro:content` which requires the content store at `.astro/data-store.json`, generated during build.

There is no standalone typecheck script. TypeScript is validated via `astro build`.

## Code Style

- **Prettier uses double quotes** (`singleQuote: false`), `printWidth: 100`, trailing commas (`es5`).
- Path alias: `@/*` → `src/*` (configured in `tsconfig.json`).
- Unused vars prefixed with `_` are allowed (ESLint warn, not error).

## Content Collections

Defined in `src/content.config.ts` with Zod schemas. Three collections: `blog`, `projects`, `team`.

- Blog `author` is a strict enum: `"Alfonso Garcia"` or `"AI"`. Other values will fail validation.
- Blog `draft` defaults to `false`; draft posts are still loaded by `getCollection` — filter in page code.
- Content files are MDX/Markdown under `src/content/{blog,projects,team}/`.

## Deployment

- **Vercel** SSG. `main` → labitcode.com, `development` → labitcode.vercel.app.
- `PUBLIC_INDEXING_ENABLED=true` (production only) enables search engine indexing via dynamic `robots.txt.ts`. Defaults to disallow.

## Architecture Notes

- `src/pages/search-index.json.ts` generates a local search index at build time — no external search service.
- `src/consts.ts` holds site-wide constants (`SITE_TITLE`, `SITE_DESCRIPTION`).
- All components are `.astro` files (no React in production, React plugin is only for Vitest).
