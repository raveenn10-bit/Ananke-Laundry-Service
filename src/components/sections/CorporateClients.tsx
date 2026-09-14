'use client';

import { useState, useEffect } from 'react';
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

const DISPLAY_CLIENTS = [...CORPORATE_CLIENTS, ...CORPORATE_CLIENTS];

export default function CorporateClients() {
  const [activePage, setActivePage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

  // Responsive items visible count
  useEffect(() => {
    const updateCount = () => {
      if (typeof window === 'undefined') return;
      if (window.innerWidth < 640) {
        setVisibleCount(2);
      } else if (window.innerWidth < 768) {
        setVisibleCount(3);
      } else if (window.innerWidth < 1280) {
        setVisibleCount(4);
      } else {
        setVisibleCount(5);
      }
    };

    updateCount();
    window.addEventListener('resize', updateCount);
    return () => window.removeEventListener('resize', updateCount);
  }, []);

  const totalClients = CORPORATE_CLIENTS.length;

  // Auto rotation timer every 3.5 seconds
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setActivePage((prev) => (prev + 1) % totalClients);
    }, 3500);

    return () => clearInterval(timer);
  }, [totalClients, isPaused]);

  const handlePrev = () => {
    setActivePage((prev) => (prev - 1 + totalClients) % totalClients);
  };

  const handleNext = () => {
    setActivePage((prev) => (prev + 1) % totalClients);
  };

  return (
    <section
      id="corporate-clients"
      className="py-16 sm:py-20 bg-white border-y border-gray-100 overflow-hidden select-none relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section strictly matching reference design */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-medium tracking-[0.25em] md:tracking-[0.3em] text-[#1a2b25] uppercase mb-2">
            CORPORATE CLIENTS
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.25em] uppercase text-olive/80 bg-olive/10 px-3 py-1 rounded-full">
              NEW LOGOS
            </span>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-7xl mx-auto">
          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            aria-label="Previous Clients"
            className="absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-md border border-gray-200 text-[#1a2b25] hover:bg-olive hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={handleNext}
            aria-label="Next Clients"
            className="absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-md border border-gray-200 text-[#1a2b25] hover:bg-olive hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>

          {/* Slider Window */}
          <div className="overflow-hidden px-2 sm:px-4 py-3">
            <motion.div
              className="flex items-center"
              animate={{
                x: `-${activePage * (100 / visibleCount)}%`,
              }}
              transition={{
                duration: 0.6,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            >
              {DISPLAY_CLIENTS.map((client, idx) => (
                <div
                  key={`${client.id}-${idx}`}
                  style={{
                    flex: `0 0 ${100 / visibleCount}%`,
                    maxWidth: `${100 / visibleCount}%`,
                  }}
                  className="px-2 sm:px-3 md:px-4 min-w-0 shrink-0"
                >
                  <div className="group bg-white rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center border border-gray-100 hover:border-emerald-600/30 shadow-xs hover:shadow-md transition-all duration-300 h-36 sm:h-40 md:h-44">
                    <div className="relative w-full h-24 sm:h-28 md:h-32 flex items-center justify-center overflow-hidden rounded-xl bg-gray-50/60 p-2">
                      <Image
                        src={client.logo}
                        alt={client.alt}
                        fill
                        className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                    </div>
                    <span className="mt-2 text-[11px] sm:text-xs font-semibold text-gray-500 group-hover:text-[#1a2b25] transition-colors truncate max-w-full text-center">
                      {client.name}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Carousel Pagination Dots strictly matching reference design */}
          <div className="flex justify-center items-center gap-2.5 mt-8 sm:mt-10">
            {CORPORATE_CLIENTS.map((client, dotIdx) => (
              <button
                key={client.id}
                onClick={() => setActivePage(dotIdx)}
                aria-label={`Go to ${client.name}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  activePage === dotIdx
                    ? 'w-2.5 h-2.5 bg-emerald-600 ring-4 ring-emerald-600/20'
                    : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}