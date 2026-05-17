"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CiSearch } from "react-icons/ci";
import Data from "@/Shared/Data";
import Link from "next/link";

type CategoryType = "Vehicles" | "Chargers" | "Accessories" | "";

export default function Search() {
  // Synchronized naming: using 'category' consistently
  const [category, setCategory] = useState<CategoryType>("");
  const [condition, setCondition] = useState("");
  const [make, setMake] = useState("");
  const [price, setPrice] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset vehicle filters when category changes away from Vehicles
  const handleCategoryChange = (val: string | null) => {
    const typedVal = val as CategoryType;
    setCategory(typedVal);
    if (typedVal !== "Vehicles") {
      setCondition("");
      setMake("");
      setPrice("");
    }
  };

  const searchUrl = (() => {
    if (category === "Chargers") return "/charging";
    if (category === "Accessories") return "/accessories";
    
    const params = new URLSearchParams();
    if (condition) params.append("condition", condition);
    if (make) params.append("make", make);
    if (price) params.append("price", price);
    
    const qs = params.toString();
    return `/search${qs ? `?${qs}` : ""}`;
  })();

  const showVehicleFilters = category === "Vehicles" || category === "";

  if (!mounted) return null;

  return (
    <div className="w-full max-w-2xl bg-white/95 backdrop-blur-md rounded-full p-1.5 shadow-xl flex items-center mb-7">
      
      {/* Category - Fixed 'group' error and Type mismatch */}
      <div className="flex-1 min-w-0">
        <Select value={category} onValueChange={handleCategoryChange}>

          <SelectTrigger className="w-full text-[13px] font-medium text-slate-600 bg-transparent border-none shadow-none focus:ring-0 focus:ring-offset-0">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="Vehicles">Vehicles</SelectItem>
            <SelectItem value="Chargers">Chargers</SelectItem>
            <SelectItem value="Accessories">Accessories</SelectItem>
          </SelectContent>

        </Select>
      </div>

      {showVehicleFilters && (
        <>
          <Separator orientation="vertical" className="hidden md:block h-8 bg-slate-200" />

          {/* Condition - Fixed Type mismatch */}
          <div className="flex-1 min-w-0">
            <Select 
            value={condition} 
            onValueChange={(val) => setCondition(val ?? "")} // Fixed here
            >
              <SelectTrigger className="w-full text-[13px] font-medium text-slate-600 bg-transparent border-none shadow-none focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="New">Brand New</SelectItem>
                <SelectItem value="Used">Used</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator orientation="vertical" className="hidden md:block h-8 bg-slate-200" />

          {/* Brand - Fixed Type mismatch */}
          <div className="flex-1 min-w-0">
            <Select 
            value={make} 
            onValueChange={(val) => setMake(val ?? "")} // Fixed here
            >
              <SelectTrigger className="w-full text-[13px] font-medium text-slate-600 bg-transparent border-none shadow-none focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent className="bg-white max-h-60 overflow-y-auto">
                {Data.CarMakes.map((maker) => (
                  <SelectItem key={maker.id} value={maker.name}>
                    {maker.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator orientation="vertical" className="hidden md:block h-8 bg-slate-200" />

          {/* Pricing - Fixed Type mismatch */}
          <div className="flex-1 min-w-0">
            <Select 
            value={price} 
             onValueChange={(val) => setPrice(val ?? "")} // Fixed here
            >
              <SelectTrigger className="w-full text-[13px] font-medium text-slate-600 bg-transparent border-none shadow-none focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Pricing" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {Data.Pricing.map((p) => (
                  <SelectItem key={p.id} value={p.amount}>
                    {p.amount}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {/* Search button */}
      <Link href={searchUrl} className="flex justify-center flex-shrink-0">
        <div className="bg-[#f0a500] hover:bg-[#e09500] active:scale-95 transition-all duration-150 p-3 md:p-4 rounded-full shadow-lg group cursor-pointer">
          <CiSearch className="text-xl md:text-2xl text-white group-hover:scale-110 transition-transform duration-150" />
        </div>
      </Link>
    </div>
  );
}