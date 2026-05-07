import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-xl rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-8 text-center shadow-[0_24px_80px_rgba(16,32,24,0.08)]">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">404</p>
        <h1 className="mt-4 text-3xl font-semibold">That page does not exist</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          The path may be incorrect, or the page may have moved.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
            href="/login"
          >
            Go to login
          </Link>
          <Link
            className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)]"
            href="/"
          >
            Try feed
          </Link>
        </div>
      </section>
    </main>
  );
}
