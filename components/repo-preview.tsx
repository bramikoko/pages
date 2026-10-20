import { ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { Repo } from "@/lib/repos";

export default function RepoPreview({
  repo,
  index,
}: {
  repo: Repo;
  index: string;
}) {
  return (
    <div className="bg-paper">
      <div className="relative flex h-[clamp(16rem,36svh,24rem)] flex-col justify-between overflow-hidden border-b border-line bg-plate p-4 text-plate-ink">
        <div className="label flex items-baseline justify-between gap-3">
          <span className="truncate text-lime">{repo.fullName}</span>
          <span>{formatDate(repo.createdAt).slice(-4)}</span>
        </div>

        <dl className="mono grid gap-y-1.5 border-l-2 border-lime pl-3 text-[clamp(0.6rem,1.1vw,0.8rem)] leading-relaxed">
          <div className="flex gap-3">
            <dt className="w-[5.5rem] shrink-0 text-plate-ink/70">language</dt>
            <dd className="min-w-0 break-words">{repo.language ?? "none"}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-[5.5rem] shrink-0 text-plate-ink/70">pushed</dt>
            <dd className="min-w-0">{formatDate(repo.pushedAt)}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-[5.5rem] shrink-0 text-plate-ink/70">created</dt>
            <dd className="min-w-0">{formatDate(repo.createdAt)}</dd>
          </div>
          {repo.latestCommit ? (
            <div className="flex gap-3">
              <dt className="w-[5.5rem] shrink-0 text-plate-ink/70">commit</dt>
              <dd className="min-w-0 break-words">
                <span className="text-lime">{repo.latestCommit.short}</span>{" "}
                {repo.latestCommit.message}
              </dd>
            </div>
          ) : null}
        </dl>

        <div className="label flex items-center justify-between gap-3">
          <span>{repo.host}</span>
          <span className="flex items-center gap-2">
            {repo.isFork ? "fork" : repo.archived ? "archived" : "repo"}
            <span aria-hidden="true" className="h-2 w-2 bg-lime" />
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="label flex items-center justify-between gap-3 text-muted">
          <span className="flex items-center gap-2">
            <span className="inline-flex h-5 min-w-5 items-center justify-center bg-lime px-1 text-[0.6rem] text-lime-ink">
              {index}
            </span>
            <span>/ {repo.host}</span>
          </span>
          <span>{repo.isFork ? "fork" : "source"}</span>
        </div>

        <h3 className="display mt-3 text-[clamp(1.6rem,2.4vw,2rem)] [overflow-wrap:anywhere]">
          <a
            href={repo.url}
            target="_blank"
            rel="noreferrer noopener"
            data-cursor="view"
            className="transition-colors hover:text-muted"
          >
            {repo.name}
          </a>
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {repo.description ?? "no description on the repo."}
        </p>

        {repo.topics.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {repo.topics.map((topic) => (
              <span key={topic} className="label border border-line px-2 py-1">
                {topic}
              </span>
            ))}
          </div>
        ) : null}

        <a
          href={repo.url}
          target="_blank"
          rel="noreferrer noopener"
          data-cursor="view"
          className="label mt-4 inline-flex min-h-10 items-center gap-2 border border-line px-4 py-2 transition-colors hover:bg-lime hover:text-lime-ink"
        >
          open repository
          <ArrowUpRight
            aria-hidden="true"
            className="h-4 w-4"
            strokeWidth={1.8}
          />
        </a>
      </div>
    </div>
  );
}
