"use client";

import { useEffect, useRef, useState } from "react";
import { createClient, supabaseEnvReady } from "@/lib/supabase/client";

export type Testi = {
  id: string;
  name: string;
  role: string | null;
  message: string;
  rating: number | null;
};

const STAR = "\uf005";

function StarRow({ value, size }: { value: number | null; size?: string }) {
  const v = value ?? 0;
  return (
    <span className="stars" aria-label={`${v} out of 5 stars`} style={size ? { fontSize: size } : undefined}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`nf ${n <= v ? "" : "off"}`} aria-hidden="true">
          {STAR}
        </span>
      ))}
    </span>
  );
}

export default function Testimony({ initial }: { initial: Testi[] }) {
  const list = initial;
  const empty = list.length === 0;

  const [rating, setRating] = useState(0);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "err" | "idle"; msg: string }>({
    kind: "idle",
    msg: "",
  });
  const backdropRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // keep the two marquee rows locked to the form's vertical center,
  // whatever the heading above it does to the layout
  useEffect(() => {
    const align = () => {
      const b = backdropRef.current;
      const f = formRef.current;
      if (!b || !f) return;
      // on phones the marquee sits below the form in normal flow —
      // no centering transform needed
      if (window.innerWidth <= 640) {
        b.style.transform = "";
        return;
      }
      const fr = f.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      const dy = (fr.top + fr.height / 2) - (br.top + br.height / 2);
      b.style.transform = `translateY(${dy}px)`;
    };
    align();
    window.addEventListener("resize", align);
    window.addEventListener("load", align);
    // webfonts swap + dynamic content change the form's height after the
    // first paint — recenter whenever either box actually resizes
    document.fonts?.ready.then(align);
    const ro = new ResizeObserver(align);
    if (formRef.current) ro.observe(formRef.current);
    if (backdropRef.current) ro.observe(backdropRef.current);
    const t = window.setTimeout(align, 600); // after webfonts settle
    return () => {
      window.removeEventListener("resize", align);
      window.removeEventListener("load", align);
      window.clearTimeout(t);
      ro.disconnect();
    };
  }, []);

  // submit lands in the supabase `testimonials` table with approved =
  // false — it shows up in /admin for review before going public
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") || "").trim(),
      role: String(fd.get("role") || "").trim() || null,
      message: String(fd.get("message") || "").trim(),
      rating: rating > 0 ? rating : null,
      approved: false,
    };
    if (!payload.name || !payload.message) return;
    if (!supabaseEnvReady) {
      setStatus({ kind: "err", msg: "// form offline — the backend isn't wired yet." });
      return;
    }
    setSending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("testimonials").insert(payload);
      if (error) throw error;
      form.reset();
      setRating(0);
      setStatus({ kind: "ok", msg: "// thanks! it lands after a quick review." });
    } catch {
      setStatus({ kind: "err", msg: "// failed to send — try again in a bit." });
    } finally {
      setSending(false);
    }
  };

  // the track loops by translating -50%, so it must be two identical
  // halves and each half alone must be wider than any viewport — or a
  // gap shows at the right edge when the list is short
  const perHalf = Math.max(list.length, Math.ceil(2560 / 420));
  const half = Array.from({ length: perHalf }, (_, i) => list[i % list.length]);
  const row = [...half, ...half];

  const card = (t: Testi, key: string) => (
    <div className="testi-card" key={key}>
      <StarRow value={t.rating ?? 5} />
      <p className="msg">
        <span className="nf" aria-hidden="true">&#xf075;</span> {t.message}
      </p>
      <div className="who">
        <b>{t.name}</b>
        {t.role && <span>— {t.role}</span>}
      </div>
    </div>
  );

  return (
    <section className="testimony" id="testimony">
      {/* two endless card rivers running behind the form, opposite
          directions, fading out at both edges — clustered center-stage,
          exactly behind the form */}
      {!empty && (
        <div className="t-backdrop" ref={backdropRef} aria-hidden="true">
          <div className="t-marquee">
            <div className="t-track">{row.map((t, i) => card(t, `top-${i}`))}</div>
          </div>
          <div className="t-marquee">
            <div className="t-track reverse">{row.map((t, i) => card(t, `bot-${i}`))}</div>
          </div>
        </div>
      )}

      <div className="container">
        <p className="sec-label">
          <span className="sec-index">04</span> testimony
        </p>
        <h2 className="h-display" style={{ fontSize: "clamp(2rem, 5vw, 3.6rem)" }} data-reveal>
          words from <span className="outline">others</span>
        </h2>

        <form className="testi-form" ref={formRef} onSubmit={submit}>
          <h3>worked with me?</h3>
          <p className="form-note">
            drop a few words. every submission waits for my approval before it
            shows up here — no bots on my wall.
          </p>
          <div className="field">
            <label htmlFor="t-name">name</label>
            <input id="t-name" name="name" required maxLength={60} placeholder="your name" />
          </div>
          <div className="field">
            <label htmlFor="t-role">role (optional)</label>
            <input id="t-role" name="role" maxLength={60} placeholder="e.g. frontend dev" />
          </div>
          <div className="field">
            <label htmlFor="t-msg">message</label>
            <textarea
              id="t-msg"
              name="message"
              required
              maxLength={280}
              placeholder="keep it short and honest"
            />
          </div>
          <div className="field">
            <label id="rating-label">rating</label>
            <div className="stars" role="radiogroup" aria-labelledby="rating-label">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  className={n <= rating ? "on" : ""}
                  onClick={() => setRating(n)}
                >
                  {STAR}
                </button>
              ))}
            </div>
          </div>
          <button className="btn btn-paper" type="submit" disabled={sending}>
            <span className="nf" aria-hidden="true">&#xf0e0;</span>
            <span>{sending ? "sending..." : "drop it"}</span>
          </button>
          <p className={`form-status ${status.kind}`} role="status">
            {status.msg}
          </p>
        </form>
      </div>
    </section>
  );
}
