"use client";

import { useState } from "react";

export default function ComposeTweetBox({ onSubmit }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const remaining = 240 - text.length;

  return (
    <form
      className="rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[0_24px_80px_rgba(16,32,24,0.08)] backdrop-blur"
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");

        if (!text.trim()) {
          setError("Tweet text is required.");
          return;
        }

        if (text.trim().length > 240) {
          setError("Tweet text must be 240 characters or fewer.");
          return;
        }

        setIsSubmitting(true);
        try {
          await onSubmit({ text: text.trim() });
          setText("");
        } catch (submitError) {
          setError(submitError.message);
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Compose a tweet</h2>
        <span className={`text-xs font-semibold ${remaining < 0 ? "text-red-600" : "text-[var(--muted)]"}`}>{remaining}</span>
      </div>
      <textarea
        className="mt-4 min-h-32 w-full rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-4 text-sm leading-6 outline-none transition focus:border-[var(--accent)]"
        onChange={(event) => setText(event.target.value)}
        placeholder="What is happening today?"
        value={text}
      />
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      <div className="mt-4 flex justify-end">
        <button
          className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)] disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Posting..." : "Post tweet"}
        </button>
      </div>
    </form>
  );
}
