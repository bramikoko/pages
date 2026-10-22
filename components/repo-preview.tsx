import { ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { Repo } from "@/lib/repos";

const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export default function RepoPreview({
  repo,
  index,
}: {
  repo: Repo;
  index: string;
}) {
  const created = Date.parse(repo.createdAt);
  const pushed = Date.parse(repo.pushedAt);
  const start = pushed - YEAR_MS;
  const createdShare = Math.min(1, Math.max(0, (created - start) / YEAR_MS));
  const activeDays = Math.max(0, Math.round((pushed - created) / 86_400_000));
  const createdIsOlder = created < start;

  return (
    <article className="group/preview relative">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-10 h-0.5 origin-left scale-x-0 bg-lime transition-transform duration-300 ease-out group-hover/preview:scale-x-100 motion-reduce:transition-none"
      />

      <div className="label flex items-center justify-between gap-3 border-b border-line px-4 py-2">
        <span>
          {index} / {repo.host}
        </span>
        <span className="text-muted">
          {repo.isFork ? "fork" : repo.archived ? "archived" : "repo"}
        </span>
      </div>

      <div className="px-4 pt-5">
        <p className="label text-muted">repository</p>
        <h3 className="display mt-1 text-[clamp(1.9rem,2.7vw,2.5rem)] leading-none wrap-anywhere">
          <a
            href={repo.url}
            target="_blank"
            rel="noreferrer noopener"
            data-cursor="view"
            className="inline-block transition-[color,transform] duration-300 ease-out group-hover/preview:translate-x-1 hover:text-muted motion-reduce:transition-none"
          >
            {repo.name}
          </a>
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
          {repo.description ?? "no description on the repo."}
        </p>
      </div>

      <dl className="mt-5 grid grid-cols-3 border-y border-line">
        <div className="border-r border-line px-3 py-2.5">
          <dt className="label text-muted">language</dt>
          <dd className="mono mt-1 truncate text-[0.7rem]">
            {repo.language ?? "none"}
          </dd>
        </div>
        <div className="border-r border-line px-3 py-2.5">
          <dt className="label text-muted">created</dt>
          <dd className="mono mt-1 text-[0.7rem]">{formatDate(repo.createdAt)}</dd>
        </div>
        <div className="px-3 py-2.5">
          <dt className="label text-muted">pushed</dt>
          <dd className="mono mt-1 text-[0.7rem]">{formatDate(repo.pushedAt)}</dd>
        </div>
      </dl>

      <div className="border-b border-line px-4 py-3">
        <div className="label flex items-center justify-between text-muted">
          <span>activity</span>
          <span>12 mo window</span>
        </div>

        <div className="relative mt-4 mb-3 h-2.5">
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line/25"
          />
          <span
            aria-hidden="true"
            className="absolute right-0 top-1/2 h-px -translate-y-1/2 bg-lime"
            style={{ left: `${createdShare * 100}%` }}
          />
          <span
            aria-hidden="true"
            className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 border border-line bg-paper"
            style={{ left: `${createdShare * 100}%` }}
          />
          <span
            aria-hidden="true"
            className="absolute top-1/2 right-0 h-2.5 w-2.5 -translate-y-1/2 bg-lime"
          />
        </div>

        <div className="label flex items-center justify-between text-muted">
          <span>12 months ago</span>
          <span>pushed</span>
        </div>

        <p className="label mt-2 text-muted">
          {createdIsOlder
            ? "created before this window"
            : activeDays === 0
              ? "created and pushed the same day"
              : `${activeDays} ${activeDays === 1 ? "day" : "days"} from creation to last push`}
        </p>
        <span className="sr-only">
          created {formatDate(repo.createdAt)}, pushed {formatDate(repo.pushedAt)}
          {createdIsOlder
            ? ", creation is older than the last twelve months."
            : activeDays === 0
              ? ", created and pushed on the same day."
              : `, ${activeDays} days between creation and the last push.`}
        </span>
      </div>

      <div className="px-4 py-3">
        <p className="label text-muted">latest commit</p>
        {repo.latestCommit ? (
          <p className="mt-1.5 flex items-start gap-2 text-[0.72rem] leading-relaxed">
            <span className="mono shrink-0 bg-lime px-1 text-lime-ink">
              {repo.latestCommit.short}
            </span>
            <span className="line-clamp-2 text-muted">
              {repo.latestCommit.message}
            </span>
          </p>
        ) : (
          <p className="mt-1.5 text-[0.72rem] text-muted">
            no public commit returned.
          </p>
        )}
      </div>

      <div className="flex items-stretch justify-between border-t border-line">
        <a
          href={repo.url}
          target="_blank"
          rel="noreferrer noopener"
          data-cursor="view"
          className="label inline-flex min-h-11 items-center gap-2 px-4 transition-colors hover:bg-lime hover:text-lime-ink"
        >
          open repository
          <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
        </a>
        <span className="label flex items-center pr-4 text-muted">
          {formatDate(repo.createdAt).slice(-4)}
        </span>
      </div>
    </article>
  );
}
