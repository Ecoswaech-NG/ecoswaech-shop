"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaPhone, FaWhatsapp, FaMapMarkerAlt } from "react-icons/fa";
import { BsDot } from "react-icons/bs";

export default function ProfileTab() {
  const { user } = useAuth();

  const [editMode, setEditMode]   = useState(false);
  const [saving,   setSaving]     = useState(false);
  const [toast,    setToast]      = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName: user?.fullName ?? "",
    phone:    (user as any)?.phone   ?? "",
    bio:      (user as any)?.bio     ?? "",
    city:     (user as any)?.city    ?? "",
    state:    (user as any)?.state   ?? "",
    country:  (user as any)?.country ?? "",
  });

  const handleChange = (key: string, val: string) =>
    setForm((p) => ({ ...p, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      if (res.ok) {
        setToast("Profile updated!");
        setEditMode(false);
      } else {
        setToast("Update failed");
      }
    } catch {
      setToast("Update failed");
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const initials = (form.fullName || user?.email || "U")
    .split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6 max-w-2xl">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
          toast.includes("failed") ? "bg-red-500" : "bg-[#238636]"
        }`}>{toast}</div>
      )}

      {/* Profile card */}
      <div className="bg-white dark:bg-[#18122b] rounded-2xl border border-gray-100 dark:border-[#2d1e5f] p-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-[#7b2ff2] flex items-center justify-center text-white text-xl font-bold">
              {initials}
            </div>
            {editMode && (
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#7b2ff2] rounded-full flex items-center justify-center text-white text-xs hover:bg-[#651fff] transition"
              >
                ✎
              </button>
            )}
            {/* Online dot */}
            <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-[#18122b]" />
            <input ref={fileRef} type="file" accept="image/*" className="hidden" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {editMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label>Full Name</Label>
                  <Input className="mt-1" value={form.fullName} onChange={(e) => handleChange("fullName", e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Bio</Label>
                  <textarea
                    className="w-full mt-1 border border-gray-200 dark:border-[#2d1e5f] bg-white dark:bg-[#0d1117] text-gray-800 dark:text-[#e0d7ff] rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b2ff2] resize-none"
                    rows={3}
                    value={form.bio}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    placeholder="Tell buyers about yourself..."
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input className="mt-1" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="+234..." />
                </div>
                <div>
                  <Label>City</Label>
                  <Input className="mt-1" value={form.city} onChange={(e) => handleChange("city", e.target.value)} />
                </div>
                <div>
                  <Label>State</Label>
                  <Input className="mt-1" value={form.state} onChange={(e) => handleChange("state", e.target.value)} />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input className="mt-1" value={form.country} onChange={(e) => handleChange("country", e.target.value)} />
                </div>
                <div className="sm:col-span-2 flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-full" onClick={() => setEditMode(false)}>Cancel</Button>
                  <Button className="flex-1 bg-[#7b2ff2] text-white rounded-full" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving…" : "Save Profile"}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-xl text-gray-900 dark:text-white">{form.fullName || "Your Name"}</h2>
                    <p className="text-sm text-gray-400 dark:text-[#8b949e]">{user?.email}</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#7b2ff2] text-white rounded-full px-4"
                    onClick={() => setEditMode(true)}
                  >
                    Edit Profile
                  </Button>
                </div>

                {form.bio && (
                  <p className="text-sm text-gray-600 dark:text-[#c4b8e8] mt-3 leading-relaxed">{form.bio}</p>
                )}

                <div className="mt-3 space-y-1.5 text-sm text-gray-600 dark:text-[#c4b8e8]">
                  {form.phone && (
                    <div className="flex items-center gap-2">
                      <FaPhone className="text-gray-400 w-3.5" />
                      <span>{form.phone}</span>
                    </div>
                  )}
                  {(form.city || form.country) && (
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-red-400 w-3.5" />
                      <span>{[form.city, form.state, form.country].filter(Boolean).join(", ")}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <BsDot className="text-green-500 text-2xl -ml-1" />
                    <span className="text-green-500 text-xs font-medium">Online</span>
                  </div>
                </div>

                {form.phone && (
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <a href={`https://wa.me/${form.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition">
                      <FaWhatsapp /> WhatsApp
                    </a>
                    <a href={`tel:${form.phone}`}
                      className="inline-flex items-center gap-1.5 bg-[#220a77] hover:bg-[#7b2ff2] text-white text-xs font-semibold px-3 py-1.5 rounded-full transition">
                      <FaPhone /> Call
                    </a>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}