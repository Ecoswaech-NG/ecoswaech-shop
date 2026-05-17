// PLACE AT: app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import OAuthButtons from "@/components/auth/OAuthButtons";

export default function LoginPage() {
  const { login }   = useAuth();
  const router      = useRouter();
  const searchParams = useSearchParams();
  const redirect    = searchParams.get("redirect") ?? "/home";

  const [form,    setForm]    = useState({ email: "", password: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Both fields are required."); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      router.push(redirect);
    } catch (err: any) {
      setError(err.message ?? "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-[#0d1117] border border-[#30363d] text-white placeholder-[#484f58] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all duration-200";

  return (
    <div className="min-h-screen bg-[#010409] flex items-center justify-center p-6 font-mono">
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(88,166,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(88,166,255,0.03) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }} />
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(31,111,235,0.07) 0%, transparent 70%)" }} />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#1f6feb]/10 border border-[#1f6feb]/30 rounded-full px-3 py-1 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#58a6ff] animate-pulse" />
            <span className="text-[#58a6ff] text-xs tracking-widest">ECOSWAECH · SIGN IN</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
          <p className="text-[#8b949e] text-sm mt-1">Sign in to your ECOSWAECH account</p>
        </div>

        <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-6 shadow-2xl space-y-5">

          {/* Credentials form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-xs">⚠ {error}</div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#8b949e] uppercase tracking-widest">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="you@example.com" autoComplete="email" className={inputCls} />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#8b949e] uppercase tracking-widest">Password</label>
                <Link href="/forgot-password" className="text-xs text-[#58a6ff] hover:text-white transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input name="password" type="password" value={form.password} onChange={handleChange}
                placeholder="••••••••" autoComplete="current-password" className={inputCls} />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#0b0db6] hover:bg-[#1b0481] disabled:opacity-50 text-white py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2">
              {loading
                ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</>
                : "Sign In →"}
            </button>

             {/* OAuth buttons */}
          <OAuthButtons />
          </form>
        </div>

        <p className="text-center text-[#8b949e] text-xs mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#58a6ff] hover:text-white transition-colors">Create one</Link>
        </p>
      </div>
    </div>
  );
}