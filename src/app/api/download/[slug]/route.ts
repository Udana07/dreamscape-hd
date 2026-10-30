import { findWallpaper } from "@/server/catalog";
import { getDownloadUrl } from "@/data/wallpapers";
import { recordEvent } from "@/server/analytics";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const wallpaper = await findWallpaper(slug);
  const url = wallpaper && getDownloadUrl(wallpaper.downloadUrl);
  if (!url) return new Response("Download unavailable", { status: 404 });
  await recordEvent("download", slug);
  return Response.redirect(url, 302);
}
