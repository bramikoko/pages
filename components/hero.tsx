"use client";

import { useRef } from "react";
import Image from "next/image";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText } from "@/lib/gsap";
import { profile } from "@/lib/data";
import Magnetic from "./magnetic";

export default function Hero({ ready }: { ready: boolean }) {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!ready) return;
      const title = titleRef.current;
      const hero = heroRef.current;
      if (!title || !hero) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const split = new SplitText(title, {
        type: "chars",
        charsClass: "hero-char",
      });

      const timeline = gsap.timeline({
        defaults: { ease: "power4.out" },
      });

      timeline
        .from(
          split.chars,
          {
            yPercent: 120,
            rotate: 4,
            duration: 1.1,
            stagger: 0.06,
          },
          0,
        )
        .from(
          ".hero-subline",
          { yPercent: 100, opacity: 0, duration: 0.8 },
          0.35,
        )
        .from(
          ".hero-copy",
          { y: 24, opacity: 0, duration: 0.7 },
          0.5,
        )
        .from(
          ".hero-card",
          { y: 40, rotate: 2, opacity: 0, duration: 0.9 },
          0.25,
        )
        .from(
          ".hero-meta > *",
          { y: 18, opacity: 0, duration: 0.55, stagger: 0.06 },
          0.6,
        )
        .from(
          ".hero-cta > *",
          { y: 18, opacity: 0, duration: 0.55, stagger: 0.08 },
          0.75,
        )
        .from(".hero-talk", { y: 18, opacity: 0, duration: 0.55 }, 0.75)
        .from(
          ".hero-status > *",
          { y: 14, opacity: 0, duration: 0.5, stagger: 0.05 },
          0.9,
        );

      return () => {
        timeline.kill();
        split.revert();
      };
    },
    { scope: heroRef, dependencies: [ready], revertOnUpdate: true },
  );

  useGSAP(
    () => {
      const hero = heroRef.current;
      if (!hero) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(".hero-card-wrap", {
          y: 70,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
        gsap.to(".hero-title-wrap", {
          y: -30,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
        gsap.to(".hero-avatar-image", {
          scale: 1.08,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      return () => media.revert();
    },
    { scope: heroRef },
  );

  useGSAP(
    () => {
      const card =
        heroRef.current?.querySelector<HTMLElement>(".hero-card");
      if (!card) return;
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        return;
      }
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const rotateX = gsap.quickTo(card, "rotationX", {
        duration: 0.5,
        ease: "power3.out",
      });
      const rotateY = gsap.quickTo(card, "rotationY", {
        duration: 0.5,
        ease: "power3.out",
      });

      const onMove = (event: PointerEvent) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        rotateY(x * 8);
        rotateX(y * -6);
      };
      const onLeave = () => {
        rotateX(0);
        rotateY(0);
      };

      card.addEventListener("pointermove", onMove);
      card.addEventListener("pointerleave", onLeave);

      return () => {
        card.removeEventListener("pointermove", onMove);
        card.removeEventListener("pointerleave", onLeave);
        gsap.set(card, { clearProps: "transform" });
      };
    },
    { scope: heroRef },
  );

  return (
    <section
      id="top"
      ref={heroRef}
      className="flex min-h-[94svh] flex-col pt-[var(--header-h)]"
    >
      <div className="mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-4 gap-x-4 gap-y-10 px-4 pt-6 pb-6 md:px-8 lg:grid-cols-12 lg:pt-10 lg:pb-6">
        <div className="col-span-4 flex flex-col justify-between lg:col-span-8">
          <div className="hero-meta label flex flex-wrap justify-between gap-2 border-b border-line pb-3 text-muted">
            <span>portfolio / 2026</span>
            <span>
              based in <span className="normal-case">{profile.location}</span>
            </span>
          </div>

          <div className="hero-title-wrap my-10 lg:my-14">
            <h1 className="display text-[clamp(6rem,24vw,24rem)]">
              <span className="sr-only">bram, web developer</span>
              <span
                ref={titleRef}
                aria-hidden="true"
                className="block overflow-hidden"
              >
                bram
              </span>
            </h1>
            <p className="hero-subline mt-2 overflow-hidden text-[clamp(1.5rem,4.2vw,3.4rem)] font-medium leading-none tracking-[-0.045em]">
              builds for the web.
            </p>
            <p className="hero-copy mt-6 max-w-xl text-[clamp(1rem,1.4vw,1.18rem)] leading-relaxed text-muted">
              I build for the web, learn Nuxt.js, Next.js, and Laravel, and make
              Linux behave.
            </p>
          </div>

          <div className="hero-cta flex flex-wrap gap-3">
            <Magnetic>
              <a
                href="#work"
                className="inline-flex min-h-12 items-center justify-between gap-10 bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-lime hover:text-lime-ink"
              >
                <span>see the work</span>
                <ArrowDown
                  aria-hidden="true"
                  className="h-4 w-4"
                  strokeWidth={2}
                />
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="#contact"
                className="inline-flex min-h-12 items-center justify-between gap-10 border border-line px-5 py-3 text-sm font-medium transition-colors hover:bg-ink hover:text-paper"
              >
                <span>say hi</span>
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4"
                  strokeWidth={2}
                />
              </a>
            </Magnetic>
          </div>
        </div>

        <div className="hero-card-wrap col-span-4 flex flex-col gap-3 [perspective:1200px] lg:col-span-4 lg:justify-between">
          <div className="hero-card [transform-style:preserve-3d]">
            <figure className="group border border-line bg-ink text-paper">
              <div className="flex items-center justify-between border-b border-lime-ink bg-lime px-4 py-2 text-lime-ink">
                <span className="label">id / 001</span>
                <span className="label">bram</span>
              </div>
              <div className="relative aspect-[5/6] overflow-hidden bg-lime">
                <Image
                  src="/avatar.jpg"
                  alt="bram's GitHub avatar, a plush character with round glasses"
                  width={460}
                  height={460}
                  priority
                  sizes="(min-width: 1024px) 30vw, 100vw"
                  className="hero-avatar-image h-full w-full object-cover grayscale contrast-125 transition-[filter] duration-500 group-hover:grayscale-0 motion-reduce:transition-none"
                />
              </div>
              <figcaption className="flex items-center justify-between border-t border-paper/20 px-4 py-2">
                <span className="label">{profile.pronouns}</span>
                <span className="label">Banjarmasin, ID</span>
              </figcaption>
            </figure>
          </div>

          <a
            href="#contact"
            className="hero-talk flex min-h-12 items-center justify-between border border-line px-4 py-3 transition-colors hover:bg-ink hover:text-paper"
          >
            <span className="label">open to talk</span>
            <ArrowDown
              aria-hidden="true"
              className="h-4 w-4"
              strokeWidth={2}
            />
          </a>
        </div>
      </div>

      <div className="hero-status mx-auto grid w-full max-w-[1600px] grid-cols-2 gap-px border border-line bg-line md:grid-cols-4">
        <div className="bg-paper py-3 pr-3 pl-4 md:py-4 md:pr-4 md:pl-8">
          <p className="label text-muted">based in</p>
          <p className="mt-1 text-sm">Banjarmasin, Indonesia</p>
        </div>
        <div className="bg-paper p-3 md:p-4">
          <p className="label text-muted">working with</p>
          <p className="mt-1 text-sm">red.dev</p>
        </div>
        <div className="bg-paper p-3 md:p-4">
          <p className="label text-muted">studying</p>
          <p className="mt-1 text-sm">12th grade</p>
        </div>
        <div className="bg-paper py-3 pr-4 pl-3 md:py-4 md:pr-8 md:pl-4">
          <p className="label text-muted">off screen</p>
          <p className="mt-1 text-sm">anime, manga</p>
        </div>
      </div>
    </section>
  );
}
