"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText } from "@/lib/gsap";
import { profile } from "@/lib/data";
import LocalClock from "./local-clock";
import SectionLabel from "./section-label";
import SectionMark from "./section-mark";

const facts = [
  ["based in", "Banjarmasin, Indonesia"],
  ["working with", "red.dev"],
  ["studying", "12th grade"],
  ["pronouns", profile.pronouns],
  ["off screen", "anime, manga"],
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const statementRef = useRef<HTMLParagraphElement>(null);
  const factsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const statement = statementRef.current;
      const factsList = factsRef.current;
      if (!statement) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const split = new SplitText(statement, {
        type: "words",
        wordsClass: "about-word",
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: statement,
          start: "top 80%",
          once: true,
        },
      });

      timeline.from(split.words, {
        yPercent: 60,
        opacity: 0,
        duration: 0.7,
        stagger: 0.035,
        ease: "power3.out",
      });

      if (factsList) {
        gsap.from(factsList.querySelectorAll(".about-fact"), {
          y: 18,
          opacity: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: "power2.out",
          scrollTrigger: {
            trigger: factsList,
            start: "top 85%",
            once: true,
          },
        });
      }

      return () => {
        timeline.kill();
        split.revert();
      };
    },
    { scope: sectionRef },
  );

  useGSAP(
    () => {
      const section = sectionRef.current;
      const copy = section?.querySelector<HTMLElement>(".about-copy");
      const mark = section?.querySelector<HTMLElement>(".section-mark");
      if (!section || !copy) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });

        timeline.to(copy, { y: 55, ease: "none" }, 0);
        if (mark) timeline.to(mark, { y: -110, ease: "none" }, 0);
      });

      return () => media.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section id="about" ref={sectionRef} className="relative isolate border-b border-line">
      <SectionMark
        index="01"
        className="top-40 right-0 -z-10 text-[clamp(10rem,26vw,24rem)] text-line/8"
      />
      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-8 lg:py-24">
        <SectionLabel index="01" label="about" />

        <div className="mt-10 grid grid-cols-4 gap-8 lg:mt-16 lg:grid-cols-12 lg:gap-12">
          <div className="col-span-4 lg:col-span-4">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
              <div ref={factsRef} className="border-t border-line">
                {facts.map(([label, value]) => (
                  <div
                    key={label}
                    className="about-fact flex items-center justify-between gap-4 border-b border-line py-3"
                  >
                    <span className="label text-muted">{label}</span>
                    <span className="text-right text-sm">{value}</span>
                  </div>
                ))}
                <div className="about-fact flex items-center justify-between gap-4 border-b border-line py-3">
                  <span className="label text-muted">local time</span>
                  <LocalClock className="mono text-sm" />
                </div>
              </div>

              <p className="label mt-6 text-muted">
                source /{" "}
                <a
                  href="https://github.com/bramikoko"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline underline-offset-4 transition-colors hover:text-ink"
                >
                  github.com/bramikoko
                </a>
              </p>
            </div>
          </div>

          <div className="about-copy col-span-4 lg:col-span-8">
            <p
              ref={statementRef}
              className="text-balance text-[clamp(2rem,4.8vw,4.5rem)] font-medium leading-[1.08] tracking-[-0.04em]"
            >
              I&apos;m bram. I build for the web, study in the 12th grade, and spend
              a lot of time making Linux cooperate.
            </p>

            <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
              Right now I work with red.dev and learn Nuxt.js, Next.js, and
              Laravel. I care about fast pages, clear interfaces, and tools that
              stay out of the way.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {profile.learning.map((item) => (
                <span key={item} className="label border border-line px-2 py-1">
                  learning / {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
