import { HomeContent } from "@/components/home-content";
import { listWallpapers } from "@/server/catalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return <HomeContent wallpapers={await listWallpapers()} />;
}
