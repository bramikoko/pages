"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { profile, socials } from "@/lib/data";
import SocialIcon from "./social-icon";

const whatsapp = socials.find((social) => social.icon === "whatsapp");

const externalSocials = socials.filter((social) => social.icon !== "mail");

export default function Contact() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <section id="contact" className="bg-lime text-lime-ink">
      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-8 lg:py-24">
        <div className="label flex items-center gap-3">
          <span>04</span>
          <span aria-hidden="true" className="h-px flex-1 bg-lime-ink" />
          <span>contact</span>
        </div>

        <div className="mt-8 grid grid-cols-4 gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="col-span-4 lg:col-span-7">
            <h2 className="display text-[clamp(5rem,18vw,16rem)]">say hi.</h2>
            <p className="label mt-4">email is best.</p>
            <a
              href={`mailto:${profile.email}`}
              className="mt-6 block break-words text-[clamp(1.1rem,3.4vw,3rem)] font-semibold leading-tight tracking-[-0.03em] underline-offset-8 transition-colors hover:underline"
            >
              {profile.email}
            </a>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex min-h-12 items-center gap-2 border border-lime-ink px-4 py-2 transition-colors hover:bg-lime-ink hover:text-lime"
              >
                {copied ? (
                  <Check
                    aria-hidden="true"
                    className="h-4 w-4"
                    strokeWidth={2}
                  />
                ) : (
                  <Copy
                    aria-hidden="true"
                    className="h-4 w-4"
                    strokeWidth={1.8}
                  />
                )}
                <span className="label">
                  {copied ? "copied" : "copy email"}
                </span>
              </button>
              {whatsapp ? (
                <a
                  href={whatsapp.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex min-h-12 items-center gap-2 border border-lime-ink px-4 py-2 transition-colors hover:bg-lime-ink hover:text-lime"
                >
                  <SocialIcon
                    icon="whatsapp"
                    className="h-4 w-4"
                  />
                  <span className="label">chat on whatsapp</span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5"
                    strokeWidth={2}
                  />
                </a>
              ) : null}
              <span className="sr-only" aria-live="polite">
                {copied ? "Email copied to clipboard" : ""}
              </span>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-6 border-t border-lime-ink pt-4">
              <div>
                <p className="label">based in</p>
                <p className="mt-1 text-sm">Banjarmasin, Indonesia</p>
              </div>
              <div>
                <p className="label">coordinates</p>
                <p className="mt-1 text-sm">{profile.coordinates}</p>
              </div>
            </div>
          </div>

          <div className="col-span-4 lg:col-span-5">
            <p className="label mb-3">elsewhere</p>
            <div>
              {externalSocials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`${social.label}, ${social.handle}, opens in a new tab`}
                  className="group flex min-h-14 items-center justify-between gap-4 border-t border-lime-ink px-4 py-3 transition-colors hover:bg-lime-ink hover:text-lime"
                >
                  <span className="flex items-center gap-3">
                    <SocialIcon icon={social.icon} className="h-4 w-4" />
                    <span className="text-sm">{social.label}</span>
                  </span>
                  <span className="label flex items-center gap-2">
                    {social.handle}
                    <ArrowUpRight
                      aria-hidden="true"
                      className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      strokeWidth={1.8}
                    />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
