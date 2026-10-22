"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

function seeded(seed: number) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return value / 2147483647;
  };
}

const random = seeded(11);

const farBars = Array.from({ length: 42 }, (_, index) => {
  const height = 42 + random() * 58;
  return { x: index * 39 + random() * 8, width: 5 + random() * 5, height };
});

const nearBars = Array.from({ length: 34 }, (_, index) => {
  const height = 84 + random() * 118;
  return { x: index * 48 + random() * 12, width: 10 + random() * 12, height };
});

export default function HeroScene() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = sceneRef.current;
      const hero = root?.parentElement;
      if (!root || !hero) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const layers = gsap.utils.toArray<SVGGElement>(".scene-scroll", root);

      layers.forEach((layer) => {
        const depth = Number(layer.dataset.depth ?? 1);
        gsap.to(layer, {
          y: depth * 34,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      const drifts = gsap.utils
        .toArray<SVGGElement>(".scene-drift", root)
        .map((layer) => ({
          x: gsap.quickTo(layer, "x", { duration: 0.9, ease: "power3.out" }),
          y: gsap.quickTo(layer, "y", { duration: 0.9, ease: "power3.out" }),
          depth: Number(layer.dataset.depth ?? 1),
        }));

      const onMove = (event: PointerEvent) => {
        const rect = hero.getBoundingClientRect();
        const nx = (event.clientX - rect.left) / rect.width - 0.5;
        const ny = (event.clientY - rect.top) / rect.height - 0.5;
        drifts.forEach((drift) => {
          drift.x(-nx * 22 * drift.depth);
          drift.y(-ny * 14 * drift.depth);
        });
      };

      hero.addEventListener("pointermove", onMove);
      return () => hero.removeEventListener("pointermove", onMove);
    },
    { scope: sceneRef },
  );

  return (
    <div
      ref={sceneRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-20 overflow-hidden"
    >
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMax slice"
        className="h-full w-full"
      >
        <g className="scene-scroll" data-depth="1">
          <g className="scene-drift" data-depth="0.6">
            <g fill="var(--ink)" opacity="0.07">
              {farBars.map((bar, index) => (
                <rect
                  key={`far-${index}`}
                  x={bar.x}
                  y={900 - bar.height}
                  width={bar.width}
                  height={bar.height}
                />
              ))}
            </g>
          </g>
        </g>

        <g className="scene-scroll" data-depth="1.3">
          <g className="scene-drift" data-depth="0.8">
            <path
              d="M0 706 C 140 690 236 646 356 654 C 470 662 520 700 640 696 C 780 691 830 640 960 646 C 1100 652 1170 704 1300 700 C 1420 696 1500 668 1600 676 L1600 900 L0 900 Z"
              fill="var(--ink)"
              opacity="0.05"
            />
          </g>
        </g>

        <g className="scene-scroll" data-depth="1.9">
          <g className="scene-drift" data-depth="1.1">
            <g fill="var(--ink)" opacity="0.13">
              {nearBars.map((bar, index) => (
                <rect
                  key={`near-${index}`}
                  x={bar.x}
                  y={900 - bar.height}
                  width={bar.width}
                  height={bar.height}
                />
              ))}
            </g>
          </g>
        </g>

        <g className="scene-scroll" data-depth="2.4">
          <g className="scene-drift" data-depth="1.5">
            <path
              d="M0 812 C 120 784 210 760 330 772 C 470 786 540 830 690 826 C 850 822 930 774 1080 780 C 1220 786 1300 828 1440 820 C 1520 816 1570 804 1600 800 L1600 900 L0 900 Z"
              fill="var(--ink)"
              opacity="0.1"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
