'use client';

import { motion } from 'framer-motion';
import { Leaf, Droplet, Recycle, ShieldCheck } from 'lucide-react';

/*
 * SUSTAINABILITY ATTRIBUTION:
 * Environmentally conscious laundry practices (advanced water management,
 * biodegradable formulas, energy-efficient commercial cycles) are attributed
 * to Cleanline Linen Management's broader group operations and standards.
 */

const ecoPillars = [
  {
    icon: Droplet,
    title: 'Controlled Water Management',
    desc: 'Commercial batch cycles engineered to minimize water consumption per kilogram processed.',
  },
  {
    icon: Leaf,
    title: 'Biodegradable Formulations',
    desc: 'Alignment with Cleanline group standards prioritizing eco-conscious, biodegradable cleaning agents.',
  },
  {
    icon: Recycle,
    title: 'Fabric Longevity Focus',
    desc: 'Temperature-regulated laundering and balanced pH rinses that prolong linen lifespan and reduce replacement waste.',
  },
  {
    icon: ShieldCheck,
    title: 'Responsible Operations',
    desc: 'Operational safety and environmental awareness informed by Cleanline Linen Management’s corporate practices.',
  },
];

export default function Sustainability() {
  return (
    <section id="sustainability" className="py-20 md:py-24 bg-cream border-t border-b border-cream-dark">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <span className="inline-flex items-center gap-2 text-olive font-semibold tracking-wider text-xs sm:text-sm uppercase mb-3">
            <Leaf size={14} className="text-olive" />
            ENVIRONMENTAL CONSCIOUSNESS
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-dark mb-4">
            Responsible <span className="italic text-olive font-normal">Laundry Care</span>
          </h2>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed font-body">
            Connected with Cleanline Linen Management&apos;s commitment to sustainable commercial operations, we follow responsible laundry practices that emphasize fabric longevity, efficient resource management, and environmental care across Southern Sri Lanka.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {ecoPillars.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/90 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="w-11 h-11 rounded-xl bg-olive/15 text-olive flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-semibold text-base sm:text-lg text-dark mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed font-body">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
