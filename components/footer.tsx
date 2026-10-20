import { ArrowUp } from "lucide-react";
import { navItems, profile, socials } from "@/lib/data";
import LocalClock from "./local-clock";
import SocialIcon from "./social-icon";

export default function Footer() {
  return (
    <footer className="border-t-2 border-lime bg-ink text-paper">
      <div className="mx-auto max-w-[1600px] px-4 py-10 md:px-8 lg:py-14">
        <div className="grid grid-cols-4 gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="col-span-4 lg:col-span-5">
            <a
              href="#top"
              className="inline-flex min-h-11 items-center gap-2"
              aria-label="bram, back to top"
            >
              <span className="text-3xl font-bold tracking-tight">
                bram
              </span>
              <span aria-hidden="true" className="h-3 w-3 bg-lime" />
            </a>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-paper/70">
              web developer in Banjarmasin, Indonesia. Currently working with
              red.dev.
            </p>
            <p className="label mt-6 text-paper/70">
              local time /{" "}
              <LocalClock className="mono text-paper" />
            </p>
            <p className="label mt-1 text-paper/70">
              <span className="normal-case">{profile.coordinates}</span>
            </p>
          </div>

          <div className="col-span-2 lg:col-span-3">
            <p className="label mb-3 text-paper/70">index</p>
            <nav aria-label="Footer" className="-mx-4 flex flex-col items-start">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className="inline-flex min-h-11 items-center px-4 transition-colors hover:bg-lime hover:text-lime-ink"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="col-span-2 lg:col-span-4">
            <p className="label mb-3 text-paper/70">elsewhere</p>
            <div className="-mx-4 flex flex-col items-start">
              {socials.map((social) => {
                const external = social.href.startsWith("http");

                return (
                  <a
                    key={social.label}
                    href={social.href}
                    {...(external
                      ? { target: "_blank", rel: "noreferrer noopener" }
                      : undefined)}
                    aria-label={`${social.label}, ${social.handle}${external ? ", opens in a new tab" : ""}`}
                    className="inline-flex min-h-11 items-center gap-2 px-4 transition-colors hover:bg-lime hover:text-lime-ink"
                  >
                    <SocialIcon icon={social.icon} className="h-4 w-4" />
                    <span className="label">{social.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col justify-between gap-4 border-t border-paper/20 pt-4 sm:flex-row sm:items-center">
          <p className="label text-paper/70">
            © {profile.year} bram. 
          </p>
          <a
            href="#top"
            className="label inline-flex min-h-11 items-center gap-2 px-4 transition-colors hover:bg-lime hover:text-lime-ink"
          >
            back to top
            <ArrowUp aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
          </a>
        </div>
      </div>
    </footer>
  );
}
