'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { CalendarCheck, ArrowRight, Shield, Leaf, Clock } from 'lucide-react';

export default function Hero() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
    <section id="home" className="relative min-h-[85vh] md:min-h-screen flex items-center pt-20 overflow-hidden bg-primary">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero.jpg"
          alt="Ananke Laundry Hero"
          fill
          priority
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/90 via-dark/70 to-transparent hero-overlay"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden hidden md:block">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full bg-white/10 animate-float`}
            style={{
              width: Math.random() * 40 + 10 + 'px',
              height: Math.random() * 40 + 10 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 w-full">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-2xl text-center md:text-left mx-auto md:mx-0"
        >
          <motion.div variants={itemVariants}>
            <span className="text-accent tracking-[0.3em] text-sm font-medium uppercase mb-4 block">
              Freshness in Every Wash
            </span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Premium Care for <span className="font-heading italic text-accent font-normal block md:inline">Your Clothes</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-white/80 text-lg md:text-xl mb-8 max-w-xl mx-auto md:mx-0">
            Experience the finest laundry and dry cleaning services in Unawatuna. We combine modern technology with expert care to keep your garments looking fresh and new.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mb-12">
            <a href="#booking" className="w-full sm:w-auto bg-olive hover:bg-accent text-white hover:text-dark transition-colors rounded-full px-8 py-4 flex items-center justify-center gap-2 font-medium">
              <CalendarCheck className="w-5 h-5" />
              Book a Pickup
            </a>
            <a href="#services" className="w-full sm:w-auto border-2 border-white/30 text-white rounded-full px-8 py-4 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 font-medium">
              View Services
              <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6">
            {[
              { icon: Shield, text: 'Hygienic Process' },
              { icon: Leaf, text: 'Eco Friendly Products' },
              { icon: Clock, text: 'On-Time Service' },
            ].map((badge, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                <badge.icon className="w-4 h-4 text-accent" />
                <span className="text-white text-sm font-medium">{badge.text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
