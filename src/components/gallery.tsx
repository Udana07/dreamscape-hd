"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { DeviceType, Wallpaper } from "@/data/wallpapers";
import { WallpaperCard } from "@/components/wallpaper-card";

type Props = { device: DeviceType; wallpapers: Wallpaper[] };

export function Gallery({ device, wallpapers }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const categories = useMemo(() => ["All", ...new Set(wallpapers.map((item) => item.category))], [wallpapers]);
  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();
    return wallpapers.filter((item) =>
      (category === "All" || item.category === category) &&
      (!text || [item.title, item.category, item.description, ...item.tags].some((value) => value.toLowerCase().includes(text)))
    );
  }, [wallpapers, query, category]);

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-2.5 overflow-x-auto pb-1 lg:pb-0" aria-label="Filter by category">
          <SlidersHorizontal size={16} className="mr-1 shrink-0 text-slate-400" aria-hidden="true" />
          {categories.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCategory(option)}
              aria-pressed={category === option}
              className={`shrink-0 rounded-md border px-3.5 py-2 text-xs font-semibold transition-colors ${category === option ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"}`}
            >
              {option}
            </button>
          ))}
        </div>
        <label className="relative block w-full shrink-0 lg:w-[280px]">
          <span className="sr-only">Search {device} wallpapers</span>
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search wallpapers..."
            className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>
      </div>
      <div className="mb-5 mt-6 flex items-center justify-between gap-4 text-xs text-slate-500">
        <span>{visible.length} {visible.length === 1 ? "wallpaper" : "wallpapers"}</span>
        <span>{device === "mobile" ? "Portrait collection" : "Landscape collection"}</span>
      </div>
      {visible.length ? (
        <div className={device === "mobile" ? "grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-5 lg:gap-x-6" : "grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3"}>
          {visible.map((wallpaper, index) => <WallpaperCard key={wallpaper.id} wallpaper={wallpaper} priority={index < (device === "mobile" ? 2 : 1)} />)}
        </div>
      ) : (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 px-5 text-center">
          <Search size={26} strokeWidth={1.5} className="mb-4 text-slate-400" aria-hidden="true" />
          <h2 className="text-base font-semibold text-slate-900">No wallpapers found</h2>
          <p className="mt-1 max-w-sm text-sm text-slate-500">Try another search or category to see more of the collection.</p>
          <button type="button" onClick={() => { setQuery(""); setCategory("All"); }} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
            <X size={16} aria-hidden="true" /> Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
