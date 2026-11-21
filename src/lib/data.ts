// static identity — content (works, experience, skills, blog,
// testimonials, links) lives in the database and is managed via prisma.
// github source: https://github.com/bramikoko

export const GITHUB = "https://github.com/bramikoko";
export const EMAIL = "punyaibra@gmail.com";
export const INSTAGRAM = "https://instagram.com/bramikoko";
export const REDDIT = "https://reddit.com/user/bramikoko";
export const LINKEDIN = "https://linkedin.com/in/bramikoko";
export const WHATSAPP = "https://wa.me/6285705637498";

export const profile = {
  name: "bram",
  handle: "bramikoko",
  role: "fullstack web dev",
  bio: "fullstack web dev yay",
  location: "banjarmasin, id",
  company: "reddev",
  followers: 20,
  following: 23,
  repos: 2,
  avatar: "https://avatars.githubusercontent.com/u/179669589?v=4",
  url: GITHUB,
};

export const heroHookLines = ["i build things", "for the web."];

export const heroDesc =
  "fullstack developer from banjarmasin. i turn caffeine into interfaces, " +
  "and interfaces into products. this page is my workbench.";

export type Project = {
  id: string;
  title: string;
  year: string;
  stack: string[];
  desc: string;
  detail: string;
  image?: string;
  link?: string;
};
export type Skill = {
  name: string;
  pct: number;
  icon: string;
  desc: string;
};
export type Experience = {
  period: string;
  title: string;
  place: string;
  desc: string;
  detail: string;
  image?: string;
};
export type BlogPost = {
  id: string;
  date: string;
  title: string;
  excerpt: string;
  body: string[];
};

export const navLinks = [
  { label: "bring me to hero", href: "#hero" },
  { label: "about", href: "#about" },
  { label: "skills", href: "#skills" },
  { label: "blog", href: "#blog" },
  { label: "testimony", href: "#testimony" },
  { label: "contact", href: "#contact" },
];

// ── temp sample content ─────────────────────────────────────────
// the database is being restructured — until the new data layer
// lands, the ui renders these local samples. delete this whole
// block once real data sources exist.

export const sampleWorks: (Omit<Project, "id"> & { id: number })[] = [
  {
    id: 1,
    title: "pages",
    year: "2025",
    stack: ["next.js", "typescript", "gsap", "locomotive"],
    desc: "this portfolio. a monochrome workbench with a draggable hero card, an ascii dinosaur, and far too much motion.",
    detail:
      "built as one long scroll: gsap timelines for every transition, locomotive for the glide, and a pixel grid breathing behind everything. the hero card can be grabbed and thrown anywhere on screen. every section is an excuse to push typography a little too far.",
    image: "/img/project-pages.svg",
    link: GITHUB,
  },
  {
    id: 2,
    title: "reddev",
    year: "2024",
    stack: ["react", "node", "postgres"],
    desc: "internal tooling for a small studio — dashboards, crud, and the boring glue that keeps a team moving.",
    detail:
      "role-based dashboards, a booking flow, and a reporting layer that replaced a spreadsheet nobody loved. mostly plumbing, but plumbing that people open every morning.",
    image: "/img/project-reddev.svg",
  },
  {
    id: 3,
    title: "lab",
    year: "2024",
    stack: ["typescript", "canvas", "webgl"],
    desc: "a dumping ground for experiments — shaders, generative grids, physics toys. most of it dies young.",
    detail:
      "small self-contained sketches: flow fields, ascii renderers, spring physics. a few graduate into real projects. the rest live here as receipts.",
    image: "/img/project-lab.svg",
  },
];

export const sampleExperience: (Experience & { id: number })[] = [
  {
    id: 1,
    period: "2024 — now",
    title: "frontend dev",
    place: "reddev",
    desc: "building client-facing interfaces and the internal tools around them.",
    detail:
      "react frontends against node services, design-system-ish component work, and enough css archaeology to last a lifetime. shipped dashboards, booking flows and a reporting layer.",
    image: "/img/exp-reddev.svg",
  },
  {
    id: 2,
    period: "2022 — 2024",
    title: "computer science",
    place: "banjarmasin",
    desc: "formal detour into theory: algorithms, databases, networks.",
    detail:
      "the useful parts: data structures, sql, and learning that reading error messages beats guessing. the rest i taught myself at 2am.",
    image: "/img/exp-school.svg",
  },
  {
    id: 3,
    period: "2021 — now",
    title: "self taught",
    place: "the internet",
    desc: "docs, source code, and an unreasonable number of side projects.",
    detail:
      "typescript before javascript, breaking things before understanding them. every project on this page started as one of these late-night experiments.",
    image: "/img/exp-self.svg",
  },
  {
    id: 4,
    period: "2023",
    title: "event crew",
    place: "local tech community",
    desc: "helping run workshops and meetups for the local dev scene.",
    detail:
      "set-up, slides, troubleshooting other people's laptops. learned more about explaining things than about code — which turned out to be the point.",
    image: "/img/exp-org.svg",
  },
];

