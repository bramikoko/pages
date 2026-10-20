"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const items = [
  "next.js",
  "nuxt",
  "laravel",
  "typescript",
  "vue",
  "react",
  "linux",
  "tailwind",
  "bun",
  "postgres",
  "php",
  "git",
];

const trackItems = [...items, ...items];

export default function Marquee() {
  const sectionRef = useRef<HTMLElement>(null);
  const skewRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const skew = skewRef.current;
      const track = trackRef.current;
      if (!section || !skew || !track) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const tween = gsap.to(track, {
          xPercent: -50,
          duration: 30,
          ease: "none",
          repeat: -1,
        });
        let resetTimer = 0;

        const trigger = ScrollTrigger.create({
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const velocity = self.getVelocity();
            const speed = gsap.utils.clamp(1, 5, Math.abs(velocity) / 300);
            tween.timeScale(velocity >= 0 ? speed : -speed);
            gsap.to(skew, {
              skewX: gsap.utils.clamp(-7, 7, velocity / 350),
              duration: 0.35,
              overwrite: true,
            });
            window.clearTimeout(resetTimer);
            resetTimer = window.setTimeout(() => {
              tween.timeScale(1);
              gsap.to(skew, {
                skewX: 0,
                duration: 0.55,
                ease: "power2.out",
                overwrite: true,
              });
            }, 160);
          },
        });

        return () => {
          window.clearTimeout(resetTimer);
          tween.kill();
          trigger.kill();
        };
      });

      return () => media.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      aria-hidden="true"
      className="mt-8 overflow-hidden border-b border-line bg-lime py-3 text-lime-ink md:py-4"
    >
      <div ref={skewRef} className="will-change-transform">
        <div ref={trackRef} className="marquee-track items-center">
          {trackItems.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex shrink-0 items-center gap-4 px-4 md:gap-6 md:px-6"
            >
              <span className="display text-[clamp(1.5rem,3.4vw,3rem)] leading-none">
                {item}
              </span>
              <span className="h-2 w-2 bg-lime-ink" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
