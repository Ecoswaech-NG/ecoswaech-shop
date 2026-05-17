// PLACE AT: context/AuthContext.tsx — replaces existing
// Only change: AuthUser now includes emailVerified

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthUser {
  id:            string;
  email:         string;
  fullName:      string;
  emailVerified: boolean;
  photoURL?:     string | null;
}

interface AuthContextValue {
  user:         AuthUser | null;
  userLoggedIn: boolean;
  loading:      boolean;
  login:        (email: string, password: string) => Promise<void>;
  register:     (email: string, password: string, fullName: string) => Promise<void>;
  logout:       () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.user) setUser(data.user); })
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res  = await fetch("/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Login failed");
    setUser(data.user);
    router.push("/home");
  }

  async function register(email: string, password: string, fullName: string) {
    const res  = await fetch("/api/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Registration failed");
    setUser(data.user);
    router.push("/home");
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, userLoggedIn: !!user, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}