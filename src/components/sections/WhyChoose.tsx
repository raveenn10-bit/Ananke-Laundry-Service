'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Hotel, MapPin, Building, Network } from 'lucide-react';

const pillars = [
  {
    num: '01',
    icon: Sparkles,
    title: 'Professional Care',
    desc: 'Professional laundry processes focused on cleanliness, care and consistent results.',
  },
  {
    num: '02',
    icon: Hotel,
    title: 'Hospitality Focus',
    desc: 'Located in Unawatuna, close to one of Southern Sri Lanka’s most active hospitality destinations.',
  },
  {
    num: '03',
    icon: MapPin,
    title: 'Convenient Location',
    desc: 'Easy access from Unawatuna, Galle and surrounding Southern coastal areas along the Matara Road.',
  },
  {
    num: '04',
    icon: Building,
    title: 'Commercial Solutions',
    desc: 'Professional service options suitable for recurring business and hospitality laundry requirements.',
  },
  {
    num: '05',
    icon: Network,
    title: 'Industry Network',
    desc: 'Connected with Cleanline Linen Management’s wider professional laundry operation across Sri Lanka.',
  },
];

// Duplicate for continuous seamless marquee loop
const MARQUEE_PILLARS = [...pillars, ...pillars, ...pillars, ...pillars];

export default function WhyChoose() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section id="why-choose" className="py-14 sm:py-20 md:py-24 bg-primary text-white relative overflow-hidden select-none">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary/40 via-primary to-dark z-0 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-accent font-semibold tracking-wider text-xs sm:text-sm uppercase mb-2 block"
          >
            TRUST &amp; RELIABILITY
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-3"
          >
            Why Choose <span className="italic text-accent font-normal">Ananke Laundry</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-white/80 text-xs sm:text-sm md:text-base leading-relaxed font-body max-w-2xl mx-auto"
          >
            A dependable laundry partner in Unawatuna combining local accessibility with commercial-grade cleaning capabilities.
          </motion.p>
        </div>

        {/* Auto-Scrolling Continuous Track with Edge Fades */}
        <div
          className="relative max-w-7xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Edge Gradient Fades for Luxury Vignette Effect */}
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-primary via-primary/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-primary via-primary/80 to-transparent z-10 pointer-events-none" />

          {/* Continuous Auto-Scrolling Track */}
          <div className="overflow-hidden py-3">
            <div
              className={`flex items-stretch gap-4 sm:gap-5 w-max ${
                isPaused ? '[animation-play-state:paused]' : ''
              }`}
              style={{
                animation: 'whyChooseMarquee 34s linear infinite',
              }}
            >
              {MARQUEE_PILLARS.map((pillar, idx) => (
                <div
                  key={`${pillar.title}-${idx}`}
                  className="w-[72vw] max-w-[280px] sm:w-[290px] md:w-[310px] shrink-0 bg-white/[0.08] backdrop-blur-md border border-white/15 rounded-2xl p-5 sm:p-6 hover:bg-white/[0.14] hover:border-accent/50 transition-all duration-300 flex flex-col justify-between group shadow-lg cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl border border-accent/30 bg-accent/15 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-primary transition-all shadow-inner">
                        <pillar.icon className="w-5 h-5 transition-colors" />
                      </div>
                      <span className="text-[11px] font-mono font-bold text-accent/80 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                        {pillar.num}
                      </span>
                    </div>
                    <h3 className="font-heading font-semibold text-base sm:text-lg mb-2 text-white group-hover:text-accent transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-white/80 text-xs sm:text-sm leading-relaxed font-body">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes whyChooseMarquee {
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
