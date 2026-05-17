"use client";

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { FaTruck } from 'react-icons/fa'
import { MdDeliveryDining, MdSupportAgent } from 'react-icons/md'
import { BsLightningCharge } from 'react-icons/bs'
import { GiAutoRepair } from 'react-icons/gi'

const SERVICE_TYPES = [
  { label: 'All', value: '', icon: null },
  { label: 'Vehicle Transport', value: 'Vehicle Transport', icon: <FaTruck className="text-lg mr-2" /> },
  { label: 'EV Delivery', value: 'EV Delivery', icon: <MdDeliveryDining className="text-lg mr-2" /> },
  { label: 'Charging Setup', value: 'Charging Setup', icon: <BsLightningCharge className="text-lg mr-2" /> },
  { label: 'Maintenance', value: 'Maintenance', icon: <GiAutoRepair className="text-lg mr-2" /> }
];

interface LogisticsService {
  id: number;
  name: string;
  type: string;
  description: string | null;
  coverage: string | null;
  pricing: string | null;
  contact: string | null;
  specializations: string | null;
  certifications: string | null;
  status: string;
  userName: string;
  userImageUrl: string | null;
  createdAt: string;
}

export default function LogisticsPage() {
  const [services, setServices] = useState<LogisticsService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    async function fetchLogistics() {
      setLoading(true);
      try {
        const res = await fetch('/api/logistics', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setServices(data || []);
        }
      } catch (error) {
        console.error('Failed to fetch logistics:', error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    }
    fetchLogistics();
  }, []);

  const filteredServices = services.filter(service => {
    const matchesCategory = category ? service.type === category : true;
    const matchesSearch =
      search.trim() === '' ||
      service.coverage?.toLowerCase().includes(search.toLowerCase()) ||
      service.name?.toLowerCase().includes(search.toLowerCase()) ||
      service.description?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getServiceIcon = (type: string) => {
    switch(type) {
      case 'Vehicle Transport': return <FaTruck className="text-3xl" />;
      case 'EV Delivery': return <MdDeliveryDining className="text-3xl" />;
      case 'Charging Setup': return <BsLightningCharge className="text-3xl" />;
      case 'Maintenance': return <GiAutoRepair className="text-3xl" />;
      default: return <FaTruck className="text-3xl" />;
    }
  };

  const getServiceColor = (type: string) => {
    switch(type) {
      case 'Vehicle Transport': return { bg: 'from-blue-400 to-blue-600', icon: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' };
      case 'EV Delivery': return { bg: 'from-green-400 to-green-600', icon: 'text-green-600', badge: 'bg-green-100 text-green-700' };
      case 'Charging Setup': return { bg: 'from-yellow-400 to-yellow-600', icon: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-700' };
      case 'Maintenance': return { bg: 'from-orange-400 to-orange-600', icon: 'text-orange-600', badge: 'bg-orange-100 text-orange-700' };
      default: return { bg: 'from-gray-400 to-gray-600', icon: 'text-gray-600', badge: 'bg-gray-100 text-gray-700' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="w-full bg-gradient-to-r from-[#ff512f] via-[#f09819] to-[#ff512f] py-16 px-2 flex flex-col items-center relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
         
          <div className="absolute bottom-10 right-10 text-6xl">⚡</div>
          <div className="absolute top-1/2 right-1/4 text-6xl">🔧</div>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-3 text-center drop-shadow-lg">
            EV Logistics Solutions
          </h1>
          <p className="text-white/90 text-lg md:text-xl mb-10 text-center max-w-2xl drop-shadow">
            Complete transportation, charging setup, and maintenance services for your electric vehicles
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-0 px-2 py-2 w-full max-w-3xl backdrop-blur">
            <input
              className="flex-1 border-none outline-none bg-transparent px-4 py-3 text-gray-700 placeholder-gray-400 w-full"
              placeholder="Search by coverage area, name, or services..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              className="flex-1 md:border-l md:border-gray-200 px-4 py-3 bg-transparent text-gray-700 cursor-pointer w-full md:w-auto font-medium"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {SERVICE_TYPES.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Buttons */}
          <div className="flex gap-3 mt-6 flex-wrap justify-center">
            {SERVICE_TYPES.map(opt => (
              <button
                key={opt.value}
                onClick={() => setCategory(opt.value)}
                className={`flex items-center px-5 py-2.5 rounded-full font-bold shadow-lg transition-all duration-300 transform hover:scale-105 ${
                  category === opt.value
                    ? 'bg-white text-[#ff512f] shadow-2xl scale-105'
                    : 'bg-white/20 text-white border-2 border-white/40 hover:bg-white/30 hover:border-white/60'
                }`}
              >
                {opt.icon}
                <span className="text-sm">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Service Categories Showcase */}
      <div className="max-w-6xl mx-auto w-full px-4 py-16">
        <h2 className="text-3xl font-black text-gray-900 text-center mb-3">Our Service Categories</h2>
        <p className="text-center text-gray-600 mb-12 text-lg">Expert providers for every logistics need</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {[
            { type: 'Vehicle Transport', icon: <FaTruck />, desc: 'Safe EV transportation' },
            { type: 'EV Delivery', icon: <MdDeliveryDining />, desc: 'Fast delivery services' },
            { type: 'Charging Setup', icon: <BsLightningCharge />, desc: 'Charging infrastructure' },
            { type: 'Maintenance', icon: <GiAutoRepair />, desc: 'Expert maintenance' }
          ].map((cat) => {
            const colors = getServiceColor(cat.type);
            return (
              <button
                key={cat.type}
                onClick={() => setCategory(cat.type)}
                className={`group relative p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer ${
                  category === cat.type
                    ? 'bg-gradient-to-br ' + colors.bg + ' shadow-2xl'
                    : 'bg-white border-2 border-gray-100 hover:border-[#ff512f] shadow-sm'
                }`}
              >
                <div className={`text-5xl mb-3 transition-all ${category === cat.type ? 'text-white scale-110' : colors.icon}`}>
                  {cat.icon}
                </div>
                <h3 className={`font-bold text-lg mb-1 ${category === cat.type ? 'text-white' : 'text-gray-900'}`}>
                  {cat.type}
                </h3>
                <p className={`text-sm ${category === cat.type ? 'text-white/80' : 'text-gray-600'}`}>
                  {cat.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Services List */}
      <div className="max-w-6xl mx-auto w-full px-4 py-10 mb-20">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900">Available Services</h2>
            <p className="text-gray-600 mt-1">
              {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-bounce">
              <FaTruck className="text-6xl text-gray-300 mb-4" />
            </div>
            <div className="text-lg font-semibold text-gray-600 mb-2">Loading services...</div>
            <div className="text-sm text-gray-400">Please wait</div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-100 rounded-3xl">
            <FaTruck className="text-6xl text-gray-300 mb-4" />
            <div className="text-lg font-semibold text-gray-600 mb-2">No services found</div>
            <div className="text-sm text-gray-500">Try adjusting your search or filters</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map(service => {
              const colors = getServiceColor(service.type);
              return (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#ff512f] group"
                >
                  {/* Header with Gradient */}
                  <div className={`h-32 bg-gradient-to-br ${colors.bg} flex items-center justify-center relative overflow-hidden`}>
                    <div className="text-6xl opacity-20 absolute">{service.type === 'Vehicle Transport' ? '🚚' : service.type === 'EV Delivery' ? '📦' : service.type === 'Charging Setup' ? '⚡' : '🔧'}</div>
                    <div className="relative z-10 text-white text-5xl group-hover:scale-110 transition-transform">
                      {getServiceIcon(service.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-black text-lg text-gray-900 mb-1 line-clamp-2">
                          {service.name}
                        </h3>
                        <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${colors.badge}`}>
                          {service.type}
                        </span>
                      </div>
                    </div>

                    {service.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {service.description}
                      </p>
                    )}

                    {/* Details Grid */}
                    <div className="space-y-3 mb-5 text-xs">
                      {service.coverage && (
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-gray-700 min-w-fit">📍 Coverage:</span>
                          <span className="text-gray-600 line-clamp-1">{service.coverage}</span>
                        </div>
                      )}
                      {service.pricing && (
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-gray-700 min-w-fit">💰 Pricing:</span>
                          <span className="text-gray-600 line-clamp-1">{service.pricing}</span>
                        </div>
                      )}
                      {service.contact && (
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-gray-700 min-w-fit">📞 Contact:</span>
                          <span className="text-gray-600 line-clamp-1">{service.contact}</span>
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    {(service.specializations || service.certifications) && (
                      <div className="flex flex-wrap gap-2 mb-5">
                        {service.specializations && (
                          <span className="text-xs px-2.5 py-1 bg-green-100 text-green-700 font-bold rounded-full">
                            ⭐ {service.specializations.split(',')[0].trim()}
                          </span>
                        )}
                        {service.certifications && (
                          <span className="text-xs px-2.5 py-1 bg-blue-100 text-blue-700 font-bold rounded-full">
                            ✓ Certified
                          </span>
                        )}
                      </div>
                    )}

                    {/* Provider Info */}
                    {service.userName && (
                      <div className="flex items-center gap-3 pb-5 border-t border-gray-100 pt-4">
                        <img
                          src={service.userImageUrl || 'https://via.placeholder.com/40'}
                          alt={service.userName}
                          className="w-10 h-10 rounded-full object-cover border-2 border-[#ff512f]"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{service.userName}</p>
                          <p className="text-xs text-gray-500">Service Provider</p>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button className="flex-1 py-2.5 text-xs font-black bg-gradient-to-r from-[#ff512f] to-[#f09819] text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105">
                        Request Service
                      </button>
                      <button className="flex-1 py-2.5 text-xs font-bold border-2 border-[#ff512f] text-[#ff512f] rounded-xl hover:bg-[#ff512f]/5 transition">
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Why Choose Section */}
      <div className="w-full bg-gradient-to-r from-[#340a77] to-[#ff512f] py-20 px-4 mb-10">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-black text-white text-center mb-4">Why Choose Our Logistics Partners?</h3>
          <p className="text-center text-white/80 mb-12 text-lg max-w-2xl mx-auto">
            Vetted, certified service providers dedicated to EV transportation excellence
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: '🛡️', title: 'Verified & Certified', desc: 'All partners thoroughly vetted' },
              { icon: '⚡', title: 'EV Specialist', desc: 'Expert in electric vehicles' },
              { icon: '🌍', title: 'Wide Coverage', desc: 'Nation-wide service reach' },
              { icon: '🕐', title: '24/7 Support', desc: 'Round-the-clock assistance' }
            ].map((item, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute inset-0 bg-white/10 rounded-2xl blur group-hover:blur-md transition-all"></div>
                <div className="relative bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:border-white/40 transition-all text-center">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h4 className="text-white font-black mb-2">{item.title}</h4>
                  <p className="text-white/70 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}