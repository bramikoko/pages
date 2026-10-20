"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, ChevronDown, Shuffle, X } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { stack, type StackGroup, type StackItem } from "@/lib/data";
import { techIcons } from "@/lib/tech-icons";
import { techInfo } from "@/lib/tech-info";
import SectionLabel from "./section-label";
import SectionMark from "./section-mark";

type DisplayGroup = { label: string; items: StackItem[] };

type OpenTech = {
  name: string;
  icon: string;
  group: string;
  learning?: boolean;
  description: string;
  url: string;
  left: number;
  top: number;
  above: boolean;
  trigger: HTMLButtonElement;
};

const POPOVER_WIDTH = 288;
const POPOVER_ESTIMATE = 200;

function dealt(items: StackItem[]): StackItem[] {
  return [...items]
    .map((item) => ({ item, key: Math.random() }))
    .sort((a, b) => a.key - b.key)
    .map(({ item }) => item);
}

export default function Stack() {
  const sectionRef = useRef<HTMLElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [openTech, setOpenTech] = useState<OpenTech | null>(null);
  const [order, setOrder] = useState(0);
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setOrder((value) => value + 1);
      const desktop = window.matchMedia("(min-width: 1024px)").matches;
      setOpenGroups(
        desktop
          ? stack.map((group) => group.label)
          : stack.slice(0, 1).map((group) => group.label),
      );
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const list: DisplayGroup[] = useMemo(
    () =>
      order === 0
        ? stack
        : stack.map((group) => ({ label: group.label, items: dealt(group.items) })),
    [order],
  );

  const total = list.reduce((sum, group) => sum + group.items.length, 0);
  const learningCount = list
    .flatMap((group) => group.items)
    .filter((item) => item.learning).length;

  const toggleGroup = (label: string) => {
    setOpenTech((current) => (current?.group === label ? null : current));
    setOpenGroups((current) =>
      current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label],
    );
  };

  const reshuffle = () => {
    setOpenTech(null);
    setOrder((value) => value + 1);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const tiles = sectionRef.current?.querySelectorAll(".tech-tile") ?? [];
      gsap.fromTo(
        tiles,
        { opacity: 0.35, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.02,
          ease: "power2.out",
          overwrite: "auto",
          clearProps: "transform,opacity",
        },
      );
    }
  };

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".stack-group", {
          y: 24,
          opacity: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".stack-list",
            start: "top 85%",
            once: true,
          },
        });

        gsap.to(".stack-grid", {
          y: 40,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });

        gsap.to(".section-mark", {
          y: -120,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      return () => media.revert();
    },
    { scope: sectionRef },
  );

  useEffect(() => {
    if (!openTech) return;

    const close = () => setOpenTech(null);
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (popoverRef.current?.contains(target)) return;
      if (openTech.trigger.contains(target)) return;
      close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      close();
      openTech.trigger.focus({ preventScroll: true });
    };
    const onScroll = () => close();

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [openTech]);

  useEffect(() => {
    if (openTech) popoverRef.current?.focus({ preventScroll: true });
  }, [openTech]);

  const handleOpen = (
    event: MouseEvent<HTMLButtonElement>,
    item: StackItem,
    group: StackGroup,
  ) => {
    const trigger = event.currentTarget;

    if (openTech?.name === item.name) {
      setOpenTech(null);
      return;
    }

    const info = techInfo[item.icon];
    if (!info) return;

    const rect = trigger.getBoundingClientRect();
    const left = Math.min(
      Math.max(12, rect.left),
      window.innerWidth - POPOVER_WIDTH - 12,
    );
    const above = window.innerHeight - rect.bottom < POPOVER_ESTIMATE;
    const top = above ? rect.top - 8 : rect.bottom + 8;

    setOpenTech({
      name: item.name,
      icon: item.icon,
      group: group.label,
      learning: item.learning,
      description: info.description,
      url: info.url,
      left,
      top,
      above,
      trigger,
    });
  };

  const closeWithFocus = () => {
    const trigger = openTech?.trigger;
    setOpenTech(null);
    trigger?.focus({ preventScroll: true });
  };

  return (
    <section id="stack" ref={sectionRef} className="relative isolate border-b border-line">
      <SectionMark
        index="03"
        className="top-40 left-0 -z-10 text-[clamp(9rem,22vw,20rem)] text-line/8"
      />
      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-8 lg:py-24">
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <SectionLabel index="03" label="stack" />
          </div>
          <button
            type="button"
            onClick={reshuffle}
            className="label inline-flex min-h-9 shrink-0 items-center gap-2 border border-line px-3 py-2 transition-colors hover:bg-lime hover:text-lime-ink"
          >
            <Shuffle
              aria-hidden="true"
              className="h-3.5 w-3.5"
              strokeWidth={2}
            />
            reshuffle
          </button>
        </div>

        <div className="stack-grid mt-8 grid grid-cols-4 gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="col-span-4 lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:col-span-4 lg:self-start">
            <h2 className="text-balance text-[clamp(2.5rem,6vw,5.5rem)] font-medium leading-[0.95] tracking-tighter">
              tools I reach for.
            </h2>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-muted md:text-lg">
              Everything below comes from my profile README. The lime dot marks
              what I am learning now. Groups collapse, and the tiles are dealt
              fresh every visit: select one for a quick note.
            </p>

            <dl className="mt-8 grid grid-cols-3 border border-line bg-paper">
              <div className="border-r border-line p-3 md:p-4">
                <dt className="label text-muted">tools</dt>
                <dd className="display mt-1.5 text-[clamp(1.3rem,2vw,2.1rem)]">
                  {total}
                </dd>
              </div>
              <div className="border-r border-line p-3 md:p-4">
                <dt className="label text-muted">groups</dt>
                <dd className="display mt-1.5 text-[clamp(1.3rem,2vw,2.1rem)]">
                  {list.length}
                </dd>
              </div>
              <div className="p-3 md:p-4">
                <dt className="label flex items-center gap-1.5 text-muted">
                  learning
                  <span aria-hidden="true" className="h-1.5 w-1.5 bg-lime" />
                </dt>
                <dd className="display mt-1.5 text-[clamp(1.3rem,2vw,2.1rem)]">
                  {learningCount}
                </dd>
              </div>
            </dl>

            <a
              href="https://github.com/bramikoko/bramikoko"
              target="_blank"
              rel="noreferrer noopener"
              className="label mt-6 inline-flex min-h-11 items-center gap-2 border border-line px-4 py-2 transition-colors hover:bg-ink hover:text-paper"
            >
              source / profile README
              <ArrowUpRight
                aria-hidden="true"
                className="h-3.5 w-3.5"
                strokeWidth={2}
              />
            </a>
          </div>

          <div className="stack-list col-span-4 border-t border-line lg:col-span-8">
            {list.map((group, groupIndex) => {
              const open = openGroups.includes(group.label);
              const id = `stack-panel-${group.label.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;

              return (
                <div
                  key={group.label}
                  className="stack-group border-b border-line"
                >
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.label)}
                    aria-expanded={open}
                    aria-controls={id}
                    className="group flex w-full items-baseline justify-between gap-4 py-5 text-left"
                  >
                    <span className="flex items-baseline gap-3 sm:gap-4">
                      <span className="display text-[clamp(1.35rem,2vw,1.9rem)] text-muted opacity-80">
                        {String(groupIndex + 1).padStart(2, "0")}
                      </span>
                      <span className="label text-ink transition-colors group-hover:text-muted">
                        {group.label}
                        <span className="text-[0.65rem] opacity-60">
                          {" "}
                          /{group.items.length}
                        </span>
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="label hidden text-muted opacity-70 sm:inline">
                        show {open ? "less" : "more"}
                      </span>
                      <ChevronDown
                        aria-hidden="true"
                        strokeWidth={2}
                        className={`h-4 w-4 shrink-0 text-muted transition-transform duration-300 motion-reduce:transition-none ${
                          open ? "" : "-rotate-90"
                        }`}
                      />
                    </span>
                  </button>
                  <div
                    id={id}
                    role="region"
                    aria-label={`${group.label} tools`}
                    aria-hidden={!open}
                    inert={!open}
                    className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
                    style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <ul className="grid grid-cols-2 gap-2 pb-5 sm:grid-cols-3 xl:grid-cols-4">
                        {group.items.map((item) => {
                          const icon = techIcons[item.icon];
                          const expanded = openTech?.name === item.name;

                          return (
                            <li
                              key={item.name}
                              className="flex transition-transform duration-300 motion-reduce:transition-none"
                            >
                              <button
                                type="button"
                                onClick={(event) =>
                                  handleOpen(event, item, group)
                                }
                                aria-expanded={expanded}
                                aria-controls={
                                  expanded ? "tech-popover" : undefined
                                }
                                aria-haspopup="dialog"
                                className={`tech-tile flex w-full items-center gap-2.5 border border-line bg-paper px-3 py-2.5 text-left text-sm transition-colors duration-200 hover:bg-ink hover:text-paper ${
                                  expanded ? "text-paper" : ""
                                }`}
                                style={
                                  expanded
                                    ? {
                                        backgroundColor: "var(--ink)",
                                        color: "var(--paper)",
                                      }
                                    : undefined
                                }
                              >
                                {icon ? (
                                  <svg
                                    aria-hidden="true"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="h-4 w-4 shrink-0 opacity-60"
                                  >
                                    <path d={icon.path} />
                                  </svg>
                                ) : null}
                                <span className="min-w-0 truncate">
                                  {item.name}
                                </span>
                                {item.learning ? (
                                  <>
                                    <span className="sr-only">, learning</span>
                                    <span
                                      aria-hidden="true"
                                      className="ml-auto h-1.5 w-1.5 shrink-0 bg-lime"
                                    />
                                  </>
                                ) : null}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {openTech
        ? createPortal(
            <div
              ref={popoverRef}
              id="tech-popover"
              role="dialog"
              aria-label={`${openTech.name} details`}
              tabIndex={-1}
              className="fixed z-70 w-72 border border-line bg-paper p-4 text-ink outline-none"
              style={{
                left: openTech.left,
                top: openTech.top,
                transform: openTech.above ? "translateY(-100%)" : undefined,
              }}
            >
              <div className="label flex items-center justify-between gap-3 text-muted">
                <span>
                  {openTech.group} / {openTech.learning ? "learning" : "in use"}
                </span>
                <button
                  type="button"
                  onClick={closeWithFocus}
                  aria-label="Close details"
                  className="-mr-2 inline-flex h-8 w-8 items-center justify-center transition-colors hover:bg-ink hover:text-paper"
                >
                  <X aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>

              <p className="mt-2 flex items-center gap-2 text-base font-medium">
                {techIcons[openTech.icon] ? (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4 shrink-0 text-muted"
                  >
                    <path d={techIcons[openTech.icon].path} />
                  </svg>
                ) : null}
                {openTech.name}
              </p>

              <p className="mt-2 text-sm leading-relaxed text-muted">
                {openTech.description}
              </p>

              <a
                href={openTech.url}
                target="_blank"
                rel="noreferrer noopener"
                className="label mt-3 inline-flex min-h-9 items-center gap-1.5 underline underline-offset-4 transition-colors hover:text-muted"
              >
                official site
                <ArrowUpRight
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                  strokeWidth={2}
                />
              </a>
            </div>,
            document.body,
          )
        : null}
    </section>
  );
}
