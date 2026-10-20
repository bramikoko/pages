export type Theme = "light" | "dark";

const listeners = new Set<() => void>();
let cachedTheme: Theme | null = null;

export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getThemeSnapshot(): Theme {
  if (cachedTheme === null) {
    cachedTheme =
      typeof document !== "undefined" &&
      document.documentElement.dataset.theme === "dark"
        ? "dark"
        : "light";
  }
  return cachedTheme;
}

export function getThemeServerSnapshot(): Theme {
  return "light";
}

export function writeTheme(next: Theme) {
  cachedTheme = next;
  document.documentElement.dataset.theme = next;

  try {
    localStorage.setItem("bram-theme", next);
  } catch {
    // Private browsing can reject storage writes.
  }

  listeners.forEach((listener) => listener());
}
