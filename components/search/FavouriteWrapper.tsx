"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import SearchCard, { type SearchListing } from "./SearchCard";
import Link from "next/link";

export function FavouriteWrapper({ listings }: { listings: SearchListing[] }) {
  const { user } = useAuth();
  const storageKey = `favs_${user?.email ?? "guest"}`;

  const [favourites, setFavourites] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(storageKey) ?? "[]"); }
    catch { return []; }
  });

  const toggleFavourite = (id: number) => {
    setFavourites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {listings.map((listing) => (
          <SearchCard
            key={listing.id}
            listing={listing}
            isFavourite={favourites.includes(listing.id)}
            onToggleFav={toggleFavourite}
          />
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/search"
          className="text-sm text-[#7b2ff2] hover:underline font-medium"
        >
          ← Browse all vehicles
        </Link>
      </div>
    </>
  );
}