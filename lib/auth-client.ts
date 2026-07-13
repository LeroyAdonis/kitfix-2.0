"use client";

import { useState, useEffect } from "react";

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  banned: boolean;
  banReason: string | null;
  banExpires: Date | null;
}

interface Session {
  user: SessionUser;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    createdAt: Date;
    updatedAt: Date;
    ipAddress: string | null;
    userAgent: string | null;
    impersonatedBy: string | null;
  };
}

interface UseSessionResult {
  data: Session | null;
  isPending: boolean;
  error?: Error;
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function fetchSession(): Promise<Session | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/get-session`, { credentials: "include" });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.user) return null;
    return data as Session;
  } catch {
    return null;
  }
}

export function useSession(): UseSessionResult {
  const [data, setData] = useState<Session | null>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchSession().then((session) => {
      if (!cancelled) {
        setData(session);
        setIsPending(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  return { data, isPending };
}

export interface SignInResult {
  error?: string;
  data?: { token: string; user: SessionUser };
}

export async function signIn(input: { email: string; password: string }): Promise<SignInResult> {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Sign in failed" };
    // Return token directly from API — cookie may not be committed yet
    return { data: { token: data.token, user: data.user } };
  } catch {
    return { error: "Network error" };
  }
}

export interface SignUpResult {
  error?: string;
  data?: { token: string; user: SessionUser };
}

export async function signUp(input: { email: string; password: string; name: string }): Promise<SignUpResult> {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Sign up failed" };
    return { data: { token: data.token, user: data.user } };
  } catch {
    return { error: "Network error" };
  }
}

export async function signOut(_options?: { fetchOptions?: { onSuccess?: () => void } }): Promise<void> {
  // Clear via server endpoint for reliable httpOnly cookie removal
  try {
    await fetch(`${BASE_URL}/api/auth/sign-out`, {
      method: "GET",
      credentials: "include",
    });
  } catch {
    // Fallback: clear cookie client-side
    document.cookie = "better-auth.session_token=; path=/; max-age=0;";
    document.cookie = "better-auth.session_token=; path=/; domain=.kitfix-2-0.vercel.app; max-age=0;";
  }
  window.location.href = "/sign-in";
}
