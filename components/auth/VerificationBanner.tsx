// PLACE AT: components/auth/VerificationBanner.tsx
// Drop this inside your layout or Navbar — shows only when user is logged in but unverified

"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { X } from "lucide-react";

export default function VerificationBanner() {
  const { user, userLoggedIn } = useAuth();
  const [sent,      setSent]      = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [loading,   setLoading]   = useState(false);

  // Only show for logged-in, unverified credential users
  const showBanner =
    userLoggedIn &&
    user &&
    !(user as any).emailVerified &&
    !dismissed;

  if (!showBanner) return null;

  const resend = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/resend-verification", { method: "POST" });
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
        <span>📧</span>
        {sent ? (
          <span>Verification email sent — check your inbox (and spam folder).</span>
        ) : (
          <span>
            Your email address isn&apos;t verified yet.{" "}
            <button
              onClick={resend}
              disabled={loading}
              className="underline font-semibold hover:no-underline disabled:opacity-60"
            >
              {loading ? "Sending…" : "Resend verification email"}
            </button>
          </span>
        )}
      </div>
      <button onClick={() => setDismissed(true)} className="text-amber-400 hover:text-amber-600 flex-shrink-0">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}