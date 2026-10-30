import type { Metadata } from "next";
import { Gallery } from "@/components/gallery";
import { listWallpapers } from "@/server/catalog";

export const metadata: Metadata = {
  title: "Desktop Wallpapers",
  description: "Browse landscape wallpapers for desktop and laptop screens, including nature, ocean, and abstract imagery.",
};

export const dynamic = "force-dynamic";

export default async function DesktopPage() {
  return <section className="mx-auto min-h-[70vh] max-w-[1440px] px-5 pb-24 pt-12 sm:px-8 sm:pt-16 lg:px-12"><div className="mb-10 max-w-2xl"><p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">The collection</p><h1 className="text-[34px] font-bold leading-tight text-slate-900 sm:text-[44px]">Desktop Wallpapers</h1><p className="mt-3 text-[15px] leading-7 text-slate-500">Thoughtful landscapes and abstract views to make every workspace feel a little more yours.</p></div><Gallery device="desktop" wallpapers={(await listWallpapers()).filter((item) => item.device === "desktop")} /></section>;
}
