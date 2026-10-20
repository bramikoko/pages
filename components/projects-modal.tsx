"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, X } from "lucide-react";
import { projects } from "@/lib/data";
import ProjectVisual from "./project-visual";

const MARGIN = 12;

export default function ProjectsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ dx: number; dy: number; w: number; h: number } | null>(
    null,
  );
  useLayoutEffect(() => {
    if (!open || !panelRef.current) return;
    const panel = panelRef.current;
    const rect = panel.getBoundingClientRect();
    panel.style.left = `${Math.max(MARGIN, Math.round((window.innerWidth - rect.width) / 2))}px`;
    panel.style.top = `${Math.max(MARGIN, Math.round((window.innerHeight - rect.height) / 2))}px`;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const previousOverflow = document.body.style.overflow;
    const closeTarget = panel.querySelector<HTMLElement>("button");
    closeTarget?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const panel = panelRef.current;
    if (!panel || (event.target as HTMLElement).closest("button")) return;
    const rect = panel.getBoundingClientRect();
    dragRef.current = {
      dx: event.clientX - rect.left,
      dy: event.clientY - rect.top,
      w: rect.width,
      h: rect.height,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const panel = panelRef.current;
    if (!drag || !panel) return;
    const left = Math.min(
      Math.max(MARGIN, event.clientX - drag.dx),
      window.innerWidth - drag.w - MARGIN,
    );
    const top = Math.min(
      Math.max(MARGIN, event.clientY - drag.dy),
      window.innerHeight - drag.h - MARGIN,
    );
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  if (!open) return null;

  const openIndex = String(projects.length + 1).padStart(2, "0");

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close all projects"
        onClick={onClose}
        className="fixed inset-0 z-[85] cursor-default bg-ink/70"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="All projects"
        className={`modal-panel fixed z-[95] w-[min(920px,calc(100vw-2rem))] border border-line bg-paper`}
      >
        <div
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="flex cursor-grab touch-none select-none items-center justify-between gap-4 border-b border-line px-4 py-3 active:cursor-grabbing"
        >
          <span className="label">all projects / {projects.length}</span>
          <span className="label hidden text-muted opacity-60 sm:inline">
            drag anywhere on this bar
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-line transition-colors hover:bg-ink hover:text-paper"
          >
            <X aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>

        <div className="max-h-[min(72svh,720px)] overflow-y-auto">
          <div className="grid gap-px bg-line sm:grid-cols-2">
            {projects.map((project) => (
              <article key={project.name} className="bg-paper p-5">
                <ProjectVisual project={project} className="max-w-[240px]" />
                <div className="label mt-4 flex items-center justify-between gap-4 text-muted">
                  <span>{project.index}</span>
                  <span>{project.kind}</span>
                  <span>{project.year}</span>
                </div>
                <h3 className="display mt-2 text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.05]">
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    data-cursor="view"
                    className="transition-colors hover:text-muted"
                  >
                    {project.name}
                  </a>
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {project.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="label border border-line px-2 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {project.note || project.secondary ? (
                  <div className="label mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
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
                ) : null}
                <a
                  href={project.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="label mt-4 inline-flex min-h-10 items-center gap-2 border border-line px-4 py-2 transition-colors hover:bg-lime hover:text-lime-ink"
                >
                  view repo
                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5"
                    strokeWidth={2}
                  />
                </a>
              </article>
            ))}
          </div>
          <a
            href="#contact"
            onClick={onClose}
            className="label flex items-center justify-between gap-4 border-t border-line px-5 py-4 text-muted transition-colors hover:bg-lime hover:text-lime-ink"
          >
            {openIndex} / open slot — have a project in mind?
            <ArrowUpRight
              aria-hidden="true"
              className="h-4 w-4 shrink-0"
              strokeWidth={2}
            />
          </a>
        </div>
      </div>
    </>,
    document.body,
  );
}
