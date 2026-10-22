import { promises as fs } from "node:fs";
import path from "node:path";
import { connection } from "next/server";

const dataDir = path.join(process.cwd(), ".data");
const file = path.join(dataDir, "likes.json");

let lastJob: Promise<unknown> = Promise.resolve();

function serialize<T>(work: () => Promise<T>): Promise<T> {
  const run = lastJob.then(work, work);
  lastJob = run.catch(() => undefined);
  return run;
}

async function readLikes(): Promise<number> {
  try {
    const raw = await fs.readFile(file, "utf8");
    const data = JSON.parse(raw) as { likes?: unknown };
    const likes =
      typeof data.likes === "number" && Number.isFinite(data.likes) && data.likes >= 0
        ? data.likes
        : 0;
    return likes;
  } catch {
    return 0;
  }
}

async function writeLikes(next: number): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(file, `${JSON.stringify({ likes: next })}\n`, "utf8");
}

export async function GET(): Promise<Response> {
  await connection();
  return Response.json({ likes: await readLikes() });
}

export async function POST(): Promise<Response> {
  const likes = await serialize(async () => {
    const next = (await readLikes()) + 1;
    await writeLikes(next);
    return next;
  });
  return Response.json({ likes });
}

export async function DELETE(): Promise<Response> {
  const likes = await serialize(async () => {
    const next = Math.max((await readLikes()) - 1, 0);
    await writeLikes(next);
    return next;
  });
  return Response.json({ likes });
}
