'use client';

import { useState } from 'react';
import { Leaf, Droplet, Recycle, ShieldCheck } from 'lucide-react';

/*
 * SUSTAINABILITY ATTRIBUTION:
 * Environmentally conscious laundry practices (advanced water management,
 * biodegradable formulas, energy-efficient commercial cycles) are attributed
 * to Cleanline Linen Management's broader group operations and standards.
 */

const ecoPillars = [
  {
    num: '01',
    icon: Droplet,
    title: 'Controlled Water Management',
    desc: 'Commercial batch cycles engineered to minimize water consumption per kilogram processed.',
  },
  {
    num: '02',
    icon: Leaf,
    title: 'Biodegradable Formulations',
    desc: 'Alignment with Cleanline group standards prioritizing eco-conscious, biodegradable cleaning agents.',
  },
  {
    num: '03',
    icon: Recycle,
    title: 'Fabric Longevity Focus',
    desc: 'Temperature-regulated laundering and balanced pH rinses that prolong linen lifespan and reduce replacement waste.',
  },
  {
    num: '04',
    icon: ShieldCheck,
    title: 'Responsible Operations',
    desc: 'Operational safety and environmental awareness informed by Cleanline Linen Management’s corporate practices.',
  },
];

const MARQUEE_ECO = [...ecoPillars, ...ecoPillars, ...ecoPillars, ...ecoPillars];

export default function Sustainability() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section id="sustainability" className="py-14 sm:py-20 md:py-24 bg-cream border-t border-b border-cream-dark select-none overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12">
          <span className="inline-flex items-center gap-2 text-olive font-semibold tracking-wider text-xs sm:text-sm uppercase mb-2">
            <Leaf size={14} className="text-olive" />
            ENVIRONMENTAL CONSCIOUSNESS
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-dark mb-3">
            Responsible <span className="italic text-olive font-normal">Laundry Care</span>
          </h2>
          <p className="text-gray-700 text-xs sm:text-sm md:text-base leading-relaxed font-body">
            Connected with Cleanline Linen Management&apos;s commitment to sustainable commercial operations, we follow responsible laundry practices that emphasize fabric longevity, efficient resource management, and environmental care across Southern Sri Lanka.
          </p>
        </div>

        {/* Auto-Scrolling Continuous Eco Pillars */}
        <div
          className="relative max-w-6xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Edge Gradient Fades */}
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-cream via-cream/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-cream via-cream/80 to-transparent z-10 pointer-events-none" />

          {/* Continuous Auto-Scrolling Track */}
          <div className="overflow-hidden py-3">
            <div
              className={`flex items-stretch gap-4 sm:gap-5 w-max ${
                isPaused ? '[animation-play-state:paused]' : ''
              }`}
              style={{
                animation: 'ecoMarquee 34s linear infinite',
              }}
            >
              {MARQUEE_ECO.map((item, idx) => (
                <div
                  key={`${item.title}-${idx}`}
                  className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100/90 flex flex-col justify-between hover:shadow-lg transition-all duration-300 w-[72vw] max-w-[280px] sm:w-[290px] shrink-0 cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-olive/15 text-olive flex items-center justify-center group-hover:bg-olive group-hover:text-white transition-colors">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-mono font-bold text-olive/60 bg-cream px-2 py-0.5 rounded-md border border-cream-dark">
                        {item.num}
                      </span>
                    </div>
                    <h3 className="font-heading font-semibold text-base sm:text-lg text-dark mb-2 group-hover:text-olive transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed font-body">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes ecoMarquee {
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
