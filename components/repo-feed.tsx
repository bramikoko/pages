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
    <ul className={`border-t border-line ${className}`}>
      {feed.activity.map((item) => (
        <li
          key={item.url}
          className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line py-3"
        >
          <time
            dateTime={item.date}
            className="label w-full shrink-0 text-muted sm:w-auto"
          >
            {formatDateTime(item.date)}
          </time>
          <span className="label text-muted">{item.host}</span>
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer noopener"
            data-cursor="view"
            className="min-w-0 flex-1 text-sm leading-snug transition-colors hover:text-muted"
          >
            {item.message}
          </a>
          <a
            href={item.repoUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="label break-all text-muted underline underline-offset-4 transition-colors hover:text-ink"
          >
            {item.repo}
          </a>
        </li>
      ))}
    </ul>
  );
}
