import Link from "next/link";
import type { Wallpaper } from "@/data/wallpapers";

type Props = { wallpaper: Wallpaper; priority?: boolean; compact?: boolean };

export function WallpaperCard({ wallpaper, priority = false, compact = false }: Props) {
  return (
    <Link href={`/wallpaper/${wallpaper.slug}`} className={`group block min-w-0 ${compact ? "text-center" : ""}`} aria-label={`View ${wallpaper.title} wallpaper`}>
      <div className={`relative overflow-hidden ${compact ? "aspect-square" : wallpaper.device === "mobile" ? "aspect-[9/16]" : "aspect-[16/10]"}`}>
        <img
          src={wallpaper.thumbnail}
          srcSet={wallpaper.thumbnail === wallpaper.image ? undefined : `${wallpaper.thumbnail} ${wallpaper.device === "mobile" ? "520" : "840"}w, ${wallpaper.image} ${wallpaper.width}w`}
          sizes={wallpaper.device === "mobile" && !compact ? "(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 18vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
          alt={`${wallpaper.title}: ${wallpaper.description}`}
          width={wallpaper.width}
          height={wallpaper.height}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
          className="h-full w-full rounded-[7px] object-contain"
        />
      </div>
      <div className={`flex min-w-0 items-start gap-2 pt-3 ${compact ? "justify-center" : "justify-between"}`}>
        <div className="min-w-0">
          <h3 className="truncate text-[13px] font-semibold text-slate-900 sm:text-sm">{wallpaper.title}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{wallpaper.category}</p>
        </div>
        {!compact && <span className="shrink-0 pt-0.5 text-[11px] font-medium text-slate-400">{wallpaper.device === "mobile" ? "9:16" : "16:9"}</span>}
      </div>
    </Link>
  );
}
