"use client";

import Link from "next/link";
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
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsError, setSuggestionsError] = useState("");

  useEffect(() => {
    if (items.length === 0) {
      loadMore();
    }
  }, [items.length, loadMore]);

  useEffect(() => {
    let ignore = false;

    async function loadSuggestions() {
      try {
        const data = await api.getSuggestedUsers({ limit: 4 });

        if (!ignore) {
          setSuggestions(data.users || []);
        }
      } catch (suggestionError) {
        if (!ignore) {
          setSuggestionsError(suggestionError.message);
        }
      }
    }

    loadSuggestions();

    return () => {
      ignore = true;
    };
  }, []);

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

  async function handleRetweet(tweet, shouldRetweet) {
    setActionError("");
    try {
      if (shouldRetweet) {
        await api.retweetTweet(tweet.id);
      } else {
        await api.unretweetTweet(tweet.id);
      }

      await refresh();
    } catch (retweetError) {
      setActionError(retweetError.message);
    }
  }

  async function handleFollowSuggestion(username, shouldFollow) {
    setActionError("");

    try {
      if (shouldFollow) {
        await api.followUser(username);
      } else {
        await api.unfollowUser(username);
      }

      setSuggestions((currentSuggestions) =>
        shouldFollow
          ? currentSuggestions.filter((user) => user.username !== username)
          : currentSuggestions
      );
      await refresh();
    } catch (followError) {
      setActionError(followError.message);
      throw followError;
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
        <div className="mt-5">
          <Link
            className="inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
            href="/tweets/new"
          >
            Open dedicated post page
          </Link>
        </div>
      </header>

      <ComposeTweetBox onSubmit={handleCompose} />

      {actionError ? <ErrorState title="Action failed" message={actionError} /> : null}
      {error ? <ErrorState title="Could not load feed" message={error} /> : null}
      {suggestionsError ? <ErrorState title="Could not load suggestions" message={suggestionsError} /> : null}

      {suggestions.length > 0 ? (
        <section className="rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[0_18px_50px_rgba(16,32,24,0.06)] backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Suggested Users</p>
              <h2 className="mt-2 text-xl font-semibold">Find people to follow</h2>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {suggestions.map((user) => (
              <div
                className="flex flex-col gap-3 rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                key={user.id}
              >
                <div>
                  <Link className="text-sm font-semibold" href={`/users/${user.username}`}>
                    {user.name || user.username}
                  </Link>
                  <p className="text-xs text-[var(--muted)]">@{user.username}</p>
                  <p className="mt-1 text-sm text-[var(--ink)]">{user.bio || "No bio yet."}</p>
                </div>
                <button
                  className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)]"
                  onClick={() => handleFollowSuggestion(user.username, true)}
                  type="button"
                >
                  Follow
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

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
            onRetweet={handleRetweet}
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
