"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import AppShell from "./app-shell";
import LoadingState from "./loading-state";
import { useAuth } from "../contexts/auth-context";

export default function ProtectedAppLayout({ children }) {
  const router = useRouter();
  const { isAuthenticated, status } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  if (status === "loading" || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <LoadingState label="Checking your session" />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
