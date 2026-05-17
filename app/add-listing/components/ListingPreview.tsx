"use client";

import { useState } from "react";
import { FaCheck } from "react-icons/fa";
import { IoCalendarSharp, IoSpeedometer } from "react-icons/io5";
import { PiGearFineFill } from "react-icons/pi";
import { FaCarSide } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { supabase, BUCKET } from "@/lib/supabase";
import type { LocalImage } from "./ImagePicker";
import { MIN_IMAGES } from "./ImagePicker";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ListingPreviewProps {
  form:       Record<string, string>;
  features:   Record<string, boolean>;
  images:     LocalImage[];
  userName:   string;
  userEmail:  string;
  userId:     string;
  onEdit:     () => void;
  onPublished:(listingId: number) => void;
  onError:    (msg: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SPECS = [
  { label: "Make",       key: "make"        },
  { label: "Model",      key: "model"       },
  { label: "Year",       key: "year"        },
  { label: "Type",       key: "type"        },
  { label: "Category",   key: "category"    },
  { label: "Condition",  key: "condition"   },
  { label: "Drive Type", key: "driveType"   },
  { label: "Color",      key: "color"       },
  { label: "Doors",      key: "door"        },
  { label: "Range",      key: "range",      suffix: " km"   },
  { label: "Power",      key: "power"                       },
  { label: "Max Speed",  key: "maxSpeed",   suffix: " km/h" },
  { label: "Battery",    key: "batterySize", suffix: " kWh" },
  { label: "Mileage",    key: "mileage",    suffix: " km"   },
  { label: "VIN",        key: "vin"                         },
];

function Badge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 bg-blue-50 dark:bg-[#1f1340] rounded-full px-3 py-2">
      <span className="text-blue-900 dark:text-[#c4b8e8]">{icon}</span>
      <span className="text-blue-900 dark:text-[#c4b8e8] text-xs font-medium">{label}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#18122b] rounded-2xl p-5 border border-gray-100 dark:border-[#2d1e5f] shadow-sm">
      {title && (
        <h3 className="text-xs font-semibold text-gray-500 dark:text-[#8b949e] tracking-widest uppercase mb-4">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ListingPreview({
  form, features, images, userName, userEmail, userId,
  onEdit, onPublished, onError,
}: ListingPreviewProps) {
  const [stage, setStage]       = useState<"idle" | "uploading" | "saving">("idle");
  const [progress, setProgress] = useState(0);

  const activeFeatures = Object.entries(features)
    .filter(([, v]) => v)
    .map(([k]) => k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()));

  // Checklist items
  const checks = [
    { label: "5+ photos selected",   ok: images.length >= MIN_IMAGES  },
    { label: "Title added",           ok: !!form.listingTitle           },
    { label: "Price set",             ok: !!form.sellingPrice           },
    { label: "Description written",   ok: !!form.listingDescription     },
    { label: "VIN provided",          ok: !!form.vin                    },
    { label: "Location set",          ok: !!form.location               },
  ];

  const ready = images.length >= MIN_IMAGES;

  // ── Single publish action: upload → save listing → save image URLs ─────────
  const handlePublish = async () => {
    if (!ready) return;
    setStage("uploading");
    setProgress(0);

    try {
      // 1. Upload all images to Supabase Storage
      const uploadedUrls: string[] = [];

      for (let i = 0; i < images.length; i++) {
        const { file, hash } = images[i];
        const ext  = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${userId}/${hash}.${ext}`;

        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { contentType: file.type, upsert: false });

        // "already exists" just means same image was uploaded before — use it
        if (error && !error.message.includes("already exists")) {
          throw new Error(`Image upload failed: ${file.name}`);
        }

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        uploadedUrls.push(data.publicUrl);
        setProgress(Math.round(((i + 1) / images.length) * 100));
      }

      // 2. Save the listing
      setStage("saving");

      const listingRes = await fetch("/api/listings/vehicles", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          features:  features,
          createdBy: userEmail,
          userName,
          postedOn:  new Date().toISOString(),
        }),
      });

      const listingData = await listingRes.json();
      if (!listingRes.ok) throw new Error(listingData.error ?? "Failed to save listing");

      // 3. Link image URLs to the listing
      const imagesRes = await fetch(`/api/listings/vehicles/${listingData.id}/images`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: uploadedUrls.map((url) => ({ imageUrl: url })),
        }),
      });

      if (!imagesRes.ok) throw new Error("Failed to save image references");

      onPublished(listingData.id);

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      onError(msg);
      setStage("idle");
      setProgress(0);
    }
  };

  const isPublishing = stage !== "idle";

  return (
    <div className="space-y-6">

      {/* Banner */}
      <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">👁</span>
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">Preview Mode</p>
            <p className="text-amber-600 dark:text-amber-400 text-xs">
              This is exactly how buyers will see your listing.
            </p>
          </div>
        </div>
        <button onClick={onEdit} className="text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline ml-4 flex-shrink-0">
          ← Edit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left ─────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Image gallery */}
          <div className="space-y-3">
            <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-[#2d1e5f]">
              <img
                src={images[0]?.preview}
                alt="Cover"
                className="w-full h-[320px] sm:h-[400px] object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <div key={img.hash}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      i === 0 ? "border-[#7b2ff2]" : "border-transparent opacity-60"
                    }`}
                  >
                    <img src={img.preview} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Header */}
          <Section title="">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="font-bold text-2xl text-gray-900 dark:text-white">
                  {form.listingTitle || `${form.year} ${form.make} ${form.model}`}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  📍 {form.location} &nbsp;·&nbsp; {form.condition}
                </p>
              </div>
              {form.offerType && (
                <span className="flex-shrink-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {form.offerType}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {form.year        && <Badge icon={<IoCalendarSharp className="h-4 w-4" />} label={form.year} />}
              {form.mileage     && <Badge icon={<IoSpeedometer    className="h-4 w-4" />} label={`${Number(form.mileage).toLocaleString()} km`} />}
              {form.range       && <Badge icon={<PiGearFineFill   className="h-4 w-4" />} label={`${form.range} km range`} />}
              {form.batterySize && <Badge icon={<FaCarSide        className="h-4 w-4" />} label={`${form.batterySize} kWh`} />}
            </div>
          </Section>

          {/* Description */}
          {form.listingDescription && (
            <Section title="Description">
              <p className="text-gray-700 dark:text-[#c4b8e8] text-sm leading-relaxed whitespace-pre-line">
                {form.listingDescription}
              </p>
            </Section>
          )}

          {/* Specs */}
          <Section title="Specifications">
            <div className="divide-y divide-gray-100 dark:divide-[#2d1e5f]">
              {SPECS.map(({ label, key, suffix }) => {
                const val = form[key];
                if (!val) return null;
                return (
                  <div key={key} className="flex justify-between py-2.5 text-sm">
                    <span className="text-gray-500 dark:text-[#8b949e]">{label}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{val}{suffix ?? ""}</span>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* Features */}
          {activeFeatures.length > 0 && (
            <Section title="Features">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {activeFeatures.map((feat) => (
                  <div key={feat} className="flex gap-2 items-center text-sm text-gray-700 dark:text-[#c4b8e8]">
                    <FaCheck className="text-xs p-1 w-5 h-5 rounded-full bg-blue-100 dark:bg-[#2d1e5f] text-blue-600 dark:text-[#58a6ff] flex-shrink-0" />
                    {feat}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* ── Right ────────────────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Price */}
          <Section title="Price">
            <p className="font-bold text-4xl text-[#220a77] dark:text-white">
              ₦{form.sellingPrice ? Number(form.sellingPrice).toLocaleString() : "—"}
            </p>
          </Section>

          {/* Seller */}
          <Section title="Seller">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#7b2ff2] flex items-center justify-center text-white font-bold text-sm">
                {userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900 dark:text-white">{userName}</p>
                <p className="text-xs text-gray-400 dark:text-[#8b949e]">{userEmail}</p>
              </div>
            </div>
          </Section>

          {/* Checklist */}
          <Section title="Listing Checklist">
            {checks.map(({ label, ok }) => (
              <div key={label} className="flex items-center gap-2 py-1.5 text-xs">
                <span className={ok ? "text-[#3fb950]" : "text-gray-300 dark:text-[#484f58]"}>
                  {ok ? "✓" : "○"}
                </span>
                <span className={ok ? "text-gray-700 dark:text-[#c4b8e8]" : "text-gray-400 dark:text-[#484f58]"}>
                  {label}
                </span>
              </div>
            ))}
          </Section>
        </div>
      </div>

      {/* ── Upload progress ──────────────────────────────────────────────────── */}
      {isPublishing && (
        <div className="bg-white dark:bg-[#18122b] rounded-2xl p-5 border border-gray-100 dark:border-[#2d1e5f] space-y-3">
          <p className="text-sm font-medium text-gray-700 dark:text-[#c4b8e8]">
            {stage === "uploading" ? `Uploading photos… ${progress}%` : "Saving listing…"}
          </p>
          <div className="h-2 bg-gray-100 dark:bg-[#21262d] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#7b2ff2] transition-all duration-300 rounded-full"
              style={{ width: stage === "saving" ? "100%" : `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Sticky submit bar ────────────────────────────────────────────────── */}
      <div className="sticky bottom-0 bg-white dark:bg-[#0a0822] border-t border-gray-200 dark:border-[#2d1e5f] px-4 py-4 -mx-4 flex items-center justify-between gap-4 z-10">
        <button
          onClick={onEdit}
          disabled={isPublishing}
          className="px-6 py-2.5 rounded-full text-sm font-semibold border border-gray-200 dark:border-[#2d1e5f] text-gray-600 dark:text-[#c4b8e8] hover:border-[#7b2ff2] transition-all disabled:opacity-40"
        >
          ← Back to Edit
        </button>

        <div className="flex flex-col items-end gap-1">
          <Button
            onClick={handlePublish}
            disabled={!ready || isPublishing}
            className="bg-[#238636] hover:bg-[#2ea043] text-white px-8 py-2.5 rounded-full font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPublishing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {stage === "uploading" ? `Uploading ${progress}%…` : "Publishing…"}
              </span>
            ) : "✓ Publish Listing"}
          </Button>
          {!ready && (
            <p className="text-xs text-amber-500">
              {images.length}/{MIN_IMAGES} photos — add {MIN_IMAGES - images.length} more
            </p>
          )}
        </div>
      </div>
    </div>
  );
}