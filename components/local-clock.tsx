"use client";

import { useSyncExternalStore } from "react";

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Makassar",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

let currentTime = "--:--:--";
let intervalId: number | null = null;
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  if (listeners.size === 0) {
    currentTime = timeFormatter.format(new Date());
    intervalId = window.setInterval(() => {
      currentTime = timeFormatter.format(new Date());
      listeners.forEach((listener) => listener());
    }, 1000);
  }

  listeners.add(callback);
  callback();

  return () => {
    listeners.delete(callback);
    if (listeners.size === 0 && intervalId !== null) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  };
}

function getSnapshot() {
  return currentTime;
}

function getServerSnapshot() {
  return "--:--:--";
}

export default function LocalClock({ className = "" }: { className?: string }) {
  const time = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <time title="Local time in Banjarmasin" className={className}>
      {time}
    </time>
  );
}
