"use client";

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { FaCarSide } from 'react-icons/fa'
import { MdSupportAgent } from 'react-icons/md'
import { BsShieldCheck } from 'react-icons/bs'

const RENTAL_TYPES = [
  { label: 'All', value: '' },
  { label: 'Sedan', value: 'Sedan' },
  { label: 'SUV', value: 'SUV' },
  { label: 'Hatchback', value: 'Hatchback' },
  { label: 'Van', value: 'Van' },
  { label: 'Truck', value: 'Truck' }
];

interface Rental {
  id: number;
  vehicle: string;
  location: string;
  daily: number;
  weekly: number;
  monthly: number;
  deposit: number;
  minAge: number;
  insurance: boolean;
  delivery: boolean;
  deliveryFee?: number;
  rules: string;
  type: string;
  userName: string;
  userImageUrl: string | null;
}

export default function RentalsPage() {
  const [items, setItems] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');

  useEffect(() => {
    async function fetchRentals() {
      setLoading(true);
      try {
        const res = await fetch('/api/rentals', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setItems(data || []);
        }
      } catch (error) {
        console.error('Failed to fetch rentals:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    fetchRentals();
  }, []);

  const filtered = items.filter(item => {
    const matchesType = type ? item.type === type : true;
    const matchesSearch =
      search.trim() === '' ||
      item.location?.toLowerCase().includes(search.toLowerCase()) ||
      item.vehicle?.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="w-full bg-gradient-to-r from-[#1e90ff] to-[#1abc9c] py-12 px-2 flex flex-col items-center">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 text-center">
          Rent Electric Vehicles
        </h1>
        <p className="text-white text-lg md:text-xl mb-8 text-center">
          Experience the future of transportation with our premium EV rental fleet
        </p>
        
        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-lg flex flex-col md:flex-row items-center gap-2 md:gap-0 px-4 py-3 w-full max-w-2xl">
          <input
            className="flex-1 border-none outline-none bg-transparent px-3 py-2 text-gray-700 placeholder-gray-400"
            placeholder="Search by location, name, or description"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="flex-1 md:border-l md:border-gray-200 px-3 py-2 bg-transparent text-gray-700 cursor-pointer"
            value={type}
            onChange={e => setType(e.target.value)}
          >
            {RENTAL_TYPES.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        
        {/* Category Buttons */}
        <div className="flex gap-2 mt-4 flex-wrap justify-center">
          {RENTAL_TYPES.map(opt => (
            <button
              key={opt.value}
              onClick={() => setType(opt.value)}
              className={`px-4 py-2 rounded-full font-medium shadow transition ${
                type === opt.value
                  ? 'bg-[#1e90ff] text-white'
                  : 'bg-white text-[#1e90ff] border border-[#1e90ff] hover:bg-[#00b894] hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rentals List Section */}
      <div className="max-w-6xl mx-auto w-full px-4 py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-[#18122b]">
            Available Rentals ({filtered.length})
          </h2>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <FaCarSide className="text-6xl text-gray-300 mb-4" />
            <div className="text-lg font-medium text-gray-500 mb-2">Loading rentals...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <FaCarSide className="text-6xl text-gray-300 mb-4" />
            <div className="text-lg font-medium text-gray-500 mb-2">No rentals found</div>
            <div className="text-sm text-gray-400">Try adjusting your search criteria</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition">
                {/* Header Image */}
                <div className="relative h-40 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <FaCarSide className="text-4xl text-white/60" />
                  <div className="absolute top-3 right-3 px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full">
                    Available
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-1">
                    {item.vehicle || 'Unnamed Vehicle'}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">📍 {item.location || 'N/A'}</p>
                  
                  {/* Pricing Cards */}
                  <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                    {item.daily && (
                      <div className="text-center px-2 py-2 bg-blue-50 rounded-lg">
                        <p className="text-gray-500">Daily</p>
                        <p className="font-bold text-blue-600">₦{Number(item.daily).toLocaleString()}</p>
                      </div>
                    )}
                    {item.weekly && (
                      <div className="text-center px-2 py-2 bg-indigo-50 rounded-lg">
                        <p className="text-gray-500">Weekly</p>
                        <p className="font-bold text-indigo-600">₦{Number(item.weekly).toLocaleString()}</p>
                      </div>
                    )}
                    {item.monthly && (
                      <div className="text-center px-2 py-2 bg-purple-50 rounded-lg">
                        <p className="text-gray-500">Monthly</p>
                        <p className="font-bold text-purple-600">₦{Number(item.monthly).toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.insurance && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        🛡️ Insurance
                      </span>
                    )}
                    {item.delivery && (
                      <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                        🚚 Delivery
                      </span>
                    )}
                    {item.minAge && (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                        📅 Age {item.minAge}+
                      </span>
                    )}
                  </div>

                  {/* Owner Info */}
                  {item.userName && (
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                      <img
                        src={item.userImageUrl || 'https://via.placeholder.com/32'}
                        alt={item.userName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-xs font-medium text-gray-700">{item.userName}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 text-xs font-semibold bg-[#7b2ff2] text-white rounded-lg hover:bg-[#651fff] transition">
                      Rent Now
                    </button>
                    <button className="flex-1 py-2 text-xs font-semibold border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Why Choose EV Rentals Section */}
      <div className="bg-gray-50 py-12 px-4">
        <h3 className="text-2xl font-bold text-center mb-4 text-[#18122b]">Why Choose EV Rentals?</h3>
        <p className="text-center text-gray-500 mb-10">
          Experience the benefits of electric vehicle rentals with our premium service
        </p>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <FaCarSide className="text-4xl text-green-400 mb-2" />
            <div className="font-semibold mb-1">Premium Fleet</div>
            <div className="text-sm text-gray-500 text-center">
              Latest electric vehicles with cutting-edge technology
            </div>
          </div>
          <div className="flex flex-col items-center">
            <BsShieldCheck className="text-4xl text-blue-400 mb-2" />
            <div className="font-semibold mb-1">Full Insurance</div>
            <div className="text-sm text-gray-500 text-center">
              Comprehensive coverage for peace of mind
            </div>
          </div>
          <div className="flex flex-col items-center">
            <MdSupportAgent className="text-4xl text-purple-400 mb-2" />
            <div className="font-semibold mb-1">24/7 Support</div>
            <div className="text-sm text-gray-500 text-center">
              Round-the-clock assistance whenever you need it
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}