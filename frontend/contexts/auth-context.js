"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import * as api from "../lib/api";

const AuthContext = createContext(null);
export const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

export function AuthProvider({ children }) {
  const [status, setStatus] = useState("loading");
  const [currentUser, setCurrentUser] = useState(null);
  const inactivityTimerRef = useRef(null);

  const clearSession = useCallback(() => {
    setCurrentUser(null);
    setStatus("unauthenticated");
  }, []);

  const refreshSession = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await api.getCurrentUser();
      setCurrentUser(data.user);
      setStatus("authenticated");
      return data.user;
    } catch {
      setCurrentUser(null);
      setStatus("unauthenticated");
      return null;
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = useCallback(async (credentials) => {
    const data = await api.login(credentials);
    setCurrentUser(data.user);
    setStatus("authenticated");
    return data.user;
  }, []);

  const signup = useCallback(async (payload) => {
    const data = await api.signup(payload);
    setCurrentUser(data.user);
    setStatus("authenticated");
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    if (status !== "authenticated") {
      if (inactivityTimerRef.current) {
        window.clearTimeout(inactivityTimerRef.current);
      }

      return undefined;
    }

    const resetTimer = () => {
      if (inactivityTimerRef.current) {
        window.clearTimeout(inactivityTimerRef.current);
      }

      inactivityTimerRef.current = window.setTimeout(async () => {
        try {
          await api.logout();
        } catch {
          // Clear the client session even if the network request fails.
        } finally {
          clearSession();
        }
      }, INACTIVITY_TIMEOUT_MS);
    };

    const activityEvents = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    resetTimer();

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetTimer, { passive: true });
    });

    return () => {
      if (inactivityTimerRef.current) {
        window.clearTimeout(inactivityTimerRef.current);
      }

      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetTimer);
      });
    };
  }, [clearSession, status]);

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: status === "authenticated",
      login,
      logout,
      refreshSession,
      setCurrentUser,
      signup,
      status
    }),
    [currentUser, login, logout, refreshSession, signup, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
