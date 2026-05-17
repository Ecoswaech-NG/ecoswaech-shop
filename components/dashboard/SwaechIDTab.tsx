"use client";
// PLACE AT: components/dashboard/SwaechIDTab.tsx

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ShieldCheck, ShieldOff, Wallet, Car, Zap, ArrowUpRight,
  ArrowDownLeft, RefreshCw, FileText, Clock, CheckCircle2,
  XCircle, AlertCircle, Copy, Check, TrendingUp, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface SwaechSummary {
  id:                   string;
  swaechTag:            string;
  isVerified:           boolean;
  verificationLevel:    "none" | "basic" | "verified" | "premium";
  walletBalance:        number;
  trustScore:           number;
  trustEmailVerified:   boolean;
  trustVerifiedBattery: boolean;
  trustIsDealer:        boolean;
  trustHasTransactions: boolean;
  trustCompletedSales:  boolean;
  recentTrustLogs:      TrustLog[];
  createdAt:            string;
}

interface TrustLog {
  action: string; delta: number; reason: string; newScore: number; createdAt: string;
}

interface Transaction {
  id: string; amount: number; type: string; status: string;
  category: string; description: string | null; reference: string | null; createdAt: string;
}

interface SwaechVehicle {
  id: string; make: string; model: string; year: number;
  vin: string | null; status: string; addedAt: string;
}

type TabId = "overview" | "wallet" | "garage" | "battery" | "transactions" | "trust";

// ─── Shared helpers ────────────────────────────────────────────────────────────

function fmt(date: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .format(new Date(date));
}

const GRADE_COLOR: Record<string, string> = {
  A: "#3fb950", B: "#58a6ff", C: "#d29922", D: "#f85149",
};

const LEVEL_CONFIG = {
  none:     { label: "Unverified",  color: "#484f58", bg: "#21262d"         },
  basic:    { label: "Basic",       color: "#d29922", bg: "rgba(210,153,34,0.12)" },
  verified: { label: "Verified",    color: "#3fb950", bg: "rgba(63,185,80,0.12)"  },
  premium:  { label: "Premium",     color: "#58a6ff", bg: "rgba(88,166,255,0.12)" },
};

// ─── Trust ring ────────────────────────────────────────────────────────────────

function TrustRing({ score }: { score: number }) {
  const r    = 40;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 70 ? "#3fb950" : score >= 40 ? "#d29922" : "#f85149";

  return (
    <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#21262d"  strokeWidth="10" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color}    strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }} />
      </svg>
      <div className="text-center">
        <p className="text-xl font-black" style={{ color }}>{score}</p>
        <p className="text-[9px] text-gray-500 uppercase tracking-widest">Trust</p>
      </div>
    </div>
  );
}

// ─── Tag copy ──────────────────────────────────────────────────────────────────

