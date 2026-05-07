"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function TweetCard({ canDelete = false, onDelete, onLike, onRetweet, tweet }) {
  const [liked, setLiked] = useState(Boolean(tweet.viewerHasLiked));
  const [retweeted, setRetweeted] = useState(Boolean(tweet.viewerHasRetweeted));
  const isRetweet = Boolean(tweet.originalTweet);
  const displayTweet = isRetweet ? tweet.originalTweet : tweet;

  useEffect(() => {
    setLiked(Boolean(tweet.viewerHasLiked));
    setRetweeted(Boolean(tweet.viewerHasRetweeted));
  }, [tweet.viewerHasLiked, tweet.viewerHasRetweeted]);

  return (
    <article className="rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[0_18px_50px_rgba(16,32,24,0.06)] backdrop-blur">
      {isRetweet ? (
        <p className="mb-3 text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
          Retweeted by{" "}
          <Link className="text-[var(--accent-deep)]" href={`/users/${tweet.author?.username}`}>
            @{tweet.author?.username}
          </Link>
        </p>
      ) : null}

      <div className="flex items-start justify-between gap-4">
        <div>
          <Link className="text-base font-semibold" href={`/users/${displayTweet.author?.username}`}>
            {displayTweet.author?.name || displayTweet.author?.username}
          </Link>
          <p className="text-sm text-[var(--muted)]">
            <Link href={`/users/${displayTweet.author?.username}`}>@{displayTweet.author?.username}</Link>
          </p>
        </div>
        <Link className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent-deep)]" href={`/tweets/${tweet.id}`}>
          View
        </Link>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[var(--ink)]">{displayTweet.text || "Retweet"}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {onLike ? (
          <button
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              liked ? "bg-[var(--accent)] text-white" : "bg-white text-[var(--ink)]"
            }`}
            onClick={async () => {
              await onLike(tweet, !liked);
              setLiked((currentValue) => !currentValue);
            }}
            type="button"
          >
            {liked ? "Unlike" : "Like"}
          </button>
        ) : null}

        {onRetweet ? (
          <button
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              retweeted ? "bg-[#1d2f27] text-white" : "bg-white text-[var(--ink)]"
            }`}
            onClick={async () => {
              await onRetweet(tweet, !retweeted);
              setRetweeted((currentValue) => !currentValue);
            }}
            type="button"
          >
            {retweeted ? "Unretweet" : "Retweet"}
          </button>
        ) : null}

        <Link className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)]" href={`/tweets/${tweet.id}`}>
          Comments
        </Link>

        <Link className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)]" href={`/tweets/${tweet.id}/reply`}>
          Reply
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
