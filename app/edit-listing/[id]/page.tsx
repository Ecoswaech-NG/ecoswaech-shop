"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Props { params: Promise<{ id: string }> }

const inputCls =
  "w-full border border-gray-200 dark:border-[#2d1e5f] bg-white dark:bg-[#18122b] " +
  "text-gray-800 dark:text-[#e0d7ff] rounded-lg p-2.5 text-sm focus:outline-none " +
  "focus:ring-2 focus:ring-[#7b2ff2] transition";

export default function EditListingPage({ params }: Props) {
  const router = useRouter();
  const [id, setId]         = useState<string>("");
  const [form, setForm]     = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState<string | null>(null);

  useEffect(() => {
    params.then(({ id }) => {
      setId(id);
      fetch(`/api/listings/vehicles/${id}`)
        .then((r) => r.json())
        .then((d) => {
          const l = d.listing;
          setForm({
            listingTitle:       l.listingTitle       ?? "",
            sellingPrice:       String(l.sellingPrice ?? ""),
            listingDescription: l.listingDescription ?? "",
            location:           l.location           ?? "",
            offerType:          l.offerType          ?? "",
            color:              l.color              ?? "",
            mileage:            String(l.mileage     ?? ""),
            status:             l.status             ?? "active",
          });
        })
        .finally(() => setLoading(false));
    });
  }, []);

  const handleChange = (name: string, value: string) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/listings/vehicles/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setToast("Listing updated!");
      setTimeout(() => { setToast(null); router.push("/dashboard"); }, 1500);
    } else {
      setToast("Update failed");
      setTimeout(() => setToast(null), 3000);
    }
  };

  const EDITABLE_FIELDS = [
    { key: "listingTitle",       label: "Listing Title",    type: "text"     },
    { key: "sellingPrice",       label: "Selling Price (₦)", type: "number"  },
    { key: "mileage",            label: "Mileage (km)",     type: "number"   },
    { key: "location",           label: "Location",         type: "text"     },
    { key: "color",              label: "Color",            type: "text"     },
    { key: "offerType",          label: "Offer Type",       type: "text"     },
  ];

  const STATUS_OPTIONS = ["active", "sold", "draft", "expired"];

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0822] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#7b2ff2] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0822] px-4 sm:px-10 md:px-20 py-10">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
          toast.includes("failed") ? "bg-red-500" : "bg-[#238636]"
        }`}>
          {toast}
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-[#7b2ff2] transition">
            ← Back
          </button>
          <h1 className="font-bold text-2xl text-gray-900 dark:text-white">Edit Listing</h1>
        </div>

        <div className="bg-white dark:bg-[#18122b] border border-gray-100 dark:border-[#2d1e5f] rounded-2xl p-8 space-y-5">
          {EDITABLE_FIELDS.map(({ key, label, type }) => (
            <div key={key}>
              <label className="text-sm font-medium text-gray-700 dark:text-[#c4b8e8] block mb-1.5">
                {label}
              </label>
              <input
                type={type}
                className={inputCls}
                value={form[key] ?? ""}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            </div>
          ))}

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-[#c4b8e8] block mb-1.5">
              Status
            </label>
            <select
              className={inputCls}
              value={form.status ?? "active"}
              onChange={(e) => handleChange("status", e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-[#c4b8e8] block mb-1.5">
              Description
            </label>
            <textarea
              className={`${inputCls} min-h-[120px] resize-y`}
              value={form.listingDescription ?? ""}
              onChange={(e) => handleChange("listingDescription", e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 rounded-full"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-[#7b2ff2] hover:bg-[#651fff] text-white rounded-full"
            >
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}