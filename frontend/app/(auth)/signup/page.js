"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import AuthForm from "../../../components/auth-form";
import { useAuth } from "../../../contexts/auth-context";

export default function SignupPage() {
  const router = useRouter();
  const { signup, status } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [router, status]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-8 shadow-[0_24px_80px_rgba(16,32,24,0.08)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Chirper</p>
        <h1 className="mt-3 text-3xl font-semibold">Create account</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Join the conversation with a lightweight Chirper profile.</p>
        <AuthForm
          buttonLabel="Sign up"
          error={error}
          fields={[
            { name: "name", label: "Name", type: "text" },
            { name: "username", label: "Username", type: "text" },
            { name: "email", label: "Email", type: "email" },
            { name: "password", label: "Password", type: "password" }
          ]}
          onSubmit={async (values) => {
            setError("");
            try {
              await signup(values);
              router.replace("/");
            } catch (signupError) {
              setError(signupError.message);
            }
          }}
        />
        <p className="mt-5 text-sm text-[var(--muted)]">
          Already have an account?{" "}
          <Link className="font-semibold text-[var(--accent-deep)]" href="/login">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
