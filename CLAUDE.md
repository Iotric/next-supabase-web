# CLAUDE.md

Guidance for Claude Code (and future-me) working on this repo.

## What this is

A reusable scaffold for building internal tools / SaaS apps with:

- **Next.js 16** (app router, React 19, TypeScript strict + `noUncheckedIndexedAccess`)
- **Supabase** auth + Postgres (via `@supabase/ssr`)
- **Prisma 7** ORM (via `@prisma/adapter-pg`)
- **Tailwind v4** + **shadcn/ui** (new-york style, neutral base)
- **React Query 5** for client-side data (server-first default, React Query for filtering/pagination/optimistic)
- **Biome 2** for lint+format (no ESLint, no Prettier)
- **Vitest 3** for unit tests
- **Husky + lint-staged** for pre-commit

Deploy target is **Vercel on merge** — there is deliberately no GitHub Actions CI. The PR preview build is the gate.

## Why this stack (context for design decisions)

Forked from the intersection of two internal repos (`tasktric`, `new-saas`) — adopting the best of each and fixing their gaps:

- From tasktric: Supabase SSR pattern, cached `getCurrentUser`, Prisma + server actions.
- From new-saas: Biome, Husky, strict tsconfig base.
- Net-new (neither had): Zod runtime env validation, RLS policies from day one, split Prisma/Supabase migration strategy.

## Non-obvious things to know

### Migrations are split between Prisma and Supabase on purpose

Prisma's `migrate dev` uses a **shadow database** (throwaway Postgres) to validate migrations. The shadow DB does **not** have Supabase's `auth` schema, so any SQL referencing `auth.uid()` or `auth.users` fails validation.

So:
- **`prisma/migrations/`** — plain schema only (tables, columns, enums, indexes). NO RLS, NO triggers on `auth.*`.
- **`supabase/policies.sql`** — everything that touches `auth.*`: the `handle_new_user` trigger, all RLS policies. Applied via `pnpm db:policies`, idempotent (`DROP ... IF EXISTS` guards).

When adding new tables:
1. Add them to `prisma/schema.prisma` → `pnpm db:migrate` (pure DDL).
2. Append `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` + `CREATE POLICY` blocks to `supabase/policies.sql` → `pnpm db:policies`.
3. RLS is not optional — the defense-in-depth assumption is that every table has it.

### Env validation is runtime, not build-time

`lib/env.ts` parses `process.env` through Zod at module load. Missing vars → the app throws at boot (or during `next build`) with a named-field error. **Add every new var to both `lib/env.ts` schema AND `.env.example`.**

Server-only vars (like `DATABASE_URL`) are gated behind `typeof window === "undefined"` so the client bundle stays clean.

### Prisma client output is gitignored

`generated/` is not committed. Anyone cloning must run `pnpm db:generate` (or `pnpm dev` / `pnpm build`, which run it) before `pnpm typecheck` / `pnpm test` will work — otherwise the `@/generated/prisma/client` import resolves to nothing.

### Auth flow, end-to-end

1. `middleware.ts` runs on every request, calls `lib/supabase/middleware.ts::updateSession`, which refreshes cookies and redirects unauthenticated users to `/login`.
2. Server components / server actions call `getCurrentUser()` from `lib/auth/guards.ts`. It's `cache()`-wrapped, so repeat calls in one request are free.
3. `requireRole(user, "OWNER", "ADMIN")` throws `AuthorizationError`. App currently lets these bubble; wrap in try/catch where you want friendly messages.
4. On signup, the `on_auth_user_created` trigger inserts a matching row into `public.users` with role `MEMBER`. Use `pnpm exec tsx scripts/promote-owner.ts [email]` to elevate.

### `middleware.ts` is deprecation-warned

Next 16 prefers a `proxy.ts` convention. `middleware.ts` still works and is what tasktric uses. Swap when Next's migration docs stabilize.

## Conventions

