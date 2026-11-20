"use client";

import { useEffect, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

declare global {
  interface Window {
    __loco?: {
      scrollTo: (target: string | number | HTMLElement, opts?: object) => void;
      stop: () => void;
      start: () => void;
    };
  }
}

let registered = false;

export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.classList.toggle("reduced-motion", reduced);

    if (!registered) {
      gsap.registerPlugin(ScrollTrigger);
      registered = true;
    }

    let destroy: (() => void) | undefined;

    if (reduced) {
      // native scrolling only — reveals render instantly via css
      document.documentElement.classList.add("no-js");
      return;
    }

    let disposed = false;
    (async () => {
      const LocomotiveScroll = (await import("locomotive-scroll")).default;
      if (disposed) return;

      const scroll = new LocomotiveScroll({
        lenisOptions: {
          lerp: 0.11,
          wheelMultiplier: 1,
          smoothWheel: true,
        },
        scrollCallback: () => {
          ScrollTrigger.update();
        },
        initCustomTicker: (render) => {
          gsap.ticker.add(render);
        },
        destroyCustomTicker: (render) => {
          gsap.ticker.remove(render);
        },
      });

      window.__loco = {
        scrollTo: (target, opts) => {
          scroll.scrollTo(target as never, {
            offset: -56,
            ...opts,
          });
        },
        stop: () => scroll.stop(),
        start: () => scroll.start(),
      };

      destroy = () => {
        scroll.destroy();
        window.__loco = undefined;
      };

      setupGlobalEffects();
      ScrollTrigger.refresh();
    })();

    return () => {
      disposed = true;
      destroy?.();
    };
  }, []);

  return <>{children}</>;
}

/* ------------------------------------------------------------------ */
/* gsap effects layer: reveals, progress bar, cursor, magnetic buttons */
/* ------------------------------------------------------------------ */

function setupGlobalEffects() {
  // 1. scroll reveals — anything with [data-reveal] rises in fluidly
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 88%",
    once: true,
    onEnter: (els) =>
      gsap.to(els, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.09,
        overwrite: true,
      }),
  });

  // 1b. parallax drift — [data-parallax="8"] floats the element as you scroll
  //     (amounts are amplified so the depth actually reads)
  gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
    const amt = parseFloat(el.dataset.parallax || "8") * 2.6;
    gsap.fromTo(
      el,
      { yPercent: amt },
      {
        yPercent: -amt,
        ease: "none",
        scrollTrigger: {
          trigger: el.parentElement ?? el,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6,
        },
      },
    );
  });

  // 2. thin scroll progress line pinned to the very top
  const bar = document.createElement("div");
  bar.className = "scroll-progress";
  document.body.appendChild(bar);
  gsap.to(bar, {
    scaleX: 1,
    ease: "none",
    scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
  });

  // 3. custom square cursor (difference blend) — desktop pointers only
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    const ring = document.createElement("div");
    ring.className = "cursor-ring";
    document.body.append(dot, ring);

    const dx = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" });
    const dy = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" });
    const rx = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3.out" });
    const ry = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3.out" });

    let shown = false;
    const move = (e: MouseEvent) => {
      if (!shown) {
        shown = true;
        gsap.to([dot, ring], { opacity: 1, duration: 0.2 });
      }
      dx(e.clientX - 5);
      dy(e.clientY - 5);
      rx(e.clientX - 17);
      ry(e.clientY - 17);
    };

    const over = (e: MouseEvent) => {
      const t = (e.target as HTMLElement).closest("a, button, .blog-row, input, textarea");
      gsap.to(ring, {
        scale: t ? 1.6 : 1,
        duration: 0.25,
        ease: "steps(4)",
      });
      gsap.to(dot, { scale: t ? 0.4 : 1, duration: 0.25, ease: "steps(4)" });
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    window.addEventListener("mouseout", over, { passive: true });
  }

  // 4. magnetic pull on depth buttons
  document.querySelectorAll<HTMLElement>(".btn").forEach((btn) => {
    if (btn.closest(".nav")) return;
    const xTo = gsap.quickTo(btn, "x", { duration: 0.3, ease: "power3.out" });
    const yTo = gsap.quickTo(btn, "y", { duration: 0.3, ease: "power3.out" });

    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.18);
      yTo((e.clientY - r.top - r.height / 2) * 0.3);
    });
    btn.addEventListener("mouseleave", () => {
      xTo(0);
      yTo(0);
    });
  });

  // 5. section labels draw their rule line on entry
  gsap.utils.toArray<HTMLElement>(".sec-label").forEach((label) => {
    gsap.from(label, {
      "--line-scale": 0,
      duration: 0.6,
      ease: "steps(6)",
      scrollTrigger: { trigger: label, start: "top 90%", once: true },
    });
  });
}

export function scrollToSection(hash: string) {
  const el = document.querySelector(hash);
  if (!el) return;
  if (window.__loco) {
    window.__loco.scrollTo(el as HTMLElement);
  } else {
    (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
  }
}
