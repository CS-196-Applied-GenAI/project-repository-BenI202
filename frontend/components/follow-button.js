"use client";

import { useState } from "react";

export default function FollowButton({ initiallyFollowing = false, onFollowChange }) {
  const [isFollowing, setIsFollowing] = useState(initiallyFollowing);
  const [isBusy, setIsBusy] = useState(false);

  return (
    <button
      className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)] disabled:opacity-60"
      disabled={isBusy}
      onClick={async () => {
        setIsBusy(true);
        try {
          const nextValue = !isFollowing;
          await onFollowChange(nextValue);
          setIsFollowing(nextValue);
        } finally {
          setIsBusy(false);
        }
      }}
      type="button"
    >
      {isBusy ? "Working..." : isFollowing ? "Unfollow" : "Follow"}
    </button>
  );
}
