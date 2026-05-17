"use client";

import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

// Accessory details page - displays individual accessory listing
interface Props {
  params: Promise<{ id: string }>;
}

export default function AccessoryDetailsPage({ params }: Props) {
  const [id, setId] = useState<string | null>(null);
  const [accessory, setAccessory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!id) return;

    const fetchAccessory = async () => {
      try {
        const res = await fetch(`/api/listings/accessories/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setAccessory(data);
      } catch {
        setAccessory(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAccessory();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0822]">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (!accessory) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0822]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white dark:bg-[#18122b] rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            {accessory.name}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            Brand: {accessory.brand}
          </p>
          <p className="text-2xl font-bold text-[#7b2ff2] mb-4">
            ₦{accessory.price?.toLocaleString()}
          </p>
          {accessory.description && (
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {accessory.description}
            </p>
          )}
          {accessory.compatible_with && (
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Compatible with: {accessory.compatible_with}
            </p>
          )}
          <p className="text-gray-500 dark:text-gray-400">
            Location: {accessory.location}
          </p>
        </div>
      </div>
    </div>
  );
}
