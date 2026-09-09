'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { FileText, Phone, MapPin, Building, ShieldCheck, Sparkles } from 'lucide-react';

export default function Hero() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
    },
  };

  return (
    <section id="home" className="relative min-h-[85vh] md:min-h-screen flex items-center pt-24 pb-16 overflow-hidden bg-primary">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero.jpg"
          alt="Ananke Laundry Unawatuna Facility and Linen Care"
          fill
          priority
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/95 via-dark/80 to-primary/60 hero-overlay"></div>
      </div>

      {/* Subtle Floating Ambient Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden hidden md:block">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-accent/10 animate-float"
            style={{
              width: `${(i + 1) * 8 + 12}px`,
              height: `${(i + 1) * 8 + 12}px`,
              left: `${(i * 22) + 8}%`,
              top: `${(i * 18) + 15}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${8 + i * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-3xl text-center md:text-left mx-auto md:mx-0"
        >
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 text-accent text-xs uppercase tracking-[0.25em] font-semibold px-4 py-1.5 rounded-full mb-6">
              <Sparkles size={13} className="text-accent" />
              Unawatuna &bull; Galle &bull; Southern Sri Lanka
            </span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 font-heading">
            Professional Laundry &amp; <span className="italic text-accent font-normal block sm:inline">Linen Care</span> in Unawatuna
          </motion.h1>

          <motion.p variants={itemVariants} className="text-white/85 text-base sm:text-lg md:text-xl mb-8 max-w-2xl mx-auto md:mx-0 leading-relaxed font-body">
            Professional laundry and linen-care solutions for individuals, travellers and hospitality businesses in Sri Lanka&apos;s Southern region.
          </motion.p>

          {/* Three CTAs: Request a Quote (Primary), Call 091 225 0777 (Secondary), Get Directions (Third) */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-3.5 mb-10">
            <a
              href="#contact"
              className="bg-accent hover:bg-olive text-dark hover:text-white font-bold px-7 py-4 rounded-full transition-all duration-300 flex items-center justify-center gap-2 text-base shadow-lg hover:shadow-accent/25 hover:scale-[1.02] active:scale-95"
            >
              <FileText className="w-5 h-5" />
              Request a Quote
            </a>
            <a
              href="tel:+94912250777"
              className="border-2 border-white/40 hover:border-accent text-white hover:text-accent rounded-full px-6 py-3.5 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base font-medium hover:bg-white/5 active:scale-95"
            >
              <Phone className="w-4 h-4 text-accent" />
              Call 091 225 0777
            </a>
            <a
              href="https://maps.app.goo.gl/HLJGzPCVZwySjSTK6?g_st=ic"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-accent rounded-full px-5 py-3.5 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base font-medium hover:bg-white/5"
            >
              <MapPin className="w-4 h-4 text-accent" />
              Get Directions
            </a>
          </motion.div>

          {/* Realistic Trust Badges */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 pt-2">
            {[
              { icon: Building, text: 'Hospitality & Commercial Linen' },
              { icon: ShieldCheck, text: 'Professional Quality Standards' },
              { icon: MapPin, text: 'Unawatuna Facility & Collection' },
            ].map((badge, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-2">
                <badge.icon className="w-4 h-4 text-accent shrink-0" />
                <span className="text-white text-xs sm:text-sm font-medium">{badge.text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
