import { readBytes } from "@/server/storage";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string; variant: string }> }) {
  const { slug, variant } = await params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !/^[a-z0-9]+-(full|thumb)$/.test(variant)) return new Response(null, { status: 404 });
  const data = await readBytes("dreamscape-images", `${slug}/${variant}`);
  if (!data) return new Response(null, { status: 404 });
  return new Response(Buffer.from(data), { headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
}
