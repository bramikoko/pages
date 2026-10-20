"use client";

import { useRef } from "react";
import { Moon, Sun } from "lucide-react";
import { gsap } from "@/lib/gsap";

export default function ThemeToggle({
  theme,
  onToggle,
}: {
  theme: "light" | "dark";
  onToggle: () => void;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const busyRef = useRef(false);

  const handleClick = () => {
    const button = buttonRef.current;
    if (!button || busyRef.current) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onToggle();
      return;
    }

    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(window.innerWidth, window.innerHeight);
    const overlay = document.createElement("div");

    overlay.className = "theme-wipe";
    overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`;
    document.body.appendChild(overlay);
    busyRef.current = true;

    gsap.to(overlay, {
      clipPath: `circle(${radius}px at ${x}px ${y}px)`,
      duration: 0.55,
      ease: "power4.inOut",
      onComplete: () => {
        onToggle();
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.35,
          delay: 0.05,
          onComplete: () => {
            overlay.remove();
            busyRef.current = false;
          },
        });
      },
    });
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      aria-label={
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      }
      aria-pressed={theme === "dark"}
      className="inline-flex h-11 w-11 items-center justify-center border border-line transition-colors hover:bg-ink hover:text-paper"
    >
      {theme === "dark" ? (
        <Sun aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
      ) : (
        <Moon aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
      )}
    </button>
  );
}
