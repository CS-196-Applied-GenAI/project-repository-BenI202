"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ErrorState from "../../../../components/error-state";
import { useAuth } from "../../../../contexts/auth-context";
import * as api from "../../../../lib/api";

export default function EditProfilePage() {
  const router = useRouter();
  const { currentUser, refreshSession, setCurrentUser } = useAuth();
  const [name, setName] = useState(currentUser?.name || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [profilePicture, setProfilePicture] = useState(currentUser?.profilePicture || "");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  return (
    <section className="mx-auto w-full max-w-2xl rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[0_24px_80px_rgba(16,32,24,0.08)] backdrop-blur">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Profile</p>
      <h1 className="mt-3 text-3xl font-semibold">Edit your profile</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Update the basics and keep the account simple.</p>

      {error ? <div className="mt-5"><ErrorState title="Could not save profile" message={error} /></div> : null}

      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setIsSaving(true);
          setError("");

          try {
            const data = await api.updateProfile({
              name,
              bio,
              profilePicture
            });
            setCurrentUser(data.user);
            await refreshSession();
            router.push(`/users/${data.user.username}`);
          } catch (saveError) {
            setError(saveError.message);
          } finally {
            setIsSaving(false);
          }
        }}
      >
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold">Name</span>
          <input
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
            onChange={(event) => setName(event.target.value)}
            value={name}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold">Bio</span>
          <textarea
            className="min-h-28 rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
            onChange={(event) => setBio(event.target.value)}
            value={bio}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold">Profile picture URL</span>
          <input
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
            onChange={(event) => setProfilePicture(event.target.value)}
            value={profilePicture}
          />
        </label>

        <div className="flex justify-end">
          <button
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)] disabled:opacity-60"
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </section>
  );
}
