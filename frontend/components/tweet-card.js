"use client";

import Link from "next/link";
import { useState } from "react";

export default function TweetCard({ canDelete = false, onDelete, onLike, tweet }) {
  const [liked, setLiked] = useState(false);
  const isRetweet = Boolean(tweet.originalTweet);
  const displayTweet = isRetweet ? tweet.originalTweet : tweet;

  return (
    <article className="rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[0_18px_50px_rgba(16,32,24,0.06)] backdrop-blur">
      {isRetweet ? (
        <p className="mb-3 text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Retweeted by @{tweet.author?.username}</p>
      ) : null}

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold">{displayTweet.author?.name || displayTweet.author?.username}</p>
          <p className="text-sm text-[var(--muted)]">@{displayTweet.author?.username}</p>
        </div>
        <Link className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent-deep)]" href={`/tweets/${tweet.id}`}>
          View
        </Link>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[var(--ink)]">{displayTweet.text || "Retweet"}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            liked ? "bg-[var(--accent)] text-white" : "bg-white text-[var(--ink)]"
          }`}
          onClick={async () => {
            await onLike?.(tweet, !liked);
            setLiked((currentValue) => !currentValue);
          }}
          type="button"
        >
          {liked ? "Unlike" : "Like"}
        </button>

        <Link className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)]" href={`/tweets/${tweet.id}`}>
          Comments
        </Link>

        {canDelete ? (
          <button
            className="rounded-full bg-[#1d2f27] px-4 py-2 text-sm font-semibold text-white"
            onClick={() => onDelete?.(tweet)}
            type="button"
          >
            Delete
          </button>
        ) : null}
      </div>
    </article>
  );
}
