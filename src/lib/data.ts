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

