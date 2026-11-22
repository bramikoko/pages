"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { navLinks, GITHUB, EMAIL } from "@/src/lib/data";
import { scrollToSection } from "./smooth";

export default function Nav() {
  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    scrollToSection(href);
  };

  // ---- theme (dark default, persisted, no-flash via inline script in layout) ----
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);

  const applyTheme = (next: "dark" | "light") => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* private mode — fine */
    }
    setTheme(next);
    // pixel background listens for this to repaint its palette
    window.dispatchEvent(new Event("themechange"));
  };

  const toggleTheme = (btn: HTMLElement) => {
    const next = theme === "dark" ? "light" : "dark";

    // animate icon
    const ico = btn.querySelector(".nav-theme-icon");
    if (ico) {
      gsap.fromTo(
        ico,
        { rotate: -180, scale: 0.6 },
        { rotate: 0, scale: 1, duration: 0.35, ease: "back.out(2)" },
      );
    }

    // the circle grows from the button itself
    const r = btn.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    document.documentElement.style.setProperty("--vx", `${cx}px`);
    document.documentElement.style.setProperty("--vy", `${cy}px`);

    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => unknown;
    };
    if (doc.startViewTransition) {
      doc.startViewTransition(() => applyTheme(next));
    } else {
      // fallback: manual circle wipe for browsers without view transitions
      const wipe = document.createElement("div");
      wipe.className = "theme-wipe";
      wipe.style.background = next === "light" ? "#f2f2f2" : "#0a0a0a";
      document.body.appendChild(wipe);
      gsap.fromTo(
        wipe,
        { clipPath: `circle(0px at ${cx}px ${cy}px)` },
        {
          clipPath: `circle(150% at ${cx}px ${cy}px)`,
          duration: 0.5,
          ease: "power3.in",
          onComplete: () => {
            applyTheme(next);
            gsap.to(wipe, {
              autoAlpha: 0,
              duration: 0.35,
              delay: 0.05,
              onComplete: () => wipe.remove(),
            });
          },
        },
      );
    }
  };

  // ---- fullscreen mobile menu ----
  const menuRef = useRef<HTMLDivElement>(null);
  const bar1 = useRef<HTMLSpanElement>(null);
  const bar2 = useRef<HTMLSpanElement>(null);
  const openRef = useRef(false);

  const openMenu = () => {
    openRef.current = true;
    const m = menuRef.current;
    if (!m) return;
    window.__loco?.stop();
    gsap.set(m, { visibility: "visible" });
    gsap.fromTo(
      m,
      { clipPath: "inset(0% 0 100% 0)" },
      { clipPath: "inset(0% 0 0% 0)", duration: 0.55, ease: "power4.inOut" },
    );
    gsap.fromTo(
      ".m-link-inner",
      { yPercent: 130 },
      { yPercent: 0, duration: 0.55, stagger: 0.06, delay: 0.28, ease: "power3.out" },
    );
    gsap.fromTo(
      ".m-menu-head, .m-foot, .m-cta-btn",
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.3, delay: 0.4 },
    );
    gsap.to(bar1.current, { rotate: 45, y: 3.5, duration: 0.3, ease: "power3.out" });
    gsap.to(bar2.current, { rotate: -45, y: -3.5, duration: 0.3, ease: "power3.out" });
  };

  const closeMenu = (href?: string) => {
    openRef.current = false;
    const m = menuRef.current;
    if (!m) return;
    gsap.to(m, {
      clipPath: "inset(0% 0 100% 0)",
      duration: 0.45,
      ease: "power4.inOut",
      onComplete: () => {
        gsap.set(m, { visibility: "hidden" });
        window.__loco?.start();
        if (href) scrollToSection(href);
      },
    });
    gsap.to(bar1.current, { rotate: 0, y: 0, duration: 0.3, ease: "power3.out" });
    gsap.to(bar2.current, { rotate: 0, y: 0, duration: 0.3, ease: "power3.out" });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && openRef.current) closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="nav">
        <nav className="nav-inner" aria-label="main">
          <a
            className="nav-brand"
            href="#hero"
            onClick={(e) => go(e, "#hero")}
          >
            <span className="nf" aria-hidden="true">&#xf120;</span>
            <span>bram.dev</span>
          </a>

          <div className="nav-links">
            {navLinks.map((l) => (
              <a
                key={l.href}
                className="nav-link"
                href={l.href}
                onClick={(e) => go(e, l.href)}
              >
                <span>{l.label}</span>
              </a>
            ))}
          </div>

          <button
            className="nav-theme"
            type="button"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            onClick={(e) => toggleTheme(e.currentTarget)}
          >
            <span className="nf nav-theme-icon" aria-hidden="true">
              {theme === "dark" ? "\uf186" : "\uf185"}
            </span>
          </button>

          <a
            className="nav-cta"
            href={`mailto:${EMAIL}?subject=${encodeURIComponent("need you!")}`}
          >
            <span>need me?</span>
            <span className="nf" aria-hidden="true">&#xf061;</span>
          </a>

          <button
            className="nav-burger"
            type="button"
            aria-label="open menu"
            aria-expanded={openRef.current}
            onClick={() => (openRef.current ? closeMenu() : openMenu())}
          >
            <span className="bar" ref={bar1} />
            <span className="bar" ref={bar2} />
          </button>
        </nav>
      </header>

      <div className="m-menu" ref={menuRef} aria-hidden={!openRef.current}>
        <div className="m-menu-head">
          <span className="brand">
            <span className="nf" aria-hidden="true">&#xf120;</span> bram.dev
          </span>
          <button className="m-close" type="button" onClick={() => closeMenu()}>
            <span className="nf" aria-hidden="true">&#xf00d;</span> close
          </button>
        </div>
        <div className="m-links">
          {navLinks.map((l, i) => (
            <a
              key={l.href}
              className="m-link"
              href={l.href}
              onClick={(e) => {
                e.preventDefault();
                closeMenu(l.href);
              }}
            >
              <span className="fill" aria-hidden="true" />
              <span className="m-link-inner">
                <span className="idx">0{i + 1}</span>
                <span>{l.label}</span>
              </span>
            </a>
          ))}
          <a
            className="btn btn-paper m-cta-btn"
            href={`mailto:${EMAIL}?subject=${encodeURIComponent("need you!")}`}
            onClick={() => closeMenu()}
          >
            <span className="nf" aria-hidden="true">&#xf061;</span>
            <span>need me?</span>
          </a>
        </div>
        <div className="m-foot">
          <span>banjarmasin, id</span>
          <span>&copy; 2026 bram.dev</span>
        </div>
      </div>
    </>
  );
}

export { GITHUB };