export const sampleHardSkills: Skill[] = [
  { name: "typescript", pct: 92, icon: "typescript", desc: "the default language for everything i touch — strict mode, no excuses." },
  { name: "react / next", pct: 90, icon: "react", desc: "components, server components, and the mental model that holds them together." },
  { name: "node / bun", pct: 84, icon: "nodedotjs", desc: "apis, scripts, and small services. bun for speed, node for boring reliability." },
  { name: "css / gsap", pct: 88, icon: "css", desc: "layout is the easy part — motion is where the real hours go." },
  { name: "prisma / sql", pct: 80, icon: "prisma", desc: "schema design, migrations, and queries that don't fight the database." },
  { name: "vue", pct: 72, icon: "vuedotjs", desc: "enough to be dangerous — used it for a couple of client dashboards." },
  { name: "git / ci", pct: 86, icon: "git", desc: "branch discipline, rebase fluency, pipelines that catch me when i'm sloppy." },
  { name: "linux", pct: 78, icon: "linux", desc: "daily driver. dotfiles versioned, shell history embarrassing." },
];

export const sampleSoftSkills: Skill[] = [
  { name: "problem solving", pct: 90, icon: "", desc: "i read error messages. all of them. it's a superpower apparently." },
  { name: "communication", pct: 82, icon: "", desc: "translating between what a client said and what they actually meant." },
  { name: "teamwork", pct: 85, icon: "", desc: "small teams, honest code review, no ego in the diff comments." },
  { name: "adaptability", pct: 80, icon: "", desc: "new stack, new constraint, new requirement mid-sprint — fine." },
  { name: "curiosity", pct: 95, icon: "\uf128", desc: "the reason this page exists. also the reason i sleep late." },
];

export const samplePosts: BlogPost[] = [
  {
    id: "why-i-rebuilt-my-portfolio",
    date: "2025-11-20",
    title: "why i rebuilt my portfolio from scratch",
    excerpt: "same design language, new foundation. notes on moving house while the furniture is still warm.",
    body: [
      "the old portfolio worked. that was the problem — it worked just well enough that i stopped touching it, and a portfolio you stop touching is a museum piece.",
      "so i moved the frontend into a fresh project, kept every pixel decision that survived a year of staring, and left the data layer behind on purpose. content will come from a real database this time, wired in properly instead of bolted on.",
      "the rule for the rebuild: nothing gets copied over unless i'd defend it in a code review. the draggable hero card survived. the ascii dinosaur was never in danger.",
    ],
  },
  {
    id: "motion-is-a-language",
    date: "2025-10-08",
    title: "motion is a language, not decoration",
    excerpt: "gsap timelines as grammar — how easing choices change what a page says.",
    body: [
      "a slow expo ease says one thing is finishing and another is beginning. an elastic snap says this object has weight and you surprised it. neither is decoration; both are sentences.",
      "the trick is restraint: pick a few eases, reuse them everywhere, and let duration carry the meaning. a page where every element invents its own timing reads like a room where everyone talks at once.",
    ],
  },
  {
    id: "ascii-forever",
    date: "2025-09-14",
    title: "ascii is an aesthetic and i will not apologize",
    excerpt: "why a terminal dinosaur, blocky progress meters, and monospace everything make a page feel alive.",
    body: [
      "pixel fonts and ascii ornaments get dismissed as nostalgia, but they do something photos can't: they admit the page is made of characters. it's honesty as a design choice.",
      "also, a dinosaur that jumps when you press space is worth more than any hero video. fight me.",
    ],
  },
];

export const sampleTestimonials: {
  id: string;
  name: string;
  role: string | null;
  message: string;
  rating: number | null;
}[] = [
  {
    id: "t1",
    name: "client from reddev",
    role: "product lead",
    message: "took a vague brief and turned it into a dashboard the whole team actually uses. fast, precise, zero drama.",
    rating: 5,
  },
  {
    id: "t2",
    name: "rizky",
    role: "backend dev",
    message: "the only frontend person i've worked with who reads the api docs before complaining about them.",
    rating: 5,
  },
  {
    id: "t3",
    name: "anonymous teammate",
    role: null,
    message: "reviewed my pr at 1am and left kinder comments than i deserved. would ship with again.",
    rating: 4,
  },
];

// ── end temp sample content ─────────────────────────────────────