- **Server-first**: default to RSC + server actions for writes. Reach for React Query only when the client needs filtering, pagination, or optimistic updates. Don't duplicate — an RSC `await` is simpler than a `useQuery` if the data isn't interactive.
- **Types from Prisma**: prefer importing types from `@/generated/prisma/client` for DB shapes. For auth, use the `AuthUser` type from `lib/auth/guards.ts` (decoupled from Prisma so tests don't depend on generated output).
- **No `any`**: Biome enforces `noExplicitAny: error`. Use `unknown` + narrowing, or proper types.
- **Route groups**: `(auth)` for unauthenticated flows (`/login`, `/signup`, `/reset-password`); `(platform)` for the app itself. Add a new group for marketing pages if needed (e.g. `(marketing)`).
- **Colocated private components**: under a route, use `_components/` prefix — Next ignores `_`-prefixed folders for routing.
- **`@/*` path alias**: always use absolute imports (e.g. `@/lib/supabase/server`), never relative `../../lib/...`.

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Prisma generate + Next dev server |
| `pnpm build` | Prisma generate + Next build |
| `pnpm typecheck` | `tsc --noEmit` (strict) |
| `pnpm lint` / `lint:fix` | Biome check (+ autofix) |
| `pnpm test` | Vitest run |
| `pnpm db:migrate` | Apply Prisma migrations (uses `DIRECT_URL`) |
| `pnpm db:deploy` | Like `db:migrate` but prod-safe (no schema drift prompts) |
| `pnpm db:policies` | Apply `supabase/policies.sql` (RLS + auth trigger) |
| `pnpm db:studio` | Prisma Studio |

## Directory map

```
app/
  (auth)/            # login, signup, reset-password — unauthed layout
  (platform)/        # authed layout (calls getCurrentUser in layout.tsx)
    _components/     # route-private components (dashboard header, cards, etc.)
  providers.tsx      # React Query + next-themes + sonner Toaster
  layout.tsx
  globals.css        # Tailwind v4 + @theme tokens + oklch colors
components/
  ui/                # shadcn primitives — add more via `npx shadcn@latest add <name>`
lib/
  auth/guards.ts     # getCurrentUser (cached) + requireRole + AuthUser type
  env.ts             # Zod-validated env (server + client halves)
  prisma.ts          # Prisma singleton (dev HMR-safe)
  query/client.ts    # QueryClient factory (SSR-safe: per-request on server)
  queries/           # domain useQuery hooks
  supabase/
    client.ts        # browser Supabase client
    server.ts        # RSC / server action Supabase client
    middleware.ts    # session refresh + auth redirect logic
  utils.ts           # `cn()` helper
middleware.ts        # wires supabase/middleware.ts
prisma/
  schema.prisma      # plain schema only
  migrations/        # plain DDL only (no auth.* refs)
scripts/
  promote-owner.ts   # bootstrap the first OWNER user
supabase/
  policies.sql       # RLS + auth.users trigger (idempotent)
components.json      # shadcn CLI config
biome.json           # lint/format rules
vitest.config.ts
prisma.config.ts     # loads .env.local → Prisma CLI
```

## First-run checklist (new clone)

1. `pnpm install`
2. `cp .env.example .env.local` and fill in all four Supabase-related values (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `DATABASE_URL`, `DIRECT_URL`).
3. `pnpm db:migrate` — creates the `users` table.
4. `pnpm db:policies` — installs the auth trigger + RLS policies. **Do not skip this.**
5. Create a user in Supabase Dashboard → Authentication → Users → Add user (tick auto-confirm).
6. Sign in at `http://localhost:3000/login`.
7. Optional: `pnpm exec tsx scripts/promote-owner.ts` to make yourself OWNER.

## When extending this scaffold

- **Adding a shadcn component**: `npx shadcn@latest add <name>` — `components.json` is pre-configured.
- **Adding a table**: update `prisma/schema.prisma`, run `pnpm db:migrate` (generates migration SQL), then append RLS to `supabase/policies.sql` and run `pnpm db:policies`.
- **Adding an env var**: add to `.env.example` + `lib/env.ts` Zod schema (server or client half). Access via `env.X`, never `process.env.X` in app code.
- **Adding a role**: extend the `UserRole` enum in `prisma/schema.prisma` AND `lib/auth/guards.ts` (the type literal). Both are intentionally duplicated to decouple tests from Prisma generation.

## Things to NOT do

- Don't put `auth.uid()` / `auth.users` references in Prisma migrations — they'll break `migrate dev` via shadow DB.
- Don't commit `.env.local` or `generated/` (both gitignored).
- Don't bypass `getCurrentUser()` — every authed route relies on it for the cached user lookup.
- Don't use `process.env.X` in app code; use `env.X` from `lib/env.ts` so missing vars fail loudly.
- Don't add GitHub Actions CI unless the project genuinely needs more than Vercel's preview build (lint, tests, DB migrations against staging). For solo/internal tools, Vercel is enough.
