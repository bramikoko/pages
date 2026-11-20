"use client";

import { navLinks, GITHUB } from "@/src/lib/data";
import { scrollToSection } from "./smooth";

export default function Nav() {
  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    scrollToSection(href);
  };

  return (
    <header className="nav">
      <nav className="nav-inner" aria-label="main">
        <a
          className="nav-brand"
          href="#hero"
          onClick={(e) => go(e, "#hero")}
        >
          <span className="nf" aria-hidden="true">&#xf120;</span>
          <span>bram.dev</span>
        </a>

        <div className="nav-links">
          {navLinks.map((l) => (
            <a
              key={l.href}
              className="nav-link"
              href={l.href}
              onClick={(e) => go(e, l.href)}
            >
              <span>{l.label}</span>
            </a>
          ))}
        </div>

        <a
          className="nav-cta"
          href={`mailto:punyaibra@gmail.com?subject=${encodeURIComponent("need you!")}`}
        >
          <span>need me?</span>
          <span className="nf" aria-hidden="true">&#xf061;</span>
        </a>
      </nav>
    </header>
  );
}

export { GITHUB };
