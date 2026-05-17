"use client";

import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

interface Props {
  params: Promise<{ id: string }>;
}

export default function ChargerDetailsPage({ params }: Props) {
  const [id, setId] = useState<string | null>(null);
  const [charger, setCharger] = useState<any>(null);
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

    const fetchCharger = async () => {
      try {
        const res = await fetch(`/api/listings/chargers/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setCharger(data);
      } catch {
        setCharger(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCharger();
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

  if (!charger) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0822]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white dark:bg-[#18122b] rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            {charger.listingTitle}
          </h1>
          <div className="grid grid-cols-2 gap-4 mb-6 text-gray-700 dark:text-gray-300">
            <p>
              <span className="font-semibold">Brand:</span> {charger.brand}
            </p>
            <p>
              <span className="font-semibold">Model:</span> {charger.model}
            </p>
            <p>
              <span className="font-semibold">Type:</span> {charger.type}
            </p>
            <p>
              <span className="font-semibold">Specification:</span>{" "}
              {charger.specification}
            </p>
            <p>
              <span className="font-semibold">Power:</span> {charger.power}
            </p>
            <p>
              <span className="font-semibold">Location:</span> {charger.location}
            </p>
          </div>
          <p className="text-2xl font-bold text-[#7b2ff2] mb-4">
            ₦{charger.price?.toLocaleString()}
          </p>
          {charger.description && (
            <p className="text-gray-700 dark:text-gray-300">
              {charger.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
