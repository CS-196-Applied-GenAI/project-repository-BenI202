"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ErrorState from "../../../../../components/error-state";
import LoadingState from "../../../../../components/loading-state";
import TweetCard from "../../../../../components/tweet-card";
import * as api from "../../../../../lib/api";

export default function ReplyPage({ params }) {
  const { tweetId } = use(params);
  const router = useRouter();
  const [tweet, setTweet] = useState(null);
  const [contents, setContents] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadTweet() {
      setIsLoading(true);
      setError("");

      try {
        const data = await api.getTweet(tweetId);

        if (!ignore) {
          setTweet(data.tweet);
        }
      } catch (tweetError) {
        if (!ignore) {
          setError(tweetError.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadTweet();

    return () => {
      ignore = true;
    };
  }, [tweetId]);

  if (isLoading) {
    return <LoadingState label="Loading reply target" />;
  }

  if (error) {
    return <ErrorState title="Could not open reply page" message={error} />;
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <header className="rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[0_24px_80px_rgba(16,32,24,0.08)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Reply</p>
        <h1 className="mt-3 text-3xl font-semibold">Reply to this tweet</h1>
        <div className="mt-4">
          <Link className="text-sm font-semibold text-[var(--accent-deep)]" href={`/tweets/${tweet.id}/replies`}>
            Go to replies page
          </Link>
        </div>
      </header>

      <TweetCard tweet={tweet} />

      <form
        className="rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[0_20px_60px_rgba(16,32,24,0.06)]"
        onSubmit={async (event) => {
          event.preventDefault();
          setIsSubmitting(true);
          setError("");

          try {
            await api.createComment(tweetId, { contents });
            router.replace(`/tweets/${tweetId}/replies`);
          } catch (replyError) {
            setError(replyError.message);
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <h2 className="text-lg font-semibold">Write your reply</h2>
        <textarea
          className="mt-4 min-h-28 w-full rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-4 text-sm leading-6 outline-none transition focus:border-[var(--accent)]"
          onChange={(event) => setContents(event.target.value)}
          placeholder="Add your reply"
          value={contents}
        />
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        <div className="mt-4 flex justify-end">
          <button
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Posting..." : "Post reply"}
          </button>
        </div>
      </form>
    </section>
  );
}
