// PLACE AT: components/charging-stations/AdminStationsClient.tsx

"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Trash2, MapPin, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

interface Station {
  id:           string;
  name:         string;
  address:      string;
  stationType:  string;
  status:       string;
  powerOutput:  string;
  chargerTypes: any;
  powerSource:  string;
  isAvailable:  boolean;
  uptimePercent:number;
  operatorName: string | null;
  operatorEmail:string | null;
  avgRating:    number | null;
  createdAt:    Date;
}

interface Props {
  stations: Station[];
  stats:    { pending: number; approved: number; total: number };
}

const STATUS_PILL: Record<string, string> = {
  pending:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  offline:  "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

export default function AdminStationsClient({ stations: initial, stats }: Props) {
  const router  = useRouter();
  const [stations, setStations] = useState(initial);
  const [loading, setLoading]   = useState<string | null>(null);
  const [filter,  setFilter]    = useState<string>("all");

  const action = async (id: string, status: string) => {
    setLoading(id + status);
    try {
      if (status === "delete") {
        await fetch(`/api/stations/${id}`, { method: "DELETE" });
        setStations((p) => p.filter((s) => s.id !== id));
      } else {
        await fetch(`/api/stations/${id}`, {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ status }),
        });
        setStations((p) => p.map((s) => s.id === id ? { ...s, status } : s));
      }
    } finally {
      setLoading(null);
    }
  };

  const displayed = filter === "all" ? stations : stations.filter((s) => s.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0822] px-4 sm:px-8 py-8">
      <h1 className="font-bold text-2xl text-gray-900 dark:text-white mb-2">
        Station Management
      </h1>
      <p className="text-sm text-gray-400 dark:text-[#8b949e] mb-8">
        Review and approve operator-submitted charging stations
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Pending Review", value: stats.pending,  color: "text-amber-600" },
          { label: "Approved",       value: stats.approved, color: "text-green-600" },
          { label: "Total",          value: stats.total,    color: "text-[#7b2ff2]" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white dark:bg-[#18122b] rounded-2xl border border-gray-100 dark:border-[#2d1e5f] p-5 shadow-sm text-center">
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 dark:text-[#8b949e] mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["all","pending","approved","rejected","offline"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition ${
              filter === s
                ? "bg-[#7b2ff2] text-white border-[#7b2ff2]"
                : "bg-white dark:bg-[#18122b] border-gray-200 dark:border-[#2d1e5f] text-gray-600 dark:text-[#8b949e] hover:border-[#7b2ff2]"
            }`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {s === "pending" && stats.pending > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white rounded-full px-1.5 py-0.5 text-[10px]">
                {stats.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#18122b] rounded-2xl border border-gray-100 dark:border-[#2d1e5f] overflow-hidden shadow-sm">
        {displayed.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-[#8b949e]">
            No stations in this category
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-[#2d1e5f] text-xs text-gray-500 dark:text-[#8b949e] uppercase tracking-widest">
                  <th className="text-left px-5 py-3">Station</th>
                  <th className="text-left px-5 py-3">Type</th>
                  <th className="text-left px-5 py-3">Specs</th>
                  <th className="text-left px-5 py-3">Operator</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 dark:border-[#21262d] hover:bg-gray-50 dark:hover:bg-[#1e1340]/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900 dark:text-white">{s.name}</p>
                      <p className="text-xs text-gray-400 dark:text-[#8b949e] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {s.address}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-gray-600 dark:text-[#c4b8e8]">
                        {s.stationType === "battery_swap" ? "🔋 Battery Swap" :
                         s.stationType === "home_share"   ? "🏠 Home Share"   : "⚡ Public"}
                      </span>
                      <p className="text-[10px] text-gray-400 dark:text-[#484f58] mt-0.5">
                        {s.powerSource === "solar" ? "☀️" : s.powerSource === "wind" ? "💨" : s.powerSource === "hybrid" ? "🔋" : "⚡"} {s.powerSource}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs text-gray-700 dark:text-[#c4b8e8] flex items-center gap-1">
                        <Zap className="w-3 h-3 text-yellow-500" /> {s.powerOutput}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-[#484f58] mt-0.5">
                        {Array.isArray(s.chargerTypes) ? s.chargerTypes.join(", ") : ""}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs text-gray-700 dark:text-[#c4b8e8]">{s.operatorName ?? "—"}</p>
                      <p className="text-[10px] text-gray-400 dark:text-[#484f58]">{s.operatorEmail ?? ""}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_PILL[s.status] ?? STATUS_PILL.offline}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {s.status === "pending" && (
                          <>
                            <button
                              onClick={() => action(s.id, "approved")}
                              disabled={!!loading}
                              className="p-1.5 rounded-lg bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-600 transition"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => action(s.id, "rejected")}
                              disabled={!!loading}
                              className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-500 transition"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {s.status === "approved" && (
                          <button
                            onClick={() => action(s.id, "offline")}
                            disabled={!!loading}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-[#2d1e5f] text-gray-500 dark:text-[#8b949e] transition text-xs font-semibold px-3"
                            title="Take Offline"
                          >
                            Offline
                          </button>
                        )}
                        <button
                          onClick={() => { if (confirm("Delete this station?")) action(s.id, "delete"); }}
                          disabled={!!loading}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-400 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}