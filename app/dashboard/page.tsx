"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reportSchema } from "@/lib/validation/reportSchema";

const STEPS = ["Vehicle", "Battery", "Notes"];

interface FieldProps {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  form: Record<string, string>;
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Field = ({ label, name, placeholder, type = "text", form, errors, onChange }: FieldProps) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-[#8b949e] uppercase tracking-widest">{label}</label>
    <input
      name={name} type={type} value={form[name]} onChange={onChange} placeholder={placeholder}
      className={`w-full bg-[#0d1117] border ${
        errors[name] ? "border-red-500" : "border-[#30363d]"
      } text-white placeholder-[#484f58] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all duration-200`}
    />
    {errors[name] && <p className="text-red-400 text-xs flex items-center gap-1"><span>⚠</span> {errors[name]}</p>}
  </div>
);

export default function Dashboard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    make: "", model: "", year: "",
    vin: "",                // optional — links passport to marketplace listing
    batteryCapacity: "", voltage: "", mileage: "",
    notes: "",
  });
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  };

  const validateStep = () => {
    const stepFields = [["make", "model", "year"], ["batteryCapacity", "voltage", "mileage"], []];
    const result = reportSchema.safeParse(form);
    const allErrors: Record<string, string> = {};
    if (!result.success) result.error.issues.forEach((err) => { allErrors[String(err.path[0])] = err.message; });
    const stepErrors: Record<string, string> = {};
    stepFields[step].forEach((f) => { if (allErrors[f]) stepErrors[f] = allErrors[f]; });
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const next = () => { if (validateStep()) setStep((s) => Math.min(s + 1, 2)); };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/reports/create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (data.success) router.push(`/passport/${data.id}`);
      else alert(data.error ?? "Something went wrong");
    } catch (err) { console.error(err); alert("Network error"); }
    finally { setLoading(false); }
  };

  const progressPct = ((step + 1) / STEPS.length) * 100;

  const liveSoH = () => {
    const v = Number(form.voltage), m = Number(form.mileage);
    if (!form.voltage || !form.mileage || isNaN(v) || isNaN(m)) return null;
    const soh = v > 380 && m < 50000 ? 90 : v > 360 && m < 100000 ? 80 : v > 340 && m < 150000 ? 70 : 60;
    const grade = soh >= 85 ? "A" : soh >= 70 ? "B" : soh >= 50 ? "C" : "D";
    const color = grade === "A" ? "#3fb950" : grade === "B" ? "#58a6ff" : grade === "C" ? "#d29922" : "#f85149";
    return { soh, grade, color };
  };

  const preview = liveSoH();

  return (
    <div className="min-h-screen bg-[#010409] flex items-center justify-center p-6 font-mono">
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(88,166,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(88,166,255,0.03) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }} />
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(35,134,54,0.06) 0%, transparent 70%)" }} />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#238636]/10 border border-[#238636]/30 rounded-full px-3 py-1 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse" />
            <span className="text-[#3fb950] text-xs tracking-widest">ECOSWAP DIAGNOSTIC</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Battery Passport</h1>
          <p className="text-[#8b949e] text-sm mt-1">Complete all sections to generate your report</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex items-center gap-2 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  i < step ? "bg-[#238636] text-white" : i === step ? "bg-[#1f6feb] text-white ring-2 ring-[#1f6feb]/30" : "bg-[#161b22] text-[#484f58] border border-[#30363d]"
                }`}>{i < step ? "✓" : i + 1}</div>
                <span className={`text-xs transition-colors duration-300 ${i === step ? "text-white" : i < step ? "text-[#3fb950]" : "text-[#484f58]"}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px mx-3 transition-all duration-500" style={{ background: i < step ? "#238636" : "#30363d" }} />
              )}
            </div>
          ))}
        </div>

        <div className="h-0.5 bg-[#21262d] rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#1f6feb] to-[#3fb950] transition-all duration-500 ease-out" style={{ width: `${progressPct}%` }} />
        </div>

        <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-6 shadow-2xl">

          {/* Step 0 — Vehicle */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-lg">🚗</span>
                <h2 className="text-white font-semibold">Vehicle Information</h2>
              </div>
              <Field name="make"  label="Make"  placeholder="e.g. Toyota, Tesla, BYD"      form={form} errors={errors} onChange={handleChange} />
              <Field name="model" label="Model" placeholder="e.g. Camry, Model 3, Atto 3"  form={form} errors={errors} onChange={handleChange} />
              <Field name="year"  label="Year"  placeholder="e.g. 2023" type="number"       form={form} errors={errors} onChange={handleChange} />

              {/* VIN — optional, links report to a CarListing by matching VIN */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#8b949e] uppercase tracking-widest">
                  VIN <span className="text-[#484f58] normal-case not-italic font-normal">(optional)</span>
                </label>
                <input
                  name="vin" type="text" value={form.vin} onChange={handleChange}
                  placeholder="e.g. 1HGBH41JXMN109186"
                  className="w-full bg-[#0d1117] border border-[#30363d] text-white placeholder-[#484f58] rounded-lg px-4 py-3 text-sm font-mono tracking-wider focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all duration-200"
                />
                {form.vin ? (
                  <p className="text-[#3fb950] text-xs">✓ Passport will be linked to any matching vehicle listing</p>
                ) : (
                  <p className="text-[#484f58] text-xs">Enter your vehicle's VIN to link this passport to your marketplace listing</p>
                )}
              </div>
            </div>
          )}

          {/* Step 1 — Battery */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-lg">⚡</span>
                <h2 className="text-white font-semibold">Battery Diagnostics</h2>
              </div>
              <Field name="batteryCapacity" label="Battery Capacity (kWh)" placeholder="e.g. 82"    type="number" form={form} errors={errors} onChange={handleChange} />
              <Field name="voltage"         label="Voltage (V)"            placeholder="e.g. 400"   type="number" form={form} errors={errors} onChange={handleChange} />
              <Field name="mileage"         label="Mileage (km)"           placeholder="e.g. 35000" type="number" form={form} errors={errors} onChange={handleChange} />
              {preview && (
                <div className="mt-2 p-3 bg-[#161b22] border border-[#30363d] rounded-lg">
                  <p className="text-xs text-[#8b949e] mb-1">Estimated SoH Grade</p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold" style={{ color: preview.color }}>{preview.grade}</span>
                    <span className="text-white text-sm">{preview.soh}% State of Health</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2 — Notes */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-lg">📋</span>
                <h2 className="text-white font-semibold">Inspection Notes</h2>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#8b949e] uppercase tracking-widest">Notes (optional)</label>
                <textarea name="notes" value={form.notes} onChange={handleChange}
                  placeholder="Describe battery condition, visible damage, charging behaviour..."
                  rows={5}
                  className="w-full bg-[#0d1117] border border-[#30363d] text-white placeholder-[#484f58] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all duration-200 resize-none"
                />
              </div>
              <div className="p-3 bg-[#161b22] border border-[#30363d] rounded-lg text-xs space-y-1.5 text-[#8b949e]">
                <p className="text-[#58a6ff] font-medium mb-2">Review Summary</p>
                <div className="grid grid-cols-2 gap-1">
                  <span>Vehicle</span><span className="text-white">{form.make} {form.model} ({form.year})</span>
                  {form.vin && (<><span>VIN</span><span className="text-white font-mono text-[10px]">{form.vin}</span></>)}
                  <span>Capacity</span><span className="text-white">{form.batteryCapacity} kWh</span>
                  <span>Voltage</span><span className="text-white">{form.voltage} V</span>
                  <span>Mileage</span><span className="text-white">{Number(form.mileage).toLocaleString()} km</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button onClick={back} className="flex-1 bg-[#21262d] hover:bg-[#30363d] text-white py-2.5 rounded-lg text-sm font-medium transition-colors duration-200">← Back</button>
            )}
            {step < 2 ? (
              <button onClick={next} className="flex-1 bg-[#1f6feb] hover:bg-[#388bfd] text-white py-2.5 rounded-lg text-sm font-medium transition-colors duration-200">Continue →</button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2">
                {loading ? (<><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</>) : "Generate Passport ↗"}
              </button>
            )}
          </div>
        </div>
        <p className="text-center text-[#484f58] text-xs mt-4">Powered by ECOSWAP · Battery Intelligence Platform</p>
      </div>
    </div>
  );
}