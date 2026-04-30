export default function LoadingState({ label = "Loading" }) {
  return (
    <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--card)] px-6 py-8 text-center shadow-[0_20px_60px_rgba(16,32,24,0.06)]">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent-soft)] border-t-[var(--accent)]" />
      <p className="mt-4 text-sm font-semibold text-[var(--muted)]">{label}...</p>
    </div>
  );
}