function TagCopy({ tag }: { tag: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(tag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="group flex items-center gap-2 hover:opacity-80 transition-opacity">
      <span className="font-mono font-black text-lg tracking-widest text-white">{tag}</span>
      {copied
        ? <Check className="w-3 h-3 text-green-400" />
        : <Copy  className="w-3 h-3 text-gray-600 group-hover:text-gray-400 transition-colors" />}
    </button>
  );
}

// ─── Trust factor pill ─────────────────────────────────────────────────────────

function Factor({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border ${
      active
        ? "border-green-500/30 bg-green-500/10 text-green-400"
        : "border-[#30363d] bg-[#161b22] text-gray-600"
    }`}>
      {active
        ? <CheckCircle2 className="w-3 h-3" />
        : <XCircle      className="w-3 h-3" />}
      {label}
    </div>
  );
}

// ─── Identity card (shared header) ────────────────────────────────────────────

function IdentityCard({ s, onRefresh, refreshing }: {
  s: SwaechSummary;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const level  = LEVEL_CONFIG[s.verificationLevel];
  const isReal = s.verificationLevel !== "none";

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 ${
      isReal
        ? "bg-gradient-to-br from-[#1a0533] via-[#0d1117] to-[#0a0f1e] border-[#7b2ff2]/30"
        : "bg-[#0d1117] border-dashed border-gray-700"
    }`}>
      {/* Decorative glow — only when verified */}
      {isReal && (
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(123,47,242,0.18) 0%, transparent 70%)" }} />
      )}

      {/* UNVERIFIED watermark */}
      {!isReal && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <p className="text-[56px] font-black text-gray-800/20 rotate-[-20deg] tracking-widest">
            UNVERIFIED
          </p>
        </div>
      )}

      <div className="relative flex items-start justify-between gap-3 flex-wrap">
        <div className="space-y-2">
          {/* Verification badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border"
              style={{ background: level.bg, color: level.color, borderColor: `${level.color}40` }}>
              {isReal
                ? <ShieldCheck className="w-3.5 h-3.5" />
                : <ShieldOff   className="w-3.5 h-3.5" />}
              SWAECH {level.label.toUpperCase()}
            </div>
          </div>

          <div>
            <p className="text-[10px] text-gray-600 uppercase tracking-widest">SWAECH ID</p>
            <TagCopy tag={s.swaechTag} />
          </div>

          <p className="text-[10px] text-gray-600">
            Member since {fmt(s.createdAt)}
          </p>
        </div>

        <div className="flex flex-col items-center gap-1">
          <TrustRing score={s.trustScore} />
          <button onClick={onRefresh} disabled={refreshing}
            className="flex items-center gap-1 text-[10px] text-gray-600 hover:text-[#7b2ff2] transition-colors">
            <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Trust factors */}
      <div className="relative flex flex-wrap gap-1.5 mt-4">
        <Factor label="Email"        active={s.trustEmailVerified}   />
        <Factor label="Battery"      active={s.trustVerifiedBattery} />
        <Factor label="Dealer"       active={s.trustIsDealer}        />
        <Factor label="Transacted"   active={s.trustHasTransactions}  />
        <Factor label="Sold"         active={s.trustCompletedSales}   />
      </div>

      {/* Wallet snapshot */}
      {isReal && (
        <div className="relative mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Wallet",   value: `₦${s.walletBalance.toLocaleString()}` },
            { label: "Score",    value: s.trustScore },
            { label: "Level",    value: s.verificationLevel },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
              <p className="font-bold text-white text-sm">{value}</p>
              <p className="text-[9px] text-gray-500 mt-0.5 uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PRE-VERIFIED: guided 3-step progression ───────────────────────────────────

function GuidedProgression({ s }: { s: SwaechSummary }) {
  const steps = [
    {
      n: 1, done: s.trustEmailVerified,
      title: "Verify your email",
      desc:  "Confirms your identity — unlocks basic features",
      cta:   null,
      ctaLabel: "",
      badge: s.trustEmailVerified ? "+10 trust" : "10 pts",
    },
    {
      n: 2, done: s.trustVerifiedBattery,
      title: "Add a Battery Passport",
      desc:  "Upload a battery health report for a vehicle you own",
      cta:   "/dashboard?tab=my-listings",
      ctaLabel: "Create Passport →",
      badge: s.trustVerifiedBattery ? "+20 trust" : "20 pts",
    },
    {
      n: 3, done: false,
      title: "Submit ID verification",
      desc:  "Government ID required for dealer badge and high-value listings",
      cta:   "/dealers/join",
      ctaLabel: "Start →",
      badge: "15 pts",
    },
  ];

  return (
    <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#21262d] flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#7b2ff2]" />
        <p className="font-semibold text-white text-sm">Get SWAECH Verified</p>
        <span className="ml-auto text-[10px] text-gray-600">
          Complete all steps to verify
        </span>
      </div>
      <div className="divide-y divide-[#21262d]">
        {steps.map(({ n, done, title, desc, cta, ctaLabel, badge }) => (
          <div key={n} className={`flex items-center gap-4 px-5 py-4 transition-colors ${
            done ? "bg-green-500/5" : "hover:bg-[#161b22]"
          }`}>
            {/* Step indicator */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 border ${
              done
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : "bg-[#7b2ff2]/10 text-[#7b2ff2] border-[#7b2ff2]/30"
            }`}>
              {done ? "✓" : n}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${done ? "text-green-400" : "text-white"}`}>{title}</p>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                done
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-[#7b2ff2]/10 text-[#7b2ff2] border border-[#7b2ff2]/20"
              }`}>{badge}</span>
              {!done && cta && (
                <Link href={cta}
                  className="text-[11px] font-semibold text-[#7b2ff2] hover:text-white transition-colors whitespace-nowrap">
                  {ctaLabel}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Trust log preview */}
      {s.recentTrustLogs.length > 0 && (
        <div className="px-5 py-4 border-t border-[#21262d] space-y-2">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">Recent Trust Activity</p>
          {s.recentTrustLogs.slice(0, 3).map((log, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px]">
              <span className="text-green-400 font-bold">+{log.delta}</span>
              <span className="text-gray-500">{log.reason}</span>
              <span className="ml-auto text-gray-700">{fmt(log.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── VERIFIED: lazy-loading tabs ───────────────────────────────────────────────

function LazyTab<T>({
  endpoint, render,
}: {
  endpoint: string;
  render: (data: T, reload: () => void) => React.ReactNode;
}) {
  const [data,    setData]    = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res  = await fetch(endpoint);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="space-y-3">
      {[1,2,3].map((i) => (
        <div key={i} className="h-16 rounded-xl bg-[#161b22] animate-pulse" />
      ))}
    </div>
  );
  if (error) return (
    <div className="text-center py-10">
      <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
      <p className="text-red-400 text-sm">{error}</p>
      <Button onClick={load} className="mt-3 text-xs">Retry</Button>
    </div>
  );
  if (!data) return null;

  return <>{render(data, load)}</>;
}

function WalletTab({ swaechId }: { swaechId: string }) {
  const [amount, setAmount] = useState("");
  const [busy,   setBusy]   = useState(false);

  const topup = async (reload: () => void) => {
    const n = parseFloat(amount);
    if (!n || n <= 0) return;
    setBusy(true);
    await fetch("/api/swaech/wallet", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: n, type: "credit", category: "topup", description: "Manual top-up" }),
    });
    setBusy(false);
    setAmount("");
    reload();
  };

  return (
    <LazyTab<{ balance: number; transactions: Transaction[] }>
      endpoint="/api/swaech/wallet"
      render={(data, reload) => (
        <div className="space-y-4">
          {/* Balance card */}
          <div className="bg-gradient-to-br from-[#1a0533] to-[#0d1117] border border-[#7b2ff2]/30 rounded-2xl p-6 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Available Balance</p>
            <p className="text-4xl font-black text-white">₦{data.balance.toLocaleString()}</p>
            <p className="text-[10px] text-gray-600 mt-1">Ledger-derived balance · always accurate</p>
          </div>

          {/* Top-up */}
          <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-4">
            <p className="text-sm font-semibold text-white mb-3">Top Up</p>
            <div className="flex gap-3">
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount in ₦"
                className="flex-1 bg-[#161b22] border border-[#30363d] text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#7b2ff2]" />
              <Button onClick={() => topup(reload)} disabled={busy}
                className="bg-[#7b2ff2] hover:bg-[#651fff] text-white rounded-xl px-5">
                {busy ? "…" : "Add"}
              </Button>
            </div>
            <div className="flex gap-2 mt-3">
              {[5000, 10000, 25000, 50000].map((a) => (
                <button key={a} onClick={() => setAmount(String(a))}
                  className="text-[11px] px-3 py-1.5 rounded-full bg-[#21262d] text-gray-500 hover:bg-[#7b2ff2]/20 hover:text-[#c4b8e8] transition-all">
                  ₦{a.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Recent transactions */}
          {data.transactions.length > 0 && (
            <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl overflow-hidden">
              <div className="divide-y divide-[#21262d]">
                {data.transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      tx.type === "credit" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                    }`}>
                      {tx.type === "credit"
                        ? <ArrowDownLeft className="w-4 h-4" />
                        : <ArrowUpRight  className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{tx.description ?? tx.category}</p>
                      <p className="text-[10px] text-gray-600">{fmt(tx.createdAt)}</p>
                    </div>
                    <p className={`font-bold text-sm ${tx.type === "credit" ? "text-green-400" : "text-red-400"}`}>
                      {tx.type === "credit" ? "+" : "-"}₦{tx.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    />
  );
}

function GarageTab() {
  return (
    <LazyTab<{ vehicles: SwaechVehicle[] }>
      endpoint="/api/swaech/garage"
      render={(data) => (
        data.vehicles.length === 0 ? (
          <div className="text-center py-16 bg-[#0d1117] border border-[#21262d] rounded-2xl">
            <Car className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No vehicles in your garage</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.vehicles.map((v) => (
              <div key={v.id} className="bg-[#0d1117] border border-[#21262d] hover:border-[#7b2ff2]/40 rounded-2xl p-4 transition-all">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-white">{v.year} {v.make} {v.model}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    v.status === "active"
                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                      : "bg-gray-700 text-gray-400 border-gray-600"
                  }`}>{v.status}</span>
                </div>
                {v.vin && <p className="text-[10px] text-gray-600 font-mono mt-1">VIN: {v.vin}</p>}
                <p className="text-[10px] text-gray-700 mt-2">Added {fmt(v.addedAt)}</p>
              </div>
            ))}
          </div>
        )
      )}
    />
  );
}

function TrustTab() {
  return (
    <LazyTab<{ trustScore: number; logs: TrustLog[] }>
      endpoint="/api/swaech/trust"
      render={(data) => (
        <div className="space-y-4">
          <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Trust Score History</p>
            {data.logs.length === 0 ? (
              <p className="text-gray-600 text-sm">No trust events recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {data.logs.map((log, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">{log.reason}</p>
                      <p className="text-[10px] text-gray-600">{fmt(log.createdAt)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-green-400 font-bold text-sm">+{log.delta}</p>
                      <p className="text-[10px] text-gray-600">→ {log.newScore}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    />
  );
}

// ─── MAIN EXPORT ───────────────────────────────────────────────────────────────

export default function SwaechIDTab() {
  const [summary,    setSummary]    = useState<SwaechSummary | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [activeTab,  setActiveTab]  = useState<TabId>("overview");
  const [refreshing, setRefreshing] = useState(false);

  const fetchSummary = async () => {
    try {
      const res  = await fetch("/api/swaech/id");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      setSummary(json.swaech);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSummary(); }, []);

  const refreshTrust = async () => {
    setRefreshing(true);
    await fetch("/api/swaech/trust", { method: "POST" });
    await fetchSummary();
    setRefreshing(false);
  };

  if (loading) return (
    <div className="space-y-4">
      {[1,2,3].map((i)=>(
        <div key={i} className="h-28 rounded-2xl bg-[#0d1117] border border-[#21262d] animate-pulse"/>
      ))}
    </div>
  );
  if (error) return (
    <div className="text-center py-16">
      <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3"/>
      <p className="text-red-400 text-sm">{error}</p>
      <Button className="mt-4" onClick={fetchSummary}>Retry</Button>
    </div>
  );
  if (!summary) return null;

  const isVerified = summary.verificationLevel !== "none";

  const TABS: { id: TabId; label: string; icon: any }[] = [
    { id: "overview",     label: "Overview",    icon: ShieldCheck  },
    { id: "wallet",       label: "Wallet",       icon: Wallet       },
    { id: "garage",       label: "Garage",       icon: Car          },
    { id: "battery",      label: "Battery Hub",  icon: Zap          },
    { id: "transactions", label: "Transactions", icon: Clock        },
    { id: "trust",        label: "Trust Log",    icon: TrendingUp   },
  ];

  return (
    <div className="space-y-5 min-h-0">
      {/* Page title */}
      <div>
        <h2 className="font-black text-2xl text-gray-900 dark:text-white">SWAECH ID</h2>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
          Identity · Trust · Wallet · Vehicles
        </p>
      </div>

      {/* Identity card — always shown */}
      <IdentityCard s={summary} onRefresh={refreshTrust} refreshing={refreshing} />

      {/* Pre-verified: guided steps only — no overwhelming locked grid */}
      {!isVerified ? (
        <GuidedProgression s={summary} />
      ) : (
        <>
          {/* Tab bar — only shown when verified */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                  activeTab === id
                    ? "bg-[#7b2ff2] text-white shadow"
                    : "bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-[#21262d] text-gray-500 dark:text-gray-400 hover:border-[#7b2ff2]/50"
                }`}>
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>

          {/* Tab content — each fetches lazily */}
          <div className="min-h-0">
            {activeTab === "overview" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { icon: Wallet,   label: "Wallet",      value: `₦${summary.walletBalance.toLocaleString()}` },
                  { icon: ShieldCheck, label: "Trust",    value: summary.trustScore },
                  { icon: FileText, label: "Level",       value: summary.verificationLevel },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-white dark:bg-[#0d1117] border border-gray-100 dark:border-[#21262d] rounded-2xl p-4">
                    <div className="w-8 h-8 rounded-lg bg-[#7b2ff2]/10 flex items-center justify-center mb-3">
                      <Icon className="w-4 h-4 text-[#7b2ff2]" />
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white text-xl">{value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            )}
            {activeTab === "wallet"       && <WalletTab swaechId={summary.id} />}
            {activeTab === "garage"       && <GarageTab />}
            {activeTab === "battery"      && (
              <LazyTab<{ batteryReports: any[] }>
                endpoint="/api/swaech/id"
                render={() => (
                  <div className="text-center py-16 bg-[#0d1117] border border-[#21262d] rounded-2xl">
                    <Zap className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Battery reports are on your listings</p>
                    <Link href="/dashboard?tab=my-listings">
                      <Button className="mt-4 bg-[#7b2ff2] text-white rounded-full text-xs px-5">
                        View My Listings
                      </Button>
                    </Link>
                  </div>
                )}
              />
            )}
            {activeTab === "transactions" && (
              <LazyTab<{ transactions: Transaction[] }>
                endpoint="/api/swaech/transactions"
                render={(data) => (
                  <div className="bg-white dark:bg-[#0d1117] border border-gray-100 dark:border-[#21262d] rounded-2xl overflow-hidden">
                    {data.transactions.length === 0 ? (
                      <div className="text-center py-16">
                        <Clock className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No transactions yet</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100 dark:divide-[#21262d]">
                        {data.transactions.map((tx) => (
                          <div key={tx.id} className="flex items-center gap-3 px-5 py-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              tx.type === "credit" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                            }`}>
                              {tx.type === "credit"
                                ? <ArrowDownLeft className="w-4 h-4" />
                                : <ArrowUpRight  className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 dark:text-white font-medium">
                                {tx.description ?? tx.category}
                              </p>
                              <p className="text-[10px] text-gray-500">{fmt(tx.createdAt)}</p>
                            </div>
                            <p className={`font-bold text-sm flex-shrink-0 ${
                              tx.type === "credit" ? "text-green-500" : "text-red-400"
                            }`}>
                              {tx.type === "credit" ? "+" : "-"}₦{tx.amount.toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              />
            )}
            {activeTab === "trust" && <TrustTab />}
          </div>
        </>
      )}
    </div>
  );
}