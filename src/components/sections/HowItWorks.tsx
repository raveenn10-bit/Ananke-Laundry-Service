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
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-dark mb-4"
          >
            How It Works
          </motion.h2>
        </div>

        <div ref={ref} className="relative max-w-5xl mx-auto">
          {/* Desktop Connecting Line */}
          <div className="hidden md:block absolute top-[6.5rem] left-0 w-full h-[2px] bg-olive/20 z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 relative z-10">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 * idx, duration: 0.5 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-full border-2 border-olive flex items-center justify-center bg-white text-olive font-heading text-2xl font-bold mb-6 group-hover:bg-olive group-hover:text-white transition-colors">
                  {idx + 1}
                </div>
                <div className="bg-cream w-20 h-20 rounded-full flex items-center justify-center mb-4 text-dark group-hover:scale-110 transition-transform">
                  <step.icon className="w-8 h-8" />
                </div>
                <h3 className="font-heading font-semibold text-xl text-dark mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
