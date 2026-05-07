"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import ComposeTweetBox from "../../../../components/compose-tweet-box";
import ErrorState from "../../../../components/error-state";
import * as api from "../../../../lib/api";

export default function NewTweetPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(values) {
    setError("");

    try {
      await api.createTweet(values);
      router.replace("/");
    } catch (submitError) {
      setError(submitError.message);
      throw submitError;
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <header className="rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[0_24px_80px_rgba(16,32,24,0.08)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">New Tweet</p>
        <h1 className="mt-3 text-3xl font-semibold">Create a new post</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          This dedicated page covers the posting flow separately from the home feed.
        </p>
      </header>

      {error ? <ErrorState title="Could not create tweet" message={error} /> : null}

      <ComposeTweetBox
        buttonLabel="Publish tweet"
        onSubmit={handleSubmit}
        placeholder="Share an update with your feed."
        title="Author a tweet"
      />
    </section>
  );
}
