"use client";

import { useCallback } from "react";
import { IoMdCloseCircle } from "react-icons/io";

export const MIN_IMAGES = 5;
export const MAX_IMAGES = 15;
export const MAX_SIZE_MB = 5;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/heic"];

export interface LocalImage {
  file:    File;
  preview: string; // blob URL
  hash:    string; // SHA-256 for duplicate detection
}

async function hashFile(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const hashBuf = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface Props {
  images:    LocalImage[];
  onChange:  (images: LocalImage[]) => void;
  errors:    string[];
  onErrors:  (errors: string[]) => void;
}

export default function ImagePicker({ images, onChange, errors, onErrors }: Props) {
  const addErrors = (msgs: string[]) =>
    onErrors([...new Set([...errors, ...msgs])]);

  const onFileSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const incoming = Array.from(e.target.files ?? []);
      onErrors([]);
      const newErrors: string[] = [];
      const newImages: LocalImage[] = [];

      for (const file of incoming) {
        if (!ALLOWED.includes(file.type)) {
          newErrors.push(`${file.name}: unsupported format. Use JPEG, PNG, WebP or HEIC.`);
          continue;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          newErrors.push(`${file.name}: exceeds ${MAX_SIZE_MB}MB.`);
          continue;
        }
        if (images.length + newImages.length >= MAX_IMAGES) {
          newErrors.push(`Maximum ${MAX_IMAGES} images allowed.`);
          break;
        }

        const hash = await hashFile(file);

        if (images.some((i) => i.hash === hash) || newImages.some((i) => i.hash === hash)) {
          newErrors.push(`${file.name}: duplicate — already selected.`);
          continue;
        }

        newImages.push({ file, preview: URL.createObjectURL(file), hash });
      }

      if (newErrors.length) addErrors(newErrors);
      if (newImages.length) onChange([...images, ...newImages]);
      e.target.value = "";
    },
    [images]
  );

  const remove = (index: number) => {
    URL.revokeObjectURL(images[index].preview);
    onChange(images.filter((_, i) => i !== index));
  };

  const remaining = Math.max(0, MIN_IMAGES - images.length);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base text-gray-900 dark:text-white">
          Vehicle Photos
        </h3>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
          images.length >= MIN_IMAGES
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
        }`}>
          {images.length} / {MIN_IMAGES} min
        </span>
      </div>

      {/* Error list */}
      {errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 space-y-1">
          {errors.map((err, i) => (
            <p key={i} className="text-red-600 dark:text-red-400 text-xs">⚠ {err}</p>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {images.map((img, i) => (
          <div key={img.hash} className="relative aspect-square group">
            <img
              src={img.preview}
              alt={`Photo ${i + 1}`}
              className="w-full h-full object-cover rounded-xl border border-gray-200 dark:border-[#2d1e5f]"
            />
            {i === 0 && (
              <span className="absolute bottom-1 left-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded-full">
                Cover
              </span>
            )}
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <IoMdCloseCircle className="text-xl text-red-500 bg-white rounded-full" />
            </button>
          </div>
        ))}

        {/* Add slot */}
        {images.length < MAX_IMAGES && (
          <label
            htmlFor="image-picker"
            className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-[#7b2ff2] bg-purple-50 dark:bg-[#2d1e5f]/30 rounded-xl cursor-pointer hover:bg-purple-100 dark:hover:bg-[#2d1e5f]/50 transition-colors"
          >
            <span className="text-3xl text-[#7b2ff2]">+</span>
            <span className="text-[10px] text-[#7b2ff2] mt-1">Add photos</span>
          </label>
        )}
      </div>

      <input
        id="image-picker"
        type="file"
        multiple
        accept={ALLOWED.join(",")}
        onChange={onFileSelected}
        className="hidden"
      />

      {remaining > 0 && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Add {remaining} more photo{remaining !== 1 ? "s" : ""} to continue
          &nbsp;(minimum {MIN_IMAGES} required)
        </p>
      )}

      <p className="text-[10px] text-gray-400 dark:text-[#484f58]">
        JPEG · PNG · WebP · HEIC &nbsp;|&nbsp; Max {MAX_SIZE_MB}MB per photo
      </p>
    </div>
  );
}