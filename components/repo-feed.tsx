import { formatDateTime } from "@/lib/format";
import type { RepoFeed } from "@/lib/repos";

export default function RepoFeedSummary({ feed }: { feed: RepoFeed }) {
  const failures = (["github", "codeberg"] as const).filter(
    (host) => !feed.hosts[host].ok,
  );

  return (
    <div className="label mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
      <span>
        synced{" "}
        <time dateTime={feed.syncedAt}>{formatDateTime(feed.syncedAt)}</time>
      </span>
      <span aria-hidden="true">/</span>
      <span>
        {feed.repos.length} {feed.repos.length === 1 ? "repo" : "repos"}
      </span>
      {failures.map((host) => (
        <span key={host} className="text-ink">
          {host} unavailable ({feed.hosts[host].message})
        </span>
      ))}
    </div>
  );
}

export function RepoActivity({
  feed,
  className = "",
}: {
  feed: RepoFeed;
  className?: string;
}) {
  if (feed.activity.length === 0) {
    return (
      <p className={`label text-muted ${className}`}>
        no public activity found on github or codeberg.
      </p>
    );
  }

  return (
    <ol className={`border-t border-line ${className}`}>
      {feed.activity.map((item, index) => (
        <li key={`${item.url}-${index}`} className="group border-b border-line">
          <div className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 py-3">
            <span className="label pt-0.5 text-muted">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <div className="label flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-muted">
                <time dateTime={item.date}>{formatDateTime(item.date)}</time>
                <span>{item.host}</span>
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer noopener"
                data-cursor="view"
                className="mt-1 block text-[0.92rem] leading-snug transition-colors group-hover:text-muted"
              >
                {item.message}
              </a>
              <a
                href={item.repoUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="label mt-1.5 inline-block text-muted underline underline-offset-4 transition-colors hover:text-ink"
              >
                {item.repo}
              </a>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
