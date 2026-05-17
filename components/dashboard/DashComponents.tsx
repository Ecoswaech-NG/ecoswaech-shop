// ─── MyFavorites ──────────────────────────────────────────────────────────────
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { FaCarSide, FaTruck } from "react-icons/fa";
import { MdDeliveryDining } from "react-icons/md";
import { BsLightningCharge } from "react-icons/bs";
import { GiAutoRepair } from "react-icons/gi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Data from "@/Shared/Data";

interface FavListing {
  id: number; listingTitle: string | null; make: string; model: string;
  year: number; sellingPrice: number; mileage: number; condition: string;
  images: { imageUrl: string }[];
}

const FALLBACK = "https://cloudfront-eu-central-1.images.arcpublishing.com/thenational/C7BBKEO5NNNFT6CUY7TGRDHX44.jpg";

export function MyFavorites() {
  const { user } = useAuth();
  const storageKey = `favs_${user?.email ?? "guest"}`;
  const [ids, setIds]         = useState<number[]>([]);
  const [listings, setListings] = useState<FavListing[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    try { setIds(JSON.parse(localStorage.getItem(storageKey) ?? "[]")); }
    catch { setIds([]); }
  }, [user]);

  useEffect(() => {
    if (!ids.length) { setLoading(false); return; }
    fetch(`/api/listings/batch?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((d) => setListings(d.listings ?? []))
      .finally(() => setLoading(false));
  }, [ids]);

  const remove = (id: number) => {
    const next = ids.filter((x) => x !== id);
    setIds(next);
    setListings((prev) => prev.filter((l) => l.id !== id));
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  return (
    <div>
      <h2 className="font-bold text-2xl text-gray-900 dark:text-white mb-6">
        Saved Vehicles <span className="text-gray-400 text-lg font-normal">({ids.length})</span>
      </h2>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({length:3}).map((_,i)=>(
            <div key={i} className="h-56 rounded-2xl bg-gray-100 dark:bg-[#18122b] animate-pulse"/>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20">
          <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="font-semibold text-gray-600 dark:text-white">No saved vehicles</p>
          <p className="text-sm text-gray-400 mt-1">Bookmark listings from the search page</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((l) => (
            <div key={l.id} className="bg-white dark:bg-[#18122b] rounded-2xl border border-gray-100 dark:border-[#2d1e5f] overflow-hidden shadow-sm">
              <img src={l.images[0]?.imageUrl || FALLBACK} alt="" className="w-full h-40 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">
                  {l.listingTitle || `${l.year} ${l.make} ${l.model}`}
                </h3>
                <p className="font-bold text-[#7b2ff2] dark:text-[#c4b8e8] text-sm mt-1">
                  ₦{Number(l.sellingPrice).toLocaleString()}
                </p>
                <div className="flex gap-2 mt-3">
                  <Link href={`/listing-details/${l.id}`} className="flex-1">
                    <button className="w-full py-1.5 text-xs font-semibold bg-[#7b2ff2] text-white rounded-lg hover:bg-[#651fff] transition">View</button>
                  </Link>
                  <button onClick={() => remove(l.id)}
                    className="px-3 py-1.5 text-xs font-semibold border border-gray-200 dark:border-[#2d1e5f] text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MyRentals ────────────────────────────────────────────────────────────────

interface Rental {
  id: number;
  vehicle: string;
  location: string;
  daily: number | null;
  weekly: number | null;
  monthly: number | null;
  deposit: number | null;
  minAge: number | null;
  insurance: boolean;
  delivery: boolean;
  deliveryFee: number | null;
  rules: string | null;
  status: string;
  images: { imageUrl: string }[];
  createdAt: string;
}

export function MyRentals() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    vehicle: "", location: "", daily: "", weekly: "", monthly: "",
    deposit: "", minAge: "", insurance: false, delivery: false,
    deliveryFee: "", rules: "",
  });

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/listings/my-rentals");
      const data = await res.json();
      setRentals(data.rentals || []);
    } catch (err) {
      console.error("Error fetching rentals:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      await fetch("/api/listings/rentals", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          daily:       form.daily       ? Number(form.daily)       : null,
          weekly:      form.weekly      ? Number(form.weekly)       : null,
          monthly:     form.monthly     ? Number(form.monthly)      : null,
          deposit:     form.deposit     ? Number(form.deposit)      : null,
          minAge:      form.minAge      ? Number(form.minAge)       : null,
          deliveryFee: form.deliveryFee ? Number(form.deliveryFee)  : null,
          createdBy: user.email, userName: user.fullName,
        }),
      });
      setShowModal(false);
      setForm({ vehicle: "", location: "", daily: "", weekly: "", monthly: "", deposit: "", minAge: "", insurance: false, delivery: false, deliveryFee: "", rules: "" });
      fetchRentals();
    } finally { setSubmitting(false); }
  };

  const inputCls = "w-full border border-gray-200 dark:border-[#2d1e5f] bg-white dark:bg-[#18122b] text-gray-800 dark:text-[#e0d7ff] rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b2ff2] transition";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-2xl text-gray-900 dark:text-white">My Rental Listings</h2>
        <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-full px-5" onClick={() => setShowModal(true)}>
          + Add Rental
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-gray-100 dark:bg-[#18122b] animate-pulse" />
          ))}
        </div>
      ) : rentals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <FaCarSide className="text-6xl text-gray-200 dark:text-[#2d1e5f] mb-4" />
          <p className="font-semibold text-gray-500 dark:text-[#8b949e]">No rental listings yet</p>
          <Button className="mt-4 bg-[#2563eb] text-white rounded-full px-5" onClick={() => setShowModal(true)}>
            Create First Listing
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rentals.map((rental) => (
            <div key={rental.id} className="bg-white dark:bg-[#18122b] rounded-2xl border border-gray-100 dark:border-[#2d1e5f] overflow-hidden shadow-sm hover:shadow-md transition">
              <div className="relative h-40 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                {rental.images && rental.images.length > 0 ? (
                  <img src={rental.images[0].imageUrl} alt={rental.vehicle} className="w-full h-full object-cover" />
                ) : (
                  <FaCarSide className="text-4xl text-white/60" />
                )}
                <div className="absolute top-3 right-3 px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full">
                  {rental.status}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2">
                  {rental.vehicle}
                </h3>
                <p className="text-sm text-gray-500 dark:text-[#8b949e] mt-1">📍 {rental.location}</p>
                
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  {rental.daily && (
                    <div className="text-center px-2 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-gray-500 dark:text-[#8b949e]">Daily</p>
                      <p className="font-bold text-[#7b2ff2]">₦{Number(rental.daily).toLocaleString()}</p>
                    </div>
                  )}
                  {rental.weekly && (
                    <div className="text-center px-2 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                      <p className="text-gray-500 dark:text-[#8b949e]">Weekly</p>
                      <p className="font-bold text-[#7b2ff2]">₦{Number(rental.weekly).toLocaleString()}</p>
                    </div>
                  )}
                  {rental.monthly && (
                    <div className="text-center px-2 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-gray-500 dark:text-[#8b949e]">Monthly</p>
                      <p className="font-bold text-[#7b2ff2]">₦{Number(rental.monthly).toLocaleString()}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {rental.insurance && (
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                      🛡️ Insurance
                    </span>
                  )}
                  {rental.delivery && (
                    <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full">
                      🚚 Delivery
                    </span>
                  )}
                  {rental.minAge && (
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 rounded-full">
                      📅 Age {rental.minAge}+
                    </span>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <button className="flex-1 py-2 text-xs font-semibold bg-[#7b2ff2] text-white rounded-lg hover:bg-[#651fff] transition">
                    Edit
                  </button>
                  <button className="flex-1 py-2 text-xs font-semibold border border-gray-200 dark:border-[#2d1e5f] text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#18122b] rounded-2xl shadow-2xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button type="button" onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl">×</button>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-5">Create Rental Listing</h3>
            <div className="space-y-4">
              <div>
                <Label>Vehicle</Label>
                <input name="vehicle" className={inputCls} value={form.vehicle} onChange={handleChange} placeholder="e.g. Tesla Model 3" required />
              </div>
              <div>
                <Label>Location</Label>
                <select name="location" className={inputCls} value={form.location} onChange={handleChange} required>
                  <option value="">Select location</option>
                  {Data.Location?.map((l: any) => <option key={l.id} value={l.name}>{l.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Daily (₦)</Label><input name="daily" type="number" className={inputCls} value={form.daily} onChange={handleChange} /></div>
                <div><Label>Weekly (₦)</Label><input name="weekly" type="number" className={inputCls} value={form.weekly} onChange={handleChange} /></div>
                <div><Label>Monthly (₦)</Label><input name="monthly" type="number" className={inputCls} value={form.monthly} onChange={handleChange} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Deposit (₦)</Label><input name="deposit" type="number" className={inputCls} value={form.deposit} onChange={handleChange} /></div>
                <div><Label>Min Age</Label><input name="minAge" type="number" className={inputCls} value={form.minAge} onChange={handleChange} /></div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer text-gray-700 dark:text-[#c4b8e8]">
                  <input type="checkbox" name="insurance" checked={form.insurance as boolean} onChange={handleChange} className="accent-[#7b2ff2]" />
                  Insurance included
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer text-gray-700 dark:text-[#c4b8e8]">
                  <input type="checkbox" name="delivery" checked={form.delivery as boolean} onChange={handleChange} className="accent-[#7b2ff2]" />
                  Delivery available
                </label>
              </div>
              <div>
                <Label>Rules (optional)</Label>
                <textarea name="rules" className={`${inputCls} min-h-[80px] resize-none`} value={form.rules} onChange={handleChange} placeholder="One rule per line" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" type="button" className="flex-1 rounded-full" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="flex-1 bg-[#2563eb] text-white rounded-full">
                {submitting ? "Saving…" : "Create Listing"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ─── MyLogistics ──────────────────────────────────────────────────────────────

const SERVICE_TYPES = ["Vehicle Transport","EV Delivery","Charging Setup","Maintenance"];

export function MyLogistics() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", type: "", description: "", coverage: "",
    pricing: "", contact: "", specializations: "", certifications: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      await fetch("/api/listings/logistics", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, createdBy: user.email, userName: user.fullName }),
      });
      setShowModal(false);
      setForm({ name:"",type:"",description:"",coverage:"",pricing:"",contact:"",specializations:"",certifications:"" });
    } finally { setSubmitting(false); }
  };

  const inputCls = "w-full border border-gray-200 dark:border-[#2d1e5f] bg-white dark:bg-[#18122b] text-gray-800 dark:text-[#e0d7ff] rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b2ff2] transition";

  const CATS = [
    { icon: FaTruck, label: "Vehicle Transport", color: "text-orange-500" },
    { icon: MdDeliveryDining, label: "EV Delivery", color: "text-orange-400" },
    { icon: BsLightningCharge, label: "Charging Setup", color: "text-yellow-500" },
    { icon: GiAutoRepair, label: "Maintenance", color: "text-blue-500" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-2xl text-gray-900 dark:text-white">My Logistics Services</h2>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-5" onClick={() => setShowModal(true)}>
          + Add Service
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {CATS.map(({ icon: Icon, label, color }) => (
          <div key={label} className="flex flex-col items-center bg-white dark:bg-[#18122b] border border-gray-100 dark:border-[#2d1e5f] rounded-2xl p-5 shadow-sm">
            <Icon className={`text-3xl mb-2 ${color}`} />
            <p className="font-semibold text-xs text-center text-gray-700 dark:text-[#c4b8e8]">{label}</p>
            <p className="text-[10px] text-gray-400 dark:text-[#8b949e] mt-1">0 active</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center py-12">
        <FaTruck className="text-5xl text-gray-200 dark:text-[#2d1e5f] mb-4" />
        <p className="font-semibold text-gray-500 dark:text-[#8b949e]">No services yet</p>
        <Button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full px-5" onClick={() => setShowModal(true)}>
          Create First Service
        </Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#18122b] rounded-2xl shadow-2xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button type="button" onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl">×</button>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-5">Create Logistics Service</h3>
            <div className="space-y-4">
              <div><Label>Service Name</Label><input name="name" className={inputCls} value={form.name} onChange={handleChange} required /></div>
              <div>
                <Label>Service Type</Label>
                <select name="type" className={inputCls} value={form.type} onChange={handleChange} required>
                  <option value="">Select type</option>
                  {SERVICE_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div><Label>Description</Label><textarea name="description" className={`${inputCls} min-h-[80px] resize-none`} value={form.description} onChange={handleChange} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Pricing</Label><input name="pricing" className={inputCls} value={form.pricing} onChange={handleChange} placeholder="e.g. ₦150/hr" /></div>
                <div><Label>Contact</Label><input name="contact" className={inputCls} value={form.contact} onChange={handleChange} /></div>
              </div>
              <div><Label>Coverage Areas</Label><textarea name="coverage" className={`${inputCls} min-h-[60px] resize-none`} value={form.coverage} onChange={handleChange} placeholder="Lagos, Abuja..." /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" type="button" className="flex-1 rounded-full" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-full">
                {submitting ? "Saving…" : "Create Service"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}