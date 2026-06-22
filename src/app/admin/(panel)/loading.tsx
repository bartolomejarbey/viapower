export default function AdminLoading() {
  return (
    <div className="p-8">
      <div className="mb-2 h-7 w-52 animate-pulse bg-card" />
      <div className="mb-8 h-4 w-80 max-w-full animate-pulse bg-card/60" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse border border-line-strong bg-card" />
        ))}
      </div>
    </div>
  );
}
