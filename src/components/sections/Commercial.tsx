'use client';

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

        {/* Customer Categories Grid with Mobile Left-to-Right Scroll */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase tracking-widest text-accent font-semibold">
              Who We Serve in Southern Sri Lanka
            </h3>
            <span className="sm:hidden text-[11px] text-accent/80 font-medium animate-pulse">
              &larr; Swipe left to right &rarr;
            </span>
          </div>

          <div
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 no-scrollbar scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {hospitalityClients.map((client, idx) => (
              <motion.div
                key={client.name}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.15, margin: '-40px' }}
                transition={{ delay: (idx % 4) * 0.06, duration: 0.45 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-accent/40 transition-all duration-300 flex flex-col justify-between min-w-[270px] sm:min-w-0 snap-start flex-shrink-0 sm:flex-shrink"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-olive/30 text-accent flex items-center justify-center mb-3.5 border border-olive/40">
                    <client.icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-heading font-semibold text-lg text-white mb-1.5">
                    {client.name}
                  </h4>
                  <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                    {client.desc}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Linen Categories Card */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.15, margin: '-40px' }}
              transition={{ delay: 0.25, duration: 0.45 }}
              className="bg-gradient-to-br from-olive/40 to-primary/80 border border-accent/30 rounded-2xl p-5 flex flex-col justify-between min-w-[270px] sm:min-w-0 snap-start flex-shrink-0 sm:flex-shrink"
            >
              <div>
                <span className="text-accent text-xs font-semibold uppercase tracking-wider block mb-2">
                  Textile Types
                </span>
                <h4 className="font-heading font-semibold text-lg text-white mb-3">
                  Linen Categories Handled
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {linenCategories.map((linen) => (
                    <span
                      key={linen}
                      className="inline-block bg-white/10 text-white/90 text-[11px] sm:text-xs px-2.5 py-1 rounded-md border border-white/10"
                    >
                      {linen}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
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
    </section>
  );
}
