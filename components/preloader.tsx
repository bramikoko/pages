"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

export default function Preloader({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const counter = counterRef.current;
      if (!root) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        root.remove();
        onComplete();
        return;
      }

      const chars = gsap.utils.toArray<HTMLElement>(".preloader-char");
      const progress = { value: 0 };
      const failsafe = window.setTimeout(() => {
        root.remove();
        onComplete();
      }, 3200);
      const timeline = gsap.timeline({
        onComplete: () => {
          window.clearTimeout(failsafe);
          root.remove();
          onComplete();
        },
      });

      timeline
        .to(
          progress,
          {
            value: 100,
            duration: 1,
            ease: "power2.inOut",
            onUpdate: () => {
              if (counter) {
                counter.textContent = String(Math.round(progress.value)).padStart(
                  2,
                  "0",
                );
              }
            },
          },
          0,
        )
        .from(
          chars,
          {
            yPercent: 120,
            rotate: 3,
            duration: 0.8,
            stagger: 0.05,
            ease: "power4.out",
          },
          0,
        )
        .to(
          chars,
          {
            yPercent: -120,
            duration: 0.5,
            stagger: 0.02,
            ease: "power3.in",
          },
          0.95,
        )
        .to(
          root,
          {
            yPercent: -100,
            duration: 0.7,
            ease: "power4.inOut",
          },
          1.15,
        );

      return () => {
        window.clearTimeout(failsafe);
        timeline.kill();
      };
    },
    { scope: rootRef, dependencies: [onComplete] },
  );

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="preloader fixed inset-0 z-[100] flex flex-col justify-between bg-paper p-4 md:p-8"
    >
      <div className="label flex justify-between">
        <span>bram / portfolio</span>
        <span>loading</span>
      </div>
      <div className="overflow-hidden text-center">
        <div className="display text-[clamp(5rem,28vw,24rem)] leading-none">
          {"bram".split("").map((character, index) => (
            <span
              key={`${character}-${index}`}
              className="preloader-char inline-block"
            >
              {character}
            </span>
          ))}
        </div>
      </div>
      <div className="label flex items-end justify-between">
        <span>booting the grid</span>
        <span ref={counterRef} className="mono text-2xl tabular-nums">
          00
        </span>
      </div>
    </div>
  );
}
