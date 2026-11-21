"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { EMAIL, type Project, type Experience } from "@/src/lib/data";
import type { WorkData, ExperienceData } from "@/src/app/page";
type WorkItem = WorkData;

type DrawerKind = "works" | "about" | null;

export default function About({
  works,
  experience,
}: {
  works: WorkData[];
  experience: ExperienceData[];
}) {
  const [drawer, setDrawer] = useState<DrawerKind>(null);
  const [project, setProject] = useState<WorkItem | null>(null);
  const [exp, setExp] = useState<Experience | null>(null);
  const worksRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const expPopRef = useRef<HTMLDivElement>(null);

  // park the drawers and popup off-screen via gsap (css transforms would
  // fight gsap's own transform bookkeeping)
  useEffect(() => {
    gsap.set(worksRef.current, { xPercent: -103 });
    gsap.set(aboutRef.current, { xPercent: 103 });
    gsap.set(popRef.current, { xPercent: 103 });
    gsap.set(expPopRef.current, { xPercent: -103 });
  }, []);

  const burst = useCallback((edgeX: number) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    for (let i = 0; i < 22; i++) {
      const px = document.createElement("i");
      px.className = "burst-px";
      const s = 2 + Math.floor(Math.random() * 4);
      px.style.cssText = `width:${s}px;height:${s}px;left:${edgeX}px;top:${
        60 + Math.random() * (window.innerHeight - 120)
      };opacity:1`;
      document.body.appendChild(px);
      gsap.to(px, {
        x: (Math.random() - 0.5) * 320,
        y: (Math.random() - 0.5) * 160,
        opacity: 0,
        duration: 0.7 + Math.random() * 0.6,
        ease: "steps(8)",
        onComplete: () => px.remove(),
      });
    }
  }, []);

  const openDrawer = useCallback(
    (kind: Exclude<DrawerKind, null>) => {
      setDrawer(kind);
      const el = kind === "works" ? worksRef.current : aboutRef.current;
      if (!el) return;
      window.__loco?.stop();
      const dir = kind === "works" ? -1 : 1; // works slides from the left
      gsap.set(el, { visibility: "visible" });
      gsap.fromTo(
        el,
        { xPercent: dir * 103 },
        { xPercent: 0, duration: 0.65, ease: "power3.inOut" },
      );
      burst(dir === -1 ? 0 : window.innerWidth);
      el.querySelector("button")?.focus();
    },
    [burst],
  );

  const closeDrawer = useCallback(() => {
    const el = drawer === "works" ? worksRef.current : aboutRef.current;
    if (!el) return;
    const dir = drawer === "works" ? -1 : 1;
    gsap.to(el, {
      xPercent: dir * 103,
      duration: 0.55,
      ease: "power3.inOut",
      onComplete: () => gsap.set(el, { visibility: "hidden" }),
    });
    window.__loco?.start();
    setDrawer(null);
  }, [drawer]);

  const openProject = useCallback((p: WorkItem) => {
    setProject(p);
    const el = popRef.current;
    if (!el) return;
    gsap.set(el, { visibility: "visible" });
    gsap.fromTo(
      el,
      { xPercent: 103 },
      { xPercent: 0, duration: 0.65, ease: "power3.inOut" },
    );
    el.querySelector("button")?.focus();
  }, []);

  const closeProject = useCallback(() => {
    const el = popRef.current;
    if (!el) return;
    gsap.to(el, {
      xPercent: 103,
      duration: 0.55,
      ease: "power3.inOut",
      onComplete: () => gsap.set(el, { visibility: "hidden" }),
    });
    if (!drawer) window.__loco?.start();
    setProject(null);
  }, [drawer]);

  const openExp = useCallback((x: Experience) => {
    setExp(x);
    const el = expPopRef.current;
    if (!el) return;
    gsap.set(el, { visibility: "visible" });
    // slides in from the LEFT so it never hides behind the right-side drawer
    gsap.fromTo(
      el,
      { xPercent: -103 },
      { xPercent: 0, duration: 0.65, ease: "power3.inOut" },
    );
    el.querySelector("button")?.focus();
  }, []);

  const closeExp = useCallback(() => {
    const el = expPopRef.current;
    if (!el) return;
    gsap.to(el, {
      xPercent: -103,
      duration: 0.55,
      ease: "power3.inOut",
      onComplete: () => gsap.set(el, { visibility: "hidden" }),
    });
    if (!drawer) window.__loco?.start();
    setExp(null);
  }, [drawer]);

  // esc closes the topmost layer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (project) closeProject();
      else if (exp) closeExp();
      else if (drawer) closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [project, exp, drawer, closeProject, closeExp, closeDrawer]);

  return (
    <>
      <section className="about" id="about">
        <div className="container">
          <p className="sec-label">
            <span className="sec-index">01</span> about
          </p>

          <div className="about-grid">
            <div className="about-side left">
              <button
                className="text-link"
                id="open-works"
                type="button"
                onClick={() => openDrawer("works")}
              >
                <span className="nf arrow" aria-hidden="true">&#xf060;</span>
                <span>my works</span>
              </button>
            </div>

            <div>
              <p className="about-copy" data-reveal data-parallax="4">
                i am bram — a fullstack developer who cares about the{" "}
                <span className="dim">details most people scroll past.</span>
              </p>
              <p className="about-note">
                banjarmasin, indonesia — building at reddev
              </p>
            </div>

            <div className="about-side right">
              <button
                className="text-link flip"
                id="open-about"
                type="button"
                onClick={() => openDrawer("about")}
              >
                <span>more about me</span>
                <span className="nf arrow" aria-hidden="true">&#xf061;</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* works drawer — slides in from the left */}
      <div
        className="drawer from-left"
        ref={worksRef}
        role="dialog"
        aria-modal="true"
        aria-label="my works"
      >
        <div className="drawer-head px-dots-dark">
          <span className="drawer-title">
            <span className="nf" aria-hidden="true">&#xf0c9;</span> my works
          </span>
          <button className="drawer-close" type="button" onClick={closeDrawer}>
            <span className="nf" aria-hidden="true">&#xf00d;</span> close
          </button>
        </div>
        <div className="drawer-body" data-lenis-prevent>
          {works.length === 0 && (
            <div className="drawer-empty">
              <p className="empty-title">no works here yet</p>
              <p className="small">
                the shelf is still being stocked — real projects land here soon.
              </p>
            </div>
          )}
          {works.map((p) => (
            <button className="wcard" key={p.id} type="button" onClick={() => openProject(p)}>
              {p.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="wcard-img" src={p.image} alt="" loading="lazy" />
              )}
              <div className="wcard-top">
                <span className="wcard-title">{p.title}</span>
                <span className="wcard-year">{p.year}</span>
              </div>
              <p className="wcard-desc">{p.desc}</p>
              <div className="wcard-tags">
                {p.stack.map((s) => (
                  <span className="wcard-tag" key={s}>
                    {s}
                  </span>
                ))}
              </div>
            </button>
          ))}
          {/* ask sits at the very end of the scroll */}
          <div className="drawer-end px-dots-dark">
            <p className="big-ask">gimme some work</p>
            <p className="small">
              out of projects to show? the inbox is open —{" "}
              <a href="mailto:punyaibra@gmail.com" style={{ textDecoration: "underline" }}>
                punyaibra@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* more-about drawer — slides in from the right */}
      <div
        className="drawer from-right"
        ref={aboutRef}
        role="dialog"
        aria-modal="true"
        aria-label="more about me"
      >
        <div className="drawer-head px-dots-dark">
          <span className="drawer-title">
            <span className="nf" aria-hidden="true">&#xf19d;</span> more about me
          </span>
          <button className="drawer-close" type="button" onClick={closeDrawer}>
            <span className="nf" aria-hidden="true">&#xf00d;</span> close
          </button>
        </div>
        <div className="drawer-body" data-lenis-prevent>
          {experience.length === 0 && (
            <div className="drawer-empty">
              <p className="empty-title">nothing written here yet</p>
              <p className="small">the story section is still being typed.</p>
            </div>
          )}
          {experience.map((x) => (
            <button className="wcard" key={x.title} type="button" onClick={() => openExp(x)}>
              {x.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="wcard-img" src={x.image} alt="" loading="lazy" />
              )}
              <div className="wcard-top">
                <span className="wcard-title">{x.title}</span>
                <span className="wcard-period">{x.period}</span>
              </div>
              <p className="wcard-desc">
                {x.place} — {x.desc}
              </p>
            </button>
          ))}
          {/* closing note sits at the very end of the scroll */}
          <div className="drawer-end px-dots-dark">
            <p className="big-ask">say hi anytime</p>
            <p className="small">
              there is more where that came from —{" "}
              <a href={`mailto:${EMAIL}`} style={{ textDecoration: "underline" }}>
                {EMAIL}
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* project detail popup */}
      <div
        className="project-pop"
        ref={popRef}
        role="dialog"
        aria-modal="true"
        aria-label={project?.title ?? "project"}
      >
        <div className="project-pop-head">
          <span className="drawer-title">
            <span className="nf" aria-hidden="true">&#xf08e;</span> {project?.id ?? ""}
          </span>
          <button className="pop-close" type="button" onClick={closeProject}>
            <span className="nf" aria-hidden="true">&#xf00d;</span> close
          </button>
        </div>
        {project && (
          <div className="project-pop-body" data-lenis-prevent>
            {project.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={project.image} alt="" />
            )}
            <h3 className="project-pop-title">{project.title}</h3>
            <p className="wcard-year">
              {project.year} — {project.stack.join(" / ")}
            </p>
            <p className="project-pop-desc">{project.detail}</p>
            {project.link && (
              <p style={{ marginTop: "1.5rem" }}>
                <a className="btn" href={project.link} target="_blank" rel="noreferrer">
                  <span className="nf" aria-hidden="true">&#xf09b;</span>
                  <span>view source</span>
                </a>
              </p>
            )}
          </div>
        )}
      </div>
      {/* experience detail popup — slides from the LEFT so the right-side
          drawer never covers it */}
      <div
        className="project-pop from-left"
        ref={expPopRef}
        role="dialog"
        aria-modal="true"
        aria-label={exp?.title ?? "experience"}
      >
        <div className="project-pop-head">
          <span className="drawer-title">
            <span className="nf" aria-hidden="true">&#xf19d;</span> {exp?.place ?? ""}
          </span>
          <button className="pop-close" type="button" onClick={closeExp}>
            <span className="nf" aria-hidden="true">&#xf00d;</span> close
          </button>
        </div>
        {exp && (
          <div className="project-pop-body" data-lenis-prevent>
            {exp.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={exp.image} alt="" />
            )}
            <h3 className="project-pop-title">{exp.title}</h3>
            <p className="wcard-year">{exp.period}</p>
            <p className="project-pop-desc">{exp.detail}</p>
          </div>
        )}
      </div>
    </>
  );
}
