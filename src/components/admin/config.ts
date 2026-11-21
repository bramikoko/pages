// field configs for every manageable section — the generic admin table
// renders its list + editor straight from these definitions.

export type FieldType = "text" | "num" | "area" | "tags" | "check" | "select";

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  options?: string[]; // for select
  placeholder?: string;
  hint?: string;
};

export type SectionCfg = {
  key: string;
  table: string;
  title: string;
  labelKey: string; // which field names a row in the list
  orderKey: string;
  fields: FieldDef[];
  defaults: Record<string, unknown>;
};

export const SECTIONS: SectionCfg[] = [
  {
    key: "works",
    table: "works",
    title: "my works",
    labelKey: "title",
    orderKey: "sort",
    fields: [
      { key: "title", label: "title", type: "text", placeholder: "pages" },
      { key: "year", label: "year", type: "text", placeholder: "2025" },
      { key: "stack", label: "stack", type: "tags", hint: "comma separated — next.js, tailwind" },
      { key: "description", label: "short desc", type: "area", placeholder: "one line shown on the card" },
      { key: "detail", label: "detail", type: "area", placeholder: "longer text shown in the project popup" },
      { key: "image", label: "image url", type: "text", placeholder: "/img/xxx.png or https://..." },
      { key: "link", label: "link url", type: "text", placeholder: "https://..." },
      { key: "sort", label: "order", type: "num" },
    ],
    defaults: { title: "", year: "", stack: [], description: "", detail: "", sort: 0 },
  },
  {
    key: "experience",
    table: "experience",
    title: "more about me",
    labelKey: "title",
    orderKey: "sort",
    fields: [
      { key: "period", label: "period", type: "text", placeholder: "2024 — now" },
      { key: "title", label: "role / title", type: "text", placeholder: "fullstack dev" },
      { key: "place", label: "place", type: "text", placeholder: "reddev" },
      { key: "description", label: "short desc", type: "area" },
      { key: "detail", label: "detail", type: "area", placeholder: "shown in the popup" },
      { key: "image", label: "image url", type: "text" },
      { key: "sort", label: "order", type: "num" },
    ],
    defaults: { period: "", title: "", place: "", description: "", detail: "", sort: 0 },
  },
  {
    key: "skills",
    table: "skills",
    title: "skills",
    labelKey: "name",
    orderKey: "sort",
    fields: [
      { key: "name", label: "name", type: "text", placeholder: "typescript" },
      { key: "pct", label: "percent", type: "num", hint: "0 — 100" },
      { key: "icon", label: "icon", type: "text", hint: "simple-icons slug from simpleicons.org — e.g. react, nextdotjs, typescript" },
      { key: "description", label: "desc", type: "area" },
      { key: "kind", label: "kind", type: "select", options: ["hard", "soft"] },
      { key: "sort", label: "order", type: "num" },
    ],
    defaults: { name: "", pct: 50, icon: "", description: "", kind: "hard", sort: 0 },
  },
  {
    key: "posts",
    table: "posts",
    title: "blog",
    labelKey: "title",
    orderKey: "sort",
    fields: [
      { key: "date", label: "date", type: "text", placeholder: "2025-01-31" },
      { key: "title", label: "title", type: "text" },
      { key: "excerpt", label: "excerpt", type: "area", hint: "shown on the blog list" },
      { key: "body", label: "body", type: "area", hint: "blank line = new paragraph" },
      { key: "sort", label: "order", type: "num" },
    ],
    defaults: { date: "", title: "", excerpt: "", body: "", sort: 0 },
  },
  {
    key: "testimonials",
    table: "testimonials",
    title: "testimony",
    labelKey: "name",
    orderKey: "created_at",
    fields: [
      { key: "name", label: "name", type: "text" },
      { key: "role", label: "role", type: "text" },
      { key: "message", label: "message", type: "area" },
      { key: "rating", label: "rating", type: "num", hint: "1 — 5, empty = none" },
      { key: "approved", label: "approved", type: "check", hint: "only approved ones show on the site" },
    ],
    defaults: { name: "", role: null, message: "", rating: null, approved: false },
  },
  {
    key: "contact_links",
    table: "contact_links",
    title: "contact + footer links",
    labelKey: "label",
    orderKey: "sort",
    fields: [
      {
        key: "platform",
        label: "platform",
        type: "select",
        options: ["github", "email", "whatsapp", "instagram", "reddit"],
        hint: "picks the icon + note shown on the site",
      },
      { key: "label", label: "label", type: "text", placeholder: "github" },
      { key: "url", label: "url", type: "text", placeholder: "https://github.com/bramikoko" },
      { key: "sort", label: "order", type: "num" },
    ],
    defaults: { platform: "github", label: "", url: "", sort: 0 },
  },
];
