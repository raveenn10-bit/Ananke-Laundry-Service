'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CorporateClient {
  id: string;
  name: string;
  category: string;
  location: string;
  logo: string;
  alt: string;
}

export const CORPORATE_CLIENTS: CorporateClient[] = [
  {
    id: 'amangalla',
    name: 'Amangalla',
    category: 'Luxury Heritage Hotel',
    location: 'Galle Fort',
    logo: '/images/clients/amangalla.jpg',
    alt: 'Amangalla - Aman Resorts Galle Fort',
  },
  {
    id: 'radisson',
    name: 'Radisson Collection',
    category: '5-Star Resort & Spa',
    location: 'Galle',
    logo: '/images/clients/radisson-collection.jpg',
    alt: 'Radisson Collection Resort & Spa, Galle',
  },
  {
    id: 'crystal-sands',
    name: 'Crystal Sands',
    category: 'Luxury Sky Villas',
    location: 'Southern Coast',
    logo: '/images/clients/crystal-sands.jpg',
    alt: 'Crystal Sands Villas in the Sky',
  },
  {
    id: 'malabar-hill',
    name: 'Malabar Hill',
    category: 'Luxury Boutique Resort',
    location: 'Weligama',
    logo: '/images/clients/malabar-hill.jpg',
    alt: 'Malabar Hill Resort Weligama',
  },
  {
    id: 'fort-bazaar',
    name: 'Fort Bazaar',
    category: 'Boutique Hotel & Spa',
    location: 'Galle Fort',
    logo: '/images/clients/fort-bazaar.jpg',
    alt: 'Fort Bazaar - Teardrop Hotels Galle Fort',
  },
  {
    id: 'the-six',
    name: 'The Six',
    category: 'Boutique Villa & Cafe',
    location: 'Midigama',
    logo: '/images/clients/the-six.jpg',
    alt: 'The Six Luxury Stay Midigama',
  },
  {
    id: 'saffron',
    name: 'Saffron Cafe',
    category: 'Restaurant & Cafe',
    location: 'Southern Province',
    logo: '/images/clients/saffron.jpg',
    alt: 'Saffron Restaurant & Cafe',
  },
];

// Duplicate 4 times to ensure an infinite, seamless continuous auto-scroll loop
const MARQUEE_CLIENTS = [
  ...CORPORATE_CLIENTS,
  ...CORPORATE_CLIENTS,
  ...CORPORATE_CLIENTS,
  ...CORPORATE_CLIENTS,
];

export default function CorporateClients() {
  const [activeDot, setActiveDot] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const marqueeRef = useRef<HTMLDivElement>(null);

  // Cycle dots to match the reference design animation
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setActiveDot((prev) => (prev + 1) % CORPORATE_CLIENTS.length);
    }, 4000);
    return () => clearInterval(dotInterval);
  }, []);

  const handleNudge = (direction: 'left' | 'right') => {
    if (marqueeRef.current) {
      const shift = direction === 'left' ? -320 : 320;
      marqueeRef.current.scrollBy({ left: shift, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="corporate-clients"
      className="py-16 sm:py-24 bg-white border-y border-gray-100 overflow-hidden select-none relative"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section strictly matching reference design */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-normal tracking-[0.25em] md:tracking-[0.3em] text-[#1a2b25] uppercase mb-2">
            CORPORATE CLIENTS
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.25em] uppercase text-olive/80 bg-olive/10 px-3 py-1 rounded-full">
              NEW LOGOS
            </span>
          </div>
        </div>

        {/* Marquee Carousel Container */}
        <div
          className="relative max-w-7xl mx-auto group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Edge Gradient Fades for Luxury Finish */}
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          {/* Navigation Arrows */}
          <button
            onClick={() => handleNudge('left')}
            aria-label="Previous Clients"
            className="absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 shadow-lg border border-gray-200 text-[#1a2b25] hover:bg-olive hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-xs"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={() => handleNudge('right')}
            aria-label="Next Clients"
            className="absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 shadow-lg border border-gray-200 text-[#1a2b25] hover:bg-olive hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-xs"
          >
            <ChevronRight size={20} />
          </button>

          {/* Continuous Auto-Scrolling Track */}
          <div
            ref={marqueeRef}
            className="overflow-hidden py-4 px-2"
          >
            <div
              className={`flex items-center gap-6 sm:gap-8 w-max ${
                isPaused ? '[animation-play-state:paused]' : ''
              }`}
              style={{
                animation: 'corporateMarquee 32s linear infinite',
              }}
            >
              {MARQUEE_CLIENTS.map((client, idx) => (
                <div
                  key={`${client.id}-${idx}`}
                  className="w-64 sm:w-72 md:w-80 h-36 sm:h-44 md:h-48 shrink-0 bg-white rounded-2xl p-5 sm:p-7 md:p-8 flex items-center justify-center border border-gray-100/90 shadow-xs hover:shadow-xl hover:border-emerald-600/40 transition-all duration-300 group/card cursor-pointer"
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src={client.logo}
                      alt={client.alt}
                      fill
                      unoptimized
                      priority={idx < 6}
                      className="object-contain transition-transform duration-500 group-hover/card:scale-105"
                      sizes="(max-width: 640px) 256px, (max-width: 1024px) 288px, 320px"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Pagination Dots strictly matching reference design */}
          <div className="flex justify-center items-center gap-2.5 mt-8 sm:mt-12">
            {CORPORATE_CLIENTS.map((client, dotIdx) => (
              <button
                key={client.id}
                onClick={() => setActiveDot(dotIdx)}
                aria-label={`Go to ${client.name}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  activeDot === dotIdx
                    ? 'w-2.5 h-2.5 bg-emerald-600 ring-4 ring-emerald-600/20'
                    : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes corporateMarquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
      `}</style>
    </section>
  );
}