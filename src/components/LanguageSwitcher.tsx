'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { SUPPORTED_LANGUAGES, Language } from '@/lib/translations';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LanguageSwitcherProps {
  variant?: 'header' | 'mobile-drawer';
  className?: string;
}

export default function LanguageSwitcher({
  variant = 'header',
  className = '',
}: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLang = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (variant === 'mobile-drawer') {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs uppercase tracking-wider text-white/60 font-semibold flex items-center gap-1.5">
            <Globe size={13} className="text-accent" aria-hidden="true" />
            Language / භාෂාව
          </span>
          <span className="text-xs text-accent font-medium">{activeLang.nativeName}</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
          {SUPPORTED_LANGUAGES.map((item) => {
            const isSelected = item.code === language;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => setLanguage(item.code)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-accent text-dark font-bold shadow-md scale-102'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                title={item.label}
                aria-label={item.label}
                aria-pressed={isSelected}
              >
                <span className="text-base sm:text-lg leading-none mb-1" aria-hidden="true">{item.flag}</span>
                <span className="text-[11px] uppercase tracking-wide leading-none">
                  {item.code}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Desktop Header Dropdown
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change Language"
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold backdrop-blur-md transition-all duration-200 cursor-pointer active:scale-95"
      >
        <span className="text-sm leading-none" aria-hidden="true">{activeLang.flag}</span>
        <span className="uppercase text-[11px] tracking-wider">{activeLang.code}</span>
        <ChevronDown
          size={12}
          aria-hidden="true"
          className={`transition-transform duration-200 text-white/70 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            role="menu"
            aria-label="Language selection"
            className="absolute right-0 mt-2 w-48 bg-[#163824]/98 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl p-1.5 z-50 overflow-hidden"
          >
            <div className="px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-accent font-bold border-b border-white/10 mb-1 flex items-center gap-1.5">
              <Globe size={11} aria-hidden="true" />
              Select Language
            </div>
            <div className="flex flex-col gap-0.5">
              {SUPPORTED_LANGUAGES.map((item) => {
                const isSelected = item.code === language;
                return (
                  <button
                    key={item.code}
                    type="button"
                    role="menuitem"
                    aria-label={`Select ${item.label} (${item.nativeName})`}
                    onClick={() => {
                      setLanguage(item.code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-accent text-dark font-bold'
                        : 'text-white/90 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base" aria-hidden="true">{item.flag}</span>
                      <div className="text-left">
                        <div className="leading-tight">{item.nativeName}</div>
                        <div
                          className={`text-[10px] ${
                            isSelected ? 'text-dark/70' : 'text-white/60'
                          }`}
                        >
                          {item.label}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check size={14} className="stroke-[3]" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
