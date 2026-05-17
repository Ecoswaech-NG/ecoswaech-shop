import React from 'react';
import Image from 'next/image';
import Search from './Search';

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-white dark:bg-[#f6f6f9]">
      <div
        className="relative flex flex-col items-center pt-18 pb-0 px-6 w-full rounded-b-[4rem] shadow-2xl min-h-[420px] overflow-visible"
        style={{
          background: 'linear-gradient(135deg, #0a0822, #220a77, #651fff, #220a77, #0a0822)',
    backgroundSize: '400% 400%',
        }}
      >
        <div className="relative z-10 flex flex-col items-center w-full max-w-5xl text-center">

          <p className="text-[#e0d7ff] text-[11px] md:text-[23px] font-medium mb-5 tracking-wide opacity-90">
            EcoSwaech Marketplace. Find your EV. Charge your EV
          </p>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
            <span className="text-white">Find Your </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4df8] via-[#00C8FF] to-[#00ff88]">
              EV Here
            </span>
          </h1>

          {/* Search bar */}
          <Search />

          {/* CTAs */}
          <div className="flex items-center gap-4 mb-8">
            <button className="px-5 py-2 bg-white/10 border border-white/20 text-white text-[11px] font-bold rounded-full backdrop-blur-md hover:bg-white/20 transition-all">
              Businesses & Partnerships
            </button>
            <button className="px-8 py-2 bg-[#7b2ff2] text-white text-[11px] font-bold rounded-full shadow-lg hover:bg-[#510668] transition-all">
              Dealers
            </button>
          </div>
        </div>

        {/* Car image — reduced height, same overlap effect */}
        <div className="relative w-full max-w-4xl h-[180px] md:h-[280px] mt-auto transform translate-y-16 z-20">
          <Image
            src="/tesla.png"
            alt="Tesla Model S"
            fill
            priority
            className="object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]"
          />
        </div>
      </div>

      {/* Spacer matches translate-y-16 = 4rem */}
      <div className="h-16" />
    </section>
  );
}