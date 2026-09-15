'use client';

import { useState, useEffect } from 'react';
import { Phone, MapPin, Receipt, Sparkles, X, FileText, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrderModal } from '@/context/OrderModalContext';
import Link from 'next/link';

function WhatsAppIcon({ className = 'w-5 h-5' }: { className?: string }) {
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
  const [isOpen, setIsOpen] = useState(false);

  // Close when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Quick Action Definitions in visual upward order (Top to Bottom visually)
  const actionItems = [
    {
      id: 'order',
      label: 'Place an Order',
      icon: Sparkles,
      bgGradient: 'from-emerald-600 via-emerald-500 to-green-500',
      type: 'button' as const,
      onClick: () => openOrderModal(),
    },
    {
      id: 'call',
      label: 'Call 091 225 0777',
      icon: Phone,
      bgGradient: 'from-emerald-600 via-green-500 to-emerald-400',
      type: 'link' as const,
      href: `tel:${PHONE_NUMBER}`,
    },
    {
      id: 'whatsapp',
      label: 'Chat on WhatsApp',
      icon: WhatsAppIcon,
      bgGradient: 'from-[#128C7E] via-[#25D366] to-[#4ade80]',
      type: 'external' as const,
      href: WHATSAPP_URL,
    },
    {
      id: 'directions',
      label: 'Get Directions',
      icon: MapPin,
      bgGradient: 'from-red-600 via-rose-500 to-red-400',
      type: 'external' as const,
      href: MAPS_URL,
    },
    {
      id: 'bill',
      label: 'View My Bill',
      icon: Receipt,
      bgGradient: 'from-blue-600 via-indigo-500 to-sky-400',
      type: 'route' as const,
      href: '/my-bill',
    },
    {
      id: 'quote',
      label: 'Request a Quote',
      icon: FileText,
      bgGradient: 'from-amber-600 via-amber-500 to-yellow-400',
      type: 'route' as const,
      href: '/contact',
    },
  ];

  return (
    <>
      {/* Dimmed backdrop when menu is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/35 backdrop-blur-xs z-35"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Expanded Actions Menu (Originates from bottom-right and expands UPWARDS) */}
      <div className="fixed right-[clamp(14px,2vw,24px)] bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40 flex flex-col items-end gap-2.5 pointer-events-none">
        <AnimatePresence>
          {isOpen &&
            actionItems.map((item, idx) => {
              // Stagger delay: bottom item opens first
              const reverseIndex = actionItems.length - 1 - idx;
              const delay = reverseIndex * 0.04;

              const content = (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.65, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.65, y: 20 }}
                  transition={{ duration: 0.26, delay }}
                  className="flex items-center gap-3 pointer-events-auto group cursor-pointer"
                >
                  {/* Action Text Label to the LEFT of icon */}
                  <span className="bg-[#163824]/95 backdrop-blur-md text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl shadow-xl border border-white/15 whitespace-nowrap transition-all duration-200 group-hover:bg-[#163824] group-hover:-translate-x-1 group-hover:shadow-2xl">
                    {item.label}
                  </span>

                  {/* Action Circular Icon Button */}
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr ${item.bgGradient} text-white flex items-center justify-center shadow-lg border border-white/35 transition-transform duration-200 group-hover:scale-108 active:scale-95 shrink-0`}
                  >
                    <item.icon className="w-5 h-5 drop-shadow-xs" />
                  </div>
                </motion.div>
              );

              if (item.type === 'button') {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      item.onClick();
                    }}
                    className="text-right"
                    aria-label={item.label}
                  >
                    {content}
                  </button>
                );
              }

              if (item.type === 'route') {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    aria-label={item.label}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <a
                  key={item.id}
                  href={item.href}
                  target={item.type === 'external' ? '_blank' : undefined}
                  rel={item.type === 'external' ? 'noopener noreferrer' : undefined}
                  onClick={() => setIsOpen(false)}
                  aria-label={item.label}
                >
                  {content}
                </a>
              );
            })}
        </AnimatePresence>
      </div>

      {/* Main Global Floating Action Button at BOTTOM-RIGHT */}
      <div className="fixed right-[clamp(14px,2vw,24px)] bottom-[calc(18px+env(safe-area-inset-bottom))] z-40">
        <motion.button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.06 }}
          className={`relative flex items-center justify-center w-14 h-14 sm:w-[58px] sm:h-[58px] rounded-full shadow-[0_8px_28px_rgba(22,56,36,0.5)] border border-white/35 transition-all duration-300 cursor-pointer ${
            isOpen
              ? 'bg-[#163824] text-white rotate-90 shadow-2xl'
              : 'bg-gradient-to-tr from-[#163824] via-[#1b432c] to-[#25D366] text-white'
          }`}
          aria-label={isOpen ? 'Close Quick Actions' : 'Open Quick Actions'}
          aria-expanded={isOpen}
        >
          {/* Status pulse indicator when closed */}
          {!isOpen && (
            <>
              <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-35 animate-ping pointer-events-none" />
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-white rounded-full p-[2px] z-20 shadow-xs">
                <span className="block w-full h-full bg-[#25D366] rounded-full animate-pulse" />
              </span>
            </>
          )}

          {/* Icon: Vertical Arrow Up when closed, X when open */}
          {isOpen ? (
            <X size={24} className="text-white drop-shadow-xs" />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <ArrowUp size={22} className="text-[#C9E6B8] drop-shadow-xs animate-bounce stroke-[2.5]" />
            </div>
          )}
        </motion.button>
      </div>
    </>
  );
}
