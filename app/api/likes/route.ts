import { promises as fs } from "node:fs";
import path from "node:path";
import { connection } from "next/server";

const KEY = "likes";
const dataDir = path.join(process.cwd(), ".data");
const file = path.join(dataDir, "likes.json");

const redisUrl =
  process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const redisToken =
  process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const useRedis = Boolean(redisUrl && redisToken);

type RedisReply<T> = { result?: T; error?: string };

async function redis<T>(args: (string | number)[]): Promise<T> {
  const response = await fetch(redisUrl as string, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${redisToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`redis ${response.status}`);
  }
  const data = (await response.json()) as RedisReply<T>;
  if (data.error) throw new Error(data.error);
  return data.result as T;
}

function toCount(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

let lastJob: Promise<unknown> = Promise.resolve();

function serialize<T>(work: () => Promise<T>): Promise<T> {
  const run = lastJob.then(work, work);
  lastJob = run.catch(() => undefined);
  return run;
}

async function readFileLikes(): Promise<number> {
  try {
    const raw = await fs.readFile(file, "utf8");
    const data = JSON.parse(raw) as { likes?: unknown };
    return toCount(data.likes);
  } catch {
    return 0;
  }
}

async function writeFileLikes(next: number): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(file, `${JSON.stringify({ likes: next })}\n`, "utf8");
}

async function readLikes(): Promise<number> {
  if (useRedis) return toCount(await redis<string | number | null>(["GET", KEY]));
  return readFileLikes();
}

async function addLike(): Promise<number> {
  if (useRedis) return toCount(await redis<number>(["INCR", KEY]));
  return serialize(async () => {
    const next = (await readFileLikes()) + 1;
    await writeFileLikes(next);
    return next;
  });
}

async function removeLike(): Promise<number> {
  if (useRedis) {
    const script =
      "local v = redis.call('DECR', KEYS[1]) if v < 0 then redis.call('SET', KEYS[1], 0) return 0 end return v";
    return toCount(await redis<number>(["EVAL", script, "1", KEY]));
  }
  return serialize(async () => {
    const next = Math.max((await readFileLikes()) - 1, 0);
    await writeFileLikes(next);
    return next;
  });
}

export async function GET(): Promise<Response> {
  await connection();
  return Response.json({ likes: await readLikes() });
}

export async function POST(): Promise<Response> {
  return Response.json({ likes: await addLike() });
}

export async function DELETE(): Promise<Response> {
  return Response.json({ likes: await removeLike() });
}
