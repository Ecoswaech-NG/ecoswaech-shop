"use client";

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

interface Charger {
  id: number;
  brand: string;
  model: string;
  type: string;
  power: string;
  location: string;
  price: number;
}

export default function ChargersPage() {
  const [typeFilter, setTypeFilter] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [location, setLocation] = useState('');
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchChargers() {
      setLoading(true);
      try {
        const res = await fetch('/api/chargers', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setChargers(Array.isArray(data) ? data : []);
        } else {
          setChargers([]);
        }
      } catch (error) {
        console.error('Error fetching chargers:', error);
        setChargers([]);
      } finally {
        setLoading(false);
      }
    }
    fetchChargers();
  }, []);

  const filtered = chargers.filter(charger => {
    return (
      (!typeFilter || charger?.type === typeFilter) &&
      (!make || charger?.brand === make) &&
      (!model || charger?.model === model) &&
      (!location || charger?.location === location)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e0e7ff]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e0e7ff]">
      <Navbar />
     
      <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-[#18122b] text-center tracking-tight">
          EV Chargers
        </h1>
        <p className="text-gray-500 mb-8 text-center max-w-2xl">
          Browse our collection of EV chargers. Find the perfect charging solution for your electric vehicle.
        </p>

        {/* Type Filter Buttons */}
        <div className="mb-8 flex gap-2 flex-wrap justify-center">
          <button 
            onClick={() => setTypeFilter('')} 
            className={`px-4 py-2 rounded-full font-medium shadow transition ${
              typeFilter === '' ? 'bg-[#340a77] text-white' : 'bg-white text-[#340a77] border border-[#340a77] hover:bg-[#ffb86c] hover:text-[#340a77]'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setTypeFilter('Home Charger')} 
            className={`px-4 py-2 rounded-full font-medium shadow transition ${
              typeFilter === 'Home Charger' ? 'bg-[#340a77] text-white' : 'bg-white text-[#340a77] border border-[#340a77] hover:bg-[#ffb86c] hover:text-[#340a77]'
            }`}
          >
            Home Chargers
          </button>
          <button 
            onClick={() => setTypeFilter('AC Station')} 
            className={`px-4 py-2 rounded-full font-medium shadow transition ${
              typeFilter === 'AC Station' ? 'bg-[#340a77] text-white' : 'bg-white text-[#340a77] border border-[#340a77] hover:bg-[#ffb86c] hover:text-[#340a77]'
            }`}
          >
            AC Stations
          </button>
          <button 
            onClick={() => setTypeFilter('DC Station')} 
            className={`px-4 py-2 rounded-full font-medium shadow transition ${
              typeFilter === 'DC Station' ? 'bg-[#340a77] text-white' : 'bg-white text-[#340a77] border border-[#340a77] hover:bg-[#ffb86c] hover:text-[#340a77]'
            }`}
          >
            DC Stations
          </button>
        </div>

        {/* Filter Dropdowns */}
        <div className="mb-8 flex gap-4 flex-wrap justify-center">
          <select
            value={make}
            onChange={(e) => {
              setMake(e.target.value);
              setModel(''); // Reset model when make changes
            }}
            className="min-w-[120px] bg-white/80 border border-[#340a77] text-[#340a77] rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7b2ff2] cursor-pointer"
          >
            <option value="">All Makes</option>
            <option value="Tesla">Tesla</option>
            <option value="ABB">ABB</option>
            <option value="Siemens">Siemens</option>
          </select>

          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="min-w-[120px] bg-white/80 border border-[#340a77] text-[#340a77] rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7b2ff2] cursor-pointer"
          >
            <option value="">All Models</option>
            {make === 'Tesla' && (
              <>
                <option value="Wall Connector">Wall Connector</option>
                <option value="Supercharger">Supercharger</option>
              </>
            )}
            {make === 'ABB' && (
              <>
                <option value="Terra DC">Terra DC</option>
                <option value="Terra AC">Terra AC</option>
              </>
            )}
            {make === 'Siemens' && (
              <>
                <option value="VersiCharge">VersiCharge</option>
                <option value="Sicharge">Sicharge</option>
              </>
            )}
          </select>

          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="min-w-[120px] bg-white/80 border border-[#340a77] text-[#340a77] rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7b2ff2] cursor-pointer"
          >
            <option value="">All Locations</option>
            <option value="Lagos">Lagos</option>
            <option value="Abuja">Abuja</option>
            <option value="Port Harcourt">Port Harcourt</option>
            <option value="Ibadan">Ibadan</option>
          </select>
        </div>

        {/* Chargers Grid */}
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.length === 0 ? (
              <div className="col-span-full text-center text-gray-400 py-20 text-lg font-medium">
                No chargers found in this category.
              </div>
            ) : (
              filtered.map(charger => (
                <div
                  key={charger.id}
                  className="transition-transform hover:-translate-y-1 cursor-pointer"
                  onClick={() => router.push(`/chargerMart/${charger.id}`)}
                >
                  <div className="bg-white rounded-3xl shadow-lg p-5 flex flex-col h-full border border-[#e0e7ff] hover:border-[#ffb86c] transition">
                    <div className="relative w-full h-48 flex items-center justify-center bg-[#f3f4f6] rounded-2xl mb-4 overflow-hidden">
                      <img
                        src="https://honestelectrical.co.nz/wp-content/uploads/2024/06/Snow-With-T2.png"
                        alt={charger.model}
                        className="object-contain h-full w-full"
                        onError={(e) => { 
                          const img = e.target as HTMLImageElement;
                          img.src = '/placeholder.jpg';
                        }}
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <h3 className="font-semibold text-lg text-[#18122b] mb-1">
                        {charger.brand} {charger.model}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">{charger.type} • {charger.power}</p>
                      <p className="text-gray-500 text-xs mb-2">📍 {charger.location || 'Location N/A'}</p>
                      <p className="font-bold text-xl text-[#340a77] mb-2">
                        ₦{charger.price.toLocaleString()}
                      </p>
                      <span className="text-xs text-gray-400 mt-auto">View Details</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
