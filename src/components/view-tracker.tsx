"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function ViewTracker() {
  const path = usePathname();
  const last = useRef("");
  useEffect(() => {
    if (last.current === path || path.startsWith("/admin")) return;
    last.current = path;
    const slug = path.startsWith("/wallpaper/") ? path.split("/")[2] : ["/", "/mobile", "/desktop"].includes(path.replace(/\/$/, "") || "/") ? "site" : null;
    if (slug) void fetch("/api/analytics/event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug }), keepalive: true }).catch(() => {});
  }, [path]);
  return null;
}
