"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  accent: boolean;
};

export default function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 0;
    let height = 0;
    let pixels = 1;
    let frame = 0;
    let onScreen = true;
    const particles: Particle[] = [];
    const pointer = { x: -9999, y: -9999, active: false };
    let ink = "#0a0a0a";
    let lime = "#c6ff00";

    const spawn = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.18,
      size: Math.random() < 0.12 ? 3 : Math.random() < 0.5 ? 1.5 : 2,
      alpha: 0.16 + Math.random() * 0.3,
      accent: Math.random() < 0.22,
    });

    const readColors = () => {
      const styles = getComputedStyle(document.documentElement);
      ink = styles.getPropertyValue("--ink").trim() || ink;
      lime = styles.getPropertyValue("--lime").trim() || lime;
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      pixels = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixels);
      canvas.height = Math.round(height * pixels);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixels, 0, 0, pixels, 0, 0);

      const target = Math.min(
        64,
        Math.max(20, Math.round((width * height) / 26000)),
      );
      particles.length = Math.min(particles.length, target);
      while (particles.length < target) particles.push(spawn());
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);

      for (const particle of particles) {
        if (pointer.active) {
          const dx = particle.x - pointer.x;
          const dy = particle.y - pointer.y;
          const distanceSquared = dx * dx + dy * dy;
          if (distanceSquared < 14400 && distanceSquared > 0.01) {
            const distance = Math.sqrt(distanceSquared);
            const force = (1 - distance / 120) * 0.9;
            particle.vx += (dx / distance) * force;
            particle.vy += (dy / distance) * force;
          }
        }

        particle.vx *= 0.97;
        particle.vy *= 0.97;
        if (Math.abs(particle.vx) < 0.04) {
          particle.vx += (Math.random() - 0.5) * 0.05;
        }
        if (Math.abs(particle.vy) < 0.04) {
          particle.vy += (Math.random() - 0.5) * 0.05;
        }
        const speed = Math.hypot(particle.vx, particle.vy);
        if (speed > 2.4) {
          particle.vx = (particle.vx / speed) * 2.4;
          particle.vy = (particle.vy / speed) * 2.4;
        }

        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < -4) particle.x = width + 4;
        else if (particle.x > width + 4) particle.x = -4;
        if (particle.y < -4) particle.y = height + 4;
        else if (particle.y > height + 4) particle.y = -4;

        context.globalAlpha = particle.alpha;
        context.fillStyle = particle.accent ? lime : ink;
        context.fillRect(
          Math.round(particle.x),
          Math.round(particle.y),
          particle.size,
          particle.size,
        );
      }

      context.globalAlpha = 1;
    };

    const loop = () => {
      draw();
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (frame === 0 && onScreen && !reduced.matches) {
        frame = requestAnimationFrame(loop);
      }
    };

    const stop = () => {
      if (frame !== 0) cancelAnimationFrame(frame);
      frame = 0;
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) start();
        else stop();
      },
      { threshold: 0 },
    );
    observer.observe(host);

    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else if (onScreen) start();
    };

    const themeObserver = new MutationObserver(readColors);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const onReducedChange = () => {
      if (reduced.matches) {
        stop();
      } else {
        resize();
        readColors();
        draw();
        start();
      }
    };
    reduced.addEventListener("change", onReducedChange);

    readColors();
    resize();
    if (!reduced.matches) {
      draw();
      start();
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    host.addEventListener("pointermove", onPointerMove);
    host.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stop();
      observer.disconnect();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      reduced.removeEventListener("change", onReducedChange);
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
    />
  );
}
