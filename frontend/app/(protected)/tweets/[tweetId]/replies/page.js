"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import EmptyState from "../../../../../components/empty-state";
import ErrorState from "../../../../../components/error-state";
import LoadingState from "../../../../../components/loading-state";
import TweetCard from "../../../../../components/tweet-card";
import * as api from "../../../../../lib/api";

export default function RepliesPage({ params }) {
  const { tweetId } = use(params);
  const [tweet, setTweet] = useState(null);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadRepliesPage() {
      setIsLoading(true);
      setError("");

      try {
        const [tweetData, commentData] = await Promise.all([
          api.getTweet(tweetId),
          api.getTweetComments(tweetId)
        ]);

        if (!ignore) {
          setTweet(tweetData.tweet);
          setComments(commentData.comments || []);
        }
      } catch (replyError) {
        if (!ignore) {
          setError(replyError.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadRepliesPage();

    return () => {
      ignore = true;
    };
  }, [tweetId]);

  if (isLoading) {
    return <LoadingState label="Loading replies" />;
  }

  if (error) {
    return <ErrorState title="Could not load replies" message={error} />;
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <header className="rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[0_24px_80px_rgba(16,32,24,0.08)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Replies</p>
        <h1 className="mt-3 text-3xl font-semibold">View the full reply thread</h1>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)]"
            href={`/tweets/${tweetId}`}
          >
            Back to tweet
          </Link>
          <Link
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
            href={`/tweets/${tweetId}/reply`}
          >
            Add reply
          </Link>
        </div>
      </header>

      <TweetCard tweet={tweet} />

      {comments.length === 0 ? (
        <EmptyState title="No replies yet" message="There are no replies on this tweet yet." />
      ) : (
        <div className="flex flex-col gap-4">
          {comments.map((comment) => (
            <article
              className="rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[0_18px_50px_rgba(16,32,24,0.06)]"
              key={comment.id}
            >
              <Link className="text-sm font-semibold" href={`/users/${comment.author?.username}`}>
                {comment.author?.name || comment.author?.username}
              </Link>
              <p className="text-xs text-[var(--muted)]">
                <Link href={`/users/${comment.author?.username}`}>@{comment.author?.username}</Link>
              </p>
              <p className="mt-3 text-sm leading-7">{comment.contents}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
