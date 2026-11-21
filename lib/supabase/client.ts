import { createBrowserClient } from "@supabase/ssr";

// true when the supabase env vars exist — lets components degrade
// gracefully at build time (netlify deploys without secrets) instead
// of crashing the prerender
export const supabaseEnvReady = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
