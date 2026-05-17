import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

function gradeColor(grade: string) {
  return (
    grade === "A" ? "#3fb950" :
    grade === "B" ? "#58a6ff" :
    grade === "C" ? "#d29922" : "#f85149"
  );
}

function gradeLabel(grade: string) {
  return (
    grade === "A" ? "Excellent" :
    grade === "B" ? "Good" :
    grade === "C" ? "Fair" : "Poor"
  );
}

function sohBarWidth(soh: number) {
  return `${Math.min(Math.max(soh, 0), 100)}%`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  }).format(new Date(date));
}

export default async function PassportPage({ params }: Props) {
  const { id } = await params;

  const report = await prisma.batteryReport.findUnique({
    where: { id },
    include: { vehicle: true },
  });

  if (!report) return notFound();

  const color = gradeColor(report.grade);

  return (
    <div
      className="min-h-screen bg-[#010409] flex items-center justify-center p-6"
      style={{ fontFamily: "'IBM Plex Mono', 'Courier New', monospace" }}
    >
      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(88,166,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(88,166,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Ambient grade glow */}
      <div
        className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${color}0f 0%, transparent 65%)`,
        }}
      />

      <div className="relative w-full max-w-2xl">

        {/* Top label */}
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex items-center gap-2 bg-[#238636]/10 border border-[#238636]/30 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse" />
            <span className="text-[#3fb950] text-xs tracking-widest">ECOSWAECH · CERTIFIED REPORT</span>
          </div>
          <span className="text-[#484f58] text-xs">
            {formatDate(report.createdAt)}
          </span>
        </div>

        {/* Main card */}
        <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl overflow-hidden shadow-2xl">

          {/* Grade hero banner */}
          <div
            className="relative px-8 py-10 flex items-center justify-between overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${color}18, ${color}05)` }}
          >
            {/* Decorative circle */}
            <div
              className="absolute -right-12 -top-12 w-64 h-64 rounded-full opacity-10"
              style={{ background: color }}
            />
            <div
              className="absolute -right-6 -top-6 w-40 h-40 rounded-full opacity-5"
              style={{ background: color }}
            />

            <div>
              <p className="text-[#8b949e] text-xs tracking-widest uppercase mb-1">
                Battery Health Certificate
              </p>
              <h1 className="text-white text-3xl font-bold tracking-tight">
                {report.vehicle.make} {report.vehicle.model}
              </h1>
              <p className="text-[#8b949e] text-sm mt-1">
                {report.vehicle.year} · {Number(report.mileage).toLocaleString()} km
              </p>
            </div>

            {/* Grade badge */}
            <div className="relative flex flex-col items-center">
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl font-bold border-2"
                style={{
                  color,
                  borderColor: `${color}60`,
                  background: `${color}15`,
                  boxShadow: `0 0 40px ${color}30`,
                }}
              >
                {report.grade}
              </div>
              <span
                className="text-xs mt-2 font-medium tracking-wider"
                style={{ color }}
              >
                {gradeLabel(report.grade)}
              </span>
            </div>
          </div>

          {/* SoH meter */}
          <div className="px-8 py-6 border-b border-[#21262d]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#8b949e] text-xs uppercase tracking-widest">
                State of Health
              </span>
              <span className="text-white font-bold text-lg">
                {report.sohScore}%
              </span>
            </div>
            <div className="h-3 bg-[#21262d] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: sohBarWidth(report.sohScore),
                  background: `linear-gradient(90deg, ${color}80, ${color})`,
                  boxShadow: `0 0 12px ${color}60`,
                }}
              />
            </div>
            {/* Scale labels */}
            <div className="flex justify-between mt-1.5">
              {[0, 25, 50, 75, 100].map((n) => (
                <span key={n} className="text-[10px] text-[#484f58]">{n}</span>
              ))}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 divide-x divide-y divide-[#21262d]">
            {[
              { label: "Battery Capacity", value: `${report.batteryCapacity} kWh`, icon: "🔋" },
              { label: "Pack Voltage",     value: `${report.voltage} V`,            icon: "⚡" },
              { label: "Odometer",         value: `${Number(report.mileage).toLocaleString()} km`, icon: "🛣️" },
              { label: "Inspection Grade", value: report.grade,                     icon: "📊", highlight: true },
            ].map(({ label, value, icon, highlight }) => (
              <div key={label} className="px-6 py-5">
                <p className="text-[#8b949e] text-xs uppercase tracking-widest mb-1">
                  {icon} {label}
                </p>
                <p
                  className="text-lg font-bold"
                  style={{ color: highlight ? color : "white" }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Notes */}
          {report.notes && (
            <div className="px-8 py-5 border-t border-[#21262d]">
              <p className="text-[#8b949e] text-xs uppercase tracking-widest mb-2">
                📋 Inspector Notes
              </p>
              <p className="text-[#c9d1d9] text-sm leading-relaxed italic">
                "{report.notes}"
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="px-8 py-4 border-t border-[#21262d] bg-[#161b22] flex items-center justify-between">
            <div>
              <p className="text-[#484f58] text-[10px] uppercase tracking-widest">Passport ID</p>
              <p className="text-[#8b949e] text-xs font-mono mt-0.5">{report.id}</p>
            </div>
            <div className="text-right">
              <p className="text-[#484f58] text-[10px] uppercase tracking-widest">Issued</p>
              <p className="text-[#8b949e] text-xs mt-0.5">{formatDate(report.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <a
            href="/dashboard"
            className="text-[#484f58] text-xs hover:text-[#8b949e] transition-colors duration-200"
          >
            ← Generate another passport
          </a>
        </div>

      </div>
    </div>
  );
}