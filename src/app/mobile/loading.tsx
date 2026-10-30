export default function Loading() {
  return <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12" role="status" aria-label="Loading mobile wallpapers"><div className="mb-10 h-12 w-56 animate-pulse rounded bg-slate-100" /><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{Array.from({ length: 5 }, (_, index) => <div key={index} className="aspect-[9/16] animate-pulse rounded-md bg-slate-100" />)}</div><span className="sr-only">Loading wallpapers</span></div>;
}
