"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import AuthForm from "../../../components/auth-form";
import { useAuth } from "../../../contexts/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login, status } = useAuth();
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
        <h1 className="mt-3 text-3xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Use your account to get back to your feed.</p>
        <AuthForm
          buttonLabel="Log in"
          error={error}
          fields={[
            { name: "username", label: "Username", type: "text" },
            { name: "password", label: "Password", type: "password" }
          ]}
          onSubmit={async (values) => {
            setError("");
            try {
              await login(values);
              router.replace("/");
            } catch (loginError) {
              setError(loginError.message);
            }
          }}
        />
        <p className="mt-5 text-sm text-[var(--muted)]">
          Need an account?{" "}
          <Link className="font-semibold text-[var(--accent-deep)]" href="/signup">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
