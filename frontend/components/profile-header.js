"use client";

import Link from "next/link";

import FollowButton from "./follow-button";

export default function ProfileHeader({ currentUsername, onFollowChange, profile }) {
  const isCurrentUser = currentUsername === profile.username;

  return (
    <header className="rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[0_24px_80px_rgba(16,32,24,0.08)] backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Profile</p>
          <h1 className="mt-3 text-3xl font-semibold">{profile.name || profile.username}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">@{profile.username}</p>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--ink)]">{profile.bio || "This user has not added a bio yet."}</p>
        </div>

        <div className="flex gap-3">
          {isCurrentUser ? (
            <Link
              className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)]"
              href="/profile/edit"
            >
              Edit profile
            </Link>
          ) : (
            <FollowButton onFollowChange={onFollowChange} />
          )}
        </div>
      </div>
    </header>
  );
}
