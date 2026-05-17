"use client";

import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useRouter } from "next/navigation";

interface UnifiedItem {
  id:       number;
  itemType: "charger" | "accessory";
  name:     string;
  brand:    string | null;
  model:    string | null;
  type:     string | null;
  power:    string | null;
  price:    number;
  location: string;
  images:   { url: string }[];
}

const FALLBACK_IMAGE =
  "https://www.xindamotor.com/uploads/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20220829161844.jpg";

export default function SearchedParts() {
  const [items, setItems]     = useState<UnifiedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/parts?limit=8")
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => setItems(data.items ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const handleNavigate = (item: UnifiedItem) => {
    const path = item.itemType === "charger" ? "charging" : "accessories";
    router.push(`/${path}/${item.id}`);
  };

  return (
    <div className="py-8 mx-4 md:mx-24">
      <h2 className="font-bold text-2xl md:text-3xl text-center mt-10 md:mt-16 mb-8 text-white dark:text-gray-900">
        Popular Chargers & Accessories
      </h2>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-gray-100 dark:bg-[#18122b] h-64 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <p className="text-center text-gray-400 py-12">
          Could not load parts. Please try again later.
        </p>
      )}

      {/* Empty */}
      {!loading && !error && items.length === 0 && (
        <p className="text-center text-gray-400 py-12">No chargers or accessories listed yet.</p>
      )}

      {/* Results */}
      {!loading && !error && items.length > 0 && (
        <div className="relative px-10">
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent>
              {items.map((item) => (
                <CarouselItem
                  key={`${item.itemType}-${item.id}`}
                  className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 pl-4"
                >
                  <div
                    onClick={() => handleNavigate(item)}
                    className="bg-white dark:bg-[#18122b] rounded-2xl shadow-md p-4 flex flex-col h-full border border-gray-100 dark:border-[#2d1e5f] hover:border-[#7b2ff2] transition-all duration-300 cursor-pointer group"
                  >
                    {/* Image */}
                    <div className="relative w-full h-44 flex items-center justify-center bg-gray-50 dark:bg-[#0a0822] rounded-xl mb-4 overflow-hidden">
                      <img
                        src={item.images?.[0]?.url || FALLBACK_IMAGE}
                        alt={item.name}
                        className="object-contain h-full w-full transition-transform duration-500 group-hover:scale-110"
                      />
                      <span className="absolute top-2 left-2 px-3 py-1 bg-[#7b2ff2] text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                        {item.itemType}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col">
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-xs mb-2">
                        {item.itemType === "charger"
                          ? [item.type, item.power].filter(Boolean).join(" • ")
                          : item.brand ?? ""}
                      </p>

                      <div className="mt-auto">
                        <p className="text-gray-400 text-[10px] mb-1 flex items-center gap-1">
                          <span className="text-[#7b2ff2]">📍</span> {item.location}
                        </p>
                        <p className="font-extrabold text-lg text-[#7b2ff2]">
                          ₦{Number(item.price).toLocaleString()}
                        </p>
                        <span className="text-[10px] font-semibold text-gray-400 group-hover:text-[#7b2ff2] transition-colors mt-2 block">
                          View Details →
                        </span>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-12 border-[#7b2ff2] text-[#7b2ff2]" />
            <CarouselNext    className="hidden md:flex -right-12 border-[#7b2ff2] text-[#7b2ff2]" />
          </Carousel>
        </div>
      )}
    </div>
  );
}