import { cacheLife } from "next/cache";

const GITHUB_USER = "bramikoko";
const CODEBERG_USER = "bramikoko";
const TIMEOUT_MS = 8000;
const MAX_COMMITS = 8;
const MAX_ACTIVITY = 8;

export type RepoHost = "github" | "codeberg";

export type RepoCommit = {
  sha: string;
  short: string;
  message: string;
  date: string;
  url: string;
};

export type Repo = {
  host: RepoHost;
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  topics: string[];
  stars: number;
  forks: number;
  isFork: boolean;
  archived: boolean;
  createdAt: string;
  pushedAt: string;
  url: string;
  latestCommit: RepoCommit | null;
};

export type RepoActivity = {
  host: RepoHost;
  repo: string;
  repoUrl: string;
  message: string;
  date: string;
  url: string;
};

export type HostStatus = {
  ok: boolean;
  message: string | null;
};

export type RepoFeed = {
  repos: Repo[];
  activity: RepoActivity[];
  syncedAt: string;
  hosts: Record<RepoHost, HostStatus>;
};

type GithubRepo = {
  name: string;
  full_name: string;
  description: string | null;
  fork: boolean;
  archived: boolean;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  forks_count: number;
  created_at: string;
  pushed_at: string;
  html_url: string;
};

type GithubCommit = {
  sha: string;
  html_url: string;
  commit: { message: string; author: { date: string } };
};

type GithubEvent = {
  type: string;
  created_at: string;
  repo: { name: string };
  payload: {
    action?: string;
    ref?: string;
    ref_type?: string;
    commits?: { sha: string; message: string }[];
    pull_request?: { html_url: string; number: number };
    issue?: { html_url: string; number: number };
    forkee?: { full_name: string; html_url: string };
    release?: { html_url: string; tag_name: string };
  };
};

type CodebergRepo = {
  name: string;
  full_name: string;
  owner: { login: string };
  description: string;
  fork: boolean;
  archived: boolean;
  language: string;
  stars_count: number;
  forks_count: number;
  created_at: string;
  updated_at: string;
  html_url: string;
  topics: string[] | null;
};

type CodebergCommit = {
  sha: string;
  html_url: string;
  commit: { message: string; author: { date: string } };
};

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "bram-portfolio",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function fetchJson<T>(
  url: string,
  headers: Record<string, string>,
): Promise<T> {
  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(String(response.status));
  return (await response.json()) as T;
}

function describeError(error: unknown): string {
  if (error instanceof DOMException && error.name === "TimeoutError") {
    return "timeout";
  }
  if (error instanceof Error) {
    if (error.message === "403" || error.message === "429") {
      return "rate limited";
    }
    if (error.message === "404") return "not found";
    if (/^5\d\d$/.test(error.message)) return "server error";
  }
  return "unreachable";
}

function firstLine(message: string): string {
  return message.split("\n")[0].trim();
}

function commitFromGithub(commit: GithubCommit): RepoCommit {
  return {
    sha: commit.sha,
    short: commit.sha.slice(0, 7),
    message: firstLine(commit.commit.message),
    date: commit.commit.author.date,
    url: commit.html_url,
  };
}

function commitFromCodeberg(commit: CodebergCommit): RepoCommit {
  return {
    sha: commit.sha,
    short: commit.sha.slice(0, 7),
    message: firstLine(commit.commit.message),
    date: commit.commit.author.date,
    url: commit.html_url,
  };
}

function commitActivity(repo: Repo): RepoActivity | null {
  if (!repo.latestCommit) return null;
  return {
    host: repo.host,
    repo: repo.fullName,
    repoUrl: repo.url,
    message: repo.latestCommit.message,
    date: repo.latestCommit.date,
    url: repo.latestCommit.url,
  };
}

function githubEventActivity(event: GithubEvent): RepoActivity | null {
  const repoUrl = `https://github.com/${event.repo.name}`;
  const base = {
    host: "github" as const,
    repo: event.repo.name,
    repoUrl,
    date: event.created_at,
  };

  switch (event.type) {
    case "PushEvent": {
      const commits = event.payload.commits ?? [];
      const commit = commits[commits.length - 1];
      if (!commit) return null;
      return {
        ...base,
        message: firstLine(commit.message),
        url: `${repoUrl}/commit/${commit.sha}`,
      };
    }
    case "PullRequestEvent": {
      const pull = event.payload.pull_request;
      if (!pull) return null;
      return {
        ...base,
        message: `${event.payload.action ?? "updated"} pull request #${pull.number}`,
        url: pull.html_url,
      };
    }
    case "IssuesEvent": {
      const issue = event.payload.issue;
      if (!issue) return null;
      return {
        ...base,
        message: `${event.payload.action ?? "updated"} issue #${issue.number}`,
        url: issue.html_url,
      };
    }
    case "CreateEvent": {
      if (!event.payload.ref_type) return null;
      const ref = event.payload.ref ? ` ${event.payload.ref}` : "";
      return {
        ...base,
        message: `created ${event.payload.ref_type}${ref}`,
        url: repoUrl,
      };
    }
    case "ForkEvent": {
      const forkee = event.payload.forkee;
      if (!forkee) return null;
      return {
        ...base,
        message: `forked to ${forkee.full_name}`,
        url: forkee.html_url,
      };
    }
    case "ReleaseEvent": {
      const release = event.payload.release;
      if (!release) return null;
      return {
        ...base,
        message: `published release ${release.tag_name}`,
        url: release.html_url,
      };
    }
    default:
      return null;
  }
}

