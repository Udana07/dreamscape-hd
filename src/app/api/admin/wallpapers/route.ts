import { randomUUID } from "node:crypto";
import { isAdmin, sameOrigin } from "@/server/auth";
import { findWallpaper, listWallpapers, removeWallpaper, saveWallpaper } from "@/server/catalog";
import { getDownloadUrl, getImageUrl, type Wallpaper } from "@/data/wallpapers";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const fail = (error: string, status = 400) => Response.json({ error }, { status });

export async function GET() {
  if (!await isAdmin()) return fail("Unauthorized.", 401);
  return Response.json({ wallpapers: await listWallpapers() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!await isAdmin()) return fail("Unauthorized.", 401);
  if (!sameOrigin(request)) return fail("Invalid origin.", 403);
  try {
    const form = await request.formData();
    const mode = form.get("mode");
    const slug = String(form.get("slug") ?? "").trim();
    if (!slugPattern.test(slug) || slug.length > 80) return fail("Use a lowercase slug with hyphens only.");
    if (mode === "delete") {
      if (!await findWallpaper(slug)) return fail("Wallpaper not found.", 404);
      await removeWallpaper(slug);
      return Response.json({ ok: true });
    }
    const creating = mode === "create";
    if (!creating && mode !== "update") return fail("Invalid action.");
    const original = creating ? null : await findWallpaper(slug);
    if (!creating && !original) return fail("Wallpaper not found.", 404);
    const title = String(form.get("title") ?? "").trim();
    const category = String(form.get("category") ?? "").trim();
    const device = form.get("device");
    const description = String(form.get("description") ?? "").trim();
    const tags = String(form.get("tags") ?? "").split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean).slice(0, 12);
    const downloadUrlValue = String(form.get("downloadUrl") ?? "").trim();
    const downloadUrl = downloadUrlValue ? getDownloadUrl(downloadUrlValue) : null;
    const trending = form.get("trending") === "true";
    if (!title || title.length > 100 || !category || category.length > 40 || !description || description.length > 500) return fail("Check title, category and description lengths.");
    if (device !== "mobile" && device !== "desktop") return fail("Choose mobile or desktop.");
    if (downloadUrlValue && !downloadUrl) return fail("Enter a valid HTTPS Google Drive URL.");
    const imageUrlValue = String(form.get("imageUrl") ?? "").trim();
    const imageUrl = imageUrlValue ? getImageUrl(imageUrlValue) : null;
    if (imageUrlValue && !imageUrl) return fail("Enter a direct HTTPS image URL.");
    if (creating && !imageUrl) return fail("Enter a direct image URL.");
    let image = original?.image ?? "";
    let thumbnail = original?.thumbnail ?? "";
    let width = original?.width ?? 0;
    let height = original?.height ?? 0;
    let format = original?.format ?? "WebP";
    if (imageUrl && imageUrl !== original?.image) {
      width = Number(form.get("width"));
      height = Number(form.get("height"));
      if (!Number.isInteger(width) || !Number.isInteger(height) || width < 400 || height < 400 || width > 12000 || height > 12000) return fail("Image dimensions could not be verified.");
      if (device === "mobile" && width >= height || device === "desktop" && width <= height) return fail(`Choose a ${device === "mobile" ? "portrait" : "landscape"} image.`);
      image = imageUrl;
      thumbnail = imageUrl;
      const extension = new URL(imageUrl).pathname.split(".").at(-1)?.toLowerCase();
      format = ({ jpg: "JPEG", jpeg: "JPEG", png: "PNG", webp: "WebP", avif: "AVIF", gif: "GIF" } as Record<string, string>)[extension ?? ""] ?? "Image";
    }
    if (device === "mobile" && width >= height || device === "desktop" && width <= height) return fail(`Choose a ${device === "mobile" ? "portrait" : "landscape"} image.`);
    const item: Wallpaper = {
      id: original?.id ?? randomUUID(), slug, title, category, device, description, tags,
      image, thumbnail, width, height, resolution: `${width} x ${height}`, format,
      downloadUrl, uploadedAt: original?.uploadedAt ?? new Date().toISOString().slice(0, 10), trending,
    };
    await saveWallpaper(item, creating);
    return Response.json({ wallpaper: item });
  } catch (error) {
    if (error instanceof Error && error.message.includes("slug")) return fail(error.message, 409);
    return fail(error instanceof Error ? error.message : "Could not save wallpaper.", 500);
  }
}
