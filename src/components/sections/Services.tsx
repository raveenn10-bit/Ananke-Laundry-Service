'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import {
  WashingMachine,
  Sparkles,
  Shirt,
  Layers,
  Building,
  Droplets,
  ClipboardCheck,
  ArrowRight,
} from 'lucide-react';

/*
 * CLIENT CONFIRMATION REQUIRED:
 * Historical unconfirmed services (Wash & Dry per kg, Curtains, Sarees, Express 24h guarantee, Pickup & Delivery radius)
 * are excluded from public advertising until formally confirmed by client.
 */

const services = [
  {
    num: '01',
    title: 'Professional Washing',
    image: '/images/service-washing.jpg',
    icon: WashingMachine,
    desc: 'Controlled commercial washing protocols using quality detergents and fabric-appropriate temperature cycles.',
  },
  {
    num: '02',
    title: 'Pressing',
    image: '/images/service-ironing.jpg',
    icon: Shirt,
    desc: 'Precision steam pressing and rotary ironing for crisp shirts, garments, uniforms, and hospitality linens.',
  },
  {
    num: '03',
    title: 'Dry Cleaning',
    image: '/images/service-drycleaning.jpg',
    icon: Sparkles,
    desc: 'Specialized solvent-based care for suits, formal attire, delicate fabrics, and structure-sensitive textiles.',
  },
  {
    num: '04',
    title: 'Stain Removal',
    image: '/images/service-stain.jpg',
    icon: Droplets,
    desc: 'Targeted spot treatment and pre-wash stain extraction formulated to preserve fabric integrity.',
  },
  {
    num: '05',
    title: 'Linen Care',
    image: '/images/service-bedding.jpg',
    icon: Layers,
    desc: 'Thorough sanitation and fabric conditioning for duvet covers, bed sheets, pillowcases, and bath towels.',
  },
  {
    num: '06',
    title: 'Commercial Laundry Solutions',
    image: '/images/service-hotel.jpg',
    icon: Building,
    desc: 'High-volume recurring processing engineered for hotels, boutique villas, guest houses, and restaurants.',
  },
  {
    num: '07',
    title: 'Linen Management',
    image: '/images/gallery/quality-check.jpg',
    icon: ClipboardCheck,
    desc: 'Structured linen turnaround, quality inspection, batch sorting, and packaging for hospitality operations.',
  },
];

export default function Services() {
  const ref = useRef(null);

  return (
    <section id="services" className="py-20 md:py-28 bg-cream">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="text-olive font-semibold tracking-wider text-xs sm:text-sm uppercase mb-3 block">
            OUR SERVICES
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-dark mb-5 font-heading">
            Professional Laundry &amp; <span className="italic text-olive font-normal">Linen Solutions</span>
          </h2>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed">
            Dedicated garment and commercial textile care delivered from our Unawatuna facility, serving individual clients and Southern Sri Lanka&apos;s hospitality sector.
          </p>
        </motion.div>

        {/* Mobile Swipe Hint */}
        <div className="flex sm:hidden items-center justify-center gap-2 text-xs font-semibold text-olive/90 mb-4 animate-pulse">
          <span>&larr; Swipe cards left to right &rarr;</span>
        </div>

        <div
          ref={ref}
          className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6 no-scrollbar scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {services.map((service, idx) => (
            <motion.div
              key={service.num}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.15, margin: '-40px' }}
              transition={{ delay: 0.05 * (idx % 4), duration: 0.5 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col min-w-[280px] sm:min-w-0 snap-start flex-shrink-0 sm:flex-shrink border border-gray-100"
            >
              <div className="relative h-[190px] sm:h-[210px] overflow-hidden bg-gray-200">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 85vw, 33vw"
                />
                <div className="absolute top-3 right-3 bg-dark/80 backdrop-blur-md text-accent text-xs font-mono font-bold px-2.5 py-1 rounded-full border border-white/15">
                  {service.num}
                </div>
                <div className="absolute -bottom-4 left-6 w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white border-4 border-white z-10 shadow-md group-hover:bg-olive transition-colors">
                  <service.icon className="w-5 h-5 text-accent group-hover:text-white transition-colors" />
                </div>
              </div>
              <div className="p-6 pt-7 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-heading font-semibold text-xl text-dark mb-2 group-hover:text-olive transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-5">
                    {service.desc}
                  </p>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <a
                    href="#contact"
                    className="text-olive hover:text-accent font-semibold text-xs sm:text-sm inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>Inquire Now</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
