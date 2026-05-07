"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import EmptyState from "../../../../components/empty-state";
import ErrorState from "../../../../components/error-state";
import LoadingState from "../../../../components/loading-state";
import ProfileHeader from "../../../../components/profile-header";
import TweetCard from "../../../../components/tweet-card";
import { useAuth } from "../../../../contexts/auth-context";
import * as api from "../../../../lib/api";

const PAGE_SIZE = 20;

export default function UserProfilePage({ params }) {
  const { currentUser } = useAuth();
  const { username } = use(params);
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(false);

  async function loadProfileData({ append = false, nextOffset = 0 } = {}) {
    const [profileData, tweetsData] = await Promise.all([
      api.getUserProfile(username),
      api.getUserTweets(username, { limit: PAGE_SIZE, offset: nextOffset })
    ]);
    const nextTweets = tweetsData.tweets || [];

    setProfile(profileData.user);
    setTweets((currentTweets) => (append ? [...currentTweets, ...nextTweets] : nextTweets));
    setOffset(nextOffset + PAGE_SIZE);
    setHasMore(nextTweets.length === PAGE_SIZE);
  }

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      setIsLoading(true);
      setError("");

      try {
        if (!ignore) {
          await loadProfileData({ append: false, nextOffset: 0 });
        }
      } catch (profileError) {
        if (!ignore) {
          setError(profileError.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      ignore = true;
    };
  }, [username]);

  async function loadMoreTweets() {
    setIsLoadingMore(true);
    try {
      await loadProfileData({ append: true, nextOffset: offset });
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoadingMore(false);
    }
  }

  async function handleLike(tweet, shouldLike) {
    setError("");
    try {
      if (shouldLike) {
        await api.likeTweet(tweet.id);
      } else {
        await api.unlikeTweet(tweet.id);
      }

      await loadProfileData({ append: false, nextOffset: 0 });
    } catch (actionError) {
      setError(actionError.message);
    }
  }

  async function handleRetweet(tweet, shouldRetweet) {
    setError("");
    try {
      if (shouldRetweet) {
        await api.retweetTweet(tweet.id);
      } else {
        await api.unretweetTweet(tweet.id);
      }

      await loadProfileData({ append: false, nextOffset: 0 });
    } catch (actionError) {
      setError(actionError.message);
    }
  }

  async function handleDelete(tweet) {
    setError("");
    try {
      await api.deleteTweet(tweet.id);
      await loadProfileData({ append: false, nextOffset: 0 });
    } catch (actionError) {
      setError(actionError.message);
    }
  }

  async function handleBlock() {
    setError("");
    try {
      await api.blockUser(profile.username);
      router.replace("/");
    } catch (blockError) {
      setError(blockError.message);
    }
  }

  if (isLoading) {
    return <LoadingState label="Loading profile" />;
  }

  if (error) {
    return <ErrorState title="Could not load profile" message={error} />;
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <ProfileHeader
        currentUsername={currentUser?.username}
        initiallyBlocked={profile.viewerHasBlocked}
        onBlock={handleBlock}
        onFollowChange={async (shouldFollow) => {
          setError("");

          try {
            if (shouldFollow) {
              await api.followUser(profile.username);
            } else {
              await api.unfollowUser(profile.username);
            }

            setProfile((currentProfile) =>
              currentProfile
                ? {
                    ...currentProfile,
                    viewerIsFollowing: shouldFollow
                  }
                : currentProfile
            );
          } catch (followError) {
            setError(followError.message);
            throw followError;
          }
        }}
        profile={profile}
      />

      {tweets.length === 0 ? (
        <EmptyState title="No tweets yet" message="This profile has not posted anything yet." />
      ) : (
        <div className="flex flex-col gap-4">
          {tweets.map((tweet) => (
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
      )}

      {hasMore ? (
        <div className="flex justify-center">
          <button
            className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)]"
            onClick={loadMoreTweets}
            type="button"
          >
            {isLoadingMore ? "Loading..." : "Load more tweets"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
