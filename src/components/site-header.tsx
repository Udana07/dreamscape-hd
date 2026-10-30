"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/mobile", label: "Mobile Wallpapers" },
  { href: "/desktop", label: "Desktop Wallpapers" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href="/" className="text-[19px] font-extrabold tracking-tight text-slate-900 sm:text-[21px]">
          Dreamscape <span className="text-blue-600">HD</span>
        </Link>
        <nav aria-label="Main navigation" className="hidden h-full items-center gap-9 md:flex">
          {links.map((link) => {
            const active = pathname === link.href || pathname === `${link.href}/`;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex h-full items-center text-[13px] font-semibold transition-colors hover:text-blue-600 ${active ? "text-blue-600 after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-blue-600" : "text-slate-600"}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-slate-800 transition-colors hover:bg-slate-100 md:hidden"
        >
          {open ? <X size={23} strokeWidth={1.8} /> : <Menu size={23} strokeWidth={1.8} />}
        </button>
      </div>
      {open && (
        <nav id="mobile-navigation" aria-label="Mobile navigation" className="border-t border-slate-100 bg-white px-5 pb-4 pt-2 md:hidden">
          {links.map((link) => {
            const active = pathname === link.href || pathname === `${link.href}/`;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={`block rounded-md px-3 py-3 text-sm font-semibold ${active ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-50"}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
