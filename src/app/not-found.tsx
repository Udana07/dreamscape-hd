import Link from "next/link";

export default function NotFound() {
  return <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-5 py-20 text-center"><p className="text-sm font-bold text-blue-600">404</p><h1 className="mt-3 text-3xl font-bold text-slate-900">Wallpaper not found</h1><p className="mt-3 text-sm leading-6 text-slate-500">That wallpaper may have moved. There are plenty more views to explore.</p><Link href="/" className="mt-7 rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">Back to homepage</Link></section>;
}
