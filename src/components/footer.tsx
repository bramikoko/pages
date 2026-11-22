"use client";

import { useEffect, useRef, useState } from "react";
import type { ContactLinkData } from "@/src/components/contact";
import type { DinoRunner, GameState } from "./dino-runner";

export default function Footer({ links: dbLinks = [] }: { links?: ContactLinkData[] }) {
  // defer the clock to the client — prerendering forbids `new Date()` at render
  const [year, setYear] = useState<string>("");
  useEffect(() => setYear(String(new Date().getFullYear())), []);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<GameState>("idle");
  const runnerRef = useRef<DinoRunner | null>(null);

  const toTop = () => {
    if (window.__loco) window.__loco.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ------- Chrome Dino Game (Lazy Loaded on Scroll / Interaction) -------
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let disposed = false;
    let runner: DinoRunner | null = null;

    const init = async () => {
      if (disposed || runner) return;
      const { DinoRunner: RunnerClass } = await import("./dino-runner");
      if (disposed || !canvasRef.current) return;
      runner = new RunnerClass({
        canvas,
        onPhaseChange: (nextPhase) => setPhase(nextPhase),
      });
      runnerRef.current = runner;
    };

    // Pre-initialize when footer is within 400px of viewport
    const initObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          init();
          initObserver.disconnect();
        }
      },
      { rootMargin: "400px" }
    );
    initObserver.observe(wrap);

    // Viewport visibility observer: pause loop when footer is offscreen
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && runner?.getPhase() === "run") {
          runner.stop();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(wrap);

    // Tab visibility: pause when tab loses focus
    const onVis = () => {
      if (document.hidden && runner?.getPhase() === "run") {
        runner.stop();
      }
    };
    document.addEventListener("visibilitychange", onVis);

    // Keyboard controls
    const onKey = (e: KeyboardEvent) => {
      if (!runner) return;
      if (e.code === "Space" || e.code === "ArrowUp") {
        if (runner.getPhase() === "run") {
          e.preventDefault();
          runner.jump();
        }
      } else if (e.code === "Enter") {
        if (runner.getPhase() === "over") {
          e.preventDefault();
          runner.start();
        }
      }
    };
    window.addEventListener("keydown", onKey);

    // Pointer / touch control on canvas
    const onPointer = () => {
      if (runner?.getPhase() === "run") {
        runner.jump();
      }
    };
    canvas.addEventListener("pointerdown", onPointer);

    return () => {
      disposed = true;
      initObserver.disconnect();
      io.disconnect();
      runner?.destroy();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  const ICONS: Record<string, string> = {
    github: "\uf09b",
    instagram: "\uf16d",
    reddit: "\uf1a1",
    whatsapp: "\uf232",
    email: "\uf0e0",
    linkedin: "\uf0e1",
    x: "\ue61b",
    youtube: "\uf167",
    tiktok: "\ue07b",
    discord: "\uf392",
  };
  const socials = dbLinks.map((l) => ({
    href: l.url,
    icon: ICONS[l.platform] ?? "\uf02d",
    label: l.platform,
  }));

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-bottom">
          <span>© {year} bram — no rights reserved, just pixels</span>
          {/* contact row — socials + back-to-top grouped on the right
              (desktop); on mobile they split into stacked rows */}
          <div className="footer-right">
            <div className="footer-socials">
              {socials.map((s) => (
                <a
                  key={s.label}
                  className="social-btn"
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  title={s.label}
                >
                  <span className="nf" aria-hidden="true">
                    {s.icon}
                  </span>
                </a>
              ))}
            </div>
            <button
              className="btn to-top"
              type="button"
              onClick={toTop}
              style={{ padding: "0.5rem 0.9rem", fontSize: "0.68rem" }}
            >
              <span className="nf" aria-hidden="true">&#xf062;</span>
              <span>back to top</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chrome Dino game lives at the very bottom edge of the page */}
      <div className="footer-game">
        <div className="dino-wrap" ref={wrapRef}>
          <canvas ref={canvasRef} aria-label="chrome dino game" />
          {phase !== "run" && (
            <div className="dino-overlay">
              {phase === "idle" ? (
                <button
                  className="btn btn-paper"
                  type="button"
                  onClick={async () => {
                    if (!runnerRef.current) {
                      const { DinoRunner: RunnerClass } = await import("./dino-runner");
                      if (canvasRef.current) {
                        const r = new RunnerClass({
                          canvas: canvasRef.current,
                          onPhaseChange: (p) => setPhase(p),
                        });
                        runnerRef.current = r;
                        r.start();
                        return;
                      }
                    }
                    runnerRef.current?.start();
                  }}
                >
                  <span className="nf" aria-hidden="true">&#xf04b;</span>
                  <span>play</span>
                </button>
              ) : (
                <div className="dino-overlay-row">
                  <button
                    className="btn btn-paper"
                    type="button"
                    onClick={() => runnerRef.current?.start()}
                  >
                    <span className="nf" aria-hidden="true">&#xf021;</span>
                    <span>retry</span>
                  </button>
                  <button
                    className="btn"
                    type="button"
                    onClick={() => runnerRef.current?.stop()}
                  >
                    <span className="nf" aria-hidden="true">&#xf04d;</span>
                    <span>stop playing</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
