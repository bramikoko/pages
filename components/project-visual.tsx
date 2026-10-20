import type { Project } from "@/lib/data";

export default function ProjectVisual({
  project,
  className = "",
  flush = false,
}: {
  project: Project;
  className?: string;
  flush?: boolean;
}) {
  const frame = flush ? "" : "border border-line";

  if (project.visual === "open") {
    return (
      <div
        className={`relative flex aspect-[4/5] flex-col justify-between overflow-hidden bg-lime p-4 text-lime-ink ${frame} ${className}`}
      >
        <div className="label flex justify-between">
          <span>{project.index} / open slot</span>
          <span>{project.year}</span>
        </div>
        <div
          aria-hidden="true"
          className="display text-[clamp(6rem,16vw,12rem)] leading-none transition-transform duration-500 ease-out group-hover:rotate-45 motion-reduce:transition-none"
        >
          +
        </div>
        <div className="label">have something in mind? / say hi</div>
      </div>
    );
  }

  const host = project.href.startsWith("https://codeberg") ? "codeberg" : "github";

  return (
    <div
      className={`relative flex aspect-[4/5] flex-col justify-between overflow-hidden bg-ink p-4 text-paper ${frame} ${className}`}
    >
      <div className="label flex justify-between">
        <span className="text-lime">{project.name}</span>
        <span>{project.year}</span>
      </div>
      <pre className="mono whitespace-pre-wrap border-l-2 border-lime pl-3 text-[clamp(0.55rem,1.1vw,0.8rem)] leading-relaxed">
        {`$ cat ${project.name}/README\n# ${project.name}\n> ${project.kind}\n$ ${project.tags.join(", ")}`}
        <span
          aria-hidden="true"
          className="preview-cursor ml-1 inline-block h-[1em] w-[0.55em] translate-y-[0.12em] bg-lime"
        />
      </pre>
      <div className="label flex items-center justify-between">
        <span>{host}</span>
        <span aria-hidden="true" className="h-2 w-2 bg-lime" />
      </div>
    </div>
  );
}
