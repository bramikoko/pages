"use client";

import { useRef } from "react";
import Image from "next/image";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText } from "@/lib/gsap";
import { profile, socials } from "@/lib/data";
import HeroParticles from "./hero-particles";
import HeroScene from "./hero-scene";
import LikeButton from "./like-button";
import Magnetic from "./magnetic";

export default function Hero({ ready }: { ready: boolean }) {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const githubHref =
    socials.find((social) => social.icon === "github")?.href ??
    "https://github.com/bramikoko";

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
          y: 65,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
        gsap.to(".hero-title-wrap", {
          y: -45,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
        gsap.to(".hero-avatar-image", {
          scale: 1.12,
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

  return (
    <section
      id="top"
      ref={heroRef}
      className="relative isolate flex min-h-[94svh] flex-col pt-[var(--header-h)]"
    >
      <HeroScene />
      <HeroParticles />
      <div className="mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-4 gap-x-4 gap-y-10 px-4 pt-6 pb-10 md:px-8 lg:grid-cols-12 lg:pt-10 lg:pb-10">
        <div className="col-span-4 flex flex-col justify-between lg:col-span-8">
          <div className="hero-meta label flex flex-wrap justify-between gap-2 border-b border-line pb-3 text-muted">
            <span>hero</span>
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
                className="block overflow-hidden whitespace-nowrap"
              >
                {profile.name}
              </span>
            </h1>
            <p className="hero-subline mt-2 overflow-hidden text-[clamp(1.5rem,4.2vw,3.4rem)] font-medium leading-none tracking-[-0.045em]">
              this happen because it happen
            </p>
            <p className="hero-copy mt-6 max-w-xl text-[clamp(1rem,1.4vw,1.18rem)] leading-relaxed text-muted">
              fullstack web dev, weebs, linux guy, use ai
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

        <div className="hero-card-wrap col-span-4 flex flex-col gap-3 [perspective-distant] lg:col-span-4">
          <div className="lg:flex lg:flex-1 lg:items-center">
            <div className="hero-card w-full">
              <a
                href={githubHref}
                target="_blank"
                rel="noreferrer noopener"
                data-cursor="view"
                aria-label={`${profile.name} on GitHub, opens in a new tab`}
                className="group hero-3d w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <figure className="border border-line bg-ink text-paper transition-colors duration-300 group-hover:border-lime">
                  <div className="flex items-center justify-between border-b border-lime-ink bg-lime px-4 py-2 text-lime-ink">
                    <span className="label">id / 001</span>
                    <span className="label">bram</span>
                  </div>
                  <div className="relative aspect-5/6 overflow-hidden bg-lime">
                    <Image
                      src="/avatar.jpg"
                      alt="bram's GitHub avatar, a plush character with round glasses"
                      width={460}
                      height={460}
                      priority
                      sizes="(min-width: 1024px) 30vw, 100vw"
                      className="hero-avatar-image h-full w-full object-cover object-center grayscale contrast-125 transition-[filter] duration-500 group-hover:grayscale-0 motion-reduce:transition-none"
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-0 items-center justify-between bg-lime px-4 py-2 text-lime-ink transition-transform duration-300 lg:translate-y-full lg:group-hover:translate-y-0 lg:group-focus-visible:translate-y-0 motion-reduce:transition-none"
                    >
                      <span className="label">view github</span>
                      <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
                    </span>
                  </div>
                  <figcaption className="flex items-center justify-between border-t border-paper/20 px-4 py-2">
                    <span className="label">{profile.pronouns}</span>
                    <span className="label">Banjarmasin, ID</span>
                  </figcaption>
                </figure>
                <span aria-hidden="true" />
                <span aria-hidden="true" />
                <span aria-hidden="true" />
                <span aria-hidden="true" />
                <span aria-hidden="true" />
                <span aria-hidden="true" />
                <span aria-hidden="true" />
                <span aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-status mx-auto grid w-full max-w-[1600px] grid-cols-2 gap-px border border-line bg-line md:grid-cols-4 lg:grid-cols-5">
        <div className="bg-paper py-3 pr-3 pl-4 md:py-4 md:pr-4 md:pl-8">
          <p className="label text-muted">based in</p>
          <p className="mt-1 text-sm">Banjarmasin, Indonesia</p>
        </div>
        <div className="bg-paper p-3 md:p-4">
          <p className="label text-muted">working with</p>
          <p className="mt-1 text-sm">red.dev</p>
        </div>
        <div className="bg-paper p-3 md:p-4">
          <p className="label text-muted">life update</p>
          <p className="mt-1 text-sm">preparing for competition</p>
        </div>
        <div className="bg-paper p-3 md:p-4">
          <p className="label text-muted">off screen</p>
          <p className="mt-1 text-sm">anime, manga, sleeping</p>
        </div>
        <div className="col-span-2 md:col-span-4 lg:col-span-1">
          <LikeButton />
        </div>
      </div>
    </section>
  );
}
