import "server-only";
import { listKeys, readJSON, writeJSON } from "@/server/storage";

export type EventKind = "view" | "download";
type Counts = { views: number; downloads: number };
const STORE = "dreamscape-analytics";

export async function recordEvent(kind: EventKind, slug: string) {
  const date = new Date().toISOString().slice(0, 10);
  const key = `${date}/${slug}`;
  for (let attempt = 0; attempt < 10; attempt++) {
    const { data, etag } = await readJSON<Counts>(STORE, key);
    const next = { views: data?.views ?? 0, downloads: data?.downloads ?? 0 };
    if (kind === "view") next.views++;
    else next.downloads++;
    if (await writeJSON(STORE, key, next, etag)) return;
  }
  throw new Error("Could not record analytics event.");
}

export async function getAnalytics(days: number, slugs: string[]) {
  const dates = Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - (days - 1 - index));
    return date.toISOString().slice(0, 10);
  });
  const totals: Record<string, Counts> = Object.fromEntries(slugs.map((slug) => [slug, { views: 0, downloads: 0 }]));
  const daily = await Promise.all(dates.map(async (date) => {
    const keys = (await listKeys(STORE, `${date}/`)).filter((key) => Object.hasOwn(totals, key.slice(date.length + 1)));
    const entries = await Promise.all(keys.map(async (key) => ({ slug: key.slice(date.length + 1), data: (await readJSON<Counts>(STORE, key)).data })));
    const row = { date, views: 0, downloads: 0 };
    entries.forEach(({ slug, data }) => {
      const views = data?.views ?? 0;
      const downloads = data?.downloads ?? 0;
      row.views += views;
      row.downloads += downloads;
      totals[slug].views += views;
      totals[slug].downloads += downloads;
    });
    return row;
  }));
  return { days, daily, totals, views: daily.reduce((sum, row) => sum + row.views, 0), downloads: daily.reduce((sum, row) => sum + row.downloads, 0) };
}
