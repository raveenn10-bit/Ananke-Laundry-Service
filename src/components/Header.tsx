'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X, Phone, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { name: 'Home', href: '/#home' },
  { name: 'About', href: '/#about' },
  { name: 'Services', href: '/#services' },
  { name: 'Pricing', href: '/#pricing' },
  { name: 'Gallery', href: '/#gallery' },
  { name: 'FAQ', href: '/#faq' },
  { name: 'Contact', href: '/#contact' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState('/#home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-primary/95 backdrop-blur-xl shadow-lg py-3' : 'bg-transparent py-5'
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
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-white hover:text-accent font-medium text-sm transition-colors relative group font-body"
                onClick={() => setActiveHash(link.href)}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left ${activeHash === link.href ? 'scale-x-100' : ''}`}></span>
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center">
            <Link
              href="/#contact"
              className="bg-olive hover:bg-accent text-white font-medium px-6 py-2.5 rounded-full transition-colors font-body"
            >
              Book a Pickup
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden relative z-50 p-2 text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close Menu' : 'Open Menu'}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 bg-primary z-40 flex flex-col justify-center px-6 pt-24 pb-8 lg:hidden overflow-y-auto"
          >
            <nav className="flex flex-col gap-6 items-center flex-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-white text-2xl font-heading font-medium"
                  onClick={closeMenu}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="flex flex-col gap-4 mt-8 w-full max-w-sm mx-auto">
              <Link
                href="/#contact"
                className="bg-accent text-primary text-center font-bold text-lg px-6 py-4 rounded-full w-full"
                onClick={closeMenu}
              >
                Book a Pickup
              </Link>
              <div className="flex gap-4">
                <a href="tel:+94742697909" className="flex-1 bg-white/10 flex items-center justify-center gap-2 text-white py-3 rounded-full border border-white/20">
                  <Phone size={18} /> Call Now
                </a>
                <a href="https://wa.me/94742697909" target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#25D366]/20 flex items-center justify-center gap-2 text-white py-3 rounded-full border border-[#25D366]/30">
                  <MessageCircle size={18} /> WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
