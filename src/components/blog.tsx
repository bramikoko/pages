"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import type { BlogPostData } from "@/src/app/page";

export default function Blog({ posts }: { posts: BlogPostData[] }) {
  const winRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  // portal the reader to <body> — inside the section it would be trapped
  // by the section's stacking context and slide under the nav
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const openWin = useCallback(() => {
    const win = winRef.current;
    const bd = backdropRef.current;
    if (!win) return;
    setOpen(true);
    window.__loco?.stop();

    // place the window near the center, slightly randomized like a real os window
    const w = win.offsetWidth;
    const h = win.offsetHeight;
    const x = Math.max(16, (window.innerWidth - w) / 2 + (Math.random() * 60 - 30));
    const y = Math.max(70, (window.innerHeight - h) / 2 + (Math.random() * 40 - 20));
    gsap.set(win, { x, y });

    gsap.set(win, { visibility: "visible", scale: 0.92, autoAlpha: 0 });
    gsap.to(win, { scale: 1, autoAlpha: 1, duration: 0.45, ease: "power3.out" });
    if (bd) {
      gsap.set(bd, { visibility: "visible", autoAlpha: 0 });
      gsap.to(bd, { autoAlpha: 1, duration: 0.4, ease: "power2.out" });
    }
    win.querySelector("button")?.focus();
  }, []);

  const closeWin = useCallback(() => {
    const win = winRef.current;
    const bd = backdropRef.current;
    if (!win) return;
    gsap.to(win, {
      scale: 0.94,
      autoAlpha: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => gsap.set(win, { visibility: "hidden" }),
    });
    if (bd) {
      gsap.to(bd, {
        autoAlpha: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => gsap.set(bd, { visibility: "hidden" }),
      });
    }
    window.__loco?.start();
    setOpen(false);
  }, []);

  // dragging by the title bar — re-runs when the portal mounts, since
  // the window node doesn't exist on the first render
  useEffect(() => {
    if (!mounted) return;
    const win = winRef.current;
    const bar = win?.querySelector<HTMLElement>(".win-bar");
    if (!win || !bar) return;

    const down = (e: PointerEvent) => {
      // buttons inside the bar (close) must not start a drag — pointer
      // capture would swallow their click event
      if ((e.target as HTMLElement).closest("button")) return;
      const rect = win.getBoundingClientRect();
      drag.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
      try {
        bar.setPointerCapture(e.pointerId);
      } catch {
        // synthetic pointer events have no capturable pointer
      }
    };
    const move = (e: PointerEvent) => {
      if (!drag.current) return;
      const x = e.clientX - drag.current.dx;
      const y = e.clientY - drag.current.dy;
      gsap.set(win, {
        x: Math.min(Math.max(x, -win.offsetWidth + 120), window.innerWidth - 120),
        y: Math.min(Math.max(y, 0), window.innerHeight - 60),
      });
    };
    const up = () => {
      drag.current = null;
    };

    bar.addEventListener("pointerdown", down);
    bar.addEventListener("pointermove", move);
    bar.addEventListener("pointerup", up);
    bar.addEventListener("pointercancel", up);
    return () => {
      bar.removeEventListener("pointerdown", down);
      bar.removeEventListener("pointermove", move);
      bar.removeEventListener("pointerup", up);
      bar.removeEventListener("pointercancel", up);
    };
  }, [mounted]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) closeWin();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeWin]);

  return (
    <section className="blog" id="blog">
      <div className="container">
        <p className="sec-label">
          <span className="sec-index">03</span> blog
        </p>
        <h2
          className="h-display"
          style={{ fontSize: "clamp(2rem, 5vw, 3.6rem)" }}
          data-reveal
          data-parallax="4"
        >
          notes from the <span className="outline">terminal</span>
        </h2>

        <div className="blog-list" style={{ marginTop: "2.5rem" }}>
          {posts.length === 0 && (
            <div className="drawer-empty" style={{ marginBottom: "1.5rem" }}>
              <p className="empty-title">no posts yet</p>
              <p className="small">the terminal is warming up — first entry soon.</p>
            </div>
          )}
          {posts.map((p) => (
            <button className="blog-row" key={p.id} type="button" onClick={openWin}>
              <span className="blog-date">{p.date}</span>
              <span>
                <span className="blog-title">{p.title}</span>
                <span className="blog-excerpt" style={{ display: "block" }}>
                  {p.excerpt}
                </span>
              </span>
              <span className="nf" aria-hidden="true">&#xf0c1;</span>
            </button>
          ))}
        </div>

        <div className="blog-actions">
          <button className="btn" type="button" onClick={openWin}>
            <span className="nf" aria-hidden="true">&#xf02d;</span>
            <span>see more</span>
          </button>
        </div>
      </div>

      {/* dim backdrop so the reader window owns the screen — portaled to
          <body> so it stacks above nav and everything else */}
      {mounted &&
        createPortal(
          <>
      <div className="win-backdrop" ref={backdropRef} onClick={closeWin} aria-hidden="true" />

      {/* draggable reader window */}
      <div className="win" ref={winRef} role="dialog" aria-modal="true" aria-label="blog reader">
        <div className="win-bar px-dots">
          <span className="win-title">
            <span className="nf" aria-hidden="true">&#xf02d;</span> blog.reader
          </span>
          <button className="pop-close" type="button" onClick={closeWin}>
            <span className="nf" aria-hidden="true">&#xf00d;</span> close
          </button>
        </div>
        <div className="win-body" data-lenis-prevent>
          {posts.length === 0 && (
            <p className="small" style={{ color: "var(--ink-faint)" }}>
              nothing published yet.
            </p>
          )}
          {posts.map((p) => (
            <article key={p.id}>
              <p className="win-date">{p.date}</p>
              <h3>{p.title}</h3>
              {p.body.map((par, i) => (
                <p key={i}>{par}</p>
              ))}
              <hr style={{ border: 0, borderTop: "1px solid var(--line)", margin: "1.5rem 0" }} />
            </article>
          ))}
        </div>
      </div>
        </>
      ,
      document.body,
      )}
    </section>
  );
}
