"use client";

import { use, useEffect, useState } from "react";

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
  const [profile, setProfile] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      setIsLoading(true);
      setError("");

      try {
        const [profileData, tweetsData] = await Promise.all([
          api.getUserProfile(username),
          api.getUserTweets(username, { limit: PAGE_SIZE, offset: 0 })
        ]);

        if (!ignore) {
          setProfile(profileData.user);
          setTweets(tweetsData.tweets || []);
          setOffset(PAGE_SIZE);
          setHasMore((tweetsData.tweets || []).length === PAGE_SIZE);
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
      const data = await api.getUserTweets(username, { limit: PAGE_SIZE, offset });
      const nextTweets = data.tweets || [];
      setTweets((currentTweets) => [...currentTweets, ...nextTweets]);
      setOffset((currentOffset) => currentOffset + PAGE_SIZE);
      setHasMore(nextTweets.length === PAGE_SIZE);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoadingMore(false);
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
        onFollowChange={(shouldFollow) =>
          shouldFollow ? api.followUser(profile.username) : api.unfollowUser(profile.username)
        }
        profile={profile}
      />

      {tweets.length === 0 ? (
        <EmptyState title="No tweets yet" message="This profile has not posted anything yet." />
      ) : (
        <div className="flex flex-col gap-4">
          {tweets.map((tweet) => (
            <TweetCard key={tweet.id} tweet={tweet} />
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
