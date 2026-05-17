"use client";

import { useEffect, useState } from "react";
import CarItem, { Car } from "@/components/CarItem";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function MostSearchedCar() {
  const [carList, setCarList] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPopularCarListings();
  }, []);

  const getPopularCarListings = async () => {
    try {
      const res = await fetch("/api/listings/cars?limit=10");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCarList(data.listings ?? []);
    } catch (err) {
      console.error("Failed to fetch listings:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-2 mx-2 md:mx-24">
      <h2 className="font-bold text-2xl md:text-3xl text-center mt-6 md:mt-10 mb-5 md:mb-7 text-white dark:text-gray-900">
        Most Searched Cars
      </h2>

      {loading ? (
        // Skeleton loader
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-3xl bg-gray-100 dark:bg-[#5c5ab1] h-[420px] animate-pulse" />
          ))}
        </div>
      ) : carList.length === 0 ? (
        <p className="text-center text-gray-400 py-10">No listings available yet.</p>
      ) : (
        <Carousel>
          <CarouselContent>
            {carList.map((car, index) => (
              <CarouselItem
                key={car.id ?? index}
                className="basis-4/5 sm:basis-1/2 md:basis-1/4"
              >
                <CarItem car={car} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      )}
    </div>
  );
}