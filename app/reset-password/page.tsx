// PLACE AT: app/reset-password/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get("token") ?? "";

  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [done,      setDone]      = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters"); return; }
    if (!token)                { setError("Invalid reset link"); return; }

    setLoading(true);
    try {
      const res  = await fetch("/api/auth/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Reset failed");
      setDone(true);
      setTimeout(() => router.push("/home"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-6 space-y-3">
        <p className="text-red-400 text-sm">Invalid or missing reset token.</p>
        <Link href="/forgot-password" className="text-[#58a6ff] text-sm hover:underline">Request a new link</Link>
      </div>
    );
  }

  return done ? (
    <div className="text-center py-4 space-y-3">
      <div className="w-16 h-16 rounded-full bg-[#238636]/20 border border-[#238636]/40 flex items-center justify-center mx-auto text-3xl">✓</div>
      <p className="text-white font-medium">Password updated!</p>
      <p className="text-[#8b949e] text-sm">Redirecting you to the app…</p>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-xs">⚠ {error}</div>
      )}
      {[
        { label: "New Password",      value: password, setter: setPassword, placeholder: "Min 8 characters",    ac: "new-password"     },
        { label: "Confirm Password",  value: confirm,  setter: setConfirm,  placeholder: "Repeat your password", ac: "new-password"    },
      ].map(({ label, value, setter, placeholder, ac }) => (
        <div key={label} className="space-y-1.5">
          <label className="text-xs font-medium text-[#8b949e] uppercase tracking-widest">{label}</label>
          <input
            type="password" value={value} onChange={(e) => setter(e.target.value)}
            placeholder={placeholder} autoComplete={ac} required
            className="w-full bg-[#0d1117] border border-[#30363d] text-white placeholder-[#484f58] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all"
          />
        </div>
      ))}
      <button type="submit" disabled={loading}
        className="w-full bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2">
        {loading ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating…</> : "Set New Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#010409] flex items-center justify-center p-6 font-mono">
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(88,166,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(88,166,255,0.03) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }} />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#238636]/10 border border-[#238636]/30 rounded-full px-3 py-1 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]" />
            <span className="text-[#3fb950] text-xs tracking-widest">ECOSWAP · NEW PASSWORD</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Set new password</h1>
          <p className="text-[#8b949e] text-sm mt-1">Choose a strong password for your account</p>
        </div>

        <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-6 shadow-2xl">
          <Suspense fallback={<div className="h-40 animate-pulse bg-[#21262d] rounded-lg" />}>
            <ResetForm />
          </Suspense>
        </div>

        <p className="text-center text-[#8b949e] text-xs mt-6">
          <Link href="/login" className="text-[#58a6ff] hover:text-white transition-colors">← Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}