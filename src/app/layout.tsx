import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { ViewTracker } from "@/components/view-tracker";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Dreamscape HD | Beautiful Wallpapers", template: "%s | Dreamscape HD" },
  description: "Discover beautiful wallpapers for your phone and desktop. Explore nature, ocean, botanical, and abstract collections at Dreamscape HD.",
  applicationName: "Dreamscape HD",
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="min-h-screen antialiased"><SiteHeader /><ViewTracker /><main>{children}</main><footer className="border-t border-slate-200 py-8"><div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12"><span className="font-semibold text-slate-800">Dreamscape HD</span><span>Beautiful backgrounds for every screen.</span></div></footer></body></html>;
}
