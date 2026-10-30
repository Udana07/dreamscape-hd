export default function Loading() {
  return <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12" role="status" aria-label="Loading desktop wallpapers"><div className="mb-10 h-12 w-64 animate-pulse rounded bg-slate-100" /><div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="aspect-[16/10] animate-pulse rounded-md bg-slate-100" />)}</div><span className="sr-only">Loading wallpapers</span></div>;
}
