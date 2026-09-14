'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, MapPin, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Services', href: '/services' },
  { name: 'Commercial', href: '/commercial' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Facility', href: '/gallery' },
  { name: 'Contact', href: '/contact' },
  { name: 'View My Bill', href: '/my-bill' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

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
          <nav className="hidden lg:flex items-center gap-6 xl:gap-7">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              const isBill = link.href === '/my-bill';
              return (
                <Link
                  key={link.name}
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

          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:+94912250777"
              className="flex items-center gap-2 text-white/90 hover:text-accent text-sm font-medium px-2 py-2 transition-colors"
            >
              <Phone size={14} className="text-accent" />
              091 225 0777
            </a>
            <Link
              href="/contact"
              className="bg-accent hover:bg-olive text-dark hover:text-white font-semibold px-4.5 py-2.5 rounded-full transition-all duration-300 text-sm shadow-md hover:shadow-accent/20"
            >
              Request a Quote
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden relative z-50 p-2 text-white min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-md active:scale-95 transition-transform"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close Menu' : 'Open Menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
          >
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 bg-primary z-40 flex flex-col justify-between px-5 pt-24 pb-8 lg:hidden overflow-y-auto min-h-[100dvh] max-h-[100dvh]"
          >
            <nav className="flex flex-col gap-3.5 items-center my-auto py-2">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                const isBill = link.href === '/my-bill';
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-lg sm:text-xl font-heading font-medium transition-colors flex items-center gap-2 py-1 ${
                      isActive ? 'text-accent font-bold underline underline-offset-8 decoration-2' : 'text-white hover:text-accent'
                    } ${isBill ? 'text-accent font-semibold' : ''}`}
                    onClick={closeMenu}
                  >
                    {isBill && <Receipt size={17} className="text-accent" />}
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex flex-col gap-3 mt-6 w-full max-w-sm mx-auto shrink-0 pb-safe">
              <Link
                href="/my-bill"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-5 py-3.5 rounded-full w-full flex items-center justify-center gap-2 border border-white/20 shadow-md min-h-[44px]"
                onClick={closeMenu}
              >
                <Receipt size={16} className="text-accent" />
                <span>View My Bill &amp; Receipts</span>
              </Link>
              <Link
                href="/contact"
                className="bg-accent text-dark text-center font-bold text-sm sm:text-base px-5 py-3.5 rounded-full w-full shadow-lg min-h-[44px] flex items-center justify-center"
                onClick={closeMenu}
              >
                Request a Quote
              </Link>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <a
                  href="tel:+94912250777"
                  className="flex-1 bg-white/10 hover:bg-white/20 flex items-center justify-center gap-2 text-white py-3 px-3 rounded-full border border-white/20 text-xs sm:text-sm font-medium transition-colors min-h-[44px]"
                >
                  <Phone size={15} className="text-accent shrink-0" />
                  <span>Call 091 225 0777</span>
                </a>
                <a
                  href="https://maps.app.goo.gl/HLJGzPCVZwySjSTK6?g_st=ic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-olive/30 hover:bg-olive/40 flex items-center justify-center gap-2 text-white py-3 px-3 rounded-full border border-olive/50 text-xs sm:text-sm font-medium transition-colors min-h-[44px]"
                >
                  <MapPin size={15} className="text-accent shrink-0" />
                  <span>Directions</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

