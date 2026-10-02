'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Phone,
  MapPin,
  Receipt,
  Sparkles,
  Download,
  Home,
  WashingMachine,
  Building,
  DollarSign,
  Image as ImageIcon,
  Info,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrderModal } from '@/context/OrderModalContext';
import { useLanguage } from '@/context/LanguageContext';
import { usePwa } from '@/context/PwaContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { openOrderModal } = useOrderModal();
  const { t } = useLanguage();
  const { isInstallable, isInstalled, installApp } = usePwa();

  const navLinks = [
    { name: t('nav.home', 'Home'), href: '/' },
    { name: t('nav.about', 'About'), href: '/about' },
    { name: t('nav.services', 'Services'), href: '/services' },
    { name: t('nav.commercial', 'Commercial'), href: '/commercial' },
    { name: t('nav.pricing', 'Pricing'), href: '/pricing' },
    { name: t('nav.facility', 'Facility'), href: '/gallery' },
    { name: t('nav.contact', 'Contact'), href: '/contact' },
    { name: t('nav.myBill', 'View My Bill'), href: '/my-bill' },
  ];

  const appNavItems = [
    {
      name: t('nav.home', 'Home'),
      subtitle: 'Premium Garment Care & Facilities',
      href: '/',
      icon: Home,
    },
    {
      name: t('nav.services', 'Services'),
      subtitle: 'Wash, Dry, Fold, Press & Stain Removal',
      href: '/services',
      icon: WashingMachine,
    },
    {
      name: t('nav.commercial', 'Commercial'),
      subtitle: 'Bespoke Linen Care for Hospitality',
      href: '/commercial',
      icon: Building,
    },
    {
      name: t('nav.pricing', 'Pricing'),
      subtitle: 'Transparent Per-Kg & Item Rates',
      href: '/pricing',
      icon: DollarSign,
    },
    {
      name: t('nav.facility', 'Facility'),
      subtitle: 'State-of-the-Art Cleanline Tech',
      href: '/gallery',
      icon: ImageIcon,
    },
    {
      name: t('nav.about', 'About Us'),
      subtitle: 'Our Story, Values & Hygiene Standards',
      href: '/about',
      icon: Info,
    },
    {
      name: t('nav.contact', 'Contact'),
      subtitle: 'Location Map, Phone & Inquiry Form',
      href: '/contact',
      icon: Phone,
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Body scroll lock & escape listener for mobile drawer
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);
  const isSolidBg = isScrolled || (pathname && pathname !== '/');

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isSolidBg ? 'bg-primary/95 backdrop-blur-xl shadow-lg py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex-shrink-0 relative z-50" onClick={closeMenu}>
            <div className="relative h-[44px] w-[140px] md:h-[56px] md:w-[180px]">
              <Image
                src="/logo.png"
                alt="Ananke Laundry Logo"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              const isBill = link.href === '/my-bill';
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-medium text-sm transition-colors relative group font-body flex items-center gap-1.5 ${
                    isActive ? 'text-accent font-semibold' : 'text-white/90 hover:text-accent'
                  } ${isBill ? 'text-accent/95 hover:text-white' : ''}`}
                >
                  {isBill && <Receipt size={13} className="text-accent" />}
                  <span>{link.name}</span>
                  <span
                    className={`absolute -bottom-1 left-0 w-full h-0.5 bg-accent transition-transform origin-left ${
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  ></span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-2.5">
            <LanguageSwitcher variant="header" />
            <a
              href="tel:+94912250777"
              className="flex items-center gap-1.5 text-white/90 hover:text-accent text-sm font-medium px-2 py-2 transition-colors"
            >
              <Phone size={14} className="text-accent" />
              <span>091 225 0777</span>
            </a>
            <button
              type="button"
              onClick={openOrderModal}
              className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold px-4 py-2.5 rounded-full transition-all duration-300 text-sm shadow-[0_4px_15px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.5)] flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Sparkles size={14} className="text-accent" />
              <span>{t('nav.placeOrder', 'Place an Order')}</span>
            </button>
            <Link
              href="/contact"
              className="bg-accent hover:bg-olive text-dark hover:text-white font-semibold px-4 py-2.5 rounded-full transition-all duration-300 text-sm shadow-md hover:shadow-accent/20"
            >
              {t('nav.requestQuote', 'Request a Quote')}
            </Link>
          </div>

          {/* Mobile Right Controls: Language Switcher + Modern Animated Hamburger */}
          <div className="lg:hidden flex items-center gap-2">
            <LanguageSwitcher variant="header" />
            <button
              className="relative z-50 w-11 h-11 flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-90 transition-all duration-300 border border-white/20 backdrop-blur-md shadow-sm cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav"
            >
              <span
                className={`w-5 h-0.5 bg-accent rounded-full transition-all duration-300 transform origin-center ${
                  isMenuOpen ? 'rotate-45 translate-y-2' : ''
                }`}
              />
              <span
                className={`w-3.5 h-0.5 bg-white rounded-full transition-all duration-300 self-end mr-3 ${
                  isMenuOpen ? 'opacity-0 translate-x-2' : ''
                }`}
              />
              <span
                className={`w-5 h-0.5 bg-accent rounded-full transition-all duration-300 transform origin-center ${
                  isMenuOpen ? '-rotate-45 -translate-y-2' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* High-End Mobile App Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed inset-0 bg-[#0c2014] text-white z-40 flex flex-col justify-between lg:hidden overflow-hidden min-h-[100dvh] max-h-[100dvh]"
          >
            {/* Drawer App Bar */}
            <div className="pt-20 px-5 pb-3 border-b border-white/10 flex items-center justify-between shrink-0 bg-gradient-to-b from-[#07150d] to-transparent">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
                  <Sparkles size={16} className="text-accent" />
                </div>
                <div>
                  <div className="text-xs font-heading tracking-widest uppercase text-accent font-semibold">
                    ANANKE WASHING PLANT
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-white/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Unawatuna • Open 8AM – 8PM</span>
                  </div>
                </div>
              </div>

              {/* Close Icon button */}
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close menu"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable App Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Language Switcher Component */}
              <div className="w-full">
                <LanguageSwitcher variant="mobile-drawer" />
              </div>

              {/* VIP Hero Card: My Bill & Live Tracking */}
              <Link
                href="/my-bill"
                onClick={closeMenu}
                className="group block relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-emerald-600/30 via-emerald-800/40 to-primary border border-emerald-400/30 shadow-lg hover:border-emerald-400/60 active:scale-[0.98] transition-all"
              >
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-accent/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-accent text-dark flex items-center justify-center shadow-md">
                      <Receipt size={22} className="text-dark font-bold" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white tracking-wide">
                          {t('nav.myBill', 'View My Bill & Track Order')}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                          LIVE
                        </span>
                      </div>
                      <p className="text-xs text-white/70 mt-0.5">
                        Real-time status, bills, collection times
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-accent group-hover:translate-x-1 transition-transform shrink-0" />
                </div>
              </Link>

              {/* App Menu Navigation Tiles */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-white/40 px-2 pb-1">
                  Main Navigation
                </div>
                {appNavItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/' && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      className={`group flex items-center justify-between p-3 rounded-2xl transition-all active:scale-[0.99] border ${
                        isActive
                          ? 'bg-white/15 border-accent/50 text-white shadow-sm'
                          : 'bg-white/5 hover:bg-white/10 border-white/5 text-white/90'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isActive
                              ? 'bg-accent text-dark font-bold'
                              : 'bg-white/10 text-accent group-hover:bg-accent group-hover:text-dark'
                          }`}
                        >
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-medium ${
                                isActive ? 'text-accent font-bold' : 'text-white'
                              }`}
                            >
                              {item.name}
                            </span>
                            {isActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                            )}
                          </div>
                          <p className="text-[11px] text-white/60 truncate">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        size={16}
                        className={`shrink-0 transition-transform ${
                          isActive
                            ? 'text-accent'
                            : 'text-white/40 group-hover:text-white group-hover:translate-x-0.5'
                        }`}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Bottom Dock / Quick Actions */}
            <div className="p-4 border-t border-white/10 bg-[#07150d] space-y-2.5 shrink-0 pb-safe">
              {/* PWA Install Button if available */}
              {isInstallable && !isInstalled && (
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    installApp();
                  }}
                  className="bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 font-bold text-xs px-4 py-2.5 rounded-2xl w-full flex items-center justify-center gap-2 border border-emerald-500/30 active:scale-[0.98] transition-transform cursor-pointer"
                >
                  <Download size={14} className="text-accent" />
                  <span>{t('pwa.install', 'Install Mobile App (PWA)')}</span>
                </button>
              )}

              {/* Primary Order Action Button */}
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  openOrderModal();
                }}
                className="w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-sm py-3.5 px-4 rounded-2xl shadow-[0_4px_20px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Sparkles size={16} className="text-accent" />
                <span>{t('hero.ctaOrder', 'Place an Order (WhatsApp)')}</span>
                <ArrowRight size={14} className="ml-1 opacity-80" />
              </button>

              {/* Dual Contact & Directions Hotline */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="tel:+94912250777"
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white/90 text-xs font-semibold py-2.5 px-3 rounded-xl border border-white/10 transition-colors active:scale-95"
                >
                  <Phone size={13} className="text-accent shrink-0" />
                  <span>091 225 0777</span>
                </a>
                <a
                  href="https://maps.app.goo.gl/HLJGzPCVZwySjSTK6?g_st=ic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white/90 text-xs font-semibold py-2.5 px-3 rounded-xl border border-white/10 transition-colors active:scale-95"
                >
                  <MapPin size={13} className="text-accent shrink-0" />
                  <span>{t('fab.directions', 'Directions')}</span>
                </a>
              </div>

              {/* Legal & Policy Micro-Links */}
              <div className="pt-2 flex items-center justify-center gap-3 text-[10px] text-white/50">
                <Link href="/terms" onClick={closeMenu} className="hover:text-accent transition-colors">
                  Terms
                </Link>
                <span>&bull;</span>
                <Link href="/privacy" onClick={closeMenu} className="hover:text-accent transition-colors">
                  Privacy
                </Link>
                <span>&bull;</span>
                <Link href="/refund-policy" onClick={closeMenu} className="hover:text-accent transition-colors">
                  Refunds
                </Link>
                <span>&bull;</span>
                <Link href="/accessibility" onClick={closeMenu} className="hover:text-accent transition-colors">
                  Accessibility
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

