"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";

type LikeState =
  | { status: "loading" }
  | { status: "ok"; likes: number; liked: boolean }
  | { status: "error" };

const LIKED_KEY = "web-liked";

async function fetchLikes(): Promise<number> {
  const res = await fetch("/api/likes", { cache: "no-store" });
  if (!res.ok) throw new Error(`like api ${res.status}`);
  const data = (await res.json()) as { likes?: unknown };
  const likes =
    typeof data.likes === "number" && Number.isFinite(data.likes) && data.likes >= 0
      ? data.likes
      : null;
  if (likes === null) throw new Error("bad payload");
  return likes;
}

export default function LikeButton() {
  const [state, setState] = useState<LikeState>({ status: "loading" });
  const cellRef = useRef<HTMLButtonElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  const burstStars = useCallback(() => {
    const cell = cellRef.current;
    if (!cell) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const count = 7;
    for (let i = 0; i < count; i += 1) {
      const star = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      star.setAttribute("viewBox", "0 0 24 24");
      star.setAttribute("aria-hidden", "true");
      star.classList.add("like-star");
      star.style.left = "50%";
      star.style.top = "50%";
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("fill", "currentColor");
      path.setAttribute(
        "d",
        "M12 2l2.95 6.6 7.05.7-5.3 4.8 1.6 7-6.3-3.7-6.3 3.7 1.6-7-5.3-4.8 7.05-.7z",
      );
      star.appendChild(path);
      cell.appendChild(star);

      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.6;
      const distance = 26 + Math.random() * 30;
      star.animate(
        [
          { transform: "translate(-50%, -50%) scale(0.4)", opacity: 1 },
          {
            transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${
              Math.sin(angle) * distance
            }px)) scale(1.15)`,
            opacity: 0,
          },
        ],
        { duration: 700 + Math.random() * 300, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" },
      ).addEventListener("finish", () => star.remove());
    }
  }, []);

  const popCount = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    countRef.current?.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.22)" },
        { transform: "scale(1)" },
      ],
      { duration: 320, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" },
    );
  }, []);

  const toggle = useCallback(async () => {
    if (state.status !== "ok") return;
    const liked = !state.liked;
    setState({ status: "ok", likes: state.likes + (liked ? 1 : -1), liked });
    try {
      const res = await fetch("/api/likes", {
        method: liked ? "POST" : "DELETE",
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`like api ${res.status}`);
      const data = (await res.json()) as { likes?: unknown };
      const likes =
        typeof data.likes === "number" && Number.isFinite(data.likes) && data.likes >= 0
          ? data.likes
          : null;
      if (likes === null) throw new Error("bad payload");
      if (liked) localStorage.setItem(LIKED_KEY, "1");
      else localStorage.removeItem(LIKED_KEY);
      if (liked) {
        popCount();
        burstStars();
      }
      setState({ status: "ok", likes, liked });
    } catch {
      setState({ status: "ok", likes: state.likes, liked: !liked });
    }
  }, [state, burstStars, popCount]);

  const retry = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const likes = await fetchLikes();
      setState({ status: "ok", likes, liked: localStorage.getItem(LIKED_KEY) !== null });
    } catch {
      setState({ status: "error" });
    }
  }, []);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const likes = await fetchLikes();
        if (!alive) return;
        setState({ status: "ok", likes, liked: localStorage.getItem(LIKED_KEY) !== null });
      } catch {
        if (alive) setState({ status: "error" });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const liked = state.status === "ok" && state.liked;
  const count =
    state.status === "ok" ? new Intl.NumberFormat("en-US").format(state.likes) : null;
  const hint =
    state.status === "loading"
      ? "counting"
      : state.status === "error"
        ? "click to retry"
        : state.likes === 0
          ? "be the first"
          : state.liked
            ? "you liked this"
            : "tap the star";

  return (
    <button
      ref={cellRef}
      type="button"
      data-liked={liked}
      className={`status-like group relative flex h-full w-full cursor-pointer flex-col justify-between gap-2 p-3 text-left transition-colors md:p-4 ${
        liked ? "bg-lime text-lime-ink" : "bg-ink text-paper"
      }`}
      aria-pressed={state.status === "ok" ? state.liked : undefined}
      aria-label={liked ? "Unlike this site" : "Like this site"}
      aria-disabled={state.status === "loading"}
      onClick={() => {
        if (state.status === "loading") return;
        if (state.status === "error") {
          void retry();
          return;
        }
        void toggle();
      }}
    >
      <span className="flex items-start justify-between gap-2">
        <span className="label block opacity-70">likes</span>
        <Star
          aria-hidden="true"
          className="status-star h-6 w-6 shrink-0 md:h-7 md:w-7"
          strokeWidth={1.5}
          fill={liked ? "currentColor" : "none"}
        />
      </span>

      <span className="flex items-baseline gap-2">
        <span
          ref={countRef}
          className="display block origin-left text-5xl leading-none md:text-[3.25rem]"
          aria-live="polite"
        >
          {count ?? (state.status === "loading" ? "…" : "n/a")}
        </span>
        <span className="status-hint mono text-xs leading-tight">{hint}</span>
      </span>
    </button>
  );
}
