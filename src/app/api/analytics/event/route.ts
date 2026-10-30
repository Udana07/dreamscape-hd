import { findWallpaper } from "@/server/catalog";
import { recordEvent } from "@/server/analytics";
import { sameOrigin } from "@/server/auth";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  const body = await request.json().catch(() => null) as { slug?: unknown } | null;
  const slug = body?.slug;
  if (typeof slug !== "string" || slug.length > 80 || slug !== "site" && !await findWallpaper(slug)) return new Response(null, { status: 400 });
  await recordEvent("view", slug);
  return new Response(null, { status: 204 });
}
