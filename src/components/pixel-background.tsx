"use client";

import { useEffect, useRef } from "react";

/**
 * animated pixel field: a coarse grid of cells flickering between gray
 * shades, drifting square particles, and a subtle scroll parallax.
 * pure canvas 2d — pauses when the tab is hidden, static under
 * prefers-reduced-motion.
 */
export default function PixelBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const CELL = 26;
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = true;

    type Cell = { x: number; y: number; shade: number; target: number; tick: number };
    type P = { x: number; y: number; s: number; vy: number; vx: number; a: number };

    let cells: Cell[] = [];
    let parts: P[] = [];

    const shades = ["#0d0d0d", "#121212", "#181818", "#1f1f1f", "#262626"];

    function build() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.imageSmoothingEnabled = false;

      const cols = Math.ceil(w / CELL) + 1;
      const rows = Math.ceil(h / CELL) + 1;
      cells = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          cells.push({
            x: c * CELL,
            y: r * CELL,
            shade: 0,
            target: 0,
            tick: Math.floor(Math.random() * 40),
          });
        }
      }

      const count = Math.min(70, Math.floor((w * h) / 26000));
      parts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        s: Math.random() < 0.7 ? 2 : 3,
        vy: -(0.15 + Math.random() * 0.45),
        vx: (Math.random() - 0.5) * 0.2,
        a: 0.08 + Math.random() * 0.3,
      }));
    }

    function draw() {
      // read the scroll position in the same frame we paint — reading it
      // from a scroll event puts the parallax out of phase with the raf
      // and the whole field stutters while scrolling
      const scrollY = window.scrollY;
      // quantize the parallax to whole pixels — fractional fillRect coords
      // antialias and the grid looks blurry/steppy while in motion
      const cellOff = Math.round(scrollY * 0.05) % CELL;

      ctx!.fillStyle = "#0a0a0a";
      ctx!.fillRect(0, 0, w, h);

      // flickering cells
      for (const c of cells) {
        if (--c.tick <= 0) {
          c.tick = 20 + Math.floor(Math.random() * 90);
          c.target = Math.random() < 0.08 ? 1 + Math.floor(Math.random() * 4) : 0;
        }
        c.shade += Math.sign(c.target - c.shade);
        if (c.shade !== 0) {
          ctx!.fillStyle = shades[c.shade];
          ctx!.fillRect(c.x, c.y - cellOff, CELL - 2, CELL - 2);
        }
      }

      // drifting particles with parallax
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -6) {
          p.y = h + 6;
          p.x = Math.random() * w;
        }
        if (p.x < -6) p.x = w + 6;
        if (p.x > w + 6) p.x = -6;
        ctx!.fillStyle = `rgba(237,237,237,${p.a})`;
        ctx!.fillRect(Math.round(p.x), Math.round(p.y - scrollY * 0.12), p.s, p.s);
      }
    }

    function loop() {
      if (!running) return;
      draw();
      raf = requestAnimationFrame(loop);
    }

    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!reduced) {
        running = true;
        loop();
      }
    };

    build();
    if (reduced) {
      draw(); // static frame
    } else {
      loop();
    }

    const ro = new ResizeObserver(() => {
      build();
      draw();
    });
    ro.observe(document.documentElement);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} className="px-canvas" aria-hidden="true" />;
}
