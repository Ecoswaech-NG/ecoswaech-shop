// PLACE AT: components/charging-stations/OperatorForm.tsx

"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props { onClose: () => void; onSuccess: () => void; }

const CHARGER_TYPES = ["CCS2","CHAdeMO","Type 2","Type 1","GB/T","Tesla NACS"];
const AMENITIES     = ["WiFi","Restroom","Cafe","Parking","Security","Covered","24/7 Staff"];
const POWER_SOURCES = ["grid","solar","wind","hybrid"];
const STATION_TYPES = [
  { value: "public",       label: "Public Charging Station" },
  { value: "battery_swap", label: "Battery Swap Station 🔋" },
  { value: "home_share",   label: "Home Charger Share 🏠"  },
];

const inputCls = "w-full border border-gray-200 dark:border-[#2d1e5f] bg-white dark:bg-[#0d1117] text-gray-800 dark:text-[#e0d7ff] rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b2ff2] transition";

export default function OperatorForm({ onClose, onSuccess }: Props) {
  const [step, setStep]         = useState<1 | 2 | 3>(1);
  const [geocoding, setGeocoding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors]     = useState<string[]>([]);

  const [form, setForm] = useState({
    name:          "",
    address:       "",
    lat:           "",
    lng:           "",
    stationType:   "public",
    chargerTypes:  [] as string[],
    powerOutput:   "",
    numberOfPorts: "1",
    pricePerKwh:   "",
    priceNote:     "",
    powerSource:   "grid",
    operatingHours:"24/7",
    is24Hours:     true,
    amenities:     [] as string[],
    operatorName:  "",
    operatorPhone: "",
    operatorEmail: "",
  });

  const set = (key: string, value: any) =>
    setForm((p) => ({ ...p, [key]: value }));

  const toggleArray = (key: "chargerTypes" | "amenities", val: string) =>
    set(key, form[key].includes(val)
      ? form[key].filter((v) => v !== val)
      : [...form[key], val]);

  // Auto-geocode address
  const geocodeAddress = async () => {
    if (!form.address.trim()) return;
    setGeocoding(true);
    try {
      const res  = await fetch(`/api/stations/geocode?address=${encodeURIComponent(form.address)}`);
      const data = await res.json();
      if (data.lat) {
        set("lat", String(data.lat));
        set("lng", String(data.lng));
      } else {
        setErrors(["Could not locate address. Try a more specific address."]);
      }
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async () => {
    const required = ["name","address","lat","lng","powerOutput"];
    const missing  = required.filter((f) => !(form as any)[f]);
    if (form.chargerTypes.length === 0) missing.push("connector type");
    if (missing.length) { setErrors([`Please fill in: ${missing.join(", ")}`]); return; }

    setSubmitting(true);
    setErrors([]);
    try {
      const res = await fetch("/api/stations", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          ...form,
          lat:           Number(form.lat),
          lng:           Number(form.lng),
          numberOfPorts: Number(form.numberOfPorts),
          pricePerKwh:   form.pricePerKwh ? Number(form.pricePerKwh) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed");
      onSuccess();
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "Submission failed"]);
    } finally {
      setSubmitting(false);
    }
  };

  const STEPS = ["Station Info", "Charger Details", "Operator Info"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-[#18122b] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-[#2d1e5f]">
          <div>
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">List a Charging Station</h2>
            <p className="text-xs text-gray-400 dark:text-[#8b949e] mt-0.5">Step {step} of 3 — {STEPS[step-1]}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#2d1e5f] transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100 dark:bg-[#21262d]">
          <div className="h-full bg-[#7b2ff2] transition-all duration-500"
            style={{ width: `${(step/3)*100}%` }} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              {errors.map((e, i) => <p key={i} className="text-red-600 dark:text-red-400 text-xs">⚠ {e}</p>)}
            </div>
          )}

          {/* ── Step 1: Station Info ─────────────────────────────────────── */}
          {step === 1 && (
            <>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-[#8b949e] block mb-1.5">Station Type *</label>
                <div className="grid grid-cols-1 gap-2">
                  {STATION_TYPES.map(({ value, label }) => (
                    <label key={value} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                      form.stationType === value
                        ? "border-[#7b2ff2] bg-[#7b2ff2]/5"
                        : "border-gray-200 dark:border-[#2d1e5f] hover:border-[#7b2ff2]/50"
                    }`}>
                      <input type="radio" name="stationType" value={value} checked={form.stationType === value}
                        onChange={() => set("stationType", value)} className="accent-[#7b2ff2]" />
                      <span className="text-sm font-medium text-gray-700 dark:text-[#c4b8e8]">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-[#8b949e] block mb-1.5">Station Name *</label>
                <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Ikeja EV Hub" />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-[#8b949e] block mb-1.5">Address *</label>
                <div className="flex gap-2">
                  <input className={`${inputCls} flex-1`} value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder="Full address including city"
                    onBlur={geocodeAddress}
                  />
                  <Button type="button" onClick={geocodeAddress} disabled={geocoding}
                    className="flex-shrink-0 bg-gray-100 dark:bg-[#2d1e5f] text-gray-700 dark:text-[#c4b8e8] hover:bg-gray-200 rounded-lg text-xs px-3">
                    {geocoding ? "…" : "📍 Locate"}
                  </Button>
                </div>
                {form.lat && form.lng && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    ✓ Located: {Number(form.lat).toFixed(4)}, {Number(form.lng).toFixed(4)}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-[#8b949e] block mb-1.5">Power Source</label>
                <div className="flex gap-2 flex-wrap">
                  {POWER_SOURCES.map((p) => (
                    <button key={p} type="button" onClick={() => set("powerSource", p)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                        form.powerSource === p
                          ? "bg-[#7b2ff2] text-white border-[#7b2ff2]"
                          : "border-gray-200 dark:border-[#2d1e5f] text-gray-600 dark:text-[#8b949e] hover:border-[#7b2ff2]"
                      }`}>
                      {p === "solar" ? "☀️" : p === "wind" ? "💨" : p === "hybrid" ? "🔋" : "⚡"} {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-[#8b949e] block mb-1.5">Operating Hours</label>
                  <input className={inputCls} value={form.operatingHours}
                    onChange={(e) => set("operatingHours", e.target.value)}
                    placeholder="e.g. 6am–10pm" disabled={form.is24Hours} />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-[#c4b8e8]">
                    <input type="checkbox" className="accent-[#7b2ff2]"
                      checked={form.is24Hours}
                      onChange={(e) => set("is24Hours", e.target.checked)} />
                    Open 24/7
                  </label>
                </div>
              </div>
            </>
          )}

          {/* ── Step 2: Charger Details ──────────────────────────────────── */}
          {step === 2 && (
            <>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-[#8b949e] block mb-1.5">Connector Types * (select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {CHARGER_TYPES.map((t) => (
                    <button key={t} type="button" onClick={() => toggleArray("chargerTypes", t)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                        form.chargerTypes.includes(t)
                          ? "bg-[#7b2ff2] text-white border-[#7b2ff2]"
                          : "border-gray-200 dark:border-[#2d1e5f] text-gray-600 dark:text-[#8b949e] hover:border-[#7b2ff2]"
                      }`}>{t}</button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-[#8b949e] block mb-1.5">Power Output *</label>
                  <input className={inputCls} value={form.powerOutput}
                    onChange={(e) => set("powerOutput", e.target.value)} placeholder="e.g. 50kW" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-[#8b949e] block mb-1.5">Number of Ports</label>
                  <input type="number" min="1" className={inputCls} value={form.numberOfPorts}
                    onChange={(e) => set("numberOfPorts", e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-[#8b949e] block mb-1.5">Price per kWh (₦)</label>
                  <input type="number" className={inputCls} value={form.pricePerKwh}
                    onChange={(e) => set("pricePerKwh", e.target.value)} placeholder="Leave blank if free" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-[#8b949e] block mb-1.5">Pricing Note</label>
                  <input className={inputCls} value={form.priceNote}
                    onChange={(e) => set("priceNote", e.target.value)} placeholder="e.g. Free first 30min" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-[#8b949e] block mb-1.5">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES.map((a) => (
                    <button key={a} type="button" onClick={() => toggleArray("amenities", a)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                        form.amenities.includes(a)
                          ? "bg-blue-500 text-white border-blue-500"
                          : "border-gray-200 dark:border-[#2d1e5f] text-gray-600 dark:text-[#8b949e] hover:border-blue-400"
                      }`}>{a}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Step 3: Operator Info ────────────────────────────────────── */}
          {step === 3 && (
            <>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-xs text-amber-700 dark:text-amber-400">
                ℹ Your station will be reviewed and approved by our team before going live on the map (usually within 24 hours).
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-[#8b949e] block mb-1.5">Your Name</label>
                <input className={inputCls} value={form.operatorName}
                  onChange={(e) => set("operatorName", e.target.value)} placeholder="Full name or business name" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-[#8b949e] block mb-1.5">Phone Number</label>
                <input className={inputCls} value={form.operatorPhone}
                  onChange={(e) => set("operatorPhone", e.target.value)} placeholder="+234..." />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-[#8b949e] block mb-1.5">Email</label>
                <input type="email" className={inputCls} value={form.operatorEmail}
                  onChange={(e) => set("operatorEmail", e.target.value)} />
              </div>
            </>
          )}
        </div>

        {/* Footer navigation */}
        <div className="p-5 border-t border-gray-100 dark:border-[#2d1e5f] flex gap-3">
          {step > 1 && (
            <Button variant="outline" className="flex-1 rounded-full"
              onClick={() => setStep((s) => (s - 1) as 1|2|3)}>← Back</Button>
          )}
          {step < 3 ? (
            <Button className="flex-1 bg-[#7b2ff2] text-white rounded-full"
              onClick={() => { setErrors([]); setStep((s) => (s + 1) as 1|2|3); }}>
              Continue →
            </Button>
          ) : (
            <Button className="flex-1 bg-[#238636] hover:bg-[#2ea043] text-white rounded-full"
              onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit for Approval ✓"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}