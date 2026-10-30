import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Download, Image as ImageIcon } from "lucide-react";
import { WallpaperCard } from "@/components/wallpaper-card";
import { getDownloadUrl } from "@/data/wallpapers";
import { findWallpaper, listWallpapers } from "@/server/catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const wallpaper = await findWallpaper(slug);
  if (!wallpaper) return { title: "Wallpaper not found" };
  return { title: wallpaper.title, description: `${wallpaper.description} Explore this ${wallpaper.device} wallpaper on Dreamscape HD.`, openGraph: { title: `${wallpaper.title} | Dreamscape HD`, description: wallpaper.description, ...(process.env.NEXT_PUBLIC_SITE_URL ? { images: [{ url: wallpaper.image, width: wallpaper.width, height: wallpaper.height, alt: wallpaper.title }] } : {}) } };
}

export default async function WallpaperPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const wallpaper = await findWallpaper(slug);
  if (!wallpaper) notFound();
  const downloadUrl = getDownloadUrl(wallpaper.downloadUrl);
  const related = (await listWallpapers()).filter((item) => item.id !== wallpaper.id && item.device === wallpaper.device).sort((a, b) => Number(b.category === wallpaper.category) - Number(a.category === wallpaper.category)).slice(0, 3);
  const backHref = wallpaper.device === "mobile" ? "/mobile" : "/desktop";

  return <div className="mx-auto max-w-[1440px] px-5 pb-24 pt-8 sm:px-8 lg:px-12">
    <Link href={backHref} className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"><ArrowLeft size={17} /> Back to {wallpaper.device} wallpapers</Link>
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
      <div className="flex min-w-0 justify-center">
        <img src={wallpaper.image} alt={`${wallpaper.title}: ${wallpaper.description}`} width={wallpaper.width} height={wallpaper.height} fetchPriority="high" className="block h-auto max-h-[calc(100dvh-180px)] min-h-0 max-w-full rounded-[7px] object-contain" />
      </div>
      <div className="lg:sticky lg:top-28">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600">{wallpaper.device} wallpaper</span>
        <h1 className="mt-3 text-[31px] font-bold leading-tight text-slate-900 sm:text-[38px]">{wallpaper.title}</h1>
        <p className="mt-4 text-sm leading-7 text-slate-500">{wallpaper.description}</p>
        <dl className="mt-8 divide-y divide-slate-200 border-y border-slate-200 text-sm">
          <MetaRow label="Category" value={wallpaper.category} />
          <MetaRow label="Resolution" value={wallpaper.resolution} />
          <MetaRow label="Format" value={wallpaper.format} />
          <MetaRow label="Added" value={new Date(`${wallpaper.uploadedAt}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })} />
        </dl>
        {downloadUrl ? <a href={`/api/download/${wallpaper.slug}`} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"><Download size={18} /> Download wallpaper <ArrowUpRight size={16} /></a> : <div className="mt-8"><span className="inline-flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-md bg-slate-100 px-5 text-sm font-semibold text-slate-400" aria-disabled="true"><Download size={18} /> Download unavailable</span><p className="mt-2.5 text-center text-xs text-slate-500">The original file has not been linked yet.</p></div>}
        <div className="mt-8 flex flex-wrap gap-2">{wallpaper.tags.map((tag) => <span key={tag} className="rounded-md bg-slate-100 px-2.5 py-1.5 text-xs text-slate-500">#{tag}</span>)}</div>
      </div>
    </div>
    <section className="mt-20 border-t border-slate-200 pt-10" aria-labelledby="related-heading"><div className="mb-7 flex items-center gap-2"><ImageIcon size={20} className="text-blue-600" aria-hidden="true" /><h2 id="related-heading" className="text-xl font-bold text-slate-900">Related wallpapers</h2></div><div className={wallpaper.device === "mobile" ? "grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:max-w-[850px]" : "grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3"}>{related.map((item) => <WallpaperCard key={item.id} wallpaper={item} />)}</div></section>
  </div>;
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4 py-3.5"><dt className="text-slate-500">{label}</dt><dd className="font-semibold text-slate-900">{value}</dd></div>;
}
