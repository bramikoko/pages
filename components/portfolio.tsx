"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import {
  getThemeServerSnapshot,
  getThemeSnapshot,
  subscribeTheme,
  writeTheme,
} from "@/lib/theme-store";
import About from "./about";
import Contact from "./contact";
import CustomCursor from "./custom-cursor";
import Footer from "./footer";
import Header from "./header";
import Hero from "./hero";
import Marquee from "./marquee";
import Preloader from "./preloader";
import ScrollProgress from "./scroll-progress";
import Stack from "./stack";
import Work from "./work";

export default function Portfolio() {
  const [ready, setReady] = useState(false);
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot,
  );

  const handleReady = useCallback(() => setReady(true), []);

  const toggleTheme = () => {
    writeTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      <a href="#main" className="skip-link">
        skip to content
      </a>
      <Preloader onComplete={handleReady} />
      <CustomCursor />
      <ScrollProgress />
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main id="main" tabIndex={-1}>
        <Hero ready={ready} />
        <Marquee />
        <About />
        <Work />
        <Stack />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
