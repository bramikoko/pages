"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
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
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ dx: number; dy: number; w: number; h: number } | null>(
    null,
  );
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [progress, setProgress] = useState(0);

  const updateTrack = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    setCanPrev(track.scrollLeft > 4);
    setCanNext(track.scrollLeft < max - 4);
    setProgress(max > 0 ? track.scrollLeft / max : 0);

    const center = track.getBoundingClientRect().left + track.clientWidth / 2;
    for (const panel of Array.from(track.querySelectorAll<HTMLElement>("[data-panel]"))) {
      const rect = panel.getBoundingClientRect();
      const offset = (rect.left + rect.width / 2 - center) / track.clientWidth;
      panel.style.setProperty("--shift", `${(-offset * 26).toFixed(1)}px`);
    }
  }, []);

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

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateTrack();
      });
    };

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      track.scrollLeft += event.deltaY;
    };

    updateTrack();
    track.addEventListener("scroll", onScroll, { passive: true });
    track.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", updateTrack);
    return () => {
      window.cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
      track.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", updateTrack);
    };
  }, [updateTrack]);

  const step = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const first = track.querySelector<HTMLElement>("[data-panel]");
    const amount = first ? first.getBoundingClientRect().width + 1 : track.clientWidth * 0.8;
    track.scrollBy({ left: amount * direction, behavior: "smooth" });
  };

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
        className="fixed inset-0 z-85 cursor-default bg-backdrop"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="All repositories"
        className="modal-panel fixed z-95 w-[min(920px,calc(100vw-2rem))] border border-line bg-paper"
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
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-line transition-colors hover:bg-ink hover:text-paper"
          >
            <X aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>

        <div
          ref={trackRef}
          tabIndex={0}
          role="group"
          aria-label="Repositories, scroll horizontally"
          className="track-scroll flex h-[min(58svh,560px)] snap-x snap-mandatory overflow-x-auto overflow-y-hidden focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink"
        >
          {feed.repos.map((repo, index) => (
            <article
              key={`${repo.host}:${repo.fullName}`}
              data-panel
              style={{ ["--i" as string]: index }}
              className="modal-card group flex w-[min(26rem,calc(100vw-5rem))] shrink-0 snap-start flex-col border-r border-line bg-paper"
            >
              <div className="flex flex-1 flex-col overflow-y-auto p-5">
                <div className="label flex items-center justify-between gap-3 text-muted">
                  <span className="flex items-center gap-2">
                    <span className="inline-flex h-5 min-w-5 items-center justify-center bg-lime px-1 text-[0.6rem] text-lime-ink">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{repo.host}</span>
                    <span>
                      {repo.isFork ? "fork" : repo.archived ? "archived" : "repo"}
                    </span>
                  </span>
                  <span>pushed {formatDate(repo.pushedAt)}</span>
                </div>

                <h3 className="display mt-4 text-[clamp(1.9rem,4vw,2.6rem)] leading-none wrap-anywhere">
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

                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {repo.description ?? "no description on the repo."}
                </p>

                <dl className="mt-5 border-t border-line">
                  <div className="flex justify-between gap-4 border-b border-line py-2">
                    <dt className="label text-muted">language</dt>
                    <dd className="mono text-[0.72rem]">{repo.language ?? "none"}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-line py-2">
                    <dt className="label text-muted">created</dt>
                    <dd className="mono text-[0.72rem]">{formatDate(repo.createdAt)}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-line py-2">
                    <dt className="label text-muted">commit</dt>
                    <dd className="mono text-[0.72rem]">
                      {repo.latestCommit ? repo.latestCommit.short : "none"}
                    </dd>
                  </div>
                </dl>

                {repo.latestCommit ? (
                  <p className="mt-3 line-clamp-3 text-[0.78rem] leading-relaxed text-muted">
                    {repo.latestCommit.message}
                  </p>
                ) : null}

                {repo.topics.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {repo.topics.map((topic) => (
                      <span key={topic} className="label border border-line px-2 py-1">
                        {topic}
                      </span>
                    ))}
                  </div>
                ) : null}

                <span
                  aria-hidden="true"
                  className="display pointer-events-none mt-auto select-none pt-6 text-right text-[5.5rem] leading-none text-line/25"
                  style={{ translate: "var(--shift, 0) 0" }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <a
                href={repo.url}
                target="_blank"
                rel="noreferrer noopener"
                data-cursor="view"
                className="label flex min-h-11 items-center justify-between gap-3 border-t border-line px-5 transition-colors hover:bg-lime hover:text-lime-ink"
              >
                open repository
                <ArrowUpRight aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
              </a>
            </article>
          ))}

          <article
            data-panel
            style={{ ["--i" as string]: feed.repos.length }}
            className="modal-card flex w-[min(30rem,calc(100vw-5rem))] shrink-0 snap-start flex-col border-r border-line bg-paper"
          >
            <div className="flex-1 overflow-y-auto p-5">
              <p className="label text-muted">
                recent activity / {feed.activity.length}
              </p>
              <RepoActivity feed={feed} className="mt-4" />
            </div>
          </article>

          <article
            data-panel
            style={{ ["--i" as string]: feed.repos.length + 1 }}
            className="modal-card flex w-[min(26rem,calc(100vw-5rem))] shrink-0 snap-start flex-col bg-lime text-lime-ink"
          >
            <div className="flex flex-1 flex-col justify-between p-5">
              <div className="label flex justify-between">
                <span>{openIndex} / open slot</span>
                <span>contact</span>
              </div>
              <div
                aria-hidden="true"
                className="display py-6 text-[clamp(5rem,12vw,8rem)] leading-none"
              >
                +
              </div>
              <p className="label">have something in mind? / say hi</p>
            </div>
            <a
              href="#contact"
              onClick={onClose}
              className="label flex min-h-11 items-center justify-between gap-3 border-t border-lime-ink px-5 transition-colors hover:bg-lime-ink hover:text-lime"
            >
              start a conversation
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
            </a>
          </article>
        </div>

        <div className="flex items-center gap-3 border-t border-line px-4 py-2.5">
          <span className="label hidden text-muted sm:inline">
            scroll sideways
          </span>
          <span
            aria-hidden="true"
            className="relative h-px flex-1 bg-line/25"
          >
            <span
              className="absolute inset-y-0 left-0 bg-ink transition-[width] duration-200 ease-out"
              style={{ width: `${Math.max(progress * 100, 6)}%` }}
            />
          </span>
          <button
            type="button"
            onClick={() => {
              if (canPrev) step(-1);
            }}
            aria-disabled={!canPrev}
            aria-label="Previous repositories"
            className="inline-flex h-11 w-11 items-center justify-center border border-line transition-colors hover:bg-ink hover:text-paper aria-disabled:opacity-30 aria-disabled:hover:bg-transparent aria-disabled:hover:text-ink"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => {
              if (canNext) step(1);
            }}
            aria-disabled={!canNext}
            aria-label="Next repositories"
            className="inline-flex h-11 w-11 items-center justify-center border border-line transition-colors hover:bg-ink hover:text-paper aria-disabled:opacity-30 aria-disabled:hover:bg-transparent aria-disabled:hover:text-ink"
          >
            <ArrowRight aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
