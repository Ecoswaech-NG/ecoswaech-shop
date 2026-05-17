"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import Data from "@/Shared/Data";
import carDetails from "@/Shared/carDetails.json";
import features from "@/Shared/features.json";
import ImagePicker, { LocalImage, MIN_IMAGES } from "./components/ImagePicker";
import ListingPreview from "./components/ListingPreview";
import {
  MdTitle, MdBrandingWatermark, MdDevicesOther,
  MdAttachMoney, MdLocationOn, MdDescription,
} from "react-icons/md";
import { FaCarBattery } from "react-icons/fa";
import { GiElectric } from "react-icons/gi";

// ─── Types ────────────────────────────────────────────────────────────────────

type Stage      = "form" | "preview";
type ListingTab = "vehicle" | "charger" | "accessory";
type VehicleForm   = Record<string, string>;
type FeaturesForm  = Record<string, boolean>;
type ChargerForm   = Record<string, string | number>;
type AccessoryForm = Record<string, string | number>;

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls =
  "w-full border border-gray-200 dark:border-[#2d1e5f] bg-white dark:bg-[#18122b] " +
  "text-gray-800 dark:text-[#e0d7ff] rounded-lg p-2.5 text-sm focus:outline-none " +
  "focus:ring-2 focus:ring-[#7b2ff2] transition";

const labelCls =
  "text-sm font-medium text-gray-700 dark:text-[#c4b8e8] flex items-center gap-2 mb-1.5";

