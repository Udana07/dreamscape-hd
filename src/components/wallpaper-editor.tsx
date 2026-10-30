"use client";

import { useState } from "react";
import { Check, Image as ImageIcon, Loader2, X } from "lucide-react";
import type { DeviceType, Wallpaper } from "@/data/wallpapers";

type Draft = {
  slug: string;
  title: string;
  category: string;
  device: DeviceType;
  description: string;
  tags: string;
  imageUrl: string;
  downloadUrl: string;
  trending: boolean;
};

type Props = {
  item?: Wallpaper;
  onClose: () => void;
  onSaved: (created: boolean) => Promise<void>;
};

const inputClass = "block h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100";
const buttonClass = "inline-flex h-9 items-center justify-center gap-2 rounded-md bg-blue-600 px-3.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50";

export function WallpaperEditor({ item, onClose, onSaved }: Props) {
  const [draft, setDraft] = useState<Draft>({
    slug: item?.slug ?? "",
    title: item?.title ?? "",
    category: item?.category ?? "Nature",
    device: item?.device ?? "desktop",
    description: item?.description ?? "",
    tags: item?.tags.join(", ") ?? "",
    imageUrl: item?.image.startsWith("https://") ? item.image : "",
    downloadUrl: item?.downloadUrl ?? "",
    trending: Boolean(item?.trending),
  });
  const [imageState, setImageState] = useState<"idle" | "loading" | "ready" | "error">(item ? "ready" : "idle");
  const [dimensions, setDimensions] = useState({ width: item?.width ?? 0, height: item?.height ?? 0 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const previewUrl = draft.imageUrl || item?.image || "";
  const changedImage = Boolean(draft.imageUrl && draft.imageUrl !== item?.image);
  const needsImage = !item || changedImage;
  const wrongOrientation = imageState === "ready" && needsImage &&
    (draft.device === "mobile" ? dimensions.width >= dimensions.height : dimensions.width <= dimensions.height);

  function updateImageUrl(value: string) {
    setDraft((current) => ({ ...current, imageUrl: value.trim() }));
    setImageState(value ? "loading" : "idle");
    setDimensions({ width: 0, height: 0 });
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (needsImage && imageState !== "ready") { setError("Paste a direct image URL that loads in the preview."); return; }
    if (wrongOrientation) { setError(`Choose a ${draft.device === "mobile" ? "portrait" : "landscape"} image.`); return; }
    setBusy(true);
    try {
      const form = new FormData();
      form.set("mode", item ? "update" : "create");
      for (const [key, value] of Object.entries(draft)) form.set(key, String(value));
      form.set("width", String(dimensions.width));
      form.set("height", String(dimensions.height));
      const response = await fetch("/api/admin/wallpapers", { method: "POST", body: form });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not save wallpaper.");
      await onSaved(!item);
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return <>
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div><h2 className="text-lg font-bold text-slate-900">{item ? "Edit wallpaper" : "Add wallpaper"}</h2><p className="mt-1 text-xs text-slate-500">{item ? `Editing ${item.slug}` : "Publish a new image to the collection"}</p></div>
      <button type="button" onClick={onClose} className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"><X size={16} /> Close</button>
    </div>
    {error && <p role="alert" className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    <form onSubmit={save} className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Title"><input value={draft.title} maxLength={100} required onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value, slug: item ? current.slug : event.target.value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") }))} className={inputClass} /></Field>
        <Field label="Slug"><input value={draft.slug} required maxLength={80} pattern="[a-z0-9]+(-[a-z0-9]+)*" disabled={Boolean(item)} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} className={inputClass} /></Field>
        <Field label="Category"><input value={draft.category} required maxLength={40} onChange={(event) => setDraft({ ...draft, category: event.target.value })} className={inputClass} /></Field>
        <Field label="Screen type"><select value={draft.device} onChange={(event) => setDraft({ ...draft, device: event.target.value as DeviceType })} className={inputClass}><option value="desktop">Desktop</option><option value="mobile">Mobile</option></select></Field>
        <div className="sm:col-span-2"><Field label="Description"><textarea value={draft.description} required maxLength={500} rows={3} onChange={(event) => setDraft({ ...draft, description: event.target.value })} className={inputClass} /></Field></div>
        <div className="sm:col-span-2"><Field label="Tags (comma-separated)"><input value={draft.tags} onChange={(event) => setDraft({ ...draft, tags: event.target.value })} className={inputClass} placeholder="nature, mountain, sunrise" /></Field></div>
        <div className="sm:col-span-2"><Field label="Google Drive download URL (optional)"><input type="url" value={draft.downloadUrl} onChange={(event) => setDraft({ ...draft, downloadUrl: event.target.value })} className={inputClass} placeholder="https://drive.google.com/..." /></Field><p className="mt-1.5 text-xs text-slate-500">Only Google Drive links are accepted. Without one, downloads are unavailable.</p></div>
        <div className="sm:col-span-2"><label className="flex items-center gap-3 text-sm font-medium text-slate-700"><input type="checkbox" checked={draft.trending} onChange={(event) => setDraft({ ...draft, trending: event.target.checked })} className="h-4 w-4 accent-blue-600" /> Feature in Trending</label></div>
        <div className="flex flex-wrap gap-2 sm:col-span-2"><button type="submit" disabled={busy || needsImage && (imageState !== "ready" || wrongOrientation)} className={buttonClass}>{busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}{item ? "Save changes" : "Publish wallpaper"}</button><button type="button" onClick={onClose} className="inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600">Cancel</button></div>
      </div>
      <div className="order-first xl:order-last">
        <Field label="Direct image URL"><input type="url" value={draft.imageUrl} required={!item} onChange={(event) => updateImageUrl(event.target.value)} className={inputClass} placeholder="https://i.ibb.co/.../wallpaper.jpg" /></Field>
        <div className="relative mt-3 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white">
          {previewUrl ? <img key={previewUrl} src={previewUrl} alt="Wallpaper preview" onLoad={(event) => { setDimensions({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight }); setImageState("ready"); }} onError={() => setImageState("error")} className="h-full w-full object-contain" /> : <div className="text-center text-slate-400"><ImageIcon size={28} className="mx-auto" /><span className="mt-3 block text-xs">Image preview</span></div>}
        </div>
        {imageState === "ready" && dimensions.width > 0 && <p className={`mt-2 text-xs ${wrongOrientation ? "text-red-600" : "text-slate-500"}`}>{dimensions.width} x {dimensions.height} px{wrongOrientation ? ` - choose a ${draft.device === "mobile" ? "portrait" : "landscape"} image` : ""}</p>}
        {imageState === "error" && <p className="mt-2 text-xs text-red-600">This link did not load as an image. Copy the direct image URL, not the viewer page.</p>}
        {item && !draft.imageUrl && <p className="mt-2 text-xs text-slate-500">Leave blank to keep the current image.</p>}
      </div>
    </form>
  </>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-700">{label}</span>{children}</label>;
}
