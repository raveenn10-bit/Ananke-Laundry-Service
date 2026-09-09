'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, MapPin, Quote, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface Review {
  id: number;
  name: string;
  badge: string;
  rating: number;
  date: string;
  text: string;
  avatarBg: string;
  avatarText: string;
}

const REVIEWS: Review[] = [
  {
    id: 1,
    name: 'Rukman Lakshika Tennakoon',
    badge: 'Local Guide · 21 reviews',
    rating: 5,
    date: '3 years ago',
    text: 'One of the best laundry services in the Galle area. Most of the 5-star hotels and resorts around Galle to Hikkaduwa are the main clients. Recently joined hands with Cleanamatic to give a world-class service to local and foreign customers.',
    avatarBg: 'bg-emerald-800 text-emerald-100',
    avatarText: 'RL',
  },
  {
    id: 2,
    name: 'Sonali Wijesinghe',
    badge: 'Local Guide · 20 reviews',
    rating: 5,
    date: '2 years ago',
    text: 'The only place in unawatuna I trust with my laundry',
    avatarBg: 'bg-amber-800 text-amber-100',
    avatarText: 'SW',
  },
  {
    id: 3,
    name: 'Iru Madu',
    badge: 'Local Guide · 102 reviews',
    rating: 5,
    date: '11 months ago',
    text: 'Good place. You can wash your clothes fastly . Cheap price',
    avatarBg: 'bg-teal-800 text-teal-100',
    avatarText: 'IM',
  },
  {
    id: 4,
    name: 'Shyam Kawshal',
    badge: 'Local Guide · 54 reviews',
    rating: 5,
    date: '4 years ago',
    text: 'Very good laundry on the main road of Unawatuna. Highly recommend it.',
    avatarBg: 'bg-green-800 text-green-100',
    avatarText: 'SK',
  },
  {
    id: 5,
    name: 'Mark Wijeratne',
    badge: 'Local Guide · 122 reviews',
    rating: 5,
    date: '4 years ago',
    text: 'I am very impressed by the out come of my laundry. I highly reccomend!',
    avatarBg: 'bg-lime-800 text-lime-100',
    avatarText: 'MW',
  },
  {
    id: 6,
    name: 'Святой Серафим',
    badge: 'Local Guide · 67 reviews',
    rating: 5,
    date: '2 years ago',
    text: 'Very smile people. And clean wear very good))',
    avatarBg: 'bg-stone-800 text-stone-100',
    avatarText: 'СС',
  },
  {
    id: 7,
    name: 'Alina',
    badge: '4 reviews',
    rating: 5,
    date: '2 years ago',
    text: 'Fast and good. Can recommend for sure',
    avatarBg: 'bg-emerald-700 text-emerald-100',
    avatarText: 'A',
  },
  {
    id: 8,
    name: 'Faris Fassey',
    badge: 'Local Guide · 373 reviews',
    rating: 5,
    date: '7 years ago',
    text: 'Pleasant welcome recommended..',
    avatarBg: 'bg-olive text-white',
    avatarText: 'FF',
  },
];

export default function Reviews() {
  const ref = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section id="reviews" className="py-20 md:py-28 bg-primary text-white relative overflow-hidden">
      {/* Ambient background blur circles */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-olive/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-olive/30 text-accent rounded-full px-3.5 py-1 text-xs font-semibold tracking-wider uppercase mb-3 border border-olive/40">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified Google Reviews
            </div>
            <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4">
              What Our Customers <span className="italic font-normal text-accent font-serif">Say</span>
            </h2>
            <p className="text-white/80 text-base md:text-lg">
              Authentic 5-star feedback from locals, tourists, hotels, and villa owners in Unawatuna & Galle.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/20">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="text-left">
                <div className="font-bold text-white text-lg leading-tight">5.0 / 5.0</div>
                <div className="text-xs text-white/70">Google Business Rating</div>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                aria-label="Previous review"
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-colors text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                aria-label="Next review"
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-colors text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Reviews Cards */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-none no-scrollbar -mx-4 px-4 md:mx-0 md:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {REVIEWS.map((rev, idx) => (
            <motion.div
              key={rev.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.08 * idx, duration: 0.5 }}
              className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-6 min-w-[290px] sm:min-w-[340px] md:min-w-[380px] max-w-[380px] snap-start flex flex-col justify-between hover:border-accent/40 hover:bg-white/[0.13] transition-all group"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-full ${rev.avatarBg} font-bold text-sm flex items-center justify-center shadow-inner border border-white/20`}
                    >
                      {rev.avatarText}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-base leading-tight group-hover:text-accent transition-colors">
                        {rev.name}
                      </h4>
                      <p className="text-xs text-white/60">{rev.badge}</p>
                    </div>
                  </div>
                  <Quote className="w-7 h-7 text-accent/30 flex-shrink-0" />
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-amber-400 gap-0.5">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs text-white/50">{rev.date}</span>
                </div>

                <p className="text-white/90 text-sm leading-relaxed font-light mb-4">
                  &ldquo;{rev.text}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
                <span className="inline-flex items-center gap-1 text-accent/90 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Google Verified Review
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://maps.app.goo.gl/HLJGzPCVZwySjSTK6?g_st=ic"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-dark px-8 py-3.5 rounded-full font-semibold transition-all shadow-lg hover:shadow-accent/20 hover:scale-105"
          >
            <MapPin className="w-5 h-5 text-dark" />
            Read All Reviews on Google Maps
          </a>
        </div>
      </div>
    </section>
  );
}

