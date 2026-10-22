"use client";

import { useCallback, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { socials } from "@/lib/data";
import { formatDate } from "@/lib/format";
import type { RepoFeed } from "@/lib/repos";
import RepoPreview from "./repo-preview";
import RepoFeedSummary from "./repo-feed";
import ReposModal from "./repos-modal";
import Magnetic from "./magnetic";
import SectionLabel from "./section-label";
import SectionMark from "./section-mark";

function padIndex(index: number): string {
  return String(index + 1).padStart(2, "0");
}

export default function Work({ feed }: { feed: RepoFeed }) {
  const [active, setActive] = useState(0);
  const [reposOpen, setReposOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const archiveTriggerRef = useRef<HTMLButtonElement>(null);
  const { repos } = feed;
  const activeRepo = active < repos.length ? repos[active] : null;

  const closeRepos = useCallback(() => {
    setReposOpen(false);
    archiveTriggerRef.current?.focus({ preventScroll: true });
  }, []);

  useGSAP(
    () => {
      if (!previewRef.current) return;
      gsap.fromTo(
        previewRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
      );
    },
    { scope: previewRef, dependencies: [active], revertOnUpdate: true },
  );

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".work-row", {
          y: 30,
          opacity: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".work-list",
            start: "top 82%",
            once: true,
          },
        });

        gsap.to(".work-list", {
          y: -30,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });

        gsap.to(".section-mark", {
          y: -140,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      return () => media.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section id="work" ref={sectionRef} className="relative isolate border-b border-line">
      <SectionMark
        index="02"
        className="top-40 left-0 -z-10 text-[clamp(9rem,24vw,22rem)] text-line/8"
      />
      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-8 lg:py-24">
        <SectionLabel index="02" label="selected work" />
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-md">
            <p className="text-sm leading-relaxed text-muted">
              Repositories pulled from github and codeberg, with the latest
              commit from each one. The list refreshes from both APIs every
              hour.
            </p>
            <RepoFeedSummary feed={feed} />
          </div>
          <Magnetic>
            <button
              ref={archiveTriggerRef}
              type="button"
              onClick={() => setReposOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={reposOpen}
              className="label inline-flex min-h-11 items-center gap-2 border border-line px-4 py-2 transition-colors hover:bg-lime hover:text-lime-ink"
            >
              view all repos ({repos.length})
              <ArrowUpRight
                aria-hidden="true"
                className="h-3.5 w-3.5"
                strokeWidth={2}
              />
            </button>
          </Magnetic>
        </div>

        <div className="mt-10 grid grid-cols-4 gap-8 lg:mt-16 lg:grid-cols-12 lg:gap-12">
          <div className="col-span-4 hidden lg:col-span-4 lg:block">
            <div className="work-preview-wrap sticky top-[calc(var(--header-h)+2rem)]">
              <div
                ref={previewRef}
                className="work-preview group border border-line bg-paper transition-colors duration-300 hover:border-lime"
              >
                {activeRepo ? (
                  <RepoPreview
                    repo={activeRepo}
                    index={padIndex(active)}
                  />
                ) : (
                  <div className="relative flex min-h-88 flex-col justify-between bg-lime p-4 text-lime-ink">
                    <div className="label flex justify-between">
                      <span>{padIndex(repos.length)} / open slot</span>
                      <span>contact</span>
                    </div>
                    <div
                      aria-hidden="true"
                      className="display text-[clamp(6rem,16vw,10rem)] leading-none transition-transform duration-500 ease-out group-hover:rotate-45 motion-reduce:transition-none"
                    >
                      +
                    </div>
                    <p className="label">have something in mind? / say hi</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="work-list col-span-4 lg:col-span-8">
            <div className="border-t border-line">
              {repos.length === 0 ? (
                <div className="border-b border-line py-8">
                  <p className="max-w-md text-sm leading-relaxed text-muted">
                    No public repositories came back from github or codeberg.
                    Both profiles are still open:
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {socials
                      .filter(
                        (social) =>
                          social.icon === "github" ||
                          social.icon === "codeberg",
                      )
                      .map((social) => (
                        <a
                          key={social.href}
                          href={social.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="label inline-flex min-h-11 items-center border border-line px-3 py-2 transition-colors hover:bg-lime hover:text-lime-ink"
                        >
                          {social.label}
                        </a>
                      ))}
                  </div>
                </div>
              ) : null}

              {repos.map((repo, index) => (
                <article
                  key={`${repo.host}:${repo.fullName}`}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  className="work-row group border-b border-line py-6 lg:py-8"
                >
                  <div className="label flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    <span
                      className={`transition-colors ${
                        active === index
                          ? "lg:bg-lime lg:px-1 lg:text-lime-ink"
                          : ""
                      }`}
                    >
                      {padIndex(index)}
                    </span>
                    <span className="text-muted">
                      {repo.host} / {repo.language ?? "no language"}
                    </span>
                    <time dateTime={repo.pushedAt} className="text-muted">
                      pushed {formatDate(repo.pushedAt)}
                    </time>
                  </div>

                  <div className="mt-3 flex items-start justify-between gap-6">
                    <h3 className="display min-w-0 text-[clamp(2.1rem,6vw,6rem)] wrap-anywhere">
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        data-cursor="view"
                        aria-label={`${repo.fullName}, opens in a new tab`}
                        className="transition-colors hover:text-muted"
                      >
                        {repo.name}
                      </a>
                    </h3>
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      data-cursor="view"
                      aria-label={`Open ${repo.fullName}, opens in a new tab`}
                      className="mt-1 hidden shrink-0 items-center justify-center border border-line p-3 transition-colors hover:bg-ink hover:text-paper sm:flex"
                    >
                      <ArrowUpRight
                        aria-hidden="true"
                        className="h-5 w-5"
                        strokeWidth={1.8}
                      />
                    </a>
                  </div>

                  <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-muted">
                    {repo.description ?? "no description on the repo."}
                  </p>

                  {repo.latestCommit ? (
                    <p className="label mt-4 max-w-xl text-muted">
                      latest /{" "}
                      <span className="mono">
                        {repo.latestCommit.short}
                      </span>{" "}
                      <span className="normal-case">
                        {repo.latestCommit.message}
                      </span>
                    </p>
                  ) : (
                    <p className="label mt-4 text-muted">
                      no public commit returned.
                    </p>
                  )}

                  <div className="label mt-3 flex flex-wrap gap-x-4 gap-y-1 text-muted">
                    <span>created {formatDate(repo.createdAt)}</span>
                    {repo.stars > 0 ? <span>stars {repo.stars}</span> : null}
                    {repo.forks > 0 ? <span>forks {repo.forks}</span> : null}
                    {repo.isFork ? <span>fork</span> : null}
                    {repo.archived ? <span>archived</span> : null}
                  </div>

                  {repo.topics.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
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
                </article>
              ))}

              <a
                href="#contact"
                onMouseEnter={() => setActive(repos.length)}
                onFocus={() => setActive(repos.length)}
                className="work-row group flex flex-col justify-between gap-6 border-b border-line px-4 py-6 transition-colors hover:bg-lime hover:text-lime-ink sm:flex-row sm:items-end lg:py-8"
              >
                <div>
                  <div className="label flex gap-3">
                    <span
                      className={`transition-colors ${
                        active === repos.length
                          ? "lg:bg-lime-ink lg:px-1 lg:text-lime"
                          : ""
                      }`}
                    >
                      {padIndex(repos.length)}
                    </span>
                    <span>open slot</span>
                    <span>contact</span>
                  </div>
                  <p className="display mt-3 text-[clamp(2.1rem,6vw,6rem)]">
                    your project?
                  </p>
                </div>
                <p className="max-w-xs text-sm leading-relaxed">
                  Have something that needs a careful interface? Tell me about
                  it.
                </p>
                <ArrowDown
                  aria-hidden="true"
                  className="h-6 w-6 transition-transform group-hover:translate-y-1"
                  strokeWidth={1.8}
                />
              </a>
            </div>
          </div>
        </div>
      </div>
      {reposOpen ? <ReposModal feed={feed} onClose={closeRepos} /> : null}
    </section>
  );
}