function Label({ icon, children, required }: {
  icon?: React.ReactNode; children: React.ReactNode; required?: boolean;
}) {
  return (
    <label className={labelCls}>
      {icon && <span className="text-[#7b2ff2]">{icon}</span>}
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-6">{children}</h3>;
}

// ─── Dynamic dropdown resolver ────────────────────────────────────────────────

function resolveOptions(item: any, form: VehicleForm): string[] {
  if (item.options)         return item.options;
  if (item.name === "category") return item.optionsByCategory?.[form.type ?? ""] ?? [];
  if (item.name === "make")     return item.optionsByCategory?.[form.category ?? ""] ?? [];
  if (item.name === "model")    return item.optionsByMake?.[form.make ?? ""] ?? [];
  return [];
}

function VehicleField({ item, form, onChange }: {
  item: any; form: VehicleForm; onChange: (name: string, val: string) => void;
}) {
  const options = resolveOptions(item, form);
  const value   = form[item.name] ?? "";
  const isDisabled =
    (item.name === "category" && !form.type) ||
    (item.name === "make"     && !form.category) ||
    (item.name === "model"    && !form.make);
  const hint =
    item.name === "category" ? "Select a vehicle type first" :
    item.name === "make"     ? "Select a category first" :
    item.name === "model"    ? "Select a make first" : "";

  return (
    <div className={item.fieldType === "textarea" ? "md:col-span-2" : ""}>
      <Label required={item.required}>{item.label}</Label>
      {item.fieldType === "text" || item.fieldType === "number" ? (
        <input
          type={item.fieldType === "number" ? "number" : "text"}
          className={inputCls} value={value}
          onChange={(e) => onChange(item.name, e.target.value)}
          required={item.required}
        />
      ) : item.fieldType === "dropdown" ? (
        <>
          <select
            className={`${inputCls} ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
            value={value}
            onChange={(e) => onChange(item.name, e.target.value)}
            disabled={isDisabled} required={item.required}
          >
            <option value="">{isDisabled ? hint : `Select ${item.label}`}</option>
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          {isDisabled && <p className="text-xs text-amber-400 mt-1">{hint}</p>}
        </>
      ) : item.fieldType === "textarea" ? (
        <textarea
          className={`${inputCls} min-h-[100px] resize-y`}
          value={value}
          onChange={(e) => onChange(item.name, e.target.value)}
          required={item.required}
        />
      ) : null}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AddListing() {
  const { user, userLoggedIn } = useAuth();
  const router = useRouter();

  const [stage,     setStage]     = useState<Stage>("form");
  const [activeTab, setActiveTab] = useState<ListingTab>("vehicle");

  const [vehicleForm,   setVehicleForm]   = useState<VehicleForm>({});
  const [featuresForm,  setFeaturesForm]  = useState<FeaturesForm>({});
  const [localImages,   setLocalImages]   = useState<LocalImage[]>([]);
  const [imageErrors,   setImageErrors]   = useState<string[]>([]);

  const [chargerForm,   setChargerForm]   = useState<ChargerForm>({});
  const [accessoryForm, setAccessoryForm] = useState<AccessoryForm>({});
  const [submitting,    setSubmitting]    = useState(false);

  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 5000);
  };

  // ── Vehicle ───────────────────────────────────────────────────────────────

  const handleVehicleChange = (name: string, value: string) => {
    setVehicleForm((prev) => {
      if (name === "type")     return { ...prev, type: value, category: "", make: "", model: "" };
      if (name === "category") return { ...prev, category: value, make: "", model: "" };
      if (name === "make")     return { ...prev, make: value, model: "" };
      return { ...prev, [name]: value };
    });
  };

  const handleFeatureChange = (name: string, value: boolean) =>
    setFeaturesForm((prev) => ({ ...prev, [name]: value }));

  const requiredFields = [
    "location","type","sellingPrice","category","condition",
    "make","model","year","driveType","range","power","mileage",
    "batterySize","maxSpeed","color","door","listingDescription",
  ];
  const missingFields = requiredFields.filter((f) => !vehicleForm[f]);
  const canPreview    = missingFields.length === 0 && localImages.length >= MIN_IMAGES;

  // ── Charger ───────────────────────────────────────────────────────────────

  const handleChargerChange = (name: string, value: string | number) =>
    setChargerForm((prev) => ({ ...prev, [name]: value }));

  const [chargerImages,       setChargerImages]       = useState<LocalImage[]>([]);
  const [chargerCompliance,   setChargerCompliance]   = useState<any>({});
  const [chargerUploadedUrls, setChargerUploadedUrls] = useState<{ imageUrl: string }[]>([]);

  const onSubmitCharger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userLoggedIn || !user) { showToast("Sign in required.", false); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/listings/chargers", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...chargerForm, createdBy: user.email, userName: user.fullName, images: chargerUploadedUrls }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setChargerForm({});
      showToast("Charger listed!");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed", false);
    } finally { setSubmitting(false); }
  };

  // ── Accessory ─────────────────────────────────────────────────────────────

  const handleAccessoryChange = (name: string, value: string | number) =>
    setAccessoryForm((prev) => ({ ...prev, [name]: value }));

  const [accessoryImages,       setAccessoryImages]       = useState<LocalImage[]>([]);
  const [accessoryCompliance,   setAccessoryCompliance]   = useState<any>({
    certifications:        [],
    hasNoWatermarks:       false,
    hasNoMisleadingRender: false,
    includesSpecs:         false,
    includesUseCase:       false,
    includesInstallation:  false,
    includesSafetyWarning: false,
  });
  const [accessoryUploadedUrls, setAccessoryUploadedUrls] = useState<{ imageUrl: string }[]>([]);

  const onSubmitAccessory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userLoggedIn || !user) { showToast("Sign in required.", false); return; }
    setSubmitting(true);
    try {
      const compatibleWith = typeof accessoryForm.compatible_with === "string"
        ? accessoryForm.compatible_with.split(",").map((s) => s.trim()).filter(Boolean) : [];
      const res = await fetch("/api/listings/accessories", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...accessoryForm, compatibleWith, createdBy: user.email, userName: user.fullName, images: accessoryUploadedUrls }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setAccessoryForm({});
      showToast("Accessory listed!");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed", false);
    } finally { setSubmitting(false); }
  };

  const tabs: { key: ListingTab; label: string }[] = [
    { key: "vehicle",   label: "🚗 Vehicle" },
    { key: "charger",   label: "⚡ Charger" },
    { key: "accessory", label: "🔧 Accessory / Parts" },
  ];

  // ── Preview screen ────────────────────────────────────────────────────────

  if (stage === "preview" && activeTab === "vehicle") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0822] px-4 sm:px-10 md:px-20 py-10">
        {toast && (
          <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.ok ? "bg-[#238636]" : "bg-red-500"}`}>
            {toast.msg}
          </div>
        )}
        <ListingPreview
          form={vehicleForm}
          features={featuresForm}
          images={localImages}
          userName={user?.fullName ?? ""}
          userEmail={user?.email ?? ""}
          userId={user?.id ?? ""}
          onEdit={() => setStage("form")}
          onPublished={(id) => {
            showToast("Listing published!");
            router.push(`/listing-details/${id}`);
          }}
          onError={(msg) => {
            showToast(msg, false);
            setStage("form");
          }}
        />
      </div>
    );
  }

  // ── Form screen ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0822] px-4 sm:px-10 md:px-20 py-10">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.ok ? "bg-[#238636]" : "bg-red-500"}`}>
          {toast.msg}
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-6">
        {["Fill Details", "Preview", "Publish"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              i === 0 ? "bg-[#7b2ff2] text-white" : "bg-gray-200 dark:bg-[#21262d] text-gray-400"
            }`}>{i + 1}</div>
            <span className={`text-xs font-medium hidden sm:block ${i === 0 ? "text-[#7b2ff2]" : "text-gray-400"}`}>{s}</span>
            {i < 2 && <div className="w-8 h-px bg-gray-200 dark:bg-[#21262d]" />}
          </div>
        ))}
      </div>

      <h1 className="font-bold text-3xl text-gray-900 dark:text-white mb-1">Add New Listing</h1>
      <p className="text-gray-400 text-sm mb-8">
        Fill in details and select photos, then preview before publishing.
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-[#7b2ff2] text-white shadow"
                : "bg-white dark:bg-[#18122b] border border-gray-200 dark:border-[#2d1e5f] text-gray-600 dark:text-[#c4b8e8] hover:border-[#7b2ff2]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── VEHICLE FORM ────────────────────────────────────────────────────── */}
      {activeTab === "vehicle" && (
        <div className="bg-white dark:bg-[#18122b] border border-gray-100 dark:border-[#2d1e5f] rounded-2xl p-8 space-y-8">

          {/* Details */}
          <div>
            <SectionTitle>Vehicle Details</SectionTitle>
            {vehicleForm.type && (
              <div className="mb-4 text-xs text-[#7b2ff2] bg-purple-50 dark:bg-[#2d1e5f]/40 px-4 py-2 rounded-lg">
                {[vehicleForm.type, vehicleForm.category, vehicleForm.make, vehicleForm.model].filter(Boolean).join(" → ")}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {(carDetails.carDetails as any[]).map((item, i) => (
                <VehicleField key={i} item={item} form={vehicleForm} onChange={handleVehicleChange} />
              ))}
            </div>
          </div>

          <Separator className="dark:bg-[#2d1e5f]" />

          {/* Features */}
          <div>
            <SectionTitle>Features</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(features.features as any[]).map((item, i) => (
                <label key={i} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-[#c4b8e8]">
                  <Checkbox
                    checked={!!featuresForm[item.name]}
                    onCheckedChange={(val) => handleFeatureChange(item.name, !!val)}
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          <Separator className="dark:bg-[#2d1e5f]" />

          {/* Image picker — select locally, no upload yet */}
          <ImagePicker
            images={localImages}
            onChange={setLocalImages}
            errors={imageErrors}
            onErrors={setImageErrors}
          />

          <Separator className="dark:bg-[#2d1e5f]" />

          {/* Preview button */}
          <div className="flex flex-col items-end gap-2">
            {!canPreview && (
              <p className="text-xs text-amber-500 text-right">
                {missingFields.length > 0
                  ? `Complete required fields: ${missingFields.slice(0, 3).join(", ")}${missingFields.length > 3 ? ` +${missingFields.length - 3} more` : ""}`
                  : `Add ${MIN_IMAGES - localImages.length} more photo${MIN_IMAGES - localImages.length !== 1 ? "s" : ""} to preview`
                }
              </p>
            )}
            <Button
              type="button"
              onClick={() => setStage("preview")}
              disabled={!canPreview}
              className="bg-[#7b2ff2] hover:bg-[#651fff] text-white px-8 rounded-full disabled:opacity-40"
            >
              Preview Listing →
            </Button>
          </div>
        </div>
      )}

      {/* ── CHARGER FORM ────────────────────────────────────────────────────── */}
      {activeTab === "charger" && (
        <form onSubmit={onSubmitCharger} className="bg-white dark:bg-[#18122b] border border-gray-100 dark:border-[#2d1e5f] rounded-2xl p-8">
          <SectionTitle>Charger Details</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><Label icon={<MdTitle />} required>Listing Title</Label>
              <input className={inputCls} value={(chargerForm.listingTitle as string)||""} onChange={(e)=>handleChargerChange("listingTitle",e.target.value)} required/></div>
            <div><Label icon={<MdBrandingWatermark />} required>Brand</Label>
              <input className={inputCls} value={(chargerForm.brand as string)||""} onChange={(e)=>handleChargerChange("brand",e.target.value)} required/></div>
            <div><Label icon={<FaCarBattery />} required>Model</Label>
              <input className={inputCls} value={(chargerForm.model as string)||""} onChange={(e)=>handleChargerChange("model",e.target.value)} required/></div>
            <div><Label icon={<MdDevicesOther />} required>Type</Label>
              <select className={inputCls} value={(chargerForm.type as string)||""} onChange={(e)=>handleChargerChange("type",e.target.value)} required>
                <option value="">Select</option>
                {["Home Charger","AC Station","DC Station"].map(o=><option key={o}>{o}</option>)}
              </select></div>
            <div><Label icon={<MdDevicesOther />} required>Specification</Label>
              <select className={inputCls} value={(chargerForm.specification as string)||""} onChange={(e)=>handleChargerChange("specification",e.target.value)} required>
                <option value="">Select</option>
                {["SJAE","CHADEMO","Type 2","Type 1"].map(o=><option key={o}>{o}</option>)}
              </select></div>
            <div><Label icon={<GiElectric />} required>Power</Label>
              <input className={inputCls} value={(chargerForm.power as string)||""} onChange={(e)=>handleChargerChange("power",e.target.value)} required/></div>
            <div><Label icon={<MdAttachMoney />} required>Price (₦)</Label>
              <input type="number" className={inputCls} value={(chargerForm.price as string)||""} onChange={(e)=>handleChargerChange("price",Number(e.target.value))} required/></div>
            <div><Label icon={<MdLocationOn />} required>Location</Label>
              <select className={inputCls} value={(chargerForm.location as string)||""} onChange={(e)=>handleChargerChange("location",e.target.value)} required>
                <option value="">Select Location</option>
                {Data.Location?.map((loc:any)=><option key={loc.id} value={loc.name}>{loc.name}</option>)}
              </select></div>
            <div className="md:col-span-2"><Label icon={<MdDescription />}>Description</Label>
              <textarea className={`${inputCls} min-h-[100px] resize-y`} value={(chargerForm.description as string)||""} onChange={(e)=>handleChargerChange("description",e.target.value)}/></div>
          </div>
          <Separator className="my-8 dark:bg-[#2d1e5f]"/>

          <ImagePicker
            images={chargerImages}
            onChange={setChargerImages}
            errors={imageErrors}
            onErrors={setImageErrors}
          />

          <Separator className="my-8 dark:bg-[#2d1e5f]"/>
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting} className="bg-[#7b2ff2] hover:bg-[#651fff] text-white px-8 rounded-full">
              {submitting?"Posting...":"Post Charger"}
            </Button>
          </div>
        </form>
      )}

      {/* ── ACCESSORY FORM ────────────────────────────────────────────────────── */}
      {activeTab === "accessory" && (
        <form onSubmit={onSubmitAccessory} className="bg-white dark:bg-[#18122b] border border-gray-100 dark:border-[#2d1e5f] rounded-2xl p-8">
          <SectionTitle>Accessory / Spare Parts</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><Label icon={<MdTitle />} required>Product Name</Label>
              <input className={inputCls} value={(accessoryForm.name as string)||""} onChange={(e)=>handleAccessoryChange("name",e.target.value)} required/></div>
            <div><Label icon={<MdBrandingWatermark />} required>Brand</Label>
              <input className={inputCls} value={(accessoryForm.brand as string)||""} onChange={(e)=>handleAccessoryChange("brand",e.target.value)} required/></div>
            <div><Label icon={<MdAttachMoney />} required>Price (₦)</Label>
              <input type="number" className={inputCls} value={(accessoryForm.price as string)||""} onChange={(e)=>handleAccessoryChange("price",Number(e.target.value))} required/></div>
            <div><Label icon={<MdLocationOn />} required>Location</Label>
              <select className={inputCls} value={(accessoryForm.location as string)||""} onChange={(e)=>handleAccessoryChange("location",e.target.value)} required>
                <option value="">Select Location</option>
                {Data.Location?.map((loc:any)=><option key={loc.id} value={loc.name}>{loc.name}</option>)}
              </select></div>
            <div className="md:col-span-2"><Label icon={<MdDevicesOther />}>Compatible With</Label>
              <input className={inputCls} value={(accessoryForm.compatible_with as string)||""} onChange={(e)=>handleAccessoryChange("compatible_with",e.target.value)} placeholder="e.g. Tesla, Nissan"/></div>
            <div className="md:col-span-2"><Label icon={<MdDescription />}>Description</Label>
              <textarea className={`${inputCls} min-h-[100px] resize-y`} value={(accessoryForm.description as string)||""} onChange={(e)=>handleAccessoryChange("description",e.target.value)}/></div>
          </div>
          <Separator className="my-8 dark:bg-[#2d1e5f]"/>

          <ImagePicker
            images={accessoryImages}
            onChange={setAccessoryImages}
            errors={imageErrors}
            onErrors={setImageErrors}
          />

          <Separator className="my-8 dark:bg-[#2d1e5f]"/>
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting} className="bg-[#7b2ff2] hover:bg-[#651fff] text-white px-8 rounded-full">
              {submitting?"Posting...":"Post Accessory"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}