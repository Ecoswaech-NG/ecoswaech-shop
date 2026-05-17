"use client";

import { useEffect, useState } from "react";
import { FaCarSide, FaTruck } from "react-icons/fa";
import { MdDeliveryDining } from "react-icons/md";
import { BsLightningCharge } from "react-icons/bs";
import { GiAutoRepair } from "react-icons/gi";
import Data from "@/Shared/Data";

// ─── Shared input style ───────────────────────────────────────────────────────

const inputCls =
  "w-full border border-gray-200 dark:border-[#2d1e5f] bg-white dark:bg-[#0d1117] " +
  "text-gray-800 dark:text-[#e0d7ff] rounded-lg px-3 py-2 text-sm focus:outline-none " +
  "focus:ring-2 focus:ring-[#7b2ff2] transition";

// ─── MY RENTALS ───────────────────────────────────────────────────────────────

export function MyRentals() {
  const [rentals, setRentals]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    vehicle: "", location: "", daily: "", weekly: "", monthly: "",
    deposit: "", minAge: "", insurance: false, delivery: false,
    deliveryFee: "", rules: "",
  });

  useEffect(() => {
    fetch("/api/user/rentals").then((r) => r.json())
      .then((d) => setRentals(d.rentals ?? []))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/user/rentals", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setRentals((prev) => [{ id: data.id, ...form }, ...prev]);
        setShowModal(false);
      }
    } finally { setSubmitting(false); }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-bold text-2xl text-gray-900 dark:text-white">My Rental Listings</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your EV rental offerings</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-5 py-2 rounded-full shadow transition text-sm">
          + Add Rental
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-32 rounded-2xl bg-gray-100 dark:bg-[#18122b] animate-pulse" />)}
        </div>
      ) : rentals.length === 0 ? (
        <div className="text-center py-20">
          <FaCarSide className="text-5xl text-gray-300 mx-auto mb-4" />
          <p className="font-semibold text-gray-500 dark:text-gray-400">No rental listings yet</p>
          <button onClick={() => setShowModal(true)}
            className="mt-4 text-sm text-[#7b2ff2] hover:underline font-medium">
            Create your first listing →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rentals.map((r) => (
            <div key={r.id} className="bg-white dark:bg-[#18122b] rounded-2xl border border-gray-100 dark:border-[#2d1e5f] p-5">
              <p className="font-semibold text-gray-900 dark:text-white">{r.vehicle}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">📍 {r.location}</p>
              <div className="flex gap-3 mt-3 text-xs text-gray-600 dark:text-gray-300">
                {r.daily   && <span>₦{Number(r.daily).toLocaleString()}/day</span>}
                {r.weekly  && <span>₦{Number(r.weekly).toLocaleString()}/week</span>}
                {r.monthly && <span>₦{Number(r.monthly).toLocaleString()}/month</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#18122b] rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg text-gray-900 dark:text-white">Create Rental Listing</h2>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500 dark:text-[#8b949e] mb-1 block">Vehicle</label>
                <input name="vehicle" className={inputCls} value={form.vehicle} onChange={handleChange} placeholder="e.g. Tesla Model 3" required />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500 dark:text-[#8b949e] mb-1 block">Pickup Location</label>
                <select name="location" className={inputCls} value={form.location} onChange={handleChange} required>
                  <option value="">Select Location</option>
                  {Data.Location?.map((loc: any) => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
                </select>
              </div>
              {[
                { name: "daily",   label: "Daily Rate (₦)"   },
                { name: "weekly",  label: "Weekly Rate (₦)"  },
                { name: "monthly", label: "Monthly Rate (₦)" },
                { name: "deposit", label: "Security Deposit (₦)" },
                { name: "minAge",  label: "Minimum Age"      },
              ].map(({ name, label }) => (
                <div key={name}>
                  <label className="text-xs text-gray-500 dark:text-[#8b949e] mb-1 block">{label}</label>
                  <input type="number" name={name} className={inputCls} value={(form as any)[name]} onChange={handleChange} />
                </div>
              ))}
              <div className="sm:col-span-2 flex gap-4">
                {[
                  { name: "insurance", label: "Insurance Included" },
                  { name: "delivery",  label: "Delivery Available" },
                ].map(({ name, label }) => (
                  <label key={name} className="flex items-center gap-2 text-sm text-gray-700 dark:text-[#c4b8e8] cursor-pointer">
                    <input type="checkbox" name={name} checked={(form as any)[name]} onChange={handleChange} className="accent-[#7b2ff2]" />
                    {label}
                  </label>
                ))}
              </div>
              {form.delivery && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-[#8b949e] mb-1 block">Delivery Fee (₦)</label>
                  <input type="number" name="deliveryFee" className={inputCls} value={form.deliveryFee} onChange={handleChange} />
                </div>
              )}
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500 dark:text-[#8b949e] mb-1 block">Rental Rules</label>
                <textarea name="rules" className={`${inputCls} min-h-[80px] resize-y`} value={form.rules} onChange={handleChange} placeholder="One rule per line" />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 rounded-full text-sm border border-gray-200 dark:border-[#2d1e5f] text-gray-600 dark:text-[#c4b8e8]">Cancel</button>
              <button type="submit" disabled={submitting} className="px-5 py-2 rounded-full text-sm bg-[#2563eb] text-white font-semibold disabled:opacity-50">
                {submitting ? "Creating…" : "Create Listing"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ─── MY LOGISTICS ─────────────────────────────────────────────────────────────

const SERVICE_TYPES = ["Vehicle Transport", "EV Delivery", "Charging Setup", "Maintenance"];

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  "Vehicle Transport": <FaTruck        className="text-3xl text-orange-500" />,
  "EV Delivery":       <MdDeliveryDining className="text-3xl text-orange-400" />,
  "Charging Setup":    <BsLightningCharge className="text-3xl text-orange-400" />,
  "Maintenance":       <GiAutoRepair   className="text-3xl text-orange-400" />,
};

export function MyLogistics() {
  const [services, setServices]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", type: "", description: "", coverage: "",
    pricing: "", contact: "", specializations: "", certifications: "",
  });

  useEffect(() => {
    fetch("/api/user/logistics").then((r) => r.json())
      .then((d) => setServices(d.services ?? []))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/user/logistics", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setServices((prev) => [{ id: data.id, ...form }, ...prev]);
        setShowModal(false);
      }
    } finally { setSubmitting(false); }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-bold text-2xl text-gray-900 dark:text-white">My Logistics Services</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your EV logistics offerings</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#ff6600] hover:bg-[#ff8533] text-white font-semibold px-5 py-2 rounded-full shadow transition text-sm">
          + Add Service
        </button>
      </div>

      {/* Service type overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {SERVICE_TYPES.map((type) => {
          const count = services.filter((s) => s.type === type).length;
          return (
            <div key={type} className="flex flex-col items-center bg-white dark:bg-[#18122b] border border-gray-100 dark:border-[#2d1e5f] rounded-2xl py-5 px-2">
              {SERVICE_ICONS[type]}
              <p className="font-semibold text-xs text-center mt-2 text-gray-700 dark:text-[#c4b8e8]">{type}</p>
              <p className="text-xs text-gray-400 dark:text-[#484f58] mt-0.5">{count} active</p>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-28 rounded-2xl bg-gray-100 dark:bg-[#18122b] animate-pulse" />)}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-16">
          <FaTruck className="text-5xl text-gray-300 mx-auto mb-4" />
          <p className="font-semibold text-gray-500 dark:text-gray-400">No services yet</p>
          <button onClick={() => setShowModal(true)} className="mt-4 text-sm text-[#7b2ff2] hover:underline font-medium">
            Create your first service →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {services.map((s) => (
            <div key={s.id} className="bg-white dark:bg-[#18122b] rounded-2xl border border-gray-100 dark:border-[#2d1e5f] p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{s.name}</p>
                  <p className="text-xs text-[#7b2ff2] mt-0.5">{s.type}</p>
                </div>
                {SERVICE_ICONS[s.type]}
              </div>
              {s.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{s.description}</p>}
              {s.pricing && <p className="text-xs font-medium text-gray-700 dark:text-[#c4b8e8] mt-2">{s.pricing}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#18122b] rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg text-gray-900 dark:text-white">Create Logistics Service</h2>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-[#8b949e] mb-1 block">Service Name</label>
                <input name="name" className={inputCls} value={form.name} onChange={handleChange} placeholder="e.g. Premium EV Transport" required />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-[#8b949e] mb-1 block">Service Type</label>
                <select name="type" className={inputCls} value={form.type} onChange={handleChange} required>
                  <option value="">Choose type</option>
                  {SERVICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500 dark:text-[#8b949e] mb-1 block">Description</label>
                <textarea name="description" className={`${inputCls} min-h-[80px] resize-y`} value={form.description} onChange={handleChange} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500 dark:text-[#8b949e] mb-1 block">Coverage Areas</label>
                <textarea name="coverage" className={`${inputCls} min-h-[60px] resize-y`} value={form.coverage} onChange={handleChange} placeholder="One area per line" />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-[#8b949e] mb-1 block">Pricing</label>
                <input name="pricing" className={inputCls} value={form.pricing} onChange={handleChange} placeholder="e.g. ₦2/km" />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-[#8b949e] mb-1 block">Contact</label>
                <input name="contact" className={inputCls} value={form.contact} onChange={handleChange} placeholder="Phone or email" />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-[#8b949e] mb-1 block">Specializations</label>
                <input name="specializations" className={inputCls} value={form.specializations} onChange={handleChange} />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-[#8b949e] mb-1 block">Certifications</label>
                <input name="certifications" className={inputCls} value={form.certifications} onChange={handleChange} />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 rounded-full text-sm border border-gray-200 dark:border-[#2d1e5f] text-gray-600 dark:text-[#c4b8e8]">Cancel</button>
              <button type="submit" disabled={submitting} className="px-5 py-2 rounded-full text-sm bg-[#ff6600] text-white font-semibold disabled:opacity-50">
                {submitting ? "Creating…" : "Create Service"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}