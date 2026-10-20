"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, X } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { RepoFeed } from "@/lib/repos";
import { RepoActivity } from "./repo-feed";

const MARGIN = 12;

export default function ReposModal({
  feed,
  onClose,
}: {
  feed: RepoFeed;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ dx: number; dy: number; w: number; h: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    if (!panelRef.current) return;
    const panel = panelRef.current;
    const rect = panel.getBoundingClientRect();
    panel.style.left = `${Math.max(MARGIN, Math.round((window.innerWidth - rect.width) / 2))}px`;
    panel.style.top = `${Math.max(MARGIN, Math.round((window.innerHeight - rect.height) / 2))}px`;
  }, []);

  useEffect(() => {
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
  }, [onClose]);

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

  const openIndex = String(feed.repos.length + 1).padStart(2, "0");

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close all repositories"
        onClick={onClose}
        className="fixed inset-0 z-[85] cursor-default bg-backdrop"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="All repositories"
        className="modal-panel fixed z-[95] w-[min(920px,calc(100vw-2rem))] border border-line bg-paper"
      >
        <div
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="flex cursor-grab touch-none select-none items-center justify-between gap-4 border-b border-line px-4 py-3 active:cursor-grabbing"
        >
          <span className="label">all repos / {feed.repos.length}</span>
          <span className="label hidden text-muted opacity-60 sm:inline">
            drag anywhere on this bar
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close all repositories"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-line transition-colors hover:bg-ink hover:text-paper"
          >
            <X aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>

        <div className="max-h-[min(74svh,760px)] overflow-y-auto">
          {feed.repos.length > 0 ? (
            feed.repos.map((repo, index) => (
              <article
                key={`${repo.host}:${repo.fullName}`}
                className="border-b border-line px-5 py-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
                  <div className="min-w-0">
                    <div className="label flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
                      <span className="inline-flex h-5 min-w-5 items-center justify-center bg-lime px-1 text-[0.6rem] text-lime-ink">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{repo.host}</span>
                      <span>
                        {repo.isFork
                          ? "fork"
                          : repo.archived
                            ? "archived"
                            : "repo"}
                      </span>
                      <span className="text-ink sm:ml-auto">
                        pushed{" "}
                        <time dateTime={repo.pushedAt}>
                          {formatDate(repo.pushedAt)}
                        </time>
                      </span>
                    </div>

                    <h3 className="display mt-2 text-[clamp(1.8rem,3.4vw,2.8rem)] leading-[1.05] [overflow-wrap:anywhere]">
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        data-cursor="view"
                        className="transition-colors hover:text-muted"
                      >
                        {repo.name}
                      </a>
                    </h3>

                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                      {repo.description ?? "no description on the repo."}
                    </p>

                    <p className="label mt-2 text-muted">
                      language {repo.language ?? "none"} / created{" "}
                      <time dateTime={repo.createdAt}>
                        {formatDate(repo.createdAt)}
                      </time>
                      {repo.stars > 0 ? ` / stars ${repo.stars}` : ""}
                      {repo.forks > 0 ? ` / forks ${repo.forks}` : ""}
                    </p>

                    {repo.latestCommit ? (
                      <p className="label mt-1 max-w-xl text-muted">
                        latest /{" "}
                        <span className="mono">
                          {repo.latestCommit.short}
                        </span>{" "}
                        <span className="normal-case">
                          {repo.latestCommit.message}
                        </span>
                      </p>
                    ) : null}

                    {repo.topics.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {repo.topics.map((topic) => (
                          <span
                            key={topic}
                            className="label border border-line px-2 py-1"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    data-cursor="view"
                    className="label inline-flex min-h-10 shrink-0 items-center gap-2 self-start border border-line px-4 py-2 transition-colors hover:bg-lime hover:text-lime-ink"
                  >
                    open repository
                    <ArrowUpRight
                      aria-hidden="true"
                      className="h-3.5 w-3.5"
                      strokeWidth={2}
                    />
                  </a>
                </div>
              </article>
            ))
          ) : (
            <p className="border-b border-line px-5 py-5 text-sm leading-relaxed text-muted">
              No public repositories came back from github or codeberg. The
              profiles are still linked in the work section.
            </p>
          )}

          <div className="px-5 py-4">
            <p className="label text-muted">
              recent activity / {feed.activity.length}
            </p>
            <RepoActivity feed={feed} className="mt-3" />
          </div>

          <a
            href="#contact"
            onClick={onClose}
            className="label flex items-center justify-between gap-4 border-t border-line px-5 py-4 text-muted transition-colors hover:bg-lime hover:text-lime-ink"
          >
            {openIndex} / open slot, have a project in mind?
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
