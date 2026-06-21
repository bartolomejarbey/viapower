export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center bg-base" aria-busy="true" aria-label="Načítání">
      <div className="flex flex-col items-center gap-5">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-line-strong border-t-red" />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-dim">Načítám…</span>
      </div>
    </main>
  );
}
