"use client";

import { useState } from "react";

interface Image { imageUrl: string; }
interface Props  { images: Image[]; }

const FALLBACK = "https://autoimage.capitalone.com/cms/Auto/assets/images/2744-featured-gallery-2024-chevrolet-equinox-ev.jpg";

export default function ImageGallery({ images }: Props) {
  const [active, setActive] = useState(0);
  const list = images.length > 0 ? images : [{ imageUrl: FALLBACK }];

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-[#2d1e5f] bg-white dark:bg-[#18122b]">
        <img
          src={list[active]?.imageUrl || FALLBACK}
          alt="Vehicle"
          className="w-full h-[380px] sm:h-[460px] object-cover"
        />
      </div>

      {/* Thumbnails */}
      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {list.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                i === active
                  ? "border-[#7b2ff2] scale-105"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img src={img.imageUrl} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}