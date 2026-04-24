# Next Supabase Web

A reusable Next.js 16 + Supabase + Prisma scaffold for internal tools and SaaS apps. Single app today, monorepo-ready layout.

See [`CLAUDE.md`](./CLAUDE.md) for the full working guide (conventions, gotchas, commands).

## Stack

- **Framework**: Next.js 16 (app router) · React 19 · TypeScript strict + `noUncheckedIndexedAccess`
- **Auth**: Supabase (`@supabase/ssr`) with middleware-refreshed sessions
- **DB**: Supabase Postgres via Prisma 7 (+ `@prisma/adapter-pg`)
- **UI**: Tailwind v4 · shadcn/ui primitives
- **Data**: React Query 5 for client state; server actions for mutations
- **Lint/format**: Biome 2 (ESLint-free) + Husky + lint-staged
- **Tests**: Vitest
- **Deploy**: Vercel on merge (no separate CI — the PR preview build is the gate)

## First run

1. Install deps:
   ```bash
   pnpm install
   ```
2. Copy env and fill in:
   ```bash
   cp .env.example .env.local
   ```
3. Generate the Prisma client (required before `dev`, `typecheck`, and `test`):
   ```bash
   pnpm db:generate
   ```
4. Apply Prisma migrations (tables, enums, indexes):
   ```bash
   pnpm db:migrate
   ```
5. Apply Supabase-specific bits (RLS policies + `auth.users` → `public.users` trigger):
   ```bash
   pnpm db:policies
   ```
   These live in `supabase/policies.sql` because they reference `auth.uid()` and `auth.users`, which Prisma's shadow database can't validate. Re-running is idempotent.
6. Dev:
   ```bash
   pnpm dev
   ```
7. Create your first user — Supabase Dashboard → Authentication → Users → **Add user** (tick *Auto Confirm User*). The `on_auth_user_created` trigger inserts a matching row into `public.users` with role `MEMBER`.
8. Promote that user to OWNER (needed for admin-gated features):
   ```bash
   pnpm exec tsx scripts/promote-owner.ts            # promotes the earliest-created user
   pnpm exec tsx scripts/promote-owner.ts you@x.com  # or target by email
   ```

## Layout

```
app/
  (auth)/            # login, signup, reset-password
  (platform)/        # authenticated area
  providers.tsx      # React Query + theme
  layout.tsx
  globals.css
components/
  ui/                # shadcn primitives
lib/
  auth/guards.ts     # getCurrentUser (cached) + requireRole
  env.ts             # Zod-validated env (server + client)
  prisma.ts
  query/client.ts    # QueryClient factory (SSR-safe)
  queries/           # domain useQuery hooks
  supabase/
    client.ts        # browser client
    server.ts        # RSC / server action client
    middleware.ts    # session refresh + redirects
  utils.ts
middleware.ts        # wires supabase/middleware.ts
prisma/
  schema.prisma
  migrations/        # includes RLS policies on day one
```

## Conventions

- **Server-first**: default to RSC + server actions for writes; reach for React Query only when the client needs filtering, pagination, or optimistic updates.
- **Auth**: `getCurrentUser()` is `cache()`-wrapped, so calling it repeatedly in one request is free. Use `requireRole(user, "OWNER", "ADMIN")` to gate actions.
- **RLS**: every new table gets `ENABLE ROW LEVEL SECURITY` + at least one `CREATE POLICY` in the same migration. App-layer guards are defense-in-depth, not the only line.
- **Env**: add new vars to the Zod schema in `lib/env.ts` and to `.env.example`. Missing vars fail the app at boot.

## Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Prisma generate + Next dev server |
| `pnpm build` | Prisma generate + Next build |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` / `lint:fix` | Biome check (+ autofix) |
| `pnpm test` | Vitest run |
| `pnpm db:migrate` | Apply migrations to the database from `DIRECT_URL` |
| `pnpm db:studio` | Prisma Studio |
