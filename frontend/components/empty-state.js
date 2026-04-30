export default function EmptyState({ title, message }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-[var(--line)] bg-white/70 p-8 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{message}</p>
    </div>
  );
}
