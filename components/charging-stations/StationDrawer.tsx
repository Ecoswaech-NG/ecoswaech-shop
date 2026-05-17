// PLACE AT: components/charging-stations/StationDrawer.tsx

"use client";

import { useEffect, useState } from "react";
import { X, Zap, Star, Clock, Navigation } from "lucide-react";
import { FaWhatsapp, FaPhone } from "react-icons/fa";
import type { MapStation } from "./AppMapView";

interface Props {
  station:  MapStation | null;
  onClose:  () => void;
  userLat?: number;
  userLng?: number;
}

const POWER_BADGE: Record<string, { label: string; emoji: string; color: string }> = {
  solar:  { label: "Solar",   emoji: "☀️", color: "#d29922" },
  wind:   { label: "Wind",    emoji: "💨", color: "#58a6ff" },
  hybrid: { label: "Hybrid",  emoji: "🔋", color: "#3fb950" },
  grid:   { label: "Grid",    emoji: "⚡", color: "#8b949e" },
};

const TYPE_LABEL: Record<string, { label: string; color: string }> = {
  public:       { label: "Public Station",  color: "#7b2ff2" },
  battery_swap: { label: "Battery Swap 🔋", color: "#d29922" },
  home_share:   { label: "Home Share 🏠",   color: "#58a6ff" },
};

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371, dLat = ((lat2 - lat1) * Math.PI) / 180,
        dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1);
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((n) => (
        <Star key={n} className={`w-3.5 h-3.5 ${n <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
      ))}
    </div>
  );
}

export default function StationDrawer({ station, onClose, userLat, userLng }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (station) setTimeout(() => setVisible(true), 10);
    else setVisible(false);
  }, [station]);

  if (!station) return null;

  const power   = POWER_BADGE[station.powerSource] ?? POWER_BADGE.grid;
  const type    = TYPE_LABEL[station.stationType]  ?? TYPE_LABEL.public;
  const dist    = userLat && userLng
    ? distanceKm(userLat, userLng, station.lat, station.lng)
    : null;

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`;

  const content = (
    <div className="bg-white dark:bg-[#18122b] h-full flex flex-col">

      {/* Header */}
      <div className="flex items-start justify-between p-5 border-b border-gray-100 dark:border-[#2d1e5f]">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {/* Station type badge */}
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
              style={{ background: `${type.color}20`, color: type.color }}>
              {type.label}
            </span>
            {/* Power source badge */}
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: `${power.color}20`, color: power.color }}>
              {power.emoji} {power.label}
            </span>
          </div>
          <h2 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{station.name}</h2>
          <p className="text-xs text-gray-500 dark:text-[#8b949e] mt-0.5">{station.address}</p>
        </div>
        <button onClick={onClose} className="ml-3 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#2d1e5f] transition flex-shrink-0">
          <X className="w-5 h-5 text-gray-500 dark:text-[#8b949e]" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">

        {/* Status bar */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
            station.isAvailable
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${station.isAvailable ? "bg-green-500" : "bg-red-500"}`} />
            {station.isAvailable ? "Available Now" : "Unavailable"}
          </div>
          <span className="text-xs text-gray-400 dark:text-[#8b949e]">
            Uptime: {station.uptimePercent}%
          </span>
        </div>

        {/* Rating + distance */}
        <div className="flex items-center gap-4 text-sm">
          {station.avgRating && (
            <div className="flex items-center gap-1.5">
              <StarRating rating={station.avgRating} />
              <span className="text-xs text-gray-500 dark:text-[#8b949e]">
                {station.avgRating.toFixed(1)} ({station.reviewCount})
              </span>
            </div>
          )}
          {dist && (
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-[#8b949e]">
              <Navigation className="w-3 h-3" /> {dist} km away
            </span>
          )}
        </div>

        {/* Pricing */}
        <div className="bg-gray-50 dark:bg-[#0d1117] rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-[#8b949e] uppercase tracking-widest mb-2">Pricing</p>
          {station.pricePerKwh ? (
            <p className="font-bold text-xl text-[#7b2ff2] dark:text-[#c4b8e8]">₦{station.pricePerKwh}<span className="text-sm font-normal text-gray-400">/kWh</span></p>
          ) : (
            <p className="font-bold text-xl text-green-600">Free</p>
          )}
          {station.priceNote && <p className="text-xs text-gray-500 dark:text-[#8b949e] mt-1">{station.priceNote}</p>}
        </div>

        {/* Charger specs */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-[#8b949e] uppercase tracking-widest mb-2">Charger Info</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-[#0d1117] rounded-xl p-3">
              <p className="text-[10px] text-gray-400 dark:text-[#8b949e]">Output</p>
              <p className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-yellow-500" /> {station.powerOutput}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-[#0d1117] rounded-xl p-3">
              <p className="text-[10px] text-gray-400 dark:text-[#8b949e]">Hours</p>
              <p className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-500" /> {station.is24Hours ? "24/7" : station.operatingHours}
              </p>
            </div>
          </div>
        </div>

        {/* Connector types */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-[#8b949e] uppercase tracking-widest mb-2">Connectors</p>
          <div className="flex flex-wrap gap-2">
            {station.chargerTypes.map((t) => (
              <span key={t} className="bg-[#7b2ff2]/10 text-[#7b2ff2] dark:text-[#c4b8e8] text-xs font-semibold px-3 py-1 rounded-full">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Range to charger */}
        {dist && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-1">
              Range to Charger
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              This station is <strong>{dist} km</strong> away. Ensure your EV has enough
              charge to reach it before departure.
            </p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="p-5 border-t border-gray-100 dark:border-[#2d1e5f] space-y-2">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-[#7b2ff2] hover:bg-[#651fff] text-white font-semibold py-3 rounded-xl text-sm transition"
        >
          <Navigation className="w-4 h-4" /> Navigate Here
        </a>
        <div className="grid grid-cols-2 gap-2">
          <a href={`tel:`} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#2d1e5f] text-gray-700 dark:text-[#c4b8e8] text-xs font-semibold hover:bg-gray-50 dark:hover:bg-[#2d1e5f]/40 transition">
            <FaPhone className="w-3.5 h-3.5" /> Call Operator
          </a>
          <a href={`https://wa.me/`} target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-green-200 text-green-600 text-xs font-semibold hover:bg-green-50 dark:hover:bg-green-900/20 transition">
            <FaWhatsapp className="w-4 h-4" /> WhatsApp
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile: bottom sheet ─────────────────────────────────────────── */}
      <div className={`
        fixed inset-x-0 bottom-0 z-50 lg:hidden
        transform transition-transform duration-300 ease-out
        ${visible ? "translate-y-0" : "translate-y-full"}
        max-h-[85vh] rounded-t-2xl shadow-2xl overflow-hidden
      `}>
        {/* Drag handle */}
        <div className="bg-white dark:bg-[#18122b] flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-[#2d1e5f]" />
        </div>
        {content}
      </div>

      {/* Mobile backdrop */}
      {visible && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* ── Desktop: side drawer ─────────────────────────────────────────── */}
      <div className={`
        hidden lg:block fixed top-0 right-0 bottom-0 z-50 w-96
        transform transition-transform duration-300 ease-out shadow-2xl
        ${visible && station ? "translate-x-0" : "translate-x-full"}
        overflow-hidden
      `}>
        {content}
      </div>
    </>
  );
}