'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, Settings, Users, ShieldCheck, Zap, Truck, HeartHandshake, Leaf } from 'lucide-react';

const features = [
  { icon: Star, title: 'Premium Garment Care', desc: 'Expert handling for all fabrics to ensure longevity and freshness.' },
  { icon: Settings, title: 'Modern Equipment', desc: 'State-of-the-art machines for superior cleaning results.' },
  { icon: Users, title: 'Skilled Team', desc: 'Trained professionals dedicated to quality finishing.' },
  { icon: ShieldCheck, title: 'Hygienic Process', desc: 'Strict sanitation protocols for your peace of mind.' },
  { icon: Zap, title: 'Fast Turnaround', desc: 'Quick and efficient service without compromising quality.' },
  { icon: Truck, title: 'Reliable Pickup & Delivery', desc: 'Convenient scheduling that fits your busy lifestyle.' },
  { icon: HeartHandshake, title: 'Customer Satisfaction', desc: 'We prioritize your needs and guarantee satisfaction.' },
  { icon: Leaf, title: 'Eco-Conscious Approach', desc: 'Environmentally friendly detergents and practices.' },
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
            className="text-accent font-semibold tracking-wider text-sm uppercase mb-3 block"
          >
            WHY CHOOSE US
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold mb-6"
          >
            Quality You <span className="font-heading italic text-accent font-normal">Can Trust</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/80 text-lg"
          >
            We go above and beyond to provide a laundry experience that saves you time and keeps your garments looking their absolute best.
          </motion.p>
        </div>

        <div ref={ref} className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 md:gap-8 no-scrollbar scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ delay: 0.08 * idx, duration: 0.45 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-accent/40 transition-all min-w-[240px] sm:min-w-0 snap-start flex-shrink-0 sm:flex-shrink group"
            >
              <div className="w-12 h-12 rounded-2xl border border-olive/40 bg-olive/20 flex items-center justify-center text-olive mb-4 group-hover:bg-accent group-hover:text-primary transition-all shadow-inner">
                <feature.icon className="w-6 h-6 text-accent group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-white group-hover:text-accent transition-colors">{feature.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
