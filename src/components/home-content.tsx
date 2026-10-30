"use client";

import Link from "next/link";
import { ArrowRight, Monitor, Search, Smartphone, X } from "lucide-react";
import { useMemo, useState } from "react";
import { WallpaperCard } from "@/components/wallpaper-card";
import type { Wallpaper } from "@/data/wallpapers";

export function HomeContent({ wallpapers }: { wallpapers: Wallpaper[] }) {
  const [query, setQuery] = useState("");
  const trimmed = query.trim().toLowerCase();
  const results = useMemo(() => trimmed ? wallpapers.filter((item) => [item.title, item.category, item.device, item.description, ...item.tags].some((value) => value.toLowerCase().includes(trimmed))) : [], [trimmed]);
  const trending = wallpapers.filter((item) => item.trending).slice(0, 3);
  const latest = wallpapers.slice(0, 4);

  return (
    <>
      <section className="mx-auto max-w-[1440px] px-5 pb-10 pt-10 sm:px-8 sm:pb-12 sm:pt-12 lg:px-12">
        <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between md:gap-10">
          <div className="min-w-0">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600">Dreamscape HD collection</p>
            <h1 className="text-[32px] font-bold leading-tight text-slate-900 sm:text-[40px]">Wallpapers for every screen</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-[15px]">Browse HD and 4K backgrounds for mobile and desktop.</p>
          </div>
          <label className="relative block w-full shrink-0 md:max-w-[360px]">
            <span className="sr-only">Search all wallpapers</span>
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search wallpapers"
              className="h-12 w-full rounded-[7px] border border-slate-200 bg-white pl-11 pr-11 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-800"><X size={17} /></button>}
          </label>
        </div>
      </section>

      {trimmed ? (
        <section className="mx-auto max-w-[1440px] px-5 pb-24 sm:px-8 lg:px-12" aria-live="polite">
          <div className="mb-7 flex items-end justify-between gap-4 border-b border-slate-200 pb-5">
            <div><h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Search results</h2><p className="mt-1 text-sm text-slate-500">{results.length} {results.length === 1 ? "wallpaper" : "wallpapers"} for &ldquo;{query.trim()}&rdquo;</p></div>
          </div>
          {results.length ? <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">{results.map((item) => <WallpaperCard key={item.id} wallpaper={item} compact />)}</div> : <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-5 py-20 text-center"><h3 className="font-semibold text-slate-900">No wallpapers found</h3><p className="mt-2 text-sm text-slate-500">Try a different title, subject, or category.</p></div>}
        </section>
      ) : (
        <>
          <section className="mx-auto max-w-[1440px] px-5 pb-14 sm:px-8 lg:px-12" aria-labelledby="trending-heading">
            <SectionHeading title="Trending Wallpapers" id="trending-heading" description="Featured from the collection." />
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">{trending.map((item, index) => <WallpaperCard key={item.id} wallpaper={item} priority={index === 0} compact />)}</div>
          </section>
          <section className="bg-slate-50 py-14" aria-labelledby="latest-heading">
            <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
              <SectionHeading title="Latest Wallpapers" id="latest-heading" description="Recently added backgrounds." />
              <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">{latest.map((item) => <WallpaperCard key={item.id} wallpaper={item} compact />)}</div>
            </div>
          </section>
          <section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12" aria-labelledby="explore-heading">
            <div className="mb-7"><h2 id="explore-heading" className="text-xl font-bold text-slate-900 sm:text-2xl">Browse by screen</h2></div>
            <div className="grid gap-5 md:grid-cols-2">
              <CategoryLink href="/mobile" title="Mobile Wallpapers" description="Art made for the screen in your hand." image="/wallpapers/forest-passage-thumb.webp" icon={<Smartphone size={22} strokeWidth={1.7} />} />
              <CategoryLink href="/desktop" title="Desktop Wallpapers" description="Bring a new view to your workspace." image="/wallpapers/coastal-light-thumb.webp" icon={<Monitor size={22} strokeWidth={1.7} />} />
            </div>
          </section>
        </>
      )}
    </>
  );
}

function SectionHeading({ title, id, description }: { title: string; id: string; description: string }) {
  return <div className="mb-7"><h2 id={id} className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h2><p className="mt-1.5 text-sm text-slate-500">{description}</p></div>;
}

function CategoryLink({ href, title, description, image, icon }: { href: string; title: string; description: string; image: string; icon: React.ReactNode }) {
  return <Link href={href} className="group flex min-w-0 items-center gap-4 rounded-[7px] border border-slate-200 bg-white p-3 transition-colors hover:border-blue-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:gap-5 sm:p-4"><span className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded bg-slate-100"><img src={image} alt="" loading="lazy" className="h-full w-full object-contain" /></span><span className="min-w-0 flex-1"><span className="mb-2 flex items-center gap-2 text-slate-500">{icon}</span><span className="block text-base font-bold text-slate-900 sm:text-lg">{title}</span><span className="mt-1 block text-xs leading-5 text-slate-500 sm:text-sm">{description}</span></span><ArrowRight size={20} className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" aria-hidden="true" /></Link>;
}
