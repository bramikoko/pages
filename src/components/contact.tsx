"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export type ContactLinkData = {
  id: number | string;
  platform: string;
  label: string;
  url: string;
};

// per-platform chrome (icon, note, external flag) — the url/label come
// from the database; this only decorates what the db returns
const META: Record<string, { icon: string; note: string; external: boolean }> = {
  github: { icon: "\uf09b", note: "code, issues, and commit history", external: true },
  email: { icon: "\uf0e0", note: "the fastest way to reach me", external: false },
  whatsapp: { icon: "\uf232", note: "whatsapp — say who you are first", external: true },
  instagram: { icon: "\uf16d", note: "behind the screen", external: true },
  reddit: { icon: "\uf1a1", note: "lurking, mostly", external: true },
  linkedin: { icon: "\uf0e1", note: "the serious one — recruiters welcome", external: true },
  x: { icon: "\ue61b", note: "thoughts in short bursts", external: true },
  youtube: { icon: "\uf167", note: "watch me build, occasionally", external: true },
  tiktok: { icon: "\ue07b", note: "quick dev clips", external: true },
  discord: { icon: "\uf392", note: "the fastest chat", external: true },
};


export default function Contact({
  links: dbLinks = [],
}: {
  links?: ContactLinkData[];
}) {
  // the database is the only source — no rows, no links
  const resolved = dbLinks.map((l) => ({
    href: l.url,
    icon: META[l.platform]?.icon ?? "\uf02d",
    label: l.label,
    note: META[l.platform]?.note ?? "",
    external: META[l.platform]?.external ?? true,
  }));

  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // heading words rise in
      gsap.from(".contact-title", {
        yPercent: 60,
        autoAlpha: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 80%", once: true },
      });
      // links cascade in
      gsap.from(".contact-link", {
        y: 40,
        autoAlpha: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: ".contact-links", start: "top 88%", once: true },
      });
      // arrow nudges on hover
      document.querySelectorAll<HTMLElement>(".contact-link").forEach((link) => {
        const arrow = link.querySelector(".nf");
        if (!arrow) return;
        link.addEventListener("mouseenter", () => {
          gsap.fromTo(arrow, { x: -6 }, { x: 0, duration: 0.3, ease: "power2.out" });
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="contact" id="contact" ref={root}>
      <div className="container">
        <p className="sec-label">
          <span className="sec-index">05</span> contact
        </p>
        <h2 className="contact-title">
          got something <span className="outline">to build?</span>
        </h2>

        <div className="contact-links">
          {resolved.map((l) => (
            <a
              key={l.label}
              className="contact-link"
              href={l.href}
              target={l.external ? "_blank" : undefined}
              rel={l.external ? "noreferrer" : undefined}
            >
              <span className="fill" aria-hidden="true" />
              <span>
                <span className="nf" aria-hidden="true">
                  {l.icon}
                </span>{" "}
                {l.label}
              </span>
              <span className="small">{l.note}</span>
            </a>
          ))}
          {resolved.length === 0 && (
            <div className="drawer-empty contact-empty">
              <p className="empty-title">no links wired yet</p>
              <p className="small">the wall is still being built — check back soon.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
