import { isAdmin } from "@/server/auth";
import { getAnalytics } from "@/server/analytics";
import { listWallpapers } from "@/server/catalog";

export async function GET(request: Request) {
  if (!await isAdmin()) return Response.json({ error: "Unauthorized." }, { status: 401 });
  const days = Number(new URL(request.url).searchParams.get("days") || 30);
  if (![7, 30, 90].includes(days)) return Response.json({ error: "Invalid range." }, { status: 400 });
  const wallpapers = await listWallpapers();
  const analytics = await getAnalytics(days, ["site", ...wallpapers.map((item) => item.slug)]);
  return Response.json(analytics, { headers: { "Cache-Control": "no-store" } });
}
