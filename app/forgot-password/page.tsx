// PLACE AT: app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email,     setEmail]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [sent,      setSent]      = useState(false);
  const [error,     setError]     = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res  = await fetch("/api/auth/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#010409] flex items-center justify-center p-6 font-mono">
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(88,166,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(88,166,255,0.03) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }} />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#1f6feb]/10 border border-[#1f6feb]/30 rounded-full px-3 py-1 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#58a6ff]" />
            <span className="text-[#58a6ff] text-xs tracking-widest">ECOSWAP · PASSWORD RESET</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Forgot password?</h1>
          <p className="text-[#8b949e] text-sm mt-1">
            {sent ? "Check your email" : "Enter your email and we'll send a reset link"}
          </p>
        </div>

        <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-6 shadow-2xl">
          {sent ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#238636]/20 border border-[#238636]/40 flex items-center justify-center mx-auto text-3xl">
                ✉️
              </div>
              <p className="text-white font-medium">Reset link sent!</p>
              <p className="text-[#8b949e] text-sm">
                If <span className="text-white">{email}</span> is registered, you'll receive a reset link within a few minutes.
              </p>
              <p className="text-[#484f58] text-xs">Check your spam folder if you don't see it.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-xs">⚠ {error}</div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#8b949e] uppercase tracking-widest">Email</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" required autoComplete="email"
                  className="w-full bg-[#0d1117] border border-[#30363d] text-white placeholder-[#484f58] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all"
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#1f6feb] hover:bg-[#388bfd] disabled:opacity-50 text-white py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2">
                {loading ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</> : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[#8b949e] text-xs mt-6">
          Remember your password?{" "}
          <Link href="/login" className="text-[#58a6ff] hover:text-white transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}