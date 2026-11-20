"use client";

// /admin — login gate + one tab per manageable section.
// writes are protected by supabase rls (authenticated only), so the
// dashboard itself only needs to know whether a session exists.

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { SECTIONS } from "./config";
import AdminTable from "./admin-table";

export default function AdminApp() {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState(SECTIONS[0].key);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setErr(`// ${error.message}`);
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  if (!ready) {
    return (
      <main className="admin">
        <p className="adm-loading">// connecting...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="admin admin-center">
        <form className="adm-login" onSubmit={login}>
          <p className="adm-logo">
            bram<span>.admin</span>
          </p>
          <input
            className="adm-input"
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="adm-input"
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {err && <p className="adm-msg">{err}</p>}
          <button className="adm-btn solid" type="submit" disabled={busy}>
            {busy ? "checking..." : "sign in"}
          </button>
          <p className="adm-hint">
            no account yet? create one in the supabase dashboard
            (authentication → users), then sign in here.
          </p>
        </form>
      </main>
    );
  }

  const active = SECTIONS.find((s) => s.key === tab) ?? SECTIONS[0];

  return (
    <main className="admin">
      <header className="adm-top">
        <p className="adm-logo">
          bram<span>.admin</span>
        </p>
        <button className="adm-btn" type="button" onClick={logout}>
          sign out
        </button>
      </header>

      <nav className="adm-tabs">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            className={`adm-tab${s.key === tab ? " on" : ""}`}
            type="button"
            onClick={() => setTab(s.key)}
          >
            {s.title}
          </button>
        ))}
      </nav>

      <AdminTable key={active.key} cfg={active} supabase={supabase} />
    </main>
  );
}
