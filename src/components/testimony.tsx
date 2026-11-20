"use client";

import { useEffect, useRef, useState } from "react";

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
      const fr = f.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      const dy = (fr.top + fr.height / 2) - (br.top + br.height / 2);
      b.style.transform = `translateY(${dy}px)`;
    };
    align();
    window.addEventListener("resize", align);
    window.addEventListener("load", align);
    const t = window.setTimeout(align, 600); // after webfonts settle
    return () => {
      window.removeEventListener("resize", align);
      window.removeEventListener("load", align);
      window.clearTimeout(t);
    };
  }, []);

  // TODO(db): wire this back to a real endpoint once the new
  // database lands — the form itself stays exactly as-is
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.currentTarget.reset();
    setRating(0);
    setStatus({ kind: "err", msg: "// not stored yet — new database on the way." });
  };

  // marquee rows need enough copies to loop seamlessly past any viewport
  const row = [...list, ...list, ...list, ...list];

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
      {empty && (
        <p className="sec-sub" data-reveal>
          no words yet — be the first. your note will appear here once approved.
        </p>
      )}

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
        <p className="sec-sub" data-reveal>
          real words from people i&rsquo;ve built with — the river behind this form is
          the approved ones. add yours below.
        </p>

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
          <button className="btn btn-paper" type="submit">
            <span className="nf" aria-hidden="true">&#xf0e0;</span>
            <span>drop it</span>
          </button>
          <p className={`form-status ${status.kind}`} role="status">
            {status.msg}
          </p>
        </form>
      </div>
    </section>
  );
}
