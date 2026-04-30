"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "../contexts/auth-context";

const links = [
  { href: "/", label: "Feed" },
  { href: "/profile/edit", label: "Edit Profile" }
];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[0_24px_80px_rgba(16,32,24,0.08)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Chirper</p>
          <div className="mt-4">
            <h2 className="text-xl font-semibold">{currentUser?.name || currentUser?.username}</h2>
            <p className="text-sm text-[var(--muted)]">@{currentUser?.username}</p>
          </div>

          <nav className="mt-8 flex flex-col gap-2">
            {links.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                    isActive ? "bg-[var(--accent)] text-white" : "bg-white text-[var(--ink)] hover:bg-[var(--accent-soft)]"
                  }`}
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                </Link>
              );
            })}
            {currentUser?.username ? (
              <Link
                className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                  pathname === `/users/${currentUser.username}`
                    ? "bg-[var(--accent)] text-white"
                    : "bg-white text-[var(--ink)] hover:bg-[var(--accent-soft)]"
                }`}
                href={`/users/${currentUser.username}`}
              >
                My Profile
              </Link>
            ) : null}
          </nav>

          <button
            className="mt-8 w-full rounded-full border border-[var(--line)] bg-transparent px-4 py-3 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--sage)]"
            onClick={async () => {
              await logout();
              router.replace("/login");
            }}
            type="button"
          >
            Log out
          </button>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}
