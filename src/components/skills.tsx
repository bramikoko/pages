"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Skill } from "@/src/lib/data";

export default function Skills({
  skills,
  softSkills,
}: {
  skills: Skill[];
  softSkills: Skill[];
}) {
  const root = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progRef = useRef<HTMLElement>(null);
  const progWrapRef = useRef<HTMLDivElement>(null);
  const winRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const [active, setActive] = useState<{ s: Skill; soft: boolean } | null>(null);

  // rows under this many cards are centered and static — they don't scroll.
  // the horizontal pin only exists when at least one row actually overflows
  const SCROLL_MIN = 6;
  const needsScroll = skills.length >= SCROLL_MIN || softSkills.length >= SCROLL_MIN;

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const track = trackRef.current;
      if (!track) return;

      // velocity skew — the whole card field leans into fast scrolls and
      // settles back, so the horizontal travel feels physical, not flat
      const skewSetter = gsap.quickSetter(".skill-card", "skewX", "deg");
      const skewProxy = { v: 0 };
      const progInner = progRef.current;
      const progWrap = progWrapRef.current;
      const STEPS = 16; // blocky pixel fill — progress snaps to blocks

      if (needsScroll) {
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 48);

        // a centered row inside a scrolling track would drift across the
        // screen — pin it to the viewport instead: size it to the viewport
        // and counter-translate by exactly what the track travels
        const softRowCards = root.current?.querySelector<HTMLElement>(
          ".skill-row[data-side='left'] .row-cards",
        );
        const softCentered = softSkills.length < SCROLL_MIN && softRowCards;
        const sizeSoftRow = () => {
          if (softCentered && softRowCards) {
            softRowCards.style.width = `${window.innerWidth - 48}px`;
          }
        };
        sizeSoftRow();
        ScrollTrigger.addEventListener("refreshInit", sizeSoftRow);

        // counter-tween: same trigger, same scrub — the soft row moves
        // forward exactly as much as the track moves back, so a centered
        // row stays pinned to the viewport while hard cards travel past
        if (softCentered && softRowCards) {
          gsap.to(softRowCards, {
            x: () => distance(),
            ease: "none",
            scrollTrigger: {
              trigger: ".skills-viewport",
              start: "top top",
              end: () => `+=${distance() + window.innerHeight * 0.4}`,
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });
        }

        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: ".skills-viewport",
            start: "top top",
            end: () => `+=${distance() + window.innerHeight * 0.4}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              const skew = gsap.utils.clamp(-8, 8, self.getVelocity() / -350);
              if (Math.abs(skew) > Math.abs(skewProxy.v)) {
                skewProxy.v = skew;
                gsap.to(skewProxy, {
                  v: 0,
                  duration: 0.8,
                  ease: "power3.out",
                  overwrite: true,
                  onUpdate: () => skewSetter(skewProxy.v),
                });
              }
              if (progInner) {
                // quantize to blocks so the fill reads as chunky pixels
                gsap.set(progInner, {
                  scaleX: Math.round(self.progress * STEPS) / STEPS,
                });
              }
              if (progWrap) {
                gsap.to(progWrap, {
                  autoAlpha: self.isActive ? 1 : 0,
                  duration: 0.25,
                  overwrite: "auto",
                });
              }
            },
          },
        });
      } else {
        // nothing overflows — no pin, no travel meter
        if (progWrap) gsap.set(progWrap, { autoAlpha: 0 });
      }

      // hard skills enter from the right and cascade right-to-left,
      // soft skills enter from the left and cascade left-to-right
      gsap.from(".skill-row[data-side='right'] .skill-card", {
        x: 220,
        autoAlpha: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: { each: 0.07, from: "end" },
        scrollTrigger: { trigger: ".skills-viewport", start: "top 70%", once: true },
      });
      gsap.from(".skill-row[data-side='left'] .skill-card", {
        x: -220,
        autoAlpha: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: { each: 0.07, from: "start" },
        scrollTrigger: { trigger: ".skills-viewport", start: "top 70%", once: true },
      });
      gsap.from(".row-label", {
        autoAlpha: 0,
        y: 14,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.15,
        scrollTrigger: { trigger: ".skills-viewport", start: "top 70%", once: true },
      });

      // percentage bars fill once the section is reached — horizontally
      // travelling bars fill during the pin, centered rows fill on approach
      gsap.utils.toArray<HTMLElement>(".skill-bar i").forEach((bar) => {
        const pct = bar.dataset.pct ?? "0";
        const centered = bar.closest(".row-cards")?.classList.contains("centered");
        gsap.to(bar, {
          width: `${pct}%`,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: bar, start: centered ? "top 92%" : "left 90%" },
        });
      });

      // micro-interaction: icon nudges on hover
      document.querySelectorAll<HTMLElement>(".skill-card").forEach((card) => {
        const icon = card.querySelector(".skill-icon");
        if (!icon) return;
        card.addEventListener("mouseenter", () => {
          gsap.fromTo(
            icon,
            { x: -3, skewX: -12 },
            { x: 0, skewX: 0, duration: 0.35, ease: "power2.out" },
          );
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);
  // ------- skill modal (draggable, like the blog reader) -------
  const openSkill = useCallback((s: Skill, soft: boolean) => {
    const win = winRef.current;
    const bd = backdropRef.current;
    if (!win) return;
    setActive({ s, soft });
    window.__loco?.stop();

    const w = win.offsetWidth;
    const h = win.offsetHeight;
    const x = Math.max(16, (window.innerWidth - w) / 2 + (Math.random() * 60 - 30));
    const y = Math.max(70, (window.innerHeight - h) / 2 + (Math.random() * 40 - 20));
    gsap.set(win, { x, y });
    gsap.set(win, { visibility: "visible", scale: 0.92, autoAlpha: 0 });
    gsap.to(win, { scale: 1, autoAlpha: 1, duration: 0.45, ease: "power3.out" });
    if (bd) {
      gsap.set(bd, { visibility: "visible", autoAlpha: 0 });
      gsap.to(bd, { autoAlpha: 1, duration: 0.4, ease: "power2.out" });
    }
    // the modal's bar fills in from zero
    if (barRef.current) {
      gsap.fromTo(
        barRef.current,
        { width: "0%" },
        { width: `${s.pct}%`, duration: 0.9, delay: 0.2, ease: "power3.out" },
      );
    }
    win.querySelector("button")?.focus();
  }, []);

  const closeSkill = useCallback(() => {
    const win = winRef.current;
    const bd = backdropRef.current;
    if (!win) return;
    gsap.to(win, {
      scale: 0.94,
      autoAlpha: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => gsap.set(win, { visibility: "hidden" }),
    });
    if (bd) {
      gsap.to(bd, {
        autoAlpha: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => gsap.set(bd, { visibility: "hidden" }),
      });
    }
    window.__loco?.start();
    setActive(null);
  }, []);

  // dragging by the title bar
  useEffect(() => {
    const win = winRef.current;
    const bar = win?.querySelector<HTMLElement>(".win-bar");
    if (!win || !bar) return;

    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      const rect = win.getBoundingClientRect();
      drag.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
      try {
        bar.setPointerCapture(e.pointerId);
      } catch {
        // synthetic pointer events have no capturable pointer
      }
    };
    const move = (e: PointerEvent) => {
      if (!drag.current) return;
      const x = e.clientX - drag.current.dx;
      const y = e.clientY - drag.current.dy;
      gsap.set(win, {
        x: Math.min(Math.max(x, -win.offsetWidth + 120), window.innerWidth - 120),
        y: Math.min(Math.max(y, 0), window.innerHeight - 60),
      });
    };
    const up = () => {
      drag.current = null;
    };

    bar.addEventListener("pointerdown", down);
    bar.addEventListener("pointermove", move);
    bar.addEventListener("pointerup", up);
    bar.addEventListener("pointercancel", up);
    return () => {
      bar.removeEventListener("pointerdown", down);
      bar.removeEventListener("pointermove", move);
      bar.removeEventListener("pointerup", up);
      bar.removeEventListener("pointercancel", up);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && active) closeSkill();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, closeSkill]);

  // ------- rows: real data only — no fake padding. the soft row's cards
  // flex wider so both rows still end at the same point -------
  const renderCard = (s: Skill, i: number, soft = false) => (
    <button
      key={`${soft ? "soft" : "hard"}-${s.name}-${i}`}
      type="button"
      className={`skill-card ${soft ? "soft" : ["tall", "short", "mid"][i % 3]}`}
      onClick={() => openSkill(s, soft)}
    >
      <span className="skill-icon nf" aria-hidden="true">
        {s.icon}
      </span>
      <div className="skill-name">{s.name}</div>
      <div className="skill-pct">{s.pct}%</div>
      <div className="skill-bar">
        <i data-pct={s.pct} />
      </div>
    </button>
  );

  const emptyRow = (label: string) => (
    <div className="skill-row-empty">
      <p className="empty-title">no {label} listed yet</p>
      <p className="small">this shelf is still being stocked.</p>
    </div>
  );

  const level = (pct: number) => (pct >= 90 ? "advanced" : pct >= 75 ? "solid" : "growing");

  return (
    <section className={`skills${needsScroll ? "" : " no-pin"}`} id="skills" ref={root}>
      <div className="skills-viewport">
        <div className="skills-stage">
          <div className="skills-head">
            <p className="sec-label">
              <span className="sec-index">02</span> skills
            </p>
            <h2 className="h-display" style={{ fontSize: "clamp(2rem, 5vw, 3.6rem)" }} data-reveal>
              things i am <span className="outline">dangerous</span> with
            </h2>
          </div>

          <div className="skills-track" ref={trackRef}>
            <div className="skill-row" data-side="right">
              <span className="row-label">hard skills</span>
              {skills.length === 0 ? (
                emptyRow("hard skills")
              ) : (
                <div
                  className={`row-cards${skills.length < SCROLL_MIN ? " centered" : ""}`}
                >
                  {skills.map((s, i) => renderCard(s, i))}
                </div>
              )}
            </div>
            <div className="skill-row" data-side="left">
              <span className="row-label">soft skills</span>
              {softSkills.length === 0 ? (
                emptyRow("soft skills")
              ) : (
                <div
                  className={`row-cards${softSkills.length < SCROLL_MIN ? " centered" : ""}`}
                >
                  {softSkills.map((s, i) => renderCard(s, i, true))}
                </div>
              )}
            </div>
          </div>

          {/* horizontal travel meter — ascii bracket + pixel track, only
              visible while the horizontal scroll is active */}
          <div className="skills-progress" ref={progWrapRef} aria-hidden="true">
            <span className="bracket">[</span>
            <span className="track">
              <i ref={progRef} />
            </span>
            <span className="bracket">]</span>
          </div>
        </div>
      </div>

      {/* dim backdrop so the skill modal owns the screen */}
      <div className="win-backdrop" ref={backdropRef} onClick={closeSkill} aria-hidden="true" />

      {/* draggable skill modal — same window treatment as the blog reader */}
      <div
        className="win skill-win"
        ref={winRef}
        role="dialog"
        aria-modal="true"
        aria-label={active ? `${active.s.name} details` : "skill details"}
      >
        <div className="win-bar px-dots">
          <span className="win-title">
            <span className="nf" aria-hidden="true">&#xf02d;</span>{" "}
            {active ? `${active.s.name}.skill` : "skill.info"}
          </span>
          <button className="pop-close" type="button" onClick={closeSkill}>
            <span className="nf" aria-hidden="true">&#xf00d;</span> close
          </button>
        </div>
        <div className="win-body skill-win-body" data-lenis-prevent>
          {active && (
            <>
              <div className="skill-win-head">
                <span className="skill-win-icon nf" aria-hidden="true">
                  {active.s.icon}
                </span>
                <div>
                  <h3 className="skill-win-name">{active.s.name}</h3>
                  <p className="skill-win-meta">
                    {active.soft ? "soft skill" : "hard skill"} — {level(active.s.pct)}
                  </p>
                </div>
                <span className="skill-win-pct">{active.s.pct}%</span>
              </div>
              <div className="skill-bar skill-win-bar">
                <i ref={barRef} style={{ width: `${active.s.pct}%` }} />
              </div>
              <p className="skill-win-desc">{active.s.desc}</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
