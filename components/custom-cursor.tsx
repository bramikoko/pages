"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.documentElement.classList.add("cursor-active");
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -100, y: -100 });

    const dotX = gsap.quickTo(dot, "x", {
      duration: 0.08,
      ease: "power2.out",
    });
    const dotY = gsap.quickTo(dot, "y", {
      duration: 0.08,
      ease: "power2.out",
    });
    const ringX = gsap.quickTo(ring, "x", {
      duration: 0.32,
      ease: "power3.out",
    });
    const ringY = gsap.quickTo(ring, "y", {
      duration: 0.32,
      ease: "power3.out",
    });

    const handleMove = (event: PointerEvent) => {
      dotX(event.clientX);
      dotY(event.clientY);
      ringX(event.clientX);
      ringY(event.clientY);
      document.documentElement.classList.add("cursor-ready");
    };

    const handleOver = (event: PointerEvent) => {
      const target =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>("a, button, [data-cursor]")
          : null;

      if (!target) {
        ring.dataset.mode = "";
        return;
      }

      ring.dataset.mode = target.dataset.cursor === "view" ? "view" : "hover";
    };

    const handleDown = () => {
      ring.dataset.pressed = "true";
    };

    const handleUp = () => {
      ring.dataset.pressed = "false";
    };

    const handleLeave = () => {
      document.documentElement.classList.remove("cursor-ready");
    };

    const handleEnter = () => {
      document.documentElement.classList.add("cursor-ready");
    };

    document.addEventListener("pointermove", handleMove, { passive: true });
    document.addEventListener("pointerover", handleOver, { passive: true });
    window.addEventListener("pointerdown", handleDown);
    window.addEventListener("pointerup", handleUp);
    document.documentElement.addEventListener("pointerleave", handleLeave);
    document.documentElement.addEventListener("pointerenter", handleEnter);

    return () => {
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerover", handleOver);
      window.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointerup", handleUp);
      document.documentElement.removeEventListener("pointerleave", handleLeave);
      document.documentElement.removeEventListener("pointerenter", handleEnter);
      document.documentElement.classList.remove("cursor-active", "cursor-ready");
      gsap.killTweensOf([dot, ring]);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} aria-hidden="true" className="cursor-dot" />
      <div
        ref={ringRef}
        aria-hidden="true"
        data-mode=""
        data-pressed="false"
        className="cursor-ring"
      >
        <span className="cursor-label">view</span>
      </div>
    </>
  );
}
