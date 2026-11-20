"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { heroHookLines, heroDesc, profile, GITHUB } from "@/src/lib/data";
import { scrollToSection } from "./smooth";

const GLYPHS = "▚▞▛▜▘▝▖▗░▒▓#*+=<>/\\|01";

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // intro + parallax
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".hero-eyebrow", { y: 16, autoAlpha: 0, duration: 0.7, ease: "power3.out" });
      gsap.from(".hero-title .char", {
        yPercent: 110,
        autoAlpha: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: { each: 0.02, from: "start" },
        delay: 0.15,
      });
      gsap.from(".hero-sub, .hero-ctas", {
        y: 24,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.14,
        ease: "power3.out",
        delay: 0.7,
      });
      gsap.from(".gh-card", {
        autoAlpha: 0,
        scale: 0.85,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.9,
      });
      // .nav lives outside this section — pass the element directly so
      // the context scope doesn't hide it (scoped selector text = not found)
      const navEl = document.querySelector(".nav");
      if (navEl) gsap.from(navEl, { yPercent: -100, duration: 0.6, ease: "power3.out" });

      // parallax drift on the title
      gsap.to(".hero-title", {
        yPercent: -26,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".hero-eyebrow", {
        yPercent: 90,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".hero-sub", {
        yPercent: 60,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });

      // marquee
      const track = document.querySelector(".hero-marquee-track");
      if (track) {
        gsap.to(track, { xPercent: -50, ease: "none", duration: 22, repeat: -1 });
      }
    }, root);

    return () => ctx.revert();
  }, []);

  // easter egg: scramble the hook on hover (silent — no hints)
  const scramble = () => {
    const el = titleRef.current;
    if (!el) return;
    const chars = Array.from(el.querySelectorAll<HTMLElement>(".char"));
    const original = chars.map((c) => c.dataset.ch ?? "");

    let frame = 0;
    const total = 14;
    const iv = window.setInterval(() => {
      frame += 1;
      chars.forEach((c, i) => {
        if (i < (frame / total) * original.length) {
          c.textContent = original[i];
        } else {
          c.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      });
      if (frame >= total) {
        window.clearInterval(iv);
        chars.forEach((c, i) => (c.textContent = original[i]));
      }
    }, 42);
  };

  // draggable + teleporting profile card
  useEffect(() => {
    const card = cardRef.current;
    const hero = root.current;
    if (!card || !hero) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // --- tilt on hover ---
    const rx = gsap.quickTo(card, "rotationX", { duration: 0.4, ease: "power2.out" });
    const ry = gsap.quickTo(card, "rotationY", { duration: 0.4, ease: "power2.out" });
    const onTilt = (e: MouseEvent) => {
      const r = card.getBoundingClientRect();
      rx(-((e.clientY - r.top) / r.height - 0.5) * 10);
      ry(((e.clientX - r.left) / r.width - 0.5) * 10);
    };
    const onTiltEnd = () => {
      rx(0);
      ry(0);
    };
    card.addEventListener("mousemove", onTilt);
    card.addEventListener("mouseleave", onTiltEnd);

    // --- drag ---
    let dragging = false;
    let sx = 0;
    let sy = 0;
    let ox = 0;
    let oy = 0;
    let lastX = 0;
    let hovered = false;

    const onHoverStart = () => {
      hovered = true;
    };
    const onHoverEnd = () => {
      hovered = false;
    };
    card.addEventListener("mouseenter", onHoverStart);
    card.addEventListener("mouseleave", onHoverEnd);

    const onDown = (e: PointerEvent) => {
      // the "open profile" row is a real link — let it click, don't drag
      if ((e.target as HTMLElement).closest("a")) return;
      dragging = true;
      sx = e.clientX;
      sy = e.clientY;
      lastX = e.clientX;
      const cur = gsap.getProperty(card, "x") as number;
      const curY = gsap.getProperty(card, "y") as number;
      ox = typeof cur === "number" ? cur : 0;
      oy = typeof curY === "number" ? curY : 0;
      // pick the card up: lift, deepen the shadow, kill the idle tilt
      card.classList.add("dragging");
      gsap.to(card, {
        scale: 1.05,
        rotationX: 0,
        rotationY: 0,
        duration: 0.35,
        ease: "power3.out",
      });
      card.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      gsap.set(card, { x: ox + (e.clientX - sx), y: oy + (e.clientY - sy) });
      // lean into the drag direction, like paper being pulled through air
      const vx = e.clientX - lastX;
      lastX = e.clientX;
      gsap.to(card, {
        rotation: gsap.utils.clamp(-9, 9, vx * 0.55),
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      card.classList.remove("dragging");
      // drop it back with a springy settle
      gsap.to(card, {
        scale: 1,
        rotation: 0,
        duration: 0.9,
        ease: "elastic.out(1, 0.55)",
      });
    };
    card.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    // --- teleport: glitch out, reappear somewhere else in the hero ---
    const place = () => {
      const hr = hero.getBoundingClientRect();
      const cr = card.getBoundingClientRect();
      const maxX = Math.max(16, hr.width - cr.width - 24);
      const maxY = Math.max(60, hr.height - cr.height - 90);
      gsap.set(card, {
        x: 0,
        y: 0,
        left: 24 + Math.random() * maxX,
        top: 90 + Math.random() * maxY,
        right: "auto",
        bottom: "auto",
      });
    };

    const teleport = () => {
      if (reduced || dragging || hovered) return;
      gsap
        .timeline()
        .to(card, {
          autoAlpha: 0,
          scale: 0.88,
          skewX: 10,
          duration: 0.22,
          ease: "power2.in",
          onComplete: place,
        })
        .to(card, { autoAlpha: 0.9, duration: 0.05, repeat: 3, yoyo: true }) // glitch flicker
        .to(card, { autoAlpha: 1, scale: 1, skewX: 0, duration: 0.4, ease: "power3.out" });
    };

    const tpTimer = window.setInterval(teleport, 7000);

    return () => {
      window.clearInterval(tpTimer);
      card.removeEventListener("mousemove", onTilt);
      card.removeEventListener("mouseleave", onTiltEnd);
      card.removeEventListener("mouseenter", onHoverStart);
      card.removeEventListener("mouseleave", onHoverEnd);
      card.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  const renderLine = (text: string, key: number) => (
    <span className="line" key={key} aria-hidden="true">
      {Array.from(text).map((ch, i) => (
        <span key={i} className="char" data-ch={ch}>
          {ch}
        </span>
      ))}
    </span>
  );

  return (
    <section className="hero" id="hero" ref={root}>
      <div className="container">
        <p className="hero-eyebrow">
          <span className="blink" aria-hidden="true" />
          <span>{profile.role} — {profile.location}</span>
        </p>

        <h1
          className="hero-title h-display"
          ref={titleRef}
          onMouseEnter={scramble}
          aria-label={heroHookLines.join(" ")}
        >
          {heroHookLines.map((line, i) => renderLine(line, i))}
        </h1>

        <p className="hero-sub">{heroDesc}</p>

        <div className="hero-ctas">
          <button
            className="btn btn-paper"
            onClick={() => scrollToSection("#about")}
            type="button"
          >
            <span className="nf" aria-hidden="true">&#xf061;</span>
            <span>what i do</span>
          </button>
          <a className="btn" href={GITHUB} target="_blank" rel="noreferrer">
            <span className="nf" aria-hidden="true">&#xf09b;</span>
            <span>my github</span>
          </a>
        </div>
      </div>

      {/* draggable, teleporting profile card — pfp only, info on hover.
          the card itself is a div so dragging never navigates; only the
          "open profile" row inside is a real link */}
      <div
        className="gh-card"
        ref={cardRef}
        aria-label={`github profile: ${profile.handle}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={profile.avatar} alt="" draggable={false} />
        <div className="gh-info">
          <div className="gh-card-name">{profile.name}</div>
          <div className="gh-card-role">@{profile.handle} — {profile.bio}</div>
          <div className="gh-card-stats">
            <div className="gh-stat">
              <b>{profile.repos}</b>
              <span>repos</span>
            </div>
            <div className="gh-stat">
              <b>{profile.followers}</b>
              <span>followers</span>
            </div>
            <div className="gh-stat">
              <b>{profile.following}</b>
              <span>following</span>
            </div>
          </div>
          <a className="gh-card-link" href={GITHUB} target="_blank" rel="noreferrer">
            <span>open profile</span>
            <span className="nf" aria-hidden="true">&#xf08e;</span>
          </a>
        </div>
      </div>

      <div className="hero-marquee" aria-hidden="true">
        <span className="hero-marquee-track">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i}>
              {"fullstack — pixel pusher — terminal enjoyer — bug whisperer — banjarmasin — "
                .repeat(3)}
            </span>
          ))}
        </span>
      </div>
    </section>
  );
}
