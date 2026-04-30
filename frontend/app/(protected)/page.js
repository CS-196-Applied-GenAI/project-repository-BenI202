"use client";

import { useEffect, useState } from "react";

import ComposeTweetBox from "../../components/compose-tweet-box";
import EmptyState from "../../components/empty-state";
import ErrorState from "../../components/error-state";
import InfiniteScrollTrigger from "../../components/infinite-scroll-trigger";
import LoadingState from "../../components/loading-state";
import TweetCard from "../../components/tweet-card";
import { useAuth } from "../../contexts/auth-context";
import useInfiniteFeed from "../../hooks/use-infinite-feed";
import * as api from "../../lib/api";

export default function HomePage() {
  const { currentUser } = useAuth();
  const { items, error, hasMore, isLoading, loadMore, refresh } = useInfiniteFeed();
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (items.length === 0) {
      loadMore();
    }
  }, [items.length, loadMore]);

  async function handleCompose(values) {
    setActionError("");
    try {
      await api.createTweet(values);
      await refresh();
    } catch (composeError) {
      setActionError(composeError.message);
      throw composeError;
    }
  }

  async function handleLike(tweet, shouldLike) {
    setActionError("");
    try {
      if (shouldLike) {
        await api.likeTweet(tweet.id);
      } else {
        await api.unlikeTweet(tweet.id);
      }

      await refresh();
    } catch (likeError) {
      setActionError(likeError.message);
    }
  }

  async function handleDelete(tweet) {
    setActionError("");
    try {
      await api.deleteTweet(tweet.id);
      await refresh();
    } catch (deleteError) {
      setActionError(deleteError.message);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <header className="rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[0_24px_80px_rgba(16,32,24,0.08)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Home Feed</p>
        <h1 className="mt-3 text-3xl font-semibold">Welcome back, {currentUser?.name || currentUser?.username}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Follow the latest posts from people you care about and add your own voice with a simple, focused timeline.
        </p>
      </header>

      <ComposeTweetBox onSubmit={handleCompose} />

      {actionError ? <ErrorState title="Action failed" message={actionError} /> : null}
      {error ? <ErrorState title="Could not load feed" message={error} /> : null}

      {isLoading && items.length === 0 ? <LoadingState label="Loading feed" /> : null}

      {!isLoading && items.length === 0 && !error ? (
        <EmptyState
          title="Your feed is quiet"
          message="Create your first tweet or follow someone to start filling this timeline."
        />
      ) : null}

      <div className="flex flex-col gap-4">
        {items.map((tweet) => (
          <TweetCard
            key={tweet.id}
            tweet={tweet}
            canDelete={tweet.author?.id === currentUser?.id}
            onDelete={handleDelete}
            onLike={handleLike}
          />
        ))}
      </div>

      {hasMore ? (
        <div className="pb-8">
          <InfiniteScrollTrigger isLoading={isLoading} onVisible={loadMore} />
        </div>
      ) : null}
    </section>
  );
}
