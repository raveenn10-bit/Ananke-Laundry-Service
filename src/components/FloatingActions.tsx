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
      {/* Dedicated Floating WhatsApp Button (Bottom-Right) */}
      <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] lg:bottom-7 right-4 sm:right-6 lg:right-7 z-50 flex items-center group">
        {/* Tooltip on Desktop hover */}
        <div className="absolute right-full mr-3.5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center gap-2.5 bg-[#1a2b25]/95 backdrop-blur-md text-white py-2 px-3.5 rounded-xl text-xs shadow-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
          <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse shrink-0" />
          <div className="text-left">
            <p className="font-semibold text-white leading-tight">Chat on WhatsApp</p>
            <p className="text-[11px] text-[#25D366] font-mono leading-tight font-medium mt-0.5">
              +94 74 269 7909 · Online Now
            </p>
          </div>
        </div>

        {/* WhatsApp Round Floating Action Button */}
        <motion.a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Ananke Laundry on WhatsApp (+94 74 269 7909)"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#128C7E] via-[#25D366] to-[#4ade80] text-white shadow-[0_8px_25px_rgba(37,211,102,0.55)] hover:shadow-[0_12px_32px_rgba(37,211,102,0.75)] transition-all duration-300 cursor-pointer border border-white/30"
        >
          {/* Subtle Radar/Ping Glow */}
          <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-35 animate-ping pointer-events-none" />

          {/* Online green indicator badge */}
          <span className="absolute top-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full p-[2px] z-20 shadow-xs">
            <span className="block w-full h-full bg-[#10b981] rounded-full animate-pulse" />
          </span>

          {/* SVG WhatsApp Logo */}
          <WhatsAppIcon className="w-8 h-8 sm:w-9 sm:h-9 relative z-10 text-white fill-current drop-shadow-md" />
        </motion.a>
      </div>

      {/* Desktop Floating Actions Bar (Right Middle Dock) - Real Colors & Live Effect */}
      <div className="hidden lg:flex fixed right-5 top-1/2 -translate-y-1/2 flex-col gap-3.5 z-40">
        {/* 1. Phone Call (Real Calling Green Gradient) */}
        <motion.div whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.95 }} className="relative group">
          <a
            href="tel:+94912250777"
            className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 via-green-500 to-emerald-400 flex items-center justify-center shadow-[0_4px_18px_rgba(16,185,129,0.5)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.7)] transition-all duration-300 cursor-pointer border border-white/30 group"
            aria-label="Call 091 225 0777"
          >
            <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-pulse pointer-events-none" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full p-[1.5px] z-10">
              <span className="block w-full h-full bg-emerald-400 rounded-full animate-pulse" />
            </span>
            <Phone className="text-white drop-shadow-xs relative z-10 transition-transform group-hover:rotate-12" size={20} />
          </a>
          <div className="absolute right-full mr-3.5 top-1/2 -translate-y-1/2 bg-[#1a2b25]/95 backdrop-blur-md text-white py-2 px-3.5 rounded-xl text-xs shadow-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="font-semibold text-white leading-tight">Call 091 225 0777</p>
            </div>
            <p className="text-[10px] text-emerald-300 pl-4 mt-0.5 font-medium">Open Now · 9:00 AM – 6:00 PM</p>
          </div>
        </motion.div>

        {/* 2. WhatsApp (Real WhatsApp Green Gradient) */}
        <motion.div whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.95 }} className="relative group">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-[#128C7E] via-[#25D366] to-[#4ade80] flex items-center justify-center shadow-[0_4px_18px_rgba(37,211,102,0.5)] hover:shadow-[0_6px_25px_rgba(37,211,102,0.7)] transition-all duration-300 cursor-pointer border border-white/30 group"
            aria-label="WhatsApp +94 74 269 7909"
          >
            <span className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full p-[1.5px] z-10">
              <span className="block w-full h-full bg-emerald-300 rounded-full animate-pulse" />
            </span>
            <WhatsAppIcon className="w-5 h-5 text-white fill-current drop-shadow-xs relative z-10" />
          </a>
          <div className="absolute right-full mr-3.5 top-1/2 -translate-y-1/2 bg-[#1a2b25]/95 backdrop-blur-md text-white py-2 px-3.5 rounded-xl text-xs shadow-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
              <p className="font-semibold text-white leading-tight">WhatsApp 074 269 7909</p>
            </div>
            <p className="text-[10px] text-[#25D366] pl-4 mt-0.5 font-medium">Chat Online · Quick Turnaround</p>
          </div>
        </motion.div>

        {/* 3. Google Maps (Real Google Maps Red Gradient) */}
        <motion.div whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.95 }} className="relative group">
          <a
            href="https://maps.app.goo.gl/HLJGzPCVZwySjSTK6?g_st=ic"
            target="_blank"
            rel="noopener noreferrer"
            className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 via-rose-500 to-red-400 flex items-center justify-center shadow-[0_4px_18px_rgba(239,68,68,0.5)] hover:shadow-[0_6px_25px_rgba(239,68,68,0.7)] transition-all duration-300 cursor-pointer border border-white/30 group"
            aria-label="Get Directions on Google Maps"
          >
            <MapPin className="text-white drop-shadow-xs relative z-10 transition-transform group-hover:-translate-y-0.5" size={20} />
          </a>
          <div className="absolute right-full mr-3.5 top-1/2 -translate-y-1/2 bg-[#1a2b25]/95 backdrop-blur-md text-white py-2 px-3.5 rounded-xl text-xs shadow-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <p className="font-semibold text-white leading-tight">Google Maps Directions</p>
            </div>
            <p className="text-[10px] text-rose-300 pl-4 mt-0.5">Matara Road, Unawatuna, Galle</p>
          </div>
        </motion.div>

        {/* 4. Live Bill Portal (Real Financial Sapphire Blue Gradient) */}
        <motion.div whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.95 }} className="relative group">
          <a
            href="/my-bill"
            className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-[0_4px_18px_rgba(59,130,246,0.5)] hover:shadow-[0_6px_25px_rgba(59,130,246,0.7)] transition-all duration-300 cursor-pointer border border-white/30 group"
            aria-label="View My Bill & Receipts"
          >
            <Receipt className="text-white drop-shadow-xs relative z-10 transition-transform group-hover:scale-105" size={20} />
          </a>
          <div className="absolute right-full mr-3.5 top-1/2 -translate-y-1/2 bg-[#1a2b25]/95 backdrop-blur-md text-white py-2 px-3.5 rounded-xl text-xs shadow-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <p className="font-semibold text-white leading-tight">View My Bill &amp; Receipts</p>
            </div>
            <p className="text-[10px] text-sky-300 pl-4 mt-0.5">Live Zoho Portal · Instant Search</p>
          </div>
        </motion.div>

        {/* 5. Request a Quote (Real Amber / Gold Gradient) */}
        <motion.div whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.95 }} className="relative group">
          <a
            href="/contact"
            className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-[0_4px_18px_rgba(245,158,11,0.5)] hover:shadow-[0_6px_25px_rgba(245,158,11,0.7)] transition-all duration-300 cursor-pointer border border-white/30 group"
            aria-label="Request a Quote"
          >
            <FileText className="text-white drop-shadow-xs relative z-10 transition-transform group-hover:scale-105" size={20} />
          </a>
          <div className="absolute right-full mr-3.5 top-1/2 -translate-y-1/2 bg-[#1a2b25]/95 backdrop-blur-md text-white py-2 px-3.5 rounded-xl text-xs shadow-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <p className="font-semibold text-white leading-tight">Request a Quote</p>
            </div>
            <p className="text-[10px] text-amber-300 pl-4 mt-0.5">Commercial &amp; Bulk Pricing</p>
          </div>
        </motion.div>
      </div>

      {/* Mobile Sticky Bottom Action Bar - Real Colors */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-primary/95 backdrop-blur-lg border-t border-white/15 px-3 py-2 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-2xl">
        <div className="flex items-center gap-2 max-w-md mx-auto">
          <a
            href="tel:+94912250777"
            className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-xs py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 shadow-[0_3px_10px_rgba(16,185,129,0.3)] min-h-[42px] transition-transform active:scale-95"
            aria-label="Call 091 225 0777"
          >
            <Phone size={15} className="shrink-0" />
            <span className="truncate">Call</span>
          </a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gradient-to-r from-[#128C7E] to-[#25D366] text-white font-bold text-xs py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 shadow-[0_3px_10px_rgba(37,211,102,0.3)] min-h-[42px] transition-transform active:scale-95"
            aria-label="WhatsApp +94 74 269 7909"
          >
            <WhatsAppIcon className="w-4 h-4 shrink-0 text-white fill-current" />
            <span className="truncate">WhatsApp</span>
          </a>
          <a
            href="https://maps.app.goo.gl/HLJGzPCVZwySjSTK6?g_st=ic"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold text-xs py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 shadow-[0_3px_10px_rgba(239,68,68,0.3)] min-h-[42px] transition-transform active:scale-95"
            aria-label="Get Directions to Unawatuna facility"
          >
            <MapPin size={15} className="shrink-0" />
            <span className="truncate">Directions</span>
          </a>
        </div>
      </div>
    </>
  );
}
