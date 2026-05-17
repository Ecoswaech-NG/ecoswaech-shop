"use client";

import Link from "next/link";
import { Bookmark, BookmarkCheck } from "lucide-react";

const FALLBACK = "https://cloudfront-eu-central-1.images.arcpublishing.com/thenational/C7BBKEO5NNNFT6CUY7TGRDHX44.jpg";

const GRADE_COLOR: Record<string, string> = {
  A: "#3fb950", B: "#58a6ff", C: "#d29922", D: "#f85149",
};

export interface SearchListing {
  id:           number;
  listingTitle: string | null;
  make:         string;
  model:        string;
  year:         number;
  mileage:      number;
  location:     string;
  sellingPrice: number;
  condition:    string;
  offerType:    string | null;
  images:       { imageUrl: string }[];
  batteryReport: { id: string; grade: string; sohScore: number } | null;
}

interface Props {
  listing:      SearchListing;
  isFavourite:  boolean;
  onToggleFav:  (id: number) => void;
}

export default function SearchCard({ listing, isFavourite, onToggleFav }: Props) {
  const img   = listing.images[0]?.imageUrl || FALLBACK;
  const grade = listing.batteryReport?.grade;

  return (
    <div className="bg-white dark:bg-[#18122b] rounded-2xl border border-gray-100 dark:border-[#2d1e5f] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col h-full">

      {/* Image */}
      <div className="relative h-44 flex-shrink-0">
        <img
          src={img}
          alt={listing.listingTitle ?? `${listing.make} ${listing.model}`}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK; }}
        />

        {/* Offer badge */}
        {listing.offerType && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {listing.offerType}
          </span>
        )}

        {/* Battery grade badge */}
        {grade && (
          <span
            className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: `${GRADE_COLOR[grade]}25`,
              color:       GRADE_COLOR[grade],
              border:      `1px solid ${GRADE_COLOR[grade]}50`,
            }}
          >
            {grade} · {listing.batteryReport?.sohScore}%
          </span>
        )}

        {/* Bookmark */}
        <button
          className="absolute bottom-2 right-2 p-1.5 rounded-full bg-white/90 dark:bg-[#0a0822]/80 shadow hover:scale-110 transition-transform"
          onClick={(e) => { e.preventDefault(); onToggleFav(listing.id); }}
          aria-label={isFavourite ? "Remove bookmark" : "Bookmark"}
        >
          {isFavourite
            ? <BookmarkCheck className="h-4 w-4 text-[#7b2ff2]" />
            : <Bookmark      className="h-4 w-4 text-gray-400" />
          }
        </button>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight line-clamp-1 mb-1">
          {listing.listingTitle || `${listing.year} ${listing.make} ${listing.model}`}
        </h3>

        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0 text-xs text-gray-500 dark:text-gray-400 mb-2">
          <span>{listing.year}</span>
          <span>·</span>
          <span>{listing.mileage.toLocaleString()} km</span>
          <span>·</span>
          <span>{listing.location}</span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-100 dark:border-[#2d1e5f]">
          <span className="font-bold text-[#7b2ff2] dark:text-[#c4b8e8] text-sm">
            ₦{Number(listing.sellingPrice).toLocaleString()}
          </span>
          <Link
            href={`/listing-details/${listing.id}`}
            className="bg-[#220a77] hover:bg-[#7b2ff2] text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}