-- Supabase-specific bits that can't live in Prisma migrations
-- because Prisma's shadow database lacks Supabase's `auth` schema.
-- Apply this once against your Supabase project after `pnpm db:migrate`:
--   pnpm db:policies
-- or paste into Supabase Dashboard → SQL Editor → Run.

-- ── Sync auth.users → public.users on signup ──────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, "createdAt", "updatedAt")
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'MEMBER',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Row Level Security ────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (idempotent re-apply)
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_select_privileged" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;

-- Users can read their own row.
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Owners / admins can read every user row.
CREATE POLICY "users_select_privileged" ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('OWNER', 'ADMIN')
    )
  );

-- Users can update their own profile (name, avatar).
-- Role changes are enforced at the app layer (requireRole).
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE
  USING (auth.uid() = id);
