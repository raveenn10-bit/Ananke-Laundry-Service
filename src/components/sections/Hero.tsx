'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { FileText, Phone, MapPin, Building, ShieldCheck, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const HERO_SLIDES = [
  {
    src: '/images/hero.jpg',
    alt: 'Ananke Laundry Unawatuna Facility and Linen Care',
    label: 'Professional Care',
  },
  {
    src: '/images/gallery/facility-wide.jpg',
    alt: 'Ananke Laundry Facility Wide View — Unawatuna, Galle',
    label: 'Modern Facility',
  },
  {
    src: '/images/gallery/team-ironing-machine.jpg',
    alt: 'Ananke Laundry Team Operating Commercial Ironing Machine',
    label: 'Commercial Equipment',
  },
  {
    src: '/images/gallery/team-loading.jpg',
    alt: 'Ananke Laundry Team Loading Commercial Washing Machine',
    label: 'Expert Team',
  },
];

const SLIDE_INTERVAL = 5000; // 5 seconds per slide

export default function Hero() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (index: number, dir: number) => {
    setDirection(dir);
    setCurrent((index + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const next = () => goTo(current + 1, 1);
  const prev = () => goTo(current - 1, -1);

  const startInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_INTERVAL);
  };

  useEffect(() => {
    startInterval();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
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

      {/* === Background Slideshow === */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence custom={direction} mode="sync">
          <motion.div
            key={current}
            custom={direction}
            initial={{
              x: direction > 0 ? '8%' : '-8%',
              opacity: 0,
              scale: 1.04,
            }}
            animate={{
              x: 0,
              opacity: 1,
              scale: 1,
              transition: { duration: 1.1, ease: [0.43, 0.13, 0.23, 0.96] },
            }}
            exit={{
              x: direction > 0 ? '-8%' : '8%',
              opacity: 0,
              scale: 0.97,
              transition: { duration: 0.7, ease: [0.43, 0.13, 0.23, 0.96] },
            }}
            className="absolute inset-0"
          >
            <Image
              src={HERO_SLIDES[current].src}
              alt={HERO_SLIDES[current].alt}
              fill
              priority={current === 0}
              className="object-cover"
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark/95 via-dark/80 to-primary/60 z-10" />
        {/* Bottom vignette for text legibility on mobile */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark/80 to-transparent z-10" />

        {/* Current slide label badge */}
        <motion.div
          key={`label-${current}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.5 }}
          className="absolute top-6 right-6 z-20 hidden sm:flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/15 text-white/90 text-[10px] uppercase tracking-[0.2em] font-semibold px-3.5 py-1.5 rounded-full"
        >
          <Sparkles size={10} className="text-accent" />
          {HERO_SLIDES[current].label}
        </motion.div>
      </div>

      {/* === Ambient Floating Particles === */}
      <div className="absolute inset-0 z-5 pointer-events-none overflow-hidden hidden md:block">
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

      {/* === Main Content === */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
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

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-3.5 mb-10">
            <a
              href="/contact"
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

      {/* === Slide Controls (Prev / Next arrows) === */}
      <div className="absolute bottom-8 right-6 sm:bottom-10 sm:right-8 z-20 flex items-center gap-3">
        <button
          onClick={() => { prev(); startInterval(); }}
          aria-label="Previous slide"
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-accent/80 border border-white/20 text-white hover:text-dark flex items-center justify-center transition-all active:scale-90 backdrop-blur-md"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Dot indicators */}
        <div className="flex items-center gap-2">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => { goTo(idx, idx > current ? 1 : -1); startInterval(); }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`rounded-full transition-all duration-400 ${
                idx === current
                  ? 'bg-accent w-6 h-2'
                  : 'bg-white/40 hover:bg-white/70 w-2 h-2'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => { next(); startInterval(); }}
          aria-label="Next slide"
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-accent/80 border border-white/20 text-white hover:text-dark flex items-center justify-center transition-all active:scale-90 backdrop-blur-md"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* === Progress Bar === */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 z-20">
        <motion.div
          key={current}
          className="h-full bg-accent"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: SLIDE_INTERVAL / 1000, ease: 'linear' }}
        />
      </div>
    </section>
  );
}
