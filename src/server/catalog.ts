import "server-only";
import { wallpapers, type Wallpaper } from "@/data/wallpapers";
import { readJSON, writeJSON } from "@/server/storage";

type Overrides = Record<string, Wallpaper | null>;
const STORE = "dreamscape-catalog";
const KEY = "records";

export async function listWallpapers(): Promise<Wallpaper[]> {
  const { data } = await readJSON<Overrides>(STORE, KEY);
  const merged = new Map(wallpapers.map((item) => [item.slug, item]));
  for (const [slug, item] of Object.entries(data ?? {})) {
    if (item) merged.set(slug, item);
    else merged.delete(slug);
  }
  return [...merged.values()].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt) || a.title.localeCompare(b.title));
}

export async function findWallpaper(slug: string) {
  return (await listWallpapers()).find((item) => item.slug === slug) ?? null;
}

export async function saveWallpaper(item: Wallpaper, creating: boolean) {
  for (let attempt = 0; attempt < 8; attempt++) {
    const { data, etag } = await readJSON<Overrides>(STORE, KEY);
    const exists = (data && Object.hasOwn(data, item.slug) ? data[item.slug] : wallpapers.find((entry) => entry.slug === item.slug)) ?? null;
    if (creating && exists) throw new Error("This slug is already in use.");
    if (!creating && !exists) throw new Error("Wallpaper not found.");
    if (await writeJSON(STORE, KEY, { ...data, [item.slug]: item }, etag)) return;
  }
  throw new Error("The catalog is busy. Please try again.");
}

export async function removeWallpaper(slug: string) {
  for (let attempt = 0; attempt < 8; attempt++) {
    const { data, etag } = await readJSON<Overrides>(STORE, KEY);
    if (await writeJSON(STORE, KEY, { ...data, [slug]: null }, etag)) return;
  }
  throw new Error("The catalog is busy. Please try again.");
}
