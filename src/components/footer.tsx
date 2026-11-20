"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ContactLinkData } from "@/src/components/contact";
import {
  GITHUB,
  INSTAGRAM,
  REDDIT,
  WHATSAPP,
  EMAIL,
} from "@/src/lib/data";

type GameState = "idle" | "run" | "over";

export default function Footer({ links: dbLinks = [] }: { links?: ContactLinkData[] }) {
  // defer the clock to the client — prerendering forbids `new Date()` at render
  const [year, setYear] = useState<string>("");
  useEffect(() => setYear(String(new Date().getFullYear())), []);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<GameState>("idle");
  const apiRef = useRef<{ start: () => void; stop: () => void } | null>(null);

  const toTop = () => {
    if (window.__loco) window.__loco.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ------- the dino game (ascii edition) -------
  // mechanics follow the chrome dino: delta-time movement against a 60fps
  // reference, gravity 0.6, launch velocity -10 adjusted by speed, speed
  // creeping from 6 toward a cap of 13
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 640;
    const H = 180;
    canvas.width = W;
    canvas.height = H;

    const CW = 5; // char cell width
    const CH = 7; // char cell height
    const GROUND = 150;
    const FPS_REF = 1000 / 60;

    const DINO_A = [
      " ██████ ",
      " ██ ███ ",
      " ██████ ",
      " ████   ",
      " █████  ",
      " ██ █   ",
      " ██ █   ",
      "██  ██  ",
    ];
    const DINO_B = [
      " ██████ ",
      " ██ ███ ",
      " ██████ ",
      " ████   ",
      " █████  ",
      " ██ █   ",
      " ██  █  ",
      " █ ██   ",
    ];
    const CACTUS = [" ▓ ", "▓▓▓", " ▓ ", " ▓ ", " ▓ "];

    const player = { x: 30, y: GROUND - 56, w: 35, h: 56 };
    let vy = 0;
    let obstacles: { x: number; w: number; h: number }[] = [];
    let spawn = 60;
    let speed = 6;
    let frames = 0;
    let mode: GameState = "idle";
    let raf = 0;
    let lastTs = 0;
    let visible = false;

    // light-to-dark gradient fill so the sprites aren't flat white
    const grad = (y: number, h: number, top: string, bottom: string) => {
      const g = ctx.createLinearGradient(0, y, 0, y + h);
      g.addColorStop(0, top);
      g.addColorStop(1, bottom);
      return g;
    };

    const drawSprite = (
      rows: string[],
      x: number,
      y: number,
      top: string,
      bottom: string,
    ) => {
      ctx.fillStyle = grad(y, rows.length * CH, top, bottom);
      ctx.font = "8px monospace";
      ctx.textAlign = "left";
      rows.forEach((row, r) => ctx.fillText(row, x, y + r * CH + CH - 1));
    };

    // theme-aware sprite colors — read per frame so the game follows the toggle
    const PAL = {
      dark: { bg: "#0a0a0a", far: "#262626", near: "#4a4a4a", cacTop: "#c9c9c9", cacBot: "#5a5a5a", dinoTop: "#f2f2f2", dinoBot: "#6a6a6a" },
      light: { bg: "#f2f2f2", far: "#c6c6c6", near: "#8f8f8f", cacTop: "#2e2e2e", cacBot: "#7a7a7a", dinoTop: "#111111", dinoBot: "#6a6a6a" },
    } as const;

    const draw = () => {
      const p =
        document.documentElement.dataset.theme === "light" ? PAL.light : PAL.dark;
      ctx.fillStyle = p.bg; // same as the footer background
      ctx.fillRect(0, 0, W, H);

      // ground: a scrolling line of dashes
      ctx.font = "8px monospace";
      const dash = "-".repeat(Math.ceil(W / CW) + 2);
      const off = (frames * speed * 0.55) % CW;
      ctx.fillStyle = p.near;
      ctx.fillText(dash, -off, GROUND + 8);
      ctx.fillStyle = p.far;
      ctx.fillText(dash, -(off * 0.5) % CW, GROUND + 18);

      // cacti
      for (const o of obstacles) {
        drawSprite(CACTUS, o.x, GROUND - o.h, p.cacTop, p.cacBot);
      }

      // dino with alternating legs
      const leg = Math.floor(frames / 6) % 2 === 0;
      drawSprite(leg ? DINO_A : DINO_B, player.x, player.y, p.dinoTop, p.dinoBot);
    };

    const step = (ts: number) => {
      const dt = Math.min(lastTs ? ts - lastTs : FPS_REF, 50);
      lastTs = ts;
      const units = dt / FPS_REF; // 1.0 at 60fps — chrome's delta-time trick
      frames += units;
      speed = Math.min(13, speed + 0.001 * units * 10);

      // jump physics: gravity 0.6, launch -10 (chrome constants)
      vy += 0.6 * units;
      player.y += vy * units;
      if (player.y > GROUND - player.h) {
        player.y = GROUND - player.h;
        vy = 0;
      }

      spawn -= units;
      if (spawn <= 0) {
        obstacles.push({ x: W + 10, w: 15, h: 35 });
        spawn = 55 + Math.floor(Math.random() * 70) - Math.min(25, speed * 4);
      }

      for (const o of obstacles) o.x -= speed * units;
      obstacles = obstacles.filter((o) => o.x + o.w > -10);
      for (const o of obstacles) {
        if (
          player.x + player.w - 4 > o.x &&
          player.x + 4 < o.x + o.w &&
          player.y + player.h > GROUND - o.h + 2
        ) {
          gameOver();
          return;
        }
      }

      draw();
      if (visible && !document.hidden) raf = requestAnimationFrame(step);
    };

    const drawIdle = () => {
      obstacles = [];
      player.y = GROUND - player.h;
      vy = 0;
      frames = 0;
      speed = 6;
      draw();
    };

    const startLoop = () => {
      cancelAnimationFrame(raf);
      lastTs = 0;
      raf = requestAnimationFrame(step);
    };

    const start = () => {
      obstacles = [];
      spawn = 60;
      speed = 6;
      frames = 0;
      vy = 0;
      player.y = GROUND - player.h;
      mode = "run";
      setPhase("run");
      startLoop();
    };

    const gameOver = () => {
      mode = "over";
      cancelAnimationFrame(raf);
      draw();
      setPhase("over");
    };

    const stopGame = () => {
      mode = "idle";
      cancelAnimationFrame(raf);
      drawIdle();
      setPhase("idle");
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        // never auto-run: only paint a static frame while idle
        if (visible && mode === "idle") drawIdle();
        if (!visible) cancelAnimationFrame(raf);
      },
      { threshold: 0.2 },
    );
    io.observe(wrap);

    const onVis = () => {
      if (document.hidden) {
        if (mode === "run") stopGame();
      } else if (visible && mode === "idle") {
        drawIdle();
      }
    };
    document.addEventListener("visibilitychange", onVis);

    const jump = () => {
      if (player.y >= GROUND - player.h - 1) vy = -10 - speed / 10;
    };

    const onKey = (e: KeyboardEvent) => {
      if ((e.code === "Space" || e.code === "ArrowUp") && visible && mode === "run") {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", onKey);

    const onClick = () => {
      if (mode === "run") jump();
    };
    canvas.addEventListener("pointerdown", onClick);

    // idle frame holds stale colors after a theme flip — repaint once
    const onTheme = () => {
      if (mode === "idle") drawIdle();
    };
    window.addEventListener("themechange", onTheme);

    drawIdle();
    apiRef.current = { start, stop: stopGame };
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("pointerdown", onClick);
      window.removeEventListener("themechange", onTheme);
    };
  }, []);

  const ICONS: Record<string, string> = {
    github: "\uf09b",
    instagram: "\uf16d",
    reddit: "\uf1a1",
    whatsapp: "\uf232",
    email: "\uf0e0",
  };
  const socials = dbLinks.length
    ? dbLinks.map((l) => ({
        href: l.url,
        icon: ICONS[l.platform] ?? "\uf02d",
        label: l.platform,
      }))
    : [
        { href: GITHUB, icon: "\uf09b", label: "github" },
        { href: INSTAGRAM, icon: "\uf16d", label: "instagram" },
        { href: REDDIT, icon: "\uf1a1", label: "reddit" },
        { href: WHATSAPP, icon: "\uf232", label: "whatsapp" },
        { href: `mailto:${EMAIL}`, icon: "\uf0e0", label: "mail" },
      ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-bottom">
          <span>© {year} bram — no rights reserved, just pixels</span>
          {/* contact row — sits right beside the back-to-top button */}
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
            <button
              className="btn"
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

      {/* the dino lives at the very bottom edge of the page — full bleed,
          no border, flush with the end of the site */}
      <div className="footer-game">
        <div className="dino-wrap" ref={wrapRef}>
          <canvas ref={canvasRef} aria-label="dino game" />
          {phase !== "run" && (
            <div className="dino-overlay">
              {phase === "idle" ? (
                <button className="btn btn-paper" type="button" onClick={() => apiRef.current?.start()}>
                  <span className="nf" aria-hidden="true">&#xf04b;</span>
                  <span>play</span>
                </button>
              ) : (
                <div className="dino-overlay-row">
                  <button className="btn btn-paper" type="button" onClick={() => apiRef.current?.start()}>
                    <span className="nf" aria-hidden="true">&#xf021;</span>
                    <span>retry</span>
                  </button>
                  <button className="btn" type="button" onClick={() => apiRef.current?.stop()}>
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
