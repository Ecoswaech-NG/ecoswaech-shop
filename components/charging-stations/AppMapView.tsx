// PLACE AT: components/charging-stations/AppMapView.tsx
// IMPORTANT: This component uses Leaflet which requires SSR to be disabled.
// Import it in page.tsx like this:
//   const AppMapView = dynamic(() => import("@/components/charging-stations/AppMapView"), { ssr: false })

"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ─── Fix Leaflet default marker icon (broken in bundlers) ────────────────────

function fixLeafletIcons() {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

// ─── Custom coloured pin icons ────────────────────────────────────────────────

function makeIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:${color};transform:rotate(-45deg);
      border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)
    "></div>`,
    iconSize:   [28, 28],
    iconAnchor: [14, 28],
    popupAnchor:[0, -30],
  });
}

const ICONS = {
  available:    makeIcon("#3fb950"),  // green
  unavailable:  makeIcon("#f85149"),  // red
  battery_swap: makeIcon("#d29922"),  // amber
  home_share:   makeIcon("#58a6ff"),  // blue
  user:         makeIcon("#7b2ff2"),  // purple
};

// ─── Fly to user location when it changes ────────────────────────────────────

function FlyToUser({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.flyTo(position, 13, { duration: 1.2 }); }, [position]);
  return null;
}

// ─── Create a high z-index pane for the user marker ────────────────────────────
function EnsureUserPane() {
  const map = useMap();
  useEffect(() => {
    const name = "userPane";
    if (!map.getPane(name)) {
      const pane = map.createPane(name);
      pane.style.zIndex = "1200"; // higher than default markerPane (600) and overlayPane (400)
      pane.style.pointerEvents = "auto";
    }
  }, [map]);
  return null;
}

// ─── Haversine ────────────────────────────────────────────────────────────────

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371, dLat = ((lat2 - lat1) * Math.PI) / 180,
        dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MapStation {
  id:           string;
  name:         string;
  address:      string;
  lat:          number;
  lng:          number;
  stationType:  string;
  isAvailable:  boolean;
  chargerTypes: string[];
  powerOutput:  string;
  powerSource:  string;
  pricePerKwh:  number | null;
  priceNote:    string | null;
  uptimePercent:number;
  avgRating:    number | null;
  reviewCount:  number;
}

interface Props {
  stations:     MapStation[];
  userLocation: { lat: number; lng: number } | null;
  onSelect:     (station: MapStation) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const POWER_BADGE: Record<string, { label: string; emoji: string; color: string }> = {
  solar:  { label: "Solar",   emoji: "☀️", color: "#d29922" },
  wind:   { label: "Wind",    emoji: "💨", color: "#58a6ff" },
  hybrid: { label: "Hybrid",  emoji: "🔋", color: "#3fb950" },
  grid:   { label: "Grid",    emoji: "⚡", color: "#8b949e" },
};

export default function AppMapView({ stations, userLocation, onSelect }: Props) {
  useEffect(() => { fixLeafletIcons(); }, []);

  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [6.5244, 3.3792]; // Default: Lagos

  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom
      style={{ height: "100%", width: "100%", zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Fly to user when location changes */}
      {userLocation && <FlyToUser position={[userLocation.lat, userLocation.lng]} />}
      {/* Ensure custom pane exists */}
      <EnsureUserPane />

      {/* Station pins */}
      {stations.map((s) => {
        const icon =
          s.stationType === "battery_swap" ? ICONS.battery_swap :
          s.stationType === "home_share"   ? ICONS.home_share   :
          s.isAvailable                    ? ICONS.available    :
                                             ICONS.unavailable;

        const dist = userLocation
          ? distanceKm(userLocation.lat, userLocation.lng, s.lat, s.lng)
          : null;

        const power = POWER_BADGE[s.powerSource] ?? POWER_BADGE.grid;

        return (
          <Marker
            key={s.id}
            position={[s.lat, s.lng]}
            icon={icon}
            eventHandlers={{ click: () => onSelect(s) }}
          >
            <Popup>
              <div className="min-w-[180px] space-y-1">
                <p className="font-bold text-sm text-gray-900">{s.name}</p>
                <p className="text-xs text-gray-500">{s.address}</p>

                {/* Power source */}
                <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: `${power.color}20`, color: power.color }}>
                  {power.emoji} {power.label} Power
                </span>

                {/* Status */}
                <p className={`text-xs font-semibold ${s.isAvailable ? "text-green-600" : "text-red-500"}`}>
                  {s.isAvailable ? "✓ Available" : "✗ Unavailable"}
                </p>

                {/* Distance */}
                {dist && <p className="text-xs text-gray-400">{dist} km away</p>}

                {/* Price */}
                {s.pricePerKwh && (
                  <p className="text-xs text-gray-700">₦{s.pricePerKwh}/kWh</p>
                )}

                {/* Connectors */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {s.chargerTypes.map((t) => (
                    <span key={t} className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded">
                      {t}
                    </span>
                  ))}
                </div>

                {/* Uptime */}
                <p className="text-[10px] text-gray-400">
                  Uptime: {s.uptimePercent}%
                </p>

                {/* Click for details */}
                <button
                  onClick={() => onSelect(s)}
                  className="w-full mt-1 py-1 bg-[#7b2ff2] text-white text-xs font-semibold rounded-lg hover:bg-[#651fff] transition"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* User location pin — render last and in high z-index pane */}
      {userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={ICONS.user}
          zIndexOffset={1000}
          pane="userPane"
        >
          <Popup><b>📍 Your Location</b></Popup>
        </Marker>
      )}
    </MapContainer>
  );
}