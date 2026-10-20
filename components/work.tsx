"use client";

import { useCallback, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { projects, type Project } from "@/lib/data";
import ProjectVisual from "./project-visual";
import ProjectsModal from "./projects-modal";
import SectionLabel from "./section-label";

const previews: Project[] = [
  ...projects,
  {
    index: "03",
    name: "your project?",
    kind: "open slot",
    year: "2026",
    description: "Have something that needs a careful interface? Tell me about it.",
    tags: [],
    href: "#contact",
    visual: "open",
  },
];

export default function Work() {
  const [active, setActive] = useState(0);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const archiveTriggerRef = useRef<HTMLButtonElement>(null);
  const activePreview = previews[active];
  const isExternal = activePreview.href.startsWith("http");

  const closeArchive = useCallback(() => {
    setArchiveOpen(false);
    archiveTriggerRef.current?.focus({ preventScroll: true });
  }, []);

  useGSAP(
    () => {
      if (!previewRef.current) return;
      gsap.fromTo(
        previewRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
      );
    },
    { scope: previewRef, dependencies: [active], revertOnUpdate: true },
  );

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".work-row", {
          y: 30,
          opacity: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".work-list",
            start: "top 82%",
            once: true,
          },
        });
      });

      return () => media.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section id="work" ref={sectionRef} className="border-b border-line">
      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-8 lg:py-24">
        <SectionLabel index="02" label="selected work" />
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <p className="max-w-md text-sm leading-relaxed text-muted">
            Two real repositories and one open slot. More projects land in the
            archive.
          </p>
          <button
            ref={archiveTriggerRef}
            type="button"
            onClick={() => setArchiveOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={archiveOpen}
            className="label inline-flex min-h-10 items-center gap-2 border border-line px-4 py-2 transition-colors hover:bg-lime hover:text-lime-ink"
          >
            view all projects
            <ArrowUpRight
              aria-hidden="true"
              className="h-3.5 w-3.5"
              strokeWidth={2}
            />
          </button>
        </div>

        <div className="mt-10 grid grid-cols-4 gap-8 lg:mt-16 lg:grid-cols-12 lg:gap-12">
          <div className="col-span-4 hidden lg:col-span-4 lg:block">
            <div className="sticky top-[calc(var(--header-h)+2rem)]">
              <div
                ref={previewRef}
                className="work-preview group border border-line bg-paper transition-colors duration-300 hover:border-lime"
              >
                <div className="relative h-[clamp(16rem,36svh,24rem)] overflow-hidden border-b border-line">
                  <ProjectVisual project={activePreview} flush className="aspect-auto! h-full" />
                </div>
                <div className="p-4">
                  <div className="label flex items-center justify-between gap-3 text-muted">
                    <span className="flex items-center gap-2">
                      <span className="inline-flex h-5 min-w-5 items-center justify-center bg-lime px-1 text-[0.6rem] text-lime-ink">
                        {activePreview.index}
                      </span>
                      <span>/ {activePreview.kind}</span>
                    </span>
                    <span>{activePreview.year}</span>
                  </div>
                  <h3 className="mt-3 text-[clamp(1.5rem,2.4vw,2rem)] font-medium leading-[1.1] tracking-[-0.03em]">
                    <a
                      href={activePreview.href}
                      {...(isExternal
                        ? {
                            target: "_blank",
                            rel: "noreferrer noopener",
                            "data-cursor": "view",
                          }
                        : {})}
                      className="transition-colors hover:text-muted"
                    >
                      {activePreview.name}
                    </a>
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {activePreview.description}
                  </p>
                  {activePreview.tags.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {activePreview.tags.map((tag) => (
                        <span
                          key={tag}
                          className="label border border-line px-2 py-1"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {activePreview.note || activePreview.secondary ? (
                    <div className="label mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
                      {activePreview.note ? (
                        <span className="normal-case">
                          {activePreview.note}
                        </span>
                      ) : null}
                      {activePreview.secondary ? (
                        <a
                          href={activePreview.secondary.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="underline underline-offset-4 transition-colors hover:text-ink"
                        >
                          {activePreview.secondary.label}
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                  <a
                    href={activePreview.href}
                    {...(isExternal
                      ? { target: "_blank", rel: "noreferrer noopener" }
                      : {})}
                    className="label mt-4 inline-flex min-h-10 items-center gap-2 border border-line px-4 py-2 transition-colors hover:bg-lime hover:text-lime-ink"
                  >
                    {isExternal ? "view repo" : "start a conversation"}
                    {isExternal ? (
                      <ArrowUpRight
                        aria-hidden="true"
                        className="h-4 w-4"
                        strokeWidth={1.8}
                      />
                    ) : (
                      <ArrowDown
                        aria-hidden="true"
                        className="h-4 w-4"
                        strokeWidth={1.8}
                      />
                    )}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="work-list col-span-4 lg:col-span-8">
            <div className="border-t border-line">
              {projects.map((project, index) => (
                <article
                  key={project.name}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  className="work-row group border-b border-line py-6 lg:py-8"
                >
                  <div className="label flex items-center justify-between gap-4">
                    <span
                      className={`transition-colors ${
                        active === index
                          ? "lg:bg-lime lg:px-1 lg:text-lime-ink"
                          : ""
                      }`}
                    >
                      {project.index}
                    </span>
                    <span className="text-muted">{project.kind}</span>
                    <span>{project.year}</span>
                  </div>

                  <div className="mt-3 flex items-start justify-between gap-6">
                    <h3 className="display text-[clamp(2.1rem,6vw,6rem)]">
                      <a
                        href={project.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        data-cursor="view"
                        aria-label={`${project.name}, opens in a new tab`}
                        className="transition-colors hover:text-muted"
                      >
                        {project.name}
                      </a>
                    </h3>
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      data-cursor="view"
                      aria-label={`Open ${project.name}, opens in a new tab`}
                      className="mt-1 hidden shrink-0 items-center justify-center border border-line p-3 transition-colors hover:bg-ink hover:text-paper sm:flex"
                    >
                      <ArrowUpRight
                        aria-hidden="true"
                        className="h-5 w-5"
                        strokeWidth={1.8}
                      />
                    </a>
                  </div>

                  <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-muted">
                    {project.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="label border border-line px-2 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="label mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-muted">
                    {project.note ? (
                      <span className="normal-case">{project.note}</span>
                    ) : null}
                    {project.secondary ? (
                      <a
                        href={project.secondary.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="underline underline-offset-4 transition-colors hover:text-ink"
                      >
                        {project.secondary.label}
                      </a>
                    ) : null}
                  </div>

                  <div className="mt-6 lg:hidden">
                    <ProjectVisual project={project} />
                  </div>
                </article>
              ))}

              <a
                href="#contact"
                onMouseEnter={() => setActive(2)}
                onFocus={() => setActive(2)}
                className="work-row group flex flex-col justify-between gap-6 border-b border-line px-4 py-6 transition-colors hover:bg-lime hover:text-lime-ink sm:flex-row sm:items-end lg:py-8"
              >
                <div>
                  <div className="label flex gap-3">
                    <span
                      className={`transition-colors ${
                        active === 2
                          ? "lg:bg-lime-ink lg:px-1 lg:text-lime"
                          : ""
                      }`}
                    >
                      03
                    </span>
                    <span>open slot</span>
                    <span>2026</span>
                  </div>
                  <p className="display mt-3 text-[clamp(2.1rem,6vw,6rem)]">
                    your project?
                  </p>
                </div>
                <p className="max-w-xs text-sm leading-relaxed">
                  Have something that needs a careful interface? Tell me about
                  it.
                </p>
                <ArrowDown
                  aria-hidden="true"
                  className="h-6 w-6 transition-transform group-hover:translate-y-1"
                  strokeWidth={1.8}
                />
              </a>
            </div>
          </div>
        </div>
      </div>
      {archiveOpen ? <ProjectsModal open onClose={closeArchive} /> : null}
    </section>
  );
}
