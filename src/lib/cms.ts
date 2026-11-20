// server-side reads from supabase (rest, anon key, cached 60s).
// every query falls back to the sample data in src/lib/data.ts when the
// env vars are missing, the table doesn't exist yet, or the request
// fails — the public site must never break because of the database.

import type { Project, Skill, Experience, BlogPost } from "./data";
import {
  sampleWorks,
  sampleExperience,
  sampleHardSkills,
  sampleSoftSkills,
  samplePosts,
  sampleTestimonials,
} from "./data";
import type { ContactLinkData } from "@/src/components/contact";
import type { Testi } from "@/src/components/testimony";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

async function rest<T>(table: string, order = "sort"): Promise<T[] | null> {
  if (!URL || !KEY) return null;
  try {
    const r = await fetch(`${URL}/rest/v1/${table}?select=*&order=${order}.asc`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
      next: { revalidate: 60 },
    });
    if (!r.ok) return null;
    return (await r.json()) as T[];
  } catch {
    return null;
  }
}

type Row = Record<string, unknown>;
const s = (v: unknown, fb = "") => (typeof v === "string" ? v : fb);
const n = (v: unknown, fb = 0) => (typeof v === "number" ? v : fb);

export async function getWorks(): Promise<WorkRow[]> {
  const rows = await rest<Row>("works");
  if (!rows) return sampleWorks;
  return rows.map((r, i) => ({
    id: i + 1,
    title: s(r.title),
    year: s(r.year),
    stack: Array.isArray(r.stack) ? (r.stack as string[]) : [],
    desc: s(r.description),
    detail: s(r.detail),
    image: s(r.image) || undefined,
    link: s(r.link) || undefined,
  }));
}

export async function getExperience(): Promise<ExpRow[]> {
  const rows = await rest<Row>("experience");
  if (!rows) return sampleExperience;
  return rows.map((r, i) => ({
    id: i + 1,
    period: s(r.period),
    title: s(r.title),
    place: s(r.place),
    desc: s(r.description),
    detail: s(r.detail),
    image: s(r.image) || undefined,
  }));
}

export async function getSkills(): Promise<{ hard: Skill[]; soft: Skill[] }> {
  const rows = await rest<Row>("skills");
  if (!rows) return { hard: sampleHardSkills, soft: sampleSoftSkills };
  const map = (r: Row): Skill => ({
    name: s(r.name),
    pct: n(r.pct),
    icon: s(r.icon),
    desc: s(r.description),
  });
  return {
    hard: rows.filter((r) => r.kind !== "soft").map(map),
    soft: rows.filter((r) => r.kind === "soft").map(map),
  };
}

export async function getPosts(): Promise<BlogPost[]> {
  const rows = await rest<Row>("posts");
  if (!rows) return samplePosts;
  return rows.map((r) => ({
    id: s(r.id),
    date: s(r.date),
    title: s(r.title),
    excerpt: s(r.excerpt),
    // posts.body is one long text — paragraphs split on blank lines
    body: s(r.body)
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean),
  }));
}

export async function getTestimonials(): Promise<Testi[]> {
  const rows = await rest<Row>("testimonials");
  if (!rows) return sampleTestimonials;
  return rows
    .filter((r) => r.approved === true)
    .map((r, i) => ({
      id: s(r.id) || `t${i}`,
      name: s(r.name),
      role: s(r.role) || null,
      message: s(r.message),
      rating: typeof r.rating === "number" ? r.rating : null,
    }));
}

export async function getLinks(): Promise<ContactLinkData[]> {
  const rows = await rest<Row>("contact_links");
  if (!rows) return [];
  return rows.map((r) => ({
    id: s(r.id),
    platform: s(r.platform),
    label: s(r.label),
    url: s(r.url),
  }));
}

// shared row shapes — numeric ids are assigned at read time so the ui
// components keep working exactly as before
export type WorkRow = Omit<Project, "id"> & { id: number };
export type ExpRow = Experience & { id: number };
