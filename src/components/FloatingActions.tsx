'use client';

import { Phone, MapPin, FileText, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';

function WhatsAppIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.952 3.71 1.453 5.711 1.454h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

const WHATSAPP_URL =
  'https://wa.me/94742697909?text=Hello%20Ananke%20Laundry%2C%20I%20would%20like%20to%20inquire%20about%20your%20services.';

export default function FloatingActions() {
  return (
    <>
      {/* Dedicated Floating WhatsApp Button */}
      <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] lg:bottom-7 right-4 sm:right-6 lg:right-7 z-50 flex items-center group">
        {/* Tooltip on Desktop hover */}
        <div className="absolute right-full mr-3.5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center gap-2.5 bg-[#1a2b25]/95 backdrop-blur-md text-white py-2 px-3.5 rounded-xl text-xs shadow-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
          <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse shrink-0" />
          <div className="text-left">
            <p className="font-semibold text-white leading-tight">Chat on WhatsApp</p>
            <p className="text-[11px] text-[#25D366] font-mono leading-tight font-medium mt-0.5">
              +94 74 269 7909
            </p>
          </div>
        </div>

        {/* WhatsApp Round Floating Action Button */}
        <motion.a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Ananke Laundry on WhatsApp (+94 74 269 7909)"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] text-white shadow-[0_8px_25px_-4px_rgba(37,211,102,0.6)] hover:bg-[#20ba5a] hover:shadow-[0_12px_30px_-4px_rgba(37,211,102,0.7)] transition-all duration-300 cursor-pointer"
        >
          {/* Subtle Radar/Ping Glow */}
          <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-35 animate-ping pointer-events-none" />

          {/* Online green indicator badge */}
          <span className="absolute top-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full p-[2px] z-20 shadow-xs">
            <span className="block w-full h-full bg-[#10b981] rounded-full" />
          </span>

          {/* SVG WhatsApp Logo */}
          <WhatsAppIcon className="w-8 h-8 sm:w-9 sm:h-9 relative z-10 text-white fill-current drop-shadow-xs" />
        </motion.a>
      </div>

      {/* Desktop Floating Actions Bar (Right Middle Dock) */}
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
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 bg-[#25D366] hover:bg-[#20ba5a] border border-white/20 rounded-full flex items-center justify-center shadow-xl transition-all cursor-pointer group"
            aria-label="WhatsApp +94 74 269 7909"
          >
            <WhatsAppIcon className="w-5 h-5 text-white" />
          </a>
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-dark/95 backdrop-blur-md text-white px-3.5 py-1.5 rounded-lg text-xs font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-lg border border-white/10">
            WhatsApp 074 269 7909
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
            href="/my-bill"
            className="w-12 h-12 bg-white/10 hover:bg-olive border border-white/20 rounded-full flex items-center justify-center shadow-xl transition-all cursor-pointer group backdrop-blur-md"
            aria-label="View My Bill & Receipts"
          >
            <Receipt className="text-accent group-hover:text-white transition-colors" size={20} />
          </a>
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-dark/95 backdrop-blur-md text-white px-3.5 py-1.5 rounded-lg text-xs font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-lg border border-white/10">
            View My Bill
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-primary/95 backdrop-blur-lg border-t border-white/15 px-3 py-2 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-2xl">
        <div className="flex items-center gap-2 max-w-md mx-auto">
          <a
            href="tel:+94912250777"
            className="flex-1 bg-accent hover:bg-accent/90 text-dark font-bold text-xs py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 shadow-md min-h-[42px] transition-transform active:scale-95"
            aria-label="Call 091 225 0777"
          >
            <Phone size={15} className="shrink-0" />
            <span className="truncate">Call</span>
          </a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 shadow-md min-h-[42px] transition-transform active:scale-95"
            aria-label="WhatsApp +94 74 269 7909"
          >
            <WhatsAppIcon className="w-4 h-4 shrink-0 text-white fill-current" />
            <span className="truncate">WhatsApp</span>
          </a>
          <a
            href="https://maps.app.goo.gl/HLJGzPCVZwySjSTK6?g_st=ic"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 border border-white/20 min-h-[42px] transition-transform active:scale-95"
            aria-label="Get Directions to Unawatuna facility"
          >
            <MapPin size={15} className="text-accent shrink-0" />
            <span className="truncate">Directions</span>
          </a>
        </div>
      </div>
    </>
  );
}
