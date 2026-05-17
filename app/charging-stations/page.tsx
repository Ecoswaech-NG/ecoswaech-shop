// PLACE AT: app/charging-stations/page.tsx

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import StationDrawer from "@/components/charging-stations/StationDrawer";
import OperatorForm from "@/components/charging-stations/OperatorForm";
import { SlidersHorizontal, Plus, X, RefreshCw } from "lucide-react";
import { IoPhonePortrait } from "react-icons/io5";
import type { MapStation } from "@/components/charging-stations/AppMapView";

// ── Dynamic import — Leaflet must not run on the server ──────────────────────
const AppMapView = dynamic(
  () => import("@/components/charging-stations/AppMapView"),
  { ssr: false, loading: () => <div className="w-full h-full bg-gray-100 dark:bg-[#18122b] flex items-center justify-center"><p className="text-gray-400">Loading map…</p></div> }
);

// ─── Filter sidebar ───────────────────────────────────────────────────────────

interface Filters {
  type:      string;
  available: string;
  power:     string;
  search:    string;
}

function FilterPanel({
  filters, onChange, onReset, count, onClose,
}: {
  filters:  Filters;
  onChange: (k: keyof Filters, v: string) => void;
  onReset:  () => void;
  count:    number;
  onClose?: () => void;
}) {
  const selectCls = "w-full text-sm bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] text-gray-800 dark:text-[#e0d7ff] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7b2ff2] transition";

  return (
    <div className="p-5 space-y-5 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">Filters</p>
          <p className="text-xs text-gray-400 dark:text-[#8b949e] mt-0.5">{count} station{count !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onReset} className="text-xs text-[#7b2ff2] hover:underline font-medium">Reset</button>
          {onClose && <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 dark:text-[#8b949e] uppercase tracking-widest block mb-2">Search</label>
        <input
          type="text" value={filters.search}
          onChange={(e) => onChange("search", e.target.value)}
          placeholder="Station name or address…"
          className={selectCls}
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 dark:text-[#8b949e] uppercase tracking-widest block mb-2">Station Type</label>
        <select className={selectCls} value={filters.type} onChange={(e) => onChange("type", e.target.value)}>
          <option value="">All Types</option>
          <option value="public">Public Charger</option>
          <option value="battery_swap">Battery Swap 🔋</option>
          <option value="home_share">Home Share 🏠</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 dark:text-[#8b949e] uppercase tracking-widest block mb-2">Availability</label>
        <div className="flex gap-2">
          {[["","Any"],["true","Available"],["false","Unavailable"]].map(([v,l]) => (
            <button key={v} onClick={() => onChange("available", v)}
              className={`flex-1 py-1.5 rounded-full text-xs font-semibold border transition ${
                filters.available === v
                  ? "bg-[#7b2ff2] text-white border-[#7b2ff2]"
                  : "border-gray-200 dark:border-[#30363d] text-gray-600 dark:text-[#8b949e] hover:border-[#7b2ff2]"
              }`}>{l}</button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 dark:text-[#8b949e] uppercase tracking-widest block mb-2">Power Source</label>
        <select className={selectCls} value={filters.power} onChange={(e) => onChange("power", e.target.value)}>
          <option value="">Any</option>
          <option value="grid">⚡ Grid</option>
          <option value="solar">☀️ Solar</option>
          <option value="wind">💨 Wind</option>
          <option value="hybrid">🔋 Hybrid</option>
        </select>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ChargingStationsPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [stations,     setStations]     = useState<MapStation[]>([]);
  const [filtered,     setFiltered]     = useState<MapStation[]>([]);
  const [selected,     setSelected]     = useState<MapStation | null>(null);
  const [showForm,     setShowForm]     = useState(false);
  const [showSidebar,  setShowSidebar]  = useState(false);
  const [showAbout,    setShowAbout]    = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [lastRefresh,  setLastRefresh]  = useState<Date>(new Date());
  const refreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [filters, setFilters] = useState<Filters>({
    type: "", available: "", power: "", search: "",
  });

  // ── Get user location ───────────────────────────────────────────────────────

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserLocation(null)
    );
  }, []);

  // ── Fetch stations ─────────────────────────────────────────────────────────

  const fetchStations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(userLocation && { lat: String(userLocation.lat), lng: String(userLocation.lng), radius: "100" }),
        ...(filters.type      && { type:      filters.type      }),
        ...(filters.available && { available: filters.available }),
        ...(filters.power     && { power:     filters.power     }),
      });
      const res  = await fetch(`/api/stations?${params}`);
      const data = await res.json();
      setStations(data.stations ?? []);
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  }, [userLocation, filters.type, filters.available, filters.power]);

  useEffect(() => { fetchStations(); }, [fetchStations]);

  // ── Live status refresh every 60s ──────────────────────────────────────────

  useEffect(() => {
    refreshRef.current = setInterval(async () => {
      const res  = await fetch("/api/stations/status");
      const data = await res.json();
      const liveMap: Record<string, boolean> = {};
      (data.stations ?? []).forEach((s: any) => { liveMap[s.id] = s.isAvailable && s.isLive; });
      setStations((prev) => prev.map((s) => ({
        ...s,
        isAvailable: liveMap[s.id] ?? s.isAvailable,
      })));
    }, 60_000);
    return () => {
      if (refreshRef.current) clearInterval(refreshRef.current);
    };
  }, []);

  // ── Client-side text filter ────────────────────────────────────────────────

  useEffect(() => {
    const q = filters.search.toLowerCase();
    setFiltered(
      q
        ? stations.filter((s) =>
            s.name.toLowerCase().includes(q) ||
            s.address.toLowerCase().includes(q)
          )
        : stations
    );
  }, [stations, filters.search]);

  const handleFilterChange = (key: keyof Filters, value: string) =>
    setFilters((p) => ({ ...p, [key]: value }));

  const resetFilters = () =>
    setFilters({ type: "", available: "", power: "", search: "" });

  const available  = filtered.filter((s) => s.isAvailable).length;
  const swapCount  = filtered.filter((s) => s.stationType === "battery_swap").length;
  const shareCount = filtered.filter((s) => s.stationType === "home_share").length;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0a0822]">
      <Navbar />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-100 dark:border-[#2d1e5f] bg-white dark:bg-[#18122b] px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-bold text-lg text-gray-900 dark:text-white">
            EV Charger Finder
          </h1>
          <p className="text-xs text-gray-400 dark:text-[#8b949e] mt-0.5">
            {available} available · {swapCount} swap · {shareCount} home share
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Last refresh */}
          <span className="hidden sm:block text-[10px] text-gray-400 dark:text-[#484f58]">
            Updated {lastRefresh.toLocaleTimeString()}
          </span>
          <button onClick={fetchStations} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2d1e5f] transition" title="Refresh">
            <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setShowSidebar(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-[#2d1e5f] text-gray-700 dark:text-[#c4b8e8] text-xs font-semibold">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#7b2ff2] text-white text-xs font-semibold hover:bg-[#651fff] transition">
            <Plus className="w-3.5 h-3.5" /> Add Station
          </button>
          <button onClick={() => setShowAbout(true)}
            className="hidden md:block text-xs text-[#7b2ff2] hover:underline font-medium">
            About EV Charging
          </button>
        </div>
      </div>

      {/* ── Location prompt ─────────────────────────────────────────────────── */}
      {!userLocation && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2 text-xs text-amber-700 dark:text-amber-400 text-center">
          📍 Enable location to see stations near you and get distance estimates
        </div>
      )}

      {/* ── Main layout ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 120px)" }}>

        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-gray-100 dark:border-[#2d1e5f] bg-white dark:bg-[#18122b] overflow-y-auto">
          <FilterPanel
            filters={filters} onChange={handleFilterChange}
            onReset={resetFilters} count={filtered.length}
          />
        </aside>

        {/* Map */}
        <div className="flex-1 relative">
          <AppMapView
            stations={filtered}
            userLocation={userLocation}
            onSelect={setSelected}
          />

          {/* Station count overlay */}
          <div className="absolute top-3 left-3 z-10 bg-white dark:bg-[#18122b] rounded-xl shadow-lg px-3 py-2 border border-gray-100 dark:border-[#2d1e5f]">
            <p className="text-xs font-semibold text-gray-700 dark:text-white">{filtered.length} stations</p>
          </div>

          {/* Legend */}
          <div className="absolute bottom-6 left-3 z-10 bg-white dark:bg-[#18122b] rounded-xl shadow-lg p-3 border border-gray-100 dark:border-[#2d1e5f] text-[10px] space-y-1">
            {[
              { color: "#3fb950", label: "Available"    },
              { color: "#f85149", label: "Unavailable"  },
              { color: "#d29922", label: "Battery Swap" },
              { color: "#58a6ff", label: "Home Share"   },
              { color: "#7b2ff2", label: "Your Location"},
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                <span className="text-gray-600 dark:text-[#8b949e]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Station detail drawer ────────────────────────────────────────────── */}
      <StationDrawer
        station={selected}
        onClose={() => setSelected(null)}
        userLat={userLocation?.lat}
        userLng={userLocation?.lng}
      />

      {/* ── Operator form modal ──────────────────────────────────────────────── */}
      {showForm && (
        <OperatorForm
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); fetchStations(); }}
        />
      )}

      {/* ── Mobile filter drawer ─────────────────────────────────────────────── */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowSidebar(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white dark:bg-[#18122b] shadow-2xl">
            <FilterPanel
              filters={filters} onChange={handleFilterChange}
              onReset={resetFilters} count={filtered.length}
              onClose={() => setShowSidebar(false)}
            />
          </div>
        </div>
      )}

      {/* ── About modal ──────────────────────────────────────────────────────── */}
      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#18122b] max-w-2xl w-full rounded-2xl shadow-2xl p-6 relative border border-gray-100 dark:border-[#2d1e5f]">
            <button onClick={() => setShowAbout(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl">×</button>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">⚡ About EV Charging</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-[#c4b8e8]">
              {[
                { icon: "🔋", title: "Charging Levels", body: "Level 1 (120V) is slowest, Level 2 (240V) is medium, DC Fast Charging can deliver 80% charge in 30 minutes." },
                { icon: "🔌", title: "Connector Types",  body: "CCS2, CHAdeMO, Type 2, Type 1 and GB/T are the most common. Check your vehicle's manual for compatibility." },
                { icon: "📍", title: "Finding Stations", body: "Use our live map to find nearby stations. Filter by type, availability, or power source." },
                { icon: "☀️", title: "Green Charging",   body: "Look for the Solar, Wind or Hybrid power badge — these stations use renewable energy." },
              ].map(({ icon, title, body }) => (
                <div key={title} className="bg-gray-50 dark:bg-[#0d1117] rounded-xl p-4 border border-gray-100 dark:border-[#2d1e5f]">
                  <h3 className="font-semibold mb-2">{icon} {title}</h3>
                  <p className="text-xs leading-relaxed text-gray-600 dark:text-[#8b949e]">{body}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 p-4 bg-[#7b2ff2]/10 rounded-xl border border-[#7b2ff2]/20 flex items-center gap-3">
              <IoPhonePortrait className="text-2xl text-[#7b2ff2] flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">Download the ECOSWAP Charger Finder App</p>
                <p className="text-xs text-gray-500 dark:text-[#8b949e]">Find chargers, plan routes, and get live availability on the go</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}