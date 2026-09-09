'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Sparkles, Hotel, MapPin, Building, Network } from 'lucide-react';

const pillars = [
  {
    icon: Sparkles,
    title: 'Professional Care',
    desc: 'Professional laundry processes focused on cleanliness, care and consistent results.',
  },
  {
    icon: Hotel,
    title: 'Hospitality Focus',
    desc: 'Located in Unawatuna, close to one of Southern Sri Lanka’s most active hospitality destinations.',
  },
  {
    icon: MapPin,
    title: 'Convenient Location',
    desc: 'Easy access from Unawatuna, Galle and surrounding Southern coastal areas along the Matara Road.',
  },
  {
    icon: Building,
    title: 'Commercial Solutions',
    desc: 'Professional service options suitable for recurring business and hospitality laundry requirements.',
  },
  {
    icon: Network,
    title: 'Industry Network',
    desc: 'Connected with Cleanline Linen Management’s wider professional laundry operation across Sri Lanka.',
  },
];

export default function WhyChoose() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="why-choose" className="py-20 md:py-28 bg-primary text-white relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary/40 via-primary to-dark z-0" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-accent font-semibold tracking-wider text-xs sm:text-sm uppercase mb-3 block"
          >
            TRUST &amp; RELIABILITY
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold font-heading mb-6"
          >
            Why Choose <span className="italic text-accent font-normal">Ananke Laundry</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/80 text-base md:text-lg leading-relaxed font-body"
          >
            A dependable laundry partner in Unawatuna combining local accessibility with commercial-grade cleaning capabilities.
          </motion.p>
        </div>

        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5"
        >
          {pillars.map((pillar, idx) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              whileHover={{ y: -6 }}
              transition={{ delay: 0.08 * idx, duration: 0.45 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-accent/40 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl border border-olive/40 bg-olive/20 flex items-center justify-center mb-5 group-hover:bg-accent group-hover:text-primary transition-all shadow-inner">
                  <pillar.icon className="w-6 h-6 text-accent group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2.5 text-white group-hover:text-accent transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-white/75 text-xs sm:text-sm leading-relaxed font-body">
                  {pillar.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
