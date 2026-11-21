-- bram.pages — seed data
-- run in supabase dashboard → sql editor (after schema.sql).
-- fills every table with the same content the site shows today, so the
-- database becomes the source of truth and /admin takes over from here.

-- ── works ───────────────────────────────────────────────
insert into public.works (title, year, stack, description, detail, image, link, sort) values
(
  'pages', '2025',
  '{"next.js","typescript","gsap","locomotive"}',
  'this portfolio. a monochrome workbench with a draggable hero card, an ascii dinosaur, and far too much motion.',
  'built as one long scroll: gsap timelines for every transition, locomotive for the glide, and a pixel grid breathing behind everything. the hero card can be grabbed and thrown anywhere on screen. every section is an excuse to push typography a little too far.',
  '/img/project-pages.svg',
  'https://github.com/bramikoko',
  0
),
(
  'reddev', '2024',
  '{"react","node","postgres"}',
  'internal tooling for a small studio — dashboards, crud, and the boring glue that keeps a team moving.',
  'role-based dashboards, a booking flow, and a reporting layer that replaced a spreadsheet nobody loved. mostly plumbing, but plumbing that people open every morning.',
  '/img/project-reddev.svg',
  null,
  1
),
(
  'lab', '2024',
  '{"typescript","canvas","webgl"}',
  'a dumping ground for experiments — shaders, generative grids, physics toys. most of it dies young.',
  'small self-contained sketches: flow fields, ascii renderers, spring physics. a few graduate into real projects. the rest live here as receipts.',
  '/img/project-lab.svg',
  null,
  2
);

-- ── experience (more about me) ─────────────────────────
insert into public.experience (period, title, place, description, detail, image, sort) values
(
  '2024 — now', 'frontend dev', 'reddev',
  'building client-facing interfaces and the internal tools around them.',
  'react frontends against node services, design-system-ish component work, and enough css archaeology to last a lifetime. shipped dashboards, booking flows and a reporting layer.',
  '/img/exp-reddev.svg', 0
),
(
  '2022 — 2024', 'computer science', 'banjarmasin',
  'formal detour into theory: algorithms, databases, networks.',
  'the useful parts: data structures, sql, and learning that reading error messages beats guessing. the rest i taught myself at 2am.',
  '/img/exp-school.svg', 1
),
(
  '2021 — now', 'self taught', 'the internet',
  'docs, source code, and an unreasonable number of side projects.',
  'typescript before javascript, breaking things before understanding them. every project on this page started as one of these late-night experiments.',
  '/img/exp-self.svg', 2
),
(
  '2023', 'event crew', 'local tech community',
  'helping run workshops and meetups for the local dev scene.',
  'set-up, slides, troubleshooting other people''s laptops. learned more about explaining things than about code — which turned out to be the point.',
  '/img/exp-org.svg', 3
);

-- ── skills ──────────────────────────────────────────────
insert into public.skills (name, pct, icon, description, kind, sort) values
('typescript', 92, 'typescript', 'the default language for everything i touch — strict mode, no excuses.', 'hard', 0),
('react / next', 90, 'react', 'components, server components, and the mental model that holds them together.', 'hard', 1),
('node / bun', 84, 'nodedotjs', 'apis, scripts, and small services. bun for speed, node for boring reliability.', 'hard', 2),
('css / gsap', 88, 'css', 'layout is the easy part — motion is where the real hours go.', 'hard', 3),
('prisma / sql', 80, 'prisma', 'schema design, migrations, and queries that don''t fight the database.', 'hard', 4),
('vue', 72, 'vuedotjs', 'enough to be dangerous — used it for a couple of client dashboards.', 'hard', 5),
('git / ci', 86, 'git', 'branch discipline, rebase fluency, pipelines that catch me when i''m sloppy.', 'hard', 6),
('linux', 78, 'linux', 'daily driver. dotfiles versioned, shell history embarrassing.', 'hard', 7),
('problem solving', 90, '', 'i read error messages. all of them. it''s a superpower apparently.', 'soft', 0),
('communication', 82, '', 'translating between what a client said and what they actually meant.', 'soft', 1),
('teamwork', 85, '', 'small teams, honest code review, no ego in the diff comments.', 'soft', 2),
('adaptability', 80, '', 'new stack, new constraint, new requirement mid-sprint — fine.', 'soft', 3),
('curiosity', 95, '', 'the reason this page exists. also the reason i sleep late.', 'soft', 4);

-- ── blog posts (body paragraphs split on blank lines) ──
insert into public.posts (date, title, excerpt, body, sort) values
(
  '2025-11-20', 'why i rebuilt my portfolio from scratch',
  'same design language, new foundation. notes on moving house while the furniture is still warm.',
  'the old portfolio worked. that was the problem — it worked just well enough that i stopped touching it, and a portfolio you stop touching is a museum piece.

so i moved the frontend into a fresh project, kept every pixel decision that survived a year of staring, and left the data layer behind on purpose. content will come from a real database this time, wired in properly instead of bolted on.

the rule for the rebuild: nothing gets copied over unless i''d defend it in a code review. the draggable hero card survived. the ascii dinosaur was never in danger.',
  0
),
(
  '2025-10-08', 'motion is a language, not decoration',
  'gsap timelines as grammar — how easing choices change what a page says.',
  'a slow expo ease says one thing is finishing and another is beginning. an elastic snap says this object has weight and you surprised it. neither is decoration; both are sentences.

the trick is restraint: pick a few eases, reuse them everywhere, and let duration carry the meaning. a page where every element invents its own timing reads like a room where everyone talks at once.',
  1
),
(
  '2025-09-14', 'ascii is an aesthetic and i will not apologize',
  'why a terminal dinosaur, blocky progress meters, and monospace everything make a page feel alive.',
  'pixel fonts and ascii ornaments get dismissed as nostalgia, but they do something photos can''t: they admit the page is made of characters. it''s honesty as a design choice.

also, a dinosaur that jumps when you press space is worth more than any hero video. fight me.',
  2
);

-- ── testimonials (approved → visible on the site) ──────
insert into public.testimonials (name, role, message, rating, approved) values
(
  'client from reddev', 'product lead',
  'took a vague brief and turned it into a dashboard the whole team actually uses. fast, precise, zero drama.',
  5, true
),
(
  'rizky', 'backend dev',
  'the only frontend person i''ve worked with who reads the api docs before complaining about them.',
  5, true
),
(
  'anonymous teammate', null,
  'reviewed my pr at 1am and left kinder comments than i deserved. would ship with again.',
  4, true
);

-- ── contact links (contact section + footer row) ───────
insert into public.contact_links (platform, label, url, sort) values
('github', 'github.com/bramikoko', 'https://github.com/bramikoko', 0),
('email', 'punyaibra@gmail.com', 'mailto:punyaibra@gmail.com', 1),
('whatsapp', '+62 857-0563-7498', 'https://wa.me/6285705637498', 2),
('instagram', 'instagram.com/bramikoko', 'https://instagram.com/bramikoko', 3),
('reddit', 'reddit.com/u/bramikoko', 'https://reddit.com/user/bramikoko', 4),
('linkedin', 'linkedin.com/in/bramikoko', 'https://linkedin.com/in/bramikoko', 5);

notify pgrst, 'reload schema';
