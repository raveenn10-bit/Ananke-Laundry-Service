'use client';

import { Phone, MapPin, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FloatingActions() {
  return (
    <>
      {/* Desktop Floating Actions Bar */}
      <div className="hidden lg:flex fixed right-5 top-1/2 -translate-y-1/2 flex-col gap-3 z-40">
        <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} className="relative group">
          <a
            href="tel:+94912250777"
            className="w-12 h-12 bg-primary hover:bg-olive border border-white/20 rounded-full flex items-center justify-center shadow-xl transition-all cursor-pointer group"
            aria-label="Call 091 225 0777"
          >
            <Phone className="text-accent group-hover:text-white transition-colors" size={20} />
          </a>
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-dark/95 backdrop-blur-md text-white px-3.5 py-1.5 rounded-lg text-xs font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-lg border border-white/10">
            Call 091 225 0777
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} className="relative group">
          <a
            href="https://maps.app.goo.gl/HLJGzPCVZwySjSTK6?g_st=ic"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 bg-olive hover:bg-accent border border-white/20 rounded-full flex items-center justify-center shadow-xl transition-all cursor-pointer group"
            aria-label="Get Directions on Google Maps"
          >
            <MapPin className="text-white group-hover:text-dark transition-colors" size={20} />
          </a>
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-dark/95 backdrop-blur-md text-white px-3.5 py-1.5 rounded-lg text-xs font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-lg border border-white/10">
            Get Directions
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} className="relative group">
          <a
            href="/contact"
            className="w-12 h-12 bg-accent hover:bg-olive rounded-full flex items-center justify-center shadow-xl transition-all cursor-pointer group"
            aria-label="Request a Quote"
          >
            <FileText className="text-dark group-hover:text-white transition-colors" size={20} />
          </a>
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-dark/95 backdrop-blur-md text-white px-3.5 py-1.5 rounded-lg text-xs font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-lg border border-white/10">
            Request a Quote
          </div>
        </motion.div>
      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-primary/95 backdrop-blur-lg border-t border-white/15 px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-2xl">
        <div className="flex items-center gap-2.5 max-w-md mx-auto">
          <a
            href="tel:+94912250777"
            className="flex-1 bg-accent hover:bg-accent/90 text-dark font-bold text-xs sm:text-sm py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md min-h-[44px] transition-transform active:scale-95"
            aria-label="Call 091 225 0777"
          >
            <Phone size={16} className="shrink-0" />
            <span className="truncate">Call 091 225 0777</span>
          </a>
          <a
            href="https://maps.app.goo.gl/HLJGzPCVZwySjSTK6?g_st=ic"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 border border-white/20 min-h-[44px] transition-transform active:scale-95"
            aria-label="Get Directions to Unawatuna facility"
          >
            <MapPin size={16} className="text-accent shrink-0" />
            <span className="truncate">Get Directions</span>
          </a>
        </div>
      </div>
    </>
  );
}
