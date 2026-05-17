"use client";

import React from "react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { BsFuelPumpFill, BsCalendar3 } from "react-icons/bs";
import { PiSpeedometerFill } from "react-icons/pi";
import { ImLocation } from "react-icons/im";
import { FaExternalLinkAlt } from "react-icons/fa";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CarImage {
  imageUrl: string;
}

export interface BatteryReportSummary {
  id:       string;
  grade:    string;
  sohScore: number;
}

export interface Car {
  id:                  string | number;
  listingTitle:        string;
  listingDescription?: string;
  sellingPrice:        string | number;
  mileage:             string | number;
  fuelType?:           string;
  year:                string | number;
  location:            string;
  images?:             CarImage[];
  batteryReport?:      BatteryReportSummary | null;
}

interface CarItemProps {
  car:       Car;
  children?: React.ReactNode;
}

// ── Grade config ──────────────────────────────────────────────────────────────

const GRADE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  A: { label: "Excellent",  color: "#3fb950", bg: "rgba(63,185,80,0.12)"  },
  B: { label: "Good",       color: "#58a6ff", bg: "rgba(88,166,255,0.12)" },
  C: { label: "Fair",       color: "#d29922", bg: "rgba(210,153,34,0.12)" },
  D: { label: "Poor",       color: "#f85149", bg: "rgba(248,81,73,0.12)"  },
};

const FALLBACK_IMAGE =
  "https://cloudfront-eu-central-1.images.arcpublishing.com/thenational/C7BBKEO5NNNFT6CUY7TGRDHX44.jpg";

// ── Component ─────────────────────────────────────────────────────────────────

export default function CarItem({ car, children }: CarItemProps) {
  const imageUrl  = car?.images?.[0]?.imageUrl || FALLBACK_IMAGE;
  const report    = car?.batteryReport;
  const gradeConf = report ? (GRADE_CONFIG[report.grade] ?? null) : null;

  return (
    <div className="rounded-3xl bg-white dark:bg-[#18122b] shadow-xl hover:shadow-blue-300 dark:hover:shadow-[#7b2ff2]/30 transition-shadow duration-300 overflow-hidden flex flex-col h-full min-h-[420px]">

      {/* Image */}
      <div className="relative h-56 flex-shrink-0">
        <img
          src={imageUrl}
          alt={car?.listingTitle}
          className="w-full h-full object-cover rounded-t-3xl"
        />

        {/* ── Battery grade badge ── overlaid on image top-right */}
        {report && gradeConf && (
          <div
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm"
            style={{ background: gradeConf.bg, color: gradeConf.color, border: `1px solid ${gradeConf.color}40` }}
          >
            <span className="text-base leading-none">{report.grade}</span>
            <span className="opacity-80">{report.sohScore}% SoH</span>
          </div>
        )}

        {/* No passport indicator */}
        {!report && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-medium backdrop-blur-sm"
            style={{ background: "rgba(0,0,0,0.4)", color: "#9b9b9b", border: "1px solid rgba(255,255,255,0.1)" }}>
            No Passport
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">

        {/* Title + Price */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h2 className="font-bold text-gray-900 dark:text-white text-base leading-tight line-clamp-1">
            {car?.listingTitle}
          </h2>
          <span className="flex-shrink-0 bg-slate-100 dark:bg-[#2d1e5f] text-indigo-800 dark:text-[#e0d7ff] font-semibold px-3 py-1 rounded-full text-sm">
            ₦{Number(car.sellingPrice).toLocaleString()}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-400 dark:text-gray-500 text-xs mb-3 line-clamp-2 leading-relaxed">
          {car?.listingDescription || "Listed on ECOSWAP marketplace."}
        </p>

        <Separator className="mb-3 dark:bg-[#2d1e5f]" />

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge icon={<BsFuelPumpFill />} label={`${car.mileage} km`} />
          {car.fuelType && <Badge icon={<PiSpeedometerFill />} label={car.fuelType} />}
          <Badge icon={<BsCalendar3 />}    label={String(car.year)} />
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge icon={<ImLocation />} label={car.location} />
          {/* Battery passport inline link */}
          {report && (
            <Link
              href={`/passport/${report.id}`}
              className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full transition-colors"
              style={{
                background: gradeConf?.bg,
                color:      gradeConf?.color,
                border:     `1px solid ${gradeConf?.color}40`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              🔋 Battery Passport
            </Link>
          )}
        </div>

        {/* CTA */}
        <div className="mt-auto flex flex-col gap-2">
          <Link href={`/listing-details/${car.id}`} className="block w-full">
            <button className="w-full bg-indigo-800 dark:bg-[#7b2ff2] text-white font-semibold py-2.5 rounded-full flex items-center justify-center gap-2 hover:bg-indigo-950 dark:hover:bg-[#651fff] transition text-sm">
              View Details <FaExternalLinkAlt className="text-xs" />
            </button>
          </Link>
          {children && <div className="flex gap-2 justify-end">{children}</div>}
        </div>
      </div>
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────

function Badge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-[#2d1e5f] text-gray-600 dark:text-[#c4b8e8] text-xs px-2.5 py-1 rounded-full">
      {icon} {label}
    </span>
  );
}