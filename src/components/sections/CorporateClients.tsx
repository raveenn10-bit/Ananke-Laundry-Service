'use client';

import { useState } from 'react';
import Image from 'next/image';

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
    logo: '/images/clients/amangalla.png',
    alt: 'Amangalla - Aman Resorts Galle Fort',
  },
  {
    id: 'radisson',
    name: 'Radisson Collection',
    category: '5-Star Resort & Spa',
    location: 'Galle',
    logo: '/images/clients/radisson-collection.png',
    alt: 'Radisson Collection Resort & Spa, Galle',
  },
  {
    id: 'crystal-sands',
    name: 'Crystal Sands',
    category: 'Luxury Sky Villas',
    location: 'Southern Coast',
    logo: '/images/clients/crystal-sands.png',
    alt: 'Crystal Sands Villas in the Sky',
  },
  {
    id: 'malabar-hill',
    name: 'Malabar Hill',
    category: 'Luxury Boutique Resort',
    location: 'Weligama',
    logo: '/images/clients/malabar-hill.png',
    alt: 'Malabar Hill Resort Weligama',
  },
  {
    id: 'fort-bazaar',
    name: 'Fort Bazaar',
    category: 'Boutique Hotel & Spa',
    location: 'Galle Fort',
    logo: '/images/clients/fort-bazaar.png',
    alt: 'Fort Bazaar - Teardrop Hotels Galle Fort',
  },
  {
    id: 'the-six',
    name: 'The Six',
    category: 'Boutique Villa & Cafe',
    location: 'Midigama',
    logo: '/images/clients/the-six.png',
    alt: 'The Six Luxury Stay Midigama',
  },
  {
    id: 'saffron',
    name: 'Saffron Cafe',
    category: 'Restaurant & Cafe',
    location: 'Southern Province',
    logo: '/images/clients/saffron.png',
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
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section
      id="corporate-clients"
      className="py-16 sm:py-20 bg-white border-y border-gray-100 overflow-hidden select-none relative"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-normal tracking-[0.25em] md:tracking-[0.3em] text-[#1a2b25] uppercase">
            CORPORATE CLIENTS
          </h2>
        </div>

        {/* Seamless Marquee Container */}
        <div
          className="relative max-w-7xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Edge Gradient Fades for Luxury Finish */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          {/* Continuous Auto-Scrolling Track - Merged directly into background with no cards or box shapes */}
          <div className="overflow-hidden py-4">
            <div
              className={`flex items-center gap-10 sm:gap-14 md:gap-20 w-max ${
                isPaused ? '[animation-play-state:paused]' : ''
              }`}
              style={{
                animation: 'corporateMarquee 35s linear infinite',
              }}
            >
              {MARQUEE_CLIENTS.map((client, idx) => (
                <div
                  key={`${client.id}-${idx}`}
                  className="w-44 sm:w-52 md:w-60 h-20 sm:h-24 md:h-28 shrink-0 flex items-center justify-center p-2 transition-transform duration-300 hover:scale-105"
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src={client.logo}
                      alt={client.alt}
                      fill
                      unoptimized
                      priority={idx < 7}
                      className="object-contain filter drop-shadow-none"
                      sizes="(max-width: 640px) 176px, (max-width: 1024px) 208px, 240px"
                    />
                  </div>
                </div>
              ))}
            </div>
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