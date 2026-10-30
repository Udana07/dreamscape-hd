"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, ArrowDownToLine, ArrowLeft, ArrowUpRight, BarChart3, Check, Images, Loader2, LogOut, Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { Wallpaper } from "@/data/wallpapers";
import { WallpaperEditor } from "@/components/wallpaper-editor";

type Analytics = {
  days: number;
  views: number;
  downloads: number;
  daily: { date: string; views: number; downloads: number }[];
  totals: Record<string, { views: number; downloads: number }>;
};
type Tab = "overview" | "wallpapers" | "analytics";

const inputClass = "block h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const primaryClass = "inline-flex h-9 items-center justify-center gap-2 rounded-md bg-blue-600 px-3.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50";

export function AdminDashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [days, setDays] = useState(30);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const [catalogResponse, analyticsResponse] = await Promise.all([
      fetch("/api/admin/wallpapers", { cache: "no-store" }),
      fetch(`/api/admin/analytics?days=${days}`, { cache: "no-store" }),
    ]);
    if (!catalogResponse.ok || !analyticsResponse.ok) throw new Error("Could not load dashboard data.");
    const catalog = await catalogResponse.json() as { wallpapers: Wallpaper[] };
    setWallpapers(catalog.wallpapers);
    setAnalytics(await analyticsResponse.json() as Analytics);
  }, [days]);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/session", { cache: "no-store" })
      .then((response) => response.json())
      .then((session: { authenticated: boolean; configured: boolean }) => {
        if (!active) return;
        setAuthenticated(session.authenticated);
        setConfigured(session.configured);
        setReady(true);
      })
      .catch(() => { if (active) { setReady(true); setError("Could not connect to the server."); } });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (authenticated) void load().catch((cause: Error) => setError(cause.message));
  }, [authenticated, load]);

  const filtered = useMemo(() => wallpapers.filter((item) =>
    `${item.title} ${item.slug} ${item.category} ${item.device}`.toLowerCase().includes(query.toLowerCase())), [wallpapers, query]);
  const ranked = useMemo(() => [...wallpapers].sort((a, b) =>
    (analytics?.totals[b.slug]?.views ?? 0) - (analytics?.totals[a.slug]?.views ?? 0)), [wallpapers, analytics]);

  async function login(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Sign in failed.");
      setPassword(""); setAuthenticated(true);
    } catch (cause) { setError((cause as Error).message); }
    finally { setBusy(false); }
  }

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    setAuthenticated(false); setWallpapers([]); setAnalytics(null); setTab("overview");
  }

  function openEditor(item?: Wallpaper) {
    setEditing(item?.slug ?? "new"); setError(""); setNotice(""); setTab("wallpapers");
  }

  async function saved(created: boolean) {
    setEditing(null);
    setNotice(created ? "Wallpaper published." : "Wallpaper updated.");
    await load();
    router.refresh();
  }

  async function remove(item: Wallpaper) {
    if (!window.confirm(`Delete ${item.title}? This removes it from the public gallery.`)) return;
    setBusy(true); setError("");
    try {
      const form = new FormData(); form.set("mode", "delete"); form.set("slug", item.slug);
      const response = await fetch("/api/admin/wallpapers", { method: "POST", body: form });
      if (!response.ok) throw new Error((await response.json() as { error: string }).error);
      if (editing === item.slug) setEditing(null);
      setNotice("Wallpaper deleted."); await load(); router.refresh();
    } catch (cause) { setError((cause as Error).message); }
    finally { setBusy(false); }
  }

  if (!ready) return <div className="flex min-h-[65vh] items-center justify-center"><Loader2 className="animate-spin text-blue-600" aria-label="Loading dashboard" /></div>;

  if (!authenticated) return <section className="mx-auto flex min-h-[75vh] max-w-[440px] flex-col justify-center px-5 py-16">
    <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-md bg-blue-600 text-white"><Images size={24} /></div>
    <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Dreamscape HD</p>
    <h1 className="mt-2 text-3xl font-bold text-slate-900">Admin sign in</h1>
    <p className="mt-3 text-sm leading-6 text-slate-500">Manage your wallpaper collection and track its performance.</p>
    <form onSubmit={login} className="mt-8 space-y-4">
      <Field label="Admin password"><input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required className={inputClass} /></Field>
      {!configured && <p className="text-sm text-amber-700">Set DREAMSCAPE_ADMIN_PASSWORD on the server to enable sign in.</p>}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button disabled={busy || !configured} className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{busy ? <Loader2 size={17} className="animate-spin" /> : <ArrowUpRight size={17} />} Sign in</button>
    </form>
    <Link href="/" className="mt-8 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600"><ArrowLeft size={16} /> Back to site</Link>
  </section>;

  return <div className="min-h-[85vh] bg-[#f8fafc]"><div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12">
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
      <div><p className="text-[11px] font-bold uppercase tracking-widest text-blue-600">Workspace</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Dashboard</h1></div>
      <div className="flex items-center gap-2"><Link href="/" className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:text-blue-600"><ArrowUpRight size={15} /> View site</Link><button onClick={logout} type="button" title="Sign out" aria-label="Sign out" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:text-red-600"><LogOut size={16} /></button></div>
    </div>
    <div className="grid gap-8 pt-7 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-12">
      <nav aria-label="Admin sections" className="flex gap-1 border-b border-slate-200 pb-3 lg:flex-col lg:border-0 lg:pb-0">
        {([{ id: "overview", label: "Overview", icon: Activity }, { id: "wallpapers", label: "Wallpapers", icon: Images }, { id: "analytics", label: "Analytics", icon: BarChart3 }] as const).map(({ id, label, icon: Icon }) =>
          <button key={id} type="button" onClick={() => { setTab(id); setEditing(null); }} aria-current={tab === id ? "page" : undefined} className={`flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md px-1 text-xs font-semibold lg:w-full lg:flex-none lg:justify-start lg:gap-3 lg:px-3 lg:text-sm ${tab === id ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:bg-white"}`}><Icon size={16} className="shrink-0" />{label}</button>)}
      </nav>
      <div className="min-w-0 pb-16">
        {notice && <div role="status" className="mb-5 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"><Check size={16} />{notice}</div>}
        {error && <div role="alert" className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {tab === "overview" && <>
          <SectionTitle title="Overview" detail="Collection and visitor activity" action={<button type="button" onClick={() => openEditor()} className={primaryClass}><Plus size={16} /> Add wallpaper</button>} />
          <div className="grid gap-3 sm:grid-cols-3"><Stat label="Wallpapers" value={wallpapers.length} icon={<Images size={18} />} /><Stat label={`Views - ${days} days`} value={analytics?.views ?? 0} icon={<Activity size={18} />} /><Stat label={`Downloads - ${days} days`} value={analytics?.downloads ?? 0} icon={<ArrowDownToLine size={18} />} /></div>
          <div className="mt-10 grid gap-9 xl:grid-cols-2">
            <div><SectionTitle title="Recent wallpapers" detail="Latest additions" />{wallpapers.slice(0, 5).map((item) => <WallpaperRow key={item.slug} item={item} views={analytics?.totals[item.slug]?.views ?? 0} onEdit={() => openEditor(item)} onRemove={() => remove(item)} />)}</div>
            <div><SectionTitle title="Most viewed" detail={`Last ${days} days`} />{ranked.slice(0, 5).map((item, index) => <div key={item.slug} className="flex items-center gap-3 border-b border-slate-200 py-3"><span className="w-5 text-xs font-semibold text-slate-400">{index + 1}</span><img src={item.thumbnail} alt="" className="h-10 w-12 rounded object-cover" /><span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">{item.title}</span><span className="text-xs tabular-nums text-slate-500">{analytics?.totals[item.slug]?.views ?? 0} views</span></div>)}</div>
          </div>
        </>}
        {tab === "wallpapers" && (editing ?
          <WallpaperEditor key={editing} item={wallpapers.find((item) => item.slug === editing)} onClose={() => setEditing(null)} onSaved={saved} /> :
          <><SectionTitle title="Wallpapers" detail={`${wallpapers.length} published images`} action={<button type="button" onClick={() => openEditor()} className={primaryClass}><Plus size={16} /> Add wallpaper</button>} />
            <label className="relative mb-4 block max-w-sm"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} className={`${inputClass} pl-9`} placeholder="Search wallpapers" aria-label="Search wallpapers" /></label>
            <div className="border-t border-slate-200">{filtered.map((item) => <WallpaperRow key={item.slug} item={item} views={analytics?.totals[item.slug]?.views ?? 0} onEdit={() => openEditor(item)} onRemove={() => remove(item)} />)}{!filtered.length && <p className="py-10 text-center text-sm text-slate-500">No wallpapers match your search.</p>}</div>
          </>)}
        {tab === "analytics" && <>
          <SectionTitle title="Analytics" detail="Actual page views and download clicks" action={<select value={days} onChange={(event) => setDays(Number(event.target.value))} className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700" aria-label="Analytics date range"><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option></select>} />
          <div className="grid gap-3 sm:grid-cols-3"><Stat label="Page views" value={analytics?.views ?? 0} icon={<Activity size={18} />} /><Stat label="Downloads" value={analytics?.downloads ?? 0} icon={<ArrowDownToLine size={18} />} /><Stat label="Download rate" value={analytics?.views ? `${((analytics.downloads / analytics.views) * 100).toFixed(1)}%` : "0%"} icon={<BarChart3 size={18} />} /></div>
          <div className="mt-10"><SectionTitle title="Activity over time" detail="Daily views and downloads" /><div className="flex h-48 items-end gap-[3px] border-b border-slate-300 pb-1" aria-label="Daily analytics chart">{analytics?.daily.map((day) => { const max = Math.max(1, ...analytics.daily.map((row) => row.views)); return <div key={day.date} title={`${day.date}: ${day.views} views, ${day.downloads} downloads`} className="flex h-full min-w-0 flex-1 items-end gap-px"><div className="w-1/2 bg-blue-500" style={{ height: `${Math.max(day.views ? 3 : 0, day.views / max * 100)}%` }} /><div className="w-1/2 bg-emerald-500" style={{ height: `${Math.max(day.downloads ? 3 : 0, day.downloads / max * 100)}%` }} /></div>; })}</div><div className="mt-3 flex items-center justify-between text-xs text-slate-500"><span>{analytics?.daily[0]?.date}</span><div className="flex items-center gap-4"><span><i className="mr-1 inline-block h-2 w-2 bg-blue-500" /> Views</span><span><i className="mr-1 inline-block h-2 w-2 bg-emerald-500" /> Downloads</span></div><span>{analytics?.daily.at(-1)?.date}</span></div></div>
          <div className="mt-12"><SectionTitle title="Top wallpapers" detail={`Ranked by views in the last ${days} days`} /><div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500"><tr><th className="py-3">Wallpaper</th><th className="py-3">Type</th><th className="py-3 text-right">Views</th><th className="py-3 text-right">Downloads</th></tr></thead><tbody>{ranked.map((item) => <tr key={item.slug} className="border-b border-slate-200"><td className="flex items-center gap-3 py-3"><img src={item.thumbnail} alt="" className="h-9 w-12 rounded object-cover" /><span className="font-semibold text-slate-800">{item.title}</span></td><td className="py-3 capitalize text-slate-500">{item.device}</td><td className="py-3 text-right tabular-nums">{analytics?.totals[item.slug]?.views ?? 0}</td><td className="py-3 text-right tabular-nums">{analytics?.totals[item.slug]?.downloads ?? 0}</td></tr>)}</tbody></table></div></div>
        </>}
      </div>
    </div>
  </div></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-700">{label}</span>{children}</label>;
}

function SectionTitle({ title, detail, action }: { title: string; detail: string; action?: React.ReactNode }) {
  return <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900">{title}</h2><p className="mt-1 text-xs text-slate-500">{detail}</p></div>{action}</div>;
}

function Stat({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return <div className="rounded-md border border-slate-200 bg-white p-5"><div className="flex items-center justify-between text-slate-500"><span className="text-xs font-semibold">{label}</span>{icon}</div><p className="mt-4 text-2xl font-bold tabular-nums text-slate-900">{typeof value === "number" ? value.toLocaleString() : value}</p></div>;
}

function WallpaperRow({ item, views, onEdit, onRemove }: { item: Wallpaper; views: number; onEdit: () => void; onRemove: () => void }) {
  return <div className="flex min-w-0 items-center gap-3 border-b border-slate-200 py-3"><img src={item.thumbnail} alt="" className="h-12 w-16 shrink-0 rounded object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{item.title}</p><p className="mt-0.5 truncate text-xs text-slate-500">{item.category} - {item.device} - {views} views</p></div><button type="button" onClick={onEdit} title={`Edit ${item.title}`} aria-label={`Edit ${item.title}`} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-white hover:text-blue-600"><Pencil size={16} /></button><button type="button" onClick={onRemove} title={`Delete ${item.title}`} aria-label={`Delete ${item.title}`} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-white hover:text-red-600"><Trash2 size={16} /></button></div>;
}
