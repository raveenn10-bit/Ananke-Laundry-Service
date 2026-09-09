'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { MessageSquareText, ClipboardList, Sparkles, PackageCheck } from 'lucide-react';

/*
 * CLIENT CONFIRMATION REQUIRED:
 * Pickup & delivery routes and schedules are pending formal confirmation.
 * Currently presenting "Ready for Collection" at the Unawatuna facility.
 */

const steps = [
  {
    num: '01',
    title: 'Contact Us',
    desc: 'Tell us about your laundry or linen-care requirements via phone or online inquiry.',
    icon: MessageSquareText,
  },
  {
    num: '02',
    title: 'Requirement Assessment',
    desc: 'For commercial clients, we assess laundry type, volume and service requirements.',
    icon: ClipboardList,
  },
  {
    num: '03',
    title: 'Professional Processing',
    desc: 'Laundry is processed according to appropriate professional care requirements.',
    icon: Sparkles,
  },
  {
    num: '04',
    title: 'Ready for Collection',
    desc: 'Freshly cleaned, inspected, pressed, and packed for collection at our Unawatuna location.',
    icon: PackageCheck,
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="text-olive font-semibold tracking-wider text-xs sm:text-sm uppercase mb-3 block">
            HOW IT WORKS
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-dark mb-4 font-heading">
            Simple, Transparent <span className="italic text-olive font-normal">Process</span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-body">
            A clear 4-step workflow tailored for both individual garment care and commercial hospitality operations.
          </p>
        </div>

        <div ref={ref} className="relative max-w-5xl mx-auto">
          {/* Desktop Connecting Line */}
          <div className="hidden md:block absolute top-[6.5rem] left-0 w-full h-[2px] bg-gradient-to-r from-olive/10 via-olive/40 to-olive/10 z-0" />

          {/* Steps container */}
          <div
            className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:gap-6 relative z-10 no-scrollbar scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {steps.map((step, idx) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                whileHover={{ y: -6 }}
                transition={{ delay: 0.12 * idx, duration: 0.5 }}
                className="flex flex-col items-center text-center group min-w-[240px] snap-start flex-shrink-0 md:min-w-0 md:flex-shrink"
              >
                <div className="w-16 h-16 rounded-full border-2 border-olive flex items-center justify-center bg-white text-olive font-heading text-2xl font-bold mb-6 group-hover:bg-olive group-hover:text-white transition-all shadow-sm group-hover:shadow-lg group-hover:shadow-olive/20 group-hover:scale-110">
                  {step.num}
                </div>
                <div className="bg-cream w-20 h-20 rounded-2xl flex items-center justify-center mb-4 text-dark group-hover:bg-olive/10 group-hover:scale-105 transition-all shadow-inner border border-cream-dark">
                  <step.icon className="w-8 h-8 text-olive group-hover:text-accent transition-colors" />
                </div>
                <h3 className="font-heading font-semibold text-lg sm:text-xl text-dark mb-2 group-hover:text-olive transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed font-body">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

