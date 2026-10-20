export const profile = {
  name: "bram",
  role: "web developer",
  year: 2026,
  location: "Banjarmasin, Indonesia",
  coordinates: "3.3186 S / 114.5944 E",
  timeZone: "Asia/Makassar",
  timeZoneLabel: "WITA",
  email: "punyanyaibra@gmail.com",
  company: "red.dev",
  education: "12th grade",
  pronouns: "he/him",
  learning: ["Nuxt.js", "Next.js", "Laravel"],
  offScreen: ["anime", "manga"],
};

export type StackItem = {
  name: string;
  icon: string;
  learning?: boolean;
};

export type StackGroup = {
  label: string;
  items: StackItem[];
};

export const stack: StackGroup[] = [
  {
    label: "languages",
    items: [
      { name: "TypeScript", icon: "typescript" },
      { name: "JavaScript", icon: "javascript" },
      { name: "PHP", icon: "php" },
      { name: "Python", icon: "python" },
      { name: "HTML", icon: "html5" },
      { name: "CSS", icon: "css" },
    ],
  },
  {
    label: "frontend",
    items: [
      { name: "Next.js", icon: "nextdotjs", learning: true },
      { name: "Nuxt", icon: "nuxt", learning: true },
      { name: "React", icon: "react" },
      { name: "Vue", icon: "vuedotjs" },
      { name: "Astro", icon: "astro" },
      { name: "Alpine.js", icon: "alpinedotjs" },
      { name: "Tailwind CSS", icon: "tailwindcss" },
      { name: "Bulma", icon: "bulma" },
      { name: "DaisyUI", icon: "daisyui" },
    ],
  },
  {
    label: "backend",
    items: [
      { name: "Laravel", icon: "laravel", learning: true },
      { name: "Livewire", icon: "livewire" },
      { name: "Filament", icon: "filament" },
      { name: "Node.js", icon: "nodedotjs" },
    ],
  },
  {
    label: "data",
    items: [
      { name: "PostgreSQL", icon: "postgresql" },
      { name: "MySQL", icon: "mysql" },
      { name: "MariaDB", icon: "mariadb" },
      { name: "SQLite", icon: "sqlite" },
      { name: "Prisma", icon: "prisma" },
      { name: "Supabase", icon: "supabase" },
      { name: "Appwrite", icon: "appwrite" },
    ],
  },
  {
    label: "tools",
    items: [
      { name: "Bun", icon: "bun" },
      { name: "Vite", icon: "vite" },
      { name: "pnpm", icon: "pnpm" },
      { name: "Yarn", icon: "yarn" },
      { name: "npm", icon: "npm" },
      { name: "Git", icon: "git" },
      { name: "GitHub", icon: "github" },
      { name: "Figma", icon: "figma" },
      { name: "Jest", icon: "jest" },
      { name: "Vitest", icon: "vitest" },
    ],
  },
  {
    label: "systems",
    items: [
      { name: "Linux", icon: "linux" },
      { name: "Nginx", icon: "nginx" },
      { name: "Apache", icon: "apache" },
      { name: "Netlify", icon: "netlify" },
      { name: "Vercel", icon: "vercel" },
      { name: "Codeberg", icon: "codeberg" },
    ],
  },
];

export type Social = {
  label: string;
  handle: string;
  href: string;
  icon: "github" | "codeberg" | "instagram" | "reddit" | "whatsapp" | "mail";
};

export const socials: Social[] = [
  {
    label: "GitHub",
    handle: "@bramikoko",
    href: "https://github.com/bramikoko",
    icon: "github",
  },
  {
    label: "Codeberg",
    handle: "@bramikoko",
    href: "https://codeberg.org/bramikoko",
    icon: "codeberg",
  },
  {
    label: "Instagram",
    handle: "@bramikoko",
    href: "https://instagram.com/bramikoko",
    icon: "instagram",
  },
  {
    label: "Reddit",
    handle: "u/bramikoko",
    href: "https://reddit.com/user/bramikoko",
    icon: "reddit",
  },
  {
    label: "WhatsApp",
    handle: "+62 857-0563-7498",
    href: "https://wa.me/6285705637498",
    icon: "whatsapp",
  },
  {
    label: "Email",
    handle: profile.email,
    href: `mailto:${profile.email}`,
    icon: "mail",
  },
];

export const navItems = [
  { label: "about", href: "#about", id: "about" },
  { label: "work", href: "#work", id: "work" },
  { label: "stack", href: "#stack", id: "stack" },
  { label: "contact", href: "#contact", id: "contact" },
];
