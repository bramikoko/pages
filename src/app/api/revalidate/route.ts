import { revalidatePath, revalidateTag } from "next/cache";

// called by /admin after every save or delete so the public page picks
// up database changes immediately instead of waiting for the 60-second
// cache to expire on its own. no secret needed: this only busts the
// cache so it re-reads public data.
export async function POST() {
  // expire: 0 → the next request waits for fresh data instead of
  // serving stale content — read-your-own-writes from the admin
  revalidateTag("content", { expire: 0 });
  revalidatePath("/");
  return Response.json({ revalidated: true, at: Date.now() });
}
