-- bram.pages — content schema
-- run this once in the supabase dashboard → sql editor.
-- public pages read with the anon key (rls below), the /admin dashboard
-- writes with your authenticated supabase account.

-- ── my works ────────────────────────────────────────────
create table if not exists public.works (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  year text not null default '',
  stack text[] not null default '{}',
  desc text not null default '',
  detail text not null default '',
  image text,
  link text,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

-- ── more about me (experience drawer) ──────────────────
create table if not exists public.experience (
  id uuid primary key default gen_random_uuid(),
  period text not null default '',
  title text not null,
  place text not null default '',
  desc text not null default '',
  detail text not null default '',
  image text,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

-- ── skills (hard + soft in one table) ───────────────────
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pct int not null default 0 check (pct between 0 and 100),
  icon text not null default '',
  desc text not null default '',
  kind text not null default 'hard' check (kind in ('hard', 'soft')),
  sort int not null default 0,
  created_at timestamptz not null default now()
);

-- ── blog posts ──────────────────────────────────────────
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  date text not null default '',
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  sort int not null default 0,
  created_at timestamptz not null default now()
);

-- ── testimonials ────────────────────────────────────────
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  message text not null,
  rating int check (rating between 1 and 5),
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── contact links (contact section + footer row) ───────
create table if not exists public.contact_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,          -- github | email | whatsapp | instagram | reddit | ...
  label text not null,
  url text not null,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

-- ── row level security ─────────────────────────────────
alter table public.works enable row level security;
alter table public.experience enable row level security;
alter table public.skills enable row level security;
alter table public.posts enable row level security;
alter table public.testimonials enable row level security;
alter table public.contact_links enable row level security;

-- everyone can read published content
create policy "public read works" on public.works for select using (true);
create policy "public read experience" on public.experience for select using (true);
create policy "public read skills" on public.skills for select using (true);
create policy "public read posts" on public.posts for select using (true);
create policy "public read links" on public.contact_links for select using (true);

-- testimonials: anon reads only approved ones, but anyone may submit
create policy "public read approved testimonials" on public.testimonials
  for select using (approved = true);
create policy "anyone can submit a testimonial" on public.testimonials
  for insert to anon with check (approved = false);

-- your admin account manages everything (create the user in
-- dashboard → authentication, and turn off open signups)
create policy "admin manages works" on public.works for all to authenticated using (true) with check (true);
create policy "admin manages experience" on public.experience for all to authenticated using (true) with check (true);
create policy "admin manages skills" on public.skills for all to authenticated using (true) with check (true);
create policy "admin manages posts" on public.posts for all to authenticated using (true) with check (true);
create policy "admin manages testimonials" on public.testimonials for all to authenticated using (true) with check (true);
create policy "admin manages links" on public.contact_links for all to authenticated using (true) with check (true);
