'use client';

import { useState, useEffect } from 'react';
import { Phone, MapPin, Receipt, Sparkles, X, Menu, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrderModal } from '@/context/OrderModalContext';
import Link from 'next/link';

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
const PHONE_NUMBER = '+94912250777';
const MAPS_URL = 'https://maps.app.goo.gl/HLJGzPCVZwySjSTK6?g_st=ic';

export default function FloatingActions() {
  const { openOrderModal } = useOrderModal();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile expandable menu when pressing Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* =========================================================================
          MOBILE ONLY (< 768px): Single Compact Expandable Floating Action Button
          ========================================================================= */}
      <div className="md:hidden">
        {/* Backdrop for tapping outside to close */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-35"
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        {/* Expandable Quick Actions Menu (Stacks upwards) */}
        <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 z-40 flex flex-col items-end gap-3 pointer-events-none">
          <AnimatePresence>
            {isMobileOpen && (
              <>
                {/* 1. Place an Order */}
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.85 }}
                  transition={{ duration: 0.22, delay: 0.04 }}
                  className="flex items-center gap-2.5 pointer-events-auto"
                >
                  <span className="bg-[#163824] text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg border border-white/20 whitespace-nowrap">
                    Place an Order
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileOpen(false);
                      openOrderModal();
                    }}
                    className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-green-500 text-white flex items-center justify-center shadow-lg border border-white/40 active:scale-95 transition-transform"
                    aria-label="Place an Order"
                  >
                    <Sparkles size={19} className="text-white" />
                  </button>
                </motion.div>

                {/* 2. Call */}
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.85 }}
                  transition={{ duration: 0.22, delay: 0.08 }}
                  className="flex items-center gap-2.5 pointer-events-auto"
                >
                  <span className="bg-[#163824] text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg border border-white/20 whitespace-nowrap">
                    Call 091 225 0777
                  </span>
                  <a
                    href={`tel:${PHONE_NUMBER}`}
                    onClick={() => setIsMobileOpen(false)}
                    className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-600 via-green-500 to-emerald-400 text-white flex items-center justify-center shadow-lg border border-white/40 active:scale-95 transition-transform"
                    aria-label="Call Ananke Laundry"
                  >
                    <Phone size={19} className="text-white" />
                  </a>
                </motion.div>

                {/* 3. WhatsApp */}
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.85 }}
                  transition={{ duration: 0.22, delay: 0.12 }}
                  className="flex items-center gap-2.5 pointer-events-auto"
                >
                  <span className="bg-[#163824] text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg border border-white/20 whitespace-nowrap">
                    Chat on WhatsApp
                  </span>
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMobileOpen(false)}
                    className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#128C7E] via-[#25D366] to-[#4ade80] text-white flex items-center justify-center shadow-lg border border-white/40 active:scale-95 transition-transform"
                    aria-label="Chat with Ananke Laundry on WhatsApp"
                  >
                    <WhatsAppIcon className="w-5 h-5 text-white fill-current" />
                  </a>
                </motion.div>

                {/* 4. Directions */}
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.85 }}
                  transition={{ duration: 0.22, delay: 0.16 }}
                  className="flex items-center gap-2.5 pointer-events-auto"
                >
                  <span className="bg-[#163824] text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg border border-white/20 whitespace-nowrap">
                    Get Directions
                  </span>
                  <a
                    href={MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMobileOpen(false)}
                    className="w-11 h-11 rounded-full bg-gradient-to-tr from-red-600 via-rose-500 to-red-400 text-white flex items-center justify-center shadow-lg border border-white/40 active:scale-95 transition-transform"
                    aria-label="Get Directions on Google Maps"
                  >
                    <MapPin size={19} className="text-white" />
                  </a>
                </motion.div>

                {/* 5. View My Bill */}
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.85 }}
                  transition={{ duration: 0.22, delay: 0.2 }}
                  className="flex items-center gap-2.5 pointer-events-auto"
                >
                  <span className="bg-[#163824] text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg border border-white/20 whitespace-nowrap">
                    View My Bill
                  </span>
                  <Link
                    href="/my-bill"
                    onClick={() => setIsMobileOpen(false)}
                    className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-sky-400 text-white flex items-center justify-center shadow-lg border border-white/40 active:scale-95 transition-transform"
                    aria-label="View My Bill & Receipts"
                  >
                    <Receipt size={19} className="text-white" />
                  </Link>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Single Main Mobile Floating Action Button (FAB) */}
        <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40">
          <motion.button
            type="button"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            whileTap={{ scale: 0.92 }}
            className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-[0_8px_25px_rgba(22,56,36,0.45)] border border-white/30 transition-all duration-300 cursor-pointer ${
              isMobileOpen
                ? 'bg-[#163824] text-white shadow-xl rotate-90'
                : 'bg-gradient-to-tr from-[#163824] via-[#1b432c] to-[#25D366] text-white'
            }`}
            aria-label={isMobileOpen ? 'Close Quick Actions' : 'Open Quick Actions'}
            aria-expanded={isMobileOpen}
          >
            {/* Status pulse when closed */}
            {!isMobileOpen && (
              <>
                <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 animate-ping pointer-events-none" />
                <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-white rounded-full p-[2px] z-20 shadow-xs">
                  <span className="block w-full h-full bg-[#25D366] rounded-full animate-pulse" />
                </span>
              </>
            )}

            {isMobileOpen ? (
              <X size={24} className="text-white" />
            ) : (
              <Sparkles size={24} className="text-[#C9E6B8] animate-pulse" />
            )}
          </motion.button>
        </div>
      </div>

      {/* =========================================================================
          DESKTOP ONLY (>= 768px): Vertical Dock on Right Side (Single WhatsApp)
          ========================================================================= */}
      <div className="hidden md:flex fixed right-5 top-1/2 -translate-y-1/2 flex-col gap-3.5 z-40">
        {/* 1. Place Order */}
        <motion.div whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.95 }} className="relative group">
          <button
            type="button"
            onClick={openOrderModal}
            className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-green-500 flex items-center justify-center shadow-[0_4px_18px_rgba(16,185,129,0.55)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.75)] transition-all duration-300 cursor-pointer border border-white/40 group"
            aria-label="Place an Order"
          >
            <span className="absolute -inset-1 rounded-full bg-emerald-400/40 animate-pulse pointer-events-none" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full p-[1.5px] z-10">
              <span className="block w-full h-full bg-accent rounded-full animate-pulse" />
            </span>
            <Sparkles className="text-white drop-shadow-xs relative z-10 transition-transform group-hover:rotate-12" size={20} />
          </button>
          <div className="absolute right-full mr-3.5 top-1/2 -translate-y-1/2 bg-[#163824]/95 backdrop-blur-md text-white py-2 px-3.5 rounded-xl text-xs shadow-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <p className="font-semibold text-white leading-tight">Place an Order</p>
            </div>
            <p className="text-[10px] text-accent pl-4 mt-0.5 font-medium">Instant Laundry Order</p>
          </div>
        </motion.div>

        {/* 2. Phone Call */}
        <motion.div whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.95 }} className="relative group">
          <a
            href={`tel:${PHONE_NUMBER}`}
            className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 via-green-500 to-emerald-400 flex items-center justify-center shadow-[0_4px_18px_rgba(16,185,129,0.5)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.7)] transition-all duration-300 cursor-pointer border border-white/30 group"
            aria-label="Call 091 225 0777"
          >
            <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-pulse pointer-events-none" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full p-[1.5px] z-10">
              <span className="block w-full h-full bg-emerald-400 rounded-full animate-pulse" />
            </span>
            <Phone className="text-white drop-shadow-xs relative z-10 transition-transform group-hover:rotate-12" size={20} />
          </a>
          <div className="absolute right-full mr-3.5 top-1/2 -translate-y-1/2 bg-[#163824]/95 backdrop-blur-md text-white py-2 px-3.5 rounded-xl text-xs shadow-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="font-semibold text-white leading-tight">Call 091 225 0777</p>
            </div>
            <p className="text-[10px] text-emerald-300 pl-4 mt-0.5 font-medium">Open 9:00 AM – 6:00 PM</p>
          </div>
        </motion.div>

        {/* 3. WhatsApp (Single Clean Instance) */}
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
          <div className="absolute right-full mr-3.5 top-1/2 -translate-y-1/2 bg-[#163824]/95 backdrop-blur-md text-white py-2 px-3.5 rounded-xl text-xs shadow-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
              <p className="font-semibold text-white leading-tight">WhatsApp 074 269 7909</p>
            </div>
            <p className="text-[10px] text-[#25D366] pl-4 mt-0.5 font-medium">Chat Online · Quick Turnaround</p>
          </div>
        </motion.div>

        {/* 4. Google Maps Directions */}
        <motion.div whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.95 }} className="relative group">
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 via-rose-500 to-red-400 flex items-center justify-center shadow-[0_4px_18px_rgba(239,68,68,0.5)] hover:shadow-[0_6px_25px_rgba(239,68,68,0.7)] transition-all duration-300 cursor-pointer border border-white/30 group"
            aria-label="Get Directions on Google Maps"
          >
            <MapPin className="text-white drop-shadow-xs relative z-10 transition-transform group-hover:-translate-y-0.5" size={20} />
          </a>
          <div className="absolute right-full mr-3.5 top-1/2 -translate-y-1/2 bg-[#163824]/95 backdrop-blur-md text-white py-2 px-3.5 rounded-xl text-xs shadow-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <p className="font-semibold text-white leading-tight">Google Maps Directions</p>
            </div>
            <p className="text-[10px] text-rose-300 pl-4 mt-0.5">Matara Road, Unawatuna, Galle</p>
          </div>
        </motion.div>

        {/* 5. Live Bill Portal */}
        <motion.div whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.95 }} className="relative group">
          <Link
            href="/my-bill"
            className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-[0_4px_18px_rgba(59,130,246,0.5)] hover:shadow-[0_6px_25px_rgba(59,130,246,0.7)] transition-all duration-300 cursor-pointer border border-white/30 group"
            aria-label="View My Bill & Receipts"
          >
            <Receipt className="text-white drop-shadow-xs relative z-10 transition-transform group-hover:scale-105" size={20} />
          </Link>
          <div className="absolute right-full mr-3.5 top-1/2 -translate-y-1/2 bg-[#163824]/95 backdrop-blur-md text-white py-2 px-3.5 rounded-xl text-xs shadow-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <p className="font-semibold text-white leading-tight">View My Bill &amp; Receipts</p>
            </div>
            <p className="text-[10px] text-sky-300 pl-4 mt-0.5">Zoho Portal · Instant Lookup</p>
          </div>
        </motion.div>

        {/* 6. Request a Quote */}
        <motion.div whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.95 }} className="relative group">
          <a
            href="#contact"
            className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-[0_4px_18px_rgba(245,158,11,0.5)] hover:shadow-[0_6px_25px_rgba(245,158,11,0.7)] transition-all duration-300 cursor-pointer border border-white/30 group"
            aria-label="Request a Quote"
          >
            <FileText className="text-white drop-shadow-xs relative z-10 transition-transform group-hover:scale-105" size={20} />
          </a>
          <div className="absolute right-full mr-3.5 top-1/2 -translate-y-1/2 bg-[#163824]/95 backdrop-blur-md text-white py-2 px-3.5 rounded-xl text-xs shadow-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <p className="font-semibold text-white leading-tight">Request a Quote</p>
            </div>
            <p className="text-[10px] text-amber-300 pl-4 mt-0.5">Commercial &amp; Bulk Pricing</p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