async function githubRepos(): Promise<{
  repos: Repo[];
  activity: RepoActivity[];
  status: HostStatus;
}> {
  try {
    const headers = githubHeaders();
    const data = await fetchJson<GithubRepo[]>(
      `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed&direction=desc`,
      headers,
    );

    const repos: Repo[] = data
      .map((repo) => ({
        host: "github" as const,
        owner: repo.full_name.split("/")[0],
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        language: repo.language,
        topics: repo.topics ?? [],
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        isFork: repo.fork,
        archived: repo.archived,
        createdAt: repo.created_at,
        pushedAt: repo.pushed_at,
        url: repo.html_url,
        latestCommit: null,
      }))
      .sort((a, b) => Date.parse(b.pushedAt) - Date.parse(a.pushedAt));

    await Promise.all(
      repos.slice(0, MAX_COMMITS).map(async (repo) => {
        try {
          const [commit] = await fetchJson<GithubCommit[]>(
            `https://api.github.com/repos/${repo.fullName}/commits?per_page=1`,
            headers,
          );
          if (commit) repo.latestCommit = commitFromGithub(commit);
        } catch {
          repo.latestCommit = null;
        }
      }),
    );

    const activity: RepoActivity[] = repos
      .map(commitActivity)
      .filter((item): item is RepoActivity => item !== null);

    // Public events cover work in repositories this account does not own.
    // Failures here cost the feed nothing, so they stay silent.
    try {
      const events = await fetchJson<GithubEvent[]>(
        `https://api.github.com/users/${GITHUB_USER}/events/public?per_page=30`,
        headers,
      );
      for (const event of events) {
        const item = githubEventActivity(event);
        if (item) activity.push(item);
      }
    } catch {
      // Keep the commit activity.
    }

    return { repos, activity, status: { ok: true, message: null } };
  } catch (error) {
    return {
      repos: [],
      activity: [],
      status: { ok: false, message: describeError(error) },
    };
  }
}

async function codebergRepos(): Promise<{
  repos: Repo[];
  activity: RepoActivity[];
  status: HostStatus;
}> {
  const headers = {
    Accept: "application/json",
    "User-Agent": "bram-portfolio",
  };

  try {
    const data = await fetchJson<CodebergRepo[]>(
      `https://codeberg.org/api/v1/users/${CODEBERG_USER}/repos?limit=50`,
      headers,
    );

    const repos: Repo[] = data
      .map((repo) => ({
        host: "codeberg" as const,
        owner: repo.owner?.login ?? repo.full_name.split("/")[0],
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description?.trim() ? repo.description : null,
        language: repo.language?.trim() ? repo.language : null,
        topics: repo.topics ?? [],
        stars: repo.stars_count,
        forks: repo.forks_count,
        isFork: repo.fork,
        archived: repo.archived,
        createdAt: repo.created_at,
        pushedAt: repo.updated_at,
        url: repo.html_url,
        latestCommit: null,
      }))
      .sort((a, b) => Date.parse(b.pushedAt) - Date.parse(a.pushedAt));

    await Promise.all(
      repos.slice(0, MAX_COMMITS).map(async (repo) => {
        try {
          const [commit] = await fetchJson<CodebergCommit[]>(
            `https://codeberg.org/api/v1/repos/${repo.fullName}/commits?limit=1`,
            headers,
          );
          if (commit) repo.latestCommit = commitFromCodeberg(commit);
        } catch {
          repo.latestCommit = null;
        }
      }),
    );

    const activity: RepoActivity[] = repos
      .map(commitActivity)
      .filter((item): item is RepoActivity => item !== null);

    return { repos, activity, status: { ok: true, message: null } };
  } catch (error) {
    return {
      repos: [],
      activity: [],
      status: { ok: false, message: describeError(error) },
    };
  }
}

export async function getRepoFeed(): Promise<RepoFeed> {
  "use cache";
  cacheLife("hours");

  const [github, codeberg] = await Promise.all([
    githubRepos(),
    codebergRepos(),
  ]);

  const repos = [...github.repos, ...codeberg.repos].sort(
    (a, b) => Date.parse(b.pushedAt) - Date.parse(a.pushedAt),
  );

  const activity = [...github.activity, ...codeberg.activity]
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .filter(
      (item, index, list) =>
        list.findIndex((candidate) => candidate.url === item.url) === index,
    )
    .slice(0, MAX_ACTIVITY);

  return {
    repos,
    activity,
    syncedAt: new Date().toISOString(),
    hosts: { github: github.status, codeberg: codeberg.status },
  };
}
