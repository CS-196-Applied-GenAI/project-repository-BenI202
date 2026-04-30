"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import * as api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [status, setStatus] = useState("loading");
  const [currentUser, setCurrentUser] = useState(null);

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
    await api.logout();
    setCurrentUser(null);
    setStatus("unauthenticated");
  }, []);

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
