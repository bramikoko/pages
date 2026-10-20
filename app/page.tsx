import Portfolio from "@/components/portfolio";
import { getRepoFeed } from "@/lib/repos";

export default async function Home() {
  const feed = await getRepoFeed();

  return <Portfolio feed={feed} />;
}
