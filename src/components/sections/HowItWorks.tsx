'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CalendarPlus, Truck, Sparkles, CheckCircle } from 'lucide-react';

const steps = [
  { num: '01', title: 'Book Your Pickup', desc: 'Schedule a pickup online or via phone.', icon: CalendarPlus },
  { num: '02', title: 'We Collect', desc: 'Our team collects your laundry on time.', icon: Truck },
  { num: '03', title: 'We Clean & Care', desc: 'Expert cleaning and quality checks.', icon: Sparkles },
  { num: '04', title: 'Fresh Clothes Delivered', desc: 'Crisp, clean laundry delivered to your door.', icon: CheckCircle },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-dark mb-4"
          >
            How It <span className="italic font-heading text-olive">Works</span>
          </motion.h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
            4 simple steps to fresh, spotless garments delivered directly to your doorstep.
          </p>
        </div>

        <div ref={ref} className="relative max-w-5xl mx-auto">
          {/* Desktop Connecting Line */}
          <div className="hidden md:block absolute top-[6.5rem] left-0 w-full h-[2px] bg-gradient-to-r from-olive/10 via-olive/40 to-olive/10 z-0" />
          
          {/* Steps container - horizontal scroll on mobile */}
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:gap-4 relative z-10 no-scrollbar scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                whileHover={{ y: -6 }}
                transition={{ delay: 0.15 * idx, duration: 0.5 }}
                className="flex flex-col items-center text-center group min-w-[220px] snap-start flex-shrink-0 md:min-w-0 md:flex-shrink"
              >
                <div className="w-16 h-16 rounded-full border-2 border-olive flex items-center justify-center bg-white text-olive font-heading text-2xl font-bold mb-6 group-hover:bg-olive group-hover:text-white transition-all shadow-sm group-hover:shadow-lg group-hover:shadow-olive/20 group-hover:scale-110">
                  {idx + 1}
                </div>
                <div className="bg-cream w-20 h-20 rounded-full flex items-center justify-center mb-4 text-dark group-hover:bg-olive/10 group-hover:scale-110 transition-all shadow-inner">
                  <step.icon className="w-8 h-8 text-olive group-hover:text-accent transition-colors" />
                </div>
                <h3 className="font-heading font-semibold text-xl text-dark mb-2 group-hover:text-olive transition-colors">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

