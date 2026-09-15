'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Palmtree,
  Home,
  DoorOpen,
  UtensilsCrossed,
  Sparkles,
  BedDouble,
  CheckCircle2,
  FileText,
  Phone,
  Layers,
} from 'lucide-react';

const hospitalityClients = [
  { name: 'Hotels & Boutique Stays', icon: Building2, desc: 'Reliable linen turnaround for luxury rooms and suites.' },
  { name: 'Resorts & Beach Properties', icon: Palmtree, desc: 'High-volume bath, pool towels, and guest bedding.' },
  { name: 'Private Luxury Villas', icon: Home, desc: 'Bespoke fabric care for upscale coastal villas in Galle & Unawatuna.' },
  { name: 'Guest Houses & Inns', icon: DoorOpen, desc: 'Dependable, recurring washing and pressing services.' },
  { name: 'Restaurants & Beach Cafés', icon: UtensilsCrossed, desc: 'Crisp table linen, napkins, and kitchen uniforms.' },
  { name: 'Wellness Spas & Salons', icon: Sparkles, desc: 'Fresh, sanitized plush towels and robe care.' },
  { name: 'Airbnb Hosts & Rentals', icon: BedDouble, desc: 'Fast turnaround between guest check-ins and check-outs.' },
];

// Duplicate for continuous seamless marquee loop
const MARQUEE_CLIENTS = [
  ...hospitalityClients,
  ...hospitalityClients,
  ...hospitalityClients,
];

const linenCategories = [
  'Bed Sheets & Linens',
  'Pillowcases & Protectors',
  'Plush Bath & Beach Towels',
  'Table Linens & Runners',
  'Restaurant Napkins',
  'Staff & Chef Uniforms',
  'Hospitality Textiles',
];

export default function Commercial() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section id="commercial" className="py-20 md:py-28 bg-primary text-white relative overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-olive/20 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-3xl mb-16 text-center md:text-left">
          <span className="inline-flex items-center gap-2 bg-white/10 text-accent font-semibold tracking-wider text-xs uppercase px-3.5 py-1.5 rounded-full mb-3 border border-white/15">
            <Layers size={13} />
            HOSPITALITY &amp; B2B SOLUTIONS
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading mb-5 leading-tight">
            Laundry Solutions for <span className="italic text-accent font-normal">Hospitality Businesses</span>
          </h2>
          <p className="text-white/80 text-base md:text-lg leading-relaxed font-body">
            Professional laundry and linen-care solutions designed around the needs of Sri Lanka&apos;s Southern hospitality sector.
          </p>
        </div>

        {/* Customer Categories with Smooth Auto-Scroll Marquee */}
        <div
          className="mb-14 relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase tracking-widest text-accent font-semibold">
              Who We Serve in Southern Sri Lanka
            </h3>
            <span className="text-[11px] text-accent/80 font-mono tracking-wider uppercase bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
              Hospitality Partners
            </span>
          </div>

          {/* Edge Gradient Fades for Luxury Vignette Effect */}
          <div className="absolute left-0 top-10 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-primary via-primary/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-10 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-primary via-primary/80 to-transparent z-10 pointer-events-none" />

          {/* Continuous Auto-Scrolling Track */}
          <div className="overflow-hidden py-3">
            <div
              className={`flex items-stretch gap-4 sm:gap-5 w-max ${
                isPaused ? '[animation-play-state:paused]' : ''
              }`}
              style={{
                animation: 'commercialMarquee 40s linear infinite',
              }}
            >
              {MARQUEE_CLIENTS.map((client, idx) => (
                <div
                  key={`${client.name}-${idx}`}
                  className="bg-white/[0.08] backdrop-blur-sm border border-white/15 rounded-2xl p-5 sm:p-6 hover:bg-white/[0.14] hover:border-accent/40 transition-all duration-300 flex flex-col justify-between w-[72vw] max-w-[280px] sm:w-[290px] md:w-[310px] shrink-0 group shadow-lg cursor-pointer"
                >
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-accent/15 text-accent flex items-center justify-center mb-3.5 border border-accent/30 group-hover:bg-accent group-hover:text-primary transition-all shadow-inner">
                      <client.icon className="w-5 h-5 transition-colors" />
                    </div>
                    <h4 className="font-heading font-semibold text-base sm:text-lg text-white mb-1.5 group-hover:text-accent transition-colors">
                      {client.name}
                    </h4>
                    <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                      {client.desc}
                    </p>
                  </div>
                </div>
              ))}

              {/* Linen Categories Featured Card inside Marquee */}
              <div className="bg-gradient-to-br from-olive/50 to-primary/90 border border-accent/40 rounded-2xl p-5 sm:p-6 flex flex-col justify-between w-[72vw] max-w-[280px] sm:w-[290px] md:w-[310px] shrink-0 shadow-lg">
                <div>
                  <span className="text-accent text-[11px] font-semibold uppercase tracking-wider block mb-2">
                    Textile Types
                  </span>
                  <h4 className="font-heading font-semibold text-base sm:text-lg text-white mb-3">
                    Linen Categories Handled
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {linenCategories.slice(0, 5).map((linen) => (
                      <span
                        key={linen}
                        className="inline-block bg-white/10 text-white/90 text-[11px] px-2.5 py-1 rounded-md border border-white/10"
                      >
                        {linen}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Commercial Trust & Action Banner */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-white/15 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="max-w-2xl text-center lg:text-left">
            <h3 className="text-2xl sm:text-3xl font-bold font-heading mb-3 text-white">
              Ready to Upgrade Your Property&apos;s Linen Service?
            </h3>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-6 font-body">
              Partner with Ananke Laundry for dependable quality, commercial hygiene standards, and responsive local support in Unawatuna and Galle.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs sm:text-sm text-white/90">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-accent" /> Consistent Hospitality Hygiene
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-accent" /> Cleanline Linen Management Network
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-accent" /> Convenient Unawatuna Location
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
            <a
              href="#contact"
              className="bg-accent hover:bg-olive text-dark hover:text-white font-bold px-7 py-4 rounded-full transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg hover:shadow-accent/25 hover:scale-[1.02] text-center"
            >
              <FileText className="w-5 h-5" />
              Request a Commercial Laundry Quote
            </a>
            <a
              href="tel:+94912250777"
              className="bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold px-6 py-4 rounded-full transition-colors flex items-center justify-center gap-2 text-sm sm:text-base text-center"
            >
              <Phone className="w-4 h-4 text-accent" />
              091 225 0777
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes commercialMarquee {
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
