import Link from "next/link";

interface Report {
  id: string;
  grade: string;
  sohScore: number;
  vin: string | null;
}

const GRADE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  A: { label: "Excellent", color: "#3fb950", bg: "rgba(63,185,80,0.08)", border: "rgba(63,185,80,0.3)" },
  B: { label: "Good", color: "#58a6ff", bg: "rgba(88,166,255,0.08)", border: "rgba(88,166,255,0.3)" },
  C: { label: "Fair", color: "#d29922", bg: "rgba(210,153,34,0.08)", border: "rgba(210,153,34,0.3)" },
  D: { label: "Poor", color: "#f85149", bg: "rgba(248,81,73,0.08)", border: "rgba(248,81,73,0.3)" },
};

export default function BatteryBadge({ report }: { report: Report }) {
  const conf = GRADE_CONFIG[report.grade] ?? GRADE_CONFIG.D;

  return (
    <div
      className="rounded-2xl p-5 border grid grid-cols-12 items-center gap-x-4"
      style={{ background: conf.bg, borderColor: conf.border }}
    >
      {/* ── Grade (col 2) ───────────────── */}
      <div className="col-span-3 sm:col-span-2 flex justify-start">
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-bold"
          style={{
            color: conf.color,
            background: conf.bg,
            border: `2px solid ${conf.border}`,
          }}
        >
          {report.grade}
        </div>
      </div>

      {/* ── Content (col 7) ─────────────── */}
      <div className="col-span-9 sm:col-span-7 flex flex-col justify-center min-w-0">
        <p
          className="text-xs font-semibold uppercase tracking-widest truncate"
          style={{ color: conf.color }}
        >
          Battery Health · {conf.label}
        </p>

        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
          {report.sohScore}% State of Health
        </p>

        {report.vin && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono truncate">
            VIN: {report.vin}
          </p>
        )}
      </div>

      {/* ── CTA (col 3) ─────────────────── */}
      <div className="col-span-12 sm:col-span-3 flex sm:justify-end mt-4 sm:mt-0">
        <Link
          href={`/passport/${report.id}`}
          className="w-full sm:w-auto text-center px-4 py-2 rounded-full text-xs font-semibold transition-all hover:opacity-80"
          style={{ background: conf.color, color: "#fff" }}
        >
          View Full Passport →
        </Link>
      </div>
    </div>
  );
}