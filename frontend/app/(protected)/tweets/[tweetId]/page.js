"use client";

import { use, useEffect, useState } from "react";

import EmptyState from "../../../../components/empty-state";
import ErrorState from "../../../../components/error-state";
import LoadingState from "../../../../components/loading-state";
import TweetCard from "../../../../components/tweet-card";
import * as api from "../../../../lib/api";

export default function TweetDetailPage({ params }) {
  const { tweetId } = use(params);
  const [tweet, setTweet] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadTweetDetail() {
    setIsLoading(true);
    setError("");

    try {
      const [tweetData, commentData] = await Promise.all([
        api.getTweet(tweetId),
        api.getTweetComments(tweetId)
      ]);

      setTweet(tweetData.tweet);
      setComments(commentData.comments || []);
    } catch (detailError) {
      setError(detailError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTweetDetail();
  }, [tweetId]);

  if (isLoading) {
    return <LoadingState label="Loading tweet" />;
  }

  if (error) {
    return <ErrorState title="Could not load tweet" message={error} />;
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <TweetCard
        tweet={tweet}
        onLike={async (targetTweet, shouldLike) => {
          if (shouldLike) {
            await api.likeTweet(targetTweet.id);
          } else {
            await api.unlikeTweet(targetTweet.id);
          }

          await loadTweetDetail();
        }}
      />

      <form
        className="rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[0_20px_60px_rgba(16,32,24,0.06)]"
        onSubmit={async (event) => {
          event.preventDefault();
          setIsSubmitting(true);
          setError("");

          try {
            await api.createComment(tweetId, { contents: commentText });
            setCommentText("");
            await loadTweetDetail();
          } catch (commentError) {
            setError(commentError.message);
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <h2 className="text-lg font-semibold">Add a comment</h2>
        <textarea
          className="mt-4 min-h-28 w-full rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-4 text-sm leading-6 outline-none transition focus:border-[var(--accent)]"
          onChange={(event) => setCommentText(event.target.value)}
          placeholder="Join the thread"
          value={commentText}
        />
        <div className="mt-4 flex justify-end">
          <button
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Posting..." : "Post comment"}
          </button>
        </div>
      </form>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Comments</h2>
        {comments.length === 0 ? (
          <EmptyState title="No comments yet" message="Be the first person to respond to this tweet." />
        ) : (
          comments.map((comment) => (
            <article
              className="rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[0_18px_50px_rgba(16,32,24,0.06)]"
              key={comment.id}
            >
              <p className="text-sm font-semibold">{comment.author?.name || comment.author?.username}</p>
              <p className="text-xs text-[var(--muted)]">@{comment.author?.username}</p>
              <p className="mt-3 text-sm leading-7">{comment.contents}</p>
            </article>
          ))
        )}
      </section>
    </section>
  );
}
