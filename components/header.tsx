"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { navItems, profile, socials } from "@/lib/data";
import LocalClock from "./local-clock";
import SocialLink from "./social-link";
import ThemeToggle from "./theme-toggle";

export default function Header({
  theme,
  onToggleTheme,
}: {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}) {
  const [active, setActive] = useState("work");
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const sections = [
      document.getElementById("top"),
      ...navItems.map((item) => document.getElementById(item.id)),
    ].filter((section): section is HTMLElement => section !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;
        setActive(visible.target.id === "top" ? "" : visible.target.id);
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.2, 0.5, 1] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;

    const menu = menuRef.current;
    const trigger = triggerRef.current;
    if (!menu || !trigger) return;

    const focusable = [
      trigger,
      ...Array.from(
        menu.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ),
    ];
    const first = menu.querySelector<HTMLElement>("a[href]");
    const previousOverflow = document.body.style.overflow;

    first?.focus();
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger.focus();
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[var(--header-h)] border-b border-line bg-paper">
      <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between gap-4 px-4 md:px-8">
        <a
          href="#top"
          className="flex min-h-11 shrink-0 items-center gap-2"
          aria-label="bram, back to top"
        >
          <span className="bg-ink px-2 py-1 text-[0.78rem] font-bold leading-none tracking-[-0.04em] text-paper">
            bram
          </span>
          <span aria-hidden="true" className="h-3 w-3 bg-lime" />
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              aria-current={active === item.id ? "location" : undefined}
              className={`label inline-flex min-h-11 items-center px-4 transition-colors hover:bg-ink hover:text-paper ${
                active === item.id ? "bg-ink text-paper" : ""
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LocalClock className="label hidden text-muted lg:inline-block" />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? "Close site menu" : "Open site menu"}
            className="relative z-50 inline-flex min-h-11 items-center gap-2 border border-line px-3 transition-colors hover:bg-ink hover:text-paper md:hidden"
          >
            {open ? (
              <X aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
            ) : (
              <Menu aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
            )}
            <span className="label">{open ? "close" : "menu"}</span>
          </button>
        </div>
      </div>

      {open ? (
        <div
          ref={menuRef}
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="menu-panel fixed inset-0 z-40 overflow-y-auto bg-paper pt-[var(--header-h)] md:hidden"
        >
          <div className="flex min-h-full flex-col justify-between p-4 pb-8">
            <nav aria-label="Mobile" className="border-t border-line">
              {navItems.map((item, index) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active === item.id ? "location" : undefined}
                  className="group flex items-center justify-between gap-4 border-b border-line px-4 py-3 transition-colors hover:bg-lime hover:text-lime-ink"
                >
                  <span className="label">{String(index + 1).padStart(2, "0")}</span>
                  <span className="display text-[clamp(2.4rem,12vw,5rem)]">
                    {item.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className="label opacity-50 group-hover:opacity-100"
                  >
                    go
                  </span>
                </a>
              ))}
            </nav>

            <div className="mt-10">
              <p className="label mb-3 text-muted">{profile.email}</p>
              <div className="flex flex-wrap gap-2">
                {socials.map((social) => (
                  <SocialLink
                    key={social.label}
                    social={social}
                    compact
                    className="bg-paper"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
